---
name: cortex-design
description: Use this skill to generate well-branded interfaces and assets for Cortex (personal finance decision-support platform), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key files:
- `README.md` — brand context, content fundamentals, visual foundations, iconography, and full index of resources.
- `colors_and_type.css` — all design tokens (CSS variables for color, type scale, radii, shadows). Link this from any HTML artifact.
- `fonts/` — Geist (display/body) and Geist Mono (numeric) font files.
- `assets/` — logo files and brand illustrations.
- `ui_kits/marketing/` — recreated Cortex marketing site (`index.html` + JSX components). Use as source of truth for nav, hero, tool card, pricing, and CTA patterns.
- `preview/` — atomic design-system cards rendered in the Design System tab.
