#!/usr/bin/env node
/**
 * Script to run all tests (unit + integration) and combine coverage
 * This ensures we get complete coverage metrics across the entire codebase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running comprehensive test suite with coverage...\n');

// Clean previous coverage
console.log('🧹 Cleaning previous coverage data...');
const coverageDir = path.join(__dirname, '../coverage');
if (fs.existsSync(coverageDir)) {
  fs.rmSync(coverageDir, { recursive: true, force: true });
}
console.log('✅ Coverage cleaned\n');

try {
  // Run unit tests with coverage (ignore coverage thresholds for now)
  console.log('📝 Running unit tests with coverage...');
  execSync('pnpm jest --coverage --testPathIgnorePatterns=__tests__/integration --coverageThreshold="{}"', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
  console.log('✅ Unit tests completed\n');

  // Save unit test coverage
  const unitCoverage = path.join(coverageDir, 'coverage-final.json');
  const unitCoverageBackup = path.join(coverageDir, 'coverage-unit.json');
  if (fs.existsSync(unitCoverage)) {
    fs.copyFileSync(unitCoverage, unitCoverageBackup);
    console.log('💾 Unit test coverage saved\n');
  }

  // Run integration tests with coverage
  console.log('🔗 Running integration tests with coverage...');
  execSync('pnpm jest --config jest.integration.config.ts --coverage', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
  console.log('✅ Integration tests completed\n');

  // Save integration test coverage
  const integrationCoverage = path.join(coverageDir, 'coverage-final.json');
  const integrationCoverageBackup = path.join(coverageDir, 'coverage-integration.json');
  if (fs.existsSync(integrationCoverage)) {
    fs.copyFileSync(integrationCoverage, integrationCoverageBackup);
    console.log('💾 Integration test coverage saved\n');
  }

  // Merge coverage data
  console.log('🔄 Merging coverage data...');
  const unitData = JSON.parse(fs.readFileSync(unitCoverageBackup, 'utf8'));
  const integrationData = JSON.parse(fs.readFileSync(integrationCoverageBackup, 'utf8'));

  // Combine coverage (integration takes precedence for overlapping files)
  const mergedCoverage = { ...unitData, ...integrationData };
  fs.writeFileSync(unitCoverage, JSON.stringify(mergedCoverage, null, 2));
  console.log('✅ Coverage data merged\n');

  // Update badges
  console.log('🎨 Updating coverage badges...');
  execSync('node scripts/update-coverage-badge.js', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });

  console.log('\n✨ All tests completed successfully with combined coverage!');
  process.exit(0);

} catch (error) {
  console.error('\n❌ Tests failed!');
  console.error(error);
  process.exit(1);
}
