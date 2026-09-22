---
name: tactical-ui-engineering
description: Use when designing, building, or refining high-performance web user interfaces for mission-critical, emergency, security, or command operations. Covers glassmorphic ergonomics, cinematic video hero stages, floating pill navigation, accessible typography, responsive touch layouts, and micro-interactions.
---

# Tactical UI Engineering Skill

## Overview
This skill provides the design guidelines, architectural patterns, and CSS/JS standards for engineering mission-critical, high-aesthetics user interfaces (campus security portals, emergency dispatch grids, and incident monitoring consoles).

## Core Aesthetic & Ergonomic Principles

### 1. Visual Depth & Glassmorphism
- **Cinematic Stage Containers**: Use full-bleed or bordered stage hero cards (`min-height: 600px`, `border-radius: 32px`, `overflow: hidden`).
- **Video Backgrounds**:
  - Always pair looping background `<video>` elements (`autoplay`, `muted`, `loop`, `playsinline`, `preload="auto"`) with a multi-stop dark gradient overlay (e.g. `linear-gradient(180deg, rgba(10, 15, 25, 0.68) 0%, rgba(10, 15, 25, 0.45) 45%, rgba(10, 15, 25, 0.92) 100%)`).
  - Set video `z-index: 1`, overlay `z-index: 2`, and foreground interactive content `z-index: 5` or higher.
- **Translucent Pill Surfaces**:
  - Floating navigation pill: `background: rgba(10, 15, 25, 0.92)`, `backdrop-filter: blur(18px)`, `border: 1px solid rgba(255, 255, 255, 0.14)`.
  - Box shadows: `0 10px 25px rgba(0, 0, 0, 0.35)`.

### 2. Information Hierarchy & Role Segmentation
- **Zero Confusion**: Public civilians and students must only see public services (Overview, Watch Checkpoints, Emergency Hotlines, Quick Alert).
- **Protected Actions**: Administrative console tabs and clearance approval counters must NEVER appear on unauthenticated public surfaces.
- **Status Indicators**: Use live pulsating indicator dots (`animation: livePulse 2s infinite`) with green (`#10b981`), amber (`#f59e0b`), or red (`#ef4444`) to convey network and sector status instantly.

### 3. Responsive Touch & Mobile Ergonomics
- **Breakpoints**:
  - Desktop: Standard 2-column or 4-column cards.
  - Tablet/Mobile (`@media (max-width: 900px)`): Collapse grids to single-column (`1fr`), hide dense desktop controls, convert horizontal menus to scrollable or drawer layouts.
- **Touch Targets**: Minimum 44px height for interactive buttons and form controls to facilitate rapid one-handed mobile emergency reporting.
- **Zero Horizontal Jitter**: Ensure `box-sizing: border-box`, `width: 100%`, and prevent elements from exceeding container widths on small screens.

### 4. Color Palette & Typography Tokens
```css
:root {
  --color-canvas: #0b0f19;
  --color-surface-navy: #0f172a;
  --color-accent-blue: #2563eb;
  --color-accent-amber: #f59e0b;
  --color-status-green: #10b981;
  --color-status-red: #ef4444;
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}
```
