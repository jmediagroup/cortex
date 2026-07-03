'use client';

type Props = {
  className?: string;
};

/**
 * Money Guy Mutants is a light-only design system, so the light/dark
 * theme toggle has been retired. This renders nothing, keeping every
 * existing import site working with no visible control. The component
 * (and ThemeProvider/ThemeScript) will be deleted outright in the
 * Phase 7 cleanup.
 */
export function ThemeToggle(_props: Props) {
  return null;
}
