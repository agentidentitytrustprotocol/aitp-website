import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SCHEMA_NAMESPACE, SCHEMA_REF, servedSchemas } from '@/lib/schemas';

export const metadata: Metadata = {
  title: 'JSON Schemas (v0.3)',
  description:
    'The aitp/0.3 JSON Schemas, served at the URLs their $id names, byte-identical to the specification repository.',
};

const SPEC_REPO =
  'https://github.com/agentidentitytrustprotocol/agentidentitytrustprotocol';

export default function SchemaIndexPage() {
  const schemas = servedSchemas();
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl">
            JSON Schemas <span className="text-fd-muted-foreground">v0.3</span>
          </h1>
          <p className="mb-4 max-w-2xl text-lg text-fd-muted-foreground">
            Every schema is served at the URL its <code>$id</code> names, so a
            validator that resolves <code>{SCHEMA_NAMESPACE}</code> gets these
            files. Each one is byte-identical to the{' '}
            <Link href={`${SPEC_REPO}/tree/${SCHEMA_REF}/schemas/json`} className="text-fd-primary hover:underline">
              specification repository at <code>{SCHEMA_REF}</code>
            </Link>
            , and CI fails if they ever differ.
          </p>
          <p className="mb-12 max-w-2xl text-sm text-fd-muted-foreground">
            Later 0.3.x releases replace these files in place. A future
            protocol revision gets its own folder beside this one.
          </p>

          <ul className="divide-y divide-fd-border/60 rounded-xl border border-fd-primary/15 bg-fd-card/40">
            {schemas.map((s) => (
              <li key={s.file} className="p-5">
                <a href={`/schema/v0.3/${s.file}`} className="font-mono text-sm font-semibold text-fd-primary hover:underline">
                  {s.file}
                </a>
                <p className="mt-1 text-sm font-medium text-fd-foreground">{s.title}</p>
                {s.description && (
                  <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-fd-muted-foreground">
                    {s.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
