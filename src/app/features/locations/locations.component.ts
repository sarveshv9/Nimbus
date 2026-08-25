import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { WeatherStore } from '../../core/state/weather.store';
import { LocationStore } from '../../core/state/location.store';
import { GlassCard } from '../../shared/components/glass-card/glass-card.component';
import { GeoLocation, formatLocationName } from '../../core/models/location.model';

@Component({
  selector: 'nimbus-locations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GlassCard],
  template: `
    <div class="locations-page">
      <header class="page-header">
        <h1 class="page-title font-display">Saved Locations</h1>
        <p class="page-subtitle">Your favorite places</p>
      </header>

      @if (locationStore.hasSavedLocations()) {
        <div class="locations-list">
          @for (location of locationStore.savedLocations(); track location.id) {
            <nimbus-glass-card>
              <div class="location-item">
                <button class="location-main" (click)="selectLocation(location)">
                  <div class="location-info">
                    <h3 class="location-name">{{ location.name }}</h3>
                    <p class="location-region">{{ formatLocation(location) }}</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
                <button
                  class="remove-btn"
                  (click)="removeLocation(location.id)"
                  [attr.aria-label]="'Remove ' + location.name"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
            </nimbus-glass-card>
          }
        </div>
      } @else {
        <nimbus-glass-card>
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            <h3>No saved locations yet</h3>
            <p>Search for a city and save it to quickly access its weather.</p>
          </div>
        </nimbus-glass-card>
      }
    </div>
  `,
  styles: [`
    .locations-page {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      animation: fadeInUp var(--duration-slow) var(--ease-decel);
    }
    .page-header { padding: var(--space-4) 0; }
    .page-title { font-size: var(--text-3xl); font-weight: var(--weight-bold); color: var(--text-primary); }
    .page-subtitle { font-size: var(--text-base); color: var(--text-muted); margin-top: var(--space-1); }

    .locations-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .location-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .location-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      gap: var(--space-3);
      padding: 0;
      background: transparent;
      border: none;
      cursor: pointer;
      text-align: left;
      color: inherit;
    }
    .location-name {
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }
    .location-region {
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin-top: 2px;
    }
    .remove-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      color: var(--text-muted);
      transition: all var(--duration-fast) var(--ease-default);
      flex-shrink: 0;
    }
    .remove-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      text-align: center;
      padding: var(--space-12);
    }
    .empty-state h3 {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }
    .empty-state p {
      font-size: var(--text-sm);
      color: var(--text-muted);
      max-width: 300px;
    }
  `],
})
export class LocationsComponent {
  private readonly router = inject(Router);
  private readonly weatherStore = inject(WeatherStore);
  readonly locationStore = inject(LocationStore);
  readonly formatLocation = formatLocationName;

  selectLocation(location: GeoLocation): void {
    this.weatherStore.loadWeather(location);
    this.router.navigate(['/']);
  }

  removeLocation(locationId: number): void {
    this.locationStore.removeLocation(locationId);
  }
}
