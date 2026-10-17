# CloudLedger (Stage 1)

## Run locally
1. `npm install`
2. `npm run dev` then open http://localhost:3000

## Connect Neon (enables the enquiry forms)
1. Create a project at neon.tech, copy the pooled and direct connection strings.
2. Copy `.env.example` to `.env` and fill `DATABASE_URL` and `DIRECT_URL`.
3. `npx prisma db push`

## Admin dashboard
1. In `.env`, set `ADMIN_USERNAME` and `ADMIN_PASSWORD` to credentials you choose.
2. Set `ADMIN_SESSION_SECRET` to a random secret of at least 32 characters (for example, generate 32 random bytes with Node.js).
3. Set `ADMIN_RECOVERY_EMAIL` to the verified mailbox that should receive admin password-reset links.
4. Create a Resend account, verify the recipient address, and set `RESEND_API_KEY`. For testing, use a sender address allowed by your Resend account. For production, verify a domain you own with Resend and set `RESEND_FROM_EMAIL` to a sender address at that domain.
5. Set `APP_URL` to the site's origin. Use `http://localhost:3000` locally and your public HTTPS origin in production.
6. Run `npm run db:push` then `npm run db:seed` to create the content tables and add the site's initial courses and services. The seed is idempotent and does not overwrite existing content.
7. Run `npm run dev` and open http://localhost:3000/admin. Sign in with those credentials to manage enquiries and website content.
8. No public registration endpoint exists. The forgot-password flow sends a single-use, 30-minute reset link to the configured recovery mailbox; the new password is stored as a scrypt hash in the database, and a successful reset signs out existing admin sessions.

## About page
The About page is at `/about`. Replace placeholder team information only with staff names, work history, qualifications, and credentials verified by CloudLedger.

## Edit content
Company details, services and courses live in `lib/config.ts`.
