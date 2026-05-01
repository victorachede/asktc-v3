'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface HeatmapData {
  hour: number
  count: number
}

interface EngagementHeatmapProps {
  eventId: string
}

export function EngagementHeatmap({ eventId }: EngagementHeatmapProps) {
  const [data, setData] = useState<HeatmapData[]>([])
  const [loading, setLoading] = useState(true)
  const [maxCount, setMaxCount] = useState(0)

  useEffect(() => {
    async function loadEngagementData() {
      try {
        const supabase = createClient()

        // Get questions grouped by hour
        const { data: questions, error } = await supabase
          .from('questions')
          .select('created_at')
          .eq('event_id', eventId)
          .order('created_at', { ascending: true })

        if (error) throw error

        // Group by hour
        const hourMap: Record<number, number> = {}
        const now = new Date()

        questions?.forEach(q => {
          const questionTime = new Date(q.created_at)
          const hour = questionTime.getHours()
          hourMap[hour] = (hourMap[hour] || 0) + 1
        })

        // Create array for all 24 hours
        const heatmapData: HeatmapData[] = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: hourMap[i] || 0,
        }))

        const max = Math.max(...heatmapData.map(d => d.count), 1)
        setMaxCount(max)
        setData(heatmapData)
      } catch (err) {
        console.error('Failed to load engagement data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadEngagementData()
  }, [eventId])

  if (loading) return <div className="text-center py-8 text-gray-500">Loading engagement data...</div>

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4">Engagement Timeline</h3>

      {/* Heatmap */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-1">
          {data.map(item => {
            const intensity = item.count / maxCount
            const bgColor =
              intensity === 0
                ? 'bg-gray-100'
                : intensity < 0.25
                  ? 'bg-blue-100'
                  : intensity < 0.5
                    ? 'bg-blue-300'
                    : intensity < 0.75
                      ? 'bg-blue-500'
                      : 'bg-blue-700'

            return (
              <div
                key={item.hour}
                className={`h-12 rounded-lg ${bgColor} transition-all hover:scale-110 cursor-pointer group relative`}
                title={`${item.hour}:00 - ${item.count} questions`}
              >
                {item.count > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Hour labels */}
        <div className="grid grid-cols-12 gap-1 text-xs text-gray-500">
          {data.map(item => (
            <div key={item.hour} className="text-center">
              {item.hour}h
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-600 mb-2">Peak Activity</p>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded" />
            <span>Quiet</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-300 rounded" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-700 rounded" />
            <span>Peak</span>
          </div>
        </div>
      </div>
    </div>
  )
}
