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
  created_at: string;
  fork: boolean;
  archived?: boolean;
  homepage?: string | null;
  topics?: string[];
};

export type GithubData = { repos: Repo[]; feed: FeedItem[]; ok: boolean; fetchedAt: string };

async function gh<T>(path: string, raw = false): Promise<T> {
  const headers: Record<string, string> = {
    Accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json",
    "User-Agent": "portfolio-build",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${path} -> ${res.status}`);
  return (raw ? await res.text() : await res.json()) as T;
}

let cache: Promise<GithubData> | undefined;
let fixtureData: Promise<any> | undefined;
const loadFixture = (path: string) =>
  (fixtureData ??= readFile(path, "utf8").then((t) => JSON.parse(t)));

export function getGithubData(user: string): Promise<GithubData> {
  cache ??= load(user);
  return cache;
}

async function load(user: string): Promise<GithubData> {
  const fetchedAt = new Date().toISOString();
  const fixture = process.env.GITHUB_FIXTURE;
  try {
    const [repos, events] = fixture
      ? await loadFixture(fixture).then((j) => [j.repos, j.events] as [Repo[], any[]])
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

/** Raw files used to describe a featured repo. Missing files come back as null. */
export type RepoFiles = { readme: string | null; packageJson: string | null; requirements: string | null };

export async function getRepoFiles(user: string, repo: string): Promise<RepoFiles> {
  const fixture = process.env.GITHUB_FIXTURE;
  if (fixture) {
    const j = await loadFixture(fixture);
    const f = j.files?.[repo] ?? {};
    return { readme: f.readme ?? null, packageJson: f.packageJson ?? null, requirements: f.requirements ?? null };
  }
  const get = (path: string) => gh<string>(path, true).catch(() => null);
  const [readme, packageJson, requirements] = await Promise.all([
    get(`/repos/${user}/${repo}/readme`),
    get(`/repos/${user}/${repo}/contents/package.json`),
    get(`/repos/${user}/${repo}/contents/requirements.txt`),
  ]);
  return { readme, packageJson, requirements };
}
