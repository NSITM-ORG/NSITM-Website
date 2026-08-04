/**
 * Lightweight In-House Validators — mirrors the backend's express-
 * validator rules exactly (see backend src/utils/validators/*), so a
 * form fails locally with the same message the API would eventually
 * return, before a round-trip is even attempted. No zod/yup — per the
 * "minimize external packages, build custom" instruction.
 *
 * Each validator returns a string error message, or null if valid.
 * Designed to be called from FormField's `validate` prop or a page's
 * own submit handler.
 */

const NIGERIAN_PHONE_REGEX = /^(\+234|0)(7[0-9]|8[0-9]|9[0-9])\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validators = {
  required:
    (message = 'This field is required.') =>
    (value) =>
      value === undefined || value === null || String(value).trim() === '' ? message : null,

  email:
    (message = 'Please provide a valid email address.') =>
    (value) =>
      value && !EMAIL_REGEX.test(value) ? message : null,

  nigerianPhone:
    (message = 'Please enter a valid Nigerian mobile number (e.g. 08012345678).') =>
    (value) =>
      value && !NIGERIAN_PHONE_REGEX.test(value) ? message : null,

  minLength: (min, message) => (value) =>
    value && value.length < min ? message || `Must be at least ${min} characters.` : null,

  maxLength: (max, message) => (value) =>
    value && value.length > max ? message || `Must not exceed ${max} characters.` : null,

  fullName:
    (message = 'Please enter your full name (first and last name).') =>
    (value) => {
      if (!value) return null;
      const parts = value.trim().split(/\s+/);
      return parts.length < 2 ? message : null;
    },

  passwordComplexity:
    (message) =>
    (value) => {
      if (!value) return null;
      if (value.length < 8) return message || 'Password must be at least 8 characters.';
      if (!/[A-Z]/.test(value)) return message || 'Password must contain an uppercase letter.';
      if (!/[a-z]/.test(value)) return message || 'Password must contain a lowercase letter.';
      if (!/[0-9]/.test(value)) return message || 'Password must contain a number.';
      return null;
    },

  matches: (otherValue, message = 'Values do not match.') => (value) =>
    value !== otherValue ? message : null,

  url:
    (message = 'Please provide a valid URL.') =>
    (value) => {
      if (!value) return null;
      try {
        new URL(value);
        return null;
      } catch {
        return message;
      }
    },
};

/**
 * Runs an array of validator functions against a value, returning the
 * FIRST error encountered (or null if all pass). Used by FormField.
 */
export function runValidators(value, validatorFns = []) {
  for (const fn of validatorFns) {
    const error = fn(value);
    if (error) return error;
  }
  return null;
}

/** Validates an entire form-values object against a { field: [validators] } schema. */
export function validateForm(values, schema) {
  const errors = {};
  Object.entries(schema).forEach(([field, fns]) => {
    const error = runValidators(values[field], fns);
    if (error) errors[field] = error;
  });
  return { errors, isValid: Object.keys(errors).length === 0 };
}