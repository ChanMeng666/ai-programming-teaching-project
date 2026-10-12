import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import ChatWidget from '@site/src/components/ChatWidget';
import MusicPlayer from '@site/src/components/MusicPlayer';

/**
 * 增强的Layout组件
 * 为所有页面添加AI聊天助手和背景音乐播放器
 */
export default function Layout(props) {
  return (
    <>
      <OriginalLayout {...props} />
      <MusicPlayer />
      <ChatWidget />
    </>
  );
}