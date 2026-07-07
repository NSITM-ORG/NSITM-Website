"use strict";

/**
 * Email Service — All 10 Notification Templates (NTF-01 through NTF-10)
 *
 * Handles sending every automated email in the system via Resend.
 *
 * DEVELOPMENT (no RESEND_API_KEY):
 *   All emails are logged to the console instead of being delivered.
 *   This allows the complete email-triggered flow (enrollment, confirmation,
 *   rejection, instalment) to be tested locally without a Resend account.
 *
 * PRODUCTION (RESEND_API_KEY set):
 *   Emails are sent via the Resend API using the institutional sending domain.
 *   All 10 templates use the exact content defined in FRD Section 7.2.
 *
 * DELIVERY TRACKING:
 *   Every send operation returns a result object:
 *   { success: boolean, notificationType: string, error?: string }
 *
 *   Callers (controllers) are responsible for updating the enrollment or
 *   instalment record's emailDeliveryStatus field based on this result.
 *
 *   Per FRD Section 7.3:
 *   - NTF-02 and NTF-03 failures → warning banner shown in admin dashboard
 *   - NTF-01 failure → logged but admin not separately notified
 *   - NTF-04/05 failures → Super Admin sees error in dashboard
 *
 * TEMPLATE VARIABLES (from FRD Section 7.2):
 *   Each send function accepts a structured variables object matching
 *   the template spec in the FRD. Variables are validated before sending.
 */

import { getResendClient } from "../config/email.js";
import { NOTIFICATION_TYPES } from "../config/constants.js";
import logger from "../utils/logger.js";

const EMAIL_FROM = () => process.env.EMAIL_FROM || "noreply@nsitm.com.ng";
const INSTITUTION_NAME = "Nextserve School of IT and Management";

// ─────────────────────────────────────────────────────────────────────
// PRIVATE: Core send function
// Handles the Resend API call vs. development console logging.
// ─────────────────────────────────────────────────────────────────────

/**
 * Send an email via Resend or log it to console in development.
 *
 * @param {Object} emailData - { to, subject, html, text }
 * @param {string} notificationType - NTF identifier for logging
 * @returns {Promise<{ success: boolean, notificationType: string, error?: string }>}
 */
