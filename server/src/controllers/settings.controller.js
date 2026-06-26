"use strict";

/**
 * Settings Controller
 * Public: getPublicSettings (bank details + WhatsApp for payment page)
 * Super Admin: getFullSettings, updateSettings
 * FRD FR-05.2 (bank details), FR-10.3 (bank details in instalment flow), BR10
 */

import Settings from "../models/Settings.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { HTTP_STATUS, AUDIT_ACTIONS } from "../config/constants.js";

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: GET /api/v1/public/settings
// Returns only bank details and WhatsApp info (for payment page — BR10)
// ─────────────────────────────────────────────────────────────────────
const getPublicSettings = asyncHandler(async (req, res, next) => {
  const settings = await Settings.getSettings();

  // Only expose what the public-facing payment page needs
  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    {
      bankDetails: settings.bankDetails,
      whatsapp: settings.whatsapp,
    },
    "Payment settings retrieved successfully.",
  );
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: GET /api/v1/superadmin/settings
// Full settings document
// ─────────────────────────────────────────────────────────────────────
const getFullSettings = asyncHandler(async (req, res, next) => {
  const settings = await Settings.getSettings();
  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    { settings },
    "Settings retrieved successfully.",
  );
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: PUT /api/v1/superadmin/settings
// Update system settings (FR-05.2)
// ─────────────────────────────────────────────────────────────────────
const updateSettings = asyncHandler(async (req, res, next) => {
  const allowedSections = ["bankDetails", "whatsapp", "institution"];
  const updates = {};

  allowedSections.forEach((section) => {
    if (req.body[section]) updates[section] = req.body[section];
  });

  if (Object.keys(updates).length === 0) {
    return sendSuccess(res, HTTP_STATUS.OK, null, "No changes were provided.");
  }

  const settings = await Settings.updateSettings(updates, req.account._id);

  await req.logAction(AUDIT_ACTIONS.SETTINGS_UPDATED, {
    targetModel: "Settings",
    description: "System settings updated",
    metadata: { updatedSections: Object.keys(updates) },
  });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    { settings },
    "Settings updated successfully. Changes are live immediately.",
  );
});

export { getPublicSettings, getFullSettings, updateSettings };
