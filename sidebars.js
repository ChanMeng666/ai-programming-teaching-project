/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '课程介绍',
    },
    {
      type: 'category',
      label: '基础知识',
      items: [
        'basics/prompt-engineering',
        'basics/markdown-syntax',
        'basics/ai-communication',
      ],
    },
    {
      type: 'category',
      label: '开发工具',
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
      label: '环境配置',
      items: [
        'setup/system-requirements',
        'setup/cursor-installation',
        'setup/account-registration',
        'setup/dev-environment',
      ],
    },
    {
      type: 'category',
      label: '博客定制',
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
