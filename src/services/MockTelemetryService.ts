// src/services/MockTelemetryService.ts
import { TelemetryService, TelemetryData } from './TelemetryService';

export class MockTelemetryService implements TelemetryService {
  private intervalId: NodeJS.Timeout | null = null;
  private callback: ((data: TelemetryData) => void) | null = null;

  // Base state for simulation
  private currentRpm = 850;
  private currentSpeed = 0;
  private currentThrottle = 0;
  private fuelLevel = 85.5; // Start at 85.5%
  private ascending = true;
  private tickCount = 0;

  onData(cb: (data: TelemetryData) => void): void {
    this.callback = cb;
  }

  start(): void {
    if (this.intervalId) return;

    // Simulate data coming in at 20Hz (every 50ms)
    this.intervalId = setInterval(() => {
      this.tickCount++;
      this.simulateVehicleDynamics();

      if (this.callback) {
        this.callback({
          rpm: Math.round(this.currentRpm),
          speed: Math.round(this.currentSpeed),
          coolantTemp: 190 + Math.random() * 2, // Stable operating temp with slight variance
          fuelLevel: Number(this.fuelLevel.toFixed(1)),
          throttlePosition: Math.round(this.currentThrottle), // Sweeps 0-100% across the accel/decel cycle
          afr: this.calculateMockAfr(),
          turnSignals: this.calculateMockTurnSignals(),
          gpsPosition: {
            latitude: 33.4255 + this.currentSpeed * 0.000001, // Slight drift to simulate movement
            longitude: -111.94,
          },
          batteryVoltage: this.calculateMockBatteryVoltage(),
        });
      }
    }, 50);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private simulateVehicleDynamics() {
    // Rev climb and deceleration
    if (this.ascending) {
      this.currentRpm += 120;
      this.currentSpeed += 0.5;
      // Ramp throttle up to full so the demo sweeps through every tach mask.
      this.currentThrottle = Math.min(100, this.currentThrottle + 3);
      if (this.currentRpm > 5500) this.ascending = false;
    } else {
      this.currentRpm -= 180;
      this.currentSpeed = Math.max(0, this.currentSpeed - 0.3); // Coasting down
      this.currentThrottle = Math.max(0, this.currentThrottle - 4); // Lift off
      if (this.currentRpm < 850) {
        this.currentRpm = 850;
        if (this.currentSpeed <= 0) {
          this.ascending = true; // Restart the pull once stopped
        }
      }
    }

    // Slowly drain the fuel tank over time
    if (this.tickCount % 100 === 0) {
      this.fuelLevel = Math.max(0, this.fuelLevel - 0.1);
    }
  }

  private calculateMockAfr(): number {
    // Rich under acceleration, lean/stoich when cruising or decelerating
    let targetAfr = this.ascending ? 12.8 : 14.7;
    // Add slight sensor noise (+/- 0.2)
    return Number((targetAfr + (Math.random() * 0.4 - 0.2)).toFixed(1));
  }

  private calculateMockTurnSignals() {
    // Blink the left turn signal every few seconds just to test the UI indicators
    const isBlinking = Math.floor(this.tickCount / 40) % 4 === 0;
    const blinkState = this.tickCount % 10 < 5; // On/Off flash phase

    return {
      left: isBlinking && blinkState,
      right: false,
    };
  }

  private calculateMockBatteryVoltage() {
    let targetVoltage = this.ascending ? 10.0 : 14.0;
    return Number((targetVoltage + (Math.random() * 0.4 - 0.2)).toFixed(2));
  }
}
