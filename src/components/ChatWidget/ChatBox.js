import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import styles from './styles.module.css';

export default function ChatBox({ messages, isLoading, onSend, onClose, onClear }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.chatBox}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>
          <span className={styles.headerIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span>AI 助手</span>
        </div>
        <div className={styles.headerActions}>
          {messages.length > 0 && (
            <button
              className={styles.clearButton}
              onClick={onClear}
              title="清空对话"
              aria-label="清空对话"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="关闭聊天"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.welcomeMessage}>
            <div className={styles.welcomeIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <h3>你好！我是 AI 助手</h3>
            <p>有任何关于 AI 编程的问题都可以问我哦~</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} isLoading={isLoading} />
    </div>
  );
}
