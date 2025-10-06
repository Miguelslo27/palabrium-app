# Palabrium

[![Tests](https://img.shields.io/badge/tests-502%20passing-brightgreen)](https://github.com/Miguelslo27/palabrium-app)
[![Coverage](https://img.shields.io/badge/coverage-12%25-red)](https://github.com/Miguelslo27/palabrium-app)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A storytelling platform built with Next.js 15, React 19, and MongoDB.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Available Scripts

### Development
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Local Development with ngrok

To test webhooks or share your local development server:

```bash
# Start the development server
pnpm dev

# In another terminal, start ngrok
ngrok http 3000
```

This creates a public URL (e.g., `https://abc123.ngrok-free.app`) that tunnels to your local `localhost:3000`.

**Common use cases:**
- Testing Clerk webhooks locally
- Sharing your local development with team members
- Testing OAuth flows that require public URLs

**Note**: The free ngrok tier provides a random URL each time. For a consistent URL, consider upgrading to a paid plan.

### Code Quality
- `pnpm lint` - Run ESLint
- `pnpm validate` - Run linting + build (useful before pushing)

### Testing
- `pnpm test` - Run unit tests (434 tests)
- `pnpm test:watch` - Run unit tests in watch mode
- `pnpm test:coverage` - Run unit tests with coverage report
- `pnpm test:coverage:all` - **Run ALL tests (unit + integration) with combined coverage**
- `pnpm test:integration` - Run integration tests (68 tests)
- `pnpm test:all` - Run all tests (unit + integration, no coverage)

**Coverage Reports:**
```bash
# Complete coverage (unit + integration) - RECOMMENDED
pnpm test:coverage:all

# Unit tests only coverage
pnpm test:coverage

# Integration tests only coverage
pnpm test:integration --coverage

# Manually update coverage badge from existing data
pnpm update:badges
```

Coverage reports are generated in the `coverage/` directory. Open `coverage/lcov-report/index.html` in your browser to see detailed coverage.

**Note:** The coverage badge in README.md is automatically updated when you run `pnpm test:coverage:all` or `pnpm test:coverage`.

## Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality:

### Pre-push Hook
Before every `git push`, the following checks run automatically:
1. **Linting** - Ensures code style consistency
2. **Tests with Coverage** - Runs all unit and integration tests (502 tests) + updates coverage badge
3. **Build** - Verifies the project compiles without errors

The coverage badge is automatically updated before each push, ensuring it always reflects the current state of the codebase.

If any check fails, the push is **blocked** until you fix the issues.

**Manual validation:**
```bash
pnpm validate
```

**Bypass (emergency only):**
```bash
git push --no-verify
```

⚠️ **Warning**: Bypassing checks is discouraged. Always fix the issues instead.

## Testing Infrastructure

This project has comprehensive test coverage with automated badge updates:

### Test Suites
- **Unit Tests**: 434 tests covering components, hooks, and utilities
- **Integration Tests**: 68 tests for API routes with MongoDB Memory Server
- **Total**: 502 tests with ~83% overall coverage

### Coverage Goals
- ✅ API Routes: 96%+ coverage (target: 80%)
- ✅ Libraries: 98%+ coverage
- ✅ Hooks: 98%+ coverage
- 🎯 Components: 30%+ coverage (improving)

### Automated Badge Updates
The coverage badge at the top of this README updates automatically in two scenarios:

1. **During pre-push**: Coverage is calculated and badge updated automatically before each push
2. **Manual run**: Execute `pnpm test:coverage:all` to update coverage from all tests

```bash
# Complete coverage (recommended)
pnpm test:coverage:all

# Or just update badge from existing coverage
pnpm update:badges
```

The badge reflects **combined coverage** from both unit and integration tests, giving you a complete picture of your test coverage.

The badge color changes based on coverage:
- 🟢 Green (80%+): Excellent coverage
- 🟡 Yellow (40-79%): Good coverage, room for improvement  
- 🔴 Red (<40%): Needs more tests

For more details, see [TESTING_PLAN.md](TESTING_PLAN.md) and [INTEGRATION_TESTS_SUMMARY.md](INTEGRATION_TESTS_SUMMARY.md).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
