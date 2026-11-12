# wafishmam.github.io

Personal portfolio. Static [Astro](https://astro.build) site, deployed to GitHub Pages by GitHub Actions.

- **Copy, featured projects, hidden repos:** `src/data/site.ts`
- **Page:** `src/pages/index.astro` · **Styles:** `src/styles/global.css`
- **GitHub data** is fetched at build time (`src/lib/github.ts`), so repos are in the HTML for search engines and there are no client rate-limit failures. The "wire" panel also refreshes from the GitHub API in the browser.
- The workflow rebuilds on every push to `main` and every 6 hours. To show a new project right away, run it from the **Actions** tab (Deploy to GitHub Pages → Run workflow).

## How projects get featured

The top of the rundown (A block) fills itself:

1. **Newest work:** your 2 most recently created public repos (from the last year) are featured with a "New" flag. Nothing to edit.
2. **Pinned:** repos listed in `pinned` in `src/data/site.ts` stay featured permanently.
3. **Topic:** add the topic `featured` to any repo on GitHub to pin it without touching this code.

Titles and blurbs come from the repo's README (first heading and first paragraph) or its GitHub description; tags come from topics or dependencies. Override any of them in `overrides` in `src/data/site.ts`. Hide a repo with `excludeRepos`.

## Local

```bash
npm install
npm run dev
```

Offline preview with sample data: `GITHUB_FIXTURE=path/to/fixture.json npm run build` where the file is `{ "repos": [...], "events": [...] }` in GitHub API shape.

## One-time setup

Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
