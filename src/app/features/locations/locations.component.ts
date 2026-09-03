import { Component, inject, ChangeDetectionStrategy, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { catchError, forkJoin, of, tap } from 'rxjs';
import { WeatherStore } from '../../core/state/weather.store';
import { LocationStore } from '../../core/state/location.store';
import { WeatherService } from '../../core/services/weather.service';
import { GeoLocation, formatLocationName } from '../../core/models/location.model';
import { CurrentWeather, getWeatherMeta } from '../../core/models/weather.model';
import { WeatherIcon } from '../../shared/components/weather-icon/weather-icon.component';
import { TemperaturePipe } from '../../shared/pipes/temperature.pipe';

interface LocationWeatherState {
  weather?: CurrentWeather;
  error?: boolean;
}

@Component({
  selector: 'nimbus-locations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CommonModule, FormsModule, DragDropModule, WeatherIcon, TemperaturePipe, DatePipe],
  template: `
    <div class="locations-page">
      <!-- Top Navigation -->
      <div [class]="'hero-theme-card hero-theme-card--' + weatherStore.weatherTheme()" style="padding-top: var(--space-4); padding-bottom: var(--space-4);">
        <nav class="top-nav">
          <a routerLink="/" class="nav-btn" aria-label="Back">
            <i class="ph ph-caret-left" style="font-size: 28px;"></i>
          </a>
          <div class="location-header">
            <h1 class="page-title">Saved Locations</h1>
          </div>
          <button class="nav-btn" (click)="refreshAll()" aria-label="Refresh all">
            <i class="ph ph-arrows-clockwise" [class.spin]="isRefreshing()" style="font-size: 24px;"></i>
          </button>
        </nav>
        
        @if (locationStore.hasSavedLocations()) {
          <div class="search-bar-container">
            <i class="ph ph-magnifying-glass search-icon"></i>
            <input 
              type="text" 
              class="search-input" 
              placeholder="Filter locations..." 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)"
            />
          </div>
        }
      </div>

      <div class="page-content">
        @if (lastUpdated()) {
          <div class="last-updated-text">
            Last updated {{ lastUpdated() | date:'shortTime' }}
          </div>
        }

        @if (showUndoToast()) {
          <div class="toast-notification">
            <span>Location removed</span>
            <button class="undo-btn" (click)="undoRemove()">Undo</button>
          </div>
        }

        @if (locationStore.hasSavedLocations()) {
          @if (isRefreshing() && !lastUpdated()) {
            <div class="global-loading">
              <div class="loading-pulse"></div>
              <span>Fetching latest weather...</span>
            </div>
          } @else {
            <div class="locations-list" 
                 cdkDropList 
                 [cdkDropListData]="filteredLocations()"
                 (cdkDropListDropped)="drop($event)">
              @for (location of filteredLocations(); track location.id) {
                <div class="location-card" cdkDrag (click)="selectLocation(location)" [class.swiped]="swipedLocationId() === location.id">
                  
                  <div class="card-content-wrapper" 
                       (touchstart)="onTouchStart($event, location.id)"
                       (touchmove)="onTouchMove($event)"
                       (touchend)="onTouchEnd()">
                    
                    <div class="drag-handle" cdkDragHandle (click)="$event.stopPropagation()">
                      <i class="ph ph-dots-six-vertical"></i>
                    </div>

                    <div class="location-info">
                      <div class="location-title-row">
                        <h3 class="location-name">{{ location.name }}</h3>
                        @if (isCurrentActive(location.id)) {
                          <i class="ph-fill ph-map-pin active-indicator" title="Currently viewing"></i>
                        }
                      </div>
                      <p class="location-region">{{ formatLocation(location) }}</p>
                    </div>

                    <div class="weather-info">
                      @if (locationWeather()[location.id]?.weather; as weather) {
                        <div class="weather-metrics">
                          <span class="weather-temp font-display">{{ weather.temperature | temperature }}</span>
                          <span class="weather-condition">{{ getWeatherMeta(weather.weatherCode).label }}</span>
                        </div>
                        <nimbus-weather-icon [weatherCode]="weather.weatherCode" [isDay]="weather.isDay" [size]="48" />
                      } @else if (locationWeather()[location.id]?.error) {
                        <div class="error-state" (click)="$event.stopPropagation(); retryLocation(location)">
                          <i class="ph ph-warning-circle text-danger"></i>
                          <span class="retry-text">Retry</span>
                        </div>
                      } @else {
                        <div class="loading-pulse-small"></div>
                      }
                    </div>
                  </div>

                  <!-- Swipe actions hidden underneath -->
                  <div class="swipe-actions">
                    <button class="action-btn set-home-btn" (click)="$event.stopPropagation(); setHome(location.id)">
                      <i class="ph ph-house"></i>
                    </button>
                    <button class="action-btn delete-btn" (click)="$event.stopPropagation(); removeLocation(location)">
                      <i class="ph ph-trash"></i>
                    </button>
                  </div>
                </div>
              }
              
              @if (filteredLocations().length === 0) {
                <div class="no-results">No locations match "{{ searchQuery() }}"</div>
              }
            </div>
          }
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
      background: var(--bg-surface);
      color: var(--text-primary);
      animation: fadeIn var(--duration-normal) var(--ease-decel);
      overflow-x: hidden;
    }

    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
      padding: 0 var(--space-4);
    }

    .nav-btn {
      color: inherit;
      opacity: 0.8;
      padding: var(--space-2);
      cursor: pointer;
      background: transparent;
      border: none;
    }
    
    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    .page-title {
      font-size: var(--text-xl);
      font-weight: 900;
      color: inherit;
    }

    .search-bar-container {
      margin: 0 var(--space-4);
      position: relative;
    }
    
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: inherit;
      opacity: 0.6;
      font-size: 18px;
    }

    .search-input {
      width: 100%;
      padding: 10px 16px 10px 40px;
      border-radius: var(--radius-full);
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.2);
      color: inherit;
      font-size: var(--text-sm);
      outline: none;
    }
    .search-input::placeholder { color: rgba(255,255,255,0.6); }
    .search-input:focus { border-color: rgba(255,255,255,0.5); }

    .page-content {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    
    .last-updated-text {
      font-size: var(--text-xs);
      color: var(--text-muted);
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: var(--space-2);
    }

    .locations-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .location-card {
      position: relative;
      border-radius: var(--radius-2xl);
      background: var(--bg-card);
      box-shadow: var(--shadow-sm);
      overflow: hidden; /* for swipe */
      transition: box-shadow 0.2s ease;
    }
    .location-card:active {
      box-shadow: none;
    }
    
    /* Drag & Drop */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: var(--radius-2xl);
      box-shadow: 0 15px 30px rgba(0,0,0,0.15);
      background: var(--bg-card);
      z-index: 1000;
      opacity: 0.9;
    }
    .cdk-drag-placeholder {
      opacity: 0.2;
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .card-content-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      background: var(--bg-card);
      position: relative;
      z-index: 2;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      cursor: pointer;
    }
    
    .location-card.swiped .card-content-wrapper {
      transform: translateX(-120px);
    }

    .drag-handle {
      cursor: grab;
      padding: var(--space-2);
      margin-left: -8px;
      margin-right: 4px;
      color: var(--text-muted);
      font-size: 20px;
    }
    .drag-handle:active {
      cursor: grabbing;
    }

    .location-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .location-title-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .location-name {
      font-size: 22px;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.5px;
    }
    
    .active-indicator {
      color: var(--accent);
      font-size: 16px;
    }

    .location-region {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      margin: 0;
    }

    .weather-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    
    .weather-metrics {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .weather-temp {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 32px;
      font-weight: 900;
      color: var(--text-primary);
      letter-spacing: -1.5px;
      line-height: 1;
    }
    
    .weather-condition {
      font-size: 11px;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-2);
      border-radius: var(--radius-md);
      background: rgba(239, 68, 68, 0.1);
    }
    .retry-text {
      font-size: 10px;
      font-weight: 700;
      color: var(--danger);
      text-transform: uppercase;
      margin-top: 2px;
    }

    .loading-pulse-small {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--border-default);
      animation: pulse 1s infinite;
    }

    .swipe-actions {
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      display: flex;
      z-index: 1;
    }
    
    .action-btn {
      width: 60px;
      height: 100%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #FFF;
      cursor: pointer;
    }
    .set-home-btn { background: var(--warning); }
    .delete-btn { background: var(--danger); }

    .global-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-12) 0;
      gap: var(--space-4);
      color: var(--text-muted);
    }
    .loading-pulse {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--border-default);
      animation: pulse 1s infinite;
    }
    @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }

    .no-results {
      text-align: center;
      padding: var(--space-8);
      color: var(--text-muted);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-12) var(--space-6);
      color: var(--text-secondary);
      height: 50vh;
    }

    .empty-state i {
      font-size: 64px;
      margin-bottom: var(--space-6);
      opacity: 0.3;
    }

    .empty-state h3 {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: var(--space-3);
    }

    .empty-state p {
      font-size: 14px;
      margin-bottom: var(--space-8);
      max-width: 250px;
    }

    .search-btn {
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: var(--radius-full);
      padding: var(--space-3) var(--space-8);
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    /* Toast */
    .toast-notification {
      position: fixed;
      bottom: var(--space-8);
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-card);
      border: var(--card-border);
      padding: 10px 16px 10px 20px;
      border-radius: 30px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 16px;
      font-weight: var(--weight-medium);
      font-size: var(--text-sm);
      z-index: 1000;
      animation: toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .undo-btn {
      background: rgba(255,255,255,0.1);
      border: none;
      color: var(--accent);
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 16px;
      cursor: pointer;
    }
    
    @keyframes toastIn {
      from { opacity: 0; transform: translate(-50%, 20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
  `],
})
export class LocationsComponent implements OnInit {
  private readonly router = inject(Router);
  readonly weatherStore = inject(WeatherStore);
  private readonly weatherService = inject(WeatherService);
  readonly locationStore = inject(LocationStore);
  readonly formatLocation = formatLocationName;

