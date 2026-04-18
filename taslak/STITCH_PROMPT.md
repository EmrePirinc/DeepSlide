# DeepSlide — Google Stitch UI Redesign Prompt

> Bu dosyayi Google Stitch'e parcalar halinde veya tek seferde yapistir.
> Her ekran icin ayri Stitch oturumu acabilirsin.

---

## GENEL TANIM

Build a modern, premium SaaS presentation app called "DeepSlide". It is a voice-controlled, Prezi-style zoom presentation tool. Users upload images, AI extracts keywords from each image, and during the presentation the user speaks — speech recognition matches spoken words to keywords and the matching image zooms to fullscreen with smooth animation.

Design language: Clean, spacious, glass-morphism accents, subtle gradients, modern sans-serif typography. Dark mode primary, light mode secondary. Think: Linear meets Notion meets Prezi. No clutter — every pixel earns its place.

Color palette: Deep navy/charcoal backgrounds (#0a0a0f, #111827), vibrant blue-purple accent (#6366f1 indigo / #8b5cf6 violet), soft white text (#f8fafc), muted gray for secondary (#64748b). Success: emerald (#10b981). Danger: rose (#f43f5e). Warning: amber (#f59e0b).

Typography: Inter or Satoshi for UI, JetBrains Mono for code/stats. Font weights: 400 body, 500 labels, 600 headings, 700 hero.

Border radius: 12px cards, 8px buttons/inputs, 16px modals, full-round for avatars and pills.

Spacing scale: 4px base. Generous whitespace — let things breathe.

---

## SCREEN 1: LOGIN PAGE

### Layout
Full viewport height. Split layout on desktop: left 55% hero illustration area, right 45% form area. On mobile: stacked, form only with small logo header.

### Left Panel (Desktop only)
- Deep gradient background: from #0a0a0f bottom-left to #1e1b4b top-right
- Large floating 3D-style illustration or abstract geometric shapes suggesting "presentation + voice + AI"
- Subtle animated particles or floating dots in the background (decorative)
- App name "DeepSlide" in large bold white text (32px)
- Tagline below: "Speak. Your slides follow." in muted gray (16px)
- 3 small feature pills at bottom: "Voice Control", "AI Keywords", "Prezi Zoom" — each with an icon and glass-morphism background

### Right Panel (Form)
- Centered vertically in a card with subtle border (1px white/10%) and glass effect (backdrop-blur)
- "Welcome back" heading (24px, semibold)
- "Sign in to your account" subtext (14px, muted)
- Email input field (full width, 44px height, rounded-lg, subtle border, placeholder "name@company.com")
- Password input field (same style, with show/hide eye icon toggle)
- "Forgot password?" link aligned right (12px, accent color)
- Primary button "Sign In" (full width, 44px, gradient from indigo to violet, rounded-lg, bold white text, hover: slight brightness increase + shadow)
- Divider: horizontal line with centered "or" text in muted gray
- Google sign-in button (full width, outline style, white bg, Google G icon on left, "Continue with Google" text)
- Bottom text: "Don't have an account?" + "Sign up" link in accent color

---

## SCREEN 2: SIGNUP PAGE

### Layout
Same split layout as login.

### Right Panel (Form)
- "Create your account" heading
- "Start presenting smarter" subtext
- Full name input
- Email input
- Password input (with strength indicator bar below: red/yellow/green gradient fill)
- Confirm password input
- Checkbox: "I agree to Terms of Service and Privacy Policy" (links in accent color)
- Primary button "Create Account" (same gradient style)
- Divider + Google signup button
- Bottom: "Already have an account?" + "Sign in" link

---

## SCREEN 3: DASHBOARD (Main page after login)

### Layout
Full app shell: Fixed top header (56px) + collapsible left sidebar (240px) + main content area.

### Header Bar
- Sticky top, full width
- Background: dark with subtle bottom border (1px white/5%)
- Glass effect: backdrop-blur-xl
- Left: Logo icon (32x32 rounded-lg, gradient indigo-violet background, "DS" white text) + "DeepSlide" text (18px, semibold)
- Center: Nothing (clean)
- Right side items in a row with 8px gaps:
  - Notification bell icon button (ghost style, with red dot badge if notifications)
  - Theme toggle (sun/moon icon button)
  - User avatar (32x32 rounded-full) — clicking opens dropdown menu:
    - User name + email at top
    - Separator
    - "Profile" with user icon
    - "Billing" with credit card icon
    - "Settings" with gear icon
    - Separator
    - "Sign out" with logout icon (text in rose/red)

### Sidebar
- Fixed left, full height below header
- Background: slightly lighter than main bg (#0f1117)
- Top section:
  - "New Presentation" button (full width, primary gradient, rounded-lg, + icon, 40px height, font-medium)
  - 12px gap below
- Navigation items (each 36px height, rounded-md, full width):
  - Icon (18px) + label, 8px gap
  - Items: "All Presentations" (grid icon), "Recent" (clock icon), "Favorites" (star icon), "Archive" (archive icon)
  - Active item: indigo/10% background + indigo text + left 3px accent border
  - Hover: white/5% background
- Separator (1px, white/5%)
- "Folders" section header (12px, uppercase, tracking-wider, muted text, with + icon button on right to add folder)
- Folder list:
  - Each folder: folder icon + name (14px), truncated
  - Hover: shows "..." menu icon (rename, delete, change color)
  - Drag-drop reordering supported (visual: blue drop indicator line)
  - Active folder: same style as nav active
- Bottom of sidebar:
  - Plan badge: "Free Plan" or "Pro" pill
  - If free: subtle "Upgrade" link below
  - Storage usage: tiny progress bar (e.g., "3/15 presentations")

### Main Content Area
- Padding: 24px
- Top row: flex between
  - Left: "My Presentations" (24px, bold) + count badge ("12 presentations" pill)
  - Right: View toggle (grid/list icon buttons) + Sort dropdown ("Recent", "Name", "Created") + Search input (200px, rounded-full, magnifying glass icon, expand on focus to 320px with animation)

- Search expanded state: Full width below header, large input (48px height), with real-time filtering + highlight matching text in results

### Presentation Grid
- Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop, 4 cols wide
- Gap: 16px

### Presentation Card
- Card: rounded-xl (12px), subtle border (white/5%), overflow hidden
- Thumbnail area: aspect-video (16:9), shows first image as cover or gradient placeholder with title text
  - Bottom-left: small image count badge (e.g., "8 slides" pill, glass background)
  - Top-right: favorite star icon (toggle, filled yellow when active)
- Body: 16px padding
  - Title: 14px, font-semibold, single line truncated
  - Row below: creation date (12px, muted) + folder name badge (if in folder)
- Hover state: entire card lifts (translateY -2px) + shadow increases + border brightens
- Click: navigates to editor
- Right-click or "..." button (top-right of card, appears on hover): context menu
  - "Open" — arrow-up-right icon
  - "Present" — play icon
  - "Duplicate" — copy icon
  - "Move to folder" — folder icon, submenu with folder list
  - "Rename" — pencil icon
  - Separator
  - "Delete" — trash icon, rose/red text

### Empty State (no presentations)
- Centered in main area
- Large illustration or abstract icon (presentation + sparkle)
- "No presentations yet" (20px, semibold)
- "Create your first AI-powered presentation" (14px, muted)
- Primary button "Create Presentation" (gradient, large)
- Below: 3 small cards in a row showing quick-start options:
  - "Blank" — empty canvas icon
  - "From Template" — grid/layout icon
  - "AI Wizard" — sparkle/magic icon

---

## SCREEN 4: NEW PRESENTATION PAGE

### Layout
Centered card (max-width 640px) on dark background.

### Tab Selector (top)
- 3 tabs in a pill group: "Blank", "Template", "AI Wizard"
- Active tab: solid background (indigo), white text
- Inactive: transparent, muted text, hover brightens

### Tab: Blank
- Title input (large, 20px font, full width, minimal border — just bottom underline style)
- Description textarea (optional, 14px, 3 rows, subtle border)
- Column count selector: 3 visual toggle buttons showing grid icons (3/4/5 columns)
- Primary button "Create" (right-aligned)

### Tab: Template
- Grid of 6 template cards (2x3):
  - Each card: small preview thumbnail (abstract colored layout) + title + short description
  - Templates: "Business Report", "Education", "Portfolio", "Pitch Deck", "Photo Story", "Minimal"
  - Selected: ring-2 indigo border + check icon overlay
- Below grid: Title input + "Create from Template" button

### Tab: AI Wizard
- Large input area: "What is your presentation about?" (textarea, 4 rows, 16px font)
- Below: Language selector dropdown (Turkish, English, German, French)
- Below: Slide count slider (5-20 slides, with number display)
- "Generate Outline" button (gradient, with sparkle icon)
- Loading state: skeleton outline + "AI is creating your outline..." text with animated dots
- Generated result: numbered list of slide topics, each editable, with drag handles for reorder, + delete per item, + "Add slide" button at bottom
- "Create Presentation" button

---

## SCREEN 5: EDITOR PAGE (/presentation/[id])

This is the main workspace. Complex layout.

### Layout
Full viewport. Header (56px) + main workspace below.

### Editor Header (custom, not app header)
- Left: Back arrow button + Presentation title (editable inline — click to edit, shows input)
- Center: Tab bar — "Canvas", "Keywords", "Settings", "Analytics" (rounded pill tabs)
- Right: Action buttons in a row:
  - "Analyze All" button (outline, with sparkle icon, shows progress badge "3/10" during analysis)
  - "Export" dropdown button (PDF, PPTX, Vertical Video — Pro items show lock icon)
  - "Present" button (primary gradient, play icon, prominent)

### Left Panel: Slide Thumbnails (width: 220px, collapsible)
- Vertical scrollable list
- Each thumbnail: 
  - Aspect-video mini preview of the image
  - Below: truncated title or image filename (12px)
  - Left edge: order number (1, 2, 3...)
  - Active: ring-2 indigo, slight scale up
  - Drag handle (grip dots icon) on left for reorder
  - Hover: shows delete X button top-right
- Bottom of panel: "Upload Images" button (dashed border, + icon, full width)
- Drop zone: entire panel glows indigo when dragging files over

### Main Canvas Area
- Background: slightly darker than sidebar (#0a0a0f)
- Grid of uploaded images:
  - Dynamic columns (3, 4, or 5 — user selectable)
  - Gap: 12px
  - Each image card:
    - Rounded-lg image (aspect-square or aspect-video based on image ratio)
    - Below image: keyword badges row
      - Each badge: pill shape, small (10px text), glass background
      - Colors by category: blue for object, purple for concept, emerald for color, amber for action, rose for emotion
      - Max 4 visible, "+3 more" overflow pill
    - Analysis status overlay (centered on image):
      - Pending: gray pulse dot
      - Analyzing: spinning loader + "Analyzing..." text
      - Completed: brief green check flash, then hidden
      - Failed: red ! icon + "Retry" button
    - Hover: slight scale (1.02) + shadow + shows action bar at top:
      - Edit keywords (tag icon)
      - View full size (expand icon)
      - Delete (trash icon)
    - Click: opens keyword editor panel

### Right Panel: Keyword Editor (width: 320px, slides in from right when image selected)
- Header: Selected image thumbnail (small) + filename
- Keyword list:
  - Each keyword row:
    - Drag handle
    - Category color dot
    - Keyword text (editable input)
    - Confidence bar (thin, colored by confidence level)
    - Synonyms: small "+" button, expanding to show synonym pills
    - Delete X button
  - "Add Keyword" button at bottom (dashed, + icon)
- Below keyword list:
  - "Synonyms" section: expandable per keyword, shows editable pill inputs
  - "Re-analyze" button (outline, refreshes AI analysis for this image)

### Canvas Controls (floating, bottom-center)
- Pill-shaped floating toolbar (glass background, rounded-full)
- Items: Zoom slider (50%-200%) + Fit button + Column count selector (3/4/5) + Upload button

### Upload Drop Zone (full canvas overlay when dragging)
- Full canvas area turns into a dashed-border drop zone
- Centered: cloud-upload icon + "Drop images here" text
- Background: indigo/5%
- Border: dashed indigo/30%

---

## SCREEN 6: PRESENT MODE (/presentation/[id]/present) — MOST IMPORTANT

Full immersive experience. No browser chrome visible (fullscreen API).

### Pre-Presentation Check (Modal overlay before starting)
- Dark overlay
- Centered card (480px max-width)
- "Ready to present?" heading
- Checklist:
  - Microphone: green check or red X with "Grant permission" button
  - Camera (optional): status indicator
  - Images loaded: "10/10 ready" with progress bar
  - Speech recognition: provider name + status
- "Start Presentation" large primary button (only active when all checks pass)
- "Skip checks" small link below

### Cover Slide (First screen)
- Full black/dark background
- Centered:
  - Presentation title (48px, bold, white, letter-spacing tight)
  - Author name below (16px, muted)
  - Date below (14px, muted)
- Subtle Ken Burns animation on background (slow zoom in)
- "Press any key or speak to begin" hint at bottom (12px, muted, pulsing opacity)

### Overview Mode (Grid view during presentation)
- All images in a responsive grid (like canvas but larger, fills viewport)
- Each image: rounded-lg, subtle shadow
- Matched/active images: glow effect (box-shadow: 0 0 20px indigo/40%), scale 1.05
- Inactive images: brightness(0.7), slight blur
- Smooth transitions between states (300ms)

### Focused Mode (Single image zoom — THE CORE EXPERIENCE)
- Full viewport, single image centered
- Image: max 85vh height, auto width, object-contain
- Background: theme color (black, white, or navy)
- Transition IN: Framer Motion layoutId animation — image smoothly zooms from grid position to center (spring animation, 400ms)
- Transition OUT: reverse zoom back to grid

### Presentation HUD (Heads-Up Display overlays)

All overlays are semi-transparent, glass-morphism style, non-intrusive.

**Top-left cluster:**
- Slide counter: "3 / 10" (glass pill, 14px, monospace font)
- If recording: red dot + "REC" + timer "02:34" (glass pill, red accent)
- If livestreaming: "LIVE" badge (pulsing red dot + text)

**Top-right cluster (control buttons in a row, 8px gaps):**
- Microphone toggle (on/off, green dot when active)
- Subtitle toggle (CC icon)
- Language selector (small dropdown: TR, EN, DE, FR)
- QR Share button (QR icon — opens overlay)
- Presenter View button (monitor icon — opens second window)
- Fullscreen toggle
- Exit button (X, with confirmation)

**Bottom-center:**
- Keyword hint bar (glass pill, max-width 600px, centered):
  - "Say:" label in muted text
  - Keyword pills in a row (active keywords for current context)
  - Each pill: glass bg, 12px text
  - Pulsing subtle glow when speech is being recognized
  - When a word matches: matched keyword pill briefly flashes green

**Bottom-left:**
- Navigation arrows: < > (large, glass circle buttons, 48px)
- Between arrows: slide progress dots (one per slide, active = filled indigo)

**Bottom overlay (if subtitles enabled):**
- Subtitle strip: bottom-center, max-width 80%, glass background
- Text: 18px, white, slight text-shadow for readability
- Fades in/out smoothly as speech is recognized
- Shows last 2 lines of transcript

**Match Indicator (appears when keyword matches):**
- Centered above keyword hint bar
- Green flash: "Matched: [keyword]" (fades after 1.5s)
- Confidence bar: thin line that fills based on match score

### Recording Controls
- Recording button: floating, rounded-full, red bg when recording
  - Idle: glass bg, white mic+record icon
  - Recording: red bg, white square (stop) icon, pulsing red ring animation
  - Click to start/stop
- Timer: next to button, monospace "00:00" counting up
- After stop: small toast notification "Recording saved" with "Share" link

### Post-Presentation Modal (appears when exiting present mode after recording)
- Overlay modal (560px max-width)
- "Great presentation!" heading with confetti animation
- Stats row: Duration (timer icon), Slides covered (layers icon), Keyword matches (check icon), Match rate % (target icon)
- Sections:
  - "Share Recording" — input with copy button (auto-generated link)
  - "Send via Email" — email input + send button
  - "Generate Summary" — button (AI generates summary from transcript)
  - "Download" dropdown — Full recording (MP4), Audio only (MP3), Transcript (SRT), Summary (PDF)
- "Close" button at bottom

---

## SCREEN 7: BILLING / PRICING PAGE

### Layout
Centered, max-width 960px, generous vertical padding.

### Header
- "Choose your plan" (32px, bold, centered)
- "Unlock the full power of AI presentations" (16px, muted, centered)

### Billing Toggle
- Centered pill toggle: "Monthly" | "Yearly"
- Yearly shows: "Save 25%" badge (emerald pill)

### Plan Cards (2 cards side by side, equal height)

**Free Plan Card:**
- Background: subtle dark card (#111827)
- Border: white/5%
- Header: "Free" (20px, bold) + "Get started" (14px, muted)
- Price: "$0" (36px, bold) + "/month" (14px, muted)
- Feature list (space-y-3):
  - Each item: check icon (muted) + text (14px)
  - "15 images per presentation"
  - "2 voice-controlled slides"
  - "Basic speech recognition"
  - "Community support"
  - Crossed out (line-through, dimmed): "PDF/PPTX export", "No watermark", "HD recording", "Analytics"
- Button: "Current Plan" (outline, disabled) or "Downgrade" (outline)

**Pro Plan Card (FEATURED):**
- Background: subtle gradient (indigo/5% to violet/5%)
- Border: indigo/30% (glowing)
- Top-right: "Popular" badge (small, indigo bg, white text)
- Header: "Pro" (20px, bold) + "For professionals" (14px, muted)
- Price: "$12" (36px, bold) + "/month" (14px, muted)
  - If yearly toggle: "$9/month" with "$108/year billed annually" below
  - Regional prices: show flag + local currency
- Feature list:
  - Each item: check icon (emerald/green) + text
  - "Unlimited images"
  - "Unlimited voice control"
  - "All speech providers (Deepgram, Gemini, Whisper)"
  - "PDF & PPTX export"
  - "No watermark"
  - "1080p HD recording"
  - "Presentation analytics"
  - "Priority support"
  - "Live streaming"
  - "Interactive quiz"
- Button: "Upgrade to Pro" (primary gradient, prominent, full width)
  - Or "Manage Subscription" if already Pro

### Below cards
- "All plans include" section: 3 small icon+text items in a row
  - "Unlimited presentations" — infinity icon
  - "AI keyword extraction" — sparkle icon
  - "Cloud sync" — cloud icon
- FAQ accordion (4-5 questions, expandable)

---

## SCREEN 8: PROFILE PAGE

### Layout
Centered, max-width 640px.

### Profile Header Card
- Gradient top border (indigo to violet, 3px)
- Large avatar: 80x80, rounded-full, ring-4 background color
- Name: 20px, bold
- Email: 14px, muted
- Plan badge: pill next to name ("Pro" indigo bg or "Free" gray bg)

### Edit Form
- Full name input
- Email input (disabled/readonly, gray)
- Language preference dropdown
- Theme preference: 3 visual toggle cards (Dark, Light, Corporate) — each shows mini preview
- "Save Changes" button

### Statistics Card
- Grid of 4 stat boxes (2x2):
  - "Presentations Created" — number (bold, 28px)
  - "Total Slides" — number
  - "Presentations Given" — number
  - "Total Recording Time" — formatted duration

### Subscription Section
- Current plan name + status badge (active/expired)
- Next billing date
- "Manage Subscription" button
- "View Invoices" link

### Danger Zone
- Red-bordered card at bottom
- "Delete Account" button (outline, destructive/red)
- Warning text below

---

## SCREEN 9: ANALYTICS PAGE (/presentation/[id]/analytics)

### Layout
Max-width 1024px, within app shell.

### Summary Cards Row (4 cards)
- "Total Sessions" — number + trend arrow (up green / down red)
- "Avg Duration" — formatted time
- "Keyword Match Rate" — percentage with visual progress ring
- "Slides Covered" — fraction (e.g., "8/10")

### Charts Section
- **Session History**: Line chart (x: dates, y: session count) — last 30 days
- **Time Per Slide**: Horizontal bar chart (y: slide names, x: seconds)
- **Match Accuracy**: Donut chart (matched vs unmatched keywords)
- **Top Keywords**: Ranked list with horizontal progress bars

### Session List
- Table/list below charts
- Columns: Date, Duration, Slides, Match Rate, Actions (view recording)
- Sortable headers
- Pagination at bottom

---

## SCREEN 10: SPEAKER NOTES (/presentation/[id]/notes)

### Layout
Split view: left 40% slide thumbnails, right 60% note editor.

### Left Panel
- Vertical scrollable slide list
- Each: thumbnail + slide number
- Active: ring-2 indigo

### Right Panel
- Selected slide image (small, top)
- Below: Rich text area for notes (markdown supported)
  - Toolbar: Bold, Italic, Bullet list, Numbered list
  - Placeholder: "Add speaker notes for this slide..."
  - Auto-save indicator: "Saved" check or "Saving..." spinner
- Below textarea: "Keywords for this slide" — read-only badge list
- Tip card at bottom: "These notes appear in Presenter View during your presentation"

---

## SCREEN 11: RECORDING ARCHIVE (/archive)

### Layout
Same app shell, main content area.

### Grid of Recording Cards
- Each card:
  - Thumbnail: video frame capture or gradient placeholder
  - Overlay: duration badge (bottom-right, "05:23")
  - Body: presentation title, recording date, file size
  - Actions: Play, Share, Download, Delete
- Empty state: "No recordings yet. Present and record to see them here."

---

## SCREEN 12: QUIZ JOIN PAGE (/join/[sessionId])

### Layout
Mobile-first, centered, max-width 400px. This is what AUDIENCE members see on their phones.

### Join Screen
- DeepSlide mini logo at top
- "Join the Quiz" heading
- Session/room code display (large, monospace, letterspaced)
- Name input: "Your name" (large, 48px height)
- "Join" button (full width, primary)

### Quiz Active Screen
- Question text (18px, bold, centered)
- 4 answer buttons (full width each, stacked, large touch targets — 56px height)
  - Colors: A=blue, B=green, C=orange, D=purple
  - Selected: filled color, others dim
  - After submit: correct flashes green, wrong flashes red
- Timer bar at top (animated countdown, shrinking width)
- Score display: top-right, current points

### Leaderboard Screen (between questions)
- Podium-style top 3: 1st (large, center, gold), 2nd (left, silver), 3rd (right, bronze)
- Remaining participants: ranked list with scores
- "You" row highlighted with accent color

---

## SCREEN 13: SHARE PORTAL (/r/[id])

### Layout
Public page. Centered, max-width 800px. No login required.

### Video Player
- Custom video player (dark theme)
- Large play button overlay on thumbnail
- Controls: play/pause, seek bar, volume, playback speed, fullscreen, download
- Rounded-xl container

### Below Player
- Presentation title (24px, bold)
- Author name + date
- "DeepSlide" branded footer with "Create your own" CTA button

---

## GLOBAL COMPONENTS

### Toast Notifications
- Bottom-right, stacked
- Glass background, rounded-lg
- Types: success (emerald left border), error (rose), info (blue), warning (amber)
- Auto-dismiss after 5s, with close button
- Slide-in from right animation

### Loading States
- Skeleton screens: animated shimmer gradient (dark gray → slightly lighter → dark gray, left to right)
- Buttons: spinner icon replaces text, button disabled
- Full page: centered spinner + "Loading..." text

### Modal Dialogs
- Centered overlay (bg black/60%, backdrop-blur-sm)
- Card: max-width varies, rounded-2xl, dark card background
- Close X button top-right
- Animation: scale from 95% to 100% + opacity 0 to 1 (200ms)

### Tooltips
- Small dark card, rounded-md, 12px text
- Arrow pointer toward trigger
- Delay: 500ms hover
- Position: top by default

### Dropdown Menus
- Dark card, rounded-lg, subtle border
- Items: 36px height, full width, hover bg white/5%
- Separator: 1px white/5%
- Icons on left, shortcut keys on right (muted)
- Animation: scale + opacity from top

### Cookie Consent Banner
- Fixed bottom, full width
- Glass bar: "We use cookies for analytics" + "Accept" button + "Learn more" link
- Dismiss animation: slide down

### Paywall Banner
- Fixed bottom, centered, max-width 560px
- Glass card: icon + text + "Upgrade" button + close X
- Appears when free user hits a limit
- Slide-up entrance animation

### Watermark (Free Plan)
- Fixed bottom-right during presentation
- "DeepSlide" text, 12px, white/20% opacity
- Subtle, non-intrusive

---

## RESPONSIVE BEHAVIOR

### Mobile (< 640px)
- Sidebar: hidden, hamburger menu in header toggles slide-in drawer
- Dashboard grid: 1 column
- Editor: full width canvas, panels slide in as overlays
- Present mode: simplified HUD, larger touch targets
- All buttons: minimum 44px touch target

### Tablet (640px - 1024px)
- Sidebar: collapsible (icon-only mode, 64px width)
- Dashboard grid: 2 columns
- Editor: thumbnail panel collapsible

### Desktop (> 1024px)
- Full layout as described
- Dashboard grid: 3-4 columns
- All panels visible simultaneously

---

## ANIMATIONS & MICRO-INTERACTIONS

- **Page transitions**: Fade + slight slide-up (200ms)
- **Card hover**: translateY(-2px) + shadow increase (150ms ease)
- **Button press**: scale(0.97) on mousedown (100ms)
- **Tab switch**: indicator slides with spring animation
- **Sidebar collapse**: width transition (200ms ease-in-out)
- **Modal open**: backdrop fade-in + card scale-up (200ms)
- **Toast enter**: slide from right (300ms spring)
- **Presentation zoom**: Framer Motion layoutId spring (stiffness 200, damping 30)
- **Keyword match**: flash green (300ms) + scale pulse (1.1 → 1.0)
- **Recording button**: pulsing red ring (infinite, 1s)
- **Skeleton shimmer**: left-to-right gradient sweep (1.5s infinite)
- **Focus ring**: ring-2 accent color with ring-offset-2 (keyboard navigation)
