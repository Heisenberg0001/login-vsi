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
    path: 'users/add',
    loadComponent: () =>
      import(
        './modules/users/action-components/add-user/add-user.component'
      ).then((c) => c.AddUserComponent),
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./modules/tasks/tasks-list/tasks-list.component').then(
        (c) => c.TasksListComponent,
      ),
  },
  {
    path: 'tasks/add',
    loadComponent: () =>
      import(
        './modules/tasks/action-components/add-task/add-task.component'
      ).then((c) => c.AddTaskComponent),
  },
];
