'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const SCRIPT_ID = 'creare-typebot-bubble-init';
const TYPEBOT_PUBLIC_ID = 'creare-assistant';
const TYPEBOT_PREVIEW_ID = 'cmufapz3700000agmskmdsvaz';
const TYPEBOT_INSTANCE_ID = 'creare-assistant-bubble';

declare global {
  interface Window {
    __creareAssistantOpen?: () => void;
    __creareAssistantClose?: () => void;
  }
}

const COPY = {
  en: { label: 'Private Assistant', hint: 'Begin a conversation', close: 'Close conversation' },
  tr: { label: 'Özel Asistan', hint: 'Görüşmeyi başlat', close: 'Görüşmeyi kapat' },
  ru: { label: 'Личный ассистент', hint: 'Начать диалог', close: 'Закрыть диалог' },
  zh: { label: '私人助理', hint: '开始沟通', close: '关闭对话' },
} as const;

export default function CreareAssistantBubble() {
  const { locale } = useLanguage();
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const copy = COPY[locale];

  useEffect(() => {
    const handleReady = () => setIsReady(true);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('creare-assistant-ready', handleReady);
    window.addEventListener('creare-assistant-open', handleOpen);
    window.addEventListener('creare-assistant-close', handleClose);

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'module';
      script.textContent = `
        import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js';

        const isLocalPreview =
          location.hostname === 'localhost' ||
          location.hostname === '127.0.0.1' ||
          location.hostname === '192.168.1.106';

        Typebot.initBubble({
          id: '${TYPEBOT_INSTANCE_ID}',
          typebot: isLocalPreview ? '${TYPEBOT_PREVIEW_ID}' : '${TYPEBOT_PUBLIC_ID}',
          isPreview: isLocalPreview,
          apiHost: isLocalPreview ? location.origin + '/api/typebot-preview' : undefined,
          theme: {
            placement: 'right',
            button: { isHidden: true },
            chatWindow: {
              backgroundColor: '#0b0b0c',
              maxWidth: '440px',
              maxHeight: '760px'
            }
          },
          onOpen: () => window.dispatchEvent(new Event('creare-assistant-open')),
          onClose: () => window.dispatchEvent(new Event('creare-assistant-close'))
        });

        window.__creareAssistantOpen = () => Typebot.open({ id: '${TYPEBOT_INSTANCE_ID}' });
        window.__creareAssistantClose = () => Typebot.close({ id: '${TYPEBOT_INSTANCE_ID}' });
        window.dispatchEvent(new Event('creare-assistant-ready'));
      `;

      document.body.appendChild(script);
    } else {
      setIsReady(true);
    }

    return () => {
      window.removeEventListener('creare-assistant-ready', handleReady);
      window.removeEventListener('creare-assistant-open', handleOpen);
      window.removeEventListener('creare-assistant-close', handleClose);
    };
  }, []);

  const handleClick = () => {
    if (!isReady) return;
    if (isOpen) window.__creareAssistantClose?.();
    else window.__creareAssistantOpen?.();
  };

  return (
    <button
      type="button"
      className="creare-assistant-launcher"
      aria-label={copy.label}
      aria-expanded={isOpen}
      aria-controls={TYPEBOT_INSTANCE_ID}
      data-ready={isReady ? 'true' : 'false'}
      data-open={isOpen ? 'true' : 'false'}
      onClick={handleClick}
    >
      <span className="creare-assistant-copy" aria-hidden="true">
        <span className="creare-assistant-label">{copy.label}</span>
        <span className="creare-assistant-hint">
          {isReady ? (isOpen ? copy.close : copy.hint) : '…'}
        </span>
      </span>
      <span className="creare-assistant-mark" aria-hidden="true">
        <span>C</span>
      </span>
    </button>
  );
}
