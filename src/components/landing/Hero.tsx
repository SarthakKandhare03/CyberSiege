// ============================================================
// Hero — landing section with live glass scene, KPIs and marquee
// ============================================================
import { useAppState } from '../../context/AppContext';
import { useCitySummary } from '../../hooks/useCitySummary';
import { useCountUp } from '../../hooks/useCountUp';
import { SCENARIOS } from '../../data/scenarios';
import { scrollToSection } from '../../utils/scroll';
import { HeroCanvas } from './HeroCanvas';

function Stat({ value, suffix = '', label, tone }: { value: number; suffix?: string; label: string; tone?: string }) {
  const shown = useCountUp(value);
  return (
    <div className={`hero-stat${tone ? ` hero-stat--${tone}` : ''}`}>
      <span className="hero-stat__value">
        {shown}
        {suffix}
      </span>
      <span className="hero-stat__label">{label}</span>
    </div>
  );
}

export function Hero() {
  const { state, dispatch } = useAppState();
  const city = useCitySummary();
  const { simulation, missionReport, assets, score } = state;

  const activeScenario = simulation.activeScenarioId ? SCENARIOS[simulation.activeScenarioId] : null;
  const missionActive = !!activeScenario && !missionReport;
  const underAttack = city.threatLevel >= 0.35;
  const threats = city.compromised + city.atRisk + city.offline;

  const startDemo = () => {
    dispatch({ type: 'START_SCENARIO', payload: 'scenario_1' });
    dispatch({ type: 'SET_AUTO_PLAY', payload: true });
    scrollToSection('command');
  };

  const assetList = Object.values(assets);

  return (
    <section id="top" className={`hero${underAttack ? ' is-hostile' : ''}`} aria-labelledby="hero-title">
      <HeroCanvas threatLevel={city.threatLevel} />
      <div className="hero__glow" aria-hidden="true" />

      <div className="hero__content">
        <span className="hero-badge">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2l1.8 5.4L19 9.2l-5.2 1.8L12 16.4l-1.8-5.4L5 9.2l5.2-1.8L12 2Zm7 12 .9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14Z" />
          </svg>
          {missionActive ? `Live incident · ${activeScenario.title}` : 'Real-Time Cyber Warfare Simulation'}
        </span>

        <h1 id="hero-title" className="hero__title">
          Cyber Resilience for a
          <br />
          Smart City <span className="hero__accent" data-text="Under Attack">Under Attack</span>
        </h1>

        <p className="hero__lead">
          Command the CyberSiege grid — {city.total} critical systems across 4 districts.
          Detect intrusions, contain lateral movement and restore services in real time. 100% simulated, 100% safe.
        </p>

        <div className="hero__ctas">
          <button
            className="cta-primary"
            onClick={() => scrollToSection(missionActive ? 'command' : 'missions')}
          >
            {missionActive ? 'Resume Mission' : 'Start a Mission'}
            <span className="cta-primary__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </span>
          </button>
          <button className="pill-btn pill-btn--glass pill-btn--lg" onClick={startDemo}>
            Watch Live Demo
          </button>
        </div>

        <div className="hero-stats" aria-label="Live city metrics">
          <Stat value={city.health} suffix="%" label="City health" tone={city.tone} />
          <Stat value={city.secure} suffix={`/${city.total}`} label="Systems secure" />
          <Stat value={threats} label="Active threats" tone={threats > 0 ? 'attack' : undefined} />
          <Stat value={score.total} label="Mission score" />
        </div>
      </div>

      <div className="hero-marquee" aria-label="Protected infrastructure">
        <p className="hero-marquee__caption">Protecting critical infrastructure across every district</p>
        <div className="hero-marquee__viewport">
          <div className="hero-marquee__track">
            {[0, 1].map((copy) => (
              <ul key={copy} className="hero-marquee__list" aria-hidden={copy === 1 ? 'true' : undefined}>
                {assetList.map((a) => (
                  <li key={a.id} className={`marquee-item status-${a.status}`}>
                    <span className="marquee-item__dot" />
                    {a.name}
                    <span className="marquee-item__health">{a.health}%</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
