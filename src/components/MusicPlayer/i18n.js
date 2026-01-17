/**
 * 音乐播放器国际化配置
 */

const translations = {
  'zh-Hans': {
    title: '背景音乐',
    playing: '背景音乐播放中',
    minimizeLabel: '最小化（音乐继续播放）',
    closeLabel: '关闭播放器（停止音乐）',
    expandLabel: '展开音乐播放器',
    stopLabel: '停止音乐',
    footerTip: '点击最小化按钮可隐藏窗口，音乐将继续播放',
  },
  en: {
    title: 'Background Music',
    playing: 'Music Playing',
    minimizeLabel: 'Minimize (music continues)',
    closeLabel: 'Close player (stop music)',
    expandLabel: 'Expand music player',
    stopLabel: 'Stop music',
    footerTip: 'Click minimize to hide the window while music continues',
  },
};

/**
 * 获取当前语言环境
 * 通过检测 URL 路径或 HTML lang 属性来判断
 */
export function getCurrentLocale() {
  if (typeof window === 'undefined') return 'zh-Hans';

  // 检查 URL 路径是否包含 /en/
  if (window.location.pathname.startsWith('/en/') || window.location.pathname === '/en') {
    return 'en';
  }

  // 检查 HTML lang 属性
  const htmlLang = document.documentElement.lang;
  if (htmlLang && htmlLang.startsWith('en')) {
    return 'en';
  }

  return 'zh-Hans';
}

/**
 * 获取翻译文本
 * @param {string} key - 翻译键
 * @param {string} locale - 可选的语言环境，默认自动检测
 */
export function t(key, locale) {
  const currentLocale = locale || getCurrentLocale();
  const localeTranslations = translations[currentLocale] || translations['zh-Hans'];
  return localeTranslations[key] || key;
}

/**
 * 获取所有翻译（用于组件）
 * @param {string} locale - 可选的语言环境，默认自动检测
 */
export function getTranslations(locale) {
  const currentLocale = locale || getCurrentLocale();
  return translations[currentLocale] || translations['zh-Hans'];
}
