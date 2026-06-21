import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'EventBoard — Gestion d\'événements',
  description: 'Dashboard SaaS pour la gestion, l\'analyse et l\'export de données d\'événements. Propulsé par l\'IA Claude.',
  keywords: ['événements', 'dashboard', 'analyse', 'Excel', 'IA'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1C2128',
              color: '#F0F6FC',
              border: '1px solid #30363D',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#1C2128' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#1C2128' } },
          }}
        />
      </body>
    </html>
  );
}
