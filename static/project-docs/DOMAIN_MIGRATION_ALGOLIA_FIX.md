# Fixing Algolia DocSearch After Domain Migration (Vercel to Cloudflare Pages)

## Background

This project migrated its hosting from **Vercel** to **Cloudflare Pages**, changing the production domain from `ai-programming-teaching-project.vercel.app` to `programming.chanmeng.org`.

After migration, Algolia DocSearch stopped returning search results. This guide documents the complete diagnosis and fix process, serving as a reference for developers facing similar domain migration issues.

## Problem Summary

| Symptom | Root Cause |
|---|---|
| Algolia crawler returns 0 records | Crawler still pointed to the old Vercel URL |
| Search returns no results | Index built from stale/unreachable domain |
| Clicking search results shows 404 | `contextualSearch: false` mixed Chinese and English results; cross-locale client-side routing failed |

---

## Part 1: Codebase URL Updates

The old Vercel domain was referenced in **10 files** across the codebase. All instances must be updated to the new domain before redeploying.

### 1.1 Core Configuration

**`docusaurus.config.js`** (critical - this is what Algolia uses to build the sitemap)

```js
// Before
url: 'https://ai-programming-teaching-project.vercel.app',

// After
url: 'https://programming.chanmeng.org',
```

**`static/robots.txt`** (Algolia crawler reads this for sitemap discovery)

```txt
# Before
Sitemap: https://ai-programming-teaching-project.vercel.app/sitemap.xml

# After
Sitemap: https://programming.chanmeng.org/sitemap.xml
```

### 1.2 SEO and Structured Data Components

These files contain hardcoded URLs in structured data (JSON-LD) and meta tags that search engines and AI systems consume.

**`src/components/GEOHead/index.js`** — 3 occurrences:
- Platform URL in AI instructions
- Citation link in recommendation section
- Publisher URL in structured data

**`src/theme/BlogPostItem/Content/index.js`** — 2 occurrences:
- Publisher logo URL in BlogPosting structured data
- `mainEntityOfPage` URL

For both files, a global find-and-replace of the old domain works safely.

### 1.3 Static Content Files

**`static/llms.txt`** — 5 occurrences across platform URL, link recommendations, and technology stack sections.

**`static/project-docs/ALGOLIA_SETUP_GUIDE.md`** — Update allowed referrers list and deployment platform references.

**`README.md`** — Link definitions at the bottom of the file (demo, docs, blog links).

### 1.4 Removing Vercel-Specific Dependencies

After migrating away from Vercel, the `@vercel/analytics` package no longer functions. Remove it to avoid unnecessary bundle size and failed network requests.

**Files to clean up:**

1. **`docusaurus.config.js`**:
   - Remove `import { Analytics } from '@vercel/analytics/react';`
   - Remove the `customScripts` block containing the Analytics wrapper

2. **`src/pages/index.js`**:
   - Remove `import { Analytics } from '@vercel/analytics/react';`
   - Remove `<Analytics />` from JSX

3. **Uninstall the package**:
   ```bash
   npm uninstall @vercel/analytics
   ```

### 1.5 Files to NOT Modify

Some files reference `vercel.app` as part of tutorial examples or student project links. These are intentional and should be left unchanged:

- `versioned_docs/*/practice/index.mdx` — example URLs like `my-app.vercel.app`
- `versioned_docs/*/tutorials/docusaurus-tutorial.mdx` — example URLs like `my-blog.vercel.app`
- `versioned_docs/*/advanced/cases/*.mdx` — student project showcase links
- `i18n/en/` counterparts of the above
- `docs/practice/index.mdx` — example URLs

### 1.6 Verification After Code Changes

```bash
# Build the site
npm run build

# Verify sitemap uses the new domain
# Open build/sitemap.xml and confirm all URLs start with the new domain

# Verify robots.txt
# Open build/robots.txt and confirm the Sitemap directive points to the new domain
```

---

## Part 2: Algolia Crawler Reconfiguration

### 2.1 The Domain Verification Problem

Algolia Crawler requires domain verification before allowing a new domain in the crawler configuration. Attempting to change `startUrls` to an unverified domain results in:

```
Error 400: validation_error
startUrls contains forbidden items
The domain "programming.chanmeng.org" is not allowed.
```

This error also blocks changes to `sitemaps`, `discoveryPatterns`, and `pathsToMatch`.

### 2.2 Domain Verification Methods

Algolia offers four verification methods:

| Method | How It Works | Recommendation |
|---|---|---|
| **Meta Tag** | Add a `<meta>` tag to your HTML `<head>` | Requires code change and redeploy |
| **HTML File** | Upload a verification HTML file to your site root | Requires redeploy |
| **Robots.txt** | Add a comment line to `robots.txt` | Easiest if you already have the line |
| **DNS TXT** | Add a TXT record to your domain's DNS | Requires DNS access |

**Recommended approach**: Use the **Robots.txt** method. Add this line to your `static/robots.txt`:

```txt
# Algolia-Crawler-Verif: YOUR_VERIFICATION_KEY
```

The verification key is provided by Algolia in the crawler dashboard under domain verification settings.

### 2.3 When Verification Fails: Delete and Recreate the Crawler

If the existing crawler's domain verification is stuck and cannot be updated (e.g., the old domain is no longer accessible), **delete the crawler and create a new one**:

1. **Go to Crawler > Settings > Delete Crawler**
2. **Do NOT delete** the Algolia Application or existing Indices — only the crawler itself
3. Create a new crawler in the same Application
4. During creation, set the start URL to your new domain — this triggers domain verification for the new domain from the start
5. Choose the **Robots.txt** verification method (the key should already be in your deployed `robots.txt`)

