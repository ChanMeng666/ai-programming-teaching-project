import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';

export default function ChatInput({ onSend, isLoading }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className={styles.inputContainer} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入你的问题..."
        disabled={isLoading}
        rows={1}
      />
      <button
        type="submit"
        className={styles.sendButton}
        disabled={!input.trim() || isLoading}
        aria-label="发送消息"
      >
        {isLoading ? (
          <span className={styles.loadingSpinner} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </button>
    </form>
  );
}
