// ============================================================
// CYBERPUNK SMART CITY — Simulation Engine
// Event-driven simulation logic
// ============================================================
import type {
  AppState,
  AppAction,
  CityAsset,
  ThreatLogEntry,
  DefenseActionType,
  ScenarioId,
  MissionReport,
  MissionScore,
} from '../types/city';
import { INITIAL_ASSETS } from '../data/assets';
import { SCENARIOS } from '../data/scenarios';
import { DEFENSE_ACTIONS } from '../data/defenses';
import { calculateScore, calculateGrade, generateFeedback } from './scoring';

// ============================================================
// Helper: generate a log entry ID
// ============================================================
let logCounter = 0;
export function generateLogId(): string {
  return `log_${Date.now()}_${++logCounter}`;
}

// ============================================================
// Helper: generate a local timestamp string
// ============================================================
export function generateTimestamp(): string {
  return new Date().toISOString();
}

// ============================================================
// Helper: apply an event to the asset map
// ============================================================
export function applyEventToAssets(
  assets: Record<string, CityAsset>,
  statusChanges: Record<string, string>,
  healthChanges: Record<string, number>,
): Record<string, CityAsset> {
  const updated = { ...assets };
  for (const [id, status] of Object.entries(statusChanges)) {
    if (updated[id]) {
      updated[id] = { ...updated[id], status: status as CityAsset['status'] };
    }
  }
  for (const [id, delta] of Object.entries(healthChanges)) {
    if (updated[id]) {
      const newHealth = Math.max(0, Math.min(100, updated[id].health + delta));
      updated[id] = { ...updated[id], health: newHealth };
    }
  }
  return updated;
}

// ============================================================
// Helper: apply a defense action to an asset
// ============================================================
export function applyDefenseToAsset(
  asset: CityAsset,
  defense: DefenseActionType,
): CityAsset {
  const action = DEFENSE_ACTIONS[defense];
  if (!action) return asset;

  const newHealth = Math.min(100, asset.health + action.healthRestored);
  const activeDefenses = asset.activeDefenses.includes(defense)
    ? asset.activeDefenses
    : [...asset.activeDefenses, defense];

  let newStatus: CityAsset['status'] = asset.status;
  if (defense === 'restore_backup' && (asset.status === 'compromised' || asset.status === 'offline')) {
    newStatus = 'recovering';
  } else if (defense === 'isolate' && asset.status === 'compromised') {
    newStatus = 'offline';
  } else if (newHealth > 80 && asset.status === 'recovering') {
    newStatus = 'secure';
  }

  return { ...asset, health: newHealth, status: newStatus, activeDefenses };
}

// ============================================================
// Helper: build a mission report
// ============================================================
export function buildMissionReport(
  state: AppState,
  scenarioId: ScenarioId,
): MissionReport {
  const scenario = SCENARIOS[scenarioId];
  const assets = Object.values(state.assets);

  const assetsRecovered = assets
    .filter((a) => scenario.affectedAssetIds.includes(a.id) && (a.status === 'secure' || a.status === 'recovering'))
    .map((a) => a.id);

  const assetsLost = assets
    .filter((a) => scenario.affectedAssetIds.includes(a.id) && (a.status === 'compromised' || a.status === 'offline'))
    .map((a) => a.id);

  const defensesUsed = state.threatLog
    .filter((entry) => entry.message.includes('[DEFENSE]'))
    .map((entry) => {
      const match = entry.message.match(/\[DEFENSE:([^\]]+)\]/);
      return match ? (match[1] as DefenseActionType) : null;
    })
    .filter(Boolean) as DefenseActionType[];

  const finalScore = calculateScore(state.score, assetsRecovered.length, assetsLost.length);
  const grade = calculateGrade(finalScore.total);
  const feedback = generateFeedback(grade, assetsRecovered.length, assetsLost.length);

  return {
    scenarioId,
    scenarioTitle: scenario.title,
    completedAt: new Date().toISOString(),
    score: finalScore,
    defensesUsed: [...new Set(defensesUsed)],
    assetsRecovered,
    assetsLost,
    grade,
    feedback,
  };
}

// ============================================================
// Initial App State
// ============================================================
export function buildInitialState(): AppState {
  return {
    assets: { ...INITIAL_ASSETS },
    threatLog: [
      {
        id: generateLogId(),
        timestamp: generateTimestamp(),
        message: '[SYSTEM] Cyberpunk Smart City Defense System online. All systems nominal.',
        severity: 'info',
        district: 'system',
        isSimulation: true,
      },
    ],
    score: {
      total: 0,
      servicesProtected: 100,
      downtimeAvoided: 100,
      citizenTrust: 100,
      defensesApplied: 0,
    },
    selectedAssetId: null,
    simulation: {
      activeScenarioId: null,
      currentEventIndex: 0,
      isAutoPlaying: false,
      isComplete: false,
      startedAt: null,
    },
    missionReport: null,
    hardwareMode: false,
    soundEnabled: false,
    learningDrawerOpen: false,
    logFilter: {
      severity: 'all',
      district: 'all',
    },
  };
}

// ============================================================
// Load state from localStorage
// ============================================================
const STORAGE_KEY = 'cyberpunk_city_state';

export function loadSavedSettings(): Partial<AppState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved) as Partial<AppState>;
    // Only restore UI preferences, not game state
    return {
      soundEnabled: parsed.soundEnabled ?? false,
      hardwareMode: parsed.hardwareMode ?? false,
    };
  } catch {
    return {};
  }
}

