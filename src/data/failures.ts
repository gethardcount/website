// What can go wrong in billing, and what Hardcount does: the one source.
// The Engineering page shows each case in full; Home shows the title and
// the one-line short answer.
import { doc } from '../site';

export const failures = [
  {
    id: 'charged-twice',
    title: 'A customer was charged twice for one invoice.',
    short: 'Every charge carries one fixed key, so a resend is the same charge.',
    body: 'Every charge carries one fixed key, so if Hardcount sends it again, Stripe treats it as the same charge. Only one charge runs for an invoice at a time.',
    partly: 'If Stripe’s answer is lost before it names the payment, Hardcount tries again a day later. If Stripe finishes the first charge after that, the customer pays twice, and Hardcount flags it for you to refund.',
    link: { label: 'How card payments are handled', href: doc('payments.md') },
  },
  {
    id: 'paid-but-failed',
    title: 'Stripe took the money, but our system says the payment failed.',
    short: 'An unclear answer is marked “unknown”, and nothing is charged until Stripe is checked.',
    body: 'When Stripe’s answer is unclear, Hardcount marks the payment “unknown”, not “failed”, and charges nothing more until it has checked with Stripe.',
    partly: 'If the answer is lost before it names the payment, the invoice waits a day before the next try, even if the charge never reached Stripe.',
    link: { label: 'How card payments are handled', href: doc('payments.md') },
  },
  {
    id: 'billed-twice',
    title: 'The billing job ran twice and sent two invoices.',
    short: 'A billing period can be closed only once; the database refuses a second invoice.',
    body: 'Each billing period can be closed only once, so a second run finds it closed and stops. The database also refuses a duplicate invoice for the same period.',
    partly: null,
    link: { label: 'The design record', href: '/docs/internals/decisions/115-one-closer-for-the-billing-period/' },
  },
];
