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
        <!-- Top bar -->
        <header class="app-header">
          <div class="header-inner">
            <a routerLink="/" class="logo" aria-label="Nimbus home">
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="var(--accent)" opacity="0.15"/>
                <path d="M18 38 C18 38 16 28 26 26 C30 20 42 20 44 26 C50 26 52 32 50 36 C52 38 50 42 46 42 L20 42 C16 42 14 40 18 38 Z"
                      fill="var(--accent)" opacity="0.9"/>
              </svg>
              <span class="logo-text">Nimbus</span>
            </a>
            <div class="header-actions">
              <button
                class="icon-btn"
                (click)="toggleSearch()"
                aria-label="Search locations"
                title="Search (⌘K)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Router outlet -->
        <main class="app-main">
          <router-outlet />
        </main>

        <!-- Bottom navigation (mobile) -->
        <nav class="bottom-nav" aria-label="Main navigation">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" aria-label="Home">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Home</span>
          </a>
          <a routerLink="/explore" routerLinkActive="active" aria-label="Explore">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>Explore</span>
          </a>
          <a routerLink="/forecast" routerLinkActive="active" aria-label="Forecast">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            <span>Forecast</span>
          </a>
          <a routerLink="/details" routerLinkActive="active" aria-label="Details">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            <span>Details</span>
          </a>
          <a routerLink="/locations" routerLinkActive="active" aria-label="Saved locations">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
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
