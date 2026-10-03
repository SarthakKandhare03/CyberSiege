// ============================================================
// CYBERPUNK SMART CITY — Mock Hardware Bridge
// Simulates LED/device updates inside the dashboard
// This is the DEFAULT mode — no real hardware required
// ============================================================
import type { IHardwareBridge, HardwareUpdate } from '../types/city';

/**
 * MockHardwareBridge simulates what a physical ESP32/Arduino
 * controller would do by logging updates to the console and
 * calling optional UI update callbacks.
 *
 * This is 100% safe — it never connects to any real device.
 */
export class MockHardwareBridge implements IHardwareBridge {
  isConnected = true;
  mode = 'mock' as const;
  onStatusChange?: (connected: boolean) => void;

  // Simulated LED state for dashboard display
  private ledStates: Map<string, { status: string; health: number; color: string }> = new Map();
  private updateCallbacks: Array<(states: Map<string, { status: string; health: number; color: string }>) => void> = [];

  sendUpdate(update: HardwareUpdate): void {
    const color = this.getStatusColor(update.status, update.health);
    this.ledStates.set(update.assetId, {
      status: update.status,
      health: update.health,
      color,
    });
    // Notify any UI subscribers
    this.updateCallbacks.forEach((cb) => cb(this.ledStates));
    // Safe console log for debugging (simulation only)
    console.debug(
      `[MOCK HARDWARE] Asset: ${update.assetId} | Status: ${update.status} | Health: ${update.health}% | LED: ${color}`,
    );
  }

  async connect(): Promise<void> {
    this.isConnected = true;
    this.onStatusChange?.(true);
    console.debug('[MOCK HARDWARE] Mock bridge connected — no physical device required');
  }

  disconnect(): void {
    this.isConnected = false;
    this.onStatusChange?.(false);
    console.debug('[MOCK HARDWARE] Mock bridge disconnected');
  }

  getLedStates(): Map<string, { status: string; health: number; color: string }> {
    return this.ledStates;
  }

  onLedUpdate(cb: (states: Map<string, { status: string; health: number; color: string }>) => void): void {
    this.updateCallbacks.push(cb);
  }

  private getStatusColor(status: string, health: number): string {
    if (status === 'secure' && health > 80) return '#00ff88'; // green
    if (status === 'warning') return '#ffd600';               // amber
    if (status === 'compromised') return '#ff2d78';           // magenta/red
    if (status === 'offline') return '#444466';               // dark gray
    if (status === 'recovering') return '#a259ff';            // purple
    return '#00e5ff';                                         // cyan (default)
  }
}
