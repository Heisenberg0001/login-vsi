import {
  Component,
  EventEmitter,
  Input,
  input,
  InputSignal,
  OnDestroy,
  Output,
} from '@angular/core';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { ButtonModule } from '@progress/kendo-angular-buttons';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [DialogsModule, ButtonModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent {
  opened: boolean = true;
  @Output('close') closeEdit: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  close(): void {
    this.opened = false;
    this.closeEdit.next(this.opened);
  }
}
