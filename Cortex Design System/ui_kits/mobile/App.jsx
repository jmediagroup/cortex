const { useState: useStateApp } = React;

function App() {
  const [expanded, setExpanded] = useStateApp(null);
  const [amt, setAmt] = useStateApp('2,500.00');
  const [mode, setMode] = useStateApp('save');
  return (
    <div style={{minHeight:'100%',paddingBottom:120,position:'relative',background:'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(0,240,160,0.08), transparent 60%), radial-gradient(ellipse 50% 30% at 100% 40%, rgba(191,90,242,0.08), transparent 60%), #0A0E14'}}>
      <StatusBar/>

      {/* Header */}
      <div style={{padding:'12px 20px 8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',flexDirection:'column',gap:2}}>
          <p style={{fontSize:13,color:'#8E8E93',margin:0,lineHeight:1.2}}>Good morning, Aria</p>
          <h1 style={{fontSize:22,fontWeight:600,color:'#F5F5F7',margin:0,letterSpacing:'-0.015em',lineHeight:1.2}}>Net Worth</h1>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button style={{width:38,height:38,borderRadius:12,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#F5F5F7',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name="search" size={17}/></button>
          <button style={{width:38,height:38,borderRadius:12,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#F5F5F7',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}><Ico name="bell" size={17}/><span style={{position:'absolute',top:9,right:10,width:6,height:6,borderRadius:'50%',background:'#00F0A0',boxShadow:'0 0 8px #00F0A0'}}/></button>
        </div>
      </div>

      {/* Hero balance */}
      <div style={{padding:'8px 20px 20px'}}>
        <div className="balance-hero" style={{fontFamily:'Inter',fontSize:48,fontWeight:600,letterSpacing:'-0.035em',color:'#F5F5F7',fontVariantNumeric:'tabular-nums'}}>$248,513<span style={{color:'#565659',fontWeight:500}}>.02</span></div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginTop:6}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:4,color:'#00F0A0',fontSize:13,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>↑ $4,218 · 1.72%</span>
          <span style={{fontSize:12,color:'#6D6D72',fontFamily:'JetBrains Mono'}}>this month</span>
        </div>
      </div>

      {/* Ghost chart */}
      <div style={{padding:'0 20px 4px'}}>
        <div style={{padding:'14px',borderRadius:20,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8,padding:'0 4px'}}>
            <span style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.14em',color:'#8E8E93'}}>12mo projection</span>
            <span style={{fontSize:11,fontFamily:'JetBrains Mono',color:'#5AC8FA'}}>→ $312k</span>
          </div>
          <GhostChart w={340} h={120}/>
        </div>
      </div>

      {/* Safe-to-Spend + accounts grid */}
      <div style={{padding:'20px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h2 style={{fontSize:14,fontWeight:600,color:'#F5F5F7',margin:0,textTransform:'uppercase',letterSpacing:'0.14em'}}>Today</h2>
        <a style={{fontSize:12,color:'#00F0A0',fontWeight:500}}>See all →</a>
      </div>

      <div style={{padding:'0 20px 16px'}}>
        <div style={{padding:20,borderRadius:24,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(0,240,160,0.14)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)'}}>
          <SafeToSpend daily={320} spent={72} size={180}/>
        </div>
      </div>

      {/* Pulse cards */}
      <div style={{padding:'20px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h2 style={{fontSize:14,fontWeight:600,color:'#F5F5F7',margin:0,textTransform:'uppercase',letterSpacing:'0.14em'}}>Accounts</h2>
        <a style={{fontSize:12,color:'#00F0A0',fontWeight:500}}>Manage →</a>
      </div>
      <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:12}}>
        <PulseCard account="Chase Checking" masked="•••• 4092" balance={12483.40} change={2.1} spark={[42,48,45,58,55,64,62,72]} expanded={expanded==='a'} onPress={()=>setExpanded(expanded==='a'?null:'a')}/>
        <PulseCard account="Ally Savings" masked="•••• 8821" balance={84220.18} change={0.42} spark={[80,80.4,80.8,81.2,81.8,82.3,83.1,84.2]} expanded={expanded==='b'} onPress={()=>setExpanded(expanded==='b'?null:'b')}/>
        <PulseCard account="Fidelity Brokerage" masked="•••• 0231" balance={151809.44} change={-1.2} spark={[160,158,155,153,154,151,150,151.8]} expanded={expanded==='c'} onPress={()=>setExpanded(expanded==='c'?null:'c')}/>
      </div>

      {/* Cash flow */}
      <div style={{padding:'24px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h2 style={{fontSize:14,fontWeight:600,color:'#F5F5F7',margin:0,textTransform:'uppercase',letterSpacing:'0.14em'}}>April cash flow</h2>
      </div>
      <div style={{padding:'0 20px'}}>
        <div style={{padding:16,borderRadius:20,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
          <Sankey w={340} h={180}/>
        </div>
      </div>

      {/* Smart amount quick action */}
      <div style={{padding:'24px 20px 12px'}}>
        <h2 style={{fontSize:14,fontWeight:600,color:'#F5F5F7',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:'0.14em'}}>Quick transfer</h2>
        <div style={{padding:18,borderRadius:20,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex',gap:6,marginBottom:14}}>
            {[{k:'save',l:'To Savings'},{k:'debt',l:'Pay Debt'},{k:'neutral',l:'Bill'}].map(m => (
              <button key={m.k} onClick={()=>setMode(m.k)} style={{flex:1,padding:'8px 0',borderRadius:10,border:`1px solid ${mode===m.k? (m.k==='save'?'#00F0A055':m.k==='debt'?'#FF3B3055':'#ffffff20'):'transparent'}`,background:mode===m.k? (m.k==='save'?'rgba(0,240,160,0.08)':m.k==='debt'?'rgba(255,59,48,0.08)':'rgba(255,255,255,0.04)'):'transparent',color:mode===m.k?'#F5F5F7':'#8E8E93',fontSize:12,fontWeight:500}}>{m.l}</button>
            ))}
          </div>
          <SmartAmount label={mode==='save'?'Transfer to savings':mode==='debt'?'Pay toward debt':'Bill payment'} value={amt} onChange={setAmt} mode={mode}/>
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{padding:'24px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h2 style={{fontSize:14,fontWeight:600,color:'#F5F5F7',margin:0,textTransform:'uppercase',letterSpacing:'0.14em'}}>Recent activity</h2>
      </div>
      <div style={{padding:'0 20px'}}>
        <div style={{borderRadius:18,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',overflow:'hidden',divideY:'1px solid rgba(255,255,255,0.04)'}}>
          <TransactionRow icon="arrowUp" title="Salary · Acme Corp" meta="Today · Direct deposit" amount="4,250.00" positive/>
          <div style={{height:1,background:'rgba(255,255,255,0.04)'}}/>
          <TransactionRow icon="cart" title="Whole Foods Market" meta="Yesterday · Groceries" amount="142.67"/>
          <div style={{height:1,background:'rgba(255,255,255,0.04)'}}/>
          <TransactionRow icon="coffee" title="Blue Bottle Coffee" meta="Yesterday · Dining" amount="6.80"/>
          <div style={{height:1,background:'rgba(255,255,255,0.04)'}}/>
          <TransactionRow icon="zap" title="Con Edison" meta="Apr 15 · Utilities" amount="84.20"/>
        </div>
      </div>

      <TabBar active="home"/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
