'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const POSITIONS_API_URL =
  'https://script.google.com/macros/s/AKfycbz8MuDlOv184adwtt4LQZ4eenea7sYlS2w74nC3rYAqTWOQSS6eYmw3iw9m-0Trjo8/exec';

type PositionsApiResponse = {
  ok?: boolean;
  error?: string;
  file?: {
    name?: string;
    lastUpdated?: string;
  };
  sourceFile?: {
    name?: string;
    lastUpdated?: string;
  };
  rows?: string[][];
};

type Position = {
  symbol: string;
  name: string;
  value: number;
  percent: number;
  quantity: number | null;
  totalGainLossDollar: number | null;
  totalGainLossPercent: number | null;
};

type AccountPortfolio = {
  accountId: string;
  positions: Position[];
  pendingAdjustment: number;
};

type ParseResult = {
  portfolios: AccountPortfolio[];
};

const PIE_COLORS = [
  '#7dd3fc',
  '#38bdf8',
  '#22d3ee',
  '#67e8f9',
  '#a5f3fc',
  '#0ea5e9',
  '#0284c7',
  '#06b6d4',
  '#14b8a6',
  '#2dd4bf',
  '#22c55e',
  '#84cc16',
];

const ACCOUNT_LABELS: Record<string, string> = {
  Z34762515: 'investment',
  '92148': '401k',
};

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, '').trim().toLowerCase();
}

function parseCurrency(raw: string): number {
  const value = raw.trim();
  if (!value) return Number.NaN;

  const wrappedNegative = value.startsWith('(') && value.endsWith(')');
  const cleaned = value.replace(/[$,\s()]/g, '');
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return Number.NaN;
  return wrappedNegative ? -parsed : parsed;
}

function parseNumber(raw: string): number {
  const value = raw.trim();
  if (!value) return Number.NaN;
  const cleaned = value.replace(/[,\s]/g, '');
  return Number.parseFloat(cleaned);
}

function parsePercent(raw: string): number {
  const value = raw.trim();
  if (!value) return Number.NaN;
  const cleaned = value.replace(/[%\s]/g, '');
  return Number.parseFloat(cleaned);
}

