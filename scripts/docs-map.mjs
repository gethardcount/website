// The docs structure, defined once: every page, its section, its URL and its
// order. Source files are paths in the gethardcount/hardcount repo. A page
// with `planned` is not written yet and is not built. A `src` that is missing
// at the pinned release is left out (with a CI warning) until it ships.
// `label` is the short sidebar name; the page title stays the doc's heading
// unless `title` replaces it, and `intro` adds a first paragraph.
// `next` / `prev` set the page's next and previous links (a slug, or false).
// A glob may give `labels` (file → short sidebar name), `sortByLabel`,
// `hidden` (built and linked, but not in the sidebar) and `noindex`.
// Built from velox-ops marketing/site-structure-2026-10-29.md §5.

const allSections = [
  {
    label: 'Get started',
    items: [
      { src: 'docs/how-hardcount-works.md', slug: 'get-started/how-hardcount-works', label: 'How it works' },
      { src: 'docs/quick-start.md', slug: 'get-started/quick-start', label: 'Quick start' },
      { src: 'docs/first-invoice.md', slug: 'get-started/first-invoice', label: 'Send usage, get an invoice', next: 'guides/ai-pricing' },
      // In Get started until the concept pages ship; its URL stays put.
      { src: 'docs/glossary.md', slug: 'concepts/glossary', label: 'Glossary' },
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
      { src: 'docs/ai-pricing.md', slug: 'guides/ai-pricing', label: 'AI pricing reference' },
      {
        slug: 'guides/bill-for-ai-tokens',
        planned: {
          title: 'Bill for AI tokens by model',
          intro: 'Price input, output and cached tokens per model, from a ready-made price list or your own.',
          sections: ['The ready-made prices: Anthropic, OpenAI, Replicate (one call)', 'Your own model', 'Mapping provider token counts (cached tokens) to events', 'The invoice it makes'],
          from: ['docs/ai-pricing.md', 'internal/recipe/recipes/'],
        },
      },
      { src: 'docs/stop-usage-when-credit-runs-out.md', slug: 'guides/stop-usage-when-credit-runs-out', label: 'Stop usage when credit runs out' },
      { src: 'docs/integrations/litellm.md', slug: 'guides/litellm', label: 'Send usage from LiteLLM' },
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
      { src: 'docs/ops/tax-calculation.md', slug: 'guides/tax', label: 'Set up tax', next: 'api/overview' },
    ],
  },
  {
    label: 'API reference',
    items: [
      { src: 'docs/api-surface.md', slug: 'api/overview', label: 'The Hardcount API' },
      // docs/api-keys.md until a dedicated authentication page ships.
      { src: 'docs/api-keys.md', slug: 'api/authentication', label: 'Authentication and keys', title: 'Authentication and keys' },
      { planned: { title: 'Errors', intro: 'Every error code, what it means, and what to do.', sections: ['The error body', 'Status codes', 'Error codes'], from: ['docs/api-surface.md: Errors'] }, slug: 'api/errors' },
      { planned: { title: 'Idempotency', intro: 'Retry any request safely.', sections: ['Usage events: the idempotency key', 'Other writes', 'How long keys are kept'], from: ['docs/api-surface.md: Sending usage safely'] }, slug: 'api/idempotency' },
      { planned: { title: 'Pagination', intro: 'How list endpoints return pages.', sections: ['Cursors', 'Which endpoints page, and the limits'], from: ['New page (checked in code)'] }, slug: 'api/pagination' },
      { src: 'docs/versioning.md', slug: 'api/versioning', label: 'Versioning' },
      { planned: { title: 'Rate limits', intro: 'How many requests you can send.', sections: ['General and ingest limits', 'What a 429 looks like', 'Changing the limits'], from: ['docs/settings.md'] }, slug: 'api/rate-limits' },
      { planned: { title: 'Timing and limits', intro: 'Every time window and size limit, as a number.', sections: ['Invoice grace period', 'Idempotency windows', 'Stripe\'s 24-hour window', 'Retry schedules', 'Request size'], from: ['New page (checked in code)'] }, slug: 'api/timing-and-limits' },
      { objects: true, label: 'Objects' },
      { openapi: true, label: 'Endpoints' },
      { src: 'docs/webhooks.md', slug: 'api/webhooks', label: 'Webhooks', next: false },
      { planned: { title: 'Webhook events', intro: 'Every event Hardcount sends: when, and what it contains.', sections: ['The catalog: name, when it is sent, example payload'], from: ['docs/webhooks.md: catalog (kept true by internal/domain/webhook_catalog_test.go)'] }, slug: 'api/webhook-events' },
    ],
  },
  {
    label: 'Self-host',
    items: [
      { src: 'docs/self-host.md', slug: 'self-host/overview', label: 'Overview' },
      { src: 'docs/production-one-vm.md', slug: 'self-host/production-one-vm', label: 'Production on one VM' },
      { src: 'deploy/compose/README.md', slug: 'self-host/docker-compose', label: 'The Compose files' },
      { src: 'docs/ops/high-availability.md', slug: 'self-host/high-availability', label: 'High availability' },
      { src: 'docs/settings.md', slug: 'self-host/settings', label: 'Settings' },
      { src: 'docs/ops/postgres-requirements.md', slug: 'self-host/postgres', label: 'Postgres' },
      { src: 'docs/ops/backup-considerations.md', slug: 'self-host/backups', label: 'Backups' },
      { src: 'docs/upgrades.md', slug: 'self-host/upgrades', label: 'Upgrades' },
      { src: 'docs/scale.md', slug: 'self-host/scale', label: 'How much it handles' },
      { src: 'docs/ops/runbook/monitoring.md', slug: 'self-host/monitoring', label: 'Monitoring' },
      { src: 'docs/ops/email-setup.md', slug: 'self-host/email-setup', label: 'Set up email' },
      // An operator's spec of how card charges fail; the how-it-works page for
      // developers is a planned concept page.
      { src: 'docs/payments.md', slug: 'self-host/payment-failure-handling', label: 'Payment failure handling' },
      {
        glob: 'docs/ops/runbook/', exclude: ['docs/ops/runbook/monitoring.md'], index: 'docs/ops/runbook/index.md', base: 'self-host/runbook', label: 'Runbook',
        sortByLabel: true,
        labels: {
          'autovacuum-stall.md': 'Autovacuum stalls',
          'background-job-stuck.md': 'Background job stuck',
          'below-stripe-minimum.md': 'Below Stripe’s minimum charge',
          'billing-failing.md': 'Billing failing',
          'customer-must-confirm-payment.md': 'Customer must confirm a payment',
          'litellm-spend-gap.md': 'LiteLLM gap after an outage',
          'migration-failed-midway.md': 'Database upgrade stopped',
          'rds-wal-pool.md': 'RDS commits stall',
          'replica-will-not-start.md': 'Replica will not start',
          'rls-leak-suspected.md': 'Tenant data leak suspected',
          'sign-in-throttled.md': 'Sign-in throttled',
          'test-clock-advance-hung.md': 'Test clock advance hung',
          'unclear-charge.md': 'Unclear charge result',
          'webhook-endpoint-failing.md': 'Webhook endpoint failing',
          'write-io-after-backfill.md': 'Write I/O after a backfill',
        },
      },
      { glob: 'docs/failure-modes/', base: 'self-host/failure-modes', label: 'Failure modes', labels: { 'rfm-001-wal-pool-exhaustion.md': 'RFM-001: WAL pool runs dry' } },
    ],
  },
  {
    // How it is built and tested: the evidence the website's Engineering
    // page links to. Named Internals so it does not share that page's name.
    label: 'Internals',
    collapsed: true,
    items: [
      { src: 'docs/architecture.md', slug: 'internals/architecture', label: 'Architecture' },
      { src: 'docs/testing.md', slug: 'internals/testing', label: 'How we test' },
      { glob: 'docs/benchmarks/', base: 'internals/benchmarks', label: 'Benchmarks' },
      { glob: 'docs/adr/', exclude: ['docs/adr/TEMPLATE.md'], index: 'docs/adr/README.md', base: 'internals/decisions', label: 'Design decisions', collapsed: true },
      {
        glob: 'docs/dev/records/', index: 'docs/dev/records/README.md', base: 'internals/records', label: 'Records: reviews, audits and run journals', collapsed: true,
        noindex: true,
        // How the maintainer prompts coding agents: kept in the repo only.
        exclude: ['docs/dev/records/agent-prompting-standards.md'],
        // Reachable from the Records overview, not listed in the sidebar.
        hidden: ['docs/dev/records/audit-2026-07-02-remediation-plan.md', 'docs/dev/records/design-review-2026-07-10.md', 'docs/dev/records/product-stability-plan.md'],
        labels: {
          'audit-2026-07-02-full-product.md': 'Full-product audit (2026-07)',
          'failure-correctness-advisory-lock-2026-08.md': 'The retired advisory lock (2026-08)',
          'ha-readiness-2026-07-06.md': 'HA readiness (2026-07)',
          'money-path-census-2026-07.md': 'Money-path census (2026-07)',
          'restore-drill-first-run-2026-08-11.md': 'Restore drill, first run (2026-08)',
          'sustained-throughput-runs-2026-08.md': 'Throughput run journal (2026-08)',
        },
      },
      {
        glob: 'docs/dev/design/', index: 'docs/dev/design/README.md', base: 'internals/design-notes', label: 'Design notes', collapsed: true,
        labels: {
          'billing-thresholds.md': 'Billing thresholds',
          'cc-emails.md': 'CC on billing emails',
          'commit-cn-relief.md': 'Paid-commit credit-note relief',
          'cost-tables.md': 'Provider cost tables and margin',
          'create-preview.md': 'Create-preview endpoint',
          'customer-usage.md': 'Customer usage endpoint',
          'multi-dim-meters.md': 'Multi-dimensional meters',
          'prepaid-commits.md': 'Prepaid commits and drawdown',
          'recipes.md': 'Pricing recipes',
        },
      },
    ],
  },
  {
    label: 'Project',
    collapsed: true,
    items: [
      { src: 'docs/roadmap.md', slug: 'project/roadmap', label: 'Roadmap' },
      { src: 'CHANGELOG.md', slug: 'project/changelog', label: 'Changelog' },
      { src: 'SECURITY.md', slug: 'project/security', label: 'Security policy' },
      { src: 'LICENSE', slug: 'project/license', title: 'Licence (MIT)', label: 'Licence' },
    ],
  },
  {
    label: 'Contribute',
    collapsed: true,
    items: [
      { glob: 'docs/dev/', exclude: ['docs/dev/design/', 'docs/dev/records/'], index: 'docs/dev/README.md', base: 'contribute', label: 'Guides for contributors' },
      { src: 'CONTRIBUTING.md', slug: 'contribute/contributing', label: 'Contributing' },
      {
        src: 'CLAUDE.md', slug: 'contribute/rules-at-a-glance', label: 'Project rules at a glance', title: 'Project rules at a glance',
        intro: 'These are the maintainer’s working rules for this repo, written for the people and coding agents who change its code. To use Hardcount, start with the [quick start](/docs/get-started/quick-start/).',
      },
      { src: 'web-v2/README.md', slug: 'contribute/dashboard', label: 'The dashboard (web-v2)' },
      { src: 'web-v2/e2e/README.md', slug: 'contribute/dashboard-tests', label: 'Dashboard tests' },
      { src: 'docs/adr/TEMPLATE.md', slug: 'contribute/design-record-template', label: 'Design record template', asCode: true },
    ],
  },
];

