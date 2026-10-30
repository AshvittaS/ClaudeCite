import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Download, FileText, CheckCircle } from 'lucide-react';

export interface LegalTemplateData {
  id: string;
  title: string;
  category: string;
  rating: string;
  downloads: string;
  description: string;
  contentGenerator: (data: Record<string, string>) => string;
  fields: { key: string; label: string; placeholder: string; defaultValue: string }[];
}

export const LEGAL_TEMPLATES: Record<string, LegalTemplateData> = {
  immigration: {
    id: 'immigration',
    title: 'Immigration Support Letter Template',
    category: 'Letters and Notices Templates',
    rating: '4.8',
    downloads: '4,091 Downloads',
    description: 'Character reference and official declaration of support for immigration applications.',
    fields: [
      { key: 'applicantName', label: 'Applicant Full Name', placeholder: 'e.g. Maria Gonzalez', defaultValue: 'Maria Gonzalez' },
      { key: 'supporterName', label: 'Supporter Full Name', placeholder: 'e.g. Dr. Arthur Vance', defaultValue: 'Dr. Arthur Vance' },
      { key: 'relationship', label: 'Relationship to Applicant', placeholder: 'e.g. Professional Mentor / Employer', defaultValue: 'Senior Research Supervisor' },
      { key: 'yearsKnown', label: 'Years Known', placeholder: 'e.g. 5 years', defaultValue: '5 years' },
      { key: 'countryOfOrigin', label: 'Applicant Origin Country', placeholder: 'e.g. Spain', defaultValue: 'Spain' },
    ],
    contentGenerator: (data) => `AFFIDAVIT / LETTER OF SUPPORT FOR IMMIGRATION

TO WHOM IT MAY CONCERN:
UNITED STATES CITIZENSHIP AND IMMIGRATION SERVICES (USCIS)

RE: Formal Character Reference and Declaration of Support for ${data.applicantName || '[APPLICANT NAME]'}

Dear Adjudicating Officer,

I, ${data.supporterName || '[SUPPORTER NAME]'}, hereby submit this sworn declaration in enthusiastic and unqualified support of the petition filed by ${data.applicantName || '[APPLICANT NAME]'}.

I have personally known ${data.applicantName || 'the applicant'} for over ${data.yearsKnown || 'several years'} in my capacity as their ${data.relationship || 'colleague/mentor'}. During this time, I have had extensive opportunities to observe their exemplary moral character, unwavering civic integrity, and profound contributions to our professional and local community.

${data.applicantName || 'The applicant'}, originally hailing from ${data.countryOfOrigin || '[COUNTRY]'}, has consistently demonstrated respect for our laws, deep dedication to public service, and the utmost professional competence. They possess strong family values and reliable financial independence.

I declare under penalty of perjury under the laws of the United States of America that the foregoing is true and correct.

Respectfully submitted,

____________________________________________
${data.supporterName || '[SUPPORTER NAME]'}
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Notary Attestation: [SEAL]`,
  },

  rental: {
    id: 'rental',
    title: 'Car Rental Agreement Template',
    category: 'Lease Agreement',
    rating: '4.9',
    downloads: '4,304 Downloads',
    description: 'Rental rules, fees, insurance coverage, and vehicle damage liabilities.',
    fields: [
      { key: 'ownerName', label: 'Lessor / Owner Name', placeholder: 'e.g. Apex Fleet Mobility LLC', defaultValue: 'Apex Fleet Mobility LLC' },
      { key: 'renterName', label: 'Renter / Lessee Name', placeholder: 'e.g. Jonathan Taylor', defaultValue: 'Jonathan Taylor' },
      { key: 'vehicleModel', label: 'Vehicle Make & Model', placeholder: 'e.g. 2025 Tesla Model Y Long Range', defaultValue: '2025 Tesla Model Y Long Range' },
      { key: 'dailyRate', label: 'Daily Rate ($)', placeholder: 'e.g. 89.00', defaultValue: '89.00' },
      { key: 'securityDeposit', label: 'Security Deposit ($)', placeholder: 'e.g. 500.00', defaultValue: '500.00' },
    ],
    contentGenerator: (data) => `STANDARD MOTOR VEHICLE RENTAL AGREEMENT

THIS AGREEMENT is entered into on this ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, by and between:

LESSOR: ${data.ownerName || '[LESSOR NAME]'} ("Owner")
AND
LESSEE: ${data.renterName || '[LESSEE NAME]'} ("Renter")

1. VEHICLE DESCRIPTION:
Owner hereby rents to Renter the following motor vehicle: ${data.vehicleModel || '[VEHICLE MAKE/MODEL]'}, subject to all terms and conditions set forth herein.

2. RENTAL PERIOD & RATES:
Renter shall pay Owner the agreed daily rate of $${data.dailyRate || '0.00'} USD per twenty-four (24) hour period. Total security deposit of $${data.securityDeposit || '0.00'} USD is held against damages, fuel, or municipal violations.

3. OPERATION & INSURANCE:
Renter warrants that they possess a valid driver’s license and valid comprehensive automobile insurance policy. Renter agrees that vehicle shall NOT be operated under the influence of narcotics or for commercial ridesharing without endorsement.

4. INDEMNIFICATION & LIABILITY:
Renter shall defend, indemnify, and hold harmless Owner from all claims, fines, impound costs, and liabilities arising out of Renter’s possession and operation.

IN WITNESS WHEREOF, the parties have executed this Agreement:

Lessor: ___________________________    Date: ____________
Lessee: ___________________________    Date: ____________`,
  },

  loi: {
    id: 'loi',
    title: 'Letter of Intent (LOI) Template',
    category: 'Letters and Notices Templates',
    rating: '4.9',
    downloads: '5,307 Downloads',
    description: 'Terms, exclusivity timeline, mutual commitments, and next steps for transaction closing.',
    fields: [
      { key: 'buyerName', label: 'Prospective Buyer / Partner', placeholder: 'e.g. Horizon Ventures Group', defaultValue: 'Horizon Ventures Group' },
      { key: 'sellerName', label: 'Target / Seller Name', placeholder: 'e.g. CloudTech Systems Inc.', defaultValue: 'CloudTech Systems Inc.' },
      { key: 'dealValue', label: 'Proposed Purchase Price ($)', placeholder: 'e.g. 4,500,000', defaultValue: '4,500,000' },
      { key: 'exclusivityDays', label: 'Exclusivity Period (Days)', placeholder: 'e.g. 45', defaultValue: '45' },
    ],
    contentGenerator: (data) => `CONFIDENTIAL NON-BINDING LETTER OF INTENT (LOI)

Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

To: ${data.sellerName || '[SELLER ENTITY]'}
From: ${data.buyerName || '[BUYER ENTITY]'}

RE: Proposed Acquisition of Assets / Equity

Dear Executive Team,

This Letter of Intent ("LOI") sets forth the principal commercial terms under which ${data.buyerName || 'Buyer'} proposes to acquire 100% of the equity/assets of ${data.sellerName || 'Seller'}:

1. PURCHASE PRICE:
The aggregate indicative purchase price shall be approximately $${data.dealValue || '0'} USD, subject to customary working capital adjustments at closing.

2. EXCLUSIVITY & STANDSTILL:
Upon execution of this LOI, Seller agrees to grant Buyer an exclusive negotiation period of ${data.exclusivityDays || '30'} consecutive calendar days. During this exclusivity period, Seller shall not solicit, initiate, or engage in any discussions with any third party.

3. CONFIDENTIALITY & GOVERNING LAW:
The terms of this LOI and all due diligence materials shall remain strictly confidential. This LOI is non-binding except for Section 2 (Exclusivity), Section 3 (Confidentiality), and Section 4 (Governing Law), which shall be binding.

Agreed and Accepted:

Buyer: ____________________________
Seller: ____________________________`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FINANCIAL AGREEMENTS — India (Tamil Nadu)
  // ─────────────────────────────────────────────────────────────────────────

  'loan-lending': {
    id: 'loan-lending',
    title: 'Loan & Lending Agreement',
    category: 'Financial Agreements — India (Tamil Nadu)',
    rating: '4.9',
    downloads: '3,812 Downloads',
    description: 'Legally binding loan agreement compliant with Tamil Nadu Money Lenders Act 1957 and Indian Contract Act 1872.',
    fields: [
      { key: 'lenderName', label: 'Lender Full Name / Entity', placeholder: 'e.g. Rajan Financiers Pvt. Ltd.', defaultValue: 'Rajan Financiers Pvt. Ltd.' },
      { key: 'borrowerName', label: 'Borrower Full Name', placeholder: 'e.g. Arun Kumar S.', defaultValue: 'Arun Kumar S.' },
      { key: 'loanAmount', label: 'Principal Loan Amount (₹)', placeholder: 'e.g. 5,00,000', defaultValue: '5,00,000' },
      { key: 'interestRate', label: 'Annual Interest Rate (%)', placeholder: 'e.g. 18', defaultValue: '18' },
      { key: 'loanTermMonths', label: 'Loan Term (Months)', placeholder: 'e.g. 24', defaultValue: '24' },
      { key: 'disbursementDate', label: 'Disbursement Date', placeholder: 'e.g. 01-11-2026', defaultValue: new Date().toLocaleDateString('en-IN') },
      { key: 'purposeOfLoan', label: 'Purpose of Loan', placeholder: 'e.g. Business working capital', defaultValue: 'Business working capital' },
      { key: 'collateral', label: 'Security / Collateral', placeholder: 'e.g. Unsecured / Property address', defaultValue: 'Unsecured' },
    ],
    contentGenerator: (data) => `LOAN & LENDING AGREEMENT
(Governed by Indian Contract Act 1872 & Tamil Nadu Money Lenders Act 1957)

Place of Execution: Chennai, Tamil Nadu
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

PARTIES:
LENDER:   ${data.lenderName || '[LENDER NAME]'}
BORROWER: ${data.borrowerName || '[BORROWER NAME]'}

WHEREAS, the Lender agrees to lend and the Borrower agrees to borrow the sum specified herein upon the following terms:

1. PRINCIPAL AMOUNT: ₹${data.loanAmount || '0'} (Rupees ${data.loanAmount || 'Zero'} Only)

2. INTEREST RATE: ${data.interestRate || '18'}% per annum, computed on reducing balance.
   Late Payment Penalty: 3% per month on overdue amounts.

3. LOAN TERM & REPAYMENT: ${data.loanTermMonths || '12'} months from disbursement date of ${data.disbursementDate || '[DATE]'}.
   Repayment in equal monthly EMIs via NACH/ECS mandate.

4. PURPOSE: ${data.purposeOfLoan || '[PURPOSE]'}

5. SECURITY / COLLATERAL: ${data.collateral || 'Unsecured'}

6. REPRESENTATIONS: Borrower warrants no prior default, full legal capacity, and compliance with applicable laws.

7. EVENTS OF DEFAULT: Non-payment of any instalment; insolvency; material misrepresentation.
   Upon default, entire outstanding principal and interest becomes immediately due.

8. GOVERNING LAW & JURISDICTION: Laws of India. Disputes subject to Madras High Court / District Courts, Tamil Nadu.

9. STAMP DUTY: Executed on appropriate non-judicial stamp paper as per Tamil Nadu Stamp Act 2023.

IN WITNESS WHEREOF:

Lender:    ______________________________    Date: __________
Borrower:  ____________________________    Date: __________
Witness 1: ___________________________
Witness 2: ___________________________

---
*DRAFT — Generated by ClauseCite AI. Requires attorney review before execution.*`,
  },

  'promissory-note': {
    id: 'promissory-note',
    title: 'Promissory Note & IOU',
    category: 'Financial Agreements — India (Tamil Nadu)',
    rating: '4.8',
    downloads: '2,940 Downloads',
    description: 'Negotiable instrument under Negotiable Instruments Act 1881. Valid for Tamil Nadu stamp duty compliance.',
    fields: [
      { key: 'makerName', label: 'Maker / Promisor Name', placeholder: 'e.g. Selvam R.', defaultValue: 'Selvam R.' },
      { key: 'payeeName', label: 'Payee Name', placeholder: 'e.g. Kavitha M.', defaultValue: 'Kavitha M.' },
      { key: 'principalAmount', label: 'Amount (₹)', placeholder: 'e.g. 50,000', defaultValue: '50,000' },
      { key: 'amountInWords', label: 'Amount in Words', placeholder: 'e.g. Fifty Thousand Rupees Only', defaultValue: 'Fifty Thousand Rupees Only' },
      { key: 'interestRate', label: 'Interest Rate (% p.a.)', placeholder: 'e.g. 18', defaultValue: '18' },
      { key: 'dueDate', label: 'Due Date', placeholder: 'e.g. 01-05-2027', defaultValue: '' },
      { key: 'place', label: 'Place (District, Tamil Nadu)', placeholder: 'e.g. Chennai, Tamil Nadu', defaultValue: 'Chennai, Tamil Nadu' },
      { key: 'reason', label: 'Reason / Consideration', placeholder: 'e.g. Value received in cash', defaultValue: 'Value received in cash' },
    ],
    contentGenerator: (data) => `PROMISSORY NOTE
(Under Section 4, Negotiable Instruments Act 1881)

₹${data.principalAmount || '0'}/-                    ${data.place || 'Chennai, Tamil Nadu'}
                                    Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

I, ${data.makerName || '[MAKER NAME]'}, hereby promise to pay to ${data.payeeName || '[PAYEE NAME]'} or order,
the sum of ₹${data.principalAmount || '0'} (${data.amountInWords || 'Rupees Zero Only'}),
together with interest at ${data.interestRate || '18'}% per annum from the date hereof,
on demand or on or before ${data.dueDate || '[DUE DATE]'}.

Consideration: ${data.reason || 'Value received'}

Executed on stamped paper as required under Tamil Nadu Stamp Act 2023.

Maker: ______________________________
Name:  ${data.makerName || '[MAKER NAME]'}
Address: ____________________________
PAN / Aadhaar: ______________________
Date: ${new Date().toLocaleDateString('en-IN')}

Witness 1: __________________________
Witness 2: __________________________

---
*DRAFT — Generated by ClauseCite AI. Requires attorney review before execution.*`,
  },

  'payment-plan': {
    id: 'payment-plan',
    title: 'Payment Plan & Instalment Agreement',
    category: 'Financial Agreements — India (Tamil Nadu)',
    rating: '4.7',
    downloads: '2,205 Downloads',
    description: 'Structured EMI repayment plan with default clauses and Tamil Nadu jurisdiction.',
    fields: [
      { key: 'creditorName', label: 'Creditor / Seller Name', placeholder: 'e.g. Sri Murugan Traders', defaultValue: 'Sri Murugan Traders' },
      { key: 'debtorName', label: 'Debtor / Buyer Name', placeholder: 'e.g. Priya Rajan', defaultValue: 'Priya Rajan' },
      { key: 'totalAmount', label: 'Total Amount Owed (₹)', placeholder: 'e.g. 1,20,000', defaultValue: '1,20,000' },
      { key: 'downPayment', label: 'Down Payment (₹)', placeholder: 'e.g. 20,000', defaultValue: '20,000' },
      { key: 'instalmentAmount', label: 'Instalment Amount (₹)', placeholder: 'e.g. 10,000', defaultValue: '10,000' },
      { key: 'numberOfInstalments', label: 'No. of Instalments', placeholder: 'e.g. 10', defaultValue: '10' },
      { key: 'firstPaymentDate', label: 'First Payment Date', placeholder: 'e.g. 01-12-2026', defaultValue: '' },
      { key: 'lateFee', label: 'Late Fee per Missed Payment (₹)', placeholder: 'e.g. 500', defaultValue: '500' },
    ],
    contentGenerator: (data) => `PAYMENT PLAN & INSTALMENT AGREEMENT
(Indian Contract Act 1872 | Tamil Nadu Jurisdiction)

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

CREDITOR: ${data.creditorName || '[CREDITOR NAME]'}
DEBTOR:   ${data.debtorName || '[DEBTOR NAME]'}

1. TOTAL OBLIGATION: ₹${data.totalAmount || '0'}

2. PAYMENT STRUCTURE:
   Down Payment:        ₹${data.downPayment || '0'} (due on signing)
   Monthly Instalment:  ₹${data.instalmentAmount || '0'} × ${data.numberOfInstalments || '0'} instalments
   First Instalment Due: ${data.firstPaymentDate || '[DATE]'}

3. LATE PAYMENT: ₹${data.lateFee || '500'} per missed instalment, payable within 3 days of due date.

4. DEFAULT: Failure to pay 2 consecutive instalments renders the entire outstanding balance immediately due and payable.

5. PAYMENT MODE: NEFT / RTGS / UPI. Receipt mandatory for each payment.

6. GOVERNING LAW: Laws of India. Jurisdiction: Civil Courts, Tamil Nadu.

Creditor: ____________________________    Date: __________
Debtor:   ______________________________    Date: __________
Witness:  _____________________________

---
*DRAFT — Generated by ClauseCite AI. Requires attorney review before execution.*`,
  },

  'revenue-profit-sharing': {
    id: 'revenue-profit-sharing',
    title: 'Revenue, Grant & Profit Sharing Agreement',
    category: 'Financial Agreements — India (Tamil Nadu)',
    rating: '4.8',
    downloads: '1,876 Downloads',
    description: 'Revenue split, grant disbursement conditions, audit rights, and GST treatment under Tamil Nadu law.',
    fields: [
      { key: 'partyAName', label: 'Party A (Grantor / Revenue Sharer)', placeholder: 'e.g. Technopark Ventures LLP', defaultValue: 'Technopark Ventures LLP' },
      { key: 'partyBName', label: 'Party B (Revenue Recipient)', placeholder: 'e.g. Innovate Tamil Nadu Pvt. Ltd.', defaultValue: 'Innovate Tamil Nadu Pvt. Ltd.' },
      { key: 'revenueSource', label: 'Revenue Source / Project Name', placeholder: 'e.g. SaaS Platform Revenue', defaultValue: 'SaaS Platform Revenue' },
      { key: 'partyASharePct', label: "Party A's Share (%)", placeholder: 'e.g. 60', defaultValue: '60' },
      { key: 'partyBSharePct', label: "Party B's Share (%)", placeholder: 'e.g. 40', defaultValue: '40' },
      { key: 'grantAmount', label: 'Grant Amount (₹, if any)', placeholder: 'e.g. 10,00,000', defaultValue: '0' },
      { key: 'settlementPeriod', label: 'Settlement Period', placeholder: 'e.g. Quarterly', defaultValue: 'Quarterly' },
      { key: 'termYears', label: 'Agreement Term (Years)', placeholder: 'e.g. 3', defaultValue: '3' },
    ],
    contentGenerator: (data) => `REVENUE, GRANT & PROFIT SHARING AGREEMENT
(Indian Contract Act 1872 | CGST/SGST Act 2017 | Tamil Nadu Jurisdiction)

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

PARTY A: ${data.partyAName || '[PARTY A]'}
PARTY B: ${data.partyBName || '[PARTY B]'}
PROJECT / REVENUE SOURCE: ${data.revenueSource || '[PROJECT]'}

1. REVENUE SHARING RATIO:
   Party A: ${data.partyASharePct || '60'}% of Net Revenue
   Party B: ${data.partyBSharePct || '40'}% of Net Revenue
   "Net Revenue" = Gross receipts less direct operating costs and applicable taxes.

2. GRANT: ${data.grantAmount && data.grantAmount !== '0' ? `₹${data.grantAmount} disbursed upon achievement of agreed milestones.` : 'No grant component applicable.'}

3. SETTLEMENT: ${data.settlementPeriod || 'Quarterly'} within 15 days of period end. Audited statements within 30 days.

4. AUDIT RIGHTS: Either party may audit the other's books with 7 days prior written notice.

5. GST TREATMENT: Each party independently responsible for GST under CGST/SGST Act 2017. TDS per Income Tax Act 1961 (Sec. 194H / 194J).

6. TERM: ${data.termYears || '3'} years from Effective Date, renewable by mutual written consent.

7. GOVERNING LAW: Laws of India. Jurisdiction: Madras High Court / District Courts, Tamil Nadu.

Party A: ____________________________    Date: __________
Party B: ____________________________    Date: __________
Witness: ____________________________

---
*DRAFT — Generated by ClauseCite AI. Requires attorney review before execution.*`,
  },

  'debt-settlement': {
    id: 'debt-settlement',
    title: 'Debt Settlement & Credit Agreement',
    category: 'Financial Agreements — India (Tamil Nadu)',
    rating: '4.8',
    downloads: '2,114 Downloads',
    description: 'Full & final settlement of outstanding debts with discharge clause and new credit terms under Tamil Nadu law.',
    fields: [
      { key: 'creditorName', label: 'Creditor Name', placeholder: 'e.g. Lakshmi Finance Ltd.', defaultValue: 'Lakshmi Finance Ltd.' },
      { key: 'debtorName', label: 'Debtor Name', placeholder: 'e.g. Murugesan V.', defaultValue: 'Murugesan V.' },
      { key: 'originalDebtAmount', label: 'Original Debt Amount (₹)', placeholder: 'e.g. 2,00,000', defaultValue: '2,00,000' },
      { key: 'settlementAmount', label: 'Settlement Amount (₹)', placeholder: 'e.g. 1,50,000', defaultValue: '1,50,000' },
      { key: 'settlementDeadline', label: 'Settlement Deadline', placeholder: 'e.g. 30-11-2026', defaultValue: '' },
      { key: 'debtDescription', label: 'Nature of Original Debt', placeholder: 'e.g. Business loan dated 01-01-2025', defaultValue: 'Business loan' },
      { key: 'paymentMode', label: 'Payment Mode', placeholder: 'e.g. Lump sum', defaultValue: 'Lump sum' },
      { key: 'creditLimit', label: 'New Credit Limit (₹, if any)', placeholder: 'e.g. 50,000 or 0', defaultValue: '0' },
    ],
    contentGenerator: (data) => `DEBT SETTLEMENT & CREDIT AGREEMENT
(Indian Contract Act 1872 | Tamil Nadu Jurisdiction)

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

CREDITOR: ${data.creditorName || '[CREDITOR NAME]'}
DEBTOR:   ${data.debtorName || '[DEBTOR NAME]'}

WHEREAS the Debtor owes the Creditor ₹${data.originalDebtAmount || '0'} on account of ${data.debtDescription || 'outstanding debt'};

1. SETTLEMENT AMOUNT: ₹${data.settlementAmount || '0'} (Full & Final)

2. PAYMENT MODE: ${data.paymentMode || 'Lump sum'} by ${data.settlementDeadline || '[DATE]'} via NEFT/RTGS/Cheque.

3. FULL & FINAL DISCHARGE: Upon receipt of the settlement amount, the Creditor grants the Debtor complete and unconditional discharge from all claims arising from the original debt. No further action shall be maintainable.

4. NEW CREDIT TERMS: ${data.creditLimit && data.creditLimit !== '0' ? `Credit line of ₹${data.creditLimit} extended at Net 30 days from invoice date.` : 'No new credit extended.'}

5. BREACH: Failure to pay settlement amount by the deadline reinstates the original debt in full with interest and legal costs.

6. GOVERNING LAW: Laws of India. Jurisdiction: Civil Courts, Tamil Nadu.

Creditor: ____________________________    Date: __________
Debtor:   ______________________________    Date: __________
Witness:  _____________________________

---
*DRAFT — Generated by ClauseCite AI. Requires attorney review before execution.*`,
  },

  'guarantee-guarantor': {
    id: 'guarantee-guarantor',
    title: 'Guarantee & Guarantor Agreement',
    category: 'Financial Agreements — India (Tamil Nadu)',
    rating: '4.9',
    downloads: '1,653 Downloads',
    description: 'Continuing / specific guarantee under Sections 126–147 of the Indian Contract Act 1872, Tamil Nadu jurisdiction.',
    fields: [
      { key: 'guarantorName', label: 'Guarantor Full Name', placeholder: 'e.g. Sundar K.', defaultValue: 'Sundar K.' },
      { key: 'guarantorIdProof', label: "Guarantor's Aadhaar / PAN", placeholder: 'e.g. ABCDE1234F', defaultValue: 'ABCDE1234F' },
      { key: 'principalDebtorName', label: 'Principal Debtor Name', placeholder: 'e.g. Marimuthu Enterprises', defaultValue: 'Marimuthu Enterprises' },
      { key: 'creditorName', label: 'Creditor / Lender Name', placeholder: 'e.g. Tamil Nadu Industrial Finance Corp.', defaultValue: 'Tamil Nadu Industrial Finance Corp.' },
      { key: 'guaranteedAmount', label: 'Maximum Guaranteed Amount (₹)', placeholder: 'e.g. 10,00,000', defaultValue: '10,00,000' },
      { key: 'guaranteeType', label: 'Type of Guarantee', placeholder: 'e.g. Continuing / Specific', defaultValue: 'Continuing Guarantee' },
      { key: 'underlyingObligation', label: 'Underlying Obligation', placeholder: 'e.g. Term loan dated 01-11-2026', defaultValue: 'Term loan agreement' },
      { key: 'demandNoticeDays', label: 'Notice Days Before Demand on Guarantor', placeholder: 'e.g. 7', defaultValue: '7' },
    ],
    contentGenerator: (data) => `GUARANTEE & GUARANTOR AGREEMENT
(Indian Contract Act 1872, Sections 126–147 | Tamil Nadu Jurisdiction)

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

GUARANTOR:        ${data.guarantorName || '[GUARANTOR NAME]'} (ID: ${data.guarantorIdProof || '[ID]'})
PRINCIPAL DEBTOR: ${data.principalDebtorName || '[DEBTOR NAME]'}
CREDITOR:         ${data.creditorName || '[CREDITOR NAME]'}

1. GUARANTEE: The Guarantor unconditionally guarantees to the Creditor the due payment and performance by the Principal Debtor of all obligations under: ${data.underlyingObligation || '[UNDERLYING OBLIGATION]'}.

2. TYPE: ${data.guaranteeType || 'Continuing Guarantee'} — covering obligations up to ₹${data.guaranteedAmount || '0'}.

3. DEMAND: Creditor may demand payment from Guarantor upon ${data.demandNoticeDays || '7'} days written notice of Principal Debtor's default.

4. CO-EXTENSIVE LIABILITY: Guarantor's liability is co-extensive with the Principal Debtor (Section 128 ICA 1872).

5. SUBROGATION: Upon payment, Guarantor is subrogated to all Creditor rights against the Debtor (Section 140 ICA).

6. CONTINUING: This Guarantee remains in force until full repayment of all guaranteed obligations.

7. GOVERNING LAW: Laws of India. Jurisdiction: Madras High Court / District Courts, Tamil Nadu.

Guarantor:  ___________________________    Date: __________
Creditor:   ____________________________    Date: __________
Witness 1:  ___________________________
Witness 2:  ___________________________

---
*DRAFT — Generated by ClauseCite AI. Requires attorney review before execution.*`,
  },

  'ach-payment-authorization': {
    id: 'ach-payment-authorization',
    title: 'ACH & Payment Authorization Form',
    category: 'Financial Agreements — India (Tamil Nadu)',
    rating: '4.7',
    downloads: '1,988 Downloads',
    description: 'NACH/ECS bank mandate authorization compliant with RBI circulars for recurring debits in Tamil Nadu.',
    fields: [
      { key: 'accountHolderName', label: 'Account Holder Full Name', placeholder: 'e.g. Deepa Subramaniam', defaultValue: 'Deepa Subramaniam' },
      { key: 'authorizingEntity', label: 'Merchant / Authorizing Entity', placeholder: 'e.g. ClauseCite Financial Services', defaultValue: 'ClauseCite Financial Services' },
      { key: 'bankName', label: 'Bank Name', placeholder: 'e.g. Indian Bank', defaultValue: 'Indian Bank' },
      { key: 'ifscCode', label: 'IFSC Code & Branch', placeholder: 'e.g. IDIB000C062 — Anna Nagar, Chennai', defaultValue: 'IDIB000C062 — Anna Nagar, Chennai' },
      { key: 'accountNumber', label: 'Bank Account Number', placeholder: 'e.g. XXXXXXXXXXXX', defaultValue: '' },
      { key: 'accountType', label: 'Account Type', placeholder: 'Savings / Current', defaultValue: 'Savings' },
      { key: 'debitAmount', label: 'Authorized Debit Amount (₹)', placeholder: 'e.g. 5,000', defaultValue: '5,000' },
      { key: 'debitFrequency', label: 'Debit Frequency', placeholder: 'e.g. Monthly', defaultValue: 'Monthly' },
      { key: 'mandatePurpose', label: 'Purpose of Mandate', placeholder: 'e.g. Loan EMI repayment', defaultValue: 'Loan EMI repayment' },
    ],
    contentGenerator: (data) => `NACH / ECS PAYMENT AUTHORIZATION MANDATE
(As per RBI NACH Master Circular | NPCI NACH Guidelines)

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

I / We, ${data.accountHolderName || '[ACCOUNT HOLDER NAME]'}, hereby authorize ${data.authorizingEntity || '[ENTITY NAME]'} to debit my/our account as follows:

BANK DETAILS:
  Bank Name:      ${data.bankName || '[BANK NAME]'}
  Branch & IFSC:  ${data.ifscCode || '[IFSC]'}
  Account Number: ${data.accountNumber || '[ACCOUNT NO.]'}
  Account Type:   ${data.accountType || 'Savings'}

MANDATE DETAILS:
  Amount:     ₹${data.debitAmount || '0'} per ${data.debitFrequency || 'month'}
  Purpose:    ${data.mandatePurpose || '[PURPOSE]'}
  Frequency:  ${data.debitFrequency || 'Monthly'}
  Type:       NACH (National Automated Clearing House)

CONDITIONS:
1. Valid until cancelled with 30 days prior written notice.
2. Subject to sufficient funds on debit date.
3. Dishonour may attract charges under Section 138, Negotiable Instruments Act 1881.

Account Holder Signature: _______________    Date: __________
Name: ${data.accountHolderName || '[NAME]'}
UMRN (Bank Assigned): _______________________

---
*DRAFT — Generated by ClauseCite AI. Requires attorney review before execution.*`,
  },

  'escrow-collateral': {
    id: 'escrow-collateral',
    title: 'Escrow, Security & Collateral Agreement',
    category: 'Financial Agreements — India (Tamil Nadu)',
    rating: '4.9',
    downloads: '1,421 Downloads',
    description: 'Asset pledge, escrow deposit, and collateral security under SARFAESI Act 2002 and Tamil Nadu Registration Act.',
    fields: [
      { key: 'depositorName', label: 'Depositor / Pledgor Name', placeholder: 'e.g. Arumugam Constructions', defaultValue: 'Arumugam Constructions' },
      { key: 'beneficiaryName', label: 'Beneficiary / Pledgee', placeholder: 'e.g. Tamil Nadu Co-op Bank', defaultValue: 'Tamil Nadu Co-op Bank' },
      { key: 'escrowAgentName', label: 'Escrow Agent / Trustee', placeholder: 'e.g. Axis Trustee Services', defaultValue: 'Axis Trustee Services' },
      { key: 'escrowAmount', label: 'Escrow / Deposit Amount (₹)', placeholder: 'e.g. 25,00,000', defaultValue: '25,00,000' },
      { key: 'collateralDescription', label: 'Collateral Description', placeholder: 'e.g. Plot No. 42, Anna Nagar, Chennai — 2400 sq.ft.', defaultValue: 'Immovable property — Plot No. 42, Anna Nagar, Chennai' },
      { key: 'collateralValue', label: 'Market Value of Collateral (₹)', placeholder: 'e.g. 60,00,000', defaultValue: '60,00,000' },
      { key: 'releaseConditions', label: 'Escrow Release Conditions', placeholder: 'e.g. Upon full loan repayment', defaultValue: 'Upon full repayment of loan and all accrued interest' },
      { key: 'escrowTermMonths', label: 'Escrow Term (Months)', placeholder: 'e.g. 36', defaultValue: '36' },
    ],
    contentGenerator: (data) => `ESCROW, SECURITY & COLLATERAL AGREEMENT
(SARFAESI Act 2002 | Registration Act 1908 | Tamil Nadu Stamp Act 2023)

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

DEPOSITOR / PLEDGOR: ${data.depositorName || '[DEPOSITOR NAME]'}
BENEFICIARY / PLEDGEE: ${data.beneficiaryName || '[BENEFICIARY NAME]'}
ESCROW AGENT: ${data.escrowAgentName || '[ESCROW AGENT]'}

1. ESCROW DEPOSIT: ₹${data.escrowAmount || '0'} deposited into a designated separate escrow account held by the Escrow Agent.

2. COLLATERAL / SECURITY:
   Asset:         ${data.collateralDescription || '[COLLATERAL DESCRIPTION]'}
   Market Value:  ₹${data.collateralValue || '0'}
   The Depositor pledges / mortgages the above collateral in favour of the Beneficiary as security.

3. ESCROW TERM: ${data.escrowTermMonths || '12'} months from Effective Date.

4. RELEASE CONDITIONS: Escrow Fund and collateral released upon: ${data.releaseConditions || '[RELEASE CONDITIONS]'}

5. ENFORCEMENT: Upon default, Beneficiary may enforce under SARFAESI Act 2002 without court intervention. Escrow Agent releases funds on written default notice.

6. REGISTRATION: To be registered at Tamil Nadu Sub-Registrar's Office per Registration Act 1908.

7. GOVERNING LAW: Laws of India. Jurisdiction: Madras High Court / Tamil Nadu District Courts.

Depositor:    ____________________________    Date: __________
Beneficiary:  __________________________    Date: __________
Escrow Agent: _________________________    Date: __________
Witness 1:    ____________________________
Witness 2:    ____________________________

---
*DRAFT — Generated by ClauseCite AI. Requires attorney review before execution.*`,
  },

  'investment-equity': {
    id: 'investment-equity',
    title: 'Investment & Equity Agreement',
    category: 'Financial Agreements — India (Tamil Nadu)',
    rating: '4.9',
    downloads: '2,367 Downloads',
    description: 'Equity investment, CCPS/SAFE terms, anti-dilution, board rights, and FEMA/SEBI compliance for Tamil Nadu companies.',
    fields: [
      { key: 'investorName', label: 'Investor Name / Entity', placeholder: 'e.g. Chennai Angels Fund I', defaultValue: 'Chennai Angels Fund I' },
      { key: 'companyName', label: 'Investee Company Name', placeholder: 'e.g. TechStar Innovations Pvt. Ltd.', defaultValue: 'TechStar Innovations Pvt. Ltd.' },
      { key: 'companyCin', label: 'Company CIN', placeholder: 'e.g. U72900TN2020PTC123456', defaultValue: 'U72900TN2020PTC123456' },
      { key: 'investmentAmount', label: 'Investment Amount (₹)', placeholder: 'e.g. 50,00,000', defaultValue: '50,00,000' },
      { key: 'equityStakePct', label: 'Equity Stake (%)', placeholder: 'e.g. 15', defaultValue: '15' },
      { key: 'shareClass', label: 'Class of Shares', placeholder: 'e.g. CCPS / Equity Shares', defaultValue: 'Compulsorily Convertible Preference Shares (CCPS)' },
      { key: 'preMoneyValuation', label: 'Pre-Money Valuation (₹)', placeholder: 'e.g. 3,00,00,000', defaultValue: '3,00,00,000' },
      { key: 'lockInMonths', label: 'Lock-In Period (Months)', placeholder: 'e.g. 24', defaultValue: '24' },
    ],
    contentGenerator: (data) => `INVESTMENT & EQUITY SUBSCRIPTION AGREEMENT
(Companies Act 2013 | SEBI (ICDR) Regulations | FEMA 1999 | Tamil Nadu Jurisdiction)

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

INVESTOR: ${data.investorName || '[INVESTOR NAME]'}
COMPANY:  ${data.companyName || '[COMPANY NAME]'} | CIN: ${data.companyCin || '[CIN]'}
Registered Office: Tamil Nadu, India

1. INVESTMENT TERMS:
   Investment Amount:    ₹${data.investmentAmount || '0'}
   Instrument:          ${data.shareClass || 'CCPS'}
   Equity Stake (Post): ${data.equityStakePct || '0'}%
   Pre-Money Valuation: ₹${data.preMoneyValuation || '0'}

2. ANTI-DILUTION: Weighted-average broad-based anti-dilution protection applies in the event of a down-round.

3. BOARD RIGHTS: Investor entitled to one (1) Observer Seat on the Board of Directors.

4. LOCK-IN: Investor shares locked-in for ${data.lockInMonths || '24'} months from Effective Date. Exceptions: IPO, drag-along, approved secondary sale.

5. TAG-ALONG / DRAG-ALONG: Mutual rights applicable upon change of control or secondary sale.

6. INFORMATION RIGHTS: Quarterly audited financials, annual business plan, and book access within 7 days of request.

7. REGULATORY COMPLIANCE:
   - Companies Act 2013 (Sections 42 & 62) — private placement
   - FEMA 1999 & RBI FDI Regulations (if applicable)
   - ROC filings: Form PAS-3 / FC-GPR within prescribed timelines

8. GOVERNING LAW: Laws of India. Disputes under SIAC Arbitration, seat Chennai, Tamil Nadu.

Investor:          ____________________________    Date: __________
Company Director:  ___________________    Date: __________
Witness:           _____________________________

---
*DRAFT — Generated by ClauseCite AI. Requires attorney review before execution.*`,
  },
};

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateKey?: string;
}

