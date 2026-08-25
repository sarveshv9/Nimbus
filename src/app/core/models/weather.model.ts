/**
 * Weather data models for Open-Meteo API responses and internal state.
 */

// === WEATHER CONDITIONS ===

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'foggy'
  | 'drizzle'
  | 'rain'
  | 'freezing-rain'
  | 'snow'
  | 'snow-grains'
  | 'rain-showers'
  | 'snow-showers'
  | 'thunderstorm'
  | 'unknown';

export type WeatherTheme = 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'night';

export interface WeatherConditionMeta {
  readonly condition: WeatherCondition;
  readonly label: string;
  readonly icon: string;
  readonly theme: WeatherTheme;
}

/**
 * Maps WMO weather interpretation codes to internal weather conditions.
 * Reference: https://open-meteo.com/en/docs (WMO Code Table)
 */
export const WMO_CODE_MAP: Record<number, WeatherConditionMeta> = {
  0:  { condition: 'clear',         label: 'Clear sky',              icon: 'sun',            theme: 'clear' },
  1:  { condition: 'clear',         label: 'Mainly clear',           icon: 'sun',            theme: 'clear' },
  2:  { condition: 'partly-cloudy', label: 'Partly cloudy',          icon: 'cloud-sun',      theme: 'clear' },
  3:  { condition: 'cloudy',        label: 'Overcast',               icon: 'cloud',          theme: 'cloudy' },
  45: { condition: 'foggy',         label: 'Foggy',                  icon: 'fog',            theme: 'cloudy' },
  48: { condition: 'foggy',         label: 'Depositing rime fog',    icon: 'fog',            theme: 'cloudy' },
  51: { condition: 'drizzle',       label: 'Light drizzle',          icon: 'drizzle',        theme: 'rain' },
  53: { condition: 'drizzle',       label: 'Moderate drizzle',       icon: 'drizzle',        theme: 'rain' },
  55: { condition: 'drizzle',       label: 'Dense drizzle',          icon: 'drizzle',        theme: 'rain' },
  56: { condition: 'freezing-rain', label: 'Light freezing drizzle', icon: 'freezing-rain',  theme: 'rain' },
  57: { condition: 'freezing-rain', label: 'Dense freezing drizzle', icon: 'freezing-rain',  theme: 'rain' },
  61: { condition: 'rain',          label: 'Slight rain',            icon: 'rain-light',     theme: 'rain' },
  63: { condition: 'rain',          label: 'Moderate rain',          icon: 'rain',           theme: 'rain' },
  65: { condition: 'rain',          label: 'Heavy rain',             icon: 'rain-heavy',     theme: 'rain' },
  66: { condition: 'freezing-rain', label: 'Light freezing rain',    icon: 'freezing-rain',  theme: 'rain' },
  67: { condition: 'freezing-rain', label: 'Heavy freezing rain',    icon: 'freezing-rain',  theme: 'rain' },
  71: { condition: 'snow',          label: 'Slight snowfall',        icon: 'snow-light',     theme: 'snow' },
  73: { condition: 'snow',          label: 'Moderate snowfall',      icon: 'snow',           theme: 'snow' },
  75: { condition: 'snow',          label: 'Heavy snowfall',         icon: 'snow-heavy',     theme: 'snow' },
  77: { condition: 'snow-grains',   label: 'Snow grains',            icon: 'snow-grains',    theme: 'snow' },
  80: { condition: 'rain-showers',  label: 'Slight rain showers',    icon: 'rain-light',     theme: 'rain' },
  81: { condition: 'rain-showers',  label: 'Moderate rain showers',  icon: 'rain',           theme: 'rain' },
  82: { condition: 'rain-showers',  label: 'Violent rain showers',   icon: 'rain-heavy',     theme: 'storm' },
  85: { condition: 'snow-showers',  label: 'Slight snow showers',    icon: 'snow-light',     theme: 'snow' },
  86: { condition: 'snow-showers',  label: 'Heavy snow showers',     icon: 'snow-heavy',     theme: 'snow' },
  95: { condition: 'thunderstorm',  label: 'Thunderstorm',           icon: 'thunderstorm',   theme: 'storm' },
  96: { condition: 'thunderstorm',  label: 'Thunderstorm with hail', icon: 'thunderstorm',   theme: 'storm' },
  99: { condition: 'thunderstorm',  label: 'Severe thunderstorm',    icon: 'thunderstorm',   theme: 'storm' },
};

