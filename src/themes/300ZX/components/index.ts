import { PipGauge } from './PipGauge';
import { TurnSignal } from './TurnSignal';

/** Register the theme's custom elements. Safe to call more than once. */
export function registerComponents() {
  if (!customElements.get('pip-gauge')) {
    customElements.define('pip-gauge', PipGauge);
  }
  if (!customElements.get('turn-signal')) {
    customElements.define('turn-signal', TurnSignal);
  }
}

export { PipGauge, TurnSignal };
