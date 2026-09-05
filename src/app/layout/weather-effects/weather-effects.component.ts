import { Component, input, inject, ChangeDetectionStrategy } from '@angular/core';
import { WeatherTheme } from '../../core/models/weather.model';
import { SettingsStore } from '../../core/state/settings.store';

/**
 * Animated weather effects overlay layer.
 * Renders CSS-only atmospheric effects based on the current weather theme.
 * The effects are purely decorative and positioned behind the main content.
 */
@Component({
  selector: 'nimbus-weather-effects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="effects-layer" [attr.data-weather]="weatherTheme()">
      <!-- Atmospheric gradient background -->
      <div class="atmosphere"></div>

      @if (!settings.reducedMotion()) {
        <!-- Rain effect -->
      @if (weatherTheme() === 'rain' || weatherTheme() === 'storm') {
        <div class="rain-container" aria-hidden="true">
          @for (drop of rainDrops; track drop) {
            <div
              class="raindrop"
              [style.left.%]="drop.x"
              [style.animation-delay]="drop.delay + 's'"
              [style.animation-duration]="drop.duration + 's'"
              [style.opacity]="drop.opacity"
            ></div>
          }
        </div>
      }

      <!-- Snow effect -->
      @if (weatherTheme() === 'snow') {
        <div class="snow-container" aria-hidden="true">
          @for (flake of snowFlakes; track flake) {
            <div
              class="snowflake"
              [style.left.%]="flake.x"
              [style.animation-delay]="flake.delay + 's'"
              [style.animation-duration]="flake.duration + 's'"
              [style.font-size.px]="flake.size"
            ></div>
          }
        </div>
      }

      <!-- Storm lightning flash -->
      @if (weatherTheme() === 'storm') {
        <div class="lightning-overlay" aria-hidden="true"></div>
      }

      <!-- Night stars -->
      @if (isNight() || weatherTheme() === 'night') {
        <div class="stars-container" aria-hidden="true">
          @for (star of stars; track star) {
            <div
              class="star"
              [style.left.%]="star.x"
              [style.top.%]="star.y"
              [style.animation-delay]="star.delay + 's'"
              [style.width.px]="star.size"
              [style.height.px]="star.size"
            ></div>
          }
        </div>
      }

      <!-- Cloud shapes -->
      @if (weatherTheme() === 'cloudy' || weatherTheme() === 'rain') {
        <div class="clouds-container" aria-hidden="true">
          <div class="cloud cloud-1"></div>
          <div class="cloud cloud-2"></div>
          <div class="cloud cloud-3"></div>
        </div>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      inset: 0;
      z-index: var(--z-effects);
      pointer-events: none;
      overflow: hidden;
    }

    .effects-layer {
      position: absolute;
      inset: 0;
    }

    /* === ATMOSPHERE === */
    .atmosphere {
      position: absolute;
      inset: 0;
      background: var(--weather-bg, var(--bg-primary));
      transition: background var(--duration-glacial) var(--ease-default);
    }

    /* === RAIN === */
    .rain-container {
      position: absolute;
      inset: 0;
    }

    .raindrop {
      position: absolute;
      top: -20px;
      width: 1px;
      height: 20px;
      background: linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.5));
      animation: rainDrop linear infinite;
    }

    [data-weather="storm"] .raindrop {
      height: 28px;
      background: linear-gradient(to bottom, transparent, rgba(150, 180, 220, 0.6));
    }

    /* === SNOW === */
    .snow-container {
      position: absolute;
      inset: 0;
    }

    .snowflake {
      position: absolute;
      top: -10px;
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      animation: snowFall linear infinite;
    }

    /* === LIGHTNING === */
    .lightning-overlay {
      position: absolute;
      inset: 0;
      background: rgba(200, 210, 255, 0.15);
      opacity: 0;
      animation: lightning 8s ease-in-out infinite;
      animation-delay: 3s;
    }

    /* === STARS === */
    .stars-container {
      position: absolute;
      inset: 0;
    }

    .star {
      position: absolute;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 50%;
      animation: twinkle 3s ease-in-out infinite;
    }

    /* === CLOUDS === */
    .clouds-container {
      position: absolute;
      inset: 0;
    }

    .cloud {
      position: absolute;
      background: var(--text-muted);
      opacity: 0.06;
      border-radius: 50%;
      animation: float 20s ease-in-out infinite;
    }

    .cloud-1 {
      width: 300px;
      height: 100px;
      top: 10%;
      left: -5%;
      animation-duration: 25s;
    }

    .cloud-2 {
      width: 250px;
      height: 80px;
      top: 25%;
      right: -10%;
      animation-delay: 5s;
      animation-duration: 30s;
    }

    .cloud-3 {
      width: 350px;
      height: 120px;
      top: 50%;
      left: 20%;
      animation-delay: 10s;
      animation-duration: 35s;
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .raindrop,
      .snowflake,
      .lightning-overlay,
      .star,
      .cloud {
        animation: none !important;
      }
      .raindrop, .snowflake {
        display: none;
      }
    }
  `],
})
export class WeatherEffectsComponent {
  readonly weatherTheme = input<WeatherTheme>('clear');
  readonly isNight = input(false);
  readonly settings = inject(SettingsStore);

  // Generate rain drops (pre-computed for performance)
  readonly rainDrops = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 0.8 + Math.random() * 0.6,
    opacity: 0.2 + Math.random() * 0.4,
  }));

  // Generate snowflakes
  readonly snowFlakes = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 8,
    size: 2 + Math.random() * 4,
  }));

  // Generate stars
  readonly stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 60,
    delay: Math.random() * 5,
    size: 1 + Math.random() * 2,
  }));
}
