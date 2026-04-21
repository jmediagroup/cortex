function SafeToSpend({ daily = 320, spent = 72, size = 200 }) {
  const remaining = daily - spent;
  const pct = Math.max(0, Math.min(1, remaining/daily));
  const under = pct > 0.1;
  const color = under ? '#00F0A0' : '#FF3B30';
  const r = size/2 - 14;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  return (
    <div style={{position:'relative',width:size,height:size,margin:'0 auto'}}>
      {under && <div style={{position:'absolute',inset:-8,borderRadius:'50%',background:`radial-gradient(circle, ${color}22, transparent 70%)`,animation:'orbitPulse 2.8s ease-in-out infinite',pointerEvents:'none'}}/>}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} style={{filter:`drop-shadow(0 0 12px ${color}99)`,transition:'stroke-dashoffset 520ms cubic-bezier(0.16,1,0.3,1)'}}/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
        <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.14em',color}}>{under?'Safe to spend':'Over budget'}</div>
        <div style={{fontSize:40,fontWeight:600,letterSpacing:'-0.03em',color:'#F5F5F7',fontVariantNumeric:'tabular-nums'}}>${Math.abs(remaining)}</div>
        <div style={{fontSize:12,color:'#8E8E93',fontFamily:'JetBrains Mono'}}>of ${daily} today</div>
      </div>
      <style>{`@keyframes orbitPulse{0%,100%{transform:scale(1);opacity:0.7}50%{transform:scale(1.06);opacity:1}}`}</style>
    </div>
  );
}

window.SafeToSpend = SafeToSpend;
