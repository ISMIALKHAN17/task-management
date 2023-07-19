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
   
    })

    this.req.post('task/count',true).subscribe((res:any)=>{
      this.chartData = res
    })
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
    this.req.post(`task/report?page=${page}`,{user_id:this.user.id}).subscribe((res:any)=>{
      this.tasks = res.data
      this.pagination = []
      for(let i = 1; i <= res.last_page ; i++){
      this.pagination.push(i)
      }
      this.paginationData = res
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
    this.isAscending = true; // Set the initial sort order to ascending for a different column
  }

  // Perform the sorting
  if (column === 'status') {
    this.tasks = this.sortTasksByStatusAndDueDate(this.tasks);
  } else {
    this.tasks = this.tasks.sort((a:any, b:any) => {
      const valA = this.getPropertyValue(a, column);
      const valB = this.getPropertyValue(b, column);

      if (valA > valB) {
        return this.isAscending ? 1 : -1;
      } else if (valA < valB) {
        return this.isAscending ? -1 : 1;
      } else {
        return 0;
      }
    });
  }
}


// Helper function to get the property value of an object dynamically
getPropertyValue(obj: any, path: string) {
  const properties = path.split('.');
  let value = obj;

  for (const prop of properties) {
    value = value[prop];

    if (typeof value === 'undefined') {
      break;
    }
  }

  return value;
}

// Function to sort tasks by status and due date
sortTasksByStatusAndDueDate(tasks: any[]): any[] {
  return tasks.sort((a, b) => {
    // Sort by status (incomplete tasks first)
    if (a.status !== 'Completed' && b.status === 'Completed') {
      return -1;
    }
    if (a.status === 'Completed' && b.status !== 'Completed') {
      return 1;
    }
    if (a.status === 'Disabled' && b.status !== 'Disabled') {
      return 1;
    }
    if (a.status !== 'Disabled' && b.status === 'Disabled') {
      return -1;
    }

    // Sort by due date
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA.getTime() - dateB.getTime();
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
