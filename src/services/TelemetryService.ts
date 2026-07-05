// src/services/TelemetryService.ts

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface TurnSignals {
  left: boolean;
  right: boolean;
}

export interface TelemetryData {
  rpm: number;
  speed: number; // mph or km/h
  coolantTemp: number; // Fahrenheit or Celsius
  fuelLevel: number; // 0-100 percentage
  throttlePosition: number; // 0-100 percentage
  afr: number; // Air/Fuel Ratio (e.g., 14.7)
  turnSignals: TurnSignals;
  gpsPosition: GpsCoordinates;
  batteryVoltage: number;
}

export interface TelemetryService {
  start(): void;
  stop(): void;
  onData(callback: (data: TelemetryData) => void): void;
}
