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
      label: '🌟 Course Introduction',
    },
    {
      type: 'category',
      label: '📚 Course 1: Gemini CLI Environment',
      collapsible: true,
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'basics/index',
          label: 'Basic Tutorial',
        },
        {
          type: 'doc',
          id: 'practice/index',
          label: 'Practice Project',
        },
      ],
    },
    {
      type: 'category',
      label: '🌐 Course 2: Build & Deploy Personal Website',
      collapsible: true,
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'website/index',
          label: 'Complete Tutorial',
        },
      ],
    },

  ],
};

module.exports = sidebars;
