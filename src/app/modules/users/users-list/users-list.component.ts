import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DataStateChangeEvent,
  GridModule,
  PageSizeItem,
} from '@progress/kendo-angular-grid';
import {
  CompositeFilterDescriptor,
  DataResult,
  process,
  State,
} from '@progress/kendo-data-query';
import { FilterDescriptor } from '@progress/kendo-data-query/dist/npm/filtering/filter-descriptor.interface';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEdit, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';

import { ITEMS_PER_PAGE } from '@shared/models';
import { TaskDto, TaskState, UserDto, UserViewDto } from '@core/models';
import { ApiService, DataService } from '@core/services';
import { flatten } from '@shared/utils';
import {
  DeleteUserComponent,
  EditUserComponent,
  ViewUserComponent,
} from '../action-components';
import { isNullOrUndefined } from '@shared/utils/functions';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    GridModule,
    TranslateModule,
    FormsModule,
    FaIconComponent,
    EditUserComponent,
    DeleteUserComponent,
    ViewUserComponent,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent implements OnInit {
  protected readonly faEye = faEye;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;

  private _users: UserViewDto[] = [];
  private _selectedUser: UserDto = {
    id: '',
    taskId: '',
    name: '',
    surname: '',
    creationDate: new Date(),
    modificationDate: new Date(),
  };

  viewDialogOpened: boolean = false;
  deleteDialogOpened: boolean = false;
  editDialogOpened: boolean = false;

  data: DataResult = { data: [], total: 0 };
  enabledFilterValue: boolean | null = null;
  loading: boolean = false;
  state: State = {
    skip: 0,
    take: ITEMS_PER_PAGE,
    filter: {
      logic: 'and',
      filters: [{ field: 'name', operator: 'contains', value: '' }],
    },
  };
  pageSizes: PageSizeItem[] = [
    {
      text: '5',
      value: 5,
    },
    {
      text: '10',
      value: 10,
    },
    {
      text: '20',
      value: 20,
    },
    {
      text: this._translateService.instant('ALL'),
      value: 'all',
    },
  ];

  get selectedUser(): UserDto {
    return this._selectedUser;
  }

  constructor(
    private _apiService: ApiService,
    private _dataService: DataService,
    private _translateService: TranslateService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initData();
  }

  initData(): void {
    this.loading = true;

    this.initUsers();
    this.initTasks();
  }

  initUsers(): void {
    if (isNullOrUndefined(localStorage.getItem('users'))) {
      this._apiService
        .getUsers()
        .pipe(finalize(() => (this.loading = false)))
        .subscribe((users) => {
          this._dataService.users = users;
          this._users = users.map((user) => ({
            ...user,
            name: user.name + ' ' + user.surname,
          }));
          localStorage.setItem(
            'users',
            JSON.stringify(this._dataService.users),
          );

          this.reloadData(this._users, this.state);
          this.loading = false;
        });
    } else {
      let usersFromStorage = JSON.parse(
        localStorage.getItem('users') || '',
      ) as UserDto[];

      this._dataService.users = usersFromStorage;

      this._users = usersFromStorage.map((user) => ({
        ...user,
        name: user.name + ' ' + user.surname,
      }));

      this.reloadData(this._users, this.state);
      this.loading = false;
    }
  }

  initTasks(): void {
    if (isNullOrUndefined(localStorage.getItem('tasks'))) {
      this._apiService
        .getTasks()
        .pipe(finalize(() => (this.loading = false)))
        .subscribe((tasks) => {
          this._dataService.tasks = tasks;
          localStorage.setItem(
            'tasks',
            JSON.stringify(this._dataService.tasks),
          );
        });
    } else {
      this._dataService.tasks = JSON.parse(
        localStorage.getItem('tasks') || '',
      ) as TaskDto[];
    }
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.reloadData(this._users, state);
  }

  private reloadData(users: UserViewDto[], state: State): void {
    this.data = process(users, state);
  }

  onDropDownChange(field: string, value: boolean | null): void {
    const [filter] = flatten(this.state.filter!).filter(
      (x) => x.field === field,
    );

    const filters = flatten(this.state.filter!).filter(
      (x) => x.field !== field,
    );

    const filterId = this.state.filter!.filters.findIndex(
      (value1: CompositeFilterDescriptor | FilterDescriptor) =>
        (value1 as FilterDescriptor).field === field,
    );

    if (filterId >= 0)
      this.state.filter!.filters = this.state.filter!.filters.filter(
        (value1) => (value1 as FilterDescriptor).field !== field,
      );

    if (value === null) {
      this.state.filter!.filters = filters;
    } else {
      if (!filter) {
        this.state.filter!.filters.push({
          field,
          value,
          operator: 'isnotnull',
        });
      } else {
        this.state.filter!.filters.push({
          field,
          value,
          operator: 'isnull',
        });
      }
    }

    this.reloadData(this._users, this.state);
  }

  onAddProduct(): void {
    this._router.navigate(['add'], { relativeTo: this._activatedRoute });
  }

  onView(itemId: string): void {
    this._selectedUser = this._dataService.users.find(
      (user) => user.id === itemId,
    )!;
    this.viewDialogOpened = true;
  }
  onViewCloseEvent(event: boolean): void {
    this.viewDialogOpened = event;
  }

  onEdit(itemId: string): void {
    this._selectedUser = this._dataService.users.find(
      (user) => user.id === itemId,
    )!;
    this.editDialogOpened = true;
  }

  onEditCloseEvent(event: UserDto | boolean): void {
    if (event as UserDto) {
      if (
        this._selectedUser.taskId &&
        isNullOrUndefined((event as UserDto).taskId)
      ) {
        const taskToEdit = this._dataService.tasks.find(
          (task) => task.assignedTo === this._selectedUser.id,
        )!;

        taskToEdit.state = TaskState.Queue;
        taskToEdit.assignedTo = undefined;

        localStorage.setItem('tasks', JSON.stringify(this._dataService.tasks));
      }

      let userIndex = this._dataService.users.findIndex(
        (user) => user.id === (event as UserDto).id,
      );

      this._dataService.users[userIndex] = event as UserDto;
      localStorage.setItem('users', JSON.stringify(this._dataService.users));

      this._users = this._dataService.users.map((user) => ({
        ...user,
        name: user.name + ' ' + user.surname,
      }));

      this.reloadData(this._users, this.state);
    }

    this.editDialogOpened = false;
  }

  onDelete(itemId: string): void {
    this._selectedUser = this._dataService.users.find(
      (user) => user.id === itemId,
    )!;
    this.deleteDialogOpened = true;
  }

  onDeleteCloseEvent(canDelete: boolean): void {
    if (canDelete) {
      const filteredUserList = this._dataService.users.filter(
        (user) => user.id !== this._selectedUser.id,
      );
      localStorage.setItem('users', JSON.stringify(filteredUserList));

      const taskToEdit = this._dataService.tasks.find(
        (task) => task.assignedTo === this._selectedUser.id,
      )!;

      if (!isNullOrUndefined(taskToEdit)) {
        taskToEdit.assignedTo = undefined;
        taskToEdit.state = TaskState.Queue;
      }

      this.initData();
    }

    this.deleteDialogOpened = false;
  }
}