  readonly locationWeather = signal<Record<number, LocationWeatherState>>({});
  readonly isRefreshing = signal(false);
  readonly lastUpdated = signal<Date | null>(null);
  readonly searchQuery = signal('');
  readonly getWeatherMeta = getWeatherMeta;
  
  // Swipe State
  readonly swipedLocationId = signal<number | null>(null);
  private touchStartX = 0;
  private currentTouchId: number | null = null;
  
  // Undo State
  readonly showUndoToast = signal(false);
  private pendingRemoval: GeoLocation | null = null;
  private undoTimeout: any;

  readonly filteredLocations = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const locs = this.locationStore.savedLocations();
    if (!query) return locs;
    return locs.filter(l => l.name.toLowerCase().includes(query) || (l.admin1 && l.admin1.toLowerCase().includes(query)));
  });

  ngOnInit() {
    this.refreshAll();
  }

  refreshAll() {
    if (this.isRefreshing() || !this.locationStore.hasSavedLocations()) return;
    this.isRefreshing.set(true);
    
    const saved = this.locationStore.savedLocations();
    const requests = saved.map(location => 
      this.weatherService.fetchCurrentWeatherOnly(location.latitude, location.longitude).pipe(
        tap(weather => {
          this.locationWeather.update(current => ({ ...current, [location.id]: { weather } }));
        }),
        catchError(() => {
          this.locationWeather.update(current => ({ ...current, [location.id]: { error: true } }));
          return of(null);
        })
      )
    );

    forkJoin(requests).subscribe(() => {
      this.isRefreshing.set(false);
      this.lastUpdated.set(new Date());
    });
  }

  retryLocation(location: GeoLocation) {
    this.locationWeather.update(current => ({ ...current, [location.id]: {} })); // set to loading
    this.weatherService.fetchCurrentWeatherOnly(location.latitude, location.longitude).pipe(
      catchError(() => {
        this.locationWeather.update(current => ({ ...current, [location.id]: { error: true } }));
        return of(null);
      })
    ).subscribe(weather => {
      if (weather) {
        this.locationWeather.update(current => ({ ...current, [location.id]: { weather } }));
      }
    });
  }

  selectLocation(location: GeoLocation): void {
    if (this.swipedLocationId() !== null) {
      this.swipedLocationId.set(null); // Close swipe on tap
      return;
    }
    this.weatherStore.loadWeather(location);
    this.router.navigate(['/']);
  }

  drop(event: CdkDragDrop<any[]>) {
    // Only reorder if indices are different
    if (event.previousIndex !== event.currentIndex) {
      this.locationStore.reorderLocations(event.previousIndex, event.currentIndex);
    }
  }
  
  isCurrentActive(id: number): boolean {
    return this.weatherStore.selectedLocation()?.id === id;
  }

  setHome(id: number) {
    this.swipedLocationId.set(null);
    // Ideally this updates settingsStore.setDefaultLocationOnLaunch(id)
    // For now we just select it
    const loc = this.locationStore.savedLocations().find(l => l.id === id);
    if (loc) {
      this.selectLocation(loc);
    }
  }

  removeLocation(location: GeoLocation): void {
    this.swipedLocationId.set(null);
    this.pendingRemoval = location;
    this.locationStore.removeLocation(location.id);
    
    // Show Toast
    this.showUndoToast.set(true);
    clearTimeout(this.undoTimeout);
    this.undoTimeout = setTimeout(() => {
      this.showUndoToast.set(false);
      this.pendingRemoval = null;
    }, 4000);
  }
  
  undoRemove(): void {
    if (this.pendingRemoval) {
      this.locationStore.saveLocation(this.pendingRemoval);
      this.showUndoToast.set(false);
      this.pendingRemoval = null;
      clearTimeout(this.undoTimeout);
    }
  }

  // --- SWIPE LOGIC ---
  onTouchStart(event: TouchEvent, id: number) {
    this.touchStartX = event.touches[0].clientX;
    this.currentTouchId = id;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.currentTouchId) return;
    const currentX = event.touches[0].clientX;
    const diff = this.touchStartX - currentX;
    
    if (diff > 40) {
      this.swipedLocationId.set(this.currentTouchId);
    } else if (diff < -40) {
      this.swipedLocationId.set(null);
    }
  }

  onTouchEnd() {
    this.currentTouchId = null;
  }
}
