// ============================================================
// MissionDock — floating glass card that follows the mission state
// ============================================================
import { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { SCENARIOS } from '../../data/scenarios';
import { scrollToSection } from '../../utils/scroll';

export function MissionDock() {
  const { state, dispatch } = useAppState();
  const { simulation, missionReport } = state;

  // Dismissal is tied to the mission phase: a new phase brings the dock back
  const phaseKey = `${simulation.activeScenarioId ?? 'idle'}:${missionReport ? 'report' : 'live'}`;
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  if (dismissedKey === phaseKey) return null;

  const scenario = simulation.activeScenarioId ? SCENARIOS[simulation.activeScenarioId] : null;
  const total = scenario?.events.length ?? 0;
  const progress = total ? (simulation.currentEventIndex / total) * 100 : 0;

  let icon = (
    <path d="M9 3h6m-7 4h8M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1 9h5m-5 4h3m6-1 1.5 1.5L21 14" />
  );
  let title = 'Start a Mission';
  let body = 'Pick an incident scenario and defend the city in real time.';
  let action = (
    <button className="dock-btn" onClick={() => scrollToSection('missions')}>
      Get Started
    </button>
  );
  let tone = 'idle';

  if (missionReport) {
    tone = 'report';
    icon = <path d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4Zm10 1h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />;
    title = `Mission complete · Grade ${missionReport.grade}`;
    body = `${missionReport.scenarioTitle} — score ${missionReport.score.total}.`;
    action = (
      <button className="dock-btn" onClick={() => scrollToSection('missions')}>
        View Report
      </button>
    );
  } else if (scenario) {
    tone = 'live';
    icon = <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />;
    title = scenario.title;
    body = simulation.currentEventIndex === 0
      ? 'Incident briefing ready — advance when you are prepared.'
      : `Event ${simulation.currentEventIndex} of ${total}: ${scenario.events[simulation.currentEventIndex - 1]?.title}`;
    action = (
      <button
        className="dock-btn"
        onClick={() => dispatch({ type: 'ADVANCE_EVENT' })}
        disabled={simulation.isAutoPlaying || simulation.isComplete}
      >
        {simulation.isAutoPlaying ? 'Auto-playing…' : 'Next Event'}
      </button>
    );
  }

  return (
    <aside className={`mission-dock mission-dock--${tone}`} aria-label="Mission status" aria-live="polite">
      <svg className="mission-dock__icon" viewBox="0 0 24 24" aria-hidden="true">
        {icon}
      </svg>
      <p className="mission-dock__text">
        <strong>{title}</strong> <span>{body}</span>
      </p>
      {action}
      <button className="mission-dock__close" aria-label="Dismiss mission card" onClick={() => setDismissedKey(phaseKey)}>
        ×
      </button>
      {tone === 'live' && (
        <span className="mission-dock__progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      )}
    </aside>
  );
}
