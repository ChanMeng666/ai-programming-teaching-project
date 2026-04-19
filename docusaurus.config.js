// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'AI Programming',
  tagline: '通过实践案例学习人工智能开发',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://programming.chanmeng.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'ChanMeng666', // Usually your GitHub org/user name.
  projectName: 'ai-programming-teaching-project', // Usually your repo name.

  trailingSlash: true,

  onBrokenLinks: 'warn',

  // RSS 自动发现 + SEO head tags
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'AI Programming 教学博客 - RSS 2.0',
        href: '/blog/rss.xml',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'alternate',
        type: 'application/atom+xml',
        title: 'AI Programming 教学博客 - Atom',
        href: '/blog/atom.xml',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'alternate',
        type: 'application/feed+json',
        title: 'AI Programming 教学博客 - JSON Feed',
        href: '/blog/feed.json',
      },
    },
    // TODO: Replace YOUR_VERIFICATION_CODE with actual Google Search Console verification code
    {
      tagName: 'meta',
      attributes: {
        name: 'google-site-verification',
        content: 'YOUR_VERIFICATION_CODE',
      },
    },
  ],

  // Future flags for Docusaurus v4 preparation and performance optimizations
  future: {
    // Enable all v4 future flags for easier migration
    v4: {
      useCssCascadeLayers: false, // 临时禁用以修复移动端侧边栏显示问题
      removeLegacyPostBuildHeadAttribute: true,
    },
    // Enable Docusaurus Faster experimental features
    experimental_faster: {
      rspackBundler: false,  // Temporarily disabled for Docusaurus 3.9.2 compatibility
      rspackPersistentCache: false,
      ssgWorkerThreads: true,
    },
  },

  // 国际化配置 - 设置为中文
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans', 'en'],
    localeConfigs: {
      'zh-Hans': {
        label: '简体中文',
        direction: 'ltr',
        htmlLang: 'zh-Hans',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
    },
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
          lastVersion: '2026-technest',  // 设置2026-technest为默认版本（当前活动）
          includeCurrentVersion: false,  // 不包含current版本
          versions: {
            '2026-technest': {
              label: '2026 TECHNEST 项目',
              path: '/',  // 设置为根路径，这样用户访问网站时默认看到这个版本
              banner: 'none',
            },
            '2026-her-waka': {
              label: '2026 HER WAKA 活动',
              path: '2026-her-waka',
              banner: 'none',
            },
            '2025-summer': {
              label: '2025年夏季她行活动',
              path: '2025-summer',  // 从根路径迁移至嵌套路径
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
            type: 'all', // 生成所有格式：RSS, Atom, JSON
            xslt: true,
            title: 'AI Programming 教学博客',
            description: '通过实践案例学习人工智能开发 - AI编程教育平台的最新文章和教程',
            copyright: `Copyright © ${new Date().getFullYear()} AI Programming Education. All rights reserved.`,
            language: 'zh-CN',
            limit: 20, // 限制feed中的文章数量
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
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        { name: 'keywords', content: 'AI编程, Gemini CLI, AI辅助编程, 零基础编程, 个人网站开发, Vercel部署, AI programming, coding tutorial' },
        { name: 'author', content: 'Chan Meng' },
        { property: 'og:site_name', content: 'AI Programming - Chan Meng 的 AI 编程公开课' },
      ],
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.png',
      // Algolia DocSearch 配置
      algolia: {
        // The application ID provided by Algolia
        appId: '8VHXTP609D',

        // Public API key: it is safe to commit it
        apiKey: 'f70da822145b6159e198fc85147e0564',

        // 使用主索引名称
        indexName: 'ai-programming-crawler',

        // 启用 contextual search，按当前语言和版本过滤搜索结果
        contextualSearch: true,

        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
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
          {to: '/message-board/', label: '留言板', position: 'left'},
          {
            type: 'docsVersionDropdown',
            position: 'left',
            dropdownActiveClassDisabled: true,
          },
          {
            type: 'localeDropdown',
            position: 'right',
            dropdownItemsAfter: [],
          },
          {
            href: 'https://github.com/ChanMeng666/ai-programming-teaching-project',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
            position: 'right',
          },
          {
            href: 'https://discord.gg/T3NJG5n98a',
            className: 'header-discord-link',
            'aria-label': 'Discord community',
            position: 'right',
          },
          {
            href: '/feeds',
            className: 'header-rss-link',
            'aria-label': 'RSS 订阅',
            position: 'right',
          },
          {
            type: 'html',
            position: 'right',
            value: '<button class="header-music-link" aria-label="背景音乐" title="背景音乐"></button>',
          },
        ],
      },
      footer: {
        style: 'dark',
        logo: {
          alt: 'AI Programming Education Logo',
          src: 'img/logo.svg',
          href: '/',
          width: 80,
          height: 80,
        },
        links: [
          {
            title: '课程内容',
            items: [
              {
                label: '2026 TECHNEST 项目',
                to: '/docs/programme/about-technest',
              },
              {
                label: 'TECHNEST 课程大纲',
                to: '/docs/curriculum-outline',
              },
              {
                label: '2026 HER WAKA 活动',
                to: '/docs/2026-her-waka/programme/about-her-waka',
              },
              {
                label: '2025年夏季课程',
                to: '/docs/2025-summer/intro',
              },
              {
                label: '2024年冬季课程',
                to: '/docs/2024-winter/intro',
              },
            ],
          },
          {
            title: '学习资源',
            items: [
              {
                label: '博客文章',
                to: '/blog',
              },
              {
                label: 'AI 编程基础',
                to: '/docs/2024-winter/basics/',
              },
              {
                label: '实践项目案例',
                to: '/docs/2024-winter/practice/',
              },
              {
                label: '进阶开发教程',
                to: '/docs/2024-winter/advanced/',
              },
            ],
          },
          {
            title: '社区互动',
            items: [
              {
                label: 'Discord 社区',
                href: 'https://discord.gg/T3NJG5n98a',
              },
              {
                label: 'GitHub 讨论',
                href: 'https://github.com/ChanMeng666/ai-programming-teaching-project/discussions',
              },
              {
                label: '问题反馈',
                href: 'https://github.com/ChanMeng666/ai-programming-teaching-project/issues',
              },
              {
                label: 'RSS 订阅',
                to: '/feeds',
              },
            ],
          },
          {
            title: '关于项目',
            items: [
              {
                label: 'GitHub 仓库',
                href: 'https://github.com/ChanMeng666/ai-programming-teaching-project',
              },
              {
                label: '贡献指南',
                href: 'https://github.com/ChanMeng666/ai-programming-teaching-project/blob/main/CONTRIBUTING.md',
              },
              {
                label: 'Chan Meng 主页',
                href: 'https://github.com/ChanMeng666',
              },
              {
                label: '联系开发者',
                href: 'mailto:chanmeng.dev@gmail.com',
              },
            ],
          },
        ],
        copyright: `<div class="footer-copyright">
            <div class="footer-legal">
              <div>Copyright © ${new Date().getFullYear()} AI Programming Education.</div>
              <div>Crafted with 💛 by <a class="footer-link" href="https://github.com/ChanMeng666"><img src="/img/chan_logo.svg" alt="Chan Meng" class="footer-developer-logo" />Chan Meng</a></div>
            </div>
          </div>`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        // 2025-summer 从根路径 / 迁移至嵌套路径 /2025-summer/ 后，
        // 旧链接（博客、外部书签、llms.txt 等）通过这些 meta-refresh 跳转保持可达。
        // trailingSlash: true 已经生成带斜杠的规范 URL，无需为同一路径写两条记录。
        redirects: [
          { from: '/docs/intro', to: '/docs/2025-summer/intro' },
          { from: '/docs/basics/', to: '/docs/2025-summer/basics/' },
          { from: '/docs/website/', to: '/docs/2025-summer/website/' },
          { from: '/docs/practice/', to: '/docs/2025-summer/practice/' },
        ],
      },
    ],
  ],
};

export default config;
