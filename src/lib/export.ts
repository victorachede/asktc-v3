import type { Event, Question } from '@/types'

/**
 * Export event questions to CSV format
 */
export function exportQuestionsToCSV(event: Event, questions: Question[]): void {
  if (questions.length === 0) return

  const headers = ['Question', 'Asked By', 'Votes', 'Status', 'Source', 'Email', 'Submitted At']
  const rows = questions.map((q) => [
    `"${q.content.replace(/"/g, '""')}"`,
    `"${(q.asked_by || 'Anonymous').replace(/"/g, '""')}"`,
    q.votes,
    q.status,
    q.source,
    q.email || '',
    new Date(q.created_at).toLocaleString(),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${event.title.replace(/\s+/g, '_')}_${event.event_code}_questions_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

/**
 * Export event questions to JSON format
 */
export function exportQuestionsToJSON(event: Event, questions: Question[]): void {
  if (questions.length === 0) return

  const data = {
    event: {
      id: event.id,
      title: event.title,
      description: event.description,
      eventCode: event.event_code,
      status: event.status,
      createdAt: event.created_at,
    },
    questions,
    exportedAt: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${event.title.replace(/\s+/g, '_')}_${event.event_code}_questions_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

/**
 * Export event statistics as a text report
 */
export function exportEventStats(event: Event, questions: Question[]): void {
  const totalQuestions = questions.length
  const voiceCount = questions.filter(q => q.source === 'voice').length
  const textCount = questions.filter(q => q.source === 'text').length
  const totalVotes = questions.reduce((sum, q) => sum + (q.votes || 0), 0)
  const answeredCount = questions.filter(q => q.status === 'answered').length
  const pendingCount = questions.filter(q => q.status === 'pending').length
  const approvedCount = questions.filter(q => q.status === 'approved').length

  const report = `
EVENT REPORT
============
Title: ${event.title}
Code: ${event.event_code}
Status: ${event.status}
Date: ${new Date(event.created_at).toLocaleString()}

STATISTICS
==========
Total Questions: ${totalQuestions}
Total Votes: ${totalVotes}
Average Votes per Question: ${totalQuestions > 0 ? (totalVotes / totalQuestions).toFixed(2) : 0}

QUESTION BREAKDOWN
==================
Text Submissions: ${textCount}
Voice Submissions: ${voiceCount}

STATUS BREAKDOWN
================
Pending: ${pendingCount}
Approved: ${approvedCount}
Answered: ${answeredCount}

TOP QUESTIONS
=============
${questions
  .sort((a, b) => b.votes - a.votes)
  .slice(0, 5)
  .map((q, i) => `${i + 1}. "${q.content}" (${q.votes} votes)`)
  .join('\n')}

Report generated: ${new Date().toISOString()}
  `.trim()

  const blob = new Blob([report], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${event.title.replace(/\s+/g, '_')}_${event.event_code}_report_${new Date().toISOString().split('T')[0]}.txt`
  link.click()
  URL.revokeObjectURL(link.href)
}