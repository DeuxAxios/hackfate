# QUESTION_MATRIX.md

Project: HackFate public inventory and depiction
Date: 2026-01-22
Owner: Anthony Diaz

## Open Questions and Resolution Methods

1) Which numerical benchmarks can be stated publicly?
- Why it matters: numeric claims are high risk if unverifiable or IP-sensitive.
- Resolve by: choose a public-safe tier per claim (Public, Partner-only, Private). Record in EXECUTION_PLAN.md.

2) Which proofs can be linked publicly (Lean/Coq files) vs described only?
- Why it matters: proofs increase credibility but may expose implementation detail.
- Resolve by: mark each proof as Public/Redacted/Private with path and rationale.

3) Which systems are safe to describe beyond high-level (e.g., MANA/UNHAL, Grover/Toric)?
- Why it matters: could reveal proprietary architecture.
- Resolve by: create a disclosure matrix (system -> safe descriptions -> restricted details).

4) What scope of MYSTIC validation should be shown?
- Why it matters: public accuracy claims should align to evidence set size.
- Resolve by: publish a case-study list only (events + outcomes) with source paths.

5) Which innovation count should be used (101+, 105, 47, 14)?
- Why it matters: multiple catalogs conflict; public count must be consistent.
- Resolve by: reconcile catalogs in a canonical inventory (INSIGHT_LOG evidence + final tally).

6) Which benchmark set should be public (and should we rerun)?
- Why it matters: benchmark claims need reproducible sources.
- Resolve by: select a canonical report (or rerun benches) and record in EXECUTION_PLAN.md.
