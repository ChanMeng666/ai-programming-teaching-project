import React, {useState, useCallback} from 'react';
import MermaidOriginal from '@theme-original/Mermaid';
import CodeBlock from '@theme/CodeBlock';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function Mermaid(props) {
  const [view, setView] = useState('diagram');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = props.value ?? '';
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently ignore — user can fall back to code view and select manually
    }
  }, [props.value]);

  return (
    <div className={styles.container} role="group" aria-label="Mermaid diagram">
      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'diagram'}
            className={styles.tab}
            onClick={() => setView('diagram')}
          >
            <Translate id="theme.Mermaid.viewDiagram" description="Mermaid view toggle: diagram">
              Diagram
            </Translate>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'code'}
            className={styles.tab}
            onClick={() => setView('code')}
          >
            <Translate id="theme.Mermaid.viewCode" description="Mermaid view toggle: code">
              Code
            </Translate>
          </button>
        </div>
        <button
          type="button"
          className={styles.copyBtn}
          onClick={handleCopy}
          aria-live="polite"
        >
          {copied ? (
            <Translate id="theme.Mermaid.copied" description="Mermaid copy success label">
              Copied
            </Translate>
          ) : (
            <Translate id="theme.Mermaid.copy" description="Mermaid copy button">
              Copy
            </Translate>
          )}
        </button>
      </div>
      <div className={styles.body}>
        {view === 'diagram' ? (
          <MermaidOriginal {...props} />
        ) : (
          <CodeBlock language="mermaid" className={styles.codeBlock}>
            {props.value}
          </CodeBlock>
        )}
      </div>
    </div>
  );
}
