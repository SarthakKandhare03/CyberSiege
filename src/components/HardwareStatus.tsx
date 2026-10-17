// ============================================================
// HardwareStatus — Mock LED dashboard for hardware mode
// ============================================================
import { useEffect, useRef } from 'react';
import { useAppState } from '../context/AppContext';
import { MockHardwareBridge } from '../hardware/MockHardwareBridge';
import type { AssetStatus } from '../types/city';

const STATUS_LED_COLORS: Record<AssetStatus, string> = {
  secure: '#00ff88',
  warning: '#ffd600',
  compromised: '#ff2d78',
  offline: '#333355',
  recovering: '#a259ff',
};

export function HardwareStatus() {
  const { state, dispatch } = useAppState();
  const bridgeRef = useRef<MockHardwareBridge | null>(null);

  // Initialize mock bridge on mount
  useEffect(() => {
    const bridge = new MockHardwareBridge();
    bridge.connect();
    bridgeRef.current = bridge;
    return () => bridge.disconnect();
  }, []);

  // Send updates when asset states change
  useEffect(() => {
    const bridge = bridgeRef.current;
    if (!bridge || !state.hardwareMode) return;
    Object.values(state.assets).forEach((asset) => {
      bridge.sendUpdate({ assetId: asset.id, status: asset.status, health: asset.health });
    });
  }, [state.assets, state.hardwareMode]);

  return (
    <section id="hardware" className="hardware-status" aria-label="Mock Hardware LED Status">
      <div className="hardware-status__title">
        <span>Mock Hardware LEDs</span>
        <button
          className={`switch${state.hardwareMode ? ' is-on' : ''}`}
          role="switch"
          aria-checked={state.hardwareMode}
          onClick={() => dispatch({ type: 'SET_HARDWARE_MODE', payload: !state.hardwareMode })}
          aria-label="Hardware mode"
        >
          <span className="switch__thumb" aria-hidden="true" />
        </button>
      </div>

      {state.hardwareMode ? (
        <>
          <div className="hardware-status__note">[SIMULATION] ESP32 mock — no real device connected</div>
          <div className="hardware-led-grid" aria-label="LED status indicators for all city assets">
            {Object.values(state.assets).map((asset) => {
              const color = STATUS_LED_COLORS[asset.status];
              return (
                <div
                  key={asset.id}
                  className="hardware-led"
                  title={`${asset.name}: ${asset.status} (${asset.health}%)`}
                  aria-label={`${asset.name}: ${asset.status}`}
                >
                  <div
                    className="led-dot"
                    style={{
                      background: color,
                      boxShadow: asset.status !== 'offline'
                        ? `0 0 6px ${color}, 0 0 12px ${color}44`
                        : 'none',
                    }}
                    aria-hidden="true"
                  />
                  <div className="led-label">{asset.name.split(' ')[0]}</div>
                </div>
              );
            })}
          </div>

          <div className="hardware-status__footnote">
            Future: Connect an ESP32 to physical building models with LEDs.
            See README for hardware setup guide.
          </div>
        </>
      ) : (
        <div className="empty-note">Enable to see simulated LED status</div>
      )}
    </section>
  );
}
