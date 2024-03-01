import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private _http: HttpClient) {}

  getUsers(): Observable<any> {
    return this._http.get('../../../assets/mocks/users.json');
  }

  getTasks(): Observable<any> {
    return this._http.get('../../../assets/mocks/tasks.json');
  }
}
