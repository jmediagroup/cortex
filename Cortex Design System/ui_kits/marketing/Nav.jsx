const { useState: useStateNav, useEffect: useEffectNav } = React;

function ThemeToggle() {
  const [theme, setTheme] = useStateNav(() => {
    if (typeof window === 'undefined') return 'dark';
    return document.documentElement.getAttribute('data-theme') || 'dark';
  });

  useEffectNav(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('cortex-theme', theme); } catch(e){}
  }, [theme]);

  const isDark = theme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        position:'relative', width:52, height:28, borderRadius:9999,
        background:'var(--bg-glass-strong)',
        border:'1px solid var(--glass-border-strong)',
        cursor:'pointer', padding:0,
        display:'flex', alignItems:'center',
        transition:'background 200ms',
        boxShadow:'var(--shadow-inset-top)'
      }}>
      <span style={{
        position:'absolute',
        left: isDark ? 3 : 27,
        top: 3,
        width:20, height:20, borderRadius:'50%',
        background: isDark ? 'var(--obsidian-600)' : 'var(--emerald-500)',
        border: isDark ? '1px solid var(--border-strong)' : 'none',
        display:'flex',alignItems:'center',justifyContent:'center',
        color: isDark ? 'var(--text-secondary)' : '#fff',
        transition:'left 260ms var(--ease-spring-soft), background 200ms',
        boxShadow: isDark ? 'none' : '0 0 10px var(--cta-glow-soft)'
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {isDark
            ? <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            : <><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></>
          }
        </svg>
      </span>
    </button>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useStateNav(false);
  useEffectNav(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position:'sticky', top:0, zIndex:50,
      background: scrolled ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
      backdropFilter:'blur(24px) saturate(180%)',
      WebkitBackdropFilter:'blur(24px) saturate(180%)',
      borderBottom: `1px solid ${scrolled ? 'var(--border-default)' : 'var(--border-subtle)'}`,
      transition:'background 200ms var(--ease-out-quart), border-color 200ms'
    }}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="#" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none'}}>
          <div style={{
            position:'relative', width:32, height:32, borderRadius:10,
            background:'linear-gradient(135deg, var(--obsidian-700), var(--obsidian-900))',
            border:'1px solid var(--glass-border-strong)',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'var(--emerald-500)',
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 20px var(--cta-glow-soft)'
          }}>
            <Ico name="brain" size={18} stroke={1.8}/>
          </div>
          <span style={{fontWeight:700,fontSize:17,letterSpacing:'-0.02em',color:'var(--text-primary)'}}>Cortex</span>
        </a>

        <div className="nav-center" style={{display:'flex',alignItems:'center',gap:4, position:'absolute', left:'50%', transform:'translateX(-50%)'}}>
          {['Tools','Thinking','Pricing','Articles'].map((label, i) => (
            <a key={i} href={`#${label.toLowerCase()}`} style={{
              fontSize:13, fontWeight:500, color:'var(--text-secondary)',
              padding:'8px 14px', borderRadius:9999, textDecoration:'none',
              transition:'color 120ms, background 120ms'
            }}
            onMouseEnter={e=>{e.currentTarget.style.color='var(--text-primary)';e.currentTarget.style.background='var(--bg-glass)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='var(--text-secondary)';e.currentTarget.style.background='transparent';}}>
              {label}
            </a>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <ThemeToggle/>
          <a href="#signin" style={{fontSize:13,fontWeight:500,color:'var(--text-secondary)',padding:'8px 14px',textDecoration:'none'}}>Sign in</a>
          <a href="#start" style={{
            background:'var(--emerald-500)', color:'var(--text-inverse)',
            padding:'9px 18px', borderRadius:9999, fontWeight:600, fontSize:13,
            textDecoration:'none', whiteSpace:'nowrap',
            boxShadow:'0 0 0 1px var(--cta-glow-ring), 0 0 24px var(--cta-glow-soft)',
            transition:'box-shadow 160ms, transform 160ms'
          }}
          onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 0 1px var(--cta-glow-strong), 0 0 32px var(--cta-glow-strong)'}
          onMouseLeave={e=>e.currentTarget.style.boxShadow='0 0 0 1px var(--cta-glow-ring), 0 0 24px var(--cta-glow-soft)'}>
            Get started
          </a>
        </div>
      </div>
    </nav>
  );
}

window.Nav = Nav;
window.ThemeToggle = ThemeToggle;
