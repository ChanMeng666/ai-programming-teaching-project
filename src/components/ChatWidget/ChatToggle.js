import React from 'react';
import { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function ChatToggle({ isOpen, onClick }) {
  const closeChatLabel = translate({
    id: 'chatWidget.toggle.close',
    message: '关闭聊天',
    description: 'Close chat toggle button label',
  });

  const openChatLabel = translate({
    id: 'chatWidget.toggle.open',
    message: '打开 AI 助手',
    description: 'Open chat toggle button label',
  });

  return (
    <button
      className={`${styles.toggleButton} ${isOpen ? styles.toggleButtonOpen : ''}`}
      onClick={onClick}
      aria-label={isOpen ? closeChatLabel : openChatLabel}
      title={isOpen ? closeChatLabel : openChatLabel}
    >
      {isOpen ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
    </button>
  );
}
