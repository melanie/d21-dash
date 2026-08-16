import './theme.css';

import { PipGauge, TurnSignal, registerComponents } from './components';

import type { DashTheme } from '../types';
import type { TelemetryData } from '../../preload';
// Layout partials, imported as raw HTML strings — see the *.html rule in
// webpack.renderer.config.ts and the module declaration in src/declarations.d.ts.
import gaugeGroupEngine from './layout/gauge-group-engine.html';
import gaugeGroupFuel from './layout/gauge-group-fuel.html';
import gaugeGroupTach from './layout/gauge-group-tach.html';
import rowTop from './layout/row-top.html';
// Map image asset
import mapImage from '../../assets/images/map-example.jpg';

registerComponents();

/**
 * Upper throttle-position bound (%) for each pip mask, mask-1 first. A TPS value
 * selects the first band whose bound it does not exceed; anything above the last
 * bound falls through to mask-6. Non-linear on purpose: a wide idle band at the
 * bottom, then progressively finer steps up to a narrow full-throttle band.
 */
const TACH_MASK_BOUNDS = [25, 35, 50, 70, 96] as const;

/** Map a throttle position (0-100%) to a pip mask number, 1-6. */
function tachMaskFor(throttlePosition: number): number {
  const band = TACH_MASK_BOUNDS.findIndex((bound) => throttlePosition <= bound);
  return band === -1 ? TACH_MASK_BOUNDS.length + 1 : band + 1;
}

/**
 * Tach bar geometry (SVG user units). Bars are evenly spaced; only how many
 * light up varies with rpm. 40 bars × 17 step fits the strip from first bar
 * x=34.5 to last bar right=709.5 inside the mask walls at x=30 / x=714.4.
 */
const TACH_BAR_COUNT = 40;
const TACH_BAR_FIRST_X = 34.5;
const TACH_BAR_STEP = 17;
const TACH_BAR_WIDTH = 12;
const TACH_BAR_HEIGHT = 283;
const TACH_BAR_RX = 2;

/** Bars lit only above this rpm (×1000) are the redline zone (danger color). */
const TACH_REDLINE_KRPM = 6;

/**
 * Where each tach marker (in ×1000 rpm) sits along the bar strip, as a fraction
 * (0-1) of its width. Mirrors the original 300ZX face: 0.5-3 fills just over
 * half the width, then the spacing tightens as revs climb (3→4 > 4→5 > 5→6 …).
 * Placeholder distribution until real vehicle data dials it in.
 */
const TACH_RPM_ANCHORS: ReadonlyArray<readonly [krpm: number, frac: number]> = [
  [0.5, 0.0],
  [1, 0.11],
  [2, 0.33],
  [3, 0.55],
  [4, 0.72],
  [5, 0.84],
  [6, 0.925], // tuned so redline starts at bar 37 → 3 danger bars (of 40)
  [7, 1.0],
];

/**
 * Fraction (0-1) of the bar strip that should be lit for a given rpm, via
 * piecewise-linear interpolation over the non-linear anchor points above.
 */
function tachFillFraction(rpm: number): number {
  const krpm = rpm / 1000;
  const first = TACH_RPM_ANCHORS[0];
  const last = TACH_RPM_ANCHORS[TACH_RPM_ANCHORS.length - 1];
  if (krpm <= first[0]) return first[1];
  if (krpm >= last[0]) return last[1];

  for (let i = 1; i < TACH_RPM_ANCHORS.length; i++) {
    const [hiRpm, hiFrac] = TACH_RPM_ANCHORS[i];
    if (krpm <= hiRpm) {
      const [loRpm, loFrac] = TACH_RPM_ANCHORS[i - 1];
      const t = (krpm - loRpm) / (hiRpm - loRpm);
      return loFrac + t * (hiFrac - loFrac);
    }
  }
  return last[1];
}

/**
 * The 300ZX theme: a digital dash styled after the 1985 Nissan 300ZX.
 * Builds its layout from reusable web components and updates them each frame.
 */
export class ThreeHundredZXTheme implements DashTheme {
  private speedEl: HTMLElement;
  private gpsEl: HTMLElement;
  private rpmEl: HTMLElement;
  private mapImg: HTMLImageElement;

  private tpsGauge: PipGauge;
  private fuelGauge: PipGauge;
  private afrGauge: PipGauge;
  private coolantGauge: PipGauge;
  private batteryGauge: PipGauge;

  private fuelAlert: HTMLElement;
  private batteryAlert: HTMLElement;

  private turnLeft: TurnSignal;
  private turnRight: TurnSignal;

  private tachPipsGroup: SVGGElement;
  private tachPips: SVGRectElement[] = [];
  private tachMask = -1; // last mask applied; -1 forces the first update
  private tachLit = -1; // last lit-bar count; -1 forces the first update

