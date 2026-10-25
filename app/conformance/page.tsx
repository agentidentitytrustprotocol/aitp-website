import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { loadMatrix, columns, countCell } from '@/lib/conformance/reports';
import { badgeClaim, earnedClaims } from '@/lib/conformance/badge';
import { SPEC_VERSION } from '@/lib/spec-version';

export const metadata: Metadata = {
  title: 'Conformance',
  description:
    'Which AITP implementations pass the aitp/0.3 conformance fixtures, generated from the reports their CI publishes.',
};

const SPEC_REPO = 'https://github.com/agentidentitytrustprotocol/agentidentitytrustprotocol';

export default function ConformancePage() {
  const rows = loadMatrix();
  const cols = columns(rows);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl">
            Conformance
          </h1>
          <p className="mb-12 max-w-3xl text-lg text-fd-muted-foreground">
            Each row comes from the conformance report the implementation&apos;s own CI
            produced. Cells count fixture outcomes, and claims are shown only when the
            report&apos;s gate for them passed. Nobody awards a claim by hand.
          </p>

          <div className="overflow-x-auto rounded-xl border border-fd-primary/15 bg-fd-card/40">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-fd-border text-xs uppercase tracking-wider text-fd-muted-foreground">
                <tr>
                  <th className="p-4 font-semibold">Implementation</th>
                  {cols.map((c) => (
                    <th key={c.key} className="p-4 font-semibold">
                      {c.label}
                    </th>
                  ))}
                  <th className="p-4 font-semibold">Claims</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fd-border/60">
                {rows.map(({ impl, report, ciRunUrl }) => (
                  <tr key={impl.id} className="align-top">
                    <td className="p-4">
                      <Link href={`https://github.com/${impl.repository}`} className="font-semibold text-fd-foreground hover:underline">
                        {impl.name}
                      </Link>
                      {report && <span className="ml-1 text-fd-muted-foreground">{report.implementation.version}</span>}
                      <p className="text-xs text-fd-muted-foreground">{impl.description}</p>
                      {report && (
                        <p className="mt-2 text-xs text-fd-muted-foreground">
                          spec{' '}
                          <Link href={`${SPEC_REPO}/tree/${report.spec.commit}`} className="font-mono hover:underline">
                            {report.spec.version} ({report.spec.commit.slice(0, 7)})
                          </Link>
                          {report.spec.version !== SPEC_VERSION && (
                            <span
                              title={`The latest spec release is ${SPEC_VERSION}`}
                              className="ml-1.5 rounded bg-amber-500/15 px-1.5 py-0.5 font-medium text-amber-600 dark:text-amber-400"
                            >
                              behind spec
                            </span>
                          )}
                          <br />
                          <time dateTime={report.generated_at}>{report.generated_at.slice(0, 10)}</time>
                          {ciRunUrl && (
                            <>
                              {' · '}
                              <Link href={ciRunUrl} className="hover:underline">
                                CI run
                              </Link>
                            </>
                          )}
                        </p>
                      )}
                    </td>
                    {report ? (
                      cols.map((c) => {
                        const n = countCell(report, c);
                        const skip = n.skip + n.excluded_by_role;
                        return (
                          <td key={c.key} className="p-4 font-mono text-xs">
                            <span className="text-emerald-600 dark:text-emerald-400">{n.pass} pass</span>
                            <br />
                            <span className={n.fail ? 'text-red-600 dark:text-red-400' : 'text-fd-muted-foreground'}>
                              {n.fail} fail
                            </span>
                            <br />
                            <span className="text-fd-muted-foreground">{skip} skip</span>
                          </td>
                        );
                      })
                    ) : (
                      <td colSpan={cols.length} className="p-4 text-fd-muted-foreground">
                        No report
                      </td>
                    )}
                    <td className="p-4">
                      {report && badgeClaim(report) ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/badge/${impl.id}.svg`} alt={earnedClaims(report)[0]} className="mb-2 h-5 max-w-none" />
                          <ul className="space-y-0.5 text-xs text-fd-foreground">
                            {earnedClaims(report).map((c) => (
                              <li key={c}>{c}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <span className="text-xs text-fd-muted-foreground">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 max-w-3xl text-sm text-fd-muted-foreground">
            Claims use only the RFC-AITP-0001 §10 claim strings. &ldquo;Skip&rdquo; includes
            role exclusions. A skipped core fixture blocks the <code>AITP v0.3</code> claim.
            &ldquo;Behind spec&rdquo; means the report ran fixtures older than the latest spec
            release, {SPEC_VERSION}; a pass at one commit says nothing about a later fixture set.
            To get a row or a badge, see{' '}
            <Link href="/docs/conformance-badge" className="text-fd-primary hover:underline">
              Conformance reports and badges
            </Link>
            .
          </p>
          <p className="mt-3 max-w-3xl text-sm text-fd-muted-foreground">
            Embed a badge with <code>https://agentidentitytrustprotocol.io/badge/&lt;implementation&gt;.svg</code>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
