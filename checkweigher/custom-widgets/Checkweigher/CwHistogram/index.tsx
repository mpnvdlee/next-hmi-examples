/* @jsxRuntime classic */
export const schema = {
  title: { type: 'string' as const, label: 'Title', defaultValue: 'DISTRIBUTION', group: 'Content' },
  counts: {
    type: 'integer[]' as const,
    label: 'Bin counts',
    description: 'Twelve 10 g bins from −60 g to +60 g.',
    group: 'Data',
  },
  lower: { type: ['float', 'integer'] as const, label: 'Lower limit (g)', defaultValue: -30, group: 'Data' },
  upper: { type: ['float', 'integer'] as const, label: 'Upper limit (g)', defaultValue: 30, group: 'Data' },
  band: { type: ['float', 'integer'] as const, label: 'Near-limit band (g)', defaultValue: 10, group: 'Data' },
};

export const displayName = 'CW Histogram';
export const description = 'Weight-deviation distribution, each bin coloured by the zone it falls in.';
export const icon = { type: 'builtin', name: 'chart-bar' } as const;

const H = 114;

export default function CwHistogram({ properties, layout }: HmiWidgetProps) {
  const title = usePropString(properties, 'title', 'DISTRIBUTION');
  const raw = usePropVar(properties, 'counts');
  const lower = usePropNumber(properties, 'lower', -30);
  const upper = usePropNumber(properties, 'upper', 30);
  const band = usePropNumber(properties, 'band', 10);

  const counts = Array.isArray(raw) ? raw.map((x) => (typeof x === 'number' ? x : Number(x) || 0)) : [];
  while (counts.length < 12) counts.push(0);
  const max = Math.max(1, ...counts);
  const total = counts.reduce((a, b) => a + b, 0);
  const tone = (dev: number) => {
    if (dev < lower || dev > upper) return 'fault';
    if (dev < lower + band || dev > upper - band) return 'warn';
    return 'ok';
  };

  return (
    <div className="hmi-component cw-hist" style={selfLayoutStyle(layout)}>
      <div className="cw-hist__head">
        <div className="cw-hist__title">{title}</div>
        <div className="cw-hist__n">{total.toLocaleString('en-US')} cases</div>
      </div>
      <div className="cw-hist__plot">
        {counts.slice(0, 12).map((v, i) => (
          <div
            key={i}
            className={`cw-hist__bar cw-hist__bar--${tone(-55 + i * 10)}`}
            style={{ '--cw-h': `${v ? Math.max(3, (v / max) * H) : 0}px` }}
          />
        ))}
      </div>
      <div className="cw-hist__x">
        <span>{'−'}60 g</span>
        <span>0</span>
        <span>+60 g</span>
      </div>
    </div>
  );
}
