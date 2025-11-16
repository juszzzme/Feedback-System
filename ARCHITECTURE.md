# System Architecture Overview

## Multi-Agent Evaluation Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT SCRIPT                             │
│        (Pharmaceutical product script to evaluate)          │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                    ┌─────────────┴────────────┐
                    │ Parse Input & Validate  │
                    └─────────────┬────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ COMFORT AGENT    │     │ EMPATHY AGENT    │     │ HUMOR AGENT      │
│                  │     │                  │     │                  │
│ • Rate comfort   │     │ • Rate empathy   │     │ • Rate humor     │
│ • Find issues    │     │ • Suggest edits  │     │ • Find problems  │
│ • Provide fixes  │     │ • Build warmth   │     │ • Provide alts   │
│                  │     │                  │     │                  │
│ Score: 1-10      │     │ Score: 1-10      │     │ Score: 1-10      │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                        ┌─────────▼─────────┐
                        │   MERGE RESULTS   │
                        │  • Collect scores │
                        │  • Gather feedback│
                        └─────────┬─────────┘
                                  │
                    ┌─────────────▼────────────┐
                    │  SCRIPT REFINEMENT       │
                    │  • Apply comfort fixes   │
                    │  • Integrate empathy     │
                    │  • Incorporate humor     │
                    │  • Maintain message      │
                    └─────────────┬────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
         ▼                                                 ▼
┌─────────────────────┐                           ┌─────────────────┐
│  THRESHOLD CHECK    │                           │  OUTPUT RESULTS │
│                     │                           │                 │
│ • Comfort >= 7?     │                           │ • Status        │
│ • Empathy >= 8?     │                           │ • All scores    │
│ • Humor >= 7?       │                           │ • Evaluations   │
│                     │                           │ • Refined script│
│ APPROVED ✓          │                           │ • Summary       │
│ NEEDS REVISION ✗    │                           │                 │
└─────────────────────┘                           └─────────────────┘
```

## Agent Details

### Agent_EmbarrassedConsumer (Comfort)
**Evaluates**: How uncomfortable users would feel
- **Checks for**: Gross language, shame, embarrassment, mockery
- **Outputs**: comfort_score (1-10), uncomfortable_line, replacement
- **Goal**: Make content user-friendly without stigma

### Agent_EmpathicFriend (Empathy)
**Evaluates**: How supportive and warm the tone is
- **Checks for**: Understanding, community, dignity, support
- **Outputs**: empathy_score (1-10), 2 specific edits, reasoning
- **Goal**: Build emotional connection and trust

### Agent_HumorCritic (Humor)
**Evaluates**: Appropriateness of humor in health context
- **Checks for**: Mockery, blame, dark humor, mental health jokes
- **Outputs**: humor_score (1-10), problematic_humor, alternative
- **Goal**: Ensure humor unites rather than divides

### Script Refinement Agent
**Orchestrates**: Combines all feedback into final script
- **Process**: Applies all suggestions while maintaining message
- **Output**: Polished, approved-ready script
- **Goal**: Production-ready content

## Data Flow

```
INPUT:
{
  "product": "Product Name",
  "rawScript": "Original script text...",
  "rules": {
    "threshold": { "comfort": 7, "empathy": 8, "humor": 7 },
    "forbiddenTones": ["dismissive", "condescending"]
  }
}

↓

PARALLEL EVALUATION (3 agents simultaneously):
- Rule-based: 100-500ms
- API-based: 2-5s

↓

INDIVIDUAL RESULTS:
{
  "comfort_score": 5,
  "most_uncomfortable_line": "...",
  "replacement_line": "...",
  "reasoning": "..."
}

↓

MERGED FEEDBACK:
All three evaluations combined

↓

SCRIPT REFINEMENT:
Original script + all suggested fixes = Refined script

↓

OUTPUT:
{
  "status": "APPROVED" | "NEEDS_REVISION",
  "scores": { "comfort": 7, "empathy": 8, "humor": 8 },
  "evaluations": { "comfort": {...}, "empathy": {...}, "humor": {...} },
  "refinedScript": "Polished script ready to use...",
  "summary": "All thresholds met. Ready for production."
}
```

## Evaluation Patterns

### Comfort Agent Patterns
```
Negative indicators (reduce score):
- /\b(gross|disgusting|nasty|yucky)\b/gi
- /\b(shame|embarrassment|humiliated)\b/gi
- /\b(laugh at|ridicule|make fun of)\b/gi
- /forbidden tones/gi

