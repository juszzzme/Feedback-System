/**
 * Configuration for Feedback System
 */

module.exports = {
  // Default thresholds for script approval
  defaultThresholds: {
    comfort: 7,
    empathy: 8,
    humor: 7
  },

  // Forbidden tones to avoid
  forbiddenTones: [
    'dismissive',
    'condescending',
    'insensitive',
    'offensive',
    'judgmental',
    'mocking',
    'patronizing'
  ],

  // Quality evaluation levels
  qualityLevels: {
    low: { min: 1, max: 3 },
    medium: { min: 4, max: 6 },
    high: { min: 7, max: 10 }
  },

  // Supported LLM models
  models: {
    default: 'gpt-3.5-turbo',
    advanced: 'gpt-4',
    fast: 'gpt-3.5-turbo'
  },

  // Agent configuration
  agents: {
    comfort: {
      name: 'Agent_EmbarrassedConsumer',
      description: 'Evaluates script comfort level for users'
    },
    empathy: {
      name: 'Agent_EmpathicFriend',
      description: 'Evaluates script empathy and supportiveness'
    },
    humor: {
      name: 'Agent_HumorCritic',
      description: 'Evaluates humor appropriateness for pharmaceutical context'
    },
    refinement: {
      name: 'Script Refinement Agent',
      description: 'Merges all feedback into refined script'
    }
  }
};
