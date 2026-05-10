import { Link } from "@tanstack/react-router";
import { laneMeta, type FlowStep, type Lane } from "@/data/weroFlows";
import { SwimlaneFlow } from "./SwimlaneFlow";

const lanes: Lane[] = ["app", "psp", "bank"];

const laneRing: Record<Lane, string> = {
  app: "ring-[hsl(var(--app))]",
  psp: "ring-[hsl(var(--psp))]",
  bank: "ring-[hsl(var(--bank))]",
};
const laneDot: Record<Lane, string> = {
  app: "bg-[hsl(var(--app))]",
  psp: "bg-[hsl(var(--psp))]",
  bank: "bg-[hsl(var(--bank))]",
};
const laneBg: Record<Lane, string> = {
  app: "bg-lane-app",
  psp: "bg-lane-psp",
  bank: "bg-lane-bank",
};

export function FlowPage({
  direction,
  eyebrow,
  title,
  highlight,
  intro,
  steps,
}: {
  direction: "incoming" | "outgoing";
  eyebrow: string;
  title: string;
  highlight: string;
  intro: string;
  steps: FlowStep[];
}) {
  const other = direction === "incoming" ? "outgoing" : "incoming";
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="bg-hero border-b border-border">
        <div className="container-x py-16 md:py-24">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="font-mono-cust text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary">
              ← back to overview
            </Link>
            <Link
              to={other === "incoming" ? "/incoming" : "/outgoing"}
              className="font-mono-cust text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary"
            >
              {other} flow →
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <span className="h-2 w-2 rounded-full bg-primary pulse-dot" />
            <span className="font-mono-cust text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {eyebrow}
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] max-w-5xl">
            {title} <span className="text-primary">{highlight}</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{intro}</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {lanes.map((l) => (
              <div
                key={l}
                className={`rounded-md border border-border p-5 ${laneBg[l]} ring-1 ${laneRing[l]} ring-opacity-30`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${laneDot[l]}`} />
                  <span className="font-mono-cust text-xs uppercase tracking-widest opacity-80">
                    {laneMeta[l].sub}
                  </span>
                </div>
                <div className="font-display text-2xl font-semibold mt-2 text-foreground">
                  {laneMeta[l].label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="container-x py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display text-3xl font-semibold">The flow</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Scroll horizontally · click a node for the underlying message
              </p>
            </div>
            <div className="hidden md:flex gap-3 font-mono-cust text-[11px] uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success" />OK</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-warning" />Decision</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-destructive" />Reject</span>
            </div>
          </div>
          <SwimlaneFlow steps={steps} />
        </div>
      </section>

      <footer className="container-x py-10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-cust text-muted-foreground uppercase tracking-widest">
        <span>EPI Wero · ISO 20022 · SCT Inst · 2026</span>
        <span>UETR 9b1d7a4f-2c8e-4e55-b234-e7c1a9f02b34</span>
      </footer>
    </main>
  );
}
