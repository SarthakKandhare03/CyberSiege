// ============================================================
// DefensePanel — Defense action controls
// ============================================================
import { useAppState } from '../context/AppContext';
import { DEFENSE_ACTIONS } from '../data/defenses';
import { SCENARIOS } from '../data/scenarios';
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
  const { selectedAssetId, assets, simulation } = state;
  const selectedAsset = selectedAssetId ? assets[selectedAssetId] : null;

  // Playbook guidance: defenses the latest incident event recommends for this asset
  const lastEvent = simulation.activeScenarioId
    ? SCENARIOS[simulation.activeScenarioId].events[simulation.currentEventIndex - 1]
    : undefined;
  const recommended = new Set<DefenseActionType>(
    lastEvent && selectedAssetId && lastEvent.affectedAssetIds.includes(selectedAssetId)
      ? lastEvent.recommendedDefenses
      : [],
  );

  const handleDefense = (defenseType: DefenseActionType) => {
    if (!selectedAssetId) return;
    dispatch({
      type: 'APPLY_DEFENSE',
      payload: { assetId: selectedAssetId, defense: defenseType },
    });
  };

  return (
    <section className="panel defense-panel" aria-label="Defense Command Center">
      <div className="panel-header">
        <span className="panel-title">Defense Command</span>
      </div>

      <div className="panel-body">
        {/* Simulation notice */}
        <div className="defense-notice" role="note" aria-label="Simulation notice">
          Simulation only — all actions below are fictional defensive measures in the city simulation
        </div>

        {!selectedAsset ? (
          <div className="no-asset-selected">
            <div className="no-asset-selected__icon" aria-hidden="true">🎯</div>
            Select a building on the city map<br />to apply defensive actions
          </div>
        ) : (
          <>
            <div className="defense-target">
              Target <span>{selectedAsset.name}</span>
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
                  className={`defense-action-btn${recommended.has(action.type) && isApplicable ? ' is-recommended' : ''}`}
                  onClick={() => handleDefense(action.type)}
                  disabled={!isApplicable}
                  title={disabledReason}
                  aria-label={`${action.label}${!isApplicable ? ` (disabled: ${disabledReason})` : ''}`}
                  aria-pressed={alreadyApplied}
                >
                  <div className="defense-action-btn__label">
                    <span className="defense-action-btn__icon" aria-hidden="true">{DEFENSE_ICONS[action.type]}</span>
                    {action.label}
                    {recommended.has(action.type) && isApplicable && !alreadyApplied && (
                      <span className="chip chip--recommended">Recommended</span>
                    )}
                    {alreadyApplied && (
                      <span className="chip chip--applied" aria-label="Already applied">
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
                      <span className="effect-tag negative">
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
    </section>
  );
}
