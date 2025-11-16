/**
 * Agent_HumorCritic
 * Evaluates pharmaceutical scripts for humor appropriateness
 * Ensures humor is tasteful and appropriate for health/pharmaceutical context
 */

const axios = require('axios');

class HumorEvaluator {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.model = 'gpt-3.5-turbo';
  }

  /**
   * Analyzes script humor appropriateness
   * @param {string} product - Product name
   * @param {string} rawScript - Script text to evaluate
   * @param {object} rules - Rules object with thresholds and forbidden tones
   * @returns {Promise<object>} Humor evaluation result
   */
  async evaluateHumor(product, rawScript, rules = {}) {
    try {
      const prompt = this.buildPrompt(product, rawScript, rules);

      const evaluation = this.apiKey 
        ? await this.callLLM(prompt)
        : this.ruleBasedEvaluation(product, rawScript, rules);

      return this.formatResponse(evaluation);
    } catch (error) {
      console.error('Error in humor evaluation:', error);
      throw error;
    }
  }

  /**
   * Build the system prompt for the LLM
   */
  buildPrompt(product, rawScript, rules) {
    const forbiddenTones = rules.forbiddenTones || [];
    return `You are a quality reviewer evaluating influencer scripts for pharmaceutical products from the perspective of a humor critic.

Your task is to:
1. Read the provided script carefully
2. Evaluate whether the humor is appropriate, tasteful, and lands well for a health/pharmaceutical context
3. Rate the humor quality on a scale of 1-10 (where 10 = perfectly balanced and appropriate, 1 = offensive or tone-deaf)
4. Identify any jokes or punchlines that miss the mark
5. Suggest an alternative punchline or humorous element that works better

Product: ${product}

Script to evaluate:
${rawScript}

Threshold: Must score at least ${rules.threshold?.humor || 7}/10 for humor appropriateness.
Avoid: ${forbiddenTones.join(', ') || 'dismissive, condescending, insensitive'}

Return your analysis in this exact JSON format:
{
  "humor_score": <number 1-10>,
  "problematic_humor": "<quote of any problematic joke/humor, or 'none'>",
  "alternative_punchline": "<your suggested alternative, or 'no changes needed'>",
  "reasoning": "<brief explanation of your assessment>"
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
    let problematicHumor = 'none';
    let hasProblematicJoke = false;

    // Define problematic humor patterns for pharmaceutical context
    const problemPatterns = [
      { 
        pattern: /\b(that's what you get|serves you right|your fault)\b/gi, 
        weight: 2.5, 
        reason: 'Implies blame for condition'
      },
      { 
        pattern: /\b(gross|disgusting|ugly|nasty)\b.*?(?:condition|symptom|skin|body)/gi, 
        weight: 2.5, 
        reason: 'Mocks the medical condition'
      },
      { 
        pattern: /\b(joke's on you|sucker)\b/gi, 
        weight: 2, 
        reason: 'Belittling tone toward users'
      },
      { 
        pattern: /\b(death|dying|fatal|kill you)\b/gi, 
        weight: 2.5, 
        reason: 'Inappropriate dark humor about health'
      },
      { 
        pattern: /\b(crazy|insane|mental|nuts)\b/gi, 
        weight: 1.5, 
        reason: 'Uses mental health as punchline'
      },
      { 
        pattern: /\b(loser|pathetic|sad|pitiful)\b/gi, 
        weight: 2, 
        reason: 'Disparages users'
      }
    ];

    // Check for appropriate pharmaceutical humor indicators
    const appropriateHumorPatterns = [
      /relatable.*?(?:struggle|challenge)/gi,
      /lighthearted.*?(?:journey|experience)/gi,
      /funny.*?(?:because we all know|because it's true)/gi,
      /humor.*?(?:breaks the ice|makes it easier)/gi
    ];

    // Apply forbidden tone penalties
    forbiddenTones.forEach(tone => {
      if (rawScript.toLowerCase().includes(tone.toLowerCase())) {
        score -= 1.5;
      }
    });

    // Check for problematic humor patterns
    problemPatterns.forEach(pattern => {
      const matches = rawScript.match(pattern.pattern);
      if (matches) {
        score -= pattern.weight;
        if (!hasProblematicJoke) {
          problematicHumor = matches[0];
          hasProblematicJoke = true;
        }
      }
    });

    // Check for appropriate humor patterns (positive reinforcement)
    appropriateHumorPatterns.forEach(pattern => {
      if (pattern.test(rawScript)) {
        score += 1;
      }
    });

    // Normalize score
    score = Math.max(1, Math.min(10, Math.round(score)));

    const alternativePunchline = hasProblematicJoke 
      ? this.generateAlternativeHumor(problematicHumor)
      : 'no changes needed';

    const reasoning = hasProblematicJoke
      ? `The phrase "${problematicHumor}" uses humor that may offend or demean users. In pharmaceutical contexts, humor should unite rather than divide, comfort rather than mock.`
      : 'The humor in this script is well-balanced and appropriate for the pharmaceutical context. It connects with users without being dismissive.';

    return {
      humor_score: score,
      problematic_humor: problematicHumor,
      alternative_punchline: alternativePunchline,
      reasoning: reasoning
    };
  }

  /**
   * Generate alternative humor suggestions
   */
  generateAlternativeHumor(problematicHumor) {
    const alternatives = {
      'gross': 'let\'s be real about it',
      'disgusting': 'honest truth is',
      'ugly': 'less than ideal',
      'nasty': 'uncomfortable',
      'that\'s what you get': 'that\'s when you need support',
      'serves you right': 'here\'s what actually helps',
      'joke\'s on you': 'plot twist: we have solutions',
      'sucker': 'friend',
      'loser': 'someone figuring it out',
      'pathetic': 'struggling',
      'sad': 'challenging',
      'pitiful': 'tough'
    };

    for (const [problematic, replacement] of Object.entries(alternatives)) {
      if (problematicHumor.toLowerCase().includes(problematic)) {
        return problematicHumor.replace(
          new RegExp(problematic, 'gi'),
          replacement
        );
      }
    }

    return `Reframe this as self-aware humor: "We all know how frustrating this can be—here's the part where we actually help."`;
  }

  /**
   * Format the response
   */
  formatResponse(evaluation) {
    return {
      humor_score: Math.max(1, Math.min(10, evaluation.humor_score)),
      problematic_humor: evaluation.problematic_humor,
      alternative_punchline: evaluation.alternative_punchline,
      reasoning: evaluation.reasoning
    };
  }
}

module.exports = HumorEvaluator;
