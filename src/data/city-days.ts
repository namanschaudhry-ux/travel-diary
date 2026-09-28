// Days spent in each city, all time (2022 onwards), shown on the city route
// pages under /moving/. Snapshot of the "K's by city" tab of Naman's
// "Running / Travel Journal" Google Sheet, taken 28 Sep 2026. The sheet is
// the source of truth; update these numbers from it when they change.
//
// South Island has no row of its own in the sheet. It is the sum of the
// trips logged there: South Island NZ 2026 (9 days) and Queenstown 2022
// (7 days). The 2025 Kaikōura and Mt Cook trips have no day count.
export const cityDays: Record<string, number> = {
  "New York": 129,
  "San Francisco": 61,
  Christchurch: 40,
  "South Island": 16,
};
