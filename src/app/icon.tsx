
import { ImageResponse } from 'next/og'
import { Home, Sparkles } from 'lucide-react';

export const runtime = 'edge'

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
          fontSize: 24,
          background: '#0c0a09',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a855f7',
          position: 'relative',
          borderRadius: '4px'
        }}
      >
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#c084fc" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px'
            }}
        >
            <path d="m12 3-1.9 1.9a2.4 2.4 0 0 0 0 3.4l1.9 1.9m1.9-5.3L10.1 5a2.4 2.4 0 0 0-3.4 0L5 6.7m14 1.7-1.9-1.9a2.4 2.4 0 0 0-3.4 0l-1.9 1.9m5.3 1.9L16.3 12a2.4 2.4 0 0 0 0 3.4l1.9 1.9m-1.7 5.3-1.9-1.9a2.4 2.4 0 0 0-3.4 0l-1.9 1.9m-5.3-1.9L5 16.3a2.4 2.4 0 0 0 0-3.4l1.9-1.9"/>
        </svg>

      </div>
    ),
    {
      ...size,
    }
  )
}
