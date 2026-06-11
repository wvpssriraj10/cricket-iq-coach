'use client'

import { useState, useTransition } from 'react'
import { Search, Loader2, CheckCircle2 } from 'lucide-react'
import { searchPlayers, linkPlayerProfile } from './actions'

type Player = {
  id: string
  name: string
  batting_arm: string | null
  bowling_arm: string | null
}

export function PlayerSearchForm() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Player[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setIsSearching(true)
    setError('')
    try {
      const players = await searchPlayers(query)
      setResults(players)
      if (players.length === 0) {
        setError('No players found matching that name.')
      }
    } catch (err) {
      setError('An error occurred while searching.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleClaim = (playerId: string) => {
    startTransition(async () => {
      const result = await linkPlayerProfile(playerId)
      if (!result.success) {
        setError(result.error || 'Failed to claim profile')
      }
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your full name as it appears on scorecards..."
            className="w-full bg-[var(--color-bg)] text-[var(--color-text-primary)] border-2 border-[var(--color-border)] rounded-xl py-3 pl-10 pr-4 outline-none focus:border-red-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
          Search
        </button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="font-semibold text-[var(--color-heading)] mb-4">Select your profile:</h3>
          {results.map(player => (
            <div key={player.id} className="flex items-center justify-between p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl hover:border-red-500/50 transition-colors">
              <div>
                <p className="font-bold text-[var(--color-heading)] text-lg">{player.name}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {player.batting_arm || 'Unknown Batting'} • {player.bowling_arm || 'Unknown Bowling'}
                </p>
              </div>
              <button
                onClick={() => handleClaim(player.id)}
                disabled={isPending}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[var(--color-text-primary)] px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Claim Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
