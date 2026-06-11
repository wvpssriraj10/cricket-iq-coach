import { redirect } from 'next/navigation'
import { getUserProfile } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'
import { ProfileCard } from '@/components/ui/profile-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPlayerAggregateStats, getPlayerMatches } from './actions'
import { PlayerSearchForm } from './player-search-form'
import { AppShell } from '@/components/app-shell'

export default async function ProfilePage(props: { searchParams: Promise<{ id?: string }> }) {
  const searchParams = await props.searchParams;
  const authData = await getUserProfile()
  if (!authData) {
    redirect('/login')
  }

  const { user, profile } = authData
  const supabase = await createClient()

  let playerData = null
  let stats: any = { matches: 0, runs: 0, wickets: 0 }
  let matchHistory: any[] = []

  const targetId = searchParams?.id || profile.player_id;

  if (targetId) {
    // Fetch player data
    const { data: player } = await supabase
      .from('players')
      .select('*')
      .eq('id', targetId)
      .single()
      
    if (player) {
      playerData = player
      stats = await getPlayerAggregateStats(targetId)
      matchHistory = await getPlayerMatches(targetId)
    }
  }

  const isOwnProfile = targetId === profile.player_id;

  return (
    <AppShell title={isOwnProfile ? "My Profile" : (playerData ? `${playerData.name}'s Profile` : "Profile")} subtitle={isOwnProfile ? "Manage your player profile and stats" : "View player stats and history"}>
      <div className="container max-w-5xl mx-auto py-8">
        {!targetId || !playerData ? (
          <div className="max-w-xl mx-auto mt-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-heading)]">Profile Not Found</h2>
            <p className="text-[var(--color-text-secondary)] mb-8">
              {isOwnProfile ? "It looks like you haven't linked your player profile yet. Search for your name in the team database to claim your profile and see your stats!" : "The requested player profile could not be found."}
            </p>
            <PlayerSearchForm />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ProfileCard
              name={playerData.name}
              battingStyle={playerData.batting_arm || 'LHB'}
              bowlingStyle={playerData.bowling_arm || 'Left-arm medium'}
              matches={stats.matches}
              runs={stats.runs}
              wickets={stats.wickets}
            />

            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="stats" className="w-full">
                <TabsList className="w-full grid grid-cols-2 max-w-md mx-auto mb-8 bg-[#1a1f24] p-1 rounded-xl shadow-sm border border-[var(--color-border)]">
                  <TabsTrigger value="matches" className="rounded-lg text-white/60 hover:text-white data-[state=active]:bg-[#2a3038] data-[state=active]:text-red-500 data-[state=active]:shadow transition-colors">Matches</TabsTrigger>
                  <TabsTrigger value="stats" className="rounded-lg text-white/60 hover:text-white data-[state=active]:bg-[#2a3038] data-[state=active]:text-red-500 data-[state=active]:shadow transition-colors">Stats</TabsTrigger>
                </TabsList>
                
                <TabsContent value="stats" className="bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Batting Stats */}
                    <div className="bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full pointer-events-none"></div>
                      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Batting Career</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:gap-5">
                        <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Matches</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stats.matches}</p>
                        </div>
                        <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Runs</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stats.runs}</p>
                        </div>
                        <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Highest Score</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stats.highestScore}</p>
                        </div>
                        <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Average</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stats.average}</p>
                        </div>
                        <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Strike Rate</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stats.strikeRate}</p>
                        </div>
                        <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Boundaries</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stats.totalFours} <span className="text-lg text-slate-400 font-semibold">/</span> {stats.totalSixes}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bowling Stats */}
                    <div className="bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>
                      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bowling Career</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:gap-5">
                        <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Matches</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stats.matches}</p>
                        </div>
                        <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Wickets</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stats.wickets}</p>
                        </div>
                        <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Overs</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stats.totalOversBowled}</p>
                        </div>
                        <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Runs</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stats.totalRunsConceded}</p>
                        </div>
                        <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Economy</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stats.economy}</p>
                        </div>
                        <div className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Maidens</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stats.totalMaidens}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="matches" className="bg-transparent border-none p-0 flex flex-col gap-4">
                  {matchHistory.length === 0 ? (
                    <div className="bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                      <p className="text-[var(--color-text-secondary)] mb-2">No matches found for this player.</p>
                      <p className="text-sm text-[var(--color-text-tertiary)]">Upload a scorecard to see match history.</p>
                    </div>
                  ) : (
                    matchHistory.map((match) => (
                      <div key={match.id} className="bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[var(--color-border)] pb-4 mb-4">
                          <div>
                            <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded uppercase tracking-wider">
                              {match.result || 'Match'}
                            </span>
                            <h4 className="font-bold text-lg mt-2">vs {match.opponent || 'Unknown Opponent'}</h4>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {match.date ? new Date(match.date).toLocaleDateString() : 'Unknown Date'} • {match.venue || 'Unknown Venue'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-8">
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Batting</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {match.runs > 0 || match.balls > 0 ? `${match.runs} (${match.balls})` : 'DNB'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Bowling</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {match.overs > 0 ? `${match.wickets}/${match.runsConceded} (${match.overs} ov)` : 'DNB'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="awards" className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 min-h-[300px] shadow-sm flex items-center justify-center">
                  <p className="text-[var(--color-text-secondary)]">Awards and badges coming soon.</p>
                </TabsContent>

                <TabsContent value="teams" className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 min-h-[300px] shadow-sm flex items-center justify-center">
                  <p className="text-[var(--color-text-secondary)]">Team memberships coming soon.</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
