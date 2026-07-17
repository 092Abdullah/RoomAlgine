
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/theme-provider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#663399',
};

export const metadata: Metadata = {
  title: 'RoomAIgine | AI Interior Designer & Instant Room Restyling',
  description: 'Transform your space in seconds with RoomAIgine. Upload a photo and use AI to visualize your room or home exterior in styles like Minimalist, Luxury, and Industrial. No design skills needed.',
  keywords: ['AI interior design', 'room restyling AI', 'home decor visualization', 'virtual home staging', 'AI room makeover', 'interior design styles', 'AI architect tool'],
  authors: [{ name: 'RoomAIgine Team' }],
  creator: 'RoomAIgine',
  publisher: 'RoomAIgine',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://roomaigine.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'RoomAIgine | Visualize Your Dream Space with AI',
    description: 'Upload a photo of your room or home exterior and watch AI restyle it instantly. Experience professional interior design at your fingertips.',
    url: 'https://roomaigine.com',
    siteName: 'RoomAIgine',
    images: [
      {
        url: 'https://i.ibb.co/1Y512tmL/hero1.jpg',
        width: 1200,
        height: 630,
        alt: 'AI-powered room transformation preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoomAIgine | AI Interior Designer',
    description: 'Transform your room instantly with the power of AI. Choose your style and see the magic.',
    images: ['https://i.ibb.co/1Y512tmL/hero1.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <SonnerToaster position="top-center" />
            <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
