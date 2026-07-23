'use client';

import Link from 'next/link';

const TOOLS = [
  {
    title: 'pitch detector',
    description: 'real-time pitch detection from your microphone with a scrolling graph.',
    href: '/pitch-detector',
  },
  {
    title: 'emoticons',
    description: 'common text emoticons — click to copy, paste anywhere.',
    href: '/emote',
  },
  {
    title: 'codenames',
    description: 'word packs for the codenames board game.',
    href: '/codenames',
  },
  {
    title: 'positions',
    description: 'portfolio allocation pie chart and individual holdings from latest csv.',
    href: '/positions',
  },
  {
    title: 'moosic',
    description: 'songs i like — pulled live from a youtube playlist.',
    href: '/moosic',
  },
  {
    title: 'text to bytes',
    description: 'convert any text into UTF-8 decimal or hex byte streams.',
    href: '/text-to-bytes',
  },
  {
    title: 'qr code',
    description: 'encode text into a large qr image and copy it to clipboard.',
    href: '/qr-code',
  },
  {
    title: 'metronome',
    description: 'visual metronome with adjustable BPM, tap tempo, and a swinging pendulum.',
    href: '/metronome',
  },
  {
    title: 'globe',
    description: 'cartoon earth in three.js — continents, countries, and cities; drag to spin.',
    href: '/globe',
  },
];

export default function ProjectsPage() {
  return (
    <div style={{ minHeight: '100vh', color: '#e5e5e7', padding: 'clamp(20px, 5vw, 48px) clamp(12px, 4vw, 24px)' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 5.8vw, 2rem)', fontWeight: 700, marginBottom: 24 }}>
          to<span style={{ color: '#7dd3fc' }}>ols</span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TOOLS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              style={{
                display: 'block',
                padding: 'clamp(14px, 4vw, 20px) clamp(14px, 4vw, 24px)',
                background: 'rgba(12, 30, 44, 0.44)',
                border: '1px solid rgba(186, 230, 253, 0.28)',
                borderRadius: 12,
                textDecoration: 'none',
                color: '#e5e5e7',
                boxShadow: '0 4px 16px rgba(125, 211, 252, 0.08)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(ev) => {
                ev.currentTarget.style.borderColor = '#7dd3fc';
                ev.currentTarget.style.boxShadow = '0 8px 36px rgba(125, 211, 252, 0.28), 0 0 16px rgba(125, 211, 252, 0.12)';
              }}
              onMouseLeave={(ev) => {
                ev.currentTarget.style.borderColor = '#3a3a40';
                ev.currentTarget.style.boxShadow = '0 4px 16px rgba(125, 211, 252, 0.08)';
              }}
            >
              <div style={{ fontSize: 'clamp(1.05rem, 4.2vw, 1.25rem)', fontWeight: 600, color: '#7dd3fc', marginBottom: 6 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 14, color: '#9ca3af' }}>
                {p.description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
