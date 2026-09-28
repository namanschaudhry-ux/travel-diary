// Routes shown on the Moving page when a city card is opened.
// Only hand-picked activities are listed here; everything else in the Strava
// export stays off the map. Keys must match the city names used on the city
// cards (see cityGroups in strava-since-2023.json).
//
// Route geometry comes from Strava's summary polyline in strava-export.json,
// decoded at build time. Routes are shown in full, start and finish included.
import stravaExport from "./strava-export.json";

type ExportActivity = {
  id: string;
  name: string;
  sport_type: string;
  start_local: string;
  distance_km: number;
  moving_time_s: number;
  elevation_gain_m: number;
  polyline?: string;
};

export type CityRoute = {
  id: string;
  name: string;
  sport: string;
  date: string; // local start date, YYYY-MM-DD
  distanceKm: number;
  elevationM: number;
  points: [number, number][]; // [lat, lng]
};

const featuredRoutes: Record<string, string[]> = {
  "New York": ["19963757617"], // Fantastico, Brooklyn, 30 Aug 2026
};

// Google encoded polyline algorithm (precision 5), as used by Strava.
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    for (const axis of [0, 1]) {
      let result = 0;
      let shift = 0;
      let byte: number;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 0) lat += delta;
      else lng += delta;
    }
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

const activities = (stravaExport as { activities: ExportActivity[] }).activities;

export const cityRoutes: Record<string, CityRoute[]> = Object.fromEntries(
  Object.entries(featuredRoutes).map(([city, ids]) => [
    city,
    ids.flatMap((id) => {
      const activity = activities.find((a) => a.id === id);
      if (!activity?.polyline) return [];
      return [{
        id,
        name: activity.name,
        sport: activity.sport_type,
        date: activity.start_local.slice(0, 10),
        distanceKm: activity.distance_km,
        elevationM: Math.round(activity.elevation_gain_m),
        points: decodePolyline(activity.polyline),
      }];
    }),
  ]),
);
