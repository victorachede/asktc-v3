# ASKTC - Live Q&A for Modern Events

A real-time Q&A platform that lets your audience ask, vote, and engage while you stay in full control. Built for conferences, churches, universities, and corporate events.

## Features

### Core Features
- **Real-time Q&A** - Powered by Supabase Realtime for instant updates across all screens
- **Live Voting** - Audience members upvote questions to surface the best ones
- **Moderator Control** - Approve, reject, or assign questions from one screen
- **Panelist Assignment** - Route questions directly to specific panelists
- **Projector View** - Clean, distraction-free display for your venue screen
- **Voice Questions** - Attendees can ask questions via voice (transcribed automatically)
- **Live Polls** - Create interactive polls and quizzes during your event
- **Word Cloud** - Real-time word cloud visualization of audience input
- **Custom Branding** - Enterprise: Custom logos, colors, and fonts
- **Analytics** - Track question engagement, answer rates, and audience participation

### Event Management
- **Multiple Events** - Host unlimited events (Pro plan) or up to 1 (Free plan)
- **Event Status Tracking** - Waiting → Live → Ended
- **Anonymous Mode** - Force anonymous submissions for sensitive topics
- **Export Data** - Enterprise: Export questions and responses as CSV
- **Advanced Analytics** - Poll statistics, vote trends, and top questions

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account
- Paddle account (for payments)

### Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PADDLE_API_KEY=your_paddle_api_key
PADDLE_PRICE_PRO_MONTHLY=price_id_monthly
PADDLE_PRICE_PRO_YEARLY=price_id_yearly
PADDLE_PRICE_ENTERPRISE_MONTHLY=price_id_monthly
PADDLE_PRICE_ENTERPRISE_YEARLY=price_id_yearly
```

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

### Build for Production

```bash
pnpm build
pnpm start
```

## Architecture

### Pages
- `/` - Homepage with features and pricing
- `/auth/login` - User login
- `/auth/signup` - User registration
- `/auth/reset` - Password reset
- `/dashboard` - Event management dashboard
- `/join` - Join an event by code
- `/room/[eventCode]` - Audience Q&A view
- `/moderator/[eventCode]` - Moderator control panel
- `/projector/[eventCode]` - Venue projector display
- `/panelist/[eventCode]` - Panelist view
- `/upgrade` - Pricing and upgrade page
- `/contact` - Enterprise inquiries
- `/terms`, `/privacy`, `/refund` - Legal pages

### Components
- `QuestionForm` - Submit new questions
- `QuestionCard` - Display individual questions
- `QuestionQueue` - Sorted list of questions
- `ModerationPanel` - Moderation controls
- `PanelistManager` - Assign panelists
- `ProjectorDisplay` - Projector view
- `EventAnalyticsTab` - Analytics dashboard
- `WordCloudDisplay` - Word cloud visualization
- `ReactionBar` - Real-time reactions
- `ErrorBoundary` - Crash protection

### Database Schema
See `src/types/index.ts` for TypeScript interfaces:
- `Event` - Event metadata and settings
- `Question` - User questions
- `Vote` - Upvotes on questions
- `Panelist` - Event panelists
- `Poll` - Interactive polls
- `PollVote` - Poll responses
- `WordCloudEntry` - Word cloud submissions
- `Subscription` - User subscription plans
- `Payment` - Payment records

## Keyboard Shortcuts

### Moderator View
- `Cmd/Ctrl + P` - Open projector in new tab
- `Cmd/Ctrl + K` - Focus search
- `Cmd/Ctrl + R` - Refresh event data
- `/` - Focus search (when not in input)

## Plan Limits

### Free Plan
- 1 event
- 50 questions per event
- 30 audience members
- ASKTC watermark on projector

### Pro Plan
- Unlimited events
- 200 questions per event
- 200 audience members
- Voice questions enabled
- Panelist assignment
- No watermark
- Basic analytics

### Enterprise Plan
- Unlimited everything
- Custom branding
- Multiple moderators
- PDF/CSV export
- Advanced analytics
- Dedicated support

## Security

- Password hashing with Supabase Auth
- Row-level security on database tables
- Voter fingerprinting (browser-based, not stored)
- HTTPS only
- Rate limiting on question submissions

## Performance Optimizations

- Real-time updates via Supabase Realtime
- Client-side state management with React hooks
- Pagination for large question lists
- Debounced search and duplicate detection
- Image optimization for logos and branding

## Troubleshooting

### Payment Issues
- Verify Paddle API key and price IDs in environment variables
- Check Paddle sandbox vs production settings
- Review console logs for detailed error messages

### Real-time Updates Not Working
- Ensure Supabase Realtime is enabled in your project
- Check network tab for WebSocket connections
- Verify RLS policies are correctly configured

### Voice Questions Not Transcribing
- Check browser microphone permissions
- Ensure SpeechRecognition API is supported
- Test microphone in other applications first

## Contributing

Issues and PRs welcome. Please follow the existing code style and test your changes.

## License

Proprietary - All rights reserved

## Support

- Email: hello@asktc.com
- GitHub: https://github.com/victorachede/asktc-acc
- Docs: https://asktc.com/docs

## Roadmap

- [ ] Mobile app
- [ ] Integration with major event platforms
- [ ] AI-powered question summarization
- [ ] Multi-language support
- [ ] Live moderation AI
- [ ] Advanced segmentation and analytics
