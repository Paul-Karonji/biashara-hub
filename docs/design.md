---
name: Biashara Hub
description: Premium editorial e-commerce storefront optimized for the Kenyan market.
colors:
  primary: "#0F3D91"
  navy: "#0A2D6B"
  gold: "#D4A017"
  background: "#FFFFFF"
  surface: "#F8FAFC"
  border: "#E2E8F0"
  text: "#0F172A"
  muted: "#64748B"
  success: "#00A651"
  warning: "#F59E0B"
  danger: "#DC2626"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 5vw, 4.5rem)"
    fontWeight: 600
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: "1.2"
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.4"
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.6"
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.5"
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.navy}"
  card:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "24px"
---

# Design System: Biashara Hub

## 1. Overview

**Creative North Star: "The Editorial Gallery"**

Biashara Hub utilizes a sophisticated high-fashion editorial layout strategy designed to build instant consumer trust. The system rejects crowded, low-contrast SaaS dashboards and busy e-commerce marketplaces in favor of high-contrast serif headers, clean sans-serif bodies, spacious breathing layouts, and delicate hairline grid borders. 

Design is restrained: interactive widgets are completely flat at rest, and depth is achieved via whitespace hierarchy rather than heavy shadows.

**Key Characteristics:**
* **Hairline Grids:** Thin, high-contrast borders (`#E2E8F0` / `1px`) organize layout structures cleanly.
* **Serif Hierarchy:** Cormorant Garamond is used for commanding display/headline tags, while Inter handles dense readable data.
* **Minimalist Swatches:** Large expanses of background white and slate surface, accented by authoritative Midnight Navy, with Accent Gold reserved strictly for premium highlights.

## 2. Colors

The color palette centers on stark high-fashion contrast, using Deep Navy for structure, Cobalt for action, and Sunlight Brass for earned accents.

### Primary
* **Cobalt Accent** (`#0F3D91`): The primary driver for active buttons, focus indicators, links, and checkout progress.

### Secondary
* **Midnight Ink** (`#0A2D6B`): Header backgrounds, footers, secondary typography, and hover active fills.

### Tertiary
* **Sunlight Brass** (`#D4A017`): Premium badges, star ratings, and subtle highlight indicators. Used sparingly.

### Neutral
* **Pure Gallery BG** (`#FFFFFF`): The primary page canvas.
* **Gallery Surface** (`#F8FAFC`): Inset lists, cart details, and table section backgrounds.
* **Hairline Border** (`#E2E8F0`): Clean container dividers and inputs.
* **Typographic Ink** (`#0F172A`): Body copy. Must hit contrast levels >= 4.5:1.

### Named Rules
**The 10% Gold Rule.** Accent Gold is reserved strictly for high-value details (ratings, premium icons, active highlights). It must never exceed 10% of any screen’s visual weight.

## 3. Typography

**Display Font:** Cormorant Garamond (with Georgia, serif fallback)  
**Body Font:** Inter (with system-ui, sans-serif fallback)  

The pairing merges refined, high-contrast editorial serifs with geometric, highly readable sans-serif body text.

### Hierarchy
* **Display** (600, `clamp(2.5rem, 5vw, 4.5rem)`, 1.1): Hero headlines.
* **Headline** (600, `clamp(2rem, 4vw, 3rem)`, 1.2): Section titles, checkout headings.
* **Title** (600, `1.25rem`, 1.4): Product card headings, list headers.
* **Body** (400, `1rem`, 1.6): Description text, address summary. Max line-length clamped to 70ch.
* **Label** (500, `0.875rem`, 0.05em, uppercase): Subheadings, small metadata, ratings, button text.

### Named Rules
**The Display Letter-Spacing Rule.** Display headings using Cormorant Garamond must maintain letter-spacing of at least `-0.02em` to prevent elegant serifs from colliding.

## 4. Elevation

The visual layout of Biashara Hub is flat by default. Depth is conveyed strictly through thin hairlines and background surface contrast rather than drop-shadow layers.

### Shadow Vocabulary
* **Ambient Hover** (`box-shadow: 0 4px 12px rgba(0,0,0,0.05)`): Applied to cards and primary action buttons strictly on hover states.
* **Elevated Drawer** (`box-shadow: 0 12px 30px rgba(0,0,0,0.08)`): Applied to overlay elements like active cart drawers and modal backdrops.

### Named Rules
**The Flat-at-Rest Rule.** All cards, buttons, and input fields remain flat with a 1px border at rest. Drop shadows are triggered only as feedback to active user hover or overlay events.

## 5. Components

Components feature crisp corners, flat fills, and hairline boundary definitions.

### Buttons
* **Shape:** Slightly rounded corners (`8px` / `radius-sm`).
* **Primary:** Deep Cobalt bg, white text, bold uppercase label (`letter-spacing: 0.05em`).
* **Hover / Focus:** Fills transitions to Midnight Ink over 200ms ease. Focus outlines with a clear blue ring.

### Cards / Containers
* **Corner Style:** Clean corners (`12px` / `radius-md`).
* **Background:** Pure white (`#FFFFFF`) with 1px border.
* **Shadow Strategy:** Flat at rest, subtle Ambient Hover shadow on active cursor overlay.

### Inputs / Fields
* **Style:** 48px height, 12px border radius, border `#E2E8F0`.
* **Focus:** Deep Cobalt outline ring (`#0F3D91` / `2px`) with zero offset.
* **Error:** Distinct crimson outline (`#DC2626`) with supportive helper text.

### Navigation
* **Style:** Sticky top nav, white bg, thin bottom border. Active pages indicated via Cobalt text. Mobile bottom nav uses clean outline icons with uppercase labels.

## 6. Do's and Don'ts

### Do:
* **Do** enforce a strict 70/20/10 color weight distribution (70% white backgrounds, 20% navy typography/fills, 10% gold accents).
* **Do** use `text-wrap: balance` on H1 and H2 display headers to ensure symmetrical text lines.
* **Do** verify contrast ratios hit >= 4.5:1 on all form labels, input values, and placeholder texts.

### Don't:
* **Don't** use SaaS-cream or beige background gradients (avoid warm-tinted default templates).
* **Don't** round card corners beyond 16px (no over-rounded shapes like 24px/32px card outlines).
* **Don't** use gradient text clipping or glassmorphic blur layers.
* **Don't** add colored accent side-stripes (like `border-left-4`) to cart callouts or error warnings.
* **Don't** put uppercase kicker eyebrows on every section header; use them only to denote a sequence.