Positive indicators (increase score):
- Respectful, dignified language
- Positive affirmations
```

### Empathy Agent Patterns
```
Positive indicators (increase score):
- /\b(understand|feel|support|we're here)\b/gi
- /\b(journey|progress|improve)\b/gi
- /\b(deserve|worthy|valuable)\b/gi

Negative indicators (decrease score):
- /\b(just|simply|easy|obvious)\b/gi
- /\b(problem|broken|wrong|fail)\b/gi
- /\b(try harder|get over it)\b/gi
```

### Humor Agent Patterns
```
Problematic patterns (decrease score):
- /\b(that's what you get|serves you right)\b/gi
- /\b(joke's on you|sucker)\b/gi
- /\b(loser|pathetic|sad)\b/gi
- Dark health humor
- Mental health jokes

Appropriate patterns (increase score):
- Relatable humor
- Self-aware humor
- Lighthearted tone
```

## Integration Points

### Direct Integration
```javascript
const system = require('./index');
const results = await system.evaluateScript(input);
```

### REST API Integration
```
POST /api/evaluate
{body: input}
→ {response: results}
```

### Workflow Automation
- n8n nodes
- Zapier actions
- Make.com scenarios
- GitHub Actions
- CI/CD pipelines

## Configuration Customization

```javascript
// config/agent-config.js
module.exports = {
  defaultThresholds: {
    comfort: 7,      // Adjust comfort minimum
    empathy: 8,      // Adjust empathy minimum
    humor: 7         // Adjust humor minimum
  },
  
  forbiddenTones: [
    'dismissive',    // Add/remove forbidden tones
    'condescending',
    'insensitive'
  ],
  
  // Add more custom rules...
};
```

## Performance Characteristics

```
Single Script Evaluation:
├── Rule-based mode
│   ├── Comfort: 50-150ms
│   ├── Empathy: 50-150ms
│   ├── Humor: 50-150ms
│   └── Total: ~100-500ms (parallel)
│
└── API-based mode (with OpenAI)
    ├── Comfort: 1-2s
    ├── Empathy: 1-2s
    ├── Humor: 1-2s
    └── Total: ~2-5s (parallel)

Script Refinement:
- Rule-based: 50-200ms
- API-based: 1-3s

Memory Usage: ~50MB typical
```

## Quality Metrics

```
Threshold Achievement:
┌─────────────────────────────────────────────┐
│ Score 1-3:   Poor quality (red)      █      │
│ Score 4-6:   Needs work (yellow)     ██     │
│ Score 7-10:  Approved (green)        ███    │
└─────────────────────────────────────────────┘

Approval Status:
┌──────────────────────────────────────────────┐
│ APPROVED: All scores >= thresholds           │
│ NEEDS_REVISION: 1+ scores < threshold        │
│ FAILED: Multiple critical issues             │
└──────────────────────────────────────────────┘
```

## Example Transformation

```
BEFORE (Score: 1/10 Comfort, 2/10 Empathy, 2/10 Humor):
"Do you suffer from that gross, itchy condition that makes you look 
disgusting? Well, jokes on you because we have the solution! Don't be 
a loser and suffer anymore."

↓ AGENTS EVALUATE & PROVIDE FEEDBACK ↓

AFTER (Score: 8/10 Comfort, 9/10 Empathy, 8/10 Humor):
"Do you struggle with eczema and wish you had relief that actually works? 
You're not alone—thousands of people have found comfort with our product. 
We understand how challenging this can be, and we're here to support your 
journey toward the confidence you deserve."
```

## Repository Map

```
Feedback-System/
├── agents/                    # Core agents (4 files)
├── config/                    # Configuration
├── utils/                     # Helper utilities
├── examples/                  # Sample input/output
├── tests/                     # Test suite
├── index.js                   # Orchestrator
├── evaluate.js                # CLI tool
├── README.md                  # Full docs
├── QUICKSTART.md              # Quick guide
├── IMPLEMENTATION_GUIDE.md    # This guide
└── package.json               # Dependencies
```

---

**Status**: ✅ Complete and deployed to GitHub
**Last Updated**: November 16, 2025
**Repository**: https://github.com/juszzzme/Feedback-System
