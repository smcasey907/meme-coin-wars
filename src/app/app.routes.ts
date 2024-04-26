import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DayComponent } from './day/day.component';

export const routes: Routes = [
    {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
            { path: 'day', component: DayComponent },
            { path: '', redirectTo: 'day', pathMatch: 'full' }
        ]
    },
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    }
];
