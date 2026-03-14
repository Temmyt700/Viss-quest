# VissQuest Backend Setup

## 1. Install dependencies

Run inside `vq-backend`:

```bash
npm install
```

## 2. Create environment file

Copy `.env.example` to `.env` and fill in the real values.

Required variables:

- `DATABASE_URL`: Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET`: long random secret used by Better Auth
- `BETTER_AUTH_URL`: backend base URL, for example `http://localhost:4000`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FRONTEND_URL`: frontend origin, for example `http://localhost:5173`

## 3. Neon PostgreSQL

Create a Neon project and database, then copy the connection string into `DATABASE_URL`.

Neon steps:

1. Create a Neon account
2. Create a project
3. Create or use the default database
4. Copy the connection string
5. Ensure SSL remains enabled

## 4. Google OAuth

Create Google OAuth credentials in Google Cloud Console.

Steps:

1. Create a Google Cloud project
2. Configure OAuth consent screen
3. Create OAuth client credentials
4. Add backend callback URL and frontend origin to the allowed redirect/origin list
5. Put the resulting values into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

You will need to align the callback path with the Better Auth route mounted under `/api/auth/better-auth`.

## 5. Cloudinary

Create a Cloudinary account and copy:

- Cloud name
- API key
- API secret

These are required for:

- funding proof uploads
- testimonial image uploads
- optional prize image uploads

## 6. Generate and run database migrations

```bash
npm run db:generate
npm run db:push
```

If you prefer migration files:

```bash
npm run db:generate
npm run db:migrate
```

## 7. Start the backend locally

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## 8. Manual follow-up tasks

After generation you should still do these manually:

1. Install dependencies and verify Better Auth version compatibility
2. Run the database migration flow against Neon
3. Seed initial admin user, spin rewards, and bank accounts
4. Verify Better Auth callback URLs for Google OAuth
5. Verify Cloudinary upload permissions and transformation defaults
6. Wire the frontend from mock state to the new backend endpoints
7. Add automated tests for wallet funding, draw entry, spin, quiz, and role enforcement

## 9. Important implementation notes

- Wallet-sensitive operations must run in transactions
- Moderator access should stay limited to funding review flows
- Draws are modeled as `draws`, `draw_prizes`, and `draw_entries`
- Bank accounts are database-managed, not hardcoded
- Public winner/testimonial responses should expose `referenceId`, not private user details
