import { Component, OnInit } from '@angular/core';
import { ApiService } from '@core/services';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.css',
})
export class TasksListComponent implements OnInit {
  constructor(private _apiService: ApiService) {}

  ngOnInit(): void {
    this._apiService.getTasks().subscribe((value) => console.log(value));
  }
}
