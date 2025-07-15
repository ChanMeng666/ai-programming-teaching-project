import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import WaveAnimation from '@site/src/components/WaveAnimation';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import { Analytics } from '@vercel/analytics/react';

function HeroSection() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <div className={styles.heroTitle}>
            <Heading as="h1" className={styles.mainTitle}>
              掌握AI编程
            </Heading>
            <div className={styles.titleAccent}></div>
          </div>
          <p className={styles.heroDescription}>
            通过实践案例学习人工智能开发，从基础到进阶，
            <br />
            打造完整的AI编程技能体系
          </p>
          <div className={styles.heroActions}>
            <Link
              className={clsx('button', styles.primaryButton)}
              to="/docs/intro">
              开始学习
            </Link>
            <Link
              className={clsx('button', styles.secondaryButton)}
              to="/blog">
              阅读博客
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className={styles.cardTitle}>AI Programming</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.codeLines}>
                <div className={styles.codeLine}>
                  <span className={styles.codeKeyword}>import</span>
                  <span className={styles.codeString}> ai_tools</span>
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeKeyword}>def</span>
                  <span className={styles.codeFunction}> create_app</span>():
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeIndent}>  </span>
                  <span className={styles.codeComment}># 构建AI应用</span>
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeIndent}>  </span>
                  <span className={styles.codeKeyword}>return</span>
                  <span className={styles.codeString}> "Hello AI"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}





export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="AI编程学习平台"
      description="通过实践案例学习AI编程，掌握现代人工智能开发技能">
      <main className={styles.main}>
        <HeroSection />
        <HomepageFeatures />
      </main>
      <Analytics />
    </Layout>
  );
}
