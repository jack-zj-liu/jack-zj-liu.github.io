'use client';

import { useState, useCallback } from 'react';

interface Emoticon {
  label: string;
  text: string;
}

const EMOTICONS: Emoticon[] = [
  { label: 'Shrug', text: '¯\\_(ツ)_/¯' },
  { label: 'Table Flip', text: '(╯°□°)╯︵ ┻━┻' },
  { label: 'Put Back', text: '┬─┬ノ( º _ ºノ)' },
  { label: 'Disapproval', text: 'ಠ_ಠ' },
  { label: 'Lenny', text: '( ͡° ͜ʖ ͡°)' },
  { label: 'Sad', text: '(ಥ﹏ಥ)' },
  { label: 'Happy', text: '(◕‿◕)' },
  { label: 'Bear', text: 'ʕ•ᴥ•ʔ' },
  { label: 'Magic', text: '(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧' },
  { label: 'Sunglasses', text: '(⌐■_■)' },
  { label: 'Fight', text: '(ง •̀_•́)ง' },
  { label: 'Music', text: '♪~ ᕕ(ᐛ)ᕗ' },
  { label: 'Shocked', text: '(⊙_⊙)' },
  { label: 'Confused', text: '(¬‿¬)' },
  { label: 'Love', text: '(♥‿♥)' },
  { label: 'Angry', text: '(╬ Ò﹏Ó)' },
  { label: 'Sparkle', text: '(ノ´ヮ`)ノ*: ・゚✧' },
  { label: 'Flex', text: 'ᕦ(ò_óˇ)ᕤ' },
  { label: 'Cute', text: '(✿◠‿◠)' },
  { label: 'Crying', text: '(T_T)' },
  { label: 'Wink', text: '(^_~)' },
  { label: 'Excited', text: '\\(^o^)/' },
  { label: 'Sleepy', text: '(-.-)Zzz...' },
  { label: 'Hug', text: '(づ｡◕‿‿◕｡)づ' },
  { label: 'Whatever', text: '┐(´～`)┌' },
  { label: 'Run', text: 'ε=ε=ε=┌(;*´Д`)ﾉ' },
  { label: 'Devious', text: '(¬‿¬ )' },
  { label: 'Wizard', text: '(∩｀-´)⊃━☆ﾟ.*・｡ﾟ' },
  { label: 'Dog', text: 'U・ᴥ・U' },
  { label: 'Deal With It', text: '(•_•) ( •_•)>⌐■-■ (⌐■_■)' },
];

export default function EmotePage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#1f1f23', color: '#e5e5e7', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
          Emot<span style={{ color: '#7dd3fc' }}>icons</span>
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: 32, fontSize: 15 }}>
          Click to copy. Paste anywhere.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {EMOTICONS.map((e) => {
            const isCopied = copied === e.label;
            return (
              <button
                key={e.label}
                type="button"
                onClick={() => handleCopy(e.text, e.label)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '14px 18px',
                  background: isCopied ? '#1e3a5f' : '#2a2a2e',
                  border: `1px solid ${isCopied ? '#7dd3fc' : '#3a3a40'}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: 110,
                  boxShadow: isCopied ? '0 0 16px rgba(125, 211, 252, 0.35)' : 'none',
                }}
                onMouseEnter={(ev) => {
                  if (!isCopied) {
                    ev.currentTarget.style.borderColor = '#5b9bd5';
                    ev.currentTarget.style.background = '#2f2f34';
                  }
                }}
                onMouseLeave={(ev) => {
                  if (!isCopied) {
                    ev.currentTarget.style.borderColor = '#3a3a40';
                    ev.currentTarget.style.background = '#2a2a2e';
                  }
                }}
              >
                <span style={{ fontSize: 20, whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                  {e.text}
                </span>
                <span style={{ fontSize: 11, color: isCopied ? '#7dd3fc' : '#6b7280' }}>
                  {isCopied ? 'Copied!' : e.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
