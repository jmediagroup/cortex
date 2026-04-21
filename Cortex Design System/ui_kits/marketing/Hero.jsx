const { useState: useStateHero, useEffect: useEffectHero } = React;

// Ambient grid + aurora background
function HeroBackground() {
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
      {/* grid */}
      <div style={{
        position:'absolute',inset:0,
        backgroundImage:`linear-gradient(var(--grid-line) 1px, transparent 1px),
                         linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
        backgroundSize:'56px 56px',
        maskImage:'radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)',
        WebkitMaskImage:'radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)'
      }}/>
      {/* emerald aurora */}
      <div style={{
        position:'absolute', top:'-10%', left:'50%', transform:'translateX(-50%)',
        width:900, height:500,
        background:'radial-gradient(ellipse at center, var(--aurora-emerald), transparent 60%)',
        filter:'blur(40px)'
      }}/>
      {/* secondary info glow */}
      <div style={{
        position:'absolute', bottom:'-20%', right:'-10%',
        width:600, height:500,
        background:'radial-gradient(ellipse at center, var(--aurora-info), transparent 60%)',
        filter:'blur(40px)'
      }}/>
      {/* faint crimson heat */}
      <div style={{
        position:'absolute', top:'40%', left:'-10%',
        width:400, height:400,
        background:'radial-gradient(ellipse at center, var(--aurora-crimson), transparent 60%)',
        filter:'blur(40px)'
      }}/>
    </div>
  );
}

// Animated number for the balance tickers
function Tick({ from, to, prefix='', suffix='', dur=1400 }) {
  const [v, setV] = useStateHero(from);
  useEffectHero(() => {
    const start = performance.now();
    let raf;
    const loop = (t) => {
      const p = Math.min(1, (t-start)/dur);
      const eased = 1 - Math.pow(1-p, 3);
      setV(from + (to-from)*eased);
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <>{prefix}{Math.round(v).toLocaleString()}{suffix}</>;
}

// Inline mini "Pulse" card shown under the hero
function PulsePreview() {
  const bars = [42, 58, 46, 71, 65, 83, 78, 92];
  const [hover, setHover] = useStateHero(false);
  return (
    <div
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        position:'relative',
        background:'var(--bg-glass-strong)',
        backdropFilter:'var(--glass-blur)',
        WebkitBackdropFilter:'var(--glass-blur)',
        border:'1px solid var(--glass-border-strong)',
        borderRadius:'var(--radius-2xl)',
        padding:28,
        boxShadow:'var(--shadow-elevated), var(--shadow-inset-top)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        transition:'transform 320ms var(--ease-out-expo), box-shadow 320ms'
      }}>
      {/* header row */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'var(--emerald-500)',boxShadow:'0 0 10px var(--emerald-500)'}}/>
          <span className="eyebrow" style={{margin:0}}>NET WORTH · LIVE</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,color:'var(--emerald-500)',fontSize:12,fontWeight:600}}>
          <Ico name="trendUp" size={14}/> +4.8%
        </div>
      </div>
      {/* balance */}
      <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:4}}>
        <span className="balance-hero" style={{fontSize:44,lineHeight:1,letterSpacing:'-0.035em'}}>
          $<Tick from={0} to={248912} />
        </span>
      </div>
      <div style={{fontSize:12,color:'var(--text-tertiary)',marginBottom:24,fontFamily:'var(--font-mono)'}}>
        +$11,240 this quarter · Coast FIRE at age 47
      </div>
      {/* Sankey-hint bars */}
      <div style={{display:'flex',alignItems:'flex-end',gap:8,height:72,marginBottom:16}}>
        {bars.map((h, i) => (
          <div key={i} style={{flex:1,display:'flex',flexDirection:'column',gap:2}}>
            <div style={{
              height:`${h*0.55}%`,
              background:'linear-gradient(180deg, var(--emerald-500), var(--emerald-700))',
              borderRadius:3,
              opacity:0.9,
              boxShadow: i === bars.length-1 ? '0 0 12px var(--cta-glow-strong)' : 'none'
            }}/>
            <div style={{
              height:`${(100-h)*0.25}%`,
              background:'var(--crimson-border)',
              borderRadius:3
            }}/>
          </div>
        ))}
      </div>
      {/* row under chart */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,paddingTop:16,borderTop:'1px solid var(--border-subtle)'}}>
        {[
          {l:'SAVINGS', v:'$4,280', d:'+12%', up:true},
          {l:'SPEND', v:'$3,140', d:'−8%', up:true},
          {l:'INVEST', v:'$1,600', d:'+22%', up:true},
        ].map((s,i)=>(
          <div key={i}>
            <div className="eyebrow" style={{fontSize:9,marginBottom:4}}>{s.l}</div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>{s.v}</div>
            <div style={{fontSize:11,color:'var(--emerald-500)',fontFamily:'var(--font-mono)'}}>{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section style={{position:'relative',overflow:'hidden',background:'var(--bg-canvas)',paddingBottom:80}}>
      <HeroBackground/>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'120px 24px 80px',position:'relative'}}>
        <div className="hero-grid" style={{display:'grid',gridTemplateColumns:'1.15fr 1fr',gap:80,alignItems:'center'}}>

          {/* LEFT — copy */}
          <div>
            {/* Eyebrow */}
            <div style={{
              display:'inline-flex',alignItems:'center',gap:8,
              background:'var(--bg-glass)',
              backdropFilter:'var(--glass-blur)',
              WebkitBackdropFilter:'var(--glass-blur)',
              border:'1px solid var(--glass-border)',
              color:'var(--text-secondary)',
              padding:'6px 12px',borderRadius:9999,marginBottom:32
            }}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'var(--emerald-500)',boxShadow:'0 0 8px var(--emerald-500)'}}/>
              <span className="eyebrow" style={{margin:0,fontSize:11,color:'var(--text-secondary)'}}>DECISION-SUPPORT PLATFORM</span>
            </div>

            {/* Headline */}
            <h1 className="h-hero" style={{margin:'0 0 28px',maxWidth:620}}>
              Think clearly about<br/>
              life's <span style={{
                background:'linear-gradient(135deg, var(--emerald-500) 0%, #5AC8FA 100%)',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'
              }}>biggest decisions.</span>
            </h1>

            {/* Sub */}
            <p style={{fontSize:18,color:'var(--text-secondary)',lineHeight:1.55,margin:'0 0 40px',maxWidth:520}}>
              Interactive financial models that turn complexity into clarity — so you can <span style={{color:'var(--text-primary)',fontWeight:600}}>see outcomes before you live them</span>.
            </p>

            {/* CTA row */}
            <div style={{display:'flex',gap:12,marginBottom:48}}>
              <a href="#tools" style={{
                background:'var(--emerald-500)', color:'var(--text-inverse)',
                padding:'14px 24px', borderRadius:12, fontWeight:700, fontSize:14,
                textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8,
                whiteSpace:'nowrap',
                boxShadow:'0 0 0 1px var(--cta-glow-ring), 0 0 32px var(--cta-glow-soft)',
                transition:'transform 160ms var(--ease-spring-soft), box-shadow 200ms'
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 0 0 1px var(--cta-glow-strong), 0 0 44px var(--cta-glow-strong)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 0 0 1px var(--cta-glow-ring), 0 0 32px var(--cta-glow-soft)';}}>
                Explore the tools <Ico name="arrowRight" size={16}/>
              </a>
              <a href="#start" style={{
                background:'var(--bg-glass)',
                backdropFilter:'var(--glass-blur)',
                WebkitBackdropFilter:'var(--glass-blur)',
                color:'var(--text-primary)',
                border:'1px solid var(--glass-border-strong)',
                padding:'14px 24px', borderRadius:12, fontWeight:600, fontSize:14,
                textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8,
                whiteSpace:'nowrap',
                transition:'background 160ms, border-color 160ms'
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-glass-strong)';e.currentTarget.style.borderColor='var(--border-strong)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-glass)';e.currentTarget.style.borderColor='var(--glass-border-strong)';}}>
                Start free
              </a>
            </div>

            {/* Trust row */}
            <div style={{display:'flex',alignItems:'center',gap:24,paddingTop:32,borderTop:'1px solid var(--border-subtle)'}}>
              {[
                {v:'12', l:'Interactive tools'},
                {v:'50', l:'States covered'},
                {v:'0', l:'Dark patterns', mono:false}
              ].map((s,i) => (
                <React.Fragment key={i}>
                  {i>0 && <div style={{width:1,height:32,background:'var(--border-subtle)'}}/>}
                  <div>
                    <div style={{
                      fontSize:22,fontWeight:600,color:'var(--text-primary)',
                      fontFamily:'var(--font-mono)',letterSpacing:'-0.02em'
                    }}>{s.v}{i<2 && <span style={{color:'var(--emerald-500)'}}>+</span>}</div>
                    <div style={{fontSize:11,color:'var(--text-tertiary)',letterSpacing:'0.1em',textTransform:'uppercase',marginTop:2}}>{s.l}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* RIGHT — product preview */}
          <div style={{position:'relative'}}>
            <PulsePreview/>
            {/* tiny orbiting chip */}
            <div style={{
              position:'absolute',top:-20,right:-16,
              background:'var(--bg-glass-strong)',
              backdropFilter:'var(--glass-blur)',
              WebkitBackdropFilter:'var(--glass-blur)',
              border:'1px solid var(--glass-border-strong)',
              borderRadius:'var(--radius-lg)',
              padding:'10px 14px',
              display:'flex',alignItems:'center',gap:10,
              boxShadow:'var(--shadow-card)'
            }}>
              <div style={{
                width:28,height:28,borderRadius:8,
                background:'var(--emerald-tint)',
                border:'1px solid var(--emerald-border)',
                display:'flex',alignItems:'center',justifyContent:'center',
                color:'var(--emerald-500)'
              }}>
                <Ico name="trendUp" size={14}/>
              </div>
              <div>
                <div style={{fontSize:10,color:'var(--text-tertiary)',letterSpacing:'0.08em',textTransform:'uppercase'}}>Safe to spend</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:13,fontWeight:600,color:'var(--emerald-500)'}}>$2,140</div>
              </div>
            </div>
            <div style={{
              position:'absolute',bottom:-16,left:-20,
              background:'var(--bg-glass-strong)',
              backdropFilter:'var(--glass-blur)',
              WebkitBackdropFilter:'var(--glass-blur)',
              border:'1px solid var(--glass-border-strong)',
              borderRadius:'var(--radius-lg)',
              padding:'10px 14px',
              display:'flex',alignItems:'center',gap:10,
              boxShadow:'var(--shadow-card)'
            }}>
              <div style={{
                width:28,height:28,borderRadius:8,
                background:'var(--crimson-tint)',
                border:'1px solid var(--crimson-border)',
                display:'flex',alignItems:'center',justifyContent:'center',
                color:'var(--crimson-500)'
              }}>
                <Ico name="trendDown" size={14}/>
              </div>
              <div>
                <div style={{fontSize:10,color:'var(--text-tertiary)',letterSpacing:'0.08em',textTransform:'uppercase'}}>Debt payoff</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>−$840 / mo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
