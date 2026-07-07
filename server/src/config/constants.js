"use strict";

/**
 * Application-Wide Constants
 *
 * This is the single source of truth for all enumerated values,
 * configuration defaults, and system-wide constraints used across
 * models, controllers, services, and middleware.
 *
 * All values that appear in more than one place MUST be referenced
 * from here. No magic strings or magic numbers elsewhere in the codebase.
 */

// ─────────────────────────────────────────────────────────────────────
// HTTP STATUS CODES (convenience reference — avoids numeric literals)
// ─────────────────────────────────────────────────────────────────────
const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN ROLES
// Two roles exist in this system. Role assignment is made at account
// creation by Super Admin and cannot be self-modified.
// ─────────────────────────────────────────────────────────────────────
const ROLES = Object.freeze({
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
});

// ─────────────────────────────────────────────────────────────────────
// PROFILE TYPES
// Centralized profile system supports both admin and student identities.
// Students in v1 have profiles linked to enrollment records.
// Students in v2 will additionally have account records linked to profiles.
// ─────────────────────────────────────────────────────────────────────
const PROFILE_TYPES = Object.freeze({
  ADMIN: "admin",
  STUDENT: "student",
});

// ─────────────────────────────────────────────────────────────────────
// PAYMENT STATUSES
// Valid lifecycle states for an enrollment record's payment.
//   not_paid   — Partial enrollment record created (Step 1 advanced)
//   pending    — Student submitted receipt; awaiting admin review
//   confirmed  — Admin confirmed the payment
//   rejected   — Admin rejected the payment
// ─────────────────────────────────────────────────────────────────────
const PAYMENT_STATUS = Object.freeze({
  NOT_PAID: "not_paid",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
});

// ─────────────────────────────────────────────────────────────────────
// INSTALMENT PAYMENT STATUSES
// Valid states for individual InstalmentPayment records.
//   not_submitted — Record auto-created; student has not yet submitted a receipt
//   pending       — Student submitted a receipt; awaiting admin review
//   confirmed     — Admin confirmed this instalment
//   rejected      — Admin rejected this instalment
// NOTE: 'overdue' is a computed display state derived from dueDate.
//       It is NEVER stored in the database.
// ─────────────────────────────────────────────────────────────────────
const INSTALMENT_STATUS = Object.freeze({
  NOT_SUBMITTED: "not_submitted",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
});

// ─────────────────────────────────────────────────────────────────────
// PAYMENT TYPES
// Selected by the student during enrollment.
// ─────────────────────────────────────────────────────────────────────
const PAYMENT_TYPES = Object.freeze({
  FULL: "full",
  INSTALMENT: "instalment",
});

// ─────────────────────────────────────────────────────────────────────
// PROGRAMME CATEGORIES
// Three top-level categories for all 26 programmes.
// Short Term programmes additionally support a subCategory field.
// ─────────────────────────────────────────────────────────────────────
const PROGRAMME_CATEGORIES = Object.freeze({
  TECH_DEVELOPMENT: "tech_development",
  MANAGEMENT: "management",
  SHORT_TERM: "short_term",
});

// Display-ready labels for the above categories
const PROGRAMME_CATEGORY_LABELS = Object.freeze({
  tech_development: "Tech Development",
  management: "Management",
  short_term: "Short Term",
});

// ─────────────────────────────────────────────────────────────────────
// PROGRAMME STATUS
// Controls whether a programme shows an enrollment option or a
// 'Coming Soon' indicator on the public website.
// ─────────────────────────────────────────────────────────────────────
const PROGRAMME_STATUS = Object.freeze({
  ACTIVE: "active",
  COMING_SOON: "coming_soon",
});

// ─────────────────────────────────────────────────────────────────────
// COHORT STATUS
// Lifecycle state of a cohort.
// ─────────────────────────────────────────────────────────────────────
const COHORT_STATUS = Object.freeze({
  UPCOMING: "upcoming",
  ACTIVE: "active",
  COMPLETED: "completed",
});

