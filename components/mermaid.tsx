'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export function Mermaid({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const isDark = resolvedTheme === 'dark';

    let cancelled = false;

    (async () => {
      // Dynamic import to avoid SSR issues
      const mermaid = (await import('mermaid')).default;

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        theme: isDark ? 'dark' : 'default',
        themeVariables: isDark
          ? {
              primaryColor: '#1e3a5f',
              primaryTextColor: '#f1f5f9',
              primaryBorderColor: '#3b82f6',
              secondaryColor: '#2d1b4e',
              secondaryTextColor: '#f1f5f9',
              secondaryBorderColor: '#8b5cf6',
              tertiaryColor: '#1a3344',
              tertiaryTextColor: '#f1f5f9',
              tertiaryBorderColor: '#06b6d4',
              lineColor: '#64748b',
              mainBkg: '#1e3a5f',
              nodeBorder: '#3b82f6',
              nodeTextColor: '#f1f5f9',
              clusterBkg: '#0f172a',
              clusterBorder: '#334155',
              titleColor: '#e2e8f0',
              edgeLabelBackground: '#0f172a',
              noteBkgColor: '#1e293b',
              noteTextColor: '#e2e8f0',
              noteBorderColor: '#3b82f6',
              actorBkg: '#1e3a5f',
              actorBorder: '#3b82f6',
              actorTextColor: '#f1f5f9',
              actorLineColor: '#475569',
              signalColor: '#94a3b8',
              signalTextColor: '#f1f5f9',
              activationBkgColor: '#1e3a5f',
              activationBorderColor: '#3b82f6',
              labelColor: '#e2e8f0',
              altBackground: '#131f35',
            }
          : {
              primaryColor: '#dbeafe',
              primaryTextColor: '#1e293b',
              primaryBorderColor: '#3b82f6',
              secondaryColor: '#ede9fe',
              secondaryTextColor: '#1e293b',
              secondaryBorderColor: '#8b5cf6',
              tertiaryColor: '#e0f2fe',
              tertiaryTextColor: '#1e293b',
              tertiaryBorderColor: '#0ea5e9',
              lineColor: '#94a3b8',
              mainBkg: '#dbeafe',
              nodeBorder: '#3b82f6',
              nodeTextColor: '#1e293b',
              clusterBkg: '#f8fafc',
              clusterBorder: '#cbd5e1',
              titleColor: '#0f172a',
              edgeLabelBackground: '#ffffff',
              noteBkgColor: '#f1f5f9',
              noteTextColor: '#1e293b',
              noteBorderColor: '#3b82f6',
              actorBkg: '#dbeafe',
              actorBorder: '#3b82f6',
              actorTextColor: '#1e293b',
              actorLineColor: '#cbd5e1',
              signalColor: '#64748b',
              signalTextColor: '#1e293b',
              activationBkgColor: '#dbeafe',
              activationBorderColor: '#3b82f6',
              labelColor: '#0f172a',
              altBackground: '#f8fafc',
            },
      });

      try {
        // Use a unique ID based on chart content hash
        const hashId = 'mmd_' + Math.random().toString(36).slice(2, 10);
        const { svg } = await mermaid.render(hashId, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = `<pre style="margin:0;white-space:pre-wrap;font-size:0.85rem">${chart}</pre>`;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mounted, chart, resolvedTheme]);

  return (
    <div className="my-6">
      <div className="relative overflow-hidden rounded-xl border border-fd-primary/15 shadow-[0_0_20px_rgba(59,130,246,0.04)]">
        {/* Top shine line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[1px] bg-gradient-to-r from-transparent via-fd-primary/25 to-transparent" />

        {/* Diagram container */}
        <div
          ref={containerRef}
          className="flex justify-center overflow-x-auto bg-fd-card/40 px-6 py-8 [&_svg]:max-w-full"
        >
          {/* Placeholder while loading */}
          {!mounted && (
            <pre className="text-sm text-fd-muted-foreground">{chart}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
