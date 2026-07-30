# API & UI Test Automation Suite

**Automated test suite covering REST API contracts, referential integrity and end-to-end UI flows — built with Playwright, Jest and TypeScript, running on every push through GitHub Actions.**

---

## What this covers

| Layer | Tool | What it verifies |
|---|---|---|
| Unit | Jest | Validation logic in isolation — no network, runs in milliseconds |
| API | Playwright | Full CRUD cycle, response contracts, status codes, response-time budget, referential integrity across resources |
| UI | Playwright | Authentication flows, inventory listing, sorting, cart state — using the Page Object pattern |
| CI | GitHub Actions | Every push and pull request runs the full suite before merge |

---

## Running it

```bash
npm install
npx playwright install chromium

npm run test:unit    # Jest — validation logic
npm run test:api     # API tests only (no browser, fast)
npm run test:ui      # UI tests in Chromium
npm test             # everything
npm run report       # open the HTML report
```

Targets are public sandboxes — `jsonplaceholder.typicode.com` for the API layer and `saucedemo.com` for the UI layer — so the suite runs with no credentials or setup.

---

## Structure

```
src/validators.ts          Pure validation functions (framework-agnostic)
tests-unit/                Jest specs for the above
tests/api/posts.spec.ts    CRUD, contract, status codes, SLA
tests/api/users.spec.ts    Field validation + cross-resource integrity
tests/ui/pages/            Page Objects — selectors live here, only here
tests/ui/login.spec.ts     Auth: valid, wrong password, locked user, empty fields
tests/ui/inventory.spec.ts Listing, sorting, cart state
playwright.config.ts       Separate projects for API and UI
.github/workflows/tests.yml CI pipeline
```

---

## Design decisions

**Validation logic sits outside the tests.** `src/validators.ts` holds pure functions with no dependency on Playwright, Jest, network or DOM. That means the validation logic itself can be unit-tested instantly, and reused across API specs without duplication. Tests assert behaviour; they don't reimplement rules.

**Page Objects for UI, none for API.** Selectors are volatile and belong in one place — when a `data-test` attribute changes, one file changes, not ten specs. API responses are already structured data; wrapping them adds indirection without protection.

**Separate Playwright projects for API and UI.** API tests need no browser, so they run in a fraction of the time. Splitting them means a broken API contract surfaces in seconds instead of waiting on browser startup.

**Cross-resource integrity is tested explicitly.** `users.spec.ts` fetches posts and users together and asserts every post points at an existing user. Orphaned references are a class of bug that no single-endpoint test can catch.

**Every test is independent.** Login happens in `beforeEach`, never carried over between tests. No test depends on another having run first — which is what makes parallel execution safe rather than flaky.

**Retries only in CI.** A test that fails locally should be seen failing. In CI, one retry absorbs genuine network noise without hiding real defects.

**Evidence only on failure.** Traces, screenshots and video are captured when something breaks and discarded otherwise, keeping artifacts small and relevant.

---

## Stack

TypeScript · Playwright · Jest · GitHub Actions
