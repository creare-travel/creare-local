(() => {
  const locale = document.documentElement.dataset.locale || 'en';
  const homes = { en: '/', tr: '/tr', zh: '/zh', ru: '/ru' };
  let header = document.querySelector('header[data-header-state]');
  let mobileOpen = false;
  let state = header?.dataset.headerState || 'hero';
  let languageButton = null;
  let oldOverflow = '';
  const mobileButton = () => header?.querySelector('button[aria-expanded]:not([aria-haspopup])');

  function closeLanguage(restore = false) {
    if (!languageButton) return;
    const button = languageButton;
    button.setAttribute('aria-expanded', 'false');
    button.querySelector('svg')?.classList.remove('rotate-180');
    button.parentElement.querySelector('[role="listbox"]').hidden = true;
    languageButton = null;
    if (restore) button.focus();
  }

  function syncHeader(force = false) {
    if (!header) return;
    const nextState = window.scrollY < innerHeight * 0.75 ? 'hero' : 'light';
    if (force || state !== nextState) {
      closeLanguage();
      const template = document.getElementById('home-header-' + nextState + '-' + (mobileOpen ? 'open' : 'closed'));
      const replacement = template?.content.querySelector('header')?.cloneNode(true);
      if (!replacement) return;
      replacement.querySelectorAll('[role="listbox"]').forEach(list => { list.hidden = true; });
      replacement.querySelectorAll('button[aria-haspopup]').forEach(button => {
        button.setAttribute('aria-expanded', 'false');
        button.querySelector('svg')?.classList.remove('rotate-180');
      });
      header.replaceWith(replacement);
      header = replacement;
      state = nextState;
    }
    const density = Math.min(window.scrollY / 80, 1);
    header.style.backgroundColor = state === 'light'
      ? 'rgba(247,246,244,' + (density * 0.18).toFixed(3) + ')'
      : 'rgba(0,0,0,' + (0.012 + density * 0.032).toFixed(3) + ')';
    header.style.backdropFilter = 'blur(' + (state === 'light' ? density * 3 : 0.5 + density * 3.5).toFixed(2) + 'px)';
    header.style.boxShadow = state === 'light' ? '0 10px 34px rgba(0,0,0,' + (density * 0.04).toFixed(3) + ')' : 'none';
  }

  function setMobile(open, restore = false) {
    if (open && !mobileOpen) oldOverflow = document.body.style.overflow;
    mobileOpen = open;
    document.body.style.overflow = open ? 'hidden' : oldOverflow;
    syncHeader(true);
    if (restore) mobileButton()?.focus();
  }

  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { syncHeader(); queued = false; });
  }, { passive: true });
  addEventListener('resize', () => {
    if (innerWidth >= 1024 && mobileOpen) setMobile(false);
    syncHeader();
  });
  syncHeader();

  function openLanguage(button, focus = false) {
    const alreadyOpen = languageButton === button;
    closeLanguage();
    if (alreadyOpen) return;
    languageButton = button;
    let list = button.parentElement.querySelector('[role="listbox"]');
    if (!list) {
      const template = document.getElementById('home-header-' + state + '-closed');
      list = template?.content.querySelector('[role="listbox"]')?.cloneNode(true);
      if (!list) return;
      button.parentElement.appendChild(list);
    }
    list.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    button.querySelector('svg')?.classList.add('rotate-180');
    if (focus) (list.querySelector('[aria-selected="true"] button') || list.querySelector('button'))?.focus();
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button');
    if (button && header?.contains(button)) {
      if (button.matches('[aria-haspopup]')) { openLanguage(button); return; }
      const option = button.closest('[role="option"]');
      if (option) {
        const code = Object.keys(homes)[Array.from(option.parentElement.children).indexOf(option)];
        closeLanguage();
        if (code && code !== locale) {
          try { localStorage.setItem('creare_locale', code); } catch {}
          location.assign(homes[code] + location.search + location.hash);
        }
        return;
      }
      if (button.matches('[aria-expanded]:not([aria-haspopup])')) { setMobile(!mobileOpen, true); return; }
      if (button.matches('.fixed.inset-0')) { setMobile(false, true); return; }
    }
    if (!event.target.closest('[role="listbox"]')) closeLanguage();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (languageButton) closeLanguage(true);
      else if (mobileOpen) setMobile(false, true);
    }
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.matches('button[aria-haspopup]') && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); openLanguage(target, true); return;
    }
    const list = target.closest('[role="listbox"]');
    if (list && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const options = Array.from(list.querySelectorAll('button'));
      let i = options.indexOf(document.activeElement);
      i = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (i + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      options[i]?.focus();
    }
    if (event.key === 'Tab' && mobileOpen) {
      const focusable = Array.from(header.querySelectorAll('a, button')).filter(el => el.getClientRects().length && !el.closest('[hidden]'));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    } else if (event.key === 'Tab' && languageButton) {
      setTimeout(() => {
        if (languageButton && !languageButton.parentElement.contains(document.activeElement)) closeLanguage();
      }, 0);
    }
  });

  document.querySelectorAll('img[data-app-image]').forEach(img => {
    const loaded = () => {
      img.classList.remove('opacity-0', 'scale-[1.012]', 'blur-[0.4px]');
      img.classList.add('opacity-100', 'scale-100', 'blur-0');
      img.style.backgroundImage = '';
    };
    const failed = () => {
      if (img.dataset.fallbackUsed) return;
      img.dataset.fallbackUsed = 'true';
      img.removeAttribute('srcset');
      img.src = img.dataset.fallbackSrc;
    };
    img.addEventListener('load', loaded);
    img.addEventListener('error', failed);
    if (img.complete) { if (img.naturalWidth) loaded(); else failed(); }
  });

  const gtmId = document.body.dataset.homeGtmId;
  if (!gtmId) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'page_view', page_path: location.pathname + location.search });
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[data-home-inquiry-label]');
    if (!link) return;
    window.dataLayer.push({
      event: 'inquiry_click',
      page_path: location.pathname,
      page_title: document.title,
      page_location: location.href,
      cta_label: link.dataset.homeInquiryLabel,
      inquiry_source: 'home_hero',
      experience_slug: new URLSearchParams(location.search).get('exp') || 'direct',
      session_origin: 'direct',
      intent_level: 'medium',
      cta_position: 'hero',
    });
  });
  const events = ['pointerdown', 'touchstart', 'keydown', 'scroll'];
  let loaded = false;
  let timer;
  function loadGtm() {
    if (loaded) return;
    loaded = true;
    clearTimeout(timer);
    events.forEach(name => removeEventListener(name, loadGtm));
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.id = 'gtm-init';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(gtmId);
    document.head.appendChild(script);
  }
  events.forEach(name => addEventListener(name, loadGtm, { once: true, passive: true }));
  timer = setTimeout(loadGtm, 30000);
})();
