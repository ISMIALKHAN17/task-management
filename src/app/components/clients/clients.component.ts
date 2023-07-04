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
  if (this.clientForm.valid) {
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
  } else {
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
  

}
