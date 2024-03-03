import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading: WritableSignal<number> = signal<number>(0);

  get loading(): WritableSignal<number> {
    return this._loading;
  }

  show(): void {
    this._loading.update((value) => (value += 1));
  }

  hide(): void {
    this._loading.update((value) => (value -= 1));
  }
}
