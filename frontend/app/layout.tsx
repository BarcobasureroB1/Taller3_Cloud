import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Drive Clone',
  description: 'Clon simple de Drive con almacenamiento en S3 (LocalStack)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
