import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Creare — Private Cultural Experiences Composed as Art';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function DefaultOgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1410 60%, #0d0d0d 100%)',
        padding: '72px 80px',
        fontFamily: 'Georgia, serif',
        position: 'relative',
      }}
    >
      {/* Subtle texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 70% 30%, rgba(180,150,100,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Top label */}
      <div
        style={{
          position: 'absolute',
          top: '72px',
          left: '80px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '1px',
            background: 'rgba(255,255,255,0.3)',
          }}
        />
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'Georgia, serif',
          }}
        >
          Curated Cultural Experiences
        </span>
      </div>

      {/* Main headline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1 }}>
        <span
          style={{
            fontSize: '72px',
            fontWeight: 300,
            color: '#ffffff',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            fontFamily: 'Georgia, serif',
          }}
        >
          Experiences.
        </span>
        <span
          style={{
            fontSize: '72px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            fontFamily: 'Georgia, serif',
          }}
        >
          Composed as Art.
        </span>
      </div>

      {/* Bottom rule + brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginTop: '40px',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '40px',
            height: '1px',
            background: 'rgba(255,255,255,0.25)',
          }}
        />
        <span
          style={{
            fontSize: '13px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'Georgia, serif',
          }}
        >
          CREARE
        </span>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
