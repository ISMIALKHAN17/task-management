import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = localStorage.getItem('user'); // Retrieve the user's role from local storage
    const userRole = JSON.parse(user!).role
    // Check if the user's role is admin
    if (userRole === 'admin') {
      return true; // Allow access to the route
    } else {
      this.router.navigate(['/task']); // Redirect to the 'task' route for non-admin users
      return false; // Deny access to the route
    }
  }
}
