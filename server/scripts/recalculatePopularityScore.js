'use strict';

/**
 * One-time migration: computes popularityScore for every existing
 * Programme document (the field defaults to 0 on documents created
 * before this batch). Uses a single bulkWrite for efficiency — one
 * round trip regardless of catalogue size, not N sequential saves.
 *
 * Run once: npm run recalculate:popularity
 */

import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`) });

import mongoose from 'mongoose';
import Programme from '../src/models/Programme.model.js';
import { calculatePopularityScore } from '../src/helpers/popularityScore.helper.js';
import { parseDurationToDays } from '../src/helpers/durationParser.helper.js';

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ Connected to: ${mongoose.connection.name}`);

    const programmes = await Programme.find({}).select('status enrollmentCount fees duration').lean();

    const bulkOps = programmes.map((p) => ({
        updateOne: {
            filter: { _id: p._id },
            update: {
                $set: {
                    popularityScore: calculatePopularityScore({
                        status: p.status,
                        enrollmentCount: p.enrollmentCount,
                        feesFull: p.fees?.full,
                        durationDays: parseDurationToDays(p.duration),
                    }),
                },
            },
        },
    }));

    if (bulkOps.length > 0) await Programme.bulkWrite(bulkOps);

    console.log(`✅ Recalculated popularity scores for ${bulkOps.length} programme(s).`);
    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});