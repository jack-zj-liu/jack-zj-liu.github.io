import dynamic from 'next/dynamic';
import './globe.css';

const GlobeCanvas = dynamic(() => import('@/components/globe/GlobeCanvas'), {
  ssr: false,
  loading: () => <div className="globe-page__canvas-inner globe-page__canvas-loading" aria-hidden />,
});

export default function GlobePage() {
  return (
    <main className="globe-page">
      <div className="globe-page__box">
        <div className="globe-page__box-header">
          <h1>
            <span className="text-gradient">globe</span>
          </h1>
          <p className="globe-page__subtitle">
            Three.js Earth with Natural Earth 110m land silhouettes. Labels hide on the far side as you
            rotate. Drag to spin, scroll to zoom.
          </p>
        </div>
        <div className="globe-page__canvas-wrap">
          <div className="globe-page__canvas-inner">
            <GlobeCanvas />
          </div>
        </div>
        <p className="globe-page__hint">Data: Natural Earth (public domain) · ne_110m_land</p>
      </div>
    </main>
  );
}
