# IF Timer - Deployment Guide

**Target Platforms:** Vercel (Frontend) + Supabase (Backend)
**Last Updated:** 2025-10-29

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Supabase Setup](#supabase-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Environment Variables](#environment-variables)
6. [Custom Domain](#custom-domain)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### Architecture

```
┌─────────────────┐
│                 │
│  User Browser   │
│                 │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│                 │
│  Vercel CDN     │ ← Static React App
│  (Frontend)     │ ← Auto-deploy from Git
│                 │
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│                 │
│   Supabase      │ ← PostgreSQL Database
│   (Backend)     │ ← Authentication
│                 │ ← Realtime Subscriptions
└─────────────────┘
```

### Why This Stack?

**Vercel:**
- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments for PRs
- ✅ Generous free tier

**Supabase:**
- ✅ Managed PostgreSQL
- ✅ Built-in auth (Magic Links)
- ✅ Real-time subscriptions
- ✅ Auto-generated REST API
- ✅ Generous free tier

---

## 🔧 Prerequisites

Before deploying, ensure you have:

- [x] GitHub account (code repository)
- [x] Vercel account (signup at [vercel.com](https://vercel.com))
- [x] Supabase account (signup at [supabase.com](https://supabase.com))
- [x] Git installed locally
- [x] Node.js 18+ installed

---

## 🗄️ Supabase Setup

### Step 1: Create Supabase Project

1. **Sign in to Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"

2. **Create Organization** (if first time)
   - Name: Your name or company
   - Plan: Free (sufficient for most cases)

3. **Create New Project**
   - Click "New Project"
   - **Organization:** Select your org
   - **Name:** `if-timer-prod` (or `if-timer-dev` for staging)
   - **Database Password:** Generate strong password (save in password manager!)
   - **Region:** Choose closest to your users
     - Americas: `us-east-1`, `us-west-1`
     - Europe: `eu-central-1`
     - Asia: `ap-southeast-1`
   - **Pricing Plan:** Free tier (up to 500MB database, 50,000 monthly active users)

4. **Wait for provisioning** (~2 minutes)

### Step 2: Configure Database

1. **Go to SQL Editor**
   - Dashboard → SQL Editor
   - Click "New Query"

2. **Run Database Setup Script**

Paste and execute this SQL (copy from [database.md](./database.md)):

```sql
-- 1. Create timer_states table
CREATE TABLE timer_states (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hours INTEGER NOT NULL DEFAULT 16 CHECK (hours >= 14 AND hours <= 48),
  angle DECIMAL(5,2) NOT NULL DEFAULT 21.2 CHECK (angle >= 0 AND angle < 360),
  is_running BOOLEAN NOT NULL DEFAULT false,
  target_time TIMESTAMPTZ,
  is_extended BOOLEAN NOT NULL DEFAULT false,
  original_goal_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timer_states_updated_at
  BEFORE UPDATE ON timer_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Create indexes
CREATE INDEX idx_timer_states_user_id ON timer_states(user_id);
CREATE INDEX idx_timer_states_is_running ON timer_states(is_running);

-- 4. Enable Row Level Security
ALTER TABLE timer_states ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Users can view their own timer state"
  ON timer_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timer state"
  ON timer_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timer state"
  ON timer_states FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timer state"
  ON timer_states FOR DELETE
  USING (auth.uid() = user_id);
```

3. **Click "Run"** (or press Cmd/Ctrl + Enter)

4. **Verify Tables Created**
   - Go to **Database** → **Tables**
   - Should see `timer_states` table

### Step 3: Enable Realtime

1. **Go to Database → Replication**
2. **Find `timer_states` table**
3. **Toggle on these events:**
   - ✅ INSERT
   - ✅ UPDATE
   - ✅ DELETE

### Step 4: Configure Authentication

1. **Go to Authentication → Providers**

2. **Enable Email Provider**
   - Toggle "Enable Email Provider" → ON
   - ✅ Enable email confirmations: **OFF** (for Magic Links)
   - ✅ Enable Magic Link: **ON**

3. **Configure Email Templates** (optional)
   - Go to **Authentication** → **Email Templates**
   - Customize "Magic Link" template:
     ```
     Subject: Sign in to IF Timer

     Click the link below to sign in to IF Timer:
     {{ .ConfirmationURL }}

     This link expires in 1 hour.
     ```

4. **Set URL Configuration**
   - Go to **Authentication** → **URL Configuration**
   - **Site URL:**
     - Development: `http://localhost:3000`
     - Production: `https://your-domain.com` (set after Vercel deployment)
   - **Redirect URLs:** Add both:
     - `http://localhost:3000/**`
     - `https://your-domain.com/**`

### Step 5: Get API Keys

1. **Go to Project Settings → API**

2. **Copy these values** (save in password manager!):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Project API keys:**
     - `anon` `public` key (safe to expose in browser)
     - `service_role` `secret` key (NEVER expose! Server-only)

3. **We'll use these later in Vercel environment variables**

---

## 🚀 Vercel Deployment

### Step 1: Push Code to GitHub

If not already done:

```bash
# Initialize git (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Create GitHub repo (via GitHub web interface or gh CLI)
gh repo create if-timer --public --source=. --remote=origin --push

# Or manually:
# 1. Create repo on github.com
# 2. Add remote:
git remote add origin https://github.com/YOUR_USERNAME/if-timer.git
git branch -M main
git push -u origin main
```

### Step 2: Import Project to Vercel

1. **Sign in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub (recommended)

2. **Import Repository**
   - Click "Add New..." → "Project"
   - Select your GitHub account
   - Find `if-timer` repository
   - Click "Import"

3. **Configure Project**
   - **Project Name:** `if-timer` (or custom name)
   - **Framework Preset:** Create React App (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `build` (auto-detected)

### Step 3: Add Environment Variables

**IMPORTANT:** Add these BEFORE deploying!

1. **In Vercel project settings:**
   - Click "Environment Variables" tab

2. **Add variables:**

| Name | Value | Environments |
|------|-------|--------------|
| `REACT_APP_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `REACT_APP_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1...` | Production, Preview, Development |

**How to add:**
- Key: `REACT_APP_SUPABASE_URL`
- Value: Paste your Supabase Project URL
- Environments: Check all three (Production, Preview, Development)
- Click "Add"

Repeat for `REACT_APP_SUPABASE_ANON_KEY`.

### Step 4: Deploy

1. **Click "Deploy"**

2. **Wait for build** (~2 minutes)
   - Vercel will:
     - Install dependencies
     - Run `npm run build`
     - Deploy to CDN

3. **Check Deployment**
   - Once complete, you'll get:
     - **Production URL:** `https://if-timer.vercel.app`
     - Or custom domain if configured

4. **Visit your app!** 🎉

### Step 5: Update Supabase Redirect URLs

**IMPORTANT:** Go back to Supabase and update:

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**

2. **Update:**
   - **Site URL:** `https://if-timer.vercel.app` (or your custom domain)
   - **Redirect URLs:** Add:
     - `https://if-timer.vercel.app/**`
     - Keep `http://localhost:3000/**` for local dev

---

## 🔐 Environment Variables

### Development (.env file)

```env
# Local development only
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Production (Vercel Dashboard)

Set via Vercel Dashboard → Project Settings → Environment Variables

**Never commit `.env` to Git!** (already in `.gitignore`)

### Multiple Environments

For staging/preview environments:

| Environment | Vercel Environment | Supabase Project |
|-------------|-------------------|------------------|
| Production | Production | if-timer-prod |
| Preview (PR) | Preview | if-timer-dev |
| Local Dev | Development | if-timer-dev |

---

## 🌐 Custom Domain

### Add Custom Domain to Vercel

1. **Buy domain** (Namecheap, Google Domains, etc.)

2. **In Vercel Dashboard:**
   - Go to Project → Settings → Domains
   - Click "Add"
   - Enter domain: `iftimer.com`
   - Click "Add"

3. **Configure DNS:**

**Option A: Use Vercel Nameservers (Easiest)**
- Vercel shows nameservers (e.g., `ns1.vercel-dns.com`)
- Go to your domain registrar
- Update nameservers to Vercel's
- Wait for DNS propagation (~24 hours max, usually <1 hour)

**Option B: Use CNAME (Faster)**
- Add CNAME record at your DNS provider:
  - Type: `CNAME`
  - Name: `@` (or `www`)
  - Value: `cname.vercel-dns.com`
- Add A record for apex domain:
  - Type: `A`
  - Name: `@`
  - Value: `76.76.21.21`

4. **Verify & Enable HTTPS**
   - Vercel auto-provisions SSL certificate
   - HTTPS enabled automatically

5. **Update Supabase:**
   - Go to Supabase → Authentication → URL Configuration
   - Update **Site URL** to `https://iftimer.com`
   - Add to **Redirect URLs:** `https://iftimer.com/**`

---

## 📊 Monitoring & Maintenance

### Vercel Analytics

1. **Enable Vercel Analytics:**
   - Project Settings → Analytics
   - Toggle "Enable Analytics"
   - Free tier: 1,000 data points/month

2. **View Metrics:**
   - Dashboard shows:
     - Page views
     - Unique visitors
     - Top pages
     - Real-time visitors

### Supabase Monitoring

1. **Database Usage:**
   - Dashboard → Settings → Usage
   - Monitor:
     - Database size
     - API requests
     - Realtime connections
     - Bandwidth

2. **Set Up Alerts:**
   - Project Settings → Notifications
   - Email alerts for:
     - High database usage
     - Failed queries
     - Auth errors

### Logging

**Vercel Logs:**
- Go to Deployments → [deployment] → Logs
- View build logs and runtime logs

**Supabase Logs:**
- Dashboard → Logs
- Filter by:
   - API requests
   - Database queries
   - Auth events

### Backups

**Supabase Automatic Backups:**
- Free tier: Daily backups (retained 7 days)
- Pro tier: Point-in-time recovery

**Manual Backup:**
```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or via pg_dump
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

---

## 🚨 Troubleshooting

### Build Failed on Vercel

**Error: "Module not found"**
```bash
# Solution: Check package.json dependencies
npm install
npm run build  # Test locally first
```

**Error: "Out of memory"**
- Upgrade Vercel plan (free tier has memory limits)
- Or optimize build:
  ```json
  // package.json
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build"
  }
  ```

### Environment Variables Not Working

**Issue: App can't connect to Supabase**

1. **Check variable names:** Must start with `REACT_APP_`
2. **Redeploy:** Environment changes require redeploy
3. **Check Vercel logs:** `console.log` the variables (don't commit!)

### Magic Link Not Working

**Issue: "Invalid email link"**

1. **Check Supabase Site URL:**
   - Must match your Vercel domain
   - Include protocol: `https://`

2. **Check Redirect URLs:**
   - Must include `/**` wildcard
   - Case-sensitive

3. **Email provider issues:**
   - Some email clients (Outlook) scan links
   - Link might be expired (1 hour timeout)
   - Solution: Use shorter expiry or custom SMTP

### Database Connection Issues

**Issue: "Permission denied for table"**

1. **Check RLS policies are created**
2. **Test in SQL Editor:**
   ```sql
   SELECT * FROM timer_states LIMIT 1;
   ```

**Issue: "Connection timeout"**

1. **Check Supabase project is running**
2. **Verify API URL is correct**
3. **Check network/firewall**

### Performance Issues

**Slow API responses:**

1. **Add database indexes:**
   ```sql
   CREATE INDEX idx_timer_states_user_id ON timer_states(user_id);
   ```

2. **Enable query caching** (Supabase PostgREST)

3. **Use CDN for static assets** (already done with Vercel)

**High bandwidth:**
- Check for unnecessary API calls
- Implement local caching (already done with localStorage)
- Use Realtime subscriptions efficiently (unsubscribe when not needed)

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:

- **Production:** On push to `main` branch
- **Preview:** On pull requests

### Deployment Workflow

```
1. Developer pushes code to feature branch
2. Create PR → Vercel creates preview deployment
3. Test preview URL
4. Merge PR → Vercel deploys to production
5. Old deployment still accessible (rollback available)
```

### Rollback

If deployment breaks:

1. **Vercel Dashboard** → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback!

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Code is tested locally
- [ ] `.env` is in `.gitignore`
- [ ] `npm run build` succeeds
- [ ] No console errors
- [ ] Supabase project created
- [ ] Database schema created
- [ ] RLS policies enabled
- [ ] Authentication configured

### Deployment

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] Production URL works
- [ ] Can sign in with Magic Link
- [ ] Timer state syncs across devices

### Post-Deployment

- [ ] Supabase redirect URLs updated
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled
- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] Team notified of URL

---

## 🎯 Next Steps After Deployment

1. **Share with users!**
   - Tweet it
   - Post on Reddit (r/intermittentfasting)
   - Product Hunt launch

2. **Monitor usage:**
   - Check Vercel Analytics
   - Monitor Supabase quota

3. **Gather feedback:**
   - Add feedback form
   - Monitor errors
   - Iterate!

4. **Scale when needed:**
   - Upgrade Vercel plan (if needed)
   - Upgrade Supabase plan (if >500MB data)

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Deployment Docs](https://create-react-app.dev/docs/deployment/)

---

## 💰 Pricing Tiers

### Free Tier Limits

**Vercel Free:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ❌ No analytics (need Pro)

**Supabase Free:**
- ✅ 500MB database
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth
- ✅ 1GB file storage
- ❌ No point-in-time recovery

### When to Upgrade?

**Vercel Pro ($20/month):**
- When you need analytics
- When you exceed bandwidth
- When you need password protection

**Supabase Pro ($25/month):**
- When database > 500MB
- When you need daily backups >7 days
- When you need priority support

---

**Last Updated:** 2025-10-29
**Status:** Ready for deployment ✅
