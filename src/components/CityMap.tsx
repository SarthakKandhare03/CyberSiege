// ============================================================
// CityMap — Interactive city map with all 12 clickable assets
// ============================================================
import type { CityAsset } from '../types/city';
import { DISTRICT_COLORS } from '../data/assets';
import { useAppState } from '../context/AppContext';

const DISTRICT_ZONES = [
  { id: 'transit', label: 'Transit District', className: 'transit' },
  { id: 'health', label: 'Health District', className: 'health' },
  { id: 'energy', label: 'Energy District', className: 'energy' },
  { id: 'civic', label: 'Civic District', className: 'civic' },
];

function getHealthFillClass(health: number): string {
  if (health > 60) return 'high';
  if (health > 30) return 'medium';
  return 'low';
}

function getHealthColor(health: number, status: string): string {
  if (status === 'secure') return 'var(--status-secure)';
  if (status === 'warning') return 'var(--status-warning)';
  if (status === 'compromised') return 'var(--status-compromised)';
  if (status === 'offline') return 'var(--status-offline)';
  if (status === 'recovering') return 'var(--status-recovering)';
  if (health > 60) return 'var(--status-secure)';
  if (health > 30) return 'var(--status-warning)';
  return 'var(--status-compromised)';
}

interface BuildingNodeProps {
  asset: CityAsset;
  isSelected: boolean;
  onClick: (id: string) => void;
}

function BuildingNode({ asset, isSelected, onClick }: BuildingNodeProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(asset.id);
    }
  };

  const districtColor = DISTRICT_COLORS[asset.district] || 'var(--neon-cyan)';

  return (
    <div
      className={`building-node ${asset.status}${isSelected ? ' selected' : ''}`}
      style={{ left: `${asset.position.x}%`, top: `${asset.position.y}%` }}
      onClick={() => onClick(asset.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${asset.name} — Status: ${asset.status}, Health: ${asset.health}%`}
      aria-pressed={isSelected}
      title={`${asset.name} (${asset.status})`}
    >
      {/* Alert ring for compromised buildings */}
      {asset.status === 'compromised' && (
        <div
          style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '6px',
            border: '2px solid var(--status-compromised)',
            opacity: 0.4,
            animation: 'alertPulse 0.8s ease-in-out infinite',
          }}
          aria-hidden="true"
        />
      )}

      <div className="building-icon" style={{ borderColor: `${districtColor}44` }}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={asset.svgIcon} />
        </svg>
      </div>
      <div className="building-name">{asset.name.split(' ').slice(0, 2).join(' ')}</div>
      <div className="building-health-bar" aria-hidden="true">
        <div
          className={`building-health-fill ${getHealthFillClass(asset.health)}`}
          style={{
            width: `${asset.health}%`,
            background: getHealthColor(asset.health, asset.status),
          }}
        />
      </div>
    </div>
  );
}

export function CityMap() {
  const { state, dispatch } = useAppState();
  const assets = Object.values(state.assets);

  const handleSelect = (id: string) => {
    dispatch({ type: 'SELECT_ASSET', payload: id === state.selectedAssetId ? null : id });
  };

  return (
    <div className="panel city-map-panel" role="region" aria-label="Interactive City Map">
      <div className="panel-header">
        <span className="panel-title">
          City Infrastructure Map
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
          }}
        >
          {assets.length} assets · click to inspect
        </span>
      </div>

      <div className="city-map">
        <div className="city-map__inner">
          <div className="city-map__grid" aria-hidden="true" />

          {/* District zone backgrounds */}
          {DISTRICT_ZONES.map((zone) => (
            <div
              key={zone.id}
              className={`district-zone ${zone.className}`}
              aria-hidden="true"
            >
              <span
                className="district-label"
                style={{ color: DISTRICT_COLORS[zone.id] }}
              >
                {zone.label}
              </span>
            </div>
          ))}

          {/* Building nodes */}
          {assets.map((asset) => (
            <BuildingNode
              key={asset.id}
              asset={asset}
              isSelected={state.selectedAssetId === asset.id}
              onClick={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
