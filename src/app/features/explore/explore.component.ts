import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, switchMap, distinctUntilChanged, takeUntil } from 'rxjs';
import { WeatherStore } from '../../core/state/weather.store';
import { LocationStore } from '../../core/state/location.store';
import { GeocodingService } from '../../core/services/geocoding.service';
import { GlassCard } from '../../shared/components/glass-card/glass-card.component';
import { GeoLocation, formatLocationName } from '../../core/models/location.model';

@Component({
  selector: 'nimbus-explore',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GlassCard],
  template: `
    <div class="explore-page">
      <header class="page-header">
        <h1 class="page-title font-display">Search</h1>
        <p class="page-subtitle">Find weather for any location</p>
      </header>

      <!-- Search Input -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            #searchInput
            type="text"
            class="search-input"
            placeholder="Search for a city..."
            [value]="query()"
            (input)="onInput($event)"
            aria-label="Search for a city"
            autocomplete="off"
          />
          @if (query().length > 0) {
            <button class="clear-btn" (click)="clearSearch()" aria-label="Clear search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          }
        </div>
      </div>

      <!-- Search Results -->
      @if (isSearching()) {
        <div class="search-status">
          <div class="search-spinner"></div>
          <span>Searching...</span>
        </div>
      } @else if (query().length > 0 && results().length === 0) {
        <div class="search-status">
          <span>No locations found for "{{ query() }}"</span>
        </div>
      } @else if (results().length > 0) {
        <section>
          <h2 class="section-label">Results</h2>
          <div class="locations-list">
            @for (result of results(); track result.id) {
              <button class="result-item" (click)="selectLocation(result)">
                <div class="result-info">
                  <span class="result-name">{{ result.name }}</span>
                  <span class="result-region">{{ formatLocation(result) }}</span>
                </div>
                @if (locationStore.isLocationSaved(result.id)) {
                  <span class="saved-indicator" aria-label="Saved">★</span>
                }
              </button>
            }
          </div>
        </section>
      }

      <!-- Recent & Saved (Show when not searching) -->
      @if (query().length === 0) {
        @if (locationStore.recentSearches().length > 0) {
          <section>
            <div class="section-header">
              <h2 class="section-label">Recent Searches</h2>
              <button class="text-btn" (click)="locationStore.clearRecentSearches()">Clear</button>
            </div>
            <div class="locations-grid">
              @for (location of locationStore.recentSearches(); track location.id) {
                <nimbus-glass-card [interactive]="true" (click)="selectLocation(location)">
                  <div class="location-card">
                    <div class="location-info">
                      <h3 class="location-name">{{ location.name }}</h3>
                      <p class="location-region">{{ formatLocation(location) }}</p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
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
      }
    </div>
  `,
  styles: [`
    .explore-page {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      animation: fadeInUp var(--duration-slow) var(--ease-decel);
    }
    .page-header {
      padding: var(--space-2) 0;
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

    /* Search Input Styles */
    .search-container {
      margin-bottom: var(--space-2);
    }
    .search-input-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-5);
      background: rgba(16, 20, 36, 0.6);
      backdrop-filter: blur(20px) saturate(150%);
      -webkit-backdrop-filter: blur(20px) saturate(150%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-xl);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }
    .search-input-wrapper:focus-within {
      background: rgba(16, 20, 36, 0.8);
      border-color: rgba(var(--accent-rgb), 0.5);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(var(--accent-rgb), 0.5);
    }
    .search-icon {
      color: var(--accent);
      flex-shrink: 0;
    }
    .search-input {
      flex: 1;
      font-size: var(--text-lg);
      font-weight: 500;
      color: var(--text-primary);
      background: transparent;
      border: none;
      outline: none;
    }
    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
      font-weight: 400;
    }
    .clear-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .clear-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: var(--text-primary);
    }

    /* Search Status & Results */
    .search-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      padding: var(--space-8);
      color: var(--text-muted);
      font-size: var(--text-base);
    }
    .search-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s cubic-bezier(0.6, 0.1, 0.4, 0.9) infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .locations-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .result-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--space-4) var(--space-5);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
      color: inherit;
    }
    .result-item:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.1);
      transform: translateX(4px);
    }
    .result-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .result-name {
      font-size: var(--text-base);
      font-weight: 500;
      color: var(--text-primary);
    }
    .result-region {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }

    /* Sections */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }
    .section-label {
      font-size: 12px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0;
    }
    .section-header .section-label {
      margin-bottom: 0;
    }
    section > .section-label {
      margin-bottom: var(--space-4);
    }
    
    .text-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: var(--text-sm);
      cursor: pointer;
      transition: color 0.2s ease;
    }
    .text-btn:hover {
      color: var(--danger);
    }

    /* Grid layout */
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
    .location-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .location-name {
      font-size: var(--text-base);
      font-weight: 500;
      color: var(--text-primary);
      margin: 0;
    }
    .location-region {
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin: 0;
    }
    .saved-indicator {
      color: var(--warning);
      font-size: var(--text-lg);
      filter: drop-shadow(0 0 4px rgba(255, 200, 0, 0.4));
    }
  `],
})
export class ExploreComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly geocodingService = inject(GeocodingService);
  readonly weatherStore = inject(WeatherStore);
  readonly locationStore = inject(LocationStore);
  
  readonly formatLocation = formatLocationName;
  readonly query = signal('');
  readonly results = signal<GeoLocation[]>([]);
  readonly isSearching = signal(false);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly searchSubject = new Subject<string>();
  private readonly destroy = new Subject<void>();

  ngOnInit(): void {
    setTimeout(() => {
      this.searchInput()?.nativeElement.focus();
    }, 100);

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length < 2) {
          this.results.set([]);
          this.isSearching.set(false);
          return [];
        }
        this.isSearching.set(true);
        return this.geocodingService.search(query);
      }),
      takeUntil(this.destroy),
    ).subscribe(results => {
      this.results.set(results);
      this.isSearching.set(false);
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.query.set('');
    this.results.set([]);
    this.searchSubject.next('');
    this.searchInput()?.nativeElement.focus();
  }

  selectLocation(location: GeoLocation): void {
    this.weatherStore.loadWeather(location);
    this.locationStore.addRecentSearch(location);
    this.router.navigate(['/']);
  }
}
