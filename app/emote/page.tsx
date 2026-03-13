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
    title: 'YAYYY',
    items: [
      { label: 'Happy', text: '(◕‿◕)' },
      { label: 'Excited', text: '\\(^o^)/' },
      { label: 'Wink', text: '(^_~)' },
      { label: 'Love', text: '(♥‿♥)' },
      { label: 'Sparkle', text: '(ノ´ヮ`)ノ*: ・゚✧' },
      { label: 'Magic', text: '(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧' },
      { label: 'Music', text: '♪~ ᕕ(ᐛ)ᕗ' },
      { label: 'Dance', text: '┏(・o・)┛♪┗(・o・)┓' },
      { label: 'Yay', text: 'ヽ(>∀<☆)ノ' },
      { label: 'Flower Girl', text: '(✿╹◡╹)' },
      { label: 'Stars', text: '☆*:.｡.o(≧▽≦)o.｡.:*☆' },
      { label: 'Thumbs Up', text: '(b ᵔ▽ᵔ)b' },
      { label: 'Peace', text: '✌(◕‿-)✌' },
    ],
  },
  {
    title: 'Sadge',
    items: [
      { label: 'Sad Puppy', text: '૮(˶ㅠ︿ㅠ)ა' },
      { label: 'Sad', text: '(ಥ﹏ಥ)' },
      { label: 'Crying', text: '(T_T)' },
      { label: 'Hug', text: '(づ｡◕‿‿◕｡)づ' },
      { label: 'Sleepy', text: '(-.-)Zzz...' },
      { label: 'Heartbroken', text: '(╥_╥)' },
      { label: 'Please', text: '(ノ´д`)ノ' },
      { label: 'Worried', text: '(⊙﹏⊙)' },
      { label: 'Lonely', text: '(ノω・、)' },
      { label: 'Sigh', text: '(=_=)' },
      { label: 'Sorry', text: '(シ_ _)シ' },
    ],
  },
  {
    title: 'HMMM',
    items: [
      { label: 'Shrug', text: '¯\\_(ツ)_/¯' },
      { label: 'Orangutan', text: '🦧' },
      { label: 'Point & Laugh', text: '🫵😂' },
      { label: 'Lenny', text: '( ͡° ͜ʖ ͡°)' },
      { label: 'Disapproval', text: 'ಠ_ಠ' },
      { label: 'Shocked', text: '(⊙_⊙)' },
      { label: 'Confused', text: '(¬‿¬)' },
      { label: 'Devious', text: '(¬‿¬ )' },
      { label: 'Whatever', text: '┐(´～`)┌' },
      { label: 'Nervous', text: '(°▽°;)' },
      { label: 'Side Eye', text: '(ー_ー)' },
      { label: 'Smug', text: '(￣ω￣)' },
      { label: 'Peek', text: '┬┴┬┴┤ ͜ʖ ͡°)├┬┴┬┴' },
      { label: 'Suspicion', text: '(눈_눈)' },
      { label: 'Facepalm', text: '(ー△ー;)' },
    ],
  },
  {
    title: 'Grrr',
    items: [
      { label: 'Table Flip', text: '(╯°□°)╯︵ ┻━┻' },
      { label: 'Put Back', text: '┬─┬ノ( º _ ºノ)' },
      { label: 'Angry', text: '(╬ Ò﹏Ó)' },
      { label: 'Fight', text: '(ง •̀_•́)ง' },
      { label: 'Flex', text: 'ᕦ(ò_óˇ)ᕤ' },
      { label: 'Run', text: 'ε=ε=ε=┌(;*´Д`)ﾉ' },
      { label: 'Rage', text: '(ノಠ益ಠ)ノ彡┻━┻' },
      { label: 'Glare', text: '(¬_¬")' },
      { label: 'Punch', text: "O=('-'Q)" },
      { label: 'Grr', text: '(╬≖_≖)' },
      { label: 'Stomp', text: '(ꐦ°᷄д°᷅)' },
    ],
  },
  {
    title: 'Zoo',
    items: [
      { label: 'Bear', text: 'ʕ•ᴥ•ʔ' },
      { label: 'Dog', text: 'U・ᴥ・U' },
      { label: 'Cat', text: '(=^・ω・^=)' },

      { label: 'Fish', text: '<º))))><' },
      { label: 'Spider', text: '/╲/\\╭(ఠఠ益ఠఠ)╮/\\╱\\' },
      { label: 'Penguin', text: '(づ◡﹏◡)づ🐧' },
      { label: 'Wizard', text: '(∩｀-´)⊃━☆ﾟ.*・｡ﾟ' },
      { label: 'Mouse', text: '(ↀᴥↀ)' },
      { label: 'Pig', text: '( ´(00)`)' },

      { label: 'Owl', text: '(ᵔᴥᵔ)' },
      { label: 'Crab', text: '(V)(;,,;)(V)' },
      { label: 'Snail', text: '@╯-╰@' },
      { label: 'Butterfly', text: 'ƸӁƷ' },
    ],
  },
  {
    title: 'Emoji Combos',
    items: [
      { label: 'Zoo', text: '🦁🐯🐻🐼🦊🐺🐵🦒🦓🐘🦏🦛🐊🦘🐪' },
      { label: 'Aquarium', text: '🐠🐟🐡🦈🐙🦑🦞🦀🐚🪸🐳🐋🐬🦭🪼' },
      { label: 'Farm', text: '🐄🐖🐑🐓🐴🐰🦆🐐🐈🐕🦃🐾' },
      { label: 'Bugs', text: '🐛🦋🐝🐞🪲🦗🪳🐜🕷️🦂🪰🐌🐛' },
      { label: 'Thanksgiving', text: '🦃🍂🍁🥧🌽🥔🍗🙏🤎🕯️' },
      { label: 'Christmas', text: '🎄🎅🤶🎁🦌❄️⛄🔔🌟🧣🍪🥛🎶' },
      { label: 'Halloween', text: '🎃👻💀🦇🕷️🕸️🧛🧟🍬🌙🔮' },
      { label: 'Birthday', text: '🎂🎉🎈🎁🥳🕯️🍰🎊🪅✨' },
      { label: 'Valentines', text: '❤️💕💘💐🌹🍫🥂💌💋😍' },
      { label: 'Summer', text: '☀️🏖️🌊🍉🌴🕶️🧊🍦🏄🐚🌅' },
      { label: 'Winter', text: '❄️⛄🧣🧤🎿🏂🌨️☕🫖🔥' },
      { label: 'Space', text: '🚀🌍🌙⭐🪐🛸👽🌌☄️🔭🛰️' },
      { label: 'Food Feast', text: '🍕🍔🌮🍣🍜🥗🍝🍱🥘🧆🍩🍪' },
      { label: 'Sports', text: '⚽🏀🏈⚾🎾🏐🏓🏸🥊⛳🏊🚴' },
      { label: 'Music', text: '🎵🎶🎸🎹🥁🎷🎺🎻🪗🎤🎧' },
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
          Emot<span style={{ color: '#7dd3fc' }}>icons</span>
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: 36, fontSize: 15 }}>
          Click to copy. Paste anywhere.
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
                      {isCopied ? 'Copied!' : e.label}
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
