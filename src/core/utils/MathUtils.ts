export class MathUtils {
    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomFloat(min: number, max: number, decimals: number = 1): number {
        const val = Math.random() * (max - min) + min;
        return Number(val.toFixed(decimals));
    }

    static randomChoice<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    static gcd(a: number, b: number): number {
        return b === 0 ? a : MathUtils.gcd(b, a % b);
    }

    // FIX: Added the missing shuffle method
    static shuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}