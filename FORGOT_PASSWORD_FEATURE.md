# Forgot Password Feature

## Overview
Complete password reset functionality with email-based token verification.

## Features
✅ Secure password reset flow with time-limited tokens
✅ Email-based verification
✅ Token expiration (1 hour)
✅ Beautiful, user-friendly UI
✅ Email enumeration protection
✅ Automatic redirect after successful reset

## Files Added

### API Routes
- `/app/api/auth/forgot-password/route.ts` - Request password reset
- `/app/api/auth/verify-reset-token/route.ts` - Verify reset token validity
- `/app/api/auth/reset-password/route.ts` - Reset password with token

### UI Pages
- `/app/auth/forgot-password/page.tsx` - Forgot password form
- `/app/auth/reset-password/page.tsx` - Reset password form with token verification

### Library Functions
- `lib/auth.ts` - Added `generateResetToken()` function
- `lib/email.ts` - Already had `sendPasswordResetEmail()` function

## Database Schema
Password reset fields already exist in the User model:
```prisma
resetToken        String?   @map("reset_token")
resetTokenExpiry  DateTime? @map("reset_token_expiry")
```

## User Flow

### 1. Request Password Reset
1. User visits `/auth/forgot-password`
2. Enters their email address
3. System generates a secure token and sends email
4. Success message shown (regardless of whether email exists - security best practice)

### 2. Receive Email
User receives an email with:
- Reset link valid for 1 hour
- Clear instructions
- Security warnings

### 3. Reset Password
1. User clicks link in email → `/auth/reset-password?token=...`
2. Token is automatically verified
3. If valid, user enters new password
4. Password is updated and token is cleared
5. User is redirected to login

### 4. Edge Cases Handled
- ✅ Expired tokens
- ✅ Invalid tokens
- ✅ Already used tokens
- ✅ Password validation
- ✅ Email enumeration protection

## Security Features

### Token Generation
- Cryptographically secure random tokens (32 bytes hex)
- One-time use only
- Time-limited (1 hour expiration)

### Email Enumeration Protection
The forgot password endpoint always returns success, regardless of whether the email exists in the database. This prevents attackers from discovering which email addresses are registered.

### Password Validation
- Minimum 8 characters
- Password confirmation required
- Passwords must match

## API Endpoints

### POST /api/auth/forgot-password
Request a password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:** (Always returns success)
```json
{
  "message": "If an account exists with that email, a password reset link has been sent."
}
```

### POST /api/auth/verify-reset-token
Verify if a reset token is valid.

**Request:**
```json
{
  "token": "abc123..."
}
```

**Response:**
```json
{
  "valid": true,
  "email": "user@example.com",
  "name": "John Doe"
}
```

### POST /api/auth/reset-password
Reset password with a valid token.

**Request:**
```json
{
  "token": "abc123...",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful. You can now log in with your new password."
}
```

## Environment Variables Required

Make sure these are set in your `.env` file:
```env
# Email configuration (for sending reset emails)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM="SchedulePro <noreply@schedulepro.com>"

# App URL (for reset links)
APP_URL=http://localhost:3000  # or your production URL
APP_NAME=SchedulePro

# JWT Secret (already required)
NEXTAUTH_SECRET=your-secret-key
```

## Testing

### Local Testing
1. Set up email configuration in `.env`
2. Start the development server: `npm run dev`
3. Visit `http://localhost:3000/auth/forgot-password`
4. Enter a registered email address
5. Check your email for the reset link
6. Click the link and reset your password

### Test Scenarios
- ✅ Valid email address
- ✅ Non-existent email address
- ✅ Expired token
- ✅ Invalid token
- ✅ Password mismatch
- ✅ Short password
- ✅ Already used token

## UI/UX Features

### Forgot Password Page
- Clean, modern design
- Email input with validation
- Success state with helpful tips
- Back to login link
- Responsive design

### Reset Password Page
- Token verification on load
- Loading state during verification
- Invalid token error handling
- Password strength requirements
- Password confirmation
- Success state with auto-redirect
- Clear error messages

## Integration with Login Page
The login page already includes a "Forgot password?" link that points to `/auth/forgot-password` (lines 83-87 in `app/auth/login/page.tsx`).

## Next Steps (Optional Enhancements)

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Password Strength Meter**: Visual indicator of password strength
3. **2FA**: Two-factor authentication option
4. **Email Templates**: More sophisticated HTML email templates
5. **Audit Log**: Track password reset attempts
6. **SMS Option**: Alternative to email-based reset
7. **Security Questions**: Additional verification method

## Deployment Notes

1. Make sure to run `npx prisma generate` after pulling changes
2. No database migration needed (fields already exist)
3. Test email delivery in production
4. Update APP_URL to production URL
5. Consider using a transactional email service like SendGrid or AWS SES for production

## Support

If users report issues:
1. Check email delivery logs
2. Verify token expiration time
3. Check database for reset token records
4. Ensure environment variables are set correctly
