'use strict';

/**
 * Profile Resolver Helper
 *
 * Centralizes the logic for finding or creating a Profile document
 * before any Enrollment record is created or updated.
 *
 * This is the ONLY place where Profile.findOrCreate is called from the
 * enrollment flow. It normalizes the raw enrollment form data into the
 * shape the Profile model expects, handles field mapping between the
 * FRD field names (emailAddress, phoneNumber) and the Profile schema
 * (email, phone), and returns a consistent result object.
 *
 * WHY THIS EXISTS:
 *   The enrollment form uses field names from the FRD spec
 *   (fullName, phoneNumber, emailAddress, whatsappNumber).
 *   The Profile model uses normalized field names (email, phone).
 *   This helper bridges the two without polluting the controller.
 *
 * CALLED BY:
 *   - enrollment.controller.js → createPartialRecord (Step 1 advancement)
 *   - enrollment.controller.js → completeEnrollment (Step 4 submission)
 */

import Profile from '../models/Profile.model.js';
import { PROFILE_TYPES } from '../config/constants.js';

/**
 * Resolve the student Profile for an enrollment form submission.
 *
 * Accepts the raw data from the enrollment form Step 1 and either:
 *   - Returns an existing Profile if the email already exists in the system
 *     (updating mutable fields if they have changed)
 *   - Creates a new Profile if no record exists for this email
 *
 * @param {Object} formData - Raw data from enrollment Step 1
 * @param {string} formData.fullName - Student's full name
 * @param {string} formData.emailAddress - Student's email (FRD field name)
 * @param {string} formData.phoneNumber - Student's phone (FRD field name)
 * @param {string} [formData.whatsappNumber] - Optional WhatsApp number
 * @returns {Promise<{ profile: Profile, isNew: boolean }>}
 */
const resolveStudentProfile = async (formData) => {
  const profileData = {
    fullName: formData.fullName?.trim(),
    email: formData.emailAddress?.toLowerCase().trim(),
    phone: formData.phoneNumber?.trim() || null,
    // If whatsappNumber is empty string or not provided, fall back to phone number
    whatsappNumber: formData.whatsappNumber?.trim() || formData.phoneNumber?.trim() || null,
    profileType: PROFILE_TYPES.STUDENT,
  };

  return Profile.findOrCreate(profileData);
};

/**
 * Resolve the admin Profile for a new Admin account creation.
 * Called by superAdmin.controller.js when creating a new admin account.
 *
 * @param {Object} accountData - Data from the Create Admin Account form
 * @param {string} accountData.name - Admin's full name (single field per FRD FR-05.1)
 * @param {string} accountData.email - Admin's email address
 * @returns {Promise<{ profile: Profile, isNew: boolean }>}
 */
const resolveAdminProfile = async (accountData) => {
  const profileData = {
    fullName: accountData.name?.trim(),
    email: accountData.email?.toLowerCase().trim(),
    profileType: PROFILE_TYPES.ADMIN,
    isVerified: true, // Admin profiles are verified at creation
  };

  return Profile.findOrCreate(profileData);
};

export { resolveStudentProfile, resolveAdminProfile };