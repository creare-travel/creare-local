(() => {
  const locale = document.documentElement.dataset.locale || 'en';
  const homeByLocale = { en: '/', tr: '/tr', zh: '/zh', ru: '/ru' };
  const languageLabels = { en: 'English', tr: 'Türkçe', zh: '简体中文', ru: 'Русский' };
  const header = document.querySelector('header[data-header-state]');
  const topHeaderStyle = header?.getAttribute('style') || '';

  function setHeaderTone(lightSurface) {
    if (!header) return;
    const y = window.scrollY;
    const density = Math.min(y / 80, 1);
    header.dataset.headerState = lightSurface ? 'light' : 'hero';
    header.style.backgroundColor = lightSurface
      ? `rgba(247,246,244,${(0.78 + density * 0.16).toFixed(3)})`
      : `rgba(0,0,0,${(0.012 + density * 0.032).toFixed(3)})`;
    header.style.backdropFilter = `blur(${lightSurface ? 6 : 0.5 + density * 3.5}px)`;
    header.style.boxShadow = lightSurface ? '0 10px 34px rgba(0,0,0,.04)' : 'none';
    header.style.borderColor = lightSurface ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.025)';

    const tone = lightSurface ? '#1f1b18' : 'rgba(255,255,255,.88)';
    header.querySelectorAll('a, button').forEach((element) => {
      element.style.color = tone;
    });
  }

  function syncHeader() {
    if (!header) return;
    const lightSurface = window.scrollY >= window.innerHeight * 0.75;
    if (!lightSurface && window.scrollY < 2 && topHeaderStyle) {
      header.setAttribute('style', topHeaderStyle);
      header.querySelectorAll('a, button').forEach((element) => {
        element.style.color = '';
      });
      header.dataset.headerState = 'hero';
      return;
    }
    setHeaderTone(lightSurface);
  }

  let scrollQueued = false;
  addEventListener(
    'scroll',
    () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        syncHeader();
        scrollQueued = false;
      });
    },
    { passive: true }
  );
  syncHeader();

  function closeMenus() {
    document.querySelectorAll('[data-static-menu]').forEach((element) => element.remove());
    document.querySelectorAll('button[aria-expanded="true"]').forEach((element) => {
      element.setAttribute('aria-expanded', 'false');
    });
    document.body.style.overflow = '';
  }

  addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenus();
  });

  document.querySelectorAll('button[aria-label="Select language"]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      if (document.querySelector('[data-static-menu="language"]')) {
        closeMenus();
        return;
      }

      closeMenus();
      button.setAttribute('aria-expanded', 'true');
      const menu = document.createElement('div');
      menu.dataset.staticMenu = 'language';
      menu.setAttribute('role', 'menu');
      menu.style.cssText =
        'position:absolute;right:0;top:calc(100% + 14px);min-width:150px;background:rgba(10,10,10,.96);border:1px solid rgba(255,255,255,.12);padding:10px;z-index:80;backdrop-filter:blur(12px)';

      for (const code of ['en', 'tr', 'zh', 'ru']) {
        const link = document.createElement('a');
        link.href = homeByLocale[code];
        link.textContent = languageLabels[code];
        link.setAttribute('role', 'menuitem');
        link.style.cssText =
          'display:block;padding:9px 12px;color:rgba(255,255,255,.82);font-size:12px;text-decoration:none;letter-spacing:.08em';
        menu.appendChild(link);
      }
      button.parentElement?.appendChild(menu);
    });
  });

  document.querySelectorAll('button[aria-expanded]:not([aria-haspopup])').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      if (document.querySelector('[data-static-menu="mobile"]')) {
        closeMenus();
        return;
      }

      closeMenus();
      button.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      const overlay = document.createElement('div');
      overlay.dataset.staticMenu = 'mobile';
      overlay.setAttribute('role', 'navigation');
      overlay.style.cssText =
        'position:fixed;inset:64px 0 0;background:#050505;z-index:49;padding:36px 24px;overflow:auto';

      const links = [...(header?.querySelectorAll('nav a') || [])].filter((link) => {
        return link.textContent?.trim().toUpperCase() !== 'CREARE';
      });
      const seen = new Set();
      for (const source of links) {
        const href = source.getAttribute('href');
        if (!href || seen.has(href)) continue;
        seen.add(href);
        const link = document.createElement('a');
        link.href = href;
        link.textContent = source.textContent?.trim() || href;
        link.style.cssText =
          'display:block;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.1);color:white;text-decoration:none;font-size:14px;letter-spacing:.08em;text-transform:uppercase';
        overlay.appendChild(link);
      }

      const languages = document.createElement('div');
      languages.style.cssText = 'display:flex;gap:18px;padding-top:28px;flex-wrap:wrap';
      for (const code of ['en', 'tr', 'zh', 'ru']) {
        const link = document.createElement('a');
        link.href = homeByLocale[code];
        link.textContent = languageLabels[code];
        link.style.cssText =
          'color:rgba(255,255,255,.65);text-decoration:none;font-size:12px';
        languages.appendChild(link);
      }
      overlay.appendChild(languages);
      document.body.appendChild(overlay);
    });
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('[data-static-menu],button[aria-expanded="true"]')) return;
    closeMenus();
  });

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'page_view', page_path: location.pathname + location.search });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.includes('/contact')) {
      window.dataLayer.push({
        event: 'inquiry_click',
        cta_label: (link.textContent || 'Contact').trim().slice(0, 120),
        inquiry_source: 'home_static_shell',
        page_path: location.pathname,
      });
    }
  });

  const gtmId = 'GTM-K99ZH56G';
  let gtmLoaded = false;
  const loadGtm = () => {
    if (gtmLoaded) return;
    gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(script);
  };
  ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach((eventName) => {
    addEventListener(eventName, loadGtm, { once: true, passive: true });
  });
  setTimeout(loadGtm, 30000);
})();
