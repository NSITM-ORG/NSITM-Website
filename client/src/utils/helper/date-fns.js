// src/utils/helper/date-fns.js
/**
 * dateUtils
 *
 * A self-contained date utility module that fully replaces `date-fns`.
 * No external dependencies — only vanilla JS `Date` APIs.
 *
 * Absorbs and extends the existing `timeManager.js` utilities:
 *   - dateTimeFormatter  — multi-format date/time string formatter
 *   - periodStamp        — human-friendly recency label ("Today", "Yesterday", weekday, or dd/MM/yy)
 *   - isLatest           — returns true if a date is within the current week
 *   - dateExpirationCheck — checks whether a timestamp has expired past a threshold
 *   - timeManager        — { formatTime, getCurrentTime }
 *
 * New additions (replacing date-fns imports):
 *   - format(date, pattern)  — subset of date-fns `format()` supporting the patterns used in this project
 *   - isToday(date)
 *   - isYesterday(date)
 *   - startOfWeek(date, opts)
 *   - endOfWeek(date, opts)
 *   - isBefore(dateA, dateB)
 *   - isAfter(dateA, dateB)
 *   - addDays(date, n)
 *   - differenceInSeconds(dateA, dateB)
 *   - parseISO(isoString)
 *   - formatDistance(date, baseDate) — simplified "X ago" / "in X" style
 *   - formatDistanceToNow(date, opts) — wrapper for `formatDistance` with `new Date()` as base
 *   - formatDate(date)  — "Monday, 3rd June 2024"  (alias of dateTimeFormatter type "date")
 *   - formatTime(date)  — "10:45 am"               (alias of dateTimeFormatter type "time")
 *   - formatFull(date)  — "10:45 am Monday, 3rd June 2024"
 *   - formatCompact(date) — "10:45am, 03/11/2024"
 *   - toLocaleDateStr(date) — "Apr 23, 2026"        (used in AccountDetails / PanelChangePassword)
 *
 * Usage:
 *   import { format, isToday, parseISO, formatDistance } from "../../utils/helper/dateUtils";
 *
 *   format(new Date(), "PPP")         // "April 29, 2026"
 *   format(new Date(), "dd/MM/yy")   // "29/04/26"
 *   formatDistance(new Date(date), new Date())  // "3 hours ago"
 */

// ─── Internal helpers ─────────────────────────────────────────────────────────

const _pad = (n) => String(n).padStart(2, "0");

const _ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const _monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const _shortMonthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const _weekdayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const _shortWeekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Converts any input to a valid Date, or returns `null` on failure.
 * @param {Date|string|number} input
 * @returns {Date|null}
 */
const _toDate = (input) => {
    if (!input) return null;
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
};

// ─── Core predicates ──────────────────────────────────────────────────────────

/**
 * Returns true if `date` falls on today's calendar date.
 * @param {Date|string|number} date
 * @returns {boolean}
 */
export const isToday = (date) => {
    const d = _toDate(date);
    if (!d) return false;
    const now = new Date();
    return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
    );
};

/**
 * Returns true if `date` falls on yesterday's calendar date.
 * @param {Date|string|number} date
 * @returns {boolean}
 */
export const isYesterday = (date) => {
    const d = _toDate(date);
    if (!d) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear()
    );
};

/**
 * Returns true if `dateA` is strictly before `dateB`.
 * @param {Date|string|number} dateA
 * @param {Date|string|number} dateB
 * @returns {boolean}
 */
export const isBefore = (dateA, dateB) => {
    const a = _toDate(dateA);
    const b = _toDate(dateB);
    if (!a || !b) return false;
    return a.getTime() < b.getTime();
};

/**
 * Returns true if `dateA` is strictly after `dateB`.
 * @param {Date|string|number} dateA
 * @param {Date|string|number} dateB
 * @returns {boolean}
 */
export const isAfter = (dateA, dateB) => {
    const a = _toDate(dateA);
    const b = _toDate(dateB);
    if (!a || !b) return false;
    return a.getTime() > b.getTime();
};

// ─── Week boundaries ──────────────────────────────────────────────────────────

/**
 * Returns the start (midnight) of the week containing `date`.
 * @param {Date|string|number} date
 * @param {{ weekStartsOn?: 0|1|2|3|4|5|6 }} [opts] - 0 = Sunday (default), 1 = Monday
 * @returns {Date}
 */
