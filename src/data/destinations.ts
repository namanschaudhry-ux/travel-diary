// Add a new destination here, then drop photos into
// src/assets/photos/<slug>/ (any file name, jpg/png/webp).
// The gallery picks them up automatically, in filename order.
export type Destination = {
  slug: string;
  name: string;
  country: string;
  year: string;
  blurb: string;
};

export const destinations: Destination[] = [
  {
    slug: "japan",
    name: "Japan",
    country: "Japan",
    year: "2024",
    blurb: "Neon crossings, quiet shrines, and bamboo groves.",
  },
  {
    slug: "italy",
    name: "Italy",
    country: "Italy",
    year: "2023",
    blurb: "Coastal towns, ancient ruins, and long dinners.",
  },
  {
    slug: "iceland",
    name: "Iceland",
    country: "Iceland",
    year: "2022",
    blurb: "Glaciers, waterfalls, and black sand beaches.",
  },
];
