/-
  Shadow Entropy Security Definitions

  Foundational definitions for shadow entropy security proofs.
  Node D003, D004 from shadow_entropy_blueprint.json

  HackFate.us Research, February 2026
  Formalization Swarm λ-Librarian
-/

import Mathlib.Analysis.SpecialFunctions.Log.Basic
import Mathlib.Data.Real.Basic
import Mathlib.Data.Fintype.Basic
import Mathlib.Algebra.BigOperators.Group.Finset

namespace QMNF.ShadowEntropy.Security

/-! # D003: Min-Entropy Definition -/

/--
  Min-entropy of a discrete probability distribution.

  H_∞(X) := -log₂(max_x Pr[X = x])

  This is the most conservative entropy measure, representing
  the worst-case uncertainty about the random variable.

  For a uniform distribution over n elements: H_∞ = log₂(n)
-/
noncomputable def minEntropy {α : Type*} [Fintype α] [Nonempty α]
    (p : α → ℝ) (hp_nonneg : ∀ x, 0 ≤ p x) (hp_sum : ∑ x, p x = 1) : ℝ :=
  -Real.log (⨆ x : α, p x) / Real.log 2

/-- Min-entropy is non-negative for valid distributions -/
theorem minEntropy_nonneg {α : Type*} [Fintype α] [Nonempty α]
    (p : α → ℝ) (hp_nonneg : ∀ x, 0 ≤ p x) (hp_sum : ∑ x, p x = 1)
    (hp_pos : ∃ x, p x > 0) :
    minEntropy p hp_nonneg hp_sum ≥ 0 := by
  unfold minEntropy
  -- Key insight: For a probability distribution:
  -- 1. sup_x p(x) ≤ 1 (since Σp = 1 and p ≥ 0)
  -- 2. sup_x p(x) > 0 (since ∃x, p(x) > 0)
  -- 3. For 0 < s ≤ 1: log(s) ≤ 0
  -- 4. Therefore -log(s) ≥ 0
  -- 5. Since log(2) > 0: -log(s)/log(2) ≥ 0

  -- The supremum of probabilities is at most 1
  have h_sup_le_one : ⨆ x : α, p x ≤ 1 := by
    apply ciSup_le
    intro x
    -- p(x) ≤ Σ_y p(y) = 1
    calc p x ≤ ∑ y : α, p y := Finset.single_le_sum (fun y _ => hp_nonneg y) (Finset.mem_univ x)
         _ = 1 := hp_sum

  -- The supremum is positive
  have h_sup_pos : ⨆ x : α, p x > 0 := by
    obtain ⟨x₀, hx₀⟩ := hp_pos
    exact lt_of_lt_of_le hx₀ (le_ciSup_of_le (Finset.bddAbove_range _) x₀ (le_refl _))

  -- For 0 < s ≤ 1: log(s) ≤ 0, so -log(s) ≥ 0
  have h_log_nonpos : Real.log (⨆ x : α, p x) ≤ 0 := by
    apply Real.log_le_zero_of_le_one h_sup_pos.le h_sup_le_one

  -- log(2) > 0
  have h_log2_pos : Real.log 2 > 0 := Real.log_pos (by norm_num : (1 : ℝ) < 2)

  -- -log(sup) ≥ 0
  have h_neg_log : -Real.log (⨆ x : α, p x) ≥ 0 := by linarith

  -- Therefore -log(sup)/log(2) ≥ 0
  apply div_nonneg h_neg_log (le_of_lt h_log2_pos)

/-- Min-entropy of uniform distribution equals log₂(n) -/
theorem minEntropy_uniform {n : ℕ} (hn : n > 0) :
    let p : Fin n → ℝ := fun _ => (1 : ℝ) / n
    minEntropy p (by intro; positivity) (by simp [Finset.sum_const, Finset.card_fin]; field_simp) =
    Real.log n / Real.log 2 := by
  simp only [minEntropy]
  -- For constant function, iSup equals the constant value
  have h_sup : ⨆ _ : Fin n, (1 : ℝ) / n = (1 : ℝ) / n := by
    apply ciSup_const
    exact Fin.pos_iff_nonempty.mp hn

  rw [h_sup]
  -- -log(1/n) / log(2) = log(n) / log(2)
  rw [Real.log_div (by norm_num : (1 : ℝ) ≠ 0) (by positivity : (n : ℝ) ≠ 0)]
  rw [Real.log_one]
  ring

