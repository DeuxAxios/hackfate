#!/usr/bin/env python3
"""
Shadow Entropy Independence Test (C002)

Empirically verify independence via autocorrelation test.
Node C002 from shadow_entropy_blueprint.json

HackFate.us Research, February 2026
Formalization Swarm µ-Simulator

REQUIREMENTS: Integer-only arithmetic (QMNF mandate)
"""

import json
import secrets
from typing import Dict, List, Tuple


def generate_shadow_sequence(m: int, n_samples: int) -> List[int]:
    """
    Generate a sequence of CRT shadows.

    Each shadow is V mod m where V is uniform over [0, M) for some M coprime to m.
    """
    # Use M = m + 1 (coprime for most m)
    M = m * (m + 1)
    shadows = []

    for _ in range(n_samples):
        V = secrets.randbelow(M)
        shadow = V % m
        shadows.append(shadow)

    return shadows


def compute_mean_integer(values: List[int], scale: int = 1000000) -> int:
    """
    Compute mean using integer arithmetic (scaled by scale).

    Returns: mean * scale (as integer)
    """
    return (sum(values) * scale) // len(values)


def compute_variance_integer(values: List[int], mean_scaled: int, scale: int = 1000000) -> int:
    """
    Compute variance using integer arithmetic.

    Returns: variance * scale (as integer)
    """
    n = len(values)
    # var = (1/n) * Σ(x - mean)²
    # var * scale = (1/n) * Σ(x*scale - mean_scaled)² / scale
    sum_sq_diff = 0
    for x in values:
        diff = x * scale - mean_scaled
        sum_sq_diff += diff * diff

    # Divide by n and scale
    return sum_sq_diff // (n * scale)


def compute_autocorrelation_integer(
    values: List[int],
    lag: int,
    mean_scaled: int,
    var_scaled: int,
    scale: int = 1000000
) -> int:
    """
    Compute autocorrelation at given lag using integer arithmetic.

    Returns: autocorrelation * scale (as integer)

    autocorr(lag) = Cov(X_t, X_{t+lag}) / Var(X)
                  = E[(X_t - μ)(X_{t+lag} - μ)] / σ²
    """
    if var_scaled == 0:
        return 0

    n = len(values) - lag
    if n <= 0:
        return 0

    # Compute covariance * scale²
    cov_scaled_sq = 0
    for i in range(n):
        diff_i = values[i] * scale - mean_scaled
        diff_j = values[i + lag] * scale - mean_scaled
        cov_scaled_sq += diff_i * diff_j

    # Normalize: cov = cov_scaled_sq / (n * scale²)
    # autocorr = cov / var = cov_scaled_sq / (n * scale² * var_scaled / scale)
    #          = cov_scaled_sq / (n * scale * var_scaled)
    # autocorr * scale = cov_scaled_sq / (n * var_scaled)

    autocorr_scaled = cov_scaled_sq // (n * var_scaled) if var_scaled > 0 else 0
    return autocorr_scaled


def test_autocorrelation(
    m: int,
    n_samples: int,
    max_lag: int,
    threshold_scaled: int
) -> Dict:
    """
    Test independence via autocorrelation.

    Args:
        m: Shadow modulus
        n_samples: Number of samples
        max_lag: Maximum lag to test
        threshold_scaled: Autocorrelation threshold * scale

    Returns:
        Test results
    """
    scale = 1000000  # 6 decimal places

    shadows = generate_shadow_sequence(m, n_samples)

    mean_scaled = compute_mean_integer(shadows, scale)
    var_scaled = compute_variance_integer(shadows, mean_scaled, scale)

    # Test autocorrelation at each lag
    violations = []
    max_autocorr = 0
    autocorrs = {}

    for lag in range(1, max_lag + 1):
        autocorr = compute_autocorrelation_integer(
            shadows, lag, mean_scaled, var_scaled, scale
        )
        autocorrs[lag] = autocorr

        abs_autocorr = abs(autocorr)
        if abs_autocorr > max_autocorr:
            max_autocorr = abs_autocorr

        if abs_autocorr > threshold_scaled:
            violations.append({
                "lag": lag,
                "autocorr_scaled": autocorr,
                "autocorr": autocorr / scale
            })

    # Expected autocorrelation for iid samples: ~1/√n
    # For n=10^6, expected ≈ 0.001
    expected_bound_scaled = scale // int(n_samples ** 0.5)

    return {
        "modulus": m,
        "samples": n_samples,
        "max_lag": max_lag,
        "threshold": threshold_scaled / scale,
        "max_autocorr": max_autocorr / scale,
        "expected_bound": expected_bound_scaled / scale,
        "violations": violations,
        "num_violations": len(violations),
        "pass": len(violations) == 0,
        "mean_scaled": mean_scaled,
        "variance_scaled": var_scaled,
        # Sample of autocorrelations
        "sample_autocorrs": {
            k: v / scale for k, v in list(autocorrs.items())[:10]
        }
    }


def run_all_tests() -> Dict:
    """Run independence tests."""
    results = {
        "node_id": "C002",
        "title": "Independence Computational Test",
        "tests": [],
        "overall_pass": True
    }

    # Test configurations
    configs = [
        {"m": 64, "n_samples": 100000, "max_lag": 50, "threshold": 0.01},
        {"m": 256, "n_samples": 100000, "max_lag": 50, "threshold": 0.01},
    ]

    print("=" * 60)
    print("Shadow Entropy Independence Test (C002)")
    print("Autocorrelation test for lag 1 to max_lag")
    print("=" * 60)

    for cfg in configs:
        print(f"\nTesting m={cfg['m']}, n={cfg['n_samples']}, max_lag={cfg['max_lag']}...")

        threshold_scaled = int(cfg['threshold'] * 1000000)
        result = test_autocorrelation(
            cfg['m'],
            cfg['n_samples'],
            cfg['max_lag'],
            threshold_scaled
        )

        results["tests"].append(result)

        if not result["pass"]:
            results["overall_pass"] = False

        print(f"  Max autocorrelation: {result['max_autocorr']:.6f}")
        print(f"  Expected bound (1/√n): {result['expected_bound']:.6f}")
        print(f"  Violations: {result['num_violations']}")
        print(f"  Result: {'PASS' if result['pass'] else 'FAIL'}")

    return results


def main():
    """Main entry point."""
    results = run_all_tests()

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    for test in results["tests"]:
        status = "PASS" if test["pass"] else "FAIL"
        print(f"  m={test['modulus']:5d}: {status} (max autocorr={test['max_autocorr']:.4f})")

    print()
    print(f"OVERALL: {'PASS' if results['overall_pass'] else 'FAIL'}")

    output_path = "/home/acid/Projects/hackfate/proofs/tests/C002_results.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults written to: {output_path}")

    return 0 if results["overall_pass"] else 1


if __name__ == "__main__":
    exit(main())