function parseRows(rows: string[][]): ParseResult {
  if (rows.length === 0) return { portfolios: [] };

  const headers = rows[0].map(normalizeHeader);
  const accountIndex = headers.findIndex((h) => h === 'account number');
  const symbolIndex = headers.findIndex((h) => h === 'symbol');
  const descriptionIndex = headers.findIndex((h) => h === 'description');
  const quantityIndex = headers.findIndex((h) => h === 'quantity');
  const currentValueIndex = headers.findIndex((h) => h === 'current value');
  const totalGainLossDollarIndex = headers.findIndex((h) => h === 'total gain/loss dollar');
  const totalGainLossPercentIndex = headers.findIndex((h) => h === 'total gain/loss percent');

  if (accountIndex < 0 || symbolIndex < 0 || currentValueIndex < 0) {
    return { portfolios: [] };
  }

  const buckets = new Map<
    string,
    {
      rawPositions: Array<Omit<Position, 'percent'>>;
      pendingAdjustment: number;
    }
  >();

  for (const row of rows.slice(1)) {
    const accountId = (row[accountIndex] ?? '').trim();
    const symbol = (row[symbolIndex] ?? '').trim();
    const name = (row[descriptionIndex] ?? '').trim();
    const value = parseCurrency(row[currentValueIndex] ?? '');

    if (!accountId || !symbol || !Number.isFinite(value)) continue;

    if (!buckets.has(accountId)) {
      buckets.set(accountId, {
        rawPositions: [],
        pendingAdjustment: 0,
      });
    }
    const bucket = buckets.get(accountId);
    if (!bucket) continue;

    if (/pending activity/i.test(symbol)) {
      bucket.pendingAdjustment += value;
      continue;
    }
    if (value <= 0) continue;

    bucket.rawPositions.push({
      symbol,
      name: name || symbol,
      value,
      quantity: Number.isFinite(parseNumber(row[quantityIndex] ?? ''))
        ? parseNumber(row[quantityIndex] ?? '')
        : null,
      totalGainLossDollar: Number.isFinite(parseCurrency(row[totalGainLossDollarIndex] ?? ''))
        ? parseCurrency(row[totalGainLossDollarIndex] ?? '')
        : null,
      totalGainLossPercent: Number.isFinite(parsePercent(row[totalGainLossPercentIndex] ?? ''))
        ? parsePercent(row[totalGainLossPercentIndex] ?? '')
        : null,
    });
  }

  const portfolios: AccountPortfolio[] = [];
  for (const [accountId, bucket] of buckets.entries()) {
    bucket.rawPositions.sort((a, b) => b.value - a.value);
    const total = bucket.rawPositions.reduce((sum, position) => sum + position.value, 0);
    const positions = bucket.rawPositions.map((position) => ({
      ...position,
      percent: total > 0 ? (position.value / total) * 100 : 0,
    }));
    portfolios.push({
      accountId,
      positions,
      pendingAdjustment: bucket.pendingAdjustment,
    });
  }

  return { portfolios };
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatSignedMoney(amount: number): string {
  const formatted = formatMoney(Math.abs(amount));
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}

export default function PositionsPage() {
  const [portfolios, setPortfolios] = useState<AccountPortfolio[]>([]);
  const [activeAccountId, setActiveAccountId] = useState('');
  const [fileName, setFileName] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortMode, setSortMode] = useState<'alphabetical' | 'allocation' | 'gainLoss'>('allocation');
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null);
  const [selectedSliceIndex, setSelectedSliceIndex] = useState<number | null>(null);
  const [pieHoverIndex, setPieHoverIndex] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const pieRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadPositions = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(POSITIONS_API_URL, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`request failed with HTTP ${response.status}`);
        }

        const data = (await response.json()) as PositionsApiResponse;
        if (!data.ok) {
          throw new Error(data.error || 'API returned an error');
        }

        const parsed = parseRows(data.rows ?? []);
        if (parsed.portfolios.length === 0) {
          throw new Error('no positions found in latest csv');
        }

        const preferredOrder = ['Z34762515', '92148'];
        parsed.portfolios.sort((a, b) => {
          const aIndex = preferredOrder.indexOf(a.accountId);
          const bIndex = preferredOrder.indexOf(b.accountId);
          if (aIndex === -1 && bIndex === -1) return a.accountId.localeCompare(b.accountId);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });

        setPortfolios(parsed.portfolios);
        setActiveAccountId(parsed.portfolios[0]?.accountId ?? '');
        setFileName(data.file?.name ?? data.sourceFile?.name ?? '');
        setUpdatedAt(data.file?.lastUpdated ?? data.sourceFile?.lastUpdated ?? '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadPositions();
  }, []);

  useEffect(() => {
    if (!portfolios.some((portfolio) => portfolio.accountId === activeAccountId)) {
      setActiveAccountId(portfolios[0]?.accountId ?? '');
    }
  }, [activeAccountId, portfolios]);

  useEffect(() => {
    setHoveredSliceIndex(null);
    setSelectedSliceIndex(null);
    setPieHoverIndex(null);
    setHoverPosition(null);
  }, [activeAccountId]);

  const activePortfolio = useMemo(
    () => portfolios.find((portfolio) => portfolio.accountId === activeAccountId) ?? portfolios[0] ?? null,
    [activeAccountId, portfolios]
  );

  const positions = activePortfolio?.positions ?? [];
  const pendingAdjustment = activePortfolio?.pendingAdjustment ?? 0;

  const sortedHoldings = useMemo(() => {
    const withIndex = positions.map((position, index) => ({ position, originalIndex: index }));
    const sorted = [...withIndex];

    if (sortMode === 'alphabetical') {
      sorted.sort((a, b) => a.position.symbol.localeCompare(b.position.symbol));
      return sorted;
    }

    if (sortMode === 'gainLoss') {
      sorted.sort((a, b) => {
        const aValue = a.position.totalGainLossDollar ?? Number.NEGATIVE_INFINITY;
        const bValue = b.position.totalGainLossDollar ?? Number.NEGATIVE_INFINITY;
        return bValue - aValue;
      });
      return sorted;
    }

    sorted.sort((a, b) => b.position.percent - a.position.percent);
    return sorted;
  }, [positions, sortMode]);

  const totalValue = useMemo(
    () => positions.reduce((sum, position) => sum + position.value, 0) + pendingAdjustment,
    [positions, pendingAdjustment]
  );

  const pieGradient = useMemo(() => {
    if (positions.length === 0) {
      return 'conic-gradient(#334155 0 100%)';
    }

    let cursor = 0;
    const segments = positions.map((position, index) => {
      const start = cursor;
      const end = Math.min(100, start + position.percent);
      cursor = end;
      const color = PIE_COLORS[index % PIE_COLORS.length];
      return `${color} ${start}% ${end}%`;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }, [positions]);

  const cumulativeAngles = useMemo(() => {
    let cursor = 0;
    return positions.map((position) => {
      cursor += (position.percent / 100) * 360;
      return cursor;
    });
  }, [positions]);

  const formattedDate = useMemo(() => {
    if (!updatedAt) return '';
    const date = new Date(updatedAt);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
  }, [updatedAt]);

  const activeSliceIndex = hoveredSliceIndex ?? selectedSliceIndex;

  const hoveredSlice =
    pieHoverIndex !== null && pieHoverIndex >= 0 && pieHoverIndex < positions.length
      ? positions[pieHoverIndex]
      : null;

  const hoveredSliceRange = useMemo(() => {
    if (activeSliceIndex === null || activeSliceIndex < 0 || activeSliceIndex >= positions.length) {
      return null;
    }

    const start = positions
      .slice(0, activeSliceIndex)
      .reduce((sum, position) => sum + position.percent, 0);
    const end = start + positions[activeSliceIndex].percent;

    return {
      start,
      end,
      color: PIE_COLORS[activeSliceIndex % PIE_COLORS.length],
    };
  }, [activeSliceIndex, positions]);

  const handlePieMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!pieRef.current || positions.length === 0) return;

    const rect = pieRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.hypot(dx, dy);
    const outerRadius = rect.width / 2;
    const innerRadius = outerRadius * 0.25;

    if (distance > outerRadius || distance < innerRadius) {
      setHoveredSliceIndex(null);
      setHoverPosition(null);
      return;
    }

    const angleFromTopClockwise = (Math.atan2(dy, dx) * (180 / Math.PI) + 90 + 360) % 360;
    const foundIndex = cumulativeAngles.findIndex((endAngle) => angleFromTopClockwise <= endAngle);
    const index = foundIndex === -1 ? positions.length - 1 : foundIndex;

    setPieHoverIndex(index);
    setHoveredSliceIndex(index);
    setHoverPosition({ x, y });
  };

  const handlePieMouseLeave = () => {
    setPieHoverIndex(null);
    setHoveredSliceIndex(null);
    setHoverPosition(null);
  };

  return (
    <main style={{ minHeight: '100vh', padding: 'clamp(18px, 4vw, 36px) clamp(12px, 4vw, 24px)', color: '#e5e7eb' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gap: 16 }}>
        <section
          style={{
            background: 'rgba(12, 30, 44, 0.44)',
            border: '1px solid rgba(186, 230, 253, 0.28)',
            borderRadius: 12,
            boxShadow: '0 4px 16px rgba(125, 211, 252, 0.08)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: 'clamp(14px, 4vw, 20px)',
          }}
        >
          <h1 style={{ margin: 0, color: '#7dd3fc', fontSize: 'clamp(1.4rem, 4vw, 2rem)' }}>positions</h1>
          <p style={{ margin: '8px 0 0', color: '#bfdbed' }}>
            latest portfolio allocation from your drive csv.
          </p>
          {portfolios.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {portfolios.map((portfolio) => {
                const isActive = portfolio.accountId === activeAccountId;
                const label = ACCOUNT_LABELS[portfolio.accountId] ?? portfolio.accountId;
                return (
                  <button
                    key={portfolio.accountId}
                    type="button"
                    onClick={() => setActiveAccountId(portfolio.accountId)}
                    style={{
                      borderRadius: 999,
                      border: `1px solid ${isActive ? '#7dd3fc' : 'rgba(186, 230, 253, 0.28)'}`,
                      background: isActive ? 'rgba(125, 211, 252, 0.18)' : 'rgba(10, 26, 38, 0.35)',
                      color: isActive ? '#d7f0fc' : '#bfdbed',
                      padding: '6px 12px',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
          {fileName && (
            <p style={{ margin: '8px 0 0', color: '#9ca3af', fontSize: 13 }}>
              source: {fileName}
              {formattedDate ? ` • updated ${formattedDate}` : ''}
            </p>
          )}
        </section>

        {loading && (
          <section
            style={{
              background: 'rgba(12, 30, 44, 0.44)',
              border: '1px solid rgba(186, 230, 253, 0.28)',
              borderRadius: 12,
              padding: '16px 18px',
              color: '#bfdbed',
            }}
          >
            loading positions...
          </section>
        )}

        {!loading && error && (
          <section
            style={{
              background: 'rgba(80, 18, 20, 0.5)',
              border: '1px solid rgba(252, 165, 165, 0.45)',
              borderRadius: 12,
              padding: '16px 18px',
              color: '#fecaca',
            }}
          >
            failed to load positions: {error}
          </section>
        )}

        {!loading && !error && (
          <section
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                background: 'rgba(12, 30, 44, 0.44)',
                border: '1px solid rgba(186, 230, 253, 0.28)',
                borderRadius: 12,
                padding: 'clamp(16px, 4vw, 24px)',
                boxShadow: '0 4px 16px rgba(125, 211, 252, 0.08)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ color: '#9ca3af', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                total value
              </div>
              <div style={{ marginTop: 6, color: '#e5f5f3', fontSize: 'clamp(1.5rem, 4.4vw, 2.1rem)', fontWeight: 700 }}>
                {formatMoney(totalValue)}
              </div>
              {Math.abs(pendingAdjustment) > 0.0001 && (
                <div style={{ marginTop: 6, color: '#9ca3af', fontSize: 12 }}>
                  includes pending activity: {formatMoney(pendingAdjustment)}
                </div>
              )}

              <div
                aria-label="positions pie chart"
                ref={pieRef}
                onMouseMove={handlePieMouseMove}
                onMouseLeave={handlePieMouseLeave}
                style={{
                  margin: '20px auto 0',
                  width: '100%',
                  maxWidth: 420,
                  aspectRatio: '1 / 1',
                  borderRadius: '50%',
                  background: pieGradient,
                  border: '1px solid rgba(186, 230, 253, 0.3)',
                  boxShadow: 'inset 0 0 0 10px rgba(12, 30, 44, 0.42)',
                  position: 'relative',
                }}
              >
                {hoveredSliceRange && (
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      background: `conic-gradient(transparent 0 ${hoveredSliceRange.start}%, ${hoveredSliceRange.color} ${hoveredSliceRange.start}% ${hoveredSliceRange.end}%, transparent ${hoveredSliceRange.end}% 100%)`,
                      transform: 'scale(1.035)',
                      filter: `drop-shadow(0 0 12px ${hoveredSliceRange.color}) brightness(1.24)`,
                      opacity: 0.9,
                      pointerEvents: 'none',
                      zIndex: 1,
                      transition: 'transform 120ms ease, filter 120ms ease, opacity 120ms ease',
                    }}
                  />
                )}
                {hoveredSlice && hoverPosition && (
                  <div
                    style={{
                      position: 'absolute',
                      left: hoverPosition.x,
                      top: hoverPosition.y,
                      transform: 'translate(-50%, -120%)',
                      padding: '6px 9px',
                      borderRadius: 8,
                      background: 'rgba(8, 19, 30, 0.92)',
                      border: '1px solid rgba(186, 230, 253, 0.3)',
                      color: '#d9f0fb',
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 3,
                    }}
                  >
                    {hoveredSlice.symbol} • {hoveredSlice.percent.toFixed(2)}%
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    inset: '25%',
                    borderRadius: '50%',
                    background: 'rgba(11, 26, 38, 0.9)',
                    border: '1px solid rgba(186, 230, 253, 0.25)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#bfdbed',
                    textAlign: 'center',
                    padding: 8,
                    fontSize: 13,
                    zIndex: 2,
                  }}
                >
                  {positions.length} holdings
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(12, 30, 44, 0.44)',
                border: '1px solid rgba(186, 230, 253, 0.28)',
                borderRadius: 12,
                padding: 'clamp(14px, 4vw, 20px)',
                boxShadow: '0 4px 16px rgba(125, 211, 252, 0.08)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ margin: '0 0 12px', display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: 18, color: '#7dd3fc' }}>holdings</h2>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9fb9c8', fontSize: 12 }}>
                  sort
                  <select
                    value={sortMode}
                    onChange={(event) =>
                      setSortMode(event.target.value as 'alphabetical' | 'allocation' | 'gainLoss')
                    }
                    style={{
                      borderRadius: 8,
                      border: '1px solid rgba(186, 230, 253, 0.28)',
                      background: 'rgba(10, 26, 38, 0.42)',
                      color: '#d9f0fb',
                      padding: '4px 8px',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  >
                    <option value="alphabetical">alphabetical</option>
                    <option value="allocation">% allocated</option>
                    <option value="gainLoss">g/l</option>
                  </select>
                </label>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {sortedHoldings.map(({ position, originalIndex }) => (
                  <article
                    key={`${position.symbol}-${originalIndex}`}
                    onMouseEnter={() => setHoveredSliceIndex(originalIndex)}
                    onMouseLeave={() => setHoveredSliceIndex(null)}
                    onClick={() =>
                      setSelectedSliceIndex((prev) => (prev === originalIndex ? null : originalIndex))
                    }
                    style={{
                      border:
                        activeSliceIndex === originalIndex
                          ? '1px solid rgba(125, 211, 252, 0.75)'
                          : '1px solid rgba(186, 230, 253, 0.18)',
                      borderRadius: 10,
                      background:
                        activeSliceIndex === originalIndex
                          ? 'rgba(18, 46, 68, 0.6)'
                          : 'rgba(10, 26, 38, 0.32)',
                      padding: '10px 12px',
                      display: 'grid',
                      gap: 3,
                      cursor: 'pointer',
                      boxShadow:
                        activeSliceIndex === originalIndex
                          ? `0 0 0 1px ${PIE_COLORS[originalIndex % PIE_COLORS.length]}66, 0 0 14px ${PIE_COLORS[originalIndex % PIE_COLORS.length]}55`
                          : 'none',
                      transition: 'border-color 120ms ease, box-shadow 120ms ease, background 120ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          aria-hidden
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: PIE_COLORS[originalIndex % PIE_COLORS.length],
                            boxShadow: `0 0 0 2px ${PIE_COLORS[originalIndex % PIE_COLORS.length]}22`,
                          }}
                        />
                        <strong style={{ color: '#e5f5f3', fontSize: 15 }}>{position.symbol}</strong>
                      </div>
                      <span style={{ color: '#93c5fd', fontSize: 14 }}>{position.percent.toFixed(2)}%</span>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 13 }}>{position.name}</div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: 8,
                      }}
                    >
                      <div style={{ color: '#cde6f4', fontSize: 14, fontWeight: 600 }}>
                        {formatMoney(position.value)}
                        {position.totalGainLossDollar !== null && (
                          <span
                            style={{
                              color: position.totalGainLossDollar >= 0 ? '#4ade80' : '#f87171',
                              fontWeight: 500,
                              fontSize: 12,
                            }}
                          >
                            {' • '}
                            {formatSignedMoney(position.totalGainLossDollar)}
                            {position.totalGainLossPercent !== null
                              ? ` (${position.totalGainLossPercent >= 0 ? '+' : ''}${position.totalGainLossPercent.toFixed(2)}%)`
                              : ''}
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#9fb9c8', fontSize: 12 }}>
                        {position.quantity !== null ? `${position.quantity} shares` : ''}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