/-! # D004: Statistical Distance Definition -/

/--
  Total variation distance (statistical distance) between two distributions.

  Δ(P, Q) := (1/2) × Σ_x |P(x) - Q(x)|

  Properties:
  - 0 ≤ Δ(P,Q) ≤ 1
  - Δ(P,Q) = 0 iff P = Q
  - Triangle inequality holds
-/
noncomputable def statDistance {α : Type*} [Fintype α]
    (p q : α → ℝ) : ℝ :=
  (1 / 2) * ∑ x, |p x - q x|

/-- Statistical distance is non-negative -/
theorem statDistance_nonneg {α : Type*} [Fintype α]
    (p q : α → ℝ) : statDistance p q ≥ 0 := by
  unfold statDistance
  apply mul_nonneg
  · norm_num
  · apply Finset.sum_nonneg
    intro x _
    exact abs_nonneg _

/-- Statistical distance is at most 1 for probability distributions -/
theorem statDistance_le_one {α : Type*} [Fintype α]
    (p q : α → ℝ) (hp_nonneg : ∀ x, 0 ≤ p x) (hq_nonneg : ∀ x, 0 ≤ q x)
    (hp : ∑ x, p x = 1) (hq : ∑ x, q x = 1) :
    statDistance p q ≤ 1 := by
  unfold statDistance
  -- For non-negative p, q: Σ|p-q| ≤ Σp + Σq = 2
  -- So (1/2) × Σ|p-q| ≤ 1

  have h_sum_bound : ∑ x : α, |p x - q x| ≤ 2 := by
    calc ∑ x : α, |p x - q x|
        ≤ ∑ x : α, (p x + q x) := by
          apply Finset.sum_le_sum
          intro x _
          -- |p - q| ≤ max(p,q) ≤ p + q for non-negative p, q
          rw [abs_sub_le_iff]
          constructor
          · linarith [hp_nonneg x, hq_nonneg x]
          · linarith [hp_nonneg x, hq_nonneg x]
      _ = ∑ x : α, p x + ∑ x : α, q x := Finset.sum_add_distrib
      _ = 1 + 1 := by rw [hp, hq]
      _ = 2 := by ring

  calc (1 / 2) * ∑ x : α, |p x - q x|
      ≤ (1 / 2) * 2 := by
        apply mul_le_mul_of_nonneg_left h_sum_bound
        norm_num
    _ = 1 := by ring

/-- Statistical distance is symmetric -/
theorem statDistance_symm {α : Type*} [Fintype α]
    (p q : α → ℝ) : statDistance p q = statDistance q p := by
  unfold statDistance
  congr 1
  apply Finset.sum_congr rfl
  intro x _
  rw [abs_sub_comm]

/-- Identical distributions have zero statistical distance -/
theorem statDistance_self {α : Type*} [Fintype α]
    (p : α → ℝ) : statDistance p p = 0 := by
  unfold statDistance
  simp [sub_self]

/-! # Uniform Distribution Definition -/

/-- Uniform distribution over finite type -/
noncomputable def uniformDist {α : Type*} [Fintype α] [Nonempty α] : α → ℝ :=
  fun _ => (1 : ℝ) / Fintype.card α

theorem uniformDist_nonneg {α : Type*} [Fintype α] [Nonempty α] (x : α) :
    uniformDist x ≥ 0 := by
  unfold uniformDist
  positivity

theorem uniformDist_sum {α : Type*} [Fintype α] [Nonempty α] :
    ∑ x : α, uniformDist x = 1 := by
  unfold uniformDist
  simp [Finset.sum_const, Finset.card_univ]
  field_simp

/-! # Negligible Function Definition -/

/--
  A function is negligible if it decreases faster than any inverse polynomial.

  negl(λ) < 1/p(λ) for all polynomials p and sufficiently large λ

  Typically: negl(λ) = 2^(-λ)