// ─────────────────────────────────────────────────────────────────────
// DELIVERY FORMATS
// How a cohort/programme is delivered.
// ─────────────────────────────────────────────────────────────────────
const DELIVERY_FORMATS = Object.freeze({
  IN_PERSON: "in_person",
  ONLINE: "online",
});

// ─────────────────────────────────────────────────────────────────────
// FILE UPLOAD CONSTRAINTS
// Enforced by Multer middleware and validated in upload service.
// ─────────────────────────────────────────────────────────────────────
const UPLOAD = Object.freeze({
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".pdf"],
  // Stored on enrollment records when UPLOAD_ENABLED=false (local/dev)
  MOCK_PLACEHOLDER: Object.freeze({
    url: "local_upload_skipped",
    publicId: null,
    provider: "local",
  }),
});

// ─────────────────────────────────────────────────────────────────────
// CLOUDINARY FOLDER PATHS
// All NSITM files are organized under the 'nsitm/' root.
// ─────────────────────────────────────────────────────────────────────
const CLOUDINARY_FOLDERS = Object.freeze({
  ENROLLMENT_RECEIPTS: "nsitm/receipts/enrollment",
  INSTALMENT_RECEIPTS: "nsitm/receipts/instalments",
  ADMIN_AVATARS: "nsitm/avatars/admins",
});

// ─────────────────────────────────────────────────────────────────────
// INSTALMENT PLAN CONFIGURATION
// Defines the 3-payment structure, split percentages, and due dates.
//
// Split: Instalment 1 = 40%, Instalment 2 = 30%, Instalment 3 = 30%
// Due dates are calculated from the enrollment confirmation date:
//   Instalment 1: no due date (paid at initial enrollment)
//   Instalment 2: confirmation date + 30 days
//   Instalment 3: confirmation date + 60 days
// ─────────────────────────────────────────────────────────────────────
const INSTALMENT = Object.freeze({
  TOTAL_COUNT: 3,
  SPLIT_PERCENTAGES: Object.freeze({
    1: 0.4, // 40%
    2: 0.3, // 30%
    3: 0.3, // 30%
  }),
  DUE_DATE_OFFSET_DAYS: Object.freeze({
    1: null, // No due date for instalment 1 (paid at enrollment)
    2: 30, // 30 days from confirmation date
    3: 60, // 60 days from confirmation date
  }),
});

// Known programme fee structures (from resolved Q-06 in the PRD)
// This is used by the instalment calculator helper.
// Additional programmes and their fees are managed via the database (Settings / Programme model).
// These are the confirmed active programme fees for reference.
const KNOWN_PROGRAMME_FEES = Object.freeze({
  FULLSTACK_WEB_DEV: Object.freeze({
    full: 360000, // ₦360,000
    instalment: 380000, // ₦380,000 total across 3 instalments
    // Instalments: ₦152,000 / ₦114,000 / ₦114,000
  }),
  FRONTEND_WEB_DEV: Object.freeze({
    full: 210000, // ₦210,000
    instalment: 230000, // ₦230,000 total across 3 instalments
    // Instalments: ₦92,000 / ₦69,000 / ₦69,000
  }),
});

// ─────────────────────────────────────────────────────────────────────
// AUTHENTICATION & SESSION CONFIGURATION
// ─────────────────────────────────────────────────────────────────────
const AUTH = Object.freeze({
  MAX_LOGIN_ATTEMPTS: 3, // Before account lock
  LOCK_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  SESSION_INACTIVITY_LIMIT_MS: 60 * 60 * 1000, // 60 minutes
  INSTALMENT_TOKEN_EXPIRY_MS: 30 * 60 * 1000, // 30 minutes
  PASSWORD_RESET_TOKEN_EXPIRY_MS: 24 * 60 * 60 * 1000, // 24 hours (FRD FR-04.1.1)
  REFERRAL_CODE_MAX_LENGTH: 20,
  BCRYPT_SALT_ROUNDS: 12,
  TEMP_PASSWORD_LENGTH: 12, // For auto-generated temporary passwords (new admin accounts)
});