export function saveSettings(state: AppState): void {
  try {
    const toSave: Partial<AppState> = {
      soundEnabled: state.soundEnabled,
      hardwareMode: state.hardwareMode,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // localStorage may not be available in some environments
  }
}

// ============================================================
// Main Reducer
// ============================================================
export function cityReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_ASSET':
      return { ...state, selectedAssetId: action.payload };

    case 'START_SCENARIO': {
      const scenario = SCENARIOS[action.payload];
      if (!scenario) return state;

      // Reset only affected assets to initial state
      const resetAssets = { ...state.assets };
      for (const id of scenario.affectedAssetIds) {
        if (INITIAL_ASSETS[id]) {
          resetAssets[id] = { ...INITIAL_ASSETS[id] };
        }
      }

      const startLog: ThreatLogEntry = {
        id: generateLogId(),
        timestamp: generateTimestamp(),
        message: `[SYSTEM] Scenario started: "${scenario.title}" — Stand by for incident simulation`,
        severity: 'info',
        district: 'system',
        isSimulation: true,
      };

      return {
        ...state,
        assets: resetAssets,
        threatLog: [...state.threatLog, startLog],
        simulation: {
          activeScenarioId: action.payload,
          currentEventIndex: 0,
          isAutoPlaying: false,
          isComplete: false,
          startedAt: new Date().toISOString(),
        },
        missionReport: null,
      };
    }

    case 'ADVANCE_EVENT': {
      const { activeScenarioId, currentEventIndex } = state.simulation;
      if (!activeScenarioId) return state;

      const scenario = SCENARIOS[activeScenarioId];
      const event = scenario.events[currentEventIndex];
      if (!event) return state;

      // Apply event changes to assets
      const updatedAssets = applyEventToAssets(
        state.assets,
        event.statusChanges,
        event.healthChanges,
      );

      // Build log entry
      const logEntry: ThreatLogEntry = {
        id: generateLogId(),
        timestamp: generateTimestamp(),
        message: event.logMessage,
        severity: event.severity,
        district: updatedAssets[event.affectedAssetIds[0]]?.district ?? 'system',
        assetId: event.affectedAssetIds[0],
        isSimulation: true,
      };

      // Update score
      const damageDealt = Object.values(event.healthChanges).reduce(
        (sum, delta) => sum + Math.abs(Math.min(0, delta)),
        0,
      );
      const newScore: MissionScore = {
        ...state.score,
        servicesProtected: Math.max(0, state.score.servicesProtected - damageDealt * 0.3),
        citizenTrust: Math.max(0, state.score.citizenTrust - damageDealt * 0.2),
        downtimeAvoided: Math.max(0, state.score.downtimeAvoided - damageDealt * 0.1),
      };

      const nextIndex = currentEventIndex + 1;
      const isLastEvent = nextIndex >= scenario.events.length;

      return {
        ...state,
        assets: updatedAssets,
        threatLog: [...state.threatLog, logEntry],
        score: newScore,
        simulation: {
          ...state.simulation,
          currentEventIndex: nextIndex,
          isComplete: isLastEvent,
        },
      };
    }

    case 'APPLY_DEFENSE': {
      const { assetId, defense } = action.payload;
      const asset = state.assets[assetId];
      if (!asset) return state;

      const action_data = DEFENSE_ACTIONS[defense];
      if (!action_data) return state;

      // Check if defense is applicable
      if (!action_data.applicableStatuses.includes(asset.status)) return state;

      const updatedAsset = applyDefenseToAsset(asset, defense);

      const logEntry: ThreatLogEntry = {
        id: generateLogId(),
        timestamp: generateTimestamp(),
        message: `[DEFENSE:${defense}] Applied "${action_data.label}" to ${asset.name} — [SIMULATION] This is a defensive measure in the city simulation`,
        severity: 'info',
        district: asset.district,
        assetId,
        isSimulation: true,
      };

      const newScore: MissionScore = {
        total: state.score.total + action_data.scoreGain,
        servicesProtected: Math.min(100, state.score.servicesProtected + action_data.healthRestored * 0.3),
        downtimeAvoided: Math.min(100, state.score.downtimeAvoided + action_data.downtimeAvoided * 0.3),
        citizenTrust: Math.min(100, state.score.citizenTrust + action_data.trustGain),
        defensesApplied: state.score.defensesApplied + 1,
      };

      return {
        ...state,
        assets: { ...state.assets, [assetId]: updatedAsset },
        threatLog: [...state.threatLog, logEntry],
        score: newScore,
      };
    }

    case 'ADD_LOG_ENTRY':
      return {
        ...state,
        threatLog: [...state.threatLog, action.payload],
      };

    case 'COMPLETE_SCENARIO': {
      const { activeScenarioId } = state.simulation;
      if (!activeScenarioId) return state;

      const report = buildMissionReport(state, activeScenarioId);
      return {
        ...state,
        simulation: { ...state.simulation, isComplete: true, isAutoPlaying: false },
        missionReport: report,
      };
    }

    case 'SET_AUTO_PLAY':
      return {
        ...state,
        simulation: { ...state.simulation, isAutoPlaying: action.payload },
      };

    case 'RESET_CITY': {
      const initial = buildInitialState();
      const resetLog: ThreatLogEntry = {
        id: generateLogId(),
        timestamp: generateTimestamp(),
        message: '[SYSTEM] City reset complete. All systems restored to nominal state.',
        severity: 'info',
        district: 'system',
        isSimulation: true,
      };
      return {
        ...initial,
        soundEnabled: state.soundEnabled,
        hardwareMode: state.hardwareMode,
        threatLog: [resetLog],
      };
    }

    case 'SET_HARDWARE_MODE':
      return { ...state, hardwareMode: action.payload };

    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };

    case 'TOGGLE_LEARNING_DRAWER':
      return { ...state, learningDrawerOpen: !state.learningDrawerOpen };

    case 'SET_LOG_FILTER':
      return { ...state, logFilter: { ...state.logFilter, ...action.payload } };

    case 'LOAD_SAVED_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}
