# 📅 Google Calendar Integration Guide

## Overview

Your SchedulePro app now has **full Google Calendar integration**! This means:

✅ **Automatic Calendar Sync** - Available time slots exclude Google Calendar busy times  
✅ **Auto-Create Events** - Bookings automatically appear in your Google Calendar  
✅ **Calendar Invites** - Attendees receive calendar invites with meeting details  
✅ **Auto-Delete Events** - Cancelled bookings are removed from Google Calendar  

---

## 🎯 How It Works

### 1. **Available Slots Generation**

When someone tries to book time with you:

1. System fetches your database availability rules
2. **NEW:** Queries your Google Calendar for busy times
3. Combines both sources to show only truly available slots
4. Filters out:
   - Existing database bookings
   - Google Calendar events
   - Past time slots

**Result:** No more double-bookings! Your calendar stays in perfect sync.

### 2. **Booking Creation**

When a booking is created:

1. Booking is saved to the database
2. **NEW:** System checks if you have Google Calendar connected
3. If connected:
   - Creates a calendar event with meeting details
   - Adds attendee as a guest (they get a calendar invite!)
   - Includes meeting link, notes, and booking ID
   - Stores Google Event ID in the database
4. Sends confirmation emails to both parties

**Result:** Instant calendar sync without manual effort!

### 3. **Booking Cancellation**

When a booking is cancelled:

1. Booking status is updated to 'cancelled'
2. **NEW:** System finds the Google Calendar event
3. If event exists:
   - Deletes the event from your calendar
   - Removes it from attendee's calendar
4. Sends cancellation emails

**Result:** Your calendar stays clean and up-to-date!

---

## 🔧 Setup Instructions

### Step 1: Connect Google Calendar

1. Log in to your SchedulePro dashboard
2. Go to **Settings** or look for **"Connect Google Calendar"** button
3. Click **"Connect Google Calendar"**
4. Authorize the app to access your calendar
5. You'll be redirected back - calendar is now connected! ✅

### Step 2: Verify Connection

Once connected, you'll see:
- ✅ Green checkmark or "Connected" status
- Option to disconnect if needed
- Calendar sync is now active

### Step 3: Test It Out

1. Share your booking link with someone
2. Have them book a time slot
3. Check your Google Calendar - the event should appear automatically!
4. Attendee will receive a calendar invite via email

---

## 🎨 Features in Detail

### Calendar Conflict Detection

**Before Integration:**
```
User's availability: 9 AM - 5 PM
Database bookings: None
→ Shows all slots 9 AM - 5 PM
```

**After Integration:**
```
User's availability: 9 AM - 5 PM
Database bookings: 10 AM - 11 AM
Google Calendar busy: 2 PM - 3 PM, 3:30 PM - 4 PM
→ Shows only: 9-10 AM, 11 AM-2 PM, 3-3:30 PM, 4-5 PM
```

### Event Details

Calendar events include:
- **Title:** "{Event Type} with {Attendee Name}"
- **Description:**
  - Attendee email
  - Notes from attendee
  - Booking ID for reference
- **Time:** Start and end time with timezone
- **Attendees:** Attendee email (receives invite)
- **Reminders:**
  - Email: 24 hours before
  - Popup: 30 minutes before

### Example Calendar Event

```
Title: 30 Min Meeting with John Doe

Description:
Meeting with John Doe (john@example.com)

Notes: Looking forward to discussing the project proposal

Booking ID: abc-123-def-456

When: Thursday, January 16, 2026 @ 2:00 PM - 2:30 PM (EST)
Attendees: john@example.com
```

---

## 🔐 Privacy & Security

### What We Access

The app requests these Google Calendar permissions:
- **Read Calendar:** To check for busy times
- **Write Events:** To create/delete booking events
- **Calendar.Events:** To manage specific events only

### What We DON'T Do

- ❌ Read your private event details
- ❌ Access other calendars without permission
- ❌ Modify existing non-booking events
- ❌ Share your calendar data with third parties

