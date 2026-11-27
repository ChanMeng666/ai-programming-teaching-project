import React from 'react';
import Head from '@docusaurus/Head';
import {translate} from '@docusaurus/Translate';
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
      {/* A fallback meta description for theme pages that set none (blog
          authors, the tags index, search). A page's own description renders
          deeper and replaces it. */}
      <Head>
        <meta
          name="description"
          content={translate({
            id: 'site.description.fallback',
            message:
              "AI Programming by Chan Meng: free, bilingual lessons in AI-assisted coding from five cohorts since 2024, with tutorials, programme pages and a blog.",
          })}
        />
      </Head>
      <OriginalLayout {...props} />
      <MusicPlayer />
      <ChatWidget />
    </>
  );
}