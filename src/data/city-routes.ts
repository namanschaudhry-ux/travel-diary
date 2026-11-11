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
//
// strava-city-runs.json is different: it holds every GPS run in a few cities
// (Melbourne from 2022 onwards) and only feeds the city map tiles on the
// Moving page and the background lines on those city pages (see cityTileLines).
// Those runs get no card, name or page of their own.
// strava-city-rides.json does the same for rides: every outdoor ride in
// Melbourne and New York, drawn on those cities' cycle map tiles.
import { decodePolyline } from "../lib/polyline";
import stravaExport from "./strava-export.json";
import longRuns from "./strava-runs-over-25km.json";
import halfRuns from "./strava-runs-20-to-25km.json";
import longRides from "./strava-rides-over-40km.json";
import swims from "./strava-swims-melbourne.json";
import raceRuns from "./strava-race-runs.json";
import japanRuns from "./strava-japan-2025.json";
import cityRuns from "./strava-city-runs.json";
import cityRides from "./strava-city-rides.json";
// strava-place-runs.json: every GPS run in four smaller places that get a map tile on the
// Moving page (Lake Forest, Alpine Shire, Naxos, Great Ocean Road).
import placeRuns from "./strava-place-runs.json";

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

// Cities whose map tile on the Moving page draws every run recorded there
// (strava-city-runs.json), not just the hand-picked ones. Their city pages
// still list only the hand-picked routes. Melbourne covers runs from 2022 on.
export const everyRunCities = new Set(["New York", "San Francisco", "Sydney", "Christchurch", "London", "Melbourne"]);
// Tiles framed on the points within this many km of the city's median point,
// so one far-off run (Wimbledon, the coast east of Christchurch) can't pull
// the picture off the centre. Other tiles frame the middle 90% of points.
// Tighter framing (zoomed in) for London, Christchurch, Tokyo, San Francisco and Sydney (Nov 2026).
// Tokyo also needs zoom 13+: Esri's grey canvas has almost no streets for Japan below that.
export const tileFrameRadiusKm: Record<string, number> = { Christchurch: 1.6, London: 2.5, Tokyo: 2.5, "San Francisco": 3.6, Sydney: 2.8, Naxos: 1.6, "Alpine Shire": 2.5, "Great Ocean Road": 2.5, "Lake Forest": 3.5 };
// Nudges a run tile's frame across by [km east, km north] after it's framed, to take in
// more of the running (Christchurch and Sydney sit a little east of their busiest spot).
export const tileFrameShiftKm: Record<string, [number, number]> = { Christchurch: [0.55, 0], Sydney: [1.2, 0] };
// Exact opening views for some tiles, per sport: [south, west, north, east]. Taken from
// Naman's screenshots of the views he wants (6 Nov 2026): Tokyo runs from Yoyogi and
// Meiji Jingu across to the Imperial Palace and Nihonbashi; Melbourne rides from the
// CBD and the bay out east past the Dandenong Creek trails.
export const tileFrameBounds: Record<string, Partial<Record<"run" | "cycle" | "swim", [number, number, number, number]>>> = {
  Tokyo: { run: [35.6596, 139.6899, 35.7079, 139.7763] },
  Melbourne: { cycle: [-37.98, 144.84, -37.69, 145.37] },
};
// Run maps that open on a fixed spot instead of where the runs bunch up: [lat, lng] and
// the km to show either side. Melbourne opens on the CBD (Flinders St / Swanston St),
// close enough for the city grid, wide enough for the inner suburbs around it.
// Used by the Moving page tile and the city's own page.
export const cityFrameCenter: Record<string, { center: [number, number]; radiusKm: number }> = {
  Melbourne: { center: [-37.8150, 144.9650], radiusKm: 3.5 },
};
// Cities that get a big map tile at the top of the Moving page's city view.
// Smaller places that also get a map tile, drawn from strava-place-runs.json (Nov 2026).
// Lake Forest and Great Ocean Road have their runs in that file too but no tile.
export const placeRunCities = new Set(["Alpine Shire", "Naxos"]);
export const tileCities = new Set([...overlayCities, ...everyRunCities, ...placeRunCities]);

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
  "Alpine Shire": [
    "8323121542", // Morning Run, Bright, 2 Jan 2023
    "10495297355", // Morning Trail Run, Bright, 5 Jan 2024
  ],
  Naxos: [
    "12211178720", // Morning Trail Run, 22 Aug 2024
    "12215541775", // Intervalling, 22 Aug 2024
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
  // Every ride in New York (all short city rides, 2023 and 2024).
  "New York": [
    "12918619153", // E bikes r crazy, 16 Nov 2024
    "12915100409", // It’s Nach time, 16 Nov 2024
    "12894896812", // Into Le East Veelage, 13 Nov 2024
    "12891796932", // Morning Ride, 13 Nov 2024
    "12870186544", // Prospecting, 9 Nov 2024
    "12870186033", // Bridge of dreams, 9 Nov 2024
    "9588842942", // NYC Summer Streets, 5 Aug 2023
    "8763991499", // Morningside Park, 23 Mar 2023
    "8760192698", // Queens + Bridge, 22 Mar 2023
    "8753826862", // Williamsburg Bridge, 21 Mar 2023
    "8752836346", // Prospect Park, 21 Mar 2023
    "8748430577", // Central Park, 20 Mar 2023
    "8746581646", // Brooklyn, 20 Mar 2023
  ],
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

const activities = [
  ...(stravaExport as { activities: ExportActivity[] }).activities,
  ...(longRuns as { activities: ExportActivity[] }).activities,
  ...(halfRuns as { activities: ExportActivity[] }).activities,
  ...(longRides as { activities: ExportActivity[] }).activities,
  ...(swims as { activities: ExportActivity[] }).activities,
  ...(raceRuns as { activities: ExportActivity[] }).activities,
  ...(japanRuns as { activities: ExportActivity[] }).activities,
  ...(cityRides as { activities: ExportActivity[] }).activities,
  ...(placeRuns as { activities: ExportActivity[] }).activities,
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
          name: activity.name.trim(),
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

// Lines for a city's map tile on the Moving page, per sport, still encoded
// (the tile decodes them in the browser). Runs are the hand-picked routes
// plus, for everyRunCities, every other run recorded in that city. Rides are
// the hand-picked rides plus every other ride in strava-city-rides.json.
const everyRun = (cityRuns as { activities: (ExportActivity & { city: string })[] }).activities;
const everyRide = (cityRides as { activities: (ExportActivity & { city: string })[] }).activities;
const everyPlaceRun = (placeRuns as { activities: (ExportActivity & { city: string })[] }).activities;
// Every run, ride or swim the site holds for a city, for the Moving page tiles: the
// all-runs and all-rides exports, the smaller places' runs and the hand-picked routes.
// Runs are all-time, so a tile's run count and km match its city page. Rides and swims
// are counted from 2023 on, the same span as their km (strava-since-2023.json).
const countSince = "2023-01-01";
const cityActivities = (city: string, sport: "run" | "cycle" | "swim") => {
  const since = sport === "run" ? "" : countSince;
  const found = new Map<string, ExportActivity>();
  const addAll = (list: (ExportActivity & { city: string })[]) =>
    list.forEach((a) => { if (a.city === city && a.start_local >= since) found.set(a.id, a); });
  const addPicked = (picked: string[] = []) => picked.forEach((id) => {
    const a = activities.find((x) => x.id === id);
    if (a && a.start_local >= since && !found.has(id)) found.set(id, a);
  });
  if (sport === "run") { addAll(everyRun); addAll(everyPlaceRun); addPicked(featuredRoutes[city]); }
  else if (sport === "cycle") { addAll(everyRide); addPicked(featuredRides[city]); }
  else addPicked(featuredSwims[city]);
  return [...found.values()];
};
export const cityActivityCount = (city: string, sport: "run" | "cycle" | "swim") => cityActivities(city, sport).length;
// All-time run km for a city's tile, from the same runs as cityActivityCount.
export const cityRunKm = (city: string) => cityActivities(city, "run").reduce((total, a) => total + a.distance_km, 0);

export const cityTileLines = (city: string) => {
  const lines = (ids: string[] = []) => ids.flatMap((id) => activities.find((a) => a.id === id)?.polyline ?? []);
  const picked = new Set(featuredRoutes[city] ?? []);
  const others = everyRunCities.has(city)
    ? everyRun.filter((a) => a.city === city && !picked.has(a.id)).flatMap((a) => a.polyline ?? [])
    : placeRunCities.has(city)
      ? everyPlaceRun.filter((a) => a.city === city && !picked.has(a.id)).flatMap((a) => a.polyline ?? [])
      : [];
  const pickedRides = new Set(featuredRides[city] ?? []);
  const otherRides = everyRide.filter((a) => a.city === city && !pickedRides.has(a.id)).flatMap((a) => a.polyline ?? []);
  return {
    run: [...lines(featuredRoutes[city]), ...others],
    cycle: [...lines(featuredRides[city]), ...otherRides],
    swim: lines(featuredSwims[city]),
  };
};

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
