import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { WeatherStore } from '../../core/state/weather.store';
import { SettingsStore } from '../../core/state/settings.store';
import { GlassCard } from '../../shared/components/glass-card/glass-card.component';
import { WeatherIcon } from '../../shared/components/weather-icon/weather-icon.component';
import { TemperaturePipe } from '../../shared/pipes/temperature.pipe';
import { WindSpeedPipe } from '../../shared/pipes/wind-speed.pipe';
import { HourlyForecast } from '../../core/models/weather.model';
import { uvIndexLabel, uvIndexColor } from '../../core/models/settings.model';

type ForecastMetric = 'temperature' | 'precipitation' | 'wind' | 'humidity' | 'uv';

@Component({
  selector: 'nimbus-forecast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GlassCard, WeatherIcon, TemperaturePipe, WindSpeedPipe],
  template: `
    <div class="forecast-page">
      <header class="page-header">
        <h1 class="page-title font-display">Forecast</h1>
        <p class="page-subtitle">Detailed weather metrics over time</p>
      </header>

      <!-- Metric Tabs -->
      <div class="metric-tabs" role="tablist" aria-label="Forecast metric selection">
        @for (metric of metrics; track metric.id) {
          <button
            class="metric-tab"
            [class.active]="selectedMetric() === metric.id"
            (click)="selectedMetric.set(metric.id)"
            role="tab"
            [attr.aria-selected]="selectedMetric() === metric.id"
          >
            {{ metric.label }}
          </button>
        }
      </div>

      <!-- Chart Area -->
      <nimbus-glass-card>
        <div class="chart-container" role="img" [attr.aria-label]="selectedMetric() + ' forecast chart'">
          <svg viewBox="0 0 800 200" preserveAspectRatio="none" class="forecast-chart">
            <!-- Grid lines -->
            <g stroke="var(--border-subtle)" stroke-width="1">
              @for (y of [40, 80, 120, 160]; track y) {
                <line [attr.x1]="0" [attr.y1]="y" [attr.x2]="800" [attr.y2]="y" stroke-dasharray="4 4" />
              }
            </g>

            <!-- Data visualization -->
            @if (chartPoints().length > 0) {
              @if (selectedMetric() === 'precipitation') {
                <!-- Bar chart for precipitation -->
                @for (point of chartPoints(); track point.x) {
                  <rect
                    [attr.x]="point.x - 12"
                    [attr.y]="point.y"
                    [attr.width]="24"
                    [attr.height]="200 - point.y"
                    fill="var(--accent)"
                    opacity="0.6"
                    rx="4"
                  />
                }
              } @else {
                <!-- Line chart for other metrics -->
                <path
                  [attr.d]="chartLinePath()"
                  fill="none"
                  stroke="var(--accent)"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <!-- Gradient fill -->
                <path
                  [attr.d]="chartAreaPath()"
                  fill="url(#chart-gradient)"
                  opacity="0.15"
                />
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--accent)" />
                    <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <!-- Data points -->
                @for (point of chartPoints(); track point.x; let i = $index) {
                  @if (i % 3 === 0) {
                    <circle [attr.cx]="point.x" [attr.cy]="point.y" r="3" fill="var(--accent)" />
                  }
                }
              }
            }
          </svg>

          <!-- X-axis labels -->
          <div class="chart-labels">
            @for (point of chartPoints(); track point.x; let i = $index) {
              @if (i % 4 === 0) {
                <span class="chart-label" [style.left.%]="(point.x / 800) * 100">{{ point.label }}</span>
              }
            }
          </div>
        </div>
      </nimbus-glass-card>

      <!-- Day-by-day detail list -->
      <nimbus-glass-card variant="flush">
        <div class="section-header">
          <h2 class="section-title">Daily Breakdown</h2>
        </div>
        <div class="daily-detail-list">
          @for (day of weather.dailyForecast(); track day.date) {
            <div class="daily-detail-item">
              <div class="daily-detail-main">
                <nimbus-weather-icon [weatherCode]="day.weatherCode" [size]="28" />
                <div class="daily-detail-info">
                  <span class="daily-detail-day">{{ formatDay(day.date) }}</span>
                  <span class="daily-detail-range">{{ day.tempMin | temperature }} — {{ day.tempMax | temperature }}</span>
                </div>
              </div>
              <div class="daily-detail-metrics">
                <span class="detail-metric">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
                  {{ day.precipitationProbabilityMax }}%
                </span>
                <span class="detail-metric">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/></svg>
                  {{ day.windSpeedMax | windSpeed }}
                </span>
                <span class="detail-metric" [style.color]="uvIndexColor(day.uvIndexMax)">
                  UV {{ day.uvIndexMax }}
                </span>
              </div>
            </div>
          }
        </div>
      </nimbus-glass-card>
    </div>
  `,
  styles: [`
    .forecast-page {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      animation: fadeInUp var(--duration-slow) var(--ease-decel);
    }
    .page-header { padding: var(--space-4) 0; }
    .page-title {
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      color: var(--text-primary);
    }
    .page-subtitle {
      font-size: var(--text-base);
      color: var(--text-muted);
      margin-top: var(--space-1);
    }
    .metric-tabs {
      display: flex;
      gap: var(--space-2);
      overflow-x: auto;
      padding-bottom: var(--space-2);
    }
    .metric-tabs::-webkit-scrollbar { display: none; }
    .metric-tab {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-muted);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      white-space: nowrap;
      transition: all var(--duration-fast) var(--ease-default);
    }
    .metric-tab:hover { color: var(--text-primary); border-color: var(--border-default); }
    .metric-tab.active {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }
    .chart-container {
      position: relative;
      padding: var(--space-4);
    }
    .forecast-chart {
      width: 100%;
      height: 200px;
    }
    .chart-labels {
      position: relative;
      height: 20px;
      margin-top: var(--space-2);
    }
    .chart-label {
      position: absolute;
      transform: translateX(-50%);
      font-size: 10px;
      color: var(--text-muted);
      white-space: nowrap;
    }
    .section-header {
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--border-subtle);
    }
    .section-title {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .daily-detail-list { padding: var(--space-2) 0; }
    .daily-detail-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-5);
      transition: background var(--duration-fast) var(--ease-default);
    }
    .daily-detail-item:hover { background: var(--bg-surface); }
    .daily-detail-main {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .daily-detail-day {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-primary);
    }
    .daily-detail-range {
      font-size: var(--text-xs);
      color: var(--text-muted);
    }
    .daily-detail-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .daily-detail-metrics {
      display: flex;
      gap: var(--space-4);
    }
    .detail-metric {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-xs);
      color: var(--text-muted);
    }
    @media (max-width: 640px) {
      .daily-detail-metrics { gap: var(--space-2); }
    }
  `],
})
export class ForecastComponent {
  readonly weather = inject(WeatherStore);
  readonly settings = inject(SettingsStore);
  readonly uvIndexLabel = uvIndexLabel;
  readonly uvIndexColor = uvIndexColor;

