import './theme.css';

import type { TelemetryData } from '../../preload';
import type { DashTheme } from '../types';
import { registerComponents, PipGauge, TurnSignal } from './components';
import {
  fuelIcon,
  coolantIcon,
  oilPressureIcon,
  batteryIcon,
} from './components/icons';

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
        <div class="row row-top">
          <turn-signal direction="left"></turn-signal>
          <div class="readout readout-speed">
            <span class="value" id="speed-val">000</span> <label>mph</label>
          </div>
          <div class="readout readout-gps">
            <span class="value" id="gps-val">0.00000, 0.00000</span>
          </div>
          <turn-signal direction="right"></turn-signal>
        </div>

        <div class="row">
          <div class="gauge-group">
            <div class="gauge-group-header">
              <span></span>
              <div class="gauge-group-header-icon">
                <span id="fuel-alert" class="alert"></span>
                ${fuelIcon}
              </div>
              <span></span>
            </div>
            <div class="gauge-group-body">
              <pip-gauge id="tps-gauge" min="0" max="100" legend="100%,,,,0%"></pip-gauge>
              <pip-gauge id="fuel-gauge" min="0" max="100" legend="F,,½,,E"></pip-gauge>
              <pip-gauge id="afr-gauge" min="10" max="18" legend="18,17,16,15,14,13,12,11"></pip-gauge>
            </div>
            <div class="gauge-group-footer">
              <label>TPS</label>
              <label>Fuel</label>
              <label>AFR</label>
            </div>
          </div>

          <div class="gauge-group">
            <div class="readout-group readout-rpm">
              <div class="readout"><span class="value" id="rpm-val">0000</span></div>
              <label>x100r/min</label>
            </div>
            <div class="readout readout-tach"></div>
            <div class="gauge-group-footer"><label>Tach</label></div>
          </div>

          <div class="gauge-group">
            <div class="gauge-group-header">
              <div class="gauge-group-header-icon">
                <span id="coolant-alert" class="alert"></span>
                ${coolantIcon}
              </div>
              <div class="gauge-group-header-icon">
                <span id="oil-pressure-alert" class="alert"></span>
                ${oilPressureIcon}
              </div>
              <div class="gauge-group-header-icon">
                <span id="battery-alert" class="alert"></span>
                ${batteryIcon}
              </div>
            </div>
            <div class="gauge-group-body">
              <pip-gauge id="coolant-gauge" min="120" max="270" legend="270º,,120º"></pip-gauge>
              <pip-gauge id="oil-pressure-gauge" min="0" max="90" legend="90,45,0"></pip-gauge>
              <pip-gauge id="battery-gauge" min="10" max="16" legend="16,13,10"></pip-gauge>
            </div>
            <div class="gauge-group-footer">
              <label>ºF</label>
              <label>lb/in<sup>2</sup></label>
              <label>V</label>
            </div>
          </div>
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
