/**
 * Agent_EmbarrassedConsumer
 * Evaluates pharmaceutical scripts from the perspective of an embarrassed consumer
 * Focuses on comfort level when watching or sharing the content
 */

const axios = require('axios');

class ComfortEvaluator {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.model = 'gpt-3.5-turbo'; // or your preferred model
  }

  /**
   * Analyzes script comfort level
   * @param {string} product - Product name
   * @param {string} rawScript - Script text to evaluate
   * @param {object} rules - Rules object with thresholds and forbidden tones
   * @returns {Promise<object>} Comfort evaluation result
   */
  async evaluateComfort(product, rawScript, rules = {}) {
    try {
      // Build the evaluation prompt
      const prompt = this.buildPrompt(product, rawScript, rules);

      // Call LLM API if available, otherwise use rule-based evaluation
      const evaluation = this.apiKey 
        ? await this.callLLM(prompt)
        : this.ruleBasedEvaluation(product, rawScript, rules);

      return this.formatResponse(evaluation);
    } catch (error) {
      console.error('Error in comfort evaluation:', error);
      throw error;
    }
  }

  /**
   * Build the system prompt for the LLM
   */
  buildPrompt(product, rawScript, rules) {
    const forbiddenTones = rules.forbiddenTones || [];
    return `You are a quality reviewer evaluating influencer scripts for pharmaceutical products from the perspective of an embarrassed consumer.

Your task is to:
1. Read the provided script carefully
2. Evaluate how comfortable someone would feel watching or sharing this content if they use the product
3. Rate the comfort level on a scale of 1-10 (where 10 = completely comfortable, 1 = extremely embarrassing)
4. Identify the most uncomfortable line or phrase
5. Suggest a replacement that maintains the message but reduces embarrassment

Product: ${product}

Script to evaluate:
${rawScript}

Threshold: Must score at least ${rules.threshold?.comfort || 7}/10 for comfort.
Avoid: ${forbiddenTones.join(', ') || 'dismissive, condescending, insensitive'}

Return your analysis in this exact JSON format:
{
  "comfort_score": <number 1-10>,
  "most_uncomfortable_line": "<exact quote from script>",
  "replacement_line": "<your suggested alternative>",
  "reasoning": "<brief explanation of why this improves comfort>"
}`;
  }

  /**
   * Call external LLM API
   */
  async callLLM(prompt) {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a quality reviewer for pharmaceutical influencer content. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  }

  /**
   * Rule-based evaluation (fallback when no API key)
   */
  ruleBasedEvaluation(product, rawScript, rules) {
    const forbiddenTones = rules.forbiddenTones || ['dismissive', 'condescending', 'insensitive'];
    
    let score = 10; // Start with max comfort
    let mostUncomfortable = '';
    let hasTrigger = false;

    // Check for embarrassment triggers
    const embarrassmentTriggers = [
      { pattern: /\b(gross|disgusting|nasty|yucky|icky)\b/gi, weight: 2, phrase: 'graphic/disgusting language' },
      { pattern: /\b(laugh at|make fun of|ridicule)\b/gi, weight: 2, phrase: 'mockery of condition' },
      { pattern: /\b(shame|embarrassment|humiliated)\b/gi, weight: 1.5, phrase: 'shame language' },
      { pattern: /\b(before\/after|transformation)\b/gi, weight: 1, phrase: 'potentially revealing comparisons' },
      { pattern: /\b(extreme symptoms|suffering)\b/gi, weight: 1, phrase: 'graphic symptom description' }
    ];

    // Check for forbidden tones
    forbiddenTones.forEach(tone => {
      if (rawScript.toLowerCase().includes(tone.toLowerCase())) {
        score -= 1.5;
      }
    });

    // Check for embarrassment triggers
    embarrassmentTriggers.forEach(trigger => {
      const matches = rawScript.match(trigger.pattern);
      if (matches) {
        score -= trigger.weight;
        if (!hasTrigger) {
          mostUncomfortable = matches[0];
          hasTrigger = true;
        }
      }
    });

    // Ensure score is within 1-10 range
    score = Math.max(1, Math.min(10, Math.round(score)));

    // If no specific trigger found, identify longest concerning sentence
    if (!mostUncomfortable) {
      const sentences = rawScript.split(/[.!?]+/).filter(s => s.trim().length > 0);
      mostUncomfortable = sentences[Math.floor(sentences.length / 2)] || rawScript.substring(0, 100);
    }

    return {
      comfort_score: score,
      most_uncomfortable_line: mostUncomfortable.trim(),
      replacement_line: this.generateReplacement(mostUncomfortable),
      reasoning: `Reduced comfort due to potentially embarrassing language or tone. The phrase "${mostUncomfortable.trim()}" may make users self-conscious about their condition. A gentler, more affirming approach maintains the message while respecting user dignity.`
    };
  }

  /**
   * Generate a replacement line
   */
  generateReplacement(originalLine) {
    const replacements = {
      'gross': 'challenging',
      'disgusting': 'difficult',
      'nasty': 'uncomfortable',
      'yucky': 'bothersome',
      'icky': 'annoying',
      'laugh at': 'understand',
      'make fun of': 'acknowledge',
      'ridicule': 'relate to',
      'shame': 'confidence',
      'embarrassment': 'comfort',
      'humiliated': 'empowered'
    };

    let replacement = originalLine;
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      replacement = replacement.replace(regex, value);
    });

    return replacement.trim();
  }

  /**
   * Format the response
   */
  formatResponse(evaluation) {
    return {
      comfort_score: Math.max(1, Math.min(10, evaluation.comfort_score)),
      most_uncomfortable_line: evaluation.most_uncomfortable_line,
      replacement_line: evaluation.replacement_line,
      reasoning: evaluation.reasoning
    };
  }
}

module.exports = ComfortEvaluator;
