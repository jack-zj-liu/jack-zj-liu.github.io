'use client';

import { useMemo, useState } from 'react';

const QR_SIZE = 900;

function makeQrUrl(value: string): string {
  const payload = encodeURIComponent(value);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&margin=20&data=${payload}`;
}

export default function QrCodePage() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const qrUrl = useMemo(() => {
    if (!input.trim()) return '';
    return makeQrUrl(input.trim());
  }, [input]);

  const copyQrImage = async () => {
    if (!qrUrl) return;

    setCopied(false);
    setCopyMessage('');

    try {
      const response = await fetch(qrUrl);
      if (!response.ok) {
        throw new Error(`request failed with HTTP ${response.status}`);
      }

      const imageBlob = await response.blob();
      if (
        typeof ClipboardItem === 'undefined' ||
        !navigator.clipboard ||
        typeof navigator.clipboard.write !== 'function'
      ) {
        await navigator.clipboard.writeText(qrUrl);
        setCopyMessage('image copy unsupported here — qr url copied instead');
        setCopied(true);
        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          [imageBlob.type || 'image/png']: imageBlob,
        }),
      ]);

      setCopied(true);
      setCopyMessage('qr image copied');
    } catch {
      try {
        await navigator.clipboard.writeText(qrUrl);
        setCopied(true);
        setCopyMessage('failed to copy image, copied qr url instead');
      } catch {
        setCopyMessage('could not copy image');
      }
    } finally {
      setTimeout(() => {
        setCopied(false);
        setCopyMessage('');
      }, 1800);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        color: '#e5e7eb',
        padding: 'clamp(20px, 5vw, 48px) clamp(12px, 4vw, 24px)',
      }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto', display: 'grid', gap: 16 }}>
        <section
          style={{
            background: 'rgba(12, 30, 44, 0.44)',
            border: '1px solid rgba(186, 230, 253, 0.28)',
            borderRadius: 12,
            boxShadow: '0 4px 16px rgba(125, 211, 252, 0.08)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: 'clamp(14px, 4vw, 20px)',
            display: 'grid',
            gap: 12,
          }}
        >
          <label htmlFor="qr-input" style={{ color: '#93c5fd', fontSize: 13 }}>
            text to encode
          </label>
          <textarea
            id="qr-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="type or paste text here..."
            spellCheck={false}
            style={{
              width: '100%',
              minHeight: 120,
              borderRadius: 10,
              border: '1px solid rgba(186, 230, 253, 0.28)',
              background: 'rgba(10, 26, 38, 0.42)',
              color: '#e5f5f3',
              fontSize: 14,
              padding: 12,
              resize: 'vertical',
              outline: 'none',
            }}
          />

          {copyMessage && <div style={{ color: '#9fb9c8', fontSize: 12 }}>{copyMessage}</div>}
        </section>

        <section
          style={{
            background: 'rgba(12, 30, 44, 0.44)',
            border: '1px solid rgba(186, 230, 253, 0.28)',
            borderRadius: 12,
            boxShadow: '0 4px 16px rgba(125, 211, 252, 0.08)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: 'clamp(14px, 4vw, 20px)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div
            style={{
              width: 'min(620px, 100%)',
              aspectRatio: '1 / 1',
              borderRadius: 10,
              border: '1px solid rgba(186, 230, 253, 0.22)',
              background: 'rgba(10, 26, 38, 0.42)',
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={copyQrImage}
              disabled={!qrUrl}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                borderRadius: 8,
                border: copied ? '1px solid #4ade80' : '1px solid rgba(186, 230, 253, 0.28)',
                background: copied ? 'rgba(74, 222, 128, 0.22)' : 'rgba(10, 26, 38, 0.65)',
                color: copied ? '#86efac' : '#d9f0fb',
                padding: '8px 12px',
                fontSize: 13,
                cursor: qrUrl ? 'pointer' : 'not-allowed',
                opacity: qrUrl ? 1 : 0.55,
                zIndex: 2,
              }}
            >
              copy image
            </button>
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="generated qr code"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: '#ffffff',
                }}
              />
            ) : (
              <p style={{ margin: 0, color: '#9fb9c8', textAlign: 'center' }}>
                your qr image will appear here
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