export default function TemplateModal({ isOpen, onClose, templateKey = 'immigration' }: TemplateModalProps) {
  const template = LEGAL_TEMPLATES[templateKey] || LEGAL_TEMPLATES.immigration;
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    template.fields.forEach((f) => {
      initial[f.key] = f.defaultValue;
    });
    return initial;
  });

  const [copied, setCopied] = useState(false);

  const currentContent = template.contentGenerator(formData);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id}_template_clausecite.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">{template.title}</h3>
                <p className="text-xs text-gray-500">
                  {template.category} · ★ {template.rating} · {template.downloads}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: 2 Columns (Form Fields + Live Document Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
            {/* Left: Input Parameters (4 cols) */}
            <div className="lg:col-span-4 p-6 border-r border-gray-100 bg-gray-50/40 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Customization Fields
                </span>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  Live Update
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-normal">
                Fill in the details below to generate your tailored agreement ready for signature.
              </p>

              <div className="space-y-3 pt-2">
                {template.fields.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">{f.label}</label>
                    <input
                      type="text"
                      value={formData[f.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live Document Preview (8 cols) */}
            <div className="lg:col-span-8 p-6 overflow-y-auto bg-white flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Preview Formatted Legal Text
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">UTF-8 Encoded</span>
                </div>

                <pre className="font-mono text-xs text-gray-800 leading-relaxed bg-[#F8F9FA] p-5 rounded-2xl border border-gray-200 whitespace-pre-wrap select-all shadow-inner max-h-[480px] overflow-y-auto">
                  {currentContent}
                </pre>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 mt-4">
                <span className="text-[11px] text-gray-500">
                  Standard legal template licensed under CC BY-SA 4.0.
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#0066FF] hover:bg-blue-600 rounded-full transition shadow-md shadow-blue-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
