// 手动 swizzle 自 @docusaurus/theme-classic 的 MDXComponents（wrap 模式）。
// 把 MintlifyShim 组件全局注入 MDX 作用域，让 her-waka 迁移过来的
// <Tip>/<Note>/<Warning>/<Info>/<Tabs>/<Tab>/<Steps>/<Step>/<Accordion>/
// <AccordionGroup>/<Card>/<CardGroup>/<Frame> 都无需 import 即可使用。

import MDXComponents from '@theme-original/MDXComponents';
import * as MintlifyShim from '@site/src/components/MintlifyShim';

export default {
  ...MDXComponents,
  ...MintlifyShim,
};
