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
import { TaskDto, TaskState } from '@core/models';
import { ApiService, DataService } from '@core/services';
import { flatten } from '@shared/utils';
import {
  DeleteTaskComponent,
  EditTaskComponent,
  ViewTaskComponent,
} from '../action-components';
import { isNullOrUndefined } from '@shared/utils/functions';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [
    FaIconComponent,
    ViewTaskComponent,
    EditTaskComponent,
    DeleteTaskComponent,
    GridModule,
    TranslateModule,
    FormsModule,
  ],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.scss',
})
export class TasksListComponent implements OnInit {
  protected readonly faEye = faEye;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;
  protected readonly TaskState = TaskState;

  private _selectedTask: TaskDto = {
    id: '',
    name: '',
    description: '',
    creationDate: new Date(),
    modificationDate: new Date(),
    state: TaskState.Queue,
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

  get selectedTask(): TaskDto {
    return this._selectedTask;
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
    this.initTasks();
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
          this.reloadData(this._dataService.tasks, this.state);
        });
    } else {
      this._dataService.tasks = JSON.parse(
        localStorage.getItem('tasks') || '',
      ) as TaskDto[];

      this.reloadData(this._dataService.tasks, this.state);
      this.loading = false;
    }
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.reloadData(this._dataService.tasks, state);
  }

  private reloadData(users: TaskDto[], state: State): void {
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

    this.reloadData(this._dataService.tasks, this.state);
  }

  onAddProduct(): void {
    this._router.navigate(['add'], { relativeTo: this._activatedRoute });
  }

  onView(itemId: string): void {
    this._selectedTask = this._dataService.tasks.find(
      (task) => task.id === itemId,
    )!;
    this.viewDialogOpened = true;
  }
  onViewCloseEvent(event: boolean): void {
    this.viewDialogOpened = event;
  }

  onEdit(itemId: string): void {
    this._selectedTask = this._dataService.tasks.find(
      (task) => task.id === itemId,
    )!;
    this.editDialogOpened = true;
  }

  onEditCloseEvent(event: TaskDto | boolean): void {
    if (event as TaskDto) {
      if (
        this._selectedTask.userId &&
        isNullOrUndefined((event as TaskDto).userId)
      ) {
        const userToEdit = this._dataService.users.find(
          (user) => user.id === this._selectedTask.userId,
        )!;

        if (!isNullOrUndefined(userToEdit)) {
          userToEdit.taskId = undefined;
          userToEdit.taskName = undefined;

          localStorage.setItem(
            'users',
            JSON.stringify(this._dataService.users),
          );
        }
      }

      if (!isNullOrUndefined((event as TaskDto).userId)) {
        const userToEdit = this._dataService.users.find(
          (user) => user.id === (event as TaskDto).userId,
        )!;

        if (!isNullOrUndefined(userToEdit)) {
          userToEdit.taskId = (event as TaskDto).userId;

          localStorage.setItem(
            'users',
            JSON.stringify(this._dataService.users),
          );
        }
      }

      let taskIndex = this._dataService.tasks.findIndex(
        (task) => task.id === (event as TaskDto).id,
      );

      this._dataService.tasks[taskIndex] = event as TaskDto;
      localStorage.setItem('tasks', JSON.stringify(this._dataService.tasks));

      this.reloadData(this._dataService.tasks, this.state);
    }

    this.editDialogOpened = false;
  }

  onDelete(itemId: string): void {
    this._selectedTask = this._dataService.tasks.find(
      (task) => task.id === itemId,
    )!;
    this.deleteDialogOpened = true;
  }

  onDeleteCloseEvent(canDelete: boolean): void {
    if (canDelete) {
      this._dataService.tasks = this._dataService.tasks.filter(
        (task) => task.id !== this._selectedTask.id,
      );

      localStorage.setItem('tasks', JSON.stringify(this._dataService.tasks));

      if (this._selectedTask.userId) {
        const userToEdit = this._dataService.users.find(
          (user) => user.id === this._selectedTask.userId,
        )!;

        if (!isNullOrUndefined(userToEdit)) {
          userToEdit.taskId = undefined;
          userToEdit.modificationDate = new Date();
        }
      }

      this.reloadData(this._dataService.tasks, this.state);
    }

    this.deleteDialogOpened = false;
  }
}
