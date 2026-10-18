# Forma — Product Video Generation Brief

> **Format:** 60–75 second product promo
> **Aspect:** 16:9 (also cut 9:16 for social)
> **Tone:** Editorial, minimal, fashion-atelier meets Silicon Valley polish
> **Palette:** White (#ffffff), off-white (#f9f9fa), charcoal (#0b0b0b), ink black. No loud colors — contrast comes from type scale and whitespace.
> **Type:** Inter (UI) + Georgia/serif (wordmark). Tight letter-spacing on headlines. Generous whitespace.
> **Music bed:** Minimal downtempo / ambient fashion-film track — soft pulse, airy synths, quiet build. Never overpowering the VO.
> **Voiceover:** Warm, confident, unhurried. Female or androgynous register. Slight smile in the voice — think atelier consultation, not tech keynote.

---

## Master Voiceover Script (read aloud, timed to scenes)

> Imagine you found the perfect jacket.
> But a jacket alone isn't an outfit.
>
> Forma turns one piece you love into a complete look —
> styled by AI, grounded in what's actually in stock.
>
> Pick your starting piece. Choose the mood —
> work, weekend, evening. Forma builds the rest.
>
> Then see it on you.
> Upload a photo. The fitting studio dresses your look —
> before you ever hit checkout.
>
> An AI stylist is always one message away,
> suggesting pieces, answering questions, adjusting the fit.
>
> For merchants, one dashboard does it all.
> Import your catalogue. Let AI classify every photo.
> Track what's selling. Flag what's low. Merchandise as outfits.
>
> One pipeline. Every recommendation grounded in reality.
>
> Forma. A better fit — for everyone.

---

## Storyboard — Scene by Scene

### SCENE 1 — Cold Open: The Hook (0:00 – 0:06)

**Visual:**
Full-frame editorial shot. White background. A single charcoal jacket floats center-frame, slowly rotating (subtle 3D parallax, 2° orbit). Serif wordmark **"Forma"** fades in top-left, tracking-tight. Light sweep across fabric.

**Motion language:** Slow. Confident. Nothing hurried. The jacket breathes (scale 1.0 → 1.02, 4s ease).

**VO:**
> *Imagine you found the perfect jacket…*
> *(beat)*
> *…but a jacket alone isn't an outfit.*

**On-screen text:** None — let the image and VO land.

**Transition:** Jacket slides frame-left as scene 2 reveals frame-right. Shared-element transition.

---

### SCENE 2 — Landing Hero: The Fan Reveal (0:06 – 0:14)

**Visual:**
Browser-chrome mock (no URL bar noise, just a thin frosted frame) reveals the **Forma landing page**. The hero **photo stack** — 3–4 model/editorial photos stacked center — fans out into an arc, left to right, staggered 120ms apart. Each card: slight rotation (−8°, 0°, 8°, 14°), cubic-bezier ease, 1100ms. Frosted glass card layer sits behind with backdrop-blur.

Headline types in or mask-reveals line by line:
> **A better fit.**
> **For everyone.**

Scroll indicator pulses gently at bottom.

**Motion language:** The fan spread is the hero move — cards glide, they don't snap. Copy fades up 20px with 850ms ease.

**VO:**
> *Forma turns one piece you love into a complete look —*
> *styled by AI, grounded in what's actually in stock.*

**Transition:** Cursor clicks "Start building outfits" (charcoal pill button, hover lift 4px + shadow). Page cross-fades into builder.

---

### SCENE 3 — Outfit Builder: The Auto-Assemble (0:14 – 0:28)

**Visual:**
**Builder view** — product grid of garments (tops, bottoms, footwear, outerwear) in clean cards. White cards, subtle borders, product photography.

1. Cursor hovers a **charcoal blazer** → card lifts, ring-focus appears. Click → piece selected (checkmark chip animates in).
2. Preferences row visible: **Style / Occasion / Palette** pill selectors. Cursor taps "Occasion → Weekend" (pill fills charcoal).
3. **~600ms beat** — then the **recommendation auto-assembles**: remaining pieces (white tee, slim trousers, white sneakers) fly into the "Your outfit" rail one by one, staggered 150ms, each landing with a soft scale-down settle (1.08 → 1.0).
4. Bundle total counts up. "Add outfit to cart" pill pulses once.

**Motion language:** The auto-assemble is the money shot — pieces should feel *drawn together by an invisible hand*, not dragged. Each arrival: translate from grid position → rail, 500ms cubic-bezier(0.22, 1, 0.36, 1), slight overshoot.

**VO:**
> *Pick your starting piece. Choose the mood — work, weekend, evening. Forma builds the rest.*

**Cutaway (1 sec):** Close-up of the AI stylist badge glowing / spark icon — subtle particle shimmer.

---

### SCENE 4 — Fitting Studio: The Try-On Reveal (0:28 – 0:40)

**Visual:**
Split screen. **Left:** model photo (portrait, neutral pose, clean background). **Right:** garment pieces with body-zone tags (Top / Bottom / Footwear).

1. Cursor clicks **"AI try-on"** (charcoal pill).
2. **Progress overlay** takes over: frosted white veil, centered **animated orb** — multi-layer radial gradients (soft peach, lavender, white) breathing and drifting, thin luminous ring orbiting. Stage text cycles:
   - *"Preparing the model photo…"*
   - *"Composing the outfit…"*
   - *"Rendering the fit…"*
3. Orb contracts → **cross-fade reveal**: the model is now wearing the full outfit. Before/after wipe (left-to-right mask, 800ms ease).
4. Look-chips (piece names) float onto body zones, staggered, with thin connector lines.

**Motion language:** The orb should feel alive but calm — slow breathe (2.4s loop), gradient drift. The reveal is the emotional peak: hold half a second on the result before any UI chrome returns.

**VO:**
> *Then see it on you.*
> *Upload a photo. The fitting studio dresses your look —*
> *before you ever hit checkout.*

**SFX cue:** Soft shimmer / cloth-settle on the reveal. No swoosh.

---

### SCENE 5 — Stylist Chat: Always One Message Away (0:40 – 0:48)

**Visual:**
Fitting studio still on screen. A **floating chat launcher** (pill, charcoal, spark icon) bobs gently bottom-right. Cursor clicks → **panel slides up** (320ms, cubic-bezier ease-out) with backdrop blur.

Quick-chip row: *"Suggest outerwear" · "Something for dinner" · "Swap the shoes"*.
Cursor taps a chip → typing indicator (three dots, soft bounce) → product card appears in chat with image, price, reason line. "Add to outfit" micro-button → piece flies into the builder rail (off-panel, implied).

**Motion language:** Panel arrival is weightless — slides, doesn't slam. Product card scales up from 0.96 with fade. Typing dots keep a human pace (~900ms).

**VO:**
> *An AI stylist is always one message away —*
> *suggesting pieces, answering questions, adjusting the fit.*

---

### SCENE 6 — Merchant Dashboard: The Ops View (0:48 – 1:02)

**Visual:**
Hard cut — energy shift. Same white/charcoal language, but **denser**: sidebar rail (dark #171717), data tables, metric cards, SVG line chart.

Sequence (fast montage, ~2s per beat):

1. **Metric cards** count up: Recommendation-assisted sales ↑, AOV, Multi-item share. Sparklines draw in left-to-right.
2. **Revenue chart** — SVG path draws itself (stroke-dashoffset animation), gradient area fills beneath. Period toggle flips 30d → 7d, chart morphs.
3. **Inventory table** scrolls: product thumbnails, stock badges (In stock / Low / Out — green/amber/red micro-pills). Cursor hits **"Classify photos"** → AI classification modal: product photos stream in, category/color tags stamp onto each one (stamp animation, 80ms stagger).
4. **"Needs attention"** card: one out-of-stock item flagged. Cursor clicks "Review" → jumps to inventory filtered to that SKU.

**Motion language:** Precision, not playfulness. Shorter easings (300–400ms). Numbers tick. Chart paths draw. Tags stamp. Everything says *control*.

**VO:**
> *For merchants, one dashboard does it all.*
> *Import your catalogue. Let AI classify every photo.*
> *Track what's selling. Flag what's low. Merchandise as outfits.*
>
> *One pipeline. Every recommendation grounded in reality.*

---

### SCENE 7 — Closing: The Lockup (1:02 – 1:12)

**Visual:**
Return to white void. The **outfit from Scene 3** assembles one final time — pieces glide together into a flat-lay, center frame, slow scale settle. The **try-on result** from Scene 4 cross-fades behind it, ghosted.

Wordmark **"Forma"** fades in below, large, serif, tight.
Tagline types on:
> **A better fit. For everyone.**

Small footer: GitHub link glyph. Music resolves on a held chord.

**Motion language:** Everything decelerates to stillness. Final frame holds 2 full seconds.

**VO:**
> *Forma. A better fit — for everyone.*

**End card:** Logo + tagline only. Fade to white (not black — stay on-brand).

---

## Animation & Motion Reference Sheet

| Element | Motion | Duration | Easing |
|---|---|---|---|
| Hero photo fan | Staggered rotate + translate spread | 1100ms / card, 120ms stagger | cubic-bezier(0.22, 1, 0.36, 1) |
| Headline reveal | Mask wipe upward / fade + translateY(20px) | 850ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Builder auto-assemble | Fly grid → rail, overshoot settle (1.08→1.0) | 500ms / piece, 150ms stagger | cubic-bezier(0.22, 1, 0.36, 1) |
| Button hover | Lift translateY(-4px) + shadow deepen | 200ms | ease-out |
| Try-on orb | Breathe scale + gradient drift + orbit ring | 2400ms loop | ease-in-out infinite |
| Try-on reveal | Left-to-right mask wipe + cross-fade | 800ms | cubic-bezier(0.65, 0, 0.35, 1) |
| Chat panel | Slide up from bottom + backdrop blur in | 320ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Typing dots | 3-dot vertical bounce, loop | 900ms cycle | ease-in-out |
| Metric count-up | Number tick from 0 → value | 900ms | ease-out |
| Chart line draw | stroke-dashoffset L → 0 | 1200ms | cubic-bezier(0.65, 0, 0.35, 1) |
| AI tag stamp | Scale(1.3) + fade → settle scale(1) | 180ms / tag, 80ms stagger | cubic-bezier(0.34, 1.56, 0.64, 1) |
| Section card reveal (about stack) | Scroll-driven fold / translateY + rotate | tied to scroll | linear (scroll-linked) |
| Team card reveal | Fade + translateY + slight rotate | 600ms, 100ms stagger | ease-out |
| Toast | Slide in from top-right + auto-dismiss | 4000ms hold | ease-out |
| End lockup | Decelerating settle, hold | 2000ms hold | cubic-bezier(0.16, 1, 0.3, 1) |

---

## Art Direction Notes

- **Never** use saturated accent colors. The palette is monochrome + photography.
- **Glassmorphism** everywhere: frosted panels, backdrop-blur, thin borders at 7% black. The UI should feel like layered vellum.
- **Cursor** is visible but minimal — a small charcoal ring, not a giant arrow. Clicks are subtle ripples.
- **Whitespace is a feature.** Let frames breathe. Don't fill empty corners.
- **Photography style:** Editorial, neutral backgrounds, natural light. Models in understated contemporary clothing. No stock-photo energy.
- **Reduced motion respected in-product** — but the *video itself* can show motion; just keep it elegant, never bouncy.
- **Cut rhythm:** Slow (scenes 1–2) → medium (3–5) → brisk (6) → slow (7). A breathing pattern.

---

## Audio & Pacing Cues

| Time | Music | SFX |
|---|---|---|
| 0:00–0:06 | Single sustained pad, barely audible | Fabric whisper on jacket turn |
| 0:06–0:14 | Light pulse enters (kick on 1, soft hat) | Soft click on CTA press |
| 0:14–0:28 | Pulse continues, add airy pluck melody | Gentle settle sounds on each piece landing |
| 0:28–0:40 | Music dips — near-silence under orb | Orb hum (low, warm). Shimmer on reveal |
| 0:40–0:48 | Pulse returns, slightly warmer | Typing dots tick, panel whoosh (soft) |
| 0:48–1:02 | Upbeat shift — add bass, more structure | Data tick sounds, tag stamps, chart draw |
| 1:02–1:12 | Resolve to held chord, fade | Final settle. Silence on end card |

---

## Alternate Cuts

- **30s social cut:** Scenes 1 → 3 (trimmed to selection + auto-assemble) → 4 (reveal only) → 7. Drops merchant section and chat.
- **15s teaser:** Fan reveal (Scene 2) + try-on reveal (Scene 4 peak) + end lockup. VO: *"Forma. One piece in — a complete look out."*
- **Merchant-only cut:** Scenes 6 → 7. Targeted at B2B / hackathon judge audience.
