'use client';

import { useEffect, useMemo, useState } from 'react';

const QR_SIZE = 900;

function makeQrPngUrl(value: string): string {
  const payload = encodeURIComponent(value);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&margin=20&data=${payload}`;
}

function makeQrSvgUrl(value: string): string {
  const payload = encodeURIComponent(value);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&margin=20&format=svg&data=${payload}`;
}

type ParsedModule = { gx: number; gy: number };

export default function QrCodePage() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [styledQrDataUrl, setStyledQrDataUrl] = useState('');
  const [styledQrBlob, setStyledQrBlob] = useState<Blob | null>(null);
  const [stylizedFailed, setStylizedFailed] = useState(false);

  const qrPngUrl = useMemo(() => {
    if (!input.trim()) return '';
    return makeQrPngUrl(input.trim());
  }, [input]);

  const qrSvgUrl = useMemo(() => {
    if (!input.trim()) return '';
    return makeQrSvgUrl(input.trim());
  }, [input]);

  useEffect(() => {
    const buildStylizedQr = async () => {
      if (!qrSvgUrl) {
        setStyledQrDataUrl('');
        setStyledQrBlob(null);
        setStylizedFailed(false);
        return;
      }

      try {
        setStylizedFailed(false);
        const response = await fetch(qrSvgUrl);
        if (!response.ok) {
          throw new Error(`request failed with HTTP ${response.status}`);
        }

        const svgText = await response.text();
        const parsed = parseQrSvg(svgText);
        const canvas = document.createElement('canvas');
        canvas.width = QR_SIZE;
        canvas.height = QR_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('canvas unavailable');

        const textureImage = await loadImage('/images/water_lily.jpg');
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = QR_SIZE;
        textureCanvas.height = QR_SIZE;
        const textureCtx = textureCanvas.getContext('2d');
        if (!textureCtx) throw new Error('texture canvas unavailable');

        const srcW = textureImage.width;
        const srcH = textureImage.height;
        const scale = Math.max(QR_SIZE / srcW, QR_SIZE / srcH);
        const drawW = srcW * scale;
        const drawH = srcH * scale;
        const drawX = (QR_SIZE - drawW) / 2;
        const drawY = (QR_SIZE - drawH) / 2;
        textureCtx.drawImage(textureImage, drawX, drawY, drawW, drawH);

        ctx.clearRect(0, 0, QR_SIZE, QR_SIZE);
        // Keep a subtle light backing for scan contrast while preserving visible box background.
        ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
        ctx.fillRect(0, 0, QR_SIZE, QR_SIZE);

        const quietZoneModules = 1;
        const totalGrid = parsed.gridSize + quietZoneModules * 2;
        const cell = QR_SIZE / totalGrid;
        const drawSize = cell * parsed.gridSize;
        const offset = (QR_SIZE - drawSize) / 2;

        const moduleSet = new Set(parsed.modules.map((module) => `${module.gx},${module.gy}`));
        const isFinderCell = (gx: number, gy: number) => {
          const inTopLeftFinder = gx <= 6 && gy <= 6;
          const inTopRightFinder = gx >= parsed.gridSize - 7 && gy <= 6;
          const inBottomLeftFinder = gx <= 6 && gy >= parsed.gridSize - 7;
          return inTopLeftFinder || inTopRightFinder || inBottomLeftFinder;
        };

        for (const module of parsed.modules) {
          const x = offset + module.gx * cell;
          const y = offset + module.gy * cell;

          const isFinder = isFinderCell(module.gx, module.gy);

          if (isFinder) {
            // Hybrid finder style: keep texture, but strongly darkened for reliable scanning.
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, cell, cell);
            ctx.clip();
            ctx.drawImage(textureCanvas, x, y, cell, cell, x, y, cell, cell);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
            ctx.fillRect(x, y, cell, cell);
            ctx.restore();
            continue;
          }

          const hasLeft = moduleSet.has(`${module.gx - 1},${module.gy}`) && !isFinderCell(module.gx - 1, module.gy);
          const hasRight = moduleSet.has(`${module.gx + 1},${module.gy}`) && !isFinderCell(module.gx + 1, module.gy);
          const hasUp = moduleSet.has(`${module.gx},${module.gy - 1}`) && !isFinderCell(module.gx, module.gy - 1);
          const hasDown = moduleSet.has(`${module.gx},${module.gy + 1}`) && !isFinderCell(module.gx, module.gy + 1);

          const edgeInset = cell * 0.02;
          const leftGap = hasLeft ? 0 : edgeInset;
          const rightGap = hasRight ? 0 : edgeInset;
          const topGap = hasUp ? 0 : edgeInset;
          const bottomGap = hasDown ? 0 : edgeInset;
          const shapeX = x + leftGap;
          const shapeY = y + topGap;
          const shapeW = cell - leftGap - rightGap;
          const shapeH = cell - topGap - bottomGap;

          // Draw standard connected square modules.
          ctx.save();
          ctx.beginPath();
          ctx.rect(shapeX, shapeY, shapeW, shapeH);
          ctx.clip();

          ctx.drawImage(textureCanvas, x, y, cell, cell, x, y, cell, cell);

          // Darken texture for scan contrast while preserving image details.
          ctx.fillStyle = 'rgba(0, 0, 0, 0.41)';
          ctx.fillRect(x, y, cell, cell);
          ctx.restore();
        }

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((result) => {
            if (!result) {
              reject(new Error('failed to encode stylized image'));
              return;
            }
            resolve(result);
          }, 'image/png');
        });

        setStyledQrBlob(blob);
        setStyledQrDataUrl(canvas.toDataURL('image/png'));
      } catch {
        setStyledQrBlob(null);
        setStyledQrDataUrl('');
        setStylizedFailed(true);
      }
    };

    buildStylizedQr();
  }, [qrSvgUrl]);

  const copyQrImage = async () => {
    if (!qrPngUrl) return;

    setCopied(false);
    setCopyMessage('');

    try {
      let imageBlob = styledQrBlob;
      if (!imageBlob) {
        const response = await fetch(qrPngUrl);
        if (!response.ok) {
          throw new Error(`request failed with HTTP ${response.status}`);
        }
        imageBlob = await response.blob();
      }

      if (
        typeof ClipboardItem === 'undefined' ||
        !navigator.clipboard ||
        typeof navigator.clipboard.write !== 'function'
      ) {
        await navigator.clipboard.writeText(styledQrDataUrl || qrPngUrl);
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
      setCopyMessage('stylized qr copied');
    } catch {
      try {
        await navigator.clipboard.writeText(styledQrDataUrl || qrPngUrl);
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
          {stylizedFailed && (
            <div style={{ color: '#fbbf24', fontSize: 12 }}>
              stylized render failed, showing plain qr fallback
            </div>
          )}
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
          <div style={{ width: 'min(620px, 100%)', display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button
              type="button"
              onClick={copyQrImage}
              disabled={!qrPngUrl}
              style={{
                borderRadius: 8,
                border: copied ? '1px solid #4ade80' : '1px solid rgba(186, 230, 253, 0.28)',
                background: copied ? 'rgba(74, 222, 128, 0.22)' : 'rgba(10, 26, 38, 0.65)',
                color: copied ? '#86efac' : '#d9f0fb',
                padding: '8px 12px',
                fontSize: 13,
                cursor: qrPngUrl ? 'pointer' : 'not-allowed',
                opacity: qrPngUrl ? 1 : 0.55,
              }}
            >
              copy image
            </button>
          </div>
          <div
            style={{
              width: 'min(620px, 100%)',
              aspectRatio: '1 / 1',
              borderRadius: 10,
              border: '1px solid rgba(186, 230, 253, 0.22)',
              background:
                'linear-gradient(145deg, rgba(186, 230, 253, 0.52) 0%, rgba(147, 197, 253, 0.38) 52%, rgba(125, 211, 252, 0.3) 100%)',
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden',
            }}
          >
            {qrPngUrl ? (
              <img
                src={styledQrDataUrl || qrPngUrl}
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

function parseQrSvg(svgText: string): { width: number; gridSize: number; modules: ParsedModule[] } {
  const widthMatch = svgText.match(/<svg[^>]*\bwidth="([\d.]+)"/i);
  const pathMatch = svgText.match(/<path[^>]*\bd="([^"]+)"/i);
  if (!widthMatch || !pathMatch) {
    throw new Error('invalid qr svg');
  }

  const width = Number.parseFloat(widthMatch[1]);
  if (!Number.isFinite(width) || width <= 0) {
    throw new Error('invalid svg width');
  }

  const modules: ParsedModule[] = [];
  const d = pathMatch[1];
  const moduleRegex =
    /M\s*([0-9.]+),([0-9.]+)\s*l\s*([0-9.]+),0\s*0,([0-9.]+)\s*-[0-9.]+,0\s*z/gi;
  let moduleSize: number | null = null;
  let match = moduleRegex.exec(d);
  while (match) {
    const x = Number.parseFloat(match[1]);
    const y = Number.parseFloat(match[2]);
    const w = Number.parseFloat(match[3]);
    const h = Number.parseFloat(match[4]);
    const size = Number.isFinite(w) && Number.isFinite(h) ? Math.min(w, h) : Number.NaN;
    if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(size) && size > 0) {
      if (moduleSize === null) moduleSize = size;
      const base = moduleSize || size;
      const gx = Math.round(x / base);
      const gy = Math.round(y / base);
      modules.push({ gx, gy });
    }
    match = moduleRegex.exec(d);
  }

  if (modules.length === 0 || moduleSize === null) {
    throw new Error('no qr modules parsed');
  }

  let maxGrid = 0;
  for (const module of modules) {
    if (module.gx > maxGrid) maxGrid = module.gx;
    if (module.gy > maxGrid) maxGrid = module.gy;
  }

  return { width, gridSize: maxGrid + 1, modules };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`failed to load image: ${src}`));
    image.src = src;
  });
}

