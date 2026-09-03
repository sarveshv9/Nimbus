import { Component, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WeatherStore } from '../../core/state/weather.store';
import { LocationStore } from '../../core/state/location.store';
import { WeatherService } from '../../core/services/weather.service';
import { GeoLocation, formatLocationName } from '../../core/models/location.model';
import { CurrentWeather } from '../../core/models/weather.model';
import { WeatherIcon } from '../../shared/components/weather-icon/weather-icon.component';
import { TemperaturePipe } from '../../shared/pipes/temperature.pipe';

@Component({
  selector: 'nimbus-locations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, WeatherIcon, TemperaturePipe],
  template: `
    <div class="locations-page">
      <!-- Top Navigation -->
      <div [class]="'hero-theme-card hero-theme-card--' + weatherStore.weatherTheme()" style="padding-top: var(--space-4); padding-bottom: var(--space-6);">
        <nav class="top-nav">
          <a routerLink="/" class="nav-btn" aria-label="Back">
            <i class="ph ph-caret-left" style="font-size: 28px;"></i>
          </a>
          <div class="location-header">
            <h1 class="page-title">Saved Locations</h1>
          </div>
          <div class="nav-btn" style="opacity: 0">
            <i class="ph ph-caret-left" style="font-size: 28px;"></i>
          </div>
        </nav>
      </div>

      <div class="page-content">
        @if (locationStore.hasSavedLocations()) {
          <div class="locations-list">
            @for (location of locationStore.savedLocations(); track location.id) {
              <div class="location-card" (click)="selectLocation(location)">
                <div class="location-info">
                  <h3 class="location-name">{{ location.name }}</h3>
                  <p class="location-region">{{ formatLocation(location) }}</p>
                </div>

                <div class="weather-info">
                  @if (locationWeather()[location.id]; as weather) {
                    <div class="weather-temp font-display">{{ weather.temperature | temperature }}</div>
                    <div class="weather-icon-wrapper">
                      <nimbus-weather-icon [weatherCode]="weather.weatherCode" [isDay]="weather.isDay" [size]="48" />
                    </div>
                  } @else {
                    <div class="loading-pulse"></div>
                  }
                </div>

                <button class="remove-btn" (click)="removeLocation($event, location.id)" aria-label="Remove location">
                  <i class="ph ph-x" style="font-size: 14px;"></i>
                </button>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <i class="ph ph-map-pin" style="font-size: 48px; color: var(--text-muted); opacity: 0.5;"></i>
            <h3>No saved locations yet</h3>
            <p>Search for a city and save it to quickly access its weather.</p>
            <a routerLink="/explore" class="search-btn">Search Now</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .locations-page {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--bg-primary);
      color: var(--text-primary);
      animation: fadeIn var(--duration-normal) var(--ease-decel);
    }

    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .nav-btn {
      color: #1A1A1A;
      opacity: 0.7;
      padding: var(--space-2);
      cursor: pointer;
    }

    .page-title {
      font-size: var(--text-xl);
      font-weight: 900;
      color: #1A1A1A;
    }

    .page-content {
      padding: var(--space-6) var(--space-6) var(--space-8) var(--space-6);
    }

    .locations-list {
      display: flex;
      flex-direction: column;
    }

    .location-card {
      position: relative;
      background: transparent;
      padding: var(--space-6) 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-default);
      cursor: pointer;
      transition: transform var(--duration-fast) var(--ease-default);
    }

    .location-card:last-child {
      border-bottom: none;
    }

    .location-card:hover {
      transform: translateX(4px);
    }

    .location-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 1;
    }

    .location-name {
      font-size: 32px;
      font-weight: 900;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -1px;
    }

    .location-region {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      margin: 0;
    }

    .weather-info {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      z-index: 1;
      padding-right: var(--space-10); /* Make room for remove button */
    }

    .weather-temp {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 40px;
      font-weight: 900;
      color: var(--text-primary);
      letter-spacing: -2px;
    }

    .weather-icon-wrapper {
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
    }

    .remove-btn {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--border-subtle);
      color: var(--text-muted);
      border: none;
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
      z-index: 10;
    }

    .remove-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: var(--danger);
    }

    .loading-pulse {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--border-default);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 0.5; }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-12) var(--space-6);
      color: var(--text-secondary);
      height: 60vh;
    }

    .empty-state i {
      font-size: 64px;
      margin-bottom: var(--space-6);
      opacity: 0.3;
    }

    .empty-state h3 {
      font-size: 32px;
      font-weight: 900;
      color: var(--text-primary);
      margin-bottom: var(--space-3);
      letter-spacing: -1px;
      line-height: 1.1;
    }

    .empty-state p {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: var(--space-8);
      max-width: 280px;
      line-height: 1.5;
    }

    .primary-btn {
      background: var(--accent);
      color: var(--bg-primary);
      border: none;
      border-radius: var(--radius-full);
      padding: var(--space-3) var(--space-8);
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
    }

    .primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
    }
  `],
})
export class LocationsComponent implements OnInit {
  private readonly router = inject(Router);
  readonly weatherStore = inject(WeatherStore);
  private readonly weatherService = inject(WeatherService);
  readonly locationStore = inject(LocationStore);
  readonly formatLocation = formatLocationName;

  readonly locationWeather = signal<Record<number, CurrentWeather>>({});

  ngOnInit() {
    this.fetchWeatherForSavedLocations();
  }

  private fetchWeatherForSavedLocations() {
    const saved = this.locationStore.savedLocations();
    saved.forEach(location => {
      this.weatherService.fetchCurrentWeatherOnly(location.latitude, location.longitude)
        .subscribe(weather => {
          this.locationWeather.update(current => ({
            ...current,
            [location.id]: weather
          }));
        });
    });
  }

  selectLocation(location: GeoLocation): void {
    this.weatherStore.loadWeather(location);
    this.router.navigate(['/']);
  }

  removeLocation(event: Event, locationId: number): void {
    event.stopPropagation();
    this.locationStore.removeLocation(locationId);
    
    // Remove weather entry for the deleted location
    this.locationWeather.update(current => {
      const updated = { ...current };
      delete updated[locationId];
      return updated;
    });
  }
}
