'use client';

import { useEffect } from 'react';

const SCRIPT_ID = 'creare-typebot-bubble-init';
const TYPEBOT_PUBLIC_ID = 'creare-assistant';

export default function CreareAssistantBubble() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'module';
    script.textContent = `
      import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js';
      Typebot.initBubble({
        typebot: '${TYPEBOT_PUBLIC_ID}',
        theme: {
          button: {
            backgroundColor: '#f5f1ea',
            iconColor: '#0b0b0c'
          },
          chatWindow: {
            backgroundColor: '#0b0b0c'
          }
        }
      });
    `;

    document.body.appendChild(script);

    return () => {
      script.remove();
      document.querySelector('typebot-bubble')?.remove();
    };
  }, []);

  return null;
}
