import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  isSidebarClosed = false;
  isDarkMode = false;
  darkModeText: string = 'Dark mode';
  user:any

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
   const user = localStorage.getItem('user')
 this.user = JSON.parse(user!)
  }
  @Output() loginStatus: EventEmitter<boolean> = new EventEmitter<boolean>();
  toggleSidebar() {
    this.isSidebarClosed = !this.isSidebarClosed;
  }
  openSidebar() {
    this.isSidebarClosed = false;
  }


  logout(){
    this.loginStatus.emit(false);
    localStorage.setItem('loginStatus', 'false');
    window.location.reload()
  }
}
