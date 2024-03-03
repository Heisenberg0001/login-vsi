import { Injectable } from '@angular/core';

import { TaskDto, UserDto } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private _users: UserDto[] = [];
  private _tasks: TaskDto[] = [];

  get users(): UserDto[] {
    return this._users;
  }

  get tasks(): TaskDto[] {
    return this._tasks;
  }

  set users(usersValue: UserDto[]) {
    this._users = usersValue;
  }

  set tasks(tasksValue: TaskDto[]) {
    this._tasks = tasksValue;
  }
}
