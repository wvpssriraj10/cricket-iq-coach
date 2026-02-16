"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { Team } from "@/lib/db";
import { useRouter } from "next/navigation";

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell title="Teams" subtitle="Manage your teams and squads.">
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
                        <p className="text-muted-foreground">
                            Manage your teams and squads.
                        </p>
                    </div>
                    <Link href="/teams/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Team
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div>Loading teams...</div>
                ) : teams.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold">No teams found</h3>
                        <p className="text-muted-foreground mb-4">
                            Get started by creating your first team.
                        </p>
                        <Link href="/teams/create">
                            <Button variant="outline">Create Team</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map((team) => (
                            <Card key={team.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/teams/${team.id}`)}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground">
                                        ID: {team.id.substring(0, 8)}...
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <span className="text-sm text-primary">View Squad &rarr;</span>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
