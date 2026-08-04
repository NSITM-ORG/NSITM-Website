'use strict';

/**
 * Analytics Controller — Super Admin Only
 * FRD FR-05.3, FR-05.4
 */

import Enrollment from '../models/Enrollment.model.js';
import InstalmentPayment from '../models/InstalmentPayment.model.js';
import Cohort from '../models/Cohort.model.js';
import Programme from '../models/Programme.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { generateCsv, sendCsvResponse } from '../services/csv.service.js';
import { HTTP_STATUS, PAYMENT_STATUS, AUDIT_ACTIONS } from '../config/constants.js';

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/superadmin/analytics
// FR-05.3 — all required metrics
// ─────────────────────────────────────────────────────────────────────
const getAnalyticsOverview = asyncHandler(async (req, res, next) => {
  const { fromDate, toDate } = req.query;

  const dateFilter = {};
  if (fromDate || toDate) {
    dateFilter.createdAt = {};
    if (fromDate) dateFilter.createdAt.$gte = new Date(fromDate);
    if (toDate)   dateFilter.createdAt.$lte = new Date(toDate);
  }

  // ── Enrollments by cohort ─────────────────────────────────────
  const enrollmentsByCohort = await Enrollment.aggregate([
    {
      $match: {
        paymentStatus: { $in: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.CONFIRMED, PAYMENT_STATUS.REJECTED] },
        ...dateFilter,
      },
    },
    { $group: { _id: '$cohort', count: { $sum: 1 } } },
    { $lookup: { from: 'cohorts', localField: '_id', foreignField: '_id', as: 'cohort' } },
    { $unwind: { path: '$cohort', preserveNullAndEmptyArrays: true } },
    { $project: { cohortName: { $ifNull: ['$cohort.name', 'Unassigned'] }, count: 1 } },
  ]);

  // ── Confirmed revenue by cohort ───────────────────────────────
  const revenueByCohort = await Enrollment.aggregate([
    { $match: { paymentStatus: PAYMENT_STATUS.CONFIRMED, ...dateFilter } },
    {
      $group: {
        _id: '$cohort',
        totalRevenue: { $sum: '$depositAmount' },
        count: { $sum: 1 },
      },
    },
    { $lookup: { from: 'cohorts', localField: '_id', foreignField: '_id', as: 'cohort' } },
    { $unwind: { path: '$cohort', preserveNullAndEmptyArrays: true } },
    { $project: { cohortName: { $ifNull: ['$cohort.name', 'Unassigned'] }, totalRevenue: 1, count: 1 } },
  ]);

  // ── Pending payment value ─────────────────────────────────────
  const pendingValue = await Enrollment.aggregate([
    { $match: { paymentStatus: PAYMENT_STATUS.PENDING, ...dateFilter } },
    { $group: { _id: null, total: { $sum: '$depositAmount' }, count: { $sum: 1 } } },
  ]);

  // ── Rejected payment count ────────────────────────────────────
  const rejectedCount = await Enrollment.countDocuments({
    paymentStatus: PAYMENT_STATUS.REJECTED,
    ...dateFilter,
  });

  // ── Not Paid count by programme ───────────────────────────────
  const notPaidByProgramme = await Enrollment.aggregate([
    { $match: { paymentStatus: PAYMENT_STATUS.NOT_PAID, ...dateFilter } },
    { $group: { _id: '$programme', count: { $sum: 1 } } },
    { $lookup: { from: 'programmes', localField: '_id', foreignField: '_id', as: 'programme' } },
    { $unwind: { path: '$programme', preserveNullAndEmptyArrays: true } },
    { $project: { programmeName: { $ifNull: ['$programme.name', 'Unknown'] }, count: 1 } },
  ]);

  // ── Enrollment trend: new records per week over last 12 weeks ──
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  const enrollmentTrend = await Enrollment.aggregate([
    {
      $match: {
        createdAt: { $gte: twelveWeeksAgo },
        paymentStatus: { $in: [PAYMENT_STATUS.NOT_PAID, PAYMENT_STATUS.PENDING] },
      },
    },
    {
      $group: {
        _id: {
          week: { $isoWeek: '$createdAt' },
          year: { $isoWeekYear: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ]);

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    {
      enrollmentsByCohort,
      revenueByCohort,
      pendingPaymentValue: pendingValue[0]?.total || 0,
      pendingPaymentCount: pendingValue[0]?.count || 0,
      rejectedPaymentCount: rejectedCount,
      notPaidByProgramme,
      enrollmentTrend,
    },
    'Analytics overview retrieved successfully.'
  );
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/superadmin/analytics/export
// FR-05.4 — CSV export with filters
// ─────────────────────────────────────────────────────────────────────
const exportStudentsCsv = asyncHandler(async (req, res, next) => {
  const { cohort, status, fromDate, toDate } = req.query;

  const filter = {};
  if (cohort)  filter.cohort = cohort;
  if (status)  filter.paymentStatus = status;
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate)   filter.createdAt.$lte = new Date(toDate);
  }

  const enrollments = await Enrollment.find(filter)
    .populate('profile', 'fullName email phone whatsappNumber')
    .populate('programme', 'name')
    .populate('cohort', 'name')
    .populate('actionedBy', 'email')
    .sort({ createdAt: -1 })
    .lean();

  const csvContent = generateCsv(enrollments);

  await req.logAction(AUDIT_ACTIONS.CSV_EXPORTED, {
    description: 'Student database CSV exported',
    metadata: { filters: { cohort, status, fromDate, toDate }, rowCount: enrollments.length },
  });

  sendCsvResponse(res, csvContent);
});

export { getAnalyticsOverview, exportStudentsCsv };