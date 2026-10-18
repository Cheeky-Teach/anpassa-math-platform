// scripts/test-pipeline.mjs
import assert from 'node:assert';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function runPipelineDiagnostics() {
    console.log(`\n======================================================`);
    console.log(`🔍 COMPREHENSIVE PIPELINE TEST (PRE-MIGRATION)`);
    console.log(`Target Host: ${BASE_URL}`);
    console.log(`======================================================\n`);

    // -----------------------------------------------------------------
    // 1. MULTI-CATEGORY SMOKE TEST (Pure Math)
    // -----------------------------------------------------------------
    console.log(`[STAGE 1] Testing Pure Math across all 4 categories...`);
    const categoryTopics = [
        { cat: 'algebra', topic: 'equations', level: 1 },
        { cat: 'arithmetic', topic: 'basic_arithmetic', level: 4 },
        { cat: 'geometry', topic: 'geometry', level: 2 },
        { cat: 'data', topic: 'statistics', level: 2 }
    ];

    for (const testCase of categoryTopics) {
        const url = `${BASE_URL}/api/question?topic=${testCase.topic}&level=${testCase.level}&lang=sv&wordProblem=false`;
        const res = await fetch(url);
        assert.strictEqual(res.status, 200, `Topic ${testCase.topic} failed with HTTP ${res.status}`);
        const data = await res.json();
        
        assert.ok(data.renderData, `Missing renderData for ${testCase.topic}`);
        assert.ok(data.token, `Missing answer token for ${testCase.topic}`);
        console.log(`  ✓ [${testCase.cat.toUpperCase()}] ${testCase.topic} L${testCase.level} -> OK`);
    }

    // -----------------------------------------------------------------
    // 2. WORD PROBLEM & STORY ENGINE TEST (SV & EN)
    // -----------------------------------------------------------------
    console.log(`\n[STAGE 2] Testing Word Problem Compilation (Swedish & English)...`);
    const storyTopics = [
        { topic: 'equations', level: 1, expectedContext: 'algebra_onestep' },
        { topic: 'percent', level: 2, expectedContext: 'percent_of_amount' },
        { topic: 'geometry', level: 2, expectedContext: 'geom_area_quad' }
    ];

    for (const testCase of storyTopics) {
        for (const lang of ['sv', 'en']) {
            const url = `${BASE_URL}/api/question?topic=${testCase.topic}&level=${testCase.level}&lang=${lang}&wordProblem=true`;
            const res = await fetch(url);
            assert.strictEqual(res.status, 200, `Word problem request failed for ${testCase.topic} (${lang})`);
            const data = await res.json();

            const description = typeof data.renderData?.description === 'object'
                ? data.renderData.description[lang]
                : data.renderData?.description;

            assert.ok(description && description.length > 10, `Story description empty or too short for ${testCase.topic} (${lang})`);
            // Assert description does not contain raw unparsed regex tokens like ";;" or raw extractor delimiters
            assert.ok(!description.includes(';;'), `Story template replacement leaked unparsed delimiter in ${testCase.topic}`);

            console.log(`  ✓ Word Problem [${lang.toUpperCase()}] -> ${testCase.topic} L${testCase.level}: "${description.substring(0, 45)}..."`);
        }
    }

    // -----------------------------------------------------------------
    // 3. ANSWER VALIDATION (Correct, Incorrect, Formatting)
    // -----------------------------------------------------------------
    console.log(`\n[STAGE 3] Testing Answer Evaluation Logic...`);
    const sampleRes = await fetch(`${BASE_URL}/api/question?topic=basic_arithmetic&level=4&lang=sv&wordProblem=false`);
    const sampleQ = await sampleRes.json();

    let rawCorrectAnswer = Buffer.from(sampleQ.token, 'base64').toString('utf-8');
    try {
        const parsed = JSON.parse(rawCorrectAnswer);
        rawCorrectAnswer = parsed.answer ?? parsed;
    } catch {
        // raw plain text token
    }

    // 3A. Correct Answer Submission
    const correctSubmit = await fetch(`${BASE_URL}/api/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sampleQ.token, answer: String(rawCorrectAnswer).trim(), mode: 'practice' })
    });
    const correctData = await correctSubmit.json();
    assert.strictEqual(correctData.correct, true, "Correct answer was incorrectly marked as false");
    console.log(`  ✓ Correct answer ("${rawCorrectAnswer}") -> Passed`);

    // 3B. Incorrect Answer Submission
    const wrongSubmit = await fetch(`${BASE_URL}/api/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sampleQ.token, answer: "999999999", mode: 'practice' })
    });
    const wrongData = await wrongSubmit.json();
    assert.strictEqual(wrongData.correct, false, "Wrong answer was erroneously marked as true");
    console.log(`  ✓ Incorrect answer ("999999999") -> Correctly rejected`);

    // -----------------------------------------------------------------
    // 4. BATCH GENERATION FOR TEST LAB
    // -----------------------------------------------------------------
    console.log(`\n[STAGE 4] Testing Batch Generation Payload...`);
    const batchRequests = [
        { topic: 'equations', level: 1, lang: 'sv', wordProblem: true },
        { topic: 'basic_arithmetic', level: 4, lang: 'en', wordProblem: false },
        { topic: 'geometry', level: 2, lang: 'sv', wordProblem: true },
        { topic: 'statistics', level: 2, lang: 'en', wordProblem: false }
    ];

    const batchRes = await fetch(`${BASE_URL}/api/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: batchRequests })
    });
    assert.strictEqual(batchRes.status, 200, "Batch endpoint failed");
    const batchData = await batchRes.json();
    assert.strictEqual(batchData.length, 4, `Batch expected 4 items, got ${batchData.length}`);
    console.log(`  ✓ Successfully received ${batchData.length} mixed questions across categories`);

    console.log(`\n======================================================`);
    console.log(`🎉 ALL PRE-MIGRATION VALIDATIONS PASSED`);
    console.log(`======================================================\n`);
}

runPipelineDiagnostics().catch(err => {
    console.error(`\n❌ VERIFICATION FAILED:`, err.message);
    process.exit(1);
});