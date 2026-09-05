import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { WeatherStore } from '../../core/state/weather.store';
import { SettingsStore } from '../../core/state/settings.store';
import { TemperaturePipe } from '../../shared/pipes/temperature.pipe';
import { WindSpeedPipe } from '../../shared/pipes/wind-speed.pipe';
import { WeatherIcon } from '../../shared/components/weather-icon/weather-icon.component';
import { Skeleton } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import {
  windDirectionLabel,
  uvIndexLabel,
  visibilityLabel,
  pressureLabel,
} from '../../core/models/settings.model';
import { getAqiCategory, getWeatherMeta, getMoonPhase } from '../../core/models/weather.model';

@Component({
  selector: 'nimbus-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TemperaturePipe, WindSpeedPipe, WeatherIcon, Skeleton, RouterLink, DatePipe],
  template: `
    @if (weather.isLoading() && !weather.hasData()) {
      <div class="details-page" style="background: var(--bg-primary); color: var(--text-primary);">
        <div class="hero-theme-card">
          <header class="top-nav">
            <div class="nav-btn"><nimbus-skeleton width="24px" height="24px" radius="full" /></div>
            <nimbus-skeleton width="80px" height="20px" radius="full" />
            <div class="nav-btn"><nimbus-skeleton width="24px" height="24px" radius="full" /></div>
          </header>
          <div class="hero-weather">
            <nimbus-skeleton width="72px" height="72px" radius="full" class="mb-4" />
            <nimbus-skeleton width="180px" height="36px" class="mb-2" />
            <nimbus-skeleton width="120px" height="20px" class="mb-4" />
            <div class="hero-divider"></div>
            <nimbus-skeleton width="140px" height="20px" />
          </div>
        </div>
        <div class="details-bottom">
          <nimbus-skeleton width="100%" height="150px" radius="28px" class="mb-4" />
          <nimbus-skeleton width="100%" height="150px" radius="28px" />
        </div>
      </div>
    } @else {
      <div [class]="'details-page bottom-theme-section bottom-theme-section--' + weather.weatherTheme()">
        <!-- Top Hero Card -->
        <div [class]="'hero-theme-card hero-theme-card--' + weather.weatherTheme()">
          <header class="top-nav">
            <button class="nav-btn" routerLink="/" aria-label="Back">
              <i class="ph ph-caret-left" style="font-size: 26px;"></i>
            </button>
            <div class="page-header" style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="ph ph-thermometer-simple" style="font-size: 20px;"></i>
                <span>Details</span>
              </div>
              @if (weather.lastFetchedAt()) {
                <div style="font-size: 10px; opacity: 0.7; font-weight: 500; display: flex; align-items: center;">
                  <i class="ph ph-arrows-clockwise" style="margin-right: 4px;"></i>
                  Updated {{ weather.lastFetchedAt() | date:'shortTime' }}
                  @if (weather.isShowingCachedData()) {
                    <span style="color: var(--warning); margin-left: 4px;">(Offline)</span>
                  }
                </div>
              }
            </div>
            <button class="nav-btn" (click)="shareForecast()" aria-label="Share Forecast">
              @if (copySuccess()) {
                <i class="ph ph-check" style="font-size: 26px; color: var(--success);"></i>
              } @else {
                <i class="ph ph-share-network" style="font-size: 26px;"></i>
              }
            </button>
          </header>

          @if (weather.currentWeather(); as current) {
            <div class="hero-weather">
              <nimbus-weather-icon [weatherCode]="current.weatherCode" [size]="72" [isDay]="current.isDay" />

              <h1 class="hero-headline">{{ locationName }}</h1>

              <p class="hero-subtitle">
                <span class="hero-condition">{{ getWeatherMeta(current.weatherCode).label }}</span>
                <span class="hero-dot">•</span>
                <span class="hero-temp">{{ current.temperature | temperature:'value' }}°</span>
              </p>

              <div class="hero-divider"></div>

              @if (weather.todayHighLow(); as hl) {
                <div class="hero-bottom-bar">
                  <div class="hero-bottom-info">
                    <i class="ph ph-arrow-up" style="font-size: 13px;"></i>
                    <span class="hero-bottom-label">{{ hl.high | temperature }}</span>
                  </div>
                  <div class="hero-bottom-info">
                    <i class="ph ph-arrow-down" style="font-size: 13px;"></i>
                    <span class="hero-bottom-label">{{ hl.low | temperature }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Bottom Section -->
        <div class="details-bottom">
          @if (weather.currentWeather(); as current) {

            <!-- Row 1: Feels Like + UV — two square feature tiles -->
            <div class="bento-row bento-row--split">
              <div class="feature-tile">
                <div class="feature-tile-header">
                  <i class="ph ph-thermometer" style="color: var(--accent);"></i>
                  <span>Feels Like</span>
                </div>
                <div class="feature-tile-value font-display">{{ current.feelsLike | temperature }}</div>
                <div class="feature-tile-desc">{{ weather.feelsLikeLabel() }}</div>
              </div>

              <div class="feature-tile">
                <div class="feature-tile-header">
                  <i class="ph ph-sun" style="color: var(--warning);"></i>
                  <span>UV Index</span>
                </div>
                <div class="feature-tile-value font-display">{{ current.uvIndex }}</div>
                <div class="uv-track">
                  <div class="uv-fill" [style.width.%]="uvPercent(current.uvIndex)"></div>
                </div>
                <div class="feature-tile-desc">{{ uvIndexLabel(current.uvIndex) }}</div>
              </div>
            </div>

            <!-- Row 2: Wind + Precipitation -->
            <div class="bento-row bento-row--split">
              <div class="feature-tile">
                <div class="feature-tile-header">
                  <i class="ph ph-wind" style="color: var(--info);"></i>
                  <span>Wind</span>
                </div>
                <div class="feature-tile-value font-display">{{ current.windSpeed | windSpeed }}</div>
                <div class="feature-tile-desc">
                  {{ windDirectionLabel(current.windDirection) }}
                </div>
              </div>

              <div class="feature-tile">
                <div class="feature-tile-header">
                  <i class="ph ph-drop" style="color: var(--accent);"></i>
                  <span>Precipitation</span>
                </div>
                <div class="feature-tile-value font-display">{{ current.precipitation }} <span style="font-size: 16px;">mm</span></div>
                <div class="feature-tile-desc">In the last hour</div>
              </div>
            </div>

            <!-- Row 3: Air Quality / Sunrise / Sunset -->
            <div class="bento-row">
              @if (weather.airQuality(); as aqi) {
                <div class="wide-card">
                  <div class="feature-tile-header">
                    <i class="ph ph-leaf" style="color: #10B981;"></i>
                    <span>Air Quality</span>
                  </div>
                  <div class="aqi-row" style="display: flex; gap: 16px; align-items: center;">
                    <div class="aqi-score font-display">{{ aqi.usAqi }}</div>
                    <div class="aqi-info">
                      <div class="aqi-label">{{ getAqiCategory(aqi.usAqi!).label }}</div>
                      <div class="aqi-desc">Air quality index is {{ getAqiCategory(aqi.usAqi!).label.toLowerCase() }}.</div>
                    </div>
                  </div>
                </div>
              }

              @if (weather.dailyForecast()[0]; as today) {
                <div class="wide-card">
                  <div class="feature-tile-header">
                    <i class="ph ph-moon-stars" style="color: #6366F1;"></i>
                    <span>Sun & Moon</span>
                  </div>
                  <div class="sun-moon-grid">
                    <div class="sun-moon-item">
                      <span class="sm-label">Sunrise</span>
                      <span class="sm-value">{{ weather.todaySunrise() | date:'shortTime' }}</span>
                    </div>
                    <div class="sun-moon-item">
                      <span class="sm-label">Sunset</span>
                      <span class="sm-value">{{ weather.todaySunset() | date:'shortTime' }}</span>
                    </div>
                    <div class="sun-moon-item" style="grid-column: span 2; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
                      <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span class="sm-label" style="display: flex; align-items: center; gap: 6px;">
                          <i class="ph-fill ph-{{ getMoonPhase().icon }}"></i>
                          {{ getMoonPhase().phase }}
                        </span>
                        <span class="sm-label">Illumination: {{ (getMoonPhase().cycle * 100).toFixed(0) }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Row 4: Remaining stats -->
            <div class="stat-list-card">
              <div class="stat-row">
                <div class="stat-row-icon"><i class="ph ph-gauge"></i></div>
                <div class="stat-row-body">
                  <span class="stat-row-label">Pressure</span>
                  <span class="stat-row-desc">{{ pressureLabel(current.pressure) }}</span>
                </div>
                <div class="stat-row-value font-display">{{ current.pressure }} <span class="stat-row-unit">hPa</span></div>
              </div>

              <div class="stat-row">
                <div class="stat-row-icon"><i class="ph ph-eye"></i></div>
                <div class="stat-row-body">
                  <span class="stat-row-label">Visibility</span>
                  <span class="stat-row-desc">{{ visibilityLabel(current.visibility) }}</span>
                </div>
                <div class="stat-row-value font-display">{{ (current.visibility / 1000).toFixed(0) }} <span class="stat-row-unit">km</span></div>
              </div>
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
      animation: fadeIn var(--duration-normal) var(--ease-decel);
    }

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
      border-radius: 999px;
      transition: background 0.2s ease, transform 0.2s ease;
    }

    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    .nav-btn:active {
      transform: scale(0.92);
    }

    .page-header {
      display: flex;
    }

    .hero-weather {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0 var(--space-2);
      margin-bottom: var(--space-4);
      margin-top: var(--space-2);
    }

    .hero-weather nimbus-weather-icon {
      display: block;
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
      margin-bottom: var(--space-3);
      overflow-wrap: break-word;
      word-break: normal;
    }

    .hero-subtitle {
      display: flex;
      align-items: baseline;
      gap: 8px;
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      margin: 0;
    }

    .hero-condition { opacity: 0.8; }
    .hero-dot { opacity: 0.5; }
    .hero-temp { font-weight: 700; opacity: 0.95; }

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
      gap: var(--space-2);
    }

    .hero-bottom-label {
      font-size: 13px;
      font-weight: var(--weight-bold);
      opacity: 0.7;
      letter-spacing: 0.02em;
    }

    .details-bottom {
      padding: var(--space-6) var(--space-4) var(--space-12) var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .feature-tile,
    .wide-card,
    .stat-list-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 28px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .bento-row {
      display: grid;
      gap: var(--space-3);
    }

    .bento-row--split {
      grid-template-columns: 1fr 1fr;
    }

    .feature-tile {
      padding: 18px;
      min-height: 150px;
      display: flex;
      flex-direction: column;
    }

    .feature-tile-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      opacity: 0.9;
      margin-bottom: 16px;
    }

    .feature-tile-header i { font-size: 18px; opacity: 1; }

    .feature-tile-value {
      font-size: 38px;
      font-weight: 500;
      line-height: 1.1;
      letter-spacing: -0.04em;
    }

    .feature-tile-desc {
      font-size: 13px;
      font-weight: 500;
      opacity: 0.7;
      margin-top: auto;
    }

    .uv-track {
      width: 100%;
      height: 4px;
      border-radius: 999px;
      background: currentColor;
      opacity: 0.15;
      margin: 10px 0;
      position: relative;
      overflow: hidden;
    }

    .uv-fill {
      position: absolute;
      inset: 0 auto 0 0;
      height: 100%;
      border-radius: 999px;
      background: var(--warning);
      transition: width 0.6s var(--ease-decel, ease);
    }

    .wide-card {
      padding: 20px;
    }

    .aqi-score {
      font-size: 42px;
      font-weight: 600;
      line-height: 1;
    }

    .aqi-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .aqi-label {
      font-weight: 800;
      font-size: 18px;
    }

    .aqi-desc {
      font-size: 13px;
      font-weight: 500;
      opacity: 0.7;
    }
    
    .sun-moon-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
      margin-top: var(--space-2);
    }
    
    .sun-moon-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .sm-label {
      font-size: 13px;
      font-weight: 600;
      opacity: 0.7;
    }
    
    .sm-value {
      font-size: 24px;
      font-weight: 700;
    }

    .stat-list-card {
      display: flex;
      flex-direction: column;
      padding: 4px 18px;
    }

    .stat-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 0;
    }

    .stat-row + .stat-row {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .stat-row-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      opacity: 0.9;
      flex-shrink: 0;
    }

    .stat-row-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .stat-row-label {
      font-size: 14px;
      font-weight: 600;
    }

    .stat-row-desc {
      font-size: 12px;
      opacity: 0.65;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stat-row-value {
      margin-left: auto;
      font-size: 17px;
      font-weight: 500;
      white-space: nowrap;
      padding-left: 8px;
    }

    .stat-row-unit {
      font-size: 12px;
      font-weight: 400;
      opacity: 0.6;
    }

    @media (max-width: 380px) {
      .bento-row--split { grid-template-columns: 1fr; }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      height: 100vh;
      color: var(--text-muted);
    }

    .loading-spinner {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid currentColor;
      border-top-color: transparent;
      opacity: 0.6;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class DetailsComponent {
  readonly weather = inject(WeatherStore);
  readonly settings = inject(SettingsStore);
  readonly copySuccess = signal(false);

  Math = Math; // Make Math available in template

  get locationName(): string {
    const loc = this.weather.selectedLocation();
    if (!loc) return 'Current Location';
    return loc.admin1 ? `${loc.name}, ${loc.admin1}` : `${loc.name}, ${loc.country}`;
  }

  getAllergyRisk(aq: any) {
    const pollens = [
      { name: 'Birch', value: aq.birchPollen || 0 },
      { name: 'Grass', value: aq.grassPollen || 0 },
      { name: 'Olive', value: aq.olivePollen || 0 },
      { name: 'Ragweed', value: aq.ragweedPollen || 0 },
      { name: 'Alder', value: aq.alderPollen || 0 },
      { name: 'Mugwort', value: aq.mugwortPollen || 0 },
    ];
    const highest = pollens.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), pollens[0]);

    if (highest.value === 0) return { label: 'Low', highest: 'None detected', value: 0 };

    let label = 'Low';
    if (highest.value > 10) label = 'Moderate';
    if (highest.value > 50) label = 'High';
    if (highest.value > 500) label = 'Very High';

    return { label, highest: highest.name, value: highest.value };
  }

  readonly windDirectionLabel = windDirectionLabel;
  readonly uvIndexLabel = uvIndexLabel;
  readonly visibilityLabel = visibilityLabel;
  readonly pressureLabel = pressureLabel;
  readonly getAqiCategory = getAqiCategory;
  readonly getWeatherMeta = getWeatherMeta;
  readonly getMoonPhase = getMoonPhase;

  uvPercent(uv: number): number {
    return Math.min(100, (uv / 11) * 100);
  }

  formatSunTime(isoString: string | null): string {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  async shareForecast() {
    const current = this.weather.currentWeather();
    if (!current) return;

    const condition = this.getWeatherMeta(current.weatherCode).label;
    const temp = current.temperature.toFixed(0) + '°';
    const loc = this.locationName;

    const text = `It's currently ${temp} and ${condition} in ${loc}. Checked via Nimbus Weather.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Weather in ${loc}`,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    }
  }

  humidityDescription(humidity: number): string {
    if (humidity <= 30) return 'Dry air';
    if (humidity <= 60) return 'Comfortable';
    if (humidity <= 80) return 'Humid';
    return 'Very humid';
  }
}