  readonly metrics: { id: ForecastMetric; label: string }[] = [
    { id: 'temperature', label: 'Temperature' },
    { id: 'precipitation', label: 'Precipitation' },
    { id: 'wind', label: 'Wind' },
    { id: 'humidity', label: 'Humidity' },
    { id: 'uv', label: 'UV Index' },
  ];

  readonly selectedMetric = signal<ForecastMetric>('temperature');

  /** Gets the next 24 hours of data for chart rendering */
  readonly chartData = computed(() => {
    const hourly = this.weather.next24Hours();
    const metric = this.selectedMetric();

    return hourly.map(h => {
      let value: number;
      switch (metric) {
        case 'temperature': value = h.temperature; break;
        case 'precipitation': value = h.precipitationProbability; break;
        case 'wind': value = h.windSpeed; break;
        case 'humidity': value = h.humidity; break;
        case 'uv': value = h.uvIndex; break;
      }
      return { time: h.time, value };
    });
  });

  readonly chartPoints = computed(() => {
    const data = this.chartData();
    if (!data.length) return [];

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const padding = 20;

    return data.map((d, i) => ({
      x: padding + (i / (data.length - 1)) * (800 - padding * 2),
      y: padding + (1 - (d.value - min) / range) * (200 - padding * 2),
      value: d.value,
      label: new Date(d.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
    }));
  });

  chartLinePath(): string {
    const points = this.chartPoints();
    if (points.length < 2) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }

  chartAreaPath(): string {
    const points = this.chartPoints();
    if (points.length < 2) return '';
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const last = points[points.length - 1];
    const first = points[0];
    return `${line} L ${last.x} 200 L ${first.x} 200 Z`;
  }

  formatDay(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }
}