export const UNKNOWN_CONDITION: WeatherConditionMeta = {
  condition: 'unknown',
  label: 'Unknown',
  icon: 'cloud',
  theme: 'cloudy',
};

export function getWeatherMeta(code: number | null | undefined): WeatherConditionMeta {
  if (code == null) return UNKNOWN_CONDITION;
  return WMO_CODE_MAP[code] ?? UNKNOWN_CONDITION;
}

export function resolveWeatherTheme(code: number | null | undefined, isNight: boolean): WeatherTheme {
  if (isNight) return 'night';
  return getWeatherMeta(code).theme;
}

// === CURRENT WEATHER ===

export interface CurrentWeather {
  readonly temperature: number;
  readonly feelsLike: number;
  readonly humidity: number;
  readonly precipitation: number;
  readonly weatherCode: number;
  readonly cloudCover: number;
  readonly pressure: number;
  readonly windSpeed: number;
  readonly windDirection: number;
  readonly windGusts: number;
  readonly uvIndex: number;
  readonly visibility: number;
  readonly isDay: boolean;
  readonly time: string;
}

// === HOURLY FORECAST ===

export interface HourlyForecast {
  readonly time: string;
  readonly temperature: number;
  readonly feelsLike: number;
  readonly humidity: number;
  readonly precipitationProbability: number;
  readonly precipitation: number;
  readonly weatherCode: number;
  readonly cloudCover: number;
  readonly visibility: number;
  readonly windSpeed: number;
  readonly windDirection: number;
  readonly uvIndex: number;
  readonly isDay: boolean;
}

// === DAILY FORECAST ===

export interface DailyForecast {
  readonly date: string;
  readonly weatherCode: number;
  readonly tempMax: number;
  readonly tempMin: number;
  readonly feelsLikeMax: number;
  readonly feelsLikeMin: number;
  readonly sunrise: string;
  readonly sunset: string;
  readonly uvIndexMax: number;
  readonly precipitationSum: number;
  readonly precipitationProbabilityMax: number;
  readonly windSpeedMax: number;
  readonly windDirectionDominant: number;
}

// === AIR QUALITY ===

export interface AirQuality {
  readonly usAqi: number | null;
  readonly europeanAqi: number | null;
  readonly pm25: number | null;
  readonly pm10: number | null;
}

export type AqiCategory = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export interface AqiCategoryMeta {
  readonly label: string;
  readonly color: string;
  readonly min: number;
  readonly max: number;
}

export const US_AQI_CATEGORIES: AqiCategoryMeta[] = [
  { label: 'Good',                          color: 'hsl(120, 60%, 45%)', min: 0,   max: 50 },
  { label: 'Moderate',                      color: 'hsl(48, 90%, 50%)',  min: 51,  max: 100 },
  { label: 'Unhealthy for Sensitive Groups', color: 'hsl(30, 85%, 55%)', min: 101, max: 150 },
  { label: 'Unhealthy',                     color: 'hsl(0, 70%, 50%)',   min: 151, max: 200 },
  { label: 'Very Unhealthy',                color: 'hsl(280, 60%, 40%)', min: 201, max: 300 },
  { label: 'Hazardous',                     color: 'hsl(0, 80%, 30%)',   min: 301, max: 500 },
];

export function getAqiCategory(aqi: number): AqiCategoryMeta {
  return US_AQI_CATEGORIES.find(c => aqi >= c.min && aqi <= c.max) ?? US_AQI_CATEGORIES[5];
}

// === COMBINED WEATHER DATA ===

export interface WeatherData {
  readonly current: CurrentWeather;
  readonly hourly: HourlyForecast[];
  readonly daily: DailyForecast[];
  readonly airQuality: AirQuality | null;
}

// === ERROR TYPES ===

export type WeatherErrorType =
  | 'network'
  | 'api'
  | 'location-invalid'
  | 'rate-limit'
  | 'geolocation-denied'
  | 'geolocation-unavailable'
  | 'unknown';

export interface WeatherError {
  readonly type: WeatherErrorType;
  readonly message: string;
}
