// ============================================================
// CYBERPUNK SMART CITY — Serial Hardware Bridge (PLACEHOLDER)
// Future interface for ESP32/Arduino physical hardware
//
// ⚠️  THIS IS A DOCUMENTED PLACEHOLDER ONLY ⚠️
// No real serial communication is implemented.
// Hardware mode is disabled by default in the application.
//
// Future Implementation Guide:
// ─────────────────────────────────────────────────────────────
// To connect a physical ESP32 that controls LEDs for building
// models, implement the connect() and sendUpdate() methods
// using the Web Serial API (navigator.serial).
//
// The ESP32 should expect JSON messages on the serial port:
//   { "assetId": "metro_control", "status": "compromised", "health": 45 }
//
// The ESP32 maps each assetId to an LED and sets its color:
//   - secure    → GREEN  (#00ff88)
//   - warning   → AMBER  (#ffd600)
//   - compromised → RED  (#ff2d78)
//   - offline   → OFF    (#000000)
//   - recovering → PURPLE (#a259ff)
//
// SAFETY REQUIREMENTS for any future implementation:
// - NEVER automatically scan or connect to serial ports
// - ALWAYS require explicit user action to connect
// - ONLY send the values: assetId, status, health
// - NEVER receive commands from the hardware device
// - NEVER send executable code or scripts to hardware
// ============================================================

import type { IHardwareBridge, HardwareUpdate } from '../types/city';

export class SerialHardwareBridge implements IHardwareBridge {
  isConnected = false;
  mode = 'serial' as const;
  onStatusChange?: (connected: boolean) => void;

  // Web Serial API port — not yet implemented
  // private port: SerialPort | null = null;

  sendUpdate(_update: HardwareUpdate): void {
    // PLACEHOLDER: implement with Web Serial API
    console.warn('[SERIAL HARDWARE] Not yet implemented — use MockHardwareBridge instead');
  }

  async connect(): Promise<void> {
    // PLACEHOLDER: would use navigator.serial.requestPort()
    // IMPORTANT: never auto-connect — always require user action
    console.warn('[SERIAL HARDWARE] Serial connection not yet implemented');
    throw new Error('Serial hardware bridge not yet implemented. Use Mock mode.');
  }

  disconnect(): void {
    this.isConnected = false;
    this.onStatusChange?.(false);
  }
}
