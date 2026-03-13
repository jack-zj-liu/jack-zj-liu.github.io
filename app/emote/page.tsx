'use client';

import { useState, useCallback } from 'react';

interface Emoticon {
  label: string;
  text: string;
}

interface Section {
  title: string;
  items: Emoticon[];
}

const SECTIONS: Section[] = [
  {
    title: 'yayyy',
    items: [
      { label: 'happy', text: '(◕‿◕)' },
      { label: 'excited', text: '\\(^o^)/' },
      { label: 'wink', text: '(^_~)' },
      { label: 'love', text: '(♥‿♥)' },
      { label: 'sparkle', text: '(ノ´ヮ`)ノ*: ・゚✧' },
      { label: 'magic', text: '(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧' },
      { label: 'music', text: '♪~ ᕕ(ᐛ)ᕗ' },
      { label: 'dance', text: '┏(・o・)┛♪┗(・o・)┓' },
      { label: 'yay', text: 'ヽ(>∀<☆)ノ' },
      { label: 'flower girl', text: '(✿╹◡╹)' },
      { label: 'stars', text: '☆*:.｡.o(≧▽≦)o.｡.:*☆' },
      { label: 'thumbs up', text: '(b ᵔ▽ᵔ)b' },
      { label: 'peace', text: '✌(◕‿-)✌' },
    ],
  },
  {
    title: 'sadge',
    items: [
      { label: 'sad puppy', text: '૮(˶ㅠ︿ㅠ)ა' },
      { label: 'sad', text: '(ಥ﹏ಥ)' },
      { label: 'crying', text: '(T_T)' },
      { label: 'hug', text: '(づ｡◕‿‿◕｡)づ' },
      { label: 'sleepy', text: '(-.-)Zzz...' },
      { label: 'heartbroken', text: '(╥_╥)' },
      { label: 'please', text: '(ノ´д`)ノ' },
      { label: 'worried', text: '(⊙﹏⊙)' },
      { label: 'lonely', text: '(ノω・、)' },
      { label: 'sigh', text: '(=_=)' },
      { label: 'sorry', text: '(シ_ _)シ' },
    ],
  },
  {
    title: 'hmmm',
    items: [
      { label: 'shrug', text: '¯\\_(ツ)_/¯' },
      { label: 'orangutan', text: '🦧' },
      { label: 'point & laugh', text: '🫵😂' },
      { label: 'lenny', text: '( ͡° ͜ʖ ͡°)' },
      { label: 'disapproval', text: 'ಠ_ಠ' },
      { label: 'shocked', text: '(⊙_⊙)' },
      { label: 'confused', text: '(¬‿¬)' },
      { label: 'devious', text: '(¬‿¬ )' },
      { label: 'whatever', text: '┐(´～`)┌' },
      { label: 'nervous', text: '(°▽°;)' },
      { label: 'side eye', text: '(ー_ー)' },
      { label: 'smug', text: '(￣ω￣)' },
      { label: 'peek', text: '┬┴┬┴┤ ͜ʖ ͡°)├┬┴┬┴' },
      { label: 'suspicion', text: '(눈_눈)' },
      { label: 'facepalm', text: '(ー△ー;)' },
    ],
  },
  {
    title: 'grrr',
    items: [
      { label: 'table flip', text: '(╯°□°)╯︵ ┻━┻' },
      { label: 'put back', text: '┬─┬ノ( º _ ºノ)' },
      { label: 'angry', text: '(╬ Ò﹏Ó)' },
      { label: 'fight', text: '(ง •̀_•́)ง' },
      { label: 'flex', text: 'ᕦ(ò_óˇ)ᕤ' },
      { label: 'run', text: 'ε=ε=ε=┌(;*´Д`)ﾉ' },
      { label: 'rage', text: '(ノಠ益ಠ)ノ彡┻━┻' },
      { label: 'glare', text: '(¬_¬")' },
      { label: 'punch', text: "O=('-'Q)" },
      { label: 'grr', text: '(╬≖_≖)' },
      { label: 'stomp', text: '(ꐦ°᷄д°᷅)' },
    ],
  },
  {
    title: 'zoo',
    items: [
      { label: 'bear', text: 'ʕ•ᴥ•ʔ' },
      { label: 'dog', text: 'U・ᴥ・U' },
      { label: 'cat', text: '(=^・ω・^=)' },
      { label: 'fish', text: '<º))))><' },
      { label: 'spider', text: '/╲/\\╭(ఠఠ益ఠఠ)╮/\\╱\\' },
      { label: 'penguin', text: '(づ◡﹏◡)づ🐧' },
      { label: 'wizard', text: '(∩｀-´)⊃━☆ﾟ.*・｡ﾟ' },
      { label: 'mouse', text: '(ↀᴥↀ)' },
      { label: 'pig', text: '( ´(00)`)' },
      { label: 'owl', text: '(ᵔᴥᵔ)' },
      { label: 'crab', text: '(V)(;,,;)(V)' },
      { label: 'snail', text: '@╯-╰@' },
      { label: 'butterfly', text: 'ƸӁƷ' },
    ],
  },
  {
    title: 'emoji combos',
    items: [
      { label: 'zoo', text: '🦁🐯🐻🐼🦊🐺🐵🦒🦓🐘🦏🦛🐊🦘🐪' },
      { label: 'aquarium', text: '🐠🐟🐡🦈🐙🦑🦞🦀🐚🪸🐳🐋🐬🦭🪼' },
      { label: 'farm', text: '🐄🐖🐑🐓🐴🐰🦆🐐🐈🐕🦃🐾' },
      { label: 'bugs', text: '🐛🦋🐝🐞🪲🦗🪳🐜🕷️🦂🪰🐌🐛' },
      { label: 'thanksgiving', text: '🦃🍂🍁🥧🌽🥔🍗🙏🤎🕯️' },
      { label: 'christmas', text: '🎄🎅🤶🎁🦌❄️⛄🔔🌟🧣🍪🥛🎶' },
      { label: 'halloween', text: '🎃👻💀🦇🕷️🕸️🧛🧟🍬🌙🔮' },
      { label: 'birthday', text: '🎂🎉🎈🎁🥳🕯️🍰🎊🪅✨' },
      { label: 'valentines', text: '❤️💕💘💐🌹🍫🥂💌💋😍' },
      { label: 'summer', text: '☀️🏖️🌊🍉🌴🕶️🧊🍦🏄🐚🌅' },
      { label: 'winter', text: '❄️⛄🧣🧤🎿🏂🌨️☕🫖🔥' },
      { label: 'space', text: '🚀🌍🌙⭐🪐🛸👽🌌☄️🔭🛰️' },
      { label: 'food feast', text: '🍕🍔🌮🍣🍜🥗🍝🍱🥘🧆🍩🍪' },
      { label: 'sports', text: '⚽🏀🏈⚾🎾🏐🏓🏸🥊⛳🏊🚴' },
      { label: 'music', text: '🎵🎶🎸🎹🥁🎷🎺🎻🪗🎤🎧' },
    ],
  },
];

export default function EmotePage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
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
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#1f1f23', color: '#e5e5e7', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
          emot<span style={{ color: '#7dd3fc' }}>icons</span>
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: 36, fontSize: 15 }}>
          click to copy. paste anywhere.
        </p>

        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#7dd3fc', marginBottom: 14 }}>
              {section.title}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {section.items.map((e) => {
                const key = `${section.title}-${e.label}`;
                const isCopied = copied === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCopy(e.text, key)}
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
                        ev.currentTarget.style.borderColor = '#7dd3fc';
                        ev.currentTarget.style.background = '#2f2f34';
                        ev.currentTarget.style.boxShadow = '0 0 12px rgba(125, 211, 252, 0.15)';
                      }
                    }}
                    onMouseLeave={(ev) => {
                      if (!isCopied) {
                        ev.currentTarget.style.borderColor = '#3a3a40';
                        ev.currentTarget.style.background = '#2a2a2e';
                        ev.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <span style={{ fontSize: 20, whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                      {e.text}
                    </span>
                    <span style={{ fontSize: 11, color: isCopied ? '#7dd3fc' : '#6b7280' }}>
                      {isCopied ? 'copied!' : e.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
