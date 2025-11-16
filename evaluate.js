#!/usr/bin/env node

/**
 * CLI utility to evaluate scripts using the Feedback System
 * Usage: node evaluate.js <path-to-script-json>
 */

const fs = require('fs');
const path = require('path');
const FeedbackSystem = require('./index');

function printBanner() {
  console.log('\n' + '='.repeat(70));
  console.log('  PHARMACEUTICAL INFLUENCER SCRIPT FEEDBACK SYSTEM');
  console.log('='.repeat(70) + '\n');
}

function printResults(results) {
  const { status, scores, thresholds, summary, refinedScript } = results;

  console.log('📊 EVALUATION RESULTS');
  console.log('-'.repeat(70));
  
  console.log(`\nStatus: ${status === 'APPROVED' ? '✅ APPROVED' : '⚠️ NEEDS REVISION'}`);
  
  console.log('\n📈 Scores vs Thresholds:');
  console.log(`  • Comfort:  ${scores.comfort}/10 (threshold: ${thresholds.comfort}/10) ${scores.comfort >= thresholds.comfort ? '✓' : '✗'}`);
  console.log(`  • Empathy:  ${scores.empathy}/10 (threshold: ${thresholds.empathy}/10) ${scores.empathy >= thresholds.empathy ? '✓' : '✗'}`);
  console.log(`  • Humor:    ${scores.humor}/10 (threshold: ${thresholds.humor}/10) ${scores.humor >= thresholds.humor ? '✓' : '✗'}`);
  
  console.log(`\n📝 Summary:\n${summary}`);
  
  if (refinedScript) {
    console.log('\n✨ REFINED SCRIPT:');
    console.log('-'.repeat(70));
    console.log(refinedScript);
    console.log('-'.repeat(70));
  }

  console.log('\n💡 DETAILED FEEDBACK:');
  console.log('-'.repeat(70));
  
  const { comfort, empathy, humor } = results.evaluations;
  
  console.log('\n🤝 COMFORT EVALUATION:');
  console.log(`  Score: ${comfort.comfort_score}/10`);
  console.log(`  Issue: "${comfort.most_uncomfortable_line}"`);
  console.log(`  Fix: "${comfort.replacement_line}"`);
  console.log(`  Why: ${comfort.reasoning}`);
  
  console.log('\n❤️ EMPATHY EVALUATION:');
  console.log(`  Score: ${empathy.empathy_score}/10`);
  console.log(`  Edit 1: ${empathy.edit_1}`);
  console.log(`  Edit 2: ${empathy.edit_2}`);
  console.log(`  Why: ${empathy.reasoning}`);
  
  console.log('\n😄 HUMOR EVALUATION:');
  console.log(`  Score: ${humor.humor_score}/10`);
  console.log(`  Issue: ${humor.problematic_humor}`);
  console.log(`  Fix: ${humor.alternative_punchline}`);
  console.log(`  Why: ${humor.reasoning}`);
}

async function evaluateScript(filePath) {
  try {
    printBanner();

    // Read input file
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const input = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`📂 Loaded script: ${path.basename(filePath)}\n`);

    // Initialize system
    const system = new FeedbackSystem();

    // Evaluate script
    console.log('🔄 Running evaluations...\n');
    const results = await system.evaluateScript(input);

    // Print results
    printResults(results);

    // Save results to file
    const outputPath = filePath.replace('.json', '-output.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n✅ Results saved to: ${path.basename(outputPath)}`);

    console.log('\n' + '='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node evaluate.js <path-to-script-json>');
  console.log('\nExample: node evaluate.js examples/sample-script.json');
  process.exit(1);
}

evaluateScript(args[0]);
