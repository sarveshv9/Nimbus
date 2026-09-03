import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, switchMap, distinctUntilChanged, takeUntil, catchError, of } from 'rxjs';
import { WeatherStore } from '../../core/state/weather.store';
import { LocationStore } from '../../core/state/location.store';
import { GeocodingService } from '../../core/services/geocoding.service';
import { GeoLocation, formatLocationName } from '../../core/models/location.model';

@Component({
  selector: 'nimbus-explore',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="explore-page">
      <div [class]="'hero-theme-card hero-theme-card--' + weatherStore.weatherTheme()" style="padding-top: var(--space-4); padding-bottom: var(--space-10);">
        <!-- Top Navigation -->
        <nav class="top-nav">
          <a routerLink="/" class="nav-btn" aria-label="Back">
            <i class="ph ph-caret-left" style="font-size: 28px;"></i>
          </a>
          <div class="location-header">
            <h1 class="page-title">Search</h1>
          </div>
          <div class="nav-btn" style="opacity: 0">
            <i class="ph ph-caret-left" style="font-size: 28px;"></i>
          </div>
        </nav>

        <!-- Search Input -->
        <div class="search-container">
          <div class="search-input-wrapper">
            <i class="ph ph-magnifying-glass search-icon" style="font-size: 20px;"></i>
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
                <i class="ph ph-x" style="font-size: 16px;"></i>
              </button>
            }
          </div>
        </div>
      </div>

      <div class="page-content">

        <!-- Search Results -->
        @if (isSearching()) {
          <div class="search-status">
            <i class="ph ph-spinner search-spinner" style="font-size: 24px; color: var(--accent);"></i>
            <span>Searching...</span>
          </div>
        } @else if (searchError()) {
          <div class="search-status">
            <i class="ph ph-warning-circle" style="font-size: 32px; color: var(--danger); margin-bottom: 8px;"></i>
            <span>Unable to connect to search service.</span>
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
                    <span class="result-region">{{ result.admin1 ? result.admin1 + ', ' : '' }}{{ result.country }}</span>
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
            <section>
              <div class="section-header">
                <h2 class="section-label">Recent Searches</h2>
                <button class="text-btn" (click)="locationStore.clearRecentSearches()">Clear</button>
              </div>
              <div class="locations-list">
                @for (location of locationStore.recentSearches(); track location.id) {
                  <button class="result-item" (click)="selectLocation(location)">
                    <div class="result-info">
                      <span class="result-name">{{ location.name }}</span>
                      <span class="result-region">{{ location.admin1 ? location.admin1 + ', ' : '' }}{{ location.country }}</span>
                    </div>
                    <i class="ph ph-clock-counter-clockwise" style="font-size: 20px; color: var(--text-muted);"></i>
                  </button>
                }
              </div>
            </section>
          }

          @if (locationStore.hasSavedLocations()) {
            <section>
              <h2 class="section-label">Saved Locations</h2>
              <div class="locations-list">
                @for (location of locationStore.savedLocations(); track location.id) {
                  <button class="result-item" (click)="selectLocation(location)">
                    <div class="result-info">
                      <span class="result-name">{{ location.name }}</span>
                      <span class="result-region">{{ location.admin1 ? location.admin1 + ', ' : '' }}{{ location.country }}</span>
                    </div>
                    <i class="ph-fill ph-star saved-indicator"></i>
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
      background: var(--bg-primary);
      color: var(--text-primary);
      animation: fadeIn var(--duration-normal) var(--ease-decel);
    }

    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-6);
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

    /* Search Input Styles */
    .search-container {
      margin-bottom: 0;
    }
    .search-input-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-2) 0;
      border-bottom: 2px solid rgba(26, 26, 26, 0.2);
      transition: border-color 0.3s ease;
    }
    .search-input-wrapper:focus-within {
      border-bottom-color: #1A1A1A;
    }
    .search-icon {
      color: rgba(26, 26, 26, 0.6);
      flex-shrink: 0;
    }
    .search-input-wrapper:focus-within .search-icon {
      color: #1A1A1A;
    }
    .search-input {
      flex: 1;
      font-size: 32px;
      font-weight: 800;
      color: #1A1A1A;
      background: transparent;
      border: none;
      outline: none;
      letter-spacing: -1px;
    }
    .search-input::placeholder {
      color: rgba(26, 26, 26, 0.4);
      font-weight: 800;
    }
    .clear-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--border-subtle);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
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
    .result-item:hover {
      transform: translateX(4px);
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

    /* Sections */
    section {
      margin-bottom: var(--space-6);
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
    this.searchError.set(false);
    this.searchSubject.next('');
    this.searchInput()?.nativeElement.focus();
  }

  selectLocation(location: GeoLocation): void {
    this.weatherStore.loadWeather(location);
    this.locationStore.addRecentSearch(location);
    this.router.navigate(['/']);
  }
}
