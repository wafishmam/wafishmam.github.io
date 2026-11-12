// Decides what goes in the A block and how each entry reads.
import type { Repo, RepoFiles } from "./github";
import type { Pin } from "../data/site";

export type FeatureEntry = {
  repo: Repo | null;
  name: string;
  title: string;
  blurb: string;
  tags: string[];
  isNew: boolean;
};

type Options = {
  repos: Repo[];
  pinned: Pin[];
  overrides: Record<string, Omit<Pin, "repo">>;
  exclude: Set<string>;
  auto: { count: number; maxAgeDays: number; topic: string };
  now: number;
};

/** Pick featured repos: newest work first, then pins, then topic-pinned repos. */
export function pickFeatured(o: Options): { name: string; pin?: Pin; isNew: boolean }[] {
  const byName = new Map(o.repos.map((r) => [r.name, r]));
  const pinnedNames = new Set(o.pinned.map((p) => p.repo));
  const eligible = o.repos.filter((r) => !r.fork && !r.archived && !o.exclude.has(r.name));

  const fresh = o.auto.count > 0
    ? eligible
        .filter((r) => !pinnedNames.has(r.name))
        .filter((r) => (o.now - Date.parse(r.created_at)) / 86400000 <= o.auto.maxAgeDays)
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .slice(0, o.auto.count)
    : [];

  const out: { name: string; pin?: Pin; isNew: boolean }[] = [];
  const seen = new Set<string>();
  const add = (name: string, isNew: boolean, pin?: Pin) => {
    if (seen.has(name)) return;
    seen.add(name);
    out.push({ name, pin: pin ?? (o.overrides[name] ? { repo: name, ...o.overrides[name] } : undefined), isNew });
  };
  fresh.forEach((r) => add(r.name, true));
  // Pins stay even if GitHub didn't answer at build time (byName is empty then).
  o.pinned.forEach((p) => (byName.has(p.repo) || o.repos.length === 0) && add(p.repo, false, p));
  eligible.filter((r) => r.topics?.includes(o.auto.topic)).forEach((r) => add(r.name, false));
  return out;
}

export function describe(name: string, repo: Repo | null, files: RepoFiles | null, pin: Pin | undefined, isNew: boolean): FeatureEntry {
  const readme = files?.readme ? parseReadme(files.readme) : { title: null, blurb: null };
  const tags =
    pin?.tags ??
    (repo?.topics?.filter((t) => t !== "featured").length
      ? repo.topics.filter((t) => t !== "featured").map(prettyTopic)
      : inferTags(repo, files));
  return {
    repo,
    name,
    title: pin?.title ?? readme.title ?? titleCase(name),
    blurb: pin?.blurb ?? repo?.description ?? readme.blurb ?? "",
    tags: tags.slice(0, 6),
    isNew,
  };
}

/** First `# Heading` (before any colon) and the first prose paragraph after it. */
export function parseReadme(md: string): { title: string | null; blurb: string | null } {
  const text = md.replace(/<!--[\s\S]*?-->/g, "").replace(/\r/g, "");
  const lines = text.split("\n");
  const h1i = lines.findIndex((l) => /^#\s+\S/.test(l));
  let title: string | null = null;
  if (h1i >= 0) {
    title = clean(lines[h1i].replace(/^#\s+/, "")).split(/\s*[:|–—]\s+/)[0].trim() || null;
  }
  const blocks = lines.slice(h1i + 1).join("\n").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  let blurb: string | null = null;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (/^(#|!\[|\[!\[|```|\||---|<|- |\* |\d+\. )/.test(b)) {
      if (/^#/.test(b)) break; // stop at the first sub-heading
      continue;
    }
    blurb = clean(b.replace(/^>\s?/gm, ""));
    // "explores one question:" followed by a quote — join them.
    if (blurb.endsWith(":") && blocks[i + 1]?.startsWith(">")) {
      blurb += " " + clean(blocks[i + 1].replace(/^>\s?/gm, ""));
    }
    break;
  }
  return { title, blurb: blurb ? truncate(blurb, 280) : null };
}

const clean = (s: string) =>
  s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/[*_`]/g, "")
    .replace(/\p{Extended_Pictographic}️?/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (s: string, n: number) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n)) + "…");

const titleCase = (name: string) =>
  name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const prettyTopic = (t: string) => KNOWN[t] ?? titleCase(t);

// Dependency or topic name -> how it reads on the page. Unknown deps are skipped.
const KNOWN: Record<string, string> = {
  react: "React", next: "Next.js", astro: "Astro", vue: "Vue", svelte: "Svelte",
  "@angular/core": "Angular", vite: "Vite", motion: "Motion", "framer-motion": "Motion",
  tailwindcss: "Tailwind", three: "Three.js", d3: "D3", graphql: "GraphQL",
  express: "Express", fastify: "Fastify", "@anthropic-ai/sdk": "Claude API",
  fastapi: "FastAPI", flask: "Flask", django: "Django", langgraph: "LangGraph",
  langchain: "LangChain", chromadb: "ChromaDB", anthropic: "Claude API", boto3: "AWS",
  typescript: "TypeScript", nextjs: "Next.js", reactjs: "React",
};

function inferTags(repo: Repo | null, files: RepoFiles | null): string[] {
  const tags: string[] = [];
  const push = (t: string | undefined | null) => t && !tags.includes(t) && tags.push(t);
  if (files?.packageJson) {
    try {
      const pkg = JSON.parse(files.packageJson);
      const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
      deps.forEach((d) => push(KNOWN[d]));
    } catch { /* not JSON */ }
  }
  if (files?.requirements) {
    files.requirements.split("\n").forEach((l) => push(KNOWN[l.split(/[=<>~\[ ;]/)[0].trim().toLowerCase()]));
  }
  // The language already has its own column; order the rest as listed in KNOWN.
  const order = Object.values(KNOWN);
  return tags.filter((t) => t !== repo?.language).sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
