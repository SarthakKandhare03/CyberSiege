// ============================================================
// CYBERPUNK SMART CITY — App Context
// React Context + useReducer for global state management
// ============================================================
import { createContext, useContext, useReducer, useEffect, useMemo, type ReactNode } from 'react';
import type { AppState, AppAction } from '../types/city';
import { cityReducer, buildInitialState, loadSavedSettings, saveSettings } from '../engine/simulationEngine';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

// Restore saved preferences synchronously so the first paint is already correct
function initState(): AppState {
  return { ...buildInitialState(), ...loadSavedSettings() };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cityReducer, undefined, initState);

  // Save settings whenever they change
  const { soundEnabled, hardwareMode } = state;
  useEffect(() => {
    saveSettings({ soundEnabled, hardwareMode });
  }, [soundEnabled, hardwareMode]);

  // Stable context value — consumers only re-render when state actually changes
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook lives beside its provider by design; Fast Refresh falls back to a full reload for this file
// eslint-disable-next-line react/only-export-components
export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
