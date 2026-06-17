'use client';

import { Canvas } from '@react-three/fiber';
import GlobeScene from './GlobeScene';

export default function GlobeCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.25, 3.15], fov: 48, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%', display: 'block', background: '#1f1f23' }}
    >
      <color attach="background" args={['#1f1f23']} />
      <fog attach="fog" args={['#1f1f23', 18, 48]} />
      <GlobeScene />
    </Canvas>
  );
}
