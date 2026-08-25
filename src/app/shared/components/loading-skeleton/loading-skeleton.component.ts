import { Component, input, ChangeDetectionStrategy } from '@angular/core';

/**
 * Skeleton loading placeholder that matches content shapes.
 */
@Component({
  selector: 'nimbus-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="shimmer" [style.width]="width()" [style.height]="height()" [style.border-radius]="radius()"></span>`,
  styles: [`
    :host {
      display: block;
    }
    .shimmer {
      display: block;
      background: linear-gradient(
        90deg,
        var(--border-subtle) 25%,
        var(--bg-surface-hover) 50%,
        var(--border-subtle) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: var(--radius-md);
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class Skeleton {
  readonly width = input('100%');
  readonly height = input('20px');
  readonly radius = input('var(--radius-md)');
}
