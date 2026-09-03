import { Injectable, signal, computed, effect, inject } from '@angular/core';
import {
  UserSettings,
  DEFAULT_SETTINGS,
  TemperatureUnit,
  WindSpeedUnit,
  ThemeMode,
} from '../models/settings.model';
import { StorageService } from '../services/storage.service';

const STORAGE_KEY = 'nimbus-settings';
const THEME_KEY = 'nimbus-theme';

@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private readonly storage = inject(StorageService);

  // === PRIMARY STATE ===
  readonly temperatureUnit = signal<TemperatureUnit>(DEFAULT_SETTINGS.temperatureUnit);
  readonly windSpeedUnit = signal<WindSpeedUnit>(DEFAULT_SETTINGS.windSpeedUnit);
  readonly themeMode = signal<ThemeMode>(DEFAULT_SETTINGS.themeMode);
  readonly reducedMotion = signal(DEFAULT_SETTINGS.reducedMotion);
  readonly swearyLabels = signal(DEFAULT_SETTINGS.swearyLabels);


  // === DERIVED STATE ===
  readonly resolvedTheme = computed(() => {
    const mode = this.themeMode();
    if (mode === 'system') {
      return typeof window !== 'undefined' &&
             window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';
    }
    return mode;
  });

  readonly temperatureLabel = computed(() =>
    this.temperatureUnit() === 'fahrenheit' ? '°F' : '°C'
  );

  constructor() {
    // Hydrate from localStorage
    this.hydrate();

    // Listen for system theme changes
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      try {
        window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', () => {
            if (this.themeMode() === 'system') {
              this.applyTheme();
            }
          });
      } catch {
        // matchMedia event listener not supported in this environment
      }
    }

    // Persist settings on change
    effect(() => {
      const settings: UserSettings = {
        temperatureUnit: this.temperatureUnit(),
        windSpeedUnit: this.windSpeedUnit(),
        themeMode: this.themeMode(),
        reducedMotion: this.reducedMotion(),
        swearyLabels: this.swearyLabels(),
      };
      this.storage.set(STORAGE_KEY, settings);
    });

    // Apply theme to DOM
    effect(() => {
      this.applyTheme();
    });

    // Apply reduced motion
    effect(() => {
      if (this.reducedMotion()) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    });
  }

  // === ACTIONS ===

  setTemperatureUnit(unit: TemperatureUnit): void {
    this.temperatureUnit.set(unit);
  }

  setWindSpeedUnit(unit: WindSpeedUnit): void {
    this.windSpeedUnit.set(unit);
  }

  setThemeMode(mode: ThemeMode): void {
    this.themeMode.set(mode);
  }

  toggleTheme(): void {
    const current = this.resolvedTheme();
    this.themeMode.set(current === 'dark' ? 'light' : 'dark');
  }

  setReducedMotion(enabled: boolean): void {
    this.reducedMotion.set(enabled);
  }

  setSwearyLabels(enabled: boolean): void {
    this.swearyLabels.set(enabled);
  }

  // === PRIVATE ===

  private hydrate(): void {
    const saved = this.storage.get<UserSettings>(STORAGE_KEY);
    if (saved) {
      this.temperatureUnit.set(saved.temperatureUnit ?? DEFAULT_SETTINGS.temperatureUnit);
      this.windSpeedUnit.set(saved.windSpeedUnit ?? DEFAULT_SETTINGS.windSpeedUnit);
      this.themeMode.set(saved.themeMode ?? DEFAULT_SETTINGS.themeMode);
      this.reducedMotion.set(saved.reducedMotion ?? DEFAULT_SETTINGS.reducedMotion);
      this.swearyLabels.set(saved.swearyLabels ?? DEFAULT_SETTINGS.swearyLabels);
    }
  }

  private applyTheme(): void {
    const theme = this.resolvedTheme();
    document.documentElement.setAttribute('data-theme', theme);
    this.storage.set(THEME_KEY, theme);
  }
}
