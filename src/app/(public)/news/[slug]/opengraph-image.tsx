import { ImageResponse } from 'next/og';
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export const alt = 'News from Sarvodaya School';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    const news = await prisma.news.findUnique({
      where: { slug, isPublished: true },
      select: { title: true, excerpt: true, category: true, imageUrl: true }
    });

    if (!news) {
      return new ImageResponse(
        (
          <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#0f172a', color: 'white', alignItems: 'center', justifyContent: 'center' }}>
            <h1>Sarvodaya School News</h1>
          </div>
        ),
        { ...size }
      );
    }

    const { title, excerpt, category, imageUrl } = news;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: '#0f172a',
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {/* Dark Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
            }}
          />
          
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '64px',
              width: '100%',
              height: '100%',
              position: 'relative',
              zIndex: 10,
              color: 'white',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.02em', color: '#e2e8f0' }}>
                Sarvodaya School Lakhnadon
              </div>
              <div
                style={{
                  padding: '8px 24px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '999px',
                  fontSize: '24px',
                  fontWeight: '600',
                }}
              >
                {category}
              </div>
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h1
                style={{
                  fontSize: '72px',
                  fontWeight: '800',
                  lineHeight: 1.1,
                  letterSpacing: '-0.04em',
                  margin: 0,
                  maxWidth: '900px',
                  color: '#ffffff',
                }}
              >
                {title.length > 90 ? title.substring(0, 90) + '...' : title}
              </h1>
              <p
                style={{
                  fontSize: '32px',
                  lineHeight: 1.4,
                  color: '#94a3b8',
                  margin: 0,
                  maxWidth: '900px',
                }}
              >
                {excerpt.length > 150 ? excerpt.substring(0, 150) + '...' : excerpt}
              </p>
            </div>
            
            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: 'auto' }}>
              <div style={{ fontSize: '24px', fontWeight: '500', color: '#64748b' }}>
                Read the full story at sarvodayaschool.co.in
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (e) {
    console.error(e);
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#0f172a', color: 'white', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Sarvodaya School News</h1>
        </div>
      ),
      { ...size }
    );
  }
}
