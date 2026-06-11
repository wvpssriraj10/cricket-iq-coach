"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

export function MagicCard({
  children,
  className,
  gradientSize = 250,
  gradientColor = "59, 130, 246", // blue-500
  gradientOpacity = 0.15,
  ...props
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md",
        className
      )}
      {...props}
    >
      {/* Background Spotlight */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500",
          isHovered && "opacity-100"
        )}
        style={{
          background: `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(${gradientColor}, ${gradientOpacity}), transparent 100%)`,
        }}
      />
      
      {/* Border Spotlight */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0 rounded-xl opacity-0 transition-opacity duration-500",
          isHovered && "opacity-100"
        )}
        style={{
          background: `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(${gradientColor}, ${gradientOpacity * 3}), transparent 100%)`,
          maskImage: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskImage: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />
      
      <div className="relative z-10 w-full h-full flex flex-col">{children}</div>
    </div>
  );
}