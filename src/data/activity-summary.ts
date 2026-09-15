import source from "./strava-since-2023.json";

export type CityActivity = {
  city: string;
  country: string;
  run: number;
  cycle: number;
  swim: number;
};

// This cumulative export replaces the previous 2026-only summary.
// Exact start/end dates were not provided beyond "2023 onwards".
export const activityRange = { startYear: 2023, label: "since 2023" };
const rounded = (value: number) => Math.round(value * 10) / 10;

// Preserve reported totals: rounded location rows are 0.5 km short for run + walk.
// Walk remains folded into run, matching the existing website convention.
export const activityTotals = {
  run: rounded(source.reportedTotals.run + source.reportedTotals.walk),
  cycle: source.reportedTotals.cycle,
  swim: source.reportedTotals.swim,
};

const groups: Record<string, string> = source.cityGroups;
const regionalLocations = new Set(["Victoria", "Queensland", "No location tag"]);
const grouped = new Map<string, CityActivity>();
export const untaggedActivity = { run: 0, cycle: 0, swim: 0 };

for (const location of source.locations) {
  const distances = {
    run: rounded(location.run + location.walk),
    cycle: location.cycle,
    swim: location.swim,
  };
  if (regionalLocations.has(location.city)) {
    for (const sport of ["run", "cycle", "swim"] as const) {
      untaggedActivity[sport] = rounded(untaggedActivity[sport] + distances[sport]);
    }
    continue;
  }
  const city = groups[location.city] ?? location.city;
  const key = `${city}|${location.country}`;
  const entry = grouped.get(key) ?? { city, country: location.country, run: 0, cycle: 0, swim: 0 };
  for (const sport of ["run", "cycle", "swim"] as const) {
    entry[sport] = rounded(entry[sport] + distances[sport]);
  }
  grouped.set(key, entry);
}

export const cityActivity: CityActivity[] = [...grouped.values()];
