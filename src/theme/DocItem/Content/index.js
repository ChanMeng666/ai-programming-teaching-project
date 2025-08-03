import React from 'react';
import Content from '@theme-original/DocItem/Content';
import CopyMarkdownButton from '@site/src/components/CopyMarkdownButton';

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
          zIndex: 5
        }}>
          <CopyMarkdownButton />
        </div>
        <Content {...props} />
      </div>
    </>
  );
}
