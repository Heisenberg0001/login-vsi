import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./modules/users/users-list/users-list.component').then(
        (c) => c.UsersListComponent,
      ),
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./modules/tasks/tasks-list/tasks-list.component').then(
        (c) => c.TasksListComponent,
      ),
  },
];
