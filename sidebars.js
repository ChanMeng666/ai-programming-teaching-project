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
      label: '🌟 活动介绍',
    },
    {
      type: 'category',
      label: '📚 基础教程',
      collapsible: true,
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'basics/index',
          label: '概览',
        },
        // 更多基础教程文档将在这里添加
      ],
    },
    {
      type: 'category',
      label: '🚀 实践项目',
      collapsible: true,
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'practice/index',
          label: '项目概览',
        },
        // 更多实践项目文档将在这里添加
      ],
    },

  ],
};

module.exports = sidebars;
