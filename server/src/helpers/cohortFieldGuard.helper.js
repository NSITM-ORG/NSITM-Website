'use strict';

/**
 * Cohort Field Guard Helper
 *
 * Centralizes the "which fields can this update actually touch" logic for
 * cohort updates, used by both the single-cohort update endpoint and the
 * new bulk-cohort-update endpoint — one rule set, two call sites.
 *
 * Client rule: status transitions are always allowed. Every other field
 * (programme, name, dates, deliveryFormat, maxCapacity) is locked once
 * the cohort's CURRENT (pre-update) status is 'active'.
 */

import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS, COHORT_LOCKED_FIELDS_WHEN_ACTIVE } from '../config/constants.js';

/**
 * Throws if the update payload attempts to modify a locked field while
 * the cohort is active. `status` alone is always permitted through.
 *
 * @param {string} currentStatus - The cohort's status BEFORE this update
 * @param {object} updatePayload - The fields the caller is attempting to set
 * @param {string} [cohortLabel] - Optional cohort name for the error message
 * @throws {ApiError} 403 if a locked field is present in the payload
 */
export function assertCohortFieldsEditable(currentStatus, updatePayload, cohortLabel = 'This cohort') {
  if (currentStatus !== 'active') return;

  const attemptedLockedFields = COHORT_LOCKED_FIELDS_WHEN_ACTIVE.filter(
    (field) => updatePayload[field] !== undefined
  );

  if (attemptedLockedFields.length > 0) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'COHORT_FIELD_LOCKED',
      `${cohortLabel} is currently active — only its status can be changed. ` +
      `The following fields are locked while active: ${attemptedLockedFields.join(', ')}.`
    );
  }
}

/**
 * Throws if a delete is attempted on an active cohort.
 * @param {string} currentStatus
 * @param {string} [cohortLabel]
 * @throws {ApiError} 403
 */
export function assertCohortDeletable(currentStatus, cohortLabel = 'This cohort') {
  if (currentStatus === 'active') {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'CANNOT_DELETE_ACTIVE_COHORT',
      `${cohortLabel} is currently active and cannot be deleted. Move it to 'completed' first, or wait until it concludes.`
    );
  }
}

export default { assertCohortFieldsEditable, assertCohortDeletable };