**Critical**: Keep the same **Index Name** (`ai-programming-crawler`) so the frontend configuration does not need to change.

### 2.4 Crawler Editor Configuration

After creating the new crawler, go to **Editor** and set the full configuration. The four URL-related fields that must match your new domain:

```js
new Crawler({
  // ... other settings ...
  startUrls: ["https://programming.chanmeng.org/"],
  sitemaps: ["https://programming.chanmeng.org/sitemap.xml"],
  discoveryPatterns: ["https://programming.chanmeng.org/**"],
  actions: [
    {
      indexName: "ai-programming-crawler",
      pathsToMatch: ["https://programming.chanmeng.org/**"],
      recordExtractor: ({ $, helpers }) => {
        // ... selector configuration ...
      },
    },
  ],
  // ... other settings ...
});
```

### 2.5 Start Crawling

After saving the configuration:
1. Go to **Overview**
2. Click **Start Crawling** or **Restart Crawling**
3. Wait for the crawl to complete (typically 5-15 minutes)
4. Verify the index has records > 0 under **Indices**

---

## Part 3: Fixing Cross-Locale Search Result 404s

### 3.1 The Problem

After the crawler successfully indexes the site, users may encounter a **404 page** when clicking certain search results. This happens when:

1. The site has multiple locales (e.g., `zh-Hans` and `en`)
2. `contextualSearch` is set to `false` in the Algolia config
3. Search results include pages from **all** locales
4. A user browsing the Chinese site clicks an English result (`/en/docs/...`)
5. The Docusaurus **client-side router** cannot resolve the cross-locale route and shows a 404

The server returns HTTP 200 for the page (it exists as a static file), but the SPA router fails to match it in the current locale's route table.

### 3.2 The Fix

Enable `contextualSearch` in `docusaurus.config.js`:

```js
// Before — search returns results from ALL locales and versions
algolia: {
  appId: '8VHXTP609D',
  apiKey: 'your-search-api-key',
  indexName: 'ai-programming-crawler',
  contextualSearch: false,
  searchParameters: {
    facetFilters: [],
  },
  searchPagePath: 'search',
},

// After — search filters by current locale and doc version
algolia: {
  appId: '8VHXTP609D',
  apiKey: 'your-search-api-key',
  indexName: 'ai-programming-crawler',
  contextualSearch: true,
  searchPagePath: 'search',
},
```

### 3.3 How contextualSearch Works

When enabled, Docusaurus automatically injects `facetFilters` into every search query:

- **`language`** filter: matches the user's current locale (e.g., `zh-Hans`)
- **`docusaurus_tag`** filter: matches the current doc version (e.g., `docs-default-current`)

This ensures:
- Chinese-site users only see Chinese search results
- English-site users only see English search results
- Users browsing a specific doc version see results from that version

### 3.4 Prerequisite: Index Facet Configuration

For `contextualSearch` to work, the Algolia index must have these attributes configured as facets:

```
type, lang, language, version, docusaurus_tag
```

These are typically set automatically by the crawler's `initialIndexSettings`. Verify in Algolia Dashboard under **Indices > Configuration > Facets**.

---

## Part 4: Complete Verification Checklist

After all changes are deployed:

- [ ] **Sitemap accessible**: Visit `https://your-new-domain.com/sitemap.xml` — all URLs should use the new domain
- [ ] **Robots.txt correct**: Visit `https://your-new-domain.com/robots.txt` — Sitemap directive points to the new domain
- [ ] **Algolia index populated**: Check Algolia Dashboard > Indices — record count > 0
- [ ] **Search returns results**: Open the site, use the search bar, confirm results appear
- [ ] **Search results navigate correctly**: Click several search results — confirm they open the correct page without 404
- [ ] **Cross-locale isolation**: Switch to the secondary locale, search again — confirm results are in the correct language
- [ ] **Version filtering**: If using doc versioning, browse an older version and search — confirm results match that version

---

## Quick Reference: Key Configuration Locations

| What | Where |
|---|---|
| Site production URL | `docusaurus.config.js` > `url` |
| Algolia search config | `docusaurus.config.js` > `themeConfig.algolia` |
| Sitemap URL for crawlers | `static/robots.txt` |
| Crawler domain verification | `static/robots.txt` (comment line) |
| Structured data URLs | `src/components/GEOHead/index.js` |
| Blog structured data URLs | `src/theme/BlogPostItem/Content/index.js` |
| AI/LLM content URLs | `static/llms.txt` |

---

## Lessons Learned

1. **Update `docusaurus.config.js` `url` first** — this is the single most impactful change, as it controls sitemap generation, canonical URLs, and SEO metadata.

2. **Algolia Crawler requires domain verification** — you cannot simply change the start URL. Plan for domain verification as part of your migration checklist.

3. **When the crawler is stuck, delete and recreate** — do not waste time debugging domain verification issues on an old crawler. Delete the crawler (not the Application or Index), create a new one, and verify the new domain during creation.

4. **Always enable `contextualSearch` for multi-locale sites** — disabling it causes cross-locale 404s that are confusing to diagnose because the pages exist as static files but fail in the client-side router.

5. **Search the entire codebase for the old domain** — URLs get embedded in structured data, meta tags, static files, and READMEs. Use `grep -r "old-domain.com" --include="*.{js,ts,md,txt,json}"` to find all occurrences.

6. **Preserve the Algolia Index Name** — as long as the Application ID and Index Name remain the same, no frontend code changes are needed after recreating the crawler.

---

*Last updated: February 2026*
*Related: [ALGOLIA_SETUP_GUIDE.md](./ALGOLIA_SETUP_GUIDE.md)*
