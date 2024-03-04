import {
  Component,
  EventEmitter,
  input,
  OnInit,
  Output,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { RowFilterModule } from '@progress/kendo-angular-grid';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { tap } from 'rxjs';

import { TaskDto, TaskState, UserDto } from '@core/models';
import { DataService } from '@core/services';
import { DropdownDto } from '@shared/models';
import { isNullOrUndefined } from '@shared/utils';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [
    DialogModule,
    DropDownListModule,
    RowFilterModule,
    TooltipModule,
    TranslateModule,
  ],
  templateUrl: './edit-task.component.html',
  styleUrl: './edit-task.component.scss',
})
export class EditTaskComponent implements OnInit {
  opened: boolean = true;
  @Output('close') onCloseEdit: EventEmitter<TaskDto | boolean> =
    new EventEmitter<TaskDto | boolean>();

  task = input<TaskDto>();
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

  get canEdit(): boolean {
    return this.form.valid;
  }

  constructor(private _dataService: DataService) {}

  ngOnInit(): void {
    this.initForm();
    this.initFormListeners();
    this.initData();
  }

  initForm(): void {
    this.form = new FormGroup({
      name: new FormControl(this.task()?.name, Validators.required),
      description: new FormControl(this.task()?.description || 'N/A'),
      userId: new FormControl(this.task()?.userId || 'N/A'),
      state: new FormControl(
        new Date(this.task()?.state!),
        Validators.required,
      ),
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
    if (!this._dataService?.users?.length) {
      this._dataService.users = JSON.parse(
        localStorage.getItem('users') || '',
      ) as UserDto[];
    }

    this.usersList.set(
      this._dataService.getUnassignedUsers(this.task()?.userId || ''),
    );
  }

  handleFilter(value: string): void {
    this.usersList.set(
      this._dataService
        .getUnassignedUsers(this.task()?.userId || '')
        .filter(
          (user) =>
            user.value.toLowerCase().indexOf(value.toLowerCase()) !== -1,
        ),
    );
  }

  editUser(): void {
    this.close(true);
  }

  close(value: boolean): void {
    this.opened = false;
    if (value) {
      let userName: string | undefined;

      if (this.userId?.value) {
        userName = this._dataService
          .getUnassignedUsers(this.task()?.userId || '')
          .find((user) => user.key === this.userId?.value)?.value;
      }

      this.onCloseEdit.next({
        id: this.task()?.id!,
        name: this.name?.value,
        description: this.description?.value,
        userId: this.userId?.value,
        userName,
        state: this.state?.value,
        modificationDate: new Date(),
        creationDate: this.task()?.creationDate!,
      });
    } else this.onCloseEdit.next(this.opened);
  }

  protected readonly TaskState = TaskState;
}
