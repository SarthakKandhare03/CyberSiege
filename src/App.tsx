// ============================================================
// App — Main application shell
// Landing hero → live Command Center dashboard → footer
// ============================================================
import { CityMap } from './components/CityMap';
import { AssetDetails } from './components/AssetDetails';
import { ThreatConsole } from './components/ThreatConsole';
import { DefensePanel } from './components/DefensePanel';
import { MissionPanel } from './components/MissionPanel';
import { LearningDrawer } from './components/LearningDrawer';
import { HardwareStatus } from './components/HardwareStatus';
import { DashboardHeader } from './components/DashboardHeader';
import { Navbar, Logo } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { MissionDock } from './components/landing/MissionDock';
import { useSoundFx } from './hooks/useSoundFx';
import { useEffect } from 'react';
import { useAppState } from './context/AppContext';
import { SCENARIOS } from './data/scenarios';
import type { ScenarioId } from './types/city';

const YEAR = new Date().getFullYear();

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Logo />
        <p className="site-footer__note">
          Every incident here is a fictional simulation for cybersecurity education. No real systems, networks or
          personal data are touched.
        </p>
        <p className="site-footer__copy">© {YEAR} CyberSiege · Defend the Grid · MIT License</p>
      </div>
    </footer>
  );
}

// Kiosk deep link: ?demo=1|2|3 auto-plays that scenario (exhibition mode)
function useDemoDeepLink() {
  const { dispatch } = useAppState();
  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get('demo');
    const id = `scenario_${n}` as ScenarioId;
    if (!n || !(id in SCENARIOS)) return;
    dispatch({ type: 'START_SCENARIO', payload: id });
    dispatch({ type: 'SET_AUTO_PLAY', payload: true });
  }, [dispatch]);
}

function App() {
  useSoundFx();
  useDemoDeepLink();

  return (
    <>
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="page-bg" aria-hidden="true" />
      <Navbar />

      <Hero />

      <main id="command" className="dashboard">
        <DashboardHeader />

        <div id="main-content" className="main-content" tabIndex={-1}>
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
        </div>
      </main>

      <Footer />
      <MissionDock />

      {/* Learning drawer */}
      <LearningDrawer />
    </>
  );
}

export default App;
