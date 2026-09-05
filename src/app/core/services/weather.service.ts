import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError, forkJoin, retry, timer } from 'rxjs';
import {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  AirQuality,
  WeatherData,
  WeatherError,
  MinutelyForecast,
} from '../models/weather.model';

const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_API = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// Current weather variables
const CURRENT_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'uv_index',
  'visibility',
].join(',');

// Hourly variables
const HOURLY_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'cloud_cover',
  'visibility',
  'wind_speed_10m',
  'wind_direction_10m',
  'uv_index',
  'is_day',
].join(',');

// Daily variables
const DAILY_PARAMS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'apparent_temperature_min',
  'sunrise',
  'sunset',
  'uv_index_max',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_direction_10m_dominant',
].join(',');

// Air quality variables (including pollen)
const AQ_PARAMS = [
  'us_aqi', 'european_aqi', 'pm2_5', 'pm10',
  'alder_pollen', 'birch_pollen', 'grass_pollen', 
  'mugwort_pollen', 'olive_pollen', 'ragweed_pollen'
].join(',');

interface OpenMeteoForecastResponse {
  current: Record<string, number | string>;
  hourly: Record<string, (number | string | null)[]>;
  daily: Record<string, (number | string | null)[]>;
  minutely_15?: Record<string, (number | string | null)[]>;
}

interface OpenMeteoAirQualityResponse {
  current: Record<string, number | null>;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Fetches complete weather data (forecast + air quality) for a location.
   * Uses forkJoin to parallel-fetch both endpoints.
   */
  fetchWeatherData(lat: number, lon: number): Observable<WeatherData> {
    return forkJoin({
      forecast: this.fetchForecast(lat, lon),
      airQuality: this.fetchAirQuality(lat, lon).pipe(
        catchError(() => [null as AirQuality | null])
      ),
    }).pipe(
      map(({ forecast, airQuality }) => ({
        current: forecast.current,
        hourly: forecast.hourly,
        daily: forecast.daily,
        minutely15: forecast.minutely15,
        airQuality,
      })),
      catchError(err => throwError(() => this.mapError(err)))
    );
  }

  private fetchForecast(lat: number, lon: number): Observable<{
    current: CurrentWeather;
    hourly: HourlyForecast[];
    daily: DailyForecast[];
    minutely15: MinutelyForecast[];
  }> {
    const params = new HttpParams()
      .set('latitude', lat.toString())
      .set('longitude', lon.toString())
      .set('current', CURRENT_PARAMS)
      .set('hourly', HOURLY_PARAMS)
      .set('daily', DAILY_PARAMS)
      .set('minutely_15', 'precipitation')
      .set('timezone', 'auto')
      .set('forecast_days', '7')
      .set('forecast_minutely_15', '24'); // get 24 hours of minutely data (wait, usually we just need next hour, maybe forecast_days is enough, but API supports forecast_hours, actually I'll just omit forecast_minutely_15 and let it default)

    return this.http.get<OpenMeteoForecastResponse>(FORECAST_API, { params }).pipe(
      retry({ count: 2, delay: (error, retryCount) => timer(retryCount * 1000) }),
      map(response => ({
        current: this.mapCurrentWeather(response.current),
        hourly: this.mapHourlyForecast(response.hourly),
        daily: this.mapDailyForecast(response.daily),
        minutely15: response.minutely_15 ? this.mapMinutelyForecast(response.minutely_15) : [],
      }))
    );
  }

  fetchCurrentWeatherOnly(lat: number, lon: number): Observable<CurrentWeather & { tempMax?: number, tempMin?: number }> {
    const params = new HttpParams()
      .set('latitude', lat.toString())
      .set('longitude', lon.toString())
      .set('current', CURRENT_PARAMS)
      .set('daily', 'temperature_2m_max,temperature_2m_min')
      .set('timezone', 'auto')
      .set('forecast_days', '1');

    return this.http.get<{ current: Record<string, number | string>, daily?: Record<string, (number | string | null)[]> }>(FORECAST_API, { params }).pipe(
      retry({ count: 2, delay: (error, retryCount) => timer(retryCount * 1000) }),
      map(response => {
        const current = this.mapCurrentWeather(response.current);
        const tempMax = response.daily?.['temperature_2m_max']?.[0] as number | undefined;
        const tempMin = response.daily?.['temperature_2m_min']?.[0] as number | undefined;
        return { ...current, tempMax, tempMin };
      })
    );
  }

  private fetchAirQuality(lat: number, lon: number): Observable<AirQuality | null> {
    const params = new HttpParams()
      .set('latitude', lat.toString())
      .set('longitude', lon.toString())
      .set('current', AQ_PARAMS);

    return this.http.get<OpenMeteoAirQualityResponse>(AIR_QUALITY_API, { params }).pipe(
      retry({ count: 2, delay: (error, retryCount) => timer(retryCount * 1000) }),
      map(response => this.mapAirQuality(response.current)),
      catchError(() => [null])
    );
  }

