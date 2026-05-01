'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('https://formspree.io/f/xkoyndqo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, message }),
      })

      if (response.ok) {
        setSubmitted(true)
        setName('')
        setEmail('')
        setCompany('')
        setMessage('')
      }
    } catch (err) {
      console.error('Error submitting form:', err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Message received</h1>
          <p className="text-sm text-gray-500 mb-6">
            Thank you for reaching out. We&apos;ll get back to you within 24 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 h-16 flex items-center">
        <Link href="/upgrade" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
      </nav>

      <div className="max-w-md mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact our team</h1>
        <p className="text-sm text-gray-500 mb-8">
          Have questions about enterprise plans? Fill out the form below and we&apos;ll be in touch.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your company"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your enterprise needs..."
              required
              rows={5}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name || !email || !message}
            className="w-full bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send size={14} /> {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Or email us directly at{' '}
          <a href="mailto:hello@asktc.com" className="text-blue-600 hover:underline">
            hello@asktc.com
          </a>
        </p>
      </div>
    </main>
  )
}
