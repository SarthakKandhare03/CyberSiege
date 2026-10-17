// ============================================================
// MissionPanel — Scenario selection, playback, and report
// ============================================================
import { useEffect, useRef } from 'react';
import { useAppState } from '../context/AppContext';
import { SCENARIOS } from '../data/scenarios';
import type { ScenarioId } from '../types/city';

function MissionReport() {
  const { state, dispatch } = useAppState();
  const report = state.missionReport;
  if (!report) return null;

  return (
    <div className="mission-report" role="region" aria-label="Mission Report">
      <div
        className={`mission-report__grade grade-${report.grade}`}
        aria-label={`Mission grade: ${report.grade}`}
      >
        {report.grade}
      </div>
      <div className="mission-report__title">
        Mission Complete: {report.scenarioTitle}
      </div>
      <div className="mission-report__feedback">
        {report.feedback}
      </div>

      <div className="report-scores" role="list" aria-label="Final scores">
        <div className="report-score-item" role="listitem">
          <div className="report-score-item__value">{report.score.total}</div>
          <div className="report-score-item__label">Total Score</div>
        </div>
        <div className="report-score-item" role="listitem">
          <div className="report-score-item__value" style={{ color: 'var(--status-secure)' }}>
            {Math.round(report.score.servicesProtected)}%
          </div>
          <div className="report-score-item__label">Protected</div>
        </div>
        <div className="report-score-item" role="listitem">
          <div className="report-score-item__value" style={{ color: 'var(--neon-purple)' }}>
            {Math.round(report.score.citizenTrust)}%
          </div>
          <div className="report-score-item__label">Trust</div>
        </div>
        <div className="report-score-item" role="listitem">
          <div className="report-score-item__value" style={{ color: 'var(--neon-amber)' }}>
            {report.defensesUsed.length}
          </div>
          <div className="report-score-item__label">Defenses</div>
        </div>
      </div>

      <div className="report-assets">
        <div className="report-asset-list recovered" role="list" aria-label="Recovered assets">
          <div className="report-asset-list__title">✅ Systems Recovered</div>
          <ul>
            {report.assetsRecovered.length > 0
              ? report.assetsRecovered.map((id) => (
                  <li key={id}>{state.assets[id]?.name || id}</li>
                ))
              : <li style={{ color: 'var(--text-dim)' }}>None</li>
            }
          </ul>
        </div>
        <div className="report-asset-list lost" role="list" aria-label="Lost assets">
          <div className="report-asset-list__title">❌ Systems Lost</div>
          <ul>
            {report.assetsLost.length > 0
              ? report.assetsLost.map((id) => (
                  <li key={id}>{state.assets[id]?.name || id}</li>
                ))
              : <li style={{ color: 'var(--text-dim)' }}>None — great work!</li>
            }
          </ul>
        </div>
      </div>

      <div className="report-actions">
        <button
          className="btn btn-cyan btn-lg"
          onClick={() => {
            if (state.simulation.activeScenarioId) {
              dispatch({ type: 'START_SCENARIO', payload: state.simulation.activeScenarioId });
            }
          }}
          aria-label="Replay this scenario"
        >
          ↺ Replay Scenario
        </button>
        <button
          className="btn btn-magenta btn-lg"
          onClick={() => dispatch({ type: 'RESET_CITY' })}
          aria-label="Reset the entire city"
        >
          🔄 Reset City
        </button>
      </div>
    </div>
  );
}

