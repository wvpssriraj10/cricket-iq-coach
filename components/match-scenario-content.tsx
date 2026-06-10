"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  BookOpen,
} from "lucide-react";

type Mode = "chasing" | "defending";
type BatterType = "aggressive" | "anchor";

interface Scenario {
  mode: Mode;
  runs: number;
  wickets: number;
  overs: number;
  target: number;
  format: string;
  batterType: BatterType;
}

interface Analysis {
  requiredRunRate: number;
  currentRunRate: number;
  ballsRemaining: number;
  runsNeeded: number;
  winProbability: number;
  recommendation: string;
  riskLevel: "low" | "medium" | "high";
}

function getRecommendation(
  scenario: Scenario,
  analysis: Analysis
): string {
  const { mode, batterType, wickets } = scenario;
  const { requiredRunRate, runsNeeded, ballsRemaining } = analysis;

  if (mode === "defending") {
    const runsToDefend = runsNeeded;
    const ballsLeft = ballsRemaining;
    if (runsToDefend > ballsLeft * 1.5)
      return "You're ahead. Bowl to your field, keep pressure with dots.";
    if (runsToDefend < ballsLeft * 0.8)
      return "Tight situation. Bowl yorkers and slower balls; protect boundaries.";
    return "Game in balance. Mix pace, hit the blockhole, and rotate strike prevention.";
  }

  if (batterType === "anchor") {
    if (requiredRunRate < 6)
      return "Anchor approach fits. Rotate strike, leave big shots to the other batter.";
    if (requiredRunRate < 10)
      return "Anchor can hold one end. Look for ones and twos; accelerate in the last 3 overs.";
    return "Rate climbing. Anchor should still prioritise strike rotation; partner takes risks.";
  }

  if (requiredRunRate < 6)
    return "Play conservatively. Rotate strike and wait for bad balls.";
  if (requiredRunRate < 8)
    return "Balanced approach. Look for boundaries but don't take unnecessary risks.";
  if (requiredRunRate < 12)
    return "Attack mode needed. Target boundaries every over.";
  return "High risk required. Need boundaries almost every ball.";
}

function calculateAnalysis(scenario: Scenario): Analysis {
  const maxOvers =
    scenario.format === "T20" ? 20 : scenario.format === "ODI" ? 50 : 90;
  const ballsRemaining = (maxOvers - scenario.overs) * 6;
  const runsNeeded = scenario.target - scenario.runs;
  const oversRemaining = maxOvers - scenario.overs;

  const currentRunRate = scenario.overs > 0 ? scenario.runs / scenario.overs : 0;
  const requiredRunRate =
    oversRemaining > 0 ? runsNeeded / oversRemaining : 0;

  let winProbability = 50;
  if (requiredRunRate < currentRunRate) winProbability += 20;
  else if (requiredRunRate > currentRunRate * 1.5) winProbability -= 25;
  else if (requiredRunRate > currentRunRate * 1.2) winProbability -= 10;
  winProbability -= scenario.wickets * 5;
  if (runsNeeded <= ballsRemaining) winProbability += 10;
  else if (runsNeeded > ballsRemaining * 1.5) winProbability -= 20;
  winProbability = Math.max(5, Math.min(95, winProbability));

  let riskLevel: "low" | "medium" | "high";
  if (requiredRunRate < 6) riskLevel = "low";
  else if (requiredRunRate < 12) riskLevel = "medium";
  else riskLevel = "high";

  const recommendation = getRecommendation(scenario, {
    requiredRunRate,
    currentRunRate,
    ballsRemaining,
    runsNeeded,
    winProbability,
    recommendation: "",
    riskLevel,
  });

  return {
    requiredRunRate,
    currentRunRate,
    ballsRemaining,
    runsNeeded,
    winProbability,
    recommendation,
    riskLevel,
  };
}

const MCQ_QUESTIONS: Array<{
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}> = [
  {
    id: "1",
    question:
      "Need 40 off 24 with 8 wickets in hand. You're the aggressive batter. Best approach?",
    options: [
      "Block and nurdle singles",
      "Target boundaries every over, run hard for twos",
      "Give strike to the other batter only",
      "Defend the first 3 balls of each over",
    ],
    correctIndex: 1,
    explanation:
      "At ~10 rpo you need boundaries. Aggressive batter should look for 2–3 boundaries an over and run twos to keep the rate down.",
  },
  {
    id: "2",
    question:
      "Defending 12 off 6. Bowler has one over left. Where should you bowl?",
    options: [
      "Short and wide to invite the cut",
      "Full and straight / yorkers, protect the straight boundary",
      "Bouncers to slow the batter",
      "Full tosses to avoid wides",
    ],
    correctIndex: 1,
    explanation:
      "Full and straight or yorkers are hardest to hit for six. Protect the straight boundary and keep the ball in the blockhole.",
  },
  {
    id: "3",
    question:
      "Chasing 80 off 60 with an anchor at one end. Your role as the other batter?",
    options: [
      "Also block and leave pressure to the anchor",
      "Rotate strike and accelerate when you get the strike",
      "Only hit sixes",
      "Refuse singles to keep the anchor on strike",
    ],
    correctIndex: 1,
    explanation:
      "Anchor holds one end; the other batter should rotate strike and take calculated risks to keep the rate manageable.",
  },
];

