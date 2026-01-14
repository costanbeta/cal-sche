# SchedulePro MVP - Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 20+** ([Download here](https://nodejs.org/))
- **PostgreSQL 15+** ([Download here](https://www.postgresql.org/download/))
- **Git** (optional, for version control)

## Step-by-Step Setup

### 1. Install PostgreSQL

**On macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**On Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

**On Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Login to PostgreSQL
psql postgres

# Create database
CREATE DATABASE scheduling_mvp;

# Create user (optional, but recommended)
CREATE USER schedulepro WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE scheduling_mvp TO schedulepro;

# Exit
\q
```

### 3. Install Dependencies

```bash
cd "CAL SCHE"
npm install
```

If you get npm permission errors, try:
```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and update these values:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://schedulepro:your_secure_password@localhost:5432/scheduling_mvp?schema=public"

# NextAuth Secret - Generate a random string
# Run: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="REPLACE_WITH_GENERATED_SECRET"

# App URLs
APP_URL="http://localhost:3000"
APP_NAME="SchedulePro"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email Configuration (Gmail Example)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# Google Calendar (Optional - can set up later)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

#### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

#### Setup Gmail for Emails:

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate an app password
5. Use the 16-character password in `.env`

### 5. Setup Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (for development)
npx prisma db push

# Verify database setup
npx prisma studio
```

This will open Prisma Studio at http://localhost:5555 where you can view your database.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Time Usage

### 1. Create Your Account

1. Visit http://localhost:3000
2. Click "Sign Up"
3. Fill in your details:
   - Full Name: John Doe
   - Email: john@example.com
   - Username: johndoe (lowercase, no spaces)
   - Password: (at least 8 characters)

### 2. Set Your Availability

1. After logging in, go to Dashboard
2. Click "Set Availability"
3. Toggle on the days you're available
4. Set your working hours (e.g., 9:00 AM - 5:00 PM)
5. Click "Save Availability"

### 3. Create Your First Event Type

1. Go back to Dashboard
2. Click "+ New Event Type"
3. Fill in details:
   - Event Name: "30-minute meeting"
   - URL Slug: "30-min" (automatically generated)
   - Description: "Quick 30-minute consultation"
   - Duration: 30 minutes
   - Color: Choose a color
4. Click "Create Event Type"

### 4. Share Your Booking Link

Your booking link will be:
```
http://localhost:3000/johndoe/30-min
```

Share this link with anyone, and they can book time with you!

### 5. Test the Booking Flow

1. Open your booking link in an incognito/private window
2. Select a date
3. Choose a time slot
4. Fill in attendee details:
   - Name
   - Email
   - Notes (optional)
5. Click "Confirm Booking"
6. Check your email for confirmation!

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or run on a different port
PORT=3001 npm run dev
```

### Database Connection Errors

```bash
# Check if PostgreSQL is running
brew services list

# Or on Linux
sudo systemctl status postgresql

# Test connection
psql -U schedulepro -d scheduling_mvp
```

### Prisma Errors

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or just regenerate client
npx prisma generate
```

### Email Not Sending

1. Check Gmail App Password is correct (16 characters, no spaces)
2. Verify 2-Step Verification is enabled on your Google account
3. Check spam folder for emails
4. Try using a different SMTP service like [Resend](https://resend.com)

### Node Version Issues

```bash
# Check Node version
node -v

# Should be 20.x or higher
# If not, use nvm to install:
nvm install 20
nvm use 20
```

## Google Calendar Setup (Optional)

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: "Web application"
4. Authorized redirect URIs:
   - `http://localhost:3000/api/calendar/callback`
5. Copy Client ID and Client Secret to `.env`

### 3. Connect Calendar

1. Go to Dashboard
2. Click "Connect Google Calendar"
3. Authorize the app
4. Calendar will now sync automatically!

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### Database Options

**Neon (Recommended):**
- Free tier: https://neon.tech
- Copy connection string to Vercel environment variables

**Supabase:**
- Free tier: https://supabase.com
- Includes PostgreSQL database

**Railway:**
- Easy deployment: https://railway.app
- Includes database and hosting

### Update Environment Variables for Production

In Vercel (or your hosting platform):

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
APP_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
# ... other variables
```

## Next Steps

- [ ] Customize email templates in `lib/email.ts`
- [ ] Add your logo and branding
- [ ] Set up custom domain
- [ ] Configure production database
- [ ] Add Google Calendar integration
- [ ] Customize colors in `tailwind.config.ts`
- [ ] Add more event types
- [ ] Share your booking link!

## Support

If you encounter any issues:

1. Check the logs: `npm run dev` will show errors
2. Open Prisma Studio: `npx prisma studio` to inspect database
3. Check environment variables are set correctly
4. Review the README.md for detailed documentation

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema changes
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate Prisma client

# Linting
npm run lint             # Check code quality
```

---

**Congratulations! 🎉**

You now have a fully functional scheduling application. Start booking meetings!
