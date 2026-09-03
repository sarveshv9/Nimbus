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
        <div [class]="'hero-theme-card hero-theme-card--' + weather.weatherTheme()">
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
            <div class="hero-weather">
              <div class="hero-icon-container">
                <nimbus-weather-icon [weatherCode]="current.weatherCode" [size]="72" [isDay]="current.isDay" />
              </div>
              
              <h1 class="hero-headline">{{ locationName }}</h1>
              
              <p class="hero-subtitle">
                {{ getWeatherMeta(current.weatherCode).label }} • {{ current.temperature | temperature:'value' }}°
              </p>

              <div class="hero-divider"></div>

              @if (weather.todayHighLow(); as hl) {
                <div class="hero-bottom-bar">
                  <div class="hero-bottom-info">
                    <span class="hero-bottom-label">High: {{ hl.high | temperature }}</span>
                  </div>
                  <div class="hero-bottom-info">
                    <span class="hero-bottom-label">Low: {{ hl.low | temperature }}</span>
                  </div>
                </div>
              }
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
      background: transparent;
      color: var(--text-primary);
      animation: fadeIn var(--duration-normal) var(--ease-decel);
    }

    /* === TOP HERO CARD === */

    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .nav-btn {
      opacity: 0.9;
      padding: var(--space-2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .page-header {
      display: none; /* Hide details header for clean iOS look */
    }

    .hero-weather {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0 var(--space-2);
      margin-bottom: var(--space-4);
      margin-top: var(--space-2);
    }

    .hero-icon-container {
      margin-bottom: var(--space-4);
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));
    }

    .hero-headline {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: clamp(2rem, 7vw, 3rem);
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -0.02em;
      margin: 0;
      margin-bottom: var(--space-4);
      overflow-wrap: break-word;
      word-break: normal;
    }

    .hero-subtitle {
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      opacity: 0.8;
      line-height: 1.5;
      margin: 0;
    }

    .hero-divider {
      width: 100%;
      height: 1px;
      background: currentColor;
      opacity: 0.15;
      margin: var(--space-6) 0 var(--space-4) 0;
    }

    .hero-bottom-bar {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      gap: var(--space-8);
    }

    .hero-bottom-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .hero-bottom-label {
      font-size: 13px;
      font-weight: var(--weight-bold);
      opacity: 0.7;
      letter-spacing: 0.02em;
    }

    /* === BOTTOM SECTION (Metric Cards iOS Style) === */
    .details-bottom {
      padding: var(--space-6) var(--space-4) var(--space-12) var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .details-section-header {
      display: none; /* Hide for true iOS look, as iOS doesn't have a generic breakdown title */
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
    }

    .metric-card {
      display: flex;
      flex-direction: column;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 16px;
      min-height: 160px;
      border: 1px solid var(--border-glass);
    }

    .metric-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0;
      margin-bottom: 8px;
    }

    .metric-header i {
      color: var(--text-secondary);
    }

    .metric-value {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 32px;
      font-weight: 400;
      color: var(--text-primary);
      line-height: 1.1;
      letter-spacing: normal;
    }

    .metric-unit {
      font-size: 20px;
      font-weight: 400;
      color: var(--text-secondary);
      letter-spacing: normal;
    }

    .metric-desc {
      font-size: 13px;
      color: var(--text-primary);
      font-weight: 400;
      margin-top: auto;
      line-height: 1.3;
      padding-top: 16px;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      color: var(--text-muted);
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
