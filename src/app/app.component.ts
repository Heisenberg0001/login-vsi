import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent, LoadingComponent } from './shared';
import { ApiService } from './core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(private _translateService: TranslateService) {}

  ngOnInit(): void {
    this._translateService.addLangs(['en']);
    this._translateService.setDefaultLang('en');
  }
}
