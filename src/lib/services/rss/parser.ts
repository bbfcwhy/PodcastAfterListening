import { XMLParser } from "fast-xml-parser";
import type { ParsedChannel, ParsedFeed, ParsedItem } from "./types";

const ITUNES_NS = "itunes:";
const CONTENT_NS = "content:";

function text(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "object" && "#text" in value) return text((value as { "#text": unknown })["#text"]);
  return undefined;
}

function hrefFromImage(node: unknown): string | undefined {
  if (node == null) return undefined;
  if (typeof node === "string") return node.trim() || undefined;
  const obj = node as Record<string, unknown>;
  const href = obj["@_href"] ?? obj["href"];
  return href != null ? String(href).trim() || undefined : undefined;
}

function oneOrMany<T>(val: T | T[] | undefined): T[] {
  if (val == null) return [];
  return Array.isArray(val) ? val : [val];
}

/** Parse itunes:duration (HH:MM:SS or plain seconds) to seconds. Does not throw. */
function parseDuration(raw: unknown): number | undefined {
  const s = text(raw);
  if (s == null) return undefined;
  const trimmed = s.trim();
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10) || undefined;
  const parts = trimmed.split(":").map((p) => parseInt(p, 10));
  if (parts.some(Number.isNaN)) return undefined;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return undefined;
}

function channelFromRaw(raw: Record<string, unknown>): ParsedChannel {
  const get = (key: string) => raw[key];
  const title = text(get("title"));
  const description = text(get("description")) ?? text(get(`${ITUNES_NS}summary`));
  const link = text(get("link"));

  let imageUrl: string | undefined;
  const img = get(`${ITUNES_NS}image`);
  if (img != null) imageUrl = hrefFromImage(Array.isArray(img) ? img[0] : img);

  const author = text(get(`${ITUNES_NS}author`));

  const rawCategories = oneOrMany(get(`${ITUNES_NS}category`));
  const categories = rawCategories
    .map((c) => (typeof c === "object" && c != null && "@_text" in c ? text((c as { "@_text": unknown })["@_text"]) : text(c)))
    .filter((s): s is string => s != null && s.length > 0);

  return {
    title,
    description,
    link,
    imageUrl,
    author,
    categories: categories.length > 0 ? categories : undefined,
  };
}

function itemFromRaw(raw: Record<string, unknown>): ParsedItem {
  const get = (key: string) => raw[key];
  const title = text(get("title"));
  const description = text(get("description")) ?? text(get(`${CONTENT_NS}encoded`));
  const link = text(get("link"));
  const guid = text(get("guid"));
  const pubDate = text(get("pubDate"));
  const durationSeconds = parseDuration(get(`${ITUNES_NS}duration`));

  return {
    title,
    description,
    link,
    guid,
    pubDate,
    durationSeconds,
  };
}

/**
 * Fetch RSS feed XML from URL and parse to structured data.
 * Missing fields are omitted (no throw). Invalid XML or non-200 response returns errors via result.
 */
export async function fetchAndParseFeed(feedUrl: string): Promise<{ ok: true; feed: ParsedFeed } | { ok: false; error: string }> {
  let res: Response;
  try {
    res = await fetch(feedUrl, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(30000),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Fetch failed: ${msg}` };
  }

  if (!res.ok) {
    return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!/xml|rss|text\/plain/i.test(contentType) && !feedUrl.toLowerCase().includes(".xml") && !feedUrl.toLowerCase().includes("rss")) {
    // Still try to parse; many feeds don't set content-type correctly
  }

  let xml: string;
  try {
    xml = await res.text();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Read body failed: ${msg}` };
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: true,
    trimValues: true,
  });

  let parsed: unknown;
  try {
    parsed = parser.parse(xml);
  } catch {
    return { ok: false, error: "Invalid XML" };
  }

  const rss = parsed != null && typeof parsed === "object" && "rss" in parsed ? (parsed as { rss: unknown }).rss : parsed;
  const channelRaw = rss != null && typeof rss === "object" && "channel" in rss ? (rss as { channel: unknown }).channel : null;
  if (channelRaw == null || typeof channelRaw !== "object") {
    return { ok: false, error: "Missing or invalid RSS channel" };
  }

  const channelObj = channelRaw as Record<string, unknown>;
  const channel = channelFromRaw(channelObj);

  const rawItems = oneOrMany(channelObj["item"]);
  const items: ParsedItem[] = rawItems
    .filter((i): i is Record<string, unknown> => i != null && typeof i === "object")
    .map(itemFromRaw);

  return {
    ok: true,
    feed: { channel, items },
  };
}
