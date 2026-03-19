'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const MIN_BPM = 0;
const MAX_BPM = 300;
const MAX_SWING_DEG = 35;

const PRESETS = [
  { label: 'largo', bpm: 50 },
  { label: 'adagio', bpm: 70 },
  { label: 'andante', bpm: 92 },
  { label: 'moderato', bpm: 108 },
  { label: 'allegro', bpm: 132 },
  { label: 'vivace', bpm: 160 },
  { label: 'presto', bpm: 184 },
];

const STEP_BTN: React.CSSProperties = {
  width: 36,
  height: 36,
  background: '#2a2a2e',
  border: '1px solid #3a3a40',
  borderRadius: 8,
  color: '#e5e5e7',
  fontSize: 18,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'inherit',
  lineHeight: 1,
};

export default function MetronomePage() {
  const [bpm, setBpmRaw] = useState(120);
  const [bpmInput, setBpmInput] = useState('120');
  const [playing, setPlaying] = useState(false);
  const [angle, setAngle] = useState(0);
  const [flash, setFlash] = useState(false);

  const [timerMin, setTimerMin] = useState(0);
  const [timerSec, setTimerSec] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [timerTotal, setTimerTotal] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setBpm = (v: number) => {
    setBpmRaw(v);
    setBpmInput(String(v));
  };

  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const bpmRef = useRef(bpm);
  const tapTimesRef = useRef<number[]>([]);

  bpmRef.current = bpm;

  const clampBpm = (v: number) => Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(v)));

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playClick = useCallback(() => {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(800, t);
    osc1.frequency.exponentialRampToValueAtTime(300, t + 0.05);
    osc1.type = 'triangle';
    gain1.gain.setValueAtTime(0.4, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc1.start(t);
    osc1.stop(t + 0.08);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1600;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.2, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    osc2.start(t);
    osc2.stop(t + 0.025);

    setFlash(true);
    setTimeout(() => setFlash(false), 80);
  }, [getAudioCtx]);

  const playBell = useCallback(() => {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;

    [830, 1245, 1660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const offset = i * 0.04;
      gain.gain.setValueAtTime(0, t + offset);
      gain.gain.linearRampToValueAtTime(0.25, t + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 1.5);
      osc.start(t + offset);
      osc.stop(t + offset + 1.5);
    });
  }, [getAudioCtx]);

  /* ── animation loop ── */
  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      setAngle(0);
      return;
    }

    let phase = 0;
    let lastTime = performance.now();
    let lastBeatPhase = -1;

    const animate = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const omega = (Math.PI * bpmRef.current) / 60;
      phase += omega * dt;

      const currentBeat = Math.floor(phase / Math.PI);
      if (currentBeat > lastBeatPhase) {
        lastBeatPhase = currentBeat;
        playClick();
      }

      setAngle(MAX_SWING_DEG * Math.sin(phase));
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, playClick]);

  /* ── keyboard shortcuts ── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  /* ── practice timer ── */
  useEffect(() => {
    if (!timerRunning || timerRemaining === null) return;
    if (timerRemaining <= 0) {
      setTimerRunning(false);
      setPlaying(false);
      setTimerRemaining(null);
      playBell();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setTimerRunning(false);
          setPlaying(false);
          playBell();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerRemaining, playBell]);

  const startTimer = () => {
    const total = timerMin * 60 + timerSec;
    if (total <= 0) return;
    setTimerTotal(total);
    setTimerRemaining(total);
    setTimerRunning(true);
    setPlaying(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
    setPlaying(false);
  };

  const resumeTimer = () => {
    setTimerRunning(true);
    setPlaying(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
    setTimerRemaining(null);
    setPlaying(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  /* ── tap tempo ── */
  const handleTap = () => {
    const now = Date.now();
    const taps = tapTimesRef.current;
    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) {
      tapTimesRef.current = [];
    }
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length > 8) tapTimesRef.current.shift();
    if (tapTimesRef.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setBpm(clampBpm(60000 / avg));
    }
  };

  /* ── SVG geometry ── */
  const svgW = 280;
  const svgH = 300;
  const pivotX = svgW / 2;
  const pivotY = svgH - 20;
  const armLen = 230;
  const weightDist = armLen * 0.55;
  const weightR = 10;

  const rad = (angle * Math.PI) / 180;
  const tipX = pivotX - armLen * Math.sin(rad);
  const tipY = pivotY - armLen * Math.cos(rad);
  const weightX = pivotX - weightDist * Math.sin(rad);
  const weightY = pivotY - weightDist * Math.cos(rad);

  const ticks = [-MAX_SWING_DEG, -MAX_SWING_DEG * 0.5, 0, MAX_SWING_DEG * 0.5, MAX_SWING_DEG];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1f1f23',
        color: '#e5e5e7',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
          metro<span style={{ color: '#7dd3fc' }}>nome</span>
        </h1>
        {/* ── pendulum visual ── */}
        <div
          style={{
            background: '#2a2a2e',
            border: '1px solid #3a3a40',
            borderRadius: 16,
            padding: '24px 16px 16px',
            marginBottom: 32,
            boxShadow: flash
              ? '0 0 32px rgba(125, 211, 252, 0.3)'
              : '0 4px 24px rgba(0,0,0,0.3)',
            transition: 'box-shadow 0.1s',
          }}
        >
          <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ maxWidth: svgW, display: 'block', margin: '0 auto' }}>
            {/* tick marks along the arc */}
            {ticks.map((deg) => {
              const r = (deg * Math.PI) / 180;
              const innerR = armLen - 10;
              const outerR = armLen + 6;
              const x1 = pivotX - innerR * Math.sin(r);
              const y1 = pivotY - innerR * Math.cos(r);
              const x2 = pivotX - outerR * Math.sin(r);
              const y2 = pivotY - outerR * Math.cos(r);
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={deg === 0 ? '#7dd3fc' : '#555'}
                  strokeWidth={deg === 0 ? 2 : 1.5}
                  strokeLinecap="round"
                />
              );
            })}

            {/* pendulum arm */}
            <line
              x1={pivotX}
              y1={pivotY}
              x2={tipX}
              y2={tipY}
              stroke="#9ca3af"
              strokeWidth={2.5}
              strokeLinecap="round"
            />

            {/* weight */}
            <circle
              cx={weightX}
              cy={weightY}
              r={weightR}
              fill="#7dd3fc"
              stroke="#5bb8e8"
              strokeWidth={2}
              style={{
                filter: flash ? 'drop-shadow(0 0 8px rgba(125,211,252,0.6))' : 'none',
                transition: 'filter 0.08s',
              }}
            />

            {/* pivot dot */}
            <circle cx={pivotX} cy={pivotY} r={5} fill="#e5e5e7" />
          </svg>
        </div>

        {/* ── BPM display + play button ── */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <div>
            <input
              type="text"
              inputMode="numeric"
              value={bpmInput}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '');
                setBpmInput(v);
                const n = Number(v);
                if (v !== '') setBpmRaw(Math.min(MAX_BPM, n));
              }}
              onBlur={() => setBpm(clampBpm(bpm))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setBpm(clampBpm(bpm));
                  setPlaying(true);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#7dd3fc',
                fontSize: '3rem',
                fontWeight: 700,
                textAlign: 'center',
                width: 140,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ color: '#9ca3af', fontSize: 14, marginTop: -4 }}>BPM</div>
          </div>
          <button
            onClick={() => setPlaying(!playing)}
            style={{
              position: 'absolute',
              right: 'calc(50% - 110px)',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 48,
              height: 48,
              background: playing ? '#dc2626' : '#7dd3fc',
              color: playing ? '#fff' : '#1f1f23',
              border: 'none',
              borderRadius: 12,
              fontSize: 20,
              cursor: 'pointer',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {playing ? '■' : '▶'}
          </button>
        </div>

        {/* ── slider with +/- ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 28,
            padding: '0 8px',
          }}
        >
          <button onClick={() => setBpm(clampBpm(bpm - 1))} style={STEP_BTN}>
            &minus;
          </button>
          <input
            type="range"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#7dd3fc', cursor: 'pointer' }}
          />
          <button onClick={() => setBpm(clampBpm(bpm + 1))} style={STEP_BTN}>
            +
          </button>
        </div>

        {/* ── practice timer ── */}
        <div
          style={{
            background: '#2a2a2e',
            border: '1px solid #3a3a40',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 28,
          }}
        >
          {timerRemaining !== null ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: '#7dd3fc', fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(timerRemaining)}
                </span>
                <button
                  onClick={timerRunning ? pauseTimer : resumeTimer}
                  style={{
                    padding: '8px 20px',
                    background: timerRunning ? '#2a2a2e' : '#7dd3fc',
                    color: timerRunning ? '#e5e5e7' : '#1f1f23',
                    border: '1px solid #3a3a40',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {timerRunning ? 'pause' : 'resume'}
                </button>
                <button
                  onClick={stopTimer}
                  style={{
                    padding: '8px 20px',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  cancel
                </button>
              </div>
              <div style={{
                height: 6,
                background: '#1f1f23',
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${timerTotal > 0 ? ((timerTotal - timerRemaining) / timerTotal) * 100 : 0}%`,
                  background: '#7dd3fc',
                  borderRadius: 3,
                  transition: 'width 1s linear',
                }} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 600, marginRight: 4 }}>
                practice timer
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={timerMin}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setTimerMin(v === '' ? 0 : Math.min(99, Number(v)));
                }}
                style={{
                  width: 48,
                  background: '#1f1f23',
                  border: '1px solid #3a3a40',
                  borderRadius: 8,
                  color: '#e5e5e7',
                  fontSize: 16,
                  fontWeight: 600,
                  textAlign: 'center',
                  padding: '6px 4px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <span style={{ color: '#9ca3af', fontSize: 13 }}>min</span>
              <input
                type="text"
                inputMode="numeric"
                value={timerSec}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setTimerSec(v === '' ? 0 : Math.min(59, Number(v)));
                }}
                style={{
                  width: 48,
                  background: '#1f1f23',
                  border: '1px solid #3a3a40',
                  borderRadius: 8,
                  color: '#e5e5e7',
                  fontSize: 16,
                  fontWeight: 600,
                  textAlign: 'center',
                  padding: '6px 4px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <span style={{ color: '#9ca3af', fontSize: 13 }}>sec</span>
              <button
                onClick={startTimer}
                style={{
                  padding: '8px 20px',
                  background: timerMin > 0 || timerSec > 0 ? '#7dd3fc' : '#3a3a40',
                  color: timerMin > 0 || timerSec > 0 ? '#1f1f23' : '#6b7280',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: timerMin > 0 || timerSec > 0 ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  marginLeft: 4,
                }}
              >
                start
              </button>
            </div>
          )}
        </div>

        {/* ── tempo presets ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {PRESETS.map((p) => {
            const active = bpm === p.bpm;
            return (
              <button
                key={p.label}
                onClick={() => setBpm(p.bpm)}
                style={{
                  padding: '6px 14px',
                  background: active ? 'rgba(125,211,252,0.12)' : 'transparent',
                  color: active ? '#7dd3fc' : '#6b7280',
                  border: `1px solid ${active ? 'rgba(125,211,252,0.3)' : '#3a3a40'}`,
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                {p.label} ({p.bpm})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