  mount(root: HTMLElement) {
    root.innerHTML = `
      <div class="container">
        ${rowTop}
        <div class="row">
          ${gaugeGroupFuel}
          ${gaugeGroupTach}
          ${gaugeGroupEngine}
        </div>
      </div>
    `;

    this.speedEl = root.querySelector('#speed-val');
    this.gpsEl = root.querySelector('#gps-val');
    this.rpmEl = root.querySelector('#rpm-val');
    this.mapImg = root.querySelector('.readout-map img');

    // Set the map image source from the imported asset
    if (this.mapImg) {
      this.mapImg.src = mapImage;
    }

    this.tpsGauge = root.querySelector('#tps-gauge');
    this.fuelGauge = root.querySelector('#fuel-gauge');
    this.afrGauge = root.querySelector('#afr-gauge');
    this.coolantGauge = root.querySelector('#coolant-gauge');
    this.batteryGauge = root.querySelector('#battery-gauge');

    this.fuelAlert = root.querySelector('#fuel-alert');
    this.batteryAlert = root.querySelector('#battery-alert');

    this.turnLeft = root.querySelector('turn-signal[direction="left"]');
    this.turnRight = root.querySelector('turn-signal[direction="right"]');

    this.tachPipsGroup = root.querySelector('#tach-pips-group');
    this.tachPips = this.buildTachPips(this.tachPipsGroup);
    this.buildTachLabels(root.querySelector('#tach-labels'));
  }

  /** Build the evenly spaced tach bars into the (clipped) bars group. */
  private buildTachPips(group: SVGGElement): SVGRectElement[] {
    const svgNS = 'http://www.w3.org/2000/svg';
    // Bars from this index up only light above TACH_REDLINE_KRPM → danger color.
    const redlineStart = Math.round(
      tachFillFraction(TACH_REDLINE_KRPM * 1000) * TACH_BAR_COUNT,
    );
    const bars: SVGRectElement[] = [];
    for (let i = 0; i < TACH_BAR_COUNT; i++) {
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('class', i >= redlineStart ? 'pip redline' : 'pip');
      rect.setAttribute('x', String(TACH_BAR_FIRST_X + i * TACH_BAR_STEP));
      rect.setAttribute('y', '0');
      rect.setAttribute('width', String(TACH_BAR_WIDTH));
      rect.setAttribute('height', String(TACH_BAR_HEIGHT));
      rect.setAttribute('rx', String(TACH_BAR_RX));
      group.appendChild(rect);
      bars.push(rect);
    }
    return bars;
  }

  /**
   * Draw the rpm increment labels (0.5-7) beneath the tach. They share the bar
   * strip's x-range so each label sits under where that rpm's fill ends, and
   * they live in an svg with the same width/viewBox as the tach so scaling
   * matches. Static — built once, never touched per-frame.
   */
  private buildTachLabels(svg: SVGSVGElement): void {
    const svgNS = 'http://www.w3.org/2000/svg';
    const stripLeft = TACH_BAR_FIRST_X;
    const stripRight =
      TACH_BAR_FIRST_X + (TACH_BAR_COUNT - 1) * TACH_BAR_STEP + TACH_BAR_WIDTH;
    for (const [krpm, frac] of TACH_RPM_ANCHORS) {
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute(
        'x',
        String(stripLeft + frac * (stripRight - stripLeft)),
      );
      text.setAttribute('y', '12');
      if (krpm >= TACH_REDLINE_KRPM) text.classList.add('redline');
      text.textContent = String(krpm);
      svg.appendChild(text);
    }
  }

  update(data: TelemetryData) {
    this.speedEl.textContent = data.speed.toString().padStart(3, '0');
    this.rpmEl.textContent = (data.rpm / 100).toString().padStart(3, '0');
    this.gpsEl.textContent = `${data.gpsPosition.latitude.toFixed(5)}, ${data.gpsPosition.longitude.toFixed(5)}`;

    this.tpsGauge.value = data.throttlePosition;
    this.fuelGauge.value = data.fuelLevel;
    this.afrGauge.value = data.afr;
    this.coolantGauge.value = data.coolantTemp;
    this.batteryGauge.value = data.batteryVoltage;

    this.fuelAlert.classList.toggle('on', data.fuelLevel < 25);
    this.batteryAlert.classList.toggle('on', data.batteryVoltage < 12.0);

    this.turnLeft.active = data.turnSignals.left;
    this.turnRight.active = data.turnSignals.right;

    // Clip the tach pips to the throttle-appropriate mask. Dirty-checked so a
    // steady throttle doesn't rewrite the attribute every frame.
    const tachMask = tachMaskFor(data.throttlePosition);
    if (tachMask !== this.tachMask) {
      this.tachMask = tachMask;
      this.tachPipsGroup.setAttribute(
        'clip-path',
        `url(#tach-mask-${tachMask})`,
      );
    }

    // Light bars left-to-right up to the current rpm along the non-linear tach
    // scale. Dirty-checked so a steady rpm doesn't re-toggle classes each frame.
    const litCount = Math.round(tachFillFraction(data.rpm) * TACH_BAR_COUNT);
    if (litCount !== this.tachLit) {
      this.tachLit = litCount;
      this.tachPips.forEach((pip, index) => {
        pip.classList.toggle('on', index < litCount);
      });
    }
  }
}
