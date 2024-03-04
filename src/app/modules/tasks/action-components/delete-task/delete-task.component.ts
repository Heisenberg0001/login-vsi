import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-task',
  standalone: true,
  imports: [ButtonModule, DialogModule, TranslateModule],
  templateUrl: './delete-task.component.html',
  styleUrl: './delete-task.component.scss',
})
export class DeleteTaskComponent {
  opened: boolean = true;
  @Output('close') closeEdit: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  close(value: boolean): void {
    this.opened = false;
    this.closeEdit.next(value);
  }
}
