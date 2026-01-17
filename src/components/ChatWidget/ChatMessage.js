import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './styles.module.css';

export default function ChatMessage({ message }) {
  const { role, content, isStreaming, isError } = message;
  const isUser = role === 'user';
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect theme from DOM instead of using useColorMode hook
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme === 'dark');
    };

    // Initial check
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`${styles.message} ${isUser ? styles.userMessage : styles.assistantMessage}`}
    >
      {!isUser && (
        <div className={styles.messageAvatar}>
          <img
            src={isDarkMode
              ? '/img/chan_logo_without_brand_white.svg'
              : '/img/chan_logo_without_brand_black.svg'
            }
            alt="AI"
            className={styles.avatarIcon}
          />
        </div>
      )}
      <div
        className={`${styles.messageBubble} ${isError ? styles.errorBubble : ''}`}
      >
        <div className={styles.messageContent}>
          {isUser ? (
            // User messages: plain text
            content
          ) : content ? (
            // AI messages: render markdown
            <div className={styles.markdownContent}>
              <ReactMarkdown
                components={{
                  // Custom renderers for better styling
                  p: ({ children }) => <p className={styles.mdParagraph}>{children}</p>,
                  code: ({ inline, className, children, ...props }) => {
                    if (inline) {
                      return <code className={styles.mdInlineCode} {...props}>{children}</code>;
                    }
                    return (
                      <pre className={styles.mdCodeBlock}>
                        <code {...props}>{children}</code>
                      </pre>
                    );
                  },
                  ul: ({ children }) => <ul className={styles.mdList}>{children}</ul>,
                  ol: ({ children }) => <ol className={styles.mdList}>{children}</ol>,
                  li: ({ children }) => <li className={styles.mdListItem}>{children}</li>,
                  a: ({ href, children }) => (
                    <a href={href} className={styles.mdLink} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  h1: ({ children }) => <h1 className={styles.mdHeading}>{children}</h1>,
                  h2: ({ children }) => <h2 className={styles.mdHeading}>{children}</h2>,
                  h3: ({ children }) => <h3 className={styles.mdHeading}>{children}</h3>,
                  h4: ({ children }) => <h4 className={styles.mdHeading}>{children}</h4>,
                  blockquote: ({ children }) => <blockquote className={styles.mdBlockquote}>{children}</blockquote>,
                  strong: ({ children }) => <strong className={styles.mdStrong}>{children}</strong>,
                  em: ({ children }) => <em className={styles.mdEmphasis}>{children}</em>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            // Streaming without content: show typing indicator
            isStreaming && <span className={styles.typingIndicator} />
          )}
        </div>
        {isStreaming && content && (
          <span className={styles.streamingCursor}>|</span>
        )}
      </div>
    </div>
  );
}
