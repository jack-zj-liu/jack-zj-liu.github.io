import * as THREE from 'three';

/** Equirectangular-style Y-up globe (matches common WebGL globe conventions). */
export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * THREE.MathUtils.DEG2RAD;
  const theta = (lon + 180) * THREE.MathUtils.DEG2RAD;
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}
