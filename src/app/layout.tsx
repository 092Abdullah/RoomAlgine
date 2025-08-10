import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'RoomAIgine',
  description: 'On-Demand AI Interior Designer',
  openGraph: {
    title: 'RoomAIgine',
    description: 'Visualize Your Dream Room in Seconds with AI',
    images: [
      {
        url: 'https://i.ibb.co/1Y512tmL/hero1.jpg',
        width: 1200,
        height: 630,
        alt: 'AI-powered room restyling',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
