import { createFileRoute } from "@tanstack/react-router";
import { FlowPage } from "@/components/flow/FlowPage";
import { outgoingSteps } from "@/data/weroFlows";

export const Route = createFileRoute("/outgoing")({
  component: OutgoingPage,
  head: () => ({
    meta: [
      { title: "Wero Outgoing Payment Flow · Payer side" },
      { name: "description", content: "Swimlane walkthrough of an outgoing EPI Wero instant payment: initiation, fraud screening, alias resolution, Confirmation of Payee, SCA, TIPS settlement and accounting." },
    ],
  }),
});

function OutgoingPage() {
  return (
    <FlowPage
      direction="outgoing"
      eyebrow="Wero · payer side · outgoing instant credit transfer"
      title="Outgoing Wero payment,"
      highlight="initiated by the payer"
      intro="A swimlane walkthrough of a payer-initiated Wero credit transfer — from user intent and SCA through PSP routing, instant interbank settlement on TIPS and ledger posting. Click any step to inspect the underlying ISO 20022 message."
      steps={outgoingSteps}
    />
  );
}
