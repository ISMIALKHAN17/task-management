import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoggedIn = false;

  onLoginStatus(status: boolean) {
    this.isLoggedIn = status;
  }


  ngOnInit() {
    const encryptedStatus = localStorage.getItem('loginStatus');
    if (encryptedStatus == 'true') {
        this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false    ;
    }
  }
}
