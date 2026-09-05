import { Component, input, inject, ChangeDetectionStrategy } from '@angular/core';
import { getWeatherMeta } from '../../../core/models/weather.model';
import { SettingsStore } from '../../../core/state/settings.store';

/**
 * 3D Cartoonish Weather Icon Component.
 * Features glossy, vibrant, 3D clay-like SVG illustrations with gradients,
 * highlights, drop shadows, and glowing effects matching the reference design.
 */
@Component({
  selector: 'nimbus-weather-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      [attr.aria-label]="ariaLabel"
      role="img"
      class="weather-svg"
      [class.animated]="!settings.reducedMotion()"
    >
      <defs>
        <!-- Filter for 3D Soft Shadows -->
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.25" />
        </filter>
        <filter id="lightning-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#FBBF24" flood-opacity="0.8" />
        </filter>
        <filter id="sun-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#F59E0B" flood-opacity="0.6" />
        </filter>
        <filter id="rain-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#38BDF8" flood-opacity="0.5" />
        </filter>

        <!-- 3D Cloud Gradients -->
        <linearGradient id="cloud-body" x1="60" y1="20" x2="60" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="60%" stop-color="#F1F5F9" />
          <stop offset="100%" stop-color="#CBD5E1" />
        </linearGradient>
        <linearGradient id="cloud-dark" x1="60" y1="20" x2="60" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#94A3B8" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
        <linearGradient id="cloud-highlight" x1="50" y1="25" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
        </linearGradient>

        <!-- 3D Sun Gradients -->
        <radialGradient id="sun-body" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#FFFBEB" />
          <stop offset="35%" stop-color="#FDE047" />
          <stop offset="75%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#D97706" />
        </radialGradient>
        <linearGradient id="sun-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="100%" stop-color="#F59E0B" />
        </linearGradient>

        <!-- 3D Lightning Gradients -->
        <linearGradient id="bolt-grad" x1="45" y1="35" x2="70" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FEF08A" />
          <stop offset="40%" stop-color="#FDE047" />
          <stop offset="85%" stop-color="#EAB308" />
          <stop offset="100%" stop-color="#CA8A04" />
        </linearGradient>

        <!-- 3D Raindrop Gradients -->
        <linearGradient id="rain-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7DD3FC" />
          <stop offset="50%" stop-color="#38BDF8" />
          <stop offset="100%" stop-color="#0284C7" />
        </linearGradient>

        <!-- 3D Moon Gradients -->
        <radialGradient id="moon-body" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#FEF9C3" />
          <stop offset="60%" stop-color="#FACC15" />
          <stop offset="100%" stop-color="#EAB308" />
        </radialGradient>
      </defs>

      @switch (iconName) {
        @case ('sun') {
          <!-- 3D Vibrant Cartoon Sun -->
          <g filter="url(#sun-glow)">
            <!-- Rays -->
            <g stroke="url(#sun-ray)" stroke-width="5" stroke-linecap="round">
              <line x1="60" y1="12" x2="60" y2="22" />
              <line x1="60" y1="98" x2="60" y2="108" />
              <line x1="12" y1="60" x2="22" y2="60" />
              <line x1="98" y1="60" x2="108" y2="60" />
              <line x1="26" y1="26" x2="33" y2="33" />
              <line x1="87" y1="87" x2="94" y2="94" />
              <line x1="26" y1="94" x2="33" y2="87" />
              <line x1="87" y1="33" x2="94" y2="26" />
            </g>
            <!-- Central Sun Sphere -->
            <circle cx="60" cy="60" r="28" fill="url(#sun-body)" filter="url(#soft-shadow)" />
            <!-- Specular Highlight -->
            <ellipse cx="50" cy="48" rx="10" ry="6" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 50 48)" />
          </g>
        }

        @case ('cloud-sun') {
          <!-- 3D Sun peeking behind 3D Cloud -->
          <!-- Sun in Background -->
          <g filter="url(#sun-glow)">
            <g stroke="url(#sun-ray)" stroke-width="4" stroke-linecap="round">
              <line x1="45" y1="12" x2="45" y2="20" />
              <line x1="18" y1="42" x2="26" y2="42" />
              <line x1="26" y1="23" x2="32" y2="29" />
              <line x1="64" y1="23" x2="58" y2="29" />
            </g>
            <circle cx="45" cy="42" r="22" fill="url(#sun-body)" />
            <ellipse cx="38" cy="33" rx="7" ry="4" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 38 33)" />
          </g>

          <!-- 3D Puffy Foreground Cloud -->
          <g filter="url(#soft-shadow)">
            <path
              d="M38 78 C30 78 24 72 24 64 C24 57 29 51 36 50 C38 40 48 32 60 32 C72 32 82 40 84 51 C92 51 98 57 98 65 C98 72 92 78 84 78 Z"
              fill="url(#cloud-body)"
            />
            <!-- Cloud Specular Highlight Pill -->
            <path
              d="M48 42 C54 36 66 36 72 42 C74 44 70 47 64 45 C58 43 52 44 48 42 Z"
              fill="#FFFFFF"
              opacity="0.8"
            />
            <ellipse cx="35" cy="58" rx="6" ry="3" fill="#FFFFFF" opacity="0.5" transform="rotate(-20 35 58)" />
          </g>
        }

        @case ('cloud') {
          <!-- 3D Fluffy Overcast Cloud (Back Darker + Front Glossy) -->
          <g filter="url(#soft-shadow)">
            <!-- Back Puff -->
            <path
              d="M34 68 C24 68 18 60 18 50 C18 41 24 35 32 34 C35 22 47 14 62 14 C77 14 89 24 92 36 C100 37 106 43 106 52 C106 61 99 68 90 68 Z"
              fill="url(#cloud-dark)"
              opacity="0.6"
              transform="translate(4, -6) scale(0.95)"
            />
            <!-- Main Front Cloud -->
            <path
              d="M34 82 C24 82 18 74 18 64 C18 55 24 49 32 48 C35 36 47 28 62 28 C77 28 89 38 92 50 C100 51 106 57 106 66 C106 75 99 82 90 82 Z"
              fill="url(#cloud-body)"
            />
            <!-- Specular Highlights -->
            <path
              d="M50 36 C57 32 67 32 74 36 C76 38 72 40 66 39 C60 38 54 38 50 36 Z"
              fill="#FFFFFF"
              opacity="0.85"
            />
            <ellipse cx="30" cy="56" rx="7" ry="3.5" fill="#FFFFFF" opacity="0.6" transform="rotate(-25 30 56)" />
          </g>
        }

        @case ('drizzle') {
          <!-- 3D Cloud + Cute Falling Droplets -->
          <g filter="url(#soft-shadow)">
            <path
              d="M32 68 C22 68 16 60 16 50 C16 41 22 35 30 34 C33 22 45 14 60 14 C75 14 87 24 90 36 C98 37 104 43 104 52 C104 61 97 68 88 68 Z"
              fill="url(#cloud-body)"
            />
            <path d="M48 22 C55 18 65 18 72 22" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.8" />
          </g>
          <!-- Raindrops -->
          <g filter="url(#rain-glow)">
            <path d="M40 80 L38 90 C37 92 35 94 33 94 C31 94 29 92 29 90 L31 80 C31 78 33 76 35 76 C37 76 39 78 40 80 Z" fill="url(#rain-grad)" />
            <path d="M64 80 L62 90 C61 92 59 94 57 94 C55 94 53 92 53 90 L55 80 C55 78 57 76 59 76 C61 76 63 78 64 80 Z" fill="url(#rain-grad)" />
            <path d="M88 80 L86 90 C85 92 83 94 81 94 C79 94 77 92 77 90 L79 80 C79 78 81 76 83 76 C85 76 87 78 88 80 Z" fill="url(#rain-grad)" />
          </g>
        }

        @case ('rain-light')
        @case ('rain') {
          <!-- 3D Cloud with Sun/Rain or Full Rain -->
          <g filter="url(#soft-shadow)">
            <path
              d="M32 64 C22 64 16 56 16 46 C16 37 22 31 30 30 C33 18 45 10 60 10 C75 10 87 20 90 32 C98 33 104 39 104 48 C104 57 97 64 88 64 Z"
              fill="url(#cloud-body)"
            />
            <path d="M48 18 C55 14 65 14 72 18" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.8" />
            <ellipse cx="28" cy="40" rx="6" ry="3" fill="#FFFFFF" opacity="0.6" transform="rotate(-25 28 40)" />
          </g>
          <!-- 3D Capsule Raindrops -->
          <g filter="url(#rain-glow)" transform="translate(0, 4)">
            <g transform="rotate(-15 36 82)">
              <rect x="33" y="74" width="7" height="18" rx="3.5" fill="url(#rain-grad)" />
              <ellipse cx="35" cy="78" rx="1.5" ry="3" fill="#FFFFFF" opacity="0.7" />
            </g>
            <g transform="rotate(-15 56 82)">
              <rect x="53" y="74" width="7" height="18" rx="3.5" fill="url(#rain-grad)" />
              <ellipse cx="55" cy="78" rx="1.5" ry="3" fill="#FFFFFF" opacity="0.7" />
            </g>
            <g transform="rotate(-15 76 82)">
              <rect x="73" y="74" width="7" height="18" rx="3.5" fill="url(#rain-grad)" />
              <ellipse cx="75" cy="78" rx="1.5" ry="3" fill="#FFFFFF" opacity="0.7" />
            </g>
            <g transform="rotate(-15 94 82)">
              <rect x="91" y="74" width="7" height="18" rx="3.5" fill="url(#rain-grad)" />
              <ellipse cx="93" cy="78" rx="1.5" ry="3" fill="#FFFFFF" opacity="0.7" />
            </g>
          </g>
        }

        @case ('rain-heavy') {
          <!-- Stormy 3D Cloud with Heavy Rain -->
          <g filter="url(#soft-shadow)">
            <path
              d="M32 64 C22 64 16 56 16 46 C16 37 22 31 30 30 C33 18 45 10 60 10 C75 10 87 20 90 32 C98 33 104 39 104 48 C104 57 97 64 88 64 Z"
              fill="url(#cloud-dark)"
            />
            <path d="M48 18 C55 14 65 14 72 18" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.4" />
          </g>
          <!-- Heavy Angled Droplets -->
          <g filter="url(#rain-glow)" transform="translate(0, 4)">
            <g transform="rotate(-20 30 84)"><rect x="27" y="72" width="7" height="22" rx="3.5" fill="url(#rain-grad)" /></g>
            <g transform="rotate(-20 50 84)"><rect x="47" y="72" width="7" height="22" rx="3.5" fill="url(#rain-grad)" /></g>
            <g transform="rotate(-20 70 84)"><rect x="67" y="72" width="7" height="22" rx="3.5" fill="url(#rain-grad)" /></g>
            <g transform="rotate(-20 90 84)"><rect x="87" y="72" width="7" height="22" rx="3.5" fill="url(#rain-grad)" /></g>
          </g>
        }

        @case ('snow-light')
        @case ('snow')
        @case ('snow-heavy') {
          <!-- 3D Cloud with Cartoon Snowflakes / Snowballs -->
          <g filter="url(#soft-shadow)">
            <path
              d="M32 66 C22 66 16 58 16 48 C16 39 22 33 30 32 C33 20 45 12 60 12 C75 12 87 22 90 34 C98 35 104 41 104 50 C104 59 97 66 88 66 Z"
              fill="url(#cloud-body)"
            />
            <path d="M48 20 C55 16 65 16 72 20" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.8" />
          </g>
          <!-- 3D Soft Snowballs -->
          <g filter="url(#soft-shadow)">
            <circle cx="34" cy="84" r="6" fill="#FFFFFF" />
            <circle cx="33" cy="83" r="2" fill="#E0F2FE" />
            <circle cx="60" cy="92" r="7" fill="#FFFFFF" />
            <circle cx="58" cy="90" r="2.5" fill="#E0F2FE" />
            <circle cx="86" cy="84" r="6" fill="#FFFFFF" />
            <circle cx="85" cy="83" r="2" fill="#E0F2FE" />
          </g>
        }

        @case ('thunderstorm') {
          <!-- EXACT Match to Reference Image: 3D Glossy Plump Cloud + Ambient Backlight Glow + Big Vibrant 3D Yellow Lightning Bolt -->
          
          <!-- Yellow Ambient Glow behind Cloud -->
          <circle cx="60" cy="55" r="32" fill="#FDE047" opacity="0.5" filter="url(#lightning-glow)" />

          <!-- Main Lightning Bolt in Front / Underneath with Glow -->
          <g filter="url(#lightning-glow)">
            <polygon
              points="64,44 48,72 62,72 50,110 82,66 66,66 78,44"
              fill="url(#bolt-grad)"
              stroke="#FEF08A"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
            <!-- Mini side lightning sparks -->
            <polygon points="36,66 28,82 36,82 30,94 44,76 36,76 42,66" fill="url(#bolt-grad)" opacity="0.9" />
            <polygon points="86,66 80,78 86,78 82,88 94,74 88,74 92,66" fill="url(#bolt-grad)" opacity="0.9" />
          </g>

          <!-- 3D Plump Glossy Cloud -->
          <g filter="url(#soft-shadow)">
            <path
              d="M32 64 C22 64 16 56 16 46 C16 37 22 31 30 30 C33 16 46 8 62 8 C78 8 90 18 94 32 C102 33 108 39 108 48 C108 57 101 64 92 64 Z"
              fill="url(#cloud-body)"
            />
            <!-- Specular Gloss on Top Cloud Curve -->
            <path
              d="M48 16 C56 12 68 12 76 16 C78 17 74 21 66 20 C58 19 51 20 48 16 Z"
              fill="#FFFFFF"
              opacity="0.9"
            />
            <!-- Secondary Left Lobe Highlight -->
            <ellipse cx="28" cy="38" rx="7" ry="4" fill="#FFFFFF" opacity="0.7" transform="rotate(-30 28 38)" />
            <!-- Secondary Right Lobe Highlight -->
            <ellipse cx="94" cy="42" rx="6" ry="3.5" fill="#FFFFFF" opacity="0.6" transform="rotate(25 94 42)" />
          </g>
        }

        @case ('fog') {
          <!-- 3D Cloud with Glossy Fog Capsules -->
          <g filter="url(#soft-shadow)">
            <path
              d="M34 60 C24 60 18 52 18 42 C18 33 24 27 32 26 C35 14 47 6 62 6 C77 6 89 16 92 28 C100 29 106 35 106 44 C106 53 99 60 90 60 Z"
              fill="url(#cloud-body)"
            />
            <path d="M50 14 C57 10 67 10 74 14" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.8" />
          </g>
          <!-- Floating Mist Bars -->
          <g opacity="0.75">
            <rect x="24" y="74" width="72" height="6" rx="3" fill="#E2E8F0" filter="url(#soft-shadow)" />
            <rect x="36" y="86" width="48" height="6" rx="3" fill="#E2E8F0" filter="url(#soft-shadow)" />
            <rect x="28" y="98" width="64" height="6" rx="3" fill="#E2E8F0" filter="url(#soft-shadow)" />
          </g>
        }

        @default {
          <!-- Default 3D Sun or Moon depending on isDay -->
          @if (isDay()) {
            <g filter="url(#sun-glow)">
              <circle cx="60" cy="60" r="28" fill="url(#sun-body)" filter="url(#soft-shadow)" />
              <ellipse cx="50" cy="48" rx="10" ry="6" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 50 48)" />
            </g>
          } @else {
            <g filter="url(#soft-shadow)">
              <path
                d="M45 25 C45 25 35 45 50 65 C65 85 85 75 85 75 C85 75 70 95 45 90 C20 85 15 55 30 35 C38 25 45 25 45 25 Z"
                fill="url(#moon-body)"
              />
              <circle cx="75" cy="30" r="3" fill="#FEF08A" />
              <circle cx="85" cy="45" r="2" fill="#FEF08A" />
              <circle cx="25" cy="70" r="2" fill="#FEF08A" />
            </g>
          }
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
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
    }
    .weather-svg {
      display: block;
      overflow: visible;
    }
    .weather-svg.animated {
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
  `],
})
export class WeatherIcon {
  readonly weatherCode = input<number>(0);
  readonly isDay = input<boolean>(true);
  readonly size = input<number>(48);
  readonly settings = inject(SettingsStore);

  get iconName(): string {
    return getWeatherMeta(this.weatherCode()).icon;
  }

  get ariaLabel(): string {
    return getWeatherMeta(this.weatherCode()).label;
  }
}

