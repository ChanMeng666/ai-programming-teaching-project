// MintlifyShim — 让从 Mintlify 迁移过来的 MDX 内容在 Docusaurus 中零改动渲染。
// 通过 src/theme/MDXComponents.js 做全局注入，MDX 文件无需 import。

export { default as Tip } from './Admonitions/Tip';
export { default as Note } from './Admonitions/Note';
export { default as Warning } from './Admonitions/Warning';
export { default as Info } from './Admonitions/Info';

export { default as Tabs } from './Tabs/Tabs';
export { default as Tab } from './Tabs/Tab';

export { default as Steps } from './Steps/Steps';
export { default as Step } from './Steps/Step';

export { default as Accordion } from './Accordion/Accordion';
export { default as AccordionGroup } from './Accordion/AccordionGroup';

export { default as Card } from './Card/Card';
export { default as CardGroup } from './Card/CardGroup';

export { default as Frame } from './Frame/Frame';
