// ============================================================
// useCitySummary — memoized live city posture
// ============================================================
import { useMemo } from 'react';
import { useAppState } from '../context/AppContext';
import { summarizeCity, getCityStatusLabel, type CitySummary } from '../engine/scoring';

export type CityStatusTone = 'nominal' | 'minor' | 'significant' | 'critical' | 'attack';

export function getStatusTone(health: number): CityStatusTone {
  if (health >= 90) return 'nominal';
  if (health >= 70) return 'minor';
  if (health >= 50) return 'significant';
  if (health >= 30) return 'critical';
  return 'attack';
}

export function useCitySummary(): CitySummary & { label: string; tone: CityStatusTone } {
  const { state } = useAppState();
  return useMemo(() => {
    const summary = summarizeCity(Object.values(state.assets));
    const tone = getStatusTone(summary.health);
    // Average health can hide a live breach — never report "nominal" during one
    if (tone === 'nominal' && summary.compromised > 0) {
      return { ...summary, label: 'ACTIVE INCIDENT', tone: 'minor' as const };
    }
    return { ...summary, label: getCityStatusLabel(summary.health), tone };
  }, [state.assets]);
}
