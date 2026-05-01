import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { customAlphabet } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateEventCode = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  6
)

export function getVoterFingerprint(): string {
  let fp = localStorage.getItem('asktc_fp')
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem('asktc_fp', fp)
  }
  return fp
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

export function isSimilarText(a: string, b: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
  const na = normalize(a)
  const nb = normalize(b)
  if (na === nb) return true
  const wordsA = new Set(na.split(' ').filter(w => w.length > 3))
  const wordsB = nb.split(' ').filter(w => w.length > 3)
  const overlap = wordsB.filter(w => wordsA.has(w)).length
  return overlap >= 3 && overlap / Math.max(wordsA.size, wordsB.length) > 0.6
}
