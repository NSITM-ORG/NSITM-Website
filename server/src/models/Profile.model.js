"use strict";

/**
 * Profile Model — Centralized Identity System
 *
 * This is the single source of truth for personal identity across the entire
 * platform. Every person in the system — admin or student — has exactly one
 * Profile document.
 *
 * V1 BEHAVIOUR:
 *   Admin profiles:   Created when Super Admin creates an admin account.
 *                     Linked to Account model via Account.profile → Profile._id.
 *   Student profiles: Created when a student advances past Step 1 of the
 *                     enrollment form. Linked via Enrollment.profile → Profile._id.
 *                     If a student re-enrolls (same email), the existing profile
 *                     is reused and updated.
 *
 * V2 BEHAVIOUR (forward-compatible):
 *   When a student creates an account in v2, the system looks up their Profile
 *   by email. If found (from a v1 enrollment), the new StudentAccount is linked
 *   to the existing Profile. The v2AccountLinked flag is set to true.
 *   All historical enrollment records remain linked to the same Profile document.
 *   Zero data migration required.
 *
 * Name handling:
 *   The enrollment form and admin creation both submit a single "full name" string.
 *   The pre-save hook attempts to split fullName → firstName + lastName on first space.
 *   If firstName + lastName are explicitly provided, fullName is computed from them.
 *   This ensures all three fields are always populated.
 */

import mongoose from "mongoose";
import { PROFILE_TYPES } from "../config/constants.js";

const profileSchema = new mongoose.Schema(
  {
    // ── Name Fields ─────────────────────────────────────────────────
    firstName: {
      type: String,
      trim: true,
      default: null,
    },
    lastName: {
      type: String,
      trim: true,
      default: null,
    },
    // Primary name field — always required and populated.
    // Either set directly (from enrollment form full name input)
    // or computed from firstName + lastName via pre-save hook.
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters."],
      maxlength: [100, "Full name must not exceed 100 characters."],
    },

    // ── Contact Fields ───────────────────────────────────────────────
    email: {
      type: String,
      required: [true, "Email address is required."],
      // unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: null,
      match: [
        /^[+]?[0-9\s\-().]{7,20}$/,
        "Please provide a valid phone number.",
      ],
    },
    whatsappNumber: {
      type: String,
      trim: true,
      default: null,
      match: [
        /^[+]?[0-9\s\-().]{7,20}$/,
        "Please provide a valid WhatsApp number.",
      ],
    },

    // ── Profile Classification ──────────────────────────────────────
    // Determines whether this profile belongs to an admin or a student.
    profileType: {
      type: String,
      required: [true, "Profile type is required."],
      enum: {
        values: Object.values(PROFILE_TYPES),
        message: `Profile type must be one of: ${Object.values(PROFILE_TYPES).join(", ")}.`,
      },
    },

    // ── Avatar (v1: admins only; students: null) ─────────────────────
    avatarUrl: {
      type: String,
      default: null,
      trim: true,
    },

    // ── V2 Readiness Flags ───────────────────────────────────────────
    // isVerified: For students in v2, this will be set to true when their
    //             email is verified during account registration.
    //             For admins, this is set to true when their account is created.
    isVerified: {
      type: Boolean,
      default: false,
    },
    // v2AccountLinked: Becomes true when a student creates a v2 account
    //                  and it is linked to this existing profile.
    //                  Allows identification of v1-only vs v2-linked students.
    v2AccountLinked: {
      type: Boolean,
      default: false,
    },

    // ── Soft Delete ─────────────────────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // Hidden from default queries
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.deletedAt;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  },
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────
profileSchema.index({ email: 1 }, { unique: true });
profileSchema.index({ profileType: 1 });
profileSchema.index({ isDeleted: 1 });
profileSchema.index({ createdAt: -1 });
// Text index for full-name search in admin dashboard
profileSchema.index(
  { fullName: "text", email: "text" },
  { name: "profile_search_index", weights: { fullName: 2, email: 1 } },
);

// ─────────────────────────────────────────────────────────────────────
// PRE-SAVE HOOK — Name Field Synchronization
// ─────────────────────────────────────────────────────────────────────
profileSchema.pre("save", async function () {
  // Case 1: firstName and lastName are explicitly set — compute fullName from them
  if (
    (this.isModified("firstName") || this.isModified("lastName")) &&
    this.firstName &&
    this.lastName
  ) {
    this.fullName = `${this.firstName.trim()} ${this.lastName.trim()}`;
    return;
    // return next();
  }

  // Case 2: fullName is set — attempt to split into firstName and lastName
  if (this.isModified("fullName") && this.fullName) {
    const parts = this.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      // Only auto-split if first/last are not already explicitly set
      if (!this.firstName) this.firstName = parts[0];
      if (!this.lastName) this.lastName = parts.slice(1).join(" ");
    } else {
      // Single-word name — set firstName only
      if (!this.firstName) this.firstName = parts[0];
    }
  }

  // next();
});

// ─────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────
profileSchema.virtual("displayName").get(function () {
  return (
    this.fullName || `${this.firstName || ""} ${this.lastName || ""}`.trim()
  );
});

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Find a profile by email address (case-insensitive).
 * Returns null if not found — does NOT throw.
 * Used by profileResolver.helper.js before creating or reusing a profile.
 *
 * @param {string} email
 * @returns {Promise<Profile|null>}
 */
profileSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim(), isDeleted: false });
};

/**
 * Find or create a profile by email.
 * If a profile exists with this email, updates it with provided data and returns it.
 * If no profile exists, creates a new one.
 * Used exclusively by profileResolver.helper.js.
 *
 * @param {Object} profileData - { fullName, email, phone, whatsappNumber, profileType }
 * @returns {Promise<{ profile: Profile, isNew: boolean }>}
 */
profileSchema.statics.findOrCreate = async function (profileData) {
  const existingProfile = await this.findOne({
    email: profileData.email.toLowerCase().trim(),
    isDeleted: false,
  });

  if (existingProfile) {
    // Update mutable fields if they've changed
    let wasUpdated = false;

    if (
      profileData.fullName &&
      profileData.fullName !== existingProfile.fullName
    ) {
      existingProfile.fullName = profileData.fullName;
      wasUpdated = true;
    }
    if (profileData.phone && profileData.phone !== existingProfile.phone) {
      existingProfile.phone = profileData.phone;
      wasUpdated = true;
    }
    if (
      profileData.whatsappNumber &&
      profileData.whatsappNumber !== existingProfile.whatsappNumber
    ) {
      existingProfile.whatsappNumber = profileData.whatsappNumber;
      wasUpdated = true;
    }

    if (wasUpdated) {
      await existingProfile.save();
    }

    return { profile: existingProfile, isNew: false };
  }

  const newProfile = await this.create(profileData);
  return { profile: newProfile, isNew: true };
};

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