// ADD after the AUTH Object.freeze block (before RATE_LIMITS):

// ─────────────────────────────────────────────────────────────────────
// SHARED REGEX PATTERNS
// Centralized here so auth and enrollment validators stay in sync.
// ─────────────────────────────────────────────────────────────────────
const NIGERIAN_PHONE_REGEX = /^(\+234|0)(7[0-9]|8[0-9]|9[0-9])\d{8}$/;

// ─────────────────────────────────────────────────────────────────────
// ADMIN INVITATION & REGISTRATION CONFIGURATION
// ─────────────────────────────────────────────────────────────────────
const INVITATION = Object.freeze({
  CODE_EXPIRY_MS: 10 * 60 * 1000, // 10 minutes — verification code only (point 3)
  CODE_LENGTH: 8, // Verification code character length
  NOISE_TEXT_LENGTH: 10, // Meaningless 'rt' query param (point 5)
  TOKEN_BYTE_LENGTH: 32, // Same strength as other system tokens
});

// ─────────────────────────────────────────────────────────────────────
// RATE LIMITING CONFIGURATION
// Values derived from FRD Q-10 and Section 10.2 recommendations.
// ─────────────────────────────────────────────────────────────────────
const RATE_LIMITS = Object.freeze({
  // Admin login endpoint — beyond this, account-level lockout takes over
  LOGIN: Object.freeze({
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 10,
  }),
  // Step 1 advancement (partial record creation) — prevents bot-generated Not Paid records
  ENROLLMENT_STEP1: Object.freeze({
    WINDOW_MS: 10 * 60 * 1000, // 10 minutes
    MAX_REQUESTS: 5, // Per IP (FRD Q-10 recommendation)
  }),
  // /my-payment instalment link request — prevents email flooding
  INSTALMENT_LINK: Object.freeze({
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5, // Per IP (FRD FR-10.1 QA check)
  }),
  // Super Admin self-registration — guarded by setup key, still rate-limited
  // against brute-forcing the setup key itself.
  SUPER_ADMIN_REGISTER: Object.freeze({
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 5,
  }),
  // Admin registration link verification, code resend, and completion —
  // protects the 8-character verification code from brute-force attempts.
  ADMIN_REGISTRATION: Object.freeze({
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 10,
  }),
  // Public "Join Our Community" submissions
  JOIN_COMMUNITY: Object.freeze({
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 5,
  }),
  // Public "Contact Us" footer form submissions
  CONTACT_MESSAGE: Object.freeze({
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 5,
  }),

  // General API — catch-all protection
  GENERAL_API: Object.freeze({
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
  }),
});

// ─────────────────────────────────────────────────────────────────────
// VALID PAYMENT STATUS TRANSITIONS
// Maps current status → array of valid next statuses and who can perform them.
// Enforced server-side in the payment controller.
// Source: FRD FR-03.1 transition table.
// ─────────────────────────────────────────────────────────────────────
const PAYMENT_STATUS_TRANSITIONS = Object.freeze({
  // System-only transition: set automatically when receipt is submitted
  not_paid: Object.freeze({
    allowed: ["pending"],
    roles: ["system"],
  }),
  // Admin can confirm or reject. Super Admin can do both.
  pending: Object.freeze({
    allowed: ["confirmed", "rejected"],
    roles: ["admin", "super_admin"],
  }),
  // Only Super Admin can reverse a confirmation (BR05)
  confirmed: Object.freeze({
    allowed: ["pending"],
    roles: ["super_admin"],
  }),
  // Both Admin and Super Admin can reset rejected to pending (allows resubmission)
  rejected: Object.freeze({
    allowed: ["pending"],
    roles: ["admin", "super_admin"],
  }),
});

