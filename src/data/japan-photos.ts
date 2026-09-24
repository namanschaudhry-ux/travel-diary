// Japan, Winter '25. Mirrors the Japan rows of the Notion "Photo library"
// (collection bc2e2311-37e2-4848-a4ab-47527e9ad294), in Notion "Order".
//
// Each image lives at src/assets/photos/japan-2025/<id>.jpg. The id is the
// Notion "Photo ID", so replacing a file keeps its alt text and position.
// Rows whose image file is missing are skipped, so the page still builds.
//
// Categories, captions and the background image are intentionally left out
// for now; add them here once they are filled in on Notion.
export type JapanPhoto = {
  id: string;
  alt: string;
  date: string; // local capture date from EXIF, YYYY-MM-DD
  time: string; // local capture time from EXIF, HH:MM
  gps?: [number, number];
};

export const japanPhotos: JapanPhoto[] = [
  { id: "japan-7585d31f-e048-4e51-97f5-f6ab58776014", date: "2025-12-10", time: "06:43", gps: [35.512561, 138.766053], alt: "A snow-capped mountain reflected in a lake beneath a pastel dawn sky." },
  { id: "japan-95fad16b-a42d-47e2-9376-88702d05c6dd", date: "2025-12-10", time: "15:24", alt: "Curved flower beds and visitors beside a lake with a mountain in the distance." },
  { id: "japan-1d56c36e-89c4-420c-814d-7d6debc92df6", date: "2025-12-10", time: "15:50", alt: "A cyclist on a bridge beside a lake, with a mountain and low sun ahead." },
  { id: "japan-0811432b-a0b7-4af5-9fa7-465a1c2bb032", date: "2025-12-11", time: "10:30", alt: "A person seated on a bench facing a lake and mountain." },
  { id: "japan-7de92302-e517-4857-9aa0-1a880aa64c71", date: "2025-12-11", time: "11:09", alt: "A snow-capped mountain beyond a lake and wooded hills." },
  { id: "japan-173f5143-1fb8-4817-bb22-5aff9dd31ec8", date: "2025-12-11", time: "11:25", alt: "An orange tent on a lakeshore beneath a mountain." },
  { id: "japan-d3f89d91-3892-4ee6-aa2a-2e17dccedf4b", date: "2025-12-11", time: "13:43", alt: "A lakeshore road and trees below a snow-capped mountain." },
  { id: "japan-5407e7de-029a-43d4-bf92-52fccebffae8", date: "2025-12-11", time: "14:35", alt: "A smooth cloud hovering above a mountain summit." },
  { id: "japan-5393668a-8828-4207-a41d-eec0f94d2c09", date: "2025-12-11", time: "14:38", alt: "A person posing at a lookout with a mountain in the background." },
  { id: "japan-d1f99811-1762-46a4-b241-975c11209af2", date: "2025-12-12", time: "11:38", alt: "Tatami rooms framed by wooden beams and sliding paper screens." },
  { id: "japan-199c92c5-2403-47b3-90cb-d27e9b24ba48", date: "2025-12-12", time: "16:27", alt: "Gentle waves along a beach beneath an orange sunset." },
  { id: "japan-4c8ed3a7-3877-4863-bfa4-d0b436035b17", date: "2025-12-15", time: "16:43", alt: "Visitors passing through a large red temple gate." },
  { id: "japan-913cbd05-cae6-483c-a955-6ba9abd17845", date: "2025-12-15", time: "16:46", alt: "Visitors outside an illuminated red temple hall." },
  { id: "japan-739ba399-088c-4d42-90af-9198c0bf451d", date: "2025-12-15", time: "16:48", alt: "An illuminated multi-storey pagoda against a dusk sky." },
  { id: "japan-252826d4-17a6-4ff2-9ad4-c59f61365695", date: "2025-12-15", time: "16:50", alt: "A busy temple courtyard and gate viewed from steps at dusk." },
];
