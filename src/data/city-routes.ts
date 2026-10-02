// Routes shown on the Moving page when a city card is opened.
// Only hand-picked activities are listed here; everything else in the Strava
// export stays off the map. Keys must match the city names used on the city
// cards (see cityGroups in strava-since-2023.json).
//
// Route geometry comes from Strava's summary polylines in strava-export.json
// (Jun to Sep 2026), strava-runs-over-25km.json and strava-runs-20-to-25km.json
// (all-time runs of 20 km and up), strava-race-runs.json (shorter run races) and strava-rides-over-40km.json (all-time
// rides over 40 km), strava-swims-melbourne.json (open water swims) and
// strava-japan-2025.json (every run and ride in Japan, Dec 2025), decoded
// at build time. Routes are shown in full, start and finish included.
import stravaExport from "./strava-export.json";
import longRuns from "./strava-runs-over-25km.json";
import halfRuns from "./strava-runs-20-to-25km.json";
import longRides from "./strava-rides-over-40km.json";
import swims from "./strava-swims-melbourne.json";
import raceRuns from "./strava-race-runs.json";
import japanRuns from "./strava-japan-2025.json";

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
  movingTimeS: number;
  points: [number, number][]; // [lat, lng]
  race: boolean;
};

// URL slug for a city page, e.g. "New York" -> "new-york" (/moving/new-york/).
export const citySlug = (city: string) =>
  city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Runs tagged as races. The Races tab of Naman's Running / Travel Journal sheet
// is the source of truth (the first 12 were a best guess, reviewed with Naman);
// add or remove IDs here.
export const raceIds = new Set([
  "12816714577", // NYC Marathon, 3 Nov 2024
  "8741442037", // NYC United Half, 19 Mar 2023
  "10040025871", // Melbourne Marathon, 15 Oct 2023
  "11939021215", // Run Melbourne, 21 Jul 2024
  "10318587582", // 2XU Half Marathon, 3 Dec 2023
  "8980596129", // Mornington Half, 30 Apr 2023
  "10783668846", // Last minute Carman's fun run, 18 Feb 2024
  "11333672087", // HOOOOOKA Half, 5 May 2024
  "9507227944", // San Francisco Half Marathon, 23 Jul 2023
  "8136671234", // Queenstown Half Mara, 19 Nov 2022
  "15008799672", // Gold Coast Half Marathon, 5 Jul 2025
  "9109465613", // Great Ocean Road Half, 21 May 2023
  "10975062361", // Run For Kids 14k (ran on to 23 km), 17 Mar 2024
  "7444860727", // ASICS 10k, London, 10 Jul 2022
  "7463923205", // Run Through 10k, Battersea, 13 Jul 2022
  "7501116536", // Run Through 10k, Wimbledon, 20 Jul 2022
  "7749956419", // Sandy Point 10k, 4 Sep 2022
  "7824954140", // Sydney 10k (Blackmores), 18 Sep 2022
  "7896604408", // Melbourne 10k, 2 Oct 2022
  "11220086204", // Run the Rock 14k, 20 Apr 2024
  "14091776386", // Run For Kids 14k, 6 Apr 2025
  "15094426010", // Run Melbourne 10k, 13 Jul 2025
  "17400019077", // Carman's Fun Run, 15 Feb 2026
  "18444569084", // Mothers Day Run 12k, 10 May 2026
  "17323711748", // 2XU Tri Ride (bike leg of the 2XU triathlon), 8 Feb 2026
  "17323709695", // 2XU Tri Swim, 8 Feb 2026
  "13763998629", // 2XU Tri Swim, 2 Mar 2025
  "11024648086", // Tri Swim, 24 Mar 2024
  "10877357606", // 2XU Tri Swim, 3 Mar 2024
]);

