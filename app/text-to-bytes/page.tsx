'use client';

import { useMemo, useState } from 'react';

export default function TextToBytesPage() {
  const [input, setInput] = useState('');
  const [copiedDecimal, setCopiedDecimal] = useState(false);
  const [copiedHex, setCopiedHex] = useState(false);

  const decimalBytes = useMemo(() => {
    if (!input) return '';
    const encoded = new TextEncoder().encode(input);
    return Array.from(encoded).join(' ');
  }, [input]);

  const hexBytes = useMemo(() => {
    if (!input) return '';
    const encoded = new TextEncoder().encode(input);
    return Array.from(encoded)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join(' ');
  }, [input]);

  const copyOutput = async () => {
    if (!decimalBytes) return;
    try {
      await navigator.clipboard.writeText(decimalBytes);
      setCopiedDecimal(true);
      setTimeout(() => setCopiedDecimal(false), 1500);
    } catch {
      setCopiedDecimal(false);
    }
  };

  const copyHexOutput = async () => {
    if (!hexBytes) return;
    try {
      await navigator.clipboard.writeText(hexBytes);
      setCopiedHex(true);
      setTimeout(() => setCopiedHex(false), 1500);
    } catch {
      setCopiedHex(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#1f1f23',
        color: '#e5e5e7',
        padding: 'clamp(20px, 5vw, 48px) clamp(12px, 4vw, 24px)',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 5.8vw, 2rem)', margin: 0 }}>
          text to <span style={{ color: '#7dd3fc' }}>bytes</span>
        </h1>
        <p style={{ color: '#9ca3af', marginTop: 8, marginBottom: 20 }}>
          paste text, get UTF-8 byte stream.
        </p>

        <section
          style={{
            background: '#2a2a2e',
            border: '1px solid #3a3a40',
            borderRadius: 12,
            padding: 'clamp(14px, 3vw, 22px)',
          }}
        >
          <label htmlFor="text-input" style={{ display: 'block', marginBottom: 8, color: '#93c5fd' }}>
            input text
          </label>
          <textarea
            id="text-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="type or paste text here"
            rows={7}
            style={{
              width: '100%',
              resize: 'vertical',
              borderRadius: 10,
              border: '1px solid #3f3f46',
              background: '#1a1a1f',
              color: '#e5e5e7',
              padding: '10px 12px',
              fontSize: 14,
              lineHeight: 1.5,
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
            <span style={{ color: '#93c5fd' }}>decimal byte stream</span>
            <button
              type="button"
              onClick={copyOutput}
              style={{
                border: '1px solid #3f3f46',
                borderRadius: 8,
                background: copiedDecimal ? 'rgba(125, 211, 252, 0.2)' : '#232329',
                color: copiedDecimal ? '#7dd3fc' : '#e5e5e7',
                padding: '6px 10px',
                cursor: decimalBytes ? 'pointer' : 'default',
                opacity: decimalBytes ? 1 : 0.6,
              }}
            >
              {copiedDecimal ? 'copied' : 'copy'}
            </button>
          </div>
          <pre
            style={{
              margin: 0,
              minHeight: 88,
              borderRadius: 10,
              border: '1px solid #3f3f46',
              background: '#1a1a1f',
              color: '#d1d5db',
              padding: '10px 12px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {decimalBytes || 'bytes will appear here'}
          </pre>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
            <span style={{ color: '#93c5fd' }}>hex byte stream</span>
            <button
              type="button"
              onClick={copyHexOutput}
              style={{
                border: '1px solid #3f3f46',
                borderRadius: 8,
                background: copiedHex ? 'rgba(125, 211, 252, 0.2)' : '#232329',
                color: copiedHex ? '#7dd3fc' : '#e5e5e7',
                padding: '6px 10px',
                cursor: hexBytes ? 'pointer' : 'default',
                opacity: hexBytes ? 1 : 0.6,
              }}
            >
              {copiedHex ? 'copied' : 'copy'}
            </button>
          </div>
          <pre
            style={{
              margin: 0,
              minHeight: 88,
              borderRadius: 10,
              border: '1px solid #3f3f46',
              background: '#1a1a1f',
              color: '#d1d5db',
              padding: '10px 12px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {hexBytes || 'hex will appear here'}
          </pre>
        </section>
      </div>
    </main>
  );
}
