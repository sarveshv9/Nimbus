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
        <div [class]="'hero-theme-card hero-theme-card--' + weather.weatherTheme()">
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
                <div class="sparkline-container">
                  <div class="sparkline-bar" [style]="getSparklineStyle(day.tempMin, day.tempMax)"></div>
                </div>
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
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: #1A1A1A;
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
      opacity: 0.55;
      margin-bottom: var(--space-4);
      color: #1A1A1A;
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
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 72px;
      font-weight: 900;
      letter-spacing: -3px;
      line-height: 1;
      color: #1A1A1A;
    }

    .tomorrow-low {
      font-size: 28px;
      font-weight: var(--weight-medium);
      opacity: 0.4;
      margin-left: 4px;
      color: #1A1A1A;
    }

    .tomorrow-condition {
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      opacity: 0.6;
      color: #1A1A1A;
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
      background: rgba(26, 26, 26, 0.1);
    }

    .hero-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-icon {
      opacity: 0.5;
      margin-bottom: 2px;
      color: #1A1A1A;
    }

    .stat-val {
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      color: #1A1A1A;
    }

    .stat-lbl {
      font-size: 10px;
      opacity: 0.45;
      color: #1A1A1A;
    }

    .forecast-list {
      padding: var(--space-8) var(--space-6);
      display: flex;
      flex-direction: column;
    }

    .forecast-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) 0;
      border-bottom: 1px solid var(--border-default);
    }

    .forecast-item:last-child {
      border-bottom: none;
    }

    .forecast-day {
      font-size: var(--text-xl);
      font-weight: 800;
      width: 60px;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .forecast-condition {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      flex: 1;
      justify-content: flex-start;
      margin-left: var(--space-6);
    }

    .forecast-cond-text {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text-secondary);
    }

    .forecast-temps {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 150px;
      justify-content: flex-end;
    }

    .sparkline-container {
      width: 60px;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      position: relative;
      overflow: hidden;
    }

    .sparkline-bar {
      height: 100%;
      position: absolute;
      border-radius: 2px;
      background: linear-gradient(90deg, #32d74b, #ff9f0a);
    }

    .forecast-high {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 28px;
      font-weight: 900;
      color: var(--text-primary);
      letter-spacing: -1px;
    }

    .forecast-low {
      font-size: 20px;
      font-weight: 600;
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

  readonly weekExtremes = computed(() => {
    const daily = this.weather.dailyForecast();
    if (daily.length === 0) return { min: 0, max: 0, range: 1 };
    let min = daily[0].tempMin;
    let max = daily[0].tempMax;
    for (const d of daily) {
      if (d.tempMin < min) min = d.tempMin;
      if (d.tempMax > max) max = d.tempMax;
    }
    const range = max - min || 1;
    return { min, max, range };
  });

  getSparklineStyle(dayMin: number, dayMax: number) {
    const ex = this.weekExtremes();
    const leftPercent = ((dayMin - ex.min) / ex.range) * 100;
    const widthPercent = ((dayMax - dayMin) / ex.range) * 100;
    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 5)}%`,
    };
  }

  formatDayShort(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
}
