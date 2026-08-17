'use strict';

import mongoose from 'mongoose';

/**
 * Ensures a paragraph text ends with the correct punctuation based on what follows it.
 * @param {string} text - The text to process
 * @param {string} expectedPunctuation - '.' or ':'
 * @returns {string} The formatted text
 */
function enforcePunctuation(text, expectedPunctuation) {
  if (!text) return text;
  let trimmed = text.trim();
  // Remove any trailing periods or colons
  while (trimmed.endsWith('.') || trimmed.endsWith(':')) {
    trimmed = trimmed.slice(0, -1).trim();
  }
  return trimmed + expectedPunctuation;
}

/**
 * Iterate over all sections and blocks to enforce the paragraph punctuation rules.
 */
function applyPunctuationRules(sections) {
  if (!Array.isArray(sections)) return;

  sections.forEach((section) => {
    if (!Array.isArray(section.content)) return;

    for (let i = 0; i < section.content.length; i++) {
      const block = section.content[i];
      if (block.type === 'paragraph') {
        const nextBlock = section.content[i + 1];
        if (nextBlock && (nextBlock.type === 'list' || nextBlock.type === 'grid')) {
          block.text = enforcePunctuation(block.text, ':');
        } else {
          block.text = enforcePunctuation(block.text, '.');
        }
      }
    }
  });
}

const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['paragraph', 'list', 'grid'],
      required: true,
    },
    // For 'paragraph'
    text: {
      type: String,
      default: '',
    },
    // For 'list'
    items: {
      type: [
        new mongoose.Schema({
          label: { type: String, default: null },
          text: { type: String, default: '' },
          // text: { type: String, required: true },
          title: { type: String, default: null }, // for grid
          description: { type: String, default: null }, // for grid
        }, { _id: false })
      ],
      default: undefined,
    },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    icon: { type: String, required: true },
    title: { type: String, required: true },
    content: {
      type: [contentBlockSchema],
      default: [],
    },
  },
  { _id: false }
);

const legalPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      enum: [
        'terms-of-service',
        'privacy-policy',
        'refund-policy',
        // 'no-refund-policy',
        'attendance-policy',
        'code-of-conduct',
        'payment-plan',
        // 'payment-plan-terms',
      ],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    hero: {
      badgeIcon: { type: String, default: 'FileText' },
      badgeText: { type: String, default: '' },
      title: { type: String, required: true },
      description: { type: String, default: '' },
      lastUpdated: { type: String, default: '' },
      version: { type: String, default: '1.0' },
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
    supportCallout: {
      icon: { type: String, default: 'HelpCircle' },
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      ctaLabel: { type: String, default: '' },
      ctaIcon: { type: String, default: 'FileText' },
      ctaHref: { type: String, default: null },
      ctaTo: { type: String, default: null },
    },
    bottomLinks: {
      left: {
        label: { type: String, default: '' },
        to: { type: String, default: '/' },
      },
      right: {
        label: { type: String, default: '' },
        to: { type: String, default: '/' },
      },
    },
    publishedAt: {
      type: Date,
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
    toObject: { virtuals: true },
  }
);

// Pre-save hook to enforce punctuation rules
legalPageSchema.pre('save', function () {
  if (this.sections) {
    applyPunctuationRules(this.sections);
  }
  // next();
});

// Pre-findOneAndUpdate hook to enforce punctuation rules
legalPageSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update.$set && update.$set.sections) {
    applyPunctuationRules(update.$set.sections);
  } else if (update.sections) {
    applyPunctuationRules(update.sections);
  }
  // next();
});

const LegalPage = mongoose.model('LegalPage', legalPageSchema);

export default LegalPage;
