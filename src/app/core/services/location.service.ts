import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UserGeolocation } from '../models/location.model';
import { WeatherError } from '../models/weather.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  /**
   * Gets the user's current position from the browser Geolocation API.
   * Returns an Observable that emits once and completes.
   */
  getCurrentPosition(): Observable<UserGeolocation> {
    const subject = new Subject<UserGeolocation>();

    if (!('geolocation' in navigator)) {
      subject.error({
        type: 'geolocation-unavailable',
        message: 'Geolocation is not supported by your browser.',
      } satisfies WeatherError);
      return subject.asObservable();
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        subject.next({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        subject.complete();
      },
      (error) => {
        let weatherError: WeatherError;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            weatherError = {
              type: 'geolocation-denied',
              message: 'Location access was denied. Please enable location permissions or search for a city.',
            };
            break;
          case error.POSITION_UNAVAILABLE:
            weatherError = {
              type: 'geolocation-unavailable',
              message: 'Your location could not be determined. Please search for a city instead.',
            };
            break;
          default:
            weatherError = {
              type: 'geolocation-unavailable',
              message: 'Unable to get your location. Please search for a city.',
            };
        }
        subject.error(weatherError);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000, // Cache for 10 minutes
      }
    );

    return subject.asObservable();
  }
}
