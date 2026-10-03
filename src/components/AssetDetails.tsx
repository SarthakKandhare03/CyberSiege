// ============================================================
// AssetDetails — Selected asset information panel
// ============================================================
import { useAppState } from '../context/AppContext';
import { INITIAL_ASSETS, DISTRICT_NAMES, DISTRICT_COLORS } from '../data/assets';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--status-secure)',
  medium: 'var(--status-warning)',
  high: 'var(--neon-red)',
  critical: 'var(--status-compromised)',
};

function HealthBar({ health, status }: { health: number; status: string }) {
  let fillClass = 'high';
  if (health < 60) fillClass = 'medium';
  if (health < 30) fillClass = 'low';

  return (
    <div className="asset-health-bar">
      <div className="health-bar-label">
        <span>SERVICE HEALTH</span>
        <span
          style={{
            color: health > 60 ? 'var(--status-secure)' : health > 30 ? 'var(--status-warning)' : 'var(--status-compromised)',
          }}
        >
          {health}%
        </span>
      </div>
      <div className="health-bar-track" role="progressbar" aria-valuenow={health} aria-valuemin={0} aria-valuemax={100} aria-label={`Health: ${health}%`}>
        <div
          className={`health-bar-fill ${fillClass}`}
          style={{ width: `${health}%` }}
        />
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: 'var(--text-muted)',
          marginTop: '3px',
        }}
      >
        STATUS: {status.toUpperCase()}
      </div>
    </div>
  );
}

export function AssetDetails() {
  const { state } = useAppState();
  const asset = state.selectedAssetId ? state.assets[state.selectedAssetId] : null;

  if (!asset) {
    return (
      <div className="panel asset-details" role="region" aria-label="Asset Details">
        <div className="panel-header">
          <span className="panel-title">Asset Inspector</span>
        </div>
        <div className="panel-body asset-details__empty">
          <div className="asset-details__empty-icon" aria-hidden="true">🏙️</div>
          <p>Click a building on<br />the city map to inspect it</p>
        </div>
      </div>
    );
  }

  const districtColor = DISTRICT_COLORS[asset.district] || 'var(--neon-cyan)';
  const originalAsset = INITIAL_ASSETS[asset.id];
  const deps = asset.dependencies.map((id) => state.assets[id]?.name || id);

  return (
    <div className="panel asset-details" role="region" aria-label={`Asset Details: ${asset.name}`}>
      <div className="panel-header">
        <span className="panel-title">Asset Inspector</span>
        <span
          className={`asset-status-badge status-badge-${asset.status}`}
          aria-label={`Status: ${asset.status}`}
        >
          {asset.status}
        </span>
      </div>
      <div className="panel-body">
        {/* Header */}
        <div className="asset-header">
          <div
            className={`asset-icon-large`}
            style={{
              color: districtColor,
              borderColor: `${districtColor}44`,
              background: `${districtColor}10`,
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <path d={asset.svgIcon} />
            </svg>
          </div>
          <div className="asset-header__info">
            <div className="asset-name">{asset.name}</div>
            <div
              className="asset-district-badge"
              style={{ color: districtColor }}
            >
              {DISTRICT_NAMES[asset.district]}
            </div>
          </div>
        </div>

        {/* Health bar */}
        <HealthBar health={asset.health} status={asset.status} />

        {/* Info grid */}
        <div className="asset-info-grid">
          <div className="info-item">
            <div className="info-item__label">Risk Level</div>
            <div
              className={`info-item__value risk-${asset.riskLevel}`}
              style={{ color: RISK_COLORS[asset.riskLevel] }}
            >
              {asset.riskLevel.toUpperCase()}
            </div>
          </div>
          <div className="info-item">
            <div className="info-item__label">Active Defenses</div>
            <div className="info-item__value">
              {asset.activeDefenses.length || 'None'}
            </div>
          </div>
          <div className="info-item" style={{ gridColumn: '1 / -1' }}>
            <div className="info-item__label">Dependencies</div>
            {deps.length > 0 ? (
              <div className="dependencies-list">
                {deps.map((dep, i) => (
                  <span key={i} className="dependency-tag">{dep}</span>
                ))}
              </div>
            ) : (
              <div className="info-item__value">None (independent)</div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="asset-description">{asset.description}</div>

        {/* Active defenses tags */}
        {asset.activeDefenses.length > 0 && (
          <div style={{ marginBottom: 'var(--space-sm)' }}>
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
              Active Defenses
            </div>
            <div className="dependencies-list">
              {asset.activeDefenses.map((d) => (
                <span
                  key={d}
                  className="dependency-tag"
                  style={{ color: 'var(--status-secure)', borderColor: 'rgba(0,255,136,0.3)' }}
                >
                  ✓ {d.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Learning message */}
        <div className="learning-box">
          <div className="learning-box__title">
            <span>💡</span> Why this matters
          </div>
          <div className="learning-box__text">
            {originalAsset?.learningMessage || asset.learningMessage}
          </div>
        </div>
      </div>
    </div>
  );
}
