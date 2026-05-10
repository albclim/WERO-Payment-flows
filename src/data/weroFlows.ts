export type Lane = "app" | "psp" | "bank";
export type StepKind = "message" | "process" | "decision" | "settlement";
export type Status = "ok" | "warn" | "fail";

export interface FlowStep {
  id: string;
  lane: Lane;
  kind: StepKind;
  title: string;
  subtitle?: string;
  iso?: string;
  description: string;
  message?: { name: string; xml: string };
  status?: Status;
}

export const laneMeta: Record<Lane, { label: string; sub: string }> = {
  app: { label: "App / Merchant", sub: "User experience · TPP · Wero SDK" },
  psp: { label: "EPI Wero Hub / PSP", sub: "Scheme · alias directory · routing" },
  bank: { label: "Bank (ASPSP)", sub: "Core banking · ledger · screening" },
};

// =========================================================
// OUTGOING — payer-side initiation of a Wero credit transfer
// =========================================================
export const outgoingSteps: FlowStep[] = [
  {
    id: "01",
    lane: "app",
    kind: "process",
    title: "User initiates Wero payment",
    subtitle: "alias / IBAN / QR / phone number",
    description:
      "The payer opens the Wero-enabled app, scans a QR or selects a contact alias and enters the amount. The app builds a payment intent and prepares a pain.001 PaymentInitiation.",
  },
  {
    id: "02",
    lane: "app",
    kind: "decision",
    title: "Pre-transaction fraud screening",
    subtitle: "device · velocity · behavioural model",
    status: "warn",
    description:
      "Client-side and server-side risk engines score the request: device fingerprint, geo, velocity, ML-based fraud model. Below threshold → continue. Above → step-up or block.",
  },
  {
    id: "03",
    lane: "app",
    kind: "message",
    title: "Submit Wero PaymentInitiation",
    subtitle: "API call to PSP / Wero Hub",
    iso: "pain.001.001.11",
    description:
      "The app POSTs a CustomerCreditTransferInitiation to the Wero-enabled PSP. Includes payer identity, beneficiary alias, amount, end-to-end ID and remittance information.",
    message: {
      name: "pain.001 — CustomerCreditTransferInitiation",
      xml: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.11">
 <CstmrCdtTrfInitn>
  <GrpHdr>
   <MsgId>WERO-OUT-20260509-0001</MsgId>
   <CreDtTm>2026-05-09T10:11:42Z</CreDtTm>
   <NbOfTxs>1</NbOfTxs>
   <CtrlSum>89.50</CtrlSum>
   <InitgPty><Nm>Lovable Wallet App</Nm></InitgPty>
  </GrpHdr>
  <PmtInf>
   <PmtInfId>PI-WERO-9981</PmtInfId>
   <PmtMtd>TRF</PmtMtd>
   <PmtTpInf>
    <SvcLvl><Cd>SEPA</Cd></SvcLvl>
    <LclInstrm><Prtry>WERO</Prtry></LclInstrm>
   </PmtTpInf>
   <ReqdExctnDt><DtTm>2026-05-09T10:11:42Z</DtTm></ReqdExctnDt>
   <Dbtr><Nm>Camille Laurent</Nm></Dbtr>
   <DbtrAcct><Id><IBAN>FR7630006000011234567890189</IBAN></Id></DbtrAcct>
   <DbtrAgt><FinInstnId><BICFI>BNPAFRPPXXX</BICFI></FinInstnId></DbtrAgt>
   <CdtTrfTxInf>
    <PmtId><EndToEndId>E2E-WERO-AB778</EndToEndId>
           <UETR>9b1d7a4f-2c8e-4e55-b234-e7c1a9f02b34</UETR></PmtId>
    <Amt><InstdAmt Ccy="EUR">89.50</InstdAmt></Amt>
    <CdtrAgt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></CdtrAgt>
    <Cdtr><Nm>Mara Voss</Nm></Cdtr>
    <CdtrAcct><Id><Othr><Id>+4915112345678</Id>
        <SchmeNm><Prtry>WERO_ALIAS</Prtry></SchmeNm></Othr></Id></CdtrAcct>
    <RmtInf><Ustrd>Dinner share · table 14</Ustrd></RmtInf>
   </CdtTrfTxInf>
  </PmtInf>
 </CstmrCdtTrfInitn>
</Document>`,
    },
  },
  {
    id: "04",
    lane: "psp",
    kind: "process",
    title: "Wero alias resolution & routing",
    subtitle: "directory lookup → IBAN + reachable PSP",
    description:
      "EPI Wero Hub resolves the alias against the central proxy directory, returning the beneficiary IBAN, BIC and reachable PSP. Scheme rules and amount limits are checked.",
  },
  {
    id: "05",
    lane: "psp",
    kind: "message",
    title: "Confirmation of Payee (CoP)",
    subtitle: "name match against beneficiary",
    iso: "VOP / SRTP CoP",
    description:
      "Wero performs a Verification of Payee — the resolved beneficiary name is sent back so the user can confirm the match before authorising. EPI mandates this anti-fraud control.",
    message: {
      name: "Verification of Payee — response",
      xml: `<?xml version="1.0" encoding="UTF-8"?>
<VopResponse xmlns="urn:eba:vop:001.001.01">
 <RequestId>VOP-7711</RequestId>
 <Result>MATCH</Result>
 <CreditorName>Mara Voss</CreditorName>
 <CreditorAccount><IBAN>DE89370400440532013000</IBAN></CreditorAccount>
 <CreditorAgent><BICFI>COBADEFFXXX</BICFI></CreditorAgent>
 <Wero><Alias>+4915112345678</Alias><AliasType>MOBILE</AliasType></Wero>
</VopResponse>`,
    },
  },
  {
    id: "06",
    lane: "app",
    kind: "decision",
    title: "Strong Customer Authentication",
    subtitle: "PSD2 SCA · biometrics / OTP",
    status: "warn",
    description:
      "User confirms the verified beneficiary and authorises with two-factor SCA (inherence + possession). Consent is captured and bound to the transaction reference.",
  },
  {
    id: "07",
    lane: "psp",
    kind: "message",
    title: "Forward to payer bank (ASPSP)",
    subtitle: "interbank instruction over SCT Inst",
    iso: "pacs.008.001.10",
    description:
      "PSP transforms the authorised initiation into an interbank FIToFICustomerCreditTransfer addressed to the payer bank, marked LCL_INSTRM = WERO and SvcLvl = SEPA Inst.",
  },
  {
    id: "08",
    lane: "bank",
    kind: "decision",
    title: "AML · sanctions · balance check",
    subtitle: "real-time screening at debtor agent",
    status: "warn",
    description:
      "Payer bank screens against OFAC / EU / UN lists, applies AML rules, checks available balance and segment limits. A hit parks the payment for manual review or RJCT.",
  },
  {
    id: "09",
    lane: "bank",
    kind: "settlement",
    title: "Instant interbank settlement",
    subtitle: "TIPS / RT1 · ≤10 seconds · irrevocable",
    iso: "pacs.008 → settlement",
    description:
      "Funds move from payer bank's TIPS account to the beneficiary bank's TIPS account. The 10-second SLA applies. On success the beneficiary bank issues a positive pacs.002.",
    status: "ok",
    message: {
      name: "pacs.002 — FIToFIPaymentStatusReport (ACSC)",
      xml: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.11">
 <FIToFIPmtStsRpt>
  <GrpHdr><MsgId>PCS002-WERO-OUT-001</MsgId>
   <CreDtTm>2026-05-09T10:11:51Z</CreDtTm></GrpHdr>
  <TxInfAndSts>
   <OrgnlEndToEndId>E2E-WERO-AB778</OrgnlEndToEndId>
   <OrgnlUETR>9b1d7a4f-2c8e-4e55-b234-e7c1a9f02b34</OrgnlUETR>
   <TxSts>ACSC</TxSts>
   <AccptncDtTm>2026-05-09T10:11:51Z</AccptncDtTm>
   <ClrSysRef>TIPS</ClrSysRef>
  </TxInfAndSts>
 </FIToFIPmtStsRpt>
</Document>`,
    },
  },
  {
    id: "10",
    lane: "bank",
    kind: "process",
    title: "Accounting — payer ledger posting",
    subtitle: "Dr Customer / Cr Nostro",
    description:
      "Earmark released, final debit posted to the payer's IBAN with same-day value. GL entry: Debit customer current account, Credit TIPS settlement nostro. Booking event published.",
  },
  {
    id: "11",
    lane: "psp",
    kind: "process",
    title: "Reconciliation engine",
    subtitle: "match instruction ↔ settlement ↔ ledger",
    description:
      "PSP recon matches the original pain.001, the pacs.008 instruction, the pacs.002 ACSC and the bank's nostro feed by UETR / EndToEndId / amount. Breaks routed to ops.",
  },
  {
    id: "12",
    lane: "app",
    kind: "message",
    title: "User receipt & notification",
    subtitle: "push notification + camt.054",
    iso: "camt.054.001.08",
    description:
      "App displays an instant confirmation. The bank emits a BankToCustomerDebitCreditNotification for the debit entry, available via API/EBICS for accounting export.",
    status: "ok",
  },
];

