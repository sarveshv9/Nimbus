import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { WeatherStore } from './core/state/weather.store';
import { SettingsStore } from './core/state/settings.store';
import { LocationStore } from './core/state/location.store';
import { LocationService } from './core/services/location.service';
import { WeatherEffectsComponent } from './layout/weather-effects/weather-effects.component';
import { SearchOverlayComponent } from './features/explore/components/search-overlay/search-overlay.component';

@Component({
  selector: 'nimbus-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    WeatherEffectsComponent,
    SearchOverlayComponent,
  ],
  template: `
    <div class="app-shell" [attr.data-weather]="weatherStore.weatherTheme()">
      <!-- Weather effects background layer -->
      <nimbus-weather-effects
        [weatherTheme]="weatherStore.weatherTheme()"
        [isNight]="weatherStore.isNight()"
      />

      <!-- Main content -->
      <div class="app-content">
        <!-- Router outlet -->
        <main class="app-main">
          <router-outlet />
        </main>

        <!-- Bottom navigation (mobile) — floating pill -->
        <nav class="bottom-nav" aria-label="Main navigation">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" aria-label="Home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Home</span>
          </a>
          <a routerLink="/forecast" routerLinkActive="active" aria-label="Forecast">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            <span>Forecast</span>
          </a>
          <button class="nav-search-btn" (click)="toggleSearch()" aria-label="Search locations" title="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>Search</span>
          </button>
          <a routerLink="/locations" routerLinkActive="active" aria-label="Saved locations">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Saved</span>
          </a>
        </nav>
      </div>

      <!-- Search overlay -->
      @if (searchOpen()) {
        <nimbus-search-overlay (closed)="toggleSearch()" />
      }
    </div>
  `,
  styleUrl: './app.component.css',
})
export class App implements OnInit {
  readonly weatherStore = inject(WeatherStore);
  readonly settingsStore = inject(SettingsStore);
  private readonly locationStore = inject(LocationStore);
  private readonly locationService = inject(LocationService);

  readonly searchOpen = signal(false);

  ngOnInit(): void {
    this.initWeather();
    this.setupKeyboardShortcuts();
  }

  toggleSearch(): void {
    this.searchOpen.update(v => !v);
  }

  private initWeather(): void {
    // Try last saved location first
    const lastLocation = this.weatherStore.loadLastLocation();
    if (lastLocation) {
      this.weatherStore.loadWeather(lastLocation);
      return;
    }

    // Try browser geolocation
    this.locationService.getCurrentPosition().subscribe({
      next: (pos) => {
        this.weatherStore.loadWeatherByCoords(pos.latitude, pos.longitude, 'Current Location');
      },
      error: () => {
        // Default to Mumbai, India
        this.weatherStore.loadWeatherByCoords(19.0760, 72.8777, 'Mumbai');
      },
    });
  }

  private setupKeyboardShortcuts(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggleSearch();
      }
      if (e.key === 'Escape' && this.searchOpen()) {
        this.searchOpen.set(false);
      }
    });
  }
}
