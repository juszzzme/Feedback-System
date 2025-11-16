# Pharmaceutical Influencer Script Feedback System

An intelligent system of AI agents that evaluates influencer scripts for pharmaceutical products across multiple dimensions: comfort, empathy, and humor appropriateness.

## Overview

This system uses a multi-agent approach to quality-check pharmaceutical influencer content:

- **Agent_EmbarrassedConsumer**: Evaluates how comfortable users would feel watching/sharing the content
- **Agent_EmpathicFriend**: Assesses the warmth and supportiveness of the tone
- **Agent_HumorCritic**: Reviews humor appropriateness for health context
- **Script Refinement Agent**: Merges all feedback into a polished final script

## Project Structure

```
├── agents/
│   ├── comfort-evaluator.js
│   ├── empathy-evaluator.js
│   ├── humor-evaluator.js
│   └── script-refinement.js
├── config/
│   └── agent-config.js
├── utils/
│   └── json-formatter.js
├── examples/
│   ├── sample-script.json
│   └── sample-output.json
├── tests/
│   └── agent-tests.js
├── .gitignore
└── README.md
```

## Installation

```bash
git clone https://github.com/juszzzme/Feedback-System.git
cd Feedback-System
npm install
```

## Usage

### Basic Example

```javascript
const system = require('./index');

const input = {
  product: "DermaFlow Pro - Eczema Treatment",
  rawScript: "Your script here...",
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

## Thresholds

Configure quality thresholds in your input:
- **comfort**: 1-10 scale (how embarrassing is the content?)
- **empathy**: 1-10 scale (how supportive is the tone?)
- **humor**: 1-10 scale (is humor appropriate for health context?)

## Output Format

Each agent returns structured JSON feedback:

```json
{
  "comfort_score": 8,
  "most_uncomfortable_line": "exact quote",
  "replacement_line": "improved version",
  "reasoning": "explanation"
}
```

## Contributing

Submit pull requests with improvements to agent evaluation logic or add new evaluation dimensions.

## License

MIT
