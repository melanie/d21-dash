import { TelemetryData } from './preload';

declare global {
  interface Window {
    electronAPI: {
      onTelemetryUpdate: (callback: (data: TelemetryData) => void) => void;
    };
  }
}

export {};
