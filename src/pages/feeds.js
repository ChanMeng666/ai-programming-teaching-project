import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';
import useScrollReveal from '@site/src/hooks/useScrollReveal';
import styles from './feeds.module.css';

// Blog feeds — URLs are contract-stable (do not change).
const FEEDS = [
  { key: 'rss', format: 'RSS 2.0', url: '/blog/rss.xml' },
  { key: 'atom', format: 'Atom 1.0', url: '/blog/atom.xml' },
  { key: 'json', format: 'JSON Feed 1.0', url: '/blog/feed.json' },
];

function absoluteUrl(path) {
  if (typeof window === 'undefined') return path;
  return window.location.origin + path;
}

function FeedCard({ format, url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const full = absoluteUrl(url);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(full);
      } else {
        // Legacy fallback for browsers without the async clipboard API.
        const el = document.createElement('textarea');
        el.value = full;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — user can still use the Open link */
    }
  };

  return (
    <div className={`mm-card--sm ${styles.feedCard}`}>
      <span className="mm-chip">{format}</span>
      <span className={styles.feedContent}>
        {translate({ id: 'feeds.table.allPosts', message: 'All Blog Posts' })}
      </span>
      <code className={styles.feedUrl}>{url}</code>
      <div className={styles.feedActions}>
        <button
          type="button"
          className={`mm-btn mm-btn-coral ${styles.smallBtn}`}
          onClick={handleCopy}
          aria-live="polite"
        >
          {copied
            ? translate({ id: 'feeds.copied', message: 'Copied!' })
            : translate({ id: 'feeds.copy', message: 'Copy URL' })}
        </button>
        <a
          className={`mm-btn mm-btn-ghost ${styles.smallBtn}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {translate({ id: 'feeds.open', message: 'Open' })}
          <span className="mm-btn-dot mm-btn-dot--blue" />
        </a>
      </div>
    </div>
  );
}

export default function FeedsPage() {
  useScrollReveal();

  return (
    <Layout
      title={translate({ id: 'feeds.pageTitle', message: 'RSS Feeds' })}
      description={translate({ id: 'feeds.pageDescription', message: 'Subscribe to the AI Programming blog for the latest tutorials and articles' })}
    >
      <main className={styles.container}>
        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroText}>
            <span className="mm-eyebrow">
              {translate({ id: 'feeds.eyebrow', message: 'Subscribe' })}
            </span>
            <h1 className={`mm-heading-lg ${styles.heroTitle}`}>
              {translate({ id: 'feeds.heroTitle', message: 'RSS Feeds' })}
            </h1>
            <p className={styles.heroSubtitle}>
              {translate({ id: 'feeds.heroSubtitle', message: 'Subscribe to our blog to get the latest AI programming tutorials, project examples and tech insights' })}
            </p>
          </div>
          <img
            className={styles.heroArt}
            src="/img/illustrations/feeds.webp"
            alt={translate({ id: 'feeds.heroImageAlt', message: 'A paper-cut character broadcasting updates through a megaphone' })}
            width="440"
            height="440"
            loading="lazy"
          />
        </header>

        {/* Feed sources */}
        <section className={`mm-reveal ${styles.section}`}>
          <h2 className={`mm-heading ${styles.sectionTitle}`}>
            {translate({ id: 'feeds.feedSources', message: 'Feed Sources' })}
          </h2>
          <p className={styles.lead}>
            {translate({ id: 'feeds.feedSourcesDesc', message: 'We offer feeds in multiple formats. Choose the one that works best with your RSS reader:' })}
          </p>

          <div className={`mm-reveal-stagger ${styles.feedGrid}`}>
            {FEEDS.map((feed) => (
              <FeedCard key={feed.key} format={feed.format} url={feed.url} />
            ))}
          </div>
        </section>

        {/* What is RSS */}
        <section className={`mm-reveal ${styles.section}`}>
          <div className={`mm-card ${styles.prose}`}>
            <h2 className={styles.cardTitle}>
              {translate({ id: 'feeds.whatIsRss', message: 'What is RSS?' })}
            </h2>
            <p>{translate({ id: 'feeds.whatIsRssDesc', message: 'RSS (Really Simple Syndication) is a web content syndication format. By subscribing to RSS feeds, you can:' })}</p>
            <ul className={styles.checkList}>
              <li>{translate({ id: 'feeds.benefit1', message: 'Read updates from multiple websites in one place' })}</li>
              <li>{translate({ id: 'feeds.benefit2', message: 'Get the latest content without frequently visiting websites' })}</li>
              <li>{translate({ id: 'feeds.benefit3', message: 'Read articles at your own pace' })}</li>
              <li>{translate({ id: 'feeds.benefit4', message: 'Never miss important updates' })}</li>
            </ul>
          </div>
        </section>

        {/* How to use */}
        <section className={`mm-reveal ${styles.section}`}>
          <h2 className={`mm-heading ${styles.sectionTitle}`}>
            {translate({ id: 'feeds.howToUse', message: 'How to Use RSS?' })}
          </h2>

          <div className={`mm-card ${styles.prose}`}>
            <h3 className={styles.cardSubtitle}>
              {translate({ id: 'feeds.step1Title', message: 'Step 1: Choose an RSS Reader' })}
            </h3>

            <div className={styles.readerGroups}>
              <div>
                <h4 className={styles.readerHeading}>{translate({ id: 'feeds.desktop', message: 'Desktop' })}</h4>
                <ul className={styles.linkList}>
                  <li><a href="https://netnewswire.com/" target="_blank" rel="noopener noreferrer">NetNewsWire</a> (macOS/iOS) — {translate({ id: 'feeds.netnewswire', message: 'Free, open-source, clean interface' })}</li>
                  <li><a href="https://feedly.com/" target="_blank" rel="noopener noreferrer">Feedly</a> — {translate({ id: 'feeds.feedly', message: 'Cross-platform, feature-rich' })}</li>
                  <li><a href="https://www.inoreader.com/" target="_blank" rel="noopener noreferrer">Inoreader</a> — {translate({ id: 'feeds.inoreader', message: 'Advanced filtering and rules' })}</li>
                  <li><a href="https://newsblur.com/" target="_blank" rel="noopener noreferrer">NewsBlur</a> — {translate({ id: 'feeds.newsblur', message: 'Open-source, social features' })}</li>
                </ul>
              </div>

              <div>
                <h4 className={styles.readerHeading}>{translate({ id: 'feeds.mobile', message: 'Mobile' })}</h4>
                <ul className={styles.linkList}>
                  <li><a href="https://reederapp.com/" target="_blank" rel="noopener noreferrer">Reeder</a> (iOS/macOS) — {translate({ id: 'feeds.reeder', message: 'Beautifully designed' })}</li>
                  <li><a href="https://play.google.com/store/apps/details?id=com.seazon.feedme" target="_blank" rel="noopener noreferrer">FeedMe</a> (Android) — {translate({ id: 'feeds.feedme', message: 'Full-featured' })}</li>
                  <li><a href="https://github.com/Ashinch/ReadYou" target="_blank" rel="noopener noreferrer">Read You</a> (Android) — {translate({ id: 'feeds.readyou', message: 'Free and open-source' })}</li>
                </ul>
              </div>

              <div>
                <h4 className={styles.readerHeading}>{translate({ id: 'feeds.browser', message: 'Browser Extensions' })}</h4>
                <ul className={styles.linkList}>
                  <li><a href="https://nodetics.com/feedbro/" target="_blank" rel="noopener noreferrer">Feedbro</a> — Firefox / Chrome</li>
                  <li><a href="https://chrome.google.com/webstore/detail/rss-feed-reader/pnjaodmkngahhkoihejjehlcdlnohgmp" target="_blank" rel="noopener noreferrer">RSS Feed Reader</a> — Chrome</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={`mm-card ${styles.prose} ${styles.stepsCard}`}>
            <h3 className={styles.cardSubtitle}>
              {translate({ id: 'feeds.step2Title', message: 'Step 2: Add a Feed' })}
            </h3>
            <ol className={styles.steps}>
              <li>{translate({ id: 'feeds.step2a', message: 'Copy a feed link from the table above' })}</li>
              <li>{translate({ id: 'feeds.step2b', message: 'In your RSS reader, select "Add Feed" or "Add Subscription"' })}</li>
              <li>{translate({ id: 'feeds.step2c', message: 'Paste the link and confirm' })}</li>
              <li>{translate({ id: 'feeds.step2d', message: 'Start reading!' })}</li>
            </ol>
          </div>
        </section>

        {/* Tips */}
        <section className={`mm-reveal ${styles.section}`}>
          <div className={`mm-card ${styles.prose}`}>
            <h2 className={styles.cardTitle}>
              {translate({ id: 'feeds.tips', message: 'Tips' })}
            </h2>
            <p><strong>{translate({ id: 'feeds.tipsTitle', message: 'Choosing a feed format:' })}</strong></p>
            <ul className={styles.checkList}>
              <li><strong>RSS 2.0</strong> — {translate({ id: 'feeds.tipsRss', message: 'Most widely supported, works with most readers' })}</li>
              <li><strong>Atom 1.0</strong> — {translate({ id: 'feeds.tipsAtom', message: 'More standardized, richer metadata' })}</li>
              <li><strong>JSON Feed</strong> — {translate({ id: 'feeds.tipsJson', message: 'Newest format, ideal for modern apps' })}</li>
            </ul>
          </div>
        </section>

        {/* Other ways to follow */}
        <section className={`mm-reveal ${styles.section}`}>
          <div className={`mm-card ${styles.prose}`}>
            <h2 className={styles.cardTitle}>
              {translate({ id: 'feeds.otherWays', message: 'Other Ways to Follow' })}
            </h2>
            <p>{translate({ id: 'feeds.otherWaysDesc', message: 'Besides RSS, you can also follow us through:' })}</p>
            <ul className={styles.linkList}>
              <li>
                <a href="https://github.com/ChanMeng666/ai-programming-teaching-project" target="_blank" rel="noopener noreferrer">
                  {translate({ id: 'feeds.github', message: 'GitHub — Star our project' })}
                </a>
              </li>
              <li>
                <a href="https://discord.gg/T3NJG5n98a" target="_blank" rel="noopener noreferrer">
                  {translate({ id: 'feeds.discord', message: 'Discord — Join the community' })}
                </a>
              </li>
              <li>{translate({ id: 'feeds.bookmark', message: 'Bookmark — Save our website' })}</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className={`mm-reveal ${styles.section}`}>
          <h2 className={`mm-heading ${styles.sectionTitle}`}>
            {translate({ id: 'feeds.faq', message: 'FAQ' })}
          </h2>
          <div className={`mm-card ${styles.prose}`}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>{translate({ id: 'feeds.faq1q', message: 'Are RSS readers free?' })}</h3>
              <p>{translate({ id: 'feeds.faq1a', message: 'Most RSS readers offer a free tier with enough features for daily use. Paid versions typically provide advanced features like full-text search and automation rules.' })}</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>{translate({ id: 'feeds.faq2q', message: 'How often is the feed updated?' })}</h3>
              <p>{translate({ id: 'feeds.faq2a', message: 'The feed updates automatically when we publish new articles. Most RSS readers check for updates every 15-60 minutes.' })}</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>{translate({ id: 'feeds.faq3q', message: 'Can I subscribe to specific topics only?' })}</h3>
              <p>{translate({ id: 'feeds.faq3a', message: 'Currently we offer a feed for all blog posts. If you\'re interested in specific topics, you can use the filtering features in your RSS reader.' })}</p>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <p>
            <strong>{translate({ id: 'feeds.thanks', message: 'Thanks for following us!' })}</strong>
            {' '}
            {translate({ id: 'feeds.thanksDesc', message: 'We\'ll keep publishing high-quality AI programming content' })}
          </p>
        </footer>
      </main>
    </Layout>
  );
}
