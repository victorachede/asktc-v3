# ASKTC - Slido Killer Features

This document outlines the advanced features that make ASKTC superior to Slido, especially for conferences and community events.

## 1. Advanced Polling System

### Features
- **Multiple Poll Types**: Multiple choice, ranking, matrix grid, scale (1-5), image choice
- **Real-time Results**: Live visualization of poll responses
- **Quiz Mode**: Convert polls to quizzes with automatic scoring
- **Rich Media**: Support for images in poll options

### Components
- `AdvancedPollCreator.tsx` - Create polls with multiple question types
- `PollResponseCard.tsx` - Attendee-facing poll interface
- Database tables: `advanced_polls`, `poll_options`, `poll_responses`

### Use Cases
- **Conferences**: Voting on topics, ranking speaker quality
- **Churches**: Sentiment surveys, engagement scales
- **Training**: Quick knowledge checks as quizzes

---

## 2. Leaderboard & Gamification

### Features
- **Live Leaderboard**: Real-time ranking of audience participation
- **Achievement Badges**: 8 different badge types earned during the event
- **Engagement Points**: Points awarded for:
  - Asking questions (10 points)
  - Getting upvotes (2 points each)
  - Answered questions (15 points)
  - Streaks (bonus points for consistency)
- **Streak Tracking**: Daily participation tracking with badges for 7-day and 30-day streaks

### Badge Types
- `first_question` - Ask first question of the event
- `top_asker` - Most questions asked
- `trending` - Question goes viral (50+ votes)
- `helper` - Question answered by panelist
- `streak_7` - 7 consecutive days of participation
- `streak_30` - 30 consecutive days
- `star_striker` - 5+ starred questions
- `most_upvoted` - Most total upvotes on questions

### Components
- `EventLeaderboard.tsx` - Main leaderboard display with badges
- Database tables: `user_engagement_points`, `user_badges`

### Competitive Advantage Over Slido
- **More Engaging**: Gamification drives participation
- **Community Building**: Leaderboards create healthy competition
- **Loyalty**: Streaks encourage return attendance at multiple events

---

## 3. Sentiment Analysis

### Features
- **Automatic Sentiment Detection**: Analyzes question text for:
  - Emotional tone (positive/neutral/negative)
  - Quality score (grammar, clarity, length)
  - Key topics extraction
- **Sentiment Visualization**: Charts showing audience mood
- **Real-time Updates**: Sentiment metrics update as questions come in

### Algorithm
- Word-based sentiment scoring (fast, no external API needed)
- Quality scoring based on:
  - Question length and word variety
  - Proper punctuation and capitalization
  - Readability metrics

### Components
- `SentimentMeter.tsx` - Visualization of audience sentiment
- API: `/api/sentiment/analyze` - Analyze question text
- Database tables: `question_sentiment`, `event_engagement_metrics`

### Use Cases
- **Conference Organizers**: Understand audience sentiment about topics
- **Church Leaders**: Gauge community feedback on messages
- **Trainers**: Identify confusion or concerns in participant questions

### Future Enhancement
- Integration with Groq API for more sophisticated NLP analysis
- Multi-language sentiment detection

---

## 4. QR Code & Mobile Join

### Features
- **One-Click QR Generation**: Generate shareable QR code for easy event access
- **Mobile Optimized**: Beautiful mobile interface for joining events
- **Download & Share**: Download QR as PNG or share via social/messaging
- **Tracking**: Track scan counts for analytics

### Components
- `EventQRCode.tsx` - QR code generator with download/share
- Database tables: `event_qr_codes`

### Benefits
- **Instant Join**: No typing event codes
- **Higher Participation**: Reduces friction for joining
- **Analytics**: Track how many people scanned vs joined

---

## 5. Enhanced Analytics & Projector

### Features
- **Engagement Heatmap**: Timeline showing when questions peak (by hour)
- **Trending Questions Widget**: Real-time display of top trending questions
- **Sentiment Visualization**: Live sentiment meter on projector
- **Demographics**: Track participant backgrounds and engagement by segment

### Components
- `EngagementHeatmap.tsx` - Hour-by-hour engagement visualization
- `TrendingWidget.tsx` - Floating widget showing trending questions
- Enhanced projector view with multiple data streams

### Display Options
- Full-screen leaderboard
- Leaderboard + sentiment side-by-side
- Trending questions carousel
- Word cloud + sentiment combined

### Use Cases
- **Conferences**: See real-time audience engagement levels
- **Live Events**: Identify when audience interest peaks
- **Communities**: Understand which topics generate most engagement

---

## 6. Advanced Analytics & Reports

### Features
- **Event Summary**: Total engagement, sentiment, participation metrics
- **Question Analytics**: Performance of each question
- **Export Options**: CSV, JSON, PDF reports
- **Audience Insights**: Word clouds, topic extraction, sentiment trends

