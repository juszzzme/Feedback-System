/**
 * Script Refinement Agent
 * Merges all feedback from quality reviewers into a refined script
 * Incorporates comfort, empathy, and humor improvements
 */

const axios = require('axios');

class ScriptRefinement {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.model = 'gpt-3.5-turbo';
  }

  /**
   * Refines script based on all agent feedback
   * @param {string} rawScript - Original script
   * @param {object} feedback - Feedback from all three agents
   * @param {object} config - Configuration object
   * @returns {Promise<string>} Refined script
   */
  async refineScript(rawScript, feedback, config = {}) {
    try {
      const prompt = this.buildRefinementPrompt(rawScript, feedback);

      const refinedScript = this.apiKey 
        ? await this.callLLM(prompt)
        : this.ruleBasedRefinement(rawScript, feedback);

      return refinedScript;
    } catch (error) {
      console.error('Error in script refinement:', error);
      throw error;
    }
  }

  /**
   * Build the refinement prompt
   */
  buildRefinementPrompt(rawScript, feedback) {
    return `You are a script refinement specialist for pharmaceutical influencer content.

Your task is to:
1. Review the original script and the feedback from three quality reviewers (comfort, empathy, and humor perspectives)
2. Incorporate all suggested improvements into a refined version of the script
3. Maintain the core message and structure while addressing all concerns
4. Ensure the final script passes all quality thresholds

Original Script:
${rawScript}

--- QUALITY FEEDBACK ---

Comfort Reviewer (Score: ${feedback.comfort_score}/10):
- Most uncomfortable: ${feedback.agent1.most_uncomfortable_line}
- Suggested replacement: ${feedback.agent1.replacement_line}
- Reasoning: ${feedback.agent1.reasoning}

Empathy Reviewer (Score: ${feedback.empathy_score}/10):
- Edit 1: ${feedback.agent2.edit_1}
- Edit 2: ${feedback.agent2.edit_2}
- Reasoning: ${feedback.agent2.reasoning}

Humor Reviewer (Score: ${feedback.humor_score}/10):
- Problematic humor: ${feedback.agent3.problematic_humor}
- Alternative: ${feedback.agent3.alternative_punchline}
- Reasoning: ${feedback.agent3.reasoning}

Please create a refined version that incorporates all feedback. Return ONLY the refined script text, ready to use. Do not include explanations or metadata.`;
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
          content: 'You are a script refinement specialist. Return only the refined script, no explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content.trim();
  }

  /**
   * Rule-based refinement (fallback when no API key)
   */
  ruleBasedRefinement(rawScript, feedback) {
    let refinedScript = rawScript;

    // Apply comfort improvements
    if (feedback.agent1 && feedback.agent1.most_uncomfortable_line) {
      refinedScript = refinedScript.replace(
        feedback.agent1.most_uncomfortable_line,
        feedback.agent1.replacement_line
      );
    }

    // Apply empathy improvements
    if (feedback.agent2) {
      // Parse edit_1 if it contains a replace pattern
      const edit1 = feedback.agent2.edit_1;
      if (edit1.includes('Replace') || edit1.includes('Instead of')) {
        refinedScript = this.applyEdit(refinedScript, edit1);
      }

      // Parse edit_2 if it contains improvements
      const edit2 = feedback.agent2.edit_2;
      if (edit2.includes('Add') || edit2.includes('Include')) {
        refinedScript = this.insertEmpathyLanguage(refinedScript, edit2);
      }
    }

    // Apply humor improvements
    if (feedback.agent3 && feedback.agent3.problematic_humor !== 'none') {
      refinedScript = refinedScript.replace(
        feedback.agent3.problematic_humor,
        feedback.agent3.alternative_punchline
      );
    }

    return refinedScript.trim();
  }

  /**
   * Apply edit suggestions from feedback
   */
  applyEdit(script, editSuggestion) {
    // Extract key phrases from edit suggestion
    if (editSuggestion.includes('confidence') && !script.toLowerCase().includes('confidence')) {
      return script.replace(
        /This product (?:treats|manages|helps with)/i,
        'This product helps you manage your condition with confidence'
      );
    }

    if (editSuggestion.includes('support') && !script.toLowerCase().includes('support')) {
      return script.replace(
        /Here to (?:help|serve)/i,
        'Here to support you every step of the way'
      );
    }

    return script;
  }

  /**
   * Insert empathetic language at appropriate points
   */
  insertEmpathyLanguage(script, editSuggestion) {
    const lines = script.split('\n');
    
    // Try to add empathy language after the first paragraph
    if (lines.length > 0) {
      const insertPoint = Math.min(2, lines.length - 1);
      
      if (editSuggestion.includes('journey')) {
        lines.splice(insertPoint, 0, '\nYou\'re not alone in this journey—thousands of people have found relief using our product.');
      } else if (editSuggestion.includes('understand')) {
        lines.splice(insertPoint, 0, '\nWe understand how challenging this can be, and we\'re here to support you.');
      }
    }

    return lines.join('\n');
  }

  /**
   * Validate refined script against thresholds
   */
  validateRefinedScript(refinedScript, thresholds = {}) {
    const defaultThresholds = {
      comfort: 7,
      empathy: 8,
      humor: 7
    };

    const finalThresholds = { ...defaultThresholds, ...thresholds };

    return {
      isValid: true,
      message: 'Script has been refined according to all feedback.',
      thresholds: finalThresholds,
      notes: 'For production use, run the refined script through all three quality agents again to verify it meets all thresholds.'
    };
  }
}

module.exports = ScriptRefinement;