// Cities whose page draws all routes on one shared map instead of a card each.
export const overlayCities = new Set(["San Francisco", "New York", "Melbourne", "Tokyo", "Sydney"]);

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
    "18444569084", // Mother’s Day Run, 10 May 2026 (race)
    "17400019077", // Carman’s Fun Run, 15 Feb 2026 (race)
    "15094426010", // Run Melbourne 10k, 13 Jul 2025 (race)
    "14091776386", // Run for the Kids #2, 6 Apr 2025 (race)
    "7896604408", // Melb 10k, 2 Oct 2022 (race)
    "7749956419", // Sandy Point 10k, 4 Sep 2022 (race)
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
    "7824954140", // Blackmores 10k, 18 Sep 2022 (race)
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
  London: [
    "7501116536", // Chase The Sun Wimbledon (Run Through 10k), 20 Jul 2022 (race)
    "7463923205", // Battersea Chase The Sun 10k (Run Through), 13 Jul 2022 (race)
    "7444860727", // ASICS 10k, 10 Jul 2022 (race)
  ],
  "Hanging Rock": [
    "11220086204", // Run The Rock, 20 Apr 2024 (race)
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
  // Japan, Dec 2025: every run recorded there (see strava-japan-2025.json).
  Tokyo: [
    "16745426346", // Yoyogi Park, 15 Dec 2025
    "16727024077", // Meguro River, 13 Dec 2025
    "16717502217", // Imperial Place Loop, 12 Dec 2025
    "16680558599", // Imperial Palace + Meiji Jingu Gaien, 8 Dec 2025
    "16670999507", // TOKYO, 7 Dec 2025
  ],
  "Mount Fuji": [
    "16717494894", // FUJI, 11 Dec 2025
    "16709838614", // Course à pied dans l'après-midi, 11 Dec 2025
  ],
};

// Rides, drawn on their own map per city (/moving/<city>/cycle/).
const featuredRides: Record<string, string[]> = {
  "Mount Fuji": [
    "16700916246", // Fuji Cycling, 10 Dec 2025
  ],
  Melbourne: [
    "18459129560", // Touring, 11 May 2026
    "17631489969", // Lunch Ride, 7 Mar 2026
    "17535422038", // Dande, 27 Feb 2026
    "17323711748", // 2XU Tri Ride, 8 Feb 2026
    "17232449361", // Alb Laps, 31 Jan 2026
    "17144200339", // Baysiding, 23 Jan 2026
  ],
};

// Open water swims, drawn on their own map per city (/moving/<city>/swim/).
// Every GPS swim of 200 m or more in Port Phillip Bay; see the filter note in
// strava-swims-melbourne.json for what was left out.
const featuredSwims: Record<string, string[]> = {
  Melbourne: [
    "18459392689",
    "18339132473",
    "17726267274",
    "17668592830",
    "17323709695",
    "16960667027",
    "14161150809",
    "13986453631",
    "13763998629",
    "13726718340",
    "13691286513",
    "13602721454",
    "13553512754",
    "13542151275",
    "13322129152",
    "12721661462",
    "11242333662",
    "11190661706",
    "11059655413",
    "11024648086",
    "10988531906",
    "10968967930",
    "10954087609",
    "10939436691",
    "10907977401",
    "10890711535",
    "10877357606",
    "10865955782",
    "10843078121",
    "10818562063",
    "10784498669",
    "10770953405",
    "10705515262",
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
  ...(longRides as { activities: ExportActivity[] }).activities,
  ...(swims as { activities: ExportActivity[] }).activities,
  ...(raceRuns as { activities: ExportActivity[] }).activities,
  ...(japanRuns as { activities: ExportActivity[] }).activities,
];

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "2-digit" });

// With datedNames, names used more than once in a city ("Morning Swim") get
// their date added so the names under the shared map can be told apart.
const buildRoutes = (featured: Record<string, string[]>, datedNames = false): Record<string, CityRoute[]> =>
  Object.fromEntries(
    Object.entries(featured).map(([city, ids]) => [
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
          movingTimeS: activity.moving_time_s,
          points: decodePolyline(activity.polyline),
          race: raceIds.has(id),
        }];
      }).sort((a, b) => b.date.localeCompare(a.date))
        .map((route, _, all) =>
          datedNames && all.filter((r) => r.name === route.name).length > 1
            ? { ...route, name: `${route.name}, ${shortDate(route.date)}` }
            : route),
    ]),
  );

// Runs (including trail runs) per city: /moving/<city>/
export const cityRoutes = buildRoutes(featuredRoutes);
// Rides per city: /moving/<city>/cycle/
export const cityRideRoutes = buildRoutes(featuredRides);
// Open water swims per city: /moving/<city>/swim/
export const citySwimRoutes = buildRoutes(featuredSwims, true);

// Caption helpers shared by the route cards and the shared map.
export const routeStats = (route: CityRoute) => {
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
  if (route.sport === "Swim") {
    return {
      middle: `swim · ${Math.round(route.distanceKm * 1000).toLocaleString("en-US")} m`,
      right: `${Math.round(route.movingTimeS / 60)} min`,
    };
  }
  const label = route.sport === "TrailRun" ? "trail run" : route.sport.toLowerCase();
  return { middle: `${label} · ${fmt(route.distanceKm)} km`, right: `${route.elevationM} m up` };
};
