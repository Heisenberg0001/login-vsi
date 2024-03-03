import { Injectable } from '@angular/core';

import { TaskState, TaskDto, UserDto } from '@core/models';
import { DropdownDto } from '@shared/models';
import { isNullOrUndefined } from '@shared/utils';
import { TranslateService } from '@ngx-translate/core';

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

  getUnassignedTasks(userTaskId: string = ''): DropdownDto[] {
    let tempTasksArr: DropdownDto[] = [];

    if (this._tasks.length) {
      tempTasksArr = [
        {
          key: null,
          value: this._translateService.instant('IS_NOT_SELECTED'),
        },
        ...this._tasks
          .filter(
            (task) =>
              (task.state === TaskState.Queue &&
                isNullOrUndefined(task.assignedTo)) ||
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

  get unassignedUsers(): DropdownDto[] {
    let tempUsersArr: DropdownDto[] = [];

    if (this._tasks.length) {
      tempUsersArr = [
        {
          key: null,
          value: this._translateService.instant('IS_NOT_SELECTED'),
        },
        ...this._users
          .filter((task) => isNullOrUndefined(task.taskId))
          .map((task) => ({
            key: task.id,
            value: task.name,
          })),
      ];
    }

    return tempUsersArr;
  }
}
