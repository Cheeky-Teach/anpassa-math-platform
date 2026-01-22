import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";
import { CONTEXTS, ContextKey } from "../utils/textEngine";

// Duplicate interfaces locally to avoid dependency issues if file structure varies
interface ExprScenario {
    id: string;
    type: 'A' | 'B' | 'C' | 'D';
    logic: (rng: Random) => MathData;
    templates: { sv: string, en: string }[];
    context: ContextKey;
}

interface MathData {
    vars: Record<string, number>;
    expression: string; // The target simplified expression
    stepsWrite: (lang: Language, formatColor: (v:any)=>string) => Clue[];
}

export class ExpressionSimplificationGen {
  
  // --- SCENARIO DEFINITIONS FOR WORD PROBLEMS (LEVEL 5) ---
  private static getScenarios(): ExprScenario[] {
      return [
          // --- TYPE A: ax + b (Shopping/Taxi) ---
          {
              id: 'shopping_bag',
              type: 'A',
              context: 'shopping',
              // Reusing Equation templates (will strip the "Total" sentence later)
              templates: [ TERMS.problem_solving.a_buy ],
              logic: (rng) => {
                  const a = rng.intBetween(5, 25); // Price
                  const b = rng.pick([2, 5, 10]); // Bag cost
                  return {
                      vars: { a, b }, // We don't need 'c' for expression
                      expression: `${a}x + ${b}`,
                      stepsWrite: (lang, fc) => [
                          { text: "Variable", latex: "x" },
                          { text: t(lang, TERMS.problem_solving.clue_setup), latex: `${a} \\cdot x + ${b}` },
                          { text: t(lang, TERMS.common.result), latex: fc(`${a}x + ${b}`) }
                      ]
                  };
              }
          },
          {
              id: 'taxi',
              type: 'A',
              context: 'shopping', 
              templates: [ TERMS.problem_solving.a_taxi ],
              logic: (rng) => {
                  const a = rng.intBetween(10, 50); // cost/km
                  const b = rng.pick([45, 50, 75, 100]); // start fee
                  return {
                      vars: { a, b },
                      expression: `${a}x + ${b}`,
                      stepsWrite: (lang, fc) => [
                          { text: "Km cost", latex: `${a}x` },
                          { text: "Total", latex: `${a}x + ${b}` },
                          { text: t(lang, TERMS.common.result), latex: fc(`${a}x + ${b}`) }
                      ]
                  };
              }
          },

          // --- TYPE B: ax - b (Discount) ---
          {
              id: 'shopping_discount',
              type: 'B',
              context: 'shopping',
              templates: [ TERMS.problem_solving.b_discount ],
              logic: (rng) => {
                  const a = rng.intBetween(50, 200); // Price
                  const b = rng.pick([20, 50, 100]); // Discount
                  return {
                      vars: { a, b },
                      expression: `${a}x - ${b}`,
                      stepsWrite: (lang, fc) => [
                          { text: "Price", latex: `${a}x` },
                          { text: "Discount", latex: `-${b}` },
                          { text: t(lang, TERMS.common.result), latex: fc(`${a}x - ${b}`) }
                      ]
                  };
              }
          },

          // --- TYPE C: Comparative Sum (x + (x + a)) ---
          {
              id: 'compare_sum',
              type: 'C',
              context: 'hobbies',
              templates: [ TERMS.problem_solving.c_compare ],
              logic: (rng) => {
                  const a = rng.intBetween(2, 10); // Diff
                  return {
                      vars: { a },
                      expression: `2x + ${a}`,
                      stepsWrite: (lang, fc) => [
                          { text: "Person 1", latex: "x" },
                          { text: "Person 2", latex: "x + " + a },
                          { text: t(lang, TERMS.common.simplify), latex: `x + (x + ${a}) = ${fc('2x + ' + a)}` }
                      ]
                  };
              }
          },

          // --- TYPE D: Comparative Diff (x + (x - b)) ---
          {
              id: 'compare_diff',
              type: 'D',
              context: 'hobbies',
              templates: [ TERMS.problem_solving.d_compare ],
              logic: (rng) => {
                  const b = rng.intBetween(2, 8); // Diff
                  return {
                      vars: { b },
                      expression: `2x - ${b}`,
                      stepsWrite: (lang, fc) => [
                          { text: "Person 1", latex: "x" },
                          { text: "Person 2", latex: "x - " + b },
                          { text: t(lang, TERMS.common.simplify), latex: `x + (x - ${b}) = ${fc('2x - ' + b)}` }
                      ]
                  };
              }
          }
      ];
  }

  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;

    let mode = level;
    
