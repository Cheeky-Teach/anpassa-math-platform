export interface StoryRules {
    /** Minimum allowed numerical value for division outcomes or calculations (e.g. price per unit cannot be < 0.50) */
    minResult?: number;
    /** Maximum allowed value for calculated outcomes (e.g. duration cannot exceed 15 minutes) */
    maxResult?: number;
    /** Array of extracted parameter keys that MUST be integers (e.g. ['num', 'count', 'people']) */
    integerOnly?: string[];
    /** Asserts params[first] > params[second] (e.g. total volume > container volume) */
    greaterThan?: [string, string];
    /** Asserts params[first] < params[second] */
    lessThan?: [string, string];
    /** Asserts that for keys [a, b, c], the sum of any two sides is strictly greater than the third side */
    triangleInequality?: [string, string, string];
    /** Safe boolean function for complex domain-specific constraints */
    custom?: (params: Record<string, number>) => boolean;
}

export interface StoryScenario {
    id: string;
    sv: string;
    en: string;
    rules?: StoryRules;
}

export interface StoryValidationResult {
    isValid: boolean;
    failedRule?: string;
}