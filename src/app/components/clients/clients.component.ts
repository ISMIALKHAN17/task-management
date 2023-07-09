import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RequestService } from 'src/app/services/request.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent {
  clientForm:any
  clients:any
  loading:any = false
  editClient:any
  c_id:any

  constructor(private modalService: NgbModal , private req:RequestService) {
    // Constructor logic here
  }

  open(modal:any){
    this.modalService.open(modal,{centered:true})
  }




  ngOnInit() {
    this.getClients()
    this.clientForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }




onSubmit() {
  if (this.clientForm.valid && !this.editClient) {
    console.log(this.clientForm.value);
    this.req.post('client/add', this.clientForm.value).subscribe((res: any) => {
      console.log(res);
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
      this.clients = res.data
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

}
