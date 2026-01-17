import React from 'react';
import styles from './styles.module.css';

export default function ChatMessage({ message }) {
  const { role, content, isStreaming, isError } = message;
  const isUser = role === 'user';

  return (
    <div
      className={`${styles.message} ${isUser ? styles.userMessage : styles.assistantMessage}`}
    >
      {!isUser && (
        <div className={styles.messageAvatar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>
      )}
      <div
        className={`${styles.messageBubble} ${isError ? styles.errorBubble : ''}`}
      >
        <div className={styles.messageContent}>
          {content || (isStreaming && <span className={styles.typingIndicator} />)}
        </div>
        {isStreaming && content && (
          <span className={styles.streamingCursor}>|</span>
        )}
      </div>
    </div>
  );
}
