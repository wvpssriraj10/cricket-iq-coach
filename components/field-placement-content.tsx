"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Map, Users, RotateCcw, Lightbulb, Sparkles } from "lucide-react";

interface FieldPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  occupied: boolean;
}

interface FieldSetup {
  name: string;
  description: string;
  positions: string[];
  bowlerType: string;
  situation: string;
  format?: string;
  phase?: string;
  batterStyle?: string;
}

// Matches standard diagram: BATTER at top (y~32), BOWLER at bottom (y~68). Pitch centre x=50.
// Off side = LEFT (x 5–46), Leg side = RIGHT (x 54–95).
// "Behind batter" = small y (18–35), "Square" = y 44–52, "In front / towards bowler" = large y (54–90).
const allPositions: FieldPosition[] = [
  // Off side — behind batter (slips, gully, third man) then square then in front of bowler
  { id: "thirdMan", name: "Third Man", x: 12, y: 20, occupied: false },
  { id: "shortThirdMan", name: "Short Third Man", x: 16, y: 26, occupied: false },
  { id: "slip1", name: "Slip", x: 28, y: 28, occupied: false },
  { id: "slip2", name: "2nd Slip", x: 25, y: 30, occupied: false },
  { id: "slip3", name: "3rd Slip", x: 22, y: 32, occupied: false },
  { id: "gully", name: "Gully", x: 18, y: 34, occupied: false },
  { id: "deepBackPoint", name: "Deep Back Point", x: 14, y: 38, occupied: false },
  { id: "deepPoint", name: "Deep Point", x: 16, y: 42, occupied: false },
  { id: "point", name: "Point", x: 20, y: 48, occupied: false },
  { id: "extraCover", name: "Extra Cover", x: 26, y: 50, occupied: false },
  { id: "deepExtraCover", name: "Deep Extra Cover", x: 22, y: 54, occupied: false },
  { id: "cover", name: "Cover", x: 30, y: 56, occupied: false },
  { id: "deepCover", name: "Deep Cover", x: 26, y: 60, occupied: false },
  { id: "fwdShortLeg", name: "Fwd. Short Leg", x: 38, y: 36, occupied: false },
  { id: "midOff", name: "Mid-Off", x: 36, y: 64, occupied: false },
  { id: "longOff", name: "Long Off", x: 40, y: 86, occupied: false },
  // Leg side — behind batter then square then in front of bowler
  { id: "fineLeg", name: "Fine Leg", x: 86, y: 22, occupied: false },
  { id: "shortFineLeg", name: "Short Fine Leg", x: 80, y: 28, occupied: false },
  { id: "legSlip", name: "Leg Slip", x: 70, y: 30, occupied: false },
  { id: "shortLeg", name: "Short Leg", x: 60, y: 38, occupied: false },
  { id: "deepBackSqLeg", name: "Deep Back Sq. Leg", x: 86, y: 38, occupied: false },
  { id: "backwardSqLeg", name: "Backward Sq. Leg", x: 82, y: 44, occupied: false },
  { id: "squareLeg", name: "Square Leg", x: 80, y: 50, occupied: false },
  { id: "deepSquare", name: "Deep Square", x: 84, y: 52, occupied: false },
  { id: "forwardSqLeg", name: "Forward Sq. Leg", x: 76, y: 52, occupied: false },
  { id: "midWicket", name: "Mid-Wicket", x: 72, y: 56, occupied: false },
  { id: "deepMidWicket", name: "Deep Mid-Wicket", x: 74, y: 68, occupied: false },
  { id: "midOn", name: "Mid-On", x: 60, y: 64, occupied: false },
  { id: "longOn", name: "Long On", x: 60, y: 86, occupied: false },
];

