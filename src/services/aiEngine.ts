import { FAQItem, GroundingCheckResult } from '../types';

// Sensitive topics that immediately trigger out-of-scope grounding failure
const DISALLOWED_KEYWORDS = [
  'password', 'otp', 'pin', 'secret key', 'credit card cvv', 'admin credentials',
  'database password', 'root access', 'ssh key', 'bank account pin', 'hack'
];

/**
 * Clean and tokenize text for TF-IDF / Keyword matching
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

/**
 * Calculate Jaccard / Keyword similarity between user query and FAQ item
 */
function calculateSimilarityScore(query: string, faq: FAQItem): number {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return 0;

  const faqText = `${faq.question} ${faq.answer} ${faq.keywords.join(' ')}`;
  const faqTokens = tokenize(faqText);

  let matchCount = 0;
  queryTokens.forEach((token) => {
    // Exact match in question or keywords gives high weight
    if (faq.question.toLowerCase().includes(token)) {
      matchCount += 2.5;
    } else if (faq.keywords.some(k => k.toLowerCase().includes(token))) {
      matchCount += 2.0;
    } else if (faqTokens.includes(token)) {
      matchCount += 1.0;
    }
  });

  const rawScore = (matchCount / (queryTokens.size * 2)) * 100;
  return Math.min(Math.round(rawScore), 99);
}

/**
 * Core AI Search & Grounding Engine
 */
export function queryGroundedAI(
  userQuery: string,
  faqs: FAQItem[],
  strictnessThreshold: number = 55
): GroundingCheckResult {
  const lowerQuery = userQuery.toLowerCase();

  // 1. Check for Disallowed / Sensitive topics
  const foundDisallowed = DISALLOWED_KEYWORDS.find((kw) => lowerQuery.includes(kw));
  if (foundDisallowed) {
    return {
      query: userQuery,
      matched: false,
      confidenceScore: 0,
      groundedAnswer: 'I am strictly grounded in the approved Online Class FAQ Knowledge Base. I cannot process requests for sensitive security data, passwords, or account secrets. This request has been escalated to a human administrator for security review.',
      intentDetected: 'Security & Sensitive Data Violation',
      isEscalated: true,
      escalationReason: 'sensitive_topic'
    };
  }

  // 2. Rank FAQs by similarity
  let bestMatch: FAQItem | null = null;
  let highestScore = 0;

  for (const faq of faqs) {
    const score = calculateSimilarityScore(userQuery, faq);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  // 3. Grounding Verification against strictness threshold
  if (bestMatch && highestScore >= strictnessThreshold) {
    return {
      query: userQuery,
      matched: true,
      faq: bestMatch,
      confidenceScore: highestScore,
      groundedAnswer: bestMatch.answer,
      intentDetected: `${bestMatch.category} (${bestMatch.id})`,
      isEscalated: false
    };
  }

  // 4. Fallback when answer is out-of-scope or below threshold
  return {
    query: userQuery,
    matched: false,
    confidenceScore: highestScore,
    groundedAnswer: `I am strictly grounded in the approved Online Class FAQ Knowledge Base. I could not find a verified answer for "${userQuery}" (Confidence: ${highestScore}%). I have created a support ticket and escalated this conversation to a human support agent.`,
    intentDetected: 'Out of Scope / Low Confidence Inquiry',
    isEscalated: true,
    escalationReason: highestScore < 30 ? 'unknown_faq' : 'strictness_failure'
  };
}
