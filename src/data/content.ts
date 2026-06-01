/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Static content data for the Folio website.
 * Single source of truth for all site copy.
 */

// --- Types ---

export interface HeroWord {
  text: string;
  highlight: boolean;
}

export interface CapabilityCardData {
  index: string;
  title: string;
  tags: string;
  isFull?: boolean;
  badges?: string[];
}

export interface WorkCaseStudy {
  index: string;
  category: string;
  title: string;
  impact: string;
  deliverables: string[];
}

export interface PhilosophyItem {
  title: string;
  body: string;
}

// --- Nav ---

export const NAV_ITEMS = ["Work", "Services", "Studio", "Results", "Contact"] as const;

// --- Hero ---

export const HERO_WORDS: HeroWord[] = [
  { text: "WE", highlight: false },
  { text: "SHAPE", highlight: false },
  { text: "PRODUCTS", highlight: false },
  { text: "PEOPLE", highlight: true },
  { text: "RETURN", highlight: true },
  { text: "TO.", highlight: true },
];

export const HERO_SUBTITLE =
  "UX design, product strategy, and interface engineering for teams building software worth using — from early concept to scaled platform.";

export const HERO_RIGHT_TAGLINE = "DESIGN-LED / DIGITAL STUDIO / FOR FOUNDERS & TEAMS";

// --- Marquee ---

export const MARQUEE_ITEMS = [
  "RESEARCH-FIRST",
  "SYSTEMS THINKING",
  "MOBILE & WEB",
  "DESIGN TO DEV HANDOFF",
  "0→1 PRODUCTS",
  "REDESIGNS",
  "SCALE-STAGE UX",
  "INTERACTION DESIGN",
] as const;

// --- Capabilities (Services) ---

export const CAPABILITIES_TITLE = "From early concept to a system that scales.";
export const CAPABILITIES_SUBTITLE =
  "We step in where the product needs sharper thinking, cleaner structure, or a design team that takes real ownership.";

export const ENGAGEMENT_TYPES = [
  "Design a new product from scratch",
  "Redesign an existing platform",
  "Embed a design team in engineering",
] as const;

export const CAPABILITIES: CapabilityCardData[] = [
  {
    index: "01",
    title: "UX Research & Strategy",
    tags: "user interviews & usability testing · journey mapping & mental model analysis · competitive benchmarking · information architecture audits",
  },
  {
    index: "02",
    title: "Interface Design",
    tags: "web app & SaaS design · iOS & Android app design · responsive marketing sites · interaction & animation design",
  },
  {
    index: "03",
    title: "Design Systems",
    tags: "atomic component libraries · token-based theming · Figma → code documentation · governance and versioning frameworks",
  },
  {
    index: "04",
    title: "Embedded Design Pod",
    tags: "senior design leadership · sprint-integrated design rhythm · end-to-end ownership · cross-functional facilitation",
  },
  {
    index: "05",
    title: "Product Strategy",
    tags: "product definition workshops · prioritisation frameworks · 0→1 product scoping · post-launch iteration strategy",
    isFull: true,
    badges: ["DESIGN-LED STRATEGY", "OUTCOME-DRIVEN"],
  },
];

// --- Operating Model / Credibility (Results) ---

export const CREDIBILITY_TITLE = "Research in the product. Systems in the process.";
export const CREDIBILITY_SUBTITLE =
  "Use research where it prevents expensive mistakes. Build systems where they compound speed. Make every design decision traceable.";

export const HOW_WE_WORK = [
  {
    title: "Research-Grounded When It Matters",
    body: "Qualitative insight, usability testing, and behavioural analysis focused on decisions with the highest downstream cost.",
  },
  {
    title: "Systems-First by Default",
    body: "Every engagement leaves behind a stronger foundation — components, patterns, and documentation that outlast the project.",
  },
];

export const OPERATING_MODEL_PILLARS: PhilosophyItem[] = [
  {
    title: "Operating Principle 01 — Design-first, not decoration-last",
    body: "Design enters the product conversation at strategy level, not after engineering has already committed.",
  },
  {
    title: "Operating Principle 02 — Opinionated but collaborative",
    body: "We bring strong points of view, change them when the data says to, and document the reasoning either way.",
  },
  {
    title: "Operating Principle 03 — Built for messy realities",
    body: "Shifting requirements, legacy constraints, under-resourced teams — the work adapts without losing design integrity.",
  },
];

// --- Work ---

export const WORK_CASE_STUDIES: WorkCaseStudy[] = [
  {
    index: "01",
    category: "Enterprise SaaS / Redesign",
    title: "Procurement Platform Redesign",
    deliverables: [
      "end-to-end journey redesign across buyer and approver roles",
      "information architecture restructure reducing navigation depth by 40%",
      "component library with 80+ production-ready Figma components",
    ],
    impact:
      "Reduced task completion time for core flows by 34% in usability testing. Design system adopted by engineering within 6 weeks of handoff.",
  },
  {
    index: "02",
    category: "Mobile App / 0→1",
    title: "Fintech Onboarding App",
    deliverables: [
      "research synthesis from 18 user interviews",
      "end-to-end iOS app design across 60+ screens",
      "motion and interaction spec for engineering",
    ],
    impact:
      "App launched with a 4.6 App Store rating. Onboarding drop-off 28% below industry benchmark in the first 90 days.",
  },
  {
    index: "03",
    category: "Design System / Scale-stage",
    title: "Design System for a Growth-Stage Platform",
    deliverables: [
      "120+ component Figma library with variant documentation",
      "token system covering typography, colour, spacing, and elevation",
      "contribution guidelines and governance model",
    ],
    impact:
      "Cut design-to-dev cycle time by half within two product quarters. Onboarded three new designers in days, not weeks.",
  },
];

// --- About (Studio) ---

export const ABOUT_TITLE = "Built to think, design, and ship with ambitious teams.";
export const ABOUT_LEDE =
  "Great products don't come from more features. They come from sharper decisions made earlier.";

export const ABOUT_PARAGRAPHS = [
  "Folio started as a small UX consultancy solving onboarding problems for a single SaaS client. The work expanded into product thinking, system building, and embedded design leadership.",
  "Today the right fit is a team that needs more than visual output. They need a design partner who can question the brief, map the system, and stay in the room until it's shipped.",
  "Considered in approach. Decisive in execution. Protective of quality throughout.",
];

export const ABOUT_PHILOSOPHY: PhilosophyItem[] = [
  {
    title: "Makers ourselves",
    body: "Internal tools, design experiments, and product prototypes keep us honest about real product constraints.",
  },
  {
    title: "Small team, full ownership",
    body: "No account layers. The people doing the work are the people in the meeting.",
  },
  {
    title: "Honest about tradeoffs",
    body: "We name what a design decision costs, not just what it gains.",
  },
];

export const ABOUT_WE_BUILD_DESC =
  "Alongside client work we run internal experiments — tools, systems, and product ideas that keep our thinking applied rather than theoretical.";

export const ABOUT_TAGS = [
  "internal design toolkits",
  "reusable research templates",
  "product experiments with real users",
] as const;

// --- Contact ---

export const CONTACT_TITLE =
  "Looking for a design partner, an embedded team, or a sharper product perspective?";
export const CONTACT_DESCRIPTION =
  "Tell us what you're building and where design thinking needs to arrive earlier in the process.";

export const GOOD_FIT_ITEMS = [
  "You need UX that solves real problems, not surfaces that look good in screenshots.",
  "You want design judgment in the product conversation, not just in the delivery lane.",
  "You need a team that can own the design work and stay accountable through shipping.",
] as const;

export const CONTACT_EMAIL = "hello@folio.co";
