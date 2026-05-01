'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Question } from '@/types'
import { TrendingUp, Flame } from 'lucide-react'

interface TrendingWidgetProps {
  eventId: string
  limit?: number
}

export function TrendingWidget({ eventId, limit = 5 }: TrendingWidgetProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTrendingQuestions() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('event_id', eventId)
          .eq('status', 'approved')
          .order('votes', { ascending: false })
          .limit(limit)
        if (error) throw error
        setQuestions(data || [])
      } catch (err) {
        console.error('Failed to load trending questions:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTrendingQuestions()
    const interval = setInterval(loadTrendingQuestions, 30000)
    return () => clearInterval(interval)
  }, [eventId, limit])

  if (loading || questions.length === 0) return null

  return (
    // Moved to bottom-LEFT to avoid overlapping KeyboardShortcuts button (bottom-right)
    <div className="fixed bottom-6 left-6 w-80 max-w-full z-40">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 flex items-center gap-2">
          <Flame className="text-white" size={20} />
          <h3 className="font-bold text-white">Trending Now</h3>
        </div>
        <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
          {questions.map((q) => (
            <div key={q.id} className="p-4 hover:bg-orange-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-orange-600" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{q.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded font-semibold">
                      {q.votes} votes
                    </span>
                    {q.assigned_panelist_id && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded">Assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 px-4 py-3 text-xs text-gray-500 border-t border-gray-200">
          Updates every 30 seconds
        </div>
      </div>
    </div>
  )
}
