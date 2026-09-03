import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsStore } from '../../core/state/settings.store';
import { WeatherStore } from '../../core/state/weather.store';
import { WindSpeedUnit } from '../../core/models/settings.model';

@Component({
  selector: 'nimbus-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="settings-page">
      <!-- Top Navigation -->
      <div [class]="'hero-theme-card hero-theme-card--' + weather.weatherTheme()" style="padding-top: var(--space-4); padding-bottom: var(--space-6);">
        <nav class="top-nav">
          <a routerLink="/" class="nav-btn" aria-label="Back">
            <i class="ph ph-caret-left" style="font-size: 28px;"></i>
          </a>
          <div class="location-header">
            <h1 class="page-title">Settings</h1>
          </div>
          <div class="nav-btn" style="opacity: 0">
            <i class="ph ph-caret-left" style="font-size: 28px;"></i>
          </div>
        </nav>
      </div>

      <div class="page-content">
        <!-- Units -->
        <section>
          <h2 class="section-label">Units</h2>
          <div class="settings-card">
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
          </div>
        </section>

        <!-- Theme -->
        <section>
          <h2 class="section-label">Appearance</h2>
          <div class="settings-card">
            <div class="setting-group">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Theme</span>
                  <span class="setting-desc">Choose between light, dark, or system default</span>
                </div>
                <div class="toggle-group" role="radiogroup" aria-label="Theme mode">
                  <button
                    class="toggle-btn"
                    [class.active]="settings.themeMode() === 'light'"
                    (click)="settings.setThemeMode('light')"
                    role="radio"
                    [attr.aria-checked]="settings.themeMode() === 'light'"
                  >Light</button>
                  <button
                    class="toggle-btn"
                    [class.active]="settings.themeMode() === 'dark'"
                    (click)="settings.setThemeMode('dark')"
                    role="radio"
                    [attr.aria-checked]="settings.themeMode() === 'dark'"
                  >Dark</button>
                  <button
                    class="toggle-btn"
                    [class.active]="settings.themeMode() === 'system'"
                    (click)="settings.setThemeMode('system')"
                    role="radio"
                    [attr.aria-checked]="settings.themeMode() === 'system'"
                  >Auto</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Personality -->
        <section>
          <h2 class="section-label">Personality</h2>
          <div class="settings-card">
            <div class="setting-group">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Sweary Labels</span>
                  <span class="setting-desc">Show bold, sweary weather descriptions on the home screen</span>
                </div>
                <button
                  class="switch"
                  [class.active]="settings.swearyLabels()"
                  (click)="settings.setSwearyLabels(!settings.swearyLabels())"
                  role="switch"
                  [attr.aria-checked]="settings.swearyLabels()"
                  aria-label="Toggle sweary labels"
                >
                  <span class="switch-thumb"></span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Accessibility -->
        <section>
          <h2 class="section-label">Accessibility</h2>
          <div class="settings-card">
            <div class="setting-group">
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
          </div>
        </section>

        <!-- About -->
        <section>
          <h2 class="section-label">About</h2>
          <div class="settings-card">
            <div class="about-section">
              <div class="about-header">
                <div class="about-logo">
                  <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
                    <defs>
                      <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#4DB8FF" />
                        <stop offset="100%" stop-color="#2D7FF9" />
                      </linearGradient>
                    </defs>
                    <circle cx="32" cy="32" r="28" fill="url(#logo-grad)" opacity="0.2"/>
                    <path d="M18 38 C18 38 16 28 26 26 C30 20 42 20 44 26 C50 26 52 32 50 36 C52 38 50 42 46 42 L20 42 C16 42 14 40 18 38 Z"
                          fill="url(#logo-grad)" opacity="0.9"/>
                  </svg>
                </div>
                <div>
                  <h3 class="about-title">Nimbus</h3>
                  <p class="about-version">v1.0.0 · Angular Frontend Showcase</p>
                </div>
              </div>
              <p class="about-desc">
                A production-quality weather visualization platform demonstrating modern Angular architecture, signal-based state management, and premium UI engineering.
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
                  <span class="tech-value">Vitest</span>
                </div>
                <div class="tech-item">
                  <span class="tech-label">Accessibility</span>
                  <span class="tech-value">WCAG 2.2 AA</span>
                </div>
                <div class="tech-item">
                  <span class="tech-label">PWA</span>
                  <span class="tech-value">Service Worker</span>
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
                  <li>CSS custom properties theming</li>
                  <li>Accessible combobox (WAI-ARIA)</li>
                  <li>Progressive Web App (PWA)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
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
      margin-bottom: var(--space-2);
    }

    .nav-btn {
      color: #1A1A1A;
      opacity: 0.7;
      padding: var(--space-2);
      cursor: pointer;
    }

    .page-title {
      font-size: var(--text-xl);
      font-weight: 900;
      color: #1A1A1A;
    }

    .page-content {
      padding: var(--space-6) var(--space-6) var(--space-8) var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    section {
      display: flex;
      flex-direction: column;
    }

    .section-label {
      font-size: 13px;
      font-weight: 800;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: var(--space-3);
    }

    .settings-card {
      background: transparent;
      padding: 0;
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
      padding: var(--space-5) 0;
      border-bottom: 1px solid var(--border-default);
    }
    .setting-row:first-child {
      padding-top: 0;
    }
    .setting-row:last-child {
      border-bottom: none;
    }
    .setting-info { flex: 1; }
    .setting-name {
      display: block;
      font-size: 22px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }
    .setting-desc {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-top: 6px;
      line-height: 1.4;
    }

    .toggle-group {
      display: flex;
      background: var(--border-subtle);
      border-radius: var(--radius-full);
      padding: 4px;
    }
    .toggle-btn {
      padding: var(--space-2) var(--space-4);
      font-size: 14px;
      font-weight: 700;
      color: var(--text-secondary);
      background: transparent;
      border: none;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
    }
    .toggle-btn:hover { color: var(--text-primary); }
    .toggle-btn.active {
      background: var(--bg-surface);
      color: var(--text-primary);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    /* Switch */
    .switch {
      position: relative;
      width: 56px;
      height: 32px;
      background: var(--border-default);
      border-radius: var(--radius-full);
      border: none;
      cursor: pointer;
      transition: background var(--duration-fast) var(--ease-default);
      flex-shrink: 0;
    }
    .switch.active {
      background: var(--accent);
    }
    .switch-thumb {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 24px;
      height: 24px;
      background: white;
      border-radius: 50%;
      transition: transform var(--duration-fast) var(--ease-bounce);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .switch.active .switch-thumb {
      transform: translateX(24px);
    }

    /* About */
    .about-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      padding-top: var(--space-4);
    }
    .about-header {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }
    .about-logo {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--border-subtle);
      border-radius: 20px;
    }
    .about-title {
      font-size: 32px;
      font-weight: 900;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -1px;
    }
    .about-version {
      font-size: 14px;
      font-weight: 600;
      color: var(--accent);
      margin-top: 4px;
    }
    .about-desc {
      font-size: 16px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
      font-weight: 500;
    }
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4) var(--space-6);
      padding: var(--space-5) 0;
      border-top: 1px solid var(--border-default);
      border-bottom: 1px solid var(--border-default);
      background: transparent;
    }
    .tech-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tech-label {
      font-size: 11px;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .tech-value {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }
    .architecture-list {
      border-top: 1px solid var(--border-subtle);
      padding-top: var(--space-4);
    }
    .architecture-list h4 {
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      color: var(--text-primary);
      margin-bottom: var(--space-3);
    }
    .architecture-list ul {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .architecture-list li {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      padding-left: var(--space-4);
      position: relative;
    }
    .architecture-list li::before {
      content: '▸';
      position: absolute;
      left: 0;
      color: var(--accent);
      font-size: var(--text-xs);
    }
  `],
})
export class SettingsComponent {
  readonly settings = inject(SettingsStore);
  readonly weather = inject(WeatherStore);

  readonly windUnits: { value: WindSpeedUnit; label: string }[] = [
    { value: 'kmh', label: 'km/h' },
    { value: 'mph', label: 'mph' },
    { value: 'ms', label: 'm/s' },
    { value: 'knots', label: 'kn' },
  ];
}
