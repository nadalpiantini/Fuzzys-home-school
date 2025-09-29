import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

// Importar las fuentes personalizadas
const alanSans = {
  fontFamily: 'Alan Sans',
  src: 'url(https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300;400;500;600;700&display=swap)',
};

const caveatBrush = {
  fontFamily: 'Caveat Brush',
  src: 'url(https://fonts.googleapis.com/css2?family=Caveat+Brush&display=swap)',
};

const schoolbell = {
  fontFamily: 'Schoolbell',
  src: 'url(https://fonts.googleapis.com/css2?family=Schoolbell&display=swap)',
};

export const metadata: Metadata = {
  title: "Fuzzy's Home School",
  description: 'Educational platform with AI tutoring and gamified learning',
  keywords: ['education', 'AI tutor', 'learning games', 'Spanish', 'English'],
  authors: [{ name: "Fuzzy's Home School Team" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8B5CF6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300;400;500;600;700&family=Caveat+Brush&family=Schoolbell&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
