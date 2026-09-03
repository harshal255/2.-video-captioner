# Tailwind CSS v4 & Astro Dark/Light Mode Architecture Guide

> **Context / Instruction for AI Agents**: Attach or copy this guide whenever starting or debugging Tailwind CSS v4 projects with class-based Dark/Light mode theme switching.

---

## 🚨 Critical Gotcha: Tailwind CSS v4 Dark Mode Behavior

### The Problem
In **Tailwind CSS v4**, the traditional `darkMode: 'class'` key in `tailwind.config.js` is **deprecated/removed**. 
By default, Tailwind v4 evaluates all `dark:` utility classes (e.g., `dark:bg-zinc-900`, `dark:text-zinc-100`) using the browser's native **`@media (prefers-color-scheme: dark)`** media query.

**Why this breaks Light Mode on Dark OS devices**:
If a user's operating system (Windows/macOS) is set to Dark Mode, Tailwind 4 will force **ALL `dark:` classes to be active**, EVEN IF your JavaScript theme toggle removed the `.dark` class from `<html class="dark">`!
This results in a broken UI: light page background with pitch-black cards, dark header bars, and invisible text.

---

## ⚡ The Solution: Add `@custom-variant dark` in `global.css`

To make Tailwind CSS v4 strictly respect the `.dark` class on the `<html>` root element (toggled via JavaScript / LocalStorage), you **MUST** include the following directive at the very top of your main CSS entry file:

```css
/* src/styles/global.css */
@import "tailwindcss";

/* Enforce class-based Dark Mode instead of OS media query */
@custom-variant dark (&:where(.dark, .dark *));
```

### How `@custom-variant dark` Works
- `&` represents the current selector context.
- `:where(.dark, .dark *)` checks if the current element or any ancestor up to `<html>` has the `.dark` class.
- Now, `dark:bg-zinc-900` will **ONLY** trigger when `document.documentElement` actually contains `class="dark"`.

---

## 🎨 Golden Rules for Light & Dark Theme Symmetry

When building UI components, follow these 5 core rules to ensure 100% theme consistency:

### 1. Dual-Layer Color Pairs (Base + Dark Prefix)
Every themed container, text element, and border **MUST** have an explicit base style (Light Mode) and a `dark:` prefix (Dark Mode).

| Element Type | Light Mode (Base) | Dark Mode (`dark:`) |
| :--- | :--- | :--- |
| **Page Body** | `bg-slate-50 text-slate-900` | `dark:bg-zinc-950 dark:text-zinc-100` |
| **Card Surface** | `bg-white border-slate-200` | `dark:bg-zinc-900 dark:border-zinc-800` |
| **Subtle Container** | `bg-slate-100 border-slate-300` | `dark:bg-zinc-950/60 dark:border-zinc-800` |
| **Input / Dropdown** | `bg-white border-slate-300 text-slate-900` | `dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100` |
| **Muted Text** | `text-slate-600` | `dark:text-zinc-400` |

### 2. Never Hardcode Dark Colors Without Light Alternatives
❌ **WRONG**:
```tsx
<div className="bg-zinc-950/40 border border-zinc-800 text-zinc-500">
  Ad Banner Container
</div>
```
*Result*: Renders as a pitch-black box on light pages!

✅ **CORRECT**:
```tsx
<div className="bg-slate-200/60 dark:bg-zinc-950/40 border border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
  Ad Banner Container
</div>
```

### 3. Anti-Flicker Inline Script in `<head>`
Place an inline `<script>` inside `Layout.astro` (or `index.html`) **before any CSS/body renders** to eliminate theme flashing on page load:

```html
<script is:inline>
  (function() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  })();
</script>
```

### 4. React Theme Toggle Button Pattern
Use a client-side hydrated toggle component (`client:load`) to handle user clicks cleanly:

```tsx
// src/components/ThemeToggle.tsx
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center cursor-pointer transition-all shadow-sm"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
    </button>
  );
}
```

### 5. Standard Color Palettes
- **Light Theme**: `slate` series (`slate-50`, `slate-100`, `slate-200`, `slate-300`, `slate-700`, `slate-900`).
- **Dark Theme**: `zinc` series (`zinc-950`, `zinc-900`, `zinc-800`, `zinc-700`, `zinc-400`, `zinc-100`).
- **Accent Highlight**: Amber (`amber-500`, `amber-600`, `amber-400`).

---

## 📋 Checklist for AI Agents Working on Theme Issues

When an AI agent is asked to fix or build Dark/Light mode in a Tailwind CSS v4 codebase:

- [ ] Check if `global.css` has `@custom-variant dark (&:where(.dark, .dark *));`.
- [ ] Check for hardcoded `bg-black`, `bg-zinc-900`, `bg-zinc-950` without light mode base classes.
- [ ] Verify there are no typos in Tailwind color classes (e.g. `zinc-850` does not exist).
- [ ] Verify `Layout.astro` or main HTML head includes the theme anti-flicker script.
- [ ] Run `npm run build` or `npx astro build` to confirm static rendering succeeds.
