import { Component, OnInit } from '@angular/core';
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
import { DataService } from '@core/services';
import { UserDto } from '@core/models';
import { generateGuid } from '@shared/utils/functions';

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
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      surname: new FormControl('', Validators.required),
      taskId: new FormControl(''),
    });
  }

  back(): void {
    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
  }

  addUser(): void {
    const userToAdd: UserDto = {
      id: generateGuid(),
      name: this.name?.value,
      surname: this.surname?.value,
      taskId: this.taskId?.value || null,
      createdDate: new Date(),
      modificationDate: new Date(),
    };

    localStorage.setItem(
      'users',
      JSON.stringify([...this._dataService.users, userToAdd]),
    );

    this.back();
  }
}
