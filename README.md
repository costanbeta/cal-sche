# SchedulePro - Meeting Scheduling MVP

A minimal viable product (MVP) for a scheduling tool similar to Calendly. Let anyone book time with you through a simple link.

## 🚀 Features

- ✅ **User Authentication** - Email/password signup and login with JWT
- ✅ **Event Type Management** - Create custom event types with duration, description, and colors
- ✅ **Availability Settings** - Define weekly working hours
- ✅ **Public Booking Pages** - Share your link: `yourapp.com/username/event-slug`
- ✅ **Time Slot Generation** - Smart availability calculation
- ✅ **Email Notifications** - Booking confirmations and reminders
- ✅ **Dashboard** - Manage bookings and event types
- 🔄 **Google Calendar Integration** - (Ready to implement)

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hook Form** + **Zod** validation
- **date-fns** for date handling

### Backend
- **Next.js API Routes**
- **PostgreSQL** with **Prisma ORM**
- **JWT** authentication
- **Nodemailer** for emails

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

## 🏁 Getting Started

### 1. Clone and Install

```bash
cd "CAL SCHE"
npm install
```

### 2. Setup Database

Install PostgreSQL if you haven't:
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb scheduling_mvp
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/scheduling_mvp?schema=public"

# NextAuth (generate a secret: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Google Calendar OAuth (optional, for later)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# App Config
APP_URL="http://localhost:3000"
APP_NAME="SchedulePro"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Prisma

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (for development)
npx prisma db push

# Or run migrations (for production)
npx prisma migrate dev --name init
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
CAL SCHE/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── event-types/       # Event type management
│   │   ├── availability/      # Availability settings
│   │   ├── bookings/          # Booking management
│   │   └── users/             # Public user data
│   ├── auth/                   # Auth pages (login, signup)
│   ├── dashboard/              # Protected dashboard pages
│   ├── [username]/[slug]/      # Public booking pages
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   └── globals.css             # Global styles
├── lib/
│   ├── prisma.ts              # Prisma client
│   ├── auth.ts                # Auth utilities
│   ├── availability.ts        # Slot generation logic
│   ├── email.ts               # Email templates
│   ├── validations.ts         # Zod schemas
│   └── middleware.ts          # API middleware
├── types/
│   └── index.ts               # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔧 Key Components

### Database Schema

The app uses 7 main tables:
- **users** - User accounts
- **event_types** - Bookable event types
- **availability** - Weekly availability rules
- **date_overrides** - Date-specific availability
- **bookings** - Scheduled meetings
- **calendar_connections** - Google Calendar integration
- **accounts/sessions** - NextAuth tables

### API Endpoints

**Authentication**
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

**Event Types**
- `GET /api/event-types` - List user's event types
- `POST /api/event-types` - Create event type
- `PUT /api/event-types/[id]` - Update event type
- `DELETE /api/event-types/[id]` - Delete event type

**Availability**
- `GET /api/availability` - Get availability rules
- `POST /api/availability` - Set availability
- `GET /api/availability/slots` - Get available time slots

**Bookings**
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking (public)
- `PUT /api/bookings/[id]/cancel` - Cancel booking

**Public**
- `GET /api/users/[username]/events/[slug]` - Get public event type

## 🎯 Usage Flow

### For Hosts (Users)

1. **Sign up** at `/auth/signup`
2. **Create event types** at `/dashboard/event-types/new`
3. **Set availability** at `/dashboard/availability`
4. **Share booking link**: `localhost:3000/yourrusername/event-slug`
5. **Manage bookings** in dashboard

### For Attendees (Public)

1. Visit booking link: `/username/event-slug`
2. Select date and time
3. Fill in details (name, email, notes)
4. Confirm booking
5. Receive confirmation email

## 📧 Email Setup

### Using Gmail

1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `.env`:

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-char-app-password"
EMAIL_FROM="your-email@gmail.com"
```

### Using Resend (Recommended for Production)

1. Sign up at https://resend.com
2. Get your API key
3. Update `.env`:

```env
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="your-resend-api-key"
EMAIL_FROM="onboarding@resend.dev"
```

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Database Hosting

Use one of these PostgreSQL providers:
- **Neon** (https://neon.tech) - Serverless Postgres
- **Supabase** (https://supabase.com) - Free tier available
- **Railway** (https://railway.app) - Easy deployment

Update `DATABASE_URL` in Vercel environment variables.

## 🔐 Security Considerations

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire after 24 hours
- HTTP-only cookies for authentication
- SQL injection prevention via Prisma
- Input validation with Zod
- CORS and CSRF protection

## 🎨 Customization

### Change Brand Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    500: '#your-color',
    600: '#your-darker-color',
    // ...
  }
}
```

### Customize Email Templates

Edit email templates in `lib/email.ts`

## 📝 Next Steps (Post-MVP)

- [ ] Google Calendar OAuth integration
- [ ] Cancellation and rescheduling
- [ ] Meeting reminders (24h before)
- [ ] Date overrides (vacations)
- [ ] Buffer time between meetings
- [ ] Multiple event types per booking page
- [ ] Custom branding
- [ ] Analytics dashboard
- [ ] Team scheduling
- [ ] Payment integration

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
brew services list

# Test connection
psql -U your_user -d scheduling_mvp
```

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [date-fns](https://date-fns.org/docs)

## 📄 License

MIT License - feel free to use this for your own projects!

## 🤝 Contributing

This is an MVP template. Feel free to fork and customize for your needs!

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
