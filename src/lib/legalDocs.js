// Authorized JTF Retail Legal Document Templates & Google Drive Masters
// Canonical Master: "02 - Roofing Contract.pdf" (Drive ID: 1vfPxsQ6PGZKEPjTANiDMO3wdKzX0BkJ-)

export const JTF_RETAIL_CONTRACT = {
  id: "jtf_roofing_contract_02",
  driveId: "1vfPxsQ6PGZKEPjTANiDMO3wdKzX0BkJ-",
  fileName: "02 - Roofing Contract.pdf",
  title: "JTF Master Retail Roofing Agreement",
  counselApproved: true,
  cancellationNoticeId: "15gkQjJI4Gsr_eKK8Xc9sh5d9gzYq95hq",
  cancellationFileName: "02A - Notice of Cancellation.pdf",
  jurisdiction: "State of Georgia & Alabama",
  clauses: [
    {
      title: "1. SCOPE OF WORK & SYSTEM SPECIFICATIONS",
      body: "JTF Home Group LLC ('Contractor') agrees to furnish all labor, premium materials, equipment, site safety protection, and supervision required to perform a complete tear-off, roof deck inspection, and installation of the specified architectural roofing system and accessories at the Owner's property address.",
    },
    {
      title: "2. ROOFING SYSTEM INCLUSIONS",
      body: "Installation includes: (a) Synthetic high-performance underlayment, (b) Ice & Water leak barrier in all valleys and penetrations, (c) Pre-formed aluminum drip edge on eaves and rakes, (d) Starter shingle course along all perimeters, (e) High-definition ridge cap shingles, (f) Continuous ridge ventilation system, and (g) New rubber pipe boot flashings.",
    },
    {
      title: "3. PAYMENT TERMS & RETAIL INVESTMENT SCHEDULE",
      body: "Residential Payment Schedule: (a) 50% initial investment deposit upon agreement execution and material allocation, (b) 50% final balance upon substantial completion and final customer quality walkthrough inspection. For approved third-party retail financing (HFS / Acorn), lender release protocol governs.",
    },
    {
      title: "4. DUAL WARRANTY COVERAGE",
      body: "Owner receives: (a) JTF 5-Year Workmanship Warranty Certificate protecting against any installation defects, and (b) TAMKO Building Products Manufacturer Limited Warranty covering shingle material integrity, wind protection (up to 160 MPH on Titan XT), and algae resistance.",
    },
    {
      title: "5. STATUTORY 3-DAY RIGHT OF RESCISSION (NOTICE OF CANCELLATION)",
      body: "You, the Homeowner, may cancel this transaction without penalty or obligation at any time prior to midnight of the third business day after the date of this transaction by submitting written notice of cancellation to JTF Home Group LLC.",
    },
    {
      title: "6. PROPERTY PROTECTION & CLEAN-UP GUARANTEE",
      body: "Contractor guarantees thorough property protection during construction, including tarps, magnetic nail sweep of the entire yard, driveway, and landscaping, and removal/haul-away of all job-related debris.",
    },
  ]
};

export function generateRetailContractText({ deal, operator }) {
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const squares = deal.measurements?.squares || "28.5";
  const pitch = deal.measurements?.pitch || 6;

  let text = `========================================================================\n`;
  text += `                         JTF HOME GROUP LLC\n`;
  text += `                  MASTER RETAIL ROOFING AGREEMENT\n`;
  text += `          Authorized Legal Master (Drive ID: 1vfPxsQ6PGZKEPjTANiDMO3wdKzX0BkJ-)\n`;
  text += `========================================================================\n\n`;
  text += `AGREEMENT DATE: ${dateStr}\n`;
  text += `CONTRACT ID:    JTF-RTL-${Date.now().toString(36).toUpperCase()}\n`;
  text += `EXECUTIVE:      ${operator.name} (${operator.title})\n`;
  text += `OFFICE EMAIL:   ${operator.email} | (404) 555-0199\n\n`;

  text += `PROPERTY OWNER / CUSTOMER:\n`;
  text += `  Customer Name:   ${deal.customerName || "Homeowner"}\n`;
  text += `  Project Address: ${deal.address}\n`;
  text += `  Phone:           ${deal.customerPhone || "On File"}\n`;
  text += `  Email:           ${deal.customerEmail || "On File"}\n\n`;

  text += `RETAIL ROOF SPECIFICATIONS:\n`;
  text += `  Roof System Package: ${deal.selectedPackage?.name || "TAMKO Titan XT Architectural System"}\n`;
  text += `  Measured Area:       ${squares} Installed Squares (${pitch}/12 Pitch Midpoint)\n`;
  text += `  Project Type:        Retail Direct Homeowner Replacement\n`;

  if (deal.lineItems && deal.lineItems.length > 0) {
    text += `\nINCLUDED SCOPE ADD-ONS & TRADE ITEMS:\n`;
    deal.lineItems.forEach((it) => {
      text += `  • ${it.label}: $${it.amount.toLocaleString()}\n`;
    });
  }

  text += `\nRETAIL FINANCIAL SUMMARY:\n`;
  text += `  Base System Investment:  $${(deal.baseTotal || 0).toLocaleString()}\n`;
  if (deal.addOnsTotal > 0) {
    text += `  Add-ons & Trade Scope:  +$${deal.addOnsTotal.toLocaleString()}\n`;
  }
  if (deal.discountAmount > 0) {
    text += `  In-Home Discount:       -$${deal.discountAmount.toLocaleString()} (${deal.discountPct}% In-Home Promotion)\n`;
  }
  text += `  --------------------------------------------------------\n`;
  text += `  TOTAL AGREED INVESTMENT: $${(deal.grandTotal || 0).toLocaleString()} USD\n`;
  text += `  Deposit Required (50%):  $${Math.round((deal.grandTotal || 0) * 0.5).toLocaleString()} USD\n`;
  text += `  Final Balance (50%):     $${Math.round((deal.grandTotal || 0) * 0.5).toLocaleString()} USD (Due Upon Completion)\n\n`;

  text += `AUTHORIZED TERMS & LEGAL COVENANTS:\n`;
  JTF_RETAIL_CONTRACT.clauses.forEach((c) => {
    text += `\n${c.title}\n${c.body}\n`;
  });

  return text;
}
