/**
 * Settings data models for user preferences.
 */

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms' | 'knots';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserSettings {
  readonly temperatureUnit: TemperatureUnit;
  readonly windSpeedUnit: WindSpeedUnit;
  readonly themeMode: ThemeMode;
  readonly reducedMotion: boolean;
  readonly swearyLabels: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  themeMode: 'system',
  reducedMotion: false,
  swearyLabels: true,
};

// === UNIT CONVERSION ===

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const value = convertTemperature(celsius, unit);
  return `${value}°`;
}

export function temperatureUnitLabel(unit: TemperatureUnit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function convertWindSpeed(kmh: number, unit: WindSpeedUnit): number {
  switch (unit) {
    case 'mph':   return Math.round(kmh * 0.621371);
    case 'ms':    return Math.round(kmh / 3.6 * 10) / 10;
    case 'knots': return Math.round(kmh * 0.539957);
    default:      return Math.round(kmh);
  }
}

export function formatWindSpeed(kmh: number, unit: WindSpeedUnit): string {
  const value = convertWindSpeed(kmh, unit);
  const labels: Record<WindSpeedUnit, string> = {
    kmh: 'km/h',
    mph: 'mph',
    ms: 'm/s',
    knots: 'kn',
  };
  return `${value} ${labels[unit]}`;
}

export function windDirectionLabel(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export function uvIndexLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

export function uvIndexColor(uv: number): string {
  if (uv <= 2) return 'hsl(120, 60%, 45%)';
  if (uv <= 5) return 'hsl(48, 90%, 50%)';
  if (uv <= 7) return 'hsl(30, 85%, 55%)';
  if (uv <= 10) return 'hsl(0, 70%, 50%)';
  return 'hsl(280, 60%, 40%)';
}

export function visibilityLabel(meters: number): string {
  if (meters >= 10000) return 'Excellent';
  if (meters >= 5000) return 'Good';
  if (meters >= 2000) return 'Moderate';
  if (meters >= 1000) return 'Poor';
  return 'Very Poor';
}

export function pressureLabel(hpa: number): string {
  if (hpa >= 1020) return 'High';
  if (hpa >= 1010) return 'Normal';
  return 'Low';
}
