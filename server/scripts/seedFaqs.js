'use strict';

/**
 * FAQ Seed Script
 *
 * Populates a starter set of FAQs across the DEFAULT_FAQ_CATEGORIES so
 * the public /faq page and the Postman documentation for section 5.1
 * ("GET /public/faqs") have real data to return instead of an empty
 * object on a fresh database.
 *
 * SAFE TO RE-RUN: skips any question that already exists (matched
 * case-insensitively), never duplicates or overwrites.
 *
 * USAGE:
 *   npm run seed:faqs
 */

import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
});

const mongoose = require('mongoose');
const Faq = require('../src/models/Faq.model');

const STARTER_FAQS = [
  {
    category: 'Enrollment',
    question: 'How do I enroll in a programme?',
    answer: 'Click "Enroll Now" on any active programme page. This opens a four-step form: personal details, policy acknowledgment, payment details, and receipt upload. Your selected programme is pre-filled automatically.',
    sortOrder: 0,
  },
  {
    category: 'Enrollment',
    question: 'What happens if I start the enrollment form but do not finish it?',
    answer: 'Your details are saved as soon as you complete the first step. If you do not complete payment, our team may reach out to help you finish enrolling.',
    sortOrder: 1,
  },
  {
    category: 'Payment',
    question: 'What payment methods are accepted?',
    answer: 'We currently accept bank transfer only. After completing the enrollment form, you will see our bank account details and be asked to upload proof of payment.',
    sortOrder: 0,
  },
  {
    category: 'Payment',
    question: 'Can I pay in instalments?',
    answer: 'Yes. Select "Instalment" during the payment step. You pay 40% upfront, then the remaining balance in two follow-up payments due 30 and 60 days after your first payment is confirmed.',
    sortOrder: 1,
  },
  {
    category: 'Payment',
    question: 'How long does payment confirmation take?',
    answer: 'Our team typically confirms payments within 2 to 3 business days of receiving your receipt. You will be notified by email once confirmed.',
    sortOrder: 2,
  },
  {
    category: 'Programmes',
    question: 'What programmes does Nextserve offer?',
    answer: 'We offer 15 Tech Development programmes, 7 Management programmes, and 4 Short Term programme categories. Visit our Programmes page for the full list.',
    sortOrder: 0,
  },
  {
    category: 'Programmes',
    question: 'Are programmes available online or only in person?',
    answer: 'Both. Most programmes offer an Online and an In-Person delivery format — you choose during enrollment.',
    sortOrder: 1,
  },
  {
    category: 'General',
    question: 'How can I contact Nextserve directly?',
    answer: 'You can reach us via the WhatsApp button on any page, or by sending a message through the contact form in our footer.',
    sortOrder: 0,
  },
  {
    category: 'General',
    question: 'Does Nextserve issue certificates on completion?',
    answer: 'Certificate details vary by programme and will be communicated by your instructor during your cohort.',
    sortOrder: 1,
  },
];

const seed = async () => {
  const { MONGO_URI } = process.env;
  if (!MONGO_URI) {
    console.error('\n❌ MONGO_URI is not defined. Check your .env file.\n');
    process.exit(1);
  }

  console.log('\n🌱 NSITM FAQ Seed Script');
  console.log('─'.repeat(40));

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected to: ${mongoose.connection.name}`);

    let created = 0;
    let skipped = 0;

    for (const faqDef of STARTER_FAQS) {
      const existing = await Faq.findOne({
        question: { $regex: `^${faqDef.question}$`, $options: 'i' },
      });

      if (existing) {
        skipped += 1;
        continue;
      }

      await Faq.create({
        ...faqDef,
        isPublished: true,
        createdBy: null,
        updatedBy: null,
      });

      created += 1;
      console.log(`   + Created: "${faqDef.question}"`);
    }

    console.log('─'.repeat(40));
    console.log(`✅ Done. ${created} created, ${skipped} already existed (skipped).\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Seed failed: ${err.message}\n`);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

seed();