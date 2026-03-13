'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

const PLAYLIST_IDS = [
  'PLopzIsIGmKjEGcDd_aIUlsOOsJyXsHwxa',
  'PLopzIsIGmKjFjp2y9Zntgp7StPgC-gRNW',
];

const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://iv.ggtyler.dev',
];

type Song = {
  title: string;
  videoId: string;
  author: string;
  lengthSeconds: number;
};

const DISPLAY_COUNT = 15;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function fetchSinglePlaylist(playlistId: string): Promise<Song[]> {
  for (const base of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(`${base}/api/v1/playlists/${playlistId}`);
      if (!res.ok) continue;
      const data = await res.json();
      return (data.videos ?? [])
        .filter((v: { title: string; videoId: string }) =>
          v.title !== '[Private video]' &&
          v.title !== '[Deleted video]' &&
          v.videoId && v.videoId !== 'undefined'
        )
        .map((v: { title: string; videoId: string; author: string; lengthSeconds: number }) => ({
          title: v.title,
          videoId: v.videoId,
          author: v.author,
          lengthSeconds: v.lengthSeconds,
        }));
    } catch {
      continue;
    }
  }
  return [];
}

async function fetchAllPlaylists(): Promise<Song[]> {
  const results = await Promise.all(PLAYLIST_IDS.map(fetchSinglePlaylist));
  const all = results.flat();
  const seen = new Set<string>();
  return all.filter((s) => {
    if (seen.has(s.videoId)) return false;
    seen.add(s.videoId);
    return true;
  });
}

export default function MoosicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const allSongsRef = useRef<Song[]>([]);

  const reshuffle = useCallback(() => {
    setSongs(shuffle(allSongsRef.current).slice(0, DISPLAY_COUNT));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      allSongsRef.current = await fetchAllPlaylists();
      reshuffle();
    } catch {
      setError('could not load playlist. try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [reshuffle]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ minHeight: '100vh', background: '#1f1f23', color: '#e5e5e7', padding: '48px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
            moo<span style={{ color: '#7dd3fc' }}>sic</span>
          </h1>
          {!loading && !error && (
            <button
              type="button"
              onClick={reshuffle}
              title="shuffle 15 new songs"
              style={{
                background: 'none', border: '1px solid #3a3a40',
                borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                color: '#9ca3af', fontSize: 18, lineHeight: 1,
                transition: 'color 0.2s, border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(ev) => {
                ev.currentTarget.style.color = '#7dd3fc';
                ev.currentTarget.style.borderColor = '#7dd3fc';
                ev.currentTarget.style.boxShadow = '0 0 12px rgba(125, 211, 252, 0.2)';
              }}
              onMouseLeave={(ev) => {
                ev.currentTarget.style.color = '#9ca3af';
                ev.currentTarget.style.borderColor = '#3a3a40';
                ev.currentTarget.style.boxShadow = 'none';
              }}
            >
              &#x21bb;
            </button>
          )}
        </div>
        <p style={{ color: '#9ca3af', marginBottom: 32, fontSize: 15 }}>
          songs i like. click to listen
        </p>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{
              width: 36, height: 36, border: '3px solid #3a3a40',
              borderTopColor: '#7dd3fc', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#f87171', marginBottom: 16, textTransform: 'lowercase' }}>{error}</p>
            <button
              onClick={load}
              type="button"
              style={{
                background: '#7dd3fc', color: '#1e293b', border: 'none',
                padding: '8px 20px', borderRadius: 6, cursor: 'pointer',
                fontWeight: 600, fontSize: 14,
              }}
            >
              retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {songs.map((s) => (
              <a
                key={s.videoId}
                href={`https://www.youtube.com/watch?v=${s.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  background: '#2a2a2e',
                  border: '1px solid #3a3a40',
                  borderRadius: 10,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: '#e5e5e7',
                  boxShadow: '0 4px 16px rgba(125, 211, 252, 0.06)',
                  transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={(ev) => {
                  ev.currentTarget.style.borderColor = '#7dd3fc';
                  ev.currentTarget.style.boxShadow = '0 8px 36px rgba(125, 211, 252, 0.25), 0 0 14px rgba(125, 211, 252, 0.10)';
                  ev.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(ev) => {
                  ev.currentTarget.style.borderColor = '#3a3a40';
                  ev.currentTarget.style.boxShadow = '0 4px 16px rgba(125, 211, 252, 0.06)';
                  ev.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#1f1f23' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${s.videoId}/mqdefault.jpg`}
                    alt={s.title}
                    loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {s.lengthSeconds > 0 && (
                    <span style={{
                      position: 'absolute', bottom: 6, right: 6,
                      background: 'rgba(0,0,0,0.8)', color: '#e5e5e7',
                      fontSize: 11, fontWeight: 600, padding: '2px 6px',
                      borderRadius: 4, fontFamily: 'monospace',
                    }}>
                      {formatDuration(s.lengthSeconds)}
                    </span>
                  )}
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: '#e5e5e7',
                    lineHeight: '1.35',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    {s.author}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {!loading && !error && songs.length === 0 && (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '60px 0' }}>
            no songs found in this playlist.
          </p>
        )}
      </div>
    </div>
  );
}
