# Auth Setup

This project uses Auth.js (NextAuth v5) with:
- Google OAuth
- Email/password via a simple JSON store (for local dev only)

Steps:
1. Copy `.env.example` to `.env.local` and fill in:
   - AUTH_SECRET: any random string
   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET: from Google Cloud Console (OAuth consent + Web app with redirect URI http://localhost:3000/api/auth/callback/google)
2. Install dependencies and run dev server.

Routes:
- Sign in: /auth/signin
- Sign up: /auth/signup
- API register: POST /api/register { email, password, name? }

Note: The JSON user store is at `.data/users.json` and is not secure; replace with a real database for production.
