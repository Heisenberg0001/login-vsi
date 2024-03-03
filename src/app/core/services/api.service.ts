import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TaskDto, UserDto } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private _http: HttpClient) {}

  getUsers(): Observable<UserDto[]> {
    return this._http.get<UserDto[]>('../../../assets/mocks/users.json');
  }

  getTasks(): Observable<TaskDto[]> {
    return this._http.get<TaskDto[]>('../../../assets/mocks/tasks.json');
  }
}
