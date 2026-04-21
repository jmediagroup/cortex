function StatusBar() {
  return (
    <div style={{height:44,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 22px',fontSize:15,fontWeight:600,color:'#F5F5F7'}}>
      <span style={{fontVariantNumeric:'tabular-nums'}}>9:41</span>
      <div style={{display:'flex',alignItems:'center',gap:5}}>
        <svg width="16" height="10" viewBox="0 0 16 10" fill="#F5F5F7"><path d="M1 7h2v2H1zM5 5h2v4H5zM9 3h2v6H9zM13 1h2v8h-2z"/></svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="#F5F5F7" strokeWidth="1.2"><path d="M1 3.5a6 6 0 0 1 12 0"/><path d="M3.5 5.5a3.5 3.5 0 0 1 7 0"/><circle cx="7" cy="8" r="0.8" fill="#F5F5F7"/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="21" height="10" rx="2.5" fill="none" stroke="#F5F5F7" strokeOpacity="0.4"/><rect x="2" y="2" width="18" height="7" rx="1.2" fill="#00F0A0"/><rect x="22" y="4" width="1.5" height="3" rx="0.5" fill="#F5F5F7" fillOpacity="0.4"/></svg>
      </div>
    </div>
  );
}

function TabBar({ active = 'home', onChange = () => {} }) {
  const tabs = [{k:'home',i:'home',l:'Home'},{k:'flows',i:'chart',l:'Flows'},{k:'add',i:'plus',l:''},{k:'vault',i:'vault',l:'Vault'},{k:'me',i:'user',l:'Profile'}];
  return (
    <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'10px 16px 28px',background:'rgba(10,14,20,0.75)',backdropFilter:'blur(24px) saturate(180%)',WebkitBackdropFilter:'blur(24px) saturate(180%)',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-around',alignItems:'center',gap:4}}>
      {tabs.map(t => t.k==='add' ? (
        <button key={t.k} onClick={()=>onChange(t.k)} style={{width:52,height:52,borderRadius:18,background:'linear-gradient(135deg,#00F0A0,#00C285)',color:'#06221A',border:0,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 24px rgba(0,240,160,0.4), 0 6px 16px rgba(0,0,0,0.3)',cursor:'pointer',marginTop:-18}}><Ico name="plus" size={26} stroke={2.5}/></button>
      ) : (
        <button key={t.k} onClick={()=>onChange(t.k)} style={{flex:1,background:'transparent',border:0,display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 0',color: active===t.k ? '#00F0A0' : '#8E8E93',cursor:'pointer'}}>
          <Ico name={t.i} size={22} stroke={active===t.k?2.25:2}/>
          <span style={{fontSize:10,fontWeight:500,letterSpacing:'0.02em'}}>{t.l}</span>
        </button>
      ))}
    </div>
  );
}

window.StatusBar = StatusBar; window.TabBar = TabBar;
