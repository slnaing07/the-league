'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-pitch-border bg-pitch-card/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight shrink-0">
          <span className="text-emerald-400">⚽</span>
          <span className="text-white">The League</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-8">
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

        <div className="ml-auto hidden md:block">
          <span className="text-xs text-pitch-muted">2019 – 2025</span>
        </div>

        {/* Mobile hamburger */}
        <button
          className="ml-auto md:hidden p-2 text-pitch-muted hover:text-white transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-pitch-border bg-pitch-card px-4 py-3 flex flex-col gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                path === href
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-pitch-muted hover:text-white hover:bg-white/5'
              )}
            >
              {label}
            </Link>
          ))}
          <p className="text-xs text-pitch-muted px-3 pt-2 mt-1 border-t border-pitch-border/50">2019 – 2025</p>
        </nav>
      )}
    </header>
  );
}
