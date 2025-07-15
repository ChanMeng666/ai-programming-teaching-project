// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import { Analytics } from '@vercel/analytics/react';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'AI Programming',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://ai-programming-teaching-project.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Future flags for Docusaurus v4 preparation and performance optimizations
  future: {
    // Enable all v4 future flags for easier migration
    v4: {
      useCssCascadeLayers: true,
      removeLegacyPostBuildHeadAttribute: true,
    },
    // Enable Docusaurus Faster experimental features
    experimental_faster: {
      rspackBundler: true,
      rspackPersistentCache: true,
      ssgWorkerThreads: true,
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Edit this page links to your repository
          editUrl:
            'https://github.com/ChanMeng666/ai-programming-teaching-project/tree/main/',
          // 版本控制配置
          lastVersion: '2025-summer',  // 设置2025-summer为默认版本
          includeCurrentVersion: false,  // 不包含current版本
          versions: {
            '2025-summer': {
              label: '2025年夏季她行活动',
              path: '/',  // 设置为根路径，这样用户访问网站时默认看到这个版本
              banner: 'none',
            },
            '2024-winter': {
              label: '2024年冬季她行活动',
              path: '2024-winter',
              banner: 'none',
            },
          },
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Edit this page links to your repository
          editUrl:
            'https://github.com/ChanMeng666/ai-programming-teaching-project/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      // Algolia DocSearch 配置
      algolia: {
        // The application ID provided by Algolia - Application ID
        appId: '8VHXTP609D',

        // Public API key: it is safe to commit it - Search API Key
        apiKey: 'f70da822145b6159e198fc85147e0564',

        // Crawler Name (使用实际存在的pages索引)
        indexName: 'ai_programming_teaching_project_vercel_app_8vhxtp609d_pages',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        externalUrlRegex: 'external\\.com|domain\\.com',

        // Comment out or adjust this section to fix URL mapping issues
        /*
        replaceSearchResultPathname: {
          from: '/docs/', // or as RegExp: /\/docs\//
          to: '/',
        },
        */

        // Optional: Algolia search parameters
        searchParameters: {
          // 启用模糊搜索和前缀搜索
          typoTolerance: true,
          hitsPerPage: 20,
          // 可以添加其他搜索参数
          facetFilters: [],
        },

        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',

        // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
        insights: false,

        // Optional: 启用调试模式
        debug: false,

        // Optional: 自定义搜索模式
        searchMode: 'search',

        //... other Algolia params
      },
      // 文档侧边栏配置
      docs: {
        sidebar: {
          hideable: true,              // 允许隐藏侧边栏
          autoCollapseCategories: true, // 自动折叠未选中的类别
        },
      },
      // 颜色模式配置
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'AI Programming',
        logo: {
          alt: 'AI Programming Logo',
          src: 'img/logo.svg',
        },
        style: 'dark',
        hideOnScroll: true,  // 滚动时隐藏导航栏
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '教程',
          },
          {to: '/blog', label: '博客', position: 'left'},
          {
            type: 'docsVersionDropdown',
            position: 'left',
            dropdownActiveClassDisabled: true,
            versions: {
              '2025-summer': {label: '2025年夏季她行活动'},
              '2024-winter': {label: '2024年冬季她行活动'},
            },
          },
          {
            href: 'https://github.com/ChanMeng666/ai-programming-teaching-project',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '学习资源',
            items: [
              {
                label: '入门教程',
                to: '/docs/intro',
              },
              {
                label: '实践案例',
                to: '/docs/practice/blog-planning',
              },
              {
                label: '进阶应用',
                to: '/docs/advanced/',
              },
            ],
          },
          {
            title: '社区',
            items: [
              {
                label: '技术讨论',
                href: 'https://github.com/ChanMeng666',
              },
              {
                label: '问题反馈',
                href: 'https://github.com/ChanMeng666',
              },
              {
                label: '加入我们',
                href: 'https://github.com/ChanMeng666',
              },
            ],
          },
          {
            title: '更多',
            items: [
              {
                label: '博客',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/ChanMeng666',
              },
            ],
          },
        ],
        copyright: `<div class="footer-copyright">
            <div>Copyright © ${new Date().getFullYear()} AI Programming Education.</div>
            <div>Code & Crafted with 💛 by <a class="footer-link" href="https://github.com/ChanMeng666/ai-programming-teaching-project">Chan Meng</a>.</div>
            </div>`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      customScripts: [
        {
          content: `
            import { Analytics } from '@vercel/analytics/react';
            export default function AnalyticsWrapper() {
              return <Analytics />;
            }
          `,
          defer: true,
        },
      ],
    }),
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
};

export default config;
