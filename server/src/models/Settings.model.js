'use strict';

/**
 * Settings Model — System Configuration Singleton
 *
 * Stores system-wide configuration that can be updated by Super Admin
 * without requiring a code deployment:
 *   - Bank account details (displayed on the payment details page)
 *   - WhatsApp contact information (used in the floating contact button)
 *   - Institutional contact details (used in the footer)
 *
 * SINGLETON PATTERN:
 *   Only ONE document ever exists in this collection.
 *   Enforced by the unique index on the `key` field, which is always
 *   set to SETTINGS_SINGLETON_KEY ('global_settings').
 *   The getSettings() static method uses findOneAndUpdate with upsert: true
 *   to either fetch the existing document or create it with defaults on
 *   first access. This makes the system resilient to a missing settings
 *   document at startup.
 *
 * BANK DETAILS:
 *   Displayed on the enrollment payment details page.
 *   These are the ONLY bank details that should ever appear.
 *   Changes made here by Super Admin take effect immediately on the
 *   public-facing payment details page.
 *
 * USAGE IN OTHER SERVICES:
 *   The instalment.service.js reads bankDetails from Settings to display
 *   on the instalment submission page (per PRD F-10: "bank details
 *   retrieved from the settings collection").
 *   The email.service.js reads whatsapp.link for rejection email templates.
 */

import mongoose from 'mongoose';
import { SETTINGS_SINGLETON_KEY } from '../config/constants.js';

// ── Embedded: Bank Details ────────────────────────────────────────────
const bankDetailsSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      trim: true,
      default: '',
    },
    accountNumber: {
      type: String,
      trim: true,
      default: '',
    },
    accountName: {
      type: String,
      trim: true,
      default: '',
    },
    // Optional: NIBSS bank code (e.g., '057' for Zenith Bank)
    bankCode: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

// ── Embedded: WhatsApp Contact ─────────────────────────────────────────
const whatsappSchema = new mongoose.Schema(
  {
    // International format: "+2348012345678"
    number: {
      type: String,
      trim: true,
      default: '',
    },
    // Full click-to-chat link: "https://wa.me/2348012345678"
    link: {
      type: String,
      trim: true,
      default: '',
    },
    // Optional: Pre-filled message on the WhatsApp link
    // "https://wa.me/234...?text=Hello%2C%20I%20need%20help..."
    prefilledMessage: {
      type: String,
      trim: true,
      default: null,
      maxlength: 500,
    },
  },
  { _id: false }
);

// ── Embedded: Institution Contact Details ─────────────────────────────
const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Nextserve School of Information Technology and Management',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    // Social media links
    instagram: {
      type: String,
      trim: true,
      default: null,
    },
    linkedin: {
      type: String,
      trim: true,
      default: null,
    },
    facebook: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

// ── Main Schema ───────────────────────────────────────────────────────
const settingsSchema = new mongoose.Schema(
  {
    // Singleton key — always 'global_settings'
    key: {
      type: String,
      required: true,
      // unique: true,
      default: SETTINGS_SINGLETON_KEY,
      immutable: true, // Never changed after creation
    },

    bankDetails: {
      type: bankDetailsSchema,
      default: () => ({}),
    },

    whatsapp: {
      type: whatsappSchema,
      default: () => ({}),
    },

    institution: {
      type: institutionSchema,
      default: () => ({}),
    },

    // ── Audit ──────────────────────────────────────────────────────
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.key; // Singleton key is an internal implementation detail
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────
settingsSchema.index({ key: 1 }, { unique: true });

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Get the system settings singleton document.
 *
 * Uses findOneAndUpdate with upsert: true to guarantee the document
 * exists even if it was never explicitly created. On first call,
 * creates the document with all default values. Subsequent calls
 * return the existing document unchanged.
 *
 * This is the ONLY method that should be used to read settings.
 *
 * @returns {Promise<Settings>}
 */
settingsSchema.statics.getSettings = function () {
  return this.findOneAndUpdate(
    { key: SETTINGS_SINGLETON_KEY },
    { $setOnInsert: { key: SETTINGS_SINGLETON_KEY } },
    {
      new: true,           // Return the document after the operation
      upsert: true,        // Create if it doesn't exist
      setDefaultsOnInsert: true, // Apply schema defaults on creation
    }
  ).populate('updatedBy', 'email role');
};

/**
 * Update settings. Only callable by Super Admin (enforced at controller/RBAC level).
 * Merges provided updates into existing settings using $set.
 *
 * @param {Object} updates - Partial settings object to merge
 * @param {ObjectId} updatedByAccountId - The Super Admin performing the update
 * @returns {Promise<Settings>}
 */
settingsSchema.statics.updateSettings = function (updates, updatedByAccountId) {
  const setPayload = {};

  // Build dot-notation update paths to allow partial nested updates
  // e.g., { bankDetails: { bankName: 'GTB' } } becomes { 'bankDetails.bankName': 'GTB' }
  const flatten = (obj, prefix = '') => {
    Object.keys(obj).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        flatten(obj[key], fullKey);
      } else {
        setPayload[fullKey] = obj[key];
      }
    });
  };

  flatten(updates);
  setPayload.updatedBy = updatedByAccountId;

  return this.findOneAndUpdate(
    { key: SETTINGS_SINGLETON_KEY },
    { $set: setPayload },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  ).populate('updatedBy', 'email role');
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;

