import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { laneMeta, type FlowStep, type Lane } from "@/data/weroFlows";

const lanes: Lane[] = ["app", "psp", "bank"];

const laneRing: Record<Lane, string> = {
  app: "ring-[hsl(var(--app))] text-[hsl(var(--app))]",
  psp: "ring-[hsl(var(--psp))] text-[hsl(var(--psp))]",
  bank: "ring-[hsl(var(--bank))] text-[hsl(var(--bank))]",
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

const kindBadge = (s: FlowStep) => {
  if (s.kind === "decision") return { label: "DECISION", cls: "bg-warning/15 text-warning border-warning/40" };
  if (s.kind === "settlement") return { label: "SETTLEMENT", cls: "bg-accent/15 text-accent border-accent/40" };
  if (s.kind === "message") return { label: "ISO MESSAGE", cls: "bg-primary/15 text-primary border-primary/40" };
  return { label: "PROCESS", cls: "bg-muted text-muted-foreground border-border" };
};

const statusDot = (s?: FlowStep["status"]) => {
  if (s === "ok") return "bg-success";
  if (s === "warn") return "bg-warning";
  if (s === "fail") return "bg-destructive";
  return "bg-muted-foreground/50";
};

export function SwimlaneFlow({ steps }: { steps: FlowStep[] }) {
  const [active, setActive] = useState<FlowStep | null>(null);

  const COL_W = 300;
  const COL_GAP = 28;
  const ROW_H = 168;
  const HEADER_H = 64;

  const colX = (i: number) => i * (COL_W + COL_GAP);
  const laneY = (lane: Lane) => HEADER_H + lanes.indexOf(lane) * ROW_H;

  const totalW = steps.length * COL_W + (steps.length - 1) * COL_GAP;
  const totalH = HEADER_H + lanes.length * ROW_H + 24;

  return (
    <>
      <div className="rounded-md border border-border bg-card overflow-x-auto grid-bg">
        <div className="relative" style={{ width: totalW + 80, height: totalH }}>
          {lanes.map((l, idx) => (
            <div
              key={l}
              className={`absolute left-0 right-0 ${laneBg[l]} border-t border-border`}
              style={{ top: HEADER_H + idx * ROW_H, height: ROW_H }}
            >
              <div className="sticky left-0 inline-flex items-center gap-3 px-5 py-3">
                <span className={`h-2.5 w-2.5 rounded-full ${laneDot[l]}`} />
                <div>
                  <div className="font-display text-sm font-semibold uppercase tracking-wider">
                    {laneMeta[l].label}
                  </div>
                  <div className="font-mono-cust text-[10px] uppercase tracking-widest text-muted-foreground">
                    {laneMeta[l].sub}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute top-0 left-0 right-0 h-[64px] border-b border-border flex items-end px-2 pb-3">
            <div className="font-mono-cust text-xs uppercase tracking-[0.3em] text-muted-foreground pl-3">
              T → time
            </div>
          </div>

          <svg className="absolute inset-0 pointer-events-none" width={totalW + 80} height={totalH}>
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--primary))" />
              </marker>
            </defs>
            {steps.slice(0, -1).map((s, i) => {
              const next = steps[i + 1];
              const x1 = colX(i) + COL_W;
              const y1 = laneY(s.lane) + ROW_H / 2;
              const x2 = colX(i + 1);
              const y2 = laneY(next.lane) + ROW_H / 2;
              const mx = (x1 + x2) / 2;
              return (
                <path
                  key={s.id}
                  d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  fill="none"
                  strokeDasharray="6 6"
                  className="flow-line"
                  opacity={0.55}
                  markerEnd="url(#arr)"
                />
              );
            })}
          </svg>

          {steps.map((s, i) => {
            const b = kindBadge(s);
            return (
              <button
                key={s.id}
                onClick={() => setActive(s)}
                className={`absolute group text-left rounded-md border border-border bg-card hover:bg-secondary transition-all hover:-translate-y-1 hover:glow ring-1 ${laneRing[s.lane]} ring-opacity-20 hover:ring-opacity-60`}
                style={{
                  left: colX(i),
                  top: laneY(s.lane) + 18,
                  width: COL_W,
                  height: ROW_H - 36,
                }}
              >
                <div className="p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className={`font-mono-cust text-[10px] tracking-widest px-2 py-0.5 rounded-sm border ${b.cls}`}>
                      {b.label}
                    </span>
                    <span className="font-mono-cust text-xs text-muted-foreground">#{s.id}</span>
                  </div>
                  <div className="mt-3 font-display text-base font-semibold leading-snug text-foreground">
                    {s.title}
                  </div>
                  {s.subtitle && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.subtitle}</div>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    {s.iso ? (
                      <span className="font-mono-cust text-[11px] text-primary truncate">{s.iso}</span>
                    ) : <span />}
                    <span className={`h-2 w-2 rounded-full ${statusDot(s.status)}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="font-display text-2xl font-semibold">ISO 20022 messages used</h3>
        <p className="text-muted-foreground text-sm mt-1 mb-6">
          Click any card to inspect the canonical XML payload for this step.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.filter((s) => s.message).map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s)}
              className="text-left rounded-md border border-border p-5 bg-card hover:bg-secondary hover:border-primary/50 transition-all"
            >
              <div className="font-mono-cust text-[11px] uppercase tracking-widest text-primary">
                {s.iso}
              </div>
              <div className="font-display text-lg font-semibold mt-2">{s.message!.name}</div>
              <div className="text-xs text-muted-foreground mt-2">{s.subtitle}</div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="outline" className={laneRing[s.lane] + " border-current"}>
                  {laneMeta[s.lane].label}
                </Badge>
                <span className="font-mono-cust text-[11px] text-muted-foreground">view xml →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl bg-card border-border">
          {active && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`h-2 w-2 rounded-full ${laneDot[active.lane]}`} />
                  <span className="font-mono-cust text-[11px] uppercase tracking-widest text-muted-foreground">
                    {laneMeta[active.lane].label} · step #{active.id}
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl">{active.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {active.description}
                </DialogDescription>
              </DialogHeader>
              {active.message ? (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-cust text-xs text-primary">{active.iso}</span>
                    <span className="font-mono-cust text-xs text-muted-foreground">
                      {active.message.name}
                    </span>
                  </div>
                  <pre className="font-mono-cust text-[11.5px] leading-relaxed bg-background border border-border rounded-md p-4 overflow-auto max-h-[55vh] text-foreground/90">
{active.message.xml}
                  </pre>
                </div>
              ) : (
                <div className="mt-2 rounded-md border border-dashed border-border p-5 text-sm text-muted-foreground">
                  Internal processing step — no ISO 20022 message is emitted at this stage.
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
