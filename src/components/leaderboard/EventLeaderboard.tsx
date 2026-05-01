'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserEngagementPoints, UserBadge, BadgeType } from '@/types'
import { Medal, Star, Flame, Award } from 'lucide-react'

interface LeaderboardEntry extends UserEngagementPoints {
  username?: string
  badges?: BadgeType[]
}

interface EventLeaderboardProps {
  eventId: string
  limit?: number
  showBadges?: boolean
}

const BADGE_ICONS: Record<BadgeType, { icon: React.ReactNode; color: string; label: string }> = {
  first_question: { icon: <Star size={14} />, color: 'bg-blue-100 text-blue-700', label: 'First Q' },
  top_asker: { icon: <Medal size={14} />, color: 'bg-yellow-100 text-yellow-700', label: 'Top Asker' },
  trending: { icon: <Flame size={14} />, color: 'bg-red-100 text-red-700', label: 'Trending' },
  helper: { icon: <Award size={14} />, color: 'bg-green-100 text-green-700', label: 'Helper' },
  streak_7: { icon: <Flame size={14} />, color: 'bg-orange-100 text-orange-700', label: '7-Day' },
  streak_30: { icon: <Flame size={14} />, color: 'bg-red-100 text-red-700', label: '30-Day' },
  star_striker: { icon: <Star size={14} />, color: 'bg-purple-100 text-purple-700', label: 'Star' },
  most_upvoted: { icon: <Award size={14} />, color: 'bg-indigo-100 text-indigo-700', label: 'Upvoted' },
}

export function EventLeaderboard({ eventId, limit = 10, showBadges = true }: EventLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const supabase = createClient()

        // Get engagement points
        const { data: engagementData, error: engagementError } = await supabase
          .from('user_engagement_points')
          .select('*')
          .eq('event_id', eventId)
          .order('total_points', { ascending: false })
          .limit(limit)

        if (engagementError) throw engagementError

        // Get badges for these users
        const userIds = engagementData?.map(e => e.user_id) || []
        let badgesData: Record<string, BadgeType[]> = {}

        if (userIds.length > 0) {
          const { data: badges, error: badgesError } = await supabase
            .from('user_badges')
            .select('user_id, badge_type')
            .in('user_id', userIds)
            .eq('event_id', eventId)

          if (!badgesError && badges) {
            badgesData = badges.reduce(
              (acc, b) => {
                if (!acc[b.user_id]) acc[b.user_id] = []
                acc[b.user_id].push(b.badge_type as BadgeType)
                return acc
              },
              {} as Record<string, BadgeType[]>
            )
          }
        }

        const leaderboardEntries: LeaderboardEntry[] = engagementData?.map(entry => ({
          ...entry,
          badges: badgesData[entry.user_id] || [],
        })) || []

        setEntries(leaderboardEntries)
      } catch (err) {
        console.error('Failed to load leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [eventId, limit])

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading leaderboard...</div>
  }

  if (entries.length === 0) {
    return <div className="text-center py-8 text-gray-500">No participants yet</div>
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
      </div>

      <div className="divide-y divide-gray-100">
        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
              idx === 0 ? 'bg-yellow-50' : idx === 1 ? 'bg-gray-50' : ''
            }`}
          >
            {/* Rank */}
            <div className="w-8 flex-shrink-0">
              {idx === 0 && <span className="text-2xl">🥇</span>}
              {idx === 1 && <span className="text-2xl">🥈</span>}
              {idx === 2 && <span className="text-2xl">🥉</span>}
              {idx > 2 && <span className="font-bold text-gray-600 text-lg">#{idx + 1}</span>}
            </div>

            {/* Name & Stats */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {entry.username || `User ${entry.user_id.slice(0, 8)}`}
              </p>
              <div className="flex gap-3 text-xs text-gray-600 mt-1">
                <span>{entry.questions_asked} questions asked</span>
                <span>{entry.questions_upvoted} upvoted</span>
              </div>
            </div>

            {/* Badges */}
            {showBadges && entry.badges && entry.badges.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-end max-w-xs">
                {entry.badges.slice(0, 3).map(badge => {
                  const badgeInfo = BADGE_ICONS[badge as BadgeType]
                  return (
                    <div
                      key={badge}
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badgeInfo.color}`}
                      title={badgeInfo.label}
                    >
                      {badgeInfo.icon}
                      <span className="hidden sm:inline">{badgeInfo.label}</span>
                    </div>
                  )
                })}
                {entry.badges.length > 3 && (
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{entry.badges.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Points */}
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-blue-600">{entry.total_points}</p>
              <p className="text-xs text-gray-500">pts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
