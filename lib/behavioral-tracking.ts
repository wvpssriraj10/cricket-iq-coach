/**
 * Behavioral Intelligence Layer — anonymous interaction signals only.
 * No PII, no UI changes, no interference with rendering. Fire-and-forget.
 * See docs/AI_ENHANCEMENT_SPEC.md. Enable via NEXT_PUBLIC_AI_BEHAVIORAL_ENABLED=true.
 */

export type BehavioralEvent = {
  pathname: string;
  scrollDepth: number;
  dwellMs: number;
  prevPath: string | null;
  timestamp: string;
  sessionId: string;
};

const SESSION_ID_KEY = "cricket_iq_ai_sid";
const BATCH_SIZE = 5;
const SEND_INTERVAL_MS = 10000;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let s = sessionStorage.getItem(SESSION_ID_KEY);
  if (!s) {
    s = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_ID_KEY, s);
  }
  return s;
}

let queue: BehavioralEvent[] = [];
let scrollMax = 0;
let enterPathTime = 0;
let prevPath: string | null = null;
let sendTimer: ReturnType<typeof setInterval> | null = null;

function captureScroll(): number {
  if (typeof window === "undefined") return 0;
  const { scrollY, scrollHeight, clientHeight } = document.documentElement;
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0) return 1;
  scrollMax = Math.max(scrollMax, scrollY / maxScroll);
  return Math.min(1, scrollMax);
}

function flush(): void {
  if (queue.length === 0) return;
  const body = JSON.stringify({ events: queue });
  queue = [];
  fetch("/api/ai/behavioral", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* silent; no user impact */
  });
}

function enqueue(pathname: string): void {
  const dwellMs = enterPathTime ? Math.round(Date.now() - enterPathTime) : 0;
  queue.push({
    pathname,
    scrollDepth: captureScroll(),
    dwellMs,
    prevPath,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  });
  if (queue.length >= BATCH_SIZE) flush();
}

export function startBehavioralTracking(currentPathname: string): () => void {
  if (typeof window === "undefined") return () => {};
  const sessionId = getSessionId();
  enterPathTime = Date.now();
  prevPath = null;
  scrollMax = 0;

  const onPopState = () => {
    enqueue(currentPathname);
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      enqueue(currentPathname);
      flush();
    }
  };

  const onBeforeUnload = () => {
    enqueue(currentPathname);
    flush();
  };

  const onScroll = () => {
    captureScroll();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("popstate", onPopState);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("beforeunload", onBeforeUnload);

  if (!sendTimer) {
    sendTimer = setInterval(flush, SEND_INTERVAL_MS);
  }

  return () => {
    enqueue(currentPathname);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("popstate", onPopState);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("beforeunload", onBeforeUnload);
  };
}

export function setPrevPath(path: string | null): void {
  prevPath = path;
}
