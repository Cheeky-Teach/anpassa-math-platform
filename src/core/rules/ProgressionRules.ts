export class ProgressionRules {
    private static readonly STREAK_THRESHOLD = 8;

    private static readonly MAX_LEVELS: Record<string, number> = {
        scale: 7,
        equation: 6,
        simplify: 6,   // Updated to 6
        geometry: 5,
        graph: 5
    };

    public static checkLevelUp(newStreak: number, currentLevel: number, topic: string): boolean {
        // Default to 5 if topic not found
        const maxLevel = this.MAX_LEVELS[topic] || 5;
        
        // Trigger if:
        // 1. Streak > 0
        // 2. Streak is a multiple of 8
        // 3. User is not yet at the max level
        if (newStreak > 0 && newStreak % this.STREAK_THRESHOLD === 0 && currentLevel < maxLevel) {
            return true;
        }
        
        return false;
    }
}