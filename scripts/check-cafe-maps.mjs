import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { reconcileCafes } from '../src/lib/reconcile-cafes.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
for (const city of ['melbourne', 'new-york']) {
  const read = suffix => JSON.parse(fs.readFileSync(`${root}src/data/cafe-maps/${city}-${suffix}.json`, 'utf8'));
  const snapshot = read('notion');
  const result = reconcileCafes(snapshot, read('locations'), city);
  assert.equal(result.cafes.length, snapshot.results.length, 'Every database row must be present');
  assert.equal(new Set(result.cafes.map(cafe => cafe.id)).size, snapshot.results.length, 'No duplicated cafe rows');
  for (const row of snapshot.results) {
    const cafe = result.cafes.find(cafe => cafe.id === row.url.split('/').pop());
    assert.ok(cafe, `Missing ${row.Cafe}`);
    assert.equal(cafe.name, row.Cafe);
    assert.equal(cafe.visits, row.Visits ?? null, `Purchase count changed for ${row.Cafe}`);
    assert.equal(cafe.last, row['date:Last visit:start'] ?? null, `Date changed for ${row.Cafe}`);
    assert.equal(cafe.area, row.Suburb || 'not recorded');
    for (const pin of cafe.locations) {
      assert.ok(Number.isFinite(pin.lat) && Number.isFinite(pin.lng));
      assert.ok(city === 'melbourne' ? pin.lat < -37.5 && pin.lat > -38.2 && pin.lng > 144.5 && pin.lng < 145.7 : pin.lat > 40.5 && pin.lat < 40.95 && pin.lng > -74.3 && pin.lng < -73.6, `Pin outside city: ${row.Cafe}`);
      assert.equal(Object.hasOwn(pin, 'visits'), false, 'Do not allocate cafe purchases to branches');
    }
  }
  console.log(JSON.stringify({city, cafes:result.cafes.length, purchases:result.cafes.reduce((sum,cafe)=>sum+(cafe.visits??0),0), manual:result.cafes.filter(cafe=>cafe.visits===null).length, withPins:result.cafes.filter(cafe=>cafe.locations.length).length, pins:result.cafes.reduce((sum,cafe)=>sum+cafe.locations.length,0), unplaced:result.cafes.filter(cafe=>!cafe.locations.length).map(cafe=>cafe.name)}, null, 2));
}
