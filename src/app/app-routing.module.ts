import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StaffComponent } from './components/staff/staff.component';
import { ClientsComponent } from './components/clients/clients.component';
import { TaskComponent } from './components/task/task.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'task', component: TaskComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'clients', component: ClientsComponent, canActivate: [AdminGuard] },
  { path: 'staff', component: StaffComponent, canActivate: [AdminGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
