/* @jsxRuntime classic */
export const schema = {
  title: { type: 'string' as const, label: 'Title', defaultValue: 'DEVIATION · PER CASE', group: 'Content' },
  values: { type: 'float[]' as const, label: 'Deviations (g)', group: 'Data' },
  lower: { type: ['float', 'integer'] as const, label: 'Lower limit (g)', defaultValue: -30, group: 'Data' },
  upper: { type: ['float', 'integer'] as const, label: 'Upper limit (g)', defaultValue: 30, group: 'Data' },
  band: { type: ['float', 'integer'] as const, label: 'Near-limit band (g)', defaultValue: 10, group: 'Data' },
  span: {
    type: 'integer' as const,
    label: 'Scale span (g)',
    description: 'The plot runs from −span to +span.',
    defaultValue: 60,
    group: 'Data',
  },
};

export const displayName = 'CW Deviation Line';
export const description = 'Deviation line against dashed reject limits and dotted near-limit lines.';
export const icon = { type: 'builtin', name: 'chart-line' } as const;

function sgn(v: number): string {
  const r = Math.round(v);
  return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r);
}

export default function CwLineChart({ properties, layout }: HmiWidgetProps) {
  const title = usePropString(properties, 'title', 'DEVIATION · PER CASE');
  const raw = usePropVar(properties, 'values');
  const lower = usePropNumber(properties, 'lower', -30);
  const upper = usePropNumber(properties, 'upper', 30);
  const band = usePropNumber(properties, 'band', 10);
  const span = Math.max(1, usePropNumber(properties, 'span', 60));

  const values = Array.isArray(raw) ? raw.map((x) => (typeof x === 'number' ? x : Number(x) || 0)) : [];
  const yv = (v: number) => 60 - (Math.max(-span, Math.min(span, v)) / span) * 56;
  const pts = values
    .map((v, i) => `${(values.length > 1 ? (i / (values.length - 1)) * 600 : 0).toFixed(1)},${yv(v).toFixed(1)}`)
    .join(' ');

  return (
    <div className="hmi-component cw-line" style={selfLayoutStyle(layout)}>
      <div className="cw-line__head">
        <div className="cw-line__title">{title}</div>
        <div className="cw-line__legend">
          <span className="cw-line__legend-item">
            <span className="cw-line__key cw-line__key--series" />
            deviation
          </span>
          <span className="cw-line__legend-item">
            <span className="cw-line__key cw-line__key--limit" />
            limits
          </span>
          <span className="cw-line__legend-item">
            <span className="cw-line__key cw-line__key--band" />
            near limit
          </span>
        </div>
      </div>
      <div className="cw-line__body">
        <div className="cw-line__ylabels">
          <span style={{ '--cw-y': `${yv(upper) - 18}px` }}>{sgn(upper)}</span>
          <span style={{ '--cw-y': '52px' }}>0</span>
          <span style={{ '--cw-y': `${yv(lower) + 2}px` }}>{sgn(lower)}</span>
        </div>
        <div className="cw-line__plot">
          <svg className="cw-line__svg" width="100%" height="120" viewBox="0 0 600 120" preserveAspectRatio="none">
            <line className="cw-line__zero" x1="0" x2="600" y1="60" y2="60" vectorEffect="non-scaling-stroke" />
            <line className="cw-line__limit" x1="0" x2="600" y1={yv(upper)} y2={yv(upper)} vectorEffect="non-scaling-stroke" />
            <line className="cw-line__limit" x1="0" x2="600" y1={yv(lower)} y2={yv(lower)} vectorEffect="non-scaling-stroke" />
            <line className="cw-line__band" x1="0" x2="600" y1={yv(upper - band)} y2={yv(upper - band)} vectorEffect="non-scaling-stroke" />
            <line className="cw-line__band" x1="0" x2="600" y1={yv(lower + band)} y2={yv(lower + band)} vectorEffect="non-scaling-stroke" />
            {values.length > 0 && (
              <polyline className="cw-line__series" points={pts} fill="none" vectorEffect="non-scaling-stroke" />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
