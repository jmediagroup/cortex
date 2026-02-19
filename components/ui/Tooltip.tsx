'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
}

export default function Tooltip({ content }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(true);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setAbove(rect.top > 120);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        popoverRef.current && !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
        aria-label="More info"
      >
        <Info size={14} />
      </button>
      {open && (
        <div
          ref={popoverRef}
          className={`absolute z-50 left-1/2 -translate-x-1/2 w-56 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg font-medium leading-relaxed pointer-events-none ${
            above ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {content}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 ${
              above ? 'top-full -mt-1' : 'bottom-full -mb-1'
            }`}
          />
        </div>
      )}
    </span>
  );
}