// =========================================================
// INCOMING — payee-side reception of a Wero credit transfer
// =========================================================
export const incomingSteps: FlowStep[] = [
  {
    id: "01",
    lane: "app",
    kind: "message",
    title: "Create Request-to-Pay",
    subtitle: "payee builds RTP with amount + reference",
    iso: "pain.013 / SRTP",
    description:
      "Merchant or user creates a Wero Request-to-Pay carrying the amount, currency, reference and short expiry. Sent to the PSP via API and signed with merchant credentials.",
    message: {
      name: "pain.013 — CreditorPaymentActivationRequest",
      xml: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.013.001.09">
 <CdtrPmtActvtnReq>
  <GrpHdr><MsgId>RTP-WERO-IN-22001</MsgId>
   <CreDtTm>2026-05-09T14:02:10Z</CreDtTm><NbOfTxs>1</NbOfTxs>
   <InitgPty><Nm>Lumiere Studio SARL</Nm></InitgPty></GrpHdr>
  <PmtInf>
   <PmtInfId>RTP-INF-3301</PmtInfId>
   <PmtMtd>TRF</PmtMtd>
   <ReqdExctnDt><DtTm>2026-05-09T14:02:10Z</DtTm></ReqdExctnDt>
   <Cdtr><Nm>Lumiere Studio SARL</Nm></Cdtr>
   <CdtrAcct><Id><IBAN>FR7630006000011234567890189</IBAN></Id></CdtrAcct>
   <CdtrAgt><FinInstnId><BICFI>BNPAFRPPXXX</BICFI></FinInstnId></CdtrAgt>
   <CdtTrfTx>
    <PmtId><EndToEndId>E2E-RTP-LM-2026-0421</EndToEndId>
           <UETR>aa11bb22-cc33-44dd-aa55-66bb77cc88dd</UETR></PmtId>
    <Amt><InstdAmt Ccy="EUR">240.00</InstdAmt></Amt>
    <Dbtr><Nm>ACME Manufacturing GmbH</Nm></Dbtr>
    <RmtInf><Ustrd>Invoice 2026-0421</Ustrd></RmtInf>
   </CdtTrfTx>
  </PmtInf>
 </CdtrPmtActvtnReq>
</Document>`,
    },
  },
  {
    id: "02",
    lane: "psp",
    kind: "process",
    title: "PSP routes RTP to payer's PSP",
    subtitle: "Wero hub · alias / IBAN resolution",
    description:
      "EPI Wero Hub validates the request, resolves the debtor reachability via the proxy directory and forwards the RTP to the payer's PSP for delivery.",
  },
  {
    id: "03",
    lane: "bank",
    kind: "decision",
    title: "Payer bank notifies user & captures SCA",
    subtitle: "in-app push · biometric consent",
    status: "warn",
    description:
      "Payer bank app notifies the user, presents the verified beneficiary name, amount and reference, and collects PSD2 SCA approval bound to the RTP reference.",
  },
  {
    id: "04",
    lane: "bank",
    kind: "decision",
    title: "Payer bank screening",
    subtitle: "AML · sanctions · balance · limits",
    status: "warn",
    description:
      "Real-time AML, sanctions and balance checks at the payer bank. Failure → RJCT with reason code returned to the PSP and surfaced to the merchant app.",
  },
  {
    id: "05",
    lane: "bank",
    kind: "settlement",
    title: "SCT Inst credit transfer",
    subtitle: "TIPS · interbank settlement ≤10s",
    iso: "pacs.008.001.10",
    description:
      "Payer bank originates a FIToFICustomerCreditTransfer with LclInstrm = WERO and SvcLvl = SEPA Inst. Funds are settled in TIPS / RT1 from payer bank to payee bank.",
    message: {
      name: "pacs.008 — FIToFICustomerCreditTransfer (Wero)",
      xml: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
 <FIToFICstmrCdtTrf>
  <GrpHdr>
   <MsgId>PCS008-WERO-IN-22011</MsgId>
   <CreDtTm>2026-05-09T14:02:18Z</CreDtTm>
   <NbOfTxs>1</NbOfTxs>
   <SttlmInf><SttlmMtd>CLRG</SttlmMtd>
             <ClrSys><Cd>TIPS</Cd></ClrSys></SttlmInf>
  </GrpHdr>
  <CdtTrfTxInf>
   <PmtId><EndToEndId>E2E-RTP-LM-2026-0421</EndToEndId>
          <UETR>aa11bb22-cc33-44dd-aa55-66bb77cc88dd</UETR></PmtId>
   <PmtTpInf><SvcLvl><Cd>SEPA</Cd></SvcLvl>
             <LclInstrm><Prtry>WERO</Prtry></LclInstrm></PmtTpInf>
   <IntrBkSttlmAmt Ccy="EUR">240.00</IntrBkSttlmAmt>
   <IntrBkSttlmDt>2026-05-09</IntrBkSttlmDt>
   <ChrgBr>SLEV</ChrgBr>
   <Dbtr><Nm>ACME Manufacturing GmbH</Nm></Dbtr>
   <DbtrAgt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></DbtrAgt>
   <CdtrAgt><FinInstnId><BICFI>BNPAFRPPXXX</BICFI></FinInstnId></CdtrAgt>
   <Cdtr><Nm>Lumiere Studio SARL</Nm></Cdtr>
   <CdtrAcct><Id><IBAN>FR7630006000011234567890189</IBAN></Id></CdtrAcct>
   <RmtInf><Ustrd>Invoice 2026-0421</Ustrd></RmtInf>
  </CdtTrfTxInf>
 </FIToFICstmrCdtTrf>
</Document>`,
    },
  },
  {
    id: "06",
    lane: "bank",
    kind: "decision",
    title: "Inbound screening at payee bank",
    subtitle: "AML · sanctions · CoP · fraud",
    description:
      "Payee bank screens the inbound transfer: sanctions, name/IBAN match (CoP), beneficiary status, mule-account models. Hits are parked or returned via pacs.004.",
  },
  {
    id: "07",
    lane: "bank",
    kind: "process",
    title: "Accounting — credit beneficiary",
    subtitle: "Dr Nostro / Cr Customer · same-day value",
    description:
      "Core ledger debits the TIPS settlement nostro and credits the merchant's IBAN with value = settlement date. Booking event emitted; available balance updated immediately.",
  },
  {
    id: "08",
    lane: "psp",
    kind: "message",
    title: "Settlement confirmation",
    subtitle: "ACSC sent back to scheme & app",
    iso: "pacs.002.001.11",
    description:
      "Payee bank confirms ACSC. PSP relays the final status back through the scheme and to the merchant app via webhook within the 10-second SLA.",
    status: "ok",
  },
  {
    id: "09",
    lane: "psp",
    kind: "message",
    title: "Webhook to merchant app",
    subtitle: "RTP matched · order updated",
    iso: "Wero callback",
    description:
      "The PSP fires a signed webhook to the merchant carrying the original RTP reference, UETR and final status. The merchant matches it to the order and updates state.",
  },
  {
    id: "10",
    lane: "app",
    kind: "process",
    title: "Notify payee & release goods",
    subtitle: "in-app receipt · email · POS unlock",
    description:
      "Merchant app shows a paid status, releases the goods or service, and stores the UETR for refunds and dispute traceability.",
  },
  {
    id: "11",
    lane: "psp",
    kind: "process",
    title: "End-of-day reconciliation",
    subtitle: "scheme report ↔ ledger ↔ webhook log",
    description:
      "PSP reconciles the day's scheme reports with the bank's nostro statement and the merchant webhook log. Breaks routed to ops; chargebacks/returns initiated when needed.",
  },
  {
    id: "12",
    lane: "bank",
    kind: "message",
    title: "Customer statement",
    subtitle: "definitive accounting record",
    iso: "camt.053.001.08",
    description:
      "BankToCustomerStatement closes the day for the merchant — the credit entry is the definitive accounting record consumed by ERP reconciliation.",
  },
];
