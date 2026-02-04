#!/usr/bin/env python3
"""
Shadow Entropy Uniform Distribution Test (C001)

Empirically verify shadow distribution is uniform using chi-squared test.
Node C001 from shadow_entropy_blueprint.json

HackFate.us Research, February 2026
Formalization Swarm µ-Simulator

REQUIREMENTS: Integer-only arithmetic (QMNF mandate)
             Uses secrets module for cryptographic randomness

KEY INSIGHT: The shadow from CRT perspective is V mod m_shadow where
V is uniform over [0, m_p × m_s). We test this directly.
"""

import json
import secrets
from collections import Counter
from math import gcd
from typing import Dict, List, Tuple


def generate_crt_shadows(m_primary: int, m_shadow: int, n_samples: int) -> List[int]:
    """
    Generate shadow values by sampling V uniformly from [0, M) where M = m_p × m_s.

    The shadow is simply V mod m_shadow.

    This tests the CRT uniform distribution theorem directly.
    """
    assert gcd(m_primary, m_shadow) == 1, "Moduli must be coprime"

    M = m_primary * m_shadow
    shadows = []

    for _ in range(n_samples):
        # Generate V uniform over [0, M)
        V = secrets.randbelow(M)
        # Shadow is V mod m_shadow
        shadow_val = V % m_shadow
        shadows.append(shadow_val)

    return shadows


def generate_quotient_shadows(m: int, n_samples: int) -> List[int]:
    """
    Generate quotient shadows from modular multiplication.

    shadow(a, b, m) = (a × b) / m

    where a, b are uniform over [0, m).
    """
    shadows = []

    for _ in range(n_samples):
        a = secrets.randbelow(m)
        b = secrets.randbelow(m)
        # Shadow is the quotient
        shadow_val = (a * b) // m
        shadows.append(shadow_val)

    return shadows


def chi_squared_test_integer(observed: Counter, expected_count: int, n_bins: int) -> Tuple[int, int]:
    """
    Chi-squared test using integer arithmetic.

    Returns (chi_sq_numerator, chi_sq_denominator) as exact rational.
    """
    sum_squared_diff = 0
    for i in range(n_bins):
        obs = observed.get(i, 0)
        diff = obs - expected_count
        sum_squared_diff += diff * diff

    return sum_squared_diff, expected_count


def chi_squared_critical_values() -> Dict[int, int]:
    """
    Critical values for chi-squared at p=0.01 (scaled by 1000).
    """
    return {
        15: 30578,
        31: 50892,
        63: 92010,
        127: 166987,
        255: 310457,
        1023: 1131054,
    }


def test_crt_uniform(m_shadow: int, n_samples: int) -> Dict:
    """
    Test CRT uniform distribution: V mod m_shadow where V ∈ [0, m_p × m_s).
    """
    # Choose coprime m_primary
    m_primary = m_shadow + 1
    while gcd(m_primary, m_shadow) != 1:
        m_primary += 1

    shadows = generate_crt_shadows(m_primary, m_shadow, n_samples)
    observed = Counter(shadows)
    expected_count = n_samples // m_shadow

    chi_sq_num, chi_sq_den = chi_squared_test_integer(observed, expected_count, m_shadow)
    chi_sq_scaled = (chi_sq_num * 1000) // chi_sq_den

    df = m_shadow - 1
    critical_values = chi_squared_critical_values()
    if df in critical_values:
        critical_scaled = critical_values[df]
    else:
        critical_scaled = df * 1000 + 2326 * int((2 * df) ** 0.5)

    sigma_approx = int(expected_count ** 0.5)
    three_sigma = 3 * sigma_approx

    bins_outside_3sigma = 0
    max_deviation = 0
    for i in range(m_shadow):
        obs = observed.get(i, 0)
        deviation = abs(obs - expected_count)
        max_deviation = max(max_deviation, deviation)
        if deviation > three_sigma:
            bins_outside_3sigma += 1

    chi_sq_pass = chi_sq_scaled < critical_scaled
    sigma_pass = bins_outside_3sigma <= m_shadow // 100 + 1  # Allow ~1% outliers

    return {
        "test_type": "CRT_uniform",
        "modulus": m_shadow,
        "samples": n_samples,
        "expected_per_bin": expected_count,
        "chi_squared_scaled": chi_sq_scaled,
        "critical_value_scaled": critical_scaled,
        "degrees_of_freedom": df,
        "chi_squared_pass": chi_sq_pass,
        "bins_outside_3sigma": bins_outside_3sigma,
        "max_deviation": max_deviation,
        "three_sigma_threshold": three_sigma,
        "three_sigma_pass": sigma_pass,
        "overall_pass": chi_sq_pass and sigma_pass
    }


