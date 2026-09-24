(() => {
  const launcher = document.querySelector('.creare-assistant-launcher');
  if (!(launcher instanceof HTMLButtonElement) || launcher.dataset.shellBound === 'true') return;

  launcher.dataset.shellBound = 'true';

  const TYPEBOT_PUBLIC_ID = 'creare-assistant';
  const TYPEBOT_PREVIEW_ID = 'cmufapz3700000agmskmdsvaz';
  const TYPEBOT_INSTANCE_ID = 'creare-assistant-bubble';

  let typebot;
  let isOpen = false;
  let isReady = false;

  const locale = (document.documentElement.lang || 'en').slice(0, 2);
  const copy = {
    en: { hint: 'Begin a conversation', close: 'Close conversation' },
    tr: { hint: 'Görüşmeyi başlat', close: 'Görüşmeyi kapat' },
    ru: { hint: 'Начать диалог', close: 'Закрыть диалог' },
    zh: { hint: '开始沟通', close: '关闭对话' },
  }[locale] || { hint: 'Begin a conversation', close: 'Close conversation' };
  const hint = launcher.querySelector('.creare-assistant-hint');

  const syncHint = () => {
    if (!(hint instanceof HTMLElement)) return;
    hint.textContent = isReady ? (isOpen ? copy.close : copy.hint) : '…';
  };

  const setOpen = (open) => {
    isOpen = open;
    launcher.dataset.open = open ? 'true' : 'false';
    launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
    syncHint();
  };

  const setReady = (ready) => {
    isReady = ready;
    launcher.dataset.ready = ready ? 'true' : 'false';
    syncHint();
  };

  const init = async () => {
    try {
      const module = await import('https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js');
      typebot = module.default;

      const isLocalPreview =
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1' ||
        location.hostname === '192.168.1.106';

      typebot.initBubble({
        id: TYPEBOT_INSTANCE_ID,
        typebot: isLocalPreview ? TYPEBOT_PREVIEW_ID : TYPEBOT_PUBLIC_ID,
        isPreview: isLocalPreview,
        apiHost: isLocalPreview ? location.origin + '/api/typebot-preview' : undefined,
        theme: {
          placement: 'right',
          button: { isHidden: true },
          chatWindow: {
            backgroundColor: '#0b0b0c',
            maxWidth: '440px',
            maxHeight: '760px',
          },
        },
        onOpen: () => setOpen(true),
        onClose: () => setOpen(false),
      });

      setReady(true);
    } catch {
      setReady(false);
      launcher.dataset.error = 'true';
    }
  };

  launcher.addEventListener('click', () => {
    if (!typebot || launcher.dataset.ready !== 'true') return;
    if (isOpen) typebot.close({ id: TYPEBOT_INSTANCE_ID });
    else typebot.open({ id: TYPEBOT_INSTANCE_ID });
  });

  init();
})();
