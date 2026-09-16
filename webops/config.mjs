export const WEBOPS_CONFIG = {
  site: 'https://crearetravel.com',
  targets: [
    { id: 'home-en', locale: 'en', url: 'https://crearetravel.com/' },
    { id: 'home-tr', locale: 'tr', url: 'https://crearetravel.com/tr' },
    { id: 'home-zh', locale: 'zh', url: 'https://crearetravel.com/zh' },
    { id: 'home-ru', locale: 'ru', url: 'https://crearetravel.com/ru' },
  ],
  strategies: ['mobile', 'desktop'],
  categories: ['performance', 'accessibility', 'best-practices', 'seo'],
  thresholds: {
    mobile: {
      performance: 90,
      lcpMs: 2500,
      cls: 0.1,
      tbtMs: 200,
    },
    desktop: {
      performance: 90,
      lcpMs: 2500,
      cls: 0.1,
      tbtMs: 200,
    },
  },
  anomalyRules: {
    localePerformanceGap: 15,
    localeLcpRatio: 2,
  },
};
