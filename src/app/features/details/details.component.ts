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
import { getAqiCategory, getWeatherMeta, getMoonPhase } from '../../core/models/weather.model';

@Component({
  selector: 'nimbus-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TemperaturePipe, WindSpeedPipe, WeatherIcon, RouterLink],
  template: `
    @if (weather.isLoading() && !weather.hasData()) {
      <div class="loading-state" style="background: var(--bg-primary); color: var(--text-primary);">
        <div class="loading-spinner"></div>
        <span>Loading...</span>
      </div>
    } @else {
      <div [class]="'details-page bottom-theme-section bottom-theme-section--' + weather.weatherTheme()">
        <!-- Top Hero Card -->
        <div [class]="'hero-theme-card hero-theme-card--' + weather.weatherTheme()">
          <header class="top-nav">
            <button class="nav-btn" routerLink="/" aria-label="Back">
              <i class="ph ph-caret-left" style="font-size: 26px;"></i>
            </button>
            <div class="page-header">
              <i class="ph ph-thermometer-simple" style="font-size: 20px;"></i>
              <span>Details</span>
            </div>
            <button class="nav-btn" (click)="shareForecast()" aria-label="Share Forecast">
              <i class="ph ph-share-network" style="font-size: 26px;"></i>
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
          <div class="details-section-header">
            <h2 class="details-section-title">Weather Breakdown</h2>
          </div>

          @if (weather.currentWeather(); as current) {

            <!-- Row 1: Feels Like + UV — two square feature tiles -->
            <div class="bento-row bento-row--split">
              <div class="feature-tile">
                <div class="feature-tile-header">
                  <i class="ph ph-thermometer"></i>
                  <span>Feels Like</span>
                </div>
                <div class="feature-tile-value font-display">{{ current.feelsLike | temperature }}</div>
                <div class="feature-tile-desc">{{ weather.feelsLikeLabel() }}</div>
              </div>

              <div class="feature-tile">
                <div class="feature-tile-header">
                  <i class="ph ph-sun"></i>
                  <span>UV Index</span>
                </div>
                <div class="feature-tile-value font-display">{{ current.uvIndex }}</div>
                <div class="uv-track">
                  <div class="uv-fill" [style.width.%]="uvPercent(current.uvIndex)"></div>
                </div>
                <div class="feature-tile-desc">{{ uvIndexLabel(current.uvIndex) }}</div>
              </div>
            </div>

            <!-- Row 2: Sun & Moon — wide card -->
            <div class="wide-card">
              <div class="wide-card-title">
                <i class="ph ph-sun-horizon"></i>
                <span>Sun &amp; Moon</span>
              </div>
              <div class="sun-arc-row">
                <div class="sun-arc-point">
                  <span class="sun-arc-label">Sunrise</span>
                  <span class="sun-arc-value font-display">{{ formatSunTime(weather.todaySunrise()) }}</span>
                </div>
                <div class="sun-arc-line">
                  <i class="ph ph-sun sun-arc-icon"></i>
                </div>
                <div class="sun-arc-point sun-arc-point--end">
                  <span class="sun-arc-label">Sunset</span>
                  <span class="sun-arc-value font-display">{{ formatSunTime(weather.todaySunset()) }}</span>
                </div>
              </div>

              @if (getMoonPhase(); as moon) {
                <div class="moon-row">
                  <i class="ph ph-{{ moon.icon }}"></i>
                  <span class="moon-row-label">{{ moon.phase }}</span>
                  <span class="moon-row-value">{{ Math.round(moon.cycle * 100) }}% illuminated</span>
                </div>
              }
            </div>

            <!-- Row 3: Wind + Precipitation split -->
            <div class="bento-row bento-row--split">
              <div class="feature-tile">
                <div class="feature-tile-header">
                  <i class="ph ph-wind"></i>
                  <span>Wind</span>
                </div>
                <div class="feature-tile-value font-display">{{ current.windSpeed | windSpeed }}</div>
                <div class="feature-tile-desc">{{ windDirectionLabel(current.windDirection) }} ({{ current.windDirection }}°)</div>
                <div class="feature-tile-desc feature-tile-desc--muted">Gusts {{ current.windGusts | windSpeed }}</div>
              </div>

              <div class="feature-tile">
                <div class="feature-tile-header">
                  <i class="ph ph-cloud-rain"></i>
                  <span>Precipitation</span>
                </div>
                <div class="feature-tile-value font-display">{{ weather.next24Hours()[0]?.precipitationProbability ?? 0 }}%</div>
                <div class="feature-tile-desc">
                  @if (current.precipitation > 0) {
                    {{ current.precipitation }} mm expected
                  } @else {
                    No rain expected
                  }
                </div>
              </div>
            </div>

            <!-- Row 4: Remaining stats — compact list card -->
            <div class="stat-list-card">
              <div class="stat-row">
                <div class="stat-row-icon"><i class="ph ph-drop"></i></div>
                <div class="stat-row-body">
                  <span class="stat-row-label">Humidity</span>
                  <span class="stat-row-desc">{{ humidityDescription(current.humidity) }}</span>
                </div>
                <div class="stat-row-value font-display">{{ current.humidity }}%</div>
              </div>

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

              <div class="stat-row">
                <div class="stat-row-icon"><i class="ph ph-cloud"></i></div>
                <div class="stat-row-body">
                  <span class="stat-row-label">Cloud Cover</span>
                  <span class="stat-row-desc">Sky coverage</span>
                </div>
                <div class="stat-row-value font-display">{{ current.cloudCover }}%</div>
              </div>

              @if (weather.airQuality(); as aq) {
                @if (aq.usAqi !== null) {
                  <div class="stat-row">
                    <div class="stat-row-icon"><i class="ph ph-leaf"></i></div>
                    <div class="stat-row-body">
                      <span class="stat-row-label">Air Quality</span>
                      <span class="stat-row-desc">{{ getAqiCategory(aq.usAqi!).label }} @if (aq.pm25 !== null) { • PM2.5: {{ aq.pm25 }} }</span>
                    </div>
                    <div class="stat-row-value font-display">{{ aq.usAqi }} <span class="stat-row-unit">AQI</span></div>
                  </div>
                }

                @if (getAllergyRisk(aq); as risk) {
                  <div class="stat-row">
                    <div class="stat-row-icon"><i class="ph ph-flower"></i></div>
                    <div class="stat-row-body">
                      <span class="stat-row-label">Allergy Risk</span>
                      <span class="stat-row-desc">Primary: {{ risk.highest }} ({{ Math.round(risk.value) }} grains/m³)</span>
                    </div>
                    <div class="stat-row-value font-display">{{ risk.label }}</div>
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
      display: none;
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

    /* === BOTTOM SECTION — bento layout === */

    .details-bottom {
      padding: var(--space-6) var(--space-4) var(--space-12) var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .details-section-header { display: none; }

    /* shared surface style */
    .feature-tile,
    .wide-card,
    .stat-list-card {
      background: var(--bg-glass);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--border-glass);
      border-radius: 22px;
    }

    .bento-row {
      display: grid;
      gap: var(--space-3);
    }

    .bento-row--split {
      grid-template-columns: 1fr 1fr;
    }

    /* --- Feature tiles (feels like / uv / wind / precip) --- */
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
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      opacity: 0.75;
      margin-bottom: 12px;
    }

    .feature-tile-header i { font-size: 16px; opacity: 0.9; }

    .feature-tile-value {
      font-size: 32px;
      font-weight: 500;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    .feature-tile-desc {
      font-size: 12.5px;
      opacity: 0.85;
      margin-top: auto;
      padding-top: 10px;
      line-height: 1.35;
    }

    .feature-tile-desc--muted {
      opacity: 0.6;
      padding-top: 2px;
    }

    .uv-track {
      width: 100%;
      height: 4px;
      border-radius: 999px;
      background: currentColor;
      opacity: 0.15;
      margin-top: 10px;
      position: relative;
      overflow: hidden;
    }

    .uv-fill {
      position: absolute;
      inset: 0 auto 0 0;
      height: 100%;
      border-radius: 999px;
      background: currentColor;
      opacity: 1;
      transition: width 0.6s var(--ease-decel, ease);
    }

    /* --- Wide card: sun & moon --- */
    .wide-card {
      padding: 20px;
    }

    .wide-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      opacity: 0.75;
      margin-bottom: 18px;
    }

    .wide-card-title i { font-size: 16px; }

    .sun-arc-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: 16px;
    }

    .sun-arc-point {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sun-arc-point--end {
      align-items: flex-end;
      text-align: right;
    }

    .sun-arc-label {
      font-size: 11px;
      opacity: 0.6;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .sun-arc-value {
      font-size: 20px;
      font-weight: 500;
    }

    .sun-arc-line {
      flex: 1;
      height: 1px;
      background: currentColor;
      opacity: 0.2;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sun-arc-icon {
      font-size: 18px;
      opacity: 0.8;
      background: var(--bg-glass);
      padding: 4px;
    }

    .moon-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-top: 14px;
      border-top: 1px solid currentColor;
      border-top-color: rgba(255,255,255,0.1);
    }

    .moon-row i { font-size: 18px; opacity: 0.85; }

    .moon-row-label {
      font-size: 14px;
      font-weight: 600;
    }

    .moon-row-value {
      margin-left: auto;
      font-size: 12.5px;
      opacity: 0.7;
    }

    /* --- Compact stat list --- */
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
      alert('Forecast copied to clipboard!');
    }
  }

  humidityDescription(humidity: number): string {
    if (humidity <= 30) return 'Dry air';
    if (humidity <= 60) return 'Comfortable';
    if (humidity <= 80) return 'Humid';
    return 'Very humid';
  }
}