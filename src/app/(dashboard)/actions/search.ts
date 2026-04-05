'use server'

import { searchEverything, SearchResult } from '@/services/search.service'

export async function globalSearchAction(query: string): Promise<SearchResult[]> {
  try {
    return await searchEverything(query)
  } catch (error) {
    console.error('Global search error:', error)
    return []
  }
}
