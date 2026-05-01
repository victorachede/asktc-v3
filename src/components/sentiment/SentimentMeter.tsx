'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface SentimentStats {
  positive: number
  neutral: number
  negative: number
  average: number
}

interface SentimentMeterProps {
  eventId: string
  size?: 'small' | 'large'
}

export function SentimentMeter({ eventId, size = 'large' }: SentimentMeterProps) {
  const [stats, setStats] = useState<SentimentStats>({ positive: 0, neutral: 0, negative: 0, average: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSentimentStats() {
      try {
        const supabase = createClient()

        // Step 1: get question IDs for this event
        const { data: questions, error: qErr } = await supabase
          .from('questions')
          .select('id')
          .eq('event_id', eventId)

        if (qErr || !questions || questions.length === 0) {
          setLoading(false)
          return
        }

        const questionIds = questions.map(q => q.id)

        // Step 2: get sentiment for those question IDs
        const { data: sentiments, error } = await supabase
          .from('question_sentiment')
          .select('sentiment_label, sentiment_score')
          .in('question_id', questionIds)

        if (error || !sentiments || sentiments.length === 0) {
          setLoading(false)
          return
        }

        const counts = { positive: 0, neutral: 0, negative: 0, total: sentiments.length, sumScore: 0 }

        sentiments.forEach(s => {
          if (s.sentiment_label === 'positive') counts.positive++
          else if (s.sentiment_label === 'negative') counts.negative++
          else counts.neutral++
          counts.sumScore += s.sentiment_score || 0
        })

        setStats({
          positive: (counts.positive / counts.total) * 100,
          neutral: (counts.neutral / counts.total) * 100,
          negative: (counts.negative / counts.total) * 100,
          average: counts.sumScore / counts.total,
        })
      } catch (err) {
        console.error('Failed to load sentiment stats:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSentimentStats()
  }, [eventId])

  if (loading) return <div className="text-sm text-gray-500">Loading sentiment...</div>

  const isPositive = stats.average > 0.2
  const isNegative = stats.average < -0.2

  if (size === 'small') {
    return (
      <div className="flex items-center gap-2">
        {isPositive && <TrendingUp className="text-green-500" size={20} />}
        {isNegative && <TrendingDown className="text-red-500" size={20} />}
        <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
          {stats.positive.toFixed(0)}% positive
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h4 className="font-semibold text-gray-900 mb-4">Audience Sentiment</h4>
      <div className="space-y-3 mb-6">
        {[
          { label: 'Positive', value: stats.positive, color: 'bg-green-500', textColor: 'text-green-600' },
          { label: 'Neutral', value: stats.neutral, color: 'bg-gray-400', textColor: 'text-gray-600' },
          { label: 'Negative', value: stats.negative, color: 'bg-red-500', textColor: 'text-red-600' },
        ].map(row => (
          <div key={row.label}>
            <div className="flex justify-between mb-1 text-sm">
              <span className={`font-medium ${row.textColor}`}>{row.label}</span>
              <span className="font-semibold">{row.value.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${row.color} transition-all duration-700`} style={{ width: `${row.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
        <p className="text-xs text-gray-600 mb-1">Overall Sentiment</p>
        <p className={`text-3xl font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
          {stats.average.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500 mt-1">Range: -1 (very negative) to +1 (very positive)</p>
      </div>
    </div>
  )
}
