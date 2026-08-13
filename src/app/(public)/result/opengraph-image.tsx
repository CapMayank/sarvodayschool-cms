import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export const alt = 'Results Declared - Sarvodaya School';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '64px',
            width: '100%',
            height: '100%',
            textAlign: 'center',
            color: 'white',
          }}
        >
          <div
            style={{
              padding: '12px 32px',
              backgroundColor: '#3b82f6',
              borderRadius: '999px',
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '32px',
            }}
          >
            Annual Examination
          </div>
          
          <h1
            style={{
              fontSize: '84px',
              fontWeight: '900',
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              margin: '0 0 24px 0',
              color: '#ffffff',
            }}
          >
            Results Declared
          </h1>
          
          <p
            style={{
              fontSize: '36px',
              color: '#94a3b8',
              margin: '0 0 48px 0',
            }}
          >
            Sarvodaya English Higher Secondary School
          </p>

          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '24px 48px',
              borderRadius: '16px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#e2e8f0' }}>
              Check your result at sarvodayaschool.co.in/result
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
