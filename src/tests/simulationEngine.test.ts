// ============================================================
// UNIT TESTS — Simulation Engine (reducer)
// ============================================================
import { describe, it, expect } from 'vitest';
import { cityReducer, buildInitialState, applyDefenseToAsset, applyEventToAssets } from '../engine/simulationEngine';
import type { AppState, CityAsset } from '../types/city';

const initialState = buildInitialState();

describe('cityReducer — SELECT_ASSET', () => {
  it('selects an asset by ID', () => {
    const state = cityReducer(initialState, { type: 'SELECT_ASSET', payload: 'metro_control' });
    expect(state.selectedAssetId).toBe('metro_control');
  });

  it('deselects when null is passed', () => {
    const withSelection: AppState = { ...initialState, selectedAssetId: 'metro_control' };
    const state = cityReducer(withSelection, { type: 'SELECT_ASSET', payload: null });
    expect(state.selectedAssetId).toBeNull();
  });
});

describe('cityReducer — RESET_CITY', () => {
  it('restores all assets to initial health', () => {
    // Damage an asset first
    const damaged: AppState = {
      ...initialState,
      assets: {
        ...initialState.assets,
        metro_control: { ...initialState.assets.metro_control, health: 20, status: 'compromised' },
      },
    };
    const state = cityReducer(damaged, { type: 'RESET_CITY' });
    expect(state.assets.metro_control.health).toBe(100);
    expect(state.assets.metro_control.status).toBe('secure');
  });

  it('resets score to zero', () => {
    const withScore: AppState = {
      ...initialState,
      score: { ...initialState.score, total: 999 },
    };
    const state = cityReducer(withScore, { type: 'RESET_CITY' });
    expect(state.score.total).toBe(0);
  });

  it('preserves sound setting across reset', () => {
    const withSound: AppState = { ...initialState, soundEnabled: true };
    const state = cityReducer(withSound, { type: 'RESET_CITY' });
    expect(state.soundEnabled).toBe(true);
  });

  it('clears selected asset and mission report', () => {
    const state = cityReducer(
      { ...initialState, selectedAssetId: 'metro_control' },
      { type: 'RESET_CITY' },
    );
    expect(state.selectedAssetId).toBeNull();
    expect(state.missionReport).toBeNull();
  });
});

describe('cityReducer — START_SCENARIO', () => {
  it('sets the active scenario ID', () => {
    const state = cityReducer(initialState, { type: 'START_SCENARIO', payload: 'scenario_1' });
    expect(state.simulation.activeScenarioId).toBe('scenario_1');
  });

  it('resets event index to 0', () => {
    const state = cityReducer(initialState, { type: 'START_SCENARIO', payload: 'scenario_1' });
    expect(state.simulation.currentEventIndex).toBe(0);
  });

  it('clears any previous mission report', () => {
    const withReport: AppState = {
      ...initialState,
      missionReport: {
        scenarioId: 'scenario_1',
        scenarioTitle: 'Test',
        completedAt: new Date().toISOString(),
        score: initialState.score,
        defensesUsed: [],
        assetsRecovered: [],
        assetsLost: [],
        grade: 'A',
        feedback: 'Test feedback',
      },
    };
    const state = cityReducer(withReport, { type: 'START_SCENARIO', payload: 'scenario_2' });
    expect(state.missionReport).toBeNull();
  });
});

describe('cityReducer — ADVANCE_EVENT', () => {
  it('increments event index', () => {
    const withScenario = cityReducer(initialState, { type: 'START_SCENARIO', payload: 'scenario_1' });
    const state = cityReducer(withScenario, { type: 'ADVANCE_EVENT' });
    expect(state.simulation.currentEventIndex).toBe(1);
  });

  it('applies status changes from scenario event', () => {
    const withScenario = cityReducer(initialState, { type: 'START_SCENARIO', payload: 'scenario_1' });
    const state = cityReducer(withScenario, { type: 'ADVANCE_EVENT' });
    // Scenario 1, event 0 sets metro_control to 'warning'
    expect(state.assets.metro_control.status).toBe('warning');
  });

  it('adds a log entry', () => {
    const withScenario = cityReducer(initialState, { type: 'START_SCENARIO', payload: 'scenario_1' });
    const initialLogCount = withScenario.threatLog.length;
    const state = cityReducer(withScenario, { type: 'ADVANCE_EVENT' });
    expect(state.threatLog.length).toBeGreaterThan(initialLogCount);
  });
});

