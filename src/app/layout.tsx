import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans_Condensed } from 'next/font/google';
import GlobalProvider from '@/components/providers/GlobalProvider';
import NextTopLoader from 'nextjs-toploader';
import 'react-loading-skeleton/dist/skeleton.css';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const ibmPlexSans = IBM_Plex_Sans_Condensed({
  variable: '--font-ibm-plex-sans',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

const FarcasterEmbedJson = {
  version: '1',
  imageUrl: 'https://zolify.xyz/farcaster/icon.png',
  button: {
    title: 'Launch Zolify',
    action: {
      type: 'launch_miniapp',
      name: 'Zolify',
      url: 'https://zolify.xyz',
      splashImageUrl: 'https://zolify.xyz/farcaster/splash.png',
      splashBackgroundColor: '#0a0a0a',
    },
  },
};

export const metadata: Metadata = {
  title: {
    default: 'Analytics & Predictions for Zora Tokens | Zolify',
    template: '%s | Zolify',
  },
  description:
    'An analytics platform for Zora tokens with powerful insights and a price predictions market to help traders and builders navigate the Zora ecosystem.',
  keywords: [
    'Zolify',
    'Zora',
    'Zora tokens',
    'crypto analytics',
    'prediction markets',
    'Zora price predictions',
    'Web3 trading tools',
  ],
  openGraph: {
    title: {
      default: 'Analytics & Predictions for Zora Tokens | Zolify',
      template: '%s | Zolify',
    },
    description:
      'Track Zora tokens with real-time analytics and explore price prediction markets on Zolify.',
    url: 'https://zolify.xyz',
    siteName: 'Zolify',
    images: [{ url: 'https://zolify.xyz/farcaster/og.png', width: 6000, height: 2000 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analytics & Predictions for Zora Tokens | Zolify',
    description:
      'Track Zora tokens with real-time analytics and explore price prediction markets on Zolify.',
    creator: '@zolify',
    images: ['https://zolify.xyz/farcaster/og.png'],
  },
  other: {
    'fc:miniapp': `${JSON.stringify(FarcasterEmbedJson)}`,
    'fc:frame': `${JSON.stringify(FarcasterEmbedJson)}`,
  },
};

export const viewport: Viewport = {
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased`}>
        <GlobalProvider>{children}</GlobalProvider>
        <NextTopLoader color="#05df72" />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
