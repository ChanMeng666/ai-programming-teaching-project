import React from 'react';
import Content from '@theme-original/BlogPostItem/Content';
import CopyMarkdownButton from '@site/src/components/CopyMarkdownButton';
import OpenInChatGPTButton from '@site/src/components/OpenInChatGPTButton';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';

export default function ContentWrapper(props) {
  return (
    <>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'sticky',
          top: 'calc(var(--ifm-navbar-height) + 1rem)',
          float: 'right',
          marginTop: '0.5rem',
          marginRight: '0',
          marginBottom: '1rem',
          marginLeft: '0.5rem',
          zIndex: 5,
          display: 'flex',
          gap: '0.375rem',
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'nowrap'
        }}>
          <CopyMarkdownButton />
          <OpenInChatGPTButton />
        </div>
        <Content {...props} />
      </div>
    </>
  );
}
