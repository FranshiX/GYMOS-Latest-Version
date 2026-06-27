

````
# 01_DESIGN_SYSTEM.md — GymOS Visual Identity & Token System

> **Version**: 1.0
> **Theme**: Dark-Only OLED Optimized
> **Languages**: Arabic (RTL) + English (LTR)
> **Status**: Active

---

## 1. Color Tokens

```css
:root {
  /* Backgrounds */
  --bg-base:     #080808;
  --bg-surface:  #121212;
  --bg-card:     #1A1A1A;
  --bg-elevated: #242424;

  /* Primary — Volt Green */
  --color-primary:     #B3FF00;
  --color-primary-dim: rgba(179, 255, 0, 0.12);
  --color-primary-glow: rgba(179, 255, 0, 0.25);

  /* Secondary — Tech Cyan */
  --color-secondary:     #00E5FF;
  --color-secondary-dim: rgba(0, 229, 255, 0.12);

  /* Semantics */
  --color-success: #4CAF7D;
  --color-danger:  #E05252;
  --color-warning: #E8A838;

  /* Text */
  --text-primary:   #F0F0F0;
  --text-secondary: #A8A8A8;
  --text-tertiary:  #6A6A6A;
  --text-inverse:   #1A1A1A;

  /* Borders */
  --border-default: #2A2A2A;
  --border-subtle:  #1E1E1E;

  /* Spacing (4px base) */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Radius */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   16px;
  --radius-xl:   20px;
  --radius-full: 9999px;
}
````

## 2. Typography System

### 2.1 Font Stacks

|**Role**|**English**|**Arabic**|
|---|---|---|
|Display / Headlines|Hanken Grotesk|IBM Plex Arabic|
|Body / UI|Inter|IBM Plex Arabic|
|Mono / Numbers|JetBrains Mono|JetBrains Mono|

> **Why IBM Plex Arabic?**
> 
> - Geometric and modern — fits the sports tech identity
>     
> - Supports weights from Light to Bold
>     
> - Free via Google Fonts
>     
> - Doesn't look "traditional" like Cairo or Tajawal
>     

### 2.2 Font Import (index.html or globals.css)

HTML

```
<link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)">
<link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossorigin>
<link href="[https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Arabic:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap](https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Arabic:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap)" rel="stylesheet">
```

### 2.3 Font Token Variables

CSS

```
:root {
  --font-display: "Hanken Grotesk", system-ui, sans-serif;
  --font-body:    "Inter", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", monospace;
  --font-arabic:  "IBM Plex Arabic", system-ui, sans-serif;
}

/* RTL Override — Applied automatically when dir="rtl" */
[dir="rtl"] {
  --font-display: "IBM Plex Arabic", system-ui, sans-serif;
  --font-body:    "IBM Plex Arabic", system-ui, sans-serif;
}
```

### 2.4 Type Scale

CSS

```
:root {
  --text-xs:   0.75rem;   /* 12px — Labels, captions */
  --text-sm:   0.875rem;  /* 14px — Secondary UI text */
  --text-base: 1rem;      /* 16px — Body default */
  --text-lg:   1.125rem;  /* 18px — Card titles */
  --text-xl:   1.25rem;   /* 20px — Section headers */
  --text-2xl:  1.5rem;    /* 24px — Screen titles */
  --text-3xl:  1.875rem;  /* 30px — Hero numbers (KPIs) */
  --text-4xl:  2.25rem;   /* 36px — Display / Splash */

  --font-normal:    400;
  --font-medium:    500;
  --font-semibold:  600;
  --font-bold:      700;
  --font-extrabold: 800;

  --leading-tight:  1.2;
  --leading-normal: 1.5;
  --leading-loose:  1.75;
}
```

## 3. Elevation & Shadow System

CSS

```
:root {
  /* Subtle depth for cards */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);

  /* Cards and modals */
  --shadow-md: 0 4px 16px rgba(0,0,0,0.5);

  /* Drawers and overlays */
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.6);

  /* Primary glow — CTAs, active states */
  --shadow-primary: 0 0 20px rgba(179, 255, 0, 0.20);

  /* Secondary glow — charts, add actions */
  --shadow-secondary: 0 0 20px rgba(0, 229, 255, 0.15);
}
```

## 4. Animation Tokens

CSS

```
:root {
  /* Duration */
  --duration-fast:   150ms;
  --duration-normal: 250ms;
  --duration-slow:   400ms;
  --duration-slower: 600ms;

  /* Easing */
  --ease-out:    cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* For interactive elements */
}
```

### 4.1 Animation Philosophy

|**Principle**|**Application**|
|---|---|
|**Purposeful**|Every movement conveys meaning — success, transition, confirmation|
|**Fast by default**|Nothing exceeds 400ms in standard UI|
|**Mobile-first**|Avoid parallax and heavy animations|
|**Reduced Motion**|Always respect `prefers-reduced-motion`|

CSS

```
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 5. Iconography

### Recommended Library: **Lucide React** (already present in the project)

> No need to add a second library — Lucide is sufficient and consistent.

### Icon Principles

|**Rule**|**Detail**|
|---|---|
|Default Size|`20px` for UI, `24px` for Nav, `16px` for inline|
|Weight|`strokeWidth={1.5}` — gives a premium and light feel|
|Color|Always inherits from `currentColor`|
|No fill icons|We use outline only for consistency|

TypeScript

```
// ✅ Correct usage
<Dumbbell size={20} strokeWidth={1.5} className="text-primary" />

// ❌ Avoid
<Dumbbell size={20} fill="#B3FF00" />
```

## 6. Component Token Map

> How tokens are used at the component level

|**Component**|**Background**|**Border**|**Text**|
|---|---|---|---|
|App Shell|`--bg-base`|—|—|
|Card|`--bg-card`|`--border-default`|`--text-primary`|
|Input|`--bg-elevated`|`--border-default`|`--text-primary`|
|Modal / Drawer|`--bg-surface`|`--border-subtle`|`--text-primary`|
|Primary Button|`--color-primary`|—|`--text-inverse`|
|Ghost Button|transparent|`--border-default`|`--text-secondary`|
|Active Nav Item|`--color-primary-dim`|—|`--color-primary`|
|Badge Success|`--color-success` dim|—|`--color-success`|

## 7. Tailwind v4 Integration

CSS

```
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary:   #B3FF00;
  --color-secondary: #00E5FF;
  --color-danger:    #E05252;
  --color-success:   #4CAF7D;
  --color-warning:   #E8A838;

  --color-bg-base:     #080808;
  --color-bg-surface:  #121212;
  --color-bg-card:     #1A1A1A;
  --color-bg-elevated: #242424;

  --color-text-primary:   #F0F0F0;
  --color-text-secondary: #A8A8A8;
  --color-text-tertiary:  #6A6A6A;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  --font-display: "Hanken Grotesk", system-ui, sans-serif;
  --font-body:    "Inter", system-ui, sans-serif;
  --font-arabic:  "IBM Plex Arabic", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", monospace;
}
```

## 8. Open Questions (Must be resolved before implementation)

- [ ] Should we add **Haptic Feedback** upon completing exercises? (Web Vibration API)
    
- [ ] Which animation library? — **Framer Motion** or CSS-only?
    
- [ ] Do we use **glassmorphism** in any element or stick to flat dark?
    


