# BENCHMARK_EVIDENCE.md

Project: HackFate benchmark evidence sources
Date: 2026-01-22

## Primary (curated) benchmark reports
- NINE65 MANA Boosted Benchmark Report (Criterion) -- /home/acid/Projects/NINE65/MANA_boosted/BENCHMARK_REPORT.md
- NINE65 + SEAL Benchmark Report -- /home/acid/Projects/NINE65/MANA_boosted/NINE65_SEAL_BENCHMARK_REPORT.md
- Canonical MANA-boosted tarball (README + docs) -- /home/acid/Projects/NINE65/MANA_boosted/nine65_mana_with_proofs_20260119.tar.gz
- NINE65 v2 benchmark results (docs) -- /home/acid/Projects/NINE65/NINE65/nine65_v2_complete/V2_BENCHMARK_RESULTS.md
- NINE65 v2 benchmark outputs -- /home/acid/Projects/NINE65/NINE65/nine65_v2_complete/docs/fhe_benchmarks_v2_output.txt
- MYSTIC v2/v3 validation and performance summaries -- /home/acid/Projects/MYSTIC/SYSTEM_STATUS_REPORT.md

## Additional benchmark artifacts in Downloads (needs curation)
- /home/acid/Downloads/BENCHMARK_REPORT.md
- /home/acid/Downloads/BENCHMARK_REPORT (1).md
- /home/acid/Downloads/BENCHMARK_REPORT (2).md
- /home/acid/Downloads/BENCHMARK_REPORT (3).md
- /home/acid/Downloads/BENCHMARK_REPORT (4).md
- /home/acid/Downloads/BENCHMARK_REPORT (5).md
- /home/acid/Downloads/BENCHMARK_RESULTS.md
- /home/acid/Downloads/BENCHMARK_RESULTS (1).md
- /home/acid/Downloads/BENCHMARK_RESULTS (2).md
- /home/acid/Downloads/BENCHMARK_SUITE_STATUS.md
- /home/acid/Downloads/BENCHMARK_SUITE_STATUS 2.md
- /home/acid/Downloads/BENCHMARK_SUITE_STATUS 2 (1).md
- /home/acid/Downloads/benchmark_results.txt
- /home/acid/Downloads/benchmark_results (1).txt
- /home/acid/Downloads/benchmark_output.txt
- /home/acid/Downloads/benchmark_comparison_results.pdf
- /home/acid/Downloads/benchmark_comparison_results (1).pdf

## Candidate bench commands (if rerun is desired)
- NINE65 MANA boosted: `cargo bench -p nine65 --bench fhe_scaling` (from /home/acid/Projects/NINE65/MANA_boosted)
- NINE65 v2 complete: `cargo run --release --features v2 --bin fhe_benchmarks` (from /home/acid/Projects/MYSTIC/nine65_v2_complete)
Note: SIMD is intentionally disabled in favor of MANA/UNHAL accelerators.
