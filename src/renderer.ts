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
const coolantEl = document.getElementById('coolant-val');
const fuelEl = document.getElementById('fuel-val');
const tpsEl = document.getElementById('tps-val');
const afrEl = document.getElementById('afr-val');
const turnLeftEl = document.getElementById('turn-left');
const turnRightEl = document.getElementById('turn-right');
const gpsEl = document.getElementById('gps-val');
const batteryEl = document.getElementById('battery-val');

// 2. Listen for data from the Main process
window.electronAPI.onTelemetryUpdate((data) => {
  // 3. Update the text elements rapidly
  rpmEl.textContent = data.rpm.toString().padStart(4, '0');
  speedEl.textContent = data.speed.toString().padStart(3, '0');
  
  coolantEl.textContent = data.coolantTemp.toFixed(1);
  fuelEl.textContent = data.fuelLevel.toFixed(1);
  tpsEl.textContent = data.throttlePosition.toFixed(1);
  afrEl.textContent = data.afr.toFixed(2);
  batteryEl.textContent = data.batteryVoltage.toFixed(2);
  
  turnLeftEl.textContent = data.turnSignals.left ? 'LEFT' : '    ';
  turnRightEl.textContent = data.turnSignals.right ? 'RIGHT' : '     ';
  
  gpsEl.textContent = `${data.gpsPosition.latitude.toFixed(5)}, ${data.gpsPosition.longitude.toFixed(5)}`;
});
