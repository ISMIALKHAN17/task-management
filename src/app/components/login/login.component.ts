import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestService } from 'src/app/services/request.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: any;
  loading:any = false
  @Output() loginStatus: EventEmitter<boolean> = new EventEmitter<boolean>();


  constructor(private formBuilder: FormBuilder ,private req:RequestService) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }



  // ...

  onSubmit() {
    this.loading = true
    if (this.loginForm.invalid) {
      this.loading = false
      return;
    } else {
      this.req.post('login', this.loginForm.value).subscribe(
        (res: any) => {
          if(res.error == 'Invalid credentials'){
            this.loading = false
            Swal.fire({
              icon: 'error',
              title: 'Login Failed',
              text: 'Invalid credentials',
              showConfirmButton: true
            });
          }else{
          this.loading = false
          // Display success alert
          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: 'Welcome back!',
            showConfirmButton: false,
            timer: 2000
          });
          this.loginStatus.emit(true);
          localStorage.setItem('loginStatus', 'true');
          localStorage.setItem('user', JSON.stringify(res.user));
          console.log(res);
        }
      },
        (error: any) => {
          this.loading = false
          // Display error alert
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'An error occurred during login.',
            showConfirmButton: true
          });

          console.error(error);
        }
      );
    }
  }



}
