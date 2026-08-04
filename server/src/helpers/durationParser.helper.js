'use strict';

/**
 * Duration Parser Helper — the single source of truth for the
 * structured duration format (number + unit) enforced across the
 * entire system, per client instruction. Programme.duration REMAINS a
 * plain String on the schema — this helper is what guarantees every
 * string that ever reaches that field is well-formed, by composing it
 * server-side from validated (value, unit) pairs rather than trusting
 * arbitrary free text.
 */

export const DURATION_UNITS = Object.freeze({ DAY: 'day', WEEK: 'week', MONTH: 'month', YEAR: 'year' });

// Bounded per client's own logic: a unit is only valid up to how many
// of it fit within a year (use the next unit up for longer spans).
export const DURATION_UNIT_MAX = Object.freeze({ day: 366, week: 52, month: 12, year: 10 });

const DAYS_PER_UNIT = Object.freeze({ day: 1, week: 7, month: 30, year: 365 });
const DURATION_STRING_PATTERN = /^(\d+)\s+(day|days|week|weeks|month|months|year|years)$/i;

export function isValidDurationUnit(unit) {
    return Object.values(DURATION_UNITS).includes(unit);
}

export function isValidDurationValue(value, unit) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1) return false;
    const max = DURATION_UNIT_MAX[unit];
    return !!max && n <= max;
}

/** Composes the canonical "N unit(s)" string — the only writer of Programme.duration. */
export function formatDurationString(value, unit) {
    const n = Number(value);
    return `${n} ${n === 1 ? unit : `${unit}s`}`;
}

/** Parses the canonical string back into total days — used by the popularity engine. Returns null if malformed (defense-in-depth; should never happen given the writer above). */
export function parseDurationToDays(durationString) {
    if (!durationString || typeof durationString !== 'string') return null;
    const match = durationString.trim().match(DURATION_STRING_PATTERN);
    if (!match) return null;
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase().replace(/s$/, '');
    const multiplier = DAYS_PER_UNIT[unit];
    return multiplier ? value * multiplier : null;
}

export default { DURATION_UNITS, DURATION_UNIT_MAX, isValidDurationUnit, isValidDurationValue, formatDurationString, parseDurationToDays };