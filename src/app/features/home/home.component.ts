import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { WeatherStore } from '../../core/state/weather.store';
import { SettingsStore } from '../../core/state/settings.store';
import { LocationStore } from '../../core/state/location.store';
import { formatLocationShort } from '../../core/models/location.model';
import { convertTemperature, formatTemperature, windDirectionLabel, uvIndexLabel, uvIndexColor, visibilityLabel } from '../../core/models/settings.model';
import { getWeatherMeta, getSwearyLabel } from '../../core/models/weather.model';
import { WeatherIcon } from '../../shared/components/weather-icon/weather-icon.component';
import { Skeleton } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { WindSpeedPipe } from '../../shared/pipes/wind-speed.pipe';
import { TemperaturePipe } from '../../shared/pipes/temperature.pipe';

@Component({
  selector: 'nimbus-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, WeatherIcon, Skeleton, WindSpeedPipe, TemperaturePipe, LowerCasePipe, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly weather = inject(WeatherStore);
  readonly settings = inject(SettingsStore);
  private readonly locationStore = inject(LocationStore);

  readonly formatLocationShort = formatLocationShort;
  readonly convertTemp = convertTemperature;
  readonly formatTemp = formatTemperature;
  readonly getWeatherMeta = getWeatherMeta;
  readonly getSwearyLabel = getSwearyLabel;
  readonly windDirectionLabel = windDirectionLabel;
  readonly uvIndexLabel = uvIndexLabel;
  readonly uvIndexColor = uvIndexColor;
  readonly visibilityLabel = visibilityLabel;
  readonly Math = Math;

  get locationName(): string {
    const loc = this.weather.selectedLocation();
    return loc ? loc.name : 'Loading...';
  }

  get locationRegion(): string {
    const loc = this.weather.selectedLocation();
    if (!loc) return '';
    return loc.admin1 ? `${loc.admin1}, ${loc.country}` : loc.country;
  }

  get currentDay(): string {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
    }).toUpperCase();
  }

  get currentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  get currentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  }

  formatHour(time: string): string {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  }

  formatDay(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  formatSunTime(time: string | null): string {
    if (!time) return '--:--';
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  /** Calculates the sun's position along the arc as a 0–1 fraction */
  get sunPosition(): number {
    const sunrise = this.weather.todaySunrise();
    const sunset = this.weather.todaySunset();
    if (!sunrise || !sunset) return 0.5;

    const now = Date.now();
    const rise = new Date(sunrise).getTime();
    const set = new Date(sunset).getTime();

    if (now < rise) return 0;
    if (now > set) return 1;
    return (now - rise) / (set - rise);
  }

  /** Returns temperature bar width as % for daily forecast */
  tempBarStyle(min: number, max: number): { left: string; width: string } {
    const daily = this.weather.dailyForecast();
    if (!daily.length) return { left: '0%', width: '100%' };

    const weekMin = Math.min(...daily.map(d => d.tempMin));
    const weekMax = Math.max(...daily.map(d => d.tempMax));
    const range = weekMax - weekMin || 1;

    const left = ((min - weekMin) / range) * 100;
    const width = ((max - min) / range) * 100;

    return {
      left: `${left}%`,
      width: `${Math.max(width, 8)}%`,
    };
  }

  toggleSaveLocation(): void {
    const loc = this.weather.selectedLocation();
    if (!loc) return;
    if (this.locationStore.isLocationSaved(loc.id)) {
      this.locationStore.removeLocation(loc.id);
    } else {
      this.locationStore.saveLocation(loc);
    }
  }

  get isCurrentLocationSaved(): boolean {
    const loc = this.weather.selectedLocation();
    return loc ? this.locationStore.isLocationSaved(loc.id) : false;
  }
}
