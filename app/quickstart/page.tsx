import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { quickstartBlock } from '@/lib/quickstart';

export const metadata: Metadata = {
  title: 'Quickstart',
  description:
    'Complete a real AITP handshake with the public interop peer in three commands, then run your own peer, verify in the browser and earn a conformance badge.',
};

const RS = 'https://github.com/agentidentitytrustprotocol/aitp-rs';

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="relative border-l border-fd-primary/20 pb-14 pl-8 last:pb-0">
      <span className="absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-fd-primary/30 bg-fd-background text-sm font-semibold text-fd-primary">
        {n}
      </span>
      <h2 className="mb-3 text-xl font-semibold text-fd-foreground">{title}</h2>
      <div className="space-y-4 text-fd-muted-foreground [&_a]:text-fd-primary [&_a:hover]:underline">{children}</div>
    </section>
  );
}

export default function QuickstartPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl">Quickstart</h1>
          <p className="mb-14 text-lg text-fd-muted-foreground">
            From nothing to a verified AITP handshake in three commands, then on to your own peer.
          </p>

          <Step n={1} title="Hello world">
            <p>
              Install the CLI, enroll a key with the public{' '}
              <Link href="/implementation/interop-peer">interop peer</Link>, and complete a real handshake with
              it. <code>aitp echo</code> hands back the Trust Context Token the peer issued, with proof of
              possession.
            </p>
            <DynamicCodeBlock lang="bash" code={quickstartBlock('hello-world.sh')} />
            <p className="text-sm">
              This block is copied from the{' '}
              <a href={`${RS}#hello-world`}>aitp-rs README</a>, whose{' '}
              <a href={`${RS}/blob/main/.github/workflows/readme-smoke.yml`}>readme-smoke</a> workflow runs it
              daily against the public peer. <Link href="/implementation/cli">The CLI guide</Link> covers the
              other commands.
            </p>
          </Step>

          <Step n={2} title="Run your own peer">
            <p>Add AITP to your agent in the language it is written in:</p>
            <DynamicCodeBlock lang="bash" code={quickstartBlock('install.sh')} />
            <Tabs items={['Rust', 'Python', 'Node']}>
              <Tab value="Rust">
                <p>
                  The <code>aitp</code> crate is the protocol surface, with the HTTP client on by default.{' '}
                  <code>aitp serve --interop</code> runs a copy of the interop peer itself (the CLI&apos;s{' '}
                  <code>serve</code> feature), and the two-agent demo in the repository runs a full handshake
                  locally. Start at the <Link href="/implementation">reference implementation</Link> and the{' '}
                  <Link href="/implementation/interop-peer">interop peer</Link> guide.
                </p>
              </Tab>
              <Tab value="Python">
                <p>
                  <code>aitp-sdk</code> binds the Rust reference implementation, so it speaks the same wire. The{' '}
                  <Link href="/sdks/python">Python SDK guide</Link> walks through identity, the handshake and
                  TCTs.
                </p>
              </Tab>
              <Tab value="Node">
                <p>
                  <code>@agentidentitytrustprotocol/aitp</code> binds the same Rust core for Node.js. The{' '}
                  <Link href="/sdks/node">Node SDK guide</Link> walks through identity, the handshake and TCTs.
                </p>
              </Tab>
            </Tabs>
          </Step>

          <Step n={3} title="Verify in the browser">
            <p>
              <a href="https://github.com/agentidentitytrustprotocol/aitp-verifier-ts">aitp-verifier-ts</a> is
              an independent verifier written from the RFCs. It has no runtime dependencies: all cryptography is
              WebCrypto, so it runs in browsers, Node, Deno and Bun.
            </p>
            <DynamicCodeBlock lang="bash" code={quickstartBlock('verifier-ts-install.sh')} />
            <DynamicCodeBlock lang="js" code={quickstartBlock('verifier-ts-usage.js')} />
            <p className="text-sm">
              Every verifier takes the current time and its trust inputs as arguments, and every failure throws
              an error carrying a <Link href="/registry/error-codes">registry error code</Link>.
            </p>
          </Step>

          <Step n={4} title="Get a conformance badge">
            <p>
              Run the spec&apos;s conformance fixtures against your implementation and publish the report from
              your CI. The <Link href="/conformance">conformance matrix</Link> shows a claim, and a badge, only
              when the report&apos;s gate for it passed. The report format and the rules are in{' '}
              <Link href="/docs/conformance-badge">Conformance reports and badges</Link>.
            </p>
          </Step>
        </div>
      </main>
      <Footer />
    </>
  );
}
