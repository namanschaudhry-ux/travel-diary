// Imported from Photos/NYC subfolders. Folder names determine gallery filters.
import type { ImageMetadata } from "astro";
import added0 from "../assets/photos/new-york/buildings/dji_20260829110601_0131_d.jpg";
import added1 from "../assets/photos/new-york/buildings/dji_20260830001047_0205_d.jpg";
import added2 from "../assets/photos/new-york/buildings/dji_20260830001855_0208_d.jpg";
import added3 from "../assets/photos/new-york/buildings/dji_20260830004709_0218_d.jpg";
import added4 from "../assets/photos/new-york/buildings/dji_20260901115335_0375_d.jpg";
import added5 from "../assets/photos/new-york/buildings/dji_20260902130749_0005_d.jpg";
import added6 from "../assets/photos/new-york/buildings/img_8706.jpeg";
import added7 from "../assets/photos/new-york/buildings/img_8778.jpeg";
import added9 from "../assets/photos/new-york/buildings/img_8879.jpeg";
import added10 from "../assets/photos/new-york/cafes/dji_20260829232348_0167_d.jpg";
import added11 from "../assets/photos/new-york/cafes/dji_20260829232355_0168_d.jpg";
import added12 from "../assets/photos/new-york/cafes/dji_20260829232412_0169_d.jpg";
import added13 from "../assets/photos/new-york/cafes/dji_20260831032731_0332_d.jpg";
import added14 from "../assets/photos/new-york/cafes/dji_20260831053804_0341_d.jpg";
import added15 from "../assets/photos/new-york/cafes/img_8702.jpeg";
import added16 from "../assets/photos/new-york/bridges/dji_20260829122046_0138_d.jpg";
import added17 from "../assets/photos/new-york/bridges/dji_20260829224820_0146_d.jpg";
import added18 from "../assets/photos/new-york/bridges/dji_20260829225007_0155_d.jpg";
import added19 from "../assets/photos/new-york/bridges/img_8755.jpeg";
import added20 from "../assets/photos/new-york/bridges/img_8808.jpeg";
import added21 from "../assets/photos/new-york/green/img_8779.jpeg";

import tennis0 from "../assets/photos/new-york/tennis/dji_20260830044059_0232_d.jpg";
import tennis1 from "../assets/photos/new-york/tennis/dji_20260830051126_0239_d.jpg";
import tennis2 from "../assets/photos/new-york/tennis/dji_20260830063459_0250_d.jpg";
import tennis3 from "../assets/photos/new-york/tennis/dji_20260830074923_0256_d.jpg";

