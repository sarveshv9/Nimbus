import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsStore } from '../../core/state/settings.store';
import { WeatherStore } from '../../core/state/weather.store';
import { WindSpeedUnit, PressureUnit, DistanceUnit, TimeFormat, DefaultLocation, UserSettings } from '../../core/models/settings.model';

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
        @if (showToast()) {
          <div class="toast-notification">
            <i class="ph-fill ph-check-circle" style="color: var(--success); font-size: 20px;"></i>
            <span>Setting saved</span>
          </div>
        }

        <!-- Units -->
        <section id="units">
          <h2 class="section-label">Units</h2>
          <div class="settings-card">
            <div class="setting-group">
              <!-- Temperature -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Temperature</span>
                  <span class="setting-desc">Preferred temperature unit</span>
                </div>
                <div class="toggle-group" role="radiogroup" aria-label="Temperature unit">
                  <button class="toggle-btn" [class.active]="settings.temperatureUnit() === 'celsius'" (click)="updateTemp('celsius')" role="radio" [attr.aria-checked]="settings.temperatureUnit() === 'celsius'">°C</button>
                  <button class="toggle-btn" [class.active]="settings.temperatureUnit() === 'fahrenheit'" (click)="updateTemp('fahrenheit')" role="radio" [attr.aria-checked]="settings.temperatureUnit() === 'fahrenheit'">°F</button>
                </div>
              </div>

              <!-- Wind Speed -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Wind Speed</span>
                  <span class="setting-desc">Preferred wind speed unit</span>
                </div>
                <div class="toggle-group" role="radiogroup" aria-label="Wind speed unit">
                  @for (unit of windUnits; track unit.value) {
                    <button class="toggle-btn" [class.active]="settings.windSpeedUnit() === unit.value" (click)="updateWind(unit.value)" role="radio" [attr.aria-checked]="settings.windSpeedUnit() === unit.value">{{ unit.label }}</button>
                  }
                </div>
              </div>

              <!-- Pressure -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Pressure</span>
                  <span class="setting-desc">Preferred air pressure unit</span>
                </div>
                <div class="toggle-group" role="radiogroup" aria-label="Pressure unit">
                  <button class="toggle-btn" [class.active]="settings.pressureUnit() === 'hpa'" (click)="updatePressure('hpa')" role="radio" [attr.aria-checked]="settings.pressureUnit() === 'hpa'">hPa</button>
                  <button class="toggle-btn" [class.active]="settings.pressureUnit() === 'inhg'" (click)="updatePressure('inhg')" role="radio" [attr.aria-checked]="settings.pressureUnit() === 'inhg'">inHg</button>
                </div>
              </div>

              <!-- Distance -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Distance</span>
                  <span class="setting-desc">Visibility and distance unit</span>
                </div>
                <div class="toggle-group" role="radiogroup" aria-label="Distance unit">
                  <button class="toggle-btn" [class.active]="settings.distanceUnit() === 'km'" (click)="updateDistance('km')" role="radio" [attr.aria-checked]="settings.distanceUnit() === 'km'">km</button>
                  <button class="toggle-btn" [class.active]="settings.distanceUnit() === 'mi'" (click)="updateDistance('mi')" role="radio" [attr.aria-checked]="settings.distanceUnit() === 'mi'">miles</button>
                </div>
              </div>

              <!-- Time Format -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Time Format</span>
                  <span class="setting-desc">12-hour or 24-hour clock</span>
                </div>
                <div class="toggle-group" role="radiogroup" aria-label="Time format">
                  <button class="toggle-btn" [class.active]="settings.timeFormat() === '12h'" (click)="updateTimeFormat('12h')" role="radio" [attr.aria-checked]="settings.timeFormat() === '12h'">12h</button>
                  <button class="toggle-btn" [class.active]="settings.timeFormat() === '24h'" (click)="updateTimeFormat('24h')" role="radio" [attr.aria-checked]="settings.timeFormat() === '24h'">24h</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Appearance -->
        <section id="appearance">
          <h2 class="section-label">Appearance</h2>
          <div class="settings-card">
            <div class="setting-group">
              <!-- Theme -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Theme</span>
                  <span class="setting-desc">Choose app color scheme</span>
                </div>
                <div class="theme-swatch-group" role="radiogroup" aria-label="Theme mode">
                  <button class="theme-swatch" [class.active]="settings.themeMode() === 'light'" (click)="updateTheme('light')" role="radio" aria-label="Light theme">
                    <div class="swatch-preview light-swatch"></div>
                    <span>Light</span>
                  </button>
                  <button class="theme-swatch" [class.active]="settings.themeMode() === 'dark'" (click)="updateTheme('dark')" role="radio" aria-label="Dark theme">
                    <div class="swatch-preview dark-swatch"></div>
                    <span>Dark</span>
                  </button>
                  <button class="theme-swatch" [class.active]="settings.themeMode() === 'system'" (click)="updateTheme('system')" role="radio" aria-label="System theme">
                    <div class="swatch-preview system-swatch"></div>
                    <span>Auto</span>
                  </button>
                </div>
              </div>

              <!-- Sweary Labels -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Sweary Labels</span>
                  <span class="setting-desc">Show bold weather descriptions <span class="sweary-preview" [class.active]="settings.swearyLabels()">(e.g., "It's f*cking cold")</span></span>
                </div>
                <button class="switch" [class.active]="settings.swearyLabels()" (click)="toggleSweary()" role="switch" [attr.aria-checked]="settings.swearyLabels()" aria-label="Toggle sweary labels">
                  <span class="switch-thumb"></span>
                </button>
              </div>

              <!-- Reduced Motion -->
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Reduced Motion</span>
                  <span class="setting-desc">Disable UI transitions and background weather animations</span>
                </div>
                <button class="switch" [class.active]="settings.reducedMotion()" (click)="toggleMotion()" role="switch" [attr.aria-checked]="settings.reducedMotion()" aria-label="Toggle reduced motion">
                  <span class="switch-thumb"></span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Notifications -->
        <section id="notifications">
          <h2 class="section-label">Notifications</h2>
          <div class="settings-card">
            <div class="setting-group">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Severe Weather Alerts</span>
                  <span class="setting-desc">Get notified for dangerous conditions</span>
                </div>
                <button class="switch" [class.active]="settings.notifications().severeWeather" (click)="toggleNotification('severeWeather')" role="switch" [attr.aria-checked]="settings.notifications().severeWeather">
                  <span class="switch-thumb"></span>
                </button>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Daily Summary</span>
                  <span class="setting-desc">Morning forecast notifications</span>
                </div>
                <button class="switch" [class.active]="settings.notifications().dailySummary" (click)="toggleNotification('dailySummary')" role="switch" [attr.aria-checked]="settings.notifications().dailySummary">
                  <span class="switch-thumb"></span>
                </button>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Rain Alerts</span>
                  <span class="setting-desc">Notify when rain is starting soon</span>
                </div>
                <button class="switch" [class.active]="settings.notifications().rainAlerts" (click)="toggleNotification('rainAlerts')" role="switch" [attr.aria-checked]="settings.notifications().rainAlerts">
                  <span class="switch-thumb"></span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Data & Privacy -->
        <section id="data">
          <h2 class="section-label">Data & Privacy</h2>
          <div class="settings-card">
            <div class="setting-group">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">Default Location on Launch</span>
                  <span class="setting-desc">What to show when opening the app</span>
                </div>
                <select class="settings-select" [value]="settings.defaultLocationOnLaunch()" (change)="updateDefaultLocation($event)">
                  <option value="last_used">Last viewed location</option>
                  <option value="gps">Current GPS Location</option>
                  <option value="always_ask">Always ask</option>
                </select>
              </div>

              @if (geoDenied()) {
                <div class="setting-row bg-warning">
                  <div class="setting-info">
                    <span class="setting-name text-warning">Location Permission Denied</span>
                    <span class="setting-desc">To use GPS, please re-enable location access in your browser settings.</span>
                  </div>
                </div>
              }

              <a routerLink="/locations" class="setting-row clickable-row">
                <div class="setting-info">
                  <span class="setting-name">Manage Saved Locations</span>
                  <span class="setting-desc">Reorder, delete, or search locations</span>
                </div>
                <i class="ph ph-caret-right" style="font-size: 20px; opacity: 0.5;"></i>
              </a>

              <div class="setting-row clickable-row" (click)="resetApp()">
                <div class="setting-info">
                  <span class="setting-name text-danger">Clear Cache / Reset App</span>
                  <span class="setting-desc">Erase all saved locations and settings</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- About -->
        <section id="about">
          <h2 class="section-label">About</h2>
          <div class="settings-card">
            <div class="setting-group">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">App Version</span>
                  <span class="setting-desc">Nimbus v1.1.0</span>
                </div>
              </div>
              <a href="#" class="setting-row clickable-row" (click)="\$event.preventDefault()">
                <div class="setting-info">
                  <span class="setting-name">Privacy Policy</span>
                </div>
                <i class="ph ph-arrow-up-right" style="font-size: 16px; opacity: 0.5;"></i>
              </a>
              <a href="#" class="setting-row clickable-row" (click)="\$event.preventDefault()">
                <div class="setting-info">
                  <span class="setting-name">Terms of Service</span>
                </div>
                <i class="ph ph-arrow-up-right" style="font-size: 16px; opacity: 0.5;"></i>
              </a>
              <a href="#" class="setting-row clickable-row" (click)="\$event.preventDefault()">
                <div class="setting-info">
                  <span class="setting-name">Send Feedback</span>
                </div>
                <i class="ph ph-envelope-simple" style="font-size: 20px; opacity: 0.5;"></i>
              </a>
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
      background: var(--bg-surface);
      color: var(--text-primary);
      animation: fadeIn var(--duration-normal) var(--ease-decel);
      position: relative;
    }

    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 var(--space-4);
      margin-bottom: var(--space-4);
    }

    .nav-btn {
      color: inherit;
      opacity: 0.7;
      padding: var(--space-2);
      border-radius: var(--radius-full);
      transition: background var(--duration-fast);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .nav-btn:focus-visible {
      outline: 2px solid var(--accent);
      background: rgba(255, 255, 255, 0.1);
    }

    .location-header {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .page-title {
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: inherit;
      letter-spacing: -0.5px;
    }

    .page-content {
      flex: 1;
      padding: var(--space-4) var(--space-4) var(--space-12) var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
      position: relative;
      background: var(--bg-surface);
      border-radius: var(--radius-3xl) var(--radius-3xl) 0 0;
      margin-top: -20px;
    }

    section {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .section-label {
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      padding-left: var(--space-2);
    }

    .settings-card {
      background: var(--bg-card);
      border: var(--card-border);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .setting-group {
      display: flex;
      flex-direction: column;
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4);
      border-bottom: 1px solid var(--border-default);
      transition: background var(--duration-fast);
    }

    .setting-row:last-child {
      border-bottom: none;
    }

    .clickable-row {
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }
    .clickable-row:hover, .clickable-row:focus-visible {
      background: rgba(128, 128, 128, 0.05);
      outline: none;
    }
    
    .bg-warning {
      background: rgba(255, 160, 10, 0.1);
      border-left: 4px solid var(--warning);
    }

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      padding-right: var(--space-4);
    }

    .setting-name {
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .setting-desc {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .sweary-preview {
      display: none;
      font-style: italic;
      color: var(--accent);
    }
    .sweary-preview.active {
      display: inline;
    }

    /* Toggles */
    .toggle-group {
      display: flex;
      background: var(--border-default);
      border-radius: var(--radius-lg);
      padding: 4px;
      gap: 4px;
    }

    .toggle-btn {
      appearance: none;
      border: none;
      background: transparent;
      padding: 6px 12px;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--duration-fast);
      font-family: inherit;
    }

    .toggle-btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: -2px;
    }

    .toggle-btn.active {
      background: var(--bg-card);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }

    /* Switches */
    .switch {
      appearance: none;
      border: none;
      width: 44px;
      height: 24px;
      background: var(--border-default);
      border-radius: 12px;
      position: relative;
      cursor: pointer;
      transition: background 0.3s ease;
      padding: 0;
    }

    .switch:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
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
      background: #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .switch.active .switch-thumb {
      transform: translateX(20px);
    }
    
    /* Native Select styling */
    .settings-select {
      appearance: none;
      background: var(--border-default);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: 8px 32px 8px 12px;
      font-size: var(--text-sm);
      color: var(--text-primary);
      font-weight: var(--weight-medium);
      cursor: pointer;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
      background-repeat: no-repeat;
      background-position: right 8px center;
    }
    .settings-select:focus-visible {
      outline: 2px solid var(--accent);
    }

    /* Theme Swatches */
    .theme-swatch-group {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }
    
    .setting-row:has(.theme-swatch-group) {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .theme-swatch {
      background: transparent;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: var(--text-secondary);
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
    }
    
    .theme-swatch:focus-visible .swatch-preview {
      outline: 2px solid var(--accent);
      outline-offset: 4px;
    }
    
    .theme-swatch.active {
      color: var(--text-primary);
    }
    
    .theme-swatch.active .swatch-preview {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent);
    }
    
    .swatch-preview {
      width: 60px;
      height: 40px;
      border-radius: var(--radius-md);
      border: 2px solid var(--border-default);
      transition: all var(--duration-fast);
    }
    
    .light-swatch {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
    .dark-swatch {
      background: linear-gradient(135deg, #212529 0%, #000000 100%);
    }
    .system-swatch {
      background: linear-gradient(135deg, #f8f9fa 50%, #212529 50%);
    }

    .text-danger {
      color: var(--danger);
    }
    .text-warning {
      color: var(--warning);
    }

    /* Toast */
    .toast-notification {
      position: fixed;
      bottom: var(--space-8);
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-card);
      border: var(--card-border);
      padding: 12px 20px;
      border-radius: 30px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: var(--weight-medium);
      font-size: var(--text-sm);
      z-index: 1000;
      animation: toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes toastIn {
      from { opacity: 0; transform: translate(-50%, 20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
  `]
})
export class SettingsComponent {
  readonly settings = inject(SettingsStore);
  readonly weather = inject(WeatherStore);
  
  readonly showToast = signal(false);

  readonly windUnits: { value: WindSpeedUnit; label: string }[] = [
    { value: 'kmh', label: 'km/h' },
    { value: 'mph', label: 'mph' },
    { value: 'ms', label: 'm/s' },
    { value: 'knots', label: 'kn' },
  ];

  geoDenied(): boolean {
    return false; // Stub
  }
  
  private triggerFeedback() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 2000);
  }

  updateTemp(unit: 'celsius' | 'fahrenheit') {
    this.settings.setTemperatureUnit(unit);
    this.triggerFeedback();
  }
  
  updateWind(unit: WindSpeedUnit) {
    this.settings.setWindSpeedUnit(unit);
    this.triggerFeedback();
  }
  
  updatePressure(unit: PressureUnit) {
    this.settings.setPressureUnit(unit);
    this.triggerFeedback();
  }
  
  updateDistance(unit: DistanceUnit) {
    this.settings.setDistanceUnit(unit);
    this.triggerFeedback();
  }
  
  updateTimeFormat(format: TimeFormat) {
    this.settings.setTimeFormat(format);
    this.triggerFeedback();
  }
  
  updateTheme(theme: 'light' | 'dark' | 'system') {
    this.settings.setThemeMode(theme);
    this.triggerFeedback();
  }
  
  toggleSweary() {
    this.settings.setSwearyLabels(!this.settings.swearyLabels());
    this.triggerFeedback();
  }
  
  toggleMotion() {
    this.settings.setReducedMotion(!this.settings.reducedMotion());
    this.triggerFeedback();
  }
  
  toggleNotification(key: keyof UserSettings['notifications']) {
    const current = this.settings.notifications();
    this.settings.updateNotifications({ [key]: !current[key] });
    this.triggerFeedback();
  }
  
  updateDefaultLocation(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.settings.setDefaultLocationOnLaunch(select.value as DefaultLocation);
    this.triggerFeedback();
  }

  resetApp() {
    if (confirm('Are you sure you want to erase all settings and saved locations? This cannot be undone.')) {
      this.settings.resetApp();
    }
  }
}
