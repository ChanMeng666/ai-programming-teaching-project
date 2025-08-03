import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import styles from './styles.module.css';

// Conditional imports to handle both docs and blog contexts
let useDoc, useBlogPost;
try {
  useDoc = require('@docusaurus/plugin-content-docs/client').useDoc;
} catch (e) {
  useDoc = null;
}
try {
  useBlogPost = require('@docusaurus/plugin-content-blog/client').useBlogPost;
} catch (e) {
  useBlogPost = null;
}

export default function CopyMarkdownButton() {
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const location = useLocation();
  
  let doc = null;
  let blogPost = null;
  
  // Try to get doc context
  if (useDoc) {
    try {
      doc = useDoc();
    } catch (e) {
      doc = null;
    }
  }
  
  // Try to get blog post context
  if (useBlogPost) {
    try {
      const blogContext = useBlogPost();
      blogPost = blogContext?.metadata;
    } catch (e) {
      blogPost = null;
    }
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCopy = async () => {
    if (!isClient) return;

    try {
      let markdownContent = '';
      
      // Handle docs context
      if (doc && doc.metadata) {
        const frontmatter = doc.metadata.frontMatter || {};
        const title = doc.metadata.title;
        const description = doc.metadata.description;
        
        if (Object.keys(frontmatter).length > 0 || title || description) {
          markdownContent += '---\n';
          if (title && !frontmatter.title) {
            markdownContent += `title: ${title}\n`;
          }
          if (description && !frontmatter.description) {
            markdownContent += `description: ${description}\n`;
          }
          Object.entries(frontmatter).forEach(([key, value]) => {
            if (typeof value === 'object') {
              markdownContent += `${key}: ${JSON.stringify(value)}\n`;
            } else {
              markdownContent += `${key}: ${value}\n`;
            }
          });
          markdownContent += '---\n\n';
        }
      }
      
      // Handle blog post context
      else if (blogPost) {
        markdownContent += '---\n';
        if (blogPost.title) {
          markdownContent += `title: ${blogPost.title}\n`;
        }
        if (blogPost.description) {
          markdownContent += `description: ${blogPost.description}\n`;
        }
        if (blogPost.authors && blogPost.authors.length > 0) {
          markdownContent += `authors: [${blogPost.authors.map(a => a.name).join(', ')}]\n`;
        }
        if (blogPost.tags && blogPost.tags.length > 0) {
          markdownContent += `tags: [${blogPost.tags.map(t => t.label).join(', ')}]\n`;
        }
        if (blogPost.date) {
          markdownContent += `date: ${blogPost.date}\n`;
        }
        markdownContent += '---\n\n';
      }
      
      const articleElement = document.querySelector('article');
      if (articleElement) {
        const contentElement = articleElement.cloneNode(true);
        
        contentElement.querySelectorAll('.theme-code-block-buttons').forEach(el => el.remove());
        contentElement.querySelectorAll('button').forEach(el => el.remove());
        
        const processNode = (node, depth = 0) => {
          let result = '';
          
          if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent;
          }
          
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();
            
            switch(tag) {
              case 'h1':
                result += `# ${node.textContent.trim()}\n\n`;
                break;
              case 'h2':
                result += `## ${node.textContent.trim()}\n\n`;
                break;
              case 'h3':
                result += `### ${node.textContent.trim()}\n\n`;
                break;
              case 'h4':
                result += `#### ${node.textContent.trim()}\n\n`;
                break;
              case 'h5':
                result += `##### ${node.textContent.trim()}\n\n`;
                break;
              case 'h6':
                result += `###### ${node.textContent.trim()}\n\n`;
                break;
              case 'p':
                result += `${node.textContent.trim()}\n\n`;
                break;
              case 'pre':
                const codeElement = node.querySelector('code');
                if (codeElement) {
                  const lang = codeElement.className.replace(/language-/, '').split(' ')[0] || '';
                  result += `\`\`\`${lang}\n${codeElement.textContent.trim()}\n\`\`\`\n\n`;
                } else {
                  result += `\`\`\`\n${node.textContent.trim()}\n\`\`\`\n\n`;
                }
                break;
              case 'ul':
              case 'ol':
                node.querySelectorAll('li').forEach((li, index) => {
                  const prefix = tag === 'ol' ? `${index + 1}. ` : '- ';
                  result += `${prefix}${li.textContent.trim()}\n`;
                });
                result += '\n';
                break;
              case 'blockquote':
                const lines = node.textContent.trim().split('\n');
                lines.forEach(line => {
                  result += `> ${line}\n`;
                });
                result += '\n';
                break;
              case 'a':
                const href = node.getAttribute('href');
                const text = node.textContent.trim();
                if (href && text) {
                  return `[${text}](${href})`;
                }
                return text;
              case 'code':
                if (node.parentElement.tagName.toLowerCase() !== 'pre') {
                  return `\`${node.textContent.trim()}\``;
                }
                break;
              case 'strong':
              case 'b':
                return `**${node.textContent.trim()}**`;
              case 'em':
              case 'i':
                return `*${node.textContent.trim()}*`;
              case 'br':
                return '\n';
              case 'hr':
                return '\n---\n\n';
              case 'img':
                const src = node.getAttribute('src');
                const alt = node.getAttribute('alt') || '';
                if (src) {
                  result += `![${alt}](${src})\n\n`;
                }
                break;
              case 'table':
                const rows = Array.from(node.querySelectorAll('tr'));
                if (rows.length > 0) {
                  rows.forEach((row, rowIndex) => {
                    const cells = Array.from(row.querySelectorAll('td, th'));
                    result += '| ' + cells.map(cell => cell.textContent.trim()).join(' | ') + ' |\n';
                    if (rowIndex === 0 && row.querySelector('th')) {
                      result += '| ' + cells.map(() => '---').join(' | ') + ' |\n';
                    }
                  });
                  result += '\n';
                }
                break;
              default:
                if (!['script', 'style', 'button', 'svg', 'nav'].includes(tag)) {
                  for (let child of node.childNodes) {
                    result += processNode(child, depth + 1);
                  }
                }
            }
          }
          
          return result;
        };
        
        // Try to find the main content area (works for both docs and blog)
        const mainContent = contentElement.querySelector('.theme-doc-markdown') || 
                           contentElement.querySelector('.markdown') ||
                           contentElement;
        markdownContent += processNode(mainContent);
      }

      await navigator.clipboard.writeText(markdownContent.trim());
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy markdown:', error);
      
      try {
        const fallbackContent = document.querySelector('article')?.innerText || '';
        await navigator.clipboard.writeText(fallbackContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
      }
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <button
      className={styles.copyButton}
      onClick={handleCopy}
      aria-label="Copy page as markdown"
      title="Copy page as markdown"
    >
      {copied ? (
        <>
          <svg 
            className={styles.icon} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span className={styles.text}>Copied!</span>
        </>
      ) : (
        <>
          <svg 
            className={styles.icon} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span className={styles.text}>Copy as Markdown</span>
        </>
      )}
    </button>
  );
}