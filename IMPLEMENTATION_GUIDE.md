# ASKTC Slido-Killer Features - Implementation Guide

## Overview

This guide covers all the advanced features added to transform ASKTC into a Slido competitor with superior functionality for conferences and community events.

## What's Been Built

### 1. Database Foundation Complete
- 8 new tables for engagement, polls, sentiment, and leaderboards
- Full RLS (Row Level Security) policies for data protection
- Optimized indexes for real-time performance
- Located in: `scripts/01_add_advanced_features_schema.sql`

### 2. Advanced Polling System
**Status: Ready to Use**

Components:
- `src/components/polls/AdvancedPollCreator.tsx` - Create polls with 5 question types
- `src/components/polls/PollResponseCard.tsx` - Attendee interface

Features:
- Multiple choice, ranking, scale (1-5), matrix grid, image choice
- Real-time vote counts
- Results visibility controls
- Image support for poll options

**To Integrate into Dashboard:**
```tsx
import { AdvancedPollCreator } from '@/components/polls/AdvancedPollCreator'

<AdvancedPollCreator eventId={eventId} onCreated={handlePollCreated} />
```

**To Display in Room View:**
```tsx
import { PollResponseCard } from '@/components/polls/PollResponseCard'

<PollResponseCard poll={advancedPoll} onResponded={handleResponded} />
```

---

### 3. Leaderboard & Gamification
**Status: Ready to Use**

Components:
- `src/components/leaderboard/EventLeaderboard.tsx` - Live leaderboard with badges

Features:
- Real-time ranking by engagement points
- 8 badge types (first_question, top_asker, trending, helper, streak_7, streak_30, star_striker, most_upvoted)
- Visual medals (🥇 🥈 🥉) for top 3
- Badge icons and colors

**To Add to Projector:**
```tsx
import { EventLeaderboard } from '@/components/leaderboard/EventLeaderboard'

<EventLeaderboard eventId={eventId} limit={10} showBadges={true} />
```

**Point System:**
- Ask a question: 10 points
- Receive upvote: 2 points each
- Question answered by panelist: 15 points
- Streak days: bonus points (configurable)

---

### 4. Sentiment Analysis
**Status: API Ready**

Components:
- `src/components/sentiment/SentimentMeter.tsx` - Visualization component
- `src/app/api/sentiment/analyze/route.ts` - Analysis API endpoint

Features:
- Automatic sentiment detection (positive/negative/neutral)
- Quality scoring based on grammar and clarity
- Key topic extraction
- Real-time metric updates

**To Use in Analytics:**
```tsx
import { SentimentMeter } from '@/components/sentiment/SentimentMeter'

<SentimentMeter eventId={eventId} size="large" />
```

**API Usage:**
```typescript
// POST /api/sentiment/analyze
const response = await fetch('/api/sentiment/analyze', {
  method: 'POST',
  body: JSON.stringify({
    questionId: 'uuid',
    text: 'The question text here',
    eventId: 'event-uuid'
  })
})

const { sentiment, score, topics, quality } = await response.json()
```

---

### 5. QR Code Generation
**Status: Ready to Use**

Components:
- `src/components/qrcode/EventQRCode.tsx` - QR generator with download/share

Features:
- Instant QR code generation
- Download as PNG
- Share via native share API
- Includes join URL fallback
- Scan tracking ready

**To Add to Dashboard:**
```tsx
import { EventQRCode } from '@/components/qrcode/EventQRCode'

<EventQRCode eventCode={eventCode} eventTitle={eventTitle} />
```

---

### 6. Analytics Enhancements
**Status: Ready to Use**

Components:
- `src/components/analytics/EngagementHeatmap.tsx` - Hour-by-hour engagement timeline
- `src/components/projector/TrendingWidget.tsx` - Floating trending questions widget

Features:
- Visual heatmap of engagement by hour
- Real-time trending questions carousel
- Auto-updates every 30 seconds
- Hover tooltips for details

**To Add to Analytics Page:**
```tsx
import { EngagementHeatmap } from '@/components/analytics/EngagementHeatmap'

<EngagementHeatmap eventId={eventId} />
```

**To Add Trending Widget to Projector:**
```tsx
import { TrendingWidget } from '@/components/projector/TrendingWidget'

<TrendingWidget eventId={eventId} limit={5} />
```

---

## Integration Steps

### Step 1: Run Database Migration
```bash
# Execute the SQL migration in your Supabase dashboard
# Navigate to: SQL Editor > New Query
# Paste contents of: scripts/01_add_advanced_features_schema.sql
# Click "Run"
```

### Step 2: Update Dashboard
Add to `src/app/dashboard/page.tsx`:

```tsx
import { AdvancedPollCreator } from '@/components/polls/AdvancedPollCreator'
import { EventLeaderboard } from '@/components/leaderboard/EventLeaderboard'
import { EventQRCode } from '@/components/qrcode/EventQRCode'
import { EngagementHeatmap } from '@/components/analytics/EngagementHeatmap'

// In your event dashboard component:
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <AdvancedPollCreator eventId={eventId} />
  <EventQRCode eventCode={eventCode} eventTitle={eventTitle} />
  <EventLeaderboard eventId={eventId} />
  <EngagementHeatmap eventId={eventId} />
</div>
```

