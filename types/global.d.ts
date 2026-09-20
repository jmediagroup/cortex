// Global browser type augmentations. Picked up via tsconfig `include: ["**/*.ts"]`.

declare global {
  interface Window {
    /** Google Analytics (gtag.js) — loaded in app/layout.tsx. */
    gtag?: (command: string, action: string, params: Record<string, string>) => void;
  }
}

export {};
