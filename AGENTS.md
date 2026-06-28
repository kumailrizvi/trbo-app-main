# AGENTS.md — trbo Engineering Context

## Product

trbo is an AI-native Global Financial Passport for migrants.

trbo helps lenders underwrite new-to-country borrowers using verified global financial history through AI — bank statements, payslips, remittances, and identity documents — with no local credit history required.

Core positioning:
- Global Financial Passport
- Credit that travels with your borrowers
- AI-powered underwriting infrastructure
- Cross-border financial identity

## Architecture

Frontend:
- Next.js 15
- Tailwind CSS
- Deployed on Vercel

Database/Auth:
- Supabase PostgreSQL
- Supabase Auth

AI:
- OpenAI via Next.js API routes
- Used for document parsing, underwriting memo generation, and explainable summaries

Main files:
- public/index-landing.html = marketing landing page
- public/portal.html = main lender/borrower portal
- src/app/login/page.tsx = login page
- src/app/signup/page.tsx = signup/onboarding page
- src/app/api/score/route.ts = scoring API
- src/app/api/parse-doc/route.ts = document parsing API

## Critical Rule

Do NOT convert public/portal.html into React components unless explicitly requested.

portal.html is intentionally a large static HTML file because previous React migrations broke the working UI.

Next.js should only handle:
- landing page routing
- login
- signup
- API routes

The portal experience lives mostly inside public/portal.html.

## Supabase Gotcha

portal.html uses a Supabase client called `_sb`.

Do NOT use a bare variable named `supabase` inside portal.html.

Correct pattern:

```js
var _sb = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
```