// GPS captions use OpenStreetMap reverse-geocoded streets and neighbourhoods.
// They describe the camera location; East River Waterfront describes the riverside frame.
export const additionalNewYorkPhotos: { image: ImageMetadata; alt: string; caption: string; tags: string[]; gps?: [number, number]; djiDate?: string; djiTime?: string; landmarks?: string[] }[] = [
  { image: added0, alt: "An ornate stone corner building beside brick apartment buildings.", caption: "", tags: ["buildings"], djiDate: "Aug 28 '26", djiTime: "19:06" },
  { image: added1, alt: "Brick apartment buildings and fire escapes above shopfronts and roadworks.", caption: "", tags: ["buildings"], djiDate: "Aug 29 '26", djiTime: "08:10" },
  { image: added2, alt: "A red brick apartment building above a sunny street.", caption: "", tags: ["buildings"], djiDate: "Aug 29 '26", djiTime: "08:18" },
  { image: added3, alt: "A skyscraper seen through the windows of a city bus.", caption: "One World Trade Center, Financial District", tags: ["buildings"], djiDate: "Aug 29 '26", djiTime: "08:47", landmarks: ["One World Trade Center"] },
  { image: added4, alt: "Illuminated towers and terrace lights against the evening sky.", caption: "Verci Rooftop (Night), Flatiron District", tags: ["buildings"], djiDate: "Aug 31 '26", djiTime: "19:53", landmarks: ["Empire State Building"] },
  { image: added5, alt: "A busy city street at night beneath brightly lit office buildings.", caption: "Empire State Building, Theatre District", tags: ["buildings"], djiDate: "Sep 1 '26", djiTime: "21:07", landmarks: ["Empire State Building"] },
  { image: added6, gps: [40.738922, -73.988333], alt: "Sunlit skyscrapers and older buildings beneath a blue sky.", caption: "Verci Rooftop (Day), Flatiron District", tags: ["buildings"], djiDate: "Aug 26 '26", djiTime: "16:08", landmarks: ["Empire State Building"] },
  { image: added7, gps: [40.738889, -73.988342], alt: "A city view through a window framed by draped fabric.", caption: "Inside Verci, Flatiron District", tags: ["buildings"], djiDate: "Aug 28 '26", djiTime: "14:39", landmarks: ["Empire State Building"] },
  { image: added9, gps: [40.724094, -73.995972], alt: "A brick corner building beside a row of parked blue bicycles.", caption: "Lafayette Street, NoHo", tags: ["buildings"], djiDate: "Aug 30 '26", djiTime: "10:05" },
  { image: added10, alt: "A wood-panelled cafe counter with flowers and framed artwork.", caption: "WatchHouse Park Ave South, Flatiron District", tags: ["cafes"], djiDate: "Aug 29 '26", djiTime: "07:23" },
  { image: added11, alt: "A long cafe counter with pastries and customers.", caption: "WatchHouse Park Ave South, Flatiron District", tags: ["cafes"], djiDate: "Aug 29 '26", djiTime: "07:23" },
  { image: added12, alt: "A quiet cafe window and stools against wood-panelled walls.", caption: "WatchHouse Park Ave South, Flatiron District", tags: ["cafes"], djiDate: "Aug 29 '26", djiTime: "07:24" },
  { image: added13, alt: "A sculptural illuminated lamp inside a cafe.", caption: "Milkweed Studio, Little Italy", tags: ["cafes"], djiDate: "Aug 30 '26", djiTime: "11:27" },
  { image: added14, alt: "People seated in a leafy outdoor cafe courtyard.", caption: "ACRE, Greenpoint", tags: ["cafes"], djiDate: "Aug 30 '26", djiTime: "13:38" },
  { image: added15, gps: [40.739494, -73.986839], alt: "A wood-panelled cafe seating area overlooking a street.", caption: "WatchHouse Park Ave South, Flatiron District", tags: ["cafes"], djiDate: "Aug 26 '26", djiTime: "14:42" },
  { image: added16, alt: "A white ribbed building and illuminated skyscraper at night.", caption: "One World Trade Center, Financial District", tags: ["buildings"], djiDate: "Aug 28 '26", djiTime: "20:20", landmarks: ["One World Trade Center"] },
  { image: added17, alt: "People walking toward a stone bridge tower at sunset.", caption: "Brooklyn Bridge, DUMBO", tags: ["bridges"], djiDate: "Aug 29 '26", djiTime: "06:48" },
  { image: added18, alt: "A person on a bridge walkway with the city skyline behind.", caption: "Brooklyn Bridge, DUMBO", tags: ["bridges"], djiDate: "Aug 29 '26", djiTime: "06:50" },
  { image: added19, gps: [40.709267, -73.993889], alt: "A suspension bridge viewed from a riverside promenade.", caption: "East River Waterfront, Two Bridges", tags: ["bridges"], djiDate: "Aug 28 '26", djiTime: "07:39" },
  { image: added20, gps: [40.709372, -73.994675], alt: "A bridge seen through the window of a vehicle.", caption: "FDR Drive, Two Bridges", tags: ["bridges"], djiDate: "Aug 29 '26", djiTime: "08:41" },
  { image: added21, gps: [40.737172, -73.986519], alt: "An ivy-covered corner building and trees beside a crosswalk.", caption: "Irving Place, Gramercy", tags: ["green"], djiDate: "Aug 28 '26", djiTime: "17:34" },
  { image: tennis0, alt: "Visitors walking through the US Open grounds beneath trees and stadium buildings.", caption: "US Open Entrance, Flushing", tags: ["tennis"], djiDate: "Aug 29 '26", djiTime: "12:40" },
  { image: tennis1, alt: "A tennis court surrounded by spectators beneath a stadium open roof.", caption: "Arthur Ashe Stadium, Flushing", tags: ["tennis"], djiDate: "Aug 29 '26", djiTime: "13:11" },
  { image: tennis2, alt: "Players practising on a blue tennis court with spectators filling the stands.", caption: "Louis Armstrong Stadium, Flushing", tags: ["tennis"], djiDate: "Aug 29 '26", djiTime: "14:34" },
  { image: tennis3, alt: "A large steel globe sculpture beside the tennis grounds under a clear blue sky.", caption: "The Unisphere, Flushing", tags: ["tennis"], djiDate: "Aug 29 '26", djiTime: "15:49" },
];
