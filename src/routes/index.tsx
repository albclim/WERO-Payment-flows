import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Wero (EPI) Payment Flows · End-to-end" },
      { name: "description", content: "Interactive swimlane walkthroughs of EPI Wero incoming and outgoing instant payment flows across App, PSP and Bank — with ISO 20022 messages." },
    ],
  }),
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="bg-hero border-b border-border">
        <div className="container-x py-20 md:py-28">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-2 w-2 rounded-full bg-primary pulse-dot" />
            <span className="font-mono-cust text-xs uppercase tracking-[0.3em] text-muted-foreground">
              EPI Wero · SEPA Instant · ISO 20022
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] max-w-5xl">
            Wero payment flows, <span className="text-primary">end&#8209;to&#8209;end</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Two swimlane walkthroughs of the European Payments Initiative Wero scheme — a payer-side
            outgoing flow and a payee-side incoming flow — across the App, the PSP / Wero hub and the
            Bank, with fraud screening, SCA, instant settlement, accounting and reconciliation.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Link
              to="/outgoing"
              className="group rounded-md border border-border bg-card p-7 hover:border-primary/60 hover:-translate-y-1 transition-all hover:glow"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-cust text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--app))]">
                  payer side
                </span>
                <span className="font-mono-cust text-xs text-muted-foreground">01 →</span>
              </div>
              <div className="font-display text-3xl font-semibold mt-4 leading-tight">
                Outgoing payment
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                User initiates a Wero transfer · alias resolution · CoP · SCA · instant settlement on
                TIPS · ledger debit · receipt.
              </p>
              <div className="mt-6 font-mono-cust text-[11px] uppercase tracking-widest text-primary">
                explore the flow →
              </div>
            </Link>

            <Link
              to="/incoming"
              className="group rounded-md border border-border bg-card p-7 hover:border-primary/60 hover:-translate-y-1 transition-all hover:glow"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-cust text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--bank))]">
                  payee side
                </span>
                <span className="font-mono-cust text-xs text-muted-foreground">02 →</span>
              </div>
              <div className="font-display text-3xl font-semibold mt-4 leading-tight">
                Incoming payment
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Merchant Request-to-Pay · payer SCA · screening · SCT Inst credit · inbound AML · core
                ledger credit · webhook · reconciliation.
              </p>
              <div className="mt-6 font-mono-cust text-[11px] uppercase tracking-widest text-primary">
                explore the flow →
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="font-display text-3xl font-semibold">Three swimlanes</h2>
        <p className="text-muted-foreground text-sm mt-1 mb-8">
          The same actors carry both flows — only direction and responsibilities change.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { lane: "app", label: "App / Merchant", sub: "User experience · TPP · Wero SDK", body: "Initiates payments, builds RTPs, captures consent and SCA, and surfaces final status to the user." },
            { lane: "psp", label: "EPI Wero Hub / PSP", sub: "Scheme · alias directory · routing", body: "Resolves aliases, performs CoP, routes interbank messages and fans out webhooks. Owns reconciliation." },
            { lane: "bank", label: "Bank (ASPSP)", sub: "Core banking · ledger · screening", body: "Runs AML and sanctions, settles on TIPS / RT1, posts the ledger entries and emits camt notifications." },
          ].map((l) => (
            <div key={l.lane} className={`rounded-md border border-border p-5 bg-lane-${l.lane} ring-1 ring-[hsl(var(--${l.lane}))] ring-opacity-30`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full bg-[hsl(var(--${l.lane}))]`} />
                <span className="font-mono-cust text-xs uppercase tracking-widest opacity-80">{l.sub}</span>
              </div>
              <div className="font-display text-xl font-semibold mt-2">{l.label}</div>
              <p className="text-sm text-muted-foreground mt-3">{l.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="container-x py-10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-cust text-muted-foreground uppercase tracking-widest border-t border-border">
        <span>EPI Wero · ISO 20022 · SCT Inst · 2026</span>
        <span>UETR e7c1a9f0-2b34-4e55-9b1d-7a4f2c8e1d11</span>
      </footer>
    </main>
  );
}
