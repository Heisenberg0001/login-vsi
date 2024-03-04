import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { FilterMenuModule } from '@progress/kendo-angular-grid';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { ApiService, DataService } from '@core/services';
import { DropdownDto } from '@shared/models';
import { generateGuid, isNullOrUndefined } from '@shared/utils';
import { TaskDto, TaskState, UserDto } from '@core/models';
import { tap } from 'rxjs';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [
    DropDownListModule,
    FilterMenuModule,
    TooltipModule,
    TranslateModule,
  ],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss',
})
export class AddTaskComponent implements OnInit {
  usersList: WritableSignal<DropdownDto<string | null>[]> = signal<
    DropdownDto<string | null>[]
  >([]);
  form: FormGroup = new FormGroup({});

  get name(): AbstractControl | null {
    return this.form ? this.form.get('name') : null;
  }

  get description(): AbstractControl | null {
    return this.form ? this.form.get('description') : null;
  }

  get userId(): AbstractControl | null {
    return this.form ? this.form.get('userId') : null;
  }

  get state(): AbstractControl | null {
    return this.form ? this.form.get('state') : null;
  }
  get canAdd(): boolean {
    return this.form.valid;
  }

  constructor(
    private _dataService: DataService,
    private _apiService: ApiService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initFormListeners();
    this.initData();
  }

  initForm(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl(''),
      userId: new FormControl(''),
      state: new FormControl(TaskState.Queue),
    });
  }

  initFormListeners(): void {
    this.userId?.valueChanges
      .pipe(
        tap((value) => {
          if (isNullOrUndefined(value)) {
            this.state?.setValue(TaskState.Queue);
          }
          if (!isNullOrUndefined(value)) {
            this.state?.setValue(TaskState.Progress);
          }
        }),
      )
      .subscribe();
    this.state?.valueChanges
      .pipe(
        tap((value) => {
          if (value === TaskState.Queue) {
            this.userId?.setValue(null);
          }
        }),
      )
      .subscribe();
  }

  initData(): void {
    this.initDropdown();
  }

  initDropdown(): void {
    if (
      isNullOrUndefined(localStorage.getItem('users')) &&
      !this._dataService?.users?.length
    ) {
      this._apiService
        .getUsers()
        .subscribe((users) => (this._dataService.users = users));
    }

    if (!this._dataService?.users?.length) {
      this._dataService.users = JSON.parse(
        localStorage.getItem('users') || '',
      ) as UserDto[];
    }

    this.usersList.set(this._dataService.getUnassignedUsers());
  }

  handleFilter(value: string): void {
    this.usersList.set(
      this._dataService
        .getUnassignedUsers()
        .filter(
          (user) =>
            user.value.toLowerCase().indexOf(value.toLowerCase()) !== -1,
        ),
    );
  }

  back(): void {
    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
  }

  addUser(): void {
    let userName: string | undefined;

    if (this.userId?.value) {
      userName = this._dataService
        .getUnassignedUsers()
        .find((user) => user.key === this.userId?.value)?.value;
    }

    const taskToAdd: TaskDto = {
      id: generateGuid(),
      name: this.name?.value,
      description: this.description?.value,
      userId: this.userId?.value || null,
      userName,
      state: this.state?.value,
      creationDate: new Date(),
      modificationDate: new Date(),
    };

    const userToEdit = this._dataService.users.find(
      (user) => user.id === this.userId?.value,
    )!;

    if (!isNullOrUndefined(userToEdit)) {
      userToEdit.taskId = taskToAdd.id;
      userToEdit.taskId = taskToAdd.name;

      localStorage.setItem('users', JSON.stringify(this._dataService.users));
    }

    this._dataService.tasks = [taskToAdd, ...this._dataService.tasks];

    localStorage.setItem('tasks', JSON.stringify(this._dataService.tasks));

    this.back();
  }

  protected readonly TaskState = TaskState;
}
