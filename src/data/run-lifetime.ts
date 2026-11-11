// Every run on Strava (Run and TrailRun, walks left out), all time, for the handwritten
// counter in the Moving page's top bar. Pulled from Strava on 11 Nov 2026:
// - count: Strava's own total of Run + TrailRun activities (1,086, first run 24 Apr 2020).
// - km: the 2020–22 runs one by one (220 runs, 1,165.8 km), plus the 2023-on summary's
//   run total (strava-since-2023.json, 5,472.6 km, taken mid-Sept 2026), plus the runs
//   since 14 Sept 2026 one by one (22 runs, 65.7 km).
// To refresh, re-pull those numbers and update asOf.
export const runLifetime = {
  km: 6704.1,
  runs: 1086,
  asOf: "2026-11-11",
};
