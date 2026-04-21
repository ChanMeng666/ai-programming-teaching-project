import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import styles from './message-board.module.css';

const API_BASE = 'https://ai-chat-worker.chanmeng-dev.workers.dev';

const CATEGORIES = ['心得体会', '经验分享', '教程讨论', '其他'];

function useCategoryLabels() {
  return {
    '心得体会': translate({ id: 'messageBoard.category.experience', message: 'Reflections' }),
    '经验分享': translate({ id: 'messageBoard.category.sharing', message: 'Tips & Tricks' }),
    '教程讨论': translate({ id: 'messageBoard.category.discussion', message: 'Tutorial Discussion' }),
    '其他': translate({ id: 'messageBoard.category.other', message: 'Other' }),
  };
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`${styles.toast} ${
        type === 'success' ? styles.toastSuccess : styles.toastError
      }`}
    >
      {message}
    </div>
  );
}

function MessageForm({ onSubmitted }) {
  const [nickname, setNickname] = useState('');
  const [category, setCategory] = useState('心得体会');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const categoryLabels = useCategoryLabels();

  const charCount = content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim(),
          content: content.trim(),
          category,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onSubmitted(false, data.error || translate({ id: 'messageBoard.submitFailed', message: 'Submission failed' }));
        return;
      }
      onSubmitted(true, translate({ id: 'messageBoard.submitSuccess', message: 'Message submitted! It will appear after review.' }));
      setNickname('');
      setContent('');
      setCategory('心得体会');
    } catch {
      onSubmitted(false, translate({ id: 'messageBoard.networkError', message: 'Network error, please try again later' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>
          {translate({ id: 'messageBoard.formTitle', message: 'Leave a Message' })}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="mb-nickname">
                {translate({ id: 'messageBoard.nicknameLabel', message: 'Nickname' })} *
              </label>
              <input
                id="mb-nickname"
                className={styles.formInput}
                type="text"
                maxLength={30}
                placeholder={translate({ id: 'messageBoard.nicknamePlaceholder', message: 'Your nickname' })}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="mb-category">
                {translate({ id: 'messageBoard.categoryLabel', message: 'Category' })}
              </label>
              <select
                id="mb-category"
                className={styles.formSelect}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabels[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="mb-content">
              {translate({ id: 'messageBoard.contentLabel', message: 'Message' })} *
            </label>
            <div className={styles.textareaWrapper}>
              <textarea
                id="mb-content"
                className={styles.formTextarea}
                maxLength={500}
                rows={4}
                placeholder={translate({ id: 'messageBoard.contentPlaceholder', message: 'Share your AI programming experiences, insights or ideas...' })}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <span
                className={`${styles.charCount} ${
                  charCount > 450
                    ? charCount > 500
                      ? styles.charCountOver
                      : styles.charCountWarn
                    : ''
                }`}
              >
                {charCount}/500
              </span>
            </div>
          </div>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting || !nickname.trim() || !content.trim()}
          >
            {submitting
              ? translate({ id: 'messageBoard.submitting', message: 'Submitting...' })
              : translate({ id: 'messageBoard.submit', message: 'Submit' })}
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageCard({ message }) {
  const categoryLabels = useCategoryLabels();
  const date = message.submittedAt
    ? new Date(message.submittedAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const initial = (message.nickname || '?')[0];

  return (
    <div className={styles.messageCard}>
      <div className={styles.messageHeader}>
        <span className={styles.avatar}>{initial}</span>
        <span className={styles.nickname}>{message.nickname}</span>
        <span className={styles.categoryBadge}>
          {categoryLabels[message.category] || message.category}
        </span>
        {date && <span className={styles.messageDate}>{date}</span>}
      </div>
      <div className={styles.messageContent}>{message.content}</div>
    </div>
  );
}

export default function MessageBoardPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [activeFilter, setActiveFilter] = useState('__all__');
  const [toast, setToast] = useState(null);
  const categoryLabels = useCategoryLabels();

  const filterAllLabel = translate({ id: 'messageBoard.filterAll', message: 'All' });

  const fetchMessages = useCallback(async (cursor) => {
    const params = new URLSearchParams({ pageSize: '20' });
    if (cursor) params.set('cursor', cursor);
    try {
      const res = await fetch(`${API_BASE}/api/messages?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchMessages();
      if (!cancelled && data) {
        setMessages(data.messages || []);
        setHasMore(data.hasMore || false);
        setNextCursor(data.nextCursor || null);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchMessages]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const data = await fetchMessages(nextCursor);
    if (data) {
      setMessages((prev) => [...prev, ...(data.messages || [])]);
      setHasMore(data.hasMore || false);
      setNextCursor(data.nextCursor || null);
    }
    setLoadingMore(false);
  };

  const showToast = (success, message) => {
    setToast({ type: success ? 'success' : 'error', message });
  };

  const filteredMessages =
    activeFilter === '__all__'
      ? messages
      : messages.filter((m) => m.category === activeFilter);

  return (
    <Layout
      title={translate({ id: 'messageBoard.pageTitle', message: 'Message Board' })}
      description={translate({ id: 'messageBoard.pageDescription', message: 'Share your AI programming learning experiences' })}
    >
      <div className={styles.pageWrapper}>
        <div className={styles.bgImage} />
        <div className={styles.container}>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          <div className={styles.heroSection}>
            <h1 className={styles.title}>
              {translate({ id: 'messageBoard.heroTitle', message: 'Message Board' })}
            </h1>
            <p className={styles.subtitle}>
              {translate({ id: 'messageBoard.heroSubtitle', message: 'Share your AI programming experiences, insights and ideas here, and grow together with the community' })}
            </p>
          </div>

          <MessageForm onSubmitted={showToast} />

          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${
                activeFilter === '__all__' ? styles.filterTabActive : ''
              }`}
              onClick={() => setActiveFilter('__all__')}
            >
              {filterAllLabel}
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterTab} ${
                  activeFilter === cat ? styles.filterTabActive : ''
                }`}
                onClick={() => setActiveFilter(cat)}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingDots}>
                <span />
                <span />
                <span />
              </div>
              <p>{translate({ id: 'messageBoard.loading', message: 'Loading messages...' })}</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>
                {activeFilter !== '__all__' ? '\u{1F50D}' : '\u{1F4AD}'}
              </span>
              <p>
                {activeFilter !== '__all__'
                  ? translate(
                      { id: 'messageBoard.emptyCategory', message: 'No messages in "{category}" category' },
                      { category: categoryLabels[activeFilter] || activeFilter }
                    )
                  : translate({ id: 'messageBoard.emptyAll', message: 'No messages yet. Be the first to share!' })}
              </p>
            </div>
          ) : (
            <>
              <div className={styles.messageList}>
                {filteredMessages.map((msg) => (
                  <MessageCard key={msg.id} message={msg} />
                ))}
              </div>
              {hasMore && activeFilter === '__all__' && (
                <div className={styles.loadMore}>
                  <button
                    className={styles.loadMoreBtn}
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore
                      ? translate({ id: 'messageBoard.loadingMore', message: 'Loading...' })
                      : translate({ id: 'messageBoard.loadMore', message: 'Load More' })}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
