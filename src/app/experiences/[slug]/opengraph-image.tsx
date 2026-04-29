import { ImageResponse } from 'next/og';
import { getExperienceBySlug } from '@/lib/experiences';

export const runtime = 'edge';
export const alt = 'Creare Experience';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ExperienceOgImage({ params }: Props) {
  const { slug } = await params;
  const experience = getExperienceBySlug(slug);

  const title = experience?.title ?? 'Private Experience';
  const location = experience?.location ?? 'Turkey';
  const category = experience?.category ?? 'SIGNATURE';
  const heroImage = experience?.heroImage;

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* Hero image background */}
      {heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImage}
          alt={title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1410 100%)',
          }}
        />
      )}

      {/* Dark gradient overlay — bottom-heavy for text legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      {/* Category badge — top left */}
      <div
        style={{
          position: 'absolute',
          top: '56px',
          left: '72px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.4)' }} />
        <span
          style={{
            fontSize: '10px',
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {category}™
        </span>
      </div>

      {/* CREARE brand — top right */}
      <span
        style={{
          position: 'absolute',
          top: '56px',
          right: '72px',
          fontSize: '11px',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        CREARE
      </span>

      {/* Content block — bottom left */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '0 72px 64px',
          zIndex: 1,
        }}
      >
        {/* Title */}
        <span
          style={{
            fontSize: '58px',
            fontWeight: 300,
            color: '#ffffff',
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            maxWidth: '820px',
          }}
        >
          {title}
        </span>

        {/* Location line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
          <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.35)' }} />
          <span
            style={{
              fontSize: '13px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {location}
          </span>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
