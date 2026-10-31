/* @jsxRuntime classic */
export const schema = {
  title: { type: 'string' as const, label: 'Title', defaultValue: 'REJECT RATE', group: 'Content' },
  values: { type: 'float[]' as const, label: 'Reject rate (%)', group: 'Data' },
  warnAt: { type: 'float' as const, label: 'Amber from (%)', defaultValue: 2, group: 'Data' },
  faultAt: { type: 'float' as const, label: 'Red from (%)', defaultValue: 5, group: 'Data' },
  minScale: { type: 'float' as const, label: 'Minimum scale (%)', defaultValue: 5, group: 'Data' },
  xStart: { type: 'string' as const, label: 'X label start', defaultValue: '−20 cases', group: 'Axis' },
  xMid: { type: 'string' as const, label: 'X label middle', defaultValue: '−10', group: 'Axis' },
  xEnd: { type: 'string' as const, label: 'X label end', defaultValue: 'Latest', group: 'Axis' },
};

export const displayName = 'CW Rate Bars';
export const description = 'Reject-rate bars scaled to the data, green / amber / red by threshold.';
export const icon = { type: 'builtin', name: 'chart-bar' } as const;

export default function CwRateBars({ properties, layout }: HmiWidgetProps) {
  const title = usePropString(properties, 'title', 'REJECT RATE');
  const raw = usePropVar(properties, 'values');
  const warnAt = usePropNumber(properties, 'warnAt', 2);
  const faultAt = usePropNumber(properties, 'faultAt', 5);
  const minScale = usePropNumber(properties, 'minScale', 5);
  const xStart = usePropString(properties, 'xStart', '−20 cases');
  const xMid = usePropString(properties, 'xMid', '−10');
  const xEnd = usePropString(properties, 'xEnd', 'Latest');

  const values = Array.isArray(raw) ? raw.map((x) => (typeof x === 'number' ? x : Number(x) || 0)) : [];
  const scale = Math.max(minScale, ...values, 0);

  return (
    <div className="hmi-component cw-rate" style={selfLayoutStyle(layout)}>
      <div className="cw-rate__head">
        <div className="cw-rate__title">{title}</div>
        <div className="cw-rate__scale">Scale 0–{Math.round(scale)} %</div>
      </div>
      <div className="cw-rate__plot">
        {values.map((v, i) => (
          <div
            key={i}
            className={`cw-rate__bar cw-rate__bar--${v >= faultAt ? 'fault' : v >= warnAt ? 'warn' : 'ok'}`}
            style={{ '--cw-h': `${v > 0 ? Math.max(3, (v / scale) * 100) : 0}%` }}
          />
        ))}
      </div>
      <div className="cw-rate__x">
        <span>{xStart}</span>
        <span>{xMid}</span>
        <span>{xEnd}</span>
      </div>
    </div>
  );
}