### Token Security

- Access tokens are encrypted and stored securely
- Refresh tokens allow seamless re-authentication
- Tokens are user-specific and never shared

---

## 🛠 Troubleshooting

### Calendar Not Syncing?

**Check Connection Status:**
1. Go to dashboard settings
2. Look for Google Calendar connection
3. If disconnected, reconnect

**Re-authorize:**
1. Disconnect Google Calendar
2. Reconnect and authorize again
3. Test with a new booking

### Events Not Appearing?

**Possible Causes:**
- Calendar connection expired (reconnect)
- Google API rate limit (wait a few minutes)
- Internet connectivity issue

**Solution:**
Events are created asynchronously - if creation fails:
- Booking still succeeds (won't block booking)
- Error is logged for debugging
- User can manually add to calendar

### Double Bookings Still Happening?

**Verify:**
- Google Calendar is connected (check dashboard)
- Calendar permissions are granted
- Events are on "primary" calendar

**Refresh Connection:**
- Disconnect and reconnect Google Calendar
- Ensure proper permissions are granted

---

## 🚀 Best Practices

### For Hosts (You)

1. **Keep Calendar Updated:** Add personal events to Google Calendar
2. **One Primary Calendar:** Use your primary calendar for best results
3. **Regular Sync Check:** Verify connection status monthly
4. **Test Bookings:** Periodically test the booking flow

### For Development

1. **Error Logging:** Check logs for sync issues
2. **Token Refresh:** Handled automatically, but monitor for failures
3. **Rate Limits:** Google Calendar API has limits - consider caching
4. **Timezone Handling:** Events use booking timezone correctly

---

## 📊 Technical Implementation

### Files Modified

#### 1. `/app/api/availability/slots/route.ts`
- Added Google Calendar busy time fetch
- Merges calendar events with database bookings
- Filters out both types of conflicts

#### 2. `/app/api/bookings/route.ts`
- Creates Google Calendar event after booking
- Stores event ID in database
- Handles failures gracefully

#### 3. `/app/api/bookings/[id]/cancel/route.ts`
- Deletes Google Calendar event on cancellation
- Removes from both host and attendee calendars

#### 4. `/lib/google-calendar.ts`
- `getGoogleCalendarBusyTimes()` - Fetch busy periods
- `createGoogleCalendarEvent()` - Create calendar events
- `deleteGoogleCalendarEvent()` - Remove events
- Token refresh and error handling

---

## 🎯 Future Enhancements

Possible improvements:
- [ ] Support multiple calendars
- [ ] Two-way sync (update if changed in Google Calendar)
- [ ] Add Google Meet links automatically
- [ ] Sync event updates (time/location changes)
- [ ] Show upcoming Google Calendar events in dashboard
- [ ] Manual sync button for failed events

---

## 💡 Tips

### Maximize Integration Benefits

1. **Always Connect:** Connect Google Calendar immediately after signup
2. **Keep It Clean:** Use calendar for all events (personal + work)
3. **Test First:** Book a test meeting to verify sync
4. **Check Regularly:** Monitor dashboard for sync status

### For Your Users

1. **Clear Instructions:** Tell users to check spam for calendar invites
2. **Time Zones:** Booking page shows user's timezone automatically
3. **Cancellations:** Users can cancel from email or booking page

---

## 🆘 Support

If you encounter issues:

1. **Check Logs:** Look at terminal/server logs for errors
2. **Verify Tokens:** Ensure Google OAuth credentials are valid
3. **Test Manually:** Try creating a calendar event via Google Calendar
4. **Reconnect:** Disconnect and reconnect Google Calendar

---

## ✅ Success!

Your Google Calendar integration is now live! 🎉

**What happens now:**
- Available slots exclude calendar busy times ✅
- New bookings create calendar events automatically ✅  
- Attendees receive calendar invites ✅
- Cancellations remove calendar events ✅

**Enjoy seamless calendar management!** 📅

---

*Last Updated: January 2026*
*Version: 1.0*
