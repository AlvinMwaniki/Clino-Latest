// ═══════════════════════════════════════════════════════════════
//  SMS Provider Abstraction Layer
//  To switch providers: change SMS_PROVIDER in your .env file
//  Supported: 'africastalking' | 'advanta' | 'none'
//  Add more providers below without touching any other file
// ═══════════════════════════════════════════════════════════════

const PROVIDER = process.env.SMS_PROVIDER || 'none';

// ── FORMAT KENYAN PHONE ───────────────────────────────────────────────────────
const formatKenyanPhone = (phone) => {
  if (!phone) return null;
  const clean = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (clean.startsWith('+254')) return clean;
  if (clean.startsWith('254')) return `+${clean}`;
  if (clean.startsWith('0')) return `+254${clean.slice(1)}`;
  return clean;
};

// ── PROVIDER: Africa's Talking ────────────────────────────────────────────────
const sendViaAfricasTalking = async (phone, message) => {
  const AfricasTalking = require('africastalking');
  const at = AfricasTalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME || 'sandbox'
  });
  const result = await at.SMS.send({
    to: [phone],
    message,
    from: process.env.AT_SENDER_ID || ''
  });
  return { provider: 'africastalking', result };
};

// ── PROVIDER: Advanta Africa ──────────────────────────────────────────────────
// Docs: https://www.advantasms.com/api-docs
const sendViaAdvanta = async (phone, message) => {
  const axios = require('axios');
  const response = await axios.post('https://quicksms.advantasms.com/api/services/sendsms/', {
    apikey: process.env.ADVANTA_API_KEY,
    partnerID: process.env.ADVANTA_PARTNER_ID,
    message,
    shortcode: process.env.ADVANTA_SHORTCODE || 'MediSoft',
    mobile: phone
  });
  return { provider: 'advanta', result: response.data };
};

// ── PROVIDER: None (logs to console — use during development) ─────────────────
const sendViaNone = async (phone, message) => {
  console.log(`📱 [SMS DISABLED] Would send to ${phone}:`);
  console.log(`   "${message}"`);
  return { provider: 'none', result: 'logged_only' };
};

// ── MAIN SEND FUNCTION (called by smsController) ──────────────────────────────
const sendSMS = async (phone, message) => {
  const formatted = formatKenyanPhone(phone);
  if (!formatted) {
    console.warn('SMS skipped: invalid phone number');
    return null;
  }

  switch (PROVIDER) {
    case 'africastalking':
      return sendViaAfricasTalking(formatted, message);

    case 'advanta':
      return sendViaAdvanta(formatted, message);

    case 'none':
    default:
      return sendViaNone(formatted, message);
  }
};

module.exports = { sendSMS, formatKenyanPhone };