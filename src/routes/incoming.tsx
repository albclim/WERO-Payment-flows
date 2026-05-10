import { createFileRoute } from "@tanstack/react-router";
import { FlowPage } from "@/components/flow/FlowPage";
import { incomingSteps } from "@/data/weroFlows";

export const Route = createFileRoute("/incoming")({
  component: IncomingPage,
  head: () => ({
    meta: [
      { title: "Wero Incoming Payment Flow · Payee side" },
      { name: "description", content: "Swimlane walkthrough of an incoming EPI Wero instant payment: Request-to-Pay, payer SCA, AML screening, SCT Inst settlement, ledger credit and reconciliation." },
    ],
  }),
});

function IncomingPage() {
  return (
    <FlowPage
      direction="incoming"
      eyebrow="Wero · payee side · incoming instant credit transfer"
      title="Incoming Wero payment,"
      highlight="received by the payee"
      intro="A swimlane walkthrough of a payee-side Wero flow — Request-to-Pay, payer SCA, AML and sanctions screening, instant settlement on TIPS, core-ledger credit and end-of-day reconciliation. Click any step to inspect the underlying message."
      steps={incomingSteps}
    />
  );
}
