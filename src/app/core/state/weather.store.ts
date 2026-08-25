import { Injectable, signal, computed, effect, inject } from '@angular/core';
import {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  AirQuality,
  WeatherData,
  WeatherError,
  getWeatherMeta,
  resolveWeatherTheme,
  WeatherTheme,
  WeatherConditionMeta,
} from '../models/weather.model';
import { GeoLocation } from '../models/location.model';
import { WeatherService } from '../services/weather.service';
import { StorageService } from '../services/storage.service';

const STORAGE_KEY_LOCATION = 'nimbus-last-location';

@Injectable({ providedIn: 'root' })
export class WeatherStore {
  private readonly weatherService = inject(WeatherService);
  private readonly storage = inject(StorageService);

  // === PRIMARY STATE (writable signals) ===
  readonly currentWeather = signal<CurrentWeather | null>(null);
  readonly hourlyForecast = signal<HourlyForecast[]>([]);
  readonly dailyForecast = signal<DailyForecast[]>([]);
  readonly airQuality = signal<AirQuality | null>(null);
  readonly selectedLocation = signal<GeoLocation | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<WeatherError | null>(null);

  // === DERIVED STATE (computed signals) ===

  readonly weatherMeta = computed<WeatherConditionMeta>(() =>
    getWeatherMeta(this.currentWeather()?.weatherCode)
  );

  readonly isNight = computed(() => {
    const current = this.currentWeather();
    return current ? !current.isDay : false;
  });

  readonly weatherTheme = computed<WeatherTheme>(() =>
    resolveWeatherTheme(this.currentWeather()?.weatherCode, this.isNight())
  );

  readonly conditionLabel = computed(() => this.weatherMeta().label);

  readonly feelsLikeLabel = computed(() => {
    const current = this.currentWeather();
    if (!current) return '';
    const diff = current.feelsLike - current.temperature;
    if (diff > 2) return 'Warmer than actual';
    if (diff < -2) return 'Cooler than actual';
    return 'Similar to actual';
  });

  readonly todayHighLow = computed(() => {
    const daily = this.dailyForecast();
    if (!daily.length) return null;
    return { high: daily[0].tempMax, low: daily[0].tempMin };
  });

  readonly todaySunrise = computed(() => {
    const daily = this.dailyForecast();
    return daily.length ? daily[0].sunrise : null;
  });

  readonly todaySunset = computed(() => {
    const daily = this.dailyForecast();
    return daily.length ? daily[0].sunset : null;
  });

  /** Returns the next 24 hours of hourly data from current time */
  readonly next24Hours = computed(() => {
    const hourly = this.hourlyForecast();
    const now = new Date();
    const currentHourStr = now.toISOString().slice(0, 13);
    const startIndex = hourly.findIndex(h => h.time >= currentHourStr);
    if (startIndex === -1) return hourly.slice(0, 24);
    return hourly.slice(startIndex, startIndex + 24);
  });

  readonly hasData = computed(() => this.currentWeather() !== null);

  // === EFFECTS (side effects) ===

  constructor() {
    // Persist last selected location to localStorage
    effect(() => {
      const location = this.selectedLocation();
      if (location) {
        this.storage.set(STORAGE_KEY_LOCATION, location);
      }
    });

    // Apply weather theme to the document
    effect(() => {
      const theme = this.weatherTheme();
      document.documentElement.setAttribute('data-weather', theme);
    });
  }

  // === ACTIONS ===

  loadWeather(location: GeoLocation): void {
    this.selectedLocation.set(location);
    this.isLoading.set(true);
    this.error.set(null);

    this.weatherService
      .fetchWeatherData(location.latitude, location.longitude)
      .subscribe({
        next: (data: WeatherData) => {
          this.currentWeather.set(data.current);
          this.hourlyForecast.set(data.hourly);
          this.dailyForecast.set(data.daily);
          this.airQuality.set(data.airQuality);
          this.isLoading.set(false);
        },
        error: (err: WeatherError) => {
          this.error.set(err);
          this.isLoading.set(false);
        },
      });
  }

  loadWeatherByCoords(lat: number, lon: number, name: string = 'Current Location'): void {
    const location: GeoLocation = {
      id: 0,
      name,
      latitude: lat,
      longitude: lon,
      country: '',
      countryCode: '',
    };
    this.loadWeather(location);
  }

  /** Loads the last used location from localStorage */
  loadLastLocation(): GeoLocation | null {
    return this.storage.get<GeoLocation>(STORAGE_KEY_LOCATION);
  }

  clearError(): void {
    this.error.set(null);
  }
}
