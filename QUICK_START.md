# ASKTC Quick Start Guide

Get up and running with ASKTC in 5 minutes.

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Paddle account (for payments)

## 1. Clone & Install

```bash
git clone https://github.com/victorachede/asktc-acc.git
cd asktc-acc
pnpm install
```

## 2. Setup Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Paddle (optional - for payments)
PADDLE_API_KEY=your_paddle_api_key
PADDLE_PRICE_PRO_MONTHLY=pri_xxxxx
PADDLE_PRICE_PRO_YEARLY=pri_xxxxx
PADDLE_PRICE_ENTERPRISE_MONTHLY=pri_xxxxx
PADDLE_PRICE_ENTERPRISE_YEARLY=pri_xxxxx
```

## 3. Setup Database

Create these tables in Supabase:

```sql
-- Tables already set up in your Supabase project
-- Check src/types/index.ts for schema reference
```

## 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Key Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/auth/login` | Login page |
| `/auth/signup` | Sign up page |
| `/auth/reset` | Password reset |
| `/dashboard` | Event management |
| `/room/[code]` | Audience Q&A |
| `/moderator/[code]` | Moderator panel |
| `/projector/[code]` | Projector view |
| `/upgrade` | Pricing page |
| `/contact` | Enterprise contact |

## Quick Workflows

### Create an Event

1. Go to `/auth/signup` → Create account
2. Go to `/dashboard` → Click "New Event"
3. Share event code with audience
4. Go to `/room/[code]` to submit questions
5. Go to `/moderator/[code]` to moderate

### Moderate Questions

**Keyboard Shortcuts:**
- `Cmd/Ctrl + P` → Open projector
- `Cmd/Ctrl + K` → Focus search
- `Cmd/Ctrl + Shift + ?` → Show shortcuts
- `/` → Focus search

### Use Voice Questions

1. In moderator panel, click "Voice" button
2. Speak your question
3. Review transcription
4. Click "Submit"

### Export Data

1. Go to dashboard
2. Click event's "Export" button
3. CSV file downloads

## Troubleshooting

### "Event not found"
- Check event code is correct
- Verify event hasn't been deleted
- Try refreshing

### Payment not working
- Verify `PADDLE_API_KEY` is set
- Check price IDs are correct
- Test with Paddle sandbox first

### Voice recognition not working
- Use Chrome or Edge browser
- Allow microphone permissions
- Check system microphone works
- Try another app first

### Form validation errors
- Email must be valid format (user@domain.com)
- Password min 6 characters
- All required fields must be filled

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| Voice features | Chrome/Edge only |

## Performance Tips

1. **Faster moderation**: Use keyboard shortcuts
2. **Smaller exports**: Filter questions before exporting
3. **Better UX**: Enable browser notifications
4. **Speed**: Use Cmd+K to search instead of scrolling

## Testing

### Test Accounts

```
Email: test@example.com
Password: testpass123
```

### Test Event Codes

You can manually create events via:
1. Sign up at `/auth/signup`
2. Create event on `/dashboard`
3. Share the generated code

## Common Issues & Solutions

**Q: Can't login?**
- Reset password at `/auth/reset`
- Check caps lock
- Verify email is correct

**Q: Questions not updating live?**
- Check network connection
- Refresh page (Cmd/Ctrl + R)
- Verify event is still live

**Q: Voice questions not transcribing?**
- Check microphone permissions
- Use Chrome or Edge
- Test microphone in system settings

**Q: Export not downloading?**
- Check browser popup blocker
- Try incognito/private mode
- Check available disk space

## Next Steps

1. Read `README.md` for comprehensive docs
2. Check `IMPROVEMENTS.md` for recent changes
3. Review `src/types/index.ts` for data schema
4. Explore components in `src/components/`

## Support

- **Issues**: GitHub Issues
- **Email**: hello@asktc.com
- **Docs**: Check README.md and code comments

## Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Run production build locally
pnpm start

# Lint code
pnpm lint

# Format code
pnpm format
```

## File Structure

```
asktc-acc/
├── src/
│   ├── app/              # Next.js routes and pages
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and helpers
│   └── types/           # TypeScript types
├── public/              # Static assets
├── README.md            # Full documentation
├── IMPROVEMENTS.md      # Recent improvements
└── package.json         # Dependencies
```

## Tips for Success

1. **Always backup environment variables**
2. **Test payment flow in sandbox first**
3. **Use keyboard shortcuts to save time**
4. **Check browser console for errors**
5. **Enable error reporting in production**
6. **Regularly export event data**
7. **Keep Supabase updated**
8. **Monitor API rate limits**

---

Ready to build amazing events? Let's go!
