import type { Metadata } from "next";
import { Geist, Geist_Mono, Great_Vibes, Cinzel } from "next/font/google";
import localFont from 'next/font/local';
import { SessionProvider } from '@/components/session-provider'
import { ProfileMenu } from '@/components/profile-menu'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  weight: '400',
  variable: "--font-script",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-serif",
  subsets: ["latin"],
});

const cinzelDecorative = localFont({
  src: [
    {
      path: '../public/fonts/CinzelDecorative-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/CinzelDecorative-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/CinzelDecorative-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-decorative',
});

export const metadata: Metadata = {
  title: "Dreamscape - Creation Center in Pai, Thailand",
  description: "Technology + Circus + Wellness. A dreamy creation center in the mountains of Northern Thailand. Vegan and alcohol-free.",
  keywords: "Dreamscape, Pai, Thailand, circus, wellness, technology, aerial, workshops, events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: '#000000' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} ${cinzel.variable} ${cinzelDecorative.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>
          {children}
          <ProfileMenu />
        </SessionProvider>
      </body>
    </html>
  );
}