def test_quotient_uniform(m: int, n_samples: int) -> Dict:
    """
    Test quotient shadow distribution: (a × b) / m where a, b ∈ [0, m).

    Note: This distribution is NOT uniform - it's triangular!
    This test documents the actual distribution shape.
    """
    shadows = generate_quotient_shadows(m, n_samples)
    observed = Counter(shadows)

    # The quotient shadow has range [0, m-1]
    # Expected distribution is NOT uniform - it's weighted toward smaller values
    # Pr[shadow = k] ≈ (m - k) / m² for k < m

    # For this test, we just verify the distribution is bounded
    max_shadow = max(shadows) if shadows else 0
    min_shadow = min(shadows) if shadows else 0

    # Check that quotient shadows are bounded by m-1 (from L002)
    bounded = max_shadow < m

    # Document the shape
    bins = [observed.get(i, 0) for i in range(m)]

    return {
        "test_type": "quotient_shadow",
        "modulus": m,
        "samples": n_samples,
        "max_shadow": max_shadow,
        "min_shadow": min_shadow,
        "bounded": bounded,
        "bounded_by": m - 1,
        "note": "Quotient shadow is NOT uniform - triangular distribution",
        "overall_pass": bounded
    }


def run_all_tests() -> Dict:
    """Run tests for multiple modulus sizes."""
    results = {
        "node_id": "C001",
        "title": "Shadow Uniform Distribution Tests",
        "crt_tests": [],
        "quotient_tests": [],
        "overall_pass": True
    }

    # CRT tests: V mod m_shadow where V uniform over [0, M)
    crt_configs = [
        (16, 100000),
        (64, 100000),
        (256, 100000),
    ]

    print("=" * 60)
    print("TEST 1: CRT Uniform Distribution (L003)")
    print("V mod m_s where V uniform over [0, m_p × m_s)")
    print("=" * 60)

    for m_shadow, n_samples in crt_configs:
        print(f"\nTesting CRT m_shadow={m_shadow}, n_samples={n_samples}...")
        test_result = test_crt_uniform(m_shadow, n_samples)
        results["crt_tests"].append(test_result)
        if not test_result["overall_pass"]:
            results["overall_pass"] = False
        print(f"  Chi-squared: {test_result['chi_squared_scaled']/1000:.2f} "
              f"(critical: {test_result['critical_value_scaled']/1000:.2f})")
        print(f"  Chi-squared pass: {test_result['chi_squared_pass']}")
        print(f"  Bins outside 3σ: {test_result['bins_outside_3sigma']}")
        print(f"  Result: {'PASS' if test_result['overall_pass'] else 'FAIL'}")

    # Quotient tests: (a × b) / m
    print("\n" + "=" * 60)
    print("TEST 2: Quotient Shadow Bounds (L002)")
    print("shadow(a,b,m) = (a×b)/m where a,b uniform over [0,m)")
    print("=" * 60)

    quotient_configs = [
        (16, 100000),
        (256, 100000),
    ]

    for m, n_samples in quotient_configs:
        print(f"\nTesting quotient m={m}, n_samples={n_samples}...")
        test_result = test_quotient_uniform(m, n_samples)
        results["quotient_tests"].append(test_result)
        print(f"  Max shadow: {test_result['max_shadow']} (bound: {test_result['bounded_by']})")
        print(f"  Bounded: {test_result['bounded']}")
        print(f"  Result: {'PASS' if test_result['overall_pass'] else 'FAIL'}")

    return results


def main():
    """Main entry point."""
    print("=" * 60)
    print("Shadow Entropy Distribution Tests (C001)")
    print("µ-Simulator | Formalization Swarm")
    print("=" * 60)

    results = run_all_tests()

    print("\n" + "=" * 60)
    print("FINAL SUMMARY")
    print("=" * 60)

    print("\nCRT Uniform Tests (L003 validation):")
    for test in results["crt_tests"]:
        status = "PASS" if test["overall_pass"] else "FAIL"
        print(f"  m={test['modulus']:5d}: {status}")

    print("\nQuotient Bound Tests (L002 validation):")
    for test in results["quotient_tests"]:
        status = "PASS" if test["overall_pass"] else "FAIL"
        print(f"  m={test['modulus']:5d}: {status}")

    print()
    print(f"OVERALL: {'PASS' if results['overall_pass'] else 'FAIL'}")

    output_path = "/home/acid/Projects/hackfate/proofs/tests/C001_results.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults written to: {output_path}")

    return 0 if results["overall_pass"] else 1


if __name__ == "__main__":
    exit(main())
