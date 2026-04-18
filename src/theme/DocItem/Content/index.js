import React from 'react';
import Content from '@theme-original/DocItem/Content';
import CopyMarkdownButton from '@site/src/components/CopyMarkdownButton';
import OpenInChatGPTButton from '@site/src/components/OpenInChatGPTButton';
import styles from './styles.module.css';

export default function ContentWrapper(props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <CopyMarkdownButton />
        <OpenInChatGPTButton />
      </div>
      <Content {...props} />
    </div>
  );
}
