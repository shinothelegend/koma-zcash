---
name: KOMA / Zcash
description: Original comic-print identity for stories, private support and protected reading.
colors:
  ink: "#10100f"
  stock: "#191918"
  raised: "#21211f"
  paper: "#f1ece2"
  orange: "#ff4a1c"
  yellow: "#ffd23f"
  soft: "#aaa89f"
  rule: "#34342f"
  error: "#ffb3a0"
typography:
  display:
    fontFamily: "Anton, sans-serif"
    fontSize: "clamp(50px, 7vw, 94px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Schibsted, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 550
    lineHeight: 1.08
    letterSpacing: "-0.055em"
  title:
    fontFamily: "Schibsted, Arial, sans-serif"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Schibsted, Arial, sans-serif"
    fontSize: "16px"
    lineHeight: 1.55
  control:
    fontFamily: "Schibsted, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 650
  label:
    fontFamily: "Schibsted, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 550
rounded:
  field: "6px"
  control: "7px"
  container: "12px"
  card: "14px"
spacing:
  compact: "12px"
  control-inline: "20px"
  standard: "24px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "#14100b"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  input:
    backgroundColor: "#121211"
    textColor: "{colors.paper}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
  comic-card:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.paper}"
    rounded: "{rounded.card}"
  filter-selected:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "9px 16px"
  choice-selected:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "15px 18px"
---

# Design System: KOMA / Zcash

## Overview

**Creative North Star: "The Comic Print Launchpad"**

KOMA inherits its original comic-print world: black stock, warm paper, orange printing ink, yellow highlights, condensed Anton mastheads and real comic artwork. The user pinned that identity and its Anton/Schibsted pairing. Covers carry the personality; controls remain direct and readable. Private visual references informed the build but are not distributable assets.

Discovery is cover-led. The studio, invoices and protected reader use the same materials at a more practical density. A folded, rotated issue can carry a physical print shadow; a form remains a flat, bordered surface. New screens should extend this vocabulary while preserving original KOMA art and attribution.

This is a scan of `public/index.html`, `public/style.css` and `public/app.js`, merging the earlier inherited-world note. Visual evidence includes the 1440px desktop, 375px home/studio, locked-reader and guided-reader captures. The finish-review disposition covers the five scored fixes after two rounds only; it does not certify the full application, backend, payment path or feature parity. `MIGRATION.md` remains the feature-gap record.

**Key Characteristics:**
- Original orange-and-black KOMA identity with warm paper contrast.
- Condensed mastheads above calm, practical Schibsted controls.
- Real artwork, physical issue framing and restrained application surfaces.
- Honest testnet labels, explicit preview states and source-derived totals.

## Colors

Orange ink and yellow marks interrupt a nearly black field; warm paper carries primary text and the physical comic sheet.

### Primary
- **Orange printing ink** (`orange`): primary actions, headline emphasis, the K mark, active navigation and the featured issue masthead.

### Secondary
- **Yellow highlight** (`yellow`): visible keyboard focus, selected canon choices, genre accents, notices and the printed privacy stamp.

### Neutral
- **Black ink** (`ink`): page ground and comic outlines.
- **Black stock** (`stock`): secondary buttons, cards, support sidebars and receipts.
- **Raised stock** (`raised`): selected catalog filters.
- **Warm paper** (`paper`): primary text, light actions and comic-page material.
- **Soft ink** (`soft`): supporting copy, metadata and unselected navigation.
- **Printed rule** (`rule`): section dividers and application surface edges.
- **Error ink** (`error`): inline failure text, paired with an explanatory message.

### Named Rules
**The Ink and Paper Rule.** Orange and yellow serve actions, status or print character; artwork supplies the wider color range.

## Typography

**Display Font:** Anton, sans-serif fallback; locally served `Anton-Regular.ttf`.

**Body Font:** Schibsted, Arial, sans-serif; locally served variable `SchibstedGrotesk.ttf` (weights 100–900).

**Character:** Anton brings the compressed, emphatic comic masthead. Schibsted gives forms, chapter descriptions and payment instructions a quieter reading rhythm. No separate mono identity is established; address and memo blocks use the browser's monospace presentation.

