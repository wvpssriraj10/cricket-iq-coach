"use strict";
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Match, MatchPerformance, Player } from "@/lib/db";

// Helper to calculate strike rate
const calculateStrikeRate = (runs: number, balls: number) => {
    if (balls === 0) return 0;
    return ((runs / balls) * 100).toFixed(1);
}

// Helper to calculate economy rate
const calculateEconomy = (runs: number, overs: number) => {
    if (overs === 0) return 0;
    const overPart = Math.floor(overs);
    const ballPart = (overs - overPart) * 10;
    const totalOvers = overPart + (ballPart / 6);
    return (runs / totalOvers).toFixed(1);
}

type PlayerPerformanceRow = Player & {
    performance?: MatchPerformance;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    wickets: number;
    overs: number;
    runs_conceded: number;
    maidens: number;
    catches: number;
    stumpings: number;
    is_playing: boolean;
};

export default function MatchDetailsPage({ params }: { params: Promise<{ id: string; matchId: string }> }) {
    const { id: teamId, matchId } = use(params);
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);
    const [players, setPlayers] = useState<PlayerPerformanceRow[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch Match Details
                const matchRes = await fetch(`/api/matches/${matchId}`);
                if (!matchRes.ok) throw new Error("Failed to fetch match");
                const matchData = await matchRes.json();
                setMatch(matchData);

                // 2. Fetch Team Squad (via Team API)
                const teamRes = await fetch(`/api/teams/${teamId}`);
                if (!teamRes.ok) throw new Error("Failed to fetch team");
                const teamData = await teamRes.json();
                const squadData = teamData.squad;

                // 3. Fetch Existing Performances
                const perfRes = await fetch(`/api/matches/${matchId}/performances`);
                if (!perfRes.ok) throw new Error("Failed to fetch performances");
                const perfData = await perfRes.json();

                // 4. Merge Data
                const mergedPlayers: PlayerPerformanceRow[] = (squadData || []).map((p: Player) => {
                    const perf = (perfData as MatchPerformance[])?.find((perf: MatchPerformance) => perf.player_id === p.id);
                    return {
                        ...p,
                        performance: perf,
                        runs: perf?.runs_scored || 0,
                        balls: perf?.balls_faced || 0,
                        fours: perf?.fours || 0,
                        sixes: perf?.sixes || 0,
                        wickets: perf?.wickets || 0,
                        overs: perf?.overs_bowled || 0,
                        runs_conceded: perf?.runs_conceded || 0,
                        maidens: perf?.maidens || 0,
                        catches: perf?.catches || 0,
                        stumpings: perf?.stumpings || 0,
                        is_playing: !!perf
                    };
                });

                setPlayers(mergedPlayers);

            } catch (error) {
                console.error("Error loading match data:", error);
                toast.error("Failed to load match data");
            } finally {
                setLoading(false);
            }
        };

        if (teamId && matchId) {
            loadData();
        }
    }, [teamId, matchId]);

    if (loading) {
        return (
            <AppShell title="Loading Match..." subtitle="">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppShell>
        );
    }

    if (!match) {
        return (
            <AppShell title="Match Not Found" subtitle="">
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-muted-foreground">This match does not exist.</p>
                    <Link href={`/teams/${teamId}`}>
                        <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Team</Button>
                    </Link>
                </div>
            </AppShell>
        );
    }

    const playingXI = players.filter(p => p.is_playing);
    
    // Sort batters by balls faced descending as a rough proxy for batting order, 
    // unless they have runs. Wait, we can't perfectly recover order. 
    // We just show who batted.
    const batters = playingXI.filter(p => p.balls > 0 || p.runs > 0);
    const dnb = playingXI.filter(p => p.balls === 0 && p.runs === 0);
    const bowlers = playingXI.filter(p => p.overs > 0);

    return (
        <AppShell title={`vs ${match.opponent}`} subtitle={`${new Date(match.date).toLocaleDateString()} • ${match.venue || 'No Venue'} • ${match.result || 'Pending Result'}`}>
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href={`/teams/${teamId}`}>
                            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                vs {match.opponent}
                                <span className={`text-sm px-2 py-1 rounded-full border ${match.result === 'Win' ? 'bg-green-100 text-green-700 border-green-200' :
                                    match.result === 'Loss' ? 'bg-red-100 text-red-700 border-red-200' :
                                        'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}>{match.result}</span>
                            </h1>
                            <p className="text-muted-foreground">{new Date(match.date).toLocaleDateString()} at {match.venue}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Batting Section */}
                    <Card>
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-lg">Batting Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Batter</TableHead>
                                        <TableHead className="text-right w-[80px]">R</TableHead>
                                        <TableHead className="text-right w-[80px]">B</TableHead>
                                        <TableHead className="text-right w-[80px]">4s</TableHead>
                                        <TableHead className="text-right w-[80px]">6s</TableHead>
                                        <TableHead className="text-right w-[80px]">SR</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batters.length > 0 ? batters.map(player => (
                                        <TableRow key={player.id}>
                                            <TableCell className="font-medium">
                                                {player.name}
                                                {player.is_captain && ' (c)'}
                                                {player.is_wicketkeeper && ' (wk)'}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">{player.runs}</TableCell>
                                            <TableCell className="text-right">{player.balls}</TableCell>
                                            <TableCell className="text-right">{player.fours}</TableCell>
                                            <TableCell className="text-right">{player.sixes}</TableCell>
                                            <TableCell className="text-right">{calculateStrikeRate(player.runs, player.balls)}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-6">No batting stats recorded.</TableCell>
                                        </TableRow>
                                    )}
                                    {/* Extras row could go here if we tracked it per team */}
                                </TableBody>
                            </Table>
                            {dnb.length > 0 && (
                                <div className="px-4 py-3 border-t text-sm">
                                    <span className="font-semibold text-muted-foreground mr-2">Did not bat:</span>
                                    {dnb.map(p => p.name).join(', ')}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bowling Section */}
                    <Card>
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-lg">Bowling Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Bowler</TableHead>
                                        <TableHead className="text-right w-[80px]">O</TableHead>
                                        <TableHead className="text-right w-[80px]">M</TableHead>
                                        <TableHead className="text-right w-[80px]">R</TableHead>
                                        <TableHead className="text-right w-[80px]">W</TableHead>
                                        <TableHead className="text-right w-[80px]">ECON</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bowlers.length > 0 ? bowlers.map(player => (
                                        <TableRow key={player.id}>
                                            <TableCell className="font-medium">
                                                {player.name}
                                            </TableCell>
                                            <TableCell className="text-right">{player.overs}</TableCell>
                                            <TableCell className="text-right">{player.maidens}</TableCell>
                                            <TableCell className="text-right">{player.runs_conceded}</TableCell>
                                            <TableCell className="text-right font-semibold">{player.wickets}</TableCell>
                                            <TableCell className="text-right">{calculateEconomy(player.runs_conceded, player.overs)}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-6">No bowling stats recorded.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
