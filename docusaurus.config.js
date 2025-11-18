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
  tagline: '通过实践案例学习人工智能开发',
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

  // RSS 自动发现
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
  ],

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
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
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

        // 禁用 contextual search，避免版本过滤问题
        contextualSearch: false,

        // Optional: Algolia search parameters
        searchParameters: {
          // 确保搜索所有语言内容
          facetFilters: [],
        },

        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',

        // 搜索占位符文本
        placeholder: '搜索文档...',
        
        // 搜索结果翻译
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索',
          },
          modal: {
            searchBox: {
              resetButtonTitle: '清除查询',
              resetButtonAriaLabel: '清除查询',
              cancelButtonText: '取消',
              cancelButtonAriaLabel: '取消',
            },
            startScreen: {
              recentSearchesTitle: '最近搜索',
              noRecentSearchesText: '没有最近搜索',
              saveRecentSearchButtonTitle: '保存此搜索',
              removeRecentSearchButtonTitle: '从历史中删除此搜索',
              favoriteSearchesTitle: '收藏',
              removeFavoriteSearchButtonTitle: '从收藏中删除',
            },
            errorScreen: {
              titleText: '无法获取结果',
              helpText: '您可能需要检查您的网络连接',
            },
            footer: {
              selectText: '选择',
              navigateText: '导航',
              closeText: '关闭',
              searchByText: '搜索由',
            },
            noResultsScreen: {
              noResultsText: '无法找到相关结果',
              suggestedQueryText: '您可以尝试查询',
              reportMissingResultsText: '您认为这个查询应该有结果吗？',
              reportMissingResultsLinkText: '点击反馈',
            },
          },
        },
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
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '课程内容',
            items: [
              {
                label: '2025年夏季课程',
                to: '/docs/intro',
              },
              {
                label: 'Gemini CLI 环境管理',
                to: '/docs/basics/',
              },
              {
                label: '个人网站开发部署',
                to: '/docs/website/',
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
            <div class="footer-brand-section">
              <img src="/img/chan_logo.svg" alt="Chan Meng Logo" class="footer-logo" />
              <div class="footer-brand-info">
                <div class="footer-brand-name">Chan Meng</div>
              </div>
            </div>
            <div class="footer-legal">
              <div>Copyright © ${new Date().getFullYear()} AI Programming Education.</div>
              <div>Crafted with 💛 by <a class="footer-link" href="https://github.com/ChanMeng666">Chan Meng</a></div>
            </div>
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
