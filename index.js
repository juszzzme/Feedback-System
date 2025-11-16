/**
 * Pharmaceutical Influencer Script Feedback System
 * Main orchestrator that coordinates all agents
 */

const ComfortEvaluator = require('./agents/comfort-evaluator');
const EmpathyEvaluator = require('./agents/empathy-evaluator');
const HumorEvaluator = require('./agents/humor-evaluator');
const ScriptRefinement = require('./agents/script-refinement');

class FeedbackSystem {
  constructor(config = {}) {
    this.apiKey = config.apiKey || null;
    this.comfortEvaluator = new ComfortEvaluator(this.apiKey);
    this.empathyEvaluator = new EmpathyEvaluator(this.apiKey);
    this.humorEvaluator = new HumorEvaluator(this.apiKey);
    this.refinementAgent = new ScriptRefinement(this.apiKey);
  }

  /**
   * Complete evaluation pipeline
   * @param {object} input - Input object with product, rawScript, and rules
   * @returns {Promise<object>} Complete evaluation results
   */
  async evaluateScript(input) {
    try {
      // Validate input
      this.validateInput(input);

      // Get all three evaluations in parallel
      const [comfortResult, empathyResult, humorResult] = await Promise.all([
        this.comfortEvaluator.evaluateComfort(
          input.product,
          input.rawScript,
          input.rules
        ),
        this.empathyEvaluator.evaluateEmpathy(
          input.product,
          input.rawScript,
          input.rules
        ),
        this.humorEvaluator.evaluateHumor(
          input.product,
          input.rawScript,
          input.rules
        )
      ]);

      // Prepare feedback object for refinement
      const feedback = {
        comfort_score: comfortResult.comfort_score,
        empathy_score: empathyResult.empathy_score,
        humor_score: humorResult.humor_score,
        agent1: comfortResult,
        agent2: empathyResult,
        agent3: humorResult
      };

      // Refine the script based on all feedback
      const refinedScript = await this.refinementAgent.refineScript(
        input.rawScript,
        feedback,
        input.config || {}
      );

      // Check if thresholds are met
      const thresholds = input.rules.threshold || { comfort: 7, empathy: 8, humor: 7 };
      const passesThresholds = this.checkThresholds(feedback, thresholds);

      // Return comprehensive results
      return {
        status: passesThresholds ? 'APPROVED' : 'NEEDS_REVISION',
        scores: {
          comfort: comfortResult.comfort_score,
          empathy: empathyResult.empathy_score,
          humor: humorResult.humor_score
        },
        thresholds: thresholds,
        evaluations: {
          comfort: comfortResult,
          empathy: empathyResult,
          humor: humorResult
        },
        refinedScript: refinedScript,
        summary: this.generateSummary(feedback, thresholds)
      };
    } catch (error) {
      console.error('Error in evaluateScript:', error);
      throw error;
    }
  }

  /**
   * Validate input object
   */
  validateInput(input) {
    if (!input.product || typeof input.product !== 'string') {
      throw new Error('Input must include "product" (string)');
    }
    if (!input.rawScript || typeof input.rawScript !== 'string') {
      throw new Error('Input must include "rawScript" (string)');
    }
    if (!input.rules || typeof input.rules !== 'object') {
      throw new Error('Input must include "rules" (object)');
    }
  }

  /**
   * Check if scores meet thresholds
   */
  checkThresholds(feedback, thresholds) {
    const comfortOk = feedback.comfort_score >= (thresholds.comfort || 7);
    const empathyOk = feedback.empathy_score >= (thresholds.empathy || 8);
    const humorOk = feedback.humor_score >= (thresholds.humor || 7);

    return comfortOk && empathyOk && humorOk;
  }

  /**
   * Generate summary of evaluation
   */
  generateSummary(feedback, thresholds) {
    const results = [];

    if (feedback.comfort_score < (thresholds.comfort || 7)) {
      results.push(`Comfort score (${feedback.comfort_score}/10) below threshold (${thresholds.comfort || 7}/10). Consider replacing embarrassing language.`);
    }

    if (feedback.empathy_score < (thresholds.empathy || 8)) {
      results.push(`Empathy score (${feedback.empathy_score}/10) below threshold (${thresholds.empathy || 8}/10). Add more supportive, understanding language.`);
    }

    if (feedback.humor_score < (thresholds.humor || 7)) {
      results.push(`Humor score (${feedback.humor_score}/10) below threshold (${thresholds.humor || 7}/10). Adjust humor to be more appropriate for pharmaceutical context.`);
    }

    if (results.length === 0) {
      results.push('✓ All scores meet or exceed thresholds. Script is ready for use.');
    }

    return results.join(' ');
  }

  /**
   * Get individual evaluation (for testing/debugging)
   */
  async getComfortEvaluation(product, script, rules) {
    return this.comfortEvaluator.evaluateComfort(product, script, rules);
  }

  async getEmpathyEvaluation(product, script, rules) {
    return this.empathyEvaluator.evaluateEmpathy(product, script, rules);
  }

  async getHumorEvaluation(product, script, rules) {
    return this.humorEvaluator.evaluateHumor(product, script, rules);
  }
}

module.exports = FeedbackSystem;
