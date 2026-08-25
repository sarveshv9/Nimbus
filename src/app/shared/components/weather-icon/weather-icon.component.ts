import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { getWeatherMeta } from '../../../core/models/weather.model';

/**
 * SVG-based weather icon component.
 * Renders inline SVG icons based on weather code, supporting day/night variants.
 */
@Component({
  selector: 'nimbus-weather-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      [attr.aria-label]="ariaLabel"
      role="img"
    >
      @switch (iconName) {
        @case ('sun') {
          <!-- Sun -->
          <circle cx="32" cy="32" r="12" fill="#FBBF24" />
          <g stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round">
            <line x1="32" y1="6" x2="32" y2="14" />
            <line x1="32" y1="50" x2="32" y2="58" />
            <line x1="6" y1="32" x2="14" y2="32" />
            <line x1="50" y1="32" x2="58" y2="32" />
            <line x1="13.6" y1="13.6" x2="19.3" y2="19.3" />
            <line x1="44.7" y1="44.7" x2="50.4" y2="50.4" />
            <line x1="13.6" y1="50.4" x2="19.3" y2="44.7" />
            <line x1="44.7" y1="19.3" x2="50.4" y2="13.6" />
          </g>
        }
        @case ('cloud-sun') {
          <!-- Partly Cloudy -->
          <circle cx="24" cy="22" r="9" fill="#FBBF24" />
          <g stroke="#FBBF24" stroke-width="2" stroke-linecap="round">
            <line x1="24" y1="6" x2="24" y2="11" />
            <line x1="10" y1="22" x2="5" y2="22" />
            <line x1="12" y1="11" x2="15.5" y2="14.5" />
            <line x1="36" y1="11" x2="32.5" y2="14.5" />
          </g>
          <path d="M20 46 C20 46 18 36 28 34 C32 28 44 28 46 34 C52 34 54 40 52 44 C54 46 52 50 48 50 L22 50 C18 50 16 48 20 46 Z" fill="var(--text-muted, #94A3B8)" opacity="0.9" />
        }
        @case ('cloud') {
          <!-- Overcast -->
          <path d="M16 42 C16 42 14 32 24 30 C28 24 40 24 42 30 C48 30 50 36 48 40 C50 42 48 46 44 46 L18 46 C14 46 12 44 16 42 Z" fill="var(--text-muted, #94A3B8)" opacity="0.85" />
          <path d="M24 38 C24 38 22 30 30 28 C33 23 43 23 45 28 C50 28 52 33 50 36 C52 38 50 42 46 42 L26 42 C22 42 20 40 24 38 Z" fill="var(--text-secondary, #64748B)" opacity="0.75" />
        }
        @case ('fog') {
          <!-- Foggy -->
          <g stroke="var(--text-muted, #94A3B8)" stroke-width="2.5" stroke-linecap="round" opacity="0.7">
            <line x1="12" y1="26" x2="52" y2="26" />
            <line x1="16" y1="32" x2="48" y2="32" />
            <line x1="12" y1="38" x2="52" y2="38" />
            <line x1="18" y1="44" x2="46" y2="44" />
          </g>
        }
        @case ('drizzle') {
          <!-- Drizzle -->
          <path d="M18 34 C18 34 16 26 26 24 C30 18 42 18 44 24 C50 24 52 30 50 34 C52 36 50 38 46 38 L20 38 C16 38 14 36 18 34 Z" fill="var(--text-muted, #94A3B8)" opacity="0.8" />
          <g stroke="#60A5FA" stroke-width="1.5" stroke-linecap="round" opacity="0.6">
            <line x1="24" y1="42" x2="22" y2="48" />
            <line x1="32" y1="42" x2="30" y2="48" />
            <line x1="40" y1="42" x2="38" y2="48" />
          </g>
        }
        @case ('rain-light') {
          <!-- Light Rain -->
          <path d="M18 32 C18 32 16 24 26 22 C30 16 42 16 44 22 C50 22 52 28 50 32 C52 34 50 36 46 36 L20 36 C16 36 14 34 18 32 Z" fill="var(--text-muted, #94A3B8)" opacity="0.85" />
          <g stroke="#3B82F6" stroke-width="2" stroke-linecap="round" opacity="0.7">
            <line x1="22" y1="40" x2="20" y2="48" />
            <line x1="30" y1="40" x2="28" y2="48" />
            <line x1="38" y1="42" x2="36" y2="50" />
          </g>
        }
        @case ('rain') {
          <!-- Moderate Rain -->
          <path d="M18 30 C18 30 16 22 26 20 C30 14 42 14 44 20 C50 20 52 26 50 30 C52 32 50 34 46 34 L20 34 C16 34 14 32 18 30 Z" fill="#64748B" opacity="0.9" />
          <g stroke="#3B82F6" stroke-width="2" stroke-linecap="round">
            <line x1="20" y1="38" x2="17" y2="48" />
            <line x1="28" y1="38" x2="25" y2="48" />
            <line x1="36" y1="40" x2="33" y2="50" />
            <line x1="44" y1="38" x2="41" y2="48" />
          </g>
        }
        @case ('rain-heavy') {
          <!-- Heavy Rain -->
          <path d="M16 28 C16 28 14 20 24 18 C28 12 40 12 42 18 C48 18 50 24 48 28 C50 30 48 32 44 32 L18 32 C14 32 12 30 16 28 Z" fill="#475569" opacity="0.95" />
          <g stroke="#2563EB" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="36" x2="14" y2="48" />
            <line x1="26" y1="36" x2="22" y2="48" />
            <line x1="34" y1="36" x2="30" y2="48" />
            <line x1="42" y1="38" x2="38" y2="50" />
            <line x1="50" y1="36" x2="46" y2="48" />
          </g>
        }
        @case ('snow-light') {
          <!-- Light Snow -->
          <path d="M18 32 C18 32 16 24 26 22 C30 16 42 16 44 22 C50 22 52 28 50 32 C52 34 50 36 46 36 L20 36 C16 36 14 34 18 32 Z" fill="var(--text-muted, #94A3B8)" opacity="0.8" />
          <g fill="#BFDBFE" opacity="0.8">
            <circle cx="24" cy="44" r="2" />
            <circle cx="34" cy="46" r="2" />
            <circle cx="42" cy="42" r="2" />
          </g>
        }
        @case ('snow') {
          <!-- Snow -->
          <path d="M18 30 C18 30 16 22 26 20 C30 14 42 14 44 20 C50 20 52 26 50 30 C52 32 50 34 46 34 L20 34 C16 34 14 32 18 30 Z" fill="#94A3B8" opacity="0.85" />
          <g fill="#DBEAFE">
            <circle cx="20" cy="40" r="2.5" />
            <circle cx="30" cy="44" r="2.5" />
            <circle cx="40" cy="40" r="2.5" />
            <circle cx="25" cy="50" r="2" />
            <circle cx="36" cy="52" r="2" />
            <circle cx="46" cy="48" r="2" />
          </g>
        }
        @case ('snow-heavy') {
          <!-- Heavy Snow -->
          <path d="M16 28 C16 28 14 20 24 18 C28 12 40 12 42 18 C48 18 50 24 48 28 C50 30 48 32 44 32 L18 32 C14 32 12 30 16 28 Z" fill="#94A3B8" opacity="0.9" />
          <g fill="#DBEAFE">
            <circle cx="16" cy="38" r="2.5" />
            <circle cx="24" cy="42" r="3" />
            <circle cx="34" cy="38" r="2.5" />
            <circle cx="44" cy="42" r="3" />
            <circle cx="20" cy="50" r="2.5" />
            <circle cx="30" cy="52" r="2.5" />
            <circle cx="40" cy="50" r="2.5" />
            <circle cx="50" cy="38" r="2" />
          </g>
        }
        @case ('thunderstorm') {
          <!-- Thunderstorm -->
          <path d="M16 28 C16 28 14 20 24 18 C28 12 40 12 42 18 C48 18 50 24 48 28 C50 30 48 32 44 32 L18 32 C14 32 12 30 16 28 Z" fill="#475569" opacity="0.95" />
          <polygon points="30,34 26,44 32,44 28,56 38,42 32,42 36,34" fill="#FBBF24" />
          <g stroke="#3B82F6" stroke-width="2" stroke-linecap="round" opacity="0.6">
            <line x1="18" y1="36" x2="15" y2="46" />
            <line x1="46" y1="36" x2="43" y2="46" />
          </g>
        }
        @default {
          <!-- Default cloud -->
          <path d="M18 38 C18 38 16 28 26 26 C30 20 42 20 44 26 C50 26 52 32 50 36 C52 38 50 42 46 42 L20 42 C16 42 14 40 18 38 Z" fill="var(--text-muted, #94A3B8)" opacity="0.8" />
        }
      }
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    svg {
      display: block;
    }
  `],
})
export class WeatherIcon {
  readonly weatherCode = input<number>(0);
  readonly isDay = input<boolean>(true);
  readonly size = input<number>(48);

  get iconName(): string {
    return getWeatherMeta(this.weatherCode()).icon;
  }

  get ariaLabel(): string {
    return getWeatherMeta(this.weatherCode()).label;
  }
}
