import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #2c4f7c 0%, #1e3a5f 100%)',
          color: 'white',
          fontSize: 16,
          fontWeight: 700,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        JT
      </div>
    ),
    {
      ...size,
    }
  )
}
