/**
 * MASTER REGISTRY OF SKILL BUCKETS (VARIATION KEYS)
 * Synchronized with refactored generators.
 */

export const SKILL_BUCKETS = {
  // ==========================================
  // 1. ALGEBRA & MÖNSTER
  // ==========================================
  algebra: {
    id: 'algebra',
    name: { sv: 'Algebra & Mönster', en: 'Algebra & Patterns' },
    topics: {
      equations: {
        name: { sv: 'Ekvationslösning', en: 'Equation Solving' },
        variations: [
          { 
            key: 'onestep_calc', 
            name: { sv: 'Ensteg: Beräkning', en: 'One-step: Calculation' }, 
            desc: { sv: 'Lös enkla x + a = b eller x - a = b', en: 'Solve simple x + a = b or x - a = b' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_onestep',
            // 🟢 Captures context parameters: {type} (multiply/add/sub), {a} (modifier constant), {b} (evaluated total)
            extractorPattern: /^(?<type>multiply|add|sub)\s*;\s*(?<a>\d+)\s*;\s*(?<b>\d+)$/
          },
          { key: 'onestep_concept_inverse', name: { sv: 'Ensteg: Invers', en: 'One-step: Inverse' }, desc: { sv: 'Välj rätt räknesätt (+/-/*/÷)', en: 'Choose the correct operation' } },
          { key: 'onestep_spot_lie', name: { sv: 'Hitta felet: Ensteg', en: 'Find the error: One-step' }, desc: { sv: 'Identifiera felaktig lösning', en: 'Identify incorrect solutions' } },
          { 
            key: 'twostep_calc', 
            name: { sv: 'Tvåsteg: Beräkning', en: 'Two-step: Calculation' }, 
            desc: { sv: 'ax + b = c eller ax - b = c', en: 'ax + b = c or ax - b = c' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_twostep',
            // 🟢 Captures: {type} (multiply/divide), {a} (coefficient), {op} (+/-), {b} (constant), and {c} (total)
            extractorPattern: /^(?<type>multiply|divide)\s*;\s*(?<a>\d+)\s*;\s*(?<op>[\+\-])\s*;\s*(?<b>\d+)\s*;\s*(?<c>\d+)$/
          },
          { key: 'twostep_concept_order', name: { sv: 'Tvåsteg: Ordning', en: 'Two-step: Order' }, desc: { sv: 'Vilket steg tas först?', en: 'Which step is taken first?' } },
          { 
            key: 'paren_calc', 
            name: { sv: 'Parenteser: Beräkning', en: 'Parentheses: Calculation' }, 
            desc: { sv: 'a(x + b) = c eller a(x - b) = c', en: 'a(x + b) = c or a(x - b) = c' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_parentheses',
            // Matches: 2(x + 4) = 16 OR 3(x - 5) = 21
            extractorPattern: /^(?<a>\d+)\(x\s*(?<op>[\+\-])\s*(?<b>\d+)\)\s*=\s*(?<c>\d+)$/
          },
          { key: 'paren_lie_distribution', name: { sv: 'Hitta felet: Parentes', en: 'Find the error: Parentheses' }, desc: { sv: 'Analysera multiplikation i parentes', en: 'Analyze distribution errors' } },
          { 
            key: 'bothsides_calc', 
            name: { sv: 'X på båda sidor', en: 'X on both sides' }, 
            desc: { sv: 'Samla x-termer på en sida (ax + b = cx + d)', en: 'Collect x-terms on one side' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_bothsides',
            // Matches equations where a > c to guarantee positive x-bounds: 5x + 4 = 2x + 16 OR 4x - 3 = 2x + 9
            extractorPattern: /^(?<a>\d+)x\s*(?<op1>[\+\-])\s*(?<b>\d+)\s*=\s*(?<c>\d+)x\s*(?<op2>[\+\-])\s*(?<d>\d+)$/
          },
          { 
            key: 'twostep_write_problem', 
            name: { sv: 'Formulera: Ekvation', en: 'Formulate: Equation' }, 
            desc: { sv: 'Skriv ekvationen utifrån en text', en: 'Write equation from a story' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_twostep_formulation',
            extractorPattern: /^(?<type>multiply|divide)\s*;\s*(?<a>\d+)\s*;\s*(?<op>[\+\-])\s*;\s*(?<b>\d+)\s*;\s*(?<c>\d+)$/
          },
          { 
            key: 'twostep_solve_problem', 
            name: { sv: 'Lös: Verklighetsproblem', en: 'Solve: Word Problems' }, 
            desc: { sv: 'Beräkna x utifrån en text', en: 'Calculate x from a story' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_twostep_solver',
            extractorPattern: /^(?<type>multiply|divide)\s*;\s*(?<a>\d+)\s*;\s*(?<op>[\+\-])\s*;\s*(?<b>\d+)\s*;\s*(?<c>\d+)$/
          },
          { key: 'bothsides_concept_strategy', name: { sv: 'X på båda sidor: Strategi', en: 'X on both sides: Strategy' }, desc: { sv: 'Håll antalet x positivt', en: 'Keep the number of x positive' } }
        ]
      },
      equations_word: {
        name: { sv: 'Ekvationer: Problemlösning', en: 'Equations: Problem Solving' },
        variations: [
          { key: 'rate_fixed_add_write', name: { sv: 'Skriv: Fast + Rörlig', en: 'Write: Fixed + Variable' }, desc: { sv: 'Teckna ekvation', en: 'Formulate equation' } },
          { key: 'rate_fixed_add_solve', name: { sv: 'Lös: Fast + Rörlig', en: 'Solve: Fixed + Variable' }, desc: { sv: 'Beräkna x givet total', en: 'Calculate x given total' } },
          { key: 'rate_fixed_sub_write', name: { sv: 'Skriv: Rabatt/Minskning', en: 'Write: Discount/Decrease' }, desc: { sv: 'Teckna ekvation', en: 'Formulate equation' } },
          { key: 'rate_fixed_sub_solve', name: { sv: 'Lös: Rabatt/Minskning', en: 'Solve: Discount/Decrease' }, desc: { sv: 'Hitta antal efter rabatt', en: 'Find count after discount' } },
          { key: 'compare_word_sum_write', name: { sv: 'Skriv: Jämförelse (Summa)', en: 'Write: Comparison (Sum)' }, desc: { sv: 'x + (x+a) = Total', en: 'x + (x+a) = Total' } },
          { key: 'compare_word_sum_solve', name: { sv: 'Lös: Jämförelse (Summa)', en: 'Solve: Comparison (Sum)' }, desc: { sv: 'Hitta delarna', en: 'Find the parts' } },
          { key: 'compare_word_diff_write', name: { sv: 'Skriv: Jämförelse (Diff)', en: 'Write: Comparison (Diff)' }, desc: { sv: 'x + (x-a) = Total', en: 'x + (x-a) = Total' } },
          { key: 'compare_word_diff_solve', name: { sv: 'Lös: Jämförelse (Diff)', en: 'Solve: Comparison (Diff)' }, desc: { sv: 'Hitta delarna', en: 'Find the parts' } }
        ]
      },
      expressions: {
        name: { sv: 'Förenkling av Uttryck', en: 'Expression Simplification' },
        variations: [
          // LEVEL 1: Samla termer (Combine Terms)
          { key: 'combine_lie_exponent', level: 1, name: { sv: 'Hitta felet: Potenser', en: 'Find error: Exponents' }, desc: { sv: 'x + x vs x * x', en: 'x + x vs x * x' } },
          { key: 'combine_concept_id', level: 1, name: { sv: 'Begrepp: Termer', en: 'Concept: Terms' }, desc: { sv: 'Identifiera lika termer', en: 'Identify like terms' } },
          { 
            key: 'combine_standard_mixed', 
            level: 1,
            name: { sv: 'Förenkla uttryck', en: 'Simplify expressions' }, 
            desc: { sv: 'Samla x och tal i ordning', en: 'Combine x and constants' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_expressions',
            extractorPattern: /^(?<a>\d+)x\s*(?<op1>[\+\-])\s*(?<b>\d+)\s*(?<op2>[\+\-])\s*(?<c>\d+)x\s*(?<op3>[\+\-])\s*(?<d>\d+)$/
          },
          { 
            key: 'expressions_word_problem', 
            level: 1,
            name: { sv: 'Uttryck: Vardagsproblem', en: 'Expressions: Word Problems' }, 
            desc: { sv: 'Förenkla uttryck utifrån textscenarier', en: 'Simplify expressions from text scenarios' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_expressions_story',
            extractorPattern: /^(?<a>\d+)x\s*(?<op1>[\+\-])\s*(?<b>\d+)\s*(?<op2>[\+\-])\s*(?<c>\d+)x\s*(?<op3>[\+\-])\s*(?<d>\d+)$/
          },
          { key: 'word_candy', level: 1, name: { sv: 'Uttryck: Godispåsar', en: 'Expressions: Candy bags' }, desc: { sv: 'Teckna uttryck', en: 'Formulate expression' } },
          { key: 'word_combined_age_tri', level: 1, name: { sv: 'Uttryck: Åldrar', en: 'Expressions: Ages' }, desc: { sv: 'Tre personers ålder', en: 'Ages of three people' } },
          { key: 'word_passengers', level: 1, name: { sv: 'Uttryck: Passagerare', en: 'Expressions: Passengers' }, desc: { sv: 'Förändring på buss', en: 'Changes on a bus' } },

          // LEVEL 2: Parenteser (Parentheses)
          { key: 'distribute_lie_partial', level: 2, name: { sv: 'Hitta felet: Parentes', en: 'Find error: Parentheses' }, desc: { sv: 'Partiell distribution', en: 'Partial distribution' } },
          { 
            key: 'distribute_plus', 
            level: 2,
            name: { sv: 'Parentes (+)', en: 'Parentheses (+)' }, 
            desc: { sv: 'Multiplicera in i parentes', en: 'Multiply into parentheses' }, 
            tags: ['word_problem_ready'],
            contextType: 'algebra_expressions_dist',
            extractorPattern: /^(?<a>\d+)x\s*\+\s*\(?(?<b>\d*)x\s*\+\s*(?<c>\d+)\)?$/
          },
          { 
            key: 'distribute_minus', 
            level: 2,
            name: { sv: 'Parentes (-)', en: 'Parentheses (-)' }, 
            desc: { sv: 'Multiplicera med negativt tecken', en: 'Multiply with negative sign' }, 
            tags: ['word_problem_ready'],
            contextType: 'algebra_expressions_dist_neg',
            extractorPattern: /^(?<a>\d+)x\s*-\s*\(?(?<b>\d*)x\s*\+\s*(?<c>\d+)\)?$/
          },

          // LEVEL 3: Expandera och Förenkla (Distribute & Simplify)
          { key: 'distribute_double', level: 3, name: { sv: 'Dubbla parenteser', en: 'Double parentheses' }, desc: { sv: 'Expandera två parenteser', en: 'Expand two parentheses' } },
          { 
            key: 'distribute_combine_std', 
            level: 3,
            name: { sv: 'Expandera & Förenkla', en: 'Expand & Simplify' }, 
            desc: { sv: 'Förenkla uttryck med parenteser', en: 'Simplify expressions with parentheses' }, 
            tags: ['word_problem_ready'],
            contextType: 'algebra_expressions_expand',
            extractorPattern: /^(?<a>\d+)\((?<b>\d*)x\s*\+\s*(?<c>\d+)\)\s*(?<op>[\+\-])\s*(?<d>\d+)x$/
          },

          // LEVEL 4: Minusparenteser (Subtract Parentheses)
          { key: 'sub_concept_plus_logic', level: 4, name: { sv: 'Teckenregler', en: 'Sign rules' }, desc: { sv: 'Minus framför parentes', en: 'Minus in front of parentheses' } },
          { key: 'sub_block_plus', level: 4, name: { sv: 'Minusparentes (+)', en: 'Minus parentheses (+)' }, desc: { sv: '-(ax + b)', en: '-(ax + b)' } },
          { key: 'sub_block_minus', level: 4, name: { sv: 'Minusparentes (-)', en: 'Minus parentheses (-)' }, desc: { sv: '-(ax - b)', en: '-(ax - b)' } }
        ]
      },
      algebraic_geometry: {
        name: { sv: 'Geometri med Algebra', en: 'Geometry with Algebra' },
        variations: [
          // LEVEL 1: Omkrets - Teckna uttryck
          { key: 'perimeter_write', level: 1, name: { sv: 'Omkrets: Teckna uttryck', en: 'Perimeter: Write Expression' }, desc: { sv: 'Skriv förenklat uttryck för figurernas sidomkrets', en: 'Write a simplified expression for shape perimeters' } },
          
          // LEVEL 2: Omkrets - Lös ut x
          { key: 'perimeter_solve', level: 2, name: { sv: 'Omkrets: Lös ut x', en: 'Perimeter: Solve for x' }, desc: { sv: 'Hitta x-värdet utifrån en känd total omkrets', en: 'Find x based on a known total perimeter parameter' } },
          
          // LEVEL 3: Area - Teckna uttryck
          { key: 'area_write', level: 3, name: { sv: 'Area: Teckna uttryck', en: 'Area: Write Expression' }, desc: { sv: 'Teckna ett förenklat uttryck för areaytan', en: 'Write a simplified expression for side areas' } },
          
          // LEVEL 4: Area - Lös ut x
          { key: 'area_solve', level: 4, name: { sv: 'Area: Lös ut x', en: 'Area: Solve for x' }, desc: { sv: 'Lös ut x-variabeln via kända area-parametrar', en: 'Isolate x via a known given total figure area' } },
          
          // LEVEL 5: Vinklar - Teckna uttryck
          { key: 'angles_write', level: 5, name: { sv: 'Vinklar: Teckna uttryck', en: 'Angles: Write Expression' }, desc: { sv: 'Teckna uttryck för intilliggande vinkelsummor', en: 'Write expressions for combined adjacent angles' } },
          
          // LEVEL 6: Vinklar - Lös ut x
          { key: 'angles_solve', level: 6, name: { sv: 'Vinklar: Lös ut x', en: 'Angles: Solve for x' }, desc: { sv: 'Beräkna x via vinklar på en rät linje (180°)', en: 'Calculate x using straight line angles summing to 180°' } }
        ]
      },
      patterns: {
        name: { sv: 'Mönster & Formler', en: 'Patterns & Formulas' },
        variations: [
          { key: 'seq_lie', name: { sv: 'Hitta felet: Talföljd', en: 'Find error: Sequence' }, desc: { sv: 'Analysera mönsterlogik', en: 'Analyze pattern logic' } },
          { key: 'seq_type', name: { sv: 'Mönstertyp', en: 'Pattern type' }, desc: { sv: 'Aritmetisk vs Geometrisk', en: 'Arithmetic vs Geometric' } },
          { key: 'seq_diff', name: { sv: 'Hitta differensen', en: 'Find the difference' }, desc: { sv: 'Ökning per steg', en: 'Increase per step' } },
          { key: 'seq_next', name: { sv: 'Nästa tal', en: 'Next number' }, desc: { sv: 'Fortsätt talföljden', en: 'Continue the sequence' } },
          { key: 'formula_missing', name: { sv: 'Hitta formeln (Bild)', en: 'Find formula (Visual)' }, desc: { sv: 'Koppla bild till uttryck', en: 'Link image to expression' } },
          { key: 'find_formula', name: { sv: 'Skriv formeln', en: 'Write the formula' }, desc: { sv: 'Skapa y = kn + m', en: 'Create y = kn + m' } },
          { key: 'table_formula', name: { sv: 'Tabell till Formel', en: 'Table to Formula' }, desc: { sv: 'Hitta mönster i värdetabell', en: 'Find patterns in value tables' } },
          { key: 'table_fill', name: { sv: 'Fyll i tabell', en: 'Fill in table' }, desc: { sv: 'Använd formeln', en: 'Use the formula' } },
          { 
            key: 'high_term', 
            name: { sv: 'Hitta tal n', en: 'Find term n' }, 
            desc: { sv: 'Beräkna värdet långt fram', en: 'Calculate far-off values' },
            tags: ['word_problem_ready'],
            contextType: 'pattern_high_term',
            // Parses out: {s} (start value), {d} (difference value), {targetN} (target term step index)
            extractorPattern: /^(?<s>\d+)\s*;\s*(?<d>\d+)\s*;\s*(?<targetN>\d+)$/
          },
          { 
            key: 'visual_calc', 
            name: { sv: 'Beräkna antal (Bild)', en: 'Calculate count (Visual)' }, 
            desc: { sv: 'Hur många tändstickor?', en: 'How many matches?' },
            tags: ['word_problem_ready'],
            contextType: 'pattern_linear_calc',
            // Parses out: {a} (growth coefficient rate), {target} (target steps evaluation count), {b} (base value)
            extractorPattern: /^(?<a>\d+)\s*·\s*(?<target>\d+)\s*\+\s*(?<b>\d+)$/
          },
          { 
            key: 'reverse_calc', 
            name: { sv: 'Hitta n (Ekvation)', en: 'Find n (Equation)' }, 
            desc: { sv: 'Vilket figurnummer har värdet X?', en: 'Which figure number has value X?' },
            tags: ['word_problem_ready'],
            contextType: 'pattern_linear_reverse',
            // Parses out: {a} (multiplier scale coefficient), {b} (base baseline value), {total} (cumulative final amount)
            extractorPattern: /^(?<a>\d+)n\s*\+\s*(?<b>\d+)\s*=\s*(?<total>\d+)$/
          }
        ]
      },
      graphs: {
        name: { sv: 'Räta Linjens Ekvation', en: 'Linear Equations & Graphs' },
        variations: [
          // Inside skillBuckets.js -> functions/geometry -> topics -> linear_graphs -> variations
          { 
            key: 'intercept_id', 
            name: { sv: 'Bestäm m-värde', en: 'Find m-value' }, 
            desc: { sv: 'Hitta var linjen korsar y-axeln på grafen', en: 'Find where the line crosses the y-axis' },
            tags: ['word_problem_ready'],
            contextType: 'graph_intercept_m',
            extractorPattern: /^(?<m>-?\d+)\s*;\s*(?<k>[\d.-]+)/
          },
          { 
            key: 'slope_pos_int', 
            name: { sv: 'Positiv lutning (Heltal)', en: 'Positive Slope (Int)' }, 
            desc: { sv: 'Beräkna k-värdet för en stigande rät linje', en: 'Calculate the k-value for a rising straight line' },
            tags: ['word_problem_ready'],
            contextType: 'graph_slope_pos',
            extractorPattern: /^(?<dy>\d+)\s*;\s*(?<dx>\d+)\s*;\s*(?<kDisplay>[^;]+)/
          },
          { 
            key: 'slope_pos_frac', 
            name: { sv: 'Positiv lutning (Bråk)', en: 'Positive Slope (Frac)' }, 
            desc: { sv: 'Hitta lutningen som ett bråk k = dy/dx', en: 'Find the slope as a fraction k = dy/dx' },
            tags: ['word_problem_ready'],
            contextType: 'graph_slope_pos',
            extractorPattern: /^(?<dy>\d+)\s*;\s*(?<dx>\d+)\s*;\s*(?<kDisplay>[^;]+)/
          },
          { 
            key: 'slope_neg_int', 
            name: { sv: 'Negativ lutning (Heltal)', en: 'Negative Slope (Int)' }, 
            desc: { sv: 'Beräkna k-värdet för en fallande rät linje', en: 'Calculate the k-value for a falling straight line' },
            tags: ['word_problem_ready'],
            contextType: 'graph_slope_neg',
            extractorPattern: /^(?<dy>-?\d+)\s*;\s*(?<dx>\d+)\s*;\s*(?<kDisplay>[^;]+)/
          },
          { 
            key: 'slope_neg_frac', 
            name: { sv: 'Negativ lutning (Bråk)', en: 'Negative Slope (Frac)' }, 
            desc: { sv: 'Bestäm fallande lutning som ett bråk', en: 'Determine falling slope as a fraction' },
            tags: ['word_problem_ready'],
            contextType: 'graph_slope_neg',
            extractorPattern: /^(?<dy>-?\d+)\s*;\s*(?<dx>\d+)\s*;\s*(?<kDisplay>[^;]+)/
          },
          { 
            key: 'eq_standard', 
            name: { sv: 'Linjens ekvation', en: 'Line equation' }, 
            desc: { sv: 'Skriv fullständiga formeln y = kx + m utifrån grafen', en: 'Write the full formula y = kx + m from the graph' },
            tags: ['word_problem_ready'],
            contextType: 'graph_equation',
            extractorPattern: /^(?<k>-?\d+)\s*;\s*(?<m>-?\d+)\s*;\s*(?<eq>[^;]+)/
          },
          { 
            key: 'eq_no_m', 
            name: { sv: 'Ekvation utan m', en: 'Equation without m' }, 
            desc: { sv: 'Formel för linjer som går genom origo (y = kx)', en: 'Formula for lines passing through origin (y = kx)' },
            tags: ['word_problem_ready'],
            contextType: 'graph_equation',
            extractorPattern: /^(?<k>-?\d+)\s*;\s*(?<m>-?\d+)\s*;\s*(?<eq>[^;]+)/
          },
          { 
            key: 'eq_horizontal', 
            name: { sv: 'Horisontell linje', en: 'Horizontal line' }, 
            desc: { sv: 'Formel för linjer utan lutning (y = m)', en: 'Formula for lines with no slope (y = m)' },
            tags: ['word_problem_ready'],
            contextType: 'graph_equation',
            extractorPattern: /^(?<k>-?\d+)\s*;\s*(?<m>-?\d+)\s*;\s*(?<eq>[^;]+)/
          }
        ]
      }
    }
  },

  // ==========================================
  // 2. ARITMETIK
  // ==========================================
  arithmetic: {
    id: 'arithmetic',
    name: { sv: 'Aritmetik & Tal', en: 'Arithmetic & Numbers' },
    topics: {
      basic_arithmetic: {
        name: { sv: 'De 4 Räknesätten', en: 'The 4 Operations' },
        variations: [
          // LEVEL 1: ADDITION
          { key: 'add_std_vertical', level: 1, name: { sv: 'Addition: Uppställning', en: 'Addition: Column Method' }, desc: { sv: 'Stora tal', en: 'Large numbers' } },
          { key: 'add_missing_variable', level: 1, name: { sv: 'Addition: Hitta termen', en: 'Addition: Find the term' }, desc: { sv: 'a + x = b', en: 'a + x = b' } },
          { key: 'add_spot_the_lie', level: 1, name: { sv: 'Hitta felet: Addition', en: 'Find error: Addition' }, desc: { sv: 'Felsökning', en: 'Troubleshooting' } },
          { key: 'add_std_horizontal', level: 1, name: { sv: 'Addition: Vågrät', en: 'Addition: Horizontal' }, desc: { sv: 'Standardberäkning', en: 'Standard calculation' }, tags: ['word_problem_ready'], contextType: 'arithmetic_add_std', extractorPattern: /^(?<f1>\d+)\s*\+\s*(?<f2>\d+)$/ },
          
          // LEVEL 2: SUBTRACTION
          { key: 'sub_std_vertical', level: 2, name: { sv: 'Subtraktion: Uppställning', en: 'Subtraction: Column Method' }, desc: { sv: 'Växling', en: 'Borrowing' } },
          { key: 'sub_missing_variable', level: 2, name: { sv: 'Subtraktion: Hitta termen', en: 'Subtraction: Find the term' }, desc: { sv: 'a - x = b', en: 'a - x = b' } },
          { key: 'sub_std_horizontal', level: 2, name: { sv: 'Subtraktion: Vågrät', en: 'Subtraction: Horizontal' }, desc: { sv: 'Standardberäkning', en: 'Standard calculation' }, tags: ['word_problem_ready'], contextType: 'arithmetic_sub_std', extractorPattern: /^(?<f1>\d+)\s*-\s*(?<f2>\d+)$/ },
          
          // LEVEL 3: DECIMALS (+/-)
          { key: 'dec_add_vertical', level: 3, name: { sv: 'Decimaler: Addition', en: 'Decimals: Addition' }, desc: { sv: 'Passa kommatecknet', en: 'Align decimal point' } },
          { key: 'dec_sub_vertical', level: 3, name: { sv: 'Decimaler: Subtraktion', en: 'Decimals: Subtraction' }, desc: { sv: 'Passa kommatecknet', en: 'Align decimal point' } },
          
          // LEVEL 4: MULTIPLICATION (EASY)
          { key: 'mult_table_std', level: 4, name: { sv: 'Multiplikationstabell', en: 'Multiplication Table' }, desc: { sv: 'Standardträning', en: 'Standard practice' }, tags: ['word_problem_ready'], contextType: 'arithmetic_mult_std', extractorPattern: /^(?<f1>\d+)\s*(?:\\cdot|·)\s*(?<f2>\d+)$/ },
          { key: 'mult_commutative', level: 4, name: { sv: 'Kommutativa lagen', en: 'Commutative Law' }, desc: { sv: 'a * b = b * a', en: 'a * b = b * a' } },
          
          // LEVEL 5: MULTIPLICATION (MEDIUM)
          { key: 'mult_2x1_vertical', level: 5, name: { sv: 'Mult: Uppställning', en: 'Mult: Column Method' }, desc: { sv: 'Två siffror * en siffra', en: 'Two digits * one digit' } },
          { key: 'mult_distributive', level: 5, name: { sv: 'Distributiva lagen', en: 'Distributive Law' }, desc: { sv: 'Dela upp faktorer', en: 'Split factors' } },
          
          // LEVEL 6: MULTIPLICATION (HARD)
          { key: 'mult_decimal_std', level: 6, name: { sv: 'Decimalmultiplikation', en: 'Decimal Multiplication' }, desc: { sv: 'Räkna decimaler', en: 'Count decimals' } },
          { key: 'mult_decimal_placement', level: 6, name: { sv: 'Placera kommatecknet', en: 'Place decimal point' }, desc: { sv: 'Uppskattning', en: 'Estimation' } },
          
          // LEVEL 7: DIVISION
          { key: 'div_basic_std', level: 7, name: { sv: 'Division: Enkel', en: 'Division: Basic' }, desc: { sv: 'Exakta svar', en: 'Exact calculations' }, tags: ['word_problem_ready'], contextType: 'arithmetic_div_std', extractorPattern: /^(?<prod>\d+)\s*\/\s*(?<f1>\d+)$/ },
          { key: 'div_inverse_logic', level: 7, name: { sv: 'Division via multiplikation', en: 'Division via mult' }, desc: { sv: 'Samband', en: 'Connection' } },
          
          // LEVEL 8: DIVISIBILITY RULES
          { key: 'div_rule_check', level: 8, name: { sv: 'Delbarhet: Flerval', en: 'Divisibility: MCQ' }, desc: { sv: 'Vilket tal är delbart med n?', en: 'Which number is divisible?' } },
          { key: 'div_rule_missing', level: 8, name: { sv: 'Delbarhet: Saknad siffra', en: 'Divisibility: Missing Digit' }, desc: { sv: 'Hitta rätt siffra', en: 'Find the correct digit' } },
          { key: 'div_rule_tf', level: 8, name: { sv: 'Delbarhet: Sant/Falskt', en: 'Divisibility: T/F' }, desc: { sv: 'Logik för 2, 3, 5 och 10', en: 'Logic for 2, 3, 5 and 10' } },
          
          // LEVEL 9: DECIMAL DIVISION
          { key: 'div_decimal_dividend', level: 9, name: { sv: 'Division: Decimal i täljaren', en: 'Division: Decimal in dividend' }, desc: { sv: 'Dela ett decimaltal', en: 'Divide a decimal' }, tags: ['word_problem_ready'], contextType: 'arithmetic_div_std', extractorPattern: /^(?<prod>[\d,.]+)\s*\/\s*(?<f1>\d+)$/ },
          { key: 'div_decimal_divisor', level: 9, name: { sv: 'Division: Decimal i nämnaren', en: 'Division: Decimal in divisor' }, desc: { sv: 'Dela med ett decimaltal', en: 'Divide by a decimal' }, tags: ['word_problem_ready'], contextType: 'arithmetic_div_std', extractorPattern: /^(?<prod>[\d,.]+)\s*\/\s*(?<f1>[\d,.]+)$/ }
        ]
      },
      place_value: {
        name: { sv: 'Positionssystemet & Avrundning', en: 'Place Value & Rounding' },
        variations: [
          { key: 'pv_whole_value', name: { sv: 'Heltal: Siffrans värde', en: 'Whole: Digit value' }, desc: { sv: 'Vilket värde har siffran?', en: 'What value does the digit have?' } },
          { key: 'pv_whole_digit', name: { sv: 'Heltal: Vilken siffra', en: 'Whole: Which digit' }, desc: { sv: 'Vilken siffra står på platsen?', en: 'Which digit is in the place?' } },
          { key: 'pv_whole_build', name: { sv: 'Heltal: Bygg talet', en: 'Whole: Build number' }, desc: { sv: 'Skriv talet utifrån beskrivning', en: 'Write number from description' } },
          { key: 'pv_dec_value', name: { sv: 'Decimal: Siffrans värde', en: 'Dec: Digit value' }, desc: { sv: 'Inkluderar decimaler', en: 'Includes decimals' } },
          { key: 'pv_dec_digit', name: { sv: 'Decimal: Vilken siffra', en: 'Dec: Which digit' }, desc: { sv: 'Inkluderar decimaler', en: 'Includes decimals' } },
          { key: 'pv_dec_build', name: { sv: 'Decimal: Bygg talet', en: 'Dec: Build number' }, desc: { sv: 'Bygg med decimaler', en: 'Build with decimals' } },
          { key: 'pv_round_whole', name: { sv: 'Avrunda till heltal', en: 'Round to whole' }, desc: { sv: 'Avrunda tiotal, hundratal', en: 'Round tens, hundreds' } },
          { key: 'pv_round_dec', name: { sv: 'Avrunda decimaltal', en: 'Round decimals' }, desc: { sv: 'Avrunda tiondel, hundradel', en: 'Round tenths, hundredths' } }
        ]
      },
      order_of_operations: {
        name: { sv: 'Prioriteringsregler', en: 'Order of Operations' },
        variations: [
          { key: 'order_basic', name: { sv: 'Prioritering: Grund', en: 'Order: Basic' }, desc: { sv: 'Mult/Div före Add/Sub', en: 'Mult/Div before Add/Sub' } },
          { key: 'order_paren', name: { sv: 'Prioritering: Parenteser', en: 'Order: Parentheses' }, desc: { sv: 'Räkna ut parentesen först', en: 'Solve parentheses first' } },
          { key: 'order_fraction', name: { sv: 'Prioritering: Bråkstreck', en: 'Order: Fraction Bar' }, desc: { sv: 'Täljaren fungerar som en parentes', en: 'Numerator acts as a parenthesis' } },
          { key: 'order_powers', name: { sv: 'Prioritering: Potenser', en: 'Order: Powers' }, desc: { sv: 'Parenteser > Potenser > Mult/Div', en: 'Paren > Powers > Mult/Div' } }
        ]
      },
      negatives: {
        name: { sv: 'Negativa Tal', en: 'Negative Numbers' },
        variations: [
          { key: 'theory_number_line', name: { sv: 'Tallinjen', en: 'Number line' }, desc: { sv: 'Positionering', en: 'Positioning' } },
          { key: 'theory_sign_dominance', name: { sv: 'Teckenregler', en: 'Sign rules' }, desc: { sv: 'Blir svaret plus eller minus?', en: 'Positive or negative result?' } },
          { key: 'theory_spot_lie', name: { sv: 'Hitta felet: Negativa', en: 'Find error: Negatives' }, desc: { sv: 'Vanliga missuppfattningar', en: 'Common misconceptions' } },
          
          // --- UPDATED CALCULATIONS WITH PATTERN FILTERS ---
          { 
            key: 'fluency_chain_4', 
            name: { sv: 'Add/Sub Kedja (4)', en: 'Add/Sub Chain (4)' }, 
            desc: { sv: 'Flerstegsräkning', en: 'Multi-step calculation' },
            tags: ['word_problem_ready'],
            contextType: 'neg_add_sub_chain',
            extractorPattern: /^(?<valA>\(-?\d+\)|-?\d+)\s*\+\s*(?<valB>\(-?\d+\)|-?\d+)\s*-\s*(?<valC>\(-?\d+\)|-?\d+)\s*\+\s*(?<valD>\(-?\d+\)|-?\d+)$/
          },
          { 
            key: 'fluency_chain_5', 
            name: { sv: 'Add/Sub Kedja (5)', en: 'Add/Sub Chain (5)' }, 
            desc: { sv: 'Långa uttryck', en: 'Long expressions' },
            tags: ['word_problem_ready'],
            contextType: 'neg_double_minus',
            extractorPattern: /^(?<valA>-?\d+)\s*-\s*\(-(?<valB>\d+)\)$/
          },
          { 
            key: 'fluency_double_neg', 
            name: { sv: 'Dubbla minustecken', en: 'Double negative signs' }, 
            desc: { sv: '-(-a) = +a', en: '-(-a) = +a' },
            tags: ['word_problem_ready'],
            contextType: 'neg_double_minus',
            extractorPattern: /^(?<valA>-?\d+)\s*-\s*\(-(?<valB>\d+)\)$/
          },
          { 
            key: 'fluency_plus_neg', 
            name: { sv: 'Plus minus', en: 'Plus minus' }, 
            desc: { sv: '+(-a) = -a', en: '+(-a) = -a' },
            tags: ['word_problem_ready'],
            contextType: 'neg_double_minus',
            extractorPattern: /^(?<valA>-?\d+)\s*-\s*\(-(?<valB>\d+)\)$/
          },
          { key: 'fluency_transform_match', name: { sv: 'Matcha uttryck', en: 'Match expressions' }, desc: { sv: 'Olika skrivsätt', en: 'Different notations' } },
          { 
            key: 'mult_chain', 
            name: { sv: 'Mult: Kedja', en: 'Mult: Chain' }, 
            desc: { sv: 'Jämnt/Udda antal minus', en: 'Even/Odd number of minuses' },
            tags: ['word_problem_ready'],
            contextType: 'neg_mult_chain',
            extractorPattern: /^(?<valA>\(-?\d+\)|-?\d+)\s*·\s*(?<valB>\(-?\d+\)|-?\d+)\s*·\s*(?<valC>\(-?\d+\)|-?\d+)$/
          },
          { 
            key: 'mult_inverse_missing', 
            name: { sv: 'Mult: Saknad faktor', en: 'Mult: Missing factor' }, 
            desc: { sv: 'a * ? = b', en: 'a * ? = b' },
            tags: ['word_problem_ready'],
            contextType: 'neg_multiplication',
            extractorPattern: /^(?<valA>\(-?\d+\)|-?\d+)\s*·\s*(?<valB>\(-?\d+\)|-?\d+)$/
          },
          { 
            key: 'div_same_sign', 
            name: { sv: 'Division: Samma tecken', en: 'Division: Same signs' }, 
            desc: { sv: 'Svaret blir positivt', en: 'Answer is positive' },
            tags: ['word_problem_ready'],
            contextType: 'neg_division',
            extractorPattern: /\\frac\{(?<valA>-?\d+)\}\{(?<valB>-?\d+)\}/
          },
          { 
            key: 'mult_same_sign', 
            name: { sv: 'Multiplikation: Lika tecken', en: 'Multiplication: Same Sign' }, 
            desc: { sv: 'Multiplikation med lika tecken', en: 'Multiply with same signs' },
            tags: ['word_problem_ready'],
            contextType: 'neg_multiplication', 
            extractorPattern: /^(?<valA>-?\d+)\s*(?<op>\*)\s*(?<valB>-?\d+)$/
          },
          { 
            key: 'mult_diff_sign', 
            name: { sv: 'Multiplikation: Olika tecken', en: 'Multiplication: Diff Sign' },
            desc: { sv: 'Multiplicera med olika tecken', en: 'Multiply with different signs' },
            tags: ['word_problem_ready'],
            contextType: 'neg_multiplication',
            extractorPattern: /^(?<valA>-?\d+)\s*(?<op>\*)\s*(?<valB>-?\d+)$/
          },
          { 
            key: 'div_diff_sign', 
            name: { sv: 'Division: Olika tecken', en: 'Division: Different signs' }, 
            desc: { sv: 'Svaret blir negativt', en: 'Answer is negative' },
            tags: ['word_problem_ready'],
            contextType: 'neg_division',
            extractorPattern: /\\frac\{(?<valA>-?\d+)\}\{(?<valB>-?\d+)\}/
          },
          { 
            key: 'neg_order_frac_basic', 
            name: { sv: 'Prioritering: Bråk & Mult', en: 'Order: Fractions & Mult' }, 
            desc: { sv: 'Räkna ut täljaren först (inkluderar multiplikation)', en: 'Calculate numerator first (includes multiplication)' },
            tags: ['word_problem_ready'],
            contextType: 'neg_order_ops',
            extractorPattern: /\\frac\{(?<a>-?\d+)\s*\+\s*(?<b>-?\d+)\s*\\cdot\s*(?<c>-?\d+)\}\{(?<d>-?\d+)\}/
          },
          { 
            key: 'neg_order_frac_paren', 
            name: { sv: 'Prioritering: Bråk & Parentes', en: 'Order: Fractions & Parentheses' }, 
            desc: { sv: 'Räkna ut parentesen i täljaren först', en: 'Calculate parentheses in numerator first' },
            tags: ['word_problem_ready'],
            contextType: 'neg_order_ops',
            extractorPattern: /\\frac\{(?<a>-?\d+)\s*\\cdot\s*\((?<b>-?\d+)\s*\+\s*(?<c>-?\d+)\)\}\{(?<d>-?\d+)\}/
          },
          { key: 'div_check_logic', name: { sv: 'Division: Kontroll', en: 'Division: Checking' }, desc: { sv: 'Använd multiplikation', en: 'Use multiplication' } }
        ]
      },
      fractions_basics: {
        name: { sv: 'Bråk: Grunder', en: 'Fractions: Basics' },
        variations: [
          // LEVEL 1: Visualiseringar (Visuals)
          { key: 'visual_lie', level: 1, name: { sv: 'Hitta felet: Bilder', en: 'Find error: Visuals' }, desc: { sv: 'Visuell tolkning', en: 'Visual interpretation' } },
          { key: 'visual_inverse', level: 1, name: { sv: 'Bild: Hitta helheten', en: 'Visual: Find whole' }, desc: { sv: 'Givet del, sök helhet', en: 'Given part, seek whole' } },
          { key: 'visual_calc', level: 1, name: { sv: 'Bild: Beräkna andel', en: 'Visual: Calculate share' }, desc: { sv: 'Färgad del av total', en: 'Colored part of total' } },
          
          // LEVEL 2: Del av antal (Parts of Quantity)
          { key: 'part_inverse', level: 2, name: { sv: 'Hitta helheten', en: 'Find the whole' }, desc: { sv: '1/n är x, vad är allt?', en: '1/n is x, what is total?' } },
          { key: 'part_compare', level: 2, name: { sv: 'Jämför andelar', en: 'Compare shares' }, desc: { sv: 'Vilken del är störst?', en: 'Which part is largest?' } },
          { key: 'part_calc', level: 2, name: { sv: 'Beräkna del av antal', en: 'Calculate part of count' }, desc: { sv: '1/n av x', en: '1/n of x' } },
          
          // LEVEL 3: Blandad form & Bråkform (Mixed & Improper)
          { key: 'mixed_bounds', level: 3, name: { sv: 'Storleksbedömning', en: 'Size assessment' }, desc: { sv: 'Större/Mindre än heltal', en: 'Greater/Smaller than integer' } },
          { key: 'mixed_missing', level: 3, name: { sv: 'Blandad form: Pussel', en: 'Mixed form: Puzzle' }, desc: { sv: 'Hitta saknad täljare/nämnare', en: 'Find missing numerator/denominator' } },
          { key: 'mixed_convert_imp', level: 3, name: { sv: 'Till bråkform', en: 'To improper fraction' }, desc: { sv: 'Blandad -> Bråk', en: 'Mixed -> Improper' } },
          { key: 'mixed_convert_mix', level: 3, name: { sv: 'Till blandad form', en: 'To mixed form' }, desc: { sv: 'Bråk -> Blandad', en: 'Improper -> Mixed' } },
          
          // LEVEL 4: Förlängning & Förkortning (Simplify & Extend)
          { key: 'simplify_missing', level: 4, name: { sv: 'Likvärdiga bråk', en: 'Equivalent fractions' }, desc: { sv: 'Förlängning/Förkortning', en: 'Extension/Simplification' } },
          { key: 'simplify_concept', level: 4, name: { sv: 'Koncept: Förkortning', en: 'Concept: Simplification' }, desc: { sv: 'Ändras värdet?', en: 'Does the value change?' } },
          { key: 'simplify_calc', level: 4, name: { sv: 'Förkorta bråk', en: 'Simplify fraction' }, desc: { sv: 'Enklaste form', en: 'Simplest form' } },
          
          // LEVEL 5: Bråk, Decimaler & Procent (Decimals & Conversions)
          { key: 'decimal_inequality', level: 5, name: { sv: 'Jämför bråk/decimal', en: 'Compare fraction/decimal' }, desc: { sv: 'Större, mindre, lika', en: 'Greater, smaller, equal' } },
          { key: 'decimal_to_dec', level: 5, name: { sv: 'Bråk till decimal', en: 'Fraction to decimal' }, desc: { sv: 'Ex: 1/4 = 0,25', en: 'Ex: 1/4 = 0.25' } },
          { key: 'decimal_to_frac', level: 5, name: { sv: 'Decimal till bråk', en: 'Decimal to fraction' }, desc: { sv: 'Ex: 0,5 = 1/2', en: 'Ex: 0.5 = 1/2' } },
          { key: 'equivalence_basic_frac', level: 5, name: { sv: 'Basfakta: Bråk till %', en: 'Basic Facts: Fraction to %' }, desc: { sv: 'Ex: 1/4 = 25%', en: 'Ex: 1/4 = 25%' } },
          { key: 'equivalence_basic_dec', level: 5, name: { sv: 'Basfakta: Decimal till %', en: 'Basic Facts: Decimal to %' }, desc: { sv: 'Ex: 0,2 = 20%', en: 'Ex: 0.2 = 20%' } }
        ]
      },
      fraction_arith: {
        name: { sv: 'Bråk: Räknesätt', en: 'Fraction Operations' },
        variations: [
          // LEVEL 1: Lika nämnare (Same Denominator)
          { key: 'add_concept', level: 1, name: { sv: 'Addition: Regler', en: 'Addition: Rules' }, desc: { sv: 'Addera täljare, ej nämnare', en: 'Add numerators, not denominators' } },
          { key: 'add_missing', level: 1, name: { sv: 'Addition: Pussel', en: 'Addition: Puzzle' }, desc: { sv: 'Hitta saknad term', en: 'Find missing term' } },
          {
            key: "add_calc",
            level: 1,
            name: { sv: "Bråkaddition: Lika nämnare", en: "Fraction Addition: Same Denominator" },
            desc: { sv: "Addera bråk med gemensam nämnare och svara i enklaste form", en: "Add fractions with a common denominator and simplify the answer" },
            tags: ["word_problem_ready"],
            contextType: "frac_same_denom_add",
            extractorPattern: /\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d>\d+)\s*}\s*\+\s*\\frac{\s*(?<n2>\d+)\s*}{\s*(?:\k<d>)\s*}/
          },
          {
            key: "sub_calc",
            level: 1,
            name: { sv: "Bråksubtraktion: Lika nämnare", en: "Fraction Subtraction: Same Denominator" },
            desc: { sv: "Subtrahera bråk med gemensam nämnare och svara i enklaste form", en: "Subtract fractions with a common denominator and simplify the answer" },
            tags: ["word_problem_ready"],
            contextType: "frac_same_denom_sub",
            extractorPattern: /\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d>\d+)\s*}\s*-\s*\\frac{\s*(?<n2>\d+)\s*}{\s*(?:\k<d>)\s*}/
          },

          // LEVEL 2: Olika nämnare (Different Denominators)
          { key: 'lcd_find', level: 2, name: { sv: 'Hitta MGN', en: 'Find LCD' }, desc: { sv: 'Minsta gemensamma nämnare', en: 'Lowest common denominator' } },
          { key: 'add_error_spot', level: 2, name: { sv: 'Hitta felet: Olika nämnare', en: 'Find error: Diff denom' }, desc: { sv: 'Vanliga misstag', en: 'Common mistakes' } },
          {
            key: "add_diff_denom",
            level: 2,
            name: { sv: "Bråkaddition: Olika nämnare", en: "Fraction Addition: Different Denominators" },
            desc: { sv: "Hitta MGN för att addera bråk med olika nämnare", en: "Find the LCD to add fractions with different denominators" },
            tags: ["word_problem_ready"],
            contextType: "frac_diff_denom_add",
            extractorPattern: /\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d1>\d+)\s*}\s*\+\s*\\frac{\s*(?<n2>\d+)\s*}{\s*(?<d2>\d+)\s*}/
          },
          {
            key: "sub_diff_denom",
            level: 2,
            name: { sv: "Bråksubtraktion: Olika nämnare", en: "Fraction Subtraction: Different Denominators" },
            desc: { sv: "Hitta MGN för att subtrahera bråk med olika nämnare", en: "Find the LCD to subtract fractions with different denominators" },
            tags: ["word_problem_ready"],
            contextType: "frac_diff_denom_sub",
            extractorPattern: /\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d1>\d+)\s*}\s*-\s*\\frac{\s*(?<n2>\d+)\s*}{\s*(?<d2>\d+)\s*}/
          },

          // LEVEL 3: Blandad form (Mixed Numbers)
          { key: 'mixed_est', level: 3, name: { sv: 'Uppskatta summa', en: 'Estimate Sum' }, desc: { sv: 'Uppskatta värdet av blandade bråk', en: 'Estimate the value of mixed fractions' } },
          { key: 'mixed_add_same', level: 3, name: { sv: 'Addition: Blandad (Lika nämnare)', en: 'Addition: Mixed (Same denom)' }, desc: { sv: 'Addera blandade bråk med samma nämnare', en: 'Add mixed fractions with same denominator' } },
          { key: 'mixed_sub_same', level: 3, name: { sv: 'Subtraktion: Blandad (Lika nämnare)', en: 'Subtraction: Mixed (Same denom)' }, desc: { sv: 'Subtrahera blandade bråk med samma nämnare', en: 'Subtract mixed fractions with same denominator' } },
          {
            key: "mixed_add_diff",
            level: 3,
            name: { sv: "Addition: Blandad (Olika)", en: "Addition: Mixed Form (Diff denom)" },
            desc: { sv: "Addera bråk i blandad form", en: "Add fractions in mixed form" },
            tags: ["word_problem_ready"],
            contextType: "frac_mixed_add",
            extractorPattern: /(?<w1>\d+)\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d1>\d+)\s*}\s*\+\s*(?<w2>\d+)\\frac{\s*(?<n2>\d+)\s*}{\s*(?<d2>\d+)\s*}/
          },
          {
            key: "mixed_sub_diff",
            level: 3,
            name: { sv: "Subtraktion: Blandad (Olika)", en: "Subtraction: Mixed Form (Diff denom)" },
            desc: { sv: "Subtrahera bråk i blandad form", en: "Subtract fractions in mixed form" },
            tags: ["word_problem_ready"],
            contextType: "frac_mixed_sub",
            extractorPattern: /(?<w1>\d+)\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d1>\d+)\s*}\s*-\s*(?<w2>\d+)\\frac{\s*(?<n2>\d+)\s*}{\s*(?<d2>\d+)\s*}/
          },

          // LEVEL 4: Multiplikation (Multiplication)
          { key: 'mult_scaling', level: 4, name: { sv: 'Multiplikation: Skalning', en: 'Mult: Scaling' }, desc: { sv: 'Större eller mindre?', en: 'Larger or smaller?' } },
          { key: 'mult_area', level: 4, name: { sv: 'Areaberäkning (Bråk)', en: 'Area Calculation (Fractions)' }, desc: { sv: 'Beräkna area med bråk', en: 'Calculate area using fractions' } },
          {
            key: "mult_calc",
            level: 4,
            name: { sv: "Bråkmultiplikation", en: "Fraction Multiplication" },
            desc: { sv: "Multiplicera täljare för sig och nämnare för sig", en: "Multiply numerators and denominators separately" },
            tags: ["word_problem_ready"],
            contextType: "frac_multiplication",
            extractorPattern: /\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d1>\d+)\s*}\s*\\cdot\s*\\frac{\s*(?<n2>\d+)\s*}{\s*(?<d2>\d+)\s*}/
          },

          // LEVEL 5: Division (Division)
          { key: 'div_operator', level: 5, name: { sv: 'Division: Koncept', en: 'Division: Concept' }, desc: { sv: 'Förstå bråkdivision', en: 'Understand fraction division' } },
          { key: 'div_reciprocal', level: 5, name: { sv: 'Inverterade tal', en: 'Reciprocal numbers' }, desc: { sv: 'Vänd på bråket', en: 'Flip the fraction' } },
          {
            key: "div_calc",
            level: 5,
            name: { sv: "Bråkdivision", en: "Fraction Division" },
            desc: { sv: "Dividera bråk genom att multiplicera med inverterat", en: "Divide fractions by multiplying by the reciprocal" },
            tags: ["word_problem_ready"],
            contextType: "frac_division",
            extractorPattern: /\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d1>\d+)\s*}\s*\\div\s*\\frac{\s*(?<n2>\d+)\s*}{\s*(?<d2>\d+)\s*}/
          }
        ]
      },
      percent: {
        name: { sv: 'Procent', en: 'Percent' },
        variations: [
          { key: 'visual_translation', name: { sv: 'Bild till Procent', en: 'Visual to Percent' }, desc: { sv: 'Tolka figurer', en: 'Interpret figures' } },
          { key: 'visual_lie', name: { sv: 'Hitta felet: Bild', en: 'Find error: Visual' }, desc: { sv: 'Visuell analys', en: 'Visual analysis' } },
          { key: 'equivalence', name: { sv: 'Decimal-Procent', en: 'Decimal-Percent' }, desc: { sv: 'Samband', en: 'Relationships' } },
          {
            key: 'benchmark_calc',
            name: { sv: 'Huvudräkning (Bas)', en: 'Mental Math (Basic)' },
            desc: { sv: '10%, 25%, 50%', en: '10%, 25%, 50%' },
            tags: ['word_problem_ready'],
            contextType: 'percent_of_amount',
            extractorPattern: /^(?<pct>\d+)\\%\\s*\\cdot\\s*(?<base>\d+)/
          },
          { 
            key: 'calc_any_percent', 
            name: { sv: 'Beräkna delen', en: 'Calculate part of a whole' }, 
            desc: { sv: 'Beräkna delen med procent och det hela', en: 'Calculate a part using percent and the total' }, 
            tags: ['word_problem_ready'], 
            contextType: 'percent_of_amount', 
            extractorPattern: /^(?<pct>\d+)\s*%\s*av\s*(?<base>\d+)$/i 
          },
          {
            key: 'composition',
            name: { sv: 'Beräkna 30, 40...90%', en: 'Calculate 30, 40...90%' },
            desc: { sv: 'Procent: Tiotal', en: 'Percent: Even 10s' },
            tags: ['word_problem_ready'],
            contextType: 'percent_of_amount',
            extractorPattern: /^(?<pct>\d+)\\%\\s*\\cdot\\s*(?<base>\d+)/
          },
          { key: 'decomposition', name: { sv: 'Beräkna (5%)', en: 'Beräkna (5%)' }, desc: { sv: 'Använd 10% för att hitta 5%', en: 'Use 10% to find 5%' } },
          {
            key: 'benchmark_inverse',
            name: { sv: 'Om x är.. Vad blir 100%', en: 'If x is ... What is 100%' },
            desc: { sv: 'Om 10% är 5, vad är allt?', en: 'If 10% is 5, what is total?' },
            tags: ['word_problem_ready'],
            contextType: 'percent_base_part',
            extractorPattern: /^(?<pct>\d+)\\%\\s*=\\s*(?<part>\d+)/
          },
          {
            key: 'reverse_find_whole',
            name: { sv: 'Det hela', en: 'Det hela' },
            desc: { sv: 'Beräkna hela summan', en: 'Calculate total sum' },
            tags: ['word_problem_ready'],
            contextType: 'percent_base_part',
            extractorPattern: /^(?<pct>\d+)\\%\\s*=\\s*(?<part>\d+)/
          },
          {
            key: 'find_percent_test',
            name: { sv: 'Andelen (Prov)', en: 'Find Percent (Test)' },
            desc: { sv: 'Delen / Hela', en: 'Part / Whole' },
            tags: ['word_problem_ready'],
            contextType: 'percent_find_rate',
            extractorPattern: /\\frac\{(?<part>\d+)\}\{(?<whole>\d+)\}/
          },
          {
            key: 'find_percent_discount',
            name: { sv: 'Andelen (Rabatt)', en: 'Percent: Discount' },
            desc: { sv: 'Beräkna andelen', en: 'Calculate share' },
            tags: ['word_problem_ready'],
            contextType: 'percent_find_rate',
            extractorPattern: /\\frac\{(?<part>\d+)\}\{(?<whole>\d+)\}/
          },
          { 
            key: 'change_calc', 
            name: { sv: 'Beräkna förändring', en: 'Calculate change' }, 
            desc: { sv: 'Skillnad / Ursprung', en: 'Difference / Original' },
            tags: ['word_problem_ready'],
            contextType: 'value_delta',
            extractorPattern: /\\frac\{(?<diff>\d+)\}\{(?<oldV>\d+)\}/
          },
          { key: 'change_multiplier', name: { sv: 'Förändringsfaktor', en: 'Change Factor' }, desc: { sv: '1,0 +/- %', en: '1.0 +/- %' } }
        ]
      },
      change_factor: {
        name: { sv: 'Förändringsfaktor', en: 'Change Factor' },
        variations: [
          // LEVEL 1: Koncept & Omvandling
          { key: 'pct_to_factor_inc', level: 1, name: { sv: 'Ökning till Faktor', en: 'Increase to Factor' }, desc: { sv: '+20% -> 1,20', en: '+20% -> 1.20' } },
          { key: 'pct_to_factor_dec', level: 1, name: { sv: 'Minskning till Faktor', en: 'Decrease to Factor' }, desc: { sv: '-20% -> 0,80', en: '-20% -> 0.80' } },
          { key: 'factor_to_pct_inc', level: 1, name: { sv: 'Factor till Ökning', en: 'Factor to Increase' }, desc: { sv: '1,20 -> +20%', en: '1.20 -> +20%' } },
          { key: 'factor_to_pct_dec', level: 1, name: { sv: 'Factor till Minskning', en: 'Factor to Decrease' }, desc: { sv: '0,80 -> -20%', en: '0.80 -> -20%' } },
          
          // LEVEL 2: Beräkna nytt värde
          { 
            key: 'apply_factor_inc', 
            level: 2,
            name: { sv: 'Beräkna nytt (Ökning)', en: 'Calc new (Increase)' }, 
            desc: { sv: 'Startvärde · Ökningsfaktor', en: 'Initial value · Growth factor' },
            tags: ['word_problem_ready'],
            contextType: 'apply_factor_inc', 
            extractorPattern: /^(?<base>\d+)\s*(?:\\cdot|·)\s*(?<factor>1[.,]\d+)$/
          },
          { 
            key: 'apply_factor_dec', 
            level: 2,
            name: { sv: 'Beräkna nytt (Minskning)', en: 'Calc new (Decrease)' }, 
            desc: { sv: 'Startvärde · Minskningsfaktor', en: 'Initial value · Decay factor' },
            tags: ['word_problem_ready'],
            contextType: 'apply_factor_dec',
            extractorPattern: /^(?<base>\d+)\s*(?:\\cdot|·)\s*(?<factor>0[.,]\d+)$/
          },
          
          // LEVEL 3: Hitta ursprungsvärdet
          { 
            key: 'find_original_inc', 
            level: 3,
            name: { sv: 'Hitta gamla (Ökning)', en: 'Find old (Increase)' }, 
            desc: { sv: 'Nytt värde / Ökningsfaktor', en: 'New value / Growth factor' },
            tags: ['word_problem_ready'],
            contextType: 'find_original_inc',
            extractorPattern: /^\\frac\{(?<newPrice>\d+)\}\{(?<factor>1[.,]\d+)\}$/
          },
          { 
            key: 'find_original_dec', 
            level: 3,
            name: { sv: 'Hitta gamla (Minskning)', en: 'Find old (Decrease)' }, 
            desc: { sv: 'Nytt värde / Minskningsfaktor', en: 'New value / Decay factor' },
            tags: ['word_problem_ready'],
            contextType: 'find_original_dec',
            extractorPattern: /^\\frac\{(?<newPrice>\d+)\}\{(?<factor>0[.,]\d+)\}$/
          },
          
          // LEVEL 4: Upprepade förändringar
          { 
            key: 'sequential_factors', 
            level: 4,
            name: { sv: 'Total faktor', en: 'Total factor' }, 
            desc: { sv: 'Faktor 1 · Faktor 2', en: 'Factor 1 · Factor 2' },
            tags: ['word_problem_ready'],
            contextType: 'factor_compound',
            extractorPattern: /^(?<f1>[01][.,]\d+)\s*(?:\\cdot|·)\s*(?<f2>[01][.,]\d+)$/
          },
        ]
      },
      exponents: {
        name: { sv: 'Potenser', en: 'Exponents' },
        variations: [
          // LEVEL 1: Grunder (Foundations)
          { key: 'zero_rule', level: 1, name: { sv: 'Noll-regeln', en: 'Zero rule' }, desc: { sv: 'x^0 = 1', en: 'x^0 = 1' } },
          { key: 'power_of_one', level: 1, name: { sv: 'Upphöjt till 1', en: 'Power of one' }, desc: { sv: 'x^1 = x', en: 'x^1 = x' } },
          { 
            key: 'foundations_calc', 
            level: 1,
            name: { sv: 'Beräkna potenser', en: 'Calc powers' }, 
            desc: { sv: 'Beräkna värdet av en potens med heltalsbas', en: 'Calculate the value of a whole number power' },
            tags: ['word_problem_ready'],
            contextType: 'exp_foundations_calc',
            extractorPattern: /^(?<base>\d+)\s*;\s*(?<exp>\d+)\s*;\s*(?<ans>\d+)/
          },
          { key: 'foundations_spot_the_lie', level: 1, name: { sv: 'Hitta felet: Bas/Exp', en: 'Find error: Base/Exp' }, desc: { sv: 'Vanliga misstag', en: 'Common mistakes' } },
          
          // LEVEL 2: Tiopotenser (Powers of Ten)
          { 
            key: 'ten_positive_exponent', 
            level: 2,
            name: { sv: 'Tiopotenser (Pos)', en: 'Powers of ten (Pos)' }, 
            desc: { sv: 'Skriv en positiv tiopotens som ett heltal', en: 'Write a positive power of ten as an integer' },
            tags: ['word_problem_ready'],
            contextType: 'exp_ten_positive',
            extractorPattern: /^(?<exp>\d+)\s*;\s*(?<ans>\d+)/
          },
          { 
            key: 'ten_negative_exponent', 
            level: 2,
            name: { sv: 'Tiopotenser (Neg)', en: 'Powers of ten (Neg)' }, 
            desc: { sv: 'Omvandla en negativ tiopotens till ett decimaltal', en: 'Convert a negative power of ten to a decimal' },
            tags: ['word_problem_ready'],
            contextType: 'exp_ten_negative',
            extractorPattern: /^(?<exp>\d+)\s*;\s*(?<ans>[\d.]+)/
          },
          { 
            key: 'ten_inverse_counting', 
            level: 2,
            name: { sv: 'Räkna nollor', en: 'Count zeros' }, 
            desc: { sv: 'Skriv ett tal som en tiopotens genom att räkna nollor', en: 'Write a number as a power of ten by counting zeros' },
            tags: ['word_problem_ready'],
            contextType: 'exp_ten_inverse',
            extractorPattern: /^(?<num>\d+)\s*;\s*(?<zeros>\d+)/
          },
          
          // LEVEL 3: Grundpotensform (Scientific Notation)
          { 
            key: 'scientific_to_form', 
            level: 3,
            name: { sv: 'Till Grundpotensform', en: 'To Scientific Notation' }, 
            desc: { sv: 'Skriv om stora tal i grundpotensform', en: 'Rewrite large numbers in scientific notation' },
            tags: ['word_problem_ready'],
            contextType: 'exp_scientific_to_form',
            extractorPattern: /^(?<number>[\d.]+)\s*;\s*(?<mantissa>[\d.]+)\s*;\s*(?<exponent>\d+)/
          },
          { 
            key: 'scientific_missing_mantissa', 
            level: 3,
            name: { sv: 'Hitta mantissan', en: 'Find mantissa' }, 
            desc: { sv: 'Bestäm saknat värde a i a * 10^n', en: 'Determine missing value a in a * 10^n' },
            tags: ['word_problem_ready'],
            contextType: 'exp_scientific_missing',
            extractorPattern: /^(?<number>[\d.]+)\s*;\s*(?<exponent>\d+)\s*;\s*(?<mantissa>[\d.]+)/
          },
          { key: 'scientific_missing_exponent', level: 3, name: { sv: 'Hitta exponenten', en: 'Find exponent' }, desc: { sv: 'Bestäm n i a * 10^n', en: 'Determine n in a * 10^n' } },
          
          // LEVEL 4: Kvadratrötter (Square Roots)
          { 
            key: 'root_calc', 
            level: 4,
            name: { sv: 'Kvadratrötter', en: 'Square roots' }, 
            desc: { sv: 'Beräkna det positiva talet som multiplicerat med sig självt blir x', en: 'Calculate the positive square root of a number' },
            tags: ['word_problem_ready'],
            contextType: 'exp_root_calc',
            extractorPattern: /^(?<square>\d+)\s*;\s*(?<base>\d+)/
          },
          { 
            key: 'root_inverse_algebra', 
            level: 4,
            name: { sv: 'Ekvation x^2', en: 'Equation x^2' }, 
            desc: { sv: 'Lös andragradsekvationer på formen x^2 = a', en: 'Solve basic quadratic equations of form x^2 = a' },
            tags: ['word_problem_ready'],
            contextType: 'exp_root_inverse',
            extractorPattern: /^(?<square>\d+)\s*;\s*(?<base>\d+)/
          },
          
          // LEVEL 5: Potenslagar Grund (Basic Laws)
          { key: 'law_multiplication', level: 5, name: { sv: 'Lag: Multiplikation', en: 'Law: Multiplication' }, desc: { sv: 'Addera exponenter', en: 'Add exponents' } },
          { key: 'law_division', level: 5, name: { sv: 'Lag: Division', en: 'Law: Division' }, desc: { sv: 'Subtrahera exponenter', en: 'Subtract exponents' } },
          { key: 'law_addition_trap', level: 5, name: { sv: 'Hitta felet: Addition', en: 'Find error: Addition' }, desc: { sv: 'Potenslagar gäller ej addition', en: 'Power laws do not apply to addition' } },
          { key: 'law_mult_div_combined', level: 5, name: { sv: 'Lag: Mult & Div', en: 'Law: Mult & Div' }, desc: { sv: 'Blandade regler', en: 'Mixed rules' } },
          
          // LEVEL 6: Potenslagar Avancerad (Advanced Laws)
          { key: 'law_power_of_power', level: 6, name: { sv: 'Lag: Potens av potens', en: 'Law: Power of power' }, desc: { sv: 'Multiplicera exponenter', en: 'Multiply exponents' } },
          { key: 'law_inverse_algebra', level: 6, name: { sv: 'Ekvation: Exponent', en: 'Equation: Exponent' }, desc: { sv: 'Hitta den saknade exponenten', en: 'Find the missing exponent' } },
          { key: 'law_all_combined', level: 6, name: { sv: 'Blandade Lagar', en: 'Mixed Laws' }, desc: { sv: 'Avancerad förenkling', en: 'Advanced simplification' } },
          
          // LEVEL 7: Beräkningar Grundpotens (Scientific Calc)
          { key: 'scientific_mult', level: 7, name: { sv: 'Multiplikation (Grundpotens)', en: 'Multiplication (Scientific)' }, desc: { sv: 'Multiplicera två tal i grundpotensform', en: 'Multiply two numbers in scientific notation' } },
          { key: 'scientific_div', level: 7, name: { sv: 'Division (Grundpotens)', en: 'Division (Scientific)' }, desc: { sv: 'Dividera två tal i grundpotensform', en: 'Divide two numbers in scientific notation' } }
        ]
      },
      ten_powers: {
        name: { sv: 'Tiopotenser & Prefix', en: 'Powers of Ten & Prefixes' },
        variations: [
          // LEVEL 1: Stora tal & Potensform (Large Numbers & Powers)
          {
            key: "big_mult_std",
            level: 1,
            name: { sv: "Multiplikation: Stora tal", en: "Multiplication: Large numbers" },
            desc: { sv: "Multiplicera decimaltal med 10, 100, 1000", en: "Multiply decimals by 10, 100, 1000" },
            tags: ["word_problem_ready"],
            contextType: "ten_powers_mult_large",
            extractorPattern: /(?<num>[\d,.]+)\s*·\s*(?<power>10|100|1000|10000)/
          },
          {
            key: "big_div_std",
            level: 1,
            name: { sv: "Division: Stora tal", en: "Division: Large numbers" },
            desc: { sv: "Dividera decimaltal med 10, 100, 1000", en: "Divide decimals by 10, 100, 1000" },
            tags: ["word_problem_ready"],
            contextType: "ten_powers_div_large",
            extractorPattern: /\\frac{\s*(?<num>[\d,.]+)\s*}{\s*(?<power>10|100|1000|10000)\s*}/
          },
          { key: 'big_missing_factor', level: 1, name: { sv: 'Hitta 10-faktorn', en: 'Find 10-factor' }, desc: { sv: 'Vad multiplicerades?', en: 'What was multiplied?' } },
          { key: 'power_discovery', level: 1, name: { sv: 'Potensform', en: 'Power form' }, desc: { sv: 'Skriv som 10^n', en: 'Write as 10^n' } },

          // LEVEL 2: Konceptuella inversa tal (Conceptual Reciprocals)
          { key: 'reciprocal_equivalence', level: 2, name: { sv: 'Inverser (0,1/0,01)', en: 'Reciprocals (0.1/0.01)' }, desc: { sv: '0,1 = 1/10', en: '0.1 = 1/10' } },
          { key: 'concept_spot_lie', level: 2, name: { sv: 'Hitta felet: 10-bas', en: 'Find error: base 10' }, desc: { sv: 'Konceptuell förståelse', en: 'Conceptual understanding' } },

          // LEVEL 3: Decimala tiopotenser (Decimal Powers)
          {
            key: "decimal_mult_std",
            level: 3,
            name: { sv: "Multiplikation: Små tal", en: "Multiplication: Small numbers" },
            desc: { sv: "Multiplicera med decimala tiopotenser (0,1, 0,01)", en: "Multiply by decimal powers of ten (0.1, 0.01)" },
            tags: ["word_problem_ready"],
            contextType: "ten_powers_mult_small",
            extractorPattern: /(?<num>[\d,.]+)\s*·\s*(?<factor>0[.,]0*1)/
          },
          {
            key: "decimal_div_std",
            level: 3,
            name: { sv: "Division: Små tal", en: "Division: Small numbers" },
            desc: { sv: "Dividera med decimala tiopotenser (0,1, 0,01)", en: "Divide by decimal powers of ten (0.1, 0.01)" },
            tags: ["word_problem_ready"],
            contextType: "ten_powers_div_small",
            extractorPattern: /\\frac{\s*(?<num>[\d,.]+)\s*}{\s*(?<factor>0[.,]0*1)\s*}/
          },
          { key: 'decimal_logic_trap', level: 3, name: { sv: 'Logisk fälla (Decimaler)', en: 'Logical trap (Decimals)' }, desc: { sv: 'Analysera decimalmultiplikationens effekt', en: 'Analyze decimal multiplication effects' } }
        ]
      },
    }
  },

  // ==========================================
  // 3. GEOMETRI
  // ==========================================
  geometry_cat: {
    id: 'geometry_cat',
    name: { sv: 'Geometri', en: 'Geometry' },
    topics: {
      unit_conversion: {
        name: { sv: 'Enhetsomvandling', en: 'Unit Conversion' },
        variations: [
          // LEVEL 1: Längd (Length)
          { key: 'len_km_m', name: { sv: 'Längd: km ↔ m', en: 'Length: km ↔ m' }, desc: { sv: 'Omvandla mellan kilometer och meter', en: 'Convert between km and m' } },
          { key: 'len_m_dm', name: { sv: 'Längd: m ↔ dm', en: 'Length: m ↔ dm' }, desc: { sv: 'Omvandla mellan meter och decimeter', en: 'Convert between m and dm' } },
          { key: 'len_dm_cm', name: { sv: 'Längd: dm ↔ cm', en: 'Length: dm ↔ cm' }, desc: { sv: 'Omvandla mellan decimeter och centimeter', en: 'Convert between dm and cm' } },
          { key: 'len_cm_mm', name: { sv: 'Längd: cm ↔ mm', en: 'Length: cm ↔ mm' }, desc: { sv: 'Omvandla mellan centimeter och millimeter', en: 'Convert between cm and mm' } },
          { key: 'len_dm_mm', name: { sv: 'Längd: dm ↔ mm', en: 'Length: dm ↔ mm' }, desc: { sv: 'Hoppa över cm: dm till mm', en: 'Skip cm: dm to mm' } },
          { key: 'len_m_cm', name: { sv: 'Längd: m ↔ cm', en: 'Length: m ↔ cm' }, desc: { sv: 'Hoppa över dm: m till cm', en: 'Skip dm: m to cm' } },
          { key: 'len_m_mm', name: { sv: 'Längd: m ↔ mm', en: 'Length: m ↔ mm' }, desc: { sv: 'Stora hopp: m till mm', en: 'Big jumps: m to mm' } },

          // LEVEL 2: Vikt (Weight)
          { key: 'weight_t_kg', name: { sv: 'Vikt: ton ↔ kg', en: 'Weight: tonne ↔ kg' }, desc: { sv: 'Omvandla mellan ton och kilogram', en: 'Convert between tonnes and kg' } },
          { key: 'weight_kg_hg', name: { sv: 'Vikt: kg ↔ hg', en: 'Weight: kg ↔ hg' }, desc: { sv: 'Omvandla mellan kilogram och hekto', en: 'Convert between kg and hg' } },
          { key: 'weight_kg_g', name: { sv: 'Vikt: kg ↔ g', en: 'Weight: kg ↔ g' }, desc: { sv: 'Omvandla mellan kilogram och gram', en: 'Convert between kg and g' } },
          { key: 'weight_hg_g', name: { sv: 'Vikt: hg ↔ g', en: 'Weight: hg ↔ g' }, desc: { sv: 'Omvandla mellan hekto och gram', en: 'Convert between hg and g' } },
          { key: 'weight_g_mg', name: { sv: 'Vikt: g ↔ mg', en: 'Weight: g ↔ mg' }, desc: { sv: 'Omvandla mellan gram och milligram', en: 'Convert between g and mg' } },

          // LEVEL 3: Volym (Volume)
          { key: 'vol_l_dl', name: { sv: 'Volym: l ↔ dl', en: 'Volume: l ↔ dl' }, desc: { sv: 'Omvandla mellan liter och deciliter', en: 'Convert between l and dl' } },
          { key: 'vol_l_cl', name: { sv: 'Volym: l ↔ cl', en: 'Volume: l ↔ cl' }, desc: { sv: 'Omvandla mellan liter och centiliter', en: 'Convert between l and cl' } },
          { key: 'vol_l_ml', name: { sv: 'Volym: l ↔ ml', en: 'Volume: l ↔ ml' }, desc: { sv: 'Omvandla mellan liter och milliliter', en: 'Convert between l and ml' } },
          { key: 'vol_dl_cl', name: { sv: 'Volym: dl ↔ cl', en: 'Volume: dl ↔ cl' }, desc: { sv: 'Omvandla mellan deciliter och centiliter', en: 'Convert between dl and cl' } },
          { key: 'vol_dl_ml', name: { sv: 'Volym: dl ↔ ml', en: 'Volume: dl ↔ ml' }, desc: { sv: 'Omvandla mellan deciliter och milliliter', en: 'Convert between dl and ml' } },
          { key: 'vol_cl_ml', name: { sv: 'Volym: cl ↔ ml', en: 'Volume: cl ↔ ml' }, desc: { sv: 'Omvandla mellan centiliter och milliliter', en: 'Convert between cl and ml' } }
        ]
      },
      geometry: {
        name: { sv: 'Area & Omkrets', en: 'Area & Perimeter' },
        variations: [
          {
            key: "perimeter_square",
            name: { sv: "Omkrets: Kvadrat", en: "Perimeter: Square" },
            desc: { sv: "Beräkna omkretsen av en kvadrat utifrån en känd sida", en: "Calculate the perimeter of a square from a known side length" },
            tags: ["word_problem_ready"],
            contextType: "geom_perimeter_square",
            extractorPattern: /4\s*(?:\\cdot|·)\s*(?<s>\d+)/i // Matches: 4 \cdot X
          },
          { key: 'perimeter_rect', name: { sv: 'Omkrets: Rektangel', en: 'Perimeter: Rectangle' }, desc: { sv: '2b + 2h', en: '2w + 2h' } },
          { key: 'perimeter_parallel', name: { sv: 'Omkrets: Parallellogram', en: 'Perimeter: Parallelogram' }, desc: { sv: 'Samma som rektangel', en: 'Same as rectangle' } },
          {
            key: "perimeter_inverse",
            name: { sv: "Omkrets: Omvänd rektangel", en: "Perimeter: Inverse Rectangle" },
            desc: { sv: "Hitta den saknade höjden i en rektangel utifrån omkrets och bas", en: "Find the missing height of a rectangle using perimeter and base" },
            tags: ["word_problem_ready"],
            contextType: "geom_perimeter_inverse",
            extractorPattern: /P\s*=\s*(?<p>\d+)\s*,\s*b\s*=\s*(?<b>\d+)/i // Matches: P = X, b = Y
          },
          { key: 'area_square', name: { sv: 'Area: Kvadrat', en: 'Area: Square' }, desc: { sv: 's * s', en: 's * s' } },
          {
            key: "area_rect",
            name: { sv: "Area: Rektangel & Parallellogram", en: "Area: Rectangle & Parallelogram" },
            desc: { sv: "Beräkna ytan på en fyrhörning genom basen gånger höjden", en: "Calculate the surface area of a quadrilateral using base times height" },
            tags: ["word_problem_ready"],
            contextType: "geom_area_quad",
            extractorPattern: /(?<b>\d+)\s*(?:\\cdot|·)\s*(?<h>\d+)/i // Matches: X \cdot Y
          },
          { key: 'area_parallel', name: { sv: 'Area: Parallellogram', en: 'Area: Parallelogram' }, desc: { sv: 'Vinkelrät höjd', en: 'Perpendicular height' } },
          {
            key: "area_triangle",
            name: { sv: "Area: Triangel", en: "Area: Triangle" },
            desc: { sv: "Beräkna triangelns area genom basen gånger höjden delat på två", en: "Calculate triangle area using base times height divided by two" },
            tags: ["word_problem_ready"],
            contextType: "geom_area_triangle",
            extractorPattern: /(?<base>\d+)\s*(?:\\cdot|·)\s*(?<height>\d+)\s*=\s*\d+/i // Matches: X · Y = Z
          },
          { key: 'perimeter_triangle_right', name: { sv: 'Omkrets: Rätvinklig triangel', en: 'Perimeter: Right triangle' }, desc: { sv: 'Summa av sidor', en: 'Sum of sides' } },
          {
            key: "combined_l_shape",
            name: { sv: "Area: L-formad figur", en: "Area: L-Shaped Figure" },
            desc: { sv: "Dela upp en sammansatt vinkelformad yta i två rektanglar", en: "Divide a composite L-shaped area into two separate rectangles" },
            tags: ["word_problem_ready"],
            contextType: "geom_area_l_shape",
            extractorPattern: /vertikala rektangeln[\s\S]*?(?<vW>\d+)\s*·\s*(?<vH>\d+)[\s\S]*horisontella rektangeln[\s\S]*?(?<hW>\d+)\s*·\s*(?<hH>\d+)/i
          },
          { key: 'combined_rect_tri', name: { sv: 'Area: Sammansatt Rekt+Tri', en: 'Area: Comp. Rect+Tri' }, desc: { sv: 'Addera delarna', en: 'Add the parts' } },
          {
            key: "circle_area",
            name: { sv: "Area: Cirkel", en: "Area: Circle" },
            desc: { sv: "Beräkna cirkelns yta utifrån radie eller diameter", en: "Calculate the area of a circle using radius or diameter" },
            tags: ["word_problem_ready"],
            contextType: "geom_area_circle",
            extractorPattern: /3,14\s*·\s*(?<r>\d+)\s*\^2/i
          },
          { key: 'circle_perimeter', name: { sv: 'Omkrets: Cirkel', en: 'Perimeter: Circle' }, desc: { sv: 'pi*diameter', en: 'pi*diameter' } },
          { key: 'semicircle_area', name: { sv: 'Area: Halvcirkel', en: 'Area: Semicircle' }, desc: { sv: 'Hälften av pi*r^2', en: 'Half of pi*r^2' } },
          { key: 'semicircle_perimeter', name: { sv: 'Omkrets: Halvcirkel', en: 'Perimeter: Semicircle' }, desc: { sv: 'Båge + Diameter', en: 'Arc + Diameter' } },
          { key: 'area_quarter', name: { sv: 'Area: Kvartscirkel', en: 'Area: Quarter circle' }, desc: { sv: 'Area av 1/4 circkel', en: 'Area of 1/4 circle' } },
          { key: 'perimeter_quarter', name: { sv: 'Omkrets: Kvartscirkel', en: 'Perimeter: Quarter circle' }, desc: { sv: 'Båge + 2 Radier', en: 'Arc + 2 Radii' } },
          { key: 'perimeter_house', name: { sv: 'Omkrets: Hus', en: 'Perimeter: House' }, desc: { sv: 'Rektangel + Triangel', en: 'Rectangle + Triangle' } },
          { key: 'perimeter_portal', name: { sv: 'Omkrets: Portal', en: 'Perimeter: Portal' }, desc: { sv: 'Rektangel + Halvcirkel', en: 'Rectangle + Semicircle' } },
          {
            key: "area_house",
            name: { sv: "Area: Sammansatt Hus", en: "Area: Composite House" },
            desc: { sv: "Avancerad area genom att addera en hussida med ett triangulärt tak", en: "Advanced area by adding a rectangular wall base with a triangular roof" },
            tags: ["word_problem_ready"],
            contextType: "geom_area_house",
            extractorPattern: /rektangelns yta[\s\S]*?(?<w>\d+)\s*·\s*(?<h>\d+)[\s\S]*triangelns yta[\s\S]*?hr:\s*(?<hr>\d+)/i
          },
          { key: 'area_portal', name: { sv: 'Area: Portal', en: 'Area: Portal' }, desc: { sv: 'Rektangel + Halvcirkel', en: 'Rectangle + Semicircle' } }
        ]
      },
      angles: {
        name: { sv: 'Vinklar', en: 'Angles' },
        variations: [
          // LEVEL 1: Terminologi & Typer
          { key: 'classification_visual', level: 1, name: { sv: 'Vinkeltyper', en: 'Angle types' }, desc: { sv: 'Spetsig, Rät, Trubbig', en: 'Acute, Right, Obtuse' } },
          { key: 'classification_inverse_numeric', level: 1, name: { sv: 'Klassificera via gradtal', en: 'Classify by degrees' }, desc: { sv: 'Bedöm vinkel utifrån tal', en: 'Judge angle from number' } },
          { key: 'classification_lie', level: 1, name: { sv: 'Hitta felet: Typer', en: 'Find error: Types' }, desc: { sv: 'Analysera påståenden', en: 'Analyze statements' } },
          { key: 'classification_check_acute', level: 1, name: { sv: 'Är det spetsig?', en: 'Is it acute?' }, desc: { sv: '<90 grader', en: '<90 degrees' } },
          
          // LEVEL 2: Komplement & Supplementvinklar
          { key: 'comp_supp_visual', level: 2, name: { sv: 'Grannvinklar', en: 'Neighbor angles' }, desc: { sv: 'Summa 180 eller 90', en: 'Sum 180 or 90' } },
          { key: 'comp_supp_inverse', level: 2, name: { sv: 'Hitta saknad grannvinkel', en: 'Find missing neighbor' }, desc: { sv: 'Räkna ut vinkeln', en: 'Calculate the angle' } },

          // LEVEL 3: Vertikalvinklar
          { key: 'vertical_side_visual', level: 3, name: { sv: 'Vertikalvinklar', en: 'Vertical angles' }, desc: { sv: 'Mittemot varandra', en: 'Opposite each other' } },
          { key: 'vertical_side_lie', level: 3, name: { sv: 'Hitta felet: Vertikal', en: 'Find error: Vertical' }, desc: { sv: 'Felsök vinkelkors', en: 'Troubleshoot intersections' } },

          // LEVEL 4: Triangelns Vinkelsumma
          { key: 'triangle_sum_visual', level: 4, name: { sv: 'Triangelns summa', en: 'Triangle sum' }, desc: { sv: 'Alltid 180 grader', en: 'Always 180 degrees' } },
          { key: 'triangle_isosceles', level: 4, name: { sv: 'Likbent triangel', en: 'Isosceles triangle' }, desc: { sv: 'Basvinklar är lika', en: 'Base angles are equal' } },

          // LEVEL 5: Polygoner & Fyrhörningar
          { key: 'polygon_sum', level: 5, name: { sv: 'Vinkelsumma (Månghörning)', en: 'Polygon Angle Sum' }, desc: { sv: 'Formel: (n-2)*180', en: 'Formula: (n-2)*180' } },
          { key: 'quad_missing', level: 5, name: { sv: 'Fyrhörning (Saknad)', en: 'Quadrilateral (Missing)' }, desc: { sv: 'Summa 360 grader', en: 'Sum 360 degrees' } },
          { key: 'polygon_inverse', level: 5, name: { sv: 'Månghörning (Saknad)', en: 'Polygon (Missing)' }, desc: { sv: 'Beräkna sista vinkeln', en: 'Calculate the last angle' } },

          // LEVEL 6: Parallella Linjer & Transversaler
          { key: 'parallel_visual', level: 6, name: { sv: 'Parallella linjer', en: 'Parallel lines' }, desc: { sv: 'Alternat/Likbelägen', en: 'Alternate/Corresponding' } },
          { key: 'parallel_lie', level: 6, name: { sv: 'Hitta felet: Parallella', en: 'Find error: Parallel' }, desc: { sv: 'Felsök logiken', en: 'Troubleshoot logic' } }
        ]
      },
      pythagoras: {
        name: { sv: 'Pythagoras Sats', en: 'Pythagorean Theorem' },
        variations: [
          { key: 'sqrt_calc', name: { sv: 'Kvadratrot', en: 'Square root' }, desc: { sv: 'Beräkning', en: 'Calculation' } },
          { key: 'square_calc', name: { sv: 'Kvadrat', en: 'Square' }, desc: { sv: 'Tal i kvadrat', en: 'Number squared' } },
          { key: 'missing_square', name: { sv: 'Invers kvadrat', en: 'Inverse square' }, desc: { sv: 'x^2 = a', en: 'x^2 = a' } },
          { key: 'sqrt_estimation', name: { sv: 'Uppskatta rot', en: 'Estimate root' }, desc: { sv: 'Ja/Nej frågor', en: 'Yes/No questions' } },
          { key: 'hyp_equation', name: { sv: 'Ekvation: Hypotenusa', en: 'Equation: Hypotenuse' }, desc: { sv: 'Rätt uppställning', en: 'Correct setup' } },
          { key: 'leg_concept', name: { sv: 'Koncept: Katet', en: 'Concept: Leg' }, desc: { sv: 'Subtraktion krävs', en: 'Subtraction required' } },
          { key: 'app_ladder', name: { sv: 'Problem: Stegen', en: 'Problem: The Ladder' }, desc: { sv: 'Lutande stege', en: 'Leaning ladder' } },
          { key: 'conv_check', name: { sv: 'Rätvinklig?', en: 'Right-angled?' }, desc: { sv: 'Kontrollera satsen', en: 'Check the theorem' } },
          { 
            key: 'hyp_visual', 
            name: { sv: 'Beräkna hypotenusa', en: 'Calculate hypotenuse' }, 
            desc: { sv: 'Sök den längsta sidan utifrån kateterna', en: 'Find longest side given the two legs' },
            tags: ['word_problem_ready'],
            contextType: 'pyth_hypotenuse',
            extractorPattern: /^(?<a>\d+)\s*;\s*(?<b>\d+)\s*;\s*(?<c>\d+)/
          },
          { 
            key: 'leg_visual', 
            name: { sv: 'Beräkna katet', en: 'Calculate leg' }, 
            desc: { sv: 'Hitta en kort sida med subtraktion', en: 'Find a shorter side using subtraction' },
            tags: ['word_problem_ready'],
            contextType: 'pyth_leg',
            extractorPattern: /^(?<a>\d+)\s*;\s*(?<b>\d+)\s*;\s*(?<c>\d+)/
          },
          { 
            key: 'app_diagonal', 
            name: { sv: 'Rektangelns diagonal', en: 'Rectangle diagonal' }, 
            desc: { sv: 'Räkna ut sträckan tvärs över en rektangel', en: 'Calculate path across a rectangle' },
            tags: ['word_problem_ready'],
            contextType: 'pyth_diagonal',
            extractorPattern: /^(?<a>\d+)\s*;\s*(?<b>\d+)\s*;\s*(?<c>\d+)/
          }
        ]
      },
      similarity: {
        name: { sv: 'Likformighet', en: 'Similarity' },
        variations: [
          { key: 'sim_rect_check', name: { sv: 'Är de likformiga?', en: 'Are they similar?' }, desc: { sv: 'Rektanglar', en: 'Rectangles' } },
          { key: 'sim_tri_angle_check', name: { sv: 'Likformighet: Vinklar', en: 'Similarity: Angles' }, desc: { sv: 'Samma vinklar', en: 'Same angles' } },
          { key: 'sim_tri_side_check', name: { sv: 'Likformighet: Sidor', en: 'Similarity: Sides' }, desc: { sv: 'Proportioner', en: 'Proportions' } },
          { key: 'sim_concept_lie', name: { sv: 'Hitta felet: Teori', en: 'Find error: Theory' }, desc: { sv: 'Begreppsförståelse', en: 'Conceptual understanding' } },
          { key: 'transversal_concept_id', name: { sv: 'Identifiera fall', en: 'Identify case' }, desc: { sv: 'Topp vs Transversal', en: 'Top vs Transversal' } },
          { key: 'pythagoras_sim_hyp', name: { sv: 'Likf. & Pythagoras', en: 'Sim. & Pythagoras' }, desc: { sv: 'Kombinerad (Hyp)', en: 'Combined (Hyp)' } },
          // Inside skillBuckets.js -> geometry_cat -> topics -> geometry -> variations
          { 
            key: 'sim_calc_big', 
            name: { sv: 'Beräkna stor sida', en: 'Calculate long side' }, 
            desc: { sv: 'Multiplicera med k', en: 'Multiply by k' },
            tags: ['word_problem_ready'],
            contextType: 'similarity_calc_big',
            // 🟢 Matches primitive string array sequence: s1 ; s2 ; bigS1 ; bigS2 ; k
            extractorPattern: /^(?<s1>\d+)\s*;\s*(?<s2>\d+)\s*;\s*(?<bigS1>[\d.]+)\s*;\s*(?<bigS2>[\d.]+)\s*;\s*(?<k>[\d.]+)/
          },
          { 
            key: 'sim_calc_small', 
            name: { sv: 'Beräkna liten sida', en: 'Calculate short side' }, 
            desc: { sv: 'Dividera med k', en: 'Divide by k' },
            tags: ['word_problem_ready'],
            contextType: 'similarity_calc_small',
            extractorPattern: /^(?<s1>\d+)\s*;\s*(?<s2>\d+)\s*;\s*(?<bigS1>[\d.]+)\s*;\s*(?<bigS2>[\d.]+)\s*;\s*(?<k>[\d.]+)/
          },
          { 
            key: 'sim_find_k', 
            name: { sv: 'Hitta skalfaktor', en: 'Find scale factor' }, 
            desc: { sv: 'Kvot av sidor', en: 'Ratio of sides' },
            tags: ['word_problem_ready'],
            contextType: 'similarity_find_k',
            extractorPattern: /^(?<s1>\d+)\s*;\s*(?<s2>\d+)\s*;\s*(?<bigS1>[\d.]+)\s*;\s*(?<bigS2>[\d.]+)\s*;\s*(?<k>[\d.]+)/
          },
          { 
            key: 'transversal_total', 
            name: { sv: 'Transversal: Hela', en: 'Transversal: Total' }, 
            desc: { sv: 'Söker stora basen', en: 'Seeking large base' },
            tags: ['word_problem_ready'],
            contextType: 'transversal_total',
            // 🟢 Matches primitive string array sequence: top ; extra ; smallBase ; totSide ; bigBase ; transK
            extractorPattern: /^(?<top>\d+)\s*;\s*(?<extra>\d+)\s*;\s*(?<smallBase>\d+)\s*;\s*(?<totSide>\d+)\s*;\s*(?<bigBase>[\d.]+)\s*;\s*(?<k>[\d.]+)/
          },
          { 
            key: 'transversal_extension', 
            name: { sv: 'Transversal: Del', en: 'Transversal: Part' }, 
            desc: { sv: 'Del av sidosidan', en: 'Part of side' },
            tags: ['word_problem_ready'],
            contextType: 'transversal_extension',
            extractorPattern: /^(?<top>\d+)\s*;\s*(?<extra>\d+)\s*;\s*(?<smallBase>\d+)\s*;\s*(?<totSide>\d+)\s*;\s*(?<bigBase>[\d.]+)\s*;\s*(?<k>[\d.]+)/
          }
        ]
      },
      scale: {
        name: { sv: 'Skala', en: 'Scale' },
        variations: [
          { key: 'concept_lie', name: { sv: 'Hitta felet: Skala', en: 'Find error: Scale' }, desc: { sv: 'Analysera påstående', en: 'Analyze statement' } },
          { key: 'find_scale', name: { sv: 'Bestäm skalan', en: 'Determine scale' }, desc: { sv: '1:X form', en: '1:X form' } },
          { key: 'area_concept', name: { sv: 'Areaskala: Koncept', en: 'Area scale: Concept' }, desc: { sv: 'Längdskala i kvadrat', en: 'Length scale squared' } },
          {
            key: "area_calc_large",
            name: { sv: "Beräkna verklighet: Area", en: "Calculate Reality: Area" },
            desc: { sv: "Använd längdskalan i kvadrat för att beräkna den verkliga arean", en: "Use the length scale squared to calculate the actual area" },
            tags: ["word_problem_ready"],
            contextType: "scale_area_forward",
            // 🟢 FIXED: Matches the emitted semicolon structure: scale ; smallA ; largeA
            extractorPattern: /^(?<scale>\d+)\s*;\s*(?<smallA>\d+)\s*;\s*(?<largeA>\d+)/
          },
          {
            key: "area_reverse",
            name: { sv: "Bestäm skala utifrån area", en: "Determine Scale from Area" },
            desc: { sv: "Beräkna längdskalan genom att dra kvadratroten ur areaskalan", en: "Calculate the length scale by taking the square root of the area scale" },
            tags: ["word_problem_ready"],
            contextType: "scale_area_reverse",
            // 🟢 FIXED: Matches the emitted semicolon structure: smallA ; largeA ; scale
            extractorPattern: /^(?<smallA>\d+)\s*;\s*(?<largeA>\d+)\s*;\s*(?<scale>\d+)/
          },
          { 
            key: 'calc_real', 
            name: { sv: 'Beräkna verklighet', en: 'Calculate reality' },
            desc: { sv: 'Hitta det verkliga måttet', en: 'Find the real measure' },
            tags: ['word_problem_ready'],
            contextType: 'scale_calc_real',
            extractorPattern: /^(?<scale>\d+)\s*;\s*(?<imgCm>\d+)\s*;\s*(?<ans>\d+)/
          },
          { 
            key: 'calc_image', 
            name: { sv: 'Beräkna ritning', en: 'Calculate drawing' },
            desc: { sv: 'Hitta måttet på bilden', en: 'Find the image measure' },
            tags: ['word_problem_ready'],
            contextType: 'scale_linear_image',
            extractorPattern: /^(?<scale>\d+)\s*;\s*(?<realCm>\d+)\s*;\s*(?<imgCm>\d+)/
          },
          { 
            key: 'map_real', 
            name: { sv: 'Karta: Verklighet', en: 'Map: Reality' },
            desc: { sv: 'Beräkna avstånd från karta', en: 'Calculate distance from map' },
            tags: ['word_problem_ready'],
            contextType: 'scale_map_real',
            extractorPattern: /^(?<scale>\d+)\s*;\s*(?<mapCm>\d+)\s*;\s*(?<ans>[\d.]+)/
          },
          { 
            key: 'blueprint_draw', 
            name: { sv: 'Ritning: Skala', en: 'Blueprint: Scale' },
            desc: { sv: 'Räkna ut längd på ritning', en: 'Calculate length on drawing' },
            tags: ['word_problem_ready'],
            contextType: 'scale_blueprint_draw',
            extractorPattern: /^(?<scale>\d+)\s*;\s*(?<realM>\d+)\s*;\s*(?<ans>\d+)/
          },
          { 
            key: 'microscope_calc', 
            name: { sv: 'Förstoring (Mikroskop)', en: 'Magnification (Micro)' }, 
            desc: { sv: 'X:1 form', en: 'X:1 form' },
            // 🟢 FIXED: Instrument microscope calculations for interception
            tags: ['word_problem_ready'],
            contextType: 'scale_microscope_calc',
            extractorPattern: /^(?<scale>\d+)\s*;\s*(?<realMm>[\d.]+)\s*;\s*(?<ansMm>[\d.]+)/
          }
        ]
      },
      volume: {
        name: { sv: 'Volym & Yta', en: 'Volume & Surface Area' },
        variations: [
          { key: 'vol_cuboid_inverse', name: { sv: 'Rätblock: Hitta höjd', en: 'Cuboid: Find height' }, desc: { sv: 'Givet V, sök h', en: 'Given V, seek h' } },
          { key: 'vol_cuboid_scaling', name: { sv: 'Rätblock: Skalning', en: 'Cuboid: Scaling' }, desc: { sv: 'Ökad höjd', en: 'Increased height' } },
          { key: 'vol_silo_std', name: { sv: 'Silo (Cyl+Halvklot)', en: 'Silo (Cyl+Hemis)' }, desc: { sv: 'Sammansatt volym', en: 'Composite volume' } },
          { key: 'vol_icecream_std', name: { sv: 'Strut (Kon+Halvklot)', en: 'Cone (Cone+Hemis)' }, desc: { sv: 'Sammansatt volym', en: 'Composite volume' } },
          { key: 'vol_units_liter', name: { sv: 'Enheter: Liter', en: 'Units: Liter' }, desc: { sv: 'dm3 = liter', en: 'dm3 = liter' } },
          { key: 'vol_units_m3', name: { sv: 'Enheter: Kubikmeter', en: 'Units: Cubic meter' }, desc: { sv: 'm3 till liter', en: 'm3 to liter' } },
          { key: 'sa_cuboid', name: { sv: 'Begränsningsyta: Rätbl.', en: 'Surface area: Cuboid' }, desc: { sv: 'Alla sex sidor', en: 'All six sides' } },
          { key: 'sa_sphere', name: { sv: 'Begränsningsyta: Klot', en: 'Surface area: Sphere' }, desc: { sv: '4 * pi * r^2', en: '4 * pi * r^2' } },
          { key: 'vol_unit_conv', name: { sv: 'Volym: Enheter', en: 'Volume: Units' }, desc: { sv: 'Omvandla mellan dm³, cm³, liter och ml', en: 'Convert between dm³, cm³, liters and ml' } },
          { key: 'vol_word_unit', name: { sv: 'Volym: Vardagsproblem', en: 'Volume: Word Problems' }, desc: { sv: 'Beräkna volym och svara i liter/ml (med bild)', en: 'Calculate volume and answer in liters/ml (with image)' } },
          { 
            key: 'vol_cuboid_std', 
            name: { sv: 'Volym: Rätblock', en: 'Volume: Cuboid' }, 
            desc: { sv: 'l * b * h', en: 'l * w * h' },
            tags: ['word_problem_ready'],
            contextType: 'volume_cuboid',
            extractorPattern: /^(?<w>\d+)\s*;\s*(?<d>\d+)\s*;\s*(?<h>\d+)$/
          },
          { 
            key: 'vol_tri_prism_std', 
            name: { sv: 'Volym: Prisma', en: 'Volume: Prism' }, 
            desc: { sv: 'Basarea * längd', en: 'Base area * length' },
            tags: ['word_problem_ready'],
            contextType: 'volume_prism',
            extractorPattern: /^(?<b>\d+)\s*;\s*(?<hTri>\d+)\s*;\s*(?<length>\d+)$/
          },
          { 
            key: 'vol_cyl_std', 
            name: { sv: 'Volym: Cylinder', en: 'Volume: Cylinder' }, 
            desc: { sv: 'pi * r^2 * h', en: 'pi * r^2 * h' },
            tags: ['word_problem_ready'],
            contextType: 'volume_cylinder',
            extractorPattern: /^(?<r>\d+)\s*;\s*(?<h>\d+)$/
          },
          { 
            key: 'vol_pyramid_std', 
            name: { sv: 'Volym: Pyramid', en: 'Volume: Pyramid' }, 
            desc: { sv: '(Bas * h) / 3', en: '(Base * h) / 3' },
            tags: ['word_problem_ready'],
            contextType: 'volume_pyramid',
            extractorPattern: /^(?<s>\d+)\s*;\s*(?<h>\d+)$/
          },
          { 
            key: 'vol_cone_std', 
            name: { sv: 'Volym: Kon', en: 'Volume: Cone' }, 
            desc: { sv: '(Cirkel * h) / 3', en: '(Circle * h) / 3' },
            tags: ['word_problem_ready'],
            contextType: 'volume_cone',
            extractorPattern: /^(?<r>\d+)\s*;\s*(?<h>\d+)$/
          },
          { 
            key: 'vol_sphere_std', 
            name: { sv: 'Volym: Klot', en: 'Volume: Sphere' }, 
            desc: { sv: '4*pi*r^3 / 3', en: '4*pi*r^3 / 3' },
            tags: ['word_problem_ready'],
            contextType: 'volume_sphere',
            extractorPattern: /^(?<r>\d+)$/
          }
        ]
      }
    }
  },

  // ==========================================
  // 4. DATA & SANNOLIKHET
  // ==========================================
  data: {
    id: 'data',
    name: { sv: 'Data & Sannolikhet', en: 'Data & Probability' },
    topics: {
      statistics: {
        name: { sv: 'Statistik', en: 'Statistics' },
        variations: [
          { key: 'find_min_max', name: { sv: 'Minsta/Största tal', en: 'Min/Max number' }, desc: { sv: 'Hitta extrempunkter', en: 'Find extremes' } },
          { key: 'mean_concept_balance', name: { sv: 'Medel: Koncept', en: 'Mean: Concept' }, desc: { sv: 'Effekt av nytt tal', en: 'Effect of new value' } },
          { key: 'real_measure_choice', name: { sv: 'Välj Lägesmått', en: 'Choose measure' }, desc: { sv: 'Medel vs Median', en: 'Mean vs Median' } },
          { key: 'real_weighted_missing', name: { sv: 'Viktat medelvärde', en: 'Weighted average' }, desc: { sv: 'Sammansatt snitt', en: 'Composite average' } },
          // Inside skillBuckets.js -> data -> topics -> statistics -> variations
          { 
            key: 'find_mode', 
            name: { sv: 'Typvärde', en: 'Mode' }, 
            desc: { sv: 'Hitta det vanligaste värdet i listan', en: 'Find the most frequent list value' },
            tags: ['word_problem_ready'],
            contextType: 'stats_find_mode',
            extractorPattern: /^(?<list>[^;]+)\s*;\s*(?<ans>\d+)/
          },
          { 
            key: 'find_range', 
            name: { sv: 'Variationsbredd', en: 'Range' }, 
            desc: { sv: 'Beräkna skillnaden mellan max och min', en: 'Calculate difference between max and min' },
            tags: ['word_problem_ready'],
            contextType: 'stats_find_range',
            extractorPattern: /^(?<list>[^;]+)\s*;\s*(?<max>\d+)\s*;\s*(?<min>\d+)\s*;\s*(?<ans>\d+)/
          },
          { 
            key: 'calc_mean', 
            name: { sv: 'Medelvärde', en: 'Mean' }, 
            desc: { sv: 'Räkna ut det genomsnittliga värdet', en: 'Calculate the average value' },
            tags: ['word_problem_ready'],
            contextType: 'stats_calc_mean',
            extractorPattern: /^(?<list>[^;]+)\s*;\s*(?<sum>\d+)\s*;\s*(?<count>\d+)\s*;\s*(?<ans>[\d.]+)/
          },
          { 
            key: 'median_odd', 
            name: { sv: 'Median', en: 'Median' }, 
            desc: { sv: 'Sortera listan och finn talet i mitten', en: 'Sort the list and find the middle number' },
            tags: ['word_problem_ready'],
            contextType: 'stats_median_odd',
            extractorPattern: /^(?<list>[^;]+)\s*;\s*(?<ans>\d+)/
          },
          { 
            key: 'reverse_mean_calc', 
            name: { sv: 'Hitta saknat tal', en: 'Find missing number' }, 
            desc: { sv: 'Räkna ut saknat värde utifrån medelvärdet', en: 'Calculate a missing value given the mean' },
            tags: ['word_problem_ready'],
            contextType: 'stats_reverse_mean',
            extractorPattern: /^(?<mean>\d+)\s*;\s*(?<knownList>[^;]+)\s*;\s*(?<ans>\d+)/
          },
          { 
            key: 'freq_count', 
            name: { sv: 'Tabell/Graf: Totalt antal', en: 'Table/Graph: Total count' }, 
            desc: { sv: 'Summera alla frekvenser i tabellen', en: 'Sum all frequencies in the table' },
            tags: ['word_problem_ready'],
            contextType: 'stats_freq_count',
            extractorPattern: /^(?<totalCount>\d+)/
          },
          { 
            key: 'freq_mode', 
            name: { sv: 'Tabell/Graf: Typvärde', en: 'Table/Graph: Mode' }, 
            desc: { sv: 'Hitta värdet med högst frekvens', en: 'Find the value with the highest frequency' },
            tags: ['word_problem_ready'],
            contextType: 'stats_freq_mode',
            extractorPattern: /^(?<mode>\d+)/
          },
          { 
            key: 'freq_mean', 
            name: { sv: 'Tabell/Graf: Medelvärde', en: 'Table/Graph: Mean' }, 
            desc: { sv: 'Beräkna medelvärdet från en tabell', en: 'Calculate the mean from a table' } 
          },
          { 
            key: 'freq_median', 
            name: { sv: 'Tabell/Graf: Median', en: 'Table/Graph: Median' }, 
            desc: { sv: 'Bestäm medianen från en tabell', en: 'Determine the median from a table' } 
          }
        ]
      },
      probability: {
        name: { sv: 'Sannolikhet', en: 'Probability' },
        variations: [
          { key: 'visual_calc', 
            name: { sv: 'Beräkna Sannolikhet', en: 'Calculate Probability' }, 
            desc: { sv: 'Gynsamma / Möjliga', en: 'Favorable / Possible' }, 
            tags: ['word_problem_ready'],
            contextType: 'discrete_pool',
            // Captures the favorable target amount (?<match>) and the absolute total size (?<total>)
            extractorPattern: /\\frac\{(?<match>\d+)\}\{(?<total>\d+)\}/
          },
          { key: 'visual_not', name: { sv: 'Komplementhändelse', en: 'Complementary event' }, desc: { sv: 'Sannolikheten för "Inte"', en: 'Probability of "Not"' } },
          { key: 'visual_spinner', name: { sv: 'Lyckohjul', en: 'Lucky wheel' }, desc: { sv: 'Sektorernas andel', en: 'Sector share' } },
          { key: 'dice_single', name: { sv: 'Tärning: Enstaka tal', en: 'Dice: Single number' }, desc: { sv: 'Ex: Få en 5:a', en: 'Ex: Rolling a 5' } },
          {
            key: "dice_parity",
            name: { sv: "Tärningskast: Egenskaper", en: "Die Toss: Properties" },
            desc: { sv: "Sannolikhet för jämna, udda eller specifika tärningsmönster", en: "Probability of rolling even, odd, or specific die patterns" },
            tags: ["word_problem_ready"],
            contextType: "prob_dice_parity",
            extractorPattern: /slå\s*ett\s*(?<label>jämnt|udda)\s*tal/i
          },
          { key: 'dice_range', name: { sv: 'Tärning: Intervall', en: 'Dice: Range' }, desc: { sv: 'Större/Mindre än n', en: 'Greater/Smaller than n' } },
          {
            key: "group_ratio",
            name: { sv: "Förhållande i grupp", en: "Ratios in Groups" },
            desc: { sv: "Beräkna sannolikhet utifrån ett givet proportionellt förhållande", en: "Calculate probability based on a given proportional ratio" },
            tags: ["word_problem_ready"],
            contextType: "prob_group_ratio",
            extractorPattern: /mellan\s*(?<label1>[^ och]+)\s*och\s*(?<label2>[^ ]+)\s*föremål\s*(?<r1>\d+):(?<r2>\d+)/i
          },
          { key: 'group_ternary', name: { sv: 'Tre grupper', en: 'Three groups' }, desc: { sv: 'Hitta restens chans', en: 'Find rest\'s chance' } },
          { key: 'concept_likelihood', name: { sv: 'Begrepp: Chans', en: 'Concept: Chance' }, desc: { sv: 'Säkert / Omöjligt', en: 'Certain / Impossible' } },
          {
            key: "comp_multi",
            name: { sv: "Komplementhändelse: Procent", en: "Complementary Event: Percent" },
            desc: { sv: "Beräkna sannolikheten att något INTE händer utifrån procent", en: "Calculate the probability of an event NOT happening using percentages" },
            tags: ["word_problem_ready"],
            contextType: "prob_complement_pct",
            extractorPattern: /lotteri\s*är\s*(?<pWin>\d+)\s*%/i
          },
          { key: 'tree_calc', name: { sv: 'Sannolikhetsträd', en: 'Probability tree' }, desc: { sv: 'Dragning utan återl.', en: 'Pick w/o replacement' } },
          { key: 'chain_any_order', name: { sv: 'Oberoende ordning', en: 'Independent order' }, desc: { sv: 'En av varje färg', en: 'One of each color' } },
          { key: 'comb_constraint', name: { sv: 'Kombinatorik: Outfits', en: 'Combinatorics: Outfits' }, desc: { sv: 'Multiplikation', en: 'Multiplication' } },
          { key: 'pathways_basic', name: { sv: 'Räkna Vägar', en: 'Count paths' }, desc: { sv: 'A till B nätverk', en: 'A to B network' } }
        ]
      }
    }
  }
};