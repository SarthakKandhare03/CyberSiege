// ============================================================
// Navbar — floating glass navigation with live status + scroll spy
// ============================================================
import { useEffect, useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { useCitySummary } from '../../hooks/useCitySummary';
import { scrollToSection } from '../../utils/scroll';

const LINKS = [
  { id: 'top', label: 'Home' },
  { id: 'command', label: 'Command Center' },
  { id: 'missions', label: 'Missions' },
  { id: 'threats', label: 'Threat Feed' },
  { id: 'hardware', label: 'Hardware' },
];

export function Logo() {
  return (
    <span className="logo">
      <svg className="logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff4d7d" />
            <stop offset="0.5" stopColor="#ff9a3d" />
            <stop offset="1" stopColor="#ffd600" />
          </linearGradient>
        </defs>
        {/* Outer hexagonal shield */}
        <path d="M16 1.5 28.5 8.5v13L16 30.5 3.5 21.5v-13Z" fill="none" stroke="url(#logo-grad)" strokeWidth="1.4" opacity="0.5" />
        {/* Inner shield core */}
        <path d="M16 5 25 10v9l-9 7-9-7v-9Z" fill="url(#logo-grad)" opacity="0.12" />
        <path d="M16 5 25 10v9l-9 7-9-7v-9Z" fill="none" stroke="url(#logo-grad)" strokeWidth="1.6" />
        {/* Crosshair / target reticle */}
        <circle cx="16" cy="14" r="4" fill="none" stroke="url(#logo-grad)" strokeWidth="1.4" />
        <line x1="16" y1="8" x2="16" y2="11" stroke="url(#logo-grad)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="16" y1="17" x2="16" y2="20" stroke="url(#logo-grad)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="10" y1="14" x2="13" y2="14" stroke="url(#logo-grad)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="19" y1="14" x2="22" y2="14" stroke="url(#logo-grad)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <span className="logo__text">
        <span className="logo__name">Cyber<span>Siege</span></span>
        <small>Defend the Grid</small>
      </span>
    </span>
  );
}

export function Navbar() {
  const { state, dispatch } = useAppState();
  const city = useCitySummary();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('top');
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll spy — the active link is the lowest section whose top has passed
  // 40% of the viewport (works for nested sections, unlike ratio-based spying)
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      const line = window.innerHeight * 0.4;
      let current = 'top';
      let best = -Infinity;
      for (const { id } of LINKS) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line && top > best) {
          best = top;
          current = id;
        }
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  const missionActive = !!state.simulation.activeScenarioId && !state.missionReport;

  return (
    <header className={`navbar${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-open' : ''}`}>
      <div className="navbar__inner">
        <a
          href="#top"
          className="navbar__brand"
          onClick={(e) => {
            e.preventDefault();
            go('top');
          }}
          aria-label="CyberSiege — back to top"
        >
          <Logo />
        </a>

        <nav className="navbar__links" aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`navbar__link${active === l.id ? ' is-active' : ''}`}
              aria-current={active === l.id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(l.id);
              }}
            >
              {l.label}
            </a>
          ))}
          <button
            className="navbar__link"
            onClick={() => {
              setMenuOpen(false);
              dispatch({ type: 'TOGGLE_LEARNING_DRAWER' });
            }}
            aria-expanded={state.learningDrawerOpen}
          >
            Learn
          </button>
        </nav>

        <div className="navbar__actions">
          <span className={`live-pill tone-${city.tone}`} role="status" aria-live="polite">
            <span className="live-pill__dot" aria-hidden="true" />
            <span className="live-pill__text">{city.label.toLowerCase()}</span>
          </span>
          <button className="pill-btn pill-btn--glass" onClick={() => go(missionActive ? 'command' : 'missions')}>
            {missionActive ? 'Resume Mission' : 'Get Started'}
          </button>
          <button
            className="navbar__burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
