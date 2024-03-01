import { Component, OnInit } from '@angular/core';
import { ApiService } from '@core/services';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent implements OnInit {
  constructor(private _apiService: ApiService) {}

  ngOnInit(): void {
    this._apiService.getUsers().subscribe((value) => console.log(value));
  }
}
