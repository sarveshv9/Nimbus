import { Pipe, PipeTransform } from '@angular/core';
import { getWeatherMeta } from '../../core/models/weather.model';

@Pipe({ name: 'weatherLabel' })
export class WeatherLabelPipe implements PipeTransform {
  transform(weatherCode: number | null | undefined): string {
    return getWeatherMeta(weatherCode).label;
  }
}