export function MatchScenarioContent() {
  const [scenario, setScenario] = useState<Scenario>({
    mode: "chasing",
    runs: 100,
    wickets: 3,
    overs: 12,
    target: 180,
    format: "T20",
    batterType: "aggressive",
  });

  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqAnswer, setMcqAnswer] = useState<number | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);

  const analysis = calculateAnalysis(scenario);
  const maxOvers =
    scenario.format === "T20" ? 20 : scenario.format === "ODI" ? 50 : 90;

  const mcq = MCQ_QUESTIONS[mcqIndex];
  const isCorrect = mcqSubmitted && mcqAnswer === mcq.correctIndex;

  const handleMcqSubmit = () => {
    if (mcqAnswer === null) return;
    setMcqSubmitted(true);
  };

  const handleMcqNext = () => {
    setMcqAnswer(null);
    setMcqSubmitted(false);
    setMcqIndex((i) => (i + 1) % MCQ_QUESTIONS.length);
  };

  return (
    <div className="space-y-8">
      {/* Scenario inputs: Chasing/Defending, overs left, runs required, wickets, batter type */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Match Scenario Classroom
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Set situation (chasing or defending), overs left, runs required, wickets, and batter type. Get a recommended approach.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Chasing or Defending?</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={scenario.mode === "chasing" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setScenario({ ...scenario, mode: "chasing" })
                  }
                >
                  Chasing
                </Button>
                <Button
                  type="button"
                  variant={scenario.mode === "defending" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setScenario({ ...scenario, mode: "defending" })
                  }
                >
                  Defending
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Batter type (when chasing)</Label>
              <Select
                value={scenario.batterType}
                onValueChange={(v: BatterType) =>
                  setScenario({ ...scenario, batterType: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                  <SelectItem value="anchor">Anchor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={scenario.format}
                onValueChange={(value) =>
                  setScenario({
                    ...scenario,
                    format: value,
                    overs: Math.min(
                      scenario.overs,
                      value === "T20" ? 20 : value === "ODI" ? 50 : 90
                    ),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T20">T20</SelectItem>
                  <SelectItem value="ODI">ODI (50 overs)</SelectItem>
                  <SelectItem value="Test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Target</Label>
                <Input
                  type="number"
                  value={scenario.target}
                  onChange={(e) =>
                    setScenario({ ...scenario, target: Number(e.target.value) })
                  }
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Current score (or runs conceded when defending)</Label>
                <Input
                  type="number"
                  value={scenario.runs}
                  onChange={(e) =>
                    setScenario({ ...scenario, runs: Number(e.target.value) })
                  }
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Wickets in hand (chasing) / lost (defending)</Label>
                  <span className="text-sm font-medium">{scenario.wickets}</span>
                </div>
                <Slider
                  value={[scenario.wickets]}
                  onValueChange={(value) =>
                    setScenario({ ...scenario, wickets: value[0] })
                  }
                  max={9}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Overs completed</Label>
                  <span className="text-sm font-medium">{scenario.overs}</span>
                </div>
                <Slider
                  value={[scenario.overs]}
                  onValueChange={(value) =>
                    setScenario({ ...scenario, overs: value[0] })
                  }
                  max={maxOvers}
                  step={1}
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Runs needed: <strong className="text-foreground">{analysis.runsNeeded}</strong> from{" "}
                <strong className="text-foreground">{analysis.ballsRemaining}</strong> balls
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recommended approach + Analysis */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Recommended approach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{analysis.recommendation}</p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    analysis.riskLevel === "low"
                      ? "secondary"
                      : analysis.riskLevel === "medium"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {analysis.riskLevel.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Required RR: {analysis.requiredRunRate.toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{analysis.ballsRemaining} balls left</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{analysis.runsNeeded} runs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MCQ Quiz – one question with feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quick quiz
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            One scenario-based question; choose an answer to see feedback.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="font-medium">{mcq.question}</p>
          <div className="space-y-2">
            {mcq.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => !mcqSubmitted && setMcqAnswer(i)}
                disabled={mcqSubmitted}
                className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                  mcqAnswer === i
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                } ${
                  mcqSubmitted
                    ? i === mcq.correctIndex
                      ? "border-green-500 bg-green-500/10"
                      : i === mcqAnswer
                        ? "border-red-500 bg-red-500/10"
                        : ""
                    : ""
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {mcqSubmitted && i === mcq.correctIndex && (
                  <CheckCircle className="ml-auto h-5 w-5 text-green-600" />
                )}
                {mcqSubmitted && i === mcqAnswer && i !== mcq.correctIndex && (
                  <AlertTriangle className="ml-auto h-5 w-5 text-red-600" />
                )}
              </button>
            ))}
          </div>
          {!mcqSubmitted ? (
            <Button
              onClick={handleMcqSubmit}
              disabled={mcqAnswer === null}
            >
              Submit
            </Button>
          ) : (
            <div className="space-y-3">
              <p
                className={
                  isCorrect
                    ? "text-sm font-medium text-green-600"
                    : "text-sm font-medium text-red-600"
                }
              >
                {isCorrect ? "Correct." : "Not quite."} {mcq.explanation}
              </p>
              <Button variant="outline" size="sm" onClick={handleMcqNext}>
                Next question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
