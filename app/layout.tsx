import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'AITP — Agent Identity & Trust Protocol',
    template: '%s | AITP',
  },
  description:
    'An open protocol for agent-to-agent identity and trust. Two autonomous agents establish mutual, capability-scoped trust with no shared verifier — self-certifying identity, a mutual handshake, and signed Trust Context Tokens.',
  metadataBase: new URL('https://agentidentitytrustprotocol.io'),
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'AITP — Agent Identity & Trust Protocol',
    description:
      'The open standard for agent-to-agent trust. Self-certifying identities, a four-message mutual handshake, and signed, capability-scoped Trust Context Tokens — with a Rust reference implementation.',
    url: 'https://agentidentitytrustprotocol.io',
    siteName: 'AITP',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AITP — Agent Identity & Trust Protocol',
    description:
      'The open standard for agent-to-agent trust. Self-certifying identities, a mutual handshake, and signed, capability-scoped Trust Context Tokens.',
  },
  keywords: [
    // Brand
    'AITP',
    'Agent Identity and Trust Protocol',
    // Problem space
    'agent identity',
    'agent trust',
    'agent-to-agent trust',
    'agent-to-agent communication',
    'agent authentication',
    'agent authorization',
    'autonomous agents',
    'AI agents',
    'agentic AI',
    'cross-organization agents',
    // Protocol concepts
    'mutual handshake',
    'trust context token',
    'TCT',
    'agent identifier',
    'AID',
    'agent manifest',
    'capability-based security',
    'scoped delegation',
    'multihop delegation',
    'key resolution',
    'revocation',
    'proof of possession',
    // Technical
    'Ed25519',
    'JCS',
    'RFC 8785',
    'envelope signing',
    'deterministic canonicalization',
    // Standards
    'RFC',
    'open standard',
    'open protocol',
    // SDKs
    'Python SDK',
    'Node.js SDK',
    'Rust',
    // Ecosystem
    'CrewAI',
    'LangChain',
    'LangGraph',
    'agent framework',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://agentidentitytrustprotocol.io',
  },
  category: 'technology',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
