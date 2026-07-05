import type { TelemetryData } from '../preload';

/**
 * A dashboard theme owns its own markup, styles, and components. Themes are
 * interchangeable: the renderer mounts one and pushes telemetry to it, without
 * knowing anything about how the theme draws itself.
 */
export interface DashTheme {
  /** Build the theme's DOM inside the given root element. */
  mount(root: HTMLElement): void;
  /** Push a fresh telemetry frame to the theme so it can update its display. */
  update(data: TelemetryData): void;
}
