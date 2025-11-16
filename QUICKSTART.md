# Quick Start Guide

## Overview

The Pharmaceutical Influencer Script Feedback System is a multi-agent AI evaluation platform that assesses pharmaceutical product scripts across three critical dimensions:

1. **Comfort** - How embarrassing is the content for users?
2. **Empathy** - How supportive and understanding is the tone?
3. **Humor** - Is humor appropriate for health/pharmaceutical context?

## Installation

```bash
cd Feedback-System
npm install
```

## Usage

### CLI Evaluation

```bash
node evaluate.js examples/sample-script.json
```

### Programmatic Usage

```javascript
const FeedbackSystem = require('./index');

const system = new FeedbackSystem();

const input = {
  product: "Your Product Name",
  rawScript: "Your script text here...",
  rules: {
    threshold: {
      comfort: 7,
      empathy: 8,
      humor: 7
    },
    forbiddenTones: ["dismissive", "condescending", "insensitive"]
  }
};

const results = await system.evaluateScript(input);
console.log(results);
```

## Project Structure

```
├── agents/
│   ├── comfort-evaluator.js      # Agent_EmbarrassedConsumer
│   ├── empathy-evaluator.js      # Agent_EmpathicFriend
│   ├── humor-evaluator.js        # Agent_HumorCritic
│   └── script-refinement.js      # Merge Agent
├── config/
│   └── agent-config.js           # Configuration
├── examples/
│   ├── sample-script.json        # Example input
│   └── sample-output.json        # Example output
├── tests/
│   └── agent-tests.js            # Test suite
├── index.js                      # Main orchestrator
├── evaluate.js                   # CLI tool
└── README.md                     # Documentation
```

## Agents

### 1. Agent_EmbarrassedConsumer (Comfort Evaluator)

**Purpose**: Evaluates how comfortable users would feel watching or sharing the script

**Output**:
```json
{
  "comfort_score": 8,
  "most_uncomfortable_line": "exact quote",
  "replacement_line": "improved version",
  "reasoning": "explanation"
}
```

**What It Checks**:
- Graphic/disgusting language
- Mockery of the condition
- Shame-based messaging
- Embarrassing comparisons
- Overly detailed symptom descriptions

### 2. Agent_EmpathicFriend (Empathy Evaluator)

**Purpose**: Assesses warmth and supportiveness toward users

**Output**:
```json
{
  "empathy_score": 8,
  "edit_1": "first suggested improvement",
  "edit_2": "second suggested improvement",
  "reasoning": "explanation"
}
```

**What It Checks**:
- Understanding and validation language
- Community and connection elements
- User dignity and empowerment
- Absence of dismissive tone
- Presence of supportive messaging

### 3. Agent_HumorCritic (Humor Evaluator)

**Purpose**: Ensures humor is tasteful and appropriate for health context

**Output**:
```json
{
  "humor_score": 8,
  "problematic_humor": "quote or 'none'",
  "alternative_punchline": "suggestion or 'no changes needed'",
  "reasoning": "explanation"
}
```

**What It Checks**:
- Self-blame humor ("that's what you get")
- Mockery of conditions
- Belittling tone
- Inappropriate dark humor about health
- Mental health as punchline
- Disparaging language

### 4. Script Refinement Agent

**Purpose**: Merges all feedback into a polished final script

**Process**:
1. Analyzes all three evaluations
2. Applies comfort improvements
3. Integrates empathy suggestions
4. Incorporates humor fixes
5. Maintains core message and structure

## Running Tests

```bash
npm test
```

This runs the test suite which evaluates the system with sample problematic content and verifies all agents are working correctly.

## Configuration

Edit `config/agent-config.js` to customize:

```javascript
module.exports = {
  defaultThresholds: {
    comfort: 7,     // Minimum comfort score
    empathy: 8,     // Minimum empathy score
    humor: 7        // Minimum humor appropriateness
  },
  
  forbiddenTones: [
    'dismissive',
    'condescending',
    'insensitive',
    // Add more as needed
  ]
};
```

## API Approach

All agents can optionally use OpenAI API for more sophisticated evaluations. Configure with:

```javascript
const system = new FeedbackSystem({
  apiKey: 'your-openai-api-key'
});
```

Without an API key, agents use rule-based evaluation (default).

## Example Workflow

1. **Input**: Raw pharmaceutical product script
2. **Evaluation**: Three agents analyze in parallel
3. **Refinement**: Results merged into improved script
4. **Output**: Status (APPROVED/NEEDS_REVISION) + refined script

## Output Example

```json
{
  "status": "NEEDS_REVISION",
  "scores": {
    "comfort": 3,
    "empathy": 2,
    "humor": 2
  },
  "thresholds": {
    "comfort": 7,
    "empathy": 8,
    "humor": 7
  },
  "evaluations": {
    "comfort": { ... },
    "empathy": { ... },
    "humor": { ... }
  },
  "refinedScript": "Improved script here...",
  "summary": "All scores below thresholds..."
}
```

## Integration Examples

### Next.js/Express Backend

```javascript
const express = require('express');
const FeedbackSystem = require('./Feedback-System');

const app = express();
app.use(express.json());

const system = new FeedbackSystem();

app.post('/api/evaluate', async (req, res) => {
  try {
    const results = await system.evaluateScript(req.body);
    res.json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Workflow Automation

```javascript
// Combine with n8n, Zapier, or Make.com for automated scripts
// Results can trigger approval workflows, Slack notifications, etc.
```

## Performance Notes

- **Rule-based evaluation**: ~100-500ms per script
- **API-based evaluation**: ~2-5s per script (depends on API latency)
- **Parallel processing**: All three agents run simultaneously

## Troubleshooting

**Q: Script returns low scores but seems good**
A: Different products have different tone requirements. Adjust thresholds in `rules.threshold` if needed.

**Q: Getting inconsistent results**
A: Rule-based evaluation uses pattern matching. For more consistent results, use OpenAI API integration.

**Q: How do I modify agent behavior**
A: Edit the agent files in `agents/` directory. Each agent has configurable patterns and weights.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your improvements
4. Submit a pull request

## License

MIT

## Support

For issues, feature requests, or questions, open an GitHub issue.
