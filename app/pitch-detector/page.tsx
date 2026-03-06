'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIDI_MIN = 36;  // C2
const MIDI_MAX = 96;  // C7
// Voice/instrument fundamentals; reject outside this (background often high or low)
const VOICE_FREQ_MIN = 80;
const VOICE_FREQ_MAX = 1200;
const BOUNDARY_MARGIN = 0.03; // reject freq within 3% of min/max (detector stuck at edge)
const RMS_THRESHOLD = 0.006; // lower = pick up quieter sound (normalized float)
const BAR_HEIGHT = 56;
const SIDEBAR_WIDTH = 220;
const LABEL_WIDTH = 44;
const PADDING = { top: 12, right: 12, bottom: 12, left: LABEL_WIDTH };
const LABEL_INSET = 10;
const APP_INSET = 14;
const PIXELS_PER_SEMITONE = 36;
const MIDI_SPAN = MIDI_MAX - MIDI_MIN + 1;
const CANVAS_HEIGHT = PADDING.top + PADDING.bottom + MIDI_SPAN * PIXELS_PER_SEMITONE;
const LOG_MAX_ENTRIES = 5;

const GUITAR_STRING_MIDI = new Set([40, 45, 50, 55, 59, 64]);

function isGuitarString(midi: number): boolean {
  return GUITAR_STRING_MIDI.has(Math.round(midi));
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

function rms(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

function hzToMidi(freqHz: number): number | null {
  if (freqHz <= 0 || !Number.isFinite(freqHz)) return null;
  return 69 + 12 * Math.log2(freqHz / 440);
}

function midiToNoteName(midi: number): string {
  const m = Math.round(midi);
  const note = NOTE_NAMES[m % 12];
  const octave = Math.floor(m / 12) - 1;
  return `${note}${octave}`;
}

const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉';
const SUBSCRIPT_MINUS = '₋';
function midiToNoteLabel(midi: number): string {
  const m = Math.round(midi);
  const note = NOTE_NAMES[m % 12];
  const octave = Math.floor(m / 12) - 1;
  const octStr = octave < 0
    ? SUBSCRIPT_MINUS + String(-octave).split('').map((c) => SUBSCRIPT_DIGITS[parseInt(c, 10)]).join('')
    : String(octave).split('').map((c) => SUBSCRIPT_DIGITS[parseInt(c, 10)]).join('');
  return `${note}${octStr}`;
}

function isNaturalNote(midi: number): boolean {
  const n = Math.round(midi) % 12;
  return n === 0 || n === 2 || n === 4 || n === 5 || n === 7 || n === 9 || n === 11;
}

export default function PitchDetectorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'running' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canvasMinWidth, setCanvasMinWidth] = useState(800);
  const [currentReading, setCurrentReading] = useState<{ freq: number; midi: number; note: string } | null>(null);
  const [logEntries, setLogEntries] = useState<Array<{ freq: number; midi: number; note: string; at: number }>>([]);
  const [rawDebug, setRawDebug] = useState<{ freq: number | null; inRange: boolean; reason?: string } | null>(null);
  const lastLogTimeRef = useRef(0);
  const lastRawDebugRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufferRef = useRef<number[]>([]);
  const recentMidiRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const detectPitchRef = useRef<((samples: Float32Array) => number | null) | null>(null);

  // Resize: only horizontal canvas min width from viewport; height is fixed from zoom
  useEffect(() => {
    const updateSize = () => {
      setCanvasMinWidth(Math.max(400, window.innerWidth - SIDEBAR_WIDTH - LABEL_WIDTH));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const drawLabels = useCallback((ctx: CanvasRenderingContext2D, height: number) => {
    const graphHeight = height - PADDING.top - PADDING.bottom;
    const midiRange = MIDI_MAX - MIDI_MIN;
    ctx.fillStyle = '#2a2a2e';
    ctx.fillRect(0, 0, LABEL_WIDTH, height);
    for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
      if (!isNaturalNote(midi)) continue;
      const t = (midi - MIDI_MIN) / midiRange;
      const y = PADDING.top + (1 - t) * graphHeight;
      const isGuitar = isGuitarString(midi);
      ctx.font = isGuitar ? 'bold 16px sans-serif' : '16px sans-serif';
      ctx.fillStyle = isGuitar ? '#c4c8cc' : '#9ca3af';
      ctx.fillText(midiToNoteLabel(midi), LABEL_INSET, y + 4);
    }
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, currentMidi: number | null, hasSound: boolean) => {
    const graphWidth = width - PADDING.right;
    const graphHeight = height - PADDING.top - PADDING.bottom;
    const midiRange = MIDI_MAX - MIDI_MIN;
    const graphLeft = 0;
    const graphRight = width - PADDING.right;

    ctx.fillStyle = '#2a2a2e';
    ctx.fillRect(0, 0, width, height);

    // Grid lines only (labels on fixed left canvas)
    for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
      const t = (midi - MIDI_MIN) / midiRange;
      const y = PADDING.top + (1 - t) * graphHeight;
      const isGuitar = isGuitarString(midi);
      ctx.strokeStyle = isGuitar ? '#505058' : '#3a3a40';
      ctx.lineWidth = isGuitar ? 2 : (isNaturalNote(midi) ? 2 : 1);
      ctx.beginPath();
      ctx.moveTo(graphLeft, y);
      ctx.lineTo(graphRight, y);
      ctx.stroke();
    }

    // Pitch history line: 1 pixel per sample, newest on the right
    const buf = bufferRef.current;
    if (buf.length >= 2) {
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      for (let i = 0; i < buf.length; i++) {
        const midi = buf[i];
        if (midi == null || !Number.isFinite(midi)) continue;
        const t = (Math.max(MIDI_MIN, Math.min(MIDI_MAX, midi)) - MIDI_MIN) / midiRange;
        const y = PADDING.top + (1 - t) * graphHeight;
        const x = graphLeft + i;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Current pitch line: glow when sound above gate
    if (currentMidi != null && Number.isFinite(currentMidi)) {
      const clampedMidi = Math.max(MIDI_MIN, Math.min(MIDI_MAX, currentMidi));
      const t = (clampedMidi - MIDI_MIN) / midiRange;
      const y = PADDING.top + (1 - t) * graphHeight;
      const lineColor = hasSound ? '#bae6fd' : '#93c5fd';
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = hasSound ? 3.5 : 2;
      if (hasSound) {
        ctx.shadowColor = '#bae6fd';
        ctx.shadowBlur = 28;
      }
      ctx.beginPath();
      ctx.moveTo(graphLeft, y);
      ctx.lineTo(graphRight, y);
      ctx.stroke();
      if (hasSound) {
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }
    }
  }, []);

  useEffect(() => {
    if (status !== 'running' || !canvasRef.current || !detectPitchRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = scrollContainerRef.current;
    if (!ctx || !container) return;

    const analyser = analyserRef.current;
    const audioContext = audioContextRef.current;
    if (!analyser || !audioContext) return;

    const fftSize = analyser.fftSize;
    const dataArray = new Float32Array(fftSize);
    const detectPitch = detectPitchRef.current;

    let lastTime = 0;
    const interval = 1000 / 30; // ~30 fps

    const tick = (time: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (time - lastTime < interval) return;
      lastTime = time;

      analyser.getFloatTimeDomainData(dataArray);
      const level = rms(dataArray);
      const aboveGate = level >= RMS_THRESHOLD;

      const rawFreq = aboveGate ? detectPitch(dataArray) : null;
      const atMinBound = rawFreq != null && rawFreq <= VOICE_FREQ_MIN * (1 + BOUNDARY_MARGIN);
      const atMaxBound = rawFreq != null && rawFreq >= VOICE_FREQ_MAX * (1 - BOUNDARY_MARGIN);
      const inRange = rawFreq != null && rawFreq >= VOICE_FREQ_MIN && rawFreq <= VOICE_FREQ_MAX && !atMinBound && !atMaxBound;
      const freq = inRange ? rawFreq : null;
      const midi = freq != null ? hzToMidi(freq) : null;

      const now = Date.now();
      if (now - lastRawDebugRef.current > 200) {
        lastRawDebugRef.current = now;
        let reason: string | undefined;
        if (!aboveGate) reason = 'quiet (below gate)';
        else if (rawFreq == null) reason = 'no pitch';
        else if (!inRange) reason = 'out of voice range';
        setRawDebug({
          freq: rawFreq ?? null,
          inRange: inRange && aboveGate,
          reason,
        });
      }

      const buf = bufferRef.current;
      const recent = recentMidiRef.current;
      let currentMidiForDraw: number | null = null;
      if (midi != null && Number.isFinite(midi) && freq != null) {
        recent.push(midi);
        if (recent.length > 5) recent.shift();
        const smoothedMidi = median(recent);
        const smoothedFreq = 440 * Math.pow(2, (smoothedMidi - 69) / 12);
        buf.push(smoothedMidi);
        const note = midiToNoteName(smoothedMidi);
        setCurrentReading({ freq: smoothedFreq, midi: smoothedMidi, note });
        const now = Date.now();
        if (now - lastLogTimeRef.current > 300) {
          lastLogTimeRef.current = now;
          setLogEntries((prev) => [...prev.slice(-(LOG_MAX_ENTRIES - 1)), { freq: smoothedFreq, midi: smoothedMidi, note, at: now }]);
        }
        currentMidiForDraw = smoothedMidi;
      } else {
        recent.length = 0;
        setCurrentReading(null);
        currentMidiForDraw = buf.length > 0 ? buf[buf.length - 1] : null;
      }
      const currentMidi = currentMidiForDraw;

      // Canvas width = at least viewport width, or buffer length so it grows and scrolls
      const minWidth = container.clientWidth;
      const newWidth = Math.max(minWidth, buf.length + PADDING.right);
      if (canvas.width !== newWidth) {
        canvas.width = newWidth;
        canvas.style.width = `${newWidth}px`;
      }
      canvas.height = CANVAS_HEIGHT;

      draw(ctx, canvas.width, canvas.height, currentMidi, aboveGate);

      const labelCanvas = labelCanvasRef.current;
      if (labelCanvas) {
        labelCanvas.width = LABEL_WIDTH;
        labelCanvas.height = CANVAS_HEIGHT;
        const labelCtx = labelCanvas.getContext('2d');
        if (labelCtx) drawLabels(labelCtx, CANVAS_HEIGHT);
      }

      // Keep scrolled to the right so newest pitch is visible
      container.scrollLeft = container.scrollWidth - container.clientWidth;
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, draw, drawLabels, canvasMinWidth]);

  // Draw grid when idle and canvas size changes (so screen isn’t blank)
  useEffect(() => {
    if (status === 'running' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvasMinWidth;
    canvas.height = CANVAS_HEIGHT;
    draw(ctx, canvas.width, canvas.height, null, false);
    const labelCanvas = labelCanvasRef.current;
    if (labelCanvas) {
      labelCanvas.width = LABEL_WIDTH;
      labelCanvas.height = CANVAS_HEIGHT;
      const labelCtx = labelCanvas.getContext('2d');
      if (labelCtx) drawLabels(labelCtx, CANVAS_HEIGHT);
    }
  }, [status, canvasMinWidth, draw, drawLabels]);

  const startMic = useCallback(async () => {
    setStatus('requesting');
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const { AMDF } = await import('pitchfinder');
      detectPitchRef.current = AMDF({
        sampleRate: ctx.sampleRate,
        minFrequency: VOICE_FREQ_MIN,
        maxFrequency: VOICE_FREQ_MAX,
      });

      if (ctx.state === 'suspended') await ctx.resume();

      bufferRef.current = [];
      recentMidiRef.current = [];
      setStatus('running');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to access microphone';
      setErrorMessage(msg);
      setStatus('error');
    }
  }, []);

  const stopMic = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    detectPitchRef.current = null;
    setStatus('idle');
    setErrorMessage(null);
    setRawDebug(null);
  }, []);

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, [stopMic]);

  return (
    <div className="pitch-detector-app" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1f1f23', color: '#e5e5e7', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#2a2a2e', border: '1px solid #3a3a40', borderRadius: 8, margin: APP_INSET, overflow: 'hidden', minHeight: 0 }}>
      {/* Top bar: title + buttons */}
      <div
        style={{
          flexShrink: 0,
          height: BAR_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          gap: 12,
          borderBottom: '1px solid #3a3a40',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Pitch detector</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {errorMessage && <span style={{ color: '#f87171', fontSize: 14 }}>{errorMessage}</span>}
          <button
            type="button"
            onClick={startMic}
            disabled={status === 'requesting' || status === 'running'}
            style={{
              padding: '8px 16px',
              background: status === 'running' ? '#3a3a40' : '#7dd3fc',
              color: status === 'running' ? '#6b7280' : '#1e293b',
              border: '1px solid transparent',
              borderRadius: 6,
              cursor: status === 'running' ? 'default' : 'pointer',
              fontWeight: 600,
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          >
            {status === 'requesting' ? 'Requesting mic…' : status === 'running' ? 'Listening' : 'Start microphone'}
          </button>
          {status === 'running' && (
            <button
              type="button"
              onClick={stopMic}
              style={{
                padding: '8px 16px',
                background: '#3a3a40',
                color: '#7dd3fc',
                border: '1px solid #5b9bd5',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Full-screen scrollable canvas + sidebar */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: LABEL_WIDTH, flexShrink: 0, background: '#2a2a2e' }}>
          <canvas
            ref={labelCanvasRef}
            width={LABEL_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ display: 'block' }}
          />
        </div>
        <div
          ref={scrollContainerRef}
          className="pitch-scroll"
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: status === 'running' ? 'auto' : 'hidden',
            background: '#2a2a2e',
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasMinWidth}
            height={CANVAS_HEIGHT}
            style={{
              display: 'block',
              minWidth: '100%',
            }}
          />
        </div>

        {/* Sidebar: current pitch + log */}
        <div
          style={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            background: '#252529',
            borderLeft: '1px solid #3a3a40',
            padding: 12,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontSize: 13,
          }}
        >
          <div style={{ marginBottom: 12, fontWeight: 600, color: '#e5e5e7' }}>Current pitch</div>
          {currentReading ? (
            <div style={{ marginBottom: 16, color: '#7dd3fc' }}>
              <div>{midiToNoteLabel(currentReading.midi)}</div>
              <div style={{ color: '#9ca3af', fontSize: 12 }}>MIDI {currentReading.midi.toFixed(1)}</div>
              <div style={{ color: '#9ca3af', fontSize: 12 }}>{currentReading.freq.toFixed(1)} Hz</div>
            </div>
          ) : (
            <div style={{ color: '#6b7280', marginBottom: 16 }}>—</div>
          )}
          {status === 'running' && (
            <>
              <div style={{ fontWeight: 600, color: '#e5e5e7', marginBottom: 6, marginTop: 4 }}>Raw (debug)</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>
                {rawDebug === null ? (
                  '—'
                ) : rawDebug.inRange ? (
                  <span style={{ color: '#7dd3fc' }}>{rawDebug.freq!.toFixed(0)} Hz (accepted)</span>
                ) : rawDebug.reason ? (
                  <span style={{ color: '#f87171' }}>{rawDebug.reason}</span>
                ) : rawDebug.freq !== null ? (
                  <span style={{ color: '#f87171' }}>{rawDebug.freq.toFixed(0)} Hz (ignored)</span>
                ) : (
                  'No pitch detected'
                )}
              </div>
            </>
          )}
          <div style={{ flex: 1, minHeight: 0 }} />
            <div style={{ flexShrink: 0, borderTop: '1px solid #3a3a40', paddingTop: 8, marginTop: 4 }}>
            <div style={{ fontWeight: 600, color: '#e5e5e7', marginBottom: 6 }}>Log</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, overflow: 'hidden' }}>
              {logEntries.length === 0 && <div style={{ color: '#6b7280' }}>No entries yet</div>}
              {[...logEntries].slice(-LOG_MAX_ENTRIES).reverse().map((entry, i) => (
                <div key={`${entry.at}-${i}`} style={{ marginBottom: 4, color: '#9ca3af' }}>
                  {midiToNoteLabel(entry.midi)} · {entry.freq.toFixed(0)} Hz
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
