"use client";

import { isBehavioralEnabled, isChatEnabled } from "@/lib/ai-features";
import { BehavioralProvider } from "./behavioral-provider";
import { ChatWidget } from "./chat-widget";

/**
 * Mounts AI enhancement layers only when their feature flags are on.
 * No impact on core app when all flags are false.
 * Rollback: set NEXT_PUBLIC_AI_* to false; or remove <AILayers /> from layout.
 */
export function AILayers() {
  const behavioral = isBehavioralEnabled();
  const chat = isChatEnabled();
  if (!behavioral && !chat) return null;
  return (
    <>
      {behavioral && <BehavioralProvider />}
      {chat && <ChatWidget />}
    </>
  );
}
