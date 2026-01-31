export class ProgressionRules {
    private static readonly STREAK_THRESHOLD = 8;

    private static readonly MAX_LEVELS: Record<string, number> = {
        arithmetic: 9,
        negative: 5,
        ten_powers: 3,
        exponents: 6,       // Added
        fraction_basics: 5, // Added
        fraction_arith: 5,  // Added
        scale: 7,
        equation: 7,
        simplify: 6,
        geometry: 5,
        volume: 7,
        graph: 5,
        similarity: 4,
        percent: 6,
        probability: 6,
        statistics: 6,
        pythagoras: 6
    };

    public static checkLevelUp(newStreak: number, currentLevel: number, topic: string): boolean {
        // Fallback to 5 if topic not found, but we aim to list all
        const maxLevel = this.MAX_LEVELS[topic] || 5;
        if (newStreak > 0 && newStreak % this.STREAK_THRESHOLD === 0 && currentLevel < maxLevel) {
            return true;
        }
        return false;
    }
}