export const startOfWeek = (date, opts = {}) => {
    const d = _toDate(date) || new Date();
    const weekStartsOn = opts.weekStartsOn ?? 0;
    const day = d.getDay();
    const diff = (day - weekStartsOn + 7) % 7;
    const result = new Date(d);
    result.setDate(d.getDate() - diff);
    result.setHours(0, 0, 0, 0);
    return result;
};

/**
 * Returns the end (23:59:59.999) of the week containing `date`.
 * @param {Date|string|number} date
 * @param {{ weekStartsOn?: 0|1|2|3|4|5|6 }} [opts]
 * @returns {Date}
 */
export const endOfWeek = (date, opts = {}) => {
    const start = startOfWeek(date, opts);
    const result = new Date(start);
    result.setDate(start.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
};

// ─── Arithmetic ───────────────────────────────────────────────────────────────

/**
 * Returns a new Date `n` days after `date`.
 * @param {Date|string|number} date
 * @param {number} n - Can be negative.
 * @returns {Date}
 */
export const addDays = (date, n) => {
    const d = _toDate(date) || new Date();
    const result = new Date(d);
    result.setDate(d.getDate() + n);
    return result;
};

/**
 * Returns the absolute difference in seconds between two dates.
 * @param {Date|string|number} dateA
 * @param {Date|string|number} dateB
 * @returns {number}
 */
export const differenceInSeconds = (dateA, dateB) => {
    const a = _toDate(dateA);
    const b = _toDate(dateB);
    if (!a || !b) return 0;
    return Math.abs((a.getTime() - b.getTime()) / 1000);
};

// ─── Parsing ──────────────────────────────────────────────────────────────────

/**
 * Parses an ISO 8601 string and returns a Date.
 * Returns `null` if the string is invalid.
 * @param {string} isoString
 * @returns {Date|null}
 */
export const parseISO = (isoString) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? null : d;
};

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * format
 *
 * A subset of date-fns `format()` covering the patterns used across this project.
 *
 * Supported tokens:
 *   PPP          → "April 29, 2026"              (month name + day + year)
 *   PP           → "Apr 29, 2026"                (short month)
 *   dd/MM/yy     → "29/04/26"
 *   dd/MM/yyyy   → "29/04/2026"
 *   MM/dd/yyyy   → "04/29/2026"
 *   yyyy-MM-dd   → "2026-04-29"
 *   EEEE         → "Wednesday"                   (full weekday)
 *   EEE          → "Wed"                         (short weekday)
 *   MMMM         → "April"                       (full month)
 *   MMM          → "Apr"                         (short month)
 *   do           → "29th"                        (ordinal day)
 *   EEEE, do MMMM yyyy → "Wednesday, 29th April 2026"
 *   p            → "10:45 am"                    (12h time, no seconds)
 *   hh:mm a      → "10:45 AM"
 *   hh:mma       → "10:45am"                     (compact, no space)
 *   hh:mm:ss a   → "10:45:32 AM"
 *
 * @param {Date|string|number} date
 * @param {string} pattern
 * @returns {string}
 *
 * @example
 * format(new Date("2026-04-29"), "PPP")      // "April 29, 2026"
 * format(new Date("2026-04-29T10:45:00"), "p") // "10:45 am"
 */
export const format = (date, pattern) => {
    const d = _toDate(date);
    if (!d) return "";

    const day = d.getDate();
    const month = d.getMonth();     // 0-indexed
    const year = d.getFullYear();
    const weekday = d.getDay();       // 0 = Sunday
    let h = d.getHours();
    const min = _pad(d.getMinutes());
    const sec = _pad(d.getSeconds());
    const ampm = h >= 12 ? "PM" : "AM";
    const ampmLc = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    const hh = _pad(h);

    const replacements = {
        // Long patterns first to avoid partial replacements
        "EEEE, do MMMM yyyy": `${_weekdayNames[weekday]}, ${_ordinal(day)} ${_monthNames[month]} ${year}`,
        "hh:mm:ss a": `${hh}:${min}:${sec} ${ampm}`,
        "hh:mm a": `${hh}:${min} ${ampm}`,
        "hh:mma": `${hh}:${min}${ampmLc}`,
        "yyyy-MM-dd": `${year}-${_pad(month + 1)}-${_pad(day)}`,
        "MM/dd/yyyy": `${_pad(month + 1)}/${_pad(day)}/${year}`,
        "dd/MM/yyyy": `${_pad(day)}/${_pad(month + 1)}/${year}`,
        "dd/MM/yy": `${_pad(day)}/${_pad(month + 1)}/${String(year).slice(2)}`,
        "PPP": `${_monthNames[month]} ${day}, ${year}`,
        "PP": `${_shortMonthNames[month]} ${day}, ${year}`,
        "EEEE": _weekdayNames[weekday],
        "EEE": _shortWeekdayNames[weekday],
        "MMMM": _monthNames[month],
        "MMM": _shortMonthNames[month],
        "do": _ordinal(day),
        "p": `${hh}:${min} ${ampmLc}`,
    };

    if (pattern in replacements) return replacements[pattern];

    // Fallback: token-by-token substitution for composite patterns not listed above
    return pattern
        .replace("EEEE", _weekdayNames[weekday])
        .replace("EEE", _shortWeekdayNames[weekday])
        .replace("MMMM", _monthNames[month])
        .replace("MMM", _shortMonthNames[month])
        .replace("do", _ordinal(day))
        .replace("yyyy", String(year))
        .replace("yy", String(year).slice(2))
        .replace("MM", _pad(month + 1))
        .replace("dd", _pad(day))
        .replace("HH", _pad(d.getHours()))
        .replace("hh", hh)
        .replace("mm", min)
        .replace("ss", sec)
        .replace("a", ampm)
        .replace("p", `${hh}:${min} ${ampmLc}`);
};

