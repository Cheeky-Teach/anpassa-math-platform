export interface DifficultyConfig {
  level: number;
  allowNegatives: boolean;
  allowFractions: boolean;
  variableSymbol: string;
  complexity: 'one-step' | 'two-step' | 'variables-both-sides';
}

export interface Clue {
    text: string;
    latex: string;
}

// Define valid answer types
export type AnswerType = 'numeric' | 'multiple_choice' | 'function_model' | 'scale';

export interface GeneratedQuestion {
  questionId: string;
  renderData: {
    text_key: string;
    variables?: Record<string, string | number>;
    latex?: string;
    description?: string; 
    answerType?: AnswerType; 
    choices?: string[];      
    graph?: {
        type: 'linear';
        lines: { slope: number; intercept: number; color: string; label?: string }[]; 
        range: number;
        gridStep: number;
        labelStep: number;
    };
    geometry?: any;
  };
  serverData: {
    answer: any; 
    solutionSteps: Clue[];
  };
}