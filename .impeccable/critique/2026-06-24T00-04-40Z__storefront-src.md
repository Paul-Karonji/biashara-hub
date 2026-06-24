---
target: storefront/src
total_score: 29
p0_count: 0
p1_count: 1
timestamp: 2026-06-24T00-04-40Z
slug: storefront-src
---
# Design Critique: Biashara Hub Storefront

## Heuristics Evaluation

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Solid loader feedback for payment steps; minor gap in catalog list loading. |
| 2 | Match System / Real World | 4 | Excellent localization (M-Pesa channels, KES, county delivery terms). |
| 3 | User Control and Freedom | 3 | Good checkout step traversal; minor control gaps on manual code claims. |
| 4 | Consistency and Standards | 3 | Standard layouts match, but fonts miss display/body contrast. |
| 5 | Error Prevention | 3 | Robust prefix-agnostic phone normalization prevents bad STK triggers. |
| 6 | Recognition Rather Than Recall | 3 | Clear step progress; cart drawer is instantly recognizable. |
| 7 | Flexibility and Efficiency | 2 | No accelerators (keyboard shortcuts) or bulk actions on cart. |
| 8 | Aesthetic and Minimalist Design | 2 | Visual tells present (tracked Kickers, ghost cards combining shadow+border). |
| 9 | Error Recovery | 3 | Informative local messages guide customers during STK timeouts. |
| 10| Help and Documentation | 3 | Static policy and info pages are clear and accessible. |
| **Total** | | **29/40** | **Good** |

## Anti-Patterns Verdict
The storefront contains minor "AI slop" markers that dilute its brand personality:
1. **Tracked Kickers (Eyebrows):** Tracked uppercase tags like "Premium Shopping Experience" and "Why Choose Us" appear on the homepage.
2. **Ghost Cards:** Cards and checkout summaries combine 1px solid borders and drop shadows at rest.
3. **Typography Flattening:** Headlines utilize `Inter` instead of a sophisticated editorial serif font, defying the core visual strategy.

## Overall Impression
Biashara Hub has a strong, functional checkout foundation. The core M-Pesa flows are highly usable and intuitive. However, the visual styling feels too generic, like a default tailwind framework. Shifting headings to `Cormorant Garamond` and introducing clean hairline boundaries will elevate the trust level from "generic tech tool" to "premium gallery boutique".

## What's Working
* **M-Pesa Webhook Integration UI:** The dual STK Push / Manual Till C2B interface is clear and provides reassuring progress feedback.
* **County-Level Localized Shipping:** Clean delivery choices mapped by town with realistic rates.

## Priority Issues
* **[P1] Missing Editorial Typography Contrast:** Display titles and page headers use sans-serif `Inter` instead of the refined serif `Cormorant Garamond`.
  * *Why it matters:* Fails the brand identity goals of premium high-fashion trust.
  * *Fix:* Import `Cormorant Garamond` and apply it to display H1/H2 tags.
  * *Suggested command:* `typeset`
* **[P2] Tracked Kickers/Eyebrows:** repetitive small all-caps tags above headers.
  * *Why it matters:* Reads as generic AI generation grammar, cluttering the typography rhythm.
  * *Fix:* Remove eyebrows and increase vertical whitespace/grid margins.
  * *Suggested command:* `quieter`
* **[P2] Elevation/Flatness Violations (Ghost Cards):** Elements use borders + soft wide shadows at rest.
  * *Why it matters:* Dilutes layout boundaries, making UI feel cluttered.
  * *Fix:* Style components flat by default with hairlines, saving shadows for hover/action states.
  * *Suggested command:* `layout`
* **[P3] Lack of expert accelerators:** No keyboard controls for power shoppers.
  * *Why it matters:* Alex Persona suffers friction during repeated cart and search navigation.
  * *Fix:* Add custom window event listeners for search focus (`CMD/Ctrl + K`) and closing overlays (`Esc`).
  * *Suggested command:* `polish`

## Persona Red Flags
* **Alex (Power User):** Forced clicks required for navigation. Cart drawer cannot be opened via shortcut, and search has no keyboard trigger. High abandonment risk on repeat orders.
* **Casey (Distracted Mobile User):** Form fields and checkout summary are clean, but checkout action buttons are not sticky at the viewport bottom, requiring scrolling on long mobile viewports.
* **Jordan (First-Timer):** High clarity on STK prompt and manual Till. Excellent guidance, though inline hints for validation could be faster.

## Minor Observations
* Search input border changes color but has no focus glow indicator.
* Product thumbnails lack alt-text fields for search engine indexing.

## Questions to Consider
* What if page headers used serif typography to immediately command the eye?
* Can we drop all drop-shadows at rest to enforce a stark, flat editorial layout?
