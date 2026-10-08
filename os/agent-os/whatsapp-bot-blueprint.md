# Agent OS — WhatsApp Bot Blueprint (build once, customize per client in ~20 min)

## Conversation flow (v1)
1. WELCOME (instant, any hour)
   "Hi! 👋 You've reached {AGENT_NAME} at {AGENCY}. I'm the assistant — I can send listings, answer questions, or book a viewing right now. What are you looking for?"
   Quick replies: 🏠 Buying | 🏘 Renting | 💰 Selling | ❓ Other
2. QUALIFY (3 questions max)
   Budget range → Area preference → Ready to view this week? (Yes = HOT, No = NURTURE)
3. SEND (instant)
   2-3 matching listings with photos + price + link. "Want me to book you a viewing?"
4. BOOK (HOT leads)
   Offer 2-3 time slots → confirm → send calendar invite + location pin.
5. FOLLOW-UP (automatic)
   HOT no-reply: chase at +2h, +24h, +72h, then day 7.
   NURTURE: market update + new listings, weekly for 30 days.
6. HANDOFF
   HOT lead summary auto-messaged to the agent: name, budget, area, viewing time.
   Agent gets one tidy message instead of 20 messy ones.

## Language
Flow runs in English; add Arabic/Russian/Hindi by swapping the message bank (config sheet languages).

## Tool stack (honest path)
- Client #1-3: WhatsApp Business app + quick replies + my monitoring (free, proves the model)
- Client #4+: official WhatsApp Business API via Wati or ManyChat ($50-100/month per client, billed inside their retainer). Bot template cloned per client in minutes.
- Voice AI (upsell tier): added per client on the same config.

## Monthly per-client automation cost: ~0-250 AED against a 6,500 AED retainer. Margin stays fat.
