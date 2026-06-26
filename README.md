# Playwright E2E Suite — automationexercise.com

Portfolio-grade Playwright + TypeScript E2E suite. Covers login, registration, product search, checkout flow, and form validation against [automationexercise.com](https://automationexercise.com), wired to GitHub Actions on every push.

## What's in the box

| Area | Detail |
|---|---|
| Test runner | Playwright `^1.49`, three desktop browsers (Chromium/Firefox/WebKit) + a mobile Chrome project |
| Language | TypeScript, strict mode (`strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`) |
| Pattern | Page Object Model: every page extends `BasePage`, exposes intent methods (`login(creds)`, not three field/click calls), locators are getters so they survive navigation |
| Data | `@faker-js/faker` factories with `FAKER_SEED` for deterministic reproduction |
| Reporting | List + HTML + JUnit XML + JSON, with traces/screenshots/video on failure |
| CI | GitHub Actions: lint+typecheck gate, cross-browser matrix, PR smoke gate, nightly regression sweep |
| Lint | `eslint-plugin-playwright` with `no-wait-for-timeout: error` and `no-focused-test: error` |

## Why a portfolio reviewer should care

- **Intent, not clicks.** Page objects expose user intent (`loginPage.login(creds)`, `cartPage.proceedToCheckout()`), so specs read like product specs, not script recordings.
- **Locators as getters.** A common bug in POMs is fields cached as instance properties — they stale after navigation. Here every locator is a getter, re-resolved on access.
- **No `waitForTimeout`.** Lint-enforced. Synchronization uses Playwright's web-first assertions or response-event waits (`BasePage.waitForResponseTo`).
- **Realistic gating.** Anonymous checkout is tested as a *negative* path — automationexercise correctly forces registration to proceed, and the suite asserts that behavior rather than ignoring it.
- **Tag-driven test selection.** `Tags.Smoke`, `Tags.Critical`, `Tags.Regression`, `Tags.Negative`, `Tags.Mobile` are constants in [src/types/index.ts](src/types/index.ts), enabling targeted CI runs (smoke gate on PRs, full matrix on push, nightly regression).

## Project layout

```
src/
├── pages/                  # Page Object Model (BasePage + 9 concrete pages)
│   ├── BasePage.ts
│   ├── HomePage.ts
│   ├── LoginPage.ts        # /login: login + signup-start in one URL
│   ├── SignupPage.ts       # /signup: full account form
│   ├── AccountCreatedPage.ts
│   ├── ProductsPage.ts
│   ├── ProductDetailsPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   ├── PaymentPage.ts
│   └── ContactUsPage.ts
├── fixtures/
│   └── test-fixtures.ts    # Wires page objects + `registeredUser` flow fixture
├── types/index.ts          # Tags constants + domain types
└── utils/data-factory.ts   # Faker-backed factories (user/billing/payment/contact)

tests/
├── login.spec.ts
├── registration.spec.ts
├── product-search.spec.ts
├── checkout.spec.ts
└── form-validation.spec.ts

.github/workflows/ci.yml    # lint+typecheck -> cross-browser matrix -> PR smoke gate
playwright.config.ts        # 3 desktop projects + 1 mobile, retry-on-CI, trace-on-failure
```

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Install browsers (one-time per machine)
npm run install:browsers

# 3. Copy env and tweak if needed (no secrets required for the public demo)
cp .env.example .env

# 4. Run the suite
npm run test                 # full matrix, all projects
npm run test:smoke           # @smoke only — fastest CI signal
npm run test:regression      # @regression — broader coverage
npm run test:headed          # watch it run
npm run test:ui              # Playwright UI mode
npm run report               # open the last HTML report
```

## Reproducing flaky runs

The suite uses faker for all user/billing/payment/contact data. To replay an exact run:

```bash
FAKER_SEED=1234567 npm test
```

The seed is the first thing to capture from a CI failure when triaging.

## Test tags

| Tag | Meaning | Where it runs |
|---|---|---|
| `@smoke` | Minimum viable critical path | PR smoke gate (Chromium only, <2 min) |
| `@critical` | Business-critical flow (login, signup, checkout) | Always |
| `@regression` | Broader coverage including negative paths | Nightly + full matrix |
| `@negative` | Asserts the system rejects bad input | Tagged for review prioritisation |
| `@mobile` | Mobile-specific behavior | Mobile-Chrome project only |

Tags are constants in [src/types/index.ts](src/types/index.ts) and composed into test titles, not hand-written as `@smoke` strings — typo-resistant by construction.

## CI strategy

Three jobs in [.github/workflows/ci.yml](.github/workflows/ci.yml):

1. **Lint + typecheck gate** — fast fail on style/type issues before spending browser-minutes.
2. **Cross-browser matrix** — Chromium, Firefox, WebKit in parallel; uploads HTML report, JUnit XML, and traces on failure.
3. **PR smoke gate** — Chromium-only smoke run wired to `pull_request` for sub-2-minute PR feedback.
4. **Nightly schedule** — `17 4 * * *` UTC, full suite against live automationexercise.com to catch upstream breakage.

## Coverage map (what the recruiter should look for)

| Requirement | Spec | Notable |
|---|---|---|
| **Login** | [tests/login.spec.ts](tests/login.spec.ts) | 4 tests — happy path, bad credentials, logout state, anonymous nav state |
| **Registration** | [tests/registration.spec.ts](tests/registration.spec.ts) | 4 tests — happy path, duplicate email, empty form, newsletter-opt-out variant |
| **Product search** | [tests/product-search.spec.ts](tests/product-search.spec.ts) | 4 tests — known term, nonsense term, full catalog, product-details navigation |
| **Checkout flow** | [tests/checkout.spec.ts](tests/checkout.spec.ts) | 5 tests including full register→cart→checkout→pay→confirm happy path |
| **Form validation** | [tests/form-validation.spec.ts](tests/form-validation.spec.ts) | 4 tests covering Contact Us required/format validation + signup minlength |

## Notes on the target site

automationexercise.com is a public practice site that occasionally resets state and serves ads via iframes. The suite handles this with:

- A network-level block of the third-party consent/ad-funding scripts (Google Funding Choices) in [src/fixtures/test-fixtures.ts](src/fixtures/test-fixtures.ts), so the `.fc-consent-root` overlay never renders and steals pointer events.
- A reload-once retry in `BasePage.goto()` that recovers from the live site's occasional slow/empty first response under load.
- Cart isolation per test (each test starts from a clean session via Playwright's per-test context).
- Resilient locators that prefer roles and `data-qa` attributes over brittle CSS chains.

## License

This is portfolio/demo code — use freely as a reference. The target site is not affiliated with this repository.
