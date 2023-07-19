import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { RequestService } from 'src/app/services/request.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers:[DatePipe]
})
export class DashboardComponent {
  loading = false
  chart: any;
  data:any
  tasks:any
  pagination:any
  paginationData:any
  user:any
  sortColumn: string = '';
  isAscending: boolean = true;
  isTaskEnabled: boolean = true;
  constructor(private req:RequestService,private datePipe:DatePipe){}

  ngOnInit(): void {

    const user = localStorage.getItem('user')
    this.user = JSON.parse(user!)
    this.getTasks()

  }
  getTasks(){
    this.loading = true
    this.req.post('task/incomplete',true).subscribe((res:any)=>{
      this.tasks = res.data.data
      this.pagination = []
      for(let i = 1; i <= res.data.last_page ; i++){
      this.pagination.push(i)
      }
      this.paginationData = res.data
      this.loading = false
    })
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

formatDate(date: string): string {
  const formattedDate = this.datePipe.transform(date, 'MM/dd/yyyy');
  return formattedDate || '';
}
}
