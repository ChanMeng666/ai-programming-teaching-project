import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import styles from './styles.module.css';

// Try to get doc context
let useDoc;
try {
  useDoc = require('@docusaurus/plugin-content-docs/client').useDoc;
} catch (e) {
  useDoc = null;
}

// Try to get blog context
let useBlogPost;
try {
  useBlogPost = require('@docusaurus/plugin-content-blog/client').useBlogPost;
} catch (e) {
  useBlogPost = null;
}

export default function OpenInChatGPTButton() {
  const [isClient, setIsClient] = useState(false);
  const location = useLocation();
  
  let doc = null;
  let blogPost = null;
  
  if (useDoc) {
    try {
      doc = useDoc();
    } catch (e) {
      doc = null;
    }
  }
  
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

  const handleOpenInChatGPT = () => {
    if (!isClient) return;

    try {
      // GitHub repository information
      const githubOwner = 'ChanMeng666';
      const githubRepo = 'ai-programming-teaching-project';
      const githubBranch = 'main';
      
      // Get current page path
      let pagePath = location.pathname;
      
      // Remove locale prefix if exists
      pagePath = pagePath.replace(/^\/zh-Hans/, '');
      
      // Handle different content types
      let rawPath;
      
      // Handle blog posts
      if (pagePath.startsWith('/blog/')) {
        // Extract the blog slug from the path
        const blogSlug = pagePath.replace('/blog/', '');
        
        // Blog post URLs might be simplified (without date prefix)
        // We need to match the actual file name pattern
        // For now, we'll handle known patterns:
        // - If it already has date prefix: 2024-11-19-design-system
        // - If it doesn't: design-system-guide -> need to find matching file
        
        if (/^\d{4}-\d{2}-\d{2}-/.test(blogSlug)) {
          // Already has date prefix
          rawPath = `blog/${blogSlug}.mdx`;
        } else {
          // Try to map known blog posts (this is a simplified approach)
          // In production, you might want to read from a manifest or use a different strategy
          const blogMappings = {
            'design-system-guide': '2024-11-19-design-system',
            'tencent-meeting-recording-download': '2024-11-24-tencent-meeting-recording',
            'overseas-study-career-planning': '2024-12-11-overseas-study-career',
            'video-resources': '2025-02-01-video-resources',
            'identity-recognition-through-multiple-lenses': '2025-07-27-mentor-group-qa'
          };
          
          const mappedSlug = blogMappings[blogSlug] || blogSlug;
          rawPath = `blog/${mappedSlug}.mdx`;
        }
      }
      // Handle versioned docs
      else if (pagePath.includes('/docs/version-')) {
        // Versioned docs: /docs/version-2024-winter/intro -> versioned_docs/version-2024-winter/intro.mdx
        rawPath = pagePath.replace('/docs/', 'versioned_docs/');
      } else if (pagePath.startsWith('/docs/')) {
        // Current version docs: /docs/intro -> docs/intro.mdx
        rawPath = pagePath.replace('/docs/', 'docs/');
      } else if (pagePath === '/docs' || pagePath === '/docs/') {
        // Root docs page
        rawPath = 'docs/intro.mdx';
      } else {
        // Fallback: use the path as is
        rawPath = pagePath;
      }
      
      // Remove trailing slash
      rawPath = rawPath.replace(/\/$/, '');
      
      // Handle special cases for docs structure
      if (rawPath === 'docs') {
        rawPath = 'docs/intro.mdx';
      } else if (!rawPath.endsWith('.mdx') && !rawPath.endsWith('.md')) {
        // Add file extension if not present (for docs only, blog already handled)
        if (!rawPath.startsWith('blog/')) {
          if (rawPath.endsWith('/index')) {
            // Index pages: docs/basics/index -> docs/basics/index.mdx
            rawPath += '.mdx';
          } else if (rawPath.includes('/')) {
            // Regular pages: docs/intro -> docs/intro.mdx
            rawPath += '.mdx';
          } else {
            // Single word: intro -> intro.mdx
            rawPath += '.mdx';
          }
        }
      }
      
      // Clean up double slashes
      rawPath = rawPath.replace(/\/+/g, '/');
      
      // Remove leading slash
      rawPath = rawPath.replace(/^\//, '');
      
      // Construct GitHub raw URL
      const rawUrl = `https://raw.githubusercontent.com/${githubOwner}/${githubRepo}/${githubBranch}/${rawPath}`;
      
      // Construct ChatGPT URL with prompt
      const prompt = `Read ${rawUrl}`;
      const chatGPTUrl = `https://chatgpt.com/?hints=search&prompt=${encodeURIComponent(prompt)}`;
      
      // Open in new tab
      window.open(chatGPTUrl, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Failed to open in ChatGPT:', error);
      
      // Fallback: open ChatGPT with just the page title
      if (doc && doc.metadata && doc.metadata.title) {
        const fallbackPrompt = `Tell me about: ${doc.metadata.title}`;
        const fallbackUrl = `https://chatgpt.com/?prompt=${encodeURIComponent(fallbackPrompt)}`;
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Last resort: just open ChatGPT
        window.open('https://chatgpt.com/', '_blank', 'noopener,noreferrer');
      }
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <button
      className={styles.openButton}
      onClick={handleOpenInChatGPT}
      aria-label="Open in ChatGPT"
      title="Open this page in ChatGPT"
    >
      <svg 
        className={styles.icon} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
      <span className={styles.text}>Open in ChatGPT</span>
    </button>
  );
}