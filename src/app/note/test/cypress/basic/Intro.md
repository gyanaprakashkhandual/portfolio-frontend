# Introduction to Cypress

Cypress is a modern, open-source end-to-end testing framework built specifically for the web. Unlike traditional testing tools, Cypress runs directly inside the browser — not alongside it — giving you native access to every element, event, and network request in your application.

---

## What is Cypress?

Cypress is a JavaScript-based testing framework designed for front-end developers and QA engineers who need reliable, fast, and developer-friendly tests. It supports end-to-end (E2E) testing, component testing, and integration testing, all from a single unified tool.

It works with any web application regardless of the framework — React, Vue, Angular, Next.js, and beyond.

---

## Key Features

**Real-Time Execution** — Cypress executes tests in the same run-loop as your application, enabling true real-time interaction with the DOM without flakiness caused by async timing.

**Time Travel Debugging** — The Cypress Test Runner captures snapshots at every command. You can hover over any step in the command log to see exactly what the application looked like at that moment.

**Automatic Waiting** — Cypress automatically waits for elements to appear, animations to finish, and network requests to complete. No manual `sleep()` or `waitFor()` calls needed.

**Network Traffic Control** — Intercept, stub, and assert on XHR and Fetch requests with built-in `cy.intercept()`, enabling you to test edge cases without a live backend.

**Built-In Screenshot & Video Recording** — Cypress captures screenshots on failure and can record full video of every test run — ideal for CI pipelines.

**Component Testing** — Beyond full-page E2E tests, Cypress supports isolated component testing, letting you mount and test individual components without spinning up a full application.

---

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn

### Installation

```bash
npm install cypress --save-dev
```

### Opening the Test Runner

```bash
npx cypress open
```

This launches the interactive Cypress Test Runner, where you can choose between E2E and component testing modes.

### Running Tests Headlessly (CI)

```bash
npx cypress run
```

---

## Writing Your First Test

Tests are written in JavaScript or TypeScript and live in the `cypress/e2e/` directory by default.

```javascript
// cypress/e2e/homepage.cy.js

describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('https://example.com')
  })

  it('displays the page title', () => {
    cy.title().should('include', 'Example Domain')
  })

  it('contains a heading', () => {
    cy.get('h1').should('be.visible').and('contain.text', 'Example Domain')
  })

  it('has a working link', () => {
    cy.get('a').first().click()
    cy.url().should('not.equal', 'https://example.com')
  })
})
```

---

## Project Structure

After running `npx cypress open` for the first time, Cypress scaffolds the following structure:

```
my-project/
├── cypress/
│   ├── e2e/              # End-to-end test files (.cy.js / .cy.ts)
│   ├── fixtures/         # Static test data (JSON files)
│   ├── support/
│   │   ├── commands.js   # Custom cy.* commands
│   │   └── e2e.js        # Global configuration & imports
├── cypress.config.js     # Main Cypress configuration
└── package.json
```

---

## Core Cypress Commands

| Command | Description |
|---|---|
| `cy.visit(url)` | Navigate to a URL |
| `cy.get(selector)` | Query a DOM element |
| `cy.click()` | Click an element |
| `cy.type(text)` | Type into an input |
| `cy.should(assertion)` | Assert on element state |
| `cy.intercept()` | Intercept network requests |
| `cy.fixture(file)` | Load test data from a fixture file |
| `cy.screenshot()` | Capture a screenshot |

---

## Configuration

Cypress is configured via `cypress.config.js` in your project root:

```javascript
// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 5000,
    video: true,
    screenshotOnRunFailure: true,
  },
})
```

With `baseUrl` set, you can use relative paths in `cy.visit()`:

```javascript
cy.visit('/login')   // resolves to http://localhost:3000/login
```

---

## Custom Commands

Cypress allows you to extend `cy.*` with reusable custom commands defined in `cypress/support/commands.js`:

```javascript
// cypress/support/commands.js

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('[data-cy="email"]').type(email)
  cy.get('[data-cy="password"]').type(password)
  cy.get('[data-cy="submit"]').click()
})
```

Usage in tests:

```javascript
cy.login('user@example.com', 'securePassword')
```

---

## Best Practices

**Use `data-cy` attributes for selectors** — Avoid CSS classes and IDs that may change. Add dedicated test attributes to your markup:

```html
<button data-cy="submit-button">Submit</button>
```

```javascript
cy.get('[data-cy="submit-button"]').click()
```

**Keep tests independent** — Each test should be able to run in isolation. Use `beforeEach` to set up state rather than relying on previous tests.

**Avoid over-stubbing** — Stub network requests selectively. Tests that exercise real API responses catch more real-world bugs.

**Use fixtures for test data** — Store reusable JSON payloads in `cypress/fixtures/` and load them with `cy.fixture()`.

---

## Cypress vs Other Frameworks

| Feature | Cypress | Selenium/WebDriver | Playwright |
|---|---|---|---|
| Language | JavaScript / TypeScript | Multi-language | JavaScript / TypeScript / Python / .NET |
| Architecture | In-browser | External driver | Browser protocol |
| Auto-wait | Yes | No (manual) | Yes |
| Component testing | Yes | No | Yes (experimental) |
| Time travel | Yes | No | No |
| Setup complexity | Low | Medium–High | Low |

---

## Resources

- [Official Documentation](https://docs.cypress.io) — Comprehensive guides, API reference, and examples
- [Cypress GitHub](https://github.com/cypress-io/cypress) — Source code and issue tracker
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app) — A full example app with extensive Cypress tests
- [Cypress Cloud](https://cloud.cypress.io) — Hosted test recording, parallelization, and analytics (paid)

---

*Cypress turns testing from a chore into a genuinely fast, observable, and developer-friendly experience — making it one of the most widely adopted testing tools in the modern web ecosystem.*