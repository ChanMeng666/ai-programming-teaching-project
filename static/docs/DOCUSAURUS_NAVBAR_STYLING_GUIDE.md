# Docusaurus Navbar Styling Guide: Lessons Learned

> A comprehensive guide for Docusaurus developers on navbar and sidebar styling, based on real debugging experience.

> **Update (July 2026):** This is a historical case study. The core techniques below — especially the `backdrop-filter` / stacking-context lesson — are still generally applicable to any Docusaurus site. However, the **this-site-specific** examples (a `dark` navbar, dark-mode overrides, box-shadows, glass blur, and the `--color-*` variables) no longer reflect this project. Since the 2026-07 "MindMarket" redesign the site uses a **light-only floating white pill navbar** with no dark mode, no box-shadows, and no `backdrop-filter`. The authoritative, current implementation lives in [`src/css/navbar.css`](../../src/css/navbar.css) — read that for how the navbar is actually styled today; treat the dark-mode / glass snippets in this document as illustrative of the general technique, not as current site code.

## Table of Contents

- [Background](#background)
- [The Problem](#the-problem)
- [Root Cause Analysis](#root-cause-analysis)
- [The Solution](#the-solution)
- [Key Lessons Learned](#key-lessons-learned)
- [Best Practices for Navbar Styling](#best-practices-for-navbar-styling)
- [Complete Working Example](#complete-working-example)

---

## Background

This document records the debugging process and lessons learned from fixing a mobile sidebar navigation issue in a Docusaurus 3.8.1 project. The issue was caused by a single CSS property that broke the entire mobile navigation experience.

### Project Configuration (at the time of this debugging session)

- **Docusaurus Version**: 3.8.1
- **Navbar Style**: `dark` (configured in `docusaurus.config.js`)
- **Features Enabled**: 
  - `useCssCascadeLayers: false` (v4 future flag)
  - Rspack bundler (experimental)

> These values describe the site *when this issue was debugged*. The site no longer sets `style: 'dark'` on the navbar, and dark mode has been removed entirely (`colorMode: { defaultMode: 'light', disableSwitch: true }`). See the July 2026 note above and `src/css/navbar.css` for the current setup.

---

## The Problem

After a homepage redesign commit, the mobile sidebar navigation became broken:

1. **Symptom**: Clicking the hamburger menu button would open the sidebar, but only the header/brand section was visible
2. **The sidebar content was invisible** - users could not see or scroll through the navigation links
3. **Affected Devices**: All mobile devices and screens under 996px width

### What Users Experienced

```
┌─────────────────────────┐
│  🍔  AI Programming     │  ← Header visible
├─────────────────────────┤
│                         │
│     (Empty space)       │  ← Content invisible!
│                         │
│                         │
└─────────────────────────┘
```

---

## Root Cause Analysis

### The Culprit: `backdrop-filter`

The issue was traced to a single line of CSS added to the `.navbar` class:

```css
/* ❌ This caused the sidebar to break */
.navbar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid var(--color-light-gray);
  background-color: var(--color-background);
  backdrop-filter: blur(var(--glass-blur));  /* ← THE PROBLEM */
}
```

### Why `backdrop-filter` Breaks the Sidebar

1. **Creates a New Stacking Context**: The `backdrop-filter` property creates a new stacking context, similar to `transform`, `opacity < 1`, or `filter`.

2. **Affects Child Element Positioning**: When applied to the navbar, it interferes with how the mobile sidebar (a child/sibling element) is positioned and rendered.

3. **Browser-Specific Behavior**: The effect can vary across browsers and devices, making it particularly insidious to debug.

4. **Silent Failure**: The sidebar doesn't show an error—it simply renders invisibly or gets clipped.

### The Git Bisect That Found It

```bash
# The problematic commit
git show 505695c74c6b5120dad82e6a8306b01448ba3d28

# The last working commit
git show def1cace40147421bbdaf3df3bf5a7145f867c30
```

---

## The Solution

### Step 1: Remove `backdrop-filter` from Navbar

```css
/* ✅ Fixed navbar styling */
.navbar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid var(--color-light-gray);
  background-color: var(--color-background);
  /* backdrop-filter removed */
}
```

### Step 2: Restore Essential Navigation Styles

After fixing the sidebar visibility, we discovered that cleaning up CSS during debugging had removed important styling. The following styles needed to be restored:

#### Brand/Title Styling

```css
.navbar__brand {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--ifm-color-primary);
}

.navbar__logo {
  height: 2rem;
  margin-right: 0.5rem;
}
```

#### Hamburger Menu Icon Styling

```css
/* Light mode */
.navbar__toggle {
  color: var(--color-text-primary);
}

.navbar__toggle svg path {
  fill: var(--color-text-primary);
}

/* Dark mode */
[data-theme='dark'] .navbar__toggle {
  color: rgba(255, 255, 255, 0.9);
}

[data-theme='dark'] .navbar__toggle svg path {
  fill: rgba(255, 255, 255, 0.9);
}
```

#### Sidebar Styling

```css
/* Base sidebar styles */
.navbar-sidebar {
  background-color: var(--color-background);
  border-right: 1px solid var(--color-light-gray);
}

.navbar-sidebar__brand {
  border-bottom: 1px solid var(--color-light-gray);
  padding: 1rem;
  background-color: var(--color-background);
}

/* Sidebar links */
.navbar-sidebar__items .menu__link,
.navbar-sidebar__items .navbar__link {
  color: var(--color-text-primary);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

/* Dark mode sidebar */
[data-theme='dark'] .navbar-sidebar {
  background-color: var(--color-background);
  border-right-color: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .navbar-sidebar__items .menu__link,
[data-theme='dark'] .navbar-sidebar__items .navbar__link {
  color: rgba(255, 255, 255, 0.9);
}
```

---

## Key Lessons Learned

### 1. ⚠️ Avoid `backdrop-filter` on Navigation Elements

**Rule**: Never use `backdrop-filter` on `.navbar` or parent elements of `.navbar-sidebar`.

```css
/* ❌ DON'T do this */
.navbar {
  backdrop-filter: blur(10px);
}

/* ✅ If you need blur effect, apply it differently */
.navbar::before {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(10px);
  z-index: -1;
}
```

### 2. 🎨 Always Style Both Light and Dark Modes

When customizing navigation, always provide styles for both themes:

```css
/* Light mode */
.navbar__toggle {
  color: var(--color-text-primary);
}

/* Dark mode - MUST be explicitly defined */
[data-theme='dark'] .navbar__toggle {
  color: rgba(255, 255, 255, 0.9);
}
```

### 3. 📱 Test Mobile Views After Every CSS Change

The mobile sidebar uses different rendering than the desktop navbar. Always test:

- Hamburger menu visibility
- Sidebar opening animation
- Sidebar content scrollability
- Theme switching within sidebar

### 4. 🔍 Use Git Bisect for CSS Bugs

CSS bugs can be hard to trace. Use git bisect to find the exact commit:

```bash
git bisect start
git bisect bad HEAD
git bisect good <last-known-working-commit>
# Test each commit until you find the culprit
```

### 5. 🎯 Be Careful with Stacking Context Properties

These CSS properties create new stacking contexts and can break navigation:

| Property | Risk Level | Notes |
|----------|------------|-------|
| `backdrop-filter` | 🔴 High | Breaks navbar sidebar |
| `transform` | 🟡 Medium | Can affect fixed positioning |
| `filter` | 🟡 Medium | Similar to backdrop-filter |
| `opacity < 1` | 🟢 Low | Usually safe |
| `isolation: isolate` | 🟡 Medium | Intentional stacking context |

### 6. 📋 Docusaurus Navbar Configuration Matters

If you set `style: 'dark'` in `docusaurus.config.js`:

```javascript
navbar: {
  style: 'dark',  // This affects default colors
  // ...
}
```

You MUST provide explicit color overrides for both themes to ensure visibility.

---

## Best Practices for Navbar Styling

### DO ✅

1. **Use CSS custom properties** for colors to maintain theme consistency
2. **Test on real mobile devices**, not just browser dev tools
3. **Provide complete dark mode styles** for all navigation elements
4. **Use specific selectors** to avoid conflicts with Docusaurus defaults
5. **Document your custom styles** for future maintenance

### DON'T ❌

1. **Don't use `backdrop-filter`** on navbar or its ancestors
2. **Don't remove Docusaurus default styles** without replacement
3. **Don't forget mobile-specific styles** in media queries
4. **Don't assume CSS changes are isolated** - always test navigation
5. **Don't use `!important` excessively** - it makes debugging harder

---

## Complete Working Example

Here's a complete, tested navbar styling setup:

```css
/* ===========================================
   Navbar Base Styles
   =========================================== */

.navbar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid var(--color-light-gray);
  background-color: var(--color-background);
  /* NO backdrop-filter here! */
}

.navbar__brand {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--ifm-color-primary);
}

.navbar__link {
  color: var(--ifm-color-primary);
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

/* ===========================================
   Hamburger Menu & Theme Toggle
   =========================================== */

.navbar__toggle,
.clean-btn {
  color: var(--color-text-primary);
}

.navbar__toggle svg path,
.clean-btn svg path {
  fill: var(--color-text-primary);
}

/* ===========================================
   Mobile Sidebar
   =========================================== */

.navbar-sidebar {
  background-color: var(--color-background);
  border-right: 1px solid var(--color-light-gray);
}

.navbar-sidebar__brand {
  border-bottom: 1px solid var(--color-light-gray);
  background-color: var(--color-background);
}

.navbar-sidebar__items .menu__link,
.navbar-sidebar__items .navbar__link {
  color: var(--color-text-primary);
  font-weight: 500;
}

/* ===========================================
   Dark Mode Overrides
   =========================================== */

[data-theme='dark'] .navbar {
  background-color: var(--color-background);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .navbar__toggle,
[data-theme='dark'] .clean-btn {
  color: rgba(255, 255, 255, 0.9);
}

[data-theme='dark'] .navbar__toggle svg path,
[data-theme='dark'] .clean-btn svg path {
  fill: rgba(255, 255, 255, 0.9);
}

[data-theme='dark'] .navbar-sidebar {
  background-color: var(--color-background);
  border-right-color: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .navbar-sidebar__items .menu__link,
[data-theme='dark'] .navbar-sidebar__items .navbar__link {
  color: rgba(255, 255, 255, 0.9);
}

/* ===========================================
   Mobile-Specific Styles
   =========================================== */

@media screen and (max-width: 996px) {
  .navbar__toggle {
    color: var(--color-text-primary) !important;
  }
  
  .navbar__toggle svg path {
    fill: var(--color-text-primary) !important;
  }
  
  [data-theme='dark'] .navbar__toggle {
    color: rgba(255, 255, 255, 0.9) !important;
  }
  
  [data-theme='dark'] .navbar__toggle svg path {
    fill: rgba(255, 255, 255, 0.9) !important;
  }
}
```

---

## Debugging Checklist

When navbar/sidebar issues occur, check these in order:

- [ ] Is `backdrop-filter` used on `.navbar` or ancestors?
- [ ] Are both light and dark mode styles defined?
- [ ] Are mobile-specific styles in `@media (max-width: 996px)` block?
- [ ] Is the hamburger icon visible (check SVG fill color)?
- [ ] Does the sidebar have proper `background-color`?
- [ ] Are `z-index` values conflicting?
- [ ] Is `position: fixed/absolute` being affected by stacking context?

---

## References

- [Docusaurus Styling Documentation](https://docusaurus.io/docs/styling-layout)
- [MDN: backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [MDN: Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)

---

*Document created: November 2025*  
*Based on debugging experience from the AI Programming Education Platform project*

