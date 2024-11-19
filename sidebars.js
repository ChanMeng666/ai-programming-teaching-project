/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
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
  ],
};

module.exports = sidebars;
