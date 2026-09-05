import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { WeatherStore } from '../../core/state/weather.store';
import { SettingsStore } from '../../core/state/settings.store';
import { WeatherIcon } from '../../shared/components/weather-icon/weather-icon.component';
import { WindSpeedPipe } from '../../shared/pipes/wind-speed.pipe';
import { Skeleton } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { TemperaturePipe } from '../../shared/pipes/temperature.pipe';
import { getWeatherMeta } from '../../core/models/weather.model';
import { GlassCard } from '../../shared/components/glass-card/glass-card.component';

@Component({
  selector: 'nimbus-forecast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CommonModule, WeatherIcon, WindSpeedPipe, TemperaturePipe, Skeleton, DatePipe, GlassCard],
  template: `
    @if (weather.isLoading() && !weather.hasData()) {
      <div class="forecast-page" style="background: var(--bg-primary); color: var(--text-primary);">
        <div class="hero-theme-card">
          <header class="top-nav">
            <div class="nav-btn"><nimbus-skeleton width="24px" height="24px" radius="full" /></div>
            <nimbus-skeleton width="80px" height="20px" radius="full" />
            <div class="nav-btn"><nimbus-skeleton width="24px" height="24px" radius="full" /></div>
          </header>
          <div class="tomorrow-info">
            <nimbus-skeleton width="100px" height="20px" class="mb-4" />
            <div class="tomorrow-weather">
              <nimbus-skeleton width="100px" height="100px" radius="full" />
              <nimbus-skeleton width="80px" height="60px" />
            </div>
          </div>
          <div class="hero-stats">
            <div class="hero-stat"><nimbus-skeleton width="48px" height="48px" /></div>
            <div class="hero-stat"><nimbus-skeleton width="48px" height="48px" /></div>
            <div class="hero-stat"><nimbus-skeleton width="48px" height="48px" /></div>
          </div>
        </div>
      </div>
    } @else if (weather.error() && !weather.hasData()) {
      <div class="forecast-page empty-container" style="justify-content: center; padding: var(--space-6);">
        <nimbus-glass-card style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; border: 1px solid rgba(255, 0, 0, 0.1);">
          <i class="ph-bold ph-warning-circle text-danger" style="font-size: 64px; opacity: 0.8; color: var(--danger);"></i>
          <h3 style="margin: 0; font-size: 20px; font-weight: 800;">Failed to load forecast</h3>
          <p class="error-message" style="opacity: 0.7; font-size: 14px; margin: 0;">{{ weather.error()?.message || 'Please check your connection and try again.' }}</p>
          <button class="search-btn" (click)="weather.refreshCurrentLocation()">Try Again</button>
        </nimbus-glass-card>
      </div>
    } @else if (sevenDays().length === 0) {
      <div class="forecast-page empty-container" style="justify-content: center; padding: var(--space-6);">
        <nimbus-glass-card style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px;">
          <i class="ph-bold ph-calendar-blank text-muted" style="font-size: 64px; opacity: 0.5;"></i>
          <h3 style="margin: 0; font-size: 20px; font-weight: 800;">No Forecast Available</h3>
          <p style="opacity: 0.7; font-size: 14px; margin: 0;">We couldn't retrieve the 7-day forecast for this location.</p>
        </nimbus-glass-card>
      </div>
    } @else {
      <div class="forecast-page">
        <!-- Top Blue Card -->
        <div [class]="'hero-theme-card hero-theme-card--' + weather.weatherTheme()">
          <header class="top-nav">
            <button class="nav-btn" routerLink="/" aria-label="Back">
              <i class="ph-bold ph-caret-left" style="font-size: 28px;"></i>
            </button>
            <div class="page-header" style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="ph-bold ph-calendar-blank" style="font-size: 20px;"></i>
                <span>7 days</span>
              </div>
              @if (weather.lastFetchedAt()) {
                <div style="font-size: 10px; opacity: 0.7; font-weight: 500; display: flex; align-items: center;">
                  <i class="ph-bold ph-arrows-clockwise" style="margin-right: 4px;"></i>
                  Updated {{ timeAgo(weather.lastFetchedAt()) }}
                  @if (weather.isShowingCachedData()) {
                    <span style="color: var(--warning); margin-left: 4px;">(Offline)</span>
                  }
                </div>
              }
            </div>
            <button class="nav-btn" aria-label="Options">
              <i class="ph-bold ph-dots-three" style="font-size: 28px;"></i>
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
              <i class="ph-bold ph-wind stat-icon" style="font-size: 24px;"></i>
              <span class="stat-val">{{ tomorrow()?.windSpeedMax | windSpeed }}</span>
              <span class="stat-lbl">Wind</span>
            </div>
            <div class="hero-stat">
              <i class="ph-bold ph-sun stat-icon" style="font-size: 24px;"></i>
              <span class="stat-val">{{ tomorrow()?.uvIndexMax }}</span>
              <span class="stat-lbl">Max UV</span>
            </div>
            <div class="hero-stat">
              <i class="ph-bold ph-cloud-rain stat-icon" style="font-size: 24px;"></i>
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
      color: inherit;
      opacity: 0.7;
      padding: var(--space-2);
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: inherit;
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
      opacity: 0.75;
      margin-bottom: var(--space-4);
      color: inherit;
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
      color: inherit;
    }

    .tomorrow-low {
      font-size: 28px;
      font-weight: var(--weight-medium);
      opacity: 0.6;
      margin-left: 4px;
      color: inherit;
    }

    .tomorrow-condition {
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      opacity: 0.85;
      color: inherit;
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
      opacity: 0.8;
      margin-bottom: 2px;
      color: inherit;
    }

    .stat-val {
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      color: inherit;
    }

    .stat-lbl {
      font-size: 10px;
      opacity: 0.7;
      color: inherit;
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

  timeAgo(date: Date | null): string {
    if (!date) return '';
    const diffMs = new Date().getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs === 1) return '1h ago';
    return `${diffHrs}h ago`;
  }

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
