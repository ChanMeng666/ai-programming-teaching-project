import React from 'react';

// 占位组件 —— 实际渲染由父级 <Tabs> 把 <Tab title="..."> 转换成 TabItem 完成。
// 单独渲染时直接透出 children 作为兜底。
export default function Tab({children}) {
  return <>{children}</>;
}
