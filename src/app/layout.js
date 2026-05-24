import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'MAMUTE — Gestão de Ensino',
  description: 'Sistema de gestão de ensino para professor autônomo',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MAMUTE',
  },
};

export const viewport = {
  themeColor: '#0c0c0e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
