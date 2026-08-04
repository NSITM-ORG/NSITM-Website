'use strict';

/**
 * Faq Model
 *
 * Replaces the static FAQ content in FaqPage.jsx and the inline FAQ
 * block on AboutPage.jsx (which now becomes a teaser linking to /faq).
 *
 * CATEGORY DESIGN (per confirmed decision — "both options"):
 *   `category` is a free-text string, NOT a ref to a separate Category
 *   collection. This means:
 *     - Super Admin can type an existing category name (reuses it) or
 *       a brand-new one (creates it implicitly) when creating/editing
 *       an FAQ — full free management, no fixed list to maintain.
 *     - constants.js ships DEFAULT_FAQ_CATEGORIES purely as a starter
 *       suggestion list for the admin UI's category dropdown — it is
 *       NOT enforced by an enum here.
 *
 * PUBLISHING:
 *   isPublished controls public visibility. Draft FAQs (isPublished:
 *   false) are visible only in the Super Admin management view.
 *
 * ORDERING:
 *   sortOrder controls display order within a category on the public
 *   FAQ page (ascending). Ties broken by createdAt.
 */

import mongoose from  'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required.'],
      trim: true,
      minlength: [5, 'Question must be at least 5 characters.'],
      maxlength: [300, 'Question must not exceed 300 characters.'],
    },
    answer: {
      type: String,
      required: [true, 'Answer is required.'],
      trim: true,
      minlength: [5, 'Answer must be at least 5 characters.'],
      maxlength: [3000, 'Answer must not exceed 3000 characters.'],
    },
    // Free-text category — see model docstring above.
    category: {
      type: String,
      required: [true, 'Category is required.'],
      trim: true,
      maxlength: [50, 'Category must not exceed 50 characters.'],
      default: 'General',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },

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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────
faqSchema.index({ category: 1, sortOrder: 1 });
faqSchema.index({ isPublished: 1 });
// Text index for Super Admin FAQ search
faqSchema.index({ question: 'text', answer: 'text' }, { name: 'faq_search_index' });

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Get all published FAQs grouped by category, for the public /faq page.
 * Sorted by sortOrder ascending within each category, then createdAt.
 *
 * @returns {Promise<Object>} { "Enrollment": [...], "Payment": [...], ... }
 */
faqSchema.statics.getPublishedGrouped = async function () {
  const faqs = await this.find({ isPublished: true })
    .sort({ category: 1, sortOrder: 1, createdAt: 1 })
    .lean();

  return faqs.reduce((groups, faq) => {
    if (!groups[faq.category]) groups[faq.category] = [];
    groups[faq.category].push(faq);
    return groups;
  }, {});
};

/**
 * Get the distinct list of categories currently in use.
 * Used by the Super Admin FAQ management UI to populate the category
 * dropdown alongside the DEFAULT_FAQ_CATEGORIES suggestions.
 *
 * @returns {Promise<string[]>}
 */
faqSchema.statics.getDistinctCategories = function () {
  return this.distinct('category');
};

const Faq = mongoose.model('Faq', faqSchema);

export default Faq;