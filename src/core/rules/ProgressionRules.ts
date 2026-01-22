export class ProgressionRules {
    private static readonly STREAK_THRESHOLD = 8;

    private static readonly MAX_LEVELS: Record<string, number> = {
        scale: 7,
        equation: 6,
        simplify: 6,
        geometry: 5,
        volume: 6, // Added
        graph: 5
    };

    public static checkLevelUp(newStreak: number, currentLevel: number, topic: string): boolean {
        const maxLevel = this.MAX_LEVELS[topic] || 5;
        if (newStreak > 0 && newStreak % this.STREAK_THRESHOLD === 0 && currentLevel < maxLevel) {
            return true;
        }
        return false;
    }
}