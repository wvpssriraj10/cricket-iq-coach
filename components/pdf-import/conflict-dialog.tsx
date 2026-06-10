"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, UserCheck, UserPlus, CheckCircle } from "lucide-react";

export type PlayerConflict = {
  pdfName: string;
  existingId: string;
  existingName: string;
  similarity: number;
};

export type ConflictResolution = {
  pdfName: string;
  mergeWithPlayerId?: string | null;
};

type Props = {
  open: boolean;
  conflicts: PlayerConflict[];
  onResolved: (resolutions: ConflictResolution[]) => void;
  onCancel: () => void;
};

export function ConflictDialog({ open, conflicts, onResolved, onCancel }: Props) {
  const [resolutions, setResolutions] = useState<Record<string, "merge" | "new">>({});

  const totalConflicts = conflicts.length;
  const resolvedCount = Object.keys(resolutions).length;
  const allResolved = resolvedCount >= totalConflicts;

  function resolve(pdfName: string, decision: "merge" | "new") {
    setResolutions((prev) => ({ ...prev, [pdfName]: decision }));
  }

  function handleConfirm() {
    const result: ConflictResolution[] = conflicts.map((c) => {
      const decision = resolutions[c.pdfName];
      return {
        pdfName: c.pdfName,
        mergeWithPlayerId: decision === "merge" ? c.existingId : null,
      };
    });
    onResolved(result);
  }

  const similarityLabel = (score: number) => {
    if (score >= 0.9) return { text: "Very likely same", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" };
    if (score >= 0.7) return { text: "Probably same", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" };
    return { text: "Possibly same", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" };
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Possible Duplicate Players Found
          </DialogTitle>
          <DialogDescription>
            We found {totalConflicts} player name(s) in the PDF that could match existing players in your database.
            Please confirm whether they are the same person or different players.
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{resolvedCount} of {totalConflicts} resolved</span>
            {allResolved && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                <CheckCircle className="h-3.5 w-3.5" /> All resolved
              </span>
            )}
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(resolvedCount / totalConflicts) * 100}%` }}
            />
          </div>
        </div>

        {/* Conflicts list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {conflicts.map((conflict) => {
            const decision = resolutions[conflict.pdfName];
            const badge = similarityLabel(conflict.similarity);

            return (
              <div
                key={conflict.pdfName + conflict.existingId}
                className={`rounded-xl border p-4 transition-all duration-200 ${
                  decision
                    ? "border-border/40 bg-muted/30 opacity-70"
                    : "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                      {badge.text} ({Math.round(conflict.similarity * 100)}% match)
                    </span>
                    {decision && (
                      <Badge variant="outline" className={
                        decision === "merge"
                          ? "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                          : "border-green-300 text-green-700 dark:border-green-700 dark:text-green-300"
                      }>
                        {decision === "merge" ? "Merged" : "Kept separate"}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* From PDF */}
                  <div className="rounded-lg bg-background border p-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">In PDF</p>
                    <p className="text-sm font-semibold">{conflict.pdfName}</p>
                  </div>
                  {/* In Database */}
                  <div className="rounded-lg bg-background border p-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">In Database</p>
                    <p className="text-sm font-semibold">{conflict.existingName}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={decision === "merge" ? "default" : "outline"}
                    className="flex-1 gap-2"
                    onClick={() => resolve(conflict.pdfName, "merge")}
                  >
                    <UserCheck className="h-4 w-4" />
                    Same Player – Merge
                  </Button>
                  <Button
                    size="sm"
                    variant={decision === "new" ? "default" : "outline"}
                    className="flex-1 gap-2"
                    onClick={() => resolve(conflict.pdfName, "new")}
                  >
                    <UserPlus className="h-4 w-4" />
                    Different Player
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel Import</Button>
          <Button onClick={handleConfirm} disabled={!allResolved}>
            Confirm &amp; Import ({totalConflicts - resolvedCount} remaining)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
