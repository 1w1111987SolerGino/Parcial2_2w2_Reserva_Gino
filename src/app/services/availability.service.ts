import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = 'https://671fe287e7a5792f052fdf93.mockapi.io/availability';
  //private apiUrl = 'http://localhost:3000/availability';

  constructor(private http: HttpClient) {}

  checkAvailability(venueId: string, date: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?venueId=${venueId}&date=${date}`);
  }
}
