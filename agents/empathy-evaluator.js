/**
 * Agent_EmpathicFriend
 * Evaluates pharmaceutical scripts for empathy and supportiveness
 * Focuses on warmth and understanding toward users of the product
 */

const axios = require('axios');

class EmpathyEvaluator {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.model = 'gpt-3.5-turbo';
  }

  /**
   * Analyzes script empathy level
   * @param {string} product - Product name
   * @param {string} rawScript - Script text to evaluate
   * @param {object} rules - Rules object with thresholds and forbidden tones
   * @returns {Promise<object>} Empathy evaluation result
   */
  async evaluateEmpathy(product, rawScript, rules = {}) {
    try {
      const prompt = this.buildPrompt(product, rawScript, rules);

      const evaluation = this.apiKey 
        ? await this.callLLM(prompt)
        : this.ruleBasedEvaluation(product, rawScript, rules);

      return this.formatResponse(evaluation);
    } catch (error) {
      console.error('Error in empathy evaluation:', error);
      throw error;
    }
  }

  /**
   * Build the system prompt for the LLM
   */
  buildPrompt(product, rawScript, rules) {
    const forbiddenTones = rules.forbiddenTones || [];
    return `You are a quality reviewer evaluating influencer scripts for pharmaceutical products from the perspective of an empathic friend.

Your task is to:
1. Read the provided script carefully
2. Evaluate how empathetic and supportive the tone is toward people who use this product
3. Rate the empathy level on a scale of 1-10 (where 10 = deeply empathetic and supportive, 1 = cold or dismissive)
4. Identify areas where empathy could be improved
5. Suggest 2 specific edits to increase warmth and understanding

Product: ${product}

Script to evaluate:
${rawScript}

Threshold: Must score at least ${rules.threshold?.empathy || 8}/10 for empathy.
Avoid: ${forbiddenTones.join(', ') || 'dismissive, condescending, insensitive'}

Return your analysis in this exact JSON format:
{
  "empathy_score": <number 1-10>,
  "edit_1": "<first suggested improvement>",
  "edit_2": "<second suggested improvement>",
  "reasoning": "<brief explanation of how these edits improve empathy>"
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
      max_tokens: 600
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
    let score = 10;

    // Check for empathetic language indicators
    const empathyIndicators = [
      { pattern: /\b(understand|know|feel|support|we're here|you're not alone|together|I've been there)\b/gi, weight: 1 },
      { pattern: /\b(challenging|difficult|tough|hard|struggle)\b/gi, weight: 0.8 },
      { pattern: /\b(deserve|deserve better|worthy|valuable|important)\b/gi, weight: 1.2 },
      { pattern: /\b(journey|path|progress|improve|better)\b/gi, weight: 0.7 }
    ];

    // Check for lack of empathy indicators
    const coldLanguagePatterns = [
      { pattern: /\b(just|simply|easy|obvious|just stop)\b/gi, weight: -1.5 },
      { pattern: /\b(problem|defect|broken|wrong|fail)\b/gi, weight: -0.8 },
      { pattern: /\b(try harder|get over it|be positive|think happy)\b/gi, weight: -2 },
      { pattern: /\b(suffer from|victim of|afflicted)\b/gi, weight: -1 }
    ];

    // Check for forbidden tones
    forbiddenTones.forEach(tone => {
      if (rawScript.toLowerCase().includes(tone.toLowerCase())) {
        score -= 2;
      }
    });

    // Apply empathy indicators
    empathyIndicators.forEach(indicator => {
      const matches = rawScript.match(indicator.pattern);
      if (matches) {
        score += indicator.weight * matches.length;
      }
    });

    // Apply cold language penalties
    coldLanguagePatterns.forEach(pattern => {
      const matches = rawScript.match(pattern.pattern);
      if (matches) {
        score += pattern.weight * matches.length;
      }
    });

    // Normalize score
    score = Math.max(1, Math.min(10, Math.round(score)));

    // Generate two specific edits
    const edits = this.generateEmpathyEdits(rawScript);

    return {
      empathy_score: score,
      edit_1: edits[0],
      edit_2: edits[1],
      reasoning: 'These edits transform the script from transactional to relational. By acknowledging the user\'s emotional experience and emphasizing community and support, we create a deeper connection. Users feel understood rather than lectured to, which builds trust and loyalty.'
    };
  }

  /**
   * Generate two empathy-focused edit suggestions
   */
  generateEmpathyEdits(rawScript) {
    const sentences = rawScript.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Edit 1: Add acknowledgment of struggle
    let edit1 = 'Add a line like: "We understand how challenging this can be, and we\'re here to support you every step of the way."';
    
    // Check if improvement needed
    if (!rawScript.toLowerCase().includes('understand') && !rawScript.toLowerCase().includes('support')) {
      edit1 = `Replace a technical statement with empathetic framing. For example, change "This product treats the condition" to "This product helps you manage your condition with confidence and comfort."`;
    }

    // Edit 2: Add validation/community element
    let edit2 = 'Include community language: "You\'re not alone in this journey—thousands of people have found relief using our product."';
    
    // Check if community/journey language exists
    if (!rawScript.toLowerCase().includes('journey') && !rawScript.toLowerCase().includes('alone')) {
      edit2 = `Add validation: Instead of focusing only on product features, include "Your experience matters, and we\'ve designed this with your real-world needs in mind."`;
    }

    return [edit1, edit2];
  }

  /**
   * Format the response
   */
  formatResponse(evaluation) {
    return {
      empathy_score: Math.max(1, Math.min(10, evaluation.empathy_score)),
      edit_1: evaluation.edit_1,
      edit_2: evaluation.edit_2,
      reasoning: evaluation.reasoning
    };
  }
}

module.exports = EmpathyEvaluator;