// ─────────────────────────────────────────────────────────────────────
// INSTALMENT PAYMENT COMPLETION STATES (FRD FR-10.5)
// Computed display state for instalment-plan students.
// Derived from their InstalmentPayment records — never stored as a field.
// ─────────────────────────────────────────────────────────────────────
const PAYMENT_COMPLETION_STATES = Object.freeze({
  PARTIALLY_PAID: "partially_paid", // Instalment 1 confirmed; 2 or 3 outstanding
  PENDING_COMPLETION: "pending_completion", // All submitted but ≥1 still pending admin review
  FULLY_PAID: "fully_paid", // All 3 confirmed
});

// ─────────────────────────────────────────────────────────────────────
// JOIN COMMUNITY — Role Options
// FRD delta: Home page "Join Our Community" dialog (email + role).
// ─────────────────────────────────────────────────────────────────────
const JOIN_COMMUNITY_ROLES = Object.freeze({
  FRONTEND_DEV: "frontend_dev",
  BACKEND_DEV: "backend_dev",
});

const JOIN_REQUEST_STATUS = Object.freeze({
  NEW: "new",
  REVIEWED: "reviewed",
  ARCHIVED: "archived",
});

// ─────────────────────────────────────────────────────────────────────
// CONTACT MESSAGE STATUS
// Footer "send us a message" form (name / email / message only).
// ─────────────────────────────────────────────────────────────────────
const CONTACT_MESSAGE_STATUS = Object.freeze({
  NEW: "new",
  READ: "read",
  ARCHIVED: "archived",
});

// ─────────────────────────────────────────────────────────────────────
// FAQ CONFIGURATION
// Default category seed set. Super Admin can add/rename/delete freely —
// category is stored as a free-text string on the FAQ document itself
// (no separate Category collection needed), so "add a new category" is
// just "type a new string when creating/editing an FAQ."
// ─────────────────────────────────────────────────────────────────────
const DEFAULT_FAQ_CATEGORIES = Object.freeze([
  "Enrollment",
  "Payment",
  "Programmes",
  "General",
]);

// ─────────────────────────────────────────────────────────────────────
// ALL 26 PROGRAMME DEFINITIONS (FRD FR-01.3)
// Used by the programme seed script and validators.
// Each entry: { name, slug, category, subCategory (Short Term only) }
// ─────────────────────────────────────────────────────────────────────
const ALL_PROGRAMMES = Object.freeze([
  // ── Tech Development (15) ────────────────────────────────────────
  {
    name: "Creative Graphics Design",
    slug: "creative-graphics-design",
    category: "tech_development",
  },
  { name: "UI/UX Design", slug: "ui-ux-design", category: "tech_development" },
  {
    name: "Data Analytics",
    slug: "data-analytics",
    category: "tech_development",
  },
  {
    name: "Cyber Security",
    slug: "cyber-security",
    category: "tech_development",
  },
  {
    name: "Software Engineering",
    slug: "software-engineering",
    category: "tech_development",
  },
  {
    name: "AI/Machine Learning",
    slug: "ai-machine-learning",
    category: "tech_development",
  },
  {
    name: "Front-End Web Development",
    slug: "front-end-web-development",
    category: "tech_development",
  },
  {
    name: "Back-End Web Development",
    slug: "back-end-web-development",
    category: "tech_development",
  },
  {
    name: "Fullstack Web Development",
    slug: "fullstack-web-development",
    category: "tech_development",
  },
  { name: "Data Science", slug: "data-science", category: "tech_development" },
  {
    name: "Ethical Hacking",
    slug: "ethical-hacking",
    category: "tech_development",
  },
  {
    name: "DevOps Engineering",
    slug: "devops-engineering",
    category: "tech_development",
  },
  {
    name: "Mobile App Development",
    slug: "mobile-app-development",
    category: "tech_development",
  },
  {
    name: "Cloud/Automation Engineering",
    slug: "cloud-automation-engineering",
    category: "tech_development",
  },
  {
    name: "Cloud Computing/Big Data Engineering",
    slug: "cloud-computing-big-data-engineering",
    category: "tech_development",
  },

  // ── Management (7) ───────────────────────────────────────────────
  {
    name: "Digital Marketing",
    slug: "digital-marketing",
    category: "management",
  },
  {
    name: "Project Management",
    slug: "project-management",
    category: "management",
  },
  {
    name: "Information Management",
    slug: "information-management",
    category: "management",
  },
  {
    name: "Quality Control Management",
    slug: "quality-control-management",
    category: "management",
  },
  { name: "Risk Management", slug: "risk-management", category: "management" },
  {
    name: "Human Resource Management",
    slug: "human-resource-management",
    category: "management",
  },
  {
    name: "Virtual Assistance",
    slug: "virtual-assistance",
    category: "management",
  },

  // ── Short Term (4 sub-categories) ────────────────────────────────
  {
    name: "Microsoft Office Suites",
    slug: "microsoft-office-suites",
    category: "short_term",
    subCategory: "Microsoft Office Suites",
  },
  {
    name: "Image/Video Editing",
    slug: "image-video-editing",
    category: "short_term",
    subCategory: "Image/Video Editing",
  },
  {
    name: "AutoCAD/ArchiCAD/Revit/SolidWorks",
    slug: "autocad-archicad-revit-solidworks",
    category: "short_term",
    subCategory: "AutoCAD/ArchiCAD/Revit/SolidWorks",
  },
  {
    name: "Sage/QuickBook/Vision/Tally",
    slug: "sage-quickbook-vision-tally",
    category: "short_term",
    subCategory: "Sage/QuickBook/Vision/Tally",
  },
]);

