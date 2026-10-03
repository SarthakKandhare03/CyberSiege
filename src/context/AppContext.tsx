// ============================================================
// CYBERPUNK SMART CITY — App Context
// React Context + useReducer for global state management
// ============================================================
import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, AppAction } from '../types/city';
import { cityReducer, buildInitialState, loadSavedSettings, saveSettings } from '../engine/simulationEngine';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cityReducer, buildInitialState());

  // Load saved settings on mount
  useEffect(() => {
    const saved = loadSavedSettings();
    if (Object.keys(saved).length > 0) {
      dispatch({ type: 'LOAD_SAVED_STATE', payload: saved });
    }
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(state);
  }, [state.soundEnabled, state.hardwareMode]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
