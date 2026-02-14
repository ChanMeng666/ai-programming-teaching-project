import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@theme/Layout';
import FeedsSpaceBackground from '../components/FeedsSpaceBackground';
import styles from './message-board.module.css';

const API_BASE = 'https://ai-chat-worker.chanmeng-dev.workers.dev';

const CATEGORIES = ['心得体会', '经验分享', '教程讨论', '其他'];
const FILTER_ALL = '全部';

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
        onSubmitted(false, data.error || '提交失败');
        return;
      }
      onSubmitted(true, '留言已提交，等待审核后将会显示');
      setNickname('');
      setContent('');
      setCategory('心得体会');
    } catch {
      onSubmitted(false, '网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>写下你的留言</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="mb-nickname">昵称 *</label>
              <input
                id="mb-nickname"
                className={styles.formInput}
                type="text"
                maxLength={30}
                placeholder="你的昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="mb-category">分类</label>
              <select
                id="mb-category"
                className={styles.formSelect}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="mb-content">留言内容 *</label>
            <div className={styles.textareaWrapper}>
              <textarea
                id="mb-content"
                className={styles.formTextarea}
                maxLength={500}
                rows={4}
                placeholder="分享你的 AI 编程学习心得、经验或想法..."
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
            {submitting ? '提交中...' : '提交留言'}
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageCard({ message }) {
  const date = message.submittedAt
    ? new Date(message.submittedAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className={styles.messageCard}>
      <div className={styles.messageHeader}>
        <span className={styles.nickname}>{message.nickname}</span>
        <span className={styles.categoryBadge}>{message.category}</span>
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
  const [activeFilter, setActiveFilter] = useState(FILTER_ALL);
  const [toast, setToast] = useState(null);

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
    activeFilter === FILTER_ALL
      ? messages
      : messages.filter((m) => m.category === activeFilter);

  return (
    <Layout
      title="留言板"
      description="分享你的 AI 编程学习心得和经验"
    >
      <div className={styles.pageWrapper}>
        <FeedsSpaceBackground />
        <div className={styles.container}>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          <div className={styles.heroSection}>
            <h1 className={styles.title}>留言板</h1>
            <p className={styles.subtitle}>
              在这里分享你的 AI 编程学习心得、经验与想法，和大家一起交流成长
            </p>
          </div>

          <MessageForm onSubmitted={showToast} />

          <div className={styles.filterTabs}>
            {[FILTER_ALL, ...CATEGORIES].map((tab) => (
              <button
                key={tab}
                className={`${styles.filterTab} ${
                  activeFilter === tab ? styles.filterTabActive : ''
                }`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <span className={styles.loadingIcon}>...</span>
              <p>加载留言中...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>
                {activeFilter !== FILTER_ALL
                  ? '(empty)'
                  : '(empty)'}
              </span>
              <p>
                {activeFilter !== FILTER_ALL
                  ? `暂无「${activeFilter}」分类的留言`
                  : '还没有留言，来做第一个分享的人吧！'}
              </p>
            </div>
          ) : (
            <>
              <div className={styles.messageList}>
                {filteredMessages.map((msg) => (
                  <MessageCard key={msg.id} message={msg} />
                ))}
              </div>
              {hasMore && activeFilter === FILTER_ALL && (
                <div className={styles.loadMore}>
                  <button
                    className={styles.loadMoreBtn}
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? '加载中...' : '加载更多'}
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