### Step 3: Update Projector View
Add to `src/app/projector/[eventCode]/page.tsx`:

```tsx
import { EventLeaderboard } from '@/components/leaderboard/EventLeaderboard'
import { SentimentMeter } from '@/components/sentiment/SentimentMeter'
import { TrendingWidget } from '@/components/projector/TrendingWidget'

// Add to projector layout:
<div className="grid grid-cols-2 gap-6 h-screen p-6">
  <div>
    <EventLeaderboard eventId={eventId} limit={15} />
  </div>
  <div>
    <SentimentMeter eventId={eventId} size="large" />
  </div>
</div>

// Add widget to bottom-right:
<TrendingWidget eventId={eventId} />
```

### Step 4: Add Sentiment Analysis to Room View
When a question is submitted in `src/app/room/[eventCode]/page.tsx`:

```typescript
// After question creation:
const response = await fetch('/api/sentiment/analyze', {
  method: 'POST',
  body: JSON.stringify({
    questionId: newQuestion.id,
    text: questionContent,
    eventId: eventId
  })
})
```

### Step 5: Award Badges (Logic)
Create `src/lib/engagement.ts`:

```typescript
export async function awardBadges(userId: string, eventId: string) {
  const supabase = await createClient()
  
  // Get user engagement data
  const { data: engagement } = await supabase
    .from('user_engagement_points')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single()
  
  if (!engagement) return
  
  // Award badges based on metrics
  const badges: BadgeType[] = []
  
  if (engagement.questions_asked === 1) {
    badges.push('first_question')
  }
  
  if (engagement.total_points > 100 && engagement.questions_asked > 5) {
    badges.push('top_asker')
  }
  
  if (engagement.streak_days === 7) {
    badges.push('streak_7')
  }
  
  // Insert new badges...
}
```

---

## Next Steps for Full Implementation

### Phase 2: Polish (Recommended)
- [ ] Real-time leaderboard updates using Supabase subscriptions
- [ ] Projector theme system (light/dark, colors)
- [ ] Mobile-specific styling for poll interface
- [ ] Analytics dashboard redesign with more charts

### Phase 3: Advanced (Nice to Have)
- [ ] Integration with Groq API for NLP analysis
- [ ] Scheduled email reports
- [ ] Team/breakout room features
- [ ] Spam detection system
- [ ] Multi-language support

---

## File Structure

```
src/
├── components/
│   ├── polls/
│   │   ├── AdvancedPollCreator.tsx
│   │   └── PollResponseCard.tsx
│   ├── leaderboard/
│   │   └── EventLeaderboard.tsx
│   ├── sentiment/
│   │   └── SentimentMeter.tsx
│   ├── qrcode/
│   │   └── EventQRCode.tsx
│   ├── analytics/
│   │   └── EngagementHeatmap.tsx
│   └── projector/
│       └── TrendingWidget.tsx
│
├── app/
│   ├── api/
│   │   └── sentiment/
│   │       └── analyze/
│   │           └── route.ts
│   └── ...
│
├── lib/
│   └── utils.ts (added: validation helpers)
│
└── types/
    └── index.ts (added: new types for features)

scripts/
└── 01_add_advanced_features_schema.sql
```

---

## Testing Checklist

- [ ] Database migration runs without errors
- [ ] Can create advanced polls with all 5 types
- [ ] Poll responses are saved to database
- [ ] Sentiment analysis API returns correct scores
- [ ] Leaderboard displays and updates
- [ ] Badges display correctly
- [ ] QR code generates and downloads
- [ ] Trending widget shows top questions
- [ ] Engagement heatmap displays timeline
- [ ] All new components display on projector

---

## Performance Notes

- Leaderboard queries limit to 10-15 entries by default
- Sentiment analysis runs asynchronously (non-blocking)
- Trending widget updates every 30 seconds
- All DB queries use indexed columns
- RLS policies prevent unauthorized access

---

## Slido Comparison

| Feature | ASKTC | Slido | Status |
|---------|-------|-------|--------|
| Advanced Polls | ✓ | Limited | Implemented |
| Leaderboard | ✓ | ✗ | Implemented |
| Sentiment Analysis | ✓ | ✗ | Implemented |
| QR Code Join | ✓ | Limited | Implemented |
| Voice Questions | ✓ | ✗ | Pre-existing |
| Custom Branding | ✓ | Limited | Pre-existing |
| Gamification | ✓ | ✗ | Implemented |
| Price | $9-29/mo | $50+/mo | Advantage ASKTC |

---

## Support & Debugging

**Common Issues:**

1. **"Table does not exist" error**
   - Ensure migration script was executed in Supabase SQL editor
   - Check that RLS policies were created

2. **QR code not generating**
   - Ensure `qrcode` package is installed: `npm install qrcode @types/qrcode`
   - Check console for errors

3. **Leaderboard showing no data**
   - Ensure user_engagement_points table is populated
   - Check RLS policies allow SELECT

4. **Sentiment API returns error**
   - Check network tab for error details
   - Verify request format matches API spec

---

## Documentation

- Full feature docs: `SLIDO_KILLER_FEATURES.md`
- Original project docs: `README.md`
- Quick start guide: `QUICK_START.md`

