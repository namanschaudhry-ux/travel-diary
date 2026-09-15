// Pulled from Strava via Claude's Strava connector — manual export for now.
// See AGENTS.md / CLAUDE.md for the plan to replace this with a live API call.
// "run" is combined run + walk distance (Strava categorizes walks separately,
// but they're folded in here and just labelled "run").
export type CityActivity = {
  city: string;
  country: string;
  run: number;
  cycle: number;
  swim: number;
};

export const activityRange = {
  start: "2026-01-01",
  end: "2026-09-15",
  label: "since january",
};

export const cityActivity: CityActivity[] = [
  { city: "Melbourne", country: "Australia", run: 515.4, cycle: 1124.6, swim: 6.6 },
  { city: "New York", country: "USA", run: 38.7, cycle: 0, swim: 0 }, // Manhattan + Brooklyn combined
  { city: "San Francisco", country: "California", run: 21.5, cycle: 0, swim: 0 },
  { city: "Sydney", country: "Australia", run: 17.5, cycle: 0, swim: 0 },
  { city: "Christchurch", country: "New Zealand", run: 15.0, cycle: 0, swim: 0 },
  { city: "Lake Forest", country: "California", run: 3.3, cycle: 0, swim: 0 },
];

// Distance with no city-level GPS tag on Strava — almost entirely indoor pool
// swims, which don't carry location data, plus a couple of untagged rides/runs
// and one regional (non-city) open-water swim in Victoria, Australia.
export const untaggedActivity = { run: 4.5, cycle: 22.8, swim: 67.6 };
