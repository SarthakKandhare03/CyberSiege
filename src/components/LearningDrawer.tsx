// ============================================================
// LearningDrawer — Beginner cybersecurity education panel
// ============================================================
import { useEffect, useRef } from 'react';
import { useAppState } from '../context/AppContext';

const LEARNING_SECTIONS = [
  {
    id: 'phishing',
    icon: '🎣',
    title: 'What is Phishing?',
    text: 'Phishing is when a criminal sends a fake message (usually an email or text) pretending to be from a trusted source — like your bank, your boss, or a government agency. The goal is to trick you into clicking a link and entering your username and password on a fake website.',
    highlight: 'Think before you click! Attackers use urgency ("Your account will be locked!") to make you act without thinking. Always verify unexpected messages by contacting the sender through a known phone number.',
  },
  {
    id: 'mfa',
    icon: '🔐',
    title: 'Why MFA Matters',
    text: 'Multi-Factor Authentication (MFA) requires you to prove your identity in two ways: first with your password (something you know), and then with a second factor — usually a code sent to your phone (something you have). Even if an attacker steals your password through phishing, they cannot log in without your phone.',
    highlight: 'MFA is one of the single most effective defences against account takeover attacks. Enable it on every important account you have.',
  },
  {
    id: 'segmentation',
    icon: '🛡️',
    title: 'Network Segmentation',
    text: 'Network segmentation divides a computer network into separate zones. Each zone only connects to the parts of the network it needs. If an attacker breaks into one zone, they face barriers stopping them from reaching the others — like sealed compartments on a ship preventing one leak from sinking everything.',
    highlight: 'In smart cities, separating hospital networks from public Wi-Fi networks means that a public network compromise cannot reach patient record systems.',
  },
  {
    id: 'backups',
    icon: '💾',
    title: 'Why Backups Matter',
    text: 'Backups are copies of your important data stored separately from the main system. If attackers encrypt or destroy your data (like in a ransomware attack), a clean backup lets you restore everything without paying criminals. The "3-2-1 rule" says: keep 3 copies, on 2 different types of storage, with 1 copy kept offline.',
    highlight: 'An offline backup (one that is never connected to the internet) cannot be reached by attackers. This is why hospitals keep air-gapped backup servers.',
  },
  {
    id: 'incident-response',
    icon: '🚨',
    title: 'Incident Response',
    text: 'Incident Response is the organised process of detecting, containing, and recovering from a cyber attack. It typically follows four phases: (1) Preparation — having plans and tools ready before an incident happens; (2) Detection & Analysis — spotting and understanding the threat; (3) Containment & Eradication — stopping the spread and removing the attacker; (4) Recovery — safely restoring systems.',
    highlight: 'Having a plan before an incident happens makes the difference between a minor disruption and a major crisis. Defenders who practise incident response respond far more effectively.',
  },
  {
    id: 'monitoring',
    icon: '👁️',
    title: 'Why Monitoring Helps',
    text: 'Security monitoring means watching systems constantly for unusual behaviour — unexpected logins, large file transfers, connections to unusual locations, or commands that systems would not normally run. Monitoring tools can alert defenders in real time, giving them minutes or hours to act before an attacker does serious damage.',
    highlight: 'Many successful attacks go undetected for months. Continuous monitoring dramatically reduces the time attackers can operate undetected inside a network.',
  },
];

export function LearningDrawer() {
  const { state, dispatch } = useAppState();
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = state.learningDrawerOpen;

  // Escape closes; focus moves into the drawer and returns afterwards
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'TOGGLE_LEARNING_DRAWER' });
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [open, dispatch]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="learning-drawer-overlay"
        onClick={() => dispatch({ type: 'TOGGLE_LEARNING_DRAWER' })}
        role="presentation"
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="learning-drawer"
        role="complementary"
        aria-label="Cybersecurity Learning Guide"
      >
        <div className="learning-drawer__header">
          <h2 className="learning-drawer__title">Learn Why It Matters</h2>
          <button
            ref={closeRef}
            className="icon-btn"
            onClick={() => dispatch({ type: 'TOGGLE_LEARNING_DRAWER' })}
            aria-label="Close learning guide"
            id="close-learning-drawer"
          >
            ✕
          </button>
        </div>

        <div className="learning-drawer__body">
          <p className="panel-intro">
            Beginner-friendly explanations of the cybersecurity concepts used in this simulation.
          </p>

          {LEARNING_SECTIONS.map((section) => (
            <section key={section.id} className="learn-section" aria-labelledby={`learn-${section.id}`}>
              <h3 className="learn-section__title" id={`learn-${section.id}`}>
                <span className="learn-section__icon" aria-hidden="true">{section.icon}</span>
                {section.title}
              </h3>
              <p className="learn-section__text">{section.text}</p>
              <div className="learn-section__highlight" role="note">
                <strong>Key takeaway:</strong> {section.highlight}
              </div>
            </section>
          ))}
        </div>
      </aside>
    </>
  );
}
