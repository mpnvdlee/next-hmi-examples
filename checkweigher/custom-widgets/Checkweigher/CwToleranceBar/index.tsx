/* @jsxRuntime classic */
export const schema = {
  title: { type: 'string' as const, label: 'Title', defaultValue: 'TOLERANCE', group: 'Content' },
  value: { type: ['float', 'integer'] as const, label: 'Deviation (g)', group: 'Data' },
  hasValue: { type: 'boolean' as const, label: 'Has value', defaultValue: true, group: 'Data' },
  lower: { type: ['float', 'integer'] as const, label: 'Lower limit (g)', defaultValue: -30, group: 'Data' },
  upper: { type: ['float', 'integer'] as const, label: 'Upper limit (g)', defaultValue: 30, group: 'Data' },
  band: { type: ['float', 'integer'] as const, label: 'Near-limit band (g)', defaultValue: 10, group: 'Data' },
  span: {
    type: 'integer' as const,
    label: 'Scale span (g)',
    description: 'The bar runs from −span to +span.',
    defaultValue: 60,
    group: 'Data',
  },
};

export const displayName = 'CW Tolerance Bar';
export const description = 'Reject / near-limit / OK zones around the target with a marker for the last deviation.';
export const icon = { type: 'builtin', name: 'ruler' } as const;

function sgn(v: number): string {
  const r = Math.round(v);
  return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r);
}

export default function CwToleranceBar({ properties, layout }: HmiWidgetProps) {
  const title = usePropString(properties, 'title', 'TOLERANCE');
  const value = usePropNumber(properties, 'value', 0);
  const hasValue = usePropBoolean(properties, 'hasValue', true);
  const lower = usePropNumber(properties, 'lower', -30);
  const upper = usePropNumber(properties, 'upper', 30);
  const band = usePropNumber(properties, 'band', 10);
  const span = Math.max(1, usePropNumber(properties, 'span', 60));

  const pos = (v: number) => ((Math.max(-span, Math.min(span, v)) + span) / (2 * span)) * 100;
  const zones = [
    { w: pos(lower), c: 'fault' },
    { w: pos(lower + band) - pos(lower), c: 'warn' },
    { w: pos(upper - band) - pos(lower + band), c: 'ok' },
    { w: pos(upper) - pos(upper - band), c: 'warn' },
    { w: 100 - pos(upper), c: 'fault' },
  ];
  const labels = [
    { text: '−' + span, left: 0, cls: 'start' },
    { text: sgn(lower), left: pos(lower), cls: 'mid' },
    { text: '0', left: 50, cls: 'mid' },
    { text: sgn(upper), left: pos(upper), cls: 'mid' },
    { text: '+' + span + ' g', left: 100, cls: 'end' },
  ];

  return (
    <div className="hmi-component cw-tol" style={selfLayoutStyle(layout)}>
      <div className="cw-tol__head">
        <div className="cw-tol__title">{title}</div>
        <div className="cw-tol__range">
          {sgn(lower)} / {sgn(upper)} g · band {band} g
        </div>
      </div>
      <div className="cw-tol__bar">
        <div className="cw-tol__zones">
          {zones.map((z, i) => (
            <div
              key={i}
              className={`cw-tol__zone cw-tol__zone--${z.c}`}
              style={{ '--cw-w': `${Math.max(0, z.w)}%` }}
            />
          ))}
        </div>
        <div className="cw-tol__marker" style={{ '--cw-left': `${hasValue ? pos(value) : 50}%` }} />
      </div>
      <div className="cw-tol__labels">
        {labels.map((l, i) => (
          <span key={i} className={`cw-tol__label cw-tol__label--${l.cls}`} style={{ '--cw-left': `${l.left}%` }}>
            {l.text}
          </span>
        ))}
      </div>
    </div>
  );
}
