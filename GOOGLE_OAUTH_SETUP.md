# Google Calendar OAuth Setup Guide

## 🔴 Current Issue

You're seeing a CORS error when clicking "Connect Google Calendar" because:
1. Google OAuth credentials are not configured in Vercel
2. The redirect URI needs to be registered with Google

## ✅ Solution: Configure Google OAuth Credentials

Follow these steps to enable Google Calendar integration:

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Create Project"** or select an existing project
3. Name your project (e.g., "SchedulePro")
4. Click **"Create"**

---

## Step 2: Enable Google Calendar API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Calendar API"**
3. Click on it and click **"Enable"**
4. Wait for it to enable (takes a few seconds)

---

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have Google Workspace)
3. Click **"Create"**

4. **Fill in required fields:**
   - **App name:** SchedulePro (or your app name)
   - **User support email:** Your email
   - **Developer contact information:** Your email
   - **App logo:** (Optional)

5. **Add Scopes:**
   - Click "Add or Remove Scopes"
   - Search and add these scopes:
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/calendar.events`
   - Click "Update" and "Save and Continue"

6. **Test users** (for testing phase):
   - Add your Gmail address as a test user
   - Click "Save and Continue"

7. Click **"Back to Dashboard"**

---

## Step 4: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth 2.0 Client ID"**

3. **Configure:**
   - **Application type:** Web application
   - **Name:** SchedulePro OAuth Client

4. **Authorized JavaScript origins:**
   ```
   https://your-project-name.vercel.app
   ```
   Replace `your-project-name` with your actual Vercel domain

5. **Authorized redirect URIs:**
   ```
   https://your-project-name.vercel.app/api/calendar/callback
   ```
   ⚠️ **IMPORTANT:** Must be EXACT - check your Vercel URL!

   **For testing locally, also add:**
   ```
   http://localhost:3000/api/calendar/callback
   ```

6. Click **"Create"**

7. **Save the credentials:**
   - Copy **Client ID** (looks like: `123456789-abcdef.apps.googleusercontent.com`)
   - Copy **Client Secret** (looks like: `GOCSPX-xyz123...`)
   - ⚠️ Keep these SECRET! Don't commit to GitHub!

---

## Step 5: Add to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

### Variables to Add:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

**Example (use YOUR actual values):**
```env
GOOGLE_CLIENT_ID=123456789012-abc123def456ghi789jkl012mno345p.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-1234567890abcdefghijklmnop
```

5. Make sure to select **All environments** (Production, Preview, Development)
6. Click **"Save"**

---

## Step 6: Redeploy Your Application

After adding environment variables:

### Option 1: Redeploy from Vercel Dashboard
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Uncheck "Use existing build cache"
5. Click **"Redeploy"**

### Option 2: Push a New Commit
```bash
git commit --allow-empty -m "Trigger redeployment with Google OAuth credentials"
git push origin main
```

---

## Step 7: Update Local Environment (Optional)

For local testing, update your `.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## Step 8: Test the Integration

Once redeployed:

1. Go to your app: `https://your-project.vercel.app`
2. Log in to dashboard
3. Click **"Settings"**
4. Click **"Connect Google Calendar"**
5. You should be redirected to Google OAuth screen
6. Grant permissions
7. Redirected back to your app
8. ✅ Calendar should show as connected!

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI doesn't match what's registered in Google Console.

**Solution:**
1. Check your exact Vercel URL
2. Go to Google Cloud Console → Credentials
3. Edit your OAuth client
4. Make sure redirect URI is EXACTLY:
   ```
   https://your-exact-vercel-url.vercel.app/api/calendar/callback
   ```
5. Save and wait a few minutes

### Error: "Access blocked: This app's request is invalid"

**Problem:** App is not verified or scopes not properly configured.

**Solution:**
1. Go to OAuth consent screen
2. Make sure you added yourself as a test user
3. Verify the scopes are added correctly
4. If in development, this is normal - click "Advanced" → "Go to SchedulePro (unsafe)"

### Error: "CORS policy" or "Failed to fetch"

**Problem:** Environment variables not set or incorrect.

**Solution:**
1. Check Vercel environment variables are set
2. Redeploy after adding variables
3. Clear browser cache
4. Try in incognito mode

### Error: "Google Calendar integration is not configured"

**Problem:** GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing.

**Solution:**
1. Verify variables are added in Vercel
2. Check spelling (case-sensitive)
3. Redeploy application
4. Check Vercel logs for details

---

## 📋 Checklist

Before testing, ensure:

- [ ] Google Calendar API is enabled
- [ ] OAuth consent screen is configured
- [ ] OAuth 2.0 Client ID is created
- [ ] Redirect URI matches EXACTLY: `https://your-domain.vercel.app/api/calendar/callback`
- [ ] GOOGLE_CLIENT_ID added to Vercel
- [ ] GOOGLE_CLIENT_SECRET added to Vercel
- [ ] Application has been redeployed
- [ ] You're added as a test user (if in testing mode)

---

## 🎯 Expected Behavior After Setup

### When Not Connected:
- Settings page shows "Connect Google Calendar" button
- Lists benefits of connecting
- Button works without CORS errors

### When Connecting:
- Click button → Redirected to Google
- Google asks for permissions
- After granting → Redirected back to app
- Settings page shows "Connected" status

### When Connected:
- Green checkmark shows connection active
- Available time slots exclude calendar busy times
- New bookings appear in Google Calendar
- Attendees receive calendar invites
- Cancelled bookings removed from calendar

---

## 🔒 Security Notes

1. **Never commit credentials to GitHub**
   - Keep secrets in Vercel/environment only
   - Use `.env` file locally (already in `.gitignore`)

2. **Rotate secrets if exposed**
   - If credentials leak, delete and create new ones

3. **Use test users in development**
   - Only add trusted users during testing
   - Publish app when ready for production

4. **Keep access limited**
   - Only request calendar.readonly and calendar.events
   - Don't request unnecessary permissions

---

## 📚 Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ Success!

Once configured, your Google Calendar integration will:
- ✅ Work without CORS errors
- ✅ Sync bookings automatically
- ✅ Prevent double-bookings
- ✅ Send calendar invites
- ✅ Keep everything in sync

**Need Help?** Check the troubleshooting section or verify each step above!

---

*Last Updated: January 2026*
