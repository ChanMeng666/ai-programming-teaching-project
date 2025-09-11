import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import AITracker from '@site/src/components/AITracker';

/**
 * 增强的Layout组件
 * 为所有页面添加AI优化功能
 */
export default function Layout(props) {
  return (
    <>
      <OriginalLayout {...props} />
      <AITracker />
    </>
  );
}