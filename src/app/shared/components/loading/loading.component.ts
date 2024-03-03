import { Component, WritableSignal } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';

import { LoadingService } from '../../services';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {
  get loading(): WritableSignal<number> {
    return this._loadingService.loading;
  }

  constructor(private _loadingService: LoadingService) {}
}
