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
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { RowFilterModule } from '@progress/kendo-angular-grid';
import { TranslateModule } from '@ngx-translate/core';

import { TaskDto } from '@core/models';
import { DropdownDto } from '@shared/models';

@Component({
  selector: 'app-view-task',
  standalone: true,
  imports: [
    ButtonModule,
    DatePickerModule,
    DialogModule,
    DropDownListModule,
    RowFilterModule,
    TranslateModule,
  ],
  templateUrl: './view-task.component.html',
  styleUrl: './view-task.component.scss',
})
export class ViewTaskComponent implements OnInit {
  opened: boolean = true;
  @Output('close') onCloseView: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  task = input<TaskDto>();
  userList: WritableSignal<DropdownDto<string | null>[]> = signal<
    DropdownDto<string | null>[]
  >([]);
  form: FormGroup = new FormGroup({});

  get name(): AbstractControl | null {
    return this.form ? this.form.get('name') : null;
  }

  get description(): AbstractControl | null {
    return this.form ? this.form.get('description') : null;
  }

  get creationDate(): AbstractControl | null {
    return this.form ? this.form.get('creationDate') : null;
  }

  get modificationDate(): AbstractControl | null {
    return this.form ? this.form.get('modificationDate') : null;
  }

  get userName(): AbstractControl | null {
    return this.form ? this.form.get('userName') : null;
  }

  get state(): AbstractControl | null {
    return this.form ? this.form.get('state') : null;
  }

  constructor() {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = new FormGroup({
      name: new FormControl(this.task()?.name, Validators.required),
      description: new FormControl(this.task()?.description || 'N/A'),
      userName: new FormControl(this.task()?.userName || 'N/A'),
      creationDate: new FormControl(new Date(this.task()?.creationDate!)),
      modificationDate: new FormControl(
        new Date(this.task()?.modificationDate!),
      ),
      state: new FormControl(new Date(this.task()?.state!)),
    });

    this.form.disable();
  }

  close(): void {
    this.opened = false;
    this.onCloseView.next(this.opened);
  }
}
