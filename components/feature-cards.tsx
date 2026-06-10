import Link from 'next/link';
import {
  Fingerprint,
  Handshake,
  Ticket,
  Share2,
  Ban,
  ScrollText,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
  href: string;
}

const features: Feature[] = [
  {
    icon: <Fingerprint className="h-6 w-6" />,
    title: 'Self-Certifying Identity',
    description:
      'Agent Identifiers (AIDs) bind an agent to its public key and are published in signed Manifests — verifiable without a central registry.',
    gradient: 'from-fd-primary/10 to-blue-400/5',
    href: '/spec/identity',
  },
  {
    icon: <Handshake className="h-6 w-6" />,
    title: 'Mutual Handshake',
    description:
      'A four-message exchange where both peers prove key possession and commit grants — bidirectional trust with no shared verifier.',
    gradient: 'from-purple-500/10 to-fd-primary/5',
    href: '/spec/mutual-handshake',
  },
  {
    icon: <Ticket className="h-6 w-6" />,
    title: 'Trust Context Tokens',
    description:
      'Signed, audience-bound, capability-scoped, time-limited tokens. Every grant is explicit and verifiable offline against its issuer.',
    gradient: 'from-emerald-500/10 to-fd-primary/5',
    href: '/spec/tct',
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: 'Scoped Delegation',
    description:
      'Pass on a strict subset of authority to a third agent — single-hop or multi-hop — with each step attenuating, never amplifying, the grant.',
    gradient: 'from-amber-500/10 to-fd-primary/5',
    href: '/spec/delegation',
  },
  {
    icon: <Ban className="h-6 w-6" />,
    title: 'Revocation & Key Resolution',
    description:
      'Resolve a peer’s keys from its manifest, and pull signed revocation lists so a compromised token or key stops being honored.',
    gradient: 'from-blue-400/10 to-purple-500/5',
    href: '/spec/revocation',
  },
  {
    icon: <ScrollText className="h-6 w-6" />,
    title: 'Open Standard',
    description:
      'Thirteen RFCs, a conformance suite, and a Rust reference implementation with Python and Node bindings. Apache 2.0, community-governed.',
    gradient: 'from-fd-primary/10 to-emerald-500/5',
    href: '/spec',
  },
];

export function FeatureCards() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.04),transparent_70%)]" />

      <div className="relative mx-auto max-w-5xl px-4">
        <h2 className="mb-4 text-center text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl">
          Trust as a{' '}
          <span className="bg-gradient-to-r from-blue-400 via-fd-primary to-violet-400 bg-clip-text text-transparent">
            first-class primitive
          </span>
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-fd-muted-foreground">
          As agents start acting across organizational boundaries, identity and
          authorization become the bottleneck. AITP makes both verifiable.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative overflow-hidden rounded-xl border border-fd-primary/15 bg-fd-card/40 p-6 shadow-[0_0_20px_rgba(59,130,246,0.06)] transition-all duration-300 hover:border-fd-primary/40 hover:shadow-[0_0_36px_rgba(59,130,246,0.18)]"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.gradient} transition-opacity duration-300 group-hover:opacity-150`} />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-fd-primary/25 to-transparent transition-all duration-300 group-hover:via-fd-primary/60" />

              <div className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary shadow-sm shadow-fd-primary/10 transition-all duration-300 group-hover:bg-fd-primary/25 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-semibold text-fd-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-fd-muted-foreground">
                  {feature.description}
                </p>
                <span className="mt-3 inline-flex items-center text-xs font-medium text-fd-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Learn more &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
