import React, { useEffect, useState } from 'react';
import { useNavbarMobileSidebar } from '@docusaurus/theme-common/internal';
import NavbarMobileSidebar from '@theme/Navbar/MobileSidebar';
import styles from './styles.module.css';
import clsx from 'clsx';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileSidebar = useNavbarMobileSidebar();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={clsx(styles.navbar, isScrolled && styles.navbarScrolled)}>
      <div className="container">
        <div className={styles.navbarInner}>
          <div className={styles.navbarLeft}>
            <button
              onClick={mobileSidebar.toggle}
              className={clsx(
                styles.navbarBurger,
                mobileSidebar.shown && styles.navbarBurgerActive
              )}
              aria-label="Navigation bar toggle"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div className={styles.navbarLogo}>
              <img src="/img/logo.svg" alt="Logo" />
              <span>AI Programming</span>
            </div>
          </div>
          <div className={styles.navbarCenter}>
            <div className={styles.navbarItems}>
              <a href="/docs/intro" className={styles.navbarItem}>教程</a>
              <a href="/blog" className={styles.navbarItem}>博客</a>
              <div className={styles.navbarDropdown}>
                <span className={styles.navbarItem}>资源</span>
                <div className={styles.dropdownContent}>
                  <a href="/docs/category/tutorial-basics">基础教程</a>
                  <a href="/docs/category/tutorial-extras">进阶内容</a>
                  <a href="/blog">最新动态</a>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.navbarRight}>
            <div className={styles.navbarSearch}>
              <input type="search" placeholder="搜索..." />
              <svg className={styles.searchIcon} viewBox="0 0 24 24">
                <path d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.39zM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7z"/>
              </svg>
            </div>
            <a href="https://github.com" className={styles.githubLink}>
              <svg viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      {mobileSidebar.shown && <NavbarMobileSidebar />}
    </nav>
  );
} 