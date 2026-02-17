"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Loader2, Trophy, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Team, Player } from "@/lib/db";

// Extended Player type for UI with possible undefined fields handled or mapped
interface TeamWithSquad extends Team {
    squad: Player[];
}

export default function TeamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [team, setTeam] = useState<TeamWithSquad | null>(null);
    const [loading, setLoading] = useState(true);

    // Add Player State
    const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("new");
    const [newPlayerName, setNewPlayerName] = useState("");
    const [newPlayerRole, setNewPlayerRole] = useState("batter");
    const [newPlayerAgeGroup, setNewPlayerAgeGroup] = useState("U19");
    const [newPlayerBattingArm, setNewPlayerBattingArm] = useState("right");
    const [newPlayerBowlingArm, setNewPlayerBowlingArm] = useState("right");
    const [newPlayerBowlerType, setNewPlayerBowlerType] = useState("");
    const [existingPlayerIdRaw, setExistingPlayerIdRaw] = useState("");
    const [addingPlayer, setAddingPlayer] = useState(false);

    const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);

    // Add Performance State
    const [isAddPerformanceOpen, setIsAddPerformanceOpen] = useState(false);
    const [selectedPlayerId, setSelectedPlayerId] = useState("");
    const [perfTournament, setPerfTournament] = useState("");
    const [perfMatches, setPerfMatches] = useState("");
    const [perfRuns, setPerfRuns] = useState("");
    const [perfWickets, setPerfWickets] = useState("");
    const [perfCatches, setPerfCatches] = useState("");
    const [perfStumpings, setPerfStumpings] = useState("");
    const [perfFifty, setPerfFifty] = useState("");
    const [perfHundred, setPerfHundred] = useState("");
    const [perfTopScore, setPerfTopScore] = useState("");
    const [perfBestBowling, setPerfBestBowling] = useState("");
    const [addingPerf, setAddingPerf] = useState(false);


    useEffect(() => {
        fetchTeamDetails();
    }, [id]);

    const fetchTeamDetails = async () => {
        try {
            const res = await fetch(`/api/teams/${id}`);
            if (res.ok) {
                const data = await res.json();
                setTeam(data);
            } else {
                toast.error("Failed to load team details");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const ignored = [
        newPlayerBattingArm,
        newPlayerBowlingArm,
        newPlayerBowlerType,
        selectedPlayerId,
        perfTournament,
        perfMatches,
        perfRuns,
        perfWickets,
        perfCatches,
        perfStumpings,
        perfFifty,
        perfHundred,
        perfTopScore,
        perfBestBowling
    ];

    const handleAddPlayer = async () => {
        if (activeTab === "new" && !newPlayerName) return;
        if (activeTab === "existing" && !existingPlayerIdRaw) return;

        setAddingPlayer(true);
        try {
            const payload = activeTab === "new" ? {
                name: newPlayerName,
                role: newPlayerRole,
                age_group: newPlayerAgeGroup,
                batting_arm: newPlayerBattingArm,
                bowling_arm: newPlayerBowlingArm,
                bowler_type: newPlayerBowlerType
            } : {
                existing_player_id: existingPlayerIdRaw
            };

            const res = await fetch(`/api/teams/${id}/squad`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to add player");

            toast.success("Player added to squad");
            setIsAddPlayerOpen(false);
            setNewPlayerName("");
            setExistingPlayerIdRaw("");
            // Refresh details
            fetchTeamDetails();
        } catch (error) {
            toast.error("Error adding player");
        } finally {
            setAddingPlayer(false);
        }
    };

    const handleAddPerformance = async () => {
        if (!selectedPlayerId || !perfTournament) return;
        setAddingPerf(true);
        try {
            const res = await fetch("/api/performances", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    player_id: selectedPlayerId,
                    tournament_name: perfTournament,
                    matches: parseInt(perfMatches) || 0,
                    runs: parseInt(perfRuns) || 0,
                    wickets: parseInt(perfWickets) || 0,
                    catches: parseInt(perfCatches) || 0,
                    stumpings: parseInt(perfStumpings) || 0,
                    fifty: parseInt(perfFifty) || 0,
                    hundred: parseInt(perfHundred) || 0,
                    top_score: parseInt(perfTopScore) || 0,
                    best_bowling: perfBestBowling
                }),
            });

            if (!res.ok) throw new Error("Failed to add performance");

            toast.success("Performance added!");
            setIsAddPerformanceOpen(false);
            // Reset form
            setPerfTournament("");
            setPerfMatches("");
            setPerfRuns("");
            setPerfWickets("");
        } catch (error) {
            toast.error("Error adding performance");
        } finally {
            setAddingPerf(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!team) return <div className="p-8">Team not found</div>;

    return (
        <AppShell title={team.name} subtitle="Manage squad and performance">
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/teams">
                            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <h1 className="text-3xl font-bold">{team.name}</h1>
                    </div>
                    <div className="flex gap-2">
                        {/* Add Player Dialog */}
                        <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
                            <DialogTrigger asChild>
                                <Button><UserPlus className="mr-2 h-4 w-4" /> Add Player</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add Player to Squad</DialogTitle>
                                    <DialogDescription>Create a new player profile and add them to this team.</DialogDescription>
                                </DialogHeader>
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="new">New Player</TabsTrigger>
                                        <TabsTrigger value="existing">Existing Player</TabsTrigger>
                                    </TabsList>

                                    <div className="py-4">
                                        <TabsContent value="new" className="space-y-4 mt-0">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="p-name" className="text-right">Name</Label>
                                                <Input id="p-name" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} className="col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="p-role" className="text-right">Role</Label>
                                                <Select value={newPlayerRole} onValueChange={setNewPlayerRole}>
                                                    <SelectTrigger className="col-span-3">
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="batter">Batter</SelectItem>
                                                        <SelectItem value="bowler">Bowler</SelectItem>
                                                        <SelectItem value="allrounder">All-Rounder</SelectItem>
                                                        <SelectItem value="keeper">Wicket Keeper</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="p-age" className="text-right">Age Group</Label>
                                                <Select value={newPlayerAgeGroup} onValueChange={setNewPlayerAgeGroup}>
                                                    <SelectTrigger className="col-span-3">
                                                        <SelectValue placeholder="Select age group" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="U12">U12</SelectItem>
                                                        <SelectItem value="U16">U16</SelectItem>
                                                        <SelectItem value="U19">U19</SelectItem>
                                                        <SelectItem value="College">College</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {/* Style Inputs */}
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Batting</Label>
                                                <Select value={newPlayerBattingArm} onValueChange={setNewPlayerBattingArm}>
                                                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="right">Right Hand</SelectItem>
                                                        <SelectItem value="left">Left Hand</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Bowling</Label>
                                                <Select value={newPlayerBowlingArm} onValueChange={setNewPlayerBowlingArm}>
                                                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="right">Right Arm</SelectItem>
                                                        <SelectItem value="left">Left Arm</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Type</Label>
                                                <Input placeholder="e.g. Fast, Spin" value={newPlayerBowlerType} onChange={(e) => setNewPlayerBowlerType(e.target.value)} className="col-span-3" />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="existing" className="mt-0">
                                            <div className="grid grid-cols-4 items-center gap-4 py-4">
                                                <Label htmlFor="existing-p" className="text-right">Select Player</Label>
                                                <Select value={existingPlayerIdRaw} onValueChange={setExistingPlayerIdRaw}>
                                                    <SelectTrigger className="col-span-3">
                                                        <SelectValue placeholder="Search players..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availablePlayers.length === 0 ? (
                                                            <SelectItem value="none" disabled>No other players available</SelectItem>
                                                        ) : (
                                                            availablePlayers.map(p => (
                                                                <SelectItem key={p.id} value={p.id}>{p.name} ({p.role}, {p.age_group})</SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <p className="text-sm text-muted-foreground text-center">
                                                Choose a player from the global database to add to this squad.
                                            </p>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                                <DialogFooter>
                                    <Button onClick={handleAddPlayer} disabled={addingPlayer}>
                                        {addingPlayer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Add Performance Dialog */}
                        <Dialog open={isAddPerformanceOpen} onOpenChange={setIsAddPerformanceOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary"><Trophy className="mr-2 h-4 w-4" /> Add Performance</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[80vh]">
                                <DialogHeader>
                                    <DialogTitle>Add Tournament Performance</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Player</Label>
                                        <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                                            <SelectTrigger className="col-span-3"><SelectValue placeholder="Select player" /></SelectTrigger>
                                            <SelectContent>
                                                {team.squad.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Tournament</Label>
                                        <Input value={perfTournament} onChange={e => setPerfTournament(e.target.value)} className="col-span-3" placeholder="e.g. IPL 2024" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label>Matches</Label>
                                            <Input type="number" value={perfMatches} onChange={e => setPerfMatches(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Runs</Label>
                                            <Input type="number" value={perfRuns} onChange={e => setPerfRuns(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Wickets</Label>
                                            <Input type="number" value={perfWickets} onChange={e => setPerfWickets(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Top Score</Label>
                                            <Input type="number" value={perfTopScore} onChange={e => setPerfTopScore(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Best Bowling</Label>
                                            <Input placeholder="e.g. 5/20" value={perfBestBowling} onChange={e => setPerfBestBowling(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>100s</Label>
                                            <Input type="number" value={perfHundred} onChange={e => setPerfHundred(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>50s</Label>
                                            <Input type="number" value={perfFifty} onChange={e => setPerfFifty(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Catches</Label>
                                            <Input type="number" value={perfCatches} onChange={e => setPerfCatches(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Stumpings</Label>
                                            <Input type="number" value={perfStumpings} onChange={e => setPerfStumpings(e.target.value)} />
                                        </div>
                                    </div>

                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddPerformance} disabled={addingPerf}>
                                        {addingPerf && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Performance
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Squad ({team.squad.length})</CardTitle>
                        <CardDescription>Players currently in this team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Batting Style</TableHead>
                                    <TableHead>Bowling Style</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {team.squad.map((player) => (
                                    <TableRow key={player.id}>
                                        <TableCell className="font-medium">{player.name}</TableCell>
                                        <TableCell className="capitalize">{player.role}</TableCell>
                                        <TableCell className="capitalize">{player.batting_arm} Hand</TableCell>
                                        <TableCell className="capitalize">{player.bowling_arm ? `${player.bowling_arm} Arm` : '-'} {player.bowler_type}</TableCell>
                                    </TableRow>
                                ))}
                                {team.squad.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground h-24">No players added yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
