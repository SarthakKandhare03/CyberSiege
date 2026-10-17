// ============================================================
// CityMap — Interactive city map with all 12 clickable assets
// Live dependency links animate when an attack is spreading.
// ============================================================
import { useMemo } from 'react';
import type { AssetStatus, CityAsset, District } from '../types/city';
import { DISTRICT_COLORS } from '../data/assets';
import { useAppState } from '../context/AppContext';
import { calculateCityHealth } from '../engine/scoring';

const DISTRICT_ZONES: { id: District; label: string }[] = [
  { id: 'transit', label: 'Transit' },
  { id: 'health', label: 'Health' },
  { id: 'energy', label: 'Energy' },
  { id: 'civic', label: 'Civic' },
];

const STATUS_LEGEND: { status: AssetStatus; label: string }[] = [
  { status: 'secure', label: 'Secure' },
  { status: 'warning', label: 'Warning' },
  { status: 'compromised', label: 'Compromised' },
  { status: 'recovering', label: 'Recovering' },
  { status: 'offline', label: 'Offline' },
];

const STATUS_RANK: Record<AssetStatus, number> = { secure: 0, recovering: 1, offline: 2, warning: 3, compromised: 4 };

function getHealthFillClass(health: number): string {
  if (health > 60) return 'high';
  if (health > 30) return 'medium';
  return 'low';
}

interface BuildingNodeProps {
  asset: CityAsset;
  isSelected: boolean;
  onClick: (id: string) => void;
}

function BuildingNode({ asset, isSelected, onClick }: BuildingNodeProps) {
  return (
    <button
      className={`building-node ${asset.status}${isSelected ? ' selected' : ''}`}
      style={{ left: `${asset.position.x}%`, top: `${asset.position.y}%`, '--district': DISTRICT_COLORS[asset.district] } as React.CSSProperties}
      onClick={() => onClick(asset.id)}
      aria-label={`${asset.name} — Status: ${asset.status}, Health: ${asset.health}%`}
      aria-pressed={isSelected}
      title={`${asset.name} (${asset.status}, ${asset.health}%)`}
    >
      {asset.status === 'compromised' && <span className="building-node__ring" aria-hidden="true" />}
      <span className="building-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={asset.svgIcon} />
        </svg>
      </span>
      <span className="building-name">{asset.name.split(' ').slice(0, 2).join(' ')}</span>
      <span className="building-health-bar" aria-hidden="true">
        <span className={`building-health-fill ${getHealthFillClass(asset.health)}`} style={{ width: `${asset.health}%` }} />
      </span>
    </button>
  );
}

export function CityMap() {
  const { state, dispatch } = useAppState();
  const assets = Object.values(state.assets);

  const handleSelect = (id: string) => {
    dispatch({ type: 'SELECT_ASSET', payload: id === state.selectedAssetId ? null : id });
  };

  // Each dependency edge takes the worse status of its two endpoints
  const links = useMemo(
    () =>
      Object.values(state.assets).flatMap((asset) =>
        asset.dependencies
          .map((depId) => state.assets[depId])
          .filter(Boolean)
          .map((dep) => {
            const worst = STATUS_RANK[asset.status] >= STATUS_RANK[dep.status] ? asset.status : dep.status;
            return { id: `${dep.id}->${asset.id}`, from: dep.position, to: asset.position, status: worst };
          }),
      ),
    [state.assets],
  );

  const districtHealth = useMemo(() => {
    const all = Object.values(state.assets);
    const out = {} as Record<District, number>;
    for (const zone of DISTRICT_ZONES) {
      out[zone.id] = calculateCityHealth(all.filter((a) => a.district === zone.id).map((a) => a.health));
    }
    return out;
  }, [state.assets]);

  const hostile = links.filter((l) => l.status === 'compromised').length;

  return (
    <section className="panel city-map-panel" aria-label="Interactive City Map">
      <div className="panel-header">
        <span className="panel-title">City Infrastructure Map</span>
        <span className="panel-meta">
          {hostile > 0 ? <span className="text-hostile">{hostile} hostile link{hostile > 1 ? 's' : ''}</span> : `${assets.length} assets`}
          {' · '}click to inspect
        </span>
      </div>

      <div className="city-map">
        <div className="city-map__inner">
          <div className="city-map__grid" aria-hidden="true" />
          <div className="city-map__sweep" aria-hidden="true" />

          {DISTRICT_ZONES.map((zone) => (
            <div key={zone.id} className={`district-zone ${zone.id}`} aria-hidden="true">
              <span className="district-label" style={{ color: DISTRICT_COLORS[zone.id] }}>
                {zone.label}
                <span className="district-label__health">{districtHealth[zone.id]}%</span>
              </span>
            </div>
          ))}

          <svg className="city-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {links.map((l) => (
              <line
                key={l.id}
                className={`city-link city-link--${l.status}`}
                x1={l.from.x}
                y1={l.from.y}
                x2={l.to.x}
                y2={l.to.y}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {assets.map((asset) => (
            <BuildingNode key={asset.id} asset={asset} isSelected={state.selectedAssetId === asset.id} onClick={handleSelect} />
          ))}
        </div>
      </div>

      <ul className="map-legend" aria-label="Status legend">
        {STATUS_LEGEND.map((s) => (
          <li key={s.status} className={`map-legend__item status-${s.status}`}>
            <span className="map-legend__dot" aria-hidden="true" />
            {s.label}
            <span className="map-legend__count">{assets.filter((a) => a.status === s.status).length}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
