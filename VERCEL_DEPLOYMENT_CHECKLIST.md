# 🚀 Vercel Deployment Checklist

## ✅ Step 1: Code Deployment (COMPLETED)

- ✅ All code changes committed to Git
- ✅ Pushed to GitHub (`costanbeta/cal-sche`)
- ✅ Vercel will auto-deploy from GitHub

---

## 📋 Step 2: Configure Vercel Environment Variables

You need to add the following environment variables to your Vercel project:

### **How to Add Environment Variables:**

1. Go to: https://vercel.com/dashboard
2. Select your project: `cal-sche`
3. Click **Settings** → **Environment Variables**
4. Add each variable below

### **Required Environment Variables:**

```bash
# Database
DATABASE_URL=your_neon_postgres_connection_string

# JWT Secret (for authentication)
JWT_SECRET=your_secure_random_string_here

# Email Configuration (if using email)
EMAIL_SERVER_HOST=your_smtp_host
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com

# Google OAuth (CRITICAL for Calendar Integration)
# Copy these from your local .env file
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```

### **Important Notes:**

⚠️ **For `DATABASE_URL`:**
- Use your **Neon.tech** connection string (production database)
- Format: `postgresql://user:password@host/database?sslmode=require`
- Do NOT use your local database URL

⚠️ **For `JWT_SECRET`:**
- Generate a secure random string
- You can use: `openssl rand -base64 32` in terminal

⚠️ **For `NEXT_PUBLIC_APP_URL`:**
- Replace with your actual Vercel URL
- Example: `https://cal-sche-costanbeta.vercel.app`

---

## 📋 Step 3: Update Google Cloud Console

After deploying to Vercel, you need to update your Google OAuth redirect URIs:

### **Steps:**

1. Go to: https://console.cloud.google.com
2. Navigate to: **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:

```
https://your-actual-vercel-url.vercel.app/api/calendar/callback
```

Replace `your-actual-vercel-url` with your real Vercel deployment URL.

5. Click **Save**

### **Example:**

If your Vercel URL is: `https://cal-sche-costanbeta.vercel.app`

Add this redirect URI:
```
https://cal-sche-costanbeta.vercel.app/api/calendar/callback
```

**Keep your local redirect URI too:**
```
http://localhost:3000/api/calendar/callback
https://your-actual-vercel-url.vercel.app/api/calendar/callback
```

---

## 📋 Step 4: Deploy Database Schema

After adding environment variables, you need to sync your Prisma schema to the production database:

### **Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Push database schema
npx prisma db push --schema=./prisma/schema.prisma
```

### **Option B: Using Vercel Dashboard**

1. Go to your Vercel project
2. Click **Settings** → **Functions**
3. Add a deployment script in `package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma db push && next build"
  }
}
```

---

## 📋 Step 5: Verify Deployment

### **After Vercel Deploys:**

1. **Check Deployment Status:**
   - Go to Vercel Dashboard → Deployments
   - Wait for build to complete (should be green ✅)

2. **Visit Your App:**
   - Open your Vercel URL
   - Try logging in
   - Check if dashboard loads

3. **Test Google Calendar:**
   - Go to Settings
   - Click "Connect Google Calendar"
   - Authorize with Google
   - Create a test booking
   - Check if it appears in Google Calendar

---

## 🔍 Troubleshooting

### **If Deployment Fails:**

1. **Check Build Logs:**
   - Vercel Dashboard → Deployments → Click failed deployment
   - Read error messages

2. **Common Issues:**
   - ❌ Missing environment variables → Add them in Settings
   - ❌ Database connection error → Check `DATABASE_URL`
   - ❌ Prisma schema not synced → Run `prisma db push`
   - ❌ TypeScript errors → Check build logs

3. **Force Redeploy:**
   - Go to Deployments → Click "..." → Redeploy
   - Check "Use existing build cache" = OFF

### **If Google Calendar Doesn't Work:**

1. ❌ Missing `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET`
2. ❌ Redirect URI not added to Google Console
3. ❌ Wrong Vercel URL in redirect URI

---

## ✅ Final Checklist

Before marking deployment as complete, verify:

- [ ] All environment variables added to Vercel
- [ ] Google OAuth redirect URI updated with Vercel URL
- [ ] Vercel deployment succeeded (green checkmark)
- [ ] Can access the app at Vercel URL
- [ ] Can log in / sign up
- [ ] Dashboard loads correctly
- [ ] Can create event types
- [ ] Can connect Google Calendar in Settings
- [ ] Test booking syncs to Google Calendar
- [ ] Booking cancellation removes from Google Calendar

---

## 🎉 Success!

Once all checkmarks above are complete:

✅ **Your SchedulePro app is fully deployed!**
✅ **Google Calendar integration is working!**
✅ **Users can book meetings that sync to calendar!**

---

## 📚 Additional Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Prisma Deployment:** https://www.prisma.io/docs/guides/deployment
- **Google OAuth Setup:** See `GOOGLE_OAUTH_SETUP.md` in this project
- **Calendar Integration:** See `GOOGLE_CALENDAR_INTEGRATION.md` in this project

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review Vercel build logs
3. Check browser console for errors
4. Review `PROJECT_SUMMARY.md` for architecture overview

---

**Last Updated:** January 15, 2026
**Deployment Status:** Code pushed to GitHub ✅ | Vercel config pending ⏳
