import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StaffComponent } from './components/staff/staff.component';
import { ClientsComponent } from './components/clients/clients.component';
import { TaskComponent } from './components/task/task.component';
import { ReportsComponent } from './components/reports/reports.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, // Redirect empty path to the dashboard
  { path: 'dashboard', component: DashboardComponent },
  { path: 'staff', component: StaffComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'task', component: TaskComponent },
  { path: 'reports', component: ReportsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
