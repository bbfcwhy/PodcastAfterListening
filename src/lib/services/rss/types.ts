/**
 * Parsed RSS channel (program) data from RSS 2.0 + iTunes namespace.
 * All fields optional; missing RSS fields yield undefined.
 */
export interface ParsedChannel {
  title?: string;
  description?: string;
  link?: string;
  /** iTunes image URL from itunes:image href */
  imageUrl?: string;
  /** iTunes author (host name) */
  author?: string;
  /** iTunes categories (tags) */
  categories?: string[];
}

/**
 * Parsed RSS item (episode) data.
 * All fields optional; missing RSS fields yield undefined.
 */
export interface ParsedItem {
  title?: string;
  description?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  /** itunes:duration - stored as parsed seconds or original string */
  durationSeconds?: number;
}

export interface ParsedFeed {
  channel: ParsedChannel;
  items: ParsedItem[];
}
