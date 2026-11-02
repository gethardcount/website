// What can go wrong in billing, and what Hardcount does: the one source.
// The Reliability page shows each case in full, with the rare case still
// left; Home shows the title and the one-line short answer.
import { doc } from '../site';

export const failures = [
  {
    id: 'charged-twice',
    title: 'A customer was charged twice for one invoice.',
    short: 'Each charge attempt carries a fixed ID (an idempotency key), so if it is sent again, Stripe treats it as the same charge, not a new one.',
    body: 'Each charge attempt carries a fixed ID (an idempotency key), so if Hardcount resends that attempt, Stripe treats it as the same charge. Only one charge runs for an invoice at a time.',
    left: 'When Stripe’s answer is lost, Hardcount looks for the payment at Stripe and charges again only when it finds none. If Stripe finishes the first charge after that, as can happen during an outage at Stripe, the customer pays twice. Hardcount spots the second payment and flags it for you to refund.',
    link: { label: 'How card payments are handled', href: doc('payments.md') },
  },
  {
    id: 'paid-but-failed',
    title: 'Stripe took the money, but our system says the payment failed.',
    short: 'When Stripe’s answer is unclear, the payment is marked “unknown”, not “failed”, and nothing more is charged until Hardcount has checked with Stripe.',
    body: 'When Stripe’s answer is unclear, Hardcount marks the payment “unknown”, not “failed”, and charges nothing more until it has checked with Stripe.',
    left: 'If the connection drops before the charge reaches Stripe, Hardcount can’t tell that from a charge Stripe is still working on, so it waits a day before charging again. The cost is a day’s wait for the payment, not a wrong charge.',
    link: { label: 'How card payments are handled', href: doc('payments.md') },
  },
  {
    id: 'billed-twice',
    title: 'The billing job ran twice and sent two invoices.',
    short: 'A billing period can be closed only once; the database refuses a second invoice.',
    body: 'Each billing period can be closed only once, so a second run finds it closed and stops. The database also refuses a duplicate invoice for the same period.',
    left: null,
    link: { label: 'The design record', href: '/docs/internals/decisions/115-one-closer-for-the-billing-period/' },
  },
];
