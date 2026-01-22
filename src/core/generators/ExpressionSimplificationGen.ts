import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";
import { CONTEXTS, ContextKey } from "../utils/textEngine";

interface ExprScenario {
    id: string;
    type: 'A' | 'B' | 'C' | 'D';
    logic: (rng: Random) => MathData;
    templates: { sv: string, en: string }[];
    context: ContextKey;
}

interface MathData {
    vars: Record<string, number>;
    expression: string; 
    stepsWrite: (lang: Language, formatColor: (v:any)=>string) => Clue[];
}

export class ExpressionSimplificationGen {
  
  private static getScenarios(): ExprScenario[] {
      return [
          {
              id: 'shopping_bag',
              type: 'A',
              context: 'shopping',
              templates: [ TERMS.problem_solving.a_buy ],
              logic: (rng) => {
                  const a = rng.intBetween(5, 25); 
                  const b = rng.pick([2, 5, 10]); 
                  return {
                      vars: { a, b },
                      expression: `${a}x + ${b}`,
                      stepsWrite: (lang, fc) => [
                          { text: t(lang, TERMS.problem_solving.expl_rate_val), latex: `${a} \\cdot x` },
                          { text: t(lang, TERMS.problem_solving.expl_fixed_val), latex: `+ ${b}` },
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
                  const a = rng.intBetween(10, 50); 
                  const b = rng.pick([45, 50, 75, 100]); 
                  return {
                      vars: { a, b },
                      expression: `${a}x + ${b}`,
                      stepsWrite: (lang, fc) => [
                          { text: t(lang, TERMS.problem_solving.expl_rate_val), latex: `${a}x` },
                          { text: t(lang, TERMS.problem_solving.expl_fixed_val), latex: `+ ${b}` },
                          { text: t(lang, TERMS.common.result), latex: fc(`${a}x + ${b}`) }
                      ]
                  };
              }
          },
          {
              id: 'shopping_discount',
              type: 'B',
              context: 'shopping',
              templates: [ TERMS.problem_solving.b_discount ],
              logic: (rng) => {
                  const a = rng.intBetween(50, 200); 
                  const b = rng.pick([20, 50, 100]); 
                  return {
                      vars: { a, b },
                      expression: `${a}x - ${b}`,
                      stepsWrite: (lang, fc) => [
                          { text: t(lang, TERMS.problem_solving.expl_rate_val), latex: `${a}x` },
                          { text: t(lang, TERMS.simplification.expl_discount), latex: `-${b}` },
                          { text: t(lang, TERMS.common.result), latex: fc(`${a}x - ${b}`) }
                      ]
                  };
              }
          },
          {
              id: 'compare_sum',
              type: 'C',
              context: 'hobbies',
              templates: [ TERMS.problem_solving.c_compare ],
              logic: (rng) => {
                  const a = rng.intBetween(2, 10); 
                  return {
                      vars: { a },
                      expression: `2x + ${a}`,
                      stepsWrite: (lang, fc) => [
                          { text: t(lang, TERMS.problem_solving.expl_person1), latex: "x" },
                          { text: t(lang, TERMS.problem_solving.expl_person2_more), latex: `x + ${a}` },
                          { text: t(lang, TERMS.simplification.group_terms), latex: `x + (x + ${a}) = ${fc('2x + ' + a)}` }
                      ]
                  };
              }
          },
          {
              id: 'compare_diff',
              type: 'D',
              context: 'hobbies',
              templates: [ TERMS.problem_solving.d_compare ],
              logic: (rng) => {
                  const b = rng.intBetween(2, 8); 
                  return {
                      vars: { b },
                      expression: `2x - ${b}`,
                      stepsWrite: (lang, fc) => [
                          { text: t(lang, TERMS.problem_solving.expl_person1), latex: "x" },
                          { text: t(lang, TERMS.problem_solving.expl_person2_less), latex: `x - ${b}` },
                          { text: t(lang, TERMS.simplification.group_terms), latex: `x + (x - ${b}) = ${fc('2x - ' + b)}` }
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
        const math = scenario.logic(rng);
        const templateObj = rng.pick(scenario.templates);
        let text = t(lang, templateObj);

        Object.entries(math.vars).forEach(([key, val]) => {
            text = text.replace(new RegExp(`\\$${key}\\$`, 'g'), `$${val}$`);
            text = text.replace(new RegExp(`\\$${key}`, 'g'), `$${val}`);
        });

        text = text.replace(/[^.!?]*\$c\$[^.!?]*[.!?]?\s*$/, ""); 

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

    if (level >= 6) mode = rng.intBetween(3, 4);

    let expr = "", ansK = 0, ansM = 0, steps: Clue[] = [];
    let descObj = { sv: "Förenkla uttrycket.", en: "Simplify the expression." };

    if (mode === 1) {
        const a = rng.intBetween(2, 9);
        const b = rng.intBetween(1, 10);
        const c = rng.intBetween(2, 9);
        expr = `${a}x + ${b} + ${c}x`; 
        ansK = a + c; 
        ansM = b;
        
        steps = [
            { text: t(lang, TERMS.simplification.expl_var_basic), latex: `${a}x + ${c}x` }, 
            { text: t(lang, TERMS.simplification.expl_group), latex: `(${a} + ${c})x = ${a+c}x` },
            { text: t(lang, TERMS.common.result), latex: formatColor(`${ansK}x + ${ansM}`) }
        ];
    } 
    else if (mode === 2) {
        const k = rng.intBetween(2, 9);
        const a = rng.intBetween(1, 9);
        expr = `${k}(x + ${a})`; 
        ansK = k; 
        ansM = k * a;
        
        steps = [
            { text: t(lang, TERMS.simplification.expl_distribute(k)), latex: `${k} \\cdot x + ${k} \\cdot ${a}` }, 
            { text: t(lang, TERMS.common.result), latex: formatColor(`${ansK}x + ${ansM}`) }
        ];
    }
    else if (mode === 3) {
        const a = rng.intBetween(2, 5);
        const b = rng.intBetween(1, 5);
        const c = rng.intBetween(2, 9);
        expr = `${a}(x + ${b}) + ${c}x`;
        const distM = a * b; 
        ansK = a + c; 
        ansM = distM;
        
        steps = [
            { text: t(lang, TERMS.simplification.expl_distribute(a)), latex: `${a}x + ${distM} + ${c}x` }, 
            { text: t(lang, TERMS.simplification.expl_group), latex: `(${a} + ${c})x + ${distM}` }, 
            { text: t(lang, TERMS.common.result), latex: formatColor(`${ansK}x + ${ansM}`) }
        ];
    }
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
            { text: t(lang, TERMS.simplification.expl_distribute(a)), latex: `${a}x + ${distM1} - ${c}x + ${distM2}` }, 
            { text: t(lang, TERMS.simplification.expl_group), latex: `(${a} - ${c})x + (${distM1} + ${distM2})` }, 
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