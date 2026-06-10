import { Hero } from '@/components/hero';
import { ProtocolDiagram } from '@/components/protocol-diagram';
import { FeatureCards } from '@/components/feature-cards';
import { EcosystemSection } from '@/components/ecosystem-section';
import { RunSection } from '@/components/run-section';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Agent Identity & Trust Protocol',
    alternateName: 'AITP',
    url: 'https://agentidentitytrustprotocol.io',
    description:
      'An open protocol for agent-to-agent identity and trust. Two autonomous agents establish mutual, capability-scoped trust with no shared verifier — RFC-driven, cryptographically verifiable, and replay-resistant.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          'https://agentidentitytrustprotocol.io/docs?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'Agent Identity & Trust Protocol (AITP)',
    alternateName: 'AITP',
    description:
      'An open protocol and reference implementation for agent-to-agent identity and trust. Self-certifying Agent Identifiers, a four-message mutual handshake, and signed, audience-bound, capability-scoped Trust Context Tokens.',
    url: 'https://agentidentitytrustprotocol.io',
    codeRepository: 'https://github.com/agentidentitytrustprotocol',
    programmingLanguage: ['Rust', 'Python', 'TypeScript'],
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
    runtimePlatform: 'HTTP',
    applicationCategory: 'DeveloperApplication',
    keywords:
      'agent identity, agent trust, agent-to-agent, mutual handshake, trust context token, capability-based security, delegation, Ed25519, open standard',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Agent Identity & Trust Protocol',
    url: 'https://agentidentitytrustprotocol.io',
    logo: 'https://agentidentitytrustprotocol.io/favicon.svg',
    sameAs: ['https://github.com/agentidentitytrustprotocol'],
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProtocolDiagram />
        <FeatureCards />
        <EcosystemSection />
        <RunSection />
      </main>
      <Footer />
    </>
  );
}