const presetSetups: FieldSetup[] = [
  {
    name: "Attacking (New Ball)",
    description: "Aggressive field for new ball: slips, gully, point, cover, mid off/on, fine leg",
    positions: ["slip1", "slip2", "slip3", "gully", "point", "cover", "midOff", "midOn", "fineLeg"],
    bowlerType: "Pace",
    situation: "New ball / Looking for wickets",
    format: "T20",
    phase: "Powerplay",
    batterStyle: "Any",
  },
  {
    name: "Defensive (Death Overs)",
    description: "Boundary riders: third man, deep point, deep cover, long off/on, deep mid wicket, square leg, fine leg, mid off",
    positions: ["thirdMan", "deepPoint", "deepCover", "longOff", "longOn", "deepMidWicket", "squareLeg", "fineLeg", "midOff"],
    bowlerType: "Pace",
    situation: "Death overs / Defending total",
    format: "T20",
    phase: "Death",
    batterStyle: "Aggressive",
  },
  {
    name: "Spin Attack",
    description: "Close catchers (slip, fwd short leg, short leg) and boundary riders for spin",
    positions: ["slip1", "fwdShortLeg", "shortLeg", "cover", "midOff", "midOn", "midWicket", "deepMidWicket", "longOn"],
    bowlerType: "Spin",
    situation: "Spin bowling / Middle overs",
    format: "T20",
    phase: "Middle",
    batterStyle: "Any",
  },
  {
    name: "Yorker Setup",
    description: "Field for yorkers at death: protect boundaries and ring",
    positions: ["thirdMan", "point", "cover", "longOff", "longOn", "deepMidWicket", "fineLeg", "midOn", "squareLeg"],
    bowlerType: "Pace",
    situation: "Death overs / Yorker length",
    format: "T20",
    phase: "Death",
    batterStyle: "Aggressive",
  },
  {
    name: "T20 Powerplay",
    description: "Max 2 fielders outside 30-yard circle in powerplay",
    positions: ["slip1", "slip2", "point", "cover", "midOff", "midOn", "squareLeg", "fineLeg", "thirdMan"],
    bowlerType: "Pace",
    situation: "T20 Powerplay (Overs 1-6)",
    format: "T20",
    phase: "Powerplay",
    batterStyle: "Any",
  },
  {
    name: "ODI Middle Overs",
    description: "Ring field: point, cover, extra cover, mid off/on, mid wicket, square leg, fine leg, deep mid wicket",
    positions: ["point", "cover", "extraCover", "midOff", "midOn", "midWicket", "squareLeg", "fineLeg", "deepMidWicket"],
    bowlerType: "Spin",
    situation: "Middle overs / Contain",
    format: "ODI",
    phase: "Middle",
    batterStyle: "Anchor",
  },
];

function suggestPreset(
  format: string,
  phase: string,
  bowlerType: string,
  batterStyle: string
): { setup: FieldSetup; explanation: string } {
  const phaseLower = phase.toLowerCase();
  const formatLower = format.toLowerCase();

  if (formatLower === "t20" && phaseLower === "powerplay" && bowlerType === "Pace") {
    const setup = presetSetups.find((s) => s.name === "T20 Powerplay") ?? presetSetups[0];
    return {
      setup,
      explanation:
        "In T20 powerplay only 2 fielders can be outside the 30-yard circle. This preset uses slips, point, cover, mid off/on, square leg, fine leg, and third man.",
    };
  }
  if (phaseLower === "death" && bowlerType === "Pace") {
    const setup = presetSetups.find((s) => s.name === "Yorker Setup") ?? presetSetups[3];
    return {
      setup,
      explanation:
        "At the death, protect the boundary with fielders in the ring and at long off, long on, deep mid wicket, deep square leg. Bowl yorkers and slower balls.",
    };
  }
  if (phaseLower === "death" && bowlerType === "Spin") {
    const setup = presetSetups.find((s) => s.name === "Defensive (Death Overs)") ?? presetSetups[1];
    return {
      setup,
      explanation:
        "Death overs with spin: keep boundary riders and one in the ring; bowl into the pitch or wide to restrict big hits.",
    };
  }
  if (bowlerType === "Spin" && (phaseLower === "middle" || phaseLower === "powerplay")) {
    const setup = presetSetups.find((s) => s.name === "Spin Attack") ?? presetSetups[2];
    return {
      setup,
      explanation:
        "Spin attack: fwd short leg, short leg, slip, and boundary riders (long on, deep mid wicket). Encourages false shots.",
    };
  }
  if (phaseLower === "powerplay") {
    const setup = presetSetups.find((s) => s.name === "Attacking (New Ball)") ?? presetSetups[0];
    return {
      setup,
      explanation:
        "New-ball attacking field: three slips, gully, point, cover, mid off, mid on, fine leg. Looks for edges and lbw.",
    };
  }
  const setup = presetSetups.find((s) => s.name === "ODI Middle Overs") ?? presetSetups[2];
  return {
    setup,
    explanation:
      "Middle-overs ring field: point, cover, mid off, mid on, mid wicket, square leg, fine leg, with one deep. Aim to contain and build pressure.",
  };
}

