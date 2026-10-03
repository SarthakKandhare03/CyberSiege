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
      <div className="panel mission-panel">
        <div className="panel-header">
          <span className="panel-title">Mission Report</span>
        </div>
        <div className="panel-body">
          <MissionReport />
        </div>
      </div>
    );
  }

  // Active scenario view
  if (activeScenario && !simulation.isComplete) {
    const totalEvents = activeScenario.events.length;
    const currentIndex = simulation.currentEventIndex;
    const progressPct = (currentIndex / totalEvents) * 100;

    return (
      <div className="panel mission-panel active-scenario" role="region" aria-label={`Active Scenario: ${activeScenario.title}`}>
        <div className="panel-header">
          <span className="panel-title" style={{ color: 'var(--neon-magenta)' }}>
            <span style={{ marginRight: '4px' }}>⚠</span>
            {activeScenario.title}
          </span>
          <span className={`scenario-card__difficulty difficulty-${activeScenario.difficulty}`}>
            {activeScenario.difficulty}
          </span>
        </div>
        <div className="panel-body">
          {/* Subtitle */}
          <p className="active-scenario__story" style={{ marginBottom: 'var(--space-sm)', fontStyle: 'italic', color: 'var(--neon-magenta)', fontSize: '0.75rem' }}>
            {activeScenario.subtitle}
          </p>

          {/* Progress */}
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div
              style={{
                height: '4px',
                background: 'var(--bg-dark)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '4px',
              }}
              role="progressbar"
              aria-valuenow={currentIndex}
              aria-valuemax={totalEvents}
              aria-label={`Scenario progress: event ${currentIndex} of ${totalEvents}`}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, var(--neon-magenta), var(--neon-purple))',
                  transition: 'width 0.5s ease',
                  borderRadius: '2px',
                }}
              />
            </div>
            <p className="event-progress">
              Event {currentIndex} of {totalEvents}
            </p>
          </div>

          {/* Current event */}
          {currentEvent ? (
            <div className="event-card" aria-live="polite">
              <div className="event-card__title">{currentEvent.title}</div>
              <div className="event-card__narrative">{currentEvent.narrative}</div>
              <div className="event-card__teaching">
                <div className="event-card__teaching-label">💡 Teaching Point</div>
                <div className="event-card__teaching-text">{currentEvent.teachingPoint}</div>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(0,229,255,0.06)',
                border: '1px solid rgba(0,229,255,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                marginBottom: 'var(--space-md)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                lineHeight: '1.7',
              }}
            >
              <strong style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', display: 'block', marginBottom: '6px' }}>
                🚨 SCENARIO BRIEF
              </strong>
              {activeScenario.story}
            </div>
          )}

          {/* Teaches section */}
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              This scenario teaches:
            </div>
            <div className="dependencies-list">
              {activeScenario.teaches.map((t, i) => (
                <span
                  key={i}
                  className="dependency-tag"
                  style={{ color: 'var(--neon-purple)', borderColor: 'rgba(162,89,255,0.3)' }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="scenario-controls">
            <button
              className="btn btn-solid-magenta btn-lg"
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
      </div>
    );
  }

  // Scenario selection view
  return (
    <div className="panel mission-panel" role="region" aria-label="Mission Command Center">
      <div className="panel-header">
        <span className="panel-title">Mission Command</span>
      </div>
      <div className="panel-body">
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-md)',
            lineHeight: '1.6',
          }}
        >
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
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span className={`scenario-card__difficulty difficulty-${scenario.difficulty}`}>
                {scenario.difficulty}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  color: 'var(--text-muted)',
                }}
              >
                {scenario.events.length} events · {scenario.affectedAssetIds.length} assets
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
