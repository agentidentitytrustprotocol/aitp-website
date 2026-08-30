import Link from 'next/link';
import {
  BookOpen,
  ScrollText,
  Code2,
  Cpu,
  Layers,
  Database,
  Users,
  Route,
  FlaskConical,
} from 'lucide-react';
import { GithubMark } from '@/components/github-mark';
import type { ReactNode } from 'react';

interface EcosystemItem {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

const learnItems: EcosystemItem[] = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Documentation',
    description:
      'Architecture, discovery, the mutual handshake, Trust Context Tokens, the threat model, and integration guides.',
    href: '/docs',
  },
  {
    icon: <ScrollText className="h-6 w-6" />,
    title: 'Specification',
    description:
      'Thirteen RFCs defining core, identity, manifests, the handshake, TCTs, delegation, key resolution, revocation, and security.',
    href: '/spec',
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: 'Registry',
    description:
      'Canonical identity types, capabilities, media types, error codes, and extension keys that interoperating agents share.',
    href: '/registry',
  },
];

const flowItems: EcosystemItem[] = [
  {
    icon: <Route className="h-6 w-6" />,
    title: 'Handshake Walkthrough',
    description:
      'Follow two agents from first contact through the four-message mutual handshake to a pair of issued Trust Context Tokens.',
    href: '/e2e-flow',
  },
  {
    icon: <FlaskConical className="h-6 w-6" />,
    title: 'Playground',
    description:
      'Run intra-org, cross-org, and cross-cloud scenarios end-to-end with real LLM-powered agents and live event streams.',
    href: '/playground',
  },
];

const buildItems: EcosystemItem[] = [
  {
    icon: <Code2 className="h-6 w-6" />,
    title: 'SDKs',
    description:
      'Python (aitp-py) and Node.js (aitp-node) bindings with envelope signing, manifests, and the handshake built in.',
    href: '/sdks',
  },
  {
    icon: <Cpu className="h-6 w-6" />,
    title: 'Implementation',
    description:
      'aitp-rs — the Rust reference implementation. Core types, JCS, Ed25519 + P-256 envelopes, HTTP transport, full v0.2 conformance.',
    href: '/implementation',
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: 'Control Plane',
    description:
      'Agent registry, audit log, revocation serving, and webhook fan-out — observing and auditing without sitting in the trust path.',
    href: '/control-plane',
  },
];

const contributeItems: EcosystemItem[] = [
  {
    icon: <GithubMark className="h-6 w-6" />,
    title: 'GitHub',
    description:
      'All source repositories, issues, discussions, and CI. Everything is open under Apache 2.0.',
    href: 'https://github.com/agentidentitytrustprotocol',
    external: true,
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Community',
    description:
      'Contributing guide, governance model, code of conduct, and how to propose changes through the RFC process.',
    href: '/community',
  },
];

function EcosystemRow({
  label,
  subtitle,
  items,
  columns,
}: {
  label: string;
  subtitle: string;
  items: EcosystemItem[];
  columns: string;
}) {
  return (
    <div className="mb-10 last:mb-0">
      <div className="mb-8">
        <h3 className="mb-2 text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl">
          {label}
        </h3>
        <p className="text-fd-muted-foreground">{subtitle}</p>
      </div>

      <div className={`grid gap-x-10 gap-y-10 ${columns}`}>
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            className="group relative rounded-2xl p-5 -m-5 bg-gradient-to-br from-fd-primary/[0.08] via-violet-500/[0.04] to-fd-primary/[0.03] shadow-[0_0_24px_rgba(59,130,246,0.06)] transition-all duration-300 hover:from-fd-primary/[0.14] hover:via-violet-500/[0.08] hover:to-fd-primary/[0.05] hover:shadow-[0_0_44px_rgba(59,130,246,0.18)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] rounded-t-2xl bg-gradient-to-r from-transparent via-fd-primary/25 to-transparent transition-all duration-300 group-hover:via-fd-primary/60" />

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-fd-primary/15 to-violet-500/10 text-fd-primary transition-all duration-300 group-hover:from-fd-primary/30 group-hover:to-violet-500/20 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]">
              {item.icon}
            </div>
            <h4 className="mb-1.5 font-semibold text-fd-foreground transition-colors duration-200 group-hover:text-fd-primary">
              {item.title}
              {item.external && (
                <span className="ml-1 inline-block text-fd-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  {'↗'}
                </span>
              )}
            </h4>
            <p className="text-sm leading-relaxed text-fd-muted-foreground">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function EcosystemSection() {
  return (
    <section className="relative overflow-hidden border-t py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-fd-background via-fd-card/30 to-fd-background" />

      <div className="relative mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl">
            Explore the{' '}
            <span className="bg-gradient-to-r from-blue-400 via-fd-primary to-violet-400 bg-clip-text text-transparent">
              Ecosystem
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-fd-muted-foreground">
            Everything you need to understand, build with, and operate
            agent-to-agent trust — from specification to production.
          </p>
        </div>

        <div className="mb-8 h-[1px] bg-gradient-to-r from-transparent via-fd-primary/20 to-transparent" />

        <EcosystemRow
          label="Learn the protocol"
          subtitle="Understand how AITP works before you write a line of code."
          items={learnItems}
          columns="sm:grid-cols-3"
        />

        <div className="mb-10 h-[1px] bg-gradient-to-r from-transparent via-fd-border to-transparent" />

        <EcosystemRow
          label="See it in motion"
          subtitle="Walkthroughs and a live playground showing the handshake end-to-end."
          items={flowItems}
          columns="sm:grid-cols-2"
        />

        <div className="mb-10 h-[1px] bg-gradient-to-r from-transparent via-fd-border to-transparent" />

        <EcosystemRow
          label="Build with AITP"
          subtitle="SDKs, the reference implementation, and a control plane for production."
          items={buildItems}
          columns="sm:grid-cols-3"
        />

        <div className="mb-10 h-[1px] bg-gradient-to-r from-transparent via-fd-border to-transparent" />

        <EcosystemRow
          label="Contribute"
          subtitle="Explore the source, file issues, and help shape the protocol."
          items={contributeItems}
          columns="sm:grid-cols-2"
        />
      </div>
    </section>
  );
}
