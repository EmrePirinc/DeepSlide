# Google Stitch Prompt — DeepSlide "Detaylar & Ayarlar" Panel

## Context
This is the "Details & Settings" tab content for DeepSlide, an AI-powered voice-controlled presentation editor. The user switches to this tab from the visual canvas. It must feel like a premium control center — compact, elegant, not a boring form page.

## Design System (MUST MATCH existing app)
- Background: #070D1F (cosmic slate)
- Surface: #0C1324, Surface-variant: #191F31
- Primary: #6366F1 (indigo), Primary-container: #4F46E5
- Text: #F8FAFC (on-surface), #94A3B8 (on-surface-variant)
- Font: Inter, weights 400-900
- Icons: Google Material Symbols Outlined
- Glass effects: backdrop-blur-16px, rgba(255,255,255,0.03) background
- Border radius: 1.25rem (cards), 0.75rem (inputs), 9999px (pills)
- No 1px solid borders — use tonal shifts and rgba(255,255,255,0.05) ghost borders
- Labels: text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant

## What to Design
A single-page settings panel (max-width 720px, centered) that contains ALL of these controls in a compact, visually stunning layout. Think: Tesla car settings screen meets Figma's right panel — NOT a boring form.

### Section 1: AI Engine (most important, top)
A horizontal toggle card showing two options side by side:
- Left: "Gemini Ultra" — cloud icon, subtitle "Bulut · Yüksek doğruluk", selected state = indigo glow ring
- Right: "Yerel AI" — computer icon, subtitle "Gizli · İnternet gereksiz", shows model name "gemma4" as a small pill badge
- Selected option: glass card with indigo left border accent (3px), slight scale
- Unselected: dimmed, hover to preview

### Section 2: Quick Settings Row (horizontal, single line)
Three compact dropdown selectors in ONE horizontal row, equally spaced:
- "Dil" (Language): dropdown showing flag + "Türkçe", options: TR/EN/DE/FR
- "Tema" (Theme): 3 small color circle swatches (black, white, navy) — click to select, active has indigo ring
- "Efekt" (Transition): dropdown showing "Zoom", options: Zoom/Fade/Pan

Each selector: glass-card mini container, icon on left, current value, chevron_down on right. Height: 44px. All three fit in one row with gap-3.

### Section 3: Analysis Progress (conditional, only when analyzing)
A slim horizontal progress bar spanning full width:
- Left: "Slayt Analizi" label (10px uppercase)
- Right: "8 / 12" counter + animated indigo dot
- Below: thin 4px progress bar with indigo fill + glow shadow
- "Durdur" ghost button on far right

### Section 4: Export Actions
A horizontal row of 3 icon-only buttons with labels below:
- PDF icon + "PDF" label (pro badge if free user)
- PPT icon + "PPT" label (pro badge if free user)  
- Smartphone icon + "Dikey Video" label
Each button: 64x64 glass card, centered icon (24px), label below (10px)
Hover: lift + indigo border glow

### Section 5: Privacy & Security (bottom)
Compact row:
- Left: "Şifre Koruması" text + small lock icon
- Right: Toggle switch (indigo when on)
- If on: password input appears below (single line, inline)

### Section 6: Rehearsal Mode (bottom CTA)
Full-width button at the very bottom:
- "Prova Modu" with mic icon
- Style: outline, glass background, full width
- Hover: fills with indigo/10%

## Layout Rules
- Use a single scrollable column, max-width 720px, centered
- Group related items in horizontal rows wherever possible (NOT vertical stacking)
- Each section separated by 32px spacing, NO divider lines (use whitespace)
- Section headers: 10px uppercase tracking-[0.2em] text-on-surface-variant
- All interactive elements: 44px minimum touch target
- Total visible height: should fit in viewport without scrolling (or minimal scroll)
- The entire panel should feel like a cockpit dashboard, not a settings form

## Visual Reference
The surrounding app uses:
- Cards with rounded-[2rem] and premium-shadow
- Hover effects: -translate-y-3, scale-110 on images
- Glass panels with backdrop-blur-32px
- Indigo (#6366F1) used sparingly as "laser" — only for active states and CTAs
- Everything dark, luxurious, cinematic

## Typography
- Section headers: 10px, font-black, uppercase, tracking 0.2em, on-surface-variant color
- Labels: 12px, font-bold, white
- Values/selections: 13px, font-semibold, white
- Descriptions: 12px, font-medium, on-surface-variant

## DO NOT
- Do not use large radio button cards (the current design has this — we're replacing it)
- Do not stack items vertically when they can fit horizontally
- Do not use full-width form inputs for dropdowns — use compact selectors
- Do not waste vertical space — everything should be dense but breathable
- Do not use standard HTML selects — use custom styled dropdowns
