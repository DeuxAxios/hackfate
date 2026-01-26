# EXECUTION_PLAN.md

Project: HackFate public inventory and depiction
Date: 2026-01-22
Scope: Build a public-safe, accurate innovation accounting for hackfate.us
Principles: integer-only claims must be evidence-backed; no proprietary leakage; deterministic and reproducible descriptions.

## 1) Goals and Acceptance Criteria
- Goal 1: Create a single canonical inventory of innovations with status (Proved/Validated/Designed/Theoretical).
- Goal 2: Map each public claim to an evidence path with source file.
- Goal 3: Produce website-ready copy blocks for QMNF, NINE65, MYSTIC, COSMOS-HD-Neural, Toric Grover, and tools.

Acceptance criteria:
- [ ] Every public claim has at least one evidence path.
- [ ] Proof-backed items list the proof file (Lean/Coq) without exposing proprietary math.
- [ ] Validation claims are framed as case studies, not universal guarantees.
- [ ] Innovation count is consistent across pages.

## 2) Task List (Ordered)
- [ ] Task 1 - Canonical inventory merge: reconcile counts from MYSTIC/NINE65/QMNF/COSMOS documents - verification: reconciled table in INSIGHT_LOG.md.
- [ ] Task 2 - Disclosure matrix: assign Public/Partner-only/Private to each innovation and proof set - verification: disclosure table added to INSIGHT_LOG.md.
- [ ] Task 3 - Evidence map finalization: attach file paths to each public claim - verification: evidence links embedded in inventory.
- [ ] Task 4 - Website-safe copy blocks for sections (QMNF, NINE65, MYSTIC, COSMOS, Toric Grover, Tools) - verification: copy review checklist.
- [ ] Task 5 - Optional public artifacts: link only to public repos (K-Elimination, MYSTIC) and sanitized proof summaries - verification: link audit.
- [ ] Task 6 - Benchmark curation: pick canonical benchmark report(s) or rerun selected benches - verification: BENCHMARK_EVIDENCE.md with sources.
  - Preferred baseline: MANA-boosted tarball (nine65_mana_with_proofs_20260119.tar.gz).

## 3) Validation Gates
- Gate A: Consistency check (counts and status across catalogs agree within 1 version) - done by cross-referencing: NINE65_CODEX_REFERENCE.md, MYSTIC/INNOVATION_RESOURCE_INDEX.md, QMNF_EXECUTIVE_SUMMARY.md, COMPREHENSIVE_PROGRESS_REPORT.md.
- Gate B: Claim-risk review (every numeric claim tagged and approved) - done by disclosure matrix.

## 4) Risks
- Risk: Overstating accuracy or speed without public evidence - mitigation: phrase as validated case study, provide evidence paths.
- Risk: IP exposure by publishing formulas - mitigation: remove formulas from public copy.
- Risk: Catalog drift over time - mitigation: maintain a single canonical inventory file.

## 5) Dependencies
- Evidence files listed in INSIGHT_LOG.md
- User decisions on disclosure tiers and public claim thresholds
