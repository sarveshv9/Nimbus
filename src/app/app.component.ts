import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherStore } from './core/state/weather.store';
import { SettingsStore } from './core/state/settings.store';
import { LocationStore } from './core/state/location.store';
import { LocationService } from './core/services/location.service';
import { WeatherEffectsComponent } from './layout/weather-effects/weather-effects.component';

@Component({
  selector: 'nimbus-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    WeatherEffectsComponent,
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
      </div>
    </div>
  `,
  styleUrl: './app.component.css',
})
export class App implements OnInit {
  readonly weatherStore = inject(WeatherStore);
  readonly settingsStore = inject(SettingsStore);
  private readonly locationStore = inject(LocationStore);
  private readonly locationService = inject(LocationService);

  ngOnInit(): void {
    this.initWeather();
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
        this.weatherStore.loadWeatherByCoords(pos.latitude, pos.longitude);
      },
      error: () => {
        this.weatherStore.setGeolocationError('Location access denied');
      },
    });
  }
}