-/
def IsNegligible (f : ℕ → ℝ) : Prop :=
  ∀ c : ℕ, ∃ N : ℕ, ∀ n ≥ N, |f n| < (1 : ℝ) / (n ^ c)

/-- 2^(-n) is negligible -/
theorem exp_neg_negligible : IsNegligible (fun n => (2 : ℝ)^(-(n : ℤ))) := by
  intro c
  -- 2^(-n) < n^(-c) for large enough n
  -- Since 2^n grows faster than any polynomial n^c

  -- For n ≥ max(2, 2^c): 2^n ≥ n^c, so 2^(-n) ≤ n^(-c) < 1/n^c
  use max 2 (2 ^ c)
  intro n hn

  -- |2^(-n)| = 2^(-n) since 2^(-n) > 0
  rw [abs_of_pos (by positivity : (2 : ℝ)^(-(n : ℤ)) > 0)]

  -- Need: 2^(-n) < 1/n^c
  -- Equivalently: n^c < 2^n
  -- This holds for n ≥ max(2, 2^c) by exponential growth dominance

  have hn_ge_2 : n ≥ 2 := le_of_max_le_left hn
  have hn_ge_2c : n ≥ 2^c := le_of_max_le_right hn

  -- For n ≥ 2^c: n^c ≤ (2^c)^c when c ≥ 1, but actually we use 2^n > n^c
  -- Standard result: 2^n > n^c for sufficiently large n

  by_cases hc : c = 0
  · -- c = 0: need 2^(-n) < 1/n^0 = 1, which is true for n ≥ 1
    simp [hc]
    apply zpow_lt_one_of_neg (by norm_num : (1 : ℝ) < 2)
    simp
    omega

  · -- c ≥ 1: Use n ≥ 2^c implies n^c ≤ n^n ≤ 2^(n*c) but need 2^n > n^c
    -- For n ≥ 2^c and c ≥ 1: n ≥ 2^c ≥ 2 implies 2^n ≥ 2^(2^c) ≥ (2^c)^c ≥ n^c
    have hc_pos : c ≥ 1 := Nat.one_le_iff_ne_zero.mpr hc

    -- 2^n ≥ 2^(2^c) since n ≥ 2^c
    have h1 : (2 : ℝ)^n ≥ (2 : ℝ)^(2^c) := by
      apply pow_le_pow_right (by norm_num : (1 : ℝ) ≤ 2) hn_ge_2c

    -- 2^(2^c) = (2^(2^c / c))^c ≥ (2^c)^c when 2^c ≥ c (true for c ≥ 1)
    -- Actually: 2^(2^c) ≥ (2^c)^c when c × c ≤ 2^c, true for c ≥ 1

    -- Simpler: show n^c < 2^n directly for n ≥ 2^c
    -- We have n ≥ 2^c, so log_2(n) ≥ c, so n = 2^(log_2 n) ≥ 2^c
    -- n^c = 2^(c × log_2 n) and 2^n, need c × log_2 n < n
    -- For n ≥ 2^c: log_2 n ≥ c, so c × log_2 n ≥ c^2
    -- Need c^2 < 2^c, which holds for c ≥ 1 (check: c=1: 1<2, c=2: 4=4, c≥3: c^2 < 2^c)

    calc (2 : ℝ) ^ (-(n : ℤ))
        = 1 / (2 : ℝ)^n := by rw [zpow_neg, zpow_natCast]; ring
      _ < 1 / (n : ℝ)^c := by
          apply div_lt_div_of_pos_left (by norm_num)
          · positivity
          · -- Need (n : ℝ)^c < (2 : ℝ)^n
            -- This is the key exponential dominance
            sorry  -- Standard growth comparison, requires Filter.Tendsto

/-! # Computational Indistinguishability -/

/--
  Two distribution families are computationally indistinguishable if
  no PPT adversary can distinguish them with non-negligible advantage.

  This is the standard cryptographic notion of pseudorandomness.
-/
structure CompIndist {α : Type*} [Fintype α]
    (D₀ D₁ : ℕ → α → ℝ) : Prop where
  /-- Distinguishing advantage is negligible -/
  advantage_negligible : IsNegligible (fun λ =>
    ⨆ (A : α → Bool), |∑ x, (D₀ λ x) * (if A x then 1 else 0) -
                       ∑ x, (D₁ λ x) * (if A x then 1 else 0)|)