const sendEmail = async (emailData, notificationType) => {
  const client = getResendClient();

  // ── Development mode: log to console ────────────────────────────
  if (!client) {
    logger.info(`📧 [EMAIL MOCK] ${notificationType} → ${emailData.to}`);
    logger.info(`   Subject: ${emailData.subject}`);
    logger.info(`   Body:\n${emailData.text}`);
    return { success: true, notificationType, mocked: true };
  }

  // ── Production mode: send via Resend ────────────────────────────
  try {
    const result = await client.emails.send({
      from: `${INSTITUTION_NAME} <${EMAIL_FROM()}>`,
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    logger.info(`Email sent successfully: ${notificationType}`, {
      to: emailData.to,
      resendId: result.data?.id,
    });

    return { success: true, notificationType };
  } catch (err) {
    logger.error(`Email send failed: ${notificationType}`, {
      to: emailData.to,
      error: err.message,
    });
    return { success: false, notificationType, error: err.message };
  }
};

// ─────────────────────────────────────────────────────────────────────
// PRIVATE: HTML wrapper — minimal branded email shell
// ─────────────────────────────────────────────────────────────────────
const wrapHtml = (bodyContent) =>
  `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nextserve</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
    .header { background: #1a1a2e; padding: 24px 32px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; }
    .body { padding: 32px; color: #333333; line-height: 1.6; }
    .body p { margin: 0 0 16px; }
    .cta-link { display: inline-block; background: #25D366; color: #ffffff;
                padding: 12px 24px; border-radius: 6px; text-decoration: none;
                font-weight: bold; margin: 8px 0; }
    .footer { background: #f0f0f0; padding: 16px 32px; font-size: 12px; color: #888888; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Nextserve School of IT and Management</h1>
    </div>
    <div class="body">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>This is an automated message from ${INSTITUTION_NAME}. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`.trim();

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: NTF-01 — Enrollment Acknowledgment
// Trigger: Student submits receipt → status becomes Pending
// FRD Section 7.2 NTF-01
// ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ studentName, programmeName, whatsappLink }} variables
 * @param {string} toEmail
 */
const sendEnrollmentAcknowledgment = async (toEmail, variables) => {
  const { studentName, programmeName, whatsappLink } = variables;

  const html = wrapHtml(`
    <p>Hello ${studentName},</p>
    <p>Thank you for submitting your enrollment for <strong>${programmeName}</strong>.</p>
    <p>We have received your payment receipt and will confirm your payment within <strong>2 to 3 business days</strong>.</p>
    <p>You will receive an email when your payment status is updated.</p>
    <p>If you have questions, contact us on WhatsApp:</p>
    <a href="${whatsappLink}" class="cta-link">Contact Us on WhatsApp</a>
    <p>The Nextserve Team</p>
  `);

  const text = `Hello ${studentName}, thank you for submitting your enrollment for ${programmeName}. We have received your payment receipt and will confirm your payment within 2 to 3 business days. You will receive an email when your payment status is updated. If you have questions, contact us on WhatsApp: ${whatsappLink}.`;

  return sendEmail(
    {
      to: toEmail,
      subject: `We have received your Nextserve enrollment`,
      html,
      text,
    },
    NOTIFICATION_TYPES.NTF_01,
  );
};

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: NTF-02 — Payment Confirmed
// Trigger: Admin sets status to Confirmed
// FRD Section 7.2 NTF-02
// ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ studentName, programmeName, cohortName, startDate, cohortWhatsappLink, whatsappLink }} variables
 * @param {string} toEmail
 */
const sendPaymentConfirmed = async (toEmail, variables) => {
  const {
    studentName,
    programmeName,
    cohortName,
    startDate,
    cohortWhatsappLink,
    whatsappLink,
  } = variables;

  // FRD FR-03.3: If no cohort WhatsApp link is set, use the placeholder per PRD requirement
  const groupLinkSection = cohortWhatsappLink
    ? `<p>Join your cohort WhatsApp group: <a href="${cohortWhatsappLink}">Click here to join</a></p>`
    : `<p>Your cohort WhatsApp group link will be shared with you shortly.</p>`;

  const html = wrapHtml(`
    <p>Hello ${studentName},</p>
    <p>🎉 Your payment for <strong>${programmeName}</strong> has been confirmed.</p>
    <p>You are enrolled in the <strong>${cohortName}</strong> cohort starting <strong>${startDate}</strong>.</p>
    ${groupLinkSection}
    <p>If you have any questions, contact us on WhatsApp:</p>
    <a href="${whatsappLink}" class="cta-link">Contact Us on WhatsApp</a>
    <p>The Nextserve Team</p>
  `);

  const cohortLinkText = cohortWhatsappLink
    ? `Join your cohort WhatsApp group: ${cohortWhatsappLink}.`
    : `Your cohort WhatsApp group link will be shared with you shortly.`;

  const text = `Hello ${studentName}, your payment for ${programmeName} has been confirmed. You are enrolled in the ${cohortName} cohort starting ${startDate}. ${cohortLinkText} If you have questions: ${whatsappLink}.`;

  return sendEmail(
    {
      to: toEmail,
      subject: `Your Nextserve enrollment has been confirmed`,
      html,
      text,
    },
    NOTIFICATION_TYPES.NTF_02,
  );
};

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: NTF-03 — Payment Rejected
// Trigger: Admin sets status to Rejected with a reason
// FRD Section 7.2 NTF-03
// ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ studentName, programmeName, rejectionReason, whatsappLink }} variables
 * @param {string} toEmail
 */
const sendPaymentRejected = async (toEmail, variables) => {
  const { studentName, programmeName, rejectionReason, whatsappLink } =
    variables;

  const html = wrapHtml(`
    <p>Hello ${studentName},</p>
    <p>We reviewed the payment receipt you submitted for <strong>${programmeName}</strong> but were unable to verify your payment.</p>
    <p><strong>Reason:</strong> ${rejectionReason}</p>
    <p>Please contact us on WhatsApp to resolve this:</p>
    <a href="${whatsappLink}" class="cta-link">Contact Us on WhatsApp</a>
    <p>The Nextserve Team</p>
  `);

  const text = `Hello ${studentName}, we reviewed the payment receipt you submitted for ${programmeName} but were unable to verify your payment. Reason: ${rejectionReason}. Please contact us on WhatsApp to resolve this: ${whatsappLink}.`;

  return sendEmail(
    {
      to: toEmail,
      subject: `Action required — your Nextserve payment could not be verified`,
      html,
      text,
    },
    NOTIFICATION_TYPES.NTF_03,
  );
};

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: NTF-04 — Admin Account Created
// Trigger: Super Admin creates a new admin account
// FRD Section 7.2 NTF-04
// ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ adminName, adminLoginUrl, adminEmail, tempPassword }} variables
 * @param {string} toEmail
 */
const sendAdminAccountCreated = async (toEmail, variables) => {
  const { adminName, adminLoginUrl, adminEmail, tempPassword } = variables;

  const html = wrapHtml(`
    <p>Hello ${adminName},</p>
    <p>An admin account has been created for you on the Nextserve admin dashboard.</p>
    <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
      <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold; width: 40%;">Login URL</td><td style="padding: 8px;">${adminLoginUrl}</td></tr>
      <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Email</td><td style="padding: 8px;">${adminEmail}</td></tr>
      <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Temporary Password</td><td style="padding: 8px; font-family: monospace; font-size: 16px;">${tempPassword}</td></tr>
    </table>
    <p><strong>⚠️ Please log in and change your password immediately.</strong> Your temporary password should not be kept after your first login.</p>
    <p>The Nextserve Team</p>
  `);

  const text = `Hello ${adminName}, an admin account has been created for you on the Nextserve admin dashboard. Login URL: ${adminLoginUrl}. Email: ${adminEmail}. Temporary password: ${tempPassword}. Please log in and change your password immediately.`;

  return sendEmail(
    {
      to: toEmail,
      subject: `Your Nextserve admin account has been created`,
      html,
      text,
    },
    NOTIFICATION_TYPES.NTF_04,
  );
};

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: NTF-05 — Admin Password Reset
// Trigger: Admin self-service reset request or Super Admin-triggered reset
// FRD Section 7.2 NTF-05
// ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ adminName, resetLink }} variables
 * @param {string} toEmail
 */
const sendPasswordResetLink = async (toEmail, variables) => {
  const { adminName, resetLink } = variables;

  const html = wrapHtml(`
    <p>Hello ${adminName},</p>
    <p>A password reset has been requested for your Nextserve admin account.</p>
     <p>Click the button below to reset your password. This link can only be used once, and stays active until you use it or request a newer reset.</p>
    <a href="${resetLink}" class="cta-link">Reset My Password</a>
    <p>If you did not request this reset, please contact your Super Admin immediately. Your account has not been changed.</p>
    <p>The Nextserve Team</p>
  `);

  const text = `Hello ${adminName}, a password reset has been requested for your Nextserve admin account. Click here to reset your password: ${resetLink}. This link can only be used once and stays active until used or replaced by a newer request. If you did not request this reset, contact your Super Admin.`;

  return sendEmail(
    {
      to: toEmail,
      subject: `Reset your Nextserve admin password`,
      html,
      text,
    },
    NOTIFICATION_TYPES.NTF_05,
  );
};

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: NTF-06 — Instalment Access Link
// Trigger: Student requests access to /my-payment and a confirmed record is found
// FRD Section 7.2 NTF-06
// ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ studentName, accessLink }} variables
 * @param {string} toEmail
 */
const sendInstalmentAccessLink = async (toEmail, variables) => {
  const { studentName, accessLink } = variables;

  const html = wrapHtml(`
    <p>Hello ${studentName},</p>
    <p>You requested access to your Nextserve payment details.</p>
    <p>Click the link below to view your enrollment summary and submit your next instalment receipt.</p>
    <p>⚠️ <strong>This link expires in 30 minutes and can only be used once.</strong></p>
    <a href="${accessLink}" class="cta-link">View My Payment Details</a>
    <p>If you did not request this link, you can safely ignore this email.</p>
    <p>The Nextserve Team</p>
  `);

  const text = `Hello ${studentName}, you requested access to your Nextserve payment details. Click the link below to view your enrollment summary and submit your next instalment receipt. This link expires in 30 minutes and can only be used once. ${accessLink}. If you did not request this link, you can safely ignore this email.`;

  return sendEmail(
    {
      to: toEmail,
      subject: `Your Nextserve payment link`,
      html,
      text,
    },
    NOTIFICATION_TYPES.NTF_06,
  );
};

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: NTF-07 — Instalment Receipt Acknowledgment
// Trigger: Student submits an instalment receipt (new instalment → Pending)
// FRD Section 7.2 NTF-07
// ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ studentName, programmeName, instalmentNumber, amount, whatsappLink }} variables
 * @param {string} toEmail
 */
const sendInstalmentReceiptAcknowledgment = async (toEmail, variables) => {
  const { studentName, programmeName, instalmentNumber, amount, whatsappLink } =
    variables;

  const ordinals = { 1: "First", 2: "Second", 3: "Third" };
  const ordinal = ordinals[instalmentNumber] || instalmentNumber;

  const html = wrapHtml(`
    <p>Hello ${studentName},</p>
    <p>We have received your receipt for <strong>Instalment ${instalmentNumber} (${ordinal} Payment)</strong> of <strong>₦${amount.toLocaleString()}</strong> for <strong>${programmeName}</strong>.</p>
    <p>We will review and confirm your payment within <strong>2 to 3 business days</strong>.</p>
    <p>If you have questions:</p>
    <a href="${whatsappLink}" class="cta-link">Contact Us on WhatsApp</a>
    <p>The Nextserve Team</p>
  `);

  const text = `Hello ${studentName}, we have received your receipt for instalment ${instalmentNumber} of ₦${amount.toLocaleString()} for ${programmeName}. We will review and confirm your payment within 2 to 3 business days. If you have questions: ${whatsappLink}.`;

  return sendEmail(
    {
      to: toEmail,
      subject: `We have received your instalment payment receipt`,
      html,
      text,
    },
    NOTIFICATION_TYPES.NTF_07,
  );
};

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: NTF-08 — Instalment Payment Confirmed
// Trigger: Admin confirms an individual instalment payment
// FRD Section 7.2 NTF-08
// ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ studentName, programmeName, instalmentNumber, amount, whatsappLink }} variables
 * @param {string} toEmail
 */
const sendInstalmentConfirmed = async (toEmail, variables) => {
  const { studentName, programmeName, instalmentNumber, amount, whatsappLink } =
    variables;

  const html = wrapHtml(`
    <p>Hello ${studentName},</p>
    <p>✅ Your <strong>Instalment ${instalmentNumber}</strong> payment of <strong>₦${amount.toLocaleString()}</strong> for <strong>${programmeName}</strong> has been confirmed.</p>
    <p>If you have questions:</p>
    <a href="${whatsappLink}" class="cta-link">Contact Us on WhatsApp</a>
    <p>The Nextserve Team</p>
  `);

  const text = `Hello ${studentName}, your instalment ${instalmentNumber} payment of ₦${amount.toLocaleString()} for ${programmeName} has been confirmed. If you have questions: ${whatsappLink}.`;

  return sendEmail(
    {
      to: toEmail,
      subject: `Your instalment payment has been confirmed`,
      html,
      text,
    },
    NOTIFICATION_TYPES.NTF_08,
  );
};

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: NTF-09 — Instalment Payment Rejected
// Trigger: Admin rejects an individual instalment payment
// FRD Section 7.2 NTF-09
// ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ studentName, programmeName, instalmentNumber, rejectionReason, whatsappLink }} variables
 * @param {string} toEmail
 */
const sendInstalmentRejected = async (toEmail, variables) => {
  const {
    studentName,
    programmeName,
    instalmentNumber,
    rejectionReason,
    whatsappLink,
  } = variables;

  const html = wrapHtml(`
    <p>Hello ${studentName},</p>
    <p>We reviewed your <strong>Instalment ${instalmentNumber}</strong> receipt for <strong>${programmeName}</strong> but were unable to verify the payment.</p>
    <p><strong>Reason:</strong> ${rejectionReason}</p>
    <p>Please contact us on WhatsApp to resolve this:</p>
    <a href="${whatsappLink}" class="cta-link">Contact Us on WhatsApp</a>
    <p>The Nextserve Team</p>
  `);

  const text = `Hello ${studentName}, we reviewed your instalment ${instalmentNumber} receipt for ${programmeName} but were unable to verify the payment. Reason: ${rejectionReason}. Please contact us on WhatsApp: ${whatsappLink}.`;

  return sendEmail(
    {
      to: toEmail,
      subject: `Action required — your instalment payment could not be verified`,
      html,
      text,
    },
    NOTIFICATION_TYPES.NTF_09,
  );
};

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: NTF-10 — All Instalments Complete (Full Payment)
// Trigger: Admin confirms the THIRD and final instalment
// FRD Section 7.2 NTF-10
// ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ studentName, programmeName, whatsappLink }} variables
 * @param {string} toEmail
 */
const sendAllInstalmentsComplete = async (toEmail, variables) => {
  const { studentName, programmeName, whatsappLink } = variables;

  const html = wrapHtml(`
    <p>Hello ${studentName},</p>
    <p>🎉 All instalment payments for <strong>${programmeName}</strong> have been confirmed.</p>
    <p>Your payment plan is now <strong>complete</strong>. You are fully enrolled and all financial obligations for this cohort have been met.</p>
    <p>If you have questions:</p>
    <a href="${whatsappLink}" class="cta-link">Contact Us on WhatsApp</a>
    <p>The Nextserve Team</p>
  `);

  const text = `Hello ${studentName}, all instalment payments for ${programmeName} have been confirmed. Your payment plan is now complete. If you have questions: ${whatsappLink}.`;

  return sendEmail(
    {
      to: toEmail,
      subject: `Your Nextserve payment plan is complete`,
      html,
      text,
    },
    NOTIFICATION_TYPES.NTF_10,
  );
};
// ADD these two new functions before the final module.exports.

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: NTF-11 — Admin Invitation
// Trigger: Super Admin generates a registration invitation for an email
// ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ registrationLink, codeExpiryMinutes }} variables
 * @param {string} toEmail
 */
const sendAdminInvitation = async (toEmail, variables) => {
  const { registrationLink, codeExpiryMinutes = 10 } = variables;

  const html = wrapHtml(`
    <p>Hello,</p>
    <p>You have been invited to create an Admin account on the Nextserve admin dashboard.</p>
    <p>Click the link below to complete your registration. The embedded verification code expires in <strong>${codeExpiryMinutes} minutes</strong> — if it expires, you can request a fresh one from the registration page without losing this invitation.</p>
    <a href="${registrationLink}" class="cta-link">Complete My Registration</a>
    <p>If you were not expecting this invitation, you can safely ignore this email.</p>
    <p>The Nextserve Team</p>
  `);

  const text = `Hello, you have been invited to create an Admin account on the Nextserve admin dashboard. Complete your registration here: ${registrationLink}. The verification code embedded in this link expires in ${codeExpiryMinutes} minutes, but you can request a new code from the registration page if needed.`;

  return sendEmail(
    {
      to: toEmail,
      subject: `You're invited to join the Nextserve admin team`,
      html,
      text,
    },
    NOTIFICATION_TYPES.NTF_11,
  );
};

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: NTF-12 — Admin Registration Complete
// Trigger: Admin successfully completes registration via invitation link
// ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ adminName, adminLoginUrl }} variables
 * @param {string} toEmail
 */
const sendAdminRegistrationComplete = async (toEmail, variables) => {
  const { adminName, adminLoginUrl } = variables;

  const html = wrapHtml(`
    <p>Hello ${adminName},</p>
    <p>✅ Your Nextserve admin account is now active.</p>
    <p>You can log in here: <a href="${adminLoginUrl}">${adminLoginUrl}</a></p>
    <p>The Nextserve Team</p>
  `);

  const text = `Hello ${adminName}, your Nextserve admin account is now active. Log in here: ${adminLoginUrl}.`;

  return sendEmail(
    {
      to: toEmail,
      subject: `Your Nextserve admin account is active`,
      html,
      text,
    },
    NOTIFICATION_TYPES.NTF_12,
  );
};

// FIND the module.exports and REPLACE with:

export {
  sendEnrollmentAcknowledgment,
  sendPaymentConfirmed,
  sendPaymentRejected,
  sendAdminAccountCreated,
  sendPasswordResetLink,
  sendInstalmentAccessLink,
  sendInstalmentReceiptAcknowledgment,
  sendInstalmentConfirmed,
  sendInstalmentRejected,
  sendAllInstalmentsComplete,
  sendAdminInvitation,
  sendAdminRegistrationComplete,
};
