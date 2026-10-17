// ============================================================
// useSoundFx — synthesized UI sound cues (Web Audio, no assets)
// Plays a short tone for each new log entry while sound is on.
// ============================================================
import { useEffect, useRef } from 'react';
import { useAppState } from '../context/AppContext';
import type { ThreatLogEntry } from '../types/city';

type Cue = { freqs: number[]; type: OscillatorType; step: number; gain: number };

const CUES: Record<'info' | 'warning' | 'alert' | 'critical' | 'defense', Cue> = {
  info: { freqs: [660], type: 'sine', step: 0.08, gain: 0.05 },
  defense: { freqs: [520, 780, 1040], type: 'triangle', step: 0.07, gain: 0.06 },
  warning: { freqs: [440, 440], type: 'square', step: 0.12, gain: 0.035 },
  alert: { freqs: [880, 620], type: 'sawtooth', step: 0.14, gain: 0.04 },
  critical: { freqs: [300, 220, 300, 220], type: 'sawtooth', step: 0.13, gain: 0.05 },
};

function cueFor(entry: ThreatLogEntry): Cue {
  if (entry.message.startsWith('[DEFENSE')) return CUES.defense;
  return CUES[entry.severity];
}

export function useSoundFx() {
  const { state } = useAppState();
  const ctxRef = useRef<AudioContext | null>(null);
  const seenRef = useRef(state.threatLog.length);

  useEffect(() => {
    const log = state.threatLog;
    // Log shrank (reset) — just resync
    if (log.length < seenRef.current) {
      seenRef.current = log.length;
      return;
    }
    const fresh = log.slice(seenRef.current);
    seenRef.current = log.length;
    if (!state.soundEnabled || fresh.length === 0) return;

    try {
      ctxRef.current ??= new AudioContext();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') void ctx.resume();

      const cue = cueFor(fresh[fresh.length - 1]);
      const t0 = ctx.currentTime + 0.01;
      cue.freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = t0 + i * cue.step;
        osc.type = cue.type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(cue.gain, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + cue.step * 0.95);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + cue.step);
      });
    } catch {
      // Web Audio unavailable — stay silent
    }
  }, [state.threatLog, state.soundEnabled]);

  useEffect(() => () => void ctxRef.current?.close(), []);
}
