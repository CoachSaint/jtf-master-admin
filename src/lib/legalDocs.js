// Authorized JTF Legal Document Templates & Terms

export const JTF_LEGAL_TEMPLATES = {
  contract: {
    id: "jtf_master_contract_v1",
    title: "JTF Master Roof Replacement Agreement",
    docType: "contract",
    counselApproved: true,
    jurisdiction: "State of Georgia & Alabama",
    clauses: [
      {
        title: "1. SCOPE OF WORK",
        body: "JTF Home Group LLC ('Contractor') agrees to furnish all labor, materials, equipment, and supervision required to perform the roof installation/replacement and specified exterior improvements at the Owner's property address listed herein.",
      },
      {
        title: "2. MATERIALS & STANDARDS",
        body: "All roofing shingles, underlayments, ice & water shield, drip edge, starter course, ridge cap, and ventilation components will be installed in strict adherence to manufacturer specifications and applicable local building codes.",
      },
      {
        title: "3. PAYMENT TERMS & SCHEDULE",
        body: "Standard residential payment schedule: (a) 50% deposit upon agreement / material scheduling, (b) 50% final balance upon substantial completion and final quality walkthrough. For approved financing, lender terms apply.",
      },
      {
        title: "4. LIMITED WORKMANSHIP WARRANTY",
        body: "Contractor warrants all workmanship for a period of 5 years from completion date against defects in installation. Manufacturer shingle warranties are separate and provided directly by the manufacturer (TAMKO Building Products).",
      },
      {
        title: "5. RIGHT OF RESCISSION (3-DAY RIGHT TO CANCEL)",
        body: "Homeowner may cancel this transaction at any time prior to midnight of the third business day after the date of this transaction by providing written notice to Contractor.",
      },
    ]
  },

  contingency: {
    id: "jtf_contingency_aic_v1",
    title: "JTF Contingency Agreement & Work Authorization",
    docType: "contingency",
    counselApproved: true,
    jurisdiction: "State of Georgia & Alabama",
    clauses: [
      {
        title: "1. CONTINGENT UPON INSURANCE APPROVAL",
        body: "This agreement is 100% contingent upon insurance carrier approval of full roof replacement/restoration at no out-of-pocket cost to the Homeowner other than the insurance deductible.",
      },
      {
        title: "2. SCOPE & AUTHORIZATION",
        body: "Homeowner authorizes JTF Home Group LLC to inspect storm damage, prepare detailed repair estimates, meet with the insurance adjuster, and perform all approved restoration work per insurance scope of loss.",
      },
      {
        title: "3. NO FINANCIAL OBLIGATION IF DENIED",
        body: "If the insurance company does not approve coverage for the repairs, this agreement becomes completely null and void with ZERO financial obligation to the Homeowner.",
      },
    ]
  }
};

export function generateLegalDocumentText({ deal, operator, docType = "contract" }) {
  const tpl = JTF_LEGAL_TEMPLATES[docType] || JTF_LEGAL_TEMPLATES.contract;
  const isRetail = deal.dealType === "retail";
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  let text = `========================================================================\n`;
  text += `                     JTF HOME GROUP LLC\n`;
  text += `                ${tpl.title.toUpperCase()}\n`;
  text += `========================================================================\n\n`;
  text += `DATE: ${dateStr}\n`;
  text += `DOCUMENT ID: JTF-DOC-${Date.now().toString(36).toUpperCase()}\n`;
  text += `EXECUTIVE REPRESENTATIVE: ${operator.name} (${operator.title})\n`;
  text += `REPRESENTATIVE EMAIL: ${operator.email}\n\n`;

  text += `CUSTOMER / PROPERTY OWNER:\n`;
  text += `  Name:    ${deal.customerName || "Homeowner"}\n`;
  text += `  Address: ${deal.address}\n`;
  text += `  Phone:   ${deal.customerPhone || "On File"}\n`;
  text += `  Email:   ${deal.customerEmail || "On File"}\n\n`;

  text += `PROJECT SPECIFICATIONS & SCOPE:\n`;
  text += `  Package / Scope: ${deal.selectedPackage?.name || "Roof Replacement"}\n`;
  text += `  Measured Area:   ${deal.measurements?.squares || "28.5"} Squares (${deal.measurements?.pitch || 6}/12 Pitch)\n`;
  text += `  Classification:  ${isRetail ? "Retail Installation" : "Insurance Restoration"}\n`;

  if (deal.lineItems && deal.lineItems.length > 0) {
    text += `\nINCLUDED ADD-ONS & TRADE ITEMS:\n`;
    deal.lineItems.forEach((it) => {
      text += `  • ${it.label}: $${it.amount.toLocaleString()}\n`;
    });
  }

  text += `\nFINANCIAL SUMMARY:\n`;
  text += `  Base Scope Amount:     $${(deal.baseTotal || 0).toLocaleString()}\n`;
  if (deal.addOnsTotal > 0) {
    text += `  Add-ons & Upgrades:    +$${deal.addOnsTotal.toLocaleString()}\n`;
  }
  if (deal.discountAmount > 0) {
    text += `  In-Home Discount:      -$${deal.discountAmount.toLocaleString()} (${deal.discountPct}%)\n`;
  }
  text += `  --------------------------------------------------------\n`;
  text += `  TOTAL CONTRACT VALUE:  $${(deal.grandTotal || 0).toLocaleString()} USD\n\n`;

  text += `TERMS & LEGAL CONDITIONS:\n`;
  tpl.clauses.forEach((c) => {
    text += `\n${c.title}\n${c.body}\n`;
  });

  return text;
}
