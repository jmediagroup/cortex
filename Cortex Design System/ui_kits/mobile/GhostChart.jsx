function GhostChart({ w = 320, h = 140 }) {
  // Historical (solid) + Predicted (dotted ghost line)
  const hist = [42,48,45,58,55,64,62,72,78,84];
  const pred = [84,88,86,94,102,98,108,118,124];
  const all = [...hist, ...pred];
  const min = Math.min(...all), max = Math.max(...all);
  const range = max - min || 1;
  const totalPts = all.length;
  const step = w / (totalPts - 1);
  const mapY = v => h - 20 - ((v-min)/range)*(h - 40);
  const histPts = hist.map((v,i)=>[i*step, mapY(v)]);
  const predPts = pred.map((v,i)=>[(hist.length-1+i)*step, mapY(v)]);
  const toPath = pts => pts.map(([x,y],i)=>(i?'L':'M')+x.toFixed(1)+','+y.toFixed(1)).join(' ');
  const areaD = toPath(histPts) + ` L${histPts[histPts.length-1][0]},${h} L0,${h} Z`;
  const splitX = histPts[histPts.length-1][0];
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{overflow:'visible'}}>
      <defs>
        <linearGradient id="ghA" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#00F0A0" stopOpacity="0.3"/><stop offset="100%" stopColor="#00F0A0" stopOpacity="0"/></linearGradient>
        <linearGradient id="ghB" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#5AC8FA" stopOpacity="0.12"/><stop offset="100%" stopColor="#5AC8FA" stopOpacity="0"/></linearGradient>
      </defs>
      {/* horizontal gridlines */}
      {[0.25,0.5,0.75].map((f,i)=><line key={i} x1="0" x2={w} y1={h*f} y2={h*f} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
      {/* future zone */}
      <rect x={splitX} y="0" width={w-splitX} height={h} fill="url(#ghB)"/>
      <line x1={splitX} x2={splitX} y1="0" y2={h} stroke="rgba(90,200,250,0.3)" strokeWidth="1" strokeDasharray="2 3"/>
      <text x={splitX+6} y="14" fill="#5AC8FA" fontSize="9" fontWeight="600" fontFamily="Inter" style={{letterSpacing:'0.12em',textTransform:'uppercase'}}>Forecast</text>
      {/* historical */}
      <path d={areaD} fill="url(#ghA)"/>
      <path d={toPath(histPts)} fill="none" stroke="#00F0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{filter:'drop-shadow(0 0 6px rgba(0,240,160,0.5))'}}/>
      {/* predicted ghost */}
      <path d={toPath(predPts)} fill="none" stroke="#5AC8FA" strokeWidth="1.75" strokeLinecap="round" strokeDasharray="3 4" style={{filter:'drop-shadow(0 0 4px rgba(90,200,250,0.5))'}}/>
      {/* current point */}
      <circle cx={histPts[histPts.length-1][0]} cy={histPts[histPts.length-1][1]} r="4" fill="#00F0A0" style={{filter:'drop-shadow(0 0 8px rgba(0,240,160,0.9))'}}/>
      <circle cx={histPts[histPts.length-1][0]} cy={histPts[histPts.length-1][1]} r="8" fill="none" stroke="#00F0A0" strokeOpacity="0.5"/>
    </svg>
  );
}

window.GhostChart = GhostChart;
