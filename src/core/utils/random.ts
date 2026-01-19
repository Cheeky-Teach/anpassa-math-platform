export class Random {
    private seed: string;

    constructor(seed: string) {
        this.seed = seed;
    }

    public intBetween(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    public pick<T>(array: T[]): T {
        return array[this.intBetween(0, array.length - 1)];
    }
}