import L from "leaflet";

// Shared opening view for the city preview and its full map.
export function cityMapBounds(points: [number, number][], radiusKm = 0) {
  if (points.length < 2) return L.latLngBounds(points);
  const percentile = (values: number[], q: number) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.round(q * (sorted.length - 1))];
  };
  const lats = points.map(p => p[0]);
  const lngs = points.map(p => p[1]);
  const median = L.latLng(percentile(lats, .5), percentile(lngs, .5));
  const near = radiusKm > 0 ? points.filter(p => median.distanceTo(p) <= radiusKm * 1000) : [];
  const core = near.length > 1 ? L.latLngBounds(near) : L.latLngBounds(
    [percentile(lats, .05), percentile(lngs, .05)],
    [percentile(lats, .95), percentile(lngs, .95)],
  );
  return core.isValid() && core.getNorth() > core.getSouth() ? core : L.latLngBounds(points);
}

export function frameCityMap(map: L.Map, target: HTMLElement, bounds: L.LatLngBounds) {
  if (!bounds.isValid()) return;
  map.invalidateSize();
  map.setMinZoom(0);
  map.setMaxZoom(18);
  const lngSpan = Math.max(bounds.getEast() - bounds.getWest(), .001);
  const byWidth = Math.log2((.5 * target.clientWidth * 360) / (256 * lngSpan));
  const zoom = Math.min(byWidth, map.getBoundsZoom(bounds.pad(.08), false));
  map.setView(bounds.getCenter(), zoom, { animate: false });
  map.setMinZoom(zoom);
  map.setMaxZoom(zoom);
}
