import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { VenueService } from '../services/venue.service';
import { BookingService } from '../services/booking.service';
import { ServiceService } from '../services/service.service';
import { Booking, BookingService as BookingServiceItem, Service, Venue } from '../interfaces';
import { CommonModule } from '@angular/common';
import { AvailabilityService } from '../services/availability.service';
import { catchError, map, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CreateBookingComponent implements OnInit {
  bookingForm = new FormGroup({
    companyName: new FormControl('', [Validators.required, Validators.minLength(5)]),
    companyEmail: new FormControl('', [Validators.required, Validators.email]),
    contactPhone: new FormControl('', [Validators.required]),
    venueId: new FormControl('', [Validators.required]),
    eventDate: new FormControl('', [Validators.required]),
    startTime: new FormControl('', [Validators.required]),
    endTime: new FormControl('', [Validators.required]),
    totalPeople: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    services: new FormArray([]),
    totalAmount: new FormControl({ value: '', disabled: true }),
    status: new FormControl('pending'),
    createdAt: new FormControl(new Date())
  });
  
  venues: Venue[] = [];
  servicesList: Service[] = [];
  totalAmount: number = 0;

  constructor(
    private venueService: VenueService,
    private bookingService: BookingService,
    private serviceService: ServiceService,
    private availabilityService: AvailabilityService,
    private router: Router 

  ) {}

  ngOnInit() {
    this.venueService.getVenues().subscribe((venues) => (this.venues = venues));
    this.serviceService.getServices().subscribe((services) => (this.servicesList = services));

    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
  }

  get services(): FormArray {
    return this.bookingForm.get('services') as FormArray;
  }

  addService() {
    const serviceGroup = new FormGroup({
      serviceId: new FormControl('', Validators.required),
      quantity: new FormControl('', [Validators.required, Validators.min(10)]),
      startTime: new FormControl('', Validators.required),
      endTime: new FormControl('', Validators.required)
    });
    this.services.push(serviceGroup);
    this.calculateTotal();
  }

  removeService(index: number) {
    this.services.removeAt(index);
    this.calculateTotal();
  }

  calculateServiceSubtotal(index: number): number {
    const serviceControl = this.services.at(index);
    const quantity = serviceControl.get('quantity')?.value || 0;
    const serviceId = serviceControl.get('serviceId')?.value;
    const service = this.servicesList.find(s => s.id === serviceId);
    const pricePerPerson = service ? service.pricePerPerson : 0;
    return quantity * pricePerPerson;
  }

  //Debugeando me anda perfecto el calculo del discount y todo pero no me lo aplica bien al resultado del precio final :/
  calculateTotal() {
    let subtotal = this.services.controls.reduce((total, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const serviceId = control.get('serviceId')?.value;
      const service = this.servicesList.find(s => s.id === serviceId);
      const pricePerPerson = service ? service.pricePerPerson : 0;
      return total + (quantity * pricePerPerson);
    }, 0);
  
    const totalPeople = this.bookingForm.get('totalPeople')?.value || 0;
    let discount = 0;
  
    // aplica un descuento del 15% si el total de personas es mayor a 100
    if (totalPeople > 100) {
      discount = subtotal * 0.15;
    }
  
    const finalTotal = subtotal - discount;
    this.totalAmount = finalTotal;
    this.bookingForm.get('totalAmount')?.setValue(finalTotal.toFixed(2)); 
  }
  
  // Validador asincrónico para verificar disponibilidad
  availabilityValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    const venueId = control.value;
    const eventDate = this.bookingForm.get('eventDate')?.value;

    if (!venueId || !eventDate) {
      return of(null); 
    }

    return this.availabilityService.checkAvailability(venueId, eventDate).pipe(
      map((response: any) => response.available ? null : { notAvailable: true }),
      catchError(() => of(null))
    );
  }
  
  submitBooking() {
    if (this.bookingForm.valid) {
      const booking: Booking = {
        bookingCode: this.generateBookingCode(),
        companyName: this.bookingForm.get('companyName')?.value || '',
        companyEmail: this.bookingForm.get('companyEmail')?.value || '',
        contactPhone: this.bookingForm.get('contactPhone')?.value || '',
        venueId: this.bookingForm.get('venueId')?.value || '',
        eventDate: new Date(this.bookingForm.get('eventDate')?.value || ''), 
        startTime: this.bookingForm.get('startTime')?.value || '',
        endTime: this.bookingForm.get('endTime')?.value || '',
        totalPeople: this.bookingForm.get('totalPeople')?.value || 0,
        services: this.services.controls.map(control => {
          const serviceId = control.get('serviceId')?.value || '';
          const quantity = control.get('quantity')?.value || 0;
          const startTime = control.get('startTime')?.value || '';
          const endTime = control.get('endTime')?.value || '';
          const service = this.servicesList.find(s => s.id === serviceId);
          const pricePerPerson = service ? service.pricePerPerson : 0;

          return {
            serviceId,
            quantity,
            pricePerPerson,
            startTime,
            endTime
          } as BookingServiceItem;
        }),
        totalAmount: this.totalAmount,
        status: 'pending',
        createdAt: new Date()
      };

      this.bookingService.createBooking(booking).subscribe(() => {
        console.log('Reserva creada exitosamente');
        this.router.navigate(['/bookings']);
      });
    }
  }

  private generateBookingCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
