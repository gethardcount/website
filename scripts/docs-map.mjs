// The docs structure, defined once: every page, its section, its URL and its
// order. Source files are paths in the gethardcount/hardcount repo. A page
// with `planned` is not written yet and is not built. A `src` that is missing
// at the pinned release is left out (with a CI warning) until it ships.
// `label` is the short sidebar name; the page title stays the doc's heading
// unless `title` replaces it, and `intro` adds a first paragraph.
// `next` / `prev` set the page's next and previous links (a slug, or false).
// `keywords` are words search should find the page by, for a topic the page
// names in other words (the Errors page says "every code", not "error codes").
// A glob may give `labels` (file → short sidebar name), `sortByLabel`,
// `hidden` (built and linked, but not in the sidebar) and `noindex`.
// Built from velox-ops marketing/site-structure-2026-10-29.md §5.

const allSections = [
  {
    label: 'Get started',
    items: [
      { src: 'docs/how-hardcount-works.md', slug: 'get-started/how-hardcount-works', label: 'How it works' },
      { src: 'docs/quick-start.md', slug: 'get-started/quick-start', label: 'Quick start' },
      { src: 'docs/first-invoice.md', slug: 'get-started/first-invoice', label: 'Send usage, get an invoice', next: 'guides/bill-for-ai-tokens' },
    ],
  },
  {
    label: 'Concepts',
    items: [
      { src: 'docs/concepts/data-model.md', slug: 'concepts/data-model', label: 'The data model' },
      { src: 'docs/concepts/usage-events.md', slug: 'concepts/usage-events', label: 'Usage events' },
      { src: 'docs/concepts/meters-and-prices.md', slug: 'concepts/meters-and-prices', label: 'Meters and prices' },
      { src: 'docs/concepts/subscriptions.md', slug: 'concepts/subscriptions', label: 'Subscriptions' },
      { src: 'docs/concepts/invoices.md', slug: 'concepts/invoices', label: 'Invoices' },
      { src: 'docs/concepts/credits.md', slug: 'concepts/credits', label: 'Credits' },
      { src: 'docs/concepts/payments.md', slug: 'concepts/payments', label: 'Payments', keywords: ['dunning', 'payment retries', 'failed payments'] },
      { src: 'docs/concepts/test-clocks.md', slug: 'concepts/test-clocks', label: 'Test clocks' },
      { src: 'docs/concepts/margin.md', slug: 'concepts/margin', label: 'Margin' },
      { src: 'docs/glossary.md', slug: 'concepts/glossary', label: 'Glossary' },
    ],
  },
  {
    label: 'Guides',
    items: [
      { src: 'docs/guides/bill-for-ai-tokens.md', slug: 'guides/bill-for-ai-tokens', label: 'Bill for AI tokens by model' },
      { src: 'docs/stop-usage-when-credit-runs-out.md', slug: 'guides/stop-usage-when-credit-runs-out', label: 'Stop usage when credit runs out' },
      {
        src: 'docs/integrations/litellm.md', slug: 'guides/litellm', label: 'Send usage from LiteLLM', title: 'Send usage from LiteLLM',
        keywords: ['LiteLLM integration', 'LiteLLM proxy'],
      },
      { src: 'docs/guides/receive-webhooks.md', slug: 'guides/receive-webhooks', label: 'Receive webhooks', keywords: ['verify webhook', 'verify signature', 'Hardcount-Signature'] },
      { src: 'docs/guides/connect-stripe.md', slug: 'guides/connect-stripe', label: 'Connect Stripe' },
      { src: 'docs/guides/test-a-billing-change.md', slug: 'guides/test-a-billing-change', label: 'Simulate months with a test clock' },
      { src: 'docs/api-keys.md', slug: 'guides/api-keys', label: 'Manage API keys', keywords: ['test mode', 'live mode', 'Bearer'] },
      { src: 'docs/ops/tax-calculation.md', slug: 'guides/tax', label: 'Set up tax', title: 'Set up tax', keywords: ['tax calculation', 'Stripe Tax', 'VAT'] },
      // The reference for every AI pricing option, after the task guides.
      { src: 'docs/ai-pricing.md', slug: 'guides/ai-pricing', label: 'AI pricing reference' },
    ],
  },
  {
    label: 'API reference',
    items: [
      { src: 'docs/api-surface.md', slug: 'api/overview', label: 'API overview', keywords: ['API reference', 'base URL'] },
      { src: 'docs/api/authentication.md', slug: 'api/authentication', label: 'Authentication and keys', keywords: ['test mode', 'live mode', 'Bearer'] },
      { src: 'docs/api/errors.md', slug: 'api/errors', label: 'Errors', keywords: ['error codes', 'status codes'] },
      { src: 'docs/api/idempotency.md', slug: 'api/idempotency', label: 'Idempotency (safe retries)', keywords: ['Idempotency-Key', 'retry'] },
      { src: 'docs/api/pagination.md', slug: 'api/pagination', label: 'Pagination' },
      { src: 'docs/versioning.md', slug: 'api/versioning', label: 'Versioning' },
      { src: 'docs/api/rate-limits.md', slug: 'api/rate-limits', label: 'Rate limits', keywords: ['X-RateLimit', 'X-RateLimit-Remaining', 'Retry-After', '429'] },
      { src: 'docs/api/timing-and-limits.md', slug: 'api/timing-and-limits', label: 'Timing and limits', keywords: ['timeout', 'request timeout'] },
      { src: 'docs/api/two-calls.md', slug: 'api/two-calls', label: 'Code samples: Node, Python, Go' },
      { src: 'docs/webhooks.md', slug: 'api/webhooks', label: 'Webhooks', keywords: ['verify webhook', 'verify signature', 'Hardcount-Signature'] },
      { src: 'docs/api/webhook-events.md', slug: 'api/webhook-events', label: 'Webhook events' },
      { objects: true, label: 'Objects' },
      { openapi: true, label: 'Endpoints' },
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
      // developers is concepts/payments.
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
          'refund-made-in-stripe.md': 'Refund made in Stripe',
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
  '/docs/concepts/payments-and-retries/': '/docs/concepts/payments/',
  '/docs/concepts/tax/': '/docs/guides/tax/',
  '/docs/guides/email-setup/': '/docs/self-host/email-setup/',
  '/docs/project/contributing/': '/docs/contribute/contributing/',
  '/docs/internals/records/agent-prompting-standards/': '/docs/internals/records/',
};

// Pages the site links to that are not built at the pinned release: planned
// pages (some were briefly live as outlines), and pages whose `src` is not in
// that release yet. Until a page is built, its address goes to the page that
// holds that content at the release. Once it is built, its entry does nothing.
export const nearestUntilBuilt = {
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
  'api/authentication': '/docs/guides/api-keys/',
  'concepts/payments': '/docs/self-host/payment-failure-handling/',
  'self-host/upgrades': '/docs/self-host/overview/#upgrading',
  'self-host/settings': '/docs/self-host/overview/#settings',
};

// Repo docs that move to the website pages, so the docs do not render them.
export const movedToSite = {
  'docs/features.md': '/product/',
  // What Hardcount gives you that the usual options do not: Home's "What
  // you get" list. (Compare already has the docs index's other link.)
  'docs/why-hardcount.md': '/#gets',
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
  ['InvoiceLineItem', 'invoice-line-item'],
  ['CreditNote', 'credit-note'],
  ['CreditLedgerEntry', 'credit-ledger-entry'],
  ['CreditBalance', 'credit-balance'],
  ['PaymentMethod', 'payment-method'],
  ['DunningPolicy', 'dunning-policy'],
  ['DunningRun', 'dunning-run'],
  ['TestClock', 'test-clock'],
  ['WebhookEndpoint', 'webhook-endpoint'],
  ['WebhookEvent', 'webhook-event'],
];
