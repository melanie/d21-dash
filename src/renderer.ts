/**
 * Renderer entry point. This file is deliberately theme-agnostic: it mounts a
 * dashboard theme into the page and forwards telemetry frames to it. To swap
 * looks, import and mount a different theme that implements `DashTheme`.
 */
import type { DashTheme } from './themes/types';
import { ThreeHundredZXTheme } from './themes/300ZX';

const root = document.getElementById('app');

if (root) {
  const theme: DashTheme = new ThreeHundredZXTheme();
  theme.mount(root);

  window.electronAPI.onTelemetryUpdate((data) => {
    theme.update(data);
  });
}
