#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJSON(relPath) {
  const full = path.join(process.cwd(), relPath);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function parseCSVLine(line) {
  const out = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out.map(v => v.trim());
}

function readCSV(relPath) {
  const full = path.join(process.cwd(), relPath);
  const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const cols = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? '';
    });
    return obj;
  });
}

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exitCode = 1;
}

function main() {
  const inventory = readJSON('reports/inventory_public.json');
  const evidence = readCSV('reports/evidence_map.csv');
  const disclosure = readCSV('reports/disclosure_matrix.csv');
  const benchmarks = readJSON('reports/benchmarks_curated.json');

  const invSlugs = new Set();
  for (const item of inventory) {
    if (invSlugs.has(item.slug)) {
      fail(`Duplicate slug in inventory: ${item.slug}`);
    }
    invSlugs.add(item.slug);
    if (!item.disclosure) fail(`Missing disclosure for ${item.slug}`);
    if (!item.tier) fail(`Missing tier for ${item.slug}`);
    if (!item.summary) fail(`Missing summary for ${item.slug}`);
  }

  const evSlugs = new Set(evidence.map(e => e.slug));
  for (const slug of invSlugs) {
    if (!evSlugs.has(slug)) {
      fail(`Inventory slug missing in evidence_map: ${slug}`);
    }
  }
  for (const e of evidence) {
    if (!invSlugs.has(e.slug)) {
      fail(`Evidence map references unknown slug: ${e.slug}`);
    }
    if (!e.evidence_path) fail(`Evidence path missing for ${e.slug}`);
    if (!e.validation_type) fail(`Validation type missing for ${e.slug}`);
  }

  const disclosureMap = new Map(disclosure.map(d => [d.slug, d]));
  for (const slug of invSlugs) {
    if (!disclosureMap.has(slug)) {
      fail(`Disclosure missing for slug: ${slug}`);
      continue;
    }
    const row = disclosureMap.get(slug);
    if (!row.disclosure) fail(`Disclosure value empty for ${slug}`);
  }

  const benchIssues = benchmarks.filter(b => !b.slug || !b.value || !b.metric || !b.source_path);
  if (benchIssues.length) {
    benchIssues.forEach(b => fail(`Benchmark entry incomplete: ${JSON.stringify(b)}`));
  }

  if (!process.exitCode) {
    console.log('✅ Inventory, evidence, disclosure, and benchmarks are internally consistent.');
    console.log(`   Inventory items: ${inventory.length}`);
    console.log(`   Evidence rows: ${evidence.length}`);
    console.log(`   Disclosure rows: ${disclosure.length}`);
    console.log(`   Benchmarks curated: ${benchmarks.length}`);
  }
}

main();
