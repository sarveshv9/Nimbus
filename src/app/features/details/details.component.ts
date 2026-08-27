import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { WeatherStore } from '../../core/state/weather.store';
import { SettingsStore } from '../../core/state/settings.store';
import { GlassCard } from '../../shared/components/glass-card/glass-card.component';
import { TemperaturePipe } from '../../shared/pipes/temperature.pipe';
import { WindSpeedPipe } from '../../shared/pipes/wind-speed.pipe';
import {
  windDirectionLabel,
  uvIndexLabel,
  uvIndexColor,
  visibilityLabel,
  pressureLabel,
} from '../../core/models/settings.model';
import { getAqiCategory } from '../../core/models/weather.model';

@Component({
  selector: 'nimbus-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GlassCard, TemperaturePipe, WindSpeedPipe],
  template: `
    <div class="details-page">
      <header class="page-header">
        <h1 class="page-title font-display">Details</h1>
        <p class="page-subtitle">Comprehensive weather metrics</p>
      </header>

      @if (weather.currentWeather(); as current) {
        <div class="bento-grid">
          <!-- Temperature -->
          <nimbus-glass-card class="bento-item bento-wide">
            <div class="metric-visual">
              <div class="metric-label-row">
                <span class="metric-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg></span>
                <span class="metric-name">Temperature</span>
              </div>
              <div class="metric-big-value font-display">{{ current.temperature | temperature }}</div>
              <div class="metric-detail">Feels like {{ current.feelsLike | temperature }}</div>
              <div class="thermometer" aria-hidden="true">
                <div class="thermometer-fill" [style.width.%]="Math.min(100, Math.max(0, (current.temperature + 10) / 60 * 100))"></div>
              </div>
            </div>
          </nimbus-glass-card>

          <!-- Wind Compass -->
          <nimbus-glass-card class="bento-item">
            <div class="metric-visual">
              <div class="metric-label-row">
                <span class="metric-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg></span>
                <span class="metric-name">Wind</span>
              </div>
              <div class="compass" aria-label="Wind direction compass">
                <svg viewBox="0 0 120 120" class="compass-svg">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-subtle)" stroke-width="1.5" />
                  <circle cx="60" cy="60" r="35" fill="none" stroke="var(--border-subtle)" stroke-width="0.5" stroke-dasharray="2 4" />
                  <!-- Cardinal directions -->
                  <text x="60" y="16" text-anchor="middle" fill="var(--text-muted)" font-size="10" font-weight="600">N</text>
                  <text x="104" y="64" text-anchor="middle" fill="var(--text-muted)" font-size="10">E</text>
                  <text x="60" y="112" text-anchor="middle" fill="var(--text-muted)" font-size="10">S</text>
                  <text x="16" y="64" text-anchor="middle" fill="var(--text-muted)" font-size="10">W</text>
                  <!-- Arrow -->
                  <g [style.transform]="'rotate(' + current.windDirection + 'deg)'" style="transform-origin: 60px 60px; transition: transform 1s ease">
                    <line x1="60" y1="60" x2="60" y2="24" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" />
                    <polygon points="60,20 55,30 65,30" fill="var(--accent)" />
                  </g>
                  <!-- Center dot -->
                  <circle cx="60" cy="60" r="3" fill="var(--accent)" />
                </svg>
              </div>
              <div class="metric-detail">
                {{ current.windSpeed | windSpeed }} {{ windDirectionLabel(current.windDirection) }}
              </div>
              <div class="metric-sub">Gusts {{ current.windGusts | windSpeed }}</div>
            </div>
          </nimbus-glass-card>

          <!-- Humidity Ring -->
          <nimbus-glass-card class="bento-item">
            <div class="metric-visual">
              <div class="metric-label-row">
                <span class="metric-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg></span>
                <span class="metric-name">Humidity</span>
              </div>
              <div class="ring-container" aria-label="Humidity at {{ current.humidity }} percent">
                <svg viewBox="0 0 100 100" class="ring-svg">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-subtle)" stroke-width="6" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent)" stroke-width="6"
                    stroke-linecap="round"
                    [attr.stroke-dasharray]="2 * 3.14159 * 40"
                    [attr.stroke-dashoffset]="2 * 3.14159 * 40 * (1 - current.humidity / 100)"
                    style="transform: rotate(-90deg); transform-origin: center; transition: stroke-dashoffset 1s ease" />
                  <text x="50" y="50" text-anchor="middle" dominant-baseline="central"
                    fill="var(--text-primary)" font-size="22" font-weight="600" font-family="var(--font-display)">
                    {{ current.humidity }}%
                  </text>
                </svg>
              </div>
            </div>
          </nimbus-glass-card>

          <!-- Pressure -->
          <nimbus-glass-card class="bento-item">
            <div class="metric-visual">
              <div class="metric-label-row">
                <span class="metric-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/></svg></span>
                <span class="metric-name">Pressure</span>
              </div>
              <div class="metric-big-value font-display">{{ current.pressure }}</div>
              <div class="metric-unit">hPa</div>
              <div class="metric-detail">{{ pressureLabel(current.pressure) }}</div>
            </div>
          </nimbus-glass-card>

          <!-- UV Index -->
          <nimbus-glass-card class="bento-item">
            <div class="metric-visual">
              <div class="metric-label-row">
                <span class="metric-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg></span>
                <span class="metric-name">UV Index</span>
              </div>
              <div class="metric-big-value font-display" [style.color]="uvIndexColor(current.uvIndex)">
                {{ current.uvIndex }}
              </div>
              <div class="metric-detail" [style.color]="uvIndexColor(current.uvIndex)">
                {{ uvIndexLabel(current.uvIndex) }}
              </div>
              <div class="uv-gradient-bar" aria-hidden="true">
                <div class="uv-marker" [style.left.%]="Math.min(100, (current.uvIndex / 11) * 100)"></div>
              </div>
            </div>
          </nimbus-glass-card>

          <!-- Visibility -->
          <nimbus-glass-card class="bento-item">
            <div class="metric-visual">
              <div class="metric-label-row">
                <span class="metric-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg></span>
                <span class="metric-name">Visibility</span>
              </div>
              <div class="metric-big-value font-display">{{ (current.visibility / 1000).toFixed(0) }}</div>
              <div class="metric-unit">km</div>
              <div class="metric-detail">{{ visibilityLabel(current.visibility) }}</div>
            </div>
          </nimbus-glass-card>

          <!-- Cloud Cover -->
          <nimbus-glass-card class="bento-item">
            <div class="metric-visual">
              <div class="metric-label-row">
                <span class="metric-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg></span>
                <span class="metric-name">Cloud Cover</span>
              </div>
              <div class="metric-big-value font-display">{{ current.cloudCover }}%</div>
              <div class="cloud-bar" aria-hidden="true">
                <div class="cloud-bar-fill" [style.width.%]="current.cloudCover"></div>
              </div>
            </div>
          </nimbus-glass-card>

          <!-- Air Quality -->
          @if (weather.airQuality(); as aq) {
            @if (aq.usAqi !== null) {
              <nimbus-glass-card class="bento-item">
                <div class="metric-visual">
                  <div class="metric-label-row">
                    <span class="metric-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></span>
                    <span class="metric-name">Air Quality</span>
                  </div>
                  <div class="metric-big-value font-display" [style.color]="getAqiCategory(aq.usAqi!).color">
                    {{ aq.usAqi }}
                  </div>
                  <div class="metric-detail" [style.color]="getAqiCategory(aq.usAqi!).color">
                    {{ getAqiCategory(aq.usAqi!).label }}
                  </div>
                  @if (aq.pm25 !== null) {
                    <div class="metric-sub">PM2.5: {{ aq.pm25 }} μg/m³</div>
                  }
                </div>
              </nimbus-glass-card>
            }
          }
        </div>
      } @else {
        <nimbus-glass-card>
          <div class="empty-state">
            <p>No weather data available. Search for a location to see details.</p>
          </div>
        </nimbus-glass-card>
      }
    </div>
  `,
  styles: [`
    .details-page {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      animation: fadeInUp var(--duration-slow) var(--ease-decel);
    }
    .page-header { padding: var(--space-4) 0; }
    .page-title { font-size: var(--text-3xl); font-weight: var(--weight-bold); color: var(--text-primary); }
    .page-subtitle { font-size: var(--text-base); color: var(--text-muted); margin-top: var(--space-1); }

    .bento-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
    }
    @media (min-width: 768px) {
      .bento-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (min-width: 1024px) {
      .bento-grid { grid-template-columns: repeat(4, 1fr); }
    }
    .bento-wide {
      grid-column: span 2;
    }

    .metric-visual {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      text-align: center;
    }
    .metric-label-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .metric-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
    }
    .metric-big-value {
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      color: var(--text-primary);
      line-height: 1;
    }
    .metric-unit {
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin-top: -4px;
    }
    .metric-detail {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      font-weight: var(--weight-medium);
    }
    .metric-sub {
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    /* Compass */
    .compass { width: 120px; height: 120px; }
    .compass-svg { width: 100%; height: 100%; }

    /* Humidity Ring */
    .ring-container { width: 100px; height: 100px; }
    .ring-svg { width: 100%; height: 100%; }

    /* Thermometer */
    .thermometer {
      width: 100%;
      height: 6px;
      background: var(--border-subtle);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .thermometer-fill {
      height: 100%;
      background: linear-gradient(90deg, hsl(200, 70%, 55%), hsl(38, 92%, 55%), hsl(0, 70%, 55%));
      border-radius: var(--radius-full);
      transition: width 1s ease;
    }

    /* UV Scale */
    .uv-gradient-bar {
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, hsl(120,60%,45%), hsl(48,90%,50%), hsl(30,85%,55%), hsl(0,70%,50%), hsl(280,60%,40%));
      border-radius: var(--radius-full);
      position: relative;
      margin-top: var(--space-2);
    }
    .uv-marker {
      position: absolute;
      top: -3px;
      width: 12px;
      height: 12px;
      background: var(--bg-surface-solid);
      border: 2px solid var(--accent);
      border-radius: 50%;
      transform: translateX(-50%);
      transition: left 1s ease;
    }

    /* Cloud bar */
    .cloud-bar {
      width: 100%;
      height: 6px;
      background: var(--border-subtle);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .cloud-bar-fill {
      height: 100%;
      background: var(--text-muted);
      border-radius: var(--radius-full);
      transition: width 1s ease;
    }

    .empty-state {
      text-align: center;
      padding: var(--space-12);
      color: var(--text-muted);
    }
  `],
})
export class DetailsComponent {
  readonly weather = inject(WeatherStore);
  readonly settings = inject(SettingsStore);

  readonly windDirectionLabel = windDirectionLabel;
  readonly uvIndexLabel = uvIndexLabel;
  readonly uvIndexColor = uvIndexColor;
  readonly visibilityLabel = visibilityLabel;
  readonly pressureLabel = pressureLabel;
  readonly getAqiCategory = getAqiCategory;
  readonly Math = Math;
}
