// Centralized environment configuration — the ONLY file that reads process.env.
// Every other module imports from here, so config values are validated, typed,
// documented and consistent in one place.
//
// Local development:  .env.local  (git-ignored — never commit real keys)
// Production (Vercel): dashboard → Settings → Environment Variables
// A sample of every variable lives in .env.example

const env = (key: string): string | undefined => {
  const v = process.env[key];
  return v && v.trim() ? v.trim() : undefined;
};

export const config = {
  app: {
    url: env('APP_URL') || 'http://localhost:3000',
    isProd: process.env.NODE_ENV === 'production',
  },
  admin: {
    // Comma-separated platform admin emails; first signup still gets OWNER of their own org.
    emails: (env('ADMIN_EMAILS') || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean),
  },
  ai: {
    apiKey: env('AI_API_KEY'),
    baseUrl: (env('AI_BASE_URL') || 'https://api.openai.com/v1').replace(/\/$/, ''),
    model: env('AI_MODEL') || 'gpt-4o-mini',
  },
  whatsapp: {
    token: env('WHATSAPP_TOKEN'),
    phoneNumberId: env('WHATSAPP_PHONE_NUMBER_ID'),
  },
  email: {
    resendApiKey: env('RESEND_API_KEY'),
    from: env('EMAIL_FROM') || 'onboarding@resend.dev',
  },
  razorpay: {
    keyId: env('RAZORPAY_KEY_ID'),
    keySecret: env('RAZORPAY_KEY_SECRET'),
  },
  plans: {
    // Monthly price per package in INR rupees (Razorpay multiplies by 100 for paise).
    priceInr: { LEAD_ENGINE: 79000, LEAD_MACHINE: 150000, MARKET_DOMINATION: 270000 } as Record<string, number>,
  },
} as const;

// Single-line "is it wired up?" checks used by the Integrations page and actions.

export const aiConfigured = () => Boolean(config.ai.apiKey);
export const whatsappConfigured = () => Boolean(config.whatsapp.token && config.whatsapp.phoneNumberId);
export const emailConfigured = () => Boolean(config.email.resendApiKey);
export const razorpayConfigured = () => Boolean(config.razorpay.keyId && config.razorpay.keySecret);
