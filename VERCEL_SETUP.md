# Vercel Setup Guide

## Quick Setup with Vercel CLI

### 1. Install Vercel CLI (if not already installed)
```bash
pnpm add -D vercel
# or globally
pnpm add -g vercel
```

### 2. Login to Vercel
```bash
npx vercel login
```

### 3. Link Your Project
```bash
npx vercel link
```
This will prompt you to:
- Select your Vercel account
- Select the project (or create a new one)
- Link to the existing project

### 4. Create Postgres Database (via Dashboard)
1. Go to Vercel Dashboard → Your Project → Storage tab
2. Create a new Postgres database
3. **Note**: When you link a database to a project, `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING` are usually automatically added as environment variables

### 5. Run Database Schema
1. In Vercel Dashboard → Storage → Your Database → SQL Editor
2. Copy and paste the contents of `schema.sql`
3. Run the query

### 6. Add Environment Variables via CLI

#### Add ADMIN_PASSWORD
```bash
npx vercel env add ADMIN_PASSWORD
```
- When prompted, enter your password
- Select environments: Production, Preview, Development (select all)

#### Verify POSTGRES URLs (if not auto-added)
If the database connection strings weren't automatically added:

```bash
# Get the connection strings from Vercel Dashboard → Storage → Your Database → Connection String
# Then add them:

npx vercel env add POSTGRES_URL
# Paste the "Pooled Connection" string when prompted

npx vercel env add POSTGRES_URL_NON_POOLING
# Paste the "Direct Connection" string when prompted
```

### 7. Pull Environment Variables Locally (Optional)
```bash
npx vercel env pull .env.local
```
This creates a `.env.local` file with your environment variables for local development.

### 8. Deploy
```bash
npx vercel --prod
```

## Alternative: One-Time Setup Script

You can also create a setup script. First, get your connection strings from the Vercel dashboard, then:

```bash
# Set ADMIN_PASSWORD (you'll be prompted)
npx vercel env add ADMIN_PASSWORD production preview development

# If POSTGRES URLs weren't auto-added, add them:
npx vercel env add POSTGRES_URL production preview development
# (paste pooled connection string)

npx vercel env add POSTGRES_URL_NON_POOLING production preview development
# (paste direct connection string)
```

## Verify Environment Variables
```bash
npx vercel env ls
```

## Notes

- **Database Auto-Linking**: When you create a Postgres database in Vercel and link it to your project, the connection strings are usually automatically added as environment variables. Check with `npx vercel env ls` first.

- **Environment Scope**: Make sure to add variables to all three environments (production, preview, development) unless you have a specific reason not to.

- **Security**: Never commit `.env.local` to git (it's already in `.gitignore`).

