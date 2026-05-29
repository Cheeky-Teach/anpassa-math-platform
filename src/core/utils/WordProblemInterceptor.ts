// src/core/utils/WordProblemInterceptor.ts
import { VariationConfig } from './types.js'; // If broken out
import { GLOBAL_STORY_REGISTRY } from './stories/index.js'; // 🟢 Dynamic content link

export interface StoryScenario {
    sv: string;
    en: string;
}

export class WordProblemInterceptor {
    public static process(questionData: any, variationConfig: VariationConfig, lang: string = 'sv'): any {
        if (!variationConfig || !variationConfig.contextType || !variationConfig.extractorPattern) {
            return questionData;
        }

        const latexSource = questionData?.renderData?.latex;
        if (!latexSource || typeof latexSource !== 'string') {
            return questionData;
        }

        const matchResult = latexSource.match(variationConfig.extractorPattern);
        if (!matchResult || !matchResult.groups) {
            return questionData; 
        }

        const extractedParams = matchResult.groups;
        
        // 🟢 FIXED: Reads from the clean, imported decentralized registry
        const entry = GLOBAL_STORY_REGISTRY[variationConfig.contextType];
        if (!entry) {
            return questionData;
        }

        let activeScenario: StoryScenario;
        if (Array.isArray(entry)) {
            const seedValue = Object.values(extractedParams).reduce((acc, val) => {
                const num = parseInt(String(val).replace(/[()]/g, '')) || 0;
                return acc + num;
            }, 0);
            const selectedIndex = Math.abs(seedValue) % entry.length;
            activeScenario = entry[selectedIndex];
        } else {
            activeScenario = entry;
        }

        let localizedStory = activeScenario[lang === 'en' ? 'en' : 'sv'];

        Object.entries(extractedParams).forEach(([key, value]) => {
            const cleanValue = String(value).replace(/[()]/g, '');
            localizedStory = localizedStory.replace(new RegExp(`{${key}}`, 'g'), cleanValue);
        });

        return {
            ...questionData,
            renderData: {
                ...questionData.renderData,
                description: localizedStory
            },
            metadata: {
                ...questionData.metadata,
                isWordProblemApplied: true
            }
        };
    }
}