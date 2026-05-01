import React, { useState, useEffect, useCallback } from 'react';
import { translate } from '@docusaurus/Translate';
import ChatBox from './ChatBox';
import ChatToggle from './ChatToggle';
import styles from './styles.module.css';

// Worker API URL
const API_URL = 'https://ai-chat-worker.chanmeng-dev.workers.dev';

const STORAGE_KEY = 'ai-chat-messages';
const SESSION_KEY = 'ai-chat-session';

// Match the namespaces declared in worker/scripts/seed-vectors.ts. Used to bias
// retrieval toward the version the visitor is currently reading.
const VERSIONED_DOC_SLUGS = ['2024-winter', '2025-summer', '2026-her-waka', '2026-technest'];
const DEFAULT_DOC_NAMESPACE = '2026-technest'; // matches lastVersion in docusaurus.config.js

function getContextNamespace() {
  if (typeof window === 'undefined') return null;
  const pathname = window.location.pathname || '';
  if (pathname.startsWith('/blog/')) return 'blog';
  for (const slug of VERSIONED_DOC_SLUGS) {
    if (pathname.startsWith(`/docs/${slug}/`) || pathname === `/docs/${slug}`) {
      return slug;
    }
  }
  if (pathname.startsWith('/docs/')) return DEFAULT_DOC_NAMESPACE;
  return null;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Load messages and session from localStorage
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      if (savedSession) {
        setSessionId(savedSession);
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save chat history:', e);
      }
    }
  }, [messages]);

  // Save session ID to localStorage
  useEffect(() => {
    if (sessionId) {
      try {
        localStorage.setItem(SESSION_KEY, sessionId);
      } catch (e) {
        console.error('Failed to save session:', e);
      }
    }
  }, [sessionId]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSend = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create placeholder for assistant message
    const assistantMessageId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      },
    ]);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text.trim(),
          sessionId,
          contextNamespace: getContextNamespace(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Get session ID from response header
      const newSessionId = response.headers.get('X-Session-Id');
      if (newSessionId) {
        setSessionId(newSessionId);
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.response) {
                fullContent += parsed.response;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = translate({
        id: 'chatWidget.error.message',
        message: 'Sorry, an error occurred. Please try again later.',
        description: 'Error message when chat fails',
      });
      // Update message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: errorMessage,
                isStreaming: false,
                isError: true,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const handleClear = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <div className={styles.chatWidget}>
      {isOpen && (
        <ChatBox
          messages={messages}
          isLoading={isLoading}
          onSend={handleSend}
          onClose={handleToggle}
          onClear={handleClear}
        />
      )}
      <ChatToggle isOpen={isOpen} onClick={handleToggle} />
    </div>
  );
}
