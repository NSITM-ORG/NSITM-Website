"use strict";

/**
 * Super Admin Seed Script
 *
 * Creates the initial Super Admin account. Run ONCE during initial deployment.
 * This script is required because there is no Super Admin account in the system
 * initially — the regular account creation endpoint requires Super Admin auth,
 * which doesn't exist yet.
 *
 * USAGE:
 *   Development:
 *     npm run seed:superadmin
 *
 *   Production (Railway):
 *     node scripts/seedSuperAdmin.js
 *     Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in environment before running.
 *
 * ENVIRONMENT VARIABLES REQUIRED:
 *   MONGO_URI             — MongoDB connection string
 *   SUPER_ADMIN_EMAIL     — Email for the Super Admin account
 *   SUPER_ADMIN_PASSWORD  — Initial password (change immediately after first login)
 *   SUPER_ADMIN_NAME      — Full name for the Super Admin profile
 *
 * SAFETY:
 *   - The script checks for an existing Super Admin before creating one.
 *   - If a Super Admin already exists, the script exits without making changes.
 *   - Credentials are read from environment variables — never hardcoded.
 */

import path from "path";
import dotenv from "dotenv";

// Load the correct .env file based on NODE_ENV
dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || "development"}`,
  ),
});

import mongoose from "mongoose";
import Account from "../src/models/Account.model.js";
import Profile from "../src/models/Profile.model.js";
import { ROLES, PROFILE_TYPES } from "../src/config/constants.js";

const seed = async () => {
  const {
    MONGO_URI,
    SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD,
    SUPER_ADMIN_NAME,
    SUPER_ADMIN_PHONE,
  } = process.env;

  // ── Validate required env vars ────────────────────────────────────
  const missing = [];
  if (!MONGO_URI) missing.push("MONGO_URI");
  if (!SUPER_ADMIN_EMAIL) missing.push("SUPER_ADMIN_EMAIL");
  if (!SUPER_ADMIN_PASSWORD) missing.push("SUPER_ADMIN_PASSWORD");
  if (!SUPER_ADMIN_NAME) missing.push("SUPER_ADMIN_NAME");
  if (!SUPER_ADMIN_PHONE) missing.push("SUPER_ADMIN_PHONE");

  if (missing.length > 0) {
    console.error("\n❌ Seed failed: Missing required environment variables:");
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error("\nAdd these to your .env file and run the script again.\n");
    process.exit(1);
  }

  // ── Password complexity check ─────────────────────────────────────
  const passwordChecks = [
    {
      test: SUPER_ADMIN_PASSWORD.length >= 8,
      message: "at least 8 characters",
    },
    {
      test: /[A-Z]/.test(SUPER_ADMIN_PASSWORD),
      message: "at least one uppercase letter",
    },
    {
      test: /[a-z]/.test(SUPER_ADMIN_PASSWORD),
      message: "at least one lowercase letter",
    },
    {
      test: /[0-9]/.test(SUPER_ADMIN_PASSWORD),
      message: "at least one number",
    },
  ];

  const failedChecks = passwordChecks.filter((c) => !c.test);
  if (failedChecks.length > 0) {
    console.error(
      "\n❌ Seed failed: SUPER_ADMIN_PASSWORD does not meet requirements:",
    );
    failedChecks.forEach((c) =>
      console.error(`   - Must contain ${c.message}`),
    );
    process.exit(1);
  }

  console.log("\n🌱 NSITM Super Admin Seed Script");
  console.log("─".repeat(40));

  try {
    // ── Connect to database ───────────────────────────────────────
    console.log(`\n🔌 Connecting to MongoDB...`);
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected to: ${mongoose.connection.name}`);

    // ── Check for existing Super Admin ────────────────────────────
    const existingSuperAdmin = await Account.findOne({
      role: ROLES.SUPER_ADMIN,
    });

    if (existingSuperAdmin) {
      console.log(`\n⚠️  A Super Admin account already exists:`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   ID:    ${existingSuperAdmin._id}`);
      console.log(`\nNo changes made. The script exited safely.\n`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const email = SUPER_ADMIN_EMAIL.toLowerCase().trim();

    // ── Check for existing profile with this email ────────────────
    let profile = await Profile.findByEmail(email);

    if (!profile) {
      profile = await Profile.create({
        fullName: SUPER_ADMIN_NAME.trim(),
        email,
        phone: SUPER_ADMIN_PHONE.trim(),
        profileType: PROFILE_TYPES.ADMIN,
        isVerified: true,
      });
      console.log(`\n✅ Profile created for: ${SUPER_ADMIN_NAME}`);
    } else {
      console.log(`\n ℹ️  Using existing profile for email: ${email}`);
    }

    // ── Create Super Admin account ────────────────────────────────
    const account = await Account.create({
      profile: profile._id,
      email,
      password: SUPER_ADMIN_PASSWORD, // Hashed by pre-save hook
      role: ROLES.SUPER_ADMIN,
      isActive: true,
      isTempPassword: false,
      createdBy: null, // First account — no creator
    });

    console.log(`\n✅ Super Admin account created successfully!`);
    console.log(`\n${"─".repeat(40)}`);
    console.log(`   Name:  ${SUPER_ADMIN_NAME}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role:  ${ROLES.SUPER_ADMIN}`);
    console.log(`   ID:    ${account._id}`);
    console.log(`${"─".repeat(40)}`);
    console.log(`\n⚠️  IMPORTANT: Keep these credentials secure.`);
    console.log(
      `   Log in at: ${process.env.ADMIN_URL || "http://localhost:3000"}/admin/login`,
    );
    console.log(`   Change your password after first login.\n`);

    await mongoose.disconnect();
    console.log(`✅ Database connection closed.\n`);
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Seed failed with error:`);
    console.error(`   ${err.message}`);
    if (err.code === 11000) {
      console.error(
        `   A duplicate key error occurred. An account with this email may already exist.`,
      );
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

seed();