describe('cityReducer — APPLY_DEFENSE', () => {
  it('increases asset health when defense is applied', () => {
    // Put metro in warning state first
    const warningState: AppState = {
      ...initialState,
      assets: {
        ...initialState.assets,
        metro_control: { ...initialState.assets.metro_control, status: 'warning', health: 50 },
      },
    };
    const state = cityReducer(warningState, {
      type: 'APPLY_DEFENSE',
      payload: { assetId: 'metro_control', defense: 'patch' },
    });
    expect(state.assets.metro_control.health).toBeGreaterThan(50);
  });

  it('increases score when defense is applied', () => {
    const warningState: AppState = {
      ...initialState,
      assets: {
        ...initialState.assets,
        metro_control: { ...initialState.assets.metro_control, status: 'warning', health: 50 },
      },
    };
    const state = cityReducer(warningState, {
      type: 'APPLY_DEFENSE',
      payload: { assetId: 'metro_control', defense: 'patch' },
    });
    expect(state.score.total).toBeGreaterThan(0);
  });

  it('does not apply defense to secure asset with incompatible action', () => {
    // 'restore_backup' is not applicable when status is 'secure'
    const beforeState = initialState;
    const state = cityReducer(beforeState, {
      type: 'APPLY_DEFENSE',
      payload: { assetId: 'metro_control', defense: 'restore_backup' },
    });
    // State should be unchanged
    expect(state.assets.metro_control.health).toBe(beforeState.assets.metro_control.health);
  });
});

describe('cityReducer — TOGGLE_SOUND', () => {
  it('toggles sound from false to true', () => {
    const state = cityReducer(initialState, { type: 'TOGGLE_SOUND' });
    expect(state.soundEnabled).toBe(true);
  });

  it('toggles sound from true to false', () => {
    const on: AppState = { ...initialState, soundEnabled: true };
    const state = cityReducer(on, { type: 'TOGGLE_SOUND' });
    expect(state.soundEnabled).toBe(false);
  });
});

describe('applyDefenseToAsset', () => {
  const warningAsset: CityAsset = {
    ...initialState.assets.metro_control,
    status: 'warning',
    health: 40,
    activeDefenses: [],
  };

  it('increases health', () => {
    const result = applyDefenseToAsset(warningAsset, 'patch');
    expect(result.health).toBeGreaterThan(warningAsset.health);
  });

  it('adds defense to activeDefenses list', () => {
    const result = applyDefenseToAsset(warningAsset, 'mfa');
    expect(result.activeDefenses).toContain('mfa');
  });

  it('does not duplicate an already-applied defense', () => {
    const withMfa: CityAsset = { ...warningAsset, activeDefenses: ['mfa'] };
    const result = applyDefenseToAsset(withMfa, 'mfa');
    expect(result.activeDefenses.filter((d) => d === 'mfa')).toHaveLength(1);
  });

  it('transitions compromised to recovering on restore_backup', () => {
    const compromised: CityAsset = { ...warningAsset, status: 'compromised', health: 20 };
    const result = applyDefenseToAsset(compromised, 'restore_backup');
    expect(result.status).toBe('recovering');
  });

  it('caps health at 100', () => {
    const highHealth: CityAsset = { ...warningAsset, health: 95 };
    const result = applyDefenseToAsset(highHealth, 'patch');
    expect(result.health).toBeLessThanOrEqual(100);
  });
});

describe('applyEventToAssets', () => {
  it('applies status changes correctly', () => {
    const result = applyEventToAssets(
      initialState.assets,
      { metro_control: 'warning' },
      {},
    );
    expect(result.metro_control.status).toBe('warning');
  });

  it('applies health changes correctly', () => {
    const result = applyEventToAssets(
      initialState.assets,
      {},
      { metro_control: -20 },
    );
    expect(result.metro_control.health).toBe(80);
  });

  it('health never goes below 0', () => {
    const result = applyEventToAssets(
      initialState.assets,
      {},
      { metro_control: -999 },
    );
    expect(result.metro_control.health).toBe(0);
  });

  it('does not affect assets not in the change maps', () => {
    const result = applyEventToAssets(
      initialState.assets,
      { metro_control: 'warning' },
      {},
    );
    expect(result.city_hospital.status).toBe('secure');
  });
});
