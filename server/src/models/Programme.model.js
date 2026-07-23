'use strict';

/**
 * Programme Model
 *
 * Stores all 26 programmes across three categories:
 *   - Tech Development (15 programmes)
 *   - Management (7 programmes)
 *   - Short Term (4 sub-categories)
 *
 * Each programme has an embedded fee structure that supports both full
 * payment and instalment plan pricing. The instalment breakdown array
 * stores the exact amount for each instalment (1, 2, 3) with the
 * due day offset from the initial payment confirmation date.
 *
 * SLUG:
 *   Auto-generated from the programme name on first save.
 *   Used in public-facing URLs (e.g., /programmes/fullstack-web-development).
 *   Can be manually overridden if needed by Super Admin.
 *
 * ACTIVE COHORT:
 *   activeCohort holds a reference to the currently running cohort for
 *   this programme. Set by Super Admin when a new cohort is created and
 *   activated. Used by the frontend to determine Enroll Now vs Coming Soon.
 *   Cleared when a cohort is completed.
 *
 * SOFT DELETE:
 *   Programmes are never hard-deleted. isDeleted flag is used instead.
 *   Public queries always filter on isDeleted: false.
 */

import mongoose from 'mongoose';
import {
  PROGRAMME_CATEGORIES,
  PROGRAMME_STATUS,
} from '../config/constants.js';

// ── Embedded: Instalment Breakdown ────────────────────────────────────
const instalmentBreakdownSchema = new mongoose.Schema(
  {
    instalmentNumber: {
      type: Number,
      required: true,
      enum: {
        values: [1, 2, 3],
        message: 'Instalment number must be 1, 2, or 3.',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Instalment amount is required.'],
      min: [0, 'Instalment amount must be a positive number.'],
    },
    // Days from the initial payment confirmation date when this instalment is due.
    // Instalment 1: 0 (paid at enrollment)
    // Instalment 2: 30
    // Instalment 3: 60
    dueDayOffset: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { _id: false } // No separate _id for embedded subdocs
);

// ── Embedded: Fee Structure ───────────────────────────────────────────
const feesSchema = new mongoose.Schema(
  {
    full: {
      type: Number,
      required: [true, 'Full payment fee is required.'],
      min: [0, 'Fee must be a positive number.'],
    },
    instalment: {
      // Total across all 3 instalments (typically higher than full payment)
      total: {
        type: Number,
        default: null,
        min: [0, 'Instalment total must be a positive number.'],
      },
      // Array of 3 entries: one per instalment payment
      breakdown: {
        type: [instalmentBreakdownSchema],
        default: [],
        validate: {
          validator(breakdown) {
            // If instalment is configured, must have exactly 3 entries
            if (breakdown && breakdown.length > 0) {
              return breakdown.length === 3;
            }
            return true; // Empty array is fine (no instalment option for this programme)
          },
          message: 'Instalment breakdown must contain exactly 3 entries if provided.',
        },
      },
    },
  },
  { _id: false }
);

// ── Main Schema ───────────────────────────────────────────────────────
const programmeSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Programme name is required.'],
      unique: true,
      trim: true,
      minlength: [3, 'Programme name must be at least 3 characters.'],
      maxlength: [150, 'Programme name must not exceed 150 characters.'],
    },
    // URL-safe identifier, auto-generated from name
    slug: {
      type: String,
      // unique: true,
      lowercase: true,
      trim: true,
    },

    // ── Categorization ─────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Programme category is required.'],
      enum: {
        values: Object.values(PROGRAMME_CATEGORIES),
        message: `Category must be one of: ${Object.values(PROGRAMME_CATEGORIES).join(', ')}.`,
      },
    },
    // For Short Term programmes: the specific sub-category name.
    // E.g., "Digital Marketing", "Graphic Design", etc.
    // Optional for Tech and Management programmes.
    subCategory: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Content ────────────────────────────────────────────────────
   description: {
      type: String,
      required: [true, 'Programme description is required.'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters.'],
      maxlength: [2000, 'Description must not exceed 2000 characters.'],
    },
    // ── Expanded Detail Content (client Issue 4) ──────────────────
    subDescription: {
      type: String,
      trim: true,
      default: null,
      maxlength: [3000, 'Sub-description must not exceed 3000 characters.'],
    },
    bulletPoints: {
      type: [String],
      default: [],
      validate: {
        validator(points) {
          return points.length <= 15;
        },
        message: 'A programme may have at most 15 bullet points.',
      },
    },
    // Stored as a string for flexibility (e.g., "9 months", "6 weeks", "3 days")
    duration: {
      type: String,
      required: [true, 'Programme duration is required.'],
      trim: true,
      maxlength: [100, 'Duration must not exceed 100 characters.'],
    },
    prerequisites: {
      type: String,
      trim: true,
      default: null,
      maxlength: [500, 'Prerequisites must not exceed 500 characters.'],
    },

    // ── Status & Enrollment ────────────────────────────────────────
    status: {
      type: String,
      required: true,
      enum: {
        values: Object.values(PROGRAMME_STATUS),
        message: `Status must be one of: ${Object.values(PROGRAMME_STATUS).join(', ')}.`,
      },
      default: PROGRAMME_STATUS.COMING_SOON,
    },
    // Reference to the currently active cohort for this programme.
    // null = no active cohort (shows Coming Soon on frontend)
    // set  = cohort is running (shows Enroll Now on frontend)
    activeCohort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cohort',
      default: null,
    },

    // ── Fees ───────────────────────────────────────────────────────
    fees: {
      type: feesSchema,
      required: [true, 'Programme fee structure is required.'],
    },

    // ── Display Order ──────────────────────────────────────────────
    // Controls the order programmes appear within their category.
    // Lower values appear first. Defaults to insertion order.
    sortOrder: {
      type: Number,
      default: 0,
    },
    // ── Popularity Tracking (client Issue 8) ─────────────────────────
    // All-time total count of enrollment records ever created for this
    // programme (any payment status — a genuine attempt counts).
    // Incremented at the exact same point Cohort.currentEnrollmentCount
    // is incremented: Step 1 partial record creation in
    // enrollment.controller.js's createPartialRecord. Never decremented
    // by archivePartialEnrollment — popularity reflects historical
    // interest, not current pipeline state (Cohort's count is the one
    // that decrements on archive, this one does not).
    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Audit ──────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },

    // ── Soft Delete ────────────────────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
      select: false,
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
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletedBy;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────
programmeSchema.index({ slug: 1 }, { unique: true });
programmeSchema.index({ category: 1 });
programmeSchema.index({ status: 1 });
programmeSchema.index({ isDeleted: 1 });
programmeSchema.index({ category: 1, status: 1 });
programmeSchema.index({ category: 1, sortOrder: 1 });
// Text index for admin programme search
programmeSchema.index(
  { name: 'text', description: 'text' },
  { name: 'programme_search_index', weights: { name: 3, description: 1 } }
);

