import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type Lead } from '@/contexts/LeadsContext'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateLeadScore(lead: Lead): number {
  let score = 40
  if (lead.value && lead.value > 10000) score += 20
  if (
    lead.status === 'Proposta' ||
    lead.status === 'Qualificado' ||
    lead.status === 'Ganho'
  ) {
    score += 30
  }

  if (lead.updatedAt) {
    const hoursSinceUpdate =
      (new Date().getTime() - new Date(lead.updatedAt).getTime()) /
      (1000 * 60 * 60)
    if (hoursSinceUpdate <= 48) {
      score += 10
    }
  }

  return Math.min(score, 100)
}
