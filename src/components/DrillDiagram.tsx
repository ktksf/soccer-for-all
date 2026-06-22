import type {
  DiagramArrow,
  DiagramElement,
  DrillDiagram as DrillDiagramData,
} from "@/types/session";

// SVG canvas size and how the 0–100 grid maps into it.
const W = 320;
const H = 220;
const PAD = 18;

function clamp(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, v));
}
const mapX = (x: unknown) => PAD + (clamp(x) / 100) * (W - 2 * PAD);
const mapY = (y: unknown) => PAD + (clamp(y) / 100) * (H - 2 * PAD);

/** Build a gentle wavy path (used for "dribble" arrows). */
function wavyPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const segs = Math.max(2, Math.round(len / 16));
  const amp = 3.5;
  let d = `M ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  for (let i = 1; i <= segs; i++) {
    const tMid = (i - 0.5) / segs;
    const tEnd = i / segs;
    const sign = i % 2 === 0 ? 1 : -1;
    const cx = x1 + dx * tMid + px * amp * sign;
    const cy = y1 + dy * tMid + py * amp * sign;
    const ex = x1 + dx * tEnd;
    const ey = y1 + dy * tEnd;
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  }
  return d;
}

function Arrow({ arrow, idx }: { arrow: DiagramArrow; idx: number }) {
  const x1 = mapX(arrow.from?.x);
  const y1 = mapY(arrow.from?.y);
  const x2 = mapX(arrow.to?.x);
  const y2 = mapY(arrow.to?.y);
  const isPass = arrow.kind === "pass";
  const isDribble = arrow.kind === "dribble";
  const color = isPass ? "#fbfdfb" : "#3fce7d";
  const marker = isPass ? "url(#dd-pass)" : "url(#dd-run)";

  if (isDribble) {
    return (
      <path
        d={wavyPath(x1, y1, x2, y2)}
        stroke={color}
        strokeWidth={2}
        fill="none"
        markerEnd={marker}
      />
    );
  }
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={2.2}
      strokeDasharray={isPass ? "6 5" : undefined}
      markerEnd={marker}
      data-idx={idx}
    />
  );
}

function Element({ el }: { el: DiagramElement }) {
  const cx = mapX(el.x);
  const cy = mapY(el.y);
  const label = (el.label ?? "").toString().slice(0, 3);

  switch (el.type) {
    case "cone":
      return <path d={`M${cx},${cy - 8} l7,12 l-14,0 Z`} fill="#f59e0b" />;
    case "ball":
      return <circle cx={cx} cy={cy} r={4} fill="#fbfdfb" stroke="#0b1220" strokeWidth={1.4} />;
    case "goal":
      return (
        <rect
          x={cx - 11}
          y={cy - 4}
          width={22}
          height={8}
          rx={1.5}
          fill="none"
          stroke="#fbfdfb"
          strokeWidth={2}
        />
      );
    case "defender":
      return (
        <g>
          <circle cx={cx} cy={cy} r={9} fill="#ef4444" />
          {label && (
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fbfdfb">
              {label}
            </text>
          )}
        </g>
      );
    case "player":
    default:
      return (
        <g>
          <circle cx={cx} cy={cy} r={9} fill="#fbfdfb" />
          {label && (
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0d4a2c">
              {label}
            </text>
          )}
        </g>
      );
  }
}

export default function DrillDiagram({ data }: { data?: DrillDiagramData }) {
  const elements = Array.isArray(data?.elements) ? data!.elements : [];
  const arrows = Array.isArray(data?.arrows) ? data!.arrows : [];
  if (elements.length === 0 && arrows.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full max-w-sm rounded-lg"
      role="img"
      aria-label="Drill setup diagram"
    >
      <defs>
        <marker id="dd-pass" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#fbfdfb" />
        </marker>
        <marker id="dd-run" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#3fce7d" />
        </marker>
      </defs>

      {/* Pitch */}
      <rect x={1} y={1} width={W - 2} height={H - 2} rx={8} fill="#0d4a2c" stroke="#3fce7d" strokeWidth={1.5} />
      {/* faint grid */}
      <g stroke="#17b35e" strokeOpacity={0.3} strokeWidth={1}>
        <line x1={W / 2} y1={4} x2={W / 2} y2={H - 4} />
        <line x1={4} y1={H / 2} x2={W - 4} y2={H / 2} />
      </g>

      {/* Arrows under pieces */}
      {arrows.map((a, i) => (
        <Arrow key={`a${i}`} arrow={a} idx={i} />
      ))}
      {/* Pieces */}
      {elements.map((el, i) => (
        <Element key={`e${i}`} el={el} />
      ))}
    </svg>
  );
}
