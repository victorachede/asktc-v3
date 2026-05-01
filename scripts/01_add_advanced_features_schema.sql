-- Add advanced features schema for Slido-killer features
-- This adds: leaderboards, badges, advanced polls, sentiment analysis, engagement tracking

-- 1. Leaderboard & Engagement Points table
CREATE TABLE IF NOT EXISTS user_engagement_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_points INT DEFAULT 0,
  questions_asked INT DEFAULT 0,
  questions_upvoted INT DEFAULT 0,
  questions_answered INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_activity_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 2. Badges & Achievements
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type VARCHAR(50) NOT NULL, -- 'first_question', 'top_asker', 'trending', 'helper', 'streak_7', 'streak_30', etc.
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Advanced Poll Types
CREATE TABLE IF NOT EXISTS advanced_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  poll_type VARCHAR(50) NOT NULL, -- 'ranking', 'matrix', 'scale', 'image_choice', 'multiple_choice'
  title VARCHAR(500) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  show_results BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Poll options (for advanced polls)
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES advanced_polls(id) ON DELETE CASCADE NOT NULL,
  option_text VARCHAR(500) NOT NULL,
  option_order INT,
  image_url VARCHAR(500),
  vote_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Poll responses (rankings, matrix responses, scale votes)
CREATE TABLE IF NOT EXISTS poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES advanced_polls(id) ON DELETE CASCADE NOT NULL,
  user_fingerprint VARCHAR(255) NOT NULL,
  response_data JSONB NOT NULL, -- For storing ranking arrays, matrix selections, scale values, image selections
  sentiment_score FLOAT, -- -1 to 1, calculated from response
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Question Sentiment & Quality
CREATE TABLE IF NOT EXISTS question_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  sentiment_score FLOAT NOT NULL, -- -1 (negative) to 1 (positive)
  sentiment_label VARCHAR(20), -- 'negative', 'neutral', 'positive'
  key_topics TEXT[], -- Extracted topics from question
  quality_score FLOAT DEFAULT 0.5, -- 0 to 1, based on length, clarity, grammar
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(question_id)
);

-- 7. Engagement Metrics (for analytics)
CREATE TABLE IF NOT EXISTS event_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  total_participants INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  total_votes INT DEFAULT 0,
  avg_sentiment_score FLOAT DEFAULT 0,
  peak_activity_time TIMESTAMP,
  engagement_score FLOAT DEFAULT 0, -- Overall health score 0-100
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id)
);

-- 8. QR Code & Event Access
CREATE TABLE IF NOT EXISTS event_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  qr_code_url VARCHAR(500) NOT NULL,
  join_url VARCHAR(500) NOT NULL,
  scans_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_engagement_event_id ON user_engagement_points(event_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_event_id ON user_badges(event_id);
CREATE INDEX IF NOT EXISTS idx_advanced_polls_event_id ON advanced_polls(event_id);
CREATE INDEX IF NOT EXISTS idx_poll_responses_poll_id ON poll_responses(poll_id);
CREATE INDEX IF NOT EXISTS idx_question_sentiment_question_id ON question_sentiment(question_id);
CREATE INDEX IF NOT EXISTS idx_event_engagement_metrics_event_id ON event_engagement_metrics(event_id);

-- Enable RLS (Row Level Security) on all tables
ALTER TABLE user_engagement_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE advanced_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access to engagement data for events
CREATE POLICY "Allow read event engagement" ON user_engagement_points
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow read badges" ON user_badges
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow read advanced polls" ON advanced_polls
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow read poll options" ON poll_options
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow read poll responses" ON poll_responses
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow read question sentiment" ON question_sentiment
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow read engagement metrics" ON event_engagement_metrics
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow read event qr codes" ON event_qr_codes
  FOR SELECT USING (TRUE);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert poll response" ON poll_responses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update engagement points (service role only, will be called via API)
CREATE POLICY "Allow update engagement points" ON user_engagement_points
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow insert engagement points" ON user_engagement_points
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Allow service role to insert sentiment data (called from API route)
CREATE POLICY "Allow insert question sentiment" ON question_sentiment
  FOR INSERT WITH CHECK (TRUE);

-- Allow anonymous users to submit poll responses  
CREATE POLICY "Allow anon insert poll response" ON poll_responses
  FOR INSERT WITH CHECK (TRUE);

-- Allow anyone to insert engagement points (service role manages upserts)
CREATE POLICY "Allow read own engagement" ON user_engagement_points
  FOR SELECT USING (TRUE);
