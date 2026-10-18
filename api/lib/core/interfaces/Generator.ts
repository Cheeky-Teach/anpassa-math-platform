export interface QuestionData {
    text?: string;
    renderData?: any; // Preferred
    visual?: any;     // Legacy
    answer: string | number;
    clues: string[];
}

export interface Generator {
    /**
     * Generates a new question.
     * @param level Difficulty level (1-9)
     * @param lang Language code ('sv' | 'en')
     */
    generate(level: number, lang: string): QuestionData;

    /**
     * Optional: Custom validation logic for answers.
     * @param userAnswer The user's input
     * @param systemAnswer The generated correct answer
     */
    validate?(userAnswer: string, systemAnswer: string): boolean;
}