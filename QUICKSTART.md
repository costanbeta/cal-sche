# 🚀 Quick Start Guide - SchedulePro MVP

**Get your scheduling app running in 10 minutes!**

## ⚡ Prerequisites

Make sure you have these installed:
- Node.js 20+ ([download](https://nodejs.org/))
- PostgreSQL 15+ ([download](https://www.postgresql.org/download/))

Check versions:
```bash
node -v  # Should be v20.x or higher
psql --version  # Should be 15.x or higher
```

## 📦 Installation

### 1. Install Dependencies

```bash
cd "CAL SCHE"
npm install
```

⏱️ This takes ~2 minutes

### 2. Create Database

```bash
# Start PostgreSQL (if not running)
# macOS:
brew services start postgresql@15

# Create database
createdb scheduling_mvp
```

### 3. Setup Environment

Copy the example environment file:
```bash
cp .env.example .env
```

**Minimal `.env` configuration for local testing:**

```env
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/scheduling_mvp?schema=public"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_NAME="SchedulePro"

# For email testing (optional - can skip for now)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM=""
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```
Copy the output to `NEXTAUTH_SECRET` in `.env`

**Find your PostgreSQL username:**
```bash
whoami  # Usually your macOS username
```

### 4. Setup Database Schema

```bash
npx prisma generate
npx prisma db push
```

### 5. Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🎯 First Steps in the App

### 1. Create Your Account (1 minute)

1. Go to http://localhost:3000
2. Click **"Sign Up"**
3. Fill in:
   - **Name:** Your Name
   - **Email:** your-email@example.com
   - **Username:** yourname (lowercase, no spaces)
   - **Password:** (at least 8 characters)
4. Click **"Sign Up"**

You'll be automatically logged in and redirected to the dashboard.

### 2. Set Your Availability (1 minute)

1. Click **"Set Availability"** on the dashboard
2. Select the days you're available (e.g., Mon-Fri)
3. Set your hours (e.g., 9:00 AM - 5:00 PM)
4. Click **"Save Availability"**

### 3. Create an Event Type (1 minute)

1. Click **"+ New Event Type"** on the dashboard
2. Fill in:
   - **Event Name:** "30-minute meeting"
   - **URL Slug:** 30-min-meeting (auto-generated)
   - **Description:** "Quick 30-minute chat"
   - **Duration:** 30 minutes
   - **Color:** Choose any color
3. Click **"Create Event Type"**

### 4. Test Your Booking Link

Your booking link is:
```
http://localhost:3000/yourname/30-min-meeting
```

**To test it:**

1. Copy your booking link
2. Open it in an **incognito/private window** (or different browser)
3. Select a date and time
4. Fill in attendee details:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Notes:** "This is a test booking"
5. Click **"Confirm Booking"**

### 5. View Your Booking

1. Go back to your dashboard (regular window)
2. You'll see the new booking in "Upcoming Bookings"
3. Click on it to see details

---

## 📧 Email Setup (Optional but Recommended)

To receive actual email notifications, set up Gmail:

### Quick Gmail Setup

1. **Enable 2-Step Verification** on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password
4. Update your `.env`:

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-char-app-password"
EMAIL_FROM="your-email@gmail.com"
```

5. Restart the dev server: `npm run dev`

Now you'll receive emails for bookings!

---

## 🐛 Common Issues

### Issue: "Port 3000 is already in use"

**Solution:**
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

### Issue: "Database connection failed"

**Solution:**
```bash
# Check PostgreSQL is running
brew services list

# If not started:
brew services start postgresql@15

# Test connection:
psql -d scheduling_mvp
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
npm run dev
```

### Issue: "Cannot find module..."

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 🎨 Customization Quick Tips

### Change App Name

In `.env`:
```env
APP_NAME="Your Company Name"
```

### Change Primary Color

In `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    500: '#your-color-here',
  }
}
```

### Add Your Logo

1. Add logo to `/public/logo.png`
2. Update header in `app/layout.tsx`

---

## 📚 What's Next?

### Learn More:
- **Full Documentation:** See `README.md`
- **Detailed Setup:** See `SETUP.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Project Overview:** See `PROJECT_SUMMARY.md`

### Add More Features:
- Connect Google Calendar
- Customize email templates
- Add more event types
- Set up custom domain
- Deploy to production

### Deploy Your App:
1. **Vercel** (easiest): See `DEPLOYMENT.md`
2. **Railway** (includes database)
3. **Docker** (full control)

---

## ✅ Quick Reference

### Useful Commands

```bash
# Start development server
npm run dev

# View database
npx prisma studio

# Update database schema
npx prisma db push

# Build for production
npm run build

# Start production server
npm run start
```

### Important URLs

- **App:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard
- **Database GUI:** http://localhost:5555 (after `npx prisma studio`)
- **Your booking link:** http://localhost:3000/USERNAME/EVENT-SLUG

### Environment Variables

```env
DATABASE_URL          # PostgreSQL connection string
NEXTAUTH_SECRET       # Random secret for JWT
NEXTAUTH_URL          # App URL (http://localhost:3000)
APP_URL               # Same as NEXTAUTH_URL
NEXT_PUBLIC_APP_URL   # Public-facing URL
EMAIL_SERVER_*        # Email server credentials
GOOGLE_CLIENT_*       # Google OAuth (optional)
```

---

## 🎉 You're All Set!

Your scheduling app is now running locally. You can:

- ✅ Create accounts
- ✅ Set availability
- ✅ Create event types
- ✅ Book meetings
- ✅ Manage bookings
- ✅ Send email notifications (if configured)

### Share Your App

Once deployed, share your booking link:
- In email signatures
- On your website
- On social media
- With clients and colleagues

### Need Help?

1. Check `README.md` for detailed docs
2. Review error messages in terminal
3. Verify `.env` configuration
4. Check database is running

---

**Happy Scheduling! 🚀**

Built with Next.js, TypeScript, PostgreSQL, and Prisma.

For questions or issues, review the full documentation in `README.md`.
