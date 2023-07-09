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
  chatLoading = false
  editTaskData:any
  checkEditTask:any = false
  filteredTasks:any
  searchTerm:any =''
  pagination:any = []
  paginationData:any

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
      repeatTask: ['null', Validators.required],
      status: ['Open', Validators.required],
      admin_id:[this.user.id, Validators.required],
    });

    this.memoForm = this.formBuilder.group({
      memo: ['', Validators.required],
      task_id: ['', Validators.required],
      admin_id:['', Validators.required],
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
      this.tasks = res.data.data
      for(let i = 1; i <= res.data.last_page ; i++){
      this.pagination.push(i)
      }
      this.paginationData = res.data
      this.loading = false
      this.filterTasks()
      console.log(this.tasks)
    })
  }
  onSubmit() {
    if (this.taskForm.valid && !this.checkEditTask) {
      // Submit the form data
      this.loading = true
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
          this.taskForm.reset()
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
    }
    else if (this.taskForm.valid && this.checkEditTask){

      Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to update the task. This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.loading = true
          this.editTaskData = { ...this.taskForm.value };
          delete this.editTaskData.admin_id;
          this.editTaskData.id = this.taskViewData.id;
          this.req.post('task/update', this.editTaskData).subscribe(
            (res: any) => {
              this.taskViewData = res.data

              this.loading = false
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Task has been updated.',
              });
              this.modalService.dismissAll()
              this.getClients();
              this.getStaff();
              this.getTasks();
              this.taskForm.reset()
            },
            (error: any) => {
              this.loading = false
              console.error('Error updating task:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update task. Please try again later.',
              });
            }
          );
        }
      });
    }
    else {
      this.taskForm.markAllAsTouched();
      this.loading = false;
    }
  }

  viewTask(task:any) {
    this.taskViewData = task;
    this.getMemos()
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
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Task has been Deleted.',
          });
          this.taskView = false
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





updateTask() {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You are about to update the task. This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, update it!',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      this.req.post('task/update', { id: this.taskViewData.id, status: 'Completed' }).subscribe(
        (res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Task has been updated.',
          });
          this.getClients();
          this.getStaff();
          this.getTasks();
        },
        (error: any) => {
          console.error('Error updating task:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update task. Please try again later.',
          });
        }
      );
    }
  });
}
editTask(modal:any,task:any){
  this.checkEditTask = true
  this.taskForm.patchValue({
    name:task.name,
    description: task.description,
    dueDate: task.dueDate,
    client_id: task.client_id,
    user_id: task.user_id,
    memo:task.memo,
    status:task.status,
    repeatTask: task.repeatTask,
    admin_id:this.user.id
  })

  this.modalService.open(modal ,{centered:true})
}


getMemos(){
  this.chatLoading = true
  this.req.post('chat/list',{task_id:this.taskViewData.id}).subscribe((res:any)=>{
    this.memos = res
    this.chatLoading = false
})
}
filterTasks() {
  this.filteredTasks = this.tasks.filter((task:any) => {
    // Convert all task property values to lowercase for case-insensitive search
    const lowerCaseTerm = this.searchTerm.toLowerCase();

    return (
      task.name.toLowerCase().includes(lowerCaseTerm) ||
      task.dueDate.toLowerCase().includes(lowerCaseTerm) ||
      task.client.name.toLowerCase().includes(lowerCaseTerm) ||
      task.user.name.toLowerCase().includes(lowerCaseTerm) ||
      task.description.toLowerCase().includes(lowerCaseTerm)
    );
  });
}

addMemo() {
  this.chatLoading = true
  this.memoForm.patchValue({
    task_id:this.taskViewData.id,
    type:this.user.role,
    admin_id:this.user.id
  })
  if (this.memoForm.invalid) {
    return;
  }else{
    this.req.post('chat',this.memoForm.value).subscribe((res:any)=>{
      this.chatLoading = false
      this.getMemos();
    })
  }

  // Perform the action to add the memo
  const memo = this.memoForm.value.memo;
  // ...
  console.log('Memo:', memo);

  // Reset the form
  this.memoForm.reset();
}

deleteMemo(id: any) {

  Swal.fire({
    title: 'Are you sure?',
    text: 'You are about to delete this memo.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.chatLoading = true
      this.req.get(`chat/delete/${id}`).subscribe(
        (res: any) => {
          this.getMemos();

        },
        (error: any) => {
          this.chatLoading = false
          console.error('Error deleting memo:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete the memo. Please try again later.'
          });
        }
      );
    }
  });
}


taskPaginantion(page:any){
  this.loading = true
  this.req.post(`task/list?page=${page}`,true).subscribe((res:any)=>{
    this.tasks = res.data.data
    for(let i = 1; i <= res.data.last_page ; i++){
    this.pagination.push(i)
    }
    this.paginationData = res.data
    this.loading = false
    this.filterTasks()
    console.log(this.tasks)
  })
}

}
