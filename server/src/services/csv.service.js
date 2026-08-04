'use strict';

/**
 * CSV Export Service
 *
 * Generates a CSV file from populated enrollment records for Super Admin export.
 * FRD FR-05.4: Super Admin can export the full student database with filters.
 *
 * CSV COLUMNS (exact FRD FR-05.4 spec):
 *   Full Name, Phone Number, WhatsApp Number, Email Address, Programme,
 *   Cohort, Delivery Format, Payment Type, Deposit Amount, Payment Status,
 *   Referred By Code, Enrollment Date, Receipt File Reference,
 *   Admin Who Actioned, Action Date, Rejection Reason, Partial Enrollment Flag
 *
 * FILENAME FORMAT: NSITM_Students_[YYYY-MM-DD].csv (FRD FR-05.4)
 *
 * CALLED BY: analytics.controller.js → exportStudentsCsv
 *
 * The controller is responsible for:
 *   - Querying the database with applied filters
 *   - Populating all necessary references (profile, programme, cohort, actionedBy)
 *   - Passing the populated array to generateCsv()
 */

import { stringify } from 'csv-stringify/sync';
import logger from '../utils/logger.js';

// ─────────────────────────────────────────────────────────────────────
// CSV COLUMN DEFINITIONS
// Exact column headers from FRD FR-05.4 + transform functions
// ─────────────────────────────────────────────────────────────────────
const CSV_COLUMNS = [
  {
    header: 'Full Name',
    key: 'fullName',
    transform: (record) => record.profile?.fullName || '',
  },
  {
    header: 'Phone Number',
    key: 'phoneNumber',
    transform: (record) => record.profile?.phone || '',
  },
  {
    header: 'WhatsApp Number',
    key: 'whatsappNumber',
    transform: (record) => record.profile?.whatsappNumber || record.profile?.phone || '',
  },
  {
    header: 'Email Address',
    key: 'emailAddress',
    transform: (record) => record.profile?.email || '',
  },
  {
    header: 'Programme',
    key: 'programme',
    transform: (record) => record.programme?.name || '',
  },
  {
    header: 'Cohort',
    key: 'cohort',
    transform: (record) => record.cohort?.name || '',
  },
  {
    header: 'Delivery Format',
    key: 'deliveryFormat',
    transform: (record) => {
      const formats = { in_person: 'In-Person', online: 'Online' };
      return formats[record.deliveryFormat] || record.deliveryFormat || '';
    },
  },
  {
    header: 'Payment Type',
    key: 'paymentType',
    transform: (record) => {
      const types = { full: 'Full Payment', instalment: 'Instalment' };
      return types[record.paymentType] || record.paymentType || '';
    },
  },
  {
    header: 'Deposit Amount',
    key: 'depositAmount',
    transform: (record) =>
      record.depositAmount != null ? `₦${record.depositAmount.toLocaleString()}` : '',
  },
  {
    header: 'Payment Status',
    key: 'paymentStatus',
    transform: (record) => {
      const statuses = {
        not_paid: 'Not Paid',
        pending: 'Pending',
        confirmed: 'Confirmed',
        rejected: 'Rejected',
      };
      return statuses[record.paymentStatus] || record.paymentStatus || '';
    },
  },
  {
    header: 'Referred By Code',
    key: 'referralCode',
    transform: (record) => record.referralCode || '',
  },
  {
    header: 'Enrollment Date',
    key: 'enrollmentDate',
    transform: (record) => {
      if (!record.createdAt) return '';
      return new Date(record.createdAt).toISOString().split('T')[0];
    },
  },
  {
    header: 'Receipt File Reference',
    key: 'receiptFileReference',
    transform: (record) => {
      if (!record.receipt || !record.receipt.url) return '';
      if (record.receipt.url === 'local_upload_skipped') return 'local_upload_skipped';
      return record.receipt.url;
    },
  },
  {
    header: 'Admin Who Actioned',
    key: 'adminWhoActioned',
    transform: (record) => record.actionedBy?.email || '',
  },
  {
    header: 'Action Date',
    key: 'actionDate',
    transform: (record) => {
      if (!record.actionedAt) return '';
      return new Date(record.actionedAt).toISOString().split('T')[0];
    },
  },
  {
    header: 'Rejection Reason',
    key: 'rejectionReason',
    transform: (record) => record.rejectionReason || '',
  },
  {
    header: 'Partial Enrollment Flag',
    key: 'isPartialEnrollment',
    transform: (record) => (record.isPartialEnrollment ? 'Yes' : 'No'),
  },
];

/**
 * Generate a CSV string from an array of populated enrollment records.
 *
 * @param {Array} enrollments - Populated enrollment documents (profile, programme, cohort, actionedBy all populated)
 * @returns {string} CSV content as a UTF-8 string
 */
const generateCsv = (enrollments) => {
  if (!enrollments || enrollments.length === 0) {
    // Return CSV with only headers when no records match the filter
    const headers = CSV_COLUMNS.map((col) => col.header);
    return stringify([headers]);
  }

  // Map each enrollment to a flat row object
  const rows = enrollments.map((record) => {
    const row = {};
    CSV_COLUMNS.forEach((col) => {
      try {
        row[col.header] = col.transform(record);
      } catch (err) {
        logger.warn(`CSV transform error for column '${col.header}'`, {
          error: err.message,
          recordId: record._id,
        });
        row[col.header] = '';
      }
    });
    return row;
  });

  const csvString = stringify(rows, {
    header: true,
    columns: CSV_COLUMNS.map((col) => ({ key: col.header, header: col.header })),
    cast: {
      // Ensure all values are strings (handles nulls, numbers, booleans)
      object: (value) => (value === null || value === undefined ? '' : String(value)),
    },
  });

  logger.info('CSV generated successfully', {
    rowCount: rows.length,
    columns: CSV_COLUMNS.length,
  });

  return csvString;
};

/**
 * Generate the export filename with today's date.
 * FRD FR-05.4: "NSITM_Students_[YYYY-MM-DD].csv"
 *
 * @returns {string}
 */
const generateFilename = () => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `NSITM_Students_${date}.csv`;
};

/**
 * Send the CSV as a downloadable file response.
 * Sets the correct Content-Disposition and Content-Type headers.
 *
 * @param {import('express').Response} res
 * @param {string} csvContent - The CSV string from generateCsv()
 * @param {string} [filename] - Optional custom filename
 */
const sendCsvResponse = (res, csvContent, filename) => {
  const outputFilename = filename || generateFilename();

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
  res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf-8'));

  // UTF-8 BOM for Excel compatibility (ensures ₦ symbol displays correctly)
  res.send('\uFEFF' + csvContent);
};

export {
  generateCsv,
  generateFilename,
  sendCsvResponse,
};