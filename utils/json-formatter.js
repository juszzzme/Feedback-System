/**
 * Utility functions for the Feedback System
 */

/**
 * Format JSON response with proper indentation
 */
function formatJSON(obj, indent = 2) {
  return JSON.stringify(obj, null, indent);
}

/**
 * Parse JSON with error handling
 */
function parseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
}

/**
 * Extract score from response
 */
function extractScore(response) {
  if (typeof response === 'number') {
    return response;
  }
  if (typeof response === 'string') {
    const match = response.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }
  return null;
}

/**
 * Normalize score to 1-10 range
 */
function normalizeScore(score) {
  const num = parseFloat(score);
  if (isNaN(num)) return null;
  return Math.max(1, Math.min(10, Math.round(num)));
}

/**
 * Check if score passes threshold
 */
function passesThreshold(score, threshold) {
  return normalizeScore(score) >= normalizeScore(threshold);
}

/**
 * Generate score badge (for CLI output)
 */
function scoreToEmoji(score, threshold) {
  const normalized = normalizeScore(score);
  if (normalized >= threshold) return '✓';
  if (normalized >= threshold - 2) return '◐';
  return '✗';
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Remove duplicates from array
 */
function removeDuplicates(arr) {
  return [...new Set(arr)];
}

/**
 * Merge two feedback objects
 */
function mergeFeedback(feedback1, feedback2) {
  return {
    ...feedback1,
    ...feedback2,
    reasoning: [feedback1.reasoning, feedback2.reasoning].filter(Boolean).join(' ')
  };
}

/**
 * Create a summary report
 */
function generateReport(results) {
  const { status, scores, thresholds } = results;
  
  return {
    summary: `Evaluation complete: ${status}`,
    scoreCard: {
      comfort: `${scores.comfort}/10 (threshold: ${thresholds.comfort}/10)`,
      empathy: `${scores.empathy}/10 (threshold: ${thresholds.empathy}/10)`,
      humor: `${scores.humor}/10 (threshold: ${thresholds.humor}/10)`
    },
    passed: status === 'APPROVED',
    issues: Object.entries(scores)
      .filter(([key, score]) => score < thresholds[key])
      .map(([key, score]) => `${key}: ${score}/${thresholds[key]}`)
  };
}

module.exports = {
  formatJSON,
  parseJSON,
  extractScore,
  normalizeScore,
  passesThreshold,
  scoreToEmoji,
  truncateText,
  removeDuplicates,
  mergeFeedback,
  generateReport
};
