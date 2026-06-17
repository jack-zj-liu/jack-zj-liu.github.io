import fs from 'node:fs/promises';
import path from 'node:path';
import LyricsClient from './lyrics-client';

type Song = {
  id: string;
  title: string;
  subtitle: string;
  lyrics: string;
};

function decodeByteLine(line: string): string | null {
  const normalizedLine = line.replace(/[\[\]]/g, ' ').trim();
  if (!normalizedLine) return null;

  const tokens = normalizedLine.split(/[\s,]+/).filter(Boolean);
  if (tokens.length === 0) return null;

  const lineIsHex = tokens.some((token) => /^0x/i.test(token) || /[a-f]/i.test(token));
  const bytes: number[] = [];
  for (const token of tokens) {
    const cleanToken = token.startsWith('0x') || token.startsWith('0X') ? token.slice(2) : token;
    const valid = lineIsHex ? /^[0-9a-f]+$/i.test(cleanToken) : /^\d+$/.test(cleanToken);
    if (!valid) return null;

    const value = Number.parseInt(cleanToken, lineIsHex ? 16 : 10);
    if (!Number.isFinite(value) || value < 0 || value > 255) return null;
    bytes.push(value);
  }
  if (bytes.length === 0) return null;

  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return null;
  }
}

function makeTitleFromId(id: string): string {
  return id.replace(/[-_]+/g, ' ').trim().toLowerCase();
}

async function loadPrivateLyricsSongs(): Promise<Song[]> {
  const privateDir = path.join(process.cwd(), 'public', 'private-lyrics');

  try {
    const entries = await fs.readdir(privateDir, { withFileTypes: true });
    const txtFiles = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.txt'))
      .map((entry) => entry.name);

    const songs: Song[] = await Promise.all(
      txtFiles.map(async (fileName) => {
        const id = fileName.replace(/\.txt$/i, '');
        const filePath = path.join(privateDir, fileName);
        const rawText = await fs.readFile(filePath, 'utf8');
        const [artistLine = '', lyricsLine = ''] = rawText.split(/\r?\n/, 2);

        const artist = decodeByteLine(artistLine)?.trim() || 'unknown artist';
        const decodedLyrics = decodeByteLine(lyricsLine)?.trim() || lyricsLine.trim();

        return {
          id,
          title: makeTitleFromId(id),
          subtitle: artist,
          lyrics: decodedLyrics || 'file is empty.',
        };
      })
    );

    return songs.sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}

export default async function LyricsPage() {
  const songs = await loadPrivateLyricsSongs();
  return <LyricsClient songs={songs} />;
}
