'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, Loader2, User, Building2, Briefcase, Command } from 'lucide-react'
import { globalSearchAction } from '@/app/(dashboard)/actions/search'
import type { SearchResult } from '@/services/search.service'
import { useDebounce } from 'use-debounce'
import { cn } from '@/lib/utils'

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cmd+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const [debouncedQuery] = useDebounce(query, 300)

  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.length >= 2) {
        setLoading(true)
        const res = await globalSearchAction(debouncedQuery)
        setResults(res)
        setLoading(false)
        setIsOpen(true)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }
    performSearch()
  }, [debouncedQuery])

  const handleSelect = (href: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(href)
  }

  return (
    <div className="relative w-full max-w-sm hidden md:block" ref={containerRef}>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Quick search... (⌘K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-9 pr-12 h-9 bg-muted/60 border-transparent focus:bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-md"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground/50 pointer-events-none select-none">
          <Command className="h-3 w-3" />
          <span>K</span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[350px] overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center p-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching records...
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result.href)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      result.type === 'client' && "bg-blue-50 text-blue-600",
                      result.type === 'vendor' && "bg-orange-50 text-orange-600",
                      result.type === 'deal' && "bg-emerald-50 text-emerald-600"
                    )}>
                      {result.type === 'client' && <User className="h-4 w-4" />}
                      {result.type === 'vendor' && <Building2 className="h-4 w-4" />}
                      {result.type === 'deal' && <Briefcase className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate uppercase tracking-tight">
                        {result.title}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                        <span className="opacity-70">{result.type}</span>
                        {result.subtitle && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="truncate">{result.subtitle}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No matching results found.
              </div>
            )}
          </div>
          <div className="p-2 border-t bg-slate-50/50 flex justify-end">
            <p className="text-[10px] text-slate-400 font-medium">PRESS ESC TO CLOSE</p>
          </div>
        </div>
      )}
    </div>
  )
}