### Hierarchy
- **Display:** the frontmatter records the base h1. The discovery hero overrides it with `clamp(60px, 6.3vw, 98px)` and a near-solid line height (`0.99`); narrow-phone overrides end at `50px / 1.02`. Studio and series headings use their own responsive display sizes.
- **Headline:** the base h2 is Schibsted, with contextual section sizes rather than a rigid modular ratio.
- **Title:** the base h3 supports comic titles and compact panels.
- **Body:** base reading text uses the frontmatter body role; paragraphs are capped at `68ch`. Descriptive hero copy is larger on desktop and resolves to `13px / 1.5` on narrow phones.
- **Control:** actions use the frontmatter control role; compact reader and studio actions reduce to 10–12px in their observed contexts.
- **Label:** form labels use the label role. Supporting metadata is usually 10–12px; print labels on the featured issue are deliberately smaller and are not a general-purpose UI text scale.

### Named Rules
**The Masthead Rule.** Keep Anton for KOMA branding, major display statements and comic-print elements; use Schibsted for operational reading and interaction.

## Layout

Header, main and footer share a centered maximum width (`1600px`), desktop horizontal padding (`4vw`) and thin dividing rules. Above `1700px`, their horizontal padding becomes `65px`. Common gaps use the recorded spacing steps with contextual 18–30px variations; the build does not expose a universal spacing-token API.

At desktop the hero uses a two-column spread (`1.05fr 1fr`, 5% gap) and the catalog uses three equal columns. A series spread pairs story content with a sticky support panel. The authenticated studio has left navigation, working content and a sticky helper column. Invoices pair a QR column with payment details.

At `1100px` and below, the composition tightens, cover heights reduce, and the studio helper disappears. At `800px` and below, the hero, series spread, login and invoice become single columns; the catalog becomes two columns. Header navigation disappears and a fixed bottom navigation takes its place (`65px` with safe-area padding). Main gutters become 5%; body padding reserves the navigation height and notices move above it. Studio navigation becomes a two-column tab grid, and paired form fields stack.

At `470px` and below, the catalog becomes one column and launchpad metrics become a two-column group with the third metric spanning both. The home hero compresses to fit the phone viewport: privacy footnote hides, artwork crop becomes `160px` high, the cover stage becomes `290px`, and the final privacy-stamp override places it `78px` from the stage bottom. Treat these as the current home composition, not defaults for every surface. Long invoice addresses and memos wrap; copy controls can move to a new row.

The reader is centered at `1000px`; whole-page mode uses two panel columns with wide panels spanning both. Guided mode shows one panel at a time with artwork contained within `72vh`. On phones the toolbar wraps and comic gutters tighten. Full-screen mode provides its own padded, scrolling dark surface.

## Elevation & Depth

Application surfaces are flat, separated by tonal layers and borders. Physical depth is reserved for the featured printed issue and its stamp: the issue uses `15px 22px 0 #050505, 0 30px 70px #0007`; the stamp uses `4px 4px 0 #000`. The rear issue's rotated, bordered silhouette reinforces a stack of printed comics. These belong to the inherited comic material, not to general cards or forms.

### Named Rules
**The Printed Object Rule.** Rotations and hard offset shadows describe comic sheets and stamps; keep operational containers level and bordered.

## Shapes

Controls have compact softened corners; cards and sidebars use larger rounded containers, as recorded in the frontmatter. Cover imagery is clipped inside card silhouettes. Empty states and the create-series invitation use dashed borders. Comic panels use strong black rectangular rules, speech balloons use rounded bubble shapes, and the featured issue remains square-edged. Circular markers belong to small cover actions and status marks.

## Components

### Buttons

Clear, compact actions. Primary buttons use orange ink; the default light action uses warm paper and secondary actions use stock. Base controls are at least `48px` high with a one-pixel rule and the recorded control radius. Hover changes a primary action to `#e94219` and lifts it `1px`; default/secondary hover uses yellow. Disabled buttons reduce opacity to `.5` and use a not-allowed cursor. All focusable elements receive a yellow `3px` focus outline with `4px` offset.

Transitions are brief and state-driven: controls use `160ms ease-out`, cards `180ms ease-out`, and issue/image transforms `200ms ease-out`. Reduced-motion preference disables transitions and animated transforms and restores automatic scrolling.

### Chips and filters

