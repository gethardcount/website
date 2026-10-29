// The docs structure, defined once: every page, its section, its URL and its
// order. Source files are paths in the gethardcount/hardcount repo. A page
// with `planned` is not written yet; the sync script renders its outline.
// Built from velox-ops marketing/site-structure-2026-10-29.md §5.

export const sections = [
  {
    label: 'Get started',
    items: [
      { src: 'docs/how-hardcount-works.md', slug: 'get-started/how-hardcount-works' },
      { src: 'docs/quick-start.md', slug: 'get-started/quick-start' },
      { src: 'docs/first-invoice.md', slug: 'get-started/first-invoice' },
    ],
  },
  {
    label: 'Concepts',
    items: [
      {
        slug: 'concepts/data-model',
        planned: {
          title: 'The data model',
          intro: 'How customers, subscriptions, plans, prices, meters, usage events, invoices, credits and payments connect, in one diagram.',
          sections: ['One diagram of the objects and the field each one points through', 'One line per object: what it is and who creates it', 'Which objects you create, and which Hardcount creates for you'],
          from: ['New page'],
        },
      },
      {
        slug: 'concepts/usage-events',
        planned: {
          title: 'Usage events',
          intro: 'What a usage event is, how Hardcount counts it once, and what happens to usage that arrives late.',
          sections: ['The event: customer, meter, quantity, labels (dimensions), time', 'Safe retries: the idempotency key and how long it is remembered', 'Late usage: the grace period, and usage after an invoice is made', 'Worked example: three events in, one quantity out'],
          from: ['docs/api-surface.md: "Sending usage safely", "Late usage"', 'docs/ops/runbook/invoice-timing-late-usage.md'],
        },
      },
      {
        slug: 'concepts/meters-and-prices',
        planned: {
          title: 'Meters and prices',
          intro: 'How a meter counts usage and how a plan\'s prices turn the count into money.',
          sections: ['Meters and their one aggregation', 'Price shapes: per unit, tiers, packages', 'One meter, a price per model and token type (labels)', 'Base fee; billing in advance or after the period', 'Worked example: tokens in, line items and total out'],
          from: ['docs/ai-pricing.md', 'docs/api-surface.md'],
        },
      },
      {
        slug: 'concepts/subscriptions',
        planned: {
          title: 'Subscriptions',
          intro: 'How a subscription puts a customer on a plan, and what happens when it changes.',
          sections: ['Status table: each status, what it means, what you do', 'Transitions table: from, API call or job, webhook, to', 'Billing periods and the anchor day (Jan 31 → Feb 28 → Mar 31)', 'Plan changes, with a worked proration', 'Cancel and pause'],
          from: ['New page (facts from the code and design records)'],
        },
      },
      {
        slug: 'concepts/invoices',
        planned: {
          title: 'Invoices',
          intro: 'When Hardcount makes an invoice, how it calculates the total, and how the invoice moves from draft to paid.',
          sections: ['Status and transitions tables: draft → finalized → paid / void / uncollectible', 'When invoices are made: period end, the grace period, the hourly run', 'The calculation order, with worked sums: usage → price → credits → tax → total', 'PDF, hosted invoice page, credit notes', 'Webhooks sent at each step'],
          from: ['New page', 'docs/how-hardcount-works.md steps 4-5'],
        },
      },
      {
        slug: 'concepts/credits',
        planned: {
          title: 'Credits',
          intro: 'How prepaid credit is granted, used and expired, and the order in which credits pay an invoice.',
          sections: ['The credit ledger: grants, usage, expiry, adjustments', 'Prepaid commits', 'The order credits are used (numbered)', 'The live balance your app can check', 'Worked example: $10,000 of credit, one month of usage'],
          from: ['docs/ai-pricing.md: prepaid credit'],
        },
      },
      { src: 'docs/payments.md', slug: 'concepts/payments-and-retries' },
      { src: 'docs/ops/tax-calculation.md', slug: 'concepts/tax' },
      {
        slug: 'concepts/test-clocks',
        planned: {
          title: 'Test clocks',
          intro: 'Move a test customer through time and see invoices, payments and retries happen in seconds.',
          sections: ['What a test clock is and what it moves', 'A dated walkthrough: subscribe Jan 1, advance to Feb 1, the invoice', 'Limits'],
          from: ['docs/api-surface.md', 'New page'],
        },
      },
      {
        slug: 'concepts/margin',
        planned: {
          title: 'Margin',
          intro: 'What each customer\'s usage cost you, next to what you billed for it.',
          sections: ['Provider costs: your own price table or LiteLLM\'s reported cost', 'Margin per customer and per model', 'Worked example from the demo: 51.9%', 'What margin leaves out (base fees, credits, tax)'],
          from: ['docs/ai-pricing.md: margin'],
        },
      },
    ],
  },
  {
    label: 'Guides',
    items: [
      {
        slug: 'guides/bill-for-ai-tokens',
        planned: {
          title: 'Bill for AI tokens by model',
          intro: 'Price input, output and cached tokens per model, from a ready-made price list or your own.',
          sections: ['The ready-made prices: Anthropic, OpenAI, Replicate (one call)', 'Your own model', 'Mapping provider token counts (cached tokens) to events', 'The invoice it makes'],
          from: ['docs/ai-pricing.md', 'internal/recipe/recipes/'],
        },
      },
      { src: 'docs/stop-usage-when-credit-runs-out.md', slug: 'guides/stop-usage-when-credit-runs-out' },
      { src: 'docs/integrations/litellm.md', slug: 'guides/litellm' },
      {
        slug: 'guides/receive-webhooks',
        planned: {
          title: 'Receive webhooks',
          intro: 'Add an endpoint, check each webhook\'s signature, and handle a resend safely.',
          sections: ['Add an endpoint', 'Verify the signature (with code)', 'Retries, and skipping an ID you already handled', 'Test it locally'],
          from: ['docs/webhooks.md'],
        },
      },
      {
        slug: 'guides/connect-stripe',
        planned: {
          title: 'Connect Stripe and take card payments',
          intro: 'Connect your Stripe account so Hardcount can charge saved cards.',
          sections: ['Keys and the webhook', 'Save a customer\'s card', 'The first charge, and what you see'],
          from: ['docs/production-one-vm.md: Stripe'],
        },
      },
      {
        slug: 'guides/test-a-billing-change',
        planned: {
          title: 'Test a billing change with a test clock',
          intro: 'Try a new price or plan on a test customer and see next month\'s invoice before any real customer does.',
          sections: ['Create a test customer on a clock', 'Change the price', 'Advance the clock, read the invoice'],
          from: ['New page'],
        },
      },
      { src: 'docs/ops/email-setup.md', slug: 'guides/email-setup' },
      { src: 'docs/api-keys.md', slug: 'guides/api-keys' },
    ],
  },
  {
    label: 'API reference',
    items: [
      { planned: { title: 'Authentication and keys', intro: 'How to send your API key, and test versus live keys.', sections: ['The Bearer header', 'Key types', 'Test and live mode'], from: ['docs/api-surface.md', 'docs/api-keys.md'] }, slug: 'api/authentication' },
      { planned: { title: 'Errors', intro: 'Every error code, what it means, and what to do.', sections: ['The error body', 'Status codes', 'Error codes'], from: ['docs/api-surface.md: Errors'] }, slug: 'api/errors' },
      { planned: { title: 'Idempotency', intro: 'Retry any request safely.', sections: ['Usage events: the idempotency key', 'Other writes', 'How long keys are kept'], from: ['docs/api-surface.md: Sending usage safely'] }, slug: 'api/idempotency' },
      { planned: { title: 'Pagination', intro: 'How list endpoints return pages.', sections: ['Cursors', 'Which endpoints page, and the limits'], from: ['New page (checked in code)'] }, slug: 'api/pagination' },
      { src: 'docs/versioning.md', slug: 'api/versioning' },
      { planned: { title: 'Rate limits', intro: 'How many requests you can send.', sections: ['General and ingest limits', 'What a 429 looks like', 'Changing the limits'], from: ['docs/settings.md'] }, slug: 'api/rate-limits' },
      { planned: { title: 'Timing and limits', intro: 'Every time window and size limit, as a number.', sections: ['Invoice grace period', 'Idempotency windows', 'Stripe\'s 24-hour window', 'Retry schedules', 'Request size'], from: ['New page (checked in code)'] }, slug: 'api/timing-and-limits' },
      { objects: true, label: 'Objects' },
      { openapi: true, label: 'Endpoints' },
      { planned: { title: 'Webhook events', intro: 'Every event Hardcount sends: when, and what it contains.', sections: ['The catalog: name, when it is sent, example payload'], from: ['docs/webhooks.md: catalog (kept true by internal/domain/webhook_catalog_test.go)'] }, slug: 'api/webhook-events' },
    ],
  },
  {
    label: 'Self-host',
    items: [
      { src: 'docs/self-host.md', slug: 'self-host/overview' },
      { src: 'docs/production-one-vm.md', slug: 'self-host/production-one-vm' },
      { src: 'docs/ops/high-availability.md', slug: 'self-host/high-availability' },
      { src: 'docs/settings.md', slug: 'self-host/settings' },
      { src: 'docs/ops/postgres-requirements.md', slug: 'self-host/postgres' },
      { src: 'docs/ops/backup-considerations.md', slug: 'self-host/backups' },
      { planned: { title: 'Upgrades', intro: 'How to move to a new release.', sections: ['Before you upgrade', 'One VM', 'Two or more copies', 'Going back'], from: ['docs/self-host.md', 'docs/production-one-vm.md'] }, slug: 'self-host/upgrades' },
      { src: 'docs/scale.md', slug: 'self-host/scale' },
      { src: 'docs/ops/runbook/monitoring.md', slug: 'self-host/monitoring' },
      { glob: 'docs/ops/runbook/', exclude: ['docs/ops/runbook/monitoring.md'], index: 'docs/ops/runbook/index.md', base: 'self-host/runbook', label: 'Runbook' },
      { glob: 'docs/failure-modes/', base: 'self-host/failure-modes', label: 'Failure modes' },
    ],
  },
  {
    label: 'Engineering',
    items: [
      { src: 'docs/architecture.md', slug: 'engineering/architecture' },
      { src: 'docs/testing.md', slug: 'engineering/testing' },
      { glob: 'docs/benchmarks/', base: 'engineering/benchmarks', label: 'Benchmarks' },
      { glob: 'docs/adr/', exclude: ['docs/adr/TEMPLATE.md'], index: 'docs/adr/README.md', base: 'engineering/decisions', label: 'Design decisions', collapsed: true },
    ],
  },
  {
    label: 'Project',
    items: [
      { src: 'docs/roadmap.md', slug: 'project/roadmap' },
      { src: 'CHANGELOG.md', slug: 'project/changelog' },
      { src: 'docs/glossary.md', slug: 'project/glossary' },
      { src: 'SECURITY.md', slug: 'project/security' },
      { src: 'CONTRIBUTING.md', slug: 'project/contributing' },
      { src: 'LICENSE', slug: 'project/license', title: 'Licence (MIT)' },
    ],
  },
  {
    label: 'Contribute',
    collapsed: true,
    items: [
      { glob: 'docs/dev/', exclude: ['docs/dev/design/', 'docs/dev/records/'], index: 'docs/dev/README.md', base: 'contribute', label: 'Guides for contributors' },
      { glob: 'docs/dev/design/', index: 'docs/dev/design/README.md', base: 'contribute/design', label: 'Design notes', collapsed: true },
      { glob: 'docs/dev/records/', index: 'docs/dev/records/README.md', base: 'contribute/records', label: 'Records', collapsed: true },
    ],
  },
  {
    // Preview only: the big pages step 5 splits into the planned pages above.
    label: 'Being split (preview only)',
    collapsed: true,
    items: [
      { src: 'docs/api-surface.md', slug: 'old/api-surface' },
      { src: 'docs/ai-pricing.md', slug: 'old/ai-pricing' },
      { src: 'docs/webhooks.md', slug: 'old/webhooks' },
    ],
  },
];

// Repo docs that move to the website pages, so the docs do not render them.
export const movedToSite = {
  'docs/features.md': '/product/',
  'docs/why-hardcount.md': '/compare/',
  'docs/comparison.md': '/compare/',
  'docs/ENGINEERING.md': '/engineering/',
  'README.md': '/',
  'docs/README.md': '/docs/',
};

// The core objects that get "The X object" pages, in this order.
export const objects = [
  ['Customer', 'customer'],
  ['Subscription', 'subscription'],
  ['Plan', 'plan'],
  ['PlanPrice', 'plan-price'],
  ['Meter', 'meter'],
  ['UsageEvent', 'usage-event'],
  ['Invoice', 'invoice'],
  ['CreditNote', 'credit-note'],
  ['CreditLedgerEntry', 'credit-ledger-entry'],
  ['DunningPolicy', 'dunning-policy'],
  ['TestClock', 'test-clock'],
  ['WebhookEndpoint', 'webhook-endpoint'],
];