// Planned pages stay here as the plan for splitting the long pages above,
// but a live site shows no stubs: they are built and listed only once written.
export const plannedPages = allSections.flatMap((s) => s.items.filter((i) => i.planned));
export const sections = allSections
  .map((s) => ({ ...s, items: s.items.filter((i) => !i.planned) }))
  .filter((s) => s.items.length);

// Addresses that used to be pages, and where each one went. A redirect is
// written only while no page has the old address.
export const redirects = {
  '/docs/being-split/api-surface/': '/docs/api/overview/',
  '/docs/being-split/ai-pricing/': '/docs/guides/ai-pricing/',
  '/docs/being-split/webhooks/': '/docs/api/webhooks/',
  '/docs/concepts/payments-and-retries/': '/docs/self-host/payment-failure-handling/',
  '/docs/concepts/tax/': '/docs/guides/tax/',
  '/docs/guides/email-setup/': '/docs/self-host/email-setup/',
  '/docs/guides/api-keys/': '/docs/api/authentication/',
  '/docs/project/contributing/': '/docs/contribute/contributing/',
  '/docs/internals/records/agent-prompting-standards/': '/docs/internals/records/',
};

// Planned pages were briefly live as outlines. Until each is written, its
// address goes to the page that holds that content today.
export const plannedNearest = {
  'concepts/data-model': '/docs/get-started/how-hardcount-works/',
  'concepts/usage-events': '/docs/api/overview/#sending-usage-safely',
  'concepts/meters-and-prices': '/docs/guides/ai-pricing/',
  'concepts/subscriptions': '/docs/api/overview/#customers-and-subscriptions',
  'concepts/invoices': '/docs/get-started/how-hardcount-works/',
  'concepts/credits': '/docs/guides/ai-pricing/#sell-prepaid-credit-a-prepaid-commit',
  'concepts/test-clocks': '/docs/api/overview/#test-clocks',
  'concepts/margin': '/docs/guides/ai-pricing/#see-your-margin',
  'guides/bill-for-ai-tokens': '/docs/guides/ai-pricing/',
  'guides/receive-webhooks': '/docs/api/webhooks/',
  'guides/connect-stripe': '/docs/self-host/production-one-vm/',
  'guides/test-a-billing-change': '/docs/get-started/first-invoice/',
  'api/errors': '/docs/api/overview/#errors',
  'api/idempotency': '/docs/api/overview/#sending-usage-safely',
  'api/pagination': '/docs/api/overview/#lists',
  'api/rate-limits': '/docs/self-host/overview/#settings',
  'api/timing-and-limits': '/docs/api/overview/',
  'api/webhook-events': '/docs/api/webhooks/',
  'self-host/upgrades': '/docs/self-host/overview/#upgrading',
  'self-host/settings': '/docs/self-host/overview/#settings',
};

// Repo docs that move to the website pages, so the docs do not render them.
export const movedToSite = {
  'docs/features.md': '/product/',
  'docs/why-hardcount.md': '/compare/',
  'docs/comparison.md': '/compare/',
  'docs/ENGINEERING.md': '/reliability/',
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
