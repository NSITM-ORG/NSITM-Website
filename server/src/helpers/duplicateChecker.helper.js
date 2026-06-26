'use strict';

/**
 * Duplicate Checker Helper
 *
 * Centralizes all duplicate detection logic for the enrollment flow.
 * Implements FRD FR-07.3 and Business Rules BR01 and BR15.
 *
 * TWO DISTINCT CHECKS EXIST:
 *
 *   1. PARTIAL RECORD CHECK (Step 1 advancement — FR-07.3 first rule):
 *      "On every Step 1 advancement, check whether a record already
 *       exists with the same email + programme + not_paid status."
 *      → If found: UPDATE the existing record (not a duplicate error)
 *      → If not found: CREATE a new record
 *      This is a soft check that NEVER returns a 409. It returns the
 *      existing record or null to guide the controller's create-vs-update logic.
 *
 *   2. SUBMISSION DUPLICATE CHECK (Step 4 receipt submission — FR-07.3 + BR01):
 *      "On receipt submission, check whether a record already exists with
 *       the same email + programme + pending OR confirmed status."
 *      → If found: return 409 (student has already submitted or is enrolled)
 *      This DOES produce a 409 error if found.
 *
 * CALLED BY:
 *   - enrollment.controller.js → createPartialRecord (check 1)
 *   - enrollment.controller.js → completeEnrollment (check 2)
 */

import Enrollment from '../models/Enrollment.model.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Check 1: Find an existing Not Paid partial record for this profile + programme.
 * Used to implement the "update existing record instead of creating new" logic.
 *
 * FRD FR-07.3: "If a record exists: update the existing record's fields
 * with the newly submitted values and update the enrollmentTimestamp."
 *
 * NOTE: Per FR-08.3, if the user changes their programme selection and
 * advances again, the programme field is updated but enrollmentTimestamp
 * is NOT changed — it retains the original Step 1 advancement timestamp.
 * The caller must handle this distinction (pass updateTimestamp: false for
 * programme-change patches).
 *
 * @param {ObjectId} profileId - Resolved profile._id
 * @param {ObjectId} programmeId - Current programme selection
 * @returns {Promise<Enrollment|null>} Existing record or null
 */
const findExistingPartialRecord = async (profileId, programmeId) => {
  return Enrollment.findExistingPartialRecord(profileId, programmeId);
};

/**
 * Check 2: Verify no active (Pending or Confirmed) enrollment exists
 * for this profile + programme before allowing receipt submission.
 *
 * FRD FR-07.3 (second rule):
 *   "If such a record exists: return HTTP 409 Conflict."
 * FRD FR-02.4 (duplicate submission prevention):
 *   "The backend checks whether a Pending or Confirmed record already
 *    exists for the same email and programme combination."
 * BR01:
 *   "A student cannot be enrolled in more than one active cohort of
 *    the same programme simultaneously."
 *
 * Throws ApiError(409) if a conflict is found.
 * Returns void if no conflict.
 *
 * @param {ObjectId} profileId - Resolved profile._id
 * @param {ObjectId} programmeId - Programme being enrolled in
 * @throws {ApiError} 409 if a conflicting record exists
 */
const assertNoActiveEnrollment = async (profileId, programmeId) => {
  const existing = await Enrollment.findExistingPendingOrConfirmed(profileId, programmeId);

  if (existing) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'DUPLICATE_ENROLLMENT',
      // FRD FR-02.4 exact message for duplicate submission
      "It looks like you have already submitted your enrollment. Check your email for a confirmation, or contact us on WhatsApp if you have not received it."
    );
  }
};

/**
 * Find a Not Paid record for any programme for this profile.
 * Used when the student changes their programme selection mid-form
 * (PATCH to update the programme field on the existing partial record).
 *
 * Since the student can only have one active partial record session at a time
 * (the form is one sequential flow), we find the most recent Not Paid record
 * for this profile regardless of programme and update its programme field.
 *
 * @param {ObjectId} profileId
 * @returns {Promise<Enrollment|null>}
 */
const findLatestPartialRecord = async (profileId) => {
  return Enrollment.findOne({
    profile: profileId,
    paymentStatus: 'not_paid',
    isPartialEnrollment: true,
  }).sort({ createdAt: -1 });
};

export {
  findExistingPartialRecord,
  assertNoActiveEnrollment,
  findLatestPartialRecord,
};