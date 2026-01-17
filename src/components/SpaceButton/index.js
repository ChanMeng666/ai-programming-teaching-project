import React, { useRef, useEffect, useCallback } from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function SpaceButton({
  to,
  children,
  primary = false,
  className = '',
  onClick,
  external = false,
}) {
  const buttonRef = useRef(null);
  const shineRef = useRef(null);

  const handlePointerMove = useCallback((e) => {
    if (!buttonRef.current || !shineRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    shineRef.current.style.transform = `translate(${x}px, ${y}px)`;
    shineRef.current.classList.add(styles.visible);
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (shineRef.current) {
      shineRef.current.classList.remove(styles.visible);
    }
  }, []);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    button.addEventListener('pointermove', handlePointerMove);
    button.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      button.removeEventListener('pointermove', handlePointerMove);
      button.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [handlePointerMove, handlePointerLeave]);

  const buttonClass = `${styles.spaceButton} ${primary ? styles.primary : styles.secondary} ${className}`;

  const content = (
    <>
      <div ref={shineRef} className={styles.shine} />
      <span className={styles.content}>{children}</span>
    </>
  );

  if (external) {
    return (
      <a
        ref={buttonRef}
        href={to}
        className={buttonClass}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link
        ref={buttonRef}
        to={to}
        className={buttonClass}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={buttonRef}
      className={buttonClass}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  );
}
