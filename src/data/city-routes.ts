// Routes shown on the Moving page when a city card is opened.
// Only hand-picked activities are listed here; everything else in the Strava
// export stays off the map. Keys must match the city names used on the city
// cards (see cityGroups in strava-since-2023.json).
//
// Route geometry comes from Strava's summary polylines in strava-export.json
// (Jun to Sep 2026), strava-runs-over-25km.json and strava-runs-20-to-25km.json
// (all-time runs of 20 km and up),
// decoded at build time. Routes are shown in full, start and finish included.
import stravaExport from "./strava-export.json";
import longRuns from "./strava-runs-over-25km.json";
import halfRuns from "./strava-runs-20-to-25km.json";

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

// URL slug for a city page, e.g. "New York" -> "new-york" (/moving/new-york/).
export const citySlug = (city: string) =>
  city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const featuredRoutes: Record<string, string[]> = {
  // Each city page lists its routes newest first (sorted in code below).
  "New York": [
    "19963757617", // Fantastico, 30 Aug 2026
    "13027030362", // So peak, 1 Dec 2024
    "12976371554", // Parking Centrally, 24 Nov 2024
    "12816714577", // NYC Marathon, 3 Nov 2024
    "12351955664", // Finishing the Euro / NYC trip in style, 7 Sep 2024
    "9688235413", // Bay Ridge Exploring, 20 Aug 2023
    "9640935305", // Brooklyn Touring, 13 Aug 2023
    "9595333400", // Lap of a large 🍎, 6 Aug 2023
    "8741442037", // NYC United Half, 19 Mar 2023
  ],
  Melbourne: [
    "19004351677", // Avengers Assemble, 21 Jun 2026
    "15393896141", // Dandenong Creek Trail, 9 Aug 2025
    "15160000664", // Horse Hommage, 19 Jul 2025
    "12641190308", // Melb Mara B2B2B, 13 Oct 2024
    "12528429593", // 3hrs of rain w the gang, 29 Sep 2024
    "12471662372", // Morning Run, 22 Sep 2024
    "11939021215", // Run Melbourne, 21 Jul 2024
    "11818944650", // Afternoon Run, 6 Jul 2024
    "11538726329", // Nandos, 31 May 2024
    "11499144315", // Sunday Long, 26 May 2024
    "11443515730", // Negative Fun, 19 May 2024
    "11389073791", // Loooong run, 12 May 2024
    "11272367695", // SLR (is back), 27 Apr 2024
    "10975062361", // 23ks for 23 years, 17 Mar 2024
    "10837661822", // Long Run, 26 Feb 2024
    "10783668846", // Last minute Carman’s fun run, 18 Feb 2024
    "10730681910", // Jells Park laps, 10 Feb 2024
    "10691292573", // Anniversary Trail, 4 Feb 2024
    "10392183495", // SLR Revival ⏮️, 17 Dec 2023
    "10318587582", // 2XU Half Marathon, 3 Dec 2023
    "10134125431", // Course à pied matinale, 31 Oct 2023
    "10040025871", // Melbourne Marathon, 15 Oct 2023
    "9871202615", // Big Loop of Melb, 18 Sep 2023
    "9773904900", // Yarra Long Run, 3 Sep 2023
    "9024817669", // Long Run, 7 May 2023
    "8980596129", // Mornington Half, 30 Apr 2023
    "8578735090", // Half Mara, 18 Feb 2023
    "8463003844", // Afternoon Run, 28 Jan 2023
    "8355893835", // Afternoon Run, 8 Jan 2023
  ],
  Sydney: [
    "11609226699", // Rocks to Manly on a DAVID 🌞, 9 Jun 2024
    "11333672087", // HOOOOOKA Half, 5 May 2024
  ],
  "San Francisco": [
    "16033660084", // SF 🤠, 4 Oct 2025
    "9727339221", // Golden Gate Park and more, 26 Aug 2023
    "9507227944", // San Francisco Half Marathon, 23 Jul 2023
    "9413680163", // GGP & Presidio (w Michael), 8 Jul 2023
  ],
  "South Island": [
    "15326054835", // Kaikoūra, 3 Aug 2025
    "8136671234", // Queenstown Half Mara, 19 Nov 2022
  ],
  Munich: [
    "12170428720", // Into Munich, 17 Aug 2024
  ],
  "Lake Forest": [
    "9551677340", // Laguna Woods, 30 Jul 2023
    "9387958936", // Portola Springs, 4 Jul 2023
  ],
  Christchurch: [
    "15225283075", // More Hagley, 25 Jul 2025
  ],
  "Gold Coast": [
    "15008799672", // Gold Coast Half Marathon, 5 Jul 2025
  ],
  "Great Ocean Road": [
    "9109465613", // Great Ocean Road Half, 21 May 2023
  ],
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

const activities = [
  ...(stravaExport as { activities: ExportActivity[] }).activities,
  ...(longRuns as { activities: ExportActivity[] }).activities,
  ...(halfRuns as { activities: ExportActivity[] }).activities,
];

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
    }).sort((a, b) => b.date.localeCompare(a.date)),
  ]),
);
