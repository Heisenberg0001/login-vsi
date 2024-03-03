import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { DialogModule, WindowModule } from '@progress/kendo-angular-dialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-user',
  standalone: true,
  imports: [ButtonModule, DialogModule, WindowModule, TranslateModule],
  templateUrl: './delete-user.component.html',
  styleUrl: './delete-user.component.scss',
})
export class DeleteUserComponent {
  opened: boolean = true;
  @Output('close') closeEdit: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  close(value: boolean): void {
    this.opened = false;
    this.closeEdit.next(value);
  }
}
