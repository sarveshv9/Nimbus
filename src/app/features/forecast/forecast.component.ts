import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { WeatherStore } from '../../core/state/weather.store';
import { SettingsStore } from '../../core/state/settings.store';
import { WeatherIcon } from '../../shared/components/weather-icon/weather-icon.component';
import { WindSpeedPipe } from '../../shared/pipes/wind-speed.pipe';
import { TemperaturePipe } from '../../shared/pipes/temperature.pipe';
import { getWeatherMeta } from '../../core/models/weather.model';

@Component({
  selector: 'nimbus-forecast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, WeatherIcon, WindSpeedPipe, TemperaturePipe],
  template: `
    @if (weather.isLoading() && !weather.hasData()) {
      <div class="loading-state">Loading...</div>
    } @else {
      <div class="forecast-page">
        <!-- Top Blue Card -->
        <div class="hero-blue-card">
          <header class="top-nav">
            <button class="nav-btn" routerLink="/" aria-label="Back">
              <i class="ph ph-caret-left" style="font-size: 28px;"></i>
            </button>
            <div class="page-header">
              <i class="ph ph-calendar-blank" style="font-size: 20px;"></i>
              <span>7 days</span>
            </div>
            <button class="nav-btn" aria-label="Options">
              <i class="ph ph-dots-three" style="font-size: 28px;"></i>
            </button>
          </header>

          <div class="tomorrow-info">
            <h2 class="tomorrow-title">Tomorrow</h2>
            <div class="tomorrow-weather">
              <nimbus-weather-icon [weatherCode]="tomorrow()?.weatherCode" [size]="100" />
              <div class="tomorrow-temp-group">
                <span class="tomorrow-high">{{ tomorrow()?.tempMax | temperature:'value' }}</span>
                <span class="tomorrow-low">/{{ tomorrow()?.tempMin | temperature }}</span>
              </div>
            </div>
            <p class="tomorrow-condition">{{ getWeatherMeta(tomorrow()?.weatherCode).label }}</p>
          </div>

          <div class="hero-stats">
            <div class="hero-stat">
              <i class="ph ph-wind stat-icon" style="font-size: 24px;"></i>
              <span class="stat-val">{{ tomorrow()?.windSpeedMax | windSpeed }}</span>
              <span class="stat-lbl">Wind</span>
            </div>
            <div class="hero-stat">
              <i class="ph ph-drop stat-icon" style="font-size: 24px;"></i>
              <span class="stat-val">50%</span>
              <span class="stat-lbl">Humidity</span>
            </div>
            <div class="hero-stat">
              <i class="ph ph-cloud-rain stat-icon" style="font-size: 24px;"></i>
              <span class="stat-val">{{ tomorrow()?.precipitationProbabilityMax ?? 0 }}%</span>
              <span class="stat-lbl">Chance of rain</span>
            </div>
          </div>
        </div>

        <!-- Dark Bottom List -->
        <div class="forecast-list">
          @for (day of sevenDays(); track day.date) {
            <div class="forecast-item">
              <span class="forecast-day">{{ formatDayShort(day.date) }}</span>
              <div class="forecast-condition">
                <nimbus-weather-icon [weatherCode]="day.weatherCode" [size]="24" />
                <span class="forecast-cond-text">{{ getWeatherMeta(day.weatherCode).label }}</span>
              </div>
              <div class="forecast-temps">
                <span class="forecast-high">{{ day.tempMax | temperature }}</span>
                <span class="forecast-low">{{ day.tempMin | temperature }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .forecast-page {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--bg-primary); /* Deep dark background */
      color: var(--text-primary);
      animation: fadeIn var(--duration-normal) var(--ease-decel);
    }

    .hero-blue-card {
      background: var(--gradient-blue);
      border-bottom-left-radius: 40px;
      border-bottom-right-radius: 40px;
      padding: var(--space-6) var(--space-6) var(--space-8) var(--space-6);
      display: flex;
      flex-direction: column;
      color: #FFFFFF;
      box-shadow: inset 0 -20px 40px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.3);
    }

    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-6);
    }

    .nav-btn {
      color: #FFFFFF;
      opacity: 0.9;
      padding: var(--space-2);
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
    }

    .tomorrow-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: var(--space-4) 0 var(--space-8) 0;
    }

    .tomorrow-title {
      font-size: var(--text-lg);
      font-weight: var(--weight-medium);
      opacity: 0.9;
      margin-bottom: var(--space-4);
    }

    .tomorrow-weather {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      margin-bottom: var(--space-2);
    }

    .tomorrow-temp-group {
      display: flex;
      align-items: baseline;
    }

    .tomorrow-high {
      font-family: var(--font-display);
      font-size: 72px;
      font-weight: var(--weight-bold);
      letter-spacing: -2px;
      line-height: 1;
    }

    .tomorrow-low {
      font-size: 28px;
      font-weight: var(--weight-medium);
      opacity: 0.7;
      margin-left: 4px;
    }

    .tomorrow-condition {
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      opacity: 0.9;
    }

    .hero-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 var(--space-4);
      position: relative;
    }

    .hero-stats::before {
      content: '';
      position: absolute;
      top: -20px;
      left: 10%;
      right: 10%;
      height: 1px;
      background: rgba(255, 255, 255, 0.2);
    }

    .hero-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-icon {
      opacity: 0.8;
      margin-bottom: 2px;
    }

    .stat-val {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
    }

    .stat-lbl {
      font-size: 10px;
      opacity: 0.7;
    }

    .forecast-list {
      padding: var(--space-8) var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .forecast-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-2) 0;
    }

    .forecast-day {
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      width: 50px;
    }

    .forecast-condition {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex: 1;
      justify-content: flex-start;
      margin-left: var(--space-4);
    }

    .forecast-cond-text {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .forecast-temps {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100px;
      justify-content: flex-end;
    }

    .forecast-high {
      font-size: var(--text-base);
      font-weight: var(--weight-bold);
    }

    .forecast-low {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
  `]
})
export class ForecastComponent {
  readonly weather = inject(WeatherStore);
  readonly settings = inject(SettingsStore);
  readonly getWeatherMeta = getWeatherMeta;

  readonly tomorrow = computed(() => {
    const daily = this.weather.dailyForecast();
    return daily.length > 1 ? daily[1] : daily[0];
  });

  readonly sevenDays = computed(() => {
    return this.weather.dailyForecast();
  });

  formatDayShort(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
}
