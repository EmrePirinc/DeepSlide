# Product Context

## Why DeepSlide Exists

### The Problem
Presenters using image-heavy presentations (photographers, researchers, sales, educators) face a constant friction:
- Hundreds of images to navigate manually → lose focus on speaking
- Traditional tools (PowerPoint, Keynard) require hands-on control → breaks flow
- Audience engagement drops when speaker looks at screen to click next slide

### The Real Job-To-Be-Done
"When I'm presenting live, I want slides to follow what I'm saying — so I can focus entirely on my audience without thinking about navigation."

### How DeepSlide Solves This
1. **Upload images** → AI automatically tags each image with 3 keywords
2. **Present naturally** → speak; voice recognition matches words to keywords
3. **Slides respond** → matching image zooms to fullscreen (Prezi-style), others fade back
4. **Auto-reset** → 10s silence returns to overview grid

## User Experience Goals

### Before DeepSlide
- Fumbling with clicker or keyboard mid-sentence
- Losing slide location in 200-image deck
- Looking at screen instead of audience

### With DeepSlide
- Zero manual navigation in presentation mode
- Can't "lose your place" — overview always shows all slides
- Full eye contact with audience; slides are ambient, reactive

### Emotional Journey
```
Upload → "Easy, just drag & drop"
Analysis → "AI found the right keywords automatically"
Presentation → "It just works — I talked and the right slide appeared"
Review → "I can see exactly which keywords triggered which slides"
```

## Business Context

### Market
- Primary: Turkey (iyzico payment, Turkish UI, TR speech recognition default)
- Secondary: Global (EN/DE/FR language support added)
- Segment: Professional presenters, B2B sales, educators, conference speakers

### Monetization
- **Free tier**: 3 presentations, watermark overlay, no export → generates leads
- **Premium**: $15/month via iyzico subscription → removes all limits
- Conversion hook: Users hit 3-presentation limit after trying the product

### Competitive Positioning
| Tool | Missing from them |
|------|------------------|
| Prezi | No voice control, no AI keyword extraction |
| PowerPoint | No zoom canvas, no voice nav |
| Gamma.app | No voice, no image-first workflow |
| Beautiful.ai | No voice, no manual image library |

**Unique position**: The only tool that does AI analysis + voice navigation + Prezi-style zoom together.

## Product Constraints
- **Client-side first**: All images stored in IndexedDB (no server upload for images)
- **Privacy**: Images never leave the browser unless user explicitly uses cloud AI
- **Offline-capable**: Local AI (Ollama) and Whisper WASM work without internet
- **Fast**: Voice → slide transition target latency < 600ms
