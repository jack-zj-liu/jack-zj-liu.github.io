import * as THREE from 'three';

const OCEAN = '#243044';
const LAND = '#4a8f6a';
const DESERT = '#c4a574';
const ICE = '#d8e8f2';
const STROKE = '#1a1f28';
const JUNGLE = '#3d7a55';

function lonLatToXY(lon: number, lat: number, w: number, h: number) {
  const x = ((lon + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
}

function ringCentroid(ring: [number, number][]) {
  const n = Math.max(1, ring.length - 1);
  let slon = 0;
  let slat = 0;
  for (let i = 0; i < n; i++) {
    slon += ring[i][0];
    slat += ring[i][1];
  }
  return { lon: slon / n, lat: slat / n };
}

function fillForCentroid(c: { lon: number; lat: number }): string {
  if (c.lat < -62) return ICE;
  if (c.lat > -20 && c.lat < 12 && c.lon > -80 && c.lon < -35) return JUNGLE;
  if (c.lat > 8 && c.lat < 40 && c.lon > -20 && c.lon < 62) return DESERT;
  if (c.lat > -38 && c.lat < -10 && c.lon > 112 && c.lon < 154) return DESERT;
  if (c.lat > 22 && c.lat < 38 && c.lon > -118 && c.lon < -95) return DESERT;
  return LAND;
}

function appendRing(ctx: CanvasRenderingContext2D, ring: [number, number][], w: number, h: number) {
  if (!ring?.length) return;
  const [lon0, lat0] = ring[0];
  let prevLon = lon0;
  const p0 = lonLatToXY(lon0, lat0, w, h);
  ctx.moveTo(p0.x, p0.y);
  for (let i = 1; i < ring.length; i++) {
    const [lon, lat] = ring[i];
    if (Math.abs(lon - prevLon) > 180) {
      const p = lonLatToXY(lon, lat, w, h);
      ctx.moveTo(p.x, p.y);
    } else {
      const p = lonLatToXY(lon, lat, w, h);
      ctx.lineTo(p.x, p.y);
    }
    prevLon = lon;
  }
  ctx.closePath();
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  coordinates: [number, number][][],
  w: number,
  h: number,
  fill: string,
  lineWidth: number,
) {
  ctx.beginPath();
  for (const ring of coordinates) {
    appendRing(ctx, ring, w, h);
  }
  ctx.fillStyle = fill;
  ctx.fill('evenodd');
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

interface GeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: [number, number][][][];
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONPolygon | GeoJSONMultiPolygon | null;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

function drawFeature(ctx: CanvasRenderingContext2D, f: GeoJSONFeature, w: number, h: number, lineWidth: number) {
  const { geometry: g } = f;
  if (!g) return;
  if (g.type === 'Polygon') {
    const c = ringCentroid(g.coordinates[0]);
    const fill = fillForCentroid(c);
    drawPolygon(ctx, g.coordinates, w, h, fill, lineWidth);
    return;
  }
  if (g.type === 'MultiPolygon') {
    for (const poly of g.coordinates) {
      const c = ringCentroid(poly[0]);
      const fill = fillForCentroid(c);
      drawPolygon(ctx, poly, w, h, fill, lineWidth);
    }
  }
}

/** Rasterize Natural Earth land polygons onto an equirectangular canvas texture. */
export function createLandTextureFromFeatureCollection(fc: GeoJSONFeatureCollection): THREE.CanvasTexture {
  const w = 2048;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2d context unavailable');
  }

  ctx.fillStyle = OCEAN;
  ctx.fillRect(0, 0, w, h);

  const lineWidth = Math.max(1.2, w / 1000);

  for (const f of fc.features) {
    drawFeature(ctx, f, w, h, lineWidth);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Optional: load from same-origin URL (e.g. static hosting). Prefer bundled JSON in the app. */
export async function loadCartoonEarthTexture(geoUrl = '/geo/ne_110m_land.geojson'): Promise<THREE.CanvasTexture> {
  const res = await fetch(geoUrl);
  if (!res.ok) {
    throw new Error(`Failed to load land GeoJSON: ${res.status}`);
  }
  const fc = (await res.json()) as GeoJSONFeatureCollection;
  return createLandTextureFromFeatureCollection(fc);
}
