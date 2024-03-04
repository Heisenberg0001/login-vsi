import {
  Component,
  EventEmitter,
  input,
  OnInit,
  Output,
  signal,
  WritableSignal,
} from '@angular/core';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { RowFilterModule } from '@progress/kendo-angular-grid';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { TaskDto, UserDto } from '@core/models';
import { DropdownDto } from '@shared/models';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DataService } from '@core/services';

@Component({
  selector: 'app-view-user',
  standalone: true,
  imports: [
    DialogModule,
    DropDownListModule,
    RowFilterModule,
    TooltipModule,
    TranslateModule,
  ],
  templateUrl: './view-user.component.html',
  styleUrl: './view-user.component.scss',
})
export class ViewUserComponent implements OnInit {
  opened: boolean = true;
  @Output('close') onCloseView: EventEmitter<boolean> =
    new EventEmitter<boolean>();

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

  get creationDate(): AbstractControl | null {
    return this.form ? this.form.get('creationDate') : null;
  }

  get modificationDate(): AbstractControl | null {
    return this.form ? this.form.get('modificationDate') : null;
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
      taskId: new FormControl(this.user()?.taskId || 'N/A'),
      creationDate: new FormControl(new Date(this.user()?.creationDate!)),
      modificationDate: new FormControl(
        new Date(this.user()?.modificationDate!),
      ),
    });

    this.form.disable();
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

  close(): void {
    this.opened = false;
    this.onCloseView.next(this.opened);
  }
}