// ─── Human-friendly distance ──────────────────────────────────────────────────

/**
 * formatDistance
 *
 * Returns a human-friendly relative time string between two dates.
 * Similar to date-fns `formatDistance` but simpler and without locale support.
 *
 * @param {Date|string|number} date      - The date to describe.
 * @param {Date|string|number} baseDate  - The reference point (usually `new Date()`).
 * @param {{ addSuffix?: boolean }} [opts]
 * @returns {string}
 *
 * @example
 * formatDistance(threeHoursAgo, new Date(), { addSuffix: true }) // "3 hours ago"
 * formatDistance(tomorrow,      new Date(), { addSuffix: true }) // "in 1 day"
 */
export const formatDistance = (date, baseDate, opts = {}) => {
    const a = _toDate(date);
    const b = _toDate(baseDate) || new Date();
    if (!a) return "";

    const diffMs = a.getTime() - b.getTime();
    const future = diffMs > 0;
    const absMs = Math.abs(diffMs);
    const absSecs = Math.floor(absMs / 1000);
    const absMins = Math.floor(absSecs / 60);
    const absHours = Math.floor(absMins / 60);
    const absDays = Math.floor(absHours / 24);
    const absWeeks = Math.floor(absDays / 7);
    const absMons = Math.floor(absDays / 30);
    const absYears = Math.floor(absDays / 365);

    let label;
    if (absSecs < 30) label = "a few seconds";
    else if (absSecs < 90) label = "a minute";
    else if (absMins < 45) label = `${absMins} minutes`;
    else if (absMins < 90) label = "an hour";
    else if (absHours < 24) label = `${absHours} hours`;
    else if (absDays < 2) label = "a day";
    else if (absDays < 7) label = `${absDays} days`;
    else if (absWeeks < 4) label = `${absWeeks} week${absWeeks > 1 ? "s" : ""}`;
    else if (absMons < 12) label = `${absMons} month${absMons > 1 ? "s" : ""}`;
    else if (absYears < 2) label = "a year";
    else label = `${absYears} years`;

    if (!opts.addSuffix) return label;
    return future ? `in ${label}` : `${label} ago`;
};

// ─── Named formatters (convenience aliases) ───────────────────────────────────

/**
 * Formats a date as "Monday, 3rd June 2024".
 * @param {Date|string|number} date
 * @returns {string}
 */
export const formatDate = (date) => {
    const d = _toDate(date);
    if (!d) return "";
    return format(d, "EEEE, do MMMM yyyy");
};

/**
 * Formats a date as "10:45 am".
 * @param {Date|string|number} date
 * @returns {string}
 */
export const formatTime = (date) => {
    const d = _toDate(date);
    if (!d) return "";
    return format(d, "p");
};

/**
 * Formats a date as "10:45 am Monday, 3rd June 2024".
 * @param {Date|string|number} date
 * @returns {string}
 */
export const formatFull = (date) => {
    const d = _toDate(date);
    if (!d) return "";
    return `${formatTime(d)} ${formatDate(d)}`;
};

/**
 * Formats a date as "10:45am, 04/29/2026".
 * @param {Date|string|number} date
 * @returns {string}
 */
export const formatCompact = (date) => {
    const d = _toDate(date);
    if (!d) return "";
    return `${format(d, "hh:mma")}, ${format(d, "MM/dd/yyyy")}`;
};

