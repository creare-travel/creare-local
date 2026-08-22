'use client';

import { useEffect, useRef, useState } from 'react';
import type { SiteLocale } from '@/lib/i18n/config';
import type { WeChatConfig } from '@/lib/contact/channels';

const copy: Record<
  SiteLocale,
  { open: string; title: string; account: string; copy: string; copied: string; close: string }
> = {
  en: {
    open: 'Open WeChat contact',
    title: 'WeChat',
    account: 'WeChat ID',
    copy: 'Copy ID',
    copied: 'Copied',
    close: 'Close WeChat contact',
  },
  tr: {
    open: 'WeChat iletişim bilgilerini açın',
    title: 'WeChat',
    account: 'WeChat kimliği',
    copy: 'Kimliği kopyala',
    copied: 'Kopyalandı',
    close: 'WeChat iletişim bilgilerini kapatın',
  },
  zh: {
    open: '打开 WeChat 联系方式',
    title: 'WeChat',
    account: 'WeChat ID',
    copy: '复制 ID',
    copied: '已复制',
    close: '关闭 WeChat 联系方式',
  },
};

export default function WeChatContact({
  locale,
  config,
}: {
  locale: SiteLocale;
  config: WeChatConfig | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const copyRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const labels = copy[locale];

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setCopied(false);
        requestAnimationFrame(() => openerRef.current?.focus());
      }
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === closeRef.current) {
          event.preventDefault();
          copyRef.current?.focus();
        } else if (!event.shiftKey && document.activeElement === copyRef.current) {
          event.preventDefault();
          closeRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setCopied(false);
    requestAnimationFrame(() => openerRef.current?.focus());
  };

  if (!config) {
    return (
      <span className="inline-flex min-h-11 items-center text-white font-body font-bold text-lg">
        WeChat
      </span>
    );
  }

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={labels.open}
        className="motion-link inline-flex min-h-11 items-center text-white font-body font-bold text-lg hover:text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        WeChat
      </button>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="wechat-dialog-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-6"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) close();
          }}
        >
          <div className="w-full max-w-sm border border-white/20 bg-black p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 id="wechat-dialog-title" className="font-display text-2xl text-white">
                {labels.title}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label={labels.close}
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-2xl text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                ×
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.qrUrl}
              alt="WeChat QR"
              className="mt-6 aspect-square w-full bg-white object-contain"
            />
            <p className="mt-5 text-xs uppercase text-white/40">{labels.account}</p>
            <p className="mt-2 break-all text-white">{config.id}</p>
            <button
              ref={copyRef}
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(config.id);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
              className="mt-4 inline-flex min-h-11 items-center border border-white/30 px-4 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {copied ? labels.copied : labels.copy}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
