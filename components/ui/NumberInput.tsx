'use client';

import React, { useState } from 'react';

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> & {
  value: number;
  onValueChange: (value: number) => void;
  /** Clamp committed values. Cleared fields fall back to min (or 0). */
  min?: number;
  max?: number;
};

/**
 * Controlled numeric input that keeps the raw text while the field is
 * focused, so users can clear it and retype without the value snapping
 * back to a sticky "0" (the `parseFloat(value) || 0` anti-pattern).
 * Valid intermediate values update live; blur commits a clamped number.
 */
export default function NumberInput({ value, onValueChange, min, max, ...rest }: Props) {
  const [text, setText] = useState<string>(String(value));
  const [focused, setFocused] = useState(false);

  // Keep the display in sync with external changes (loaded scenarios,
  // optimizer runs) while the user isn't editing — state adjusted during
  // render per React's "you might not need an effect" guidance.
  const [prevValue, setPrevValue] = useState(value);
  if (!focused && prevValue !== value) {
    setPrevValue(value);
    setText(String(value));
  }

  const clamp = (n: number) => {
    let out = n;
    if (min != null && out < min) out = min;
    if (max != null && out > max) out = max;
    return out;
  };

  return (
    <input
      {...rest}
      type="number"
      min={min}
      max={max}
      inputMode="decimal"
      value={focused ? text : String(value)}
      onFocus={(e) => {
        setFocused(true);
        setText(String(value));
        rest.onFocus?.(e);
      }}
      onChange={(e) => {
        setText(e.target.value);
        const parsed = parseFloat(e.target.value);
        if (!isNaN(parsed)) onValueChange(clamp(parsed));
      }}
      onBlur={(e) => {
        setFocused(false);
        const parsed = parseFloat(text);
        onValueChange(isNaN(parsed) ? clamp(min ?? 0) : clamp(parsed));
        rest.onBlur?.(e);
      }}
    />
  );
}
