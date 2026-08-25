import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { GeoLocation } from '../models/location.model';

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    country_code: string;
    admin1?: string;
    admin2?: string;
    timezone?: string;
    population?: number;
    elevation?: number;
  }>;
  generationtime_ms: number;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Searches for locations by name.
   * Returns up to 8 results, sorted by population (most relevant first).
   */
  search(query: string, count: number = 8): Observable<GeoLocation[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }

    const params = new HttpParams()
      .set('name', query.trim())
      .set('count', count.toString())
      .set('language', 'en')
      .set('format', 'json');

    return this.http.get<OpenMeteoGeocodingResponse>(GEOCODING_API, { params }).pipe(
      map(response => this.mapResults(response)),
      catchError(() => of([]))
    );
  }

  private mapResults(response: OpenMeteoGeocodingResponse): GeoLocation[] {
    if (!response.results?.length) {
      return [];
    }

    return response.results.map(result => ({
      id: result.id,
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
      countryCode: result.country_code,
      admin1: result.admin1,
      admin2: result.admin2,
      timezone: result.timezone,
      population: result.population,
      elevation: result.elevation,
    }));
  }
}
