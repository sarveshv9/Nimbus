import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { SettingsStore } from '../../core/state/settings.store';
import { GlassCard } from '../../shared/components/glass-card/glass-card.component';
import { TemperatureUnit, WindSpeedUnit, ThemeMode } from '../../core/models/settings.model';

@Component({
  selector: 'nimbus-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GlassCard],
  template: `
    <div class="settings-page">
      <header class="page-header">
        <h1 class="page-title font-display">Settings</h1>
        <p class="page-subtitle">Customize your weather experience</p>
      </header>

      <!-- Units -->
      <section>
        <h2 class="section-label">Units</h2>
        <nimbus-glass-card>
          <div class="setting-group">
            <!-- Temperature -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-name">Temperature</span>
                <span class="setting-desc">Choose your preferred temperature unit</span>
              </div>
              <div class="toggle-group" role="radiogroup" aria-label="Temperature unit">
                <button
                  class="toggle-btn"
                  [class.active]="settings.temperatureUnit() === 'celsius'"
                  (click)="settings.setTemperatureUnit('celsius')"
                  role="radio"
                  [attr.aria-checked]="settings.temperatureUnit() === 'celsius'"
                >°C</button>
                <button
                  class="toggle-btn"
                  [class.active]="settings.temperatureUnit() === 'fahrenheit'"
                  (click)="settings.setTemperatureUnit('fahrenheit')"
                  role="radio"
                  [attr.aria-checked]="settings.temperatureUnit() === 'fahrenheit'"
                >°F</button>
              </div>
            </div>

            <!-- Wind Speed -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-name">Wind Speed</span>
                <span class="setting-desc">Choose your preferred wind speed unit</span>
              </div>
              <div class="toggle-group" role="radiogroup" aria-label="Wind speed unit">
                @for (unit of windUnits; track unit.value) {
                  <button
                    class="toggle-btn"
                    [class.active]="settings.windSpeedUnit() === unit.value"
                    (click)="settings.setWindSpeedUnit(unit.value)"
                    role="radio"
                    [attr.aria-checked]="settings.windSpeedUnit() === unit.value"
                  >{{ unit.label }}</button>
                }
              </div>
            </div>
          </div>
        </nimbus-glass-card>
      </section>

      <!-- Appearance -->
      <section>
        <h2 class="section-label">Appearance</h2>
        <nimbus-glass-card>
          <div class="setting-group">
            <!-- Theme -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-name">Theme</span>
                <span class="setting-desc">Choose light, dark, or match your system</span>
              </div>
              <div class="toggle-group" role="radiogroup" aria-label="Theme mode">
                @for (mode of themeModes; track mode.value) {
                  <button
                    class="toggle-btn"
                    [class.active]="settings.themeMode() === mode.value"
                    (click)="settings.setThemeMode(mode.value)"
                    role="radio"
                    [attr.aria-checked]="settings.themeMode() === mode.value"
                  >{{ mode.label }}</button>
                }
              </div>
            </div>

            <!-- Reduced Motion -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-name">Reduced Motion</span>
                <span class="setting-desc">Minimize animations and weather effects</span>
              </div>
              <button
                class="switch"
                [class.active]="settings.reducedMotion()"
                (click)="settings.setReducedMotion(!settings.reducedMotion())"
                role="switch"
                [attr.aria-checked]="settings.reducedMotion()"
                aria-label="Toggle reduced motion"
              >
                <span class="switch-thumb"></span>
              </button>
            </div>
          </div>
        </nimbus-glass-card>
      </section>

      <!-- About -->
      <section>
        <h2 class="section-label">About</h2>
        <nimbus-glass-card>
          <div class="about-section">
            <h3 class="about-title font-display">Nimbus</h3>
            <p class="about-desc">
              A production-quality weather visualization platform built as an Angular frontend engineering showcase.
            </p>

            <div class="tech-grid">
              <div class="tech-item">
                <span class="tech-label">Framework</span>
                <span class="tech-value">Angular 22</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">State</span>
                <span class="tech-value">Signals + RxJS</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">Rendering</span>
                <span class="tech-value">Zoneless CSR</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">API</span>
                <span class="tech-value">Open-Meteo</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">Charts</span>
                <span class="tech-value">Custom SVG</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">Testing</span>
                <span class="tech-value">Vitest + Playwright</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">Accessibility</span>
                <span class="tech-value">WCAG 2.2 AA</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">Deployment</span>
                <span class="tech-value">GitHub Pages</span>
              </div>
            </div>

            <div class="architecture-list">
              <h4>Angular Concepts Demonstrated</h4>
              <ul>
                <li>Standalone components with signal inputs</li>
                <li>Signal-based reactive state management</li>
                <li>Computed signals for derived state</li>
                <li>Effects for side effects (localStorage, DOM)</li>
                <li>RxJS for async streams (search, HTTP)</li>
                <li>Lazy-loaded routes (loadComponent)</li>
                <li>Deferred views (&#64;defer on viewport)</li>
                <li>Modern control flow (&#64;if, &#64;for, &#64;switch)</li>
                <li>Zoneless change detection</li>
                <li>Functional HTTP interceptors</li>
                <li>CSS custom properties theming</li>
                <li>Accessible combobox (WAI-ARIA)</li>
              </ul>
            </div>
          </div>
        </nimbus-glass-card>
      </section>
    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
      animation: fadeInUp var(--duration-slow) var(--ease-decel);
      max-width: 640px;
    }
    .page-header { padding: var(--space-4) 0; }
    .page-title { font-size: var(--text-3xl); font-weight: var(--weight-bold); color: var(--text-primary); }
    .page-subtitle { font-size: var(--text-base); color: var(--text-muted); margin-top: var(--space-1); }
    .section-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--space-3);
    }
    .setting-group {
      display: flex;
      flex-direction: column;
    }
    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      padding: var(--space-4) 0;
    }
    .setting-row + .setting-row {
      border-top: 1px solid var(--border-subtle);
    }
    .setting-info { flex: 1; }
    .setting-name {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-primary);
    }
    .setting-desc {
      display: block;
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin-top: 2px;
    }
    .toggle-group {
      display: flex;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .toggle-btn {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      color: var(--text-muted);
      transition: all var(--duration-fast) var(--ease-default);
      white-space: nowrap;
    }
    .toggle-btn:hover { color: var(--text-primary); }
    .toggle-btn.active {
      background: var(--accent);
      color: white;
    }

    /* Switch */
    .switch {
      position: relative;
      width: 44px;
      height: 24px;
      background: var(--border-default);
      border-radius: var(--radius-full);
      transition: background var(--duration-fast) var(--ease-default);
      flex-shrink: 0;
    }
    .switch.active {
      background: var(--accent);
    }
    .switch-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform var(--duration-fast) var(--ease-bounce);
      box-shadow: var(--shadow-sm);
    }
    .switch.active .switch-thumb {
      transform: translateX(20px);
    }

    /* About */
    .about-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .about-title {
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      color: var(--text-primary);
    }
    .about-desc {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.6;
    }
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
      padding: var(--space-4) 0;
    }
    .tech-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .tech-label {
      font-size: var(--text-xs);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .tech-value {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-primary);
    }
    .architecture-list {
      border-top: 1px solid var(--border-subtle);
      padding-top: var(--space-4);
    }
    .architecture-list h4 {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      margin-bottom: var(--space-3);
    }
    .architecture-list ul {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .architecture-list li {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      padding-left: var(--space-4);
      position: relative;
    }
    .architecture-list li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: var(--accent);
    }
  `],
})
export class SettingsComponent {
  readonly settings = inject(SettingsStore);

  readonly windUnits: { value: WindSpeedUnit; label: string }[] = [
    { value: 'kmh', label: 'km/h' },
    { value: 'mph', label: 'mph' },
    { value: 'ms', label: 'm/s' },
    { value: 'knots', label: 'kn' },
  ];

  readonly themeModes: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];
}