  // === RESPONSE MAPPING ===

  private mapCurrentWeather(data: Record<string, number | string>): CurrentWeather {
    return {
      temperature: data['temperature_2m'] as number,
      feelsLike: data['apparent_temperature'] as number,
      humidity: data['relative_humidity_2m'] as number,
      precipitation: data['precipitation'] as number,
      weatherCode: data['weather_code'] as number,
      cloudCover: data['cloud_cover'] as number,
      pressure: data['pressure_msl'] as number,
      windSpeed: data['wind_speed_10m'] as number,
      windDirection: data['wind_direction_10m'] as number,
      windGusts: data['wind_gusts_10m'] as number,
      uvIndex: data['uv_index'] as number,
      visibility: data['visibility'] as number,
      isDay: data['is_day'] === 1,
      time: data['time'] as string,
    };
  }

  private mapHourlyForecast(data: Record<string, (number | string | null)[]>): HourlyForecast[] {
    const times = data['time'] as string[];
    return times.map((time, i) => ({
      time,
      temperature: (data['temperature_2m']?.[i] ?? 0) as number,
      feelsLike: (data['apparent_temperature']?.[i] ?? 0) as number,
      humidity: (data['relative_humidity_2m']?.[i] ?? 0) as number,
      precipitationProbability: (data['precipitation_probability']?.[i] ?? 0) as number,
      precipitation: (data['precipitation']?.[i] ?? 0) as number,
      weatherCode: (data['weather_code']?.[i] ?? 0) as number,
      cloudCover: (data['cloud_cover']?.[i] ?? 0) as number,
      visibility: (data['visibility']?.[i] ?? 0) as number,
      windSpeed: (data['wind_speed_10m']?.[i] ?? 0) as number,
      windDirection: (data['wind_direction_10m']?.[i] ?? 0) as number,
      uvIndex: (data['uv_index']?.[i] ?? 0) as number,
      isDay: data['is_day']?.[i] === 1,
    }));
  }

  private mapDailyForecast(data: Record<string, (number | string | null)[]>): DailyForecast[] {
    const dates = data['time'] as string[];
    return dates.map((date, i) => ({
      date,
      weatherCode: (data['weather_code']?.[i] ?? 0) as number,
      tempMax: (data['temperature_2m_max']?.[i] ?? 0) as number,
      tempMin: (data['temperature_2m_min']?.[i] ?? 0) as number,
      feelsLikeMax: (data['apparent_temperature_max']?.[i] ?? 0) as number,
      feelsLikeMin: (data['apparent_temperature_min']?.[i] ?? 0) as number,
      sunrise: (data['sunrise']?.[i] ?? '') as string,
      sunset: (data['sunset']?.[i] ?? '') as string,
      uvIndexMax: (data['uv_index_max']?.[i] ?? 0) as number,
      precipitationSum: (data['precipitation_sum']?.[i] ?? 0) as number,
      precipitationProbabilityMax: (data['precipitation_probability_max']?.[i] ?? 0) as number,
      windSpeedMax: (data['wind_speed_10m_max']?.[i] ?? 0) as number,
      windDirectionDominant: (data['wind_direction_10m_dominant']?.[i] ?? 0) as number,
    }));
  }

  private mapMinutelyForecast(data: Record<string, (number | string | null)[]>): MinutelyForecast[] {
    const times = data['time'] as string[];
    return times.map((time, i) => ({
      time,
      precipitation: (data['precipitation']?.[i] ?? 0) as number,
    }));
  }

  private mapAirQuality(data: Record<string, number | null>): AirQuality {
    return {
      usAqi: data['us_aqi'] ?? null,
      europeanAqi: data['european_aqi'] ?? null,
      pm25: data['pm2_5'] ?? null,
      pm10: data['pm10'] ?? null,
      alderPollen: data['alder_pollen'] ?? null,
      birchPollen: data['birch_pollen'] ?? null,
      grassPollen: data['grass_pollen'] ?? null,
      mugwortPollen: data['mugwort_pollen'] ?? null,
      olivePollen: data['olive_pollen'] ?? null,
      ragweedPollen: data['ragweed_pollen'] ?? null,
    };
  }

  private mapError(err: unknown): WeatherError {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0 || !navigator.onLine) {
        return { type: 'network', message: 'Unable to connect to weather service. Check your internet connection.' };
      }
      if (err.status === 429) {
        return { type: 'rate-limit', message: 'Too many requests. Please try again in a moment.' };
      }
      if (err.status >= 400 && err.status < 500) {
        return { type: 'location-invalid', message: 'Invalid location or parameters.' };
      }
    }

    return { type: 'unknown', message: 'Something went wrong. Please try again.' };
  }
}
