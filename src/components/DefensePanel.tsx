// ============================================================
// DefensePanel — Defense action controls
// ============================================================
import { useAppState } from '../context/AppContext';
import { DEFENSE_ACTIONS } from '../data/defenses';
import type { DefenseActionType } from '../types/city';

const DEFENSE_ICONS: Record<DefenseActionType, string> = {
  patch: '🔧',
  mfa: '🔐',
  segment: '🛡️',
  isolate: '🔒',
  restore_backup: '💾',
  activate_monitoring: '👁️',
  notify_citizens: '📢',
};

export function DefensePanel() {
  const { state, dispatch } = useAppState();
  const { selectedAssetId, assets } = state;
  const selectedAsset = selectedAssetId ? assets[selectedAssetId] : null;

  const handleDefense = (defenseType: DefenseActionType) => {
    if (!selectedAssetId) return;
    dispatch({
      type: 'APPLY_DEFENSE',
      payload: { assetId: selectedAssetId, defense: defenseType },
    });
  };

  return (
    <div className="panel defense-panel" role="region" aria-label="Defense Command Center">
      <div className="panel-header">
        <span className="panel-title">Defense Command</span>
      </div>

      <div className="panel-body">
        {/* Simulation notice */}
        <div className="defense-notice" role="note" aria-label="Simulation notice">
          ⚠️ SIMULATION ONLY — All actions below are fictional defensive measures in the city simulation
        </div>

        {!selectedAsset ? (
          <div className="no-asset-selected">
            <div aria-hidden="true" style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
            Select a building on the city map<br />to apply defensive actions
          </div>
        ) : (
          <>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                marginBottom: 'var(--space-sm)',
                letterSpacing: '0.08em',
              }}
            >
              Target: <span style={{ color: 'var(--neon-cyan)' }}>{selectedAsset.name}</span>
            </div>

            {Object.values(DEFENSE_ACTIONS).map((action) => {
              const isApplicable = action.applicableStatuses.includes(selectedAsset.status);
              const alreadyApplied = selectedAsset.activeDefenses.includes(action.type);

              let disabledReason = '';
              if (!isApplicable) {
                disabledReason = `Not applicable when status is "${selectedAsset.status}"`;
              }

              return (
                <button
                  key={action.type}
                  className="defense-action-btn"
                  onClick={() => handleDefense(action.type)}
                  disabled={!isApplicable}
                  title={disabledReason}
                  aria-label={`${action.label}${!isApplicable ? ` (disabled: ${disabledReason})` : ''}`}
                  aria-pressed={alreadyApplied}
                >
                  <div className="defense-action-btn__label">
                    <span aria-hidden="true">{DEFENSE_ICONS[action.type]}</span>
                    {action.label}
                    {alreadyApplied && (
                      <span
                        style={{ color: 'var(--status-secure)', fontSize: '0.6rem' }}
                        aria-label="Already applied"
                      >
                        ✓ Applied
                      </span>
                    )}
                  </div>
                  <div className="defense-action-btn__desc">
                    {action.simpleExplanation}
                  </div>
                  <div className="defense-action-btn__effects">
                    {action.healthRestored > 0 && (
                      <span className="effect-tag positive">+{action.healthRestored}% Health</span>
                    )}
                    {action.trustGain > 0 ? (
                      <span className="effect-tag trust">+{action.trustGain} Trust</span>
                    ) : action.trustGain < 0 ? (
                      <span className="effect-tag" style={{ color: 'var(--neon-red)', borderColor: 'rgba(255,23,68,0.2)', background: 'rgba(255,23,68,0.06)' }}>
                        {action.trustGain} Trust
                      </span>
                    ) : null}
                    <span className="effect-tag score">+{action.scoreGain} Score</span>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
