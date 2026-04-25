import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'The League | Fantasy Soccer History',
  description: '7 seasons of fantasy soccer history, head-to-heads, and records.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pitch-bg text-white">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center text-pitch-muted text-sm py-8 border-t border-pitch-border mt-16">
          The League · Est. 2019 · Powered by Fantrax
        </footer>
      </body>
    </html>
  );
}
