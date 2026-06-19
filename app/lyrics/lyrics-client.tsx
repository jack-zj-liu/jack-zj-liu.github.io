'use client';

import { useEffect, useMemo, useState } from 'react';

export type Song = {
  id: string;
  title: string;
  subtitle: string;
  lyrics: string;
};

type LyricsClientProps = {
  songs: Song[];
};

export default function LyricsClient({ songs }: LyricsClientProps) {
  const [selectedSongId, setSelectedSongId] = useState(songs[0]?.id ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!songs.some((song) => song.id === selectedSongId)) {
      setSelectedSongId(songs[0]?.id ?? '');
    }
  }, [songs, selectedSongId]);

  const filteredSongs = useMemo(
    () =>
      songs.filter((song) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.trim().toLowerCase();
        return song.title.toLowerCase().includes(q) || song.subtitle.toLowerCase().includes(q);
      }),
    [songs, searchQuery]
  );

  const currentSong =
    filteredSongs.find((song) => song.id === selectedSongId) ??
    filteredSongs[0] ??
    null;
  const currentSongLines = useMemo(
    () => (currentSong ? currentSong.lyrics.split(/\r?\n/) : []),
    [currentSong]
  );

  return (
    <main style={{ minHeight: '100vh', background: '#19191d', color: '#e5e7eb' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '16px 12px 24px' : '24px 18px 36px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : '280px minmax(0, 1fr)',
            gap: isMobile ? 12 : 24,
            alignItems: 'start',
          }}
        >
          <aside
            style={{
              position: isMobile ? 'static' : 'sticky',
              top: isMobile ? 0 : 20,
              background: '#232329',
              border: '1px solid #34343a',
              borderRadius: 12,
              padding: isMobile ? 10 : 14,
              maxHeight: isMobile ? 'none' : 'calc(100vh - 70px)',
              overflowY: isMobile ? 'visible' : 'auto',
            }}
          >
            <h2
              style={{
                margin: '0 0 12px',
                fontSize: 16,
                color: '#93c5fd',
                textTransform: 'lowercase',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
            >
              songs
            </h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="title or artist"
                style={{
                  flex: 1,
                  background: '#1a1a1f',
                  border: '1px solid #3f3f46',
                  borderRadius: 8,
                  color: '#e5e7eb',
                  padding: '8px 10px',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredSongs.map((song) => {
                const isActive = song.id === currentSong?.id;
                return (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => setSelectedSongId(song.id)}
                    style={{
                      textAlign: 'left',
                      borderRadius: 10,
                      border: isActive ? '1px solid #7dd3fc' : '1px solid #3f3f46',
                      background: isActive ? 'rgba(125, 211, 252, 0.15)' : '#2a2a30',
                      color: '#e5e7eb',
                      padding: '10px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {song.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>{song.subtitle}</div>
                  </button>
                );
              })}
              {filteredSongs.length === 0 && (
                <p style={{ margin: '8px 2px', color: '#a1a1aa', fontSize: 13 }}>
                  no songs found.
                </p>
              )}
            </div>
          </aside>

          <section
            style={{
              background: '#232329',
              border: '1px solid #34343a',
              borderRadius: 12,
              padding: isMobile ? '16px 14px 18px' : '26px 30px 30px',
              minHeight: isMobile ? 360 : 560,
            }}
          >
            {currentSong ? (
              <>
                <h1
                  style={{
                    margin: 0,
                    fontSize: isMobile ? 32 : 42,
                    textTransform: 'lowercase',
                    color: '#93c5fd',
                  }}
                >
                  {currentSong.title}
                </h1>
                <p style={{ margin: '6px 0 24px', color: '#9ca3af', textTransform: 'lowercase' }}>
                  {currentSong.subtitle}
                </p>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    lineHeight: 1.8,
                    fontSize: isMobile ? 18 : 21,
                    color: '#e4e4e7',
                  }}
                >
                  {currentSongLines.map((line, index) => {
                    const isSectionLine = /^\s*\[[^\]]+\]\s*$/.test(line);
                    return (
                      <span
                        key={`${index}-${line}`}
                        style={{
                          color: isSectionLine ? '#93c5fd' : undefined,
                        }}
                      >
                        {line}
                        {index < currentSongLines.length - 1 ? '\n' : ''}
                      </span>
                    );
                  })}
                </pre>
              </>
            ) : (
              <p style={{ margin: 0, color: '#a1a1aa' }}>
                no songs found in private-lyrics folder.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
