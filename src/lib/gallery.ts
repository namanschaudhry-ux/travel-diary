// Reads every photo out of src/assets/photos/<slug>/ at build time.
// To add photos for a destination, just drop image files into that folder —
// nothing else needs to change.
const modules = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/photos/*/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

export type Photo = {
  image: ImageMetadata;
  fileName: string;
};

export function getPhotos(slug: string): Photo[] {
  return Object.entries(modules)
    .filter(([path]) => path.includes(`/photos/${slug}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, mod]) => ({
      image: mod.default,
      fileName: path.split("/").pop() ?? "",
    }));
}

export function getCover(slug: string): ImageMetadata | undefined {
  return getPhotos(slug)[0]?.image;
}
