// Pure helpers shared by the build (server) and the browser refresh.

export type FeedItem = { text: string; at: string; url: string };

type GhEvent = {
  type: string;
  created_at: string;
  repo?: { name?: string };
  payload?: {
    size?: number;
    commits?: unknown[];
    ref_type?: string;
    action?: string;
    release?: { tag_name?: string };
  };
};

export function eventsToFeed(events: GhEvent[], limit = 6): FeedItem[] {
  const out: FeedItem[] = [];
  for (const e of events) {
    const full = e.repo?.name ?? "";
    const repo = full.split("/")[1] ?? full;
    let text: string | null = null;
    switch (e.type) {
      case "PushEvent": {
        const n = e.payload?.size ?? e.payload?.commits?.length ?? 0;
        text = n > 0 ? `Pushed ${n} commit${n === 1 ? "" : "s"} to ${repo}` : `Pushed to ${repo}`;
        break;
      }
      case "CreateEvent":
        if (e.payload?.ref_type === "repository") text = `Created ${repo}`;
        break;
      case "PullRequestEvent":
        text = `${cap(e.payload?.action ?? "updated")} a pull request in ${repo}`;
        break;
      case "IssuesEvent":
        text = `${cap(e.payload?.action ?? "updated")} an issue in ${repo}`;
        break;
      case "WatchEvent":
        text = `Starred ${full}`;
        break;
      case "ReleaseEvent":
        text = `Released ${e.payload?.release?.tag_name ?? ""} in ${repo}`;
        break;
    }
    if (text) out.push({ text, at: e.created_at, url: `https://github.com/${full}` });
    if (out.length >= limit) break;
  }
  return out;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function relTime(iso: string, now = Date.now()): string {
  const s = (now - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  if (s < 31536000) return `${Math.floor(s / 2592000)}mo ago`;
  return `${Math.floor(s / 31536000)}y ago`;
}

export type Status = "live" | "ready" | "archive";

/** Rundown status, derived from the last push — never hand-set. */
export function statusFor(pushedAt: string, now = Date.now()): Status {
  const days = (now - new Date(pushedAt).getTime()) / 86400000;
  if (days <= 14) return "live";
  if (days <= 365) return "ready";
  return "archive";
}

export const STATUS_LABEL: Record<Status, string> = {
  live: "On air",
  ready: "Ready",
  archive: "Archive",
};
