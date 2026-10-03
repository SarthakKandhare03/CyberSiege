// ============================================================
// App — Main application shell
// ============================================================
import { useAppState } from './context/AppContext';
import { CityMap } from './components/CityMap';
import { AssetDetails } from './components/AssetDetails';
import { ThreatConsole } from './components/ThreatConsole';
import { DefensePanel } from './components/DefensePanel';
import { MissionPanel } from './components/MissionPanel';
import { LearningDrawer } from './components/LearningDrawer';
import { HardwareStatus } from './components/HardwareStatus';
import { calculateCityHealth, getCityStatusLabel } from './engine/scoring';

function CommandBar() {
  const { state, dispatch } = useAppState();
  const { score, assets, soundEnabled } = state;

  const assetHealthValues = Object.values(assets).map((a) => a.health);
  const cityHealth = calculateCityHealth(assetHealthValues);
  const statusLabel = getCityStatusLabel(cityHealth);

  const statusClass =
    cityHealth >= 90 ? 'status-nominal'
    : cityHealth >= 70 ? 'status-minor'
    : cityHealth >= 50 ? 'status-significant'
    : cityHealth >= 30 ? 'status-critical'
    : 'status-attack';

  return (
    <header className="command-bar" role="banner">
      {/* Title */}
      <div className="command-bar__title" aria-label="Cyberpunk Smart City Under Attack">
        CYBERPUNK <span>CITY</span> ⚡
      </div>

      {/* City Status */}
      <div
        className={`command-bar__city-status ${statusClass}`}
        role="status"
        aria-live="polite"
        aria-label={`City status: ${statusLabel}`}
      >
        {statusLabel}
      </div>

      {/* Score Bar */}
      <nav className="score-bar" aria-label="Mission scores">
        <div className="score-item">
          <span className="score-item__label">Mission Score</span>
          <span
            className="score-item__value"
            aria-label={`Mission score: ${score.total}`}
          >
            {score.total}
          </span>
        </div>
        <div className="score-item">
          <span className="score-item__label">Protected</span>
          <span
            className="score-item__value"
            style={{ color: 'var(--status-secure)' }}
            aria-label={`Services protected: ${Math.round(score.servicesProtected)}%`}
          >
            {Math.round(score.servicesProtected)}%
          </span>
        </div>
        <div className="score-item">
          <span className="score-item__label">Uptime</span>
          <span
            className="score-item__value"
            style={{ color: 'var(--neon-amber)' }}
            aria-label={`Downtime avoided: ${Math.round(score.downtimeAvoided)}%`}
          >
            {Math.round(score.downtimeAvoided)}%
          </span>
        </div>
        <div className="score-item">
          <span className="score-item__label">Trust</span>
          <span
            className="score-item__value"
            style={{ color: 'var(--neon-purple)' }}
            aria-label={`Citizen trust: ${Math.round(score.citizenTrust)}%`}
          >
            {Math.round(score.citizenTrust)}%
          </span>
        </div>
      </nav>

      {/* Actions */}
      <div className="command-bar__actions">
        <button
          className="btn btn-cyan"
          onClick={() => dispatch({ type: 'TOGGLE_LEARNING_DRAWER' })}
          aria-label="Open cybersecurity learning guide"
          aria-expanded={state.learningDrawerOpen}
          id="learn-why-btn"
        >
          💡 Learn Why
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
          aria-label={`Sound: ${soundEnabled ? 'On' : 'Off'} — click to toggle`}
          aria-pressed={soundEnabled}
          title={`Sound is ${soundEnabled ? 'on' : 'off'}`}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <button
          className="btn btn-magenta"
          onClick={() => {
            if (confirm('Reset the entire city to its original state? All scenario progress will be lost.')) {
              dispatch({ type: 'RESET_CITY' });
            }
          }}
          aria-label="Reset city to initial state"
          id="reset-city-btn"
        >
          🔄 Reset
        </button>
      </div>
    </header>
  );
}

function App() {
  return (
    <>
      {/* Scanline effect overlay */}
      <div className="scanline-overlay" aria-hidden="true" />

      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="app">
        <CommandBar />

        <main id="main-content" className="main-content" role="main">
          {/* Left column: City Map + Threat Console */}
          <div className="left-column">
            <CityMap />
            <ThreatConsole />
          </div>

          {/* Right column: Mission, Asset Details, Defense, Hardware */}
          <div className="right-column">
            <MissionPanel />
            <AssetDetails />
            <DefensePanel />
            <HardwareStatus />
          </div>
        </main>
      </div>

      {/* Learning drawer (portal) */}
      <LearningDrawer />
    </>
  );
}

export default App;
