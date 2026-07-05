/**
 * A vertical bar gauge made of "pips". Set `.value` to light up a number of
 * pips proportional to where the value falls in the [min, max] range.
 *
 * Usage (in markup):
 *   <pip-gauge min="10" max="16" pips="12" legend="16,13,10"></pip-gauge>
 *
 * The `legend` attribute is a comma-separated list of labels drawn alongside
 * the pips; empty entries (e.g. "F,,½,,E") render as blank spacer rows.
 */
export class PipGauge extends HTMLElement {
  private pips: HTMLSpanElement[] = [];
  private min = 0;
  private max = 100;
  private litCount = -1; // last count drawn; -1 forces the first update

  connectedCallback() {
    if (this.pips.length) return; // already built

    this.min = Number(this.getAttribute('min') ?? 0);
    this.max = Number(this.getAttribute('max') ?? 100);
    const pipCount = Number(this.getAttribute('pips') ?? 12);
    const legend = (this.getAttribute('legend') ?? '')
      .split(',')
      .map((label) => label.trim());

    // The host element plays the role of the `.gauge` box so existing theme
    // styles apply without an extra wrapper.
    this.classList.add('gauge');

    const pipsWrap = document.createElement('div');
    pipsWrap.className = 'gauge-pips';
    for (let i = 0; i < pipCount; i++) {
      const pip = document.createElement('span');
      pipsWrap.appendChild(pip);
      this.pips.push(pip);
    }
    this.appendChild(pipsWrap);

    if (legend.some(Boolean)) {
      const legendWrap = document.createElement('div');
      legendWrap.className = 'gauge-legend';
      for (const label of legend) {
        const span = document.createElement('span');
        span.textContent = label;
        legendWrap.appendChild(span);
      }
      this.appendChild(legendWrap);
    }
  }

  /** Light pips from the bottom up based on where `value` sits in [min, max]. */
  set value(value: number) {
    const clamped = Math.min(Math.max(value, this.min), this.max);
    const litCount = Math.round(
      ((clamped - this.min) / (this.max - this.min)) * this.pips.length,
    );

    // Skip touching the DOM when the number of lit pips hasn't changed. This
    // keeps steady gauges from doing redundant writes every telemetry frame.
    if (litCount === this.litCount) return;
    this.litCount = litCount;

    this.pips.forEach((pip, index) => {
      pip.classList.toggle('on', index >= this.pips.length - litCount);
    });
  }
}
