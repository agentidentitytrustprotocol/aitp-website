'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { GithubMark } from '@/components/github-mark';
import { Logo } from '@/components/logo';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

const navLinks = [
  { label: 'Docs', href: '/docs' },
  { label: 'Spec', href: '/spec' },
  { label: 'SDKs', href: '/sdks' },
  { label: 'Implementation', href: '/implementation' },
  { label: 'Control Plane', href: '/control-plane' },
  { label: 'Playground', href: '/playground' },
  { label: 'Console', href: 'https://console.agentidentitytrustprotocol.io' },
  { label: 'Registry', href: '/registry' },
  { label: 'Community', href: '/community' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();

  // One-shot mount flag for hydration-safe theming; the setState runs once on
  // mount (empty deps) and does not cascade.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isActive = (href: string) =>
    href.startsWith('/') && href !== '/' && pathname.startsWith(href);

  const isHomeLike = pathname === '/' || pathname === '/community';

  return (
    <header className="sticky top-0 z-50 border-b border-fd-border bg-fd-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-14 max-w-[80rem] items-center px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mr-6 flex items-center gap-2 font-semibold text-fd-foreground"
        >
          <Logo className="size-5" />
          AITP
        </Link>

        {/* Desktop nav */}
        <div className="hidden h-14 flex-1 items-stretch gap-1 md:flex">
          {!isHomeLike && navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 text-sm transition-colors ${
                  active
                    ? 'font-semibold text-fd-primary'
                    : 'text-fd-muted-foreground hover:text-fd-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {!isHomeLike && (
            <span className="ml-auto mr-2 h-6 w-px self-center bg-fd-border" />
          )}
          {isHomeLike && <span className="ml-auto" />}
          <Link
            href="https://github.com/agentidentitytrustprotocol"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-2 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          >
            <GithubMark className="size-5" />
          </Link>
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="flex items-center px-2 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-fd-muted-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile nav */}
      {open && (
        <div className="border-t bg-fd-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {!isHomeLike && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="https://github.com/agentidentitytrustprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
              onClick={() => setOpen(false)}
            >
              GitHub
            </Link>
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
              >
                {resolvedTheme === 'dark' ? (
                  <><Sun className="size-4" /> Light mode</>
                ) : (
                  <><Moon className="size-4" /> Dark mode</>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
