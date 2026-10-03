// ============================================================
// CYBERPUNK SMART CITY — Core TypeScript Types
// Educational cybersecurity simulation project
// ============================================================

export type AssetStatus = 'secure' | 'warning' | 'compromised' | 'offline' | 'recovering';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type District = 'transit' | 'health' | 'energy' | 'civic';

export type DefenseActionType =
  | 'patch'
  | 'mfa'
  | 'segment'
  | 'isolate'
  | 'restore_backup'
  | 'activate_monitoring'
  | 'notify_citizens';

export type ScenarioId = 'scenario_1' | 'scenario_2' | 'scenario_3';

export type SeverityLevel = 'info' | 'warning' | 'alert' | 'critical';

// ============================================================
// City Asset
// ============================================================
export interface CityAsset {
  id: string;
  name: string;
  district: District;
  description: string;
  status: AssetStatus;
  health: number; // 0–100
  riskLevel: RiskLevel;
  dependencies: string[]; // asset IDs this depends on
  activeDefenses: DefenseActionType[];
  learningMessage: string;
  svgIcon: string; // SVG path data for rendering
  position: { x: number; y: number }; // % position on city map
}

// ============================================================
// Threat / Event Log Entry
// ============================================================
export interface ThreatLogEntry {
  id: string;
  timestamp: string; // ISO string generated locally
  message: string;
  severity: SeverityLevel;
  district: District | 'system';
  assetId?: string;
  isSimulation: true; // always true — this is a simulation
}

// ============================================================
// Defense Action
// ============================================================
export interface DefenseAction {
  type: DefenseActionType;
  label: string;
  description: string;
  simpleExplanation: string;
  applicableStatuses: AssetStatus[]; // statuses on which this action is valid
  healthRestored: number;
  trustGain: number;
  scoreGain: number;
  downtimeAvoided: number;
}

// ============================================================
// Scenario Event (a single step in a scenario)
// ============================================================
export interface ScenarioEvent {
  id: string;
  sequenceIndex: number;
  title: string;
  description: string;
  narrative: string;
  affectedAssetIds: string[];
  statusChanges: Record<string, AssetStatus>;
  healthChanges: Record<string, number>; // delta values
  logMessage: string;
  severity: SeverityLevel;
  recommendedDefenses: DefenseActionType[];
  teachingPoint: string;
}

// ============================================================
// Scenario
// ============================================================
export interface Scenario {
  id: ScenarioId;
  title: string;
  subtitle: string;
  story: string;
  teaches: string[];
  affectedAssetIds: string[];
  events: ScenarioEvent[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// ============================================================
// Mission / Score
// ============================================================
export interface MissionScore {
  total: number;
  servicesProtected: number;
  downtimeAvoided: number;
  citizenTrust: number;
  defensesApplied: number;
}

// ============================================================
// Mission Report (end of scenario)
// ============================================================
export interface MissionReport {
  scenarioId: ScenarioId;
  scenarioTitle: string;
  completedAt: string;
  score: MissionScore;
  defensesUsed: DefenseActionType[];
  assetsRecovered: string[];
  assetsLost: string[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  feedback: string;
}

// ============================================================
// Hardware Bridge Interface (Mock / Future ESP32)
// ============================================================
export interface HardwareUpdate {
  assetId: string;
  status: AssetStatus;
  health: number;
}

export interface IHardwareBridge {
  isConnected: boolean;
  mode: 'mock' | 'serial';
  sendUpdate(update: HardwareUpdate): void;
  connect(): Promise<void>;
  disconnect(): void;
  onStatusChange?: (connected: boolean) => void;
}

// ============================================================
// App State
// ============================================================
export interface SimulationPhase {
  activeScenarioId: ScenarioId | null;
  currentEventIndex: number;
  isAutoPlaying: boolean;
  isComplete: boolean;
  startedAt: string | null;
}

export interface AppState {
  assets: Record<string, CityAsset>;
  threatLog: ThreatLogEntry[];
  score: MissionScore;
  selectedAssetId: string | null;
  simulation: SimulationPhase;
  missionReport: MissionReport | null;
  hardwareMode: boolean;
  soundEnabled: boolean;
  learningDrawerOpen: boolean;
  logFilter: {
    severity: SeverityLevel | 'all';
    district: District | 'system' | 'all';
  };
}

// ============================================================
// Action Types for useReducer
// ============================================================
export type AppAction =
  | { type: 'SELECT_ASSET'; payload: string | null }
  | { type: 'START_SCENARIO'; payload: ScenarioId }
  | { type: 'ADVANCE_EVENT' }
  | { type: 'SET_AUTO_PLAY'; payload: boolean }
  | { type: 'APPLY_DEFENSE'; payload: { assetId: string; defense: DefenseActionType } }
  | { type: 'ADD_LOG_ENTRY'; payload: ThreatLogEntry }
  | { type: 'COMPLETE_SCENARIO' }
  | { type: 'RESET_CITY' }
  | { type: 'SET_HARDWARE_MODE'; payload: boolean }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_LEARNING_DRAWER' }
  | { type: 'SET_LOG_FILTER'; payload: Partial<AppState['logFilter']> }
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<AppState> };
