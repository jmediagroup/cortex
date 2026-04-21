function SmartAmount({ label, value, onChange, mode = 'neutral' }) {
  // mode: 'save' (emerald), 'debt' (crimson), 'neutral'
  const color = mode==='save' ? '#00F0A0' : mode==='debt' ? '#FF3B30' : '#8E8E93';
  const glow = mode==='save' ? '0 0 0 4px rgba(0,240,160,0.08), 0 0 32px rgba(0,240,160,0.16)' : mode==='debt' ? '0 0 0 4px rgba(255,59,48,0.08), 0 0 24px rgba(255,59,48,0.16)' : 'none';
  return (
    <div>
      <label style={{display:'block',fontSize:11,fontWeight:600,color,marginBottom:10,textTransform:'uppercase',letterSpacing:'0.12em',transition:'color 200ms'}}>{label}</label>
      <div style={{position:'relative'}}>
        <span style={{position:'absolute',left:18,top:'50%',transform:'translateY(-50%)',color,fontSize:28,fontFamily:'JetBrains Mono',fontWeight:500,transition:'color 200ms'}}>$</span>
        <input value={value} onChange={e=>onChange(e.target.value)} style={{width:'100%',padding:'22px 16px 22px 42px',border:`1px solid ${mode==='neutral'?'rgba(255,255,255,0.1)':color+'55'}`,borderRadius:18,fontSize:32,fontFamily:'JetBrains Mono',fontWeight:500,color:'#F5F5F7',background: mode==='neutral'?'rgba(255,255,255,0.04)':`${color}0A`,outline:'none',boxShadow:glow,transition:'all 240ms cubic-bezier(0.16,1,0.3,1)',letterSpacing:'-0.02em',fontVariantNumeric:'tabular-nums'}}/>
      </div>
    </div>
  );
}

function Numpad({ onKey }) {
  const keys = ['1','2','3','4','5','6','7','8','9','000','0','⌫'];
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginTop:12}}>
      {keys.map(k => (
        <button key={k} onClick={()=>onKey(k)} style={{padding:'18px 0',borderRadius:14,border:'1px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.03)',color:'#F5F5F7',fontSize:22,fontWeight:500,fontFamily:'JetBrains Mono',cursor:'pointer'}}>{k}</button>
      ))}
    </div>
  );
}

window.SmartAmount = SmartAmount; window.Numpad = Numpad;
