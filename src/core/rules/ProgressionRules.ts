import { DifficultyConfig } from "../types/generator";

export class ProgressionRules {
    // The Magic Number
    private static readonly STREAK_THRESHOLD = 8;

    /**
     * Checks if the user qualifies for a difficulty increase.
     * Returns a message object if they do, or null if they don't.
     */
    public static checkLevelUp(streak: number, currentLevel: number): { shouldPromote: boolean, message?: string } {
        if (streak >= this.STREAK_THRESHOLD && currentLevel < 5) {
            return { 
                shouldPromote: true, 
                message: `🔥 You are on fire! You've answered ${this.STREAK_THRESHOLD} in a row. Do you want to try Level ${currentLevel + 1}?` 
            };
        }
        return { shouldPromote: false };
    }

    /**
     * Returns the difficulty config for a specific level.
     * This ensures all generators use the exact same difficulty scale.
     */
    public static getConfig(level: number): DifficultyConfig {
        return {
            level: level,
            allowNegatives: level > 1, 
            allowFractions: level > 3,
            variableSymbol: 'x',
            complexity: level > 2 ? 'two-step' : 'one-step'
        };
    }
}