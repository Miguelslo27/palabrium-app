# Scripts

This directory contains utility scripts for the project.

## test-all-with-coverage.js

**NEW** - Runs all tests (unit + integration) and generates combined coverage report with automatic badge update.

### Usage

```bash
# Run all tests with combined coverage
pnpm test:coverage:all
```

This script automatically:
1. Cleans previous coverage data
2. Runs unit tests with coverage
3. Runs integration tests with coverage
4. Merges coverage data from both test suites
5. Updates the coverage badge in README.md

### How it works

1. Executes unit tests: `jest --coverage --testPathIgnorePatterns=__tests__/integration`
2. Saves unit coverage to `coverage/coverage-unit.json`
3. Executes integration tests: `jest --config jest.integration.config.ts --coverage`
4. Saves integration coverage to `coverage/coverage-integration.json`
5. Merges both coverage files into `coverage/coverage-final.json`
6. Calls `update-coverage-badge.js` to update README

### When to use

- **Before committing**: Get complete coverage metrics
- **In pre-push**: Automatically runs to ensure badge is up-to-date
- **CI/CD**: For deployment pipelines requiring full coverage

---

## update-coverage-badge.js

Automatically updates the coverage badge in the main README.md file based on Jest coverage reports.

### Usage

The script runs automatically after `pnpm test:coverage`:

```bash
pnpm test:coverage  # Runs tests and updates badge
```

Or manually:

```bash
pnpm update:badges  # Only updates the badge from existing coverage
```

### How it works

1. Reads coverage data from `coverage/coverage-final.json`
2. Calculates average coverage from statements, branches, and functions
3. Determines badge color based on coverage percentage:
   - 🟢 Green (80%+)
   - 🟢 Green (60-79%)
   - 🟡 Yellow (40-59%)
   - 🟠 Orange (20-39%)
   - 🔴 Red (<20%)
4. Updates the coverage badge in README.md

### Requirements

- Jest coverage must be generated first (`pnpm test:coverage`)
- Node.js 14+ required

### Output Example

```
✅ Updated coverage badge: 83%
✅ README.md updated successfully!
   Statements: 91%
   Branches: 76%
   Functions: 82%
   Lines: 91%
   Average: 83%
```
