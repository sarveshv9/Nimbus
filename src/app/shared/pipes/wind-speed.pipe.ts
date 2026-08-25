import { Pipe, PipeTransform, inject } from '@angular/core';
import { SettingsStore } from '../../core/state/settings.store';
import { formatWindSpeed } from '../../core/models/settings.model';

@Pipe({ name: 'windSpeed', pure: false })
export class WindSpeedPipe implements PipeTransform {
  private readonly settings = inject(SettingsStore);

  transform(kmh: number | null | undefined): string {
    if (kmh == null) return '--';
    return formatWindSpeed(kmh, this.settings.windSpeedUnit());
  }
}
