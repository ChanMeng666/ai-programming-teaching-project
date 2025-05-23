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
      label: '教程',
      link: {
        type: 'doc',
        id: 'tutorials/index'
      },
      items: [
        'tutorials/docusaurus-tutorial',
        'tutorials/sasa-project',
        'tutorials/stella-project',
      ],
    },
    {
      type: 'category',
      label: 'AI对话系统',
      link: {
        type: 'doc',
        id: 'ai-chat/index'
      },
      items: [
        'ai-chat/environment',
        'ai-chat/project-setup',
        'ai-chat/development',
        'ai-chat/testing-deployment',
        'ai-chat/best-practices',
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
    {
      type: 'category',
      label: 'AI绘图教程',
      link: {
        type: 'doc',
        id: 'ai-drawing/index'
      },
      items: [
        'ai-drawing/logo-design',
        'ai-drawing/image-generation',
        'ai-drawing/3d-modeling',
        'ai-drawing/practical-exercise',
      ],
    },
    {
      type: 'category',
      label: 'Coze教程',
      link: {
        type: 'doc',
        id: 'coze/index'
      },
      items: [
        'coze/environment-setup',
        'coze/browse-node-setup',
        'coze/llm-node-setup',
        'coze/text-processing-setup',
        'coze/testing-optimization',
      ],
    },
  ],
};

module.exports = sidebars;
