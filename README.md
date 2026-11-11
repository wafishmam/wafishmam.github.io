# wafishmam.github.io

Personal portfolio. Static [Astro](https://astro.build) site, deployed to GitHub Pages by GitHub Actions.

- **Copy, featured projects, hidden repos:** `src/data/site.ts`
- **Page:** `src/pages/index.astro` · **Styles:** `src/styles/global.css`
- **GitHub data** is fetched at build time (`src/lib/github.ts`), so repos are in the HTML for search engines and there are no client rate-limit failures. The "wire" panel also refreshes from the GitHub API in the browser.
- The workflow rebuilds on every push to `main` and once a day.

## Local

```bash
npm install
npm run dev
```

Offline preview with sample data: `GITHUB_FIXTURE=path/to/fixture.json npm run build` where the file is `{ "repos": [...], "events": [...] }` in GitHub API shape.

## One-time setup

Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
