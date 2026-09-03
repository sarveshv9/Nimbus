import { Component, input, ChangeDetectionStrategy } from '@angular/core';

/**
 * Glassmorphic card component used throughout the application.
 * Provides consistent frosted-glass styling with optional variants.
 */
@Component({
  selector: 'nimbus-glass-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: [`
    :host {
      display: block;
      background: var(--bg-surface);
      border: var(--card-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      padding: var(--space-6);
      transition: background var(--duration-normal) var(--ease-default),
                  border-color var(--duration-normal) var(--ease-default),
                  box-shadow var(--duration-normal) var(--ease-default),
                  transform var(--duration-normal) var(--ease-default);
    }

    :host(.compact) {
      padding: var(--space-4);
      border-radius: var(--radius-lg);
    }

    :host(.interactive) {
      cursor: pointer;
    }

    :host(.interactive:hover) {
      background: var(--bg-surface-hover);
      box-shadow: var(--shadow-lg);
      transform: translateY(-4px);
    }

    :host(.interactive:active) {
      transform: translateY(0);
      transition-duration: var(--duration-instant);
    }

    :host(.no-padding) {
      padding: 0;
    }
  `],
  host: {
    '[class.compact]': 'variant() === "compact"',
    '[class.interactive]': 'interactive()',
    '[class.no-padding]': 'variant() === "flush"',
  },
})
export class GlassCard {
  readonly variant = input<'default' | 'compact' | 'flush'>('default');
  readonly interactive = input(false);
}