// Invalid transitions that must return 400 Bad Request (BR02, BR03)
const INVALID_PAYMENT_TRANSITIONS = Object.freeze([
  { from: "not_paid", to: "confirmed" }, // BR02 — must submit receipt first
  { from: "not_paid", to: "rejected" }, // BR03 — cannot reject without a receipt
  { from: "confirmed", to: "rejected" }, // Must reverse to pending first
]);

// ─────────────────────────────────────────────────────────────────────
// PAGINATION DEFAULTS
// ─────────────────────────────────────────────────────────────────────
const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100,
  JOIN_REQUESTS_LIMIT: 100, // Fixed page size for Join Community review list
  PROGRAMMES_DEFAULT_LIMIT: 8, // Server-side default when frontend omits ?limit
});

// ─────────────────────────────────────────────────────────────────────
// EMAIL NOTIFICATION IDENTIFIERS
// Maps each NTF reference from the PRD to a string identifier used in
// the email service to select the correct template.
// ─────────────────────────────────────────────────────────────────────
const NOTIFICATION_TYPES = Object.freeze({
  NTF_01: "receipt_acknowledgment", // Student submits receipt → Pending
  NTF_02: "payment_confirmed", // Admin confirms initial payment
  NTF_03: "payment_rejected", // Admin rejects initial payment
  NTF_04: "admin_account_created", // Super Admin creates a new admin
  NTF_05: "admin_password_reset", // Admin requests password reset link
  NTF_06: "instalment_access_link", // Student requests instalment access
  NTF_07: "instalment_receipt_submitted", // Student submits instalment receipt
  NTF_08: "instalment_confirmed", // Admin confirms one instalment
  NTF_09: "instalment_rejected", // Admin rejects one instalment
  NTF_10: "all_instalments_complete", // Final instalment confirmed
  NTF_11: "admin_invitation", // Invitation link + verification code
  NTF_12: "admin_registration_complete", // Confirmation after admin completes registration
});

