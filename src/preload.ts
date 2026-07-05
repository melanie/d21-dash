// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

// We duplicate or import the interface here so the frontend knows what to expect
export interface TelemetryData {
  rpm: number;
  speed: number;
  coolantTemp: number;
  fuelLevel: number;
  throttlePosition: number;
  afr: number;
  turnSignals: { left: boolean; right: boolean };
  gpsPosition: { latitude: number; longitude: number };
  batteryVoltage: number;
}

console.log('preload');

contextBridge.exposeInMainWorld('electronAPI', {
  onTelemetryUpdate: (callback: (data: TelemetryData) => void) => {
    // Strip existing listeners to prevent memory leaks if the React component remounts
    ipcRenderer.removeAllListeners('telemetry-update');
    ipcRenderer.on('telemetry-update', (_event, value) => callback(value));
  },
});
