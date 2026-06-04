import { GLOBAL_STORY_REGISTRY } from './stories/index.js'; // Import the global story registry database

export function enrichQuestionMetadata(question: any, variationConfig?: any): any {
    if (!question) return question;

    if (!question.metadata) {
        question.metadata = {};
    }

    // 1. Check for the local background token channel first
    if (question.renderData?.interceptorToken) {
        question.metadata.levelSupportsWordProblems = true;
        return question;
    }

    // 2. 💎 DYNAMIC REGISTRY CHECK: 
    // If the variation's contextType maps directly to an existing array in our story database, 
    // it automatically supports word problems! No hardcoded arrays or key updates required.
    if (variationConfig?.contextType && GLOBAL_STORY_REGISTRY[variationConfig.contextType]) {
        question.metadata.levelSupportsWordProblems = true;
    }

    return question;
}