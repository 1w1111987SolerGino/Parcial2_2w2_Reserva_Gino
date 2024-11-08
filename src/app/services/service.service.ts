import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
private apiUrl = 'https://671fe0b3e7a5792f052fd920.mockapi.io/services';
//private apiUrl = 'http://localhost:3000/services';

  constructor(private http: HttpClient) {}

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl);
  }
}
