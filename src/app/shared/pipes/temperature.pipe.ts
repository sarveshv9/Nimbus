import { Pipe, PipeTransform, inject } from '@angular/core';
import { SettingsStore } from '../../core/state/settings.store';
import { convertTemperature, formatTemperature } from '../../core/models/settings.model';

@Pipe({ name: 'temperature', pure: false })
export class TemperaturePipe implements PipeTransform {
  private readonly settings = inject(SettingsStore);

  transform(celsius: number | null | undefined, format: 'value' | 'full' = 'full'): string {
    if (celsius == null) return '--°';
    const unit = this.settings.temperatureUnit();
    if (format === 'value') {
      return convertTemperature(celsius, unit).toString();
    }
    return formatTemperature(celsius, unit);
  }
}
