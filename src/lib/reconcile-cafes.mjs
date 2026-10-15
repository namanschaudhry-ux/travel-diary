const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');

const nyAliases = {
  "Ruby's Cafe": 'Ruby’s', 'Le Cafe Coffee': 'Le Café Coffee',
  'Saltwater': 'Saltwater Coffee', 'Asano Cafe': 'Asano',
  'The Roost Cafe': 'The Roost', 'Merriweather': 'Merriweather Coffee + Kitchen',
  'Kore Coffee': 'Koré Coffee', 'Citizens': 'Citizens of',
};

const brooklynAreas = new Set(['Williamsburg', 'North Williamsburg', 'South Williamsburg', 'East Williamsburg', 'Dumbo', 'Greenpoint', 'Carroll Gardens', 'Prospect Heights', 'Bay Ridge', 'Fort Greene', 'Boerum Hill']);
const borough = area => area === 'Brooklyn' || brooklynAreas.has(area.replace('?', '')) ? 'Brooklyn' : area === 'Astoria' || area === 'Queens' ? 'Queens' : area ? 'Manhattan' : null;

export function reconcileCafes(snapshot, geo, city) {
  if (snapshot.has_more) throw new Error('Incomplete Notion snapshot');
  const seen = new Set();
  const rows = snapshot.results.map(row => {
    if (seen.has(row.url)) throw new Error(`Duplicate Notion row: ${row.url}`);
    seen.add(row.url);
    const name = row.Cafe;
    const base = normalize(city === 'new-york' ? (nyAliases[name] || name) : name);
    const matched = geo.originalPins.filter(pin => {
      const n = normalize(pin.name);
      if (city !== 'new-york') return n === base;
      // Reserve is a separate Notion cafe from Starbucks.
      if (name === 'Starbucks' && n.startsWith('starbucksreserve')) return false;
      return n === base || n.startsWith(base);
    });
    const override = geo.corrections[name];
    let locations = override?.locations ?? matched.map(pin => ({
      name: pin.name, lat: pin.lat, lng: pin.lng, area: pin.area,
      status: pin.status, note: pin.note, source: 'Original Claude map; location not reverified',
    }));
    // The database's borough takes precedence over incompatible earlier branch pins.
    if (city === 'new-york' && !override) {
      const knownBorough = ['Manhattan', 'Brooklyn', 'Queens'].find(value => row.Suburb?.startsWith(value));
      if (knownBorough) locations = locations.filter(pin => borough(pin.area) === knownBorough);
    }
    if (locations.length > 1) locations = locations.map(pin => ({ ...pin, status: 'branch' }));
    const previousUnplaced = geo.originalUnplaced.find(pin => normalize(pin.name) === base);
    return {
      id: row.url.split('/').pop(), name,
      visits: row.Visits ?? null,
      last: row['date:Last visit:start'] ?? null,
      area: row.Suburb || 'not recorded',
      locations,
      reason: override?.reason || previousUnplaced?.note || 'Exact cafe or branch location has not been established.',
    };
  });
  return { city, asAt: snapshot.asAt, cafes: rows };
}
