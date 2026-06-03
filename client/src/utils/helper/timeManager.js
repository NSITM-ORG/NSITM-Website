// src/utils/helper/timeManager.js
import { endOfWeek, format, isToday, isYesterday, startOfWeek } from './date-fns';

export const timeManager = {
    formatTime: (time) => {
        // Format time to a readable string
        return new Date(time).toLocaleString();
    },
    getCurrentTime: () => {
        // Get the current time
        return new Date().getTime();
    },
    // Add more time-related utility functions as needed
};

export const dateExpirationCheck = (timeStamp = 0, timeCheckInSeconds = 0) => {

    const timeStampValue = new Date(timeStamp); // convert time stamp to date

    const now = new Date(); // get current time

    // difference in milliseconds
    const diffMs = now - timeStampValue;

    // convert to seconds
    const diffSeconds = diffMs / 1000;
    // 691200


    setTimeout(() => {
        return true; // this still won't affect the function's return
    }, (timeCheckInSeconds - diffSeconds) * 1000); // FIX: use ms


    if (diffSeconds > timeCheckInSeconds) { // check if expired
        return true
    } else {
        return false
    }

};

/**
 * Utility function for formatting a date or time string into
 * various human-readable formats using date-fns.
 *
 * Supported types:
* - "date": "Monday, 3rd June 2024"
* - "time": "10:45 AM"
* - "full time": "10:45:32 AM"
* - "full": "10:45 AM Monday, 3rd June 2024"
* - "compact full": "10:45AM, 03/11/2024"
 *
 * If the input date string is invalid, an empty string is returned.
 *
 * @param {string} dateString - A date or ISO timestamp string.
 * @param {"date"|"time"|"full time"|"full"|"compact full"} [type="date"] - Output format type.
 * @returns {string} Formatted date string or empty string on invalid input.
 */
// utils/dateTimeFormatter.js
export const dateTimeFormatter = (dateString, type = 'date') => {
    const date = new Date(dateString);

    // invalid date check
    if (isNaN(date.getTime())) return '';

    const pad = (n) => String(n).padStart(2, '0');

    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const formatTime = (d, withSeconds = false, compact = false) => {
        let h = d.getHours();
        const m = pad(d.getMinutes());
        const s = pad(d.getSeconds());
        const ampm = h >= 12 ? "pm" : "am";
        h = h % 12 || 12;

        let base = `${pad(h)}:${m}`;
        if (withSeconds) base += `:${s}`;
        return compact ? `${base}${ampm}` : `${base} ${ampm}`;
    };

    const formatDate = (d) => {
        const weekday = d.toLocaleString('en-US', { weekday: 'long' });
        const month = d.toLocaleString('en-US', { month: 'long' });
        const day = getOrdinal(d.getDate());
        const year = d.getFullYear();
        return `${weekday}, ${day} ${month} ${year}`;
    };

    const formatCompactDate = (d) => {
        return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
    };

    switch (type) {
        case 'full time':
            return formatTime(date, true);

        case 'time':
            return formatTime(date);

        case 'date':
            return formatDate(date);

        case 'full':
            return `${formatTime(date)} ${formatDate(date)}`;

        case 'compact full': {
            const t = formatTime(date, false, true); // hh:mma (compact)
            const d = formatCompactDate(date);
            return `${t}, ${d}`;
        }

        default:
            return formatDate(date);
    }
};

/* ################# STILL IN USE BUT DO NOT WANT TO USE "DATE-FNS" ######################## */
// export const dateTimeFormatter = (dateString, type = 'date') => {
//     const date = new Date(dateString); // Convert string to Date object

//     // Check if the date is valid
//     if (isNaN(date.getTime())) {
//         return ''; // Return a fallback if the date is invalid
//     }

//     if (type === 'full time') {
//         return format(date, "hh:mm:ss a");
//     } else if (type === 'time') {
//         return format(date, 'p');
//     } else if (type === 'date') {
//         return format(date, 'EEEE, do MMMM yyyy');
//     } else if (type === 'full') {
//         return format(date, "p EEEE, do MMMM yyyy");
//     } else if (type === 'compact full') {
//         const t = format(date, 'hh:mma');     // no space before AM/PM
//         const d = format(date, 'MM/dd/yyyy');
//         return `${t}, ${d}`;
//     }
// };

/* ################# END ######################## */



/**
 * Formats a date into a human-friendly "period stamp" based on
 * how recent the timestamp is. Useful for messaging, logs, activity feeds,
 * or notifications.
 *
 * **Output Rules**
 * - **Today** → returns the time (e.g., `"9:30 PM"`).
 * - **Yesterday** → returns `"Yesterday"`.
 * - **Same week** (Sunday → Saturday of the current week) → returns weekday name
 *   (e.g., `"Monday"`).
 * - **Older dates** → returns `dd/MM/yy` (e.g., `"02/09/23"`).
 *
 * If the input cannot be parsed into a valid date, an empty string is returned.
 *
 * @param {string|number|Date} dateString - Input date value (timestamp, ISO string, or Date).
 * @returns {string} Formatted period string based on recency.
 *
 * @example
 * // Today → shows time
 * periodStamp("2024-02-10T21:30:00Z"); // "9:30 PM"
 *
 * @example
 * // Yesterday
 * periodStamp("2024-02-09T14:00:00Z"); // "Yesterday"
 *
 * @example
 * // Earlier in the same week
 * periodStamp("2024-02-07T11:20:00Z"); // "Wednesday"
 *
 * @example
 * // Older date
 * periodStamp("2023-09-02T10:00:00Z"); // "02/09/23"
 */
export const periodStamp = (dateString) => {
    const date = new Date(dateString); // Convert string to Date object

    if (isNaN(date.getTime())) {
        return ''; // Return a fallback if the date is invalid
    }

    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday
    const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 0 });     // Saturday

    if (isToday(date)) {
        return format(date, 'p');
    } else if (isYesterday(date)) {
        return 'Yesterday';
    } else if (date >= startOfCurrentWeek && date <= endOfCurrentWeek) {
        return format(date, 'EEEE');
    } else {
        return format(date, 'dd/MM/yy');
    }
};


/**
 * Determines whether a given date is considered "latest" based on recency.
 *
 * **Definition of "Latest":**
 * Returns `true` if the date is:
 * - **Today**
 * - **Yesterday**
 * - **Within the current week** (Sunday → Saturday)
 *
 * Otherwise returns `false`.
 *
 * If the input date cannot be parsed into a valid Date object, an empty
 * string is returned instead of a boolean.
 *
 * @param {string|number|Date} date - A date value (ISO string, timestamp, or Date object).
 * @returns {boolean|string} `true` if recent, `false` if not, or `""` if invalid input.
 *
 * @example
 * isLatest("2024-02-10"); // true (today)
 *
 * @example
 * isLatest("2024-02-09"); // true (yesterday)
 *
 * @example
 * isLatest("2024-02-07"); // true (earlier this week)
 *
 * @example
 * isLatest("2024-01-15"); // false (older)
 *
 * @example
 * isLatest("invalid"); // ""
 */
export const isLatest = (date) => {
    const dateStamp = new Date(date);

    if (isNaN(dateStamp.getTime())) {
        return ''; // Return a fallback if the date is invalid
    }

    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 0 });
    const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 0 });

    if (isToday(dateStamp)) {
        return true;
    } else if (isYesterday(dateStamp)) {
        return true;
    } else if (dateStamp >= startOfCurrentWeek && dateStamp <= endOfCurrentWeek) {
        return true;
    } else {
        return false;
    }
};
