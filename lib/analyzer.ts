/**
 * Structural Analyzer — parses HTML into structured data.
 * Extracts headings, schema, keywords, locale signals.
 */
import * as cheerio from "cheerio";
import { FetchedPage } from "./crawler";
import { PageData, SiteSummary, StructuralAnalysis } from "./types";

const QUESTION_WORDS = ["what", "how", "why", "when", "which", "who", "best", "compare", "top", "vs", "versus", "guide", "tips"];
const SERVICE_KEYWORDS = [
  "service", "solution", "platform", "tool", "software", "product", "consulting", "agency",
  "management", "support", "help", "pricing", "plan", "feature", "benefit", "integration",
  "automation", "analytics", "dashboard", "report", "insight", "strategy", "marketing",
  "sales", "crm", "erp", "api", "saas", "b2b", "enterprise", "startup", "team", "workflow",
  "decision", "ai", "data", "cloud", "security", "compliance", "roi", "growth"
];

const CITY_PATTERNS = [
  /\b(new york|los angeles|chicago|houston|phoenix|philadelphia|san antonio|san diego|dallas|san jose|austin|jacksonville|fort worth|columbus|charlotte|san francisco|indianapolis|seattle|denver|washington|nashville|oklahoma city|el paso|boston|portland|las vegas|memphis|louisville|baltimore|milwaukee|albuquerque|tucson|fresno|sacramento|mesa|atlanta|kansas city|omaha|colorado springs|raleigh|long beach|virginia beach|minneapolis|tampa|new orleans|honolulu|anaheim|lexington|st. louis|pittsburgh|cincinnati|miami|riverside|bakersfield|aurora|corpus christi|plano|cleveland|wichita|lincoln|orlando|st. paul|henderson|jersey city|chandler|laredo|madison|lubbock|stockton|scottsdale|reno|buffalo|gilbert|glendale|north las vegas|winston-salem|chesapeake|norfolk|fremont|garland|irving|hialeah|richmond|baton rouge|boise|spokane|tacoma|san bernardino|modesto|fontana|moreno valley|glendale|shreveport|akron|des moines|tempe|huntington beach|fayetteville|worcester|ontario|oxnard|montreal|toronto|london|sydney|melbourne|dubai|singapore|berlin|amsterdam|paris|tel aviv)\b/gi,
];

function extractText($: cheerio.CheerioAPI): string {
  $("script, style, nav, footer, header, noscript").remove();
  return $.text().replace(/\s+/g, " ").trim();
}

function detectQuestionH2(text: string): boolean {
  const lower = text.toLowerCase();
  return QUESTION_WORDS.some((w) => lower.startsWith(w) || lower.includes(" " + w + " "));
}

function scoreServiceKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return SERVICE_KEYWORDS.filter((kw) => lower.includes(kw));
}

function extractJsonLd(html: string): string[] {
  const types: string[] = [];
  const regex = /"@type"\s*:\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    types.push(match[1]);
  }
  return [...new Set(types)];
}

function extractCityMentions(text: string): string[] {
  const mentions: string[] = [];
  for (const pattern of CITY_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const city = match[1]
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      if (!mentions.includes(city)) mentions.push(city);
    }
  }
  return mentions;
}

export function analyzePage(page: FetchedPage): PageData | null {
  if (!page.html) return null;

  const $ = cheerio.load(page.html);

  const title = $("title").first().text().trim() || $("h1").first().text().trim() || "";
  const h1 = $("h1").first().text().trim() || "";
  const h2s: string[] = [];
  $("h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h2s.push(text);
  });

  const rawText = extractText($);
  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  const questionH2Count = h2s.filter(detectQuestionH2).length;
  const serviceKeywords = scoreServiceKeywords(rawText + " " + title + " " + h2s.join(" "));
  const jsonld = extractJsonLd(page.html);

  return {
    url: page.url,
    title,
    h1,
    h2: h2s.slice(0, 20),
    jsonld,
    word_count: wordCount,
    question_h2_count: questionH2Count,
    service_keywords: serviceKeywords.slice(0, 15),
    raw_text: rawText.slice(0, 8000), // limit for LLM
  };
}

export function buildSiteSummary(pages: PageData[], city?: string): SiteSummary {
  const allText = pages.map((p) => p.raw_text + " " + p.title + " " + p.h2.join(" ")).join(" ");

  const faqDetected = pages.some(
    (p) =>
      p.jsonld.some((t) => t.toLowerCase().includes("faq")) ||
      p.question_h2_count >= 2 ||
      p.url.toLowerCase().includes("faq") ||
      p.url.toLowerCase().includes("question")
  );

  const schemaDetected = pages.some((p) => p.jsonld.length > 0);
  const totalWordCount = pages.reduce((acc, p) => acc + p.word_count, 0);
  const cityMentions = extractCityMentions(allText);

  const hasLocalSignals =
    cityMentions.length > 0 ||
    (city ? allText.toLowerCase().includes(city.toLowerCase().split(",")[0]) : false) ||
    allText.toLowerCase().includes("near me") ||
    allText.toLowerCase().includes("local");

  return {
    h1_count: pages.filter((p) => p.h1).length,
    faq_detected: faqDetected,
    schema_detected: schemaDetected,
    total_word_count: totalWordCount,
    city_mentions: city ? [city.split(",")[0].trim(), ...cityMentions].slice(0, 5) : cityMentions.slice(0, 5),
    has_local_signals: hasLocalSignals,
  };
}

export function analyzeStructure(
  homepage: FetchedPage,
  candidatePages: FetchedPage[],
  city?: string
): StructuralAnalysis {
  const allPages = [homepage, ...candidatePages];
  const parsedPages = allPages.map(analyzePage).filter((p): p is PageData => p !== null);
  const siteSummary = buildSiteSummary(parsedPages, city);
  return { pages: parsedPages, site_summary: siteSummary };
}
