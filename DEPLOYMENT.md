# Deployment Guide - SchedulePro MVP

Complete guide to deploying your scheduling application to production.

## 📋 Pre-Deployment Checklist

- [ ] Test application locally
- [ ] All core features working
- [ ] Email notifications tested
- [ ] Database schema finalized
- [ ] Environment variables documented
- [ ] Google OAuth credentials created (if using)

## 🚀 Option 1: Vercel + Neon (Recommended)

**Best for:** Quick deployment, serverless, automatic scaling

### Step 1: Setup Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```

### Step 2: Push Code to GitHub

```bash
cd "CAL SCHE"
git init
git add .
git commit -m "Initial commit - SchedulePro MVP"
git branch -M main
git remote add origin https://github.com/yourusername/schedulepro.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:

```env
# Required
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret
APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
APP_NAME=SchedulePro

# Email
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com

# Google Calendar (Optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

5. Click "Deploy"
6. After deployment, run migrations:
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add all variables above
   - Redeploy

### Step 4: Setup Database Schema

In your local terminal:

```bash
# Set DATABASE_URL to your Neon connection string
export DATABASE_URL="postgresql://..."

# Push schema
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

### Step 5: Configure Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update NEXTAUTH_URL and APP_URL environment variables

---

## 🚢 Option 2: Railway (Database + Hosting)

**Best for:** Simplicity, includes everything, one platform

### Step 1: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize GitHub and select your repository

### Step 2: Add PostgreSQL

1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway will automatically set DATABASE_URL

### Step 3: Configure Environment Variables

In Railway dashboard → Your service → Variables:

```env
NEXTAUTH_URL=${{RAILWAY_STATIC_URL}}
NEXTAUTH_SECRET=your-generated-secret
APP_URL=${{RAILWAY_STATIC_URL}}
NEXT_PUBLIC_APP_URL=${{RAILWAY_STATIC_URL}}
APP_NAME=SchedulePro

EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com

GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Step 4: Deploy

Railway automatically deploys when you push to GitHub!

---

## 🐳 Option 3: Docker + DigitalOcean/AWS

**Best for:** Full control, custom configuration

### Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://schedulepro:password@db:5432/schedulepro
      - NEXTAUTH_URL=https://yourdomain.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - APP_URL=https://yourdomain.com
      - NEXT_PUBLIC_APP_URL=https://yourdomain.com
      - EMAIL_SERVER_HOST=${EMAIL_SERVER_HOST}
      - EMAIL_SERVER_PORT=${EMAIL_SERVER_PORT}
      - EMAIL_SERVER_USER=${EMAIL_SERVER_USER}
      - EMAIL_SERVER_PASSWORD=${EMAIL_SERVER_PASSWORD}
      - EMAIL_FROM=${EMAIL_FROM}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=schedulepro
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=schedulepro
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Step 3: Deploy

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma db push
```

---

## 📧 Email Service Setup

### Option 1: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Verify your domain (for production)

```env
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### Option 2: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Verify sender email

```env
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

### Option 3: Gmail (Development Only)

```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

---

## 🔐 Google Calendar Setup (Production)

### Step 1: Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project
3. Enable Google Calendar API

### Step 2: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Create OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs:
   ```
   https://your-domain.com/api/calendar/callback
   https://your-domain.vercel.app/api/calendar/callback
   ```

### Step 3: Add to Environment Variables

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 🔒 Security Hardening

### 1. Generate Strong Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

### 2. Environment Variables Security

- Never commit `.env` files
- Use secret management tools (Vercel, Railway have built-in)
- Rotate secrets regularly

### 3. Database Security

- Use strong passwords
- Enable SSL connections
- Restrict IP access
- Regular backups

### 4. Rate Limiting

Add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
}
```

---

## 🔍 Monitoring & Logging

### Setup Sentry (Error Tracking)

1. Sign up at [sentry.io](https://sentry.io)
2. Create new project
3. Install Sentry:

```bash
npm install @sentry/nextjs
```

4. Initialize:

```bash
npx @sentry/wizard -i nextjs
```

### Add Analytics

**Plausible (Privacy-friendly):**

In `app/layout.tsx`:

```tsx
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

**Google Analytics:**

```tsx
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
```

---

## 🗄️ Database Backup

### Neon (Automatic)

Neon provides automatic backups. Restore from dashboard.

### Manual Backup

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20240115.sql
```

### Automated Backups

Create a cron job:

```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * pg_dump $DATABASE_URL > /backups/backup-$(date +\%Y\%m\%d).sql
```

---

## 📊 Performance Optimization

### 1. Enable Caching

Add to `next.config.js`:

```javascript
module.exports = {
  swcMinify: true,
  compress: true,
}
```

### 2. Database Connection Pooling

In Prisma (production):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 10
}
```

### 3. Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image'

<Image src="/logo.png" width={200} height={50} alt="Logo" />
```

---

## 🧪 Pre-Launch Testing

### 1. Test All Features

- [ ] Sign up new user
- [ ] Create event type
- [ ] Set availability
- [ ] Book a meeting (public page)
- [ ] Receive confirmation email
- [ ] Cancel booking
- [ ] Connect Google Calendar

### 2. Load Testing

```bash
# Install Apache Bench
brew install apache-bench

# Test endpoint
ab -n 1000 -c 10 https://your-domain.com/
```

### 3. Security Scan

```bash
npm audit
npm audit fix
```

---

## 🚀 Launch Checklist

- [ ] All tests passing
- [ ] Database backed up
- [ ] Environment variables set
- [ ] Email service configured
- [ ] Google OAuth configured
- [ ] Custom domain set up
- [ ] SSL certificate active
- [ ] Error monitoring enabled
- [ ] Analytics configured
- [ ] Privacy policy added
- [ ] Terms of service added

---

## 📈 Post-Launch

### Monitor These Metrics

1. **Uptime** (use uptimerobot.com)
2. **Error rate** (Sentry)
3. **API response times** (Vercel Analytics)
4. **Database connections** (Neon dashboard)
5. **User signups**
6. **Bookings created**

### Scaling Considerations

- **10-100 users:** Current setup is perfect
- **100-1,000 users:** Add Redis caching
- **1,000-10,000 users:** Upgrade database plan
- **10,000+ users:** Consider serverless functions, CDN

---

## 🆘 Troubleshooting

### Deployment Fails

```bash
# Check build logs
vercel logs

# Test build locally
npm run build
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check connection limit
# Upgrade database plan if needed
```

### Email Not Sending

- Verify API keys
- Check sender verification
- Review email service logs
- Test with curl:

```bash
curl --url 'smtp://smtp.resend.com:587' \
  --mail-from 'from@example.com' \
  --mail-rcpt 'to@example.com' \
  --user 'resend:YOUR_API_KEY'
```

---

## 🎉 You're Live!

Congratulations! Your scheduling app is now in production.

### Share Your Success

- Share your booking link on social media
- Add it to your email signature
- Put it on your website
- Tell your network!

### Next Steps

1. Gather user feedback
2. Monitor performance metrics
3. Add requested features
4. Scale as needed
5. Consider monetization

---

**Need Help?**

- Review the logs: Check Vercel/Railway logs
- Test locally: Can you reproduce the issue?
- Check documentation: Refer to README.md and SETUP.md
- Community: Search GitHub issues for similar problems

**Built with ❤️ - Good luck with your launch! 🚀**
