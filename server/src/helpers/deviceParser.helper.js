'use strict';

/**
 * Device Parser Helper — lightweight User-Agent → human-readable label
 * converter (e.g. "Chrome on Windows"), used for the session/device list
 * (Issue 2). Deliberately regex-based rather than adding a UA-parsing
 * npm dependency — this only needs to be "good enough" for a device
 * list label, not analytics-grade precision, consistent with this
 * project's minimize-dependencies stance.
 */

const parseDeviceLabel = (userAgent = '') => {
  if (!userAgent) return 'Unknown device';

  let browser = 'Unknown browser';
  if (/edg/i.test(userAgent)) browser = 'Edge';
  else if (/chrome/i.test(userAgent) && !/chromium/i.test(userAgent)) browser = 'Chrome';
  else if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
  else if (/opr|opera/i.test(userAgent)) browser = 'Opera';

  let os = 'Unknown OS';
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/mac os/i.test(userAgent)) os = 'macOS';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad|ios/i.test(userAgent)) os = 'iOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';

  return `${browser} on ${os}`;
};

export { parseDeviceLabel };