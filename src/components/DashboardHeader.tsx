// ============================================================
// DashboardHeader — Command Center title, live KPIs and actions
// ============================================================
import { useEffect, useState } from 'react';
import { useAppState } from '../context/AppContext';
import { useCitySummary } from '../hooks/useCitySummary';
import { useCountUp } from '../hooks/useCountUp';
import { useNow } from '../hooks/useNow';

const HISTORY_LENGTH = 48;
const SAMPLE_MS = 2000;

function Kpi({ label, value, suffix = '', color }: { label: string; value: number; suffix?: string; color: string }) {
  const shown = useCountUp(value);
  return (
    <div className="kpi" style={{ '--kpi-color': color } as React.CSSProperties}>
      <span className="kpi__label">{label}</span>
      <span className="kpi__value" aria-label={`${label}: ${Math.round(value)}${suffix}`}>
        {shown}
        {suffix}
      </span>
      {suffix === '%' && (
        <span className="kpi__bar" aria-hidden="true">
          <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </span>
      )}
    </div>
  );
}

// Real samples of city health over the session, drawn as an area sparkline
function HealthSparkline({ health }: { health: number }) {
  const [history, setHistory] = useState<number[]>(() => Array(HISTORY_LENGTH).fill(health));
  const [lastHealth, setLastHealth] = useState(health);

  // Record changes immediately (derived during render, no extra effect pass)
  if (health !== lastHealth) {
    setLastHealth(health);
    setHistory((h) => [...h.slice(1), health]);
  }

  // Keep sampling while idle so the trend line scrolls in real time
  useEffect(() => {
    const id = setInterval(() => setHistory((h) => [...h.slice(1), h[h.length - 1]]), SAMPLE_MS);
    return () => clearInterval(id);
  }, []);

  const w = 160;
  const hgt = 44;
  const pts = history.map((v, i) => [(i / (HISTORY_LENGTH - 1)) * w, hgt - 4 - (v / 100) * (hgt - 8)]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${hgt} L0,${hgt} Z`;

  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${hgt}`} preserveAspectRatio="none" role="img" aria-label={`City health trend, currently ${health}%`}>
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function DashboardHeader() {
  const { state, dispatch } = useAppState();
  const { score, soundEnabled } = state;
  const city = useCitySummary();
  const now = useNow();
  const healthShown = useCountUp(city.health);

  return (
    <div className="dash-header">
      <div className="dash-header__intro">
        <span className="eyebrow">Live operations</span>
        <h2 className="section-title">Command Center</h2>
        <p className="dash-header__meta">
          <span className={`live-pill tone-${city.tone}`} role="status" aria-live="polite">
            <span className="live-pill__dot" aria-hidden="true" />
            {city.label}
          </span>
          <time className="dash-header__clock" dateTime={now.toISOString()}>
            {now.toLocaleTimeString('en-GB', { hour12: false })} local
          </time>
        </p>
      </div>

      <div className={`health-card tone-${city.tone}`}>
        <div className="health-card__head">
          <span className="kpi__label">City health</span>
          <span className="health-card__value">{healthShown}%</span>
        </div>
        <HealthSparkline health={city.health} />
      </div>

      <div className="kpi-grid" aria-label="Mission scores">
        <Kpi label="Mission score" value={score.total} color="var(--accent-orange)" />
        <Kpi label="Protected" value={score.servicesProtected} suffix="%" color="var(--status-secure)" />
        <Kpi label="Uptime" value={score.downtimeAvoided} suffix="%" color="var(--accent-cyan)" />
        <Kpi label="Citizen trust" value={score.citizenTrust} suffix="%" color="var(--status-recovering)" />
      </div>

      <div className="dash-header__actions">
        <button
          className="pill-btn pill-btn--glass"
          onClick={() => dispatch({ type: 'TOGGLE_LEARNING_DRAWER' })}
          aria-label="Open cybersecurity learning guide"
          aria-expanded={state.learningDrawerOpen}
          id="learn-why-btn"
        >
          Learn Why
        </button>
        <button
          className={`icon-btn${soundEnabled ? ' is-on' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
          aria-label={`Sound: ${soundEnabled ? 'On' : 'Off'} — click to toggle`}
          aria-pressed={soundEnabled}
          title={`Sound is ${soundEnabled ? 'on' : 'off'}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            {soundEnabled ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="m16 9 5 6m0-6-5 6" />}
          </svg>
        </button>
        <button
          className="pill-btn pill-btn--danger"
          onClick={() => {
            if (confirm('Reset the entire city to its original state? All scenario progress will be lost.')) {
              dispatch({ type: 'RESET_CITY' });
            }
          }}
          aria-label="Reset city to initial state"
          id="reset-city-btn"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
