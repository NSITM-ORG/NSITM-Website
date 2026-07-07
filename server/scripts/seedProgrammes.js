'use strict';

/**
 * Programme Seed Script
 *
 * Populates the database with all 26 confirmed programmes from
 * ALL_PROGRAMMES (src/config/constants.js), using placeholder fee
 * structures where exact fees are not yet confirmed by the founder.
 *
 * SAFE TO RE-RUN:
 *   Uses findOrCreate-style logic per programme (matched by slug) —
 *   existing programmes are left untouched, only missing ones are
 *   inserted. Never overwrites data an admin may have already edited.
 *
 * FEE DEFAULTS:
 *   Fullstack Web Development and Front-End Web Development use the
 *   PRD-confirmed fees (Q-06). All other programmes receive a
 *   category-level placeholder fee that Super Admin MUST review and
 *   correct via the Programme Management panel before go-live —
 *   this script's purpose is to unblock testing, not to set final prices.
 *
 * USAGE:
 *   npm run seed:programmes
 */

import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
});

const mongoose = require('mongoose');
const Programme = require('../src/models/Programme.model');
const {
  ALL_PROGRAMMES,
  PROGRAMME_CATEGORIES,
  PROGRAMME_STATUS,
  KNOWN_PROGRAMME_FEES,
} = require('../src/config/constants');

// ── Placeholder fee bands by category (Super Admin must correct these) ──
const PLACEHOLDER_FEES = {
  [PROGRAMME_CATEGORIES.TECH_DEVELOPMENT]: { full: 250000, instalmentTotal: 270000 },
  [PROGRAMME_CATEGORIES.MANAGEMENT]: { full: 150000, instalmentTotal: 165000 },
  [PROGRAMME_CATEGORIES.SHORT_TERM]: { full: 60000, instalmentTotal: null }, // Short term: full payment only
};

const buildFees = (programmeDef) => {
  // Confirmed real fees for the two June 2026 launch programmes (PRD Q-06)
  if (programmeDef.slug === 'fullstack-web-development') {
    return {
      full: KNOWN_PROGRAMME_FEES.FULLSTACK_WEB_DEV.full,
      instalment: {
        total: KNOWN_PROGRAMME_FEES.FULLSTACK_WEB_DEV.instalment,
        breakdown: [
          { instalmentNumber: 1, amount: 152000, dueDayOffset: 0 },
          { instalmentNumber: 2, amount: 114000, dueDayOffset: 30 },
          { instalmentNumber: 3, amount: 114000, dueDayOffset: 60 },
        ],
      },
    };
  }
  if (programmeDef.slug === 'front-end-web-development') {
    return {
      full: KNOWN_PROGRAMME_FEES.FRONTEND_WEB_DEV.full,
      instalment: {
        total: KNOWN_PROGRAMME_FEES.FRONTEND_WEB_DEV.instalment,
        breakdown: [
          { instalmentNumber: 1, amount: 92000, dueDayOffset: 0 },
          { instalmentNumber: 2, amount: 69000, dueDayOffset: 30 },
          { instalmentNumber: 3, amount: 69000, dueDayOffset: 60 },
        ],
      },
    };
  }

  // Placeholder fees for all other programmes
  const band = PLACEHOLDER_FEES[programmeDef.category];
  if (!band.instalmentTotal) {
    return { full: band.full, instalment: { total: null, breakdown: [] } };
  }

  const first = Math.round(band.instalmentTotal * 0.4);
  const second = Math.round(band.instalmentTotal * 0.3);
  const third = band.instalmentTotal - first - second;

  return {
    full: band.full,
    instalment: {
      total: band.instalmentTotal,
      breakdown: [
        { instalmentNumber: 1, amount: first, dueDayOffset: 0 },
        { instalmentNumber: 2, amount: second, dueDayOffset: 30 },
        { instalmentNumber: 3, amount: third, dueDayOffset: 60 },
      ],
    },
  };
};

const buildDescription = (programmeDef) =>
  `${programmeDef.name} is one of Nextserve's ${
    programmeDef.category === PROGRAMME_CATEGORIES.SHORT_TERM ? 'short-term' : 'core'
  } training programmes, delivered through hands-on, project-based instruction. ` +
  `Full curriculum details, prerequisites, and cohort dates will be confirmed by the founder before this programme's status is set to Active.`;

const seed = async () => {
  const { MONGO_URI } = process.env;
  if (!MONGO_URI) {
    console.error('\n❌ MONGO_URI is not defined. Check your .env file.\n');
    process.exit(1);
  }

  console.log('\n🌱 NSITM Programme Seed Script');
  console.log('─'.repeat(40));

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected to: ${mongoose.connection.name}`);

    let created = 0;
    let skipped = 0;

    for (const programmeDef of ALL_PROGRAMMES) {
      const existing = await Programme.findOne({ slug: programmeDef.slug });

      if (existing) {
        skipped += 1;
        continue;
      }

      await Programme.create({
        name: programmeDef.name,
        slug: programmeDef.slug,
        category: programmeDef.category,
        subCategory: programmeDef.subCategory || null,
        description: buildDescription(programmeDef),
        duration: programmeDef.category === PROGRAMME_CATEGORIES.SHORT_TERM ? '6 weeks' : '6 months',
        status: PROGRAMME_STATUS.COMING_SOON, // Safe default — Super Admin activates manually
        fees: buildFees(programmeDef),
        sortOrder: 0,
        createdBy: null,
        updatedBy: null,
      });

      created += 1;
      console.log(`   + Created: ${programmeDef.name}`);
    }

    console.log('─'.repeat(40));
    console.log(`✅ Done. ${created} created, ${skipped} already existed (skipped).`);
    console.log(`⚠️  All fees are placeholders except Fullstack & Front-End Web Development.`);
    console.log(`⚠️  Review and correct fees, descriptions, and durations via Super Admin before go-live.\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Seed failed: ${err.message}\n`);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

seed();