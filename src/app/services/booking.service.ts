import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
private apiUrl = 'https://671fe287e7a5792f052fdf93.mockapi.io/bookings';
//private apiUrl = 'http://localhost:3000/bookings';

  constructor(private http: HttpClient) {}

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }
}
