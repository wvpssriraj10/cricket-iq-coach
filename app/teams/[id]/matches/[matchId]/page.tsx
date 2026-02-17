"use strict";
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import { Database, Match, MatchPerformance, Player } from "@/lib/db";

// Helper to calculate strike rate
const calculateStrikeRate = (runs: number, balls: number) => {
    if (balls === 0) return 0;
    return ((runs / balls) * 100).toFixed(1);
}

// Helper to calculate economy rate
const calculateEconomy = (runs: number, overs: number) => {
    if (overs === 0) return 0;
    // Handle partial overs (e.g. 4.2 overs = 4*6 + 2 = 26 balls. But standard notation 4.2 is 4 overs 2 balls)
    // Actually economy is Runs / Overs.
    // If overs is 4.2, it means 4 and 2/6.
    // Let's just use the decimal value for now as naive division, or convert.
    // Standard cricket conversion: 4.2 -> 4 + 2/6 = 4.333
    const overPart = Math.floor(overs);
    const ballPart = (overs - overPart) * 10;
    const totalOvers = overPart + (ballPart / 6);
    return (runs / totalOvers).toFixed(1);
}

type PlayerPerformanceRow = Player & {
    performance?: MatchPerformance;
    // Local state for inputs
    runs: string;
    balls: string;
    fours: string;
    sixes: string;
    wickets: string;
    overs: string;
    runs_conceded: string;
    maidens: string;
    catches: string;
    stumpings: string;
    is_playing: boolean;
};

export default function MatchDetailsPage({ params }: { params: Promise<{ id: string; matchId: string }> }) {
    const { id: teamId, matchId } = use(params);
    const router = useRouter();
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [players, setPlayers] = useState<PlayerPerformanceRow[]>([]);
    // const supabase = createClient();

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
                        runs: perf?.runs_scored?.toString() || "",
                        balls: perf?.balls_faced?.toString() || "",
                        fours: perf?.fours?.toString() || "",
                        sixes: perf?.sixes?.toString() || "",
                        wickets: perf?.wickets?.toString() || "",
                        overs: perf?.overs_bowled?.toString() || "",
                        runs_conceded: perf?.runs_conceded?.toString() || "",
                        maidens: perf?.maidens?.toString() || "",
                        catches: perf?.catches?.toString() || "",
                        stumpings: perf?.stumpings?.toString() || "",
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

    const handleSave = async () => {
        setSaving(true);
        try {
            // Filter players who have data entered
            // Or just save all checked players
            const performancesToSave = players
                .filter(p => {
                    // Check if any stat is entered OR explicitly marked as playing (if we had a checkbox)
                    // For now, let's look for valid playing data
                    return p.runs !== "" || p.overs !== "" || p.wickets !== "" || p.catches !== "" || p.stumpings !== "";
                })
                .map(p => ({
                    match_id: matchId,
                    player_id: p.id,
                    runs_scored: parseInt(p.runs) || 0,
                    balls_faced: parseInt(p.balls) || 0,
                    fours: parseInt(p.fours) || 0,
                    sixes: parseInt(p.sixes) || 0,
                    wickets: parseInt(p.wickets) || 0,
                    overs_bowled: parseFloat(p.overs) || 0,
                    runs_conceded: parseInt(p.runs_conceded) || 0,
                    maidens: parseInt(p.maidens) || 0,
                    catches: parseInt(p.catches) || 0,
                    stumpings: parseInt(p.stumpings) || 0
                }));

            const response = await fetch(`/api/matches/${matchId}/performances`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(performancesToSave)
            });

            if (!response.ok) throw new Error("Failed to save performances");

            toast.success("Match performances saved");

            // Reload data to ensure consistency? Or just continue

        } catch (error) {
            console.error("Error saving performances:", error);
            toast.error("Failed to save performances");
        } finally {
            setSaving(false);
        }
    };

    // Helper to update local state for a player
    const updatePlayer = (id: string, field: keyof PlayerPerformanceRow, value: string) => {
        setPlayers(prev => prev.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

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

                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!saving && <Save className="mr-2 h-4 w-4" />}
                        Save Scorecard
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Batting Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Scorecard</CardTitle>
                            <CardDescription>Enter performance stats for players who played in this match.</CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[180px]">Player</TableHead>
                                        <TableHead className="text-center w-[80px]">Runs</TableHead>
                                        <TableHead className="text-center w-[80px]">Balls</TableHead>
                                        <TableHead className="text-center w-[60px]">4s</TableHead>
                                        <TableHead className="text-center w-[60px]">6s</TableHead>
                                        <TableHead className="text-center w-[80px] bg-muted/30">SR</TableHead>
                                        <TableHead className="text-center w-[80px] border-l">Overs</TableHead>
                                        <TableHead className="text-center w-[60px]">Mdn</TableHead>
                                        <TableHead className="text-center w-[80px]">Runs</TableHead>
                                        <TableHead className="text-center w-[60px]">Wkts</TableHead>
                                        <TableHead className="text-center w-[80px] bg-muted/30">Econ</TableHead>
                                        <TableHead className="text-center w-[60px] border-l">Ct</TableHead>
                                        <TableHead className="text-center w-[60px]">St</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {players.map(player => (
                                        <TableRow key={player.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{player.name}</span>
                                                    <span className="text-xs text-muted-foreground capitalize">{player.role}</span>
                                                </div>
                                            </TableCell>

                                            {/* Batting Inputs */}
                                            <TableCell>
                                                <Input type="number" className="h-8 text-center" value={player.runs} onChange={e => updatePlayer(player.id, 'runs', e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" className="h-8 text-center" value={player.balls} onChange={e => updatePlayer(player.id, 'balls', e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" className="h-8 text-center" value={player.fours} onChange={e => updatePlayer(player.id, 'fours', e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" className="h-8 text-center" value={player.sixes} onChange={e => updatePlayer(player.id, 'sixes', e.target.value)} />
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-sm text-muted-foreground bg-muted/30">
                                                {calculateStrikeRate(parseInt(player.runs) || 0, parseInt(player.balls) || 0)}
                                            </TableCell>

                                            {/* Bowling Inputs */}
                                            <TableCell className="border-l">
                                                <Input type="number" step="0.1" className="h-8 text-center" value={player.overs} onChange={e => updatePlayer(player.id, 'overs', e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" className="h-8 text-center" value={player.maidens} onChange={e => updatePlayer(player.id, 'maidens', e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" className="h-8 text-center" value={player.runs_conceded} onChange={e => updatePlayer(player.id, 'runs_conceded', e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" className="h-8 text-center" value={player.wickets} onChange={e => updatePlayer(player.id, 'wickets', e.target.value)} />
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-sm text-muted-foreground bg-muted/30">
                                                {calculateEconomy(parseInt(player.runs_conceded) || 0, parseFloat(player.overs) || 0)}
                                            </TableCell>

                                            {/* Fielding Inputs */}
                                            <TableCell className="border-l">
                                                <Input type="number" className="h-8 text-center" value={player.catches} onChange={e => updatePlayer(player.id, 'catches', e.target.value)} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" className="h-8 text-center" value={player.stumpings} onChange={e => updatePlayer(player.id, 'stumpings', e.target.value)} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
