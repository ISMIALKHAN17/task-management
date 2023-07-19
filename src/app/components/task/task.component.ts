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
  tasks:any = []
  user:any
  taskView:any = false
  memos:any = []
  memoForm:any
  chatLoading = true
  editTaskData:any
  checkEditTask:any = false
  searchTerm:any =''
  pagination:any = []
  paginationData:any
  dateForm:any
  showDropdown = false;
  tasksData:any = []
  uniqueTaskNames:any = []
  sortColumn: string = '';
  isAscending: boolean = true;
  isTaskEnabled: boolean = true;


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
      numberOfTask: ['', Validators.required],
      repeatTaskDate: ['', Validators.required],
      repeatTask: ['null', Validators.required],
      admin_id:[this.user.id, Validators.required],

    });

    this.memoForm = this.formBuilder.group({
      memo: ['', Validators.required],
      task_id: ['', Validators.required],
      admin_id:['', Validators.required],
      type:['', Validators.required],
    });
    this.dateForm = this.formBuilder.group({
      dateCompleted: [''],
      dateMailed: [''],
      dateFiled: ['']
    });
  }


  editeDates(task:any,modal:any){
    this.open(modal);
    if(task.dateCompleted === 'Not added' && task.dateMailed === 'Not added' && task.dateFiled === 'Not added'){
      return;
    }else{
      this.dateForm.patchValue({
        dateCompleted: task.dateCompleted,
        dateMailed: task.dateMailed,
        dateFiled: task.dateFiled
      })
    }
  }

  getClients(){
    this.loading = true
    this.req.post('client/check',true).subscribe((res:any)=>{
      this.clients = res.data
      this.loading = false
    })
  }
  getStaff(){
    this.loading = true
    this.req.post('user/check',true).subscribe((res:any)=>{
      this.staff = res.data
      this.loading = false
    })
  }
  getTasks(){
    this.loading = true
    this.req.post('task/list',{user_id:this.user.id}).subscribe((res:any)=>{
      this.tasks = res.data.data
      this.pagination = []
      for(let i = 1; i <= res.data.last_page ; i++){
      this.pagination.push(i)
      }
      this.paginationData = res.data
      this.loading = false
      this.sortTasks('dueDate');
      this.uniqueTaskNames = this.getUniqueTaskNames(this.tasks);
    })
  }
  onSubmit() {
    const repeatTask = this.taskForm.get('repeatTask').value;
    const repeatTaskDate = new Date(this.taskForm.get('repeatTaskDate').value);
    const today = new Date();
    const dueDate = new Date(this.taskForm.get('dueDate').value);

    const timeDifference = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    const numberOfTasks = this.calculateNumberOfTasks(repeatTask, today, repeatTaskDate);
    console.log('Difference in days:', diffDays);
    const taskDates = this.calculateTaskDates(repeatTask, today, numberOfTasks);

    for (let i = 1; i <= numberOfTasks; i++) {
      const adjustedDate = new Date(taskDates[i-1]);
      adjustedDate.setDate(adjustedDate.getDate() + diffDays);
      console.log(adjustedDate)
      const formattedDate = this.datePipe.transform(adjustedDate, 'yyyy-MM-dd');

      this.tasksData.push({
        number: i,
        dueDate: formattedDate
      });
    }
    this.taskForm.patchValue({
      numberOfTask : this.tasksData,
      admin_id:this.user.id
    })
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
          this.taskForm.reset()
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
    }
    else if (this.checkEditTask && this.taskViewData.repeatTaskDate === this.taskForm.repeatTaskDate && this.taskViewData.repeatTask === this.taskForm.repeatTask){
      this.taskForm.patchValue({
        repeatTaskDate: 'null',
      repeatTask: 'null',
      numberOfTask:[1]
      })

      if(this.taskForm.valid){
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
          delete this.editTaskData.repeatTaskDate;
          delete this.editTaskData.repeatTask;
          delete this.editTaskData.numberOfTask;
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
    }
    else if(this.taskViewData.repeatTaskDate !== this.taskForm.repeatTaskDate || this.taskViewData.repeatTask !== this.taskForm.repeatTask){
      if(this.taskForm.valid){
        Swal.fire({
          title: 'Are you sure?',
          text: 'You are about to update the task. This action cannot be undone.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, update it!',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            const tasks = this.taskForm.value.numberOfTask

            const uniqueTasks:any = [];
            const uniqueDueDates:any = {};

            tasks.forEach((task:any) => {
              const dueDate = task.dueDate;
              if (!uniqueDueDates[dueDate]) {
                uniqueDueDates[dueDate] = true;
                uniqueTasks.push(task);
              }
            });
            this.taskForm.patchValue({
              numberOfTask : uniqueTasks
            })
            this.loading = true
            this.editTaskData = { ...this.taskForm.value };
            this.editTaskData.type = this.taskViewData.type;
            this.editTaskData.id = this.taskViewData.id;

            this.req.post('task/edit', this.editTaskData).subscribe(
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
    }
    else {
      this.taskForm.markAllAsTouched();
      this.loading = false;
    }
  }

  viewTask(task:any) {
    this.taskViewData = task;
    this.chatLoading = true
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
      this.loading = true
      this.req.post('task/update', { id: this.taskViewData.id, status: 'Completed' }).subscribe(
        (res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Task has been updated.',
          });
          this.loading = false
          this.getClients();
          this.getStaff();
          this.getTasks();
          this.taskView = false
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
editTask(modal:any,task:any){
  this.checkEditTask = true
  this.taskViewData = task
  this.taskForm.patchValue({
    name:task.name,
    description: task.description,
    dueDate: task.dueDate,
    client_id: task.client_id,
    user_id: task.user_id,
    memo:task.memo,
    status:task.status,
    repeatTask: task.repeatTask,
    repeatTaskDate: task.repeatTaskDate,
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

searchTasks(){
  this.loading = true
  this.req.post('task/search',{search:this.searchTerm}).subscribe((res:any)=>{
    this.tasks = res.data
    console.log(this.tasks)
      for(let i = 1; i <= res.last_page ; i++){
      this.pagination.push(i)
      }
      this.paginationData = res.data
      this.loading = false
      
  })
}

disableTask(task: any, status: any) {
  var today = new Date();
  var dueDate = new Date(task.dueDate);
  let taskStatus = status;
  let previousStatus = task.status;
  let previousCheckboxState = task.status !== 'Disabled';

  if (taskStatus === 'Disabled' && dueDate < today) {
    taskStatus = 'Incomplete';
  } else if (taskStatus === 'Disabled' && dueDate > today) {
    taskStatus = 'Due';
  } else {
    taskStatus = 'Disabled';
  }

  // Function to handle the task status update
  const updateTaskStatus = () => {
    this.loading = true;
      this.req.post('task/update', { id: task.id, status: taskStatus }).subscribe(
        (res: any) => {
          this.loading = false;
          this.getClients();
          this.getStaff();
          this.getTasks();
        },
        (error: any) => {
          this.loading = false;
          console.error('Error updating task:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update task. Please try again later.'
          });
        }
      );

  };

  Swal.fire({
    icon: 'warning',
    title: 'Confirmation',
    text: 'Are you sure you want to update the task status?',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  }).then((result) => {
    if (result.isConfirmed) {
      updateTaskStatus();
    } else {
      // Revert back to the previous task status and checkbox state
      this.getTasks()
    }
  });
}









hideDropdown() {
  setTimeout(() => {
    this.showDropdown = false;
  }, 200);
}

selectExistingTask(taskName: string, event: Event) {
  event.stopPropagation(); // Prevents the focusout event from triggering
  this.taskForm.get('name').setValue(taskName);
  this.hideDropdown();
}


onDateFormSubmit() {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to update the task?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
  }).then((result) => {
    if (result.isConfirmed) {
      this.loading = true;
      const formValue = this.dateForm.value;
const requestData:any = {};
for (const [key, value] of Object.entries(formValue)) {
  if (value !== null && value !== '') {
    requestData[key] = value;
  }
}
this.req.post('task/update', { id: this.taskViewData.id, ...requestData }).subscribe(
  (res: any) => {
    this.loading = false;
    this.getClients();
    this.getStaff();
    this.getTasks();
    this.modalService.dismissAll();
    this.taskView = false;
    this.dateForm.reset();
  },
  (error: any) => {
    this.loading = false;
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
calculateNumberOfTasks(repeatTask: string, startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
  const diffDays = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay));
  let diffYears = 0; // Corrected variable declaration

  switch (repeatTask) {
    case 'Daily':
      return diffDays + 1; // Include the start date
    case 'Weekly':
      return Math.floor(diffDays / 7) + 1; // Include the start date
    case 'Biweekly':
      return Math.floor(diffDays / 14) + 1; // Include the start date
    case 'Monthly':
      return startDate.getMonth() !== endDate.getMonth() ? 2 : 1; // Include the start date and end date if they are in different months
    case 'Quarterly':
      const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      return Math.floor(diffMonths / 3) + 1; // Include the start date
    case 'Half Yearly':
      diffYears = endDate.getFullYear() - startDate.getFullYear(); // Corrected variable assignment
      return Math.floor(diffYears / 2) + 1; // Include the start date
    case 'Yearly':
      diffYears = endDate.getFullYear() - startDate.getFullYear(); // Corrected variable assignment
      return diffYears + 1; // Include the start date
    default:
      return 1; // Default to creating a single task
  }


}

calculateTaskDates(repeatTask: string, startDate: Date, numberOfTasks: number): Date[] {
  const taskDates: Date[] = [startDate];
  const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

  switch (repeatTask) {
    case 'Daily':
      for (let i = 1; i < numberOfTasks; i++) {
        const nextDate = new Date(startDate.getTime() + i * oneDay);
        taskDates.push(nextDate);
      }
      break;
    case 'Weekly':
      for (let i = 1; i < numberOfTasks; i++) {
        const nextDate = new Date(startDate.getTime() + i * 7 * oneDay);
        taskDates.push(nextDate);
      }
      break;
    case 'Biweekly':
      for (let i = 1; i < numberOfTasks; i++) {
        const nextDate = new Date(startDate.getTime() + i * 14 * oneDay);
        taskDates.push(nextDate);
      }
      break;
    case 'Monthly':
      const startMonth = startDate.getMonth();
      for (let i = 1; i < numberOfTasks; i++) {
        const nextMonth = startMonth + i;
        const nextYear = startDate.getFullYear() + Math.floor(nextMonth / 12);
        const nextDate = new Date(nextYear, nextMonth % 12, startDate.getDate());
        taskDates.push(nextDate);
      }
      break;
    case 'Quarterly':
      const startQuarter = Math.floor(startDate.getMonth() / 3);
      for (let i = 1; i < numberOfTasks; i++) {
        const nextQuarter = startQuarter + i;
        const nextYear = startDate.getFullYear() + Math.floor(nextQuarter / 4);
        const nextMonth = (nextQuarter * 3) % 12;
        const nextDate = new Date(nextYear, nextMonth, startDate.getDate());
        taskDates.push(nextDate);
      }
      break;
    case 'Half Yearly':
      const startHalfYear = Math.floor(startDate.getMonth() / 6);
      for (let i = 1; i < numberOfTasks; i++) {
        const nextHalfYear = startHalfYear + i;
        const nextYear = startDate.getFullYear() + Math.floor(nextHalfYear / 2);
        const nextMonth = (nextHalfYear * 6) % 12;
        const nextDate = new Date(nextYear, nextMonth, startDate.getDate());
        taskDates.push(nextDate);
      }
      break;
    case 'Yearly':
      const startYear = startDate.getFullYear();
      for (let i = 1; i < numberOfTasks; i++) {
        const nextYear = startYear + i;
        const nextDate = new Date(nextYear, startDate.getMonth(), startDate.getDate());
        taskDates.push(nextDate);
      }
      break;
    default:
      break;
  }

  return taskDates;
}

getUniqueTaskNames(tasks: any[]): string[] {
  const uniqueNames: string[] = [];
  const nameSet = new Set<string>();

  for (const task of tasks) {
    if (!nameSet.has(task.name)) {
      nameSet.add(task.name);
      uniqueNames.push(task.name);
    }
  }

  return uniqueNames;
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
