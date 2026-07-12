/**
 * Frontend Constants — mirrors the backend's src/config/constants.js
 * enum values exactly, so UI code never hardcodes a status string that
 * could drift from what the API actually returns.
 */

export const ROLES = { ADMIN: 'admin', SUPER_ADMIN: 'super_admin' };

export const PAYMENT_STATUS = {
  NOT_PAID: 'not_paid',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
};

export const PAYMENT_STATUS_LABELS = {
  not_paid: 'Not Paid',
  pending: 'Pending Review',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
};

export const PAYMENT_STATUS_COLORS = {
  not_paid: 'grey',
  pending: 'yellow',
  confirmed: 'green',
  rejected: 'red',
};

export const INSTALMENT_STATUS = {
  NOT_SUBMITTED: 'not_submitted',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
};

export const PAYMENT_TYPES = { FULL: 'full', INSTALMENT: 'instalment' };

export const DELIVERY_FORMATS = { ONLINE: 'online', IN_PERSON: 'in_person' };

export const PROGRAMME_CATEGORIES = {
  TECH_DEVELOPMENT: 'tech_development',
  MANAGEMENT: 'management',
  SHORT_TERM: 'short_term',
};

export const PROGRAMME_CATEGORY_LABELS = {
  tech_development: 'Tech Development',
  management: 'Management',
  short_term: 'Short Term',
};

export const PROGRAMME_STATUS = { ACTIVE: 'active', COMING_SOON: 'coming_soon' };

export const JOIN_COMMUNITY_ROLES = { FRONTEND_DEV: 'frontend_dev', BACKEND_DEV: 'backend_dev' };

export const JOIN_COMMUNITY_ROLE_LABELS = {
  frontend_dev: 'Frontend Developer',
  backend_dev: 'Backend Developer',
};

/** Programme pagination page size per responsive breakpoint (confirmed decision). */
export const PROGRAMME_PAGE_SIZE = { mobile: 4, tablet: 6, desktop: 8 };

export const UPLOAD = {
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
};