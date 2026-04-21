function Sankey({ w = 340, h = 180 }) {
  // Left: Income (single node). Right: Needs / Wants / Investments.
  const total = 5200;
  const flows = [
    {label:'Needs', value:2600, color:'#5AC8FA', y: 18},
    {label:'Wants', value:1300, color:'#BF5AF2', y: 70},
    {label:'Investments', value:1300, color:'#00F0A0', y: 118},
  ];
  const leftX = 10, leftW = 14, rightX = w - 24, rightW = 14;
  const leftY = 20, leftH = h - 40;
  let y = leftY;
  return (
    <div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          {flows.map((f,i)=>(<linearGradient key={i} id={`sk-${i}`} x1="0" x2="1"><stop offset="0%" stopColor="#F5F5F7" stopOpacity="0.25"/><stop offset="100%" stopColor={f.color} stopOpacity="0.45"/></linearGradient>))}
        </defs>
        {/* income node */}
        <rect x={leftX} y={leftY} width={leftW} height={leftH} rx="3" fill="#F5F5F7" opacity="0.85"/>
        {flows.map((f,i) => {
          const frac = f.value/total;
          const thick = frac * leftH;
          const y0 = y; y += thick;
          const y1 = f.y;
          const h1 = (f.value/total) * leftH * 1.05;
          const x0 = leftX + leftW, x1 = rightX;
          const midX = (x0+x1)/2;
          const path = `M${x0},${y0} C${midX},${y0} ${midX},${y1} ${x1},${y1} L${x1},${y1+h1} C${midX},${y1+h1} ${midX},${y0+thick} ${x0},${y0+thick} Z`;
          return (
            <g key={i}>
              <path d={path} fill={`url(#sk-${i})`}/>
              <rect x={rightX} y={y1} width={rightW} height={h1} rx="3" fill={f.color} opacity="0.9" style={{filter:`drop-shadow(0 0 6px ${f.color}88)`}}/>
              <text x={rightX-8} y={y1+h1/2+3} textAnchor="end" fill="#F5F5F7" fontSize="11" fontWeight="600" fontFamily="Inter">{f.label}</text>
              <text x={rightX-8} y={y1+h1/2+18} textAnchor="end" fill="#8E8E93" fontSize="10" fontFamily="JetBrains Mono">${(f.value/1000).toFixed(1)}k</text>
            </g>
          );
        })}
        <text x={leftX-4} y={leftY-6} fill="#8E8E93" fontSize="10" fontWeight="600" fontFamily="Inter" textAnchor="start" style={{letterSpacing:'0.12em',textTransform:'uppercase'}}>Income</text>
        <text x={leftX+leftW/2} y={leftY+leftH+14} fill="#F5F5F7" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono" textAnchor="middle">$5.2k</text>
      </svg>
    </div>
  );
}

window.Sankey = Sankey;
