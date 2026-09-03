import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WeatherStore } from '../../core/state/weather.store';
import { SettingsStore } from '../../core/state/settings.store';
import { TemperaturePipe } from '../../shared/pipes/temperature.pipe';
import { WindSpeedPipe } from '../../shared/pipes/wind-speed.pipe';
import { WeatherIcon } from '../../shared/components/weather-icon/weather-icon.component';
import {
  windDirectionLabel,
  uvIndexLabel,
  visibilityLabel,
  pressureLabel,
} from '../../core/models/settings.model';
import { getAqiCategory, getWeatherMeta } from '../../core/models/weather.model';

@Component({
  selector: 'nimbus-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TemperaturePipe, WindSpeedPipe, WeatherIcon, RouterLink],
  template: `
    @if (weather.isLoading() && !weather.hasData()) {
      <div class="loading-state">Loading...</div>
    } @else {
      <div class="details-page">
        <!-- Top Blue Card -->
        <div class="hero-blue-card">
          <header class="top-nav">
            <button class="nav-btn" routerLink="/" aria-label="Back">
              <i class="ph ph-caret-left" style="font-size: 28px;"></i>
            </button>
            <div class="page-header">
              <i class="ph ph-thermometer-simple" style="font-size: 20px;"></i>
              <span>Details</span>
            </div>
            <button class="nav-btn" style="opacity: 0" aria-hidden="true">
              <i class="ph ph-caret-left" style="font-size: 28px;"></i>
            </button>
          </header>

          @if (weather.currentWeather(); as current) {
            <div class="hero-summary">
              <div class="hero-weather-row">
                <nimbus-weather-icon [weatherCode]="current.weatherCode" [size]="90" [isDay]="current.isDay" />
                <div class="hero-temp-group">
                  <span class="hero-temp-val">{{ current.temperature | temperature:'value' }}</span>
                  <span class="hero-temp-deg">°</span>
                </div>
              </div>

              <h2 class="hero-condition">{{ getWeatherMeta(current.weatherCode).label }}</h2>
              <p class="hero-location-name">{{ locationName }}</p>

              @if (weather.todayHighLow(); as hl) {
                <div class="hero-high-low">
                  <span class="hl-badge"><i class="ph ph-arrow-up"></i> H: {{ hl.high | temperature }}</span>
                  <span class="hl-badge"><i class="ph ph-arrow-down"></i> L: {{ hl.low | temperature }}</span>
                </div>
              }
            </div>

            <div class="hero-stats">
              <div class="hero-stat">
                <i class="ph ph-wind stat-icon" style="font-size: 24px;"></i>
                <span class="stat-val">{{ current.windSpeed | windSpeed }}</span>
                <span class="stat-lbl">Wind</span>
              </div>
              <div class="hero-stat">
                <i class="ph ph-drop stat-icon" style="font-size: 24px;"></i>
                <span class="stat-val">{{ current.humidity }}%</span>
                <span class="stat-lbl">Humidity</span>
              </div>
              <div class="hero-stat">
                <i class="ph ph-cloud-rain stat-icon" style="font-size: 24px;"></i>
                <span class="stat-val">{{ weather.next24Hours()[0]?.precipitationProbability ?? 0 }}%</span>
                <span class="stat-lbl">Chance of rain</span>
              </div>
            </div>
          }
        </div>

        <!-- Bottom Dark Section -->
        <div class="details-bottom">
          <div class="details-section-header">
            <h2 class="details-section-title">Weather Breakdown</h2>
          </div>

          @if (weather.currentWeather(); as current) {
            <div class="metrics-grid">

              <!-- Feels Like -->
              <div class="metric-card">
                <div class="metric-header">
                  <i class="ph ph-thermometer" style="font-size: 18px;"></i>
                  <span class="metric-title">Feels Like</span>
                </div>
                <div class="metric-value font-display">{{ current.feelsLike | temperature }}</div>
                <div class="metric-desc">{{ weather.feelsLikeLabel() }}</div>
              </div>

              <!-- Sunrise & Sunset -->
              <div class="metric-card">
                <div class="metric-header">
                  <i class="ph ph-sun-horizon" style="font-size: 18px;"></i>
                  <span class="metric-title">Sunrise</span>
                </div>
                <div class="metric-value font-display">{{ formatSunTime(weather.todaySunrise()) }}</div>
                <div class="metric-desc">Sunset: {{ formatSunTime(weather.todaySunset()) }}</div>
              </div>

              <!-- Wind Speed -->
              <div class="metric-card">
                <div class="metric-header">
                  <i class="ph ph-wind" style="font-size: 18px;"></i>
                  <span class="metric-title">Wind</span>
                </div>
                <div class="metric-value font-display">{{ current.windSpeed | windSpeed }}</div>
                <div class="metric-desc">{{ windDirectionLabel(current.windDirection) }} ({{ current.windDirection }}°) • Gusts {{ current.windGusts | windSpeed }}</div>
              </div>

              <!-- Humidity -->
              <div class="metric-card">
                <div class="metric-header">
                  <i class="ph ph-drop" style="font-size: 18px;"></i>
                  <span class="metric-title">Humidity</span>
                </div>
                <div class="metric-value font-display">{{ current.humidity }}%</div>
                <div class="metric-desc">{{ humidityDescription(current.humidity) }}</div>
              </div>

              <!-- Rain / Precipitation -->
              <div class="metric-card">
                <div class="metric-header">
                  <i class="ph ph-cloud-rain" style="font-size: 18px;"></i>
                  <span class="metric-title">Precipitation</span>
                </div>
                <div class="metric-value font-display">{{ weather.next24Hours()[0]?.precipitationProbability ?? 0 }}%</div>
                <div class="metric-desc">
                  @if (current.precipitation > 0) {
                    {{ current.precipitation }} mm expected
                  } @else {
                    No rain expected
                  }
                </div>
              </div>

              <!-- Pressure -->
              <div class="metric-card">
                <div class="metric-header">
                  <i class="ph ph-gauge" style="font-size: 18px;"></i>
                  <span class="metric-title">Pressure</span>
                </div>
                <div class="metric-value font-display">{{ current.pressure }} <span class="metric-unit">hPa</span></div>
                <div class="metric-desc">{{ pressureLabel(current.pressure) }}</div>
              </div>

              <!-- Visibility -->
              <div class="metric-card">
                <div class="metric-header">
                  <i class="ph ph-eye" style="font-size: 18px;"></i>
                  <span class="metric-title">Visibility</span>
                </div>
                <div class="metric-value font-display">{{ (current.visibility / 1000).toFixed(0) }} <span class="metric-unit">km</span></div>
                <div class="metric-desc">{{ visibilityLabel(current.visibility) }}</div>
              </div>

              <!-- UV Index -->
              <div class="metric-card">
                <div class="metric-header">
                  <i class="ph ph-sun" style="font-size: 18px;"></i>
                  <span class="metric-title">UV Index</span>
                </div>
                <div class="metric-value font-display">{{ current.uvIndex }}</div>
                <div class="metric-desc">{{ uvIndexLabel(current.uvIndex) }}</div>
              </div>

              <!-- Cloud Cover -->
              <div class="metric-card">
                <div class="metric-header">
                  <i class="ph ph-cloud" style="font-size: 18px;"></i>
                  <span class="metric-title">Cloud Cover</span>
                </div>
                <div class="metric-value font-display">{{ current.cloudCover }}%</div>
                <div class="metric-desc">Sky coverage</div>
              </div>

              <!-- Air Quality -->
              @if (weather.airQuality(); as aq) {
                @if (aq.usAqi !== null) {
                  <div class="metric-card">
                    <div class="metric-header">
                      <i class="ph ph-leaf" style="font-size: 18px;"></i>
                      <span class="metric-title">Air Quality</span>
                    </div>
                    <div class="metric-value font-display">{{ aq.usAqi }} <span class="metric-unit">AQI</span></div>
                    <div class="metric-desc">{{ getAqiCategory(aq.usAqi!).label }} @if (aq.pm25 !== null) { • PM2.5: {{ aq.pm25 }} }</div>
                  </div>
                }
              }

            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .details-page {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(180deg, #1E66FF 0%, #1a4fcc 25%, #1a3d8f 50%, #152c5e 75%, #0F121C 100%);
      color: #FFFFFF;
      animation: fadeIn var(--duration-normal) var(--ease-decel);
    }

    /* === TOP BLUE HERO CARD (matching home) === */
    .hero-blue-card {
      background: transparent;
      padding: var(--space-6) var(--space-6) var(--space-8) var(--space-6);
      display: flex;
      flex-direction: column;
      color: #FFFFFF;
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
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
    }

    .hero-summary {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: var(--space-2) 0 var(--space-8) 0;
    }

    .hero-weather-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      margin-bottom: var(--space-2);
    }

    .hero-temp-group {
      display: flex;
      align-items: flex-start;
    }

    .hero-temp-val {
      font-family: var(--font-display);
      font-size: 80px;
      font-weight: var(--weight-bold);
      letter-spacing: -2px;
      line-height: 0.85;
    }

    .hero-temp-deg {
      font-size: 36px;
      font-weight: var(--weight-medium);
      margin-top: -4px;
    }

    .hero-condition {
      font-size: var(--text-2xl);
      font-weight: var(--weight-semibold);
      margin-bottom: 2px;
    }

    .hero-location-name {
      font-size: var(--text-sm);
      opacity: 0.85;
      font-weight: var(--weight-medium);
      margin-bottom: var(--space-3);
    }

    .hero-high-low {
      display: flex;
      gap: var(--space-3);
    }

    .hl-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: var(--weight-semibold);
      letter-spacing: 0.2px;
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

    /* === BOTTOM SECTION (Frosted Glass Cards) === */
    .details-bottom {
      padding: var(--space-6) var(--space-6) var(--space-12) var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .details-section-header {
      margin-bottom: var(--space-1);
    }

    .details-section-title {
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: rgba(255, 255, 255, 0.9);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
    }

    .metric-card {
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: var(--radius-xl);
      padding: var(--space-4) var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .metric-header {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .metric-header i {
      color: rgba(255, 255, 255, 0.6);
    }

    .metric-value {
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      color: #FFFFFF;
      margin-top: var(--space-1);
      line-height: 1.1;
    }

    .metric-unit {
      font-size: var(--text-xs);
      font-weight: var(--weight-normal);
      color: rgba(255, 255, 255, 0.5);
    }

    .metric-desc {
      font-size: var(--text-xs);
      color: rgba(255, 255, 255, 0.7);
      font-weight: var(--weight-medium);
      margin-top: 2px;
      line-height: 1.3;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      color: rgba(255, 255, 255, 0.5);
    }
  `],
})
export class DetailsComponent {
  readonly weather = inject(WeatherStore);
  readonly settings = inject(SettingsStore);

  readonly windDirectionLabel = windDirectionLabel;
  readonly uvIndexLabel = uvIndexLabel;
  readonly visibilityLabel = visibilityLabel;
  readonly pressureLabel = pressureLabel;
  readonly getAqiCategory = getAqiCategory;
  readonly getWeatherMeta = getWeatherMeta;

  get locationName(): string {
    const loc = this.weather.selectedLocation();
    if (!loc) return 'Current Location';
    return loc.admin1 ? `${loc.name}, ${loc.admin1}` : `${loc.name}, ${loc.country}`;
  }

  formatSunTime(time: string | null): string {
    if (!time) return '--:--';
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  humidityDescription(humidity: number): string {
    if (humidity <= 30) return 'Dry air';
    if (humidity <= 60) return 'Comfortable';
    if (humidity <= 80) return 'Humid';
    return 'Very humid';
  }
}
