// Integration catalog: what each connection does, what the client gets,
// and which package includes it. Displayed in the Super Admin console.
export type ProviderDef = {
  key: string;
  name: string;
  what: string;
  gives: string[];
  packages: string;
  steps: string[];
  fields: { name: string; label: string; placeholder: string }[];
};

export const PROVIDERS: ProviderDef[] = [
  {
    key: 'whatsapp',
    name: 'WhatsApp Business API',
    what: 'The heart of the machine. Your clients\' WhatsApp answers every inquiry in seconds, in any language, 24/7, and books viewings.',
    gives: ['24/7 AI replies to every inquiry', 'Auto-qualification of every lead into the CRM', 'Viewing booking straight into the calendar', 'Broadcast messages to all leads (with consent)'],
    packages: 'Lead Machine ($1,800) and Market Domination ($3,250)',
    steps: [
      'Register a Meta Business account and verify the business (client\'s or yours).',
      'Get a phone number approved for WhatsApp Business (via Meta directly, or a BSP like Interakt/WATI).',
      'Paste the credentials here (right side).',
      'The platform admin verifies, flips status to CONNECTED, and the bot goes live.'
    ],
    fields: [
      { name: 'route', label: 'Meta direct / BSP name', placeholder: 'Meta Cloud API, Interakt, WATI…' },
      { name: 'phone_number_id', label: 'Phone Number ID', placeholder: 'from Meta Business Manager' },
      { name: 'access_token', label: 'Access Token', placeholder: 'permanent system user token' }
    ]
  },
  {
    key: 'email',
    name: 'Email (transactional)',
    what: 'Sends the system emails: password resets, team invites, weekly client reports.',
    gives: ['Password reset emails', 'Team invitations by email', 'Client reports delivered automatically'],
    packages: 'Platform feature (all packages)',
    steps: [
      'Create a free account on an email provider (Resend, SendGrid, or similar).',
      'Verify your sending domain or sender email.',
      'Paste the API key here.',
      'Status flips to CONNECTED after verification.'
    ],
    fields: [
      { name: 'provider', label: 'Provider', placeholder: 'Resend / SendGrid / …' },
      { name: 'api_key', label: 'API Key', placeholder: 'from the provider dashboard' },
      { name: 'from_email', label: 'From email', placeholder: 'reports@yourdomain.com' }
    ]
  },
  {
    key: 'calendar',
    name: 'Google Calendar sync',
    what: 'Viewings booked in the OS appear in the agent\'s Google Calendar automatically, and vice versa.',
    gives: ['Two-way viewing sync', 'Reminders to clients before viewings', 'No double-bookings'],
    packages: 'Lead Machine ($1,800) and above',
    steps: [
      'Create a Google Cloud project and enable the Calendar API.',
      'Create an OAuth client (the platform admin can do this once for everyone).',
      'Paste the client ID and secret here.',
      'Each agent then connects their Google account with one click.'
    ],
    fields: [
      { name: 'client_id', label: 'OAuth Client ID', placeholder: 'from Google Cloud Console' },
      { name: 'client_secret', label: 'OAuth Client Secret', placeholder: 'from Google Cloud Console' }
    ]
  },
  {
    key: 'ai',
    name: 'AI reply drafting',
    what: 'Drafts replies to leads using ONLY the client\'s property records and approved business facts. Never invents prices or availability. Every draft needs human approval before sending.',
    gives: ['Draft replies in the conversation inbox', 'Lead summaries and suggested next actions', 'Multilingual replies (detects language)'],
    packages: 'Lead Machine ($1,800) and above',
    steps: [
      'Create an AI provider account (Anthropic, OpenAI, or Google).',
      'Paste the API key here.',
      'Set the monthly usage budget per organization.',
      'Reply drafting activates in the Conversations section (approval-gated).'
    ],
    fields: [
      { name: 'provider', label: 'Provider', placeholder: 'Anthropic / OpenAI / Gemini' },
      { name: 'api_key', label: 'API Key', placeholder: 'from the provider dashboard' }
    ]
  },
  {
    key: 'razorpay',
    name: 'Razorpay (billing)',
    what: 'Collects monthly subscription payments from clients. The system changes a client\'s package ONLY after Razorpay confirms payment on the server — never from a browser redirect.',
    gives: ['Payment links for each package ($950 / $1,800 / $3,250)', 'Automatic package activation after verified payment', 'Failed-payment alerts and retry handling'],
    packages: 'Platform feature (all packages)',
    steps: [
      'Create a Razorpay account and complete KYC.',
      'Create the three subscription plans ($950, $1,800, $3,250).',
      'Paste the Key ID, Key Secret, and Webhook Secret here.',
      'Point the Razorpay webhook to the platform URL given after deployment.'
    ],
    fields: [
      { name: 'key_id', label: 'Key ID', placeholder: 'rzp_live_… or rzp_test_…' },
      { name: 'key_secret', label: 'Key Secret', placeholder: 'from Razorpay dashboard' },
      { name: 'webhook_secret', label: 'Webhook Secret', placeholder: 'for verifying payment events' }
    ]
  },
  {
    key: 'social',
    name: 'Social publishing (Meta)',
    what: 'Posts the content we edit directly to the client\'s Instagram and Facebook — agent never has to post manually.',
    gives: ['Scheduled posts to Instagram + Facebook', 'Story publishing', 'Post performance in the weekly report'],
    packages: 'Lead Engine ($950) and above',
    steps: [
      'Connect the client\'s Instagram Business account to a Facebook Page.',
      'Create a Meta app with the Instagram Graph API.',
      'Paste the access token and business ID here.',
      'Scheduled content then publishes automatically.'
    ],
    fields: [
      { name: 'access_token', label: 'Long-lived Access Token', placeholder: 'from Meta developer console' },
      { name: 'business_id', label: 'Business ID', placeholder: 'of the client\'s account' }
    ]
  }
];
