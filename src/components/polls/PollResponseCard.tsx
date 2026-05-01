'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdvancedPoll, AdvancedPollType } from '@/types'
import { getVoterFingerprint } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'

interface PollResponseCardProps {
  poll: AdvancedPoll & { options: Array<{ id: string; option_text: string; image_url?: string; vote_count: number }> }
  onResponded?: () => void
}

export function PollResponseCard({ poll, onResponded }: PollResponseCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [scaleValue, setScaleValue] = useState<number>(3)
  const [ranking, setRanking] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Initialize based on poll type
    if (poll.poll_type === 'ranking') {
      setRanking(poll.options?.map((_, i) => i) || [])
    }
  }, [poll])

  const handleSubmitResponse = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const fingerprint = getVoterFingerprint()

      let responseData: Record<string, any> = {}

      if (poll.poll_type === 'multiple_choice' || poll.poll_type === 'image_choice') {
        responseData = { selected_indices: selectedOptions }
      } else if (poll.poll_type === 'scale') {
        responseData = { value: scaleValue }
      } else if (poll.poll_type === 'ranking') {
        responseData = { ranking_order: ranking }
      } else if (poll.poll_type === 'matrix') {
        responseData = { selections: selectedOptions }
      }

      const { error } = await supabase.from('poll_responses').insert([
        {
          poll_id: poll.id,
          user_fingerprint: fingerprint,
          response_data: responseData,
          sentiment_score: null,
        },
      ])

      if (error) throw error
      setSubmitted(true)
      onResponded?.()
    } catch (err) {
      console.error('Failed to submit response:', err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
        <CheckCircle className="mx-auto mb-3 text-green-500" size={40} />
        <p className="text-green-700 font-medium">Thanks for your response!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.title}</h3>
      {poll.description && <p className="text-sm text-gray-600 mb-4">{poll.description}</p>}

      <div className="my-4">
        {poll.poll_type === 'multiple_choice' || poll.poll_type === 'image_choice' ? (
          <div className="space-y-2">
            {poll.options?.map((option, idx) => (
              <button
                key={option.id}
                onClick={() =>
                  setSelectedOptions(sel =>
                    sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]
                  )
                }
                className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                  selectedOptions.includes(idx)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {poll.poll_type === 'image_choice' && option.image_url && (
                  <img src={option.image_url} alt={option.option_text} className="w-full h-32 object-cover rounded mb-2" />
                )}
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 ${selectedOptions.includes(idx) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`} />
                  <span>{option.option_text}</span>
                </div>
              </button>
            ))}
          </div>
        ) : poll.poll_type === 'scale' ? (
          <div className="py-4">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  onClick={() => setScaleValue(v)}
                  className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                    scaleValue === v ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Disagree</span>
              <span>Neutral</span>
              <span>Agree</span>
            </div>
          </div>
        ) : poll.poll_type === 'ranking' ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-3">Drag to rank (1 = highest)</p>
            {ranking.map((optionIdx, position) => (
              <div key={position} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="font-bold text-blue-600 w-6">{position + 1}</span>
                <span className="text-gray-700">{poll.options?.[optionIdx]?.option_text}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <button
        onClick={handleSubmitResponse}
        disabled={loading || (selectedOptions.length === 0 && poll.poll_type !== 'scale' && poll.poll_type !== 'ranking')}
        className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Response'}
      </button>
    </div>
  )
}