### Metrics Tracked
- Total participants
- Questions asked/answered
- Average sentiment
- Peak activity times
- Engagement score (0-100)
- Badge distributions

### Future: Scheduled Reports
- Email weekly/monthly summaries
- Comparison across events
- Trend analysis

---

## 7. Data Structures

### New Database Tables

#### user_engagement_points
```sql
- id (UUID)
- event_id (UUID)
- user_id (UUID)
- total_points (INT)
- questions_asked (INT)
- questions_upvoted (INT)
- questions_answered (INT)
- streak_days (INT)
- last_activity_date (TIMESTAMP)
```

#### user_badges
```sql
- id (UUID)
- user_id (UUID)
- badge_type (VARCHAR)
- event_id (UUID)
- earned_at (TIMESTAMP)
```

#### advanced_polls
```sql
- id (UUID)
- event_id (UUID)
- poll_type (VARCHAR) - 'ranking', 'matrix', 'scale', 'image_choice', 'multiple_choice'
- title (VARCHAR)
- description (TEXT)
- is_active (BOOLEAN)
- show_results (BOOLEAN)
```

#### poll_options & poll_responses
- Track individual poll options and responses
- Support for complex response types (rankings, matrix selections)

#### question_sentiment
```sql
- question_id (UUID)
- sentiment_score (FLOAT) - -1 to 1
- sentiment_label (VARCHAR) - 'negative', 'neutral', 'positive'
- key_topics (TEXT[])
- quality_score (FLOAT) - 0 to 1
```

#### event_engagement_metrics
```sql
- event_id (UUID)
- total_participants (INT)
- total_questions (INT)
- total_votes (INT)
- avg_sentiment_score (FLOAT)
- peak_activity_time (TIMESTAMP)
- engagement_score (FLOAT) - 0 to 100
```

#### event_qr_codes
```sql
- event_id (UUID)
- qr_code_url (VARCHAR)
- join_url (VARCHAR)
- scans_count (INT)
```

---

## 8. Implementation Roadmap

### Phase 1: MVP (Complete)
- [x] Database schema
- [x] Advanced polls (multiple types)
- [x] Basic leaderboard
- [x] Badge system
- [x] Sentiment analysis
- [x] QR code generation

### Phase 2: Polish & Integration
- [ ] Real-time leaderboard updates (WebSocket)
- [ ] Enhanced projector views (theme system)
- [ ] Mobile optimization
- [ ] Analytics dashboard redesign
- [ ] Report generation & export

### Phase 3: Advanced Features
- [ ] Groq API integration for advanced NLP
- [ ] Scheduled email reports
- [ ] Team/breakout features
- [ ] Spam detection & filtering
- [ ] Multi-language support

---

## 9. Competitive Advantages vs Slido

| Feature | ASKTC | Slido |
|---------|-------|-------|
| **Advanced Polls** | Ranking, Matrix, Scale, Image | Limited |
| **Leaderboard** | Full gamification + badges | No |
| **Voice Questions** | Yes | No |
| **Sentiment Analysis** | Yes, real-time | No |
| **QR Code Join** | Yes | Manual entry |
| **Custom Branding** | Full theming | Basic |
| **Price** | $9-29/mo | $50+/mo |
| **Engagement Metrics** | Detailed + heatmap | Basic |
| **Community Focus** | Optimized for churches | Not focused |

---

## 10. Usage Examples

### For Conference Organizers
1. Create ranking poll: "Rank these keynote topics by interest"
2. Monitor sentiment: See if audience is engaged (positive) or confused (negative)
3. Check leaderboard: Identify most active participants
4. Export report: Share analytics with stakeholders

### For Church Communities
1. Share QR code on projector
2. Live poll: "How clear was today's message? (1-5 scale)"
3. Leaderboard builds community: "Top contributors this month"
4. Sentiment helps leaders: Gauge congregation responses
5. Badges reward consistency: "30-day streak!" badges

### For Training Events
1. Quick quiz polls between sessions
2. Track individual engagement via leaderboard
3. Identify difficult topics (negative sentiment on specific questions)
4. Export report for training evaluation

---

## 11. API Endpoints

### Sentiment Analysis
- `POST /api/sentiment/analyze` - Analyze question text for sentiment, topics, quality

### Analytics
- `GET /api/analytics/event/{eventId}` - Get event metrics
- `GET /api/analytics/questions/{eventId}` - Get question analytics
- `GET /api/leaderboard/{eventId}` - Get event leaderboard

### Polls
- `POST /api/polls/create` - Create advanced poll
- `POST /api/polls/{pollId}/respond` - Submit poll response
- `GET /api/polls/{eventId}` - Get event polls

---

## 12. Future Enhancements

- Real-time WebSocket updates for leaderboard
- Advanced ML-based sentiment analysis via Groq
- Demographic segmentation
- A/B testing for questions
- Integration with video conferencing platforms
- Mobile app for deeper engagement
- Team collaboration features
- Scheduled reports and insights

