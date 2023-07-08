import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RequestService } from 'src/app/services/request.service';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  providers:[DatePipe]
})
export class TaskComponent {
  loading:any = false
  clients:any
  staff:any 
  taskForm:any
  taskViewData:any
  tasks:any
  user:any
  taskView:any = false
  memos:any
  memoForm:any

  constructor(private req:RequestService , private formBuilder: FormBuilder , private modalService: NgbModal , private datePipe:DatePipe){}
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    const user = localStorage.getItem('user')
    this.user = JSON.parse(user!)
    this.getClients()
    this.getStaff()
    this.getTasks()

    this.taskForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      client_id: ['', Validators.required],
      user_id: ['', Validators.required],
      repeatTask: ['select', Validators.required],
      memo: ['', Validators.required],
      status: ['Pending', Validators.required],
      admin_id:[this.user.id, Validators.required],
    });

    this.memoForm = this.formBuilder.group({
      memo: ['', Validators.required],
      task_id: ['', Validators.required],
      admin_id:[this.user.id, Validators.required],
      type:['', Validators.required],
    });
    
  }

  getClients(){
    this.loading = true 
    this.req.post('client/list',true).subscribe((res:any)=>{
      this.clients = res.data
      this.loading = false 
    })
  }
  getStaff(){
    this.loading = true 
    this.req.post('user/list',true).subscribe((res:any)=>{
      this.staff = res.data
      this.loading = false 
    })
  }
  getTasks(){
    this.loading = true 
    this.req.post('task/list',{user_id:this.user.id}).subscribe((res:any)=>{
      this.tasks = res.data
      this.loading = false 
      console.log(this.tasks)
    })
  }
  onSubmit() {
    this.loading = true;
    if (this.taskForm.valid) {
      // Submit the form data
      this.req.post('task/add', this.taskForm.value).subscribe(
        (res: any) => {
          console.log('Added');
          Swal.fire({
            title: 'Success',
            text: 'Task added successfully.',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          this.modalService.dismissAll();
          this.getClients();
          this.getStaff();
          this.getTasks();
          this.loading = false;
        },
        (error: any) => {
          console.log('error', error);
          Swal.fire({
            title: 'Error',
            text: 'An error occurred while adding the task.',
            icon: 'error',
            showConfirmButton: true
          });
          this.loading = false;
        }
      );
    } else {
      this.taskForm.markAllAsTouched();
      this.loading = false;
    }
  }
  
  viewTask(task:any) {
    this.taskViewData = task; 
    this.getMemos();
    // Set taskView to the selected task
  }

 
  
  open(modal:any){
    this.modalService.open(modal,{centered:true})
  }
  formatDate(date: string): string {
    const formattedDate = this.datePipe.transform(date, 'MM/dd/yyyy');
    return formattedDate || '';
  }
  deleteTask(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this staff member. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.req.get(`task/delete/${id}`).subscribe((res: any) => {
          this.loading = false;
          this.getClients();
          this.getStaff();
          this.getTasks();
        });
      }
    });
  }

  formatDateWithTime(dateString: string): string {
    const date = new Date(dateString);
    const options:any = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  }

  getMemos(){
    this.req.post('chat/list',{task_id:this.taskViewData.id}).subscribe((res:any)=>{
      this.memos = res
     return this.memos.sort((a:any, b:any) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return timeA - timeB;})
    })
  }

  
  sendMemo() {
    this.memoForm.patchValue({
      task_id: this.taskViewData.id,
      type:this.user.role == 'admin' ? 'admin' :'staff'
    });
    if (this.memoForm.valid) {
      this.req.post('chat', this.memoForm.value).subscribe(
        (res: any) => {
          this.memoForm.reset();
          this.getMemos();
        },
        (error: any) => {
          console.error('Error sending memo:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to send memo. Please try again later.',
          });
        }
      );
    } else {
      this.memoForm.markAllAsTouched();
    }
  }
  
}
