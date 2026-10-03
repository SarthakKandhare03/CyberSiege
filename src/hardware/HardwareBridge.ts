// ============================================================
// CYBERPUNK SMART CITY — Hardware Bridge Interface
// Safe placeholder interface for future ESP32/Arduino hardware
// ============================================================
import type { IHardwareBridge, HardwareUpdate } from '../types/city';

/**
 * IHardwareBridge defines the contract for communicating
 * simulated LED/device status to physical hardware.
 *
 * Currently only the MockHardwareBridge is implemented.
 * The SerialHardwareBridge is a documented placeholder for
 * future ESP32/Arduino integration.
 *
 * SAFETY RULES:
 * - Hardware mode is disabled by default
 * - Never automatically scan ports
 * - Never automatically connect to devices
 * - Only send safe status values (assetId, status, health)
 * - No real device control is implemented
 */

export type { IHardwareBridge };
export type { HardwareUpdate };
