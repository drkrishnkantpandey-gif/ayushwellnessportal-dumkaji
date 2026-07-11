/**
 * mailer.js — Unified email sender
 *
 * HOW IT WORKS:
 * ─────────────────────────────────────────────────────────────────────────────
 * If RESEND_API_KEY is set  → uses Resend HTTP API (works on Render free tier)
 * If EMAIL_HOST is set      → uses SMTP (works on NIC Cloud / any mail server)
 *
 * NO CODE CHANGE needed when switching environments — just set env variables.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * For Render (testing):
 *   RESEND_API_KEY = re_xxxxxxxxxxxx   (from resend.com)
 *   EMAIL_FROM     = onboarding@resend.dev  (or your verified domain)
 *
 * For NIC Cloud (production):
 *   EMAIL_HOST     = <nic-smtp-server>
 *   EMAIL_PORT     = 587
 *   EMAIL_SECURE   = false
 *   EMAIL_USER     = ayush@nic.in
 *   EMAIL_PASSWORD = <password>
 *   EMAIL_FROM     = AYUSH Portal <ayush@nic.in>
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// ── Decide which provider to use ─────────────────────────────────────────────
const useResend = !!process.env.RESEND_API_KEY;

let transporter = null;
let resendClient = null;

if (useResend) {
  // Resend HTTP API — not blocked by Render or any cloud firewall
  const { Resend } = require('resend');
  resendClient = new Resend(process.env.RESEND_API_KEY);
  console.log('[Email] Using Resend HTTP API for email delivery');
} else {
  // SMTP — for NIC Cloud, government mail servers, or any SMTP provider
  transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: { rejectUnauthorized: false }
  });

  // Verify connection on startup — result shows in server logs immediately
  transporter.verify((err) => {
    if (err) {
      console.error('[Email] SMTP verification FAILED:', err.message,
        '| host:', process.env.EMAIL_HOST, 'port:', process.env.EMAIL_PORT);
    } else {
      console.log('[Email] SMTP ready — sending via', process.env.EMAIL_USER,
        'on', process.env.EMAIL_HOST);
    }
  });
}

/**
 * Send an email
 * @param {object} options - { to, subject, text, html }
 */
async function sendMail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com';

  if (useResend) {
    const { data, error } = await resendClient.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html,
    });
    if (error) throw new Error(error.message || 'Resend failed');
    console.log('[Email] Sent via Resend to', to, '| id:', data?.id);
    return data;
  } else {
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log('[Email] Sent via SMTP to', to, '|', info.response);
    return info;
  }
}

module.exports = { sendMail };
