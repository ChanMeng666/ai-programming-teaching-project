/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '🌟 课程介绍',
    },
    {
      type: 'category',
      label: '📚 课程一：Gemini CLI 环境管理',
      collapsible: true,
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'basics/index',
          label: '基础教程',
        },
        {
          type: 'doc',
          id: 'practice/index',
          label: '实践项目',
        },
      ],
    },
    {
      type: 'category',
      label: '🌐 课程二：开发并部署个人网站',
      collapsible: true,
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'website/index',
          label: '完整教程',
        },
      ],
    },

  ],
};

module.exports = sidebars;
