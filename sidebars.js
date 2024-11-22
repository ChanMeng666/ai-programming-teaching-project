/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '环境配置',
      link: {
        type: 'doc',
        id: 'setup/index'
      },
      items: [
        'setup/system-requirements',
        'setup/cursor-installation', 
        'setup/account-registration',
        'setup/dev-environment',
      ],
    },
    {
      type: 'category',
      label: '基础知识',
      link: {
        type: 'doc',
        id: 'basics/index'
      },
      items: [
        'basics/prompt-engineering',
        'basics/markdown-syntax',
        'basics/ai-communication',
      ],
    },
    {
      type: 'category',
      label: '教程指南',
      link: {
        type: 'doc',
        id: 'tutorials/index'
      },
      items: [
        'tutorials/docusaurus-tutorial',
      ],
    },
    {
      type: 'category',
      label: '开发工具',
      link: {
        type: 'doc',
        id: 'tools/index'
      },
      items: [
        'tools/cursor-guide',
        'tools/v0-platform',
        'tools/vercel-deploy',
        'tools/workflow-integration',
      ],
    },
    {
      type: 'category',
      label: '实战项目',
      link: {
        type: 'doc',
        id: 'practice/index'
      },
      items: [
        'practice/blog-planning',
        'practice/cursor-development',
        'practice/v0-development',
        'practice/vercel-deployment',
        'practice/maintenance',
        'practice/summary',
      ],
    },
    {
      type: 'category',
      label: '博客定制',
      link: {
        type: 'doc',
        id: 'customization/index'
      },
      items: [
        'customization/basic-config',
        'customization/content-management',
        'customization/version-control',
        'customization/vercel-deployment',
        'customization/maintenance',
      ],
    },
  ],
};

module.exports = sidebars;
