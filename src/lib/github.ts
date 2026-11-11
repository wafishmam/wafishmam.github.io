// Build-time GitHub data. Runs in Node during `astro build`, never in the browser.
// In GitHub Actions, GITHUB_TOKEN raises the rate limit; locally it's optional.
// GITHUB_FIXTURE=path/to.json lets you preview offline ({ repos: [], events: [] }).
import { readFile } from "node:fs/promises";
import { eventsToFeed, type FeedItem } from "./feed";

export type Repo = {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived?: boolean;
  homepage?: string | null;
};

export type GithubData = { repos: Repo[]; feed: FeedItem[]; ok: boolean; fetchedAt: string };

async function gh<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-build",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

let cache: Promise<GithubData> | undefined;

export function getGithubData(user: string): Promise<GithubData> {
  cache ??= load(user);
  return cache;
}

async function load(user: string): Promise<GithubData> {
  const fetchedAt = new Date().toISOString();
  const fixture = process.env.GITHUB_FIXTURE;
  try {
    const [repos, events] = fixture
      ? await readFile(fixture, "utf8").then((t) => {
          const j = JSON.parse(t);
          return [j.repos, j.events] as [Repo[], any[]];
        })
      : await Promise.all([
          gh<Repo[]>(`/users/${user}/repos?sort=pushed&per_page=100`),
          gh<any[]>(`/users/${user}/events/public?per_page=30`),
        ]);
    return { repos, feed: eventsToFeed(events), ok: true, fetchedAt };
  } catch (err) {
    // Never fail the deploy because GitHub hiccuped; the page has an offline state.
    console.warn(`[github] ${(err as Error).message}; rendering without live data`);
    return { repos: [], feed: [], ok: false, fetchedAt };
  }
}
