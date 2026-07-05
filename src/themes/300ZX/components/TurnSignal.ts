import { turnArrowLeft, turnArrowRight } from './icons';

/**
 * A turn-signal arrow. Set `.active` to light it up.
 *
 * Usage (in markup):
 *   <turn-signal direction="left"></turn-signal>
 */
export class TurnSignal extends HTMLElement {
  connectedCallback() {
    if (this.querySelector('svg')) return; // already built

    const direction =
      this.getAttribute('direction') === 'right' ? 'right' : 'left';
    // The host plays the role of the `.arrow` box so existing theme styles apply.
    this.classList.add('arrow', `${direction}-arrow`);
    this.innerHTML = direction === 'right' ? turnArrowRight : turnArrowLeft;
  }

  set active(on: boolean) {
    this.querySelector('svg')?.classList.toggle('on', on);
  }
}
