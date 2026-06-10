"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRight } from "lucide-react";
import { Team } from "@/lib/db";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface ComparisonData {
    team1: TeamStats;
    team2: TeamStats;
}

interface TeamStats {
    id: string;
    name: string;
    total_runs: number;
    total_wickets: number;
    total_matches: number;
    total_catches: number;
    total_stumpings: number;
    centuries: number;
    half_centuries: number;
    highest_score: number;
    playerCount: number;
}

export default function ComparePage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [team1Id, setTeam1Id] = useState("");
    const [team2Id, setTeam2Id] = useState("");
    const [comparison, setComparison] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const res = await fetch("/api/teams");
            if (res.ok) {
                const data = await res.json();
                setTeams(data);
            }
        } catch (error) {
            console.error("Failed to fetch teams", error);
        }
    };

    const handleCompare = async () => {
        if (!team1Id || !team2Id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/teams/compare?team1Id=${team1Id}&team2Id=${team2Id}`);
            if (res.ok) {
                const data = await res.json();
                setComparison(data);
            }
        } catch (error) {
            console.error("Failed to compare teams", error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value1, value2, label1, label2 }: { title: string, value1: number, value2: number, label1: string, label2: string }) => (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-baseline">
                    <div className="text-2xl font-bold">{value1}</div>
                    <div className="text-2xl font-bold">{value2}</div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{label1}</span>
                    <span>{label2}</span>
                </div>
                {/* Simple Bar visual */}
                <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full" style={{ width: `${(value1 / (value1 + value2 || 1)) * 100}%` }} />
                    <div className="bg-destructive h-full" style={{ width: `${(value2 / (value1 + value2 || 1)) * 100}%` }} />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AppShell title="Compare Teams" subtitle="Analyze head-to-head performance">
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-8">Compare Teams</h1>

                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Team A</label>
                                <Select value={team1Id} onValueChange={setTeam1Id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Team A" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="hidden md:flex justify-center pb-2">
                                <div className="bg-muted rounded-full p-2">
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Team B</label>
                                <Select value={team2Id} onValueChange={setTeam2Id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Team B" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams.filter(t => t.id !== team1Id).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-6"
                            onClick={handleCompare}
                            disabled={!team1Id || !team2Id || loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Compare Performance
                        </Button>
                    </CardContent>
                </Card>

                {comparison && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="border-primary/20 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="text-center text-primary">{comparison.team1.name}</CardTitle>
                                    <CardDescription className="text-center">{comparison.team1.playerCount} Players</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className="border-destructive/20 bg-destructive/5">
                                <CardHeader>
                                    <CardTitle className="text-center text-destructive">{comparison.team2.name}</CardTitle>
                                    <CardDescription className="text-center">{comparison.team2.playerCount} Players</CardDescription>
                                </CardHeader>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Runs"
                                value1={comparison.team1.total_runs}
                                value2={comparison.team2.total_runs}
                                label1={comparison.team1.name}
                                label2={comparison.team2.name}
                            />
                            <StatCard
                                title="Total Wickets"
                                value1={comparison.team1.total_wickets}
                                value2={comparison.team2.total_wickets}
                                label1={comparison.team1.name}
                                label2={comparison.team2.name}
                            />
                            <StatCard
                                title="Centuries"
                                value1={comparison.team1.centuries}
                                value2={comparison.team2.centuries}
                                label1={comparison.team1.name}
                                label2={comparison.team2.name}
                            />
                            <StatCard
                                title="Highest Indiv. Score"
                                value1={comparison.team1.highest_score}
                                value2={comparison.team2.highest_score}
                                label1={comparison.team1.name}
                                label2={comparison.team2.name}
                            />
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            {
                                                metric: 'Runs',
                                                [comparison.team1.name]: comparison.team1.total_runs,
                                                [comparison.team2.name]: comparison.team2.total_runs
                                            },
                                            {
                                                metric: 'Wickets (*10)',
                                                [comparison.team1.name]: comparison.team1.total_wickets * 10,
                                                [comparison.team2.name]: comparison.team2.total_wickets * 10
                                            },
                                            {
                                                metric: 'Catches',
                                                [comparison.team1.name]: comparison.team1.total_catches,
                                                [comparison.team2.name]: comparison.team2.total_catches
                                            }
                                        ]}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <XAxis dataKey="metric" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey={comparison.team1.name} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey={comparison.team2.name} fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
