'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/seasons', label: 'Seasons' },
  { href: '/head-to-head', label: 'Head to Head' },
  { href: '/players', label: 'Players' },
  { href: '/records', label: 'Records' },
  { href: '/admin', label: 'Team Inspector' },
];

export default function NavBar() {
  const path = usePathname();

  return (
    <header className="border-b border-pitch-border bg-pitch-card/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="text-emerald-400">⚽</span>
          <span className="text-white">The League</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                path === href
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-pitch-muted hover:text-white hover:bg-white/5'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto">
          <span className="text-xs text-pitch-muted">2019 – 2025</span>
        </div>
      </div>
    </header>
  );
}
