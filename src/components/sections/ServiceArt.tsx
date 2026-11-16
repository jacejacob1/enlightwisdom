"use client";

import type { ServiceIcon } from "@/lib/content";

/** Small animated scenes, one per service. Pure SVG so they cost almost nothing. */
export default function ServiceArt({ icon }: { icon: ServiceIcon }) {
  const common = { viewBox: "0 0 320 200", className: "h-full w-full", "aria-hidden": true } as const;
  const defs = (
    <defs>
      <linearGradient id="sa-g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#ffc04a" />
        <stop offset="1" stopColor="#d0570f" />
      </linearGradient>
      <filter id="sa-glow">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );

  switch (icon) {
    case "arm":
      return (
        <svg {...common}>
          {defs}
          <rect x="20" y="170" width="280" height="10" rx="5" fill="#2b2520" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} y="146" width="26" height="24" rx="4" fill="url(#sa-g)">
              <animate attributeName="x" from="-30" to="320" dur="5s" begin={`${i * 1.25}s`} repeatCount="indefinite" />
            </rect>
          ))}
          <g transform="translate(160 150)">
            <rect x="-22" y="12" width="44" height="10" rx="3" fill="#3a3128" />
            <g>
              <animateTransform attributeName="transform" type="rotate" values="-35 0 10;35 0 10;-35 0 10" dur="2.5s" repeatCount="indefinite" />
              <rect x="-7" y="-60" width="14" height="72" rx="7" fill="#f4ede4" />
              <circle cx="0" cy="10" r="10" fill="#f28c0f" />
              <g transform="translate(0 -60)">
                <animateTransform attributeName="transform" type="rotate" additive="sum" values="30;-40;30" dur="2.5s" repeatCount="indefinite" />
                <circle r="8" fill="#f28c0f" />
                <rect x="-5" y="-50" width="10" height="50" rx="5" fill="#f4ede4" />
                <path d="M-8 -52 l-7 -12 M8 -52 l7 -12" stroke="#ffb22e" strokeWidth="5" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </svg>
      );
    case "brain":
      return (
        <svg {...common}>
          {defs}
          {[0, 1, 2].map((col) =>
            [0, 1, 2, 3].slice(0, col === 1 ? 4 : 3).map((row) => {
              const x = 70 + col * 90;
              const y = (col === 1 ? 40 : 55) + row * 40;
              return (
                <g key={`${col}-${row}`}>
                  {col < 2 &&
                    [0, 1, 2, 3].slice(0, col === 0 ? 4 : 3).map((r2) => (
                      <line key={r2} x1={x} y1={y} x2={x + 90} y2={(col === 0 ? 40 : 55) + r2 * 40} stroke="#ffb22e" strokeOpacity="0.25" strokeWidth="1.5">
                        <animate attributeName="stroke-opacity" values="0.1;0.8;0.1" dur="2s" begin={`${(row + r2) * 0.25}s`} repeatCount="indefinite" />
                      </line>
                    ))}
                  <circle cx={x} cy={y} r="10" fill="#1c1712" stroke="url(#sa-g)" strokeWidth="3">
                    <animate attributeName="r" values="9;12;9" dur="2s" begin={`${row * 0.3 + col * 0.5}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })
          )}
          <text x="160" y="190" textAnchor="middle" fill="#ffb22e" fontFamily="monospace" fontSize="12">
            prediction: 0.97
          </text>
        </svg>
      );
    case "bot":
      return (
        <svg {...common}>
          {defs}
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${30 + i * 95} 40)`}>
              <rect width="76" height="96" rx="8" fill="#f4ede4" opacity="0.92" />
              {[0, 1, 2, 3, 4].map((l) => (
                <rect key={l} x="10" y={14 + l * 15} height="5" rx="2" fill="#a8977f" width={l % 2 ? 40 : 56} />
              ))}
              <circle cx="60" cy="82" r="10" fill="#1c1712">
                <animate attributeName="fill" values="#1c1712;#f28c0f;#f28c0f" dur="3s" begin={`${i * 1}s`} repeatCount="indefinite" />
              </circle>
              <path d="M55 82 l4 4 l7 -8" stroke="#1c1712" strokeWidth="3" fill="none" />
            </g>
          ))}
          <g filter="url(#sa-glow)">
            <circle r="9" fill="url(#sa-g)" cy="160">
              <animate attributeName="cx" values="68;163;258;68" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>
          <text x="160" y="190" textAnchor="middle" fill="#ffb22e" fontFamily="monospace" fontSize="12">
            reconciled · reported · done
          </text>
        </svg>
      );
    case "chip":
      return (
        <svg {...common}>
          {defs}
          <rect x="120" y="60" width="80" height="80" rx="10" fill="#1c1712" stroke="url(#sa-g)" strokeWidth="3" />
          <rect x="142" y="82" width="36" height="36" rx="4" fill="url(#sa-g)" />
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i} stroke="#c8622a" strokeWidth="3">
              <line x1={132 + i * 14} y1="60" x2={132 + i * 14} y2="44" />
              <line x1={132 + i * 14} y1="140" x2={132 + i * 14} y2="156" />
              <line x1="120" y1={72 + i * 14} x2="104" y2={72 + i * 14} />
              <line x1="200" y1={72 + i * 14} x2="216" y2={72 + i * 14} />
            </g>
          ))}
          {[
            [40, 40],
            [280, 50],
            [50, 165],
            [270, 160],
          ].map(([x, y], i) => (
            <g key={i}>
              <path d={`M160 100 L${x} ${y}`} stroke="#ffb22e" strokeOpacity="0.3" strokeDasharray="4 6">
                <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
              </path>
              <circle cx={x} cy={y} r="12" fill="#2b2520" stroke="#ffb22e" strokeWidth="2" />
              <circle cx={x} cy={y} r="4" fill="#ffb22e">
                <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          {defs}
          <rect x="30" y="30" width="190" height="140" rx="10" fill="#1c1712" stroke="#3a3128" strokeWidth="2" />
          <circle cx="46" cy="44" r="4" fill="#d0570f" />
          <circle cx="58" cy="44" r="4" fill="#f28c0f" />
          <circle cx="70" cy="44" r="4" fill="#ffb22e" />
          {[0, 1, 2, 3, 4, 5].map((l) => (
            <rect key={l} x={46 + (l % 3) * 12} y={62 + l * 16} height="7" rx="3" fill={l % 2 ? "#a8977f" : "url(#sa-g)"} width="0">
              <animate attributeName="width" values={`0;${60 + ((l * 37) % 80)};${60 + ((l * 37) % 80)};0`} keyTimes="0;0.3;0.9;1" dur="4s" begin={`${l * 0.25}s`} repeatCount="indefinite" />
            </rect>
          ))}
          <rect x="236" y="46" width="58" height="112" rx="12" fill="#f4ede4" />
          <rect x="242" y="58" width="46" height="80" rx="4" fill="#1c1712" />
          <rect x="248" y="66" width="34" height="20" rx="3" fill="url(#sa-g)">
            <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" />
          </rect>
          <rect x="248" y="92" width="24" height="5" rx="2" fill="#a8977f" />
          <rect x="248" y="102" width="30" height="5" rx="2" fill="#a8977f" />
        </svg>
      );
    case "aiot":
      return (
        <svg {...common}>
          {defs}
          <circle cx="160" cy="100" r="34" fill="#1c1712" stroke="url(#sa-g)" strokeWidth="3" />
          <text x="160" y="106" textAnchor="middle" fill="#ffb22e" fontFamily="monospace" fontWeight="700" fontSize="18">
            AI
          </text>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx="160" cy="100" r="34" fill="none" stroke="#ffb22e" strokeWidth="1.5">
              <animate attributeName="r" from="34" to="95" dur="3s" begin={`${i}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.7" to="0" dur="3s" begin={`${i}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            const x = 160 + Math.cos(a) * 110;
            const y = 100 + Math.sin(a) * 72;
            return (
              <g key={i}>
                <rect x={x - 12} y={y - 12} width="24" height="24" rx="6" fill="#2b2520" stroke="#c8622a" strokeWidth="2" />
                <circle cx={x} cy={y} r="4" fill="#ffb22e">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}
        </svg>
      );
    case "flow":
    default:
      return (
        <svg {...common}>
          {defs}
          {["Order", "Make", "Pack", "Ship"].map((t, i) => (
            <g key={t} transform={`translate(${22 + i * 74} 76)`}>
              <rect width="56" height="48" rx="10" fill="#1c1712" stroke="url(#sa-g)" strokeWidth="2" />
              <text x="28" y="29" textAnchor="middle" fill="#fff3e4" fontFamily="monospace" fontSize="11">
                {t}
              </text>
              {i < 3 && <path d="M58 24 h14" stroke="#ffb22e" strokeWidth="2" markerEnd="" />}
            </g>
          ))}
          <circle r="7" cy="100" fill="url(#sa-g)" filter="url(#sa-glow)">
            <animate attributeName="cx" values="50;124;198;272" dur="3s" repeatCount="indefinite" />
          </circle>
          <g transform="translate(160 160)">
            <animateTransform attributeName="transform" type="rotate" additive="sum" from="0" to="360" dur="8s" repeatCount="indefinite" />
          </g>
          <text x="160" y="170" textAnchor="middle" fill="#ffb22e" fontFamily="monospace" fontSize="12">
            factory floor → back office
          </text>
        </svg>
      );
  }
}