Catalog filters are compact rounded buttons: transparent and muted at rest, raised stock with paper text when selected. Narrow-phone filters retain at least `44px` height. Cover genre labels sit over the artwork on a translucent dark patch. Genre text elsewhere uses yellow uppercase metadata. A genre label describes content; filter selection changes the catalog.

### Cards / Containers

Comic cards lead with real cropped artwork, followed by creator, title, pitch and a ruled metadata row. The stock ground and printed-rule edge carry the frontmatter card radius. Hover lightens the border, lifts the card `4px` and scales the cover to `1.025`; reduced motion suppresses those transforms. A missing cover uses a typographic placeholder rather than fabricated art. The dashed launch invitation is a distinct action within the shelf.

Support panels, receipts and studio containers reuse the same stock/rule vocabulary. Source-derived counts and backing belong in compact fact rows, not ornamental charts.

### Inputs / Fields

Dark inset fields have a one-pixel `#4c4c45` edge, paper text, yellow caret, the recorded field radius and a minimum `48px` height. Hover lightens the edge to `#737166`; focus uses the shared visible outline. Textareas resize vertically from `110px`. Labels remain outside the field. Inline status appears beneath the related action; failures use error ink and explanatory text. The code does not establish a separate invalid-field border treatment.

### Navigation

Desktop navigation is Schibsted, muted at rest and paper when active or hovered; the active route adds a thin orange underline. Phone navigation uses inline stroke SVGs and labels, with the current route in orange. The central Create action rises above the bottom rail as an orange tab. The skip link becomes visible on keyboard focus.

Studio tabs select panes without leaving the studio. Desktop tabs form a vertical rail; mobile tabs form a two-column grid, with the selected item carrying orange text and a bottom rule.

### Comic issue and reader

The signature cover combines an orange KOMA masthead, real comic artwork, a warm-paper title foot, a rear issue and a yellow stamp. Preserve original artwork and provenance; private reference-board images are not publishing assets.

Reader controls offer whole-page/guided modes, previous/next, keyboard arrows, horizontal swipes and full-screen where supported. Boundary navigation disables correctly. Creator-only access is explicitly labelled `CREATOR PREVIEW · NO READER PAYMENT CLAIMED`; it must not imply a verified reader purchase. The reader displays source provenance beneath the art.

### Empty, loading and error states

Loading is text with a small orange square. Empty library, missing invoice session, absent chapters, no canon rounds, no saved generations and unmatched search each explain the current state; relevant states provide a route back or an action. A locked chapter renders a full-page explanation and links to the series/launchpad and library, never protected artwork. General failures show a display statement, the returned error and a shelf link. Toasts use a yellow live-status surface; form progress stays alongside the form. Missing AI setup disables generation and names the required setup. These states describe actual app status rather than simulating progress or success.

### Data and trust labels

The launchpad reads its catalog from `/api/series`; published-series count, chapter totals and verified direct backing are derived from that response. Comic cards and funding progress use the same source data. Values are formatted from integer zatoshi units into testnet `TAZ`. No fixture count is a permanent design token. Keep the testnet edition label, direct-payment explanation and app-managed vote/access limitations visible in the relevant flows. A creator preview is evidence of rendered content only. No trades, token returns, earnings or paid entitlements may be invented to populate a surface.

## Do's and Don'ts

### Do:
- **Do** preserve KOMA's original orange/black identity, Anton/Schibsted pairing and real comic art.
- **Do** use warm paper, strong comic rules and physical print depth where they describe actual comic material.
- **Do** keep keyboard focus, reduced motion, semantic controls and phone navigation usable across new surfaces.
- **Do** show explicit empty/error states and distinguish creator previews from verified reader access.
- **Do** derive metrics from their actual source and preserve testnet, provenance and trust labels.

### Don't:
- **Don't** publish private reference-board images or treat them as KOMA artwork.
- **Don't** replace original KOMA projects or interpret this visual record as full migration completion.
- **Don't** present mock trades, made-up backing, fake success or creator previews as real payment evidence.
- **Don't** spread print-object rotations and offset shadows into ordinary forms or application cards.
- **Don't** generalize the smallest issue/stamp print labels into a default UI text scale.

Not canonized: residual text-glyph arrows, the decorative letter privacy mark, unused eyebrow CSS and the smallest print-label sizes are recorded as build details rather than reusable interface standards; route icons already use SVG, and new operational icons should follow that implementation. Their presence is not erased by the limited finish-review disposition.
