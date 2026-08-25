import { Component, output, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, viewChild } from '@angular/core';
import { Subject, debounceTime, switchMap, distinctUntilChanged, takeUntil } from 'rxjs';
import { GeocodingService } from '../../../../core/services/geocoding.service';
import { WeatherStore } from '../../../../core/state/weather.store';
import { LocationStore } from '../../../../core/state/location.store';
import { GeoLocation, formatLocationName } from '../../../../core/models/location.model';
import { WeatherIcon } from '../../../../shared/components/weather-icon/weather-icon.component';

@Component({
  selector: 'nimbus-search-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-overlay" (click)="onBackdropClick($event)" role="dialog" aria-modal="true" aria-label="Search locations">
      <div class="search-panel" role="combobox" aria-expanded="true" aria-haspopup="listbox">
        <div class="search-header">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            #searchInput
            type="text"
            class="search-input"
            placeholder="Search cities..."
            [value]="query()"
            (input)="onInput($event)"
            (keydown)="onKeydown($event)"
            aria-label="Search for a city"
            aria-autocomplete="list"
            [attr.aria-activedescendant]="activeIndex() >= 0 ? 'search-result-' + activeIndex() : null"
            autocomplete="off"
          />
          <div class="search-shortcut">
            <kbd>ESC</kbd>
          </div>
        </div>

        <div class="search-body" role="listbox" id="search-results-list">
          @if (isSearching()) {
            <div class="search-status">
              <div class="search-spinner"></div>
              <span>Searching...</span>
            </div>
          } @else if (query().length > 0 && results().length === 0 && !isSearching()) {
            <div class="search-status">
              <span>No locations found for "{{ query() }}"</span>
            </div>
          } @else if (results().length > 0) {
            <div class="results-section">
              <div class="section-label">Results</div>
              @for (result of results(); track result.id; let i = $index) {
                <button
                  class="result-item"
                  [class.active]="i === activeIndex()"
                  [id]="'search-result-' + i"
                  role="option"
                  [attr.aria-selected]="i === activeIndex()"
                  (click)="selectLocation(result)"
                  (mouseenter)="activeIndex.set(i)"
                >
                  <svg class="result-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div class="result-text">
                    <span class="result-name">{{ result.name }}</span>
                    <span class="result-region">{{ formatLocation(result) }}</span>
                  </div>
                  @if (locationStore.isLocationSaved(result.id)) {
                    <span class="saved-badge" aria-label="Saved">★</span>
                  }
                </button>
              }
            </div>
          }

          @if (query().length === 0 && locationStore.recentSearches().length > 0) {
            <div class="results-section">
              <div class="section-label">Recent</div>
              @for (recent of locationStore.recentSearches(); track recent.id; let i = $index) {
                <button
                  class="result-item"
                  [class.active]="i === activeIndex()"
                  role="option"
                  (click)="selectLocation(recent)"
                  (mouseenter)="activeIndex.set(i)"
                >
                  <svg class="result-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div class="result-text">
                    <span class="result-name">{{ recent.name }}</span>
                    <span class="result-region">{{ formatLocation(recent) }}</span>
                  </div>
                </button>
              }
              <button class="clear-recent" (click)="locationStore.clearRecentSearches()">
                Clear recent searches
              </button>
            </div>
          }
        </div>

        <div class="search-footer">
          <span class="hint"><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span class="hint"><kbd>↵</kbd> Select</span>
          <span class="hint"><kbd>ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-overlay {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 12vh;
      background: var(--bg-overlay);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      animation: fadeIn var(--duration-fast) var(--ease-default);
    }

    .search-panel {
      width: min(560px, 92vw);
      background: var(--bg-surface-solid);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl), 0 0 80px rgba(0,0,0,0.15);
      overflow: hidden;
      animation: scaleIn var(--duration-normal) var(--ease-bounce);
    }

    .search-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--border-subtle);
    }

    .search-icon {
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      font-size: var(--text-lg);
      color: var(--text-primary);
      background: transparent;
      border: none;
      outline: none;
    }

    .search-input::placeholder {
      color: var(--text-muted);
    }

    .search-shortcut kbd {
      display: inline-block;
      padding: 2px 6px;
      font-size: var(--text-xs);
      font-family: var(--font-body);
      color: var(--text-muted);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
    }

    .search-body {
      max-height: 400px;
      overflow-y: auto;
      padding: var(--space-2);
    }

    .search-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-8);
      color: var(--text-muted);
      font-size: var(--text-sm);
    }

    .search-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid var(--border-default);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .results-section {
      padding: var(--space-2);
    }

    .section-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: var(--space-2) var(--space-3);
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      padding: var(--space-3) var(--space-3);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background var(--duration-instant) var(--ease-default);
      text-align: left;
      background: transparent;
      border: none;
      color: inherit;
      font: inherit;
    }

    .result-item:hover,
    .result-item.active {
      background: var(--bg-surface);
    }

    .result-icon {
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .result-text {
      flex: 1;
      min-width: 0;
    }

    .result-name {
      display: block;
      font-weight: var(--weight-medium);
      color: var(--text-primary);
    }

    .result-region {
      display: block;
      font-size: var(--text-sm);
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .saved-badge {
      color: var(--warning);
      font-size: var(--text-sm);
    }

    .clear-recent {
      display: block;
      width: 100%;
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-sm);
      color: var(--text-muted);
      text-align: center;
      background: transparent;
      border: none;
      cursor: pointer;
      border-radius: var(--radius-md);
    }

    .clear-recent:hover {
      color: var(--danger);
      background: var(--bg-surface);
    }

    .search-footer {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-3) var(--space-5);
      border-top: 1px solid var(--border-subtle);
    }

    .hint {
      font-size: var(--text-xs);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .hint kbd {
      display: inline-block;
      padding: 1px 5px;
      font-size: 10px;
      font-family: var(--font-body);
      color: var(--text-muted);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 3px;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .search-overlay {
        align-items: flex-end;
        padding-top: 0;
      }

      .search-panel {
        width: 100%;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        max-height: 85vh;
        animation: slideInUp var(--duration-normal) var(--ease-decel);
      }

      .search-footer {
        display: none;
      }
    }
  `],
})
export class SearchOverlayComponent implements OnInit, OnDestroy {
  readonly closed = output<void>();

  private readonly geocodingService = inject(GeocodingService);
  private readonly weatherStore = inject(WeatherStore);
  readonly locationStore = inject(LocationStore);

  readonly query = signal('');
  readonly results = signal<GeoLocation[]>([]);
  readonly isSearching = signal(false);
  readonly activeIndex = signal(-1);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly searchSubject = new Subject<string>();
  private readonly destroy = new Subject<void>();

  ngOnInit(): void {
    // Focus the input on mount
    setTimeout(() => {
      this.searchInput()?.nativeElement.focus();
    }, 50);

    // RxJS search pipeline: debounce → distinctUntilChanged → switchMap
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
      this.activeIndex.set(results.length > 0 ? 0 : -1);
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

  onKeydown(event: KeyboardEvent): void {
    const results = this.results();
    const recents = this.locationStore.recentSearches();
    const items = results.length > 0 ? results : (this.query().length === 0 ? recents : []);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        const idx = this.activeIndex();
        if (idx >= 0 && idx < items.length) {
          this.selectLocation(items[idx]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closed.emit();
        break;
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('search-overlay')) {
      this.closed.emit();
    }
  }

  selectLocation(location: GeoLocation): void {
    this.locationStore.addRecentSearch(location);
    this.weatherStore.loadWeather(location);
    this.closed.emit();
  }

  formatLocation(loc: GeoLocation): string {
    return formatLocationName(loc);
  }
}
