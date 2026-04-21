function Sparkline({ data, color = '#00F0A0', w = 90, h = 28 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v,i) => [i*step, h - ((v-min)/range)*h*0.85 - 2]);
  const line = pts.map(([x,y],i)=>(i?'L':'M')+x.toFixed(1)+','+y.toFixed(1)).join(' ');
  const area = line + ` L${w},${h} L0,${h} Z`;
  const gid = 'spark-'+Math.random().toString(36).slice(2,7);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow:'visible'}}>
      <defs><linearGradient id={gid} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.35"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <path d={area} fill={`url(#${gid})`}/>
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{filter:`drop-shadow(0 0 4px ${color}88)`}}/>
    </svg>
  );
}

function PulseCard({ account, masked, balance, change, spark, accent = '#00F0A0', expanded, onPress }) {
  const up = change >= 0;
  const color = up ? '#00F0A0' : '#FF3B30';
  return (
    <button onClick={onPress} style={{textAlign:'left',cursor:'pointer',width:'100%',padding:20,borderRadius:24,background:'rgba(255,255,255,0.05)',backdropFilter:'blur(20px) saturate(180%)',WebkitBackdropFilter:'blur(20px) saturate(180%)',border:`1px solid ${expanded?'rgba(0,240,160,0.22)':'rgba(255,255,255,0.08)'}`,boxShadow: expanded ? '0 0 40px rgba(0,240,160,0.2),inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.4)',transition:'all 320ms cubic-bezier(0.16,1,0.3,1)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:9,background:`${color}22`,color,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${color}33`}}><Ico name="wallet" size={15}/></div>
          <div><div style={{fontSize:13,fontWeight:500,color:'#E5E5EA'}}>{account}</div><div style={{fontSize:10,fontFamily:'JetBrains Mono',color:'#6D6D72',letterSpacing:'0.1em'}}>{masked}</div></div>
        </div>
        <Ico name="more" size={16}/>
      </div>
      <div style={{fontSize:32,fontWeight:600,letterSpacing:'-0.03em',color:'#F5F5F7',fontVariantNumeric:'tabular-nums'}}>${balance.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).split('.')[0]}<span style={{color:'#8E8E93'}}>.{balance.toFixed(2).split('.')[1]}</span></div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8}}>
        <span style={{display:'inline-flex',alignItems:'center',gap:4,color,fontSize:12,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{up?'↑':'↓'} {Math.abs(change).toFixed(2)}%<span style={{color:'#8E8E93',fontWeight:500,marginLeft:4}}>7d</span></span>
        <Sparkline data={spark} color={color} w={100} h={28}/>
      </div>
      {expanded && <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:10}}>
        {['Transfer','Pay','Save'].map(a => <span key={a} style={{flex:1,textAlign:'center',padding:'8px 0',borderRadius:10,background:'rgba(255,255,255,0.04)',color:'#E5E5EA',fontSize:12,fontWeight:500}}>{a}</span>)}
      </div>}
    </button>
  );
}

window.PulseCard = PulseCard; window.Sparkline = Sparkline;
