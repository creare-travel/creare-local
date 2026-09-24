(() => {
  const launcher = document.querySelector('.creare-assistant-launcher');
  if (!(launcher instanceof HTMLButtonElement) || launcher.dataset.shellBound === 'true') return;

  launcher.dataset.shellBound = 'true';

  const TYPEBOT_PUBLIC_ID = 'creare-assistant';
  const TYPEBOT_PREVIEW_ID = 'cmufapz3700000agmskmdsvaz';
  const TYPEBOT_INSTANCE_ID = 'creare-assistant-bubble';

  let typebot;
  let isOpen = false;

  const setOpen = (open) => {
    isOpen = open;
    launcher.dataset.open = open ? 'true' : 'false';
    launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const setReady = (ready) => {
    launcher.dataset.ready = ready ? 'true' : 'false';
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
