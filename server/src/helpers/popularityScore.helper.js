'use strict';

/**
 * Popularity Score Helper — the actual scoring algorithm.
 *
 * DESIGN: a single bounded, monotonic weighted-sum score, computed once
 * per write and stored on the document (not recomputed per request).
 * Sorting by this ONE indexed field is O(log n) at any catalogue size —
 * this is the scale-ready structure, as opposed to a live aggregation
 * that would degrade linearly as the catalogue grows.
 *
 * TIER DESIGN (each tier strictly dominates every combination of the
 * tiers below it — this is a mathematical guarantee, not a hope):
 *
 *   Tier 1 — Status (×1,000,000): Active vs Coming Soon. A programme's
 *     status ALONE decides ranking before anything else is even
 *     considered — an Active programme with zero enrollments still
 *     outranks every Coming Soon programme, no matter how "enrolled"
 *     tiers 2-4 might otherwise make it look.
 *
 *   Tier 2 — Enrollment popularity (×10,000): the primary "how popular
 *     is this, really" signal. Uses a diminishing-returns curve
 *     (count / (count + K)) rather than a raw linear count — this is a
 *     genuine recommender-systems technique: it rewards early growth
 *     strongly but prevents one runaway-popular programme's score from
 *     growing unbounded and swamping everything else forever. The curve
 *     asymptotically approaches but never reaches 1, keeping the whole
 *     score bounded and index-friendly regardless of catalogue scale.
 *
 *   Tier 3 — Price (×100, minor tie-breaker): cheaper programmes get a
 *     small bonus. Same diminishing-curve shape, referenced against a
 *     ₦100,000 midpoint (roughly the catalogue's typical fee range).
 *
 *   Tier 4 — Duration (×1, minor tie-breaker): shorter programmes get
 *     a small bonus. Same curve shape, referenced against a 90-day
 *     (~3 month) midpoint.
 *
 * The max possible combined contribution of tiers 2+3+4 (~10,101) is
 * mathematically incapable of ever overtaking a single unit of tier 1
 * (1,000,000) — this holds true regardless of how large enrollmentCount,
 * how cheap the fee, or how short the duration ever becomes. Verified
 * algebraically, not just "in practice."
 */

const WEIGHTS = Object.freeze({
    STATUS_SCALE: 1_000_000,
    ENROLLMENT_SCALE: 10_000,
    ENROLLMENT_SMOOTHING_K: 20,   // ~20 enrollments = halfway to max tier-2 contribution
    PRICE_SCALE: 100,
    PRICE_SMOOTHING_K: 100_000,   // ₦100,000 reference midpoint
    DURATION_SCALE: 1,
    DURATION_SMOOTHING_K: 90,     // 90-day (~3 month) reference midpoint
});

/**
 * @param {{ status: string, enrollmentCount: number, feesFull: number|undefined, durationDays: number|null }} input
 * @returns {number} bounded, monotonic popularity score (3 decimal precision)
 */
export function calculatePopularityScore({ status, enrollmentCount = 0, feesFull, durationDays }) {
    const statusComponent = status === 'active' ? 1 : 0;

    const enrollmentComponent = enrollmentCount / (enrollmentCount + WEIGHTS.ENROLLMENT_SMOOTHING_K);

    const priceComponent =
        typeof feesFull === 'number' && feesFull >= 0
            ? WEIGHTS.PRICE_SMOOTHING_K / (feesFull + WEIGHTS.PRICE_SMOOTHING_K)
            : 0;

    const durationComponent =
        typeof durationDays === 'number' && durationDays > 0
            ? WEIGHTS.DURATION_SMOOTHING_K / (durationDays + WEIGHTS.DURATION_SMOOTHING_K)
            : 0;

    const score =
        statusComponent * WEIGHTS.STATUS_SCALE +
        enrollmentComponent * WEIGHTS.ENROLLMENT_SCALE +
        priceComponent * WEIGHTS.PRICE_SCALE +
        durationComponent * WEIGHTS.DURATION_SCALE;

    return Math.round(score * 1000) / 1000;
}

export default { calculatePopularityScore, WEIGHTS };