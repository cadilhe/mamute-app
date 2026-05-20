import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'MAMUTE — Gestão de Ensino',
  description: 'Sistema de gestão de ensino para professor autônomo',
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
