// ============================================================
// ThreatConsole — Terminal-style event log panel
// ============================================================
import { useRef, useEffect } from 'react';
import { useAppState } from '../context/AppContext';
import type { SeverityLevel, District } from '../types/city';

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  info: 'INFO',
  warning: 'WARN',
  alert: 'ALRT',
  critical: 'CRIT',
};

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.toLocaleTimeString('en-US', { hour12: false })}`;
  } catch {
    return '??:??:??';
  }
}

export function ThreatConsole() {
  const { state, dispatch } = useAppState();
  const { threatLog, logFilter } = state;
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threatLog.length]);

  const filteredLog = threatLog.filter((entry) => {
    if (logFilter.severity !== 'all' && entry.severity !== logFilter.severity) return false;
    if (logFilter.district !== 'all' && entry.district !== logFilter.district) return false;
    return true;
  });

  return (
    <div className="panel threat-console" role="region" aria-label="Threat Intelligence Console" aria-live="polite">
      <div className="panel-header">
        <span className="panel-title">
          Threat Console
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--text-muted)',
          }}
        >
          {filteredLog.length} entries
        </span>
      </div>

      {/* Filters */}
      <div className="threat-console__filters" role="group" aria-label="Log filters">
        <label className="sr-only" htmlFor="severity-filter">Filter by severity</label>
        <select
          id="severity-filter"
          className="filter-select"
          value={logFilter.severity}
          onChange={(e) =>
            dispatch({
              type: 'SET_LOG_FILTER',
              payload: { severity: e.target.value as SeverityLevel | 'all' },
            })
          }
          aria-label="Filter log by severity"
        >
          <option value="all">All Severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="alert">Alert</option>
          <option value="critical">Critical</option>
        </select>

        <label className="sr-only" htmlFor="district-filter">Filter by district</label>
        <select
          id="district-filter"
          className="filter-select"
          value={logFilter.district}
          onChange={(e) =>
            dispatch({
              type: 'SET_LOG_FILTER',
              payload: { district: e.target.value as District | 'system' | 'all' },
            })
          }
          aria-label="Filter log by district"
        >
          <option value="all">All Districts</option>
          <option value="system">System</option>
          <option value="transit">Transit</option>
          <option value="health">Health</option>
          <option value="energy">Energy</option>
          <option value="civic">Civic</option>
        </select>
      </div>

      {/* Log entries */}
      <div className="panel-body" role="log" aria-label="Event log">
        {filteredLog.length === 0 ? (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--text-dim)',
              textAlign: 'center',
              paddingTop: 'var(--space-lg)',
            }}
          >
            No events matching filter...
          </div>
        ) : (
          filteredLog.map((entry) => (
            <div key={entry.id} className="log-entry">
              <span className="log-entry__time" aria-hidden="true">
                {formatTimestamp(entry.timestamp)}
              </span>
              <span
                className={`log-entry__severity ${entry.severity}`}
                aria-label={`Severity: ${entry.severity}`}
              >
                [{SEVERITY_LABELS[entry.severity]}]
              </span>
              <span className={`log-entry__message ${entry.severity}`}>
                {entry.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </div>
  );
}
