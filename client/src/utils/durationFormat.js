/**
 * Frontend mirror of the backend's durationParser.helper.js — used to
 * pre-populate edit forms (parse existing "6 months" → {value:6, unit:month})
 * and to run the same client-side range validation before a request is
 * even sent, per the client's explicit instruction.
 */

import { DURATION_UNIT_MAX } from './constants';

const DURATION_STRING_PATTERN = /^(\d+)\s+(day|days|week|weeks|month|months|year|years)$/i;

export function parseDurationString(durationString) {
    if (!durationString) return { value: '', unit: '' };
    const match = durationString.trim().match(DURATION_STRING_PATTERN);
    if (!match) return { value: '', unit: '' };
    return { value: match[1], unit: match[2].toLowerCase().replace(/s$/, '') };
}

export function isValidDurationValue(value, unit) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1) return false;
    const max = DURATION_UNIT_MAX[unit];
    return !!max && n <= max;
}