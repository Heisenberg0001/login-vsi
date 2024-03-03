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
  process,
  DataResult,
  State,
  CompositeFilterDescriptor,
} from '@progress/kendo-data-query';
import { FilterDescriptor } from '@progress/kendo-data-query/dist/npm/filtering/filter-descriptor.interface';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEdit, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';

import { ITEMS_PER_PAGE } from '@shared/models';
import { UserDto, UserViewDto } from '@core/models';
import { ApiService, DataService } from '@core/services';
import { flatten } from '@shared/utils';
import { DeleteUserComponent, EditUserComponent } from '../action-components';
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
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent implements OnInit {
  protected readonly faEye = faEye;
  protected readonly faEdit = faEdit;
  protected readonly faTrash = faTrash;

  private _users: UserViewDto[] = [];
  private _selectedUserId: string = '';

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
          localStorage.setItem('users', JSON.stringify(this._users));

          this.reloadData(this._users, this.state);
        });
    } else {
      let usersFromStorage = JSON.parse(
        localStorage.getItem('users') || '',
      ) as UserDto[];

      this._users = usersFromStorage.map((user) => ({
        ...user,
        name: user.name + ' ' + user.surname,
      }));
      this._dataService.users = usersFromStorage;
      this.loading = false;
      this.reloadData(this._users, this.state);
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

  onView(): void {
    this.viewDialogOpened = true;
  }
  onViewCloseEvent(event: boolean): void {
    this.viewDialogOpened = event;
  }

  onEdit(itemId: string): void {
    this._selectedUserId = itemId;
    this.editDialogOpened = true;
  }

  onEditCloseEvent(event: boolean): void {
    this.editDialogOpened = event;
  }

  onDelete(itemId: string): void {
    this._selectedUserId = itemId;
    this.deleteDialogOpened = true;
  }

  onDeleteCloseEvent(canDelete: boolean): void {
    if (canDelete) {
      const filteredUserList = this._dataService.users.filter(
        (user) => user.id !== this._selectedUserId,
      );
      localStorage.setItem('users', JSON.stringify(filteredUserList));
      this.initData();
    }

    this.deleteDialogOpened = false;
  }
}
