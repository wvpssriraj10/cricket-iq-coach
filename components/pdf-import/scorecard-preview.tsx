"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, ChevronDown, ChevronUp, Users } from "lucide-react";
import { useState } from "react";
import type { ParsedScorecard } from "@/lib/scorecard-parser";

type Props = {
  scorecard: ParsedScorecard;
  pdfPlayerNames: string[];
  newPlayerCount: number;
  reusedPlayerCount: number;
};

export function ScorecardPreview({ scorecard, pdfPlayerNames, newPlayerCount, reusedPlayerCount }: Props) {
  const [expandedInnings, setExpandedInnings] = useState<number[]>([0, 1]);

  const toggleInnings = (idx: number) => {
    setExpandedInnings((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="space-y-4">
      {/* Match summary header */}
      <div className="rounded-xl border bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {scorecard.tournament && (
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                {scorecard.tournament}
              </p>
            )}
            <h3 className="text-xl font-bold tracking-tight">
              {scorecard.team1}
              <span className="mx-2 text-muted-foreground font-normal text-base">vs</span>
              {scorecard.team2}
            </h3>
            {scorecard.result && (
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                <Trophy className="inline-block h-4 w-4 mr-1 -mt-0.5" />
                {scorecard.result}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {scorecard.matchDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(scorecard.matchDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </span>
            )}
            {scorecard.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {scorecard.venue}
              </span>
            )}
          </div>
        </div>

        {/* Player count badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className="gap-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700">
            <Users className="h-3.5 w-3.5" />
            {pdfPlayerNames.length} players in scorecard
          </Badge>
          {newPlayerCount > 0 && (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-blue-200 dark:border-blue-700">
              +{newPlayerCount} new
            </Badge>
          )}
          {reusedPlayerCount > 0 && (
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200 border-gray-200 dark:border-gray-700">
              {reusedPlayerCount} existing
            </Badge>
          )}
        </div>
      </div>

      {/* Innings tables */}
      {scorecard.innings.map((inn, idx) => (
        <div key={idx} className="rounded-xl border overflow-hidden">
          <button
            onClick={() => toggleInnings(idx)}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
          >
            <div>
              <span className="font-semibold text-sm">{inn.teamName}</span>
              <span className="ml-2 text-muted-foreground text-sm">
                {inn.totalRuns}/{inn.totalWickets} ({inn.totalOvers} Ov)
              </span>
            </div>
            {expandedInnings.includes(idx) ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {expandedInnings.includes(idx) && (
            <div className="p-4 space-y-4">
              {/* Batting */}
              {inn.batting.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Batting</p>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40 text-muted-foreground text-xs">
                          <th className="text-left px-3 py-2 font-medium">Batsman</th>
                          <th className="text-right px-3 py-2 font-medium">R</th>
                          <th className="text-right px-3 py-2 font-medium">B</th>
                          <th className="text-right px-3 py-2 font-medium">4s</th>
                          <th className="text-right px-3 py-2 font-medium">6s</th>
                          <th className="text-right px-3 py-2 font-medium">SR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {inn.batting.map((b, bi) => (
                          <tr key={bi} className="hover:bg-muted/20 transition-colors">
                            <td className="px-3 py-2">
                              <p className="font-medium">{b.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{b.status}</p>
                            </td>
                            <td className="px-3 py-2 text-right font-semibold">{b.runs}</td>
                            <td className="px-3 py-2 text-right text-muted-foreground">{b.balls}</td>
                            <td className="px-3 py-2 text-right">{b.fours}</td>
                            <td className="px-3 py-2 text-right">{b.sixes}</td>
                            <td className="px-3 py-2 text-right text-muted-foreground">{b.strikeRate.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bowling */}
              {inn.bowling.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bowling</p>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40 text-muted-foreground text-xs">
                          <th className="text-left px-3 py-2 font-medium">Bowler</th>
                          <th className="text-right px-3 py-2 font-medium">O</th>
                          <th className="text-right px-3 py-2 font-medium">M</th>
                          <th className="text-right px-3 py-2 font-medium">R</th>
                          <th className="text-right px-3 py-2 font-medium">W</th>
                          <th className="text-right px-3 py-2 font-medium">Eco</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {inn.bowling.map((b, bi) => (
                          <tr key={bi} className="hover:bg-muted/20 transition-colors">
                            <td className="px-3 py-2 font-medium">{b.name}</td>
                            <td className="px-3 py-2 text-right text-muted-foreground">{b.overs.toFixed(1)}</td>
                            <td className="px-3 py-2 text-right text-muted-foreground">{b.maidens}</td>
                            <td className="px-3 py-2 text-right">{b.runs}</td>
                            <td className="px-3 py-2 text-right font-semibold">{b.wickets}</td>
                            <td className="px-3 py-2 text-right text-muted-foreground">{b.economy.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
