/**
 * Crawler module — fetches homepage and candidate pages.
 * Respects robots.txt basics, handles redirects and timeouts.
 */
import axios from "axios";
import * as cheerio from "cheerio";

const CANDIDATE_PATHS = ["/about", "/services", "/faq", "/contact", "/about-us"];
const FETCH_TIMEOUT_MS = 5000;
const MAX_PAGES = 3;

export interface FetchedPage {
  url: string;
  html: string;
  status: number;
  error?: string;
}

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  // Remove trailing slash
  return url.replace(/\/$/, "");
}

async function fetchPage(url: string): Promise<FetchedPage> {
  try {
    const res = await axios.get(url, {
      timeout: FETCH_TIMEOUT_MS,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AIInclusionChecker/1.0; +https://aiinclusionchecker.com/bot)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      validateStatus: (s) => s < 500,
    });

    if (res.status >= 400) {
      return { url, html: "", status: res.status, error: `HTTP ${res.status}` };
    }

    const contentType = (res.headers["content-type"] as string) || "";
    if (!contentType.includes("html")) {
      return { url, html: "", status: res.status, error: "Not HTML" };
    }

    return { url, html: res.data as string, status: res.status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: string }).code;
    const status = (err as { response?: { status: number } }).response?.status;

    if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
      return { url, html: "", status: 0, error: "DNS_FAIL" };
    }
    if (code === "ECONNREFUSED") {
      return { url, html: "", status: 0, error: "CONNECTION_REFUSED" };
    }
    if (code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" || message.includes("certificate")) {
      return { url, html: "", status: 0, error: "TLS_ERROR" };
    }
    return { url, html: "", status: status ?? 0, error: message };
  }
}

async function checkRobots(baseUrl: string): Promise<boolean> {
  try {
    const res = await axios.get(`${baseUrl}/robots.txt`, {
      timeout: 3000,
      validateStatus: () => true,
    });
    if (res.status === 200 && typeof res.data === "string") {
      const lines = res.data.split("\n");
      let userAgentMatch = false;
      for (const line of lines) {
        const trimmed = line.trim().toLowerCase();
        if (trimmed.startsWith("user-agent:")) {
          const agent = trimmed.replace("user-agent:", "").trim();
          userAgentMatch = agent === "*" || agent === "aiinclusioncrawler";
        }
        if (userAgentMatch && trimmed.startsWith("disallow:")) {
          const path = trimmed.replace("disallow:", "").trim();
          if (path === "/" || path === "") return false; // blocked
        }
      }
    }
    return true;
  } catch {
    return true; // If can't fetch robots.txt, assume allowed
  }
}

function extractInternalLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links: string[] = [];
  const origin = new URL(baseUrl).origin;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    try {
      const abs = new URL(href, baseUrl).toString();
      if (abs.startsWith(origin) && !abs.includes("#") && !abs.match(/\.(pdf|jpg|png|gif|svg|css|js|xml|json)$/i)) {
        links.push(abs.split("?")[0]); // strip query params
      }
    } catch {
      // skip invalid URLs
    }
  });

  return [...new Set(links)].slice(0, 10);
}

export interface CrawlResult {
  homepage: FetchedPage;
  pages: FetchedPage[];
  error?: string;
  blocked_by_robots?: boolean;
}

export async function crawlSite(domain: string): Promise<CrawlResult> {
  const baseUrl = normalizeUrl(domain);

  // Check robots.txt first
  const allowed = await checkRobots(baseUrl);
  if (!allowed) {
    return {
      homepage: { url: baseUrl, html: "", status: 0, error: "ROBOTS_BLOCKED" },
      pages: [],
      blocked_by_robots: true,
    };
  }

  // Fetch homepage
  const homepage = await fetchPage(baseUrl);

  if (homepage.error === "DNS_FAIL" || homepage.error === "CONNECTION_REFUSED") {
    return { homepage, pages: [], error: "UNREACHABLE" };
  }

  if (homepage.status === 0 || !homepage.html) {
    // Try http fallback
    const httpUrl = baseUrl.replace("https://", "http://");
    const fallback = await fetchPage(httpUrl);
    if (!fallback.html) {
      return { homepage: homepage.error ? homepage : fallback, pages: [], error: "UNREACHABLE" };
    }
    homepage.html = fallback.html;
    homepage.status = fallback.status;
  }

  // Fetch candidate pages in parallel
  const candidateUrls = CANDIDATE_PATHS.map((p) => `${baseUrl}${p}`);

  // Also find internal service-like links from homepage
  const internalLinks = extractInternalLinks(homepage.html, baseUrl)
    .filter((l) => !candidateUrls.includes(l) && l !== baseUrl)
    .slice(0, 3);

  const allCandidates = [...candidateUrls, ...internalLinks].slice(0, MAX_PAGES + 1);

  const fetchResults = await Promise.allSettled(allCandidates.map((u) => fetchPage(u)));

  const pages: FetchedPage[] = fetchResults
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((p): p is FetchedPage => p !== null && !!p.html && p.status < 400);

  return { homepage, pages };
}
