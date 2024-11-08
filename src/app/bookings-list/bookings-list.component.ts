import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { Booking } from '../interfaces';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-bookings-list',
  templateUrl: './bookings-list.component.html',
  styles: [`
    .badge { text-transform: capitalize; }
  `],
  imports: [CurrencyPipe,CommonModule,ReactiveFormsModule],
  standalone: true
})
export class BookingsListComponent implements OnInit {
  bookings: Booking[] = []; 
  originalBookings: Booking[] = []; // lista original 
  searchForm: FormGroup; 

   constructor(
    private bookingService: BookingService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit() {
    this.getBookings();

    this.searchForm.get('searchTerm')?.valueChanges.subscribe(data => {
      this.filterBookings(data);
    });
  }
  getBookings() {
    this.bookingService.getBookings().subscribe((bookings) => {
      this.bookings = bookings;
      this.originalBookings = bookings;
    });
  }
 // metodo para filtrar las reservas en base al termino de busqueda
 filterBookings(searchTerm: string) {
  if (!searchTerm) {
    this.bookings = [...this.originalBookings];
  } else {
    const upperCaseSearchTerm = searchTerm.toUpperCase();
    this.bookings = this.originalBookings.filter(booking => 
      (booking.companyName && booking.companyName.toUpperCase().includes(upperCaseSearchTerm)) ||
      (typeof booking.bookingCode === 'string' && booking.bookingCode.toUpperCase().includes(upperCaseSearchTerm))
    );
  }
}


  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'confirmed':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }
}
