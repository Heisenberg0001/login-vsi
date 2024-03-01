import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading: WritableSignal<boolean> = signal<boolean>(false);

  get loading(): WritableSignal<boolean> {
    return this._loading;
  }

  show(): void {
    this._loading.set(true);
  }

  hide(): void {
    this._loading.set(false);
  }
}