/**
 * Formats a date as "Apr 29, 2026" (short locale-style).
 * Used in AccountDetails, PanelChangePassword timers.
 * @param {Date|string|number} date
 * @returns {string}
 */
export const toLocaleDateStr = (date) => {
    const d = _toDate(date);
    if (!d) return "—";
    return format(d, "PP");
};

// ─── dateTimeFormatter (existing — kept for backward compat) ─────────────────

/**
 * dateTimeFormatter
 *
 * Formats a date or ISO timestamp string into various human-readable formats.
 *
 * Supported types:
 *   "date"         → "Monday, 3rd June 2024"
 *   "time"         → "10:45 am"
 *   "full time"    → "10:45:32 am"
 *   "full"         → "10:45 am Monday, 3rd June 2024"
 *   "compact full" → "10:45am, 03/11/2024"
 *
 * @param {string} dateString
 * @param {"date"|"time"|"full time"|"full"|"compact full"} [type="date"]
 * @returns {string}
 */
export const dateTimeFormatter = (dateString, type = "date") => {
    const d = _toDate(dateString);
    if (!d) return "";

    switch (type) {
        case "full time": return format(d, "hh:mm:ss a");
        case "time": return format(d, "p");
        case "full": return formatFull(d);
        case "compact full": return formatCompact(d);
        case "date":
        default: return formatDate(d);
    }
};

// ─── periodStamp (existing — kept for backward compat) ───────────────────────

/**
 * periodStamp
 *
 * Returns a human-friendly recency label:
 *   - Today        → "9:30 pm"
 *   - Yesterday    → "Yesterday"
 *   - Same week    → "Monday"
 *   - Older        → "02/09/23"
 *
 * @param {string|number|Date} dateString
 * @returns {string}
 */
export const periodStamp = (dateString) => {
    const d = _toDate(dateString);
    if (!d) return "";

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

    if (isToday(d)) return format(d, "p");
    if (isYesterday(d)) return "Yesterday";
    if (d >= weekStart && d <= weekEnd) return format(d, "EEEE");
    return format(d, "dd/MM/yy");
};

// ─── isLatest (existing — kept for backward compat) ──────────────────────────

/**
 * isLatest
 *
 * Returns true if the date is today, yesterday, or within the current week.
 * Returns "" for invalid input.
 *
 * @param {string|number|Date} date
 * @returns {boolean|""}
 */
export const isLatest = (date) => {
    const d = _toDate(date);
    if (!d) return "";

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

    return isToday(d) || isYesterday(d) || (d >= weekStart && d <= weekEnd);
};

// ─── dateExpirationCheck (existing — kept for backward compat) ───────────────

/**
 * dateExpirationCheck
 *
 * Checks whether a timestamp has expired past a given threshold in seconds.
 *
 * @param {number} timeStamp          - The reference timestamp (ms or Date-parseable).
 * @param {number} timeCheckInSeconds - Expiry window in seconds.
 * @returns {boolean} true if expired.
 */
export const dateExpirationCheck = (timeStamp = 0, timeCheckInSeconds = 0) => {
    const d = _toDate(timeStamp);
    if (!d) return false;
    const diffSeconds = (Date.now() - d.getTime()) / 1000;
    return diffSeconds > timeCheckInSeconds;
};

// ─── timeManager (existing — kept for backward compat) ───────────────────────

/**
 * timeManager
 *
 * Namespace of simple time utilities.
 */
export const timeManager = {
    /**
     * Formats a timestamp to a locale-readable string.
     * @param {Date|string|number} time
     * @returns {string}
     */
    formatTime: (time) => new Date(time).toLocaleString(),

    /**
     * Returns the current timestamp in milliseconds.
     * @returns {number}
     */
    getCurrentTime: () => Date.now(),
};

/**
 * formatDistanceToNow
 *
 * Returns a human-friendly relative time string between a date and now.
 * Simplified wrapper around `formatDistance` that defaults to `new Date()` as the base.
 *
 * @param {Date|string|number} date      - The date to describe.
 * @param {{ addSuffix?: boolean, includeSeconds?: boolean }} [opts]
 * @returns {string}
 *
 * @example
 * formatDistanceToNow(threeHoursAgo) // "3 hours ago"
 * formatDistanceToNow(tomorrow)     // "in 1 day"
 */
export const formatDistanceToNow = (date, opts = {}) => {
    return formatDistance(date, new Date(), { addSuffix: true, ...opts });
};