// ─────────────────────────────────────────────────────────────────────
// PRE-SAVE HOOK — Auto-generate Slug
// ─────────────────────────────────────────────────────────────────────
programmeSchema.pre('save', async function () {
  // Only regenerate slug if name has changed or slug is not yet set
  if (this.isModified('name') || !this.slug) {
    this.slug = generateSlug(this.name);
  }
  // next();
});

// ─────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────

/**
 * isEnrollmentOpen — true if the programme is active AND has an activeCohort set.
 * This is the definitive check for whether to show Enroll Now or Coming Soon.
 */
programmeSchema.virtual('isEnrollmentOpen').get(function () {
  return this.status === PROGRAMME_STATUS.ACTIVE && !!this.activeCohort;
});

/**
 * offersInstalment — true if the programme has a configured instalment plan.
 */
programmeSchema.virtual('offersInstalment').get(function () {
  return !!(
    this.fees &&
    this.fees.instalment &&
    this.fees.instalment.total &&
    this.fees.instalment.breakdown &&
    this.fees.instalment.breakdown.length === 3
  );
});

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Find a programme by its slug (URL-safe identifier).
 * Excludes soft-deleted programmes.
 *
 * @param {string} slug
 * @returns {Promise<Programme|null>}
 */
programmeSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug: slug.toLowerCase(), isDeleted: false });
};

/**
 * Get all active programmes grouped by category.
 * Used by the public programmes listing endpoint.
 *
 * @returns {Promise<Object>} { tech_development: [], management: [], short_term: [] }
 */
/**
 * getGroupedByCategory — public programme listing, ordered by all-time
 * popularity (client Issue 8: "most active, most enrolled for" first).
 * Sort priority: status (active programmes surface before Coming Soon),
 * then enrollmentCount descending, then sortOrder/name as tiebreakers.
 */
programmeSchema.statics.getGroupedByCategory = async function () {
  const programmes = await this.find({ isDeleted: false })
    .populate('activeCohort', 'name startDate endDate deliveryFormat status')
    .sort({ category: 1, status: -1, enrollmentCount: -1, sortOrder: 1, name: 1 })
    .lean();

  return programmes.reduce((groups, programme) => {
    const cat = programme.category;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(programme);
    return groups;
  }, {});
};

// ─────────────────────────────────────────────────────────────────────
// HELPER FUNCTION (module-scoped)
// ─────────────────────────────────────────────────────────────────────

/**
 * Convert a string to a URL-safe slug.
 * e.g., "Fullstack Web Development" → "fullstack-web-development"
 *
 * @param {string} text
 * @returns {string}
 */
const generateSlug = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')         // Spaces → hyphens
    .replace(/[^\w\-]+/g, '')     // Remove non-word chars
    .replace(/\-\-+/g, '-')       // Collapse multiple hyphens
    .replace(/^-+/, '')            // Remove leading hyphens
    .replace(/-+$/, '');           // Remove trailing hyphens

const Programme = mongoose.model('Programme', programmeSchema);

export default Programme;