// scripts/simulateWordProblems.ts
import { SKILL_BUCKETS } from '../src/constants/skillBuckets.js';
import { TopicMap } from '../api/question.js';
import { WordProblemInterceptor } from '../src/core/utils/WordProblemInterceptor.js';
import { evaluateStoryRules } from '../src/core/utils/evaluateStoryRules.js';

interface SimulationReport {
    topic: string;
    variationKey: string;
    runs: number;
    success: number;
    fallbacks: number;
    errors: string[];
}

async function runSimulation() {
    console.log("🎮 Running Headless Word Problem Simulation via TopicMap...\n");

    const reports: SimulationReport[] = [];
    let totalTested = 0;
    let totalSuccess = 0;
    let totalFallbacks = 0;

    // Iterate through all categories and topics in SKILL_BUCKETS
    for (const [catKey, category] of Object.entries(SKILL_BUCKETS as any)) {
        const topics = category.topics || (category.variations ? { [catKey]: category } : {});

        for (const [topicKey, topicObj] of Object.entries(topics as any)) {
            const GeneratorClass = TopicMap[topicKey];
            if (!GeneratorClass) continue;

            const generator = new GeneratorClass();
            const variations = (topicObj as any).variations || [];

            for (const variation of variations) {
                if (!variation.tags?.includes('word_problem_ready')) continue;

                totalTested++;
                const rep: SimulationReport = {
                    topic: topicKey,
                    variationKey: variation.key,
                    runs: 5,
                    success: 0,
                    fallbacks: 0,
                    errors: []
                };

                for (let i = 0; i < rep.runs; i++) {
                    let rawQuestion: any;

                    // 1. Generate real question using the exact API pattern
                    try {
                        if (typeof generator.generateByVariation === 'function') {
                            rawQuestion = generator.generateByVariation(variation.key, 'sv');
                        } else if (typeof generator.generate === 'function') {
                            rawQuestion = generator.generate(variation.level || 1, 'sv');
                        }
                    } catch (e: any) {
                        rep.errors.push(`Generator error: ${e.message}`);
                        continue;
                    }

                    if (!rawQuestion) {
                        rep.errors.push("Generator returned undefined");
                        continue;
                    }

                    // 2. Simulate User Clicking "Word Problem" Button
                    const transformed = WordProblemInterceptor.process(rawQuestion, variation, 'sv');

                    if (!transformed.metadata?.isWordProblemApplied) {
                        rep.fallbacks++;
                        totalFallbacks++;
                        const token = rawQuestion?.renderData?.interceptorToken || rawQuestion?.renderData?.latex;
                        rep.errors.push(`Fallback triggered. Token was: "${token}"`);
                        continue;
                    }

                    // 3. Verify no unreplaced {placeholder} leaked
                    const desc = transformed.renderData?.description || '';
                    const leaked = desc.match(/\{[a-zA-Z0-9_]+\}/g);
                    if (leaked) {
                        rep.errors.push(`Unreplaced tokens: ${leaked.join(', ')}`);
                        continue;
                    }

                    // 4. Verify rule satisfaction
                    const activeId = transformed.metadata?.activeStoryId;
                    const viableStories = transformed.renderData?.availableStories || [];
                    const activeScenario = viableStories.find((s: any) => s.id === activeId);
                    const params = transformed.renderData?.extractedParams || {};

                    if (activeScenario?.rules) {
                        const ruleCheck = evaluateStoryRules(activeScenario.rules, params);
                        if (!ruleCheck.isValid) {
                            rep.errors.push(`Rule violation in ${activeId}: ${ruleCheck.failedRule}`);
                            continue;
                        }
                    }

                    rep.success++;
                    totalSuccess++;
                }

                reports.push(rep);
            }
        }
    }

    // Print Results
    const failures = reports.filter(r => r.errors.length > 0);

    console.log(`\n========================================`);
    console.log(`Variations Tested: ${totalTested}`);
    console.log(`Successful Transformations: ${totalSuccess}`);
    console.log(`Fallbacks: ${totalFallbacks}`);
    console.log(`========================================\n`);

    if (failures.length > 0) {
        console.error(`❌ Issues detected in ${failures.length} variations:`);
        console.table(failures.map(f => ({
            topic: f.topic,
            variation: f.variationKey,
            passed: `${f.success}/${f.runs}`,
            sampleError: f.errors[0]
        })));
    } else {
        console.log(`🎉 100% of tested variations successfully generate valid word problems!`);
    }
}

runSimulation();