export function MissionPanel() {
  const { state, dispatch } = useAppState();
  const { simulation, missionReport } = state;
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeScenario = simulation.activeScenarioId
    ? SCENARIOS[simulation.activeScenarioId]
    : null;

  const currentEvent = activeScenario
    ? activeScenario.events[simulation.currentEventIndex - 1]
    : null;

  // Auto-play logic
  useEffect(() => {
    if (simulation.isAutoPlaying && !simulation.isComplete) {
      autoPlayRef.current = setInterval(() => {
        dispatch({ type: 'ADVANCE_EVENT' });
      }, 3000);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [simulation.isAutoPlaying, simulation.isComplete, dispatch]);

  // Auto-complete scenario when all events done
  useEffect(() => {
    if (simulation.isComplete && !missionReport && simulation.activeScenarioId) {
      dispatch({ type: 'COMPLETE_SCENARIO' });
    }
  }, [simulation.isComplete, missionReport, simulation.activeScenarioId, dispatch]);

  const handleStartScenario = (id: ScenarioId) => {
    dispatch({ type: 'START_SCENARIO', payload: id });
  };

  const handleNextEvent = () => {
    dispatch({ type: 'ADVANCE_EVENT' });
  };

  const handleAutoPlay = () => {
    dispatch({ type: 'SET_AUTO_PLAY', payload: !simulation.isAutoPlaying });
  };

  // If we have a report, show it
  if (missionReport) {
    return (
      <section id="missions" className="panel mission-panel" aria-label="Mission Report">
        <div className="panel-header">
          <span className="panel-title">Mission Report</span>
        </div>
        <div className="panel-body">
          <MissionReport />
        </div>
      </section>
    );
  }

  // Active scenario view
  if (activeScenario && !simulation.isComplete) {
    const totalEvents = activeScenario.events.length;
    const currentIndex = simulation.currentEventIndex;
    const progressPct = (currentIndex / totalEvents) * 100;

    return (
      <section id="missions" className="panel mission-panel active-scenario" aria-label={`Active Scenario: ${activeScenario.title}`}>
        <div className="panel-header">
          <span className="panel-title panel-title--hostile">
            {activeScenario.title}
          </span>
          <span className={`scenario-card__difficulty difficulty-${activeScenario.difficulty}`}>
            {activeScenario.difficulty}
          </span>
        </div>
        <div className="panel-body">
          {/* Subtitle */}
          <p className="active-scenario__subtitle">
            {activeScenario.subtitle}
          </p>

          {/* Progress */}
          <div className="scenario-progress">
            <div
              className="scenario-progress__track"
              role="progressbar"
              aria-valuenow={currentIndex}
              aria-valuemin={0}
              aria-valuemax={totalEvents}
              aria-label={`Scenario progress: event ${currentIndex} of ${totalEvents}`}
            >
              <div className="scenario-progress__fill" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="event-progress">
              Event {currentIndex} of {totalEvents}
            </p>
          </div>

          {/* Current event */}
          {currentEvent ? (
            <div className="event-card" aria-live="polite" key={currentEvent.id}>
              <div className="event-card__title">{currentEvent.title}</div>
              <div className="event-card__narrative">{currentEvent.narrative}</div>
              <div className="event-card__teaching">
                <div className="event-card__teaching-label">💡 Teaching Point</div>
                <div className="event-card__teaching-text">{currentEvent.teachingPoint}</div>
              </div>
            </div>
          ) : (
            <div className="scenario-brief">
              <strong className="scenario-brief__label">Scenario brief</strong>
              {activeScenario.story}
            </div>
          )}

          {/* Teaches section */}
          <div className="teaches">
            <div className="micro-label">This scenario teaches</div>
            <div className="dependencies-list">
              {activeScenario.teaches.map((t, i) => (
                <span key={i} className="dependency-tag dependency-tag--learn">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="scenario-controls">
            <button
              className="btn btn-solid-cyan btn-lg"
              onClick={handleNextEvent}
              disabled={simulation.isAutoPlaying}
              aria-label="Advance to next event"
              id="next-event-btn"
            >
              ▶ Next Event
            </button>
            <button
              className={`btn btn-lg ${simulation.isAutoPlaying ? 'btn-amber' : 'btn-cyan'}`}
              onClick={handleAutoPlay}
              aria-label={simulation.isAutoPlaying ? 'Stop auto-play' : 'Start auto-play demo mode'}
              aria-pressed={simulation.isAutoPlaying}
            >
              {simulation.isAutoPlaying ? '⏸ Stop Demo' : '⚡ Auto Demo'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => dispatch({ type: 'RESET_CITY' })}
              aria-label="Abort scenario and reset city"
            >
              ✕ Abort
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Scenario selection view
  return (
    <section id="missions" className="panel mission-panel" aria-label="Mission Command Center">
      <div className="panel-header">
        <span className="panel-title">Mission Command</span>
      </div>
      <div className="panel-body">
        <p className="panel-intro">
          Select an incident scenario to begin your mission as Cyber Defense Commander.
          Each scenario is a safe educational simulation — no real systems are affected.
        </p>

        {Object.values(SCENARIOS).map((scenario, idx) => (
          <button
            key={scenario.id}
            className="scenario-card"
            onClick={() => handleStartScenario(scenario.id)}
            aria-label={`Start scenario: ${scenario.title}`}
            id={`scenario-btn-${idx + 1}`}
          >
            <div className="scenario-card__number">SCENARIO {idx + 1}</div>
            <div className="scenario-card__title">{scenario.title}</div>
            <div className="scenario-card__subtitle">{scenario.subtitle}</div>
            <div className="scenario-card__footer">
              <span className={`scenario-card__difficulty difficulty-${scenario.difficulty}`}>
                {scenario.difficulty}
              </span>
              <span className="scenario-card__meta">
                {scenario.events.length} events · {scenario.affectedAssetIds.length} assets
              </span>
            </div>
            <span className="scenario-card__arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}
