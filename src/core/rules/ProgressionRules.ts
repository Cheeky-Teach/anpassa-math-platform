export class ProgressionRules {
    // The streak required to trigger a level-up suggestion
    private static readonly STREAK_THRESHOLD = 8;

    // Define the specific max level for each generator
    // This ensures the system knows when to stop offering upgrades
    private static readonly MAX_LEVELS: Record<string, number> = {
        scale: 7,      // 6 Levels + Mixed
        equation: 5,   // 4 Levels + Mixed
        simplify: 5,   // 4 Levels + Mixed
        geometry: 5,   // 4 Levels + Mixed
        graph: 5       // 4 Levels + Mixed
    };

    /**
     * Checks if the user qualifies for a difficulty increase.
     * @param newStreak The streak count AFTER the current correct answer.
     * @param currentLevel The user's current level.
     * @param topic The current topic (e.g., 'scale', 'geometry').
     */
    public static checkLevelUp(newStreak: number, currentLevel: number, topic: string): boolean {
        // Default to 5 if topic not found, but we should have all defined
        const maxLevel = this.MAX_LEVELS[topic] || 5;
        
        // Trigger if:
        // 1. Streak > 0
        // 2. Streak is a multiple of 8 (8, 16, 24...)
        // 3. User is not yet at the max level for this topic
        if (newStreak > 0 && newStreak % this.STREAK_THRESHOLD === 0 && currentLevel < maxLevel) {
            return true;
        }
        
        return false;
    }
}