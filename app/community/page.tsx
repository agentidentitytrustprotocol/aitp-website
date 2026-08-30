import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import {
  BookOpen,
  Scale,
  Users,
  GitPullRequest,
  FileText,
} from 'lucide-react';
import { GithubMark } from '@/components/github-mark';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Community',
  description:
    'Join the AITP community. Contribute, govern, and help shape the future of agent-to-agent identity and trust.',
};

interface CommunityLink {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

const REPO =
  'https://github.com/agentidentitytrustprotocol/agentidentitytrustprotocol';

const communityLinks: CommunityLink[] = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Contributing Guide',
    description:
      'Learn how to contribute to AITP — from bug reports and documentation to RFCs and reference-implementation code.',
    href: `${REPO}/blob/main/CONTRIBUTING.md`,
    external: true,
  },
  {
    icon: <GitPullRequest className="h-6 w-6" />,
    title: 'RFC Process',
    description:
      'How changes to the protocol are proposed, discussed, and ratified through the AITP RFC track.',
    href: `${REPO}/blob/main/governance/RFC-PROCESS.md`,
    external: true,
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: 'Governance',
    description:
      'The charter, decision-making model, and maintainer structure that keep AITP a neutral, open standard.',
    href: `${REPO}/blob/main/governance/GOVERNANCE.md`,
    external: true,
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Code of Conduct',
    description:
      'Our commitment to a welcoming, inclusive, and respectful community.',
    href: `${REPO}/blob/main/CODE_OF_CONDUCT.md`,
    external: true,
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Manifesto',
    description:
      'Why agent-to-agent trust needs to be bilateral, verifiable, and free of central authorities.',
    href: `${REPO}/blob/main/manifesto/manifesto.md`,
    external: true,
  },
  {
    icon: <GithubMark className="h-6 w-6" />,
    title: 'GitHub Organization',
    description:
      'Browse all AITP repositories: specification, reference implementation, control plane, playground, and console.',
    href: 'https://github.com/agentidentitytrustprotocol',
    external: true,
  },
];

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl">
            Community
          </h1>
          <p className="mb-12 max-w-2xl text-lg text-fd-muted-foreground">
            AITP is an open, community-governed standard. Whether you want to
            report a bug, propose an RFC, improve documentation, or just follow
            along — there is a place for you.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {communityLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className="group relative overflow-hidden rounded-xl border border-fd-primary/15 bg-fd-card/40 p-6 shadow-[0_0_20px_rgba(59,130,246,0.06)] transition-all duration-300 hover:border-fd-primary/40 hover:shadow-[0_0_36px_rgba(59,130,246,0.18)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fd-primary/[0.04] to-violet-500/[0.02] transition-opacity duration-300 group-hover:opacity-150" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-fd-primary/25 to-transparent transition-all duration-300 group-hover:via-fd-primary/60" />
                <div className="relative">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary shadow-sm shadow-fd-primary/10 transition-all duration-300 group-hover:bg-fd-primary/25 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                    {item.icon}
                  </div>
                  <h2 className="mb-2 font-semibold text-fd-foreground">
                    {item.title}
                    {item.external && (
                      <span className="ml-1 inline-block text-fd-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        {'↗'}
                      </span>
                    )}
                  </h2>
                  <p className="text-sm leading-relaxed text-fd-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
