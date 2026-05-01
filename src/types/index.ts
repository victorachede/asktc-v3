export type Plan = 'free' | 'pro' | 'enterprise'
export type EventStatus = 'waiting' | 'live' | 'ended'
export type QuestionStatus = 'pending' | 'approved' | 'on_screen' | 'answered' | 'rejected'
export type QuestionSource = 'text' | 'voice'
export type PaymentStatus = 'pending' | 'success' | 'failed'
export type BillingCycle = 'monthly' | 'yearly'
export type PollStatus = 'draft' | 'active' | 'closed'
export type AdvancedPollType = 'ranking' | 'matrix' | 'scale' | 'image_choice' | 'multiple_choice'
export type SentimentLabel = 'negative' | 'neutral' | 'positive'
export type BadgeType = 'first_question' | 'top_asker' | 'trending' | 'helper' | 'streak_7' | 'streak_30' | 'star_striker' | 'most_upvoted'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: Plan
  billing_cycle: BillingCycle | null
  status: 'active' | 'expired' | 'cancelled'
  current_period_start: string | null
  current_period_end: string | null
}

export interface Event {
  id: string
  title: string
  description: string | null
  event_code: string
  host_id: string
  status: EventStatus
  force_anonymous: boolean
  active_word_cloud: boolean
  created_at: string
}

export interface EventBranding {
  id?: string
  event_id?: string
  logo_url?: string | null
  org_name?: string | null
  primary_color?: string | null
  secondary_color?: string | null
  font_family?: string | null
  created_at?: string
}
export interface WordCloudEntry {
  id: string
  event_id: string
  word: string
  voter_fingerprint: string
  created_at: string
}

export interface QuizScore {
  id: string
  poll_id: string
  voter_fingerprint: string
  score: number
  answered_at: string
}

export interface Reaction {
  emoji: string
  x: number
  id: string
}

export interface Panelist {
  id: string
  event_id: string
  name: string
  title: string | null
  created_at: string
}

export interface Question {
  id: string
  event_id: string
  content: string
  asked_by: string
  email: string | null
  votes: number
  status: QuestionStatus
  assigned_panelist_id: string | null
  source: QuestionSource
  starred: boolean
  created_at: string
}

export interface Vote {
  id: string
  question_id: string
  voter_fingerprint: string
  created_at: string
}

export interface Poll {
  id: string
  event_id: string
  question: string
  options: string[]
  status: PollStatus
  is_quiz: boolean
  correct_option: number | null
  created_at: string
}

export interface PollVote {
  id: string
  poll_id: string
  option_index: number
  voter_fingerprint: string
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  plan: Plan
  billing_cycle: BillingCycle | null
  status: PaymentStatus
  created_at: string
}

export const PLAN_LIMITS = {
  free: {
    max_events: 1,
    max_questions: 50,
    max_audience: 30,
    voice_questions: false,
    panelists: false,
    watermark: true,
    analytics: false,
    custom_branding: false,
    multi_moderator: false,
    export: false,
  },
  pro: {
    max_events: Infinity,
    max_questions: 200,
    max_audience: 200,
    voice_questions: true,
    panelists: true,
    watermark: false,
    analytics: true,
    custom_branding: false,
    multi_moderator: false,
    export: false,
  },
  enterprise: {
    max_events: Infinity,
    max_questions: Infinity,
    max_audience: Infinity,
    voice_questions: true,
    panelists: true,
    watermark: false,
    analytics: true,
    custom_branding: true,
    multi_moderator: true,
    export: true,
  },
}

export const PLAN_PRICES = {
  pro: { monthly: 9, yearly: 72 },
  enterprise: { monthly: 29, yearly: 232 },
}

// Advanced Features Interfaces
export interface UserEngagementPoints {
  id: string
  event_id: string
  user_id: string
  total_points: number
  questions_asked: number
  questions_upvoted: number
  questions_answered: number
  streak_days: number
  last_activity_date: string
  created_at: string
  updated_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_type: BadgeType
  event_id?: string
  earned_at: string
  created_at: string
}

export interface AdvancedPoll {
  id: string
  event_id: string
  poll_type: AdvancedPollType
  title: string
  description?: string
  is_active: boolean
  show_results: boolean
  created_by?: string
  created_at: string
  updated_at: string
  options?: PollOption[]
}

export interface PollOption {
  id: string
  poll_id: string
  option_text: string
  option_order: number
  image_url?: string
  vote_count: number
  created_at: string
}

export interface PollResponse {
  id: string
  poll_id: string
  user_fingerprint: string
  response_data: Record<string, any>
  sentiment_score?: number
  created_at: string
}

export interface QuestionSentiment {
  id: string
  question_id: string
  sentiment_score: number
  sentiment_label: SentimentLabel
  key_topics: string[]
  quality_score: number
  created_at: string
}

export interface EventEngagementMetrics {
  id: string
  event_id: string
  total_participants: number
  total_questions: number
  total_votes: number
  avg_sentiment_score: number
  peak_activity_time?: string
  engagement_score: number
  created_at: string
  updated_at: string
}

export interface EventQRCodeRecord {
  id: string
  event_id: string
  qr_code_url: string
  join_url: string
  scans_count: number
  created_at: string
}
