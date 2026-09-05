import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, viewChild } from '@angular/core';
import { Skeleton } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, switchMap, distinctUntilChanged, takeUntil, catchError, of } from 'rxjs';
import { WeatherStore } from '../../core/state/weather.store';
import { LocationStore } from '../../core/state/location.store';
import { GeocodingService } from '../../core/services/geocoding.service';
import { GeoLocation, formatLocationName } from '../../core/models/location.model';

@Component({
  selector: 'nimbus-explore',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Skeleton],
  template: `
    <div class="explore-page">
      <div class="glass-header" style="padding-top: var(--space-4); padding-bottom: var(--space-10);">
        <!-- Top Navigation -->
        <nav class="top-nav">
          <a routerLink="/" class="nav-btn" aria-label="Back">
            <i class="ph-bold ph-caret-left" style="font-size: 28px;"></i>
          </a>
          <div class="location-header">
            <h1 class="page-title">Search</h1>
          </div>
          <div class="nav-btn" style="opacity: 0">
            <i class="ph-bold ph-caret-left" style="font-size: 28px;"></i>
          </div>
        </nav>

        <!-- Search Input -->
        <div class="search-container">
          <div class="search-input-wrapper glass-pill-input">
            <i class="ph-bold ph-magnifying-glass search-icon" style="font-size: 20px;"></i>
            <input
              #searchInput
              type="text"
              class="search-input"
              placeholder="Search for a city..."
              [value]="query()"
              (input)="onInput($event)"
              (keydown)="onKeyDown($event)"
              aria-label="Search for a city"
              autocomplete="off"
            />
            @if (query().length > 0) {
              <button class="clear-btn" (click)="clearSearch()" aria-label="Clear search" tabindex="0">
                <i class="ph-bold ph-x" style="font-size: 16px;"></i>
              </button>
            }
          </div>
        </div>
      </div>

      <div class="page-content">

        <!-- Search Results -->
        @if (isSearching()) {
          <div class="skeleton-list" aria-live="polite">
            <nimbus-skeleton width="100%" height="70px" radius="md" />
            <nimbus-skeleton width="100%" height="70px" radius="md" />
            <nimbus-skeleton width="100%" height="70px" radius="md" />
          </div>
        } @else if (query().length === 1) {
          <div class="search-status" aria-live="polite">
            <i class="ph ph-keyboard" style="font-size: 24px; color: var(--text-muted); opacity: 0.5;"></i>
            <span>Type at least 2 letters to search</span>
          </div>
        } @else if (searchError()) {
          <div class="empty-state" aria-live="polite">
            <i class="ph ph-warning-circle" style="font-size: 48px; color: var(--danger); margin-bottom: 16px;"></i>
            <h3 style="margin: 0; font-size: 20px; font-weight: 800;">Search Unavailable</h3>
            <p style="opacity: 0.7; font-size: 14px; margin: 0;">Unable to connect to the search service.</p>
          </div>
        } @else if (query().length > 1 && results().length === 0) {
          <div class="empty-state" aria-live="polite">
            <i class="ph ph-map-pin" style="font-size: 48px; color: var(--text-muted); opacity: 0.5;"></i>
            <h3 style="margin: 0; font-size: 20px; font-weight: 800;">No locations found</h3>
            <p style="opacity: 0.7; font-size: 14px; margin: 0;">Check the spelling or try a different city for "{{ query() }}"</p>
          </div>
        } @else if (results().length > 0) {
          <section class="animated-section">
            <h2 class="section-label">Results</h2>
            <div class="locations-list" role="listbox">
              @for (result of results(); track result.id; let i = $index) {
                <button class="result-item" role="option" [attr.aria-selected]="selectedResultIndex() === i" [class.active]="selectedResultIndex() === i" (click)="selectLocation(result)">
                  <div class="result-info">
                    <span class="result-name">{{ result.name }}</span>
                    <span class="result-region">
                      {{ result.admin1 ? result.admin1 + ', ' : '' }}{{ result.country }}
                      @if (result.population) {
                        <span class="population-dot">•</span> {{ formatPopulation(result.population) }}
                      }
                    </span>
                  </div>
                  @if (locationStore.isLocationSaved(result.id)) {
                    <i class="ph-fill ph-star saved-indicator"></i>
                  }
                </button>
              }
            </div>
          </section>
        }

        <!-- Recent & Saved (Show when not searching) -->
        @if (query().length === 0) {
          @if (locationStore.recentSearches().length > 0) {
            <section class="animated-section">
              <div class="section-header">
                <h2 class="section-label">Recent Searches</h2>
                <button class="text-btn" (click)="locationStore.clearRecentSearches()">Clear All</button>
              </div>
              <div class="locations-list" role="listbox">
                @for (location of locationStore.recentSearches(); track location.id) {
                  <button class="result-item" role="option" (click)="selectLocation(location)">
                    <div class="result-info">
                      <span class="result-name">{{ location.name }}</span>
                      <span class="result-region">
                        {{ location.admin1 ? location.admin1 + ', ' : '' }}{{ location.country }}
                        @if (location.population) {
                          <span class="population-dot">•</span> {{ formatPopulation(location.population) }}
                        }
                      </span>
                    </div>
                    <div class="result-actions" (click)="$event.stopPropagation()">
                      <button class="clear-recent-btn" (click)="locationStore.removeRecentSearch(location.id)" aria-label="Remove recent search">
                        <i class="ph ph-x"></i>
                      </button>
                    </div>
                  </button>
                }
              </div>
            </section>
          }

          @if (locationStore.hasSavedLocations()) {
            <section class="animated-section">
              <h2 class="section-label">Saved Locations</h2>
              <div class="locations-list" role="listbox">
                @for (location of locationStore.savedLocations(); track location.id) {
                  <button class="result-item" role="option" (click)="selectLocation(location)">
                    <div class="result-info">
                      <span class="result-name">{{ location.name }}</span>
                      <span class="result-region">
                        {{ location.admin1 ? location.admin1 + ', ' : '' }}{{ location.country }}
                        @if (location.population) {
                          <span class="population-dot">•</span> {{ formatPopulation(location.population) }}
                        }
                      </span>
                    </div>
                    <i class="ph-fill ph-star saved-indicator"></i>
                  </button>
                }
              </div>
            </section>
          }
          
          @if (locationStore.recentSearches().length === 0 && !locationStore.hasSavedLocations()) {
            <section class="animated-section">
              <h2 class="section-label">Popular Cities</h2>
              <div class="locations-list" role="listbox">
                @for (location of popularCities; track location.id) {
                  <button class="result-item" role="option" (click)="selectLocation(location)">
                    <div class="result-info">
                      <span class="result-name">{{ location.name }}</span>
                      <span class="result-region">
                        {{ location.admin1 ? location.admin1 + ', ' : '' }}{{ location.country }}
                        <span class="population-dot">•</span> {{ formatPopulation(location.population || 0) }}
                      </span>
                    </div>
                  </button>
                }
              </div>
            </section>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .explore-page {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: transparent;
      color: var(--text-primary);
      animation: fadeIn var(--duration-normal) var(--ease-decel);
    }
    
    .glass-header {
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-subtle);
    }

    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-6);
    }

    .nav-btn {
      color: var(--text-primary);
      opacity: 0.7;
      padding: var(--space-2);
      cursor: pointer;
    }

    .page-title {
      font-size: var(--text-xl);
      font-weight: 900;
      color: var(--text-primary);
    }

    .page-content {
      padding: var(--space-6) var(--space-6) var(--space-8) var(--space-6);
    }

    /* Search Input Styles */
    .search-container {
      margin: 0 var(--space-4);
    }
    .search-input-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-2) 0;
      transition: all 0.3s ease;
    }
    .glass-pill-input {
      background: var(--bg-glass);
      border-radius: var(--radius-full);
      padding: 12px 24px;
      border: 1px solid var(--border-glass);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }
    .search-icon {
      color: var(--text-muted);
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    .search-input-wrapper:focus-within .search-icon {
      color: var(--text-primary);
    }
    .search-input {
      flex: 1;
      font-size: 24px;
      font-weight: 800;
      color: var(--text-primary);
      background: transparent;
      border: none;
      outline: none;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
    }
    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.7);
      font-weight: 700;
    }
    .clear-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--border-subtle);
      border: none;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .clear-btn:hover {
      background: var(--border-default);
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
      color: var(--text-secondary);
      font-size: 16px;
      font-weight: 600;
    }
    .search-spinner {
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      margin-top: var(--space-4);
      animation: fadeIn var(--duration-fast) ease-in-out;
    }
    
    .locations-list {
      display: flex;
      flex-direction: column;
    }
    .result-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--space-5) 0;
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--border-default);
      cursor: pointer;
      transition: transform 0.2s ease;
      text-align: left;
      color: inherit;
    }
    .result-item:last-child {
      border-bottom: none;
    }
    .result-item:hover, .result-item.active {
      transform: translateX(4px);
    }
    .result-item.active {
      background: rgba(128, 128, 128, 0.1);
      border-radius: var(--radius-md);
      padding-left: var(--space-4);
      padding-right: var(--space-4);
    }
    .result-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .result-name {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }
    .result-region {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .population-dot {
      margin: 0 4px;
      opacity: 0.5;
    }
    .clear-recent-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--text-muted);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .clear-recent-btn:hover {
      background: rgba(255, 0, 0, 0.1);
      color: var(--danger);
    }

    /* Sections */
    section.animated-section {
      margin-bottom: var(--space-6);
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }
    .section-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
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

    .saved-indicator {
      color: var(--warning);
      font-size: var(--text-lg);
      filter: drop-shadow(0 0 4px rgba(255, 200, 0, 0.4));
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--space-8);
      color: var(--text-primary);
      gap: 16px;
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
  readonly searchError = signal(false);
  readonly selectedResultIndex = signal<number>(-1);
  
  readonly popularCities: GeoLocation[] = [
    { id: 2643743, name: 'London', latitude: 51.5085, longitude: -0.1257, country: 'United Kingdom', countryCode: 'GB', admin1: 'England', population: 8982000, timezone: 'Europe/London' },
    { id: 5128581, name: 'New York', latitude: 40.7143, longitude: -74.006, country: 'United States', countryCode: 'US', admin1: 'New York', population: 8399000, timezone: 'America/New_York' },
    { id: 1850147, name: 'Tokyo', latitude: 35.6895, longitude: 139.6917, country: 'Japan', countryCode: 'JP', admin1: 'Tokyo', population: 13929286, timezone: 'Asia/Tokyo' },
    { id: 2147714, name: 'Sydney', latitude: -33.8678, longitude: 151.2073, country: 'Australia', countryCode: 'AU', admin1: 'New South Wales', population: 5312163, timezone: 'Australia/Sydney' }
  ];

  formatPopulation(pop: number): string {
    if (pop >= 1000000) return (pop / 1000000).toFixed(1) + 'M';
    if (pop >= 1000) return (pop / 1000).toFixed(1) + 'k';
    return pop.toString();
  }

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
        this.searchError.set(false);
        this.isSearching.set(true);
        return this.geocodingService.search(query).pipe(
          catchError(() => {
            this.searchError.set(true);
            return of([]);
          })
        );
      }),
      takeUntil(this.destroy),
    ).subscribe(results => {
      this.results.set(results);
      this.selectedResultIndex.set(-1);
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
    this.selectedResultIndex.set(-1);
    this.searchError.set(false);
    this.searchSubject.next('');
    this.searchInput()?.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    const res = this.results();
    if (res.length === 0) return;
    
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedResultIndex.update(i => i < res.length - 1 ? i + 1 : i);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedResultIndex.update(i => i > 0 ? i - 1 : i);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const idx = this.selectedResultIndex();
      if (idx >= 0 && idx < res.length) {
        this.selectLocation(res[idx]);
      }
    }
  }

  selectLocation(location: GeoLocation): void {
    this.weatherStore.loadWeather(location);
    this.locationStore.addRecentSearch(location);
    this.router.navigate(['/']);
  }
}
