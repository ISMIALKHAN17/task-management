import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto'
import { RequestService } from 'src/app/services/request.service';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  providers:[DatePipe]
})
export class ReportsComponent {
  loading:any = false
  tasks:any
  pagination:any = []
  paginationData:any
  chartData:any
  user:any
  isAscending: boolean = true; // Flag to track the sort order
sortColumn: string = ''; // Track the currently sorted column
  @ViewChild('chartCanvasRef', { static: false }) chartCanvasRef!: ElementRef;
  chart: any;
  constructor(private req:RequestService , private datePipe:DatePipe){}

  ngOnInit(): void {
    const user = localStorage.getItem('user')
    this.user = JSON.parse(user!)
    this.loading = true
    this.req.post('task/report',true).subscribe((res:any)=>{
      this.tasks = res.data
      this.pagination = []
       for(let i = 1; i <= res.last_page ; i++){
      this.pagination.push(i)
      }
      this.paginationData = res
      this.loading = false
      setTimeout(() => {
        this.initializeChart();
      }, 100);
    })

    this.req.post('task/count',true).subscribe((res:any)=>{
      this.chartData = res
    })
  }



  initializeChart(): void {
    const data = [this.chartData.Completed, this.chartData.Due,this.chartData.Incomplete,this.chartData.Disabled]; // Replace with your actual data
    const canvas = this.chartCanvasRef.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Canvas context not available');
      return;
    }

    this.chart = new Chart(context, {
      type: 'pie',
      data: {
        labels: ['Completed ', 'Due' ,'Incomplete','Disabled'], // Replace with your actual labels
        datasets: [{
          data: data,
          backgroundColor: ['#28a745', '#ffc107','#dc3545','#6c757d'] // Replace with your actual colors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false,
          }
        }
      }
    });

  }

  filterType: string = 'date';
  startDate: string = '';
  endDate: string = '';
  searchColumn: string = '';

  filteredTasks: Task[] = [];


  containsSearchText(task: Task): boolean {
    return (
      task.name.toLowerCase().includes(this.searchColumn.toLowerCase()) ||
      task.clientName.toLowerCase().includes(this.searchColumn.toLowerCase())
    );
  }

  dateFilter() {
    this.loading = true
    if(this.filterType == 'date'){
      // Make sure to replace 'start-date here' and 'end date here' with the actual values from the inputs
      this.req.post('task/report', { startDate: this.startDate, endDate: this.endDate }).subscribe((res: any) => {
        this.loading = false
        this.tasks = res.data
        this.pagination = []
          for(let i = 1; i <= res.last_page ; i++){
          this.pagination.push(i)
          }
          this.paginationData = res
          this.loading = false
      });
    }else{
      this.loading = true
      this.req.post('task/search',{search:this.searchColumn}).subscribe((res:any)=>{
        this.loading = false
        this.tasks = res.data
        this.pagination = []
          for(let i = 1; i <= res.last_page ; i++){
          this.pagination.push(i)
          }
          this.paginationData = res
          this.loading = false
      })
    }
  }

  taskPaginantion(page:any){
    this.loading = true
    this.req.post(`task/list?page=${page}`,{user_id:this.user.id}).subscribe((res:any)=>{
      this.tasks = res.data.data
      this.pagination = []
      for(let i = 1; i <= res.data.last_page ; i++){
      this.pagination.push(i)
      }
      this.paginationData = res.data
      this.loading = false
      console.log(this.tasks)
    })
  }

  formatDate(date: string): string {
    const formattedDate = this.datePipe.transform(date, 'MM/dd/yyyy');
    return formattedDate || '';
  }

  sortTasks(column: string) {
    if (this.sortColumn === column) {
      this.isAscending = !this.isAscending; // Toggle the sort order if it's the same column
    } else {
      this.sortColumn = column;
      this.isAscending = true; // Reset the sort order if it's a different column
    }

    // Perform the sorting using the Array sort method
    this.tasks = this.tasks.sort((a: any, b: any) => {
      if (a[column] > b[column]) {
        return this.isAscending ? 1 : -1;
      } else if (a[column] < b[column]) {
        return this.isAscending ? -1 : 1;
      } else {
        return 0;
      }
    });
  }

}

interface Task {
  id: number;
  name: string;
  clientName: string;
  dueDate: string;
  status: string;
}
