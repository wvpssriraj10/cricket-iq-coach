"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateTeamPage() {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) throw new Error("Failed to create team");

            toast.success("Team created successfully");
            router.push("/teams");
        } catch (error) {
            toast.error("Failed to create team. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell title="Create Team" subtitle="Add a new team to your collection">
            <div className="container mx-auto py-8">
                <Link href="/teams" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams
                </Link>

                <div className="max-w-md mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Team</CardTitle>
                            <CardDescription>Enter the name of your new team.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Team Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Royal Challengers"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Create Team
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
