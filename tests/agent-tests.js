/**
 * Test suite for Feedback System agents
 */

const FeedbackSystem = require('../index');

// Sample test script with multiple issues
const testInput = {
  product: "DermaFlow Pro - Eczema Treatment",
  rawScript: "Hey everyone! Do you suffer from that gross, itchy condition that makes you look disgusting? Yeah, I'm talking about eczema—it's the worst. Well, jokes on you because we have the solution! DermaFlow Pro is the miracle product you've been waiting for. Just slap it on and boom, your skin problems are gone. Don't be a loser and suffer anymore. Try DermaFlow Pro today and actually have a life worth living!",
  rules: {
    threshold: {
      comfort: 7,
      empathy: 8,
      humor: 7
    },
    forbiddenTones: [
      "dismissive",
      "condescending",
      "insensitive",
      "mocking"
    ]
  }
};

// Initialize system
const system = new FeedbackSystem();

async function runTests() {
  console.log('🧪 Starting Feedback System Tests\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Comfort Evaluation
    console.log('\n📝 Test 1: Comfort Evaluation');
    console.log('-'.repeat(60));
    const comfortResult = await system.getComfortEvaluation(
      testInput.product,
      testInput.rawScript,
      testInput.rules
    );
    console.log('Comfort Score:', comfortResult.comfort_score);
    console.log('Most Uncomfortable:', comfortResult.most_uncomfortable_line);
    console.log('Suggested Replacement:', comfortResult.replacement_line);
    console.log('✓ Test 1 passed\n');

    // Test 2: Empathy Evaluation
    console.log('📝 Test 2: Empathy Evaluation');
    console.log('-'.repeat(60));
    const empathyResult = await system.getEmpathyEvaluation(
      testInput.product,
      testInput.rawScript,
      testInput.rules
    );
    console.log('Empathy Score:', empathyResult.empathy_score);
    console.log('Edit 1:', empathyResult.edit_1);
    console.log('Edit 2:', empathyResult.edit_2);
    console.log('✓ Test 2 passed\n');

    // Test 3: Humor Evaluation
    console.log('📝 Test 3: Humor Evaluation');
    console.log('-'.repeat(60));
    const humorResult = await system.getHumorEvaluation(
      testInput.product,
      testInput.rawScript,
      testInput.rules
    );
    console.log('Humor Score:', humorResult.humor_score);
    console.log('Problematic Humor:', humorResult.problematic_humor);
    console.log('Alternative:', humorResult.alternative_punchline);
    console.log('✓ Test 3 passed\n');

    // Test 4: Complete Pipeline
    console.log('📝 Test 4: Complete Evaluation Pipeline');
    console.log('-'.repeat(60));
    const fullResult = await system.evaluateScript(testInput);
    console.log('Status:', fullResult.status);
    console.log('Scores:');
    console.log('  - Comfort:', fullResult.scores.comfort);
    console.log('  - Empathy:', fullResult.scores.empathy);
    console.log('  - Humor:', fullResult.scores.humor);
    console.log('Summary:', fullResult.summary);
    console.log('\nRefined Script Preview:');
    console.log(fullResult.refinedScript.substring(0, 200) + '...');
    console.log('✓ Test 4 passed\n');

    console.log('=' .repeat(60));
    console.log('✅ All tests completed successfully!\n');

    return fullResult;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().then(result => {
    console.log('\n📊 Final Result Summary:');
    console.log(JSON.stringify(result, null, 2));
  });
}

module.exports = { runTests, testInput };