// ─────────────────────────────────────────────────────────────────────
// AUDIT LOG ACTION TYPES
// Every significant system action is recorded with one of these strings.
// ─────────────────────────────────────────────────────────────────────
const AUDIT_ACTIONS = Object.freeze({
  // Authentication
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  FAILED_LOGIN: "FAILED_LOGIN",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  PASSWORD_RESET_REQUEST: "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET_COMPLETE: "PASSWORD_RESET_COMPLETE",

  // Payment management
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  PAYMENT_REJECTED: "PAYMENT_REJECTED",
  PAYMENT_REVERSED: "PAYMENT_REVERSED", // Super Admin only

  // Instalment management
  INSTALMENT_CONFIRMED: "INSTALMENT_CONFIRMED",
  INSTALMENT_REJECTED: "INSTALMENT_REJECTED",

  // Admin account management (Super Admin actions)
  ADMIN_ACCOUNT_CREATED: "ADMIN_ACCOUNT_CREATED",
  ADMIN_ACCOUNT_UPDATED: "ADMIN_ACCOUNT_UPDATED",
  ADMIN_ACCOUNT_DEACTIVATED: "ADMIN_ACCOUNT_DEACTIVATED",
  ADMIN_ACCOUNT_REACTIVATED: "ADMIN_ACCOUNT_REACTIVATED",
  ADMIN_ACCOUNT_DELETED: "ADMIN_ACCOUNT_DELETED",
  ADMIN_PASSWORD_RESET_BY_SUPER: "ADMIN_PASSWORD_RESET_BY_SUPER",

  SUPER_ADMIN_REGISTERED: "SUPER_ADMIN_REGISTERED",
  ADMIN_INVITATION_CREATED: "ADMIN_INVITATION_CREATED",
  ADMIN_INVITATION_REVOKED: "ADMIN_INVITATION_REVOKED",
  ADMIN_INVITATION_CODE_RESENT: "ADMIN_INVITATION_CODE_RESENT",
  ADMIN_REGISTRATION_COMPLETED: "ADMIN_REGISTRATION_COMPLETED",

  // Programme & Cohort management (Super Admin only)
  PROGRAMME_CREATED: "PROGRAMME_CREATED",
  PROGRAMME_UPDATED: "PROGRAMME_UPDATED",
  PROGRAMME_DELETED: "PROGRAMME_DELETED",
  COHORT_CREATED: "COHORT_CREATED",
  COHORT_UPDATED: "COHORT_UPDATED",
  COHORT_DELETED: "COHORT_DELETED",

  // System
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
  CSV_EXPORTED: "CSV_EXPORTED",
  JOIN_REQUEST_STATUS_UPDATED: "JOIN_REQUEST_STATUS_UPDATED",
  CONTACT_MESSAGE_STATUS_UPDATED: "CONTACT_MESSAGE_STATUS_UPDATED",
  FAQ_CREATED: "FAQ_CREATED",
  FAQ_UPDATED: "FAQ_UPDATED",
  FAQ_DELETED: "FAQ_DELETED",
  UNAUTHORIZED_ACCESS_ATTEMPT: "UNAUTHORIZED_ACCESS_ATTEMPT",
});

// ─────────────────────────────────────────────────────────────────────
// SETTINGS SINGLETON KEY
// The Settings collection holds exactly one document, identified by this key.
// ─────────────────────────────────────────────────────────────────────
const SETTINGS_SINGLETON_KEY = "global_settings";

export {
  HTTP_STATUS,
  ROLES,
  PROFILE_TYPES,
  PAYMENT_STATUS,
  INSTALMENT_STATUS,
  PAYMENT_TYPES,
  PROGRAMME_CATEGORIES,
  PROGRAMME_CATEGORY_LABELS,
  PROGRAMME_STATUS,
  COHORT_STATUS,
  DELIVERY_FORMATS,
  UPLOAD,
  CLOUDINARY_FOLDERS,
  INSTALMENT,
  KNOWN_PROGRAMME_FEES,
  AUTH,
  NIGERIAN_PHONE_REGEX,
  INVITATION,
  RATE_LIMITS,
  PAGINATION,
  NOTIFICATION_TYPES,
  AUDIT_ACTIONS,
  SETTINGS_SINGLETON_KEY,
  PAYMENT_STATUS_TRANSITIONS,
  INVALID_PAYMENT_TRANSITIONS,
  PAYMENT_COMPLETION_STATES,
  ALL_PROGRAMMES,
  JOIN_COMMUNITY_ROLES,
  JOIN_REQUEST_STATUS,
  CONTACT_MESSAGE_STATUS,
  DEFAULT_FAQ_CATEGORIES,
};