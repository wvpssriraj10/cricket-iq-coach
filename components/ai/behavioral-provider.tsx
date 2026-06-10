"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isBehavioralEnabled } from "@/lib/ai-features";
import { startBehavioralTracking } from "@/lib/behavioral-tracking";

/**
 * Mounts anonymous behavioral tracking when NEXT_PUBLIC_AI_BEHAVIORAL_ENABLED=true.
 * No UI. No interference with rendering. Fire-and-forget.
 * Rollback: set env to false; remove this component from AILayers.
 */
export function BehavioralProvider() {
  const pathname = usePathname();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isBehavioralEnabled() || !pathname) return;
    cleanupRef.current = startBehavioralTracking(pathname);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [pathname]);

  return null;
}
