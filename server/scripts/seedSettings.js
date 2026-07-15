'use strict';

/**
 * Settings Seed Script
 *
 * Initializes the Settings singleton with placeholder bank details and
 * WhatsApp info so /public/settings returns usable (if fake) data during
 * local testing, instead of empty strings.
 *
 * SAFE TO RE-RUN: Settings.getSettings() already upserts on first access
 * (see Settings.model.js) — this script simply calls updateSettings()
 * with placeholder values ONLY if the bank account number is still blank,
 * so it never clobbers real values a Super Admin has already entered.
 *
 * USAGE:
 *   npm run seed:settings
 */

import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
});

import mongoose from 'mongoose'
import Settings from '../src/models/Settings.model.js'

const seed = async () => {
  const { MONGO_URI } = process.env;
  if (!MONGO_URI) {
    console.error('\n❌ MONGO_URI is not defined. Check your .env file.\n');
    process.exit(1);
  }

  console.log('\n🌱 NSITM Settings Seed Script');
  console.log('─'.repeat(40));

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected to: ${mongoose.connection.name}`);

    const settings = await Settings.getSettings();

    if (settings.bankDetails?.accountNumber) {
      console.log('ℹ️  Bank details already configured. No changes made.\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    await Settings.updateSettings(
      {
        bankDetails: {
          bankName: '[PLACEHOLDER] Guaranty Trust Bank',
          accountNumber: '0000000000',
          accountName: 'Nextserve School of Information Technology and Management',
        },
        whatsapp: {
          number: '+2340000000000',
          link: 'https://wa.me/2340000000000',
        },
        institution: {
          address: '[PLACEHOLDER] Lagos, Nigeria',
          phone: '+2340000000000',
          email: 'nsitmonline@gmail.com',
        },
      },
      null
    );

    console.log('✅ Placeholder settings created.');
    console.log('⚠️  These are FAKE values — replace via Super Admin before go-live.\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Seed failed: ${err.message}\n`);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

seed();