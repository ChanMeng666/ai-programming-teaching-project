import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './styles.module.css';

// Import avatar images
import AvatarBlack from '@site/static/img/chan_logo_without_brand_black.svg';
import AvatarWhite from '@site/static/img/chan_logo_without_brand_white.svg';

export default function ChatMessage({ message }) {
  const { role, content, isStreaming, isError } = message;
  const isUser = role === 'user';
  const { colorMode } = useColorMode();

  // Choose avatar based on theme
  const Avatar = colorMode === 'dark' ? AvatarWhite : AvatarBlack;

  return (
    <div
      className={`${styles.message} ${isUser ? styles.userMessage : styles.assistantMessage}`}
    >
      {!isUser && (
        <div className={styles.messageAvatar}>
          <Avatar className={styles.avatarIcon} />
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