export function FieldPlacementContent() {
  const [positions, setPositions] = useState<FieldPosition[]>(
    allPositions.map((p) => ({
      ...p,
      occupied: presetSetups[0].positions.includes(p.id),
    }))
  );
  const [selectedSetup, setSelectedSetup] = useState<string>(presetSetups[0].name);
  const [currentSetup, setCurrentSetup] = useState<FieldSetup>(presetSetups[0]);
  const [suggestExplanation, setSuggestExplanation] = useState<string | null>(null);

  const [format, setFormat] = useState<string>("T20");
  const [phase, setPhase] = useState<string>("Powerplay");
  const [bowlerType, setBowlerType] = useState<string>("Pace");
  const [batterStyle, setBatterStyle] = useState<string>("Aggressive");

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const togglePosition = (id: string) => {
    const occupiedCount = positions.filter((p) => p.occupied).length;
    const position = positions.find((p) => p.id === id);

    if (position?.occupied) {
      setPositions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, occupied: false } : p))
      );
      setSelectedSetup("");
    } else if (occupiedCount < 9) {
      setPositions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, occupied: true } : p))
      );
      setSelectedSetup("");
    }
  };

  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!draggingId || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const viewBox = { width: 100, height: 100 };
      const x = ((e.clientX - rect.left) / rect.width) * viewBox.width;
      const y = ((e.clientY - rect.top) / rect.height) * viewBox.height;
      const clampedX = Math.max(5, Math.min(95, x));
      const clampedY = Math.max(5, Math.min(95, y));
      setPositions((prev) =>
        prev.map((p) =>
          p.id === draggingId ? { ...p, x: clampedX, y: clampedY } : p
        )
      );
    },
    [draggingId]
  );

  const handleSvgMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  const loadPreset = (setup: FieldSetup) => {
    setPositions(
      allPositions.map((p) => ({
        ...p,
        occupied: setup.positions.includes(p.id),
      }))
    );
    setSelectedSetup(setup.name);
    setCurrentSetup(setup);
  };

  const handleSuggestField = () => {
    const { setup, explanation } = suggestPreset(
      format,
      phase,
      bowlerType,
      batterStyle
    );
    loadPreset(setup);
    setSuggestExplanation(explanation);
  };

  const resetField = () => {
    setPositions(allPositions.map((p) => ({ ...p, occupied: false })));
    setSelectedSetup("");
    setSuggestExplanation(null);
  };

  const occupiedCount = positions.filter((p) => p.occupied).length;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Field Visualization */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Cricket Field
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={occupiedCount === 9 ? "default" : "outline"}>
                {occupiedCount}/9 fielders
              </Badge>
              <Button variant="ghost" size="sm" onClick={resetField}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square max-w-xl mx-auto">
              <svg
                ref={svgRef}
                viewBox="0 0 100 100"
                className="w-full h-full select-none"
                onMouseMove={handleSvgMouseMove}
                onMouseUp={handleSvgMouseUp}
                onMouseLeave={handleSvgMouseUp}
              >
                {/* Boundary — single clean green circle */}
                <circle cx="50" cy="50" r="48" fill="#15803d" stroke="#166534" strokeWidth="0.8" />
                {/* 30-yard circle */}
                <circle cx="50" cy="50" r="25" fill="none" stroke="#fff" strokeWidth="0.4" strokeDasharray="3,2" opacity="0.6" />
                {/* Pitch — simple strip */}
                <rect x="47.5" y="32" width="5" height="36" fill="#f5f5dc" stroke="#78716c" strokeWidth="0.3" />
                <line x1="47.5" y1="35" x2="52.5" y2="35" stroke="#78716c" strokeWidth="0.2" />
                <line x1="47.5" y1="65" x2="52.5" y2="65" stroke="#78716c" strokeWidth="0.2" />
                {/* Direction of play */}
                <defs>
                  <marker id="arrowhead" markerWidth="3.5" markerHeight="2.5" refX="2.5" refY="1.25" orient="auto">
                    <polygon points="0 0, 3.5 1.25, 0 2.5" fill="#b91c1c" />
                  </marker>
                </defs>
                <line x1="50" y1="64" x2="50" y2="36" stroke="#b91c1c" strokeWidth="0.4" markerEnd="url(#arrowhead)" opacity="0.8" />
                {/* Batter & Bowler — minimal */}
                <circle cx="50" cy="32" r="2" fill="#1c1917" stroke="#fff" strokeWidth="0.25" />
                <text x="50" y="27.5" textAnchor="middle" fill="#fff" fontSize="1.8" fontWeight="600">Batter</text>
                <circle cx="50" cy="68" r="2" fill="#ca8a04" stroke="#1c1917" strokeWidth="0.25" />
                <text x="50" y="72.5" textAnchor="middle" fill="#fff" fontSize="1.8" fontWeight="600">Bowler</text>
                <circle cx="50" cy="26" r="1" fill="#2563eb" stroke="#fff" strokeWidth="0.2" />
                <text x="50" y="23" textAnchor="middle" fill="#fff" fontSize="1.3">Keeper</text>
                {/* Off / Leg — subtle */}
                <text x="22" y="50" textAnchor="middle" fill="#fff" fontSize="2" fontWeight="500" opacity="0.75">Off</text>
                <text x="78" y="50" textAnchor="middle" fill="#fff" fontSize="2" fontWeight="500" opacity="0.75">Leg</text>

                {/* Only placed fielders — clean white circles + labels */}
                {positions.filter((p) => p.occupied).map((pos) => (
                  <g
                    key={pos.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setDraggingId(pos.id);
                    }}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <circle cx={pos.x} cy={pos.y} r={6} fill="transparent" className="pointer-events-auto" />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={2.2}
                      fill="#fff"
                      stroke="#1e3a5f"
                      strokeWidth="0.45"
                      className="pointer-events-none"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 5.5}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="1.9"
                      fontWeight="600"
                      className="pointer-events-none"
                    >
                      {pos.name.length > 14 ? pos.name.slice(0, 12) + "…" : pos.name}
                    </text>
                  </g>
                ))}
              </svg>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Use the list on the right to add or remove fielders (max 9). Drag a white circle to move it.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Place fielders by name — easier than clicking small dots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5" />
              Place fielders
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Click a position name to add or remove a fielder ({occupiedCount}/9).
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {positions.map((pos) => {
                const occupied = pos.occupied;
                const canAdd = occupiedCount < 9 || occupied;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => canAdd && togglePosition(pos.id)}
                    disabled={!canAdd && !occupied}
                    className={`
                      text-left px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${occupied
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : canAdd
                          ? "bg-muted hover:bg-muted/80 text-foreground"
                          : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                      }
                    `}
                  >
                    {pos.name}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls: Format, Phase, Bowler type, Batter style + Suggest field */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Context
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Set format, phase, bowler type, and batter style. Use &quot;Suggest field&quot; to load a preset.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T20">T20</SelectItem>
                  <SelectItem value="ODI">ODI</SelectItem>
                  <SelectItem value="Test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phase</Label>
              <Select value={phase} onValueChange={setPhase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Powerplay">Powerplay</SelectItem>
                  <SelectItem value="Middle">Middle</SelectItem>
                  <SelectItem value="Death">Death</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bowler type</Label>
              <Select value={bowlerType} onValueChange={setBowlerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pace">Pace</SelectItem>
                  <SelectItem value="Spin">Spin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Batter style</Label>
              <Select value={batterStyle} onValueChange={setBatterStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aggressive">Aggressive</SelectItem>
                  <SelectItem value="Anchor">Anchor</SelectItem>
                  <SelectItem value="Any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSuggestField} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Suggest field
            </Button>
            {suggestExplanation && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm text-muted-foreground">{suggestExplanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Field Presets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Load Preset</Label>
              <Select
                value={selectedSetup}
                onValueChange={(value) => {
                  const setup = presetSetups.find((s) => s.name === value);
                  if (setup) loadPreset(setup);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  {presetSetups.map((setup) => (
                    <SelectItem key={setup.name} value={setup.name}>
                      {setup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 space-y-3">
              {presetSetups.map((setup) => (
                <Button
                  key={setup.name}
                  variant={selectedSetup === setup.name ? "default" : "outline"}
                  className="w-full justify-start h-auto py-3 px-4"
                  onClick={() => loadPreset(setup)}
                >
                  <div className="text-left">
                    <p className="font-medium">{setup.name}</p>
                    <p className="text-xs opacity-70 mt-0.5">{setup.situation}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedSetup && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Setup Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">{currentSetup.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentSetup.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{currentSetup.bowlerType}</Badge>
                <Badge variant="secondary">{currentSetup.situation}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Active Positions:</p>
                <div className="flex flex-wrap gap-1">
                  {positions
                    .filter((p) => p.occupied)
                    .map((p) => (
                      <Badge key={p.id} variant="outline" className="text-xs">
                        {p.name}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">
              <strong className="text-foreground">Tip:</strong> In limited overs,
              only 2 fielders are allowed outside the 30-yard circle during powerplay.
              The dashed circle shows this boundary.
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-2 mb-1">Position terms:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li><strong>Short / Silly</strong> — nearer / very near the batter</li>
              <li><strong>Deep</strong> — further from batter (towards boundary)</li>
              <li><strong>Wide / Fine</strong> — further from / nearer the line of the pitch</li>
              <li><strong>Square</strong> — in line with batter&apos;s crease</li>
              <li><strong>Backward / Forward</strong> — behind / in front of batter&apos;s crease</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
