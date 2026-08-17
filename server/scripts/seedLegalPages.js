

import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
});

import mongoose from 'mongoose';
import LegalPage from '../src/models/LegalPage.model.js';


const pages = [
  {
    slug: 'terms-of-service',
    status: 'published',
    hero: {
      badgeIcon: 'FileText',
      badgeText: 'NEXTSERVE ACADEMY TERMS & CONDITIONS',
      title: 'Terms of Service',
      description: 'Please read these terms and conditions carefully before enrolling in any programme or using the Nextserve School of Information Technology and Management (NSITM) learning portal.',
      lastUpdated: 'January 2026',
      version: '2.0',
    },
    sections: [
      {
        id: 'acceptance',
        icon: 'CheckCircle2',
        title: '1. Acceptance of Terms',
        content: [
          { type: 'paragraph', text: 'By completing an enrollment application, creating an account, or submitting payment for any course or cohort at Nextserve Systems, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service' },
          { type: 'paragraph', text: 'If you are enrolling on behalf of an organization or corporate sponsor, you warrant that you possess full authority to bind that entity to these institutional terms' },
        ],
      },
      {
        id: 'admission',
        icon: 'UserCheck',
        title: '2. Admission & Enrollment Policies',
        content: [
          {
            type: 'list',
            items: [
              { label: 'Accurate Information:', text: 'Applicants must provide accurate, truthful personal details during registration. Misrepresentation may lead to immediate disqualification.' },
              { label: 'Prerequisites & Equipment:', text: 'Students enrolling in technical programmes (e.g. Software Engineering, Data Science, Cybersecurity) must possess a functional personal computer and reliable internet connectivity.' },
              { label: 'Seat Confirmation:', text: 'Admission into high-demand cohorts is finalized only upon receipt of initial deposit or full tuition payment.' },
            ],
          },
        ],
      },
      {
        id: 'fees',
        icon: 'DollarSign',
        title: '3. Fees, Payments & Refund Policy',
        content: [
          { type: 'paragraph', text: 'Nextserve offers competitive, transparent tuition pricing with structured installment payment options' },
          {
            type: 'list',
            items: [
              { label: 'Installment Schedules:', text: 'Students choosing installment plans must honor scheduled payment deadlines prior to cohort milestone dates. Failure to settle outstanding installments may result in temporary suspension of portal access.' },
              { label: 'Refund Eligibility:', text: 'Tuition refund requests must be submitted in writing at least 7 days prior to the official cohort start date. A 10% administrative processing fee applies.' },
              { label: 'Non-Refundable Phase:', text: 'Once classes commence and learning materials have been distributed, tuition payments become non-refundable. However, students in good standing may request a cohort deferral to a subsequent start date.' },
            ],
          },
        ],
      },
      {
        id: 'certification',
        icon: 'Award',
        title: '4. Certification & Academic Standards',
        content: [
          { type: 'paragraph', text: 'To qualify for an accredited Nextserve Certificate of Completion, students must satisfy all institutional academic criteria' },
          {
            type: 'grid',
            items: [
              { title: '80% Attendance', description: 'Mandatory active participation in live virtual sessions or in-person campus classes.', text: 'Mandatory active participation in live virtual sessions or in-person campus classes.' },
              { title: 'Capstone Project Defense', description: 'Successful defense and submission of practical production projects evaluated by instructors.', text: 'Successful defense and submission of practical production projects evaluated by instructors.' },
            ],
          },
        ],
      },
      {
        id: 'conduct',
        icon: 'ShieldAlert',
        title: '5. Code of Conduct & Intellectual Property',
        content: [
          { type: 'paragraph', text: 'Nextserve maintains a respectful, inclusive learning community. Harassment, academic dishonesty, plagiarism, or unauthorized redistribution of proprietary curriculum content, lecture videos, or codebase templates is strictly prohibited and grounds for immediate expulsion' },
        ],
      },
    ],
    supportCallout: {
      icon: 'HelpCircle',
      title: 'Need Clarification on Our Terms?',
      description: 'Our student support advisors are here to help answer any questions before or after enrollment.',
      ctaLabel: 'Visit FAQs',
      ctaIcon: 'FileText',
      ctaTo: '/faq',
    },
    bottomLinks: {
      left: { label: '← Read Privacy Policy', to: '/privacy-policy' },
      right: { label: 'Back to Home', to: '/' },
    },
    publishedAt: new Date(),
  },
  {
    slug: 'privacy-policy',
    status: 'published',
    hero: {
      badgeIcon: 'ShieldCheck',
      badgeText: 'NEXTSERVE PRIVACY & DATA PROTECTION',
      title: 'Privacy Policy',
      description: 'At Nextserve School of Information Technology and Management (NSITM), we take your privacy seriously. Learn how we collect, protect, and manage your data.',
      lastUpdated: 'January 2026',
      version: '2.0',
    },
    sections: [
      {
        id: 'collect',
        icon: 'Database',
        title: '1. Information We Collect',
        content: [
          { type: 'paragraph', text: 'When you enroll in a cohort, create an account, or request information from Nextserve, we collect essential personal and academic data required to process your application and manage your educational journey' },
          {
            type: 'list',
            items: [
              { label: 'Personal Identifiers:', text: 'Full legal name, email address, phone number, and residential state/country.' },
              { label: 'Enrollment Records:', text: 'Selected tech/management programmes, preferred learning format (In-Person vs. Online), and cohort schedules.' },
              { label: 'Transaction Metadata:', text: 'Payment reference numbers, receipt uploads, and installment schedules (financial data processed via certified payment gateways).' },
              { label: 'Academic Progress:', text: 'Project submissions, attendance records, instructor feedback, and certificate issuance status.' },
            ],
          },
        ],
      },
      {
        id: 'use',
        icon: 'Eye',
        title: '2. How We Use Your Data',
        content: [
          { type: 'paragraph', text: 'Nextserve utilizes collected student information strictly for academic, administrative, and verified institutional purposes' },
          {
            type: 'list',
            items: [
              { text: 'To verify your application eligibility and confirm cohort placements.' },
              { text: 'To provide live class access, portal credentials, and learning resources.' },
              { text: 'To generate verifiable digital certificates and transcript credentials upon program completion.' },
              { text: 'To send critical academic updates, timetable changes, and payment deadline reminders via SMS or Email.' },
              { text: 'To connect qualified graduates with industry hiring partners (only with your explicit opt-in consent).' },
            ],
          },
        ],
      },
      {
        id: 'security',
        icon: 'Lock',
        title: '3. Data Security & Storage',
        content: [
          { type: 'paragraph', text: 'We implement industry-standard technical and organizational safeguards to ensure your personal information remains confidential and protected against unauthorized access, loss, or misuse' },
          {
            type: 'grid',
            items: [
              {
                title: 'SSL/TLS Encryption',
                description: 'All browser-to-server data transmissions are protected by 256-bit SSL encryption protocols.',
                text: 'All browser-to-server data transmissions are protected by 256-bit SSL encryption protocols.'
              },
              {
                title: 'Role-Based Access',
                description: 'Administrative access to student records is strictly restricted to verified staff on a need-to-know basis.',
                text: 'Administrative access to student records is strictly restricted to verified staff on a need-to-know basis.'
              },
            ],
          },
        ],
      },
      {
        id: 'rights',
        icon: 'Bell',
        title: '4. Your Data Rights & Choices',
        content: [
          { type: 'paragraph', text: 'You have full control over your personal data submitted to Nextserve' },
          {
            type: 'list',
            items: [
              { label: 'Right to Access & Rectify:', text: 'You may review and update your profile details anytime via your student portal dashboard.' },
              { label: 'Right to Deletion:', text: 'You may request the permanent removal of non-essential profile data upon cohort graduation.' },
              { label: 'Communication Preferences:', text: 'You can opt out of promotional newsletters while retaining critical cohort notification messages.' },
            ],
          },
        ],
      },
    ],
    supportCallout: {
      icon: 'Mail',
      title: 'Have Questions About Your Privacy?',
      description: 'Contact our Data Protection Officer for inquiries regarding your student records or data rights.',
      ctaLabel: 'Contact DPO',
      ctaIcon: 'FileText',
      ctaHref: 'mailto:info@nsitm.org.ng',
    },
    bottomLinks: {
      left: { label: 'Read Terms of Service', to: '/terms-of-service' },
      right: { label: 'Back to Home', to: '/' },
    },
    publishedAt: new Date(),
  },
  {
    slug: 'no-refund-policy',
    status: 'published',
    hero: {
      badgeIcon: 'ShieldAlert',
      badgeText: 'INSTITUTIONAL POLICIES',
      title: 'No-Refund Policy',
      description: 'Understanding our commitment and your financial obligations upon enrollment at Nextserve.',
      lastUpdated: 'January 2026',
      version: '1.0',
    },
    sections: [
      {
        id: 'policy-details',
        icon: 'AlertCircle',
        title: '1. Non-Refundable Fees',
        content: [
          { type: 'paragraph', text: 'Fees paid are non-refundable under any circumstances, including withdrawal, deferral, or failure to attend. This policy is strictly enforced to maintain the quality of our programmes and secure resource allocation for enrolled students' },
          {
            type: 'list',
            items: [
              { label: 'Administrative Commitment:', text: 'Upon your enrollment, a seat is reserved, and administrative resources, including instructor scheduling and platform access, are immediately committed.' },
              { label: 'Deferral Alternative:', text: 'While refunds are not issued, students facing extenuating circumstances may apply for a cohort deferral to a future session, subject to administrative approval.' },
            ],
          },
        ],
      },
    ],
    supportCallout: {
      icon: 'HelpCircle',
      title: 'Questions regarding your payment?',
      description: 'If you have concerns about your financial obligations, please reach out to our admissions team.',
      ctaLabel: 'Contact Admissions',
      ctaIcon: 'Mail',
      ctaTo: '/contact',
    },
    bottomLinks: {
      left: { label: 'Back to Enrollment', to: '/enroll' },
      right: { label: 'Terms of Service', to: '/terms-of-service' },
    },
    publishedAt: new Date(),
  },
  {
    slug: 'attendance-policy',
    status: 'published',
    hero: {
      badgeIcon: 'Clock',
      badgeText: 'INSTITUTIONAL POLICIES',
      title: 'Attendance Policy',
      description: 'Our expectations for student participation and attendance in scheduled classes.',
      lastUpdated: 'January 2026',
      version: '1.0',
    },
    sections: [
      {
        id: 'attendance-rules',
        icon: 'CalendarCheck',
        title: '1. Minimum Attendance Requirements',
        content: [
          { type: 'paragraph', text: 'Active participation is critical to your success. Students are required to attend a minimum of 80% of scheduled sessions to qualify for graduation and certificate issuance' },
          {
            type: 'list',
            items: [
              { label: 'Tracking:', text: 'Attendance is strictly monitored for both online and in-person formats.' },
              { label: 'Absence Excuses:', text: 'Excused absences require prior notification and valid documentation, though they still count against the total attendance threshold.' },
              { label: 'Consequences of Poor Attendance:', text: 'Falling below the 80% threshold may result in academic probation or dismissal from the cohort without a refund.' },
            ],
          },
        ],
      },
    ],
    supportCallout: {
      icon: 'HelpCircle',
      title: 'Have a scheduling conflict?',
      description: 'Speak with your instructor or academic advisor to discuss makeup options.',
      ctaLabel: 'Contact Support',
      ctaIcon: 'MessageCircle',
      ctaTo: '/contact',
    },
    bottomLinks: {
      left: { label: 'Back to Enrollment', to: '/enroll' },
      right: { label: 'Code of Conduct', to: '/code-of-conduct' },
    },
    publishedAt: new Date(),
  },
  {
    slug: 'code-of-conduct',
    status: 'published',
    hero: {
      badgeIcon: 'Users',
      badgeText: 'INSTITUTIONAL POLICIES',
      title: 'Code of Conduct',
      description: 'Guidelines for maintaining a respectful and productive learning environment.',
      lastUpdated: 'January 2026',
      version: '1.0',
    },
    sections: [
      {
        id: 'conduct-guidelines',
        icon: 'HeartHandshake',
        title: '1. Respect and Professionalism',
        content: [
          { type: 'paragraph', text: 'Students must conduct themselves respectfully toward instructors and peers in all online and in-person interactions. We foster an inclusive environment free from discrimination, harassment, and disruptive behavior' },
          {
            type: 'grid',
            items: [
              {
                title: 'Online Etiquette',
                description: 'Maintain professionalism in chat rooms, forums, and virtual meetings.',
                text: 'Maintain professionalism in chat rooms, forums, and virtual meetings.'
              },
              {
                title: 'Academic Integrity',
                description: 'Plagiarism, cheating, and unauthorized collaboration will not be tolerated.',
                text: 'Plagiarism, cheating, and unauthorized collaboration will not be tolerated.'
              },
            ],
          },
        ],
      },
    ],
    supportCallout: {
      icon: 'AlertCircle',
      title: 'Report a Concern',
      description: 'If you witness or experience behavior violating this code, please report it immediately.',
      ctaLabel: 'Report Issue',
      ctaIcon: 'Flag',
      ctaTo: '/contact',
    },
    bottomLinks: {
      left: { label: 'Back to Enrollment', to: '/enroll' },
      right: { label: 'Attendance Policy', to: '/attendance-policy' },
    },
    publishedAt: new Date(),
  },
  {
    slug: 'payment-plan-terms',
    status: 'published',
    hero: {
      badgeIcon: 'CreditCard',
      badgeText: 'INSTITUTIONAL POLICIES',
      title: 'Payment Plan Terms',
      description: 'Agreements and obligations for students utilizing installment payment options.',
      lastUpdated: 'January 2026',
      version: '1.0',
    },
    sections: [
      {
        id: 'installment-rules',
        icon: 'FileText',
        title: '1. Installment Obligations',
        content: [
          { type: 'paragraph', text: 'Instalment payers must complete full payment within the agreed timeline. Failure to pay may result in suspension of access to sessions and learning materials' },
          {
            type: 'list',
            items: [
              { label: 'Schedule Adherence:', text: 'Payments are due on the exact dates outlined in your customized payment plan.' },
              { label: 'Late Fees & Suspension:', text: 'Grace periods are limited. Prolonged failure to settle dues will lead to temporary account deactivation.' },
              { label: 'Reactivation:', text: 'Access will be restored once all outstanding balances are cleared.' },
            ],
          },
        ],
      },
    ],
    supportCallout: {
      icon: 'HelpCircle',
      title: 'Payment Difficulties?',
      description: 'Reach out to our finance department before your due date to discuss alternative arrangements.',
      ctaLabel: 'Contact Finance',
      ctaIcon: 'DollarSign',
      ctaTo: '/contact',
    },
    bottomLinks: {
      left: { label: 'Back to Enrollment', to: '/enroll' },
      right: { label: 'No-Refund Policy', to: '/no-refund-policy' },
    },
    publishedAt: new Date(),
  },
];

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Missing MONGO_URI. Make sure your .env file is set up.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database.');

    await LegalPage.deleteMany({});
    console.log('Cleared existing Legal Pages.');

    for (const page of pages) {
      // The pre-save hook in LegalPage.model.js will automatically enforce punctuation
      await LegalPage.create(page);
    }

    console.log('Seeded Legal Pages successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed Legal Pages:', error);
    process.exit(1);
  }
}

seed();
