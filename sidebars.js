/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'intro',
    {
      type: 'category',
      label: '基础知识',
      link: {
        type: 'generated-index',
        description: '学习AI辅助开发的基础知识'
      },
      items: [
        'basics/prompt-engineering',
        'basics/markdown-syntax',
        'basics/ai-communication'
      ]
    },
    {
      type: 'category',
      label: '开发工具',
      link: {
        type: 'generated-index',
        description: '掌握现代开发工具的使用方法'
      },
      items: [
        'tools/cursor-guide',
        'tools/v0-platform',
        'tools/vercel-deploy',
        'tools/workflow-integration'
      ]
    },
    {
      type: 'category',
      label: '实战项目',
      link: {
        type: 'generated-index',
        description: '通过实际项目学习AI辅助开发'
      },
      items: [
        'practice/blog-planning',
        'practice/cursor-development',
        'practice/v0-development',
        'practice/vercel-deployment',
        'practice/maintenance',
        'practice/summary'
      ]
    }
  ]
};

module.exports = sidebars;
