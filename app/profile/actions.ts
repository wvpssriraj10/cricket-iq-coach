'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function searchPlayers(query: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('players')
    .select('id, name, batting_arm, bowling_arm')
    .ilike('name', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching players:', error)
    return []
  }

  return data
}

export async function linkPlayerProfile(playerId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ player_id: playerId })
    .eq('id', user.id)

  if (error) {
    console.error('Error linking profile:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath('/')
  return { success: true }
}

export async function getPlayerAggregateStats(playerId: string) {
  const supabase = await createClient()
  
  const { data: performances, error } = await supabase
    .from('match_performances')
    .select('runs_scored, balls_faced, fours, sixes, wickets, overs_bowled, runs_conceded, maidens')
    .eq('player_id', playerId)

  if (error || !performances || performances.length === 0) {
    return { matches: 0, runs: 0, wickets: 0, average: '0.00', strikeRate: '0.00', economy: '0.00', highestScore: 0 }
  }

  let totalRuns = 0
  let totalBalls = 0
  let totalFours = 0
  let totalSixes = 0
  let highestScore = 0
  let totalWickets = 0
  let totalRunsConceded = 0
  let totalOversBowled = 0
  let totalMaidens = 0

  performances.forEach(p => {
    totalRuns += p.runs_scored || 0
    totalBalls += p.balls_faced || 0
    totalFours += p.fours || 0
    totalSixes += p.sixes || 0
    totalWickets += p.wickets || 0
    totalRunsConceded += p.runs_conceded || 0
    totalOversBowled += Number(p.overs_bowled || 0)
    totalMaidens += p.maidens || 0
    if ((p.runs_scored || 0) > highestScore) highestScore = p.runs_scored || 0
  })
  
  // Note: For batting average, we need outs. If we assume they get out every innings (simplification):
  const average = performances.length > 0 ? (totalRuns / performances.length).toFixed(2) : '0.00'
  const strikeRate = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(2) : '0.00'
  const economy = totalOversBowled > 0 ? (totalRunsConceded / totalOversBowled).toFixed(2) : '0.00'

  return {
    matches: performances.length,
    runs: totalRuns,
    wickets: totalWickets,
    highestScore,
    average,
    strikeRate,
    economy,
    totalFours,
    totalSixes,
    totalBalls,
    totalOversBowled,
    totalRunsConceded,
    totalMaidens
  }
}

export async function getPlayerMatches(playerId: string) {
  const supabase = await createClient()
  
  // In Supabase, to join matches, we query match_performances and join matches
  const { data, error } = await supabase
    .from('match_performances')
    .select(`
      id,
      runs_scored,
      balls_faced,
      wickets,
      overs_bowled,
      runs_conceded,
      matches:match_id (
        id,
        opponent,
        date,
        venue,
        result
      )
    `)
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching matches:', error)
    return []
  }

  // Map data to a flat structure
  return data.map((perf: any) => ({
    id: perf.id,
    matchId: perf.matches.id,
    opponent: perf.matches.opponent,
    date: perf.matches.date,
    venue: perf.matches.venue,
    result: perf.matches.result,
    runs: perf.runs_scored || 0,
    balls: perf.balls_faced || 0,
    wickets: perf.wickets || 0,
    overs: perf.overs_bowled || 0,
    runsConceded: perf.runs_conceded || 0
  }))
}
