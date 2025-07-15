/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '🚀 快速开始',
      link: {
        type: 'doc',
        id: 'setup/index'
      },
      collapsed: false, // 默认展开重要的入门部分
      items: [
        'setup/system-requirements',
        'setup/cursor-installation', 
        'setup/account-registration',
        'setup/dev-environment',
      ],
    },
    {
      type: 'category',
      label: '📚 基础知识',
      link: {
        type: 'doc',
        id: 'basics/index'
      },
      collapsed: false, // 基础知识也默认展开
      items: [
        'basics/prompt-engineering',
        'basics/markdown-syntax',
        'basics/ai-communication',
      ],
    },
    {
      type: 'category',
      label: '🛠️ 开发工具',
      link: {
        type: 'doc',
        id: 'tools/index'
      },
      collapsed: true, // 工具类可以默认收起
      items: [
        'tools/cursor-guide',
        'tools/v0-platform',
        'tools/vercel-deploy',
        'tools/workflow-integration',
        'tools/coze-tutorial',
      ],
    },
    {
      type: 'category',
      label: '📖 教程与实战',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: '基础教程',
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
          label: '实战项目',
          link: {
            type: 'doc',
            id: 'practice/index'
          },
          items: [
            'practice/blog-planning',
            'practice/cursor-development',
            'practice/v0-development',
            'practice/maintenance',
            'practice/summary',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '🎯 进阶应用',
      link: {
        type: 'doc',
        id: 'advanced/index'
      },
      collapsed: true, // 进阶内容默认收起
      items: [
        {
          type: 'category',
          label: 'AI系统开发',
          link: {
            type: 'doc',
            id: 'advanced/ai-systems/index'
          },
          items: [
            'advanced/ai-systems/ai-chat',
            'advanced/ai-systems/ai-drawing',
          ],
        },
        {
          type: 'category',
          label: '优秀案例',
          link: {
            type: 'doc',
            id: 'advanced/cases/index'
          },
          items: [
            'advanced/cases/sasa-project',
            'advanced/cases/stella-project',
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;