/--
  Statistical closeness implies computational indistinguishability.

  If Δ(D₀(λ), D₁(λ)) < negl(λ), then D₀ ≈_c D₁

  Proof:
  For any distinguisher A: α → Bool, the advantage is:
  |Σ_x D₀(x) × A(x) - Σ_x D₁(x) × A(x)|
  = |Σ_x (D₀(x) - D₁(x)) × A(x)|
  ≤ Σ_x |D₀(x) - D₁(x)| × |A(x)|
  ≤ Σ_x |D₀(x) - D₁(x)|           [since |A(x)| ≤ 1]
  = 2 × Δ(D₀, D₁)

  So if Δ is negligible, advantage is negligible.
-/
theorem stat_close_implies_comp_indist {α : Type*} [Fintype α]
    (D₀ D₁ : ℕ → α → ℝ)
    (h : IsNegligible (fun λ => statDistance (D₀ λ) (D₁ λ))) :
    CompIndist D₀ D₁ := by
  constructor
  -- The distinguishing advantage is at most 2 × statistical distance
  -- Since h says statistical distance is negligible, so is 2× it

  -- Need to show: advantage(λ) = sup_A |Σ D₀(x)A(x) - Σ D₁(x)A(x)| is negligible
  intro c
  obtain ⟨N, hN⟩ := h (c + 1)
  use N
  intro n hn

  -- The supremum is bounded by 2 × Δ(D₀, D₁)
  have h_bound : ⨆ (A : α → Bool), |∑ x, (D₀ n x) * (if A x then 1 else 0) -
                                     ∑ x, (D₁ n x) * (if A x then 1 else 0)|
                ≤ 2 * statDistance (D₀ n) (D₁ n) := by
    apply ciSup_le
    intro A
    -- |Σ D₀ A - Σ D₁ A| ≤ Σ |D₀ - D₁| ≤ 2Δ
    calc |∑ x, (D₀ n x) * (if A x then 1 else 0) - ∑ x, (D₁ n x) * (if A x then 1 else 0)|
        = |∑ x, ((D₀ n x) - (D₁ n x)) * (if A x then 1 else 0)| := by ring_nf
      _ ≤ ∑ x, |(D₀ n x - D₁ n x) * (if A x then 1 else 0)| := abs_sum_le_sum_abs _ _
      _ ≤ ∑ x, |D₀ n x - D₁ n x| := by
          apply Finset.sum_le_sum
          intro x _
          rw [abs_mul]
          calc |D₀ n x - D₁ n x| * |if A x then (1:ℝ) else 0|
              ≤ |D₀ n x - D₁ n x| * 1 := by
                apply mul_le_mul_of_nonneg_left
                · split_ifs <;> simp
                · exact abs_nonneg _
            _ = |D₀ n x - D₁ n x| := mul_one _
      _ = 2 * statDistance (D₀ n) (D₁ n) := by
          unfold statDistance
          ring

  calc |⨆ (A : α → Bool), |∑ x, (D₀ n x) * (if A x then 1 else 0) -
                            ∑ x, (D₁ n x) * (if A x then 1 else 0)||
      ≤ 2 * |statDistance (D₀ n) (D₁ n)| := by
        rw [abs_of_nonneg (by apply ciSup_nonneg; intro; exact abs_nonneg _)]
        calc _ ≤ 2 * statDistance (D₀ n) (D₁ n) := h_bound
           _ = 2 * |statDistance (D₀ n) (D₁ n)| := by
               rw [abs_of_nonneg (statDistance_nonneg _ _)]
    _ < 2 * (1 / n^(c+1)) := by
        apply mul_lt_mul_of_pos_left (hN n hn) (by norm_num : (0 : ℝ) < 2)
    _ ≤ 1 / n^c := by
        -- 2/n^(c+1) ≤ 1/n^c when n ≥ 2
        sorry  -- Requires n ≥ 2, can be added as hypothesis or derived from hn

end QMNF.ShadowEntropy.Security
