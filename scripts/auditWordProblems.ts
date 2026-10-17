// npx tsx e:\anpassa-v2/scripts/auditwordproblems.ts
import { SKILL_BUCKETS } from '../src/constants/skillBuckets.js';
import { GLOBAL_STORY_REGISTRY } from '../src/core/utils/stories/index.js';
import { StoryScenario } from '../src/core/utils/wordProblemContract.js';

interface AuditError {
    topic: string;
    variationKey: string;
    contextType: string;
    message: string;
}

function extractRegexNamedGroups(pattern: RegExp): string[] {
    const source = pattern.source;
    const matches = source.matchAll(/\(\?<([a-zA-Z0-9_]+)>/g);
    const groups: string[] = [];
    for (const match of matches) {
        groups.push(match[1]);
    }
    return groups;
}

function extractPlaceholders(text: string): string[] {
    const matches = text.matchAll(/\{([a-zA-Z0-9_]+)\}/g);
    const placeholders: string[] = [];
    for (const match of matches) {
        if (!placeholders.includes(match[1])) {
            placeholders.push(match[1]);
        }
    }
    return placeholders;
}

export function runAudit(filterTopic?: string): boolean {
    const errors: AuditError[] = [];
    let checkedVariations = 0;
    let checkedStories = 0;

    console.log('\n🔍 Starting Word Problem Audit...\n');

    for (const [catKey, category] of Object.entries(SKILL_BUCKETS as Record<string, any>)) {
        if (!category.topics) continue;

        for (const [topicKey, topicObj] of Object.entries(category.topics as Record<string, any>)) {
            if (filterTopic && topicKey !== filterTopic) continue;

            const variations: any[] = topicObj.variations || [];

            for (const v of variations) {
                if (!v.tags || !v.tags.includes('word_problem_ready')) {
                    continue;
                }

                checkedVariations++;
                const { key, contextType, extractorPattern } = v;

                // 1. Check contextType exists
                if (!contextType) {
                    errors.push({
                        topic: topicKey,
                        variationKey: key,
                        contextType: 'MISSING',
                        message: 'Variation marked word_problem_ready but lacks contextType'
                    });
                    continue;
                }

                // 2. Check registry has matching entry
                const rawEntry = (GLOBAL_STORY_REGISTRY as Record<string, any>)[contextType];
                if (!rawEntry) {
                    errors.push({
                        topic: topicKey,
                        variationKey: key,
                        contextType,
                        message: `contextType "${contextType}" not found in GLOBAL_STORY_REGISTRY`
                    });
                    continue;
                }

                // 3. Check extractorPattern
                if (!extractorPattern || !(extractorPattern instanceof RegExp)) {
                    errors.push({
                        topic: topicKey,
                        variationKey: key,
                        contextType,
                        message: 'Missing or invalid RegExp in extractorPattern'
                    });
                    continue;
                }

                const namedGroups = extractRegexNamedGroups(extractorPattern);

                // Collect story scenarios (flatten any sub-bucket operator records)
                let scenarios: StoryScenario[] = [];
                if (Array.isArray(rawEntry)) {
                    scenarios = rawEntry;
                } else if (typeof rawEntry === 'object' && rawEntry !== null) {
                    for (const subKey of Object.keys(rawEntry)) {
                        if (Array.isArray(rawEntry[subKey])) {
                            scenarios.push(...rawEntry[subKey]);
                        } else {
                            scenarios.push(rawEntry[subKey]);
                        }
                    }
                }

                if (scenarios.length === 0) {
                    errors.push({
                        topic: topicKey,
                        variationKey: key,
                        contextType,
                        message: `No story scenarios found under contextType "${contextType}"`
                    });
                    continue;
                }

                // 4. Validate placeholders against regex groups
                for (let i = 0; i < scenarios.length; i++) {
                    checkedStories++;
                    const story = scenarios[i];
                    const svPlaceholders = extractPlaceholders(story.sv || '');
                    const enPlaceholders = extractPlaceholders(story.en || '');
                    const allPlaceholders = Array.from(new Set([...svPlaceholders, ...enPlaceholders]));

                    for (const ph of allPlaceholders) {
                        if (!namedGroups.includes(ph)) {
                            errors.push({
                                topic: topicKey,
                                variationKey: key,
                                contextType,
                                message: `Story #${i} contains {${ph}}, which is missing from extractorPattern named groups: [${namedGroups.join(', ')}]`
                            });
                        }
                    }
                }
            }
        }
    }

    console.log(`Checked Variations: ${checkedVariations}`);
    console.log(`Checked Stories:    ${checkedStories}`);

    if (errors.length > 0) {
        console.error(`\n❌ Found ${errors.length} issue(s):\n`);
        console.table(errors);
        return false;
    }

    console.log('\n✅ All word problem registries, regex patterns, and story templates matched successfully!\n');
    return true;
}

// CLI entry point
const args = process.argv.slice(2);
const topicFlagIndex = args.indexOf('--topic');
const filterTopic = topicFlagIndex !== -1 ? args[topicFlagIndex + 1] : undefined;

const passed = runAudit(filterTopic);
if (!passed) {
    process.exit(1);
}