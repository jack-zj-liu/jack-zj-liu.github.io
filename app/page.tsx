 'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type PondLink = {
  href: string;
  label: string;
  image: string;
  size: number;
  rotate: string;
  delay: string;
  duration: string;
  bgSize: string;
  clipPath: string;
};

type PondPosition = {
  left: string;
  top: string;
};

const POND_LINKS: PondLink[] = [
  { href: '/projects', label: 'tools', image: '/images/lotad.png', size: 156, rotate: '-9deg', delay: '0s', duration: '8.2s', bgSize: 'contain', clipPath: 'none' },
  { href: '/lyrics', label: 'lyrics', image: '/images/chansey.png', size: 156, rotate: '7deg', delay: '0.9s', duration: '7.4s', bgSize: 'contain', clipPath: 'none' },
  { href: '/about', label: 'about', image: '/images/wooper.png', size: 156, rotate: '-7deg', delay: '1.5s', duration: '8.8s', bgSize: 'contain', clipPath: 'none' },
  { href: '/images/resume_2026feb.pdf', label: 'resume', image: '/images/manaphy.png', size: 156, rotate: '8deg', delay: '0.6s', duration: '7s', bgSize: 'contain', clipPath: 'none' },
];

function generateCenterPositions(count: number): PondPosition[] {
  const min = 34;
  const max = 66;
  const minDistance = 11;
  const points: Array<{ x: number; y: number }> = [];
  let attempts = 0;

  while (points.length < count && attempts < 500) {
    attempts += 1;
    const x = min + Math.random() * (max - min);
    const y = min + Math.random() * (max - min);
    const tooClose = points.some((p) => Math.hypot(p.x - x, p.y - y) < minDistance);
    if (!tooClose) points.push({ x, y });
  }

  while (points.length < count) {
    const idx = points.length;
    const fallback = [
      { x: 39, y: 38 },
      { x: 61, y: 38 },
      { x: 41, y: 62 },
      { x: 59, y: 62 },
    ][idx] ?? { x: 50, y: 50 };
    points.push(fallback);
  }

  return points.map((p) => ({ left: `${p.x}%`, top: `${p.y}%` }));
}

export default function Home() {
  const router = useRouter();
  const mainRef = useRef<HTMLElement | null>(null);
  const [positions, setPositions] = useState<PondPosition[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const dragStateRef = useRef<{
    index: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    startX: number;
    startY: number;
    hasMoved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const openPadLink = useCallback(
    (index: number) => {
      const pad = POND_LINKS[index];
      if (!pad) return;
      if (pad.label === 'resume') {
        window.open(pad.href, '_blank', 'noopener,noreferrer');
        return;
      }
      router.push(pad.href);
    },
    [router]
  );

  useEffect(() => {
    setPositions(generateCenterPositions(POND_LINKS.length));
  }, []);

  const onDragMove = useCallback((event: PointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag) return;

    const movedEnough =
      Math.abs(event.clientX - drag.startX) > 4 || Math.abs(event.clientY - drag.startY) > 4;
    if (!drag.hasMoved && movedEnough) {
      drag.hasMoved = true;
      suppressClickRef.current = true;
      setDraggingIndex(drag.index);
    }
    if (!drag.hasMoved) return;

    const containerRect = mainRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const maxLeft = Math.max(0, containerRect.width - drag.width);
    const maxTop = Math.max(0, containerRect.height - drag.height);
    const left = Math.min(
      maxLeft,
      Math.max(0, event.clientX - containerRect.left - drag.offsetX)
    );
    const top = Math.min(
      maxTop,
      Math.max(0, event.clientY - containerRect.top - drag.offsetY)
    );

    setPositions((prev) =>
      prev.map((pos, idx) =>
        idx === drag.index ? { left: `${Math.round(left)}px`, top: `${Math.round(top)}px` } : pos
      )
    );
  }, []);

  const endDrag = useCallback(() => {
    const drag = dragStateRef.current;
    dragStateRef.current = null;
    setDraggingIndex(null);
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', endDrag);
    if (drag && !drag.hasMoved) {
      openPadLink(drag.index);
    }
  }, [onDragMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', endDrag);
    };
  }, [endDrag, onDragMove]);

  return (
    <main ref={mainRef} style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {POND_LINKS.map((pad, index) => (
        <Link
          key={pad.label}
          href={pad.href}
          className="lily-pad-link"
          aria-label={pad.label}
          title={pad.label}
          target={pad.label === 'resume' ? '_blank' : undefined}
          rel={pad.label === 'resume' ? 'noopener noreferrer' : undefined}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            const rect = event.currentTarget.getBoundingClientRect();
            dragStateRef.current = {
              index,
              offsetX: event.clientX - rect.left,
              offsetY: event.clientY - rect.top,
              width: rect.width,
              height: rect.height,
              startX: event.clientX,
              startY: event.clientY,
              hasMoved: false,
            };
            window.addEventListener('pointermove', onDragMove);
            window.addEventListener('pointerup', endDrag);
          }}
          onClick={(event) => {
            event.preventDefault();
            suppressClickRef.current = false;
          }}
          style={{
            position: 'absolute',
            left: positions[index]?.left ?? '50%',
            top: positions[index]?.top ?? '50%',
            width: `clamp(80px, ${Math.round(pad.size * 0.092)}vw, ${pad.size}px)`,
            height: `clamp(62px, ${Math.round(pad.size * 0.071)}vw, ${Math.round(pad.size * 0.78)}px)`,
            transform: `rotate(${pad.rotate})`,
            backgroundImage: `url('${pad.image}')`,
            backgroundSize: pad.bgSize,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            clipPath: pad.clipPath,
            mixBlendMode: 'darken',
            opacity: 1,
            filter: 'brightness(1.26) contrast(1.2) saturate(1.32)',
            animation: draggingIndex === index ? 'none' : `pondFloat ${pad.duration} ease-in-out ${pad.delay} infinite`,
            zIndex: 1,
            textDecoration: 'none',
            transition: draggingIndex === index ? 'none' : 'transform 0.2s ease, filter 0.2s ease',
            cursor: draggingIndex === index ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
        />
      ))}

      <section
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 920,
          margin: '0 auto',
          padding: 'clamp(34px, 8vw, 84px) clamp(14px, 4vw, 24px)',
        }}
      >
        <div
          style={{
            border: '1px solid rgba(186, 230, 253, 0.28)',
            borderRadius: 12,
            background: 'rgba(12, 30, 44, 0.44)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: 'clamp(20px, 5vw, 42px)',
            boxShadow: '0 4px 16px rgba(125, 211, 252, 0.08)',
            color: '#e5f5f3',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 'clamp(30px, 8vw, 44px)', letterSpacing: 0.4 }}>hallo!</h1>
          <p style={{ marginTop: 18, marginBottom: 0, color: '#bfdbed' }}>
            i&apos;m a second year software engineering student at the university of waterloo
          </p>
          <p style={{ marginTop: 6, marginBottom: 0, color: '#bfdbed' }}>
            welcome to my portfolio, where I share my projects, designs and simple dev tools
          </p>
        </div>
      </section>

      <style>{`
        @keyframes pondFloat {
          0% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
          100% { transform: translateY(0) rotate(-2deg); }
        }

        .lily-pad-link:hover {
          filter: brightness(1.34) contrast(1.24) saturate(1.38);
        }
      `}</style>
    </main>
  );
}
