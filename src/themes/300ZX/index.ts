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

registerComponents();

/**
 * The 300ZX theme: a digital dash styled after the 1985 Nissan 300ZX.
 * Builds its layout from reusable web components and updates them each frame.
 */
export class ThreeHundredZXTheme implements DashTheme {
  private speedEl: HTMLElement;
  private gpsEl: HTMLElement;
  private rpmEl: HTMLElement;

  private tpsGauge: PipGauge;
  private fuelGauge: PipGauge;
  private afrGauge: PipGauge;
  private coolantGauge: PipGauge;
  private batteryGauge: PipGauge;

  private fuelAlert: HTMLElement;
  private batteryAlert: HTMLElement;

  private turnLeft: TurnSignal;
  private turnRight: TurnSignal;

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

    this.tpsGauge = root.querySelector('#tps-gauge');
    this.fuelGauge = root.querySelector('#fuel-gauge');
    this.afrGauge = root.querySelector('#afr-gauge');
    this.coolantGauge = root.querySelector('#coolant-gauge');
    this.batteryGauge = root.querySelector('#battery-gauge');

    this.fuelAlert = root.querySelector('#fuel-alert');
    this.batteryAlert = root.querySelector('#battery-alert');

    this.turnLeft = root.querySelector('turn-signal[direction="left"]');
    this.turnRight = root.querySelector('turn-signal[direction="right"]');
  }

  update(data: TelemetryData) {
    this.speedEl.textContent = data.speed.toString().padStart(3, '0');
    this.rpmEl.textContent = data.rpm.toString().padStart(4, '0');
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
  }
}
