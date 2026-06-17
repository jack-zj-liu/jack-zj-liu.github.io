'use client';

import { useEffect, useMemo, useState } from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { createLandTextureFromFeatureCollection, type GeoJSONFeatureCollection } from './cartoonEarthTexture';
import { latLonToVector3 } from './latLon';
import { GLOBE_LABELS, type GlobeLabel } from './labelsData';

const RADIUS = 1;

function spriteStyle(kind: GlobeLabel['kind']) {
  if (kind === 'continent') {
    return { fill: '#f0f4ff', stroke: '#7dd3fc', bg: 'rgba(15,22,32,0.88)' };
  }
  if (kind === 'country') {
    return { fill: '#e8ecf1', stroke: '#4a5568', bg: 'rgba(18,22,30,0.88)' };
  }
  return { fill: '#c8d0dc', stroke: '#3d4450', bg: 'rgba(14,16,22,0.88)' };
}

function buildLabelSpriteMaterial(text: string, kind: GlobeLabel['kind']): THREE.SpriteMaterial {
  const display = kind === 'continent' ? text.toUpperCase() : text;
  const { fill, stroke, bg } = spriteStyle(kind);
  const w = 640;
  const h = 160;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.SpriteMaterial({ color: 0xffffff, depthTest: true, depthWrite: false });
  }

  const pad = 18;
  const r = 28;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 6;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, r);
  } else {
    ctx.rect(pad, pad, w - pad * 2, h - pad * 2);
  }
  ctx.stroke();
  ctx.fillStyle = bg;
  ctx.fill();

  const fontPx = kind === 'continent' ? 52 : kind === 'country' ? 44 : 38;
  ctx.font = `600 ${fontPx}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = fill;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(display, w / 2, h / 2);

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;

  return new THREE.SpriteMaterial({
    map,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    sizeAttenuation: true,
  });
}

function LabelSprite({ label }: { label: GlobeLabel }) {
  const surface = useMemo(() => latLonToVector3(label.lat, label.lon, RADIUS), [label.lat, label.lon]);
  const material = useMemo(
    () => buildLabelSpriteMaterial(label.name, label.kind),
    [label.name, label.kind],
  );

  useEffect(
    () => () => {
      material.map?.dispose();
      material.dispose();
    },
    [material],
  );

  const position = useMemo(() => surface.clone().multiplyScalar(1.018).toArray() as [number, number, number], [surface]);
  const scale: [number, number, number] =
    label.kind === 'continent' ? [0.55, 0.14, 1] : label.kind === 'country' ? [0.48, 0.12, 1] : [0.4, 0.1, 1];

  return <sprite position={position} scale={scale} material={material} renderOrder={2} />;
}

export default function GlobeScene() {
  const [map, setMap] = useState<THREE.CanvasTexture | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('./ne_110m_land.json')
      .then((mod) => {
        if (cancelled) return;
        const fc = mod.default as unknown as GeoJSONFeatureCollection;
        setMap(createLandTextureFromFeatureCollection(fc));
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message ?? 'load failed');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      map?.dispose();
    },
    [map],
  );

  const gradientMap = useMemo(() => {
    const levels = 4;
    const data = new Uint8Array(levels);
    for (let i = 0; i < levels; i++) data[i] = Math.floor((255 * i) / (levels - 1));
    const tex = new THREE.DataTexture(data, levels, 1, THREE.RedFormat);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(
    () => () => {
      gradientMap.dispose();
    },
    [gradientMap],
  );

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 4]} intensity={1} color="#e8f4ff" />
      <directionalLight position={[-4, -1, -5]} intensity={0.32} color="#7dd3fc" />

      <Stars radius={90} depth={50} count={3500} factor={2.2} saturation={0.12} fade speed={0.5} />

      <mesh castShadow receiveShadow renderOrder={0}>
        <sphereGeometry args={[RADIUS, 96, 64]} />
        {map ? (
          <meshToonMaterial map={map} gradientMap={gradientMap} />
        ) : (
          <meshStandardMaterial
            color={loadError ? '#5c3d3d' : '#3d5a78'}
            roughness={0.85}
            metalness={0.05}
            emissive={loadError ? '#2a1515' : '#1a3048'}
            emissiveIntensity={0.55}
          />
        )}
      </mesh>

      {GLOBE_LABELS.map((label) => (
        <LabelSprite key={`${label.name}-${label.lat}-${label.lon}`} label={label} />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={1.06}
        maxDistance={14}
        rotateSpeed={0.65}
        zoomSpeed={0.85}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  );
}