    // --- LEVEL 5: WORD PROBLEMS (EXPRESSIONS) ---
    if (mode === 5) {
        const scenarios = this.getScenarios();
        const scenario = rng.pick(scenarios);
        
        // Generate math vars
        const math = scenario.logic(rng);
        
        // Pick template
        const templateObj = rng.pick(scenario.templates);
        let text = t(lang, templateObj);

        // 1. Fill Math Variables ($a$, $b$)
        Object.entries(math.vars).forEach(([key, val]) => {
            text = text.replace(new RegExp(`\\$${key}\\$`, 'g'), `$${val}$`);
            text = text.replace(new RegExp(`\\$${key}`, 'g'), `$${val}`);
        });

        // 2. Remove the "Total is c" sentence to convert Equation Problem -> Expression Problem
        // Regex looks for the last sentence containing '$c'
        text = text.replace(/[^.!?]*\$c\$[^.!?]*[.!?]?\s*$/, "");

        // 3. Fill Context
        const ctxData = CONTEXTS[scenario.context];
        if (ctxData) {
            const itemObj = rng.pick(ctxData.items);
            const itemStr = t(lang, itemObj);
            const name1 = rng.pick(ctxData.people);
            let name2 = rng.pick(ctxData.people);
            while (name1 === name2) name2 = rng.pick(ctxData.people);

            text = text.replace(/{item}/g, itemStr);
            text = text.replace(/{name1}/g, name1);
            text = text.replace(/{name2}/g, name2);
        }

        // Add instruction
        const taskText = t(lang, TERMS.problem_solving.task_write_expr);
        const fullDesc = `${text.trim()} ${taskText}`;

        return {
            questionId: `sim-l5-${seed}`,
            renderData: {
                text_key: "simplify_word",
                description: fullDesc,
                latex: "",
                answerType: 'text',
                variables: {}
            },
            serverData: {
                answer: math.expression,
                solutionSteps: math.stepsWrite(lang, formatColor)
            }
        };
    }

    // --- EXISTING MODES 1-4 & 6 ---
    
    if (level >= 6) mode = rng.intBetween(3, 4); // Use harder modes for mixed level 6

    let expr = "", ansK = 0, ansM = 0, steps: Clue[] = [];
    let descObj = { sv: "Förenkla uttrycket.", en: "Simplify the expression." };

    // --- MODE 1: Grouping (ax + b + cx) ---
    if (mode === 1) {
        const a = rng.intBetween(2, 9);
        const b = rng.intBetween(1, 10);
        const c = rng.intBetween(2, 9);
        expr = `${a}x + ${b} + ${c}x`; 
        ansK = a + c; 
        ansM = b;
        
        steps = [
            { text: t(lang, TERMS.simplification.intro(expr)), latex: expr }, 
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${b}` },
            { text: t(lang, TERMS.common.result), latex: formatColor(`${ansK}x + ${ansM}`) }
        ];
    } 
    
    // --- MODE 2: Parentheses k(x + a) ---
    else if (mode === 2) {
        const k = rng.intBetween(2, 9);
        const a = rng.intBetween(1, 9);
        expr = `${k}(x + ${a})`; 
        ansK = k; 
        ansM = k * a;
        
        steps = [
            { text: t(lang, TERMS.simplification.intro(expr)), latex: expr }, 
            { text: t(lang, TERMS.algebra.distribute(k)), latex: `${k} \\cdot x + ${k} \\cdot ${a}` },
            { text: t(lang, TERMS.common.result), latex: formatColor(`${ansK}x + ${ansM}`) }
        ];
    }

    // --- MODE 3: Distribute & Simplify a(x + b) + cx ---
    else if (mode === 3) {
        const a = rng.intBetween(2, 5);
        const b = rng.intBetween(1, 5);
        const c = rng.intBetween(2, 9);
        
        expr = `${a}(x + ${b}) + ${c}x`;
        const distM = a * b; 
        ansK = a + c; 
        ansM = distM;
        
        steps = [
            { text: t(lang, TERMS.simplification.intro(expr)), latex: expr }, 
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a}x + ${distM} + ${c}x` }, 
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${distM}` }, 
            { text: t(lang, TERMS.common.result), latex: formatColor(`${ansK}x + ${ansM}`) }
        ];
    }
    
    // --- MODE 4: Subtracting Parentheses a(x + b) - c(x - d) ---
    else {
        const a = rng.intBetween(2, 5);
        const b = rng.intBetween(1, 5);
        const c = rng.intBetween(2, 4);
        const d = rng.intBetween(1, 5);
        
        expr = `${a}(x + ${b}) - ${c}(x - ${d})`;
        const distM1 = a * b;
        const distM2 = c * d; 
        
        ansK = a - c; 
        ansM = distM1 + distM2; 
        
        steps = [
            { text: t(lang, TERMS.simplification.intro(expr)), latex: expr }, 
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a}x + ${distM1} - ${c}x + ${distM2}` }, 
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x - ${c}x) + (${distM1} + ${distM2})` }, 
            { text: t(lang, TERMS.common.result), latex: formatColor(`${ansK}x + ${ansM}`) }
        ];
    }

    const mPart = ansM >= 0 ? `+ ${ansM}` : `- ${Math.abs(ansM)}`;
    const answerStr = `${ansK}x ${mPart}`;

    return {
        questionId: `sim-l${level}-${seed}`,
        renderData: {
            text_key: "simplify",
            description: descObj,
            latex: expr,
            answerType: 'text'
        },
        serverData: {
            answer: answerStr,
            solutionSteps: steps
        }
    };
  }
}