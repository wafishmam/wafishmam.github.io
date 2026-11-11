// Everything a visitor reads that isn't pulled from GitHub lives here.
// Edit this file to change copy, featured projects, or hidden repos.

export const site = {
  name: "Wafi",
  role: "Software Engineer",
  location: "New York / NJ",
  githubUsername: "wafishmam",
  linkedinUrl: "https://www.linkedin.com/in/wafi-ishmam-240146199/",
  email: "wafishmam@gmail.com",
  description:
    "Software engineer building live news experiences. React, TypeScript, Next.js, AWS, and AI-native systems.",

  headline: "Building live news experiences for millions of viewers.",
  intro:
    "I'm a full-stack software engineer at NBCUniversal, where I build election coverage and interactive products for NBCNews.com and Telemundo.com. I work across React, TypeScript, Next.js, and AWS.",
  sideProjects:
    "I'm also deeply interested in AI, especially in finding practical ways it can boost productivity and make everyday work easier. On the side, I build AI-powered projects that put language models to work. Most recently, I built a research agent that investigates news topics, and I'm currently developing a sentiment dashboard that ingests articles and scores how coverage is trending.",
};

export type Featured = {
  repo: string;
  title: string;
  blurb: string;
  tags: string[];
};

export const featured: Featured[] = [
  {
    repo: "news-research-agent",
    title: "News Research Agent",
    blurb:
      "An agentic research assistant for news topics. Built with LangGraph orchestration, ChromaDB retrieval, Tavily search, and Claude Haiku, served by a FastAPI backend with a lightweight React frontend.",
    tags: ["LangGraph", "ChromaDB", "FastAPI", "React", "Claude"],
  },
  {
    repo: "content-pulse",
    title: "Content Pulse",
    blurb:
      "A media sentiment dashboard that ingests articles through AWS SQS, scores them with Claude Haiku, and visualizes trends in a React/Vite frontend over SQLite.",
    tags: ["FastAPI", "AWS SQS", "Claude", "SQLite", "React"],
  },
];

// Hidden from the repository list (forks are excluded automatically).
export const excludeRepos = [
  "wafishmam.github.io",
  "banking-auth-system",
  "UCL-2020-21",
  "UCL",
  "Flask-project",
  "buzzfeed",
  "vip-project",
  "CPX-code",
  "calculator_project",
  "First-Web-Page",
];

export const about = [
  "I spent the last two years in NBCUniversal's Media Tech Associate program on the software engineering track, finishing on the Live & Interactive Experiences team within News Digital. There, I helped build the election coverage products that run on NBCNews.com and Telemundo.com during the biggest traffic nights of the year.",
  "That work means shipping software where “live” isn't a buzzword: event-driven pipelines, static API patterns over S3, islands architecture for pages that have to stay fast under load. Outside of work I like building AI-powered tools end to end, like a LangGraph research agent and a sentiment dashboard fed by AWS SQS, to keep learning how these systems fit together.",
  "Off the clock: DIY hardware projects, a self-directed system design curriculum, and getting married this summer.",
];

export const stack = [
  { label: "Frontend", items: ["React", "TypeScript", "Next.js", "Astro", "Angular"] },
  { label: "Backend", items: ["Node.js", "Java Spring Boot", "Python", "GraphQL"] },
  { label: "Cloud & infra", items: ["AWS (SQS, S3)", "Ansible", "Railway"] },
  { label: "AI systems", items: ["LangGraph", "Claude API", "ChromaDB", "FastAPI"] },
];
