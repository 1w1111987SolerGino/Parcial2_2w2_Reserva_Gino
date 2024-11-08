import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venue } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
private apiUrl = 'https://671fe0b3e7a5792f052fd920.mockapi.io/venues';
//private apiUrl = 'http://localhost:3000/venues';


  constructor(private http: HttpClient) {}

  getVenues(): Observable<Venue[]> {
    return this.http.get<Venue[]>(this.apiUrl);
  }
}
