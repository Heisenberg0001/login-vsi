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
import { TranslateModule } from '@ngx-translate/core';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { RowFilterModule } from '@progress/kendo-angular-grid';
import { TooltipModule } from '@progress/kendo-angular-tooltip';

import { DataService } from '@core/services';
import { DropdownDto } from '@shared/models';
import { TaskDto, UserDto } from '@core/models';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    DialogsModule,
    ButtonModule,
    DropDownListModule,
    RowFilterModule,
    TooltipModule,
    TranslateModule,
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit {
  opened: boolean = true;
  @Output('close') onCloseEdit: EventEmitter<UserDto | boolean> =
    new EventEmitter<UserDto | boolean>();

  user = input<UserDto>();
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

  get canEdit(): boolean {
    return this.form.valid;
  }

  constructor(private _dataService: DataService) {}

  ngOnInit(): void {
    this.initForm();
    this.initData();
  }

  initForm(): void {
    this.form = new FormGroup({
      name: new FormControl(this.user()?.name, Validators.required),
      surname: new FormControl(this.user()?.surname, Validators.required),
      taskId: new FormControl(this.user()?.taskId),
    });
  }

  initData(): void {
    this.initDropdown();
  }

  initDropdown(): void {
    if (!this._dataService?.tasks?.length) {
      this._dataService.tasks = JSON.parse(
        localStorage.getItem('tasks') || '',
      ) as TaskDto[];
    }

    this.tasksList.set(
      this._dataService.getUnassignedTasks(this.user()?.taskId || ''),
    );
  }

  handleFilter(value: string): void {
    this.tasksList.set(
      this._dataService
        .getUnassignedTasks(this.user()?.taskId || '')
        .filter(
          (task) =>
            task.value.toLowerCase().indexOf(value.toLowerCase()) !== -1,
        ),
    );
  }

  editUser(): void {
    this.close(true);
  }

  close(value: boolean): void {
    this.opened = false;
    if (value) {
      let taskName: string | undefined;

      if (this.taskId?.value) {
        taskName = this._dataService
          .getUnassignedTasks()
          .find((task) => task.key === this.taskId?.value)?.value;
      }

      this.onCloseEdit.next({
        id: this.user()?.id!,
        name: this.name?.value,
        surname: this.surname?.value,
        taskId: this.taskId?.value,
        taskName,
        modificationDate: new Date(),
        creationDate: this.user()?.creationDate!,
      });
    } else this.onCloseEdit.next(this.opened);
  }
}
