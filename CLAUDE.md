# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Programming Education Platform built with Docusaurus 3.8.1. It's a static documentation website focused on teaching AI-assisted programming through interactive tutorials and practical projects.

### Core Architecture

- **Framework**: Docusaurus 3.8.1 with React 18
- **Content**: MDX-based documentation with versioning support (2024-winter, 2025-summer)
- **Deployment**: Vercel static site deployment
- **Localization**: Chinese (zh-Hans) language support
- **Search**: Algolia integration
- **Analytics**: Vercel Analytics

## Essential Commands

```bash
# Development
npm start          # Start development server on localhost:3000
npm run build      # Build production site
npm run serve      # Serve production build locally
npm run clear      # Clear Docusaurus cache (use when encountering build issues)

# Content Management
npm run write-translations  # Extract translatable strings
npm run write-heading-ids   # Generate heading IDs for documentation

# Deployment
npm run deploy     # Deploy to configured platform
```

## Project Structure

### Content Organization

- `/docs/` - Current version documentation
- `/versioned_docs/` - Versioned documentation archives
  - `version-2024-winter/` - Complete winter 2024 curriculum
  - `version-2025-summer/` - Summer 2025 curriculum
- `/blog/` - Blog posts with MDX support
- `/src/components/` - React components (BackToTop, HomepageFeatures, LoadingBar, WaveAnimation)
- `/src/pages/` - Custom pages (only index.js for homepage)
- `/src/theme/` - Theme customizations

### Key Configuration Files

- `docusaurus.config.js` - Main Docusaurus configuration
- `sidebars.js` - Documentation sidebar structure
- `versions.json` - Version management
- `package.json` - Dependencies and scripts

## Development Workflow

### Adding New Documentation

1. Create new MDX file in appropriate directory:
   ```bash
   # For current version
   touch docs/category/new-topic.mdx
   
   # For versioned content
   touch versioned_docs/version-2025-summer/category/new-topic.mdx
   ```

2. Add frontmatter:
   ```markdown
   ---
   title: Your Title
   sidebar_position: 1
   ---
   ```

### Adding Blog Posts

1. Create new blog post:
   ```bash
   touch blog/YYYY-MM-DD-post-title.mdx
   ```

2. Include author information (defined in `blog/authors.yml`)

### Component Development

- Components use standard React patterns
- No component library - custom CSS in `/src/css/custom.css`
- Responsive design is critical for educational content
- Dark/light theme support via Docusaurus theming

## Important Notes

- **No Testing Framework**: This project has no automated tests
- **No Linting/Formatting**: No ESLint, Prettier, or other code quality tools configured
- **Static Site**: All content is statically generated - no server-side functionality
- **Mermaid Support**: Use mermaid code blocks for diagrams
- **Video Embedding**: react-player is available for video content

## Common Tasks

### Clearing Cache Issues
```bash
npm run clear  # Clears Docusaurus cache
rm -rf node_modules/.cache  # Clear all build caches
```

### Building for Production
```bash
npm run build
# Output in ./build directory
```

### Checking Build Output
```bash
npm run serve
# Test production build at http://localhost:3000
```

### Algolia Search Configuration
- Search is configured with Algolia DocSearch
- If search returns no results, check:
  1. CORS settings in Algolia dashboard
  2. Allowed referrers include deployment URL
  3. API keys are correctly configured
- See `ALGOLIA_SETUP_GUIDE.md` for detailed troubleshooting

## Architecture Decisions

1. **Docusaurus Choice**: Selected for excellent documentation features, versioning, and educational content management
2. **MDX Usage**: Enables interactive components within documentation
3. **Vercel Deployment**: Chosen for automatic deployments and analytics
4. **No Testing**: Focus on content creation over code quality automation
5. **Experimental Features**: Using @docusaurus/faster and Rspack for improved build performance