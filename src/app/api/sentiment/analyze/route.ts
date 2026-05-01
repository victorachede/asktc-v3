import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Simple sentiment analysis without external API
// For production, integrate with Groq or other LLM API
function analyzeSentiment(text: string): { score: number; label: 'negative' | 'neutral' | 'positive' } {
  const positiveWords = [
    'great',
    'excellent',
    'amazing',
    'good',
    'awesome',
    'love',
    'fantastic',
    'wonderful',
    'perfect',
    'best',
    'brilliant',
    'outstanding',
    'inspiring',
    'helpful',
    'insightful',
    'impressed',
    'delighted',
    'thrilled',
  ]
  const negativeWords = [
    'bad',
    'terrible',
    'awful',
    'hate',
    'disappointing',
    'useless',
    'waste',
    'poor',
    'frustrating',
    'confused',
    'lost',
    'wrong',
    'boring',
    'difficult',
    'unclear',
    'missing',
    'broken',
    'fail',
  ]

  const lowercaseText = text.toLowerCase()
  let positiveCount = 0
  let negativeCount = 0

  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const matches = lowercaseText.match(regex)
    if (matches) positiveCount += matches.length
  })

  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const matches = lowercaseText.match(regex)
    if (matches) negativeCount += matches.length
  })

  let score = 0
  if (positiveCount + negativeCount > 0) {
    score = (positiveCount - negativeCount) / (positiveCount + negativeCount)
  }

  const label = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral'

  return { score: Math.max(-1, Math.min(1, score)), label }
}

function extractTopics(text: string): string[] {
  // Simple topic extraction - in production use NER or LLM
  const commonWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'is',
    'was',
    'are',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'to',
    'of',
    'in',
    'on',
    'at',
    'from',
    'for',
    'with',
    'by',
    'about',
    'as',
    'into',
    'through',
  ])

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !commonWords.has(w))

  // Get most frequent words as topics
  const frequency: Record<string, number> = {}
  words.forEach(w => {
    frequency[w] = (frequency[w] || 0) + 1
  })

  return Object.entries(frequency)
    .filter(([, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
}

export async function POST(req: NextRequest) {
  try {
    const { questionId, text, eventId } = await req.json()

    if (!questionId || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const sentiment = analyzeSentiment(text)
    const topics = extractTopics(text)

    // Calculate quality score (based on length, word variety, punctuation)
    const wordCount = text.split(/\s+/).length
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size
    const hasPunctuation = /[!?.;:]/.test(text)
    const isCapitalized = /^[A-Z]/.test(text)

    let qualityScore = 0.3
    qualityScore += Math.min(0.3, wordCount / 50) // Up to 0.3 for length
    qualityScore += Math.min(0.2, uniqueWords / wordCount) * 0.2 // Diversity
    if (hasPunctuation) qualityScore += 0.1
    if (isCapitalized) qualityScore += 0.1

    const supabase = await createClient()

    // Store sentiment analysis
    const { error } = await supabase.from('question_sentiment').upsert(
      [
        {
          question_id: questionId,
          sentiment_score: sentiment.score,
          sentiment_label: sentiment.label,
          key_topics: topics,
          quality_score: Math.min(1, qualityScore),
        },
      ],
      { onConflict: 'question_id' }
    )

    if (error) throw error

    // Update event metrics
    if (eventId) {
      const { data: metrics } = await supabase
        .from('event_engagement_metrics')
        .select('total_questions, avg_sentiment_score')
        .eq('event_id', eventId)
        .single()

      if (metrics) {
        const newAvg =
          (metrics.avg_sentiment_score * (metrics.total_questions - 1) + sentiment.score) /
          metrics.total_questions

        await supabase
          .from('event_engagement_metrics')
          .update({ avg_sentiment_score: newAvg })
          .eq('event_id', eventId)
      }
    }

    return NextResponse.json({
      sentiment: sentiment.label,
      score: sentiment.score,
      topics,
      quality: Math.min(1, qualityScore),
    })
  } catch (err) {
    console.error('Sentiment analysis error:', err)
    return NextResponse.json(
      { error: 'Sentiment analysis failed' },
      { status: 500 }
    )
  }
}
