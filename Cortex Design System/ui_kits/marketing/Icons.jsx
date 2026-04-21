const { useState } = React;

// Lucide-style inline glyphs (1.75px stroke, round joins) — dark-UI scale
const Ico = ({ name, size = 18, stroke = 1.75 }) => {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    brain: <><path d="M12 18V5"/><path d="M15 13a4 4 0 0 1-3-4 4 4 0 0 1-3 4"/><path d="M17.6 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.6 1.5"/><path d="M18 18a4 4 0 0 0 2-7.5"/><path d="M20 17.5A4 4 0 1 1 12 18a4 4 0 1 1-8-.5"/><path d="M6 18a4 4 0 0 1-2-7.5"/></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    arrowUpRight: <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>,
    sparkles: <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z"/></>,
    calculator: <><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/></>,
    wallet: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="14.5" r="1.5"/></>,
    trendUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    trendDown: <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>,
    barChart: <><line x1="6" y1="20" x2="6" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/></>,
    dices: <><rect x="2.5" y="8.5" width="13" height="13" rx="2"/><path d="M8.5 8.5V3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5.5"/><circle cx="6" cy="15" r="0.8"/><circle cx="12" cy="15" r="0.8"/><circle cx="15.5" cy="4.5" r="0.8"/></>,
    compass: <><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>,
    anchor: <><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    star: <polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/>,
    chevronR: <polyline points="9 18 15 12 9 6"/>,
    bookOpen: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none"/>,
    pulse: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    orbit: <><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-30 12 12)"/></>,
    flow: <><path d="M3 6h8l4 6 6-3"/><path d="M3 12h6l4 6 8-2"/><path d="M3 18h4"/></>,
    dot: <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>,
  };
  return <svg {...common}>{paths[name]}</svg>;
};

window.Ico = Ico;
