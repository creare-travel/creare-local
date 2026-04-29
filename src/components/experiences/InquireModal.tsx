'use client';
import React, { useState, useEffect, useRef } from 'react';
import { strapiUrl } from '@/lib/strapi';

interface InquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceSlug: string;
  experienceId?: number;
}

export default function InquireModal({
  isOpen,
  onClose,
  experienceSlug,
  experienceId,
}: InquireModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setMessage('');
      setSuccess(false);
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  // Auto-close after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        name,
        email,
        message,
      };

      if (experienceId) {
        payload.experience = [experienceId];
      } else {
        payload.experience_slug = experienceSlug;
      }

      const res = await fetch(strapiUrl('/api/inquiries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload }),
      });

      if (!res.ok) {
        throw new Error('Submission failed. Please try again.');
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Inquire Privately"
    >
      <div className="relative w-full max-w-md bg-[#0a0a0a] text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 font-body text-[0.6rem] tracking-[0.25em] text-white/30 uppercase hover:text-white/70 transition-colors duration-200"
          aria-label="Close modal"
        >
          Close
        </button>

        <div className="px-10 py-12">
          {/* Header */}
          <p className="font-body text-[0.55rem] tracking-[0.35em] text-white/30 uppercase mb-5">
            CREARE
          </p>
          <h2
            className="font-display font-light text-white leading-tight mb-2"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
          >
            Inquire Privately
          </h2>
          <p className="font-body text-[0.7rem] text-white/40 leading-relaxed mb-10">
            Your inquiry is handled with complete discretion.
          </p>

          {/* Hidden slug */}
          <input type="hidden" name="experience_slug" value={experienceSlug} readOnly />

          {success ? (
            <div className="py-8 text-center">
              <p className="font-body text-sm tracking-[0.15em] text-white/80 uppercase">
                We will contact you shortly
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="inquire-name"
                  className="block font-body text-[0.55rem] tracking-[0.28em] text-white/40 uppercase mb-2"
                >
                  Name
                </label>
                <input
                  id="inquire-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-white/15 text-white font-body text-sm py-2 focus:outline-none focus:border-white/50 transition-colors duration-200 placeholder:text-white/20"
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="inquire-email"
                  className="block font-body text-[0.55rem] tracking-[0.28em] text-white/40 uppercase mb-2"
                >
                  Email
                </label>
                <input
                  id="inquire-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-white/15 text-white font-body text-sm py-2 focus:outline-none focus:border-white/50 transition-colors duration-200 placeholder:text-white/20"
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="inquire-message"
                  className="block font-body text-[0.55rem] tracking-[0.28em] text-white/40 uppercase mb-2"
                >
                  Message
                </label>
                <textarea
                  id="inquire-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-transparent border-b border-white/15 text-white font-body text-sm py-2 focus:outline-none focus:border-white/50 transition-colors duration-200 placeholder:text-white/20 resize-none"
                  placeholder="Tell us what you are looking for…"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="font-body text-[0.65rem] text-red-400/80 tracking-wide">{error}</p>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full font-body text-[0.65rem] tracking-[0.3em] uppercase py-4 border border-white/25 text-white hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending…' : 'Request Access'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
