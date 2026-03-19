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
    title: 'moosic',
    description: 'songs i like — pulled live from a youtube playlist.',
    href: '/moosic',
  },
  {
    title: 'metronome',
    description: 'visual metronome with adjustable BPM, tap tempo, and a swinging pendulum.',
    href: '/metronome',
  },
];

export default function ProjectsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#1f1f23', color: '#e5e5e7', padding: '48px 24px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 32 }}>
          to<span style={{ color: '#7dd3fc' }}>ols</span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TOOLS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              style={{
                display: 'block',
                padding: '20px 24px',
                background: '#2a2a2e',
                border: '1px solid #3a3a40',
                borderRadius: 12,
                textDecoration: 'none',
                color: '#e5e5e7',
                boxShadow: '0 4px 16px rgba(125, 211, 252, 0.08)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
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
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#7dd3fc', marginBottom: 6 }}>
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
