import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RequestService } from 'src/app/services/request.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
  providers:[DatePipe]
})
export class ClientsComponent {
  clientForm:any
  clients:any
  loading:any = false
  editClient:any
  c_id:any
  pagination:any = []
  paginationData:any
  searchTerm:any = []
  tasks: any[] = [];
  isAscending: boolean = true; // Flag to track the sort order
sortColumn: string = ''; // Track the currently sorted column

  constructor(private modalService: NgbModal , private req:RequestService,private datePipe:DatePipe) {
    // Constructor logic here
  }

  open(modal:any){
    this.modalService.open(modal,{centered:true})
  }

  formatDate(date: string): string {
    const formattedDate = this.datePipe.transform(date, 'MM/dd/yyyy');
    return formattedDate || '';
  }


  ngOnInit() {
    this.getClients()
    this.clientForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      contactName: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }




onSubmit() {
  if (this.clientForm.valid && !this.editClient) {
    this.loading = true
    console.log(this.clientForm.value);
    this.req.post('client/add', this.clientForm.value).subscribe((res: any) => {
      this.loading = false
      Swal.fire({
        title: 'Success',
        text: 'Client added successfully.',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      this.modalService.dismissAll();
      this.getClients();
    },
    (error: any) => {
      console.log(error);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while adding the client.',
        icon: 'error',
        showConfirmButton: true
      });
    });
  }

else if (this.clientForm.valid && this.editClient) {
  Swal.fire({
    title: 'Confirmation',
    text: 'Are you sure you want to update the client?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  }).then((result) => {
    if (result.isConfirmed) {
      this.loading = true;
      const clientUpdate = {
        ...this.clientForm.value,
        id: this.c_id
      };
      this.req.post('client/update', clientUpdate).subscribe(
        (res: any) => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Client has been updated.'
          });
          this.getClients();
          this.modalService.dismissAll();
          this.clientForm.reset();
        },
        (error: any) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update client. Please try again later.'
          });
        }
      );

    }
  });
}
  else
  {
    this.clientForm.markAllAsTouched();
  }
}

  getClients(){
    this.loading= true
    this.req.post('client/list',true).subscribe((res:any)=>{
      this.clients = res.data.data
      for(let i = 1; i <= res.last_page ; i++){
            this.pagination.push(i)
            }
            this.paginationData = res.data
            this.loading = false
      this.loading= false
    })
  }



  deleteStaff(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete Client. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.req.get(`client/delete/${id}`).subscribe((res: any) => {
          this.loading = false;
          this.getClients();
        });
      }
    });
  }



  viewClient(modal:any,data:any){
    this.editClient = true
    this.c_id = data.id
    this.clientForm.patchValue({
      name: data.name,
      description: data.description,
      address: data.address,
      phoneNumber: data.phoneNumber,
      email: data.email
    })
    this.modalService.open(modal,{centered:true})
  }


  disableClient(client: any) {
    this.loading = true;
    const status = client.status === 'active' ? 'Disabled' : 'active';
    this.req.post('client/update', { id: client.id, status: status }).subscribe(
      (res: any) => {
        this.loading = false;
        // Show success message
        this.getClients();
      },
      (error: any) => {
        this.loading = false;
        this.getClients();
        // Show error message
        Swal.fire('Error', 'Failed to update user status. Please try again.', 'error');
      }
    );
  }


sortClients(column: string) {
  if (this.sortColumn === column) {
    this.isAscending = !this.isAscending; // Toggle the sort order if it's the same column
  } else {
    this.sortColumn = column;
    this.isAscending = true; // Reset the sort order if it's a different column
  }

  // Perform the sorting using the Array sort method
  this.clients = this.clients.sort((a: any, b: any) => {
    if (a[column] > b[column]) {
      return this.isAscending ? 1 : -1;
    } else if (a[column] < b[column]) {
      return this.isAscending ? -1 : 1;
    } else {
      return 0;
    }
  });
}
  searchTasks(){
    this.loading = true
    this.req.post('client/search',{search:this.searchTerm}).subscribe((res:any)=>{
      this.clients = res.data
        for(let i = 1; i <= res.last_page ; i++){
        this.pagination.push(i)
        }
        this.paginationData = res.data
        this.loading = false

    })
  }

  taskPaginantion(page:any){
    this.loading = true
    this.req.post(`client/list?page=${page}`,true).subscribe((res:any)=>{
      this.clients = res.data.data
      this.pagination = []
      for(let i = 1; i <= res.data.last_page ; i++){
      this.pagination.push(i)
      }
      this.paginationData = res.data
      this.loading = false
    })
  }


  fetchClientTasks(modal:any , id:any){
    this.loading = true
    this.open(modal)
    this.req.post('task/find',{id:id}).subscribe((res:any)=>{
      this.loading = false
      this.tasks = res.data
      console.log(this.tasks.length)
    })
  }

}
