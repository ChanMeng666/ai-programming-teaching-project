# Design System: AI Programming Education Platform

## Design Philosophy
Inspired by minimalist geometric artists, our design system emphasizes:
- Clean lines and basic geometric shapes (squares, circles, triangles)
- Limited color palette with bold contrasts
- Grid-based layouts
- Negative space as a design element
- Systematic repetition of visual elements
- Focus on functionality and readability

## Color System
### Primary Colors
- Deep Navy: `#1a237e` (Primary brand color)
- Pure White: `#ffffff` (Background)
- Geometric Black: `#121212` (Text)

### Secondary Colors
- Soft Blue: `#4a5fc1` (Interactive elements)
- Light Gray: `#f5f6f7` (Secondary background)
- Accent Red: `#ef5350` (Highlights)

## Typography
### Fonts
```css
--ifm-font-family-base: 'Space Grotesk', system-ui, -apple-system;
--ifm-font-family-monospace: 'JetBrains Mono', SFMono-Regular, Monaco;
```

### Font Sizes
- Headings:
  - h1: 2.5rem (40px)
  - h2: 2rem (32px)
  - h3: 1.5rem (24px)
- Body: 1rem (16px)
- Code: 0.9375rem (15px)

## Layout Guidelines
### Grid System
- 12-column grid
- Gutter width: 24px
- Maximum content width: 1200px
- Responsive breakpoints:
  - Mobile: 320px
  - Tablet: 768px
  - Desktop: 1024px

### Spacing Scale
```css
--space-xs: 0.25rem;  /* 4px */
--space-sm: 0.5rem;   /* 8px */
--space-md: 1rem;     /* 16px */
--space-lg: 1.5rem;   /* 24px */
--space-xl: 2rem;     /* 32px */
```

## Component Design

### Navigation
- Fixed header with geometric logo
- Horizontal menu for desktop
- Hamburger menu for mobile
- Active states use geometric shapes as indicators

### Hero Section
```css
.hero {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
  min-height: 80vh;
}
```

### Code Blocks
- Dark background: `#1e1e1e`
- Syntax highlighting inspired by geometric patterns
- Rounded corners: 4px
- Inner padding: 1.5rem

### Cards
```css
.card {
  border: none;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
}
```

## Implementation Guide

### 1. Update docusaurus.config.js
```javascript
module.exports = {
  themeConfig: {
    navbar: {
      style: 'dark',
      logo: {
        alt: 'Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        // Navigation items
      ],
    },
    prism: {
      theme: require('prism-react-renderer/themes/nightOwl'),
    },
  },
};
```

### 2. Custom CSS Variables
Create `src/css/custom.css`:
```css
:root {
  --ifm-color-primary: #1a237e;
  --ifm-color-primary-dark: #172069;
  --ifm-color-primary-darker: #151e63;
  --ifm-color-primary-darkest: #111851;
  --ifm-color-primary-light: #1d2893;
  --ifm-color-primary-lighter: #1f2a99;
  --ifm-color-primary-lightest: #232fab;
  
  --ifm-code-font-size: 0.9375rem;
  --ifm-font-size-base: 16px;
  --ifm-line-height-base: 1.5;
  --ifm-spacing-horizontal: var(--space-md);
}
```

### 3. Landing Page Structure
Create `src/pages/index.js`:
```javascript
import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <Layout
      title="AI Programming Education"
      description="Learn AI programming through collaborative examples">
      <header className="hero">
        <div className="container">
          <h1 className="hero__title">Master AI Programming</h1>
          <p className="hero__subtitle">
            Through collaborative learning and practical examples
          </p>
          <div className="buttons">
            <Link className="button button--primary button--lg">
              Get Started
            </Link>
          </div>
        </div>
      </header>
      
      {/* Feature sections */}
      <main>
        <section className="features">
          <div className="container">
            {/* Feature cards */}
          </div>
        </section>
      </main>
    </Layout>
  );
}
```

## Animation Guidelines
- Use subtle transitions (0.2-0.3s)
- Favor transforms over opacity changes
- Implement geometric reveal animations
- Keep interactions smooth and purposeful

## Responsive Design
- Mobile-first approach
- Fluid typography
- Maintainable grid system
- Adaptive layout changes at breakpoints

## Accessibility
- WCAG 2.1 AA compliance
- High contrast ratios
- Clear focus states
- Semantic HTML structure
- Screen reader friendly

## Performance Optimization
- Optimize images
- Implement lazy loading
- Minimize CSS/JS bundles
- Use system fonts when possible
- Cache static assets