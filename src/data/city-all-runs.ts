// Every GPS run recorded in a city (strava-city-runs.json) as map routes, oldest
// first. For the album-cover city page, which names them all under its map.
import { decodePolyline } from "../lib/polyline";
import cityRuns from "./strava-city-runs.json";
import type { CityRoute } from "./city-routes";

type CityRun = { id: string; city: string; name: string; sport_type: string; start_local: string; distance_km: number; moving_time_s: number; elevation_gain_m: number; polyline?: string };

export const allCityRuns = (city: string): CityRoute[] =>
  (cityRuns as { activities: CityRun[] }).activities
    .filter((run) => run.city === city && run.polyline)
    .sort((a, b) => a.start_local.localeCompare(b.start_local))
    .map((run) => ({
      id: run.id,
      name: run.name,
      sport: run.sport_type,
      date: run.start_local.slice(0, 10),
      distanceKm: run.distance_km,
      elevationM: run.elevation_gain_m,
      movingTimeS: run.moving_time_s,
      points: decodePolyline(run.polyline!),
      race: false,
    }));
