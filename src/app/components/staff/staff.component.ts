import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RequestService } from 'src/app/services/request.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent {
  staffForm:any
  staff:any
  loading:any 

  constructor(private modalService: NgbModal , private formBuilder: FormBuilder , private req:RequestService) {
    // Constructor logic here
  }

  open(modal:any){
    this.modalService.open(modal,{centered:true})
  }
 



  ngOnInit() {
    this.getStaff()
    this.staffForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      userName: ['', Validators.required],
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required, this.passwordMatchValidator.bind(this.staffForm)]),
      role: new FormControl('select', [Validators.required])
    });
  }

  passwordMatchValidator(formGroup: FormGroup): { [s: string]: boolean } | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    if (password && confirmPassword !== password) {
      return { 'passwordMismatch': true };
    }
    return null;
  }
  

  onSubmit() {
    if (this.staffForm.valid) {
      const formValue = { ...this.staffForm.value };
      delete formValue.confirmPassword;
      console.log(formValue);
      this.req.post('user/add', formValue).subscribe(
        (res: any) => {
          console.log('Added');
          Swal.fire({
            title: 'Success',
            text: 'Staff added successfully.',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          this.modalService.dismissAll();
          this.getStaff();
        },
        (error: any) => {
          console.log('error', error);
          Swal.fire({
            title: 'Error',
            text: 'An error occurred while adding the staff.',
            icon: 'error',
            showConfirmButton: true
          });
        }
      );
    } else {
      this.staffForm.markAllAsTouched();
    }
  }
  

  getStaff(){
    this.loading = true
    this.req.post('user/list',true).subscribe((res:any)=>{
      this.staff = res.data
      this.loading = false
    })
  }
  

  deleteStaff(id: any) {
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
        this.req.get(`user/delete/${id}`).subscribe((res: any) => {
          this.loading = false;
          this.getStaff();
        });
      }
    });
  }
  
}
