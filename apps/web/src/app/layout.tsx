import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scope - Template System',
  description: 'Template-based report generation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <nav className="border-b bg-card px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-foreground">
              Scope
            </a>
            <span className="text-sm text-muted-foreground">
              Template System
            </span>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
