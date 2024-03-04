import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { TaskState, TaskDto, UserDto } from '@core/models';
import { DropdownDto } from '@shared/models';
import { isNullOrUndefined } from '@shared/utils';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private _users: UserDto[] = [];
  private _tasks: TaskDto[] = [];

  constructor(private _translateService: TranslateService) {}

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

  getUnassignedTasks(userTaskId: string = ''): DropdownDto<string | null>[] {
    let tempTasksArr: DropdownDto<string | null>[] = [];

    if (this._tasks.length) {
      tempTasksArr = [
        {
          key: null,
          value: 'Is not selected',
        },
        ...this._tasks
          .filter(
            (task) =>
              (task.state === TaskState.Queue &&
                isNullOrUndefined(task.userId)) ||
              (isNullOrUndefined(userTaskId) ? '' : task.id === userTaskId),
          )
          .map((task) => ({
            key: task.id,
            value: task.name,
          })),
      ];
    }

    return tempTasksArr;
  }

  getUnassignedUsers(userId: string = ''): DropdownDto<string | null>[] {
    let tempUsersArr: DropdownDto<string | null>[] = [];

    if (this._tasks.length) {
      tempUsersArr = [
        {
          key: null,
          value: 'Is not selected',
        },
        ...this._users
          .filter(
            (user) =>
              isNullOrUndefined(user.taskId) ||
              (isNullOrUndefined(userId) ? '' : user.id === userId),
          )
          .map((user) => ({
            key: user.id,
            value: user.name + ' ' + user.surname,
          })),
      ];
    }

    return tempUsersArr;
  }
}
