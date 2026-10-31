/* @jsxRuntime classic */
export const schema = {
  title: { type: 'string' as const, label: 'Title', defaultValue: 'DEVIATION TREND · LAST 20', group: 'Content' },
  deviations: { type: 'float[]' as const, label: 'Deviations (g)', group: 'Data' },
  results: {
    type: 'integer[]' as const,
    label: 'Results',
    description: '0 correct · 1/2 near lower/upper limit · 3/4 too low/high — colours each bar.',
    group: 'Data',
  },
  lower: { type: ['float', 'integer'] as const, label: 'Lower limit (g)', defaultValue: -30, group: 'Data' },
  upper: { type: ['float', 'integer'] as const, label: 'Upper limit (g)', defaultValue: 30, group: 'Data' },
  span: { type: 'integer' as const, label: 'Scale span (g)', defaultValue: 60, group: 'Data' },
  count: { type: 'integer' as const, label: 'Bars', defaultValue: 20, group: 'Data' },
};

export const displayName = 'CW Deviation Bars';
export const description = 'Per-case deviation bars around zero with dashed reject limits.';
export const icon = { type: 'builtin', name: 'chart-bar' } as const;

const H = 114;

function sgn(v: number): string {
  const r = Math.round(v);
  return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r);
}

function toNumbers(v: unknown): number[] {
  return Array.isArray(v) ? v.map((x) => (typeof x === 'number' ? x : Number(x) || 0)) : [];
}

export default function CwDevBars({ properties, layout }: HmiWidgetProps) {
  const title = usePropString(properties, 'title', 'DEVIATION TREND · LAST 20');
  const devs = toNumbers(usePropVar(properties, 'deviations'));
  const res = toNumbers(usePropVar(properties, 'results'));
  const lower = usePropNumber(properties, 'lower', -30);
  const upper = usePropNumber(properties, 'upper', 30);
  const span = Math.max(1, usePropNumber(properties, 'span', 60));
  const count = Math.max(1, usePropNumber(properties, 'count', 20));

  const half = H / 2;
  const scl = half / span;
  const recent = devs.slice(-count);
  const recentRes = res.slice(-count);
  const bars: { top: number; h: number; tone: string }[] = recent.map((d, i) => {
    const v = Math.max(-span, Math.min(span, d));
    const h = Math.max(2, Math.abs(v) * scl);
    const r = recentRes[i] ?? 0;
    return { top: v >= 0 ? half - h : half, h, tone: r >= 3 ? 'fault' : r >= 1 ? 'warn' : 'ok' };
  });
  while (bars.length < count) bars.unshift({ top: half, h: 0, tone: 'none' });
  const yU = half - Math.min(span, upper) * scl;
  const yL = half - Math.max(-span, lower) * scl;

  return (
    <div className="hmi-component cw-devbars" style={selfLayoutStyle(layout)}>
      <div className="cw-chart__head">
        <div className="cw-chart__title">{title}</div>
        <div className="cw-chart__legend">
          <span className="cw-chart__key cw-chart__key--limit" />
          limits
        </div>
      </div>
      <div className="cw-devbars__plot">
        <div className="cw-devbars__zero" />
        <div className="cw-devbars__limit" style={{ '--cw-y': `${yU}px` }} />
        <div className="cw-devbars__limit" style={{ '--cw-y': `${yL}px` }} />
        <span className="cw-devbars__ylab" style={{ '--cw-y': `${yU - 18}px` }}>{sgn(upper)}</span>
        <span className="cw-devbars__ylab" style={{ '--cw-y': `${half - 8}px` }}>0</span>
        <span className="cw-devbars__ylab" style={{ '--cw-y': `${yL + 2}px` }}>{sgn(lower)}</span>
        <div className="cw-devbars__bars">
          {bars.map((b, i) => (
            <div key={i} className="cw-devbars__slot">
              <div
                className={`cw-devbars__bar cw-tone--${b.tone}`}
                style={{ '--cw-y': `${b.top}px`, '--cw-h': `${b.h}px` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="cw-chart__xlabels cw-devbars__x">
        <span>{'−' + count} cases</span>
        <span>{'−' + Math.round(count / 2)}</span>
        <span>Latest</span>
      </div>
    </div>
  );
}
