import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import AITracker from '@site/src/components/AITracker';
import ChatWidget from '@site/src/components/ChatWidget';

/**
 * 增强的Layout组件
 * 为所有页面添加AI优化功能和AI聊天助手
 */
export default function Layout(props) {
  return (
    <>
      <OriginalLayout {...props} />
      <ChatWidget />
      <AITracker />
    </>
  );
}