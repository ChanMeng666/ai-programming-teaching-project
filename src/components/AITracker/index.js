import { useEffect } from 'react';

/**
 * AI流量追踪组件
 * 检测并记录来自AI平台的访问流量
 */
export default function AITracker() {
  useEffect(() => {
    // 定义已知的AI平台referrer模式
    const aiReferrers = [
      'chat.openai.com',
      'claude.ai',
      'bard.google.com',
      'copilot.microsoft.com',
      'gemini.google.com',
      'perplexity.ai',
      'you.com',
      'phind.com',
      'poe.com'
    ];

    // 检测AI来源查询参数
    const aiQueryParams = [
      'ai_source',
      'from_ai',
      'chatgpt',
      'claude',
      'gemini'
    ];

    const detectAITraffic = () => {
      const referrer = document.referrer.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();
      const currentUrl = new URL(window.location.href);
      
      let isAITraffic = false;
      let aiSource = 'unknown';

      // 检查referrer
      for (const aiRef of aiReferrers) {
        if (referrer.includes(aiRef)) {
          isAITraffic = true;
          aiSource = aiRef;
          break;
        }
      }

      // 检查查询参数
      if (!isAITraffic) {
        for (const param of aiQueryParams) {
          if (currentUrl.searchParams.has(param)) {
            isAITraffic = true;
            aiSource = currentUrl.searchParams.get(param) || param;
            break;
          }
        }
      }

      // 检查特定的User-Agent模式 (一些AI爬虫)
      if (!isAITraffic) {
        const aiUserAgents = [
          'gptbot',
          'chatgpt',
          'claude',
          'anthropic',
          'openai',
          'google-extended',
          'bard'
        ];
        
        for (const agent of aiUserAgents) {
          if (userAgent.includes(agent)) {
            isAITraffic = true;
            aiSource = agent;
            break;
          }
        }
      }

      if (isAITraffic) {
        // 记录AI来源访问
        const trackingData = {
          source: aiSource,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          sessionId: generateSessionId()
        };

        // 发送到分析服务
        trackAIVisit(trackingData);
        
        // 设置localStorage标记
        localStorage.setItem('ai_visitor', JSON.stringify({
          source: aiSource,
          firstVisit: new Date().toISOString()
        }));

        // 在开发环境下显示调试信息
        if (process.env.NODE_ENV === 'development') {
          console.log('AI流量检测:', trackingData);
        }
      }
    };

    const generateSessionId = () => {
      return 'ai_session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    };

    const trackAIVisit = (data) => {
      // 发送到Vercel Analytics (如果可用)
      if (typeof window !== 'undefined' && window.va) {
        window.va('track', 'AI_Traffic', data);
      }

      // 发送到Google Analytics (如果可用)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'ai_visit', {
          custom_parameter_source: data.source,
          custom_parameter_page: data.page
        });
      }

      // 发送到自定义分析端点 (可选)
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/analytics/ai-traffic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        }).catch(err => {
          // 静默失败，不影响用户体验
          console.debug('AI tracking failed:', err);
        });
      }
    };

    // 检查是否是重复访问
    const checkReturnVisitor = () => {
      const previousVisit = localStorage.getItem('ai_visitor');
      if (previousVisit) {
        const visitData = JSON.parse(previousVisit);
        return {
          isReturn: true,
          previousSource: visitData.source,
          daysSinceFirst: Math.floor((Date.now() - new Date(visitData.firstVisit)) / (1000 * 60 * 60 * 24))
        };
      }
      return { isReturn: false };
    };

    // 延迟执行检测，确保页面完全加载
    const timer = setTimeout(() => {
      detectAITraffic();
      
      // 记录访问时长 (用于分析AI用户的参与度)
      const startTime = Date.now();
      const trackEngagement = () => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        if (timeSpent > 30) { // 至少停留30秒才记录
          const aiVisitor = localStorage.getItem('ai_visitor');
          if (aiVisitor) {
            if (typeof window !== 'undefined' && window.va) {
              window.va('track', 'AI_Engagement', {
                timeSpent: timeSpent,
                source: JSON.parse(aiVisitor).source,
                page: window.location.pathname
              });
            }
          }
        }
      };

      // 监听页面离开事件
      const handleBeforeUnload = () => {
        trackEngagement();
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          trackEngagement();
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // 清理事件监听器
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };

    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 这个组件不渲染任何可见内容
  return null;
}
