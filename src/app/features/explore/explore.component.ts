import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { WeatherStore } from '../../core/state/weather.store';
import { LocationStore } from '../../core/state/location.store';
import { GlassCard } from '../../shared/components/glass-card/glass-card.component';
import { GeoLocation, formatLocationName } from '../../core/models/location.model';

@Component({
  selector: 'nimbus-explore',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GlassCard],
  template: `
    <div class="explore-page">
      <header class="page-header">
        <h1 class="page-title font-display">Explore</h1>
        <p class="page-subtitle">Discover weather across the world</p>
      </header>

      @if (locationStore.recentSearches().length > 0) {
        <section>
          <h2 class="section-label">Recent Searches</h2>
          <div class="locations-grid">
            @for (location of locationStore.recentSearches(); track location.id) {
              <nimbus-glass-card [interactive]="true" (click)="selectLocation(location)">
                <div class="location-card">
                  <div class="location-info">
                    <h3 class="location-name">{{ location.name }}</h3>
                    <p class="location-region">{{ formatLocation(location) }}</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              </nimbus-glass-card>
            }
          </div>
        </section>
      }

      @if (locationStore.hasSavedLocations()) {
        <section>
          <h2 class="section-label">Saved Locations</h2>
          <div class="locations-grid">
            @for (location of locationStore.savedLocations(); track location.id) {
              <nimbus-glass-card [interactive]="true" (click)="selectLocation(location)">
                <div class="location-card">
                  <div class="location-info">
                    <h3 class="location-name">{{ location.name }}</h3>
                    <p class="location-region">{{ formatLocation(location) }}</p>
                  </div>
                  <span class="saved-indicator">★</span>
                </div>
              </nimbus-glass-card>
            }
          </div>
        </section>
      }

      <section class="explore-cta">
        <nimbus-glass-card>
          <div class="cta-content">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <h3>Search for any city</h3>
            <p>Press <kbd>⌘K</kbd> or tap the search icon to find weather anywhere in the world.</p>
          </div>
        </nimbus-glass-card>
      </section>
    </div>
  `,
  styles: [`
    .explore-page {
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
      animation: fadeInUp var(--duration-slow) var(--ease-decel);
    }
    .page-header {
      padding: var(--space-4) 0;
    }
    .page-title {
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      color: var(--text-primary);
    }
    .page-subtitle {
      font-size: var(--text-base);
      color: var(--text-muted);
      margin-top: var(--space-1);
    }
    .section-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--space-4);
    }
    .locations-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }
    @media (min-width: 768px) {
      .locations-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .location-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
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
    .saved-indicator {
      color: var(--warning);
      font-size: var(--text-lg);
    }
    .cta-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      text-align: center;
      padding: var(--space-6);
    }
    .cta-content h3 {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }
    .cta-content p {
      font-size: var(--text-sm);
      color: var(--text-muted);
      max-width: 360px;
    }
    .cta-content kbd {
      display: inline-block;
      padding: 2px 6px;
      font-size: var(--text-xs);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
    }
  `],
})
export class ExploreComponent {
  private readonly router = inject(Router);
  readonly weatherStore = inject(WeatherStore);
  readonly locationStore = inject(LocationStore);
  readonly formatLocation = formatLocationName;

  selectLocation(location: GeoLocation): void {
    this.weatherStore.loadWeather(location);
    this.locationStore.addRecentSearch(location);
    this.router.navigate(['/']);
  }
}
