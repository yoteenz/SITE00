/**
 * P0.VR.8-SRF — Neutral asset-pending placeholder (exact geometry, no broken image UI).
 */

type Props = {
  regionId: string;
  aspectRatio?: string;
  label?: string;
};

export function AssetPendingPlaceholder({ regionId, aspectRatio = '4 / 3', label = 'ASSET PENDING' }: Props) {
  return (
    <div
      className="site00-srf-asset-pending"
      data-srf-region={regionId}
      data-asset-state="ASSET_PENDING"
      style={{ aspectRatio }}
      aria-label={label}
    >
      <span className="site00-srf-asset-pending__label">{label}</span>
    </div>
  );
}
