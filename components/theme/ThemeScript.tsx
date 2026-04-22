import { THEME_COOKIE, THEME_STORAGE_KEY } from '@/lib/theme';

export function ThemeScript() {
  const code =
    '(function(){try{' +
    'var KEY=' + JSON.stringify(THEME_STORAGE_KEY) + ';' +
    'var COOKIE=' + JSON.stringify(THEME_COOKIE) + ';' +
    'var html=document.documentElement;' +
    'var attr=html.getAttribute("data-theme");' +
    'if(attr==="light"||attr==="dark")return;' +
    'var t=null;' +
    'try{t=localStorage.getItem(KEY);}catch(e){}' +
    'if(t!=="light"&&t!=="dark"){' +
      'var m=document.cookie.match(new RegExp("(?:^|; )"+COOKIE.replace(/[-.+*?^${}()|[\\]\\\\]/g,"\\\\$&")+"=([^;]*)"));' +
      't=m?decodeURIComponent(m[1]):null;' +
    '}' +
    'if(t!=="light"&&t!=="dark"){' +
      't=(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches)?"light":"dark";' +
    '}' +
    'html.setAttribute("data-theme",t);' +
    '}catch(e){}})();';
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
