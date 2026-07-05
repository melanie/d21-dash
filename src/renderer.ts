/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

// src/renderer.js

// 1. Cache the DOM elements
const rpmEl = document.getElementById('rpm-val');
const speedEl = document.getElementById('speed-val');
const coolantPips = document.getElementById('coolant-pips').querySelectorAll<HTMLSpanElement>('span');
const fuelPips = document.getElementById('fuel-pips').querySelectorAll<HTMLSpanElement>('span');
const tpsPips = document.getElementById('tps-pips').querySelectorAll<HTMLSpanElement>('span');
const afrPips = document.getElementById('afr-pips').querySelectorAll<HTMLSpanElement>('span');
const batteryPips = document.getElementById('battery-pips').querySelectorAll<HTMLSpanElement>('span');
// CHANCE: No oil pressure in telemetry data
// const oilPressurePips = document.getElementById('oil-pressure-pips').querySelectorAll<HTMLSpanElement>('span');
const turnLeftEl = document.getElementById('turn-left');
const turnRightEl = document.getElementById('turn-right');
const gpsEl = document.getElementById('gps-val');
//const oilPressureEl = document.getElementById('oil-pressure-val');
//const oilPressureAlertEl = document.getElementById('oil-pressure-alert');
const fuelAlertEl = document.getElementById('fuel-alert');
const batteryAlertEl = document.getElementById('battery-alert');

// Light up a bar gauge: converts a value in [min, max] into a count of lit pips.
// Pips fill from the bottom up (last span lights first).
function updatePips(pips: NodeListOf<HTMLSpanElement>, value: number, max = 100, min = 0) {
  const clamped = Math.min(Math.max(value, min), max);
  const litCount = Math.round(((clamped - min) / (max - min)) * pips.length);
  pips.forEach((pip, index) => {
    pip.classList.toggle('on', index >= pips.length - litCount);
  });
}

// 2. Listen for data from the Main process
window.electronAPI.onTelemetryUpdate((data) => {
  // 3. Update the text elements rapidly
  rpmEl.textContent = data.rpm.toString().padStart(4, '0');
  speedEl.textContent = data.speed.toString().padStart(3, '0');
  
  updatePips(coolantPips, data.coolantTemp, 270, 120);
  updatePips(fuelPips, data.fuelLevel);
  updatePips(tpsPips, data.throttlePosition);
  updatePips(afrPips, data.afr, 18, 10);
  //updatePips(oilPressurePips, data.oilPressure, 90, 0);
  updatePips(batteryPips, data.batteryVoltage, 16, 10);
  batteryAlertEl.classList.toggle('on', data.batteryVoltage < 12.0);
  //oilPressureAlertEl.classList.toggle('on', data.oilPressure < 30);
  fuelAlertEl.classList.toggle('on', data.fuelLevel < 25);
  
  turnLeftEl.classList.toggle('on', data.turnSignals.left);
  turnRightEl.classList.toggle('on', data.turnSignals.right);
  
  gpsEl.textContent = `${data.gpsPosition.latitude.toFixed(5)}, ${data.gpsPosition.longitude.toFixed(5)}`;
});
