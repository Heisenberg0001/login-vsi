import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ActivatedRoute, Router } from '@angular/router';
import { TooltipModule } from '@progress/kendo-angular-tooltip';

import { ApiService, DataService } from '@core/services';
import { TaskState, TaskDto, UserDto } from '@core/models';
import { generateGuid, isNullOrUndefined } from '@shared/utils/functions';
import { DropdownDto } from '@shared/models';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DropDownsModule,
    TooltipModule,
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent implements OnInit {
  tasksList: WritableSignal<DropdownDto<string | null>[]> = signal<
    DropdownDto<string | null>[]
  >([]);
  form: FormGroup = new FormGroup({});

  get name(): AbstractControl | null {
    return this.form ? this.form.get('name') : null;
  }

  get surname(): AbstractControl | null {
    return this.form ? this.form.get('surname') : null;
  }

  get taskId(): AbstractControl | null {
    return this.form ? this.form.get('taskId') : null;
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
    this.initData();
  }

  initForm(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      surname: new FormControl('', Validators.required),
      taskId: new FormControl(''),
    });
  }

  initData(): void {
    this.initDropdown();
  }

  initDropdown(): void {
    if (
      isNullOrUndefined(localStorage.getItem('tasks')) &&
      !this._dataService?.tasks?.length
    ) {
      this._apiService
        .getTasks()
        .subscribe((tasks) => (this._dataService.tasks = tasks));
    }

    if (!this._dataService?.tasks?.length) {
      this._dataService.tasks = JSON.parse(
        localStorage.getItem('tasks') || '',
      ) as TaskDto[];
    }

    this.tasksList.set(this._dataService.getUnassignedTasks());
  }

  handleFilter(value: string): void {
    this.tasksList.set(
      this._dataService
        .getUnassignedTasks()
        .filter(
          (task) =>
            task.value.toLowerCase().indexOf(value.toLowerCase()) !== -1,
        ),
    );
  }

  back(): void {
    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
  }

  addUser(): void {
    let taskName: string | undefined;

    if (this.taskId?.value) {
      taskName = this._dataService
        .getUnassignedTasks()
        .find((task) => task.key === this.taskId?.value)?.value;
    }

    const userToAdd: UserDto = {
      id: generateGuid(),
      name: this.name?.value,
      surname: this.surname?.value,
      taskId: this.taskId?.value || null,
      taskName,
      creationDate: new Date(),
      modificationDate: new Date(),
    };

    if (this.taskId?.value) {
      const taskToEdit: TaskDto = this._dataService.tasks.find(
        (task) => task.id === this.taskId?.value,
      )!;

      if (!isNullOrUndefined(taskToEdit)) {
        taskToEdit.userId = userToAdd.id;
        taskToEdit.userName = userToAdd.name + ' ' + userToAdd.surname;
        taskToEdit.state = TaskState.Progress;

        localStorage.setItem('tasks', JSON.stringify(this._dataService.tasks));
      }
    }

    this._dataService.users = [userToAdd, ...this._dataService.users];

    localStorage.setItem('users', JSON.stringify(this._dataService.users));

    this.back();
  }
}
