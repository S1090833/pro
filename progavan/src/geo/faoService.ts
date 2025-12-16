import * as fs from "fs";
import * as path from "path";
import * as turf from "@turf/turf";
import { Feature, Polygon, MultiPolygon } from "geojson";

const faoFilePath = path.join(__dirname, "faoAreas.geojson");

let faoAreasGeoJSON: GeoJSON.FeatureCollection;

try {
  const data = fs.readFileSync(faoFilePath, "utf-8");
  faoAreasGeoJSON = JSON.parse(data);
} catch (err) {
  console.error(`Errore caricando il file faoAreas.geojson da ${faoFilePath}`, err);
  process.exit(1);
}

export function getFAOArea(lat: number, lon: number): string | null {
  const point = turf.point([lon, lat]);

  for (const feature of faoAreasGeoJSON.features) {
    // Controlla se la geometria è Polygon o MultiPolygon
    if (
      feature.geometry.type === "Polygon" ||
      feature.geometry.type === "MultiPolygon"
    ) {
      // TypeScript ora sa che feature è di tipo Feature<Polygon | MultiPolygon>
      if (turf.booleanPointInPolygon(point, feature as Feature<Polygon | MultiPolygon>)) {
        return feature.properties?.fao_code || feature.properties?.zone || null;
      }
    }
  }

  return null;
}
