import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  MinutelyForecast,
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
import { GeocodingService } from '../services/geocoding.service';

const STORAGE_KEY_LOCATION = 'nimbus-last-location';

@Injectable({ providedIn: 'root' })
export class WeatherStore {
  private readonly weatherService = inject(WeatherService);
  private readonly storage = inject(StorageService);
  private readonly geocodingService = inject(GeocodingService);
  private fetchSubscription: Subscription | null = null;

  // === PRIMARY STATE (writable signals) ===
  readonly currentWeather = signal<CurrentWeather | null>(null);
  readonly hourlyForecast = signal<HourlyForecast[]>([]);
  readonly dailyForecast = signal<DailyForecast[]>([]);
  readonly minutelyForecast = signal<MinutelyForecast[]>([]);
  readonly airQuality = signal<AirQuality | null>(null);
  readonly selectedLocation = signal<GeoLocation | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<WeatherError | null>(null);
  readonly syncError = signal<string | null>(null);
  readonly lastUpdated = signal<Date | null>(null);
  readonly lastFetchedAt = signal<Date | null>(null);
  readonly isShowingCachedData = signal(false);
  private autoRefreshInterval: any;

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

  readonly nowcastLabel = computed(() => {
    const minutely = this.minutelyForecast();
    if (!minutely || minutely.length === 0) return null;
    
    const now = new Date();
    // Open-Meteo returns time in ISO format local to the requested timezone.
    // So we should format current time similarly (YYYY-MM-DDTHH:mm)
    const tzOffset = now.getTimezoneOffset() * 60000; // in milliseconds
    const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
    
    const upcoming = minutely.filter(m => m.time >= localISOTime).slice(0, 8); // next 2 hours
    if (upcoming.length === 0) return null;

    const currentlyRaining = upcoming[0].precipitation > 0;
    
    if (currentlyRaining) {
      const stopIndex = upcoming.findIndex(m => m.precipitation === 0);
      if (stopIndex === -1) {
        return 'Rain continuing for at least an hour';
      } else {
        const min = stopIndex * 15;
        return `Rain stopping in about ${min} mins`;
      }
    } else {
      const startIndex = upcoming.findIndex(m => m.precipitation > 0);
      if (startIndex === -1) {
        return 'No rain expected in the next hour';
      } else {
        const min = startIndex * 15;
        return `Rain starting in about ${min} mins`;
      }
    }
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

  refreshCurrentLocation(): void {
    const loc = this.selectedLocation();
    if (loc) {
      this.loadWeather(loc);
    }
  }

  loadWeather(location: GeoLocation): void {
    this.selectedLocation.set(location);
    this.isLoading.set(true);
    this.error.set(null);
    this.syncError.set(null);

    this.lastFetchedAt.set(new Date());

    const cacheKey = `nimbus-weather-${location.latitude.toFixed(4)}-${location.longitude.toFixed(4)}`;
    const cached = this.storage.get<WeatherData>(cacheKey);
    if (cached) {
      this.currentWeather.set(cached.current);
      this.hourlyForecast.set(cached.hourly);
      this.dailyForecast.set(cached.daily);
      if (cached.minutely15) this.minutelyForecast.set(cached.minutely15);
      this.airQuality.set(cached.airQuality);
      this.isShowingCachedData.set(true);
    } else {
      this.isShowingCachedData.set(false);
    }

    if (this.fetchSubscription) {
      this.fetchSubscription.unsubscribe();
    }

    this.fetchSubscription = this.weatherService
      .fetchWeatherData(location.latitude, location.longitude)
      .subscribe({
        next: (data: WeatherData) => {
          this.currentWeather.set(data.current);
          this.hourlyForecast.set(data.hourly);
          this.dailyForecast.set(data.daily);
          if (data.minutely15) this.minutelyForecast.set(data.minutely15);
          this.airQuality.set(data.airQuality);
          this.storage.set(cacheKey, data);
          this.lastUpdated.set(new Date());
          this.isLoading.set(false);
          this.isShowingCachedData.set(false);
          this.startAutoRefresh();
        },
        error: (err: WeatherError) => {
          if (!cached) {
            this.error.set(err);
            this.isShowingCachedData.set(false);
          } else {
            this.syncError.set('Background sync failed. Showing cached data.');
            this.isShowingCachedData.set(true);
          }
          this.isLoading.set(false);
        },
      });
  }

  loadWeatherByCoords(lat: number, lon: number): void {
    this.isLoading.set(true);
    this.geocodingService.reverseGeocode(lat, lon).subscribe(loc => {
      // Create a unique ID using coordinates for geolocated places to avoid id collisions
      const generatedId = Math.abs(Math.floor(lat * 1000) + Math.floor(lon * 1000));
      const fullLocation: GeoLocation = {
        id: generatedId,
        name: loc.name || 'Current Location',
        latitude: lat,
        longitude: lon,
        country: loc.country || '',
        countryCode: loc.countryCode || '',
        admin1: loc.admin1,
      };
      this.loadWeather(fullLocation);
    });
  }

  /** Loads the last used location from localStorage */
  loadLastLocation(): GeoLocation | null {
    return this.storage.get<GeoLocation>(STORAGE_KEY_LOCATION);
  }

  clearError(): void {
    this.error.set(null);
  }

  private startAutoRefresh(): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    // Auto refresh every 15 minutes
    this.autoRefreshInterval = setInterval(() => {
      this.refreshCurrentLocation();
    }, 15 * 60 * 1000);
  }
}
