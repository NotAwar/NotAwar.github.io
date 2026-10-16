// Spin and pulse are CSS keyframes (global.css), so no animation runtime ships
const TICK_COUNT = 48;
const CENTER = 110;

export default function RadarRing({ size = 200 }) {
  const ticks = Array.from({ length: TICK_COUNT });

  return (
    <svg
      className="radar-ring"
      viewBox="0 0 220 220"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <g className="radar-ticks">
        {ticks.map((_, i) => (
          <line
            key={i}
            className="radar-tick"
            x1={CENTER}
            y1="4"
            x2={CENTER}
            y2="12"
            transform={`rotate(${(360 / TICK_COUNT) * i} ${CENTER} ${CENTER})`}
          />
        ))}
      </g>
      <g className="radar-arc radar-arc-1">
        <circle cx={CENTER} cy={CENTER} r="98" pathLength="100" strokeDasharray="22 78" />
        <circle className="radar-node" cx={CENTER} cy="12" r="3" />
      </g>
      <g className="radar-arc radar-arc-2">
        <circle cx={CENTER} cy={CENTER} r="84" pathLength="100" strokeDasharray="16 84" />
        <circle className="radar-node radar-node-alt" cx={CENTER} cy="26" r="2.5" />
      </g>
      <circle className="radar-core" cx={CENTER} cy={CENTER} r="7" />
    </svg>
  );
}
