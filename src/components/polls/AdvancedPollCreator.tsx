'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdvancedPollType } from '@/types'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'

interface AdvancedPollCreatorProps {
  eventId: string
  onCreated?: (pollId: string) => void
}

export function AdvancedPollCreator({ eventId, onCreated }: AdvancedPollCreatorProps) {
  const [pollType, setPollType] = useState<AdvancedPollType>('multiple_choice')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [images, setImages] = useState<string[]>(['', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pollTypes: { value: AdvancedPollType; label: string; icon: string }[] = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '○' },
    { value: 'ranking', label: 'Ranking', icon: '↕' },
    { value: 'scale', label: 'Scale (1-5)', icon: '◆' },
    { value: 'matrix', label: 'Matrix Grid', icon: '⊞' },
    { value: 'image_choice', label: 'Image Choice', icon: '🖼' },
  ]

  const handleAddOption = () => {
    setOptions([...options, ''])
    if (pollType === 'image_choice') {
      setImages([...images, ''])
    }
  }

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
    if (pollType === 'image_choice') {
      setImages(images.filter((_, i) => i !== index))
    }
  }

  const handleCreatePoll = async () => {
    try {
      setLoading(true)
      setError('')

      if (!title.trim()) {
        setError('Poll title is required')
        return
      }

      if (options.some(o => !o.trim())) {
        setError('All options must be filled')
        return
      }

      const supabase = createClient()

      const { data: poll, error: pollError } = await supabase
        .from('advanced_polls')
        .insert([
          {
            event_id: eventId,
            poll_type: pollType,
            title,
            description: description || null,
            is_active: true,
            show_results: false,
          },
        ])
        .select()
        .single()

      if (pollError) throw pollError

      // Insert options
      const optionsData = options.map((text, idx) => ({
        poll_id: poll.id,
        option_text: text,
        option_order: idx,
        image_url: pollType === 'image_choice' ? images[idx] || null : null,
        vote_count: 0,
      }))

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsData)

      if (optionsError) throw optionsError

      // Reset form
      setTitle('')
      setDescription('')
      setOptions(['', ''])
      setImages(['', ''])

      onCreated?.(poll.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poll')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Advanced Poll</h3>

      <div className="space-y-4">
        {/* Poll Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Poll Type</label>
          <div className="grid grid-cols-2 gap-2">
            {pollTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setPollType(type.value)}
                className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                  pollType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="mr-1">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What is your question?"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{title.length}/500</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add context or instructions..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
            rows={2}
            maxLength={500}
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
          <div className="space-y-2">
            {options.map((option, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={e => {
                    const newOptions = [...options]
                    newOptions[idx] = e.target.value
                    setOptions(newOptions)
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                  maxLength={200}
                />
                {pollType === 'image_choice' && (
                  <input
                    type="text"
                    value={images[idx] || ''}
                    onChange={e => {
                      const newImages = [...images]
                      newImages[idx] = e.target.value
                      setImages(newImages)
                    }}
                    placeholder="Image URL"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                  />
                )}
                {options.length > 2 && (
                  <button
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleAddOption}
            className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Plus size={16} />
            Add Option
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleCreatePoll}
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating Poll...' : 'Create Poll'}
        </button>
      </div>
    </div>
  )
}
