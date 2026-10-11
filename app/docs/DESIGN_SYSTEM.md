# DESIGN SYSTEM — Garuda Growth OS (Glassmorphic 3D)
Established 2026-10-11 via the 5-stage autonomous production pipeline. This is the single source of truth for every marketing and product surface.

## Stage 1 — Identity & research
- **Users**: real estate agents (India, UAE, global) — non-technical, phone-first, WhatsApp-centric. Pain: scattered leads, slow follow-up, unsystematic socials. Conversion triggers: live demo (no login), "no fake buttons" trust, cancel-anytime retainers.
- **Aesthetic balance**: enterprise trust (clinical ice-gray surfaces, forest-green authority) × futuristic speed (electric mint glow, glass depth, 3D mascot).

### Lighting tokens
| Token | Value | Use |
|---|---|---|
| Surface | `#F8FAFC` soft ice gray | page base, with fixed radial ambient spots `rgba(0,230,153,0.08)` |
| Brand / primary | `#0A5C36` deep forest green | CTAs, headlines accents, emblems |
| Brand deep | `#064E3B` | CTA hover |
| High-energy glow | `#00E699` electric mint | status dots, LEDs, focus rings, pulses |
| Body text | `#475569` slate | all body copy |
| Glass layer | `blur(16px)`, `rgba(255,255,255,0.75)`, `1px solid rgba(0,0,0,0.06)` | cards, nav, badges |
| Radius | `20px` cards, `14px` badges, `28px` hero shell | systemic uniformity |

### Typography
- Display: **Outfit** 700/800, tracking `-0.03em`, line-height `1.1` (`--font-display`).
- Body: **Inter** (`--font-inter`), slate `#475569`.

## Stage 2 — Spatial architecture (enforced, verified by `tools/dev/layout-check.mjs`)
- 12-column responsive grid, `max-w-6xl` container, `py-24` section rhythm on desktop.
- **Hero**: Garu breaks the hero card's top-right bounding box (`z-index: 20`, `top: -56px`) — verified: mascot top 168px vs shell top 223px.
- **Problem grid**: sweep-pose Garu occupies the negative margin space between headline and cards (`.sweep-slot`, `bottom: 100%`).
- **CTA**: peek-pose Garu emerges from the CTA bar (`.cta-peek`, `bottom: -54px`), waving wing on a 1.8s cycle.
- **Density caps**: exactly 2 floating glass badges per hero container (verified) at 15% edge offsets; max 1 micro-sticker per sub-feature card (verified: 10 cards × 1).
- **Breathing margin**: ≥28px padding around text inside sticker cards; stickers occupy adjacent negative space (`top: -30px; right: -12px`), never over text.
- **Mascot physics**: idle `mascotFloat 4s` (`translateY(-8px)`); hover `translateY(-16px) rotate(4deg)` on a spring cubic-bezier (verified firing); scroll states via float/wave variants.

## Stage 3 — Mascot: Garu (brand-adapted)
The pipeline spec's robot persona is mapped to our established brand mascot **Garu** (Garuda's baby eagle) in the specified material system: matte-white ceramic body, chrome metallic accents (beak, feet, joints), mint-cyan LED eyes with glow filter, soft studio shadow. Three poses shipped: Hero, Sweep, Peek. Raster 8K renders (Octane-style prompts in the pipeline doc) are queued for when image-generation credits reset; the SVG set is production-grade and infinitely scalable.

## Stage 4 — Sticker matrix (unified clay/mint style)
| Asset | Component | Meaning |
|---|---|---|
| Core module / OS box | `StickerOS` | Lead OS — open cube, mint energy core |
| AI specialist engine | `StickerAI` | microchip + glowing brain silhouette |
| Growth & revenue | `StickerGrowth` | mint trend arrow on emerald coin stacks |
| Data loss / leakage | `StickerBroken` | fragmented spreadsheet, torn with mint sparks |
| Lost time / chair-time | `StickerClock` | winged alarm clock |
| Real-time alerts | `StickerBell` | golden bell + mint pulse rings |

All share one defs palette (ceramic/chrome/mintGlow/emerald gradients + soft-blur shadows) so lighting and geometry read as one kit.

## Stage 5 — Application lockdown
- Class names unchanged across the app (`card`, `btn-gold`, `input`, `navlink-active`…) — re-tokenized in `globals.css`, so **every product screen inherited the system in one pass** (dashboard, leads, conversations, social, billing, admin, auth, legal).
- Glass sticky navbar on marketing (`blur(14px)`) with pill nav + active indicator.
- Button physics: hover-lift `translateY(-2px) scale(1.01)` on primaries (`btn-gold` → forest green now).
- Honest copy rule preserved: pricing identical to `/billing`, proof strip shows verified numbers only (81 checks, 0 fake states).
- Regression: all 81 automated checks pass post-rebrand; layout assertions green; no JS errors; no horizontal overflow.
