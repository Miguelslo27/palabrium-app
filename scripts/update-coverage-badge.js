#!/usr/bin/env node
/**
 * Script to update coverage badges in README.md
 * Reads coverage data from Jest coverage reports and updates badges
 */

const fs = require('fs');
const path = require('path');

// Paths
const coveragePath = path.join(__dirname, '../coverage/coverage-final.json');
const readmePath = path.join(__dirname, '../README.md');

// Read coverage data
let coverage = {};
if (fs.existsSync(coveragePath)) {
  const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  coverage = coverageData;
} else {
  console.warn('⚠️  Coverage file not found. Run tests with --coverage first.');
  process.exit(0);
}

// Calculate totals from all files
let totalStatements = { covered: 0, total: 0 };
let totalBranches = { covered: 0, total: 0 };
let totalFunctions = { covered: 0, total: 0 };
let totalLines = { covered: 0, total: 0 };

Object.values(coverage).forEach(file => {
  if (file.s) { // statements
    Object.values(file.s).forEach(count => {
      totalStatements.total++;
      if (count > 0) totalStatements.covered++;
    });
  }
  if (file.b) { // branches
    Object.values(file.b).forEach(branch => {
      branch.forEach(count => {
        totalBranches.total++;
        if (count > 0) totalBranches.covered++;
      });
    });
  }
  if (file.f) { // functions
    Object.values(file.f).forEach(count => {
      totalFunctions.total++;
      if (count > 0) totalFunctions.covered++;
    });
  }
});

// Calculate percentages
const statements = totalStatements.total > 0
  ? Math.round((totalStatements.covered / totalStatements.total) * 100)
  : 0;
const branches = totalBranches.total > 0
  ? Math.round((totalBranches.covered / totalBranches.total) * 100)
  : 0;
const functions = totalFunctions.total > 0
  ? Math.round((totalFunctions.covered / totalFunctions.total) * 100)
  : 0;
const lines = statements; // Use statements as proxy for lines

// Average coverage
const avgCoverage = Math.round((statements + branches + functions) / 3);

// Determine badge color
function getBadgeColor(coverage) {
  if (coverage >= 80) return 'brightgreen';
  if (coverage >= 60) return 'green';
  if (coverage >= 40) return 'yellow';
  if (coverage >= 20) return 'orange';
  return 'red';
}

const color = getBadgeColor(avgCoverage);

// Read README
let readme = fs.readFileSync(readmePath, 'utf8');

// Update coverage badge
const coverageBadgeRegex = /\[!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/coverage-[^\)]+\)\]/;
const newCoverageBadge = `[![Coverage](https://img.shields.io/badge/coverage-${avgCoverage}%25-${color})]`;

if (coverageBadgeRegex.test(readme)) {
  readme = readme.replace(coverageBadgeRegex, newCoverageBadge);
  console.log(`✅ Updated coverage badge: ${avgCoverage}%`);
} else {
  console.log('⚠️  Coverage badge not found in README.md');
}

// Update API routes coverage badge if it exists
const apiCoverageBadgeRegex = /\[!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/coverage-API%20routes%20[^\)]+\)\]/;
// Keep API routes badge as is for now, or update manually

// Write updated README
fs.writeFileSync(readmePath, readme, 'utf8');
console.log('✅ README.md updated successfully!');
console.log(`   Statements: ${statements}%`);
console.log(`   Branches: ${branches}%`);
console.log(`   Functions: ${functions}%`);
console.log(`   Lines: ${lines}%`);
console.log(`   Average: ${avgCoverage}%`);
