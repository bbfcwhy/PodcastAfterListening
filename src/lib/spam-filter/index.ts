/**
 * Rule-based spam filter for comments
 * Returns a score between 0 and 1, where 1 is definitely spam
 */

const SPAM_KEYWORDS = [
  "spam",
  "垃圾",
  "廣告",
  "推廣",
  "點擊這裡",
  "免費",
  "立即",
  "限時",
  "優惠",
  "折扣",
];

const SUSPICIOUS_PATTERNS = [
  /http[s]?:\/\/[^\s]+/g, // URLs
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
  /[0-9]{3,}/g, // Long numbers (phone numbers, etc.)
];

export function checkSpam(content: string): number {
  let score = 0;
  const lowerContent = content.toLowerCase();

  // Check for spam keywords
  const keywordMatches = SPAM_KEYWORDS.filter((keyword) =>
    lowerContent.includes(keyword.toLowerCase())
  ).length;
  if (keywordMatches > 0) {
    score += keywordMatches * 0.2;
  }

  // Check for suspicious patterns
  let linkCount = 0;
  let emailCount = 0;
  let numberCount = 0;

  SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      if (index === 0) {
        // URLs
        linkCount = matches.length;
      } else if (index === 1) {
        // Emails
        emailCount = matches.length;
      } else if (index === 2) {
        // Numbers
        numberCount = matches.length;
      }
    }
  });

  if (linkCount > 2) {
    score += 0.5;
  } else if (linkCount > 0) {
    score += 0.2;
  }

  if (emailCount > 0) {
    score += 0.3;
  }

  if (numberCount > 3) {
    score += 0.2;
  }

  // Check content length (very short or very long might be spam)
  if (content.length < 10) {
    score += 0.1;
  } else if (content.length > 1000) {
    score += 0.1;
  }

  // Check for excessive repetition
  const words = content.split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
    score += 0.2;
  }

  // Cap at 1.0
  return Math.min(score, 1.0);
}
