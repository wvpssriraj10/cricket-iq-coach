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
import { Map, Users, RotateCcw, Lightbulb, Sparkles, Zap, Info, ChevronRight } from "lucide-react";

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

// Fixed coordinates for a pitch at x=50, y=32 (Batter) to y=68 (Bowler)
// Off side = left (x < 50), Leg side = right (x > 50)
const allPositions: FieldPosition[] = [
  // Off side
  { id: "thirdMan", name: "Third Man", x: 20, y: 12, occupied: false },
  { id: "shortThirdMan", name: "Short Third", x: 30, y: 18, occupied: false },
  { id: "slip1", name: "1st Slip", x: 43, y: 20, occupied: false },
  { id: "slip2", name: "2nd Slip", x: 38, y: 21, occupied: false },
  { id: "slip3", name: "3rd Slip", x: 33, y: 22, occupied: false },
  { id: "gully", name: "Gully", x: 25, y: 28, occupied: false },
  { id: "deepBackPoint", name: "Deep Back Point", x: 12, y: 25, occupied: false },
  { id: "point", name: "Point", x: 20, y: 36, occupied: false },
  { id: "deepPoint", name: "Deep Point", x: 10, y: 36, occupied: false },
  { id: "cover", name: "Cover", x: 22, y: 48, occupied: false },
  { id: "deepCover", name: "Deep Cover", x: 12, y: 48, occupied: false },
  { id: "extraCover", name: "Extra Cover", x: 28, y: 55, occupied: false },
  { id: "deepExtraCover", name: "Deep Extra Cover", x: 15, y: 58, occupied: false },
  { id: "midOff", name: "Mid-Off", x: 35, y: 62, occupied: false },
  { id: "longOff", name: "Long Off", x: 30, y: 85, occupied: false },

  // Leg side
  { id: "fineLeg", name: "Fine Leg", x: 80, y: 12, occupied: false },
  { id: "shortFineLeg", name: "Short Fine Leg", x: 65, y: 18, occupied: false },
  { id: "legSlip", name: "Leg Slip", x: 57, y: 22, occupied: false },
  { id: "shortLeg", name: "Short Leg", x: 60, y: 30, occupied: false },
  { id: "fwdShortLeg", name: "Fwd Short Leg", x: 62, y: 36, occupied: false },
  { id: "backwardSqLeg", name: "Back Sq Leg", x: 75, y: 28, occupied: false },
  { id: "deepBackSqLeg", name: "Deep Back Sq", x: 88, y: 25, occupied: false },
  { id: "squareLeg", name: "Square Leg", x: 80, y: 36, occupied: false },
  { id: "deepSquare", name: "Deep Square", x: 90, y: 36, occupied: false },
  { id: "forwardSqLeg", name: "Fwd Sq Leg", x: 78, y: 42, occupied: false },
  { id: "midWicket", name: "Mid-Wicket", x: 70, y: 50, occupied: false },
  { id: "deepMidWicket", name: "Deep Mid-Wicket", x: 85, y: 55, occupied: false },
  { id: "midOn", name: "Mid-On", x: 65, y: 62, occupied: false },
  { id: "longOn", name: "Long On", x: 70, y: 85, occupied: false },
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
    positions: ["slip1", "slip2", "point", "cover", "midOff", "midOn", "squareLeg", "shortFineLeg", "shortThirdMan"],
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
        "In T20 powerplay only 2 fielders can be outside the 30-yard circle. This preset uses slips, point, cover, mid off/on, square leg, short fine leg, and short third man.",
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

const PHASE_COLORS: Record<string, string> = {
  Powerplay: "#22c55e",
  Middle: "#f59e0b",
  Death: "#ef4444",
};

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
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null);

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
  const phaseColor = PHASE_COLORS[phase] ?? "#22c55e";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Field Visualization & Positions */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              Live Canvas
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={occupiedCount === 9 ? "default" : "secondary"}>
                {occupiedCount}/9 fielders
              </Badge>
              <Button variant="outline" size="sm" onClick={resetField}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Removed the hardcoded black background so it matches the light/dark theme seamlessly */}
            <div className="rounded-xl overflow-hidden p-4 sm:p-8 flex items-center justify-center">
              <div className="relative aspect-square w-full max-w-2xl mx-auto">
                <svg
                  ref={svgRef}
                  viewBox="0 0 100 100"
                  className="w-full h-full select-none"
                  onMouseMove={handleSvgMouseMove}
                  onMouseUp={handleSvgMouseUp}
                  onMouseLeave={handleSvgMouseUp}
                >
                  <defs>
                    <radialGradient id="grassGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1a6b38" />
                      <stop offset="60%" stopColor="#155c30" />
                      <stop offset="100%" stopColor="#0d4020" />
                    </radialGradient>
                    <radialGradient id="pitchGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#e8d5b0" />
                      <stop offset="100%" stopColor="#c4a87a" />
                    </radialGradient>
                    <filter id="fielderGlow">
                      <feGaussianBlur stdDeviation="0.8" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.6)" />
                    </filter>
                    <marker id="arrow" markerWidth="4" markerHeight="3" refX="3" refY="1.5" orient="auto">
                      <polygon points="0 0, 4 1.5, 0 3" fill="rgba(239,68,68,0.7)" />
                    </marker>
                  </defs>

                  {/* Outfield */}
                  <circle cx="50" cy="50" r="48" fill="url(#grassGrad)" filter="url(#shadow)" />

                  {/* Mowing pattern rings */}
                  {[38, 32, 26, 20].map((r, i) => (
                    <circle key={i} cx="50" cy="50" r={r}
                      fill="none"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="3" />
                  ))}

                  {/* Boundary */}
                  <circle cx="50" cy="50" r="48"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="0.5" />

                  {/* 30-yard circle */}
                  <circle cx="50" cy="50" r="26"
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="0.35"
                    strokeDasharray="2.5,2"
                    opacity="0.7" />

                  {/* Phase arc indicator at top */}
                  <path
                    d={`M 2 50 A 48 48 0 0 1 98 50`}
                    fill="none"
                    stroke={phaseColor}
                    strokeWidth="1.2"
                    strokeOpacity="0.5"
                    strokeLinecap="round"
                  />

                  {/* Pitch */}
                  <rect x="47.5" y="32" width="5" height="36"
                    fill="url(#pitchGrad)"
                    rx="0.5"
                    filter="url(#shadow)" />

                  {/* Crease lines */}
                  <line x1="47.2" y1="35.5" x2="52.8" y2="35.5" stroke="#8b6914" strokeWidth="0.35" />
                  <line x1="47.2" y1="64.5" x2="52.8" y2="64.5" stroke="#8b6914" strokeWidth="0.35" />
                  <line x1="47.2" y1="37" x2="52.8" y2="37" stroke="rgba(255,255,255,0.5)" strokeWidth="0.2" />
                  <line x1="47.2" y1="63" x2="52.8" y2="63" stroke="rgba(255,255,255,0.5)" strokeWidth="0.2" />

                  {/* Stumps */}
                  {[-0.5, 0, 0.5].map((dx, i) => (
                    <line key={i} x1={50 + dx} y1="35.5" x2={50 + dx} y2="37"
                      stroke="rgba(255,255,255,0.8)" strokeWidth="0.2" />
                  ))}
                  {[-0.5, 0, 0.5].map((dx, i) => (
                    <line key={i} x1={50 + dx} y1="63" x2={50 + dx} y2="64.5"
                      stroke="rgba(255,255,255,0.8)" strokeWidth="0.2" />
                  ))}

                  {/* Direction of play arrow */}
                  <line x1="50" y1="63.5" x2="50" y2="37.5"
                    stroke="rgba(239,68,68,0.55)"
                    strokeWidth="0.4"
                    strokeDasharray="1.5,1"
                    markerEnd="url(#arrow)" />

                  {/* Keeper */}
                  <circle cx="50" cy="23" r="1.6"
                    fill="#2563eb"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.3"
                    filter="url(#shadow)" />
                  <text x="50" y="20" textAnchor="middle" fill="rgba(147,197,253,0.9)"
                    fontSize="1.5" fontWeight="700" fontFamily="system-ui">WK</text>

                  {/* Batter dot */}
                  <circle cx="50" cy="31.5" r="1.8"
                    fill="#1e293b"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="0.35" />
                  <circle cx="50" cy="31.5" r="0.7" fill="rgba(255,255,255,0.9)" />
                  <text x="50" y="29" textAnchor="middle" fill="rgba(255,255,255,0.8)"
                    fontSize="1.2" fontWeight="600" fontFamily="system-ui">BAT</text>

                  {/* Bowler dot */}
                  <circle cx="50" cy="68" r="1.8"
                    fill="#ca8a04"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="0.3"
                    filter="url(#shadow)" />
                  <text x="50" y="72.5" textAnchor="middle" fill="rgba(253,224,71,0.8)"
                    fontSize="1.4" fontWeight="700" fontFamily="system-ui">BWL</text>

                  {/* Side labels */}
                  <text x="12" y="52" textAnchor="middle" fill="rgba(255,255,255,0.2)"
                    fontSize="2.2" fontWeight="800" fontFamily="system-ui" letterSpacing="0.1em">OFF</text>
                  <text x="88" y="52" textAnchor="middle" fill="rgba(255,255,255,0.2)"
                    fontSize="2.2" fontWeight="800" fontFamily="system-ui" letterSpacing="0.1em">LEG</text>

                  {/* Occupied fielders */}
                  {positions.filter((p) => p.occupied).map((pos) => {
                    const isHovered = hoveredPosition === pos.id;
                    const isDragging = draggingId === pos.id;
                    return (
                      <g
                        key={pos.id}
                        onMouseDown={(e) => { e.preventDefault(); setDraggingId(pos.id); }}
                        onMouseEnter={() => setHoveredPosition(pos.id)}
                        onMouseLeave={() => setHoveredPosition(null)}
                        style={{ cursor: isDragging ? "grabbing" : "grab" }}
                      >
                        {/* Hit area */}
                        <circle cx={pos.x} cy={pos.y} r={7} fill="transparent" />

                        {/* Glow when hovered/dragging */}
                        {(isHovered || isDragging) && (
                          <circle cx={pos.x} cy={pos.y} r={3.8}
                            fill="rgba(34,197,94,0.2)"
                            stroke="rgba(34,197,94,0.5)"
                            strokeWidth="0.4" />
                        )}

                        {/* Fielder circle */}
                        <circle
                          cx={pos.x} cy={pos.y} r={2.4}
                          fill={isHovered || isDragging ? "#86efac" : "#ffffff"}
                          stroke={isHovered || isDragging ? "#16a34a" : "rgba(15,23,42,0.8)"}
                          strokeWidth="0.5"
                          filter="url(#shadow)"
                          style={{ transition: "fill 0.15s, stroke 0.15s" }}
                        />

                        {/* Label */}
                        <text
                          x={pos.x}
                          y={pos.y + 5.8}
                          textAnchor="middle"
                          fill={isHovered || isDragging ? "#86efac" : "rgba(255,255,255,0.95)"}
                          fontSize="1.8"
                          fontWeight="600"
                          fontFamily="system-ui"
                          style={{ pointerEvents: "none", transition: "fill 0.15s" }}
                        >
                          {pos.name.length > 13 ? pos.name.slice(0, 11) + "…" : pos.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Place fielders grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Toggle Fielders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
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
                      text-left px-3 py-2 rounded-md text-xs font-medium transition-colors border
                      ${occupied
                        ? "bg-primary text-primary-foreground border-primary"
                        : canAdd
                          ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent"
                          : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed border-transparent"
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

      {/* RIGHT Column: Controls & Context */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Match Context
            </CardTitle>
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
              <div className="grid grid-cols-3 gap-2">
                {["Powerplay", "Middle", "Death"].map((p) => (
                  <Button
                    key={p}
                    variant={phase === p ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setPhase(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bowler Type</Label>
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
              <Label>Batter Style</Label>
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

            <Button onClick={handleSuggestField} className="w-full mt-2 font-semibold">
              <Sparkles className="h-4 w-4 mr-2" />
              Suggest Optimal Field
            </Button>

            {suggestExplanation && (
              <div className="rounded-lg border bg-muted/50 p-3 mt-4 flex gap-2 items-start">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{suggestExplanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Presets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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

            <div className="mt-4 space-y-2">
              {presetSetups.map((setup) => (
                <Button
                  key={setup.name}
                  variant={selectedSetup === setup.name ? "default" : "outline"}
                  className="w-full justify-between h-auto py-2 px-3"
                  onClick={() => loadPreset(setup)}
                >
                  <div className="text-left flex flex-col">
                    <span className="font-medium text-sm">{setup.name}</span>
                    <span className="text-xs opacity-70 mt-0.5">{setup.situation}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
