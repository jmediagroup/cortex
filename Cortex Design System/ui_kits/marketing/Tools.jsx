const { useState: useStateTools } = React;

function ToolCard({ icon, title, desc, tag, featured }) {
  const [hover, setHover] = useStateTools(false);
  return (
    <a href="#"
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        position:'relative', display:'block', textDecoration:'none',
        background: hover ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
        backdropFilter:'var(--glass-blur)', WebkitBackdropFilter:'var(--glass-blur)',
        border:`1px solid ${hover ? 'var(--glass-border-strong)' : 'var(--glass-border)'}`,
        borderRadius:'var(--radius-xl)',
        padding:24,
        boxShadow: hover ? 'var(--shadow-card-hover), var(--shadow-inset-top)' : 'var(--shadow-card), var(--shadow-inset-top)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition:'transform 320ms var(--ease-out-expo), background 160ms, border-color 160ms, box-shadow 320ms'
      }}>
      {/* featured emerald edge glow */}
      {featured && (
        <div style={{
          position:'absolute', inset:-1, borderRadius:'var(--radius-xl)',
          background:'linear-gradient(135deg, var(--emerald-border), transparent 40%)',
          opacity: hover ? 0.6 : 0.3,
          pointerEvents:'none', zIndex:-1, filter:'blur(8px)', transition:'opacity 200ms'
        }}/>
      )}

      {/* tag pill */}
      {tag && (
        <div style={{
          position:'absolute', top:16, right:16,
          fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase',
          color: tag === 'FREE' ? 'var(--emerald-500)' : 'var(--text-tertiary)',
          padding:'4px 10px', borderRadius:9999,
          background: tag === 'FREE' ? 'var(--emerald-tint-soft)' : 'var(--bg-glass-strong)',
          border: `1px solid ${tag === 'FREE' ? 'var(--emerald-border-soft)' : 'var(--glass-border)'}`
        }}>{tag}</div>
      )}

      {/* icon chip */}
      <div style={{
        width:44, height:44, borderRadius:'var(--radius-md)',
        background: hover
          ? 'linear-gradient(135deg, var(--emerald-tint), var(--emerald-tint-soft))'
          : 'var(--bg-glass-strong)',
        border: `1px solid ${hover ? 'var(--emerald-border)' : 'var(--glass-border)'}`,
        display:'flex',alignItems:'center',justifyContent:'center',
        color: hover ? 'var(--emerald-500)' : 'var(--text-secondary)',
        marginBottom:20,
        transition:'all 200ms var(--ease-out-quart)',
        boxShadow: hover ? '0 0 20px var(--cta-glow-soft)' : 'none'
      }}>
        <Ico name={icon} size={20}/>
      </div>

      <h4 style={{fontSize:16,fontWeight:600,color:'var(--text-primary)',margin:'0 0 8px',letterSpacing:'-0.01em'}}>{title}</h4>
      <p style={{color:'var(--text-tertiary)',fontSize:13,lineHeight:1.55,margin:'0 0 20px'}}>{desc}</p>

      <span style={{
        color: hover ? 'var(--emerald-500)' : 'var(--text-secondary)',
        fontWeight:600, fontSize:12, display:'inline-flex', alignItems:'center', gap: hover ? 8 : 6,
        transition:'all 160ms'
      }}>
        Open tool <Ico name="arrowRight" size={12}/>
      </span>
    </a>
  );
}

function ToolGrid() {
  const tools = [
    {icon:'calculator', title:'Compound Interest Calculator', desc:'See how your money grows over time with different contribution strategies and rates.', tag:'FREE'},
    {icon:'barChart', title:'Index Fund Growth Visualizer', desc:'Simulate historical returns and volatility for VOO, VTI, VT, and QQQM.', tag:'FREE'},
    {icon:'wallet', title:'Household Budgeting System', desc:'Allocate resources under constraints with AI-powered optimization and flexibility analysis.', tag:'FREE'},
    {icon:'dices', title:'Gambling Spend Redirect', desc:'See the wealth gap between playing the odds and owning the market. Redirect toward real wealth.', tag:'FREE'},
    {icon:'trendUp', title:'Retirement Strategy Engine', desc:'Decumulation planning with Roth conversions, tax optimization, and sequence risk analysis.', tag:'PRO', featured:true},
    {icon:'anchor', title:'Coast FIRE Calculator', desc:"Find out if your current savings will grow to your retirement number on their own.", tag:'FREE'},
    {icon:'compass', title:'Net Worth Engine', desc:'Track assets and liabilities, analyze liquidity, and visualize your financial trajectory.', tag:'PRO', featured:true},
    {icon:'flow', title:'Cash-Flow Sankey', desc:'Every dollar, mapped. See exactly where income flows across needs, wants, and investments.', tag:'PRO', featured:true},
  ];

  return (
    <section id="tools" style={{
      position:'relative', padding:'120px 24px',
      background:'var(--bg-page)',
      borderTop:'1px solid var(--border-subtle)'
    }}>
      {/* subtle section glow */}
      <div style={{
        position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',
        width:800,height:300,
        background:'radial-gradient(ellipse at top, var(--emerald-wash), transparent 70%)',
        pointerEvents:'none'
      }}/>

      <div style={{maxWidth:1280,margin:'0 auto',position:'relative'}}>
        <div style={{maxWidth:640,marginBottom:64}}>
          <div className="eyebrow" style={{marginBottom:16,color:'var(--emerald-500)'}}>
            ● CORTEX FINANCE — AVAILABLE NOW
          </div>
          <h2 style={{fontSize:'clamp(32px,4.5vw,52px)',fontWeight:700,color:'var(--text-primary)',letterSpacing:'-0.025em',margin:'0 0 20px',lineHeight:1.1}}>
            Eight tools. One<br/>mental model.
          </h2>
          <p style={{fontSize:17,color:'var(--text-secondary)',fontWeight:400,lineHeight:1.55,margin:0,maxWidth:560}}>
            Our first suite focuses on personal and small-business finance — where small decisions compound dramatically over time.
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:16}}>
          {tools.map((t,i)=><ToolCard key={i} {...t}/>)}
        </div>
      </div>
    </section>
  );
}

window.ToolCard = ToolCard; window.ToolGrid = ToolGrid;
