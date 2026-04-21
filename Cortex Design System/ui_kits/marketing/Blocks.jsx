const { useState: useStateBlocks } = React;

/* ============================================================
   PHILOSOPHY — "setup → pivot → land" section
   ============================================================ */
function Philosophy() {
  const beats = [
    {
      stance: "Most advice is static.",
      pivot: "Cortex is interactive, scenario-based, and personal.",
      icon: 'pulse'
    },
    {
      stance: "Most tools give answers.",
      pivot: "Cortex gives context.",
      icon: 'compass'
    },
    {
      stance: "Most platforms optimize for engagement.",
      pivot: "Cortex optimizes for clarity.",
      icon: 'orbit'
    }
  ];

  return (
    <section id="thinking" style={{
      position:'relative', padding:'120px 24px',
      background:'var(--bg-section)',
      borderTop:'1px solid var(--border-subtle)',
      borderBottom:'1px solid var(--border-subtle)'
    }}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <div className="eyebrow" style={{marginBottom:16,color:'var(--text-tertiary)'}}>HOW WE THINK</div>
        <h2 style={{
          fontSize:'clamp(32px,4.5vw,52px)',fontWeight:700,
          color:'var(--text-primary)',letterSpacing:'-0.025em',
          margin:'0 0 64px',lineHeight:1.1,maxWidth:780
        }}>
          The goal isn't prediction.<br/>
          <span style={{color:'var(--text-tertiary)'}}>The goal is </span>
          <span style={{
            background:'linear-gradient(135deg, var(--emerald-500), #5AC8FA)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'
          }}>better judgment.</span>
        </h2>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
          {beats.map((b, i) => (
            <div key={i} style={{
              background:'var(--bg-glass)',
              backdropFilter:'var(--glass-blur)',
              WebkitBackdropFilter:'var(--glass-blur)',
              border:'1px solid var(--glass-border)',
              borderRadius:'var(--radius-xl)',
              padding:28,
              position:'relative'
            }}>
              <div style={{
                width:36,height:36,borderRadius:10,
                background:'var(--bg-glass-strong)',
                border:'1px solid var(--glass-border)',
                display:'flex',alignItems:'center',justifyContent:'center',
                color:'var(--text-secondary)',marginBottom:24
              }}>
                <Ico name={b.icon} size={18}/>
              </div>
              <div style={{
                fontSize:14, color:'var(--text-muted)',
                textDecoration:'line-through', textDecorationColor:'var(--crimson-500)',
                marginBottom:12, fontWeight:400
              }}>
                {b.stance}
              </div>
              <div style={{
                fontSize:17, color:'var(--text-primary)',
                fontWeight:500, lineHeight:1.45, letterSpacing:'-0.01em'
              }}>
                {b.pivot}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PRICING — dark glass tiers
   ============================================================ */
function Pricing() {
  const [hoverFree, setHoverFree] = useStateBlocks(false);
  const [hoverPro, setHoverPro] = useStateBlocks(false);

  const tiers = [
    {
      name:'Free', price:'$0', cadence:'/ forever',
      sub:'For exploration and curiosity.',
      features:['Access to core calculators','Limited scenarios','Ideal for learning the models'],
      cta:'Start free', featured:false
    },
    {
      name:'Finance Pro', price:'$9', cadence:'/ month',
      sub:'For people who want precision.',
      features:['Full access to all Finance tools','Advanced multi-scenario modeling','Deeper projections & tax logic','Strategy modeling with live data'],
      cta:'Get Pro', featured:true
    }
  ];

  return (
    <section id="pricing" style={{padding:'120px 24px',background:'var(--bg-page)'}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <div style={{textAlign:'center',maxWidth:560,margin:'0 auto 64px'}}>
          <div className="eyebrow" style={{marginBottom:16,color:'var(--text-tertiary)'}}>PRICING</div>
          <h2 style={{fontSize:'clamp(32px,4.5vw,52px)',fontWeight:700,color:'var(--text-primary)',letterSpacing:'-0.025em',margin:'0 0 16px',lineHeight:1.1}}>
            Simple, honest pricing.
          </h2>
          <p style={{fontSize:17,color:'var(--text-secondary)',margin:0}}>
            Choose the plan that matches where you are today.
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:20,maxWidth:820,margin:'0 auto'}}>
          {tiers.map((t, i) => {
            const hover = t.featured ? hoverPro : hoverFree;
            const setHover = t.featured ? setHoverPro : setHoverFree;
            return (
              <div key={i}
                onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
                style={{
                  position:'relative',
                  background: t.featured ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
                  backdropFilter:'var(--glass-blur)', WebkitBackdropFilter:'var(--glass-blur)',
                  border:`1px solid ${t.featured ? 'var(--emerald-border)' : 'var(--glass-border)'}`,
                  borderRadius:'var(--radius-2xl)',
                  padding:32,
                  boxShadow: t.featured
                    ? '0 0 0 1px var(--featured-halo), 0 20px 60px var(--featured-halo), var(--shadow-inset-top)'
                    : 'var(--shadow-card), var(--shadow-inset-top)',
                  display:'flex', flexDirection:'column',
                  transform: hover ? 'translateY(-3px)' : 'none',
                  transition:'transform 320ms var(--ease-out-expo)'
                }}>

                {t.featured && (
                  <div style={{
                    position:'absolute', top:-12, left:24,
                    background:'var(--emerald-500)', color:'var(--text-inverse)',
                    padding:'5px 12px', borderRadius:9999,
                    fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
                    boxShadow:'0 0 20px var(--cta-glow-ring)'
                  }}>Most popular</div>
                )}

                <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:6}}>
                  <h3 style={{fontSize:18,fontWeight:600,color:'var(--text-primary)',margin:0,letterSpacing:'-0.01em'}}>{t.name}</h3>
                </div>
                <p style={{color:'var(--text-tertiary)',fontSize:13,margin:'0 0 28px'}}>{t.sub}</p>

                <div style={{display:'flex',alignItems:'baseline',gap:4,marginBottom:32}}>
                  <span style={{fontSize:48,fontWeight:700,color:'var(--text-primary)',letterSpacing:'-0.035em',fontFamily:'var(--font-display)'}}>{t.price}</span>
                  <span style={{color:'var(--text-tertiary)',fontSize:14,fontFamily:'var(--font-mono)'}}>{t.cadence}</span>
                </div>

                <ul style={{listStyle:'none',padding:0,margin:'0 0 36px',flex:1}}>
                  {t.features.map((f, j) => (
                    <li key={j} style={{display:'flex',alignItems:'flex-start',gap:10,fontSize:14,color:'var(--text-secondary)',marginBottom:14}}>
                      <span style={{
                        flexShrink:0, width:18, height:18, borderRadius:'50%',
                        background: t.featured ? 'var(--emerald-tint)' : 'var(--bg-glass-strong)',
                        border:`1px solid ${t.featured ? 'var(--emerald-border)' : 'var(--glass-border)'}`,
                        color: t.featured ? 'var(--emerald-500)' : 'var(--text-tertiary)',
                        display:'flex',alignItems:'center',justifyContent:'center',marginTop:1
                      }}>
                        <Ico name="check" size={10} stroke={2.5}/>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a href="#" style={{
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  background: t.featured ? 'var(--emerald-500)' : 'var(--bg-glass-strong)',
                  color: t.featured ? 'var(--text-inverse)' : 'var(--text-primary)',
                  border: t.featured ? 'none' : '1px solid var(--glass-border-strong)',
                  padding:'14px 24px',borderRadius:12,fontWeight:600,fontSize:14,textDecoration:'none',
                  boxShadow: t.featured ? '0 0 24px var(--cta-glow-soft)' : 'none',
                  transition:'all 160ms'
                }}>
                  {t.cta} <Ico name="arrowRight" size={14}/>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   DARK CTA — principles block
   ============================================================ */
function PrinciplesCTA() {
  const principles = [
    {i:'lock', t:'No dark patterns', d:'We never optimize for time-on-site.'},
    {i:'shield', t:'No urgency traps', d:'Countdowns belong in game shows.'},
    {i:'star', t:'No pretending life is simple', d:'We model complexity, not erase it.'}
  ];

  // Keep this block dark in BOTH themes — it's a feature island.
  // Using fixed obsidian tokens + fixed white text (not --text-primary).
  const cardBg = 'rgba(255, 255, 255, 0.04)';
  const cardBorder = 'rgba(255, 255, 255, 0.08)';
  const textWhite = '#F5F5F7';
  const textMist = '#AEAEB2';
  const textMuted = '#8E8E93';

  return (
    <section style={{
      position:'relative', overflow:'hidden', padding:'80px 24px',
      background:'var(--bg-canvas)'
    }}>
      {/* enclosing emerald frame */}
      <div style={{
        maxWidth:1200,margin:'0 auto',
        position:'relative',
        background:'linear-gradient(135deg, #121620 0%, #0A0E14 100%)',
        border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:'var(--radius-3xl)',
        padding:'80px 48px',
        overflow:'hidden'
      }}>
        {/* glow */}
        <div style={{
          position:'absolute',top:'-20%',left:'50%',transform:'translateX(-50%)',
          width:800,height:400,
          background:'radial-gradient(ellipse at center, rgba(0,240,160,0.18), transparent 60%)',
          filter:'blur(40px)',pointerEvents:'none'
        }}/>
        {/* subtle grid */}
        <div style={{
          position:'absolute',inset:0,
          backgroundImage:`linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize:'48px 48px',
          maskImage:'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          WebkitMaskImage:'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          pointerEvents:'none'
        }}/>

        <div style={{position:'relative',maxWidth:900,margin:'0 auto',textAlign:'center'}}>
          <div className="eyebrow" style={{marginBottom:20,color:'#00F0A0'}}>● OUR PRINCIPLES</div>

          <h2 style={{
            fontSize:'clamp(32px,5vw,56px)',fontWeight:700,
            color:textWhite,letterSpacing:'-0.03em',
            margin:'0 0 20px',lineHeight:1.05
          }}>
            Built on principles,<br/>not dark patterns.
          </h2>
          <p style={{fontSize:17,color:textMist,lineHeight:1.55,maxWidth:620,margin:'0 auto 56px'}}>
            Cortex is built by humans who care about rational decision-making, personal agency, and designing tools that respect intelligence.
          </p>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginBottom:56,textAlign:'left'}}>
            {principles.map((p, i) => (
              <div key={i} style={{
                background:cardBg,
                backdropFilter:'blur(20px) saturate(180%)',
                WebkitBackdropFilter:'blur(20px) saturate(180%)',
                border:`1px solid ${cardBorder}`,
                borderRadius:'var(--radius-lg)',
                padding:20
              }}>
                <div style={{
                  width:32,height:32,borderRadius:8,
                  background:'rgba(0,240,160,0.1)',
                  border:'1px solid rgba(0,240,160,0.2)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:'#00F0A0',marginBottom:14
                }}>
                  <Ico name={p.i} size={15}/>
                </div>
                <div style={{fontSize:14,fontWeight:600,color:textWhite,marginBottom:6}}>{p.t}</div>
                <div style={{fontSize:12,color:textMuted,lineHeight:1.5}}>{p.d}</div>
              </div>
            ))}
          </div>

          <p style={{
            fontSize:20,fontWeight:600,color:textWhite,
            letterSpacing:'-0.015em',marginBottom:36,maxWidth:600,margin:'0 auto 36px'
          }}>
            Just clearer thinking — one decision at a time.
          </p>

          <a href="#" style={{
            display:'inline-flex',alignItems:'center',gap:8,
            background:'#00F0A0',color:'#0A0E14',
            padding:'16px 28px',borderRadius:12,fontWeight:700,fontSize:15,
            textDecoration:'none',
            boxShadow:'0 0 0 1px rgba(0,240,160,0.4), 0 0 40px rgba(0,240,160,0.4)'
          }}>
            Start thinking clearly <Ico name="arrowRight" size={16}/>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  return (
    <footer style={{
      background:'var(--bg-canvas)',
      borderTop:'1px solid var(--border-subtle)',
      padding:'48px 24px 40px'
    }}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:32,marginBottom:40}}>
          <div style={{maxWidth:320}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <div style={{
                width:28,height:28,borderRadius:8,
                background:'linear-gradient(135deg, var(--obsidian-700), var(--obsidian-900))',
                border:'1px solid var(--glass-border-strong)',
                display:'flex',alignItems:'center',justifyContent:'center',
                color:'var(--emerald-500)'
              }}><Ico name="brain" size={15}/></div>
              <span style={{fontWeight:700,color:'var(--text-primary)',fontSize:15}}>Cortex</span>
            </div>
            <p style={{fontSize:13,color:'var(--text-tertiary)',lineHeight:1.55,margin:0}}>
              Tools for long-term thinking. A decision-support platform that makes invisible consequences visible.
            </p>
          </div>

          <div style={{display:'flex',gap:56,flexWrap:'wrap'}}>
            {[
              {h:'Product', l:['Tools','Pricing','Roadmap','Changelog']},
              {h:'Company', l:['About','Thinking','Articles','Contact']},
              {h:'Legal', l:['Terms','Privacy','Security']},
            ].map((col, i) => (
              <div key={i}>
                <div className="eyebrow" style={{fontSize:10,marginBottom:14,color:'var(--text-muted)'}}>{col.h}</div>
                {col.l.map((link, j) => (
                  <a key={j} href="#" style={{
                    display:'block',fontSize:13,color:'var(--text-secondary)',
                    textDecoration:'none',marginBottom:8
                  }}>{link}</a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          paddingTop:24,borderTop:'1px solid var(--border-subtle)',
          display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16
        }}>
          <span style={{fontSize:12,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>
            © 2026 Cortex Technologies
          </span>
          <span style={{fontSize:12,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'var(--emerald-500)',boxShadow:'0 0 6px var(--emerald-500)'}}/>
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}

window.Philosophy = Philosophy;
window.Pricing = Pricing;
window.PrinciplesCTA = PrinciplesCTA;
window.Footer = Footer;
