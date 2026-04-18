import React from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import styles from './feeds.module.css';

export default function FeedsPage() {
  return (
    <Layout
      title={translate({ id: 'feeds.pageTitle', message: 'RSS 订阅' })}
      description={translate({ id: 'feeds.pageDescription', message: '订阅 AI Programming 教学博客，获取最新的教程和文章更新' })}
    >
      <main className={styles.container}>
        <header className={styles.hero}>
          <h1>{translate({ id: 'feeds.heroTitle', message: 'RSS 订阅' })}</h1>
          <p>{translate({ id: 'feeds.heroSubtitle', message: '订阅我们的博客，第一时间获取最新的 AI 编程教程、项目案例和技术分享' })}</p>
        </header>

        <section>
          <h2>{translate({ id: 'feeds.feedSources', message: '订阅源' })}</h2>
          <p>{translate({ id: 'feeds.feedSourcesDesc', message: '我们提供多种格式的订阅源，您可以根据您使用的 RSS 阅读器选择合适的格式：' })}</p>

          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>{translate({ id: 'feeds.table.content', message: '内容' })}</th>
                  <th>RSS 2.0</th>
                  <th>Atom 1.0</th>
                  <th>JSON Feed 1.0</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>{translate({ id: 'feeds.table.allPosts', message: '所有博客文章' })}</strong></td>
                  <td><a href="/blog/rss.xml" target="_blank" rel="noopener noreferrer">RSS</a></td>
                  <td><a href="/blog/atom.xml" target="_blank" rel="noopener noreferrer">Atom</a></td>
                  <td><a href="/blog/feed.json" target="_blank" rel="noopener noreferrer">JSON</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>{translate({ id: 'feeds.whatIsRss', message: '什么是 RSS？' })}</h2>
          <p>{translate({ id: 'feeds.whatIsRssDesc', message: 'RSS（Really Simple Syndication）是一种网络内容聚合格式。通过订阅 RSS 源，您可以：' })}</p>
          <ul>
            <li>{translate({ id: 'feeds.benefit1', message: '在一个地方阅读多个网站的更新' })}</li>
            <li>{translate({ id: 'feeds.benefit2', message: '无需频繁访问网站即可获取最新内容' })}</li>
            <li>{translate({ id: 'feeds.benefit3', message: '按照自己的节奏阅读文章' })}</li>
            <li>{translate({ id: 'feeds.benefit4', message: '避免错过重要更新' })}</li>
          </ul>
        </section>

        <section>
          <h2>{translate({ id: 'feeds.howToUse', message: '如何使用 RSS？' })}</h2>

          <h3>{translate({ id: 'feeds.step1Title', message: '第一步：选择 RSS 阅读器' })}</h3>

          <h4>{translate({ id: 'feeds.desktop', message: '桌面端推荐' })}</h4>
          <ul>
            <li><a href="https://netnewswire.com/" target="_blank" rel="noopener noreferrer">NetNewsWire</a> (macOS/iOS) — {translate({ id: 'feeds.netnewswire', message: '免费开源，界面简洁' })}</li>
            <li><a href="https://feedly.com/" target="_blank" rel="noopener noreferrer">Feedly</a> — {translate({ id: 'feeds.feedly', message: '跨平台，功能强大' })}</li>
            <li><a href="https://www.inoreader.com/" target="_blank" rel="noopener noreferrer">Inoreader</a> — {translate({ id: 'feeds.inoreader', message: '支持高级过滤和规则' })}</li>
            <li><a href="https://newsblur.com/" target="_blank" rel="noopener noreferrer">NewsBlur</a> — {translate({ id: 'feeds.newsblur', message: '开源，支持社交功能' })}</li>
          </ul>

          <h4>{translate({ id: 'feeds.mobile', message: '移动端推荐' })}</h4>
          <ul>
            <li><a href="https://reederapp.com/" target="_blank" rel="noopener noreferrer">Reeder</a> (iOS/macOS) — {translate({ id: 'feeds.reeder', message: '设计精美' })}</li>
            <li><a href="https://play.google.com/store/apps/details?id=com.seazon.feedme" target="_blank" rel="noopener noreferrer">FeedMe</a> (Android) — {translate({ id: 'feeds.feedme', message: '功能全面' })}</li>
            <li><a href="https://github.com/Ashinch/ReadYou" target="_blank" rel="noopener noreferrer">Read You</a> (Android) — {translate({ id: 'feeds.readyou', message: '开源免费' })}</li>
          </ul>

          <h4>{translate({ id: 'feeds.browser', message: '浏览器扩展' })}</h4>
          <ul>
            <li><a href="https://nodetics.com/feedbro/" target="_blank" rel="noopener noreferrer">Feedbro</a> — Firefox / Chrome</li>
            <li><a href="https://chrome.google.com/webstore/detail/rss-feed-reader/pnjaodmkngahhkoihejjehlcdlnohgmp" target="_blank" rel="noopener noreferrer">RSS Feed Reader</a> — Chrome</li>
          </ul>

          <h3>{translate({ id: 'feeds.step2Title', message: '第二步：添加订阅源' })}</h3>
          <ol>
            <li>{translate({ id: 'feeds.step2a', message: '复制上方表格中的订阅链接' })}</li>
            <li>{translate({ id: 'feeds.step2b', message: '在您的 RSS 阅读器中选择"添加订阅"或"Add Feed"' })}</li>
            <li>{translate({ id: 'feeds.step2c', message: '粘贴链接并确认' })}</li>
            <li>{translate({ id: 'feeds.step2d', message: '开始阅读！' })}</li>
          </ol>
        </section>

        <section>
          <h2>{translate({ id: 'feeds.tips', message: '小贴士' })}</h2>
          <p><strong>{translate({ id: 'feeds.tipsTitle', message: '订阅格式选择建议：' })}</strong></p>
          <ul>
            <li><strong>RSS 2.0</strong> — {translate({ id: 'feeds.tipsRss', message: '最广泛支持，适合大多数阅读器' })}</li>
            <li><strong>Atom 1.0</strong> — {translate({ id: 'feeds.tipsAtom', message: '更标准化，支持更多元数据' })}</li>
            <li><strong>JSON Feed</strong> — {translate({ id: 'feeds.tipsJson', message: '最新格式，适合现代应用' })}</li>
          </ul>
        </section>

        <section>
          <h2>{translate({ id: 'feeds.otherWays', message: '其他订阅方式' })}</h2>
          <p>{translate({ id: 'feeds.otherWaysDesc', message: '除了 RSS，您还可以通过以下方式关注我们：' })}</p>
          <ul>
            <li>
              <a href="https://github.com/ChanMeng666/ai-programming-teaching-project" target="_blank" rel="noopener noreferrer">
                {translate({ id: 'feeds.github', message: 'GitHub — Star 我们的项目' })}
              </a>
            </li>
            <li>
              <a href="https://discord.gg/T3NJG5n98a" target="_blank" rel="noopener noreferrer">
                {translate({ id: 'feeds.discord', message: 'Discord — 加入社区讨论' })}
              </a>
            </li>
            <li>{translate({ id: 'feeds.bookmark', message: '浏览器书签 — 收藏我们的网站' })}</li>
          </ul>
        </section>

        <section>
          <h2>{translate({ id: 'feeds.faq', message: '常见问题' })}</h2>

          <h3>{translate({ id: 'feeds.faq1q', message: 'RSS 阅读器收费吗？' })}</h3>
          <p>{translate({ id: 'feeds.faq1a', message: '大部分 RSS 阅读器都提供免费版本，功能已经足够日常使用。付费版本通常提供更多高级功能，如全文搜索、自动化规则等。' })}</p>

          <h3>{translate({ id: 'feeds.faq2q', message: '多久更新一次？' })}</h3>
          <p>{translate({ id: 'feeds.faq2a', message: '订阅源会在我们发布新文章时自动更新。大多数 RSS 阅读器会每隔 15-60 分钟检查一次更新。' })}</p>

          <h3>{translate({ id: 'feeds.faq3q', message: '可以只订阅特定主题吗？' })}</h3>
          <p>{translate({ id: 'feeds.faq3a', message: '目前我们提供全部博客文章的订阅。如果您对特定主题感兴趣，可以在 RSS 阅读器中使用过滤功能。' })}</p>
        </section>

        <footer className={styles.footer}>
          <p>
            <strong>{translate({ id: 'feeds.thanks', message: '感谢您的关注！' })}</strong>
            {' '}
            {translate({ id: 'feeds.thanksDesc', message: '我们会持续更新高质量的 AI 编程内容' })}
          </p>
        </footer>
      </main>
    </Layout>
  );
}
