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
          // LEVEL 1: Enstegsekvationer (One-step equations)
          { 
            key: 'onestep_calc', 
            level: 1,
            name: { sv: 'Ensteg: Beräkning', en: 'One-step: Calculation' }, 
            desc: { sv: 'Lös enkla x + a = b eller x - a = b', en: 'Solve simple x + a = b or x - a = b' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_onestep',
            extractorPattern: /^(?<type>multiply|add|sub)\s*;\s*(?<a>\d+)\s*;\s*(?<b>\d+)$/
          },
          { key: 'onestep_concept_inverse', level: 1, name: { sv: 'Ensteg: Invers', en: 'One-step: Inverse' }, desc: { sv: 'Välj rätt räknesätt (+/-/*/÷)', en: 'Choose the correct operation' } },
          { key: 'onestep_spot_lie', level: 1, name: { sv: 'Hitta felet: Ensteg', en: 'Find the error: One-step' }, desc: { sv: 'Identifiera felaktig lösning', en: 'Identify incorrect solutions' } },
          
          // LEVEL 2: Tvåstegsekvationer (Two-step equations)
          { 
            key: 'twostep_calc', 
            level: 2,
            name: { sv: 'Tvåsteg: Beräkning', en: 'Two-step: Calculation' }, 
            desc: { sv: 'ax + b = c eller ax - b = c', en: 'ax + b = c or ax - b = c' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_twostep',
            extractorPattern: /^(?<type>multiply|divide)\s*;\s*(?<a>\d+)\s*;\s*(?<op>[\+\-])\s*;\s*(?<b>\d+)\s*;\s*(?<c>\d+)$/
          },
          { key: 'twostep_concept_order', level: 2, name: { sv: 'Tvåsteg: Ordning', en: 'Two-step: Order' }, desc: { sv: 'Vilket steg tas först?', en: 'Which step is taken first?' } },
          { 
            key: 'twostep_write_problem', 
            level: 2,
            name: { sv: 'Formulera: Ekvation', en: 'Formulate: Equation' }, 
            desc: { sv: 'Skriv ekvationen utifrån en text', en: 'Write equation from a story' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_twostep_formulation',
            extractorPattern: /^(?<type>multiply|divide)\s*;\s*(?<a>\d+)\s*;\s*(?<op>[\+\-])\s*;\s*(?<b>\d+)\s*;\s*(?<c>\d+)$/
          },
          { 
            key: 'twostep_solve_problem', 
            level: 2,
            name: { sv: 'Lös: Verklighetsproblem', en: 'Solve: Word Problems' }, 
            desc: { sv: 'Beräkna x utifrån en text', en: 'Calculate x from a story' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_twostep_solver',
            extractorPattern: /^(?<type>multiply|divide)\s*;\s*(?<a>\d+)\s*;\s*(?<op>[\+\-])\s*;\s*(?<b>\d+)\s*;\s*(?<c>\d+)$/
          },

          // LEVEL 3: Parenteser (Parentheses)
          { 
            key: 'paren_calc', 
            level: 3,
            name: { sv: 'Parenteser: Beräkning', en: 'Parentheses: Calculation' }, 
            desc: { sv: 'a(x + b) = c eller a(x - b) = c', en: 'a(x + b) = c or a(x - b) = c' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_parentheses',
            extractorPattern: /^(?<a>\d+)\(x\s*(?<op>[\+\-])\s*(?<b>\d+)\)\s*=\s*(?<c>\d+)$/
          },
          { key: 'paren_lie_distribution', level: 3, name: { sv: 'Hitta felet: Parentes', en: 'Find the error: Parentheses' }, desc: { sv: 'Analysera multiplikation i parentes', en: 'Analyze distribution errors' } },
          
          // LEVEL 4: X på båda sidor (X on both sides)
          { 
            key: 'bothsides_calc', 
            level: 4,
            name: { sv: 'X på båda sidor', en: 'X on both sides' }, 
            desc: { sv: 'Samla x-termer på en sida (ax + b = cx + d)', en: 'Collect x-terms on one side' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_bothsides',
            extractorPattern: /^(?<a>\d+)x\s*(?<op1>[\+\-])\s*(?<b>\d+)\s*=\s*(?<c>\d+)x\s*(?<op2>[\+\-])\s*(?<d>\d+)$/
          },
          { key: 'bothsides_concept_strategy', level: 4, name: { sv: 'X på båda sidor: Strategi', en: 'X on both sides: Strategy' }, desc: { sv: 'Håll antalet x positivt', en: 'Keep the number of x positive' } }
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
          // LEVEL 1: Talföljder (Sequences)
          { key: 'seq_lie', level: 1, name: { sv: 'Hitta felet: Talföljd', en: 'Find error: Sequence' }, desc: { sv: 'Analysera mönsterlogik', en: 'Analyze pattern logic' } },
          { key: 'seq_type', level: 1, name: { sv: 'Mönstertyp', en: 'Pattern type' }, desc: { sv: 'Aritmetisk vs Geometrisk', en: 'Arithmetic vs Geometric' } },
          { key: 'seq_diff', level: 1, name: { sv: 'Hitta differensen', en: 'Find the difference' }, desc: { sv: 'Ökning per steg', en: 'Increase per step' } },
          { key: 'seq_next', level: 1, name: { sv: 'Nästa tal', en: 'Next number' }, desc: { sv: 'Fortsätt talföljden', en: 'Continue the sequence' } },
          
          // LEVEL 2: Beräkna höga termer (High Terms)
          { 
            key: 'high_term', 
            level: 2,
            name: { sv: 'Hitta tal n', en: 'Find term n' }, 
            desc: { sv: 'Beräkna värdet långt fram', en: 'Calculate far-off values' },
            tags: ['word_problem_ready'],
            contextType: 'pattern_high_term',
            // Parses out: {s} (start value), {d} (difference value), {targetN} (target term step index)
            extractorPattern: /^(?<s>\d+)\s*;\s*(?<d>\d+)\s*;\s*(?<targetN>\d+)$/
          },

          // LEVEL 3: Visuella mönster & Formler (Visual Patterns & Formulas)
          { key: 'formula_missing', level: 3, name: { sv: 'Hitta formeln (Bild)', en: 'Find formula (Visual)' }, desc: { sv: 'Koppla bild till uttryck', en: 'Link image to expression' } },
          { 
            key: 'visual_calc', 
            level: 3,
            name: { sv: 'Beräkna antal (Bild)', en: 'Calculate count (Visual)' }, 
            desc: { sv: 'Hur många tändstickor?', en: 'How many matches?' },
            tags: ['word_problem_ready'],
            contextType: 'pattern_linear_calc',
            // Parses out: {a} (growth coefficient rate), {target} (target steps evaluation count), {b} (base value)
            extractorPattern: /^(?<a>\d+)\s*·\s*(?<target>\d+)\s*\+\s*(?<b>\d+)$/
          },
          { key: 'find_formula', level: 3, name: { sv: 'Skriv formeln', en: 'Write the formula' }, desc: { sv: 'Skapa y = kn + m', en: 'Create y = kn + m' } },

          // LEVEL 4: Tabeller till Formler (Tables to Formulas)
          { key: 'table_formula', level: 4, name: { sv: 'Tabell till Formel', en: 'Table to Formula' }, desc: { sv: 'Hitta mönster i värdetabell', en: 'Find patterns in value tables' } },
          { key: 'table_fill', level: 4, name: { sv: 'Fyll i tabell', en: 'Fill in table' }, desc: { sv: 'Använd formeln', en: 'Use the formula' } },

          // LEVEL 5: Omvänd beräkning (Reverse Engineering)
          { 
            key: 'reverse_calc', 
            level: 5,
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
          // LEVEL 1: Bestäm m-värdet
          { 
            key: 'intercept_id', 
            level: 1,
            name: { sv: 'Bestäm m-värde', en: 'Find m-value' }, 
            desc: { sv: 'Hitta var linjen korsar y-axeln på grafen', en: 'Find where the line crosses the y-axis' },
            tags: ['word_problem_ready'],
            contextType: 'graph_intercept_m',
            extractorPattern: /^(?<m>-?\d+)\s*;\s*(?<k>[\d.-]+)/
          },

          // LEVEL 2: Positiv lutning (k-värde)
          { 
            key: 'slope_pos_int', 
            level: 2,
            name: { sv: 'Positiv lutning (Heltal)', en: 'Positive Slope (Int)' }, 
            desc: { sv: 'Beräkna k-värdet för en stigande rät linje', en: 'Calculate the k-value for a rising straight line' },
            tags: ['word_problem_ready'],
            contextType: 'graph_slope_pos',
            extractorPattern: /^(?<dy>\d+)\s*;\s*(?<dx>\d+)\s*;\s*(?<kDisplay>[^;]+)/
          },
          { 
            key: 'slope_pos_frac', 
            level: 2,
            name: { sv: 'Positiv lutning (Bråk)', en: 'Positive Slope (Frac)' }, 
            desc: { sv: 'Hitta lutningen som ett bråk k = dy/dx', en: 'Find the slope as a fraction k = dy/dx' },
            tags: ['word_problem_ready'],
            contextType: 'graph_slope_pos',
            extractorPattern: /^(?<dy>\d+)\s*;\s*(?<dx>\d+)\s*;\s*(?<kDisplay>[^;]+)/
          },

          // LEVEL 3: Negativ lutning (k-värde)
          { 
            key: 'slope_neg_int', 
            level: 3,
            name: { sv: 'Negativ lutning (Heltal)', en: 'Negative Slope (Int)' }, 
            desc: { sv: 'Beräkna k-värdet för en fallande rät linje', en: 'Calculate the k-value for a falling straight line' },
            tags: ['word_problem_ready'],
            contextType: 'graph_slope_neg',
            extractorPattern: /^(?<dy>-?\d+)\s*;\s*(?<dx>\d+)\s*;\s*(?<kDisplay>[^;]+)/
          },
          { 
            key: 'slope_neg_frac', 
            level: 3,
            name: { sv: 'Negativ lutning (Bråk)', en: 'Negative Slope (Frac)' }, 
            desc: { sv: 'Bestäm fallande lutning som ett bråk', en: 'Determine falling slope as a fraction' },
            tags: ['word_problem_ready'],
            contextType: 'graph_slope_neg',
            extractorPattern: /^(?<dy>-?\d+)\s*;\s*(?<dx>\d+)\s*;\s*(?<kDisplay>[^;]+)/
          },

          // LEVEL 4: Linjens Ekvation
          { 
            key: 'eq_standard', 
            level: 4,
            name: { sv: 'Linjens ekvation', en: 'Line equation' }, 
            desc: { sv: 'Skriv fullständiga formeln y = kx + m utifrån grafen', en: 'Write the full formula y = kx + m from the graph' },
            tags: ['word_problem_ready'],
            contextType: 'graph_equation',
            extractorPattern: /^(?<k>-?\d+)\s*;\s*(?<m>-?\d+)\s*;\s*(?<eq>[^;]+)/
          },
          { 
            key: 'eq_no_m', 
            level: 4,
            name: { sv: 'Ekvation utan m', en: 'Equation without m' }, 
            desc: { sv: 'Formel för linjer som går genom origo (y = kx)', en: 'Formula for lines passing through origin (y = kx)' },
            tags: ['word_problem_ready'],
            contextType: 'graph_equation',
            extractorPattern: /^(?<k>-?\d+)\s*;\s*(?<m>-?\d+)\s*;\s*(?<eq>[^;]+)/
          },
          { 
            key: 'eq_horizontal', 
            level: 4,
            name: { sv: 'Horisontell linje', en: 'Horizontal line' }, 
            desc: { sv: 'Formel för linjer utan lutning (y = m)', en: 'Formula for lines with no slope (y = m)' },
            tags: ['word_problem_ready'],
            contextType: 'graph_equation',
            extractorPattern: /^(?<k>-?\d+)\s*;\s*(?<m>-?\d+)\s*;\s*(?<eq>[^;]+)/
          }
        ]
      },
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
          // LEVEL 1: Heltal (Whole Numbers)
          { key: 'pv_whole_value', level: 1, name: { sv: 'Heltal: Siffrans värde', en: 'Whole: Digit value' }, desc: { sv: 'Vilket värde har siffran?', en: 'What value does the digit have?' } },
          { key: 'pv_whole_digit', level: 1, name: { sv: 'Heltal: Vilken siffra', en: 'Whole: Which digit' }, desc: { sv: 'Vilken siffra står på platsen?', en: 'Which digit is in the place?' } },
          { key: 'pv_whole_build', level: 1, name: { sv: 'Heltal: Bygg talet', en: 'Whole: Build number' }, desc: { sv: 'Skriv talet utifrån beskrivning', en: 'Write number from description' } },
          
          // LEVEL 2: Decimaltal (Decimals)
          { key: 'pv_dec_value', level: 2, name: { sv: 'Decimal: Siffrans värde', en: 'Dec: Digit value' }, desc: { sv: 'Inkluderar decimaler', en: 'Includes decimals' } },
          { key: 'pv_dec_digit', level: 2, name: { sv: 'Decimal: Vilken siffra', en: 'Dec: Which digit' }, desc: { sv: 'Inkluderar decimaler', en: 'Includes decimals' } },
          { key: 'pv_dec_build', level: 2, name: { sv: 'Decimal: Bygg talet', en: 'Dec: Build number' }, desc: { sv: 'Bygg med decimaler', en: 'Build with decimals' } },
          
          // LEVEL 3: Avrundning (Rounding)
          { key: 'pv_round_whole', level: 3, name: { sv: 'Avrunda till heltal', en: 'Round to whole' }, desc: { sv: 'Avrunda tiotal, hundratal', en: 'Round tens, hundreds' } },
          { key: 'pv_round_dec', level: 3, name: { sv: 'Avrunda decimaltal', en: 'Round decimals' }, desc: { sv: 'Avrunda tiondel, hundradel', en: 'Round tenths, hundredths' } }
        ]
      },
      order_of_operations: {
        name: { sv: 'Prioriteringsregler', en: 'Order of Operations' },
        variations: [
          // LEVEL 1: Grundläggande regler (Basic)
          { key: 'order_basic', level: 1, name: { sv: 'Prioritering: Grund', en: 'Order: Basic' }, desc: { sv: 'Mult/Div före Add/Sub', en: 'Mult/Div before Add/Sub' } },
          
          // LEVEL 2: Parenteser (Parentheses)
          { key: 'order_paren', level: 2, name: { sv: 'Prioritering: Parenteser', en: 'Order: Parentheses' }, desc: { sv: 'Räkna ut parentesen först', en: 'Solve parentheses first' } },
          
          // LEVEL 3: Bråkstreck som gruppering (Fractions)
          { key: 'order_fraction', level: 3, name: { sv: 'Prioritering: Bråkstreck', en: 'Order: Fraction Bar' }, desc: { sv: 'Täljaren fungerar som en parentes', en: 'Numerator acts as a parenthesis' } },
          
          // LEVEL 4: Potenser (Powers)
          { key: 'order_powers', level: 4, name: { sv: 'Prioritering: Potenser', en: 'Order: Powers' }, desc: { sv: 'Parenteser > Potenser > Mult/Div', en: 'Paren > Powers > Mult/Div' } }
        ]
      },
      negatives: {
        name: { sv: 'Negativa Tal', en: 'Negative Numbers' },
        variations: [
          // LEVEL 1: Grunder (Foundations)
          { key: 'theory_number_line', level: 1, name: { sv: 'Tallinjen', en: 'Number line' }, desc: { sv: 'Positionering', en: 'Positioning' } },
          { key: 'theory_sign_dominance', level: 1, name: { sv: 'Teckenregler', en: 'Sign rules' }, desc: { sv: 'Blir svaret plus eller minus?', en: 'Positive or negative result?' } },
          { key: 'theory_spot_lie', level: 1, name: { sv: 'Hitta felet: Negativa', en: 'Find error: Negatives' }, desc: { sv: 'Vanliga missuppfattningar', en: 'Common misconceptions' } },
          
          // LEVEL 2: Addition & Subtraktion (Add/Sub Fluency)
          { 
            key: 'fluency_chain_4', 
            level: 2,
            name: { sv: 'Add/Sub Kedja (4)', en: 'Add/Sub Chain (4)' }, 
            desc: { sv: 'Flerstegsräkning', en: 'Multi-step calculation' },
            tags: ['word_problem_ready'],
            contextType: 'neg_add_sub_chain',
            extractorPattern: /^(?<valA>\(-?\d+\)|-?\d+)\s*\+\s*(?<valB>\(-?\d+\)|-?\d+)\s*-\s*(?<valC>\(-?\d+\)|-?\d+)\s*\+\s*(?<valD>\(-?\d+\)|-?\d+)$/
          },
          { 
            key: 'fluency_chain_5', 
            level: 2,
            name: { sv: 'Add/Sub Kedja (5)', en: 'Add/Sub Chain (5)' }, 
            desc: { sv: 'Långa uttryck', en: 'Long expressions' },
            tags: ['word_problem_ready'],
            contextType: 'neg_double_minus',
            extractorPattern: /^(?<valA>-?\d+)\s*-\s*\(-(?<valB>\d+)\)$/
          },
          { 
            key: 'fluency_double_neg', 
            level: 2,
            name: { sv: 'Dubbla minustecken', en: 'Double negative signs' }, 
            desc: { sv: '-(-a) = +a', en: '-(-a) = +a' },
            tags: ['word_problem_ready'],
            contextType: 'neg_double_minus',
            extractorPattern: /^(?<valA>-?\d+)\s*-\s*\(-(?<valB>\d+)\)$/
          },
          { 
            key: 'fluency_plus_neg', 
            level: 2,
            name: { sv: 'Plus minus', en: 'Plus minus' }, 
            desc: { sv: '+(-a) = -a', en: '+(-a) = -a' },
            tags: ['word_problem_ready'],
            contextType: 'neg_double_minus',
            extractorPattern: /^(?<valA>-?\d+)\s*-\s*\(-(?<valB>\d+)\)$/
          },
          { key: 'fluency_transform_match', level: 2, name: { sv: 'Matcha uttryck', en: 'Match expressions' }, desc: { sv: 'Olika skrivsätt', en: 'Different notations' } },
          
          // LEVEL 3: Multiplikation (Multiplication)
          { 
            key: 'mult_same_sign', 
            level: 3,
            name: { sv: 'Multiplikation: Lika tecken', en: 'Multiplication: Same Sign' }, 
            desc: { sv: 'Multiplikation med lika tecken', en: 'Multiply with same signs' },
            tags: ['word_problem_ready'],
            contextType: 'neg_multiplication', 
            extractorPattern: /^(?<valA>-?\d+)\s*(?<op>\*)\s*(?<valB>-?\d+)$/
          },
          { 
            key: 'mult_diff_sign', 
            level: 3,
            name: { sv: 'Multiplikation: Olika tecken', en: 'Multiplication: Diff Sign' },
            desc: { sv: 'Multiplicera med olika tecken', en: 'Multiply with different signs' },
            tags: ['word_problem_ready'],
            contextType: 'neg_multiplication',
            extractorPattern: /^(?<valA>-?\d+)\s*(?<op>\*)\s*(?<valB>-?\d+)$/
          },
          { 
            key: 'mult_inverse_missing', 
            level: 3,
            name: { sv: 'Mult: Saknad faktor', en: 'Mult: Missing factor' }, 
            desc: { sv: 'a * ? = b', en: 'a * ? = b' },
            tags: ['word_problem_ready'],
            contextType: 'neg_multiplication',
            extractorPattern: /^(?<valA>\(-?\d+\)|-?\d+)\s*·\s*(?<valB>\(-?\d+\)|-?\d+)$/
          },
          { 
            key: 'mult_chain', 
            level: 3,
            name: { sv: 'Mult: Kedja', en: 'Mult: Chain' }, 
            desc: { sv: 'Jämnt/Udda antal minus', en: 'Even/Odd number of minuses' },
            tags: ['word_problem_ready'],
            contextType: 'neg_mult_chain',
            extractorPattern: /^(?<valA>\(-?\d+\)|-?\d+)\s*·\s*(?<valB>\(-?\d+\)|-?\d+)\s*·\s*(?<valC>\(-?\d+\)|-?\d+)$/
          },
          
          // LEVEL 4: Division (Division)
          { 
            key: 'div_same_sign', 
            level: 4,
            name: { sv: 'Division: Samma tecken', en: 'Division: Same signs' }, 
            desc: { sv: 'Svaret blir positivt', en: 'Answer is positive' },
            tags: ['word_problem_ready'],
            contextType: 'neg_division',
            extractorPattern: /\\frac\{(?<valA>-?\d+)\}\{(?<valB>-?\d+)\}/
          },
          { 
            key: 'div_diff_sign', 
            level: 4,
            name: { sv: 'Division: Olika tecken', en: 'Division: Different signs' }, 
            desc: { sv: 'Svaret blir negativt', en: 'Answer is negative' },
            tags: ['word_problem_ready'],
            contextType: 'neg_division',
            extractorPattern: /\\frac\{(?<valA>-?\d+)\}\{(?<valB>-?\d+)\}/
          },
          { key: 'div_check_logic', level: 4, name: { sv: 'Division: Kontroll', en: 'Division: Checking' }, desc: { sv: 'Använd multiplikation', en: 'Use multiplication' } },
          
          // LEVEL 6: Prioriteringsregler (Order of Operations)
          { 
            key: 'neg_order_frac_basic', 
            level: 6,
            name: { sv: 'Prioritering: Bråk & Mult', en: 'Order: Fractions & Mult' }, 
            desc: { sv: 'Räkna ut täljaren först (inkluderar multiplikation)', en: 'Calculate numerator first (includes multiplication)' },
            tags: ['word_problem_ready'],
            contextType: 'neg_order_ops',
            extractorPattern: /\\frac\{(?<a>-?\d+)\s*\+\s*(?<b>-?\d+)\s*\\cdot\s*(?<c>-?\d+)\}\{(?<d>-?\d+)\}/
          },
          { 
            key: 'neg_order_frac_paren', 
            level: 6,
            name: { sv: 'Prioritering: Bråk & Parentes', en: 'Order: Fractions & Parentheses' }, 
            desc: { sv: 'Räkna ut parentesen i täljaren först', en: 'Calculate parentheses in numerator first' },
            tags: ['word_problem_ready'],
            contextType: 'neg_order_ops',
            extractorPattern: /\\frac\{(?<a>-?\d+)\s*\\cdot\s*\((?<b>-?\d+)\s*\+\s*(?<c>-?\d+)\)\}\{(?<d>-?\d+)\}/
          }
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
          // LEVEL 1: Koncept och Bildstöd (Concepts & Visuals)
          { key: 'visual_translation', level: 1, name: { sv: 'Bild till Procent', en: 'Visual to Percent' }, desc: { sv: 'Tolka figurer', en: 'Interpret figures' } },
          { key: 'visual_lie', level: 1, name: { sv: 'Hitta felet: Bild', en: 'Find error: Visual' }, desc: { sv: 'Visuell analys', en: 'Visual analysis' } },
          { key: 'equivalence', level: 1, name: { sv: 'Decimal-Procent', en: 'Decimal-Percent' }, desc: { sv: 'Samband', en: 'Relationships' } },
          { key: 'equivalence_basic_frac', level: 1, name: { sv: 'Basfakta: Bråk till %', en: 'Basic Facts: Fraction to %' }, desc: { sv: 'Ex: 1/4 = 25%', en: 'Ex: 1/4 = 25%' } },
          { key: 'equivalence_basic_dec', level: 1, name: { sv: 'Basfakta: Decimal till %', en: 'Basic Facts: Decimal to %' }, desc: { sv: 'Ex: 0,2 = 20%', en: 'Ex: 0.2 = 20%' } },
          
          // LEVEL 2: Huvudräkning och Referenser (Mental Math & Benchmarks)
          {
            key: 'benchmark_calc',
            level: 2,
            name: { sv: 'Huvudräkning (Bas)', en: 'Mental Math (Basic)' },
            desc: { sv: '10%, 25%, 50%', en: '10%, 25%, 50%' },
            tags: ['word_problem_ready'],
            contextType: 'percent_of_amount',
            extractorPattern: /^(?<pct>\d+)\\%\\s*\\cdot\\s*(?<base>\d+)/
          },
          {
            key: 'benchmark_inverse',
            level: 2,
            name: { sv: 'Om x är.. Vad blir 100%', en: 'If x is ... What is 100%' },
            desc: { sv: 'Om 10% är 5, vad är allt?', en: 'If 10% is 5, what is total?' },
            tags: ['word_problem_ready'],
            contextType: 'percent_base_part',
            extractorPattern: /^(?<pct>\d+)\\%\\s*=\\s*(?<part>\d+)/
          },
          { key: 'benchmark_commutative', level: 2, name: { sv: 'Kommutativa lagen', en: 'Commutative property' }, desc: { sv: 'A% av B = B% av A', en: 'A% of B = B% of A' } },

          // LEVEL 3: Byggstenar & Beräkningar (Building Blocks & Calculations)
          {
            key: 'composition',
            level: 3,
            name: { sv: 'Beräkna 30, 40...90%', en: 'Calculate 30, 40...90%' },
            desc: { sv: 'Procent: Tiotal', en: 'Percent: Even 10s' },
            tags: ['word_problem_ready'],
            contextType: 'percent_of_amount',
            extractorPattern: /^(?<pct>\d+)\\%\\s*\\cdot\\s*(?<base>\d+)/
          },
          { key: 'decomposition', level: 3, name: { sv: 'Beräkna (5%)', en: 'Calculate (5%)' }, desc: { sv: 'Använd 10% för att hitta 5%', en: 'Use 10% to find 5%' } },
          { key: 'estimation', level: 3, name: { sv: 'Uppskatta procent', en: 'Estimate percent' }, desc: { sv: 'Ungefärlig beräkning', en: 'Approximate calculation' } },
          { 
            key: 'calc_any_percent', 
            level: 3,
            name: { sv: 'Beräkna delen', en: 'Calculate part of a whole' }, 
            desc: { sv: 'Beräkna delen med procent och det hela', en: 'Calculate a part using percent and the total' }, 
            tags: ['word_problem_ready'], 
            contextType: 'percent_of_amount', 
            extractorPattern: /^(?<pct>\d+)\s*%\s*av\s*(?<base>\d+)$/i 
          },

          // LEVEL 4: Andelen & Procentekvationen (The Percent Equation)
          { key: 'find_percent_basic', level: 4, name: { sv: 'Andelen (Grund)', en: 'Find Percent (Basic)' }, desc: { sv: 'Hur många procent?', en: 'How many percent?' } },
          {
            key: 'find_percent_test',
            level: 4,
            name: { sv: 'Andelen (Prov)', en: 'Find Percent (Test)' },
            desc: { sv: 'Delen / Hela', en: 'Part / Whole' },
            tags: ['word_problem_ready'],
            contextType: 'percent_find_rate',
            extractorPattern: /\\frac\{(?<part>\d+)\}\{(?<whole>\d+)\}/
          },
          {
            key: 'find_percent_discount',
            level: 4,
            name: { sv: 'Andelen (Rabatt)', en: 'Percent: Discount' },
            desc: { sv: 'Beräkna andelen', en: 'Calculate share' },
            tags: ['word_problem_ready'],
            contextType: 'percent_find_rate',
            extractorPattern: /\\frac\{(?<part>\d+)\}\{(?<whole>\d+)\}/
          },
          { key: 'find_percent_group', level: 4, name: { sv: 'Andelen (Grupp)', en: 'Percent: Group' }, desc: { sv: 'Andel av en grupp', en: 'Share of a group' } },

          // LEVEL 5: Omvända Procentproblem (Reverse Percentage)
          {
            key: 'reverse_find_whole',
            level: 5,
            name: { sv: 'Det hela', en: 'Find the whole' },
            desc: { sv: 'Beräkna hela summan', en: 'Calculate total sum' },
            tags: ['word_problem_ready'],
            contextType: 'percent_base_part',
            extractorPattern: /^(?<pct>\d+)\\%\\s*=\\s*(?<part>\d+)/
          },
          { key: 'reverse_scaling', level: 5, name: { sv: 'Det hela (Skalning)', en: 'Find whole (Scaling)' }, desc: { sv: 'Skala upp till 100%', en: 'Scale up to 100%' } },
          { key: 'reverse_concept', level: 5, name: { sv: 'Koncept: Det hela', en: 'Concept: The whole' }, desc: { sv: 'Förstå samband', en: 'Understand relationship' } },

          // LEVEL 6: Procentuell Förändring (Percentage Change)
          { 
            key: 'change_calc', 
            level: 6,
            name: { sv: 'Beräkna förändring', en: 'Calculate change' }, 
            desc: { sv: 'Skillnad / Ursprung', en: 'Difference / Original' },
            tags: ['word_problem_ready'],
            contextType: 'value_delta',
            extractorPattern: /\\frac\{(?<diff>\d+)\}\{(?<oldV>\d+)\}/
          },
          { key: 'change_multiplier', level: 6, name: { sv: 'Förändringsfaktor', en: 'Change Factor' }, desc: { sv: '1,0 +/- %', en: '1.0 +/- %' } },
          { key: 'change_trap', level: 6, name: { sv: 'Hitta felet: Förändring', en: 'Find error: Change' }, desc: { sv: 'Vanliga misstag vid %-förändring', en: 'Common mistakes in % change' } }
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
          // LEVEL 1: Längd (Length) - Uses 'len_' prefix
          { 
            key: 'len_basic', 
            level: 1, 
            name: { sv: 'Längd: Heltal', en: 'Length: Whole numbers' }, 
            desc: { sv: 'Omvandla m, dm, cm, mm (inga decimaler)', en: 'Convert m, dm, cm, mm (no decimals)' },
            tags: ['word_problem_ready'],
            contextType: 'units_length',
            extractorPattern: /^(?<val>\d+)\s*;\s*(?<fromUnit>[a-z]+)\s*;\s*(?<toUnit>[a-z]+)/
          },
          { 
            key: 'len_decimals', 
            level: 1, 
            name: { sv: 'Längd: Decimaler', en: 'Length: Decimals' }, 
            desc: { sv: 'Omvandla längd med decimaltal', en: 'Convert length with decimal numbers' },
            tags: ['word_problem_ready'],
            contextType: 'units_length_dec',
            extractorPattern: /^(?<val>[\d,.]+)\s*;\s*(?<fromUnit>[a-z]+)\s*;\s*(?<toUnit>[a-z]+)/
          },
          { key: 'len_km_m', level: 1, name: { sv: 'Längd: km till m', en: 'Length: km to m' }, desc: { sv: 'Stora avstånd', en: 'Large distances' } },
          { key: 'len_concept', level: 1, name: { sv: 'Välj rätt enhet (Längd)', en: 'Choose unit (Length)' }, desc: { sv: 'Är en penna 15 m eller 15 cm?', en: 'Is a pencil 15 m or 15 cm?' } },

          // LEVEL 2: Vikt (Weight) - Uses 'weight_' prefix
          { 
            key: 'weight_basic', 
            level: 2, 
            name: { sv: 'Vikt: Heltal', en: 'Weight: Whole numbers' }, 
            desc: { sv: 'Omvandla kg, hg, g', en: 'Convert kg, hg, g' },
            tags: ['word_problem_ready'],
            contextType: 'units_weight',
            extractorPattern: /^(?<val>\d+)\s*;\s*(?<fromUnit>[a-z]+)\s*;\s*(?<toUnit>[a-z]+)/
          },
          { 
            key: 'weight_decimals', 
            level: 2, 
            name: { sv: 'Vikt: Decimaler', en: 'Weight: Decimals' }, 
            desc: { sv: 'Omvandla vikt med decimaltal', en: 'Convert weight with decimals' },
            tags: ['word_problem_ready'],
            contextType: 'units_weight_dec',
            extractorPattern: /^(?<val>[\d,.]+)\s*;\s*(?<fromUnit>[a-z]+)\s*;\s*(?<toUnit>[a-z]+)/
          },
          { key: 'weight_ton_kg', level: 2, name: { sv: 'Vikt: Ton till kg', en: 'Weight: Ton to kg' }, desc: { sv: 'Stora vikter', en: 'Large weights' } },
          { key: 'weight_concept', level: 2, name: { sv: 'Välj rätt enhet (Vikt)', en: 'Choose unit (Weight)' }, desc: { sv: 'Väger en bil 1,5 kg eller 1,5 ton?', en: 'Does a car weigh 1.5 kg or 1.5 tons?' } },

          // LEVEL 3: Volym (Volume) - Uses 'vol_' prefix
          { 
            key: 'vol_basic', 
            level: 3, 
            name: { sv: 'Volym: Heltal', en: 'Volume: Whole numbers' }, 
            desc: { sv: 'Omvandla liter, dl, cl, ml', en: 'Convert liters, dl, cl, ml' },
            tags: ['word_problem_ready'],
            contextType: 'units_volume',
            extractorPattern: /^(?<val>\d+)\s*;\s*(?<fromUnit>[a-z]+)\s*;\s*(?<toUnit>[a-z]+)/
          },
          { 
            key: 'vol_decimals', 
            level: 3, 
            name: { sv: 'Volym: Decimaler', en: 'Volume: Decimals' }, 
            desc: { sv: 'Omvandla volym med decimaltal', en: 'Convert volume with decimals' },
            tags: ['word_problem_ready'],
            contextType: 'units_volume_dec',
            extractorPattern: /^(?<val>[\d,.]+)\s*;\s*(?<fromUnit>[a-z]+)\s*;\s*(?<toUnit>[a-z]+)/
          },
          { key: 'vol_concept', level: 3, name: { sv: 'Välj rätt enhet (Volym)', en: 'Choose unit (Volume)' }, desc: { sv: 'Rymmer ett glas 2 liter eller 2 dl?', en: 'Does a glass hold 2 liters or 2 dl?' } }
        ]
      },
      geometry: {
        name: { sv: 'Area & Omkrets', en: 'Area & Perimeter' },
        variations: [
          // LEVEL 1: Omkrets (Perimeter Basic)
          {
            key: "perimeter_square",
            level: 1,
            name: { sv: "Omkrets: Kvadrat", en: "Perimeter: Square" },
            desc: { sv: "Beräkna omkretsen av en kvadrat utifrån en känd sida", en: "Calculate the perimeter of a square from a known side length" },
            tags: ["word_problem_ready"],
            contextType: "geom_perimeter_square",
            extractorPattern: /4\s*(?:\\cdot|·)\s*(?<s>\d+)/i
          },
          { key: 'perimeter_rect', level: 1, name: { sv: 'Omkrets: Rektangel', en: 'Perimeter: Rectangle' }, desc: { sv: '2b + 2h', en: '2w + 2h' } },
          { key: 'perimeter_parallel', level: 1, name: { sv: 'Omkrets: Parallellogram', en: 'Perimeter: Parallelogram' }, desc: { sv: 'Samma som rektangel', en: 'Same as rectangle' } },
          {
            key: "perimeter_inverse",
            level: 1,
            name: { sv: "Omkrets: Omvänd rektangel", en: "Perimeter: Inverse Rectangle" },
            desc: { sv: "Hitta den saknade höjden i en rektangel utifrån omkrets och bas", en: "Find the missing height of a rectangle using perimeter and base" },
            tags: ["word_problem_ready"],
            contextType: "geom_perimeter_inverse",
            extractorPattern: /P\s*=\s*(?<p>\d+)\s*,\s*b\s*=\s*(?<b>\d+)/i
          },
          { key: 'perimeter_lie', level: 1, name: { sv: 'Hitta felet: Omkrets', en: 'Find error: Perimeter' }, desc: { sv: 'Vanliga misstag vid omkrets', en: 'Common perimeter mistakes' } },

          // LEVEL 2: Area (Area Basic)
          { key: 'area_square', level: 2, name: { sv: 'Area: Kvadrat', en: 'Area: Square' }, desc: { sv: 's * s', en: 's * s' } },
          {
            key: "area_rect",
            level: 2,
            name: { sv: "Area: Rektangel & Parallellogram", en: "Area: Rectangle & Parallelogram" },
            desc: { sv: "Beräkna ytan på en fyrhörning genom basen gånger höjden", en: "Calculate the surface area of a quadrilateral using base times height" },
            tags: ["word_problem_ready"],
            contextType: "geom_area_quad",
            extractorPattern: /(?<b>\d+)\s*(?:\\cdot|·)\s*(?<h>\d+)/i
          },
          { key: 'area_parallel', level: 2, name: { sv: 'Area: Parallellogram', en: 'Area: Parallelogram' }, desc: { sv: 'Vinkelrät höjd', en: 'Perpendicular height' } },
          { key: 'area_inverse', level: 2, name: { sv: 'Area: Omvänd', en: 'Area: Inverse' }, desc: { sv: 'Hitta saknad sida från area', en: 'Find missing side from area' } },
          { key: 'area_trap', level: 2, name: { sv: 'Area: Parallelltrapets', en: 'Area: Trapezoid' }, desc: { sv: '((a+b)*h)/2', en: '((a+b)*h)/2' } },

          // LEVEL 3: Trianglar (Triangles)
          {
            key: "area_triangle",
            level: 3,
            name: { sv: "Area: Triangel", en: "Area: Triangle" },
            desc: { sv: "Beräkna triangelns area genom basen gånger höjden delat på två", en: "Calculate triangle area using base times height divided by two" },
            tags: ["word_problem_ready"],
            contextType: "geom_area_triangle",
            extractorPattern: /(?<base>\d+)\s*(?:\\cdot|·)\s*(?<height>\d+)\s*=\s*\d+/i
          },
          { key: 'inverse_triangle', level: 3, name: { sv: 'Triangel: Omvänd', en: 'Triangle: Inverse' }, desc: { sv: 'Hitta bas/höjd från area', en: 'Find base/height from area' } },
          { key: 'perimeter_triangle_right', level: 3, name: { sv: 'Omkrets: Rätvinklig triangel', en: 'Perimeter: Right triangle' }, desc: { sv: 'Summa av sidor', en: 'Sum of sides' } },
          { key: 'perimeter_triangle_iso', level: 3, name: { sv: 'Omkrets: Likbent triangel', en: 'Perimeter: Isosceles triangle' }, desc: { sv: 'Två lika sidor', en: 'Two equal sides' } },
          { key: 'perimeter_triangle_scalene', level: 3, name: { sv: 'Omkrets: Oliksidig triangel', en: 'Perimeter: Scalene triangle' }, desc: { sv: 'Tre olika sidor', en: 'Three different sides' } },

          // LEVEL 4: Sammansatta Figurer (Combined Figures)
          { key: 'combined_rect_tri', level: 4, name: { sv: 'Area: Sammansatt Rekt+Tri', en: 'Area: Comp. Rect+Tri' }, desc: { sv: 'Addera delarna', en: 'Add the parts' } },
          {
            key: "combined_l_shape",
            level: 4,
            name: { sv: "Area: L-formad figur", en: "Area: L-Shaped Figure" },
            desc: { sv: "Dela upp en sammansatt vinkelformad yta i två rektanglar", en: "Divide a composite L-shaped area into two separate rectangles" },
            tags: ["word_problem_ready"],
            contextType: "geom_area_l_shape",
            extractorPattern: /vertikala rektangeln[\s\S]*?(?<vW>\d+)\s*·\s*(?<vH>\d+)[\s\S]*horisontella rektangeln[\s\S]*?(?<hW>\d+)\s*·\s*(?<hH>\d+)/i
          },
          { key: 'combined_house', level: 4, name: { sv: 'Sammansatt: Hus', en: 'Combined: House' }, desc: { sv: 'Kvadrat och triangel', en: 'Square and triangle' } },

          // LEVEL 5: Cirklar (Circles)
          {
            key: "circle_area",
            level: 5,
            name: { sv: "Area: Cirkel", en: "Area: Circle" },
            desc: { sv: "Beräkna cirkelns yta utifrån radie eller diameter", en: "Calculate the area of a circle using radius or diameter" },
            tags: ["word_problem_ready"],
            contextType: "geom_area_circle",
            extractorPattern: /3,14\s*·\s*(?<r>\d+)\s*\^2/i
          },
          { key: 'circle_perimeter', level: 5, name: { sv: 'Omkrets: Cirkel', en: 'Perimeter: Circle' }, desc: { sv: 'pi*diameter', en: 'pi*diameter' } },
          { key: 'semicircle_area', level: 5, name: { sv: 'Area: Halvcirkel', en: 'Area: Semicircle' }, desc: { sv: 'Hälften av pi*r^2', en: 'Half of pi*r^2' } },
          { key: 'semicircle_perimeter', level: 5, name: { sv: 'Omkrets: Halvcirkel', en: 'Perimeter: Semicircle' }, desc: { sv: 'Båge + Diameter', en: 'Arc + Diameter' } },
          { key: 'area_quarter', level: 5, name: { sv: 'Area: Kvartscirkel', en: 'Area: Quarter circle' }, desc: { sv: 'Area av 1/4 cirkel', en: 'Area of 1/4 circle' } },
          { key: 'perimeter_quarter', level: 5, name: { sv: 'Omkrets: Kvartscirkel', en: 'Perimeter: Quarter circle' }, desc: { sv: 'Båge + 2 Radier', en: 'Arc + 2 Radii' } },

          // LEVEL 6: Avancerade Sammansatta Figurer (Composite Advanced)
          { key: 'perimeter_house', level: 6, name: { sv: 'Omkrets: Hus', en: 'Perimeter: House' }, desc: { sv: 'Rektangel + Triangel', en: 'Rectangle + Triangle' } },
          { key: 'perimeter_portal', level: 6, name: { sv: 'Omkrets: Portal', en: 'Perimeter: Portal' }, desc: { sv: 'Rektangel + Halvcirkel', en: 'Rectangle + Semicircle' } },
          {
            key: "area_house",
            level: 6,
            name: { sv: "Area: Sammansatt Hus", en: "Area: Composite House" },
            desc: { sv: "Avancerad area genom att addera en hussida med ett triangulärt tak", en: "Advanced area by adding a rectangular wall base with a triangular roof" },
            tags: ["word_problem_ready"],
            contextType: "geom_area_house",
            extractorPattern: /rektangelns yta[\s\S]*?(?<w>\d+)\s*·\s*(?<h>\d+)[\s\S]*triangelns yta[\s\S]*?hr:\s*(?<hr>\d+)/i
          },
          { key: 'area_portal', level: 6, name: { sv: 'Area: Portal', en: 'Area: Portal' }, desc: { sv: 'Rektangel + Halvcirkel', en: 'Rectangle + Semicircle' } }
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
          // LEVEL 1: Kvadrater & Rötter (Squares & Roots)
          { key: 'sqrt_calc', level: 1, name: { sv: 'Kvadratrot', en: 'Square root' }, desc: { sv: 'Beräkning', en: 'Calculation' } },
          { key: 'square_calc', level: 1, name: { sv: 'Kvadrat', en: 'Square' }, desc: { sv: 'Tal i kvadrat', en: 'Number squared' } },
          { key: 'missing_square', level: 1, name: { sv: 'Invers kvadrat', en: 'Inverse square' }, desc: { sv: 'x^2 = a', en: 'x^2 = a' } },
          { key: 'sqrt_estimation', level: 1, name: { sv: 'Uppskatta rot', en: 'Estimate root' }, desc: { sv: 'Ja/Nej frågor', en: 'Yes/No questions' } },

          // LEVEL 2: Hypotenusan (The Hypotenuse)
          { 
            key: 'hyp_visual', 
            level: 2,
            name: { sv: 'Beräkna hypotenusa', en: 'Calculate hypotenuse' }, 
            desc: { sv: 'Sök den längsta sidan utifrån kateterna', en: 'Find longest side given the two legs' },
            tags: ['word_problem_ready'],
            contextType: 'pyth_hypotenuse',
            extractorPattern: /^(?<a>\d+)\s*;\s*(?<b>\d+)\s*;\s*(?<c>\d+)/
          },
          { key: 'hyp_equation', level: 2, name: { sv: 'Ekvation: Hypotenusa', en: 'Equation: Hypotenuse' }, desc: { sv: 'Rätt uppställning', en: 'Correct setup' } },
          { key: 'hyp_error', level: 2, name: { sv: 'Hitta felet: Hypotenusa', en: 'Find error: Hypotenuse' }, desc: { sv: 'Identifiera felaktig uppställning', en: 'Identify incorrect setup' } },

          // LEVEL 3: Kateterna (The Legs)
          { 
            key: 'leg_visual', 
            level: 3,
            name: { sv: 'Beräkna katet', en: 'Calculate leg' }, 
            desc: { sv: 'Hitta en kort sida med subtraktion', en: 'Find a shorter side using subtraction' },
            tags: ['word_problem_ready'],
            contextType: 'pyth_leg',
            extractorPattern: /^(?<a>\d+)\s*;\s*(?<b>\d+)\s*;\s*(?<c>\d+)/
          },
          { key: 'leg_concept', level: 3, name: { sv: 'Koncept: Katet', en: 'Concept: Leg' }, desc: { sv: 'Subtraktion krävs', en: 'Subtraction required' } },
          { key: 'leg_text', level: 3, name: { sv: 'Textproblem: Katet', en: 'Word problem: Leg' }, desc: { sv: 'Hitta katet i text', en: 'Find leg in text context' } },

          // LEVEL 4: Tillämpningar (Applications)
          { key: 'app_ladder', level: 4, name: { sv: 'Problem: Stegen', en: 'Problem: The Ladder' }, desc: { sv: 'Lutande stege', en: 'Leaning ladder' } },
          { 
            key: 'app_diagonal', 
            level: 4,
            name: { sv: 'Rektangelns diagonal', en: 'Rectangle diagonal' }, 
            desc: { sv: 'Räkna ut sträckan tvärs över en rektangel', en: 'Calculate path across a rectangle' },
            tags: ['word_problem_ready'],
            contextType: 'pyth_diagonal',
            extractorPattern: /^(?<a>\d+)\s*;\s*(?<b>\d+)\s*;\s*(?<c>\d+)/
          },
          { key: 'app_displacement', level: 4, name: { sv: 'Fågelvägen', en: 'Displacement' }, desc: { sv: 'Avstånd mellan punkter', en: 'Distance between points' } },
          { key: 'app_guy_wire', level: 4, name: { sv: 'Problem: Vajer', en: 'Problem: Guy wire' }, desc: { sv: 'Stödvajer till mast', en: 'Support wire to a mast' } },
          { key: 'app_coords', level: 4, name: { sv: 'Koordinater', en: 'Coordinates' }, desc: { sv: 'Avstånd i koordinatsystem', en: 'Distance in coordinate system' } },

          // LEVEL 5: Omvända Pythagoras sats (The Converse)
          { key: 'conv_check', level: 5, name: { sv: 'Rätvinklig?', en: 'Right-angled?' }, desc: { sv: 'Kontrollera satsen', en: 'Check the theorem' } },
          { key: 'conv_missing', level: 5, name: { sv: 'Hitta saknad vinkel', en: 'Find missing angle' }, desc: { sv: 'Använd satsen baklänges', en: 'Use theorem backwards' } },
          { key: 'conv_trap', level: 5, name: { sv: 'Logisk fälla', en: 'Logic trap' }, desc: { sv: 'Synvilla vs matematik', en: 'Optical illusion vs math' } },

          // LEVEL 6: Blandade & Avancerade problem (Advanced Mixed)
          { key: 'advanced_mixed', level: 6, name: { sv: 'Blandade problem', en: 'Mixed problems' }, desc: { sv: 'Blandade svåra problem', en: 'Mixed advanced problems' } }
        ]
      },
      similarity: {
        name: { sv: 'Likformighet', en: 'Similarity' },
        variations: [
          // LEVEL 1: Koncept och Kontroll (Concepts & Checks)
          { key: 'sim_rect_check', level: 1, name: { sv: 'Likformig rektangel', en: 'Similar rectangle' }, desc: { sv: 'Är de likformiga?', en: 'Are they similar?' } },
          { key: 'sim_tri_angle_check', level: 1, name: { sv: 'Trianglar (Vinklar)', en: 'Triangles (Angles)' }, desc: { sv: 'Kontrollera likformighet via vinklar', en: 'Check similarity via angles' } },
          { key: 'sim_tri_side_check', level: 1, name: { sv: 'Trianglar (Sidor)', en: 'Triangles (Sides)' }, desc: { sv: 'Kontrollera likformighet via sidor', en: 'Check similarity via sides' } },
          { key: 'sim_concept_lie', level: 1, name: { sv: 'Hitta felet: Likformighet', en: 'Find error: Similarity' }, desc: { sv: 'Analysera konceptuella påståenden', en: 'Analyze conceptual statements' } },

          // LEVEL 2: Beräkning av Sidor (Calculate Sides)
          { 
            key: 'sim_calc_big', 
            level: 2, 
            name: { sv: 'Beräkna stor sida', en: 'Calculate large side' }, 
            desc: { sv: 'Använd skalfaktor uppåt', en: 'Use scale factor upwards' } 
          },
          { 
            key: 'sim_calc_small', 
            level: 2, 
            name: { sv: 'Beräkna liten sida', en: 'Calculate small side' }, 
            desc: { sv: 'Använd skalfaktor nedåt', en: 'Use scale factor downwards' } 
          },
          { 
            key: 'sim_find_k', 
            level: 2, 
            name: { sv: 'Bestäm skalfaktor', en: 'Determine scale factor' }, 
            desc: { sv: 'Hitta k utifrån två kända sidor', en: 'Find k from two known sides' } 
          },

          // LEVEL 3: Topptriangelsatsen & Transversalsatsen (Top Triangle & Transversals)
          { 
            key: 'transversal_total', 
            level: 3, 
            name: { sv: 'Topptriangelsatsen', en: 'Top Triangle Theorem' }, 
            desc: { sv: 'Beräkna totala längder', en: 'Calculate total lengths' } 
          },
          { 
            key: 'transversal_extension', 
            level: 3, 
            name: { sv: 'Transversalsatsen', en: 'Transversal Theorem' }, 
            desc: { sv: 'Beräkna delsträckor', en: 'Calculate partial lengths' } 
          }
        ]
      },
      scale: {
        name: { sv: 'Skala', en: 'Scale' },
        variations: [
          // LEVEL 1: Koncept & Teori (Concepts)
          { key: 'concept_lie', level: 1, name: { sv: 'Hitta felet: Skala', en: 'Find error: Scale' }, desc: { sv: 'Analysera påstående', en: 'Analyze statement' } },
          { key: 'concept_match', level: 1, name: { sv: 'Begrepp: Matcha', en: 'Concept: Match' }, desc: { sv: 'Matcha skala till bild', en: 'Match scale to image' } },

          // LEVEL 2: Linjär beräkning & Grund (Linear Fluency)
          { key: 'find_scale', level: 2, name: { sv: 'Bestäm skalan', en: 'Determine scale' }, desc: { sv: '1:X form', en: '1:X form' } },
          { 
            key: 'calc_real', 
            level: 2,
            name: { sv: 'Beräkna verklighet', en: 'Calculate reality' },
            desc: { sv: 'Hitta det verkliga måttet', en: 'Find the real measure' },
            tags: ['word_problem_ready'],
            contextType: 'scale_calc_real',
            extractorPattern: /^(?<scale>\d+)\s*;\s*(?<imgCm>\d+)\s*;\s*(?<ans>\d+)/
          },
          { 
            key: 'calc_image', 
            level: 2,
            name: { sv: 'Beräkna ritning', en: 'Calculate drawing' },
            desc: { sv: 'Hitta måttet på bilden', en: 'Find the image measure' },
            tags: ['word_problem_ready'],
            contextType: 'scale_linear_image',
            extractorPattern: /^(?<scale>\d+)\s*;\s*(?<realCm>\d+)\s*;\s*(?<imgCm>\d+)/
          },
          { key: 'calc_magnification', level: 2, name: { sv: 'Beräkna förstoring', en: 'Calculate magnification' }, desc: { sv: 'Hitta måttet vid förstoring', en: 'Find magnified measure' } },

          // LEVEL 3: Blandade scenarier (Mixed Scenarios)
          { 
            key: 'map_real', 
            level: 3,
            name: { sv: 'Karta: Verklighet', en: 'Map: Reality' },
            desc: { sv: 'Beräkna avstånd från karta', en: 'Calculate distance from map' },
            tags: ['word_problem_ready'],
            contextType: 'scale_map_real',
            extractorPattern: /^(?<scale>\d+)\s*;\s*(?<mapCm>\d+)\s*;\s*(?<ans>[\d.]+)/
          },
          { 
            key: 'blueprint_draw', 
            level: 3,
            name: { sv: 'Ritning: Skala', en: 'Blueprint: Scale' },
            desc: { sv: 'Räkna ut längd på ritning', en: 'Calculate length on drawing' },
            tags: ['word_problem_ready'],
            contextType: 'scale_blueprint_draw',
            extractorPattern: /^(?<scale>\d+)\s*;\s*(?<realM>\d+)\s*;\s*(?<ans>\d+)/
          },
          { 
            key: 'microscope_calc', 
            level: 3,
            name: { sv: 'Förstoring (Mikroskop)', en: 'Magnification (Micro)' }, 
            desc: { sv: 'X:1 form', en: 'X:1 form' },
            tags: ['word_problem_ready'],
            contextType: 'scale_microscope_calc',
            extractorPattern: /^(?<scale>\d+)\s*;\s*(?<realMm>[\d.]+)\s*;\s*(?<ansMm>[\d.]+)/
          },
          { key: 'model_real', level: 3, name: { sv: 'Modell: Verklighet', en: 'Model: Reality' }, desc: { sv: 'Beräkna verklig storlek från modell', en: 'Calculate real size from model' } },

          // LEVEL 4: Bestämma skalan (Determine Scale)
          { key: 'determine_reduction', level: 4, name: { sv: 'Bestäm förminskning', en: 'Determine reduction' }, desc: { sv: 'Beräkna skalan för förminskning', en: 'Calculate scale for reduction' } },
          { key: 'determine_magnification', level: 4, name: { sv: 'Bestäm förstoring', en: 'Determine magnification' }, desc: { sv: 'Beräkna skalan för förstoring', en: 'Calculate scale for magnification' } },

          // LEVEL 5: Utan bild (No Pictures)
          { key: 'word_problem', level: 5, name: { sv: 'Textproblem', en: 'Word problem' }, desc: { sv: 'Skala i textformat', en: 'Scale in text format' } },

          // LEVEL 6: Areaskala (Area Scale Deep)
          { key: 'area_concept', level: 6, name: { sv: 'Areaskala: Koncept', en: 'Area scale: Concept' }, desc: { sv: 'Längdskala i kvadrat', en: 'Length scale squared' } },
          { key: 'area_calc_small', level: 6, name: { sv: 'Beräkna bild: Area', en: 'Calculate Image: Area' }, desc: { sv: 'Använd areaskalan för att beräkna bildens area', en: 'Use area scale to calculate image area' } },
          {
            key: "area_calc_large",
            level: 6,
            name: { sv: "Beräkna verklighet: Area", en: "Calculate Reality: Area" },
            desc: { sv: "Använd längdskalan i kvadrat för att beräkna den verkliga arean", en: "Use the length scale squared to calculate the actual area" },
            tags: ["word_problem_ready"],
            contextType: "scale_area_forward",
            extractorPattern: /^(?<scale>\d+)\s*;\s*(?<smallA>\d+)\s*;\s*(?<largeA>\d+)/
          },
          {
            key: "area_reverse",
            level: 6,
            name: { sv: "Bestäm skala utifrån area", en: "Determine Scale from Area" },
            desc: { sv: "Beräkna längdskalan genom att dra kvadratroten ur areaskalan", en: "Calculate the length scale by taking the square root of the area scale" },
            tags: ["word_problem_ready"],
            contextType: "scale_area_reverse",
            extractorPattern: /^(?<smallA>\d+)\s*;\s*(?<largeA>\d+)\s*;\s*(?<scale>\d+)/
          }
        ]
      },
      volume: {
        name: { sv: 'Volym & Begränsningsarea', en: 'Volume & Surface Area' },
        variations: [
          // LEVEL 1: Rätblock (Cuboid)
          { 
            key: 'vol_cuboid_std', 
            level: 1, 
            name: { sv: 'Volym: Rätblock', en: 'Volume: Cuboid' }, 
            desc: { sv: 'Längd · Bredd · Höjd', en: 'Length · Width · Height' },
            tags: ['word_problem_ready'],
            contextType: 'vol_cuboid_std',
            extractorPattern: /^(?<l>\d+)\s*;\s*(?<b>\d+)\s*;\s*(?<h>\d+)/
          },
          { key: 'vol_cuboid_inverse', level: 1, name: { sv: 'Rätblock: Invers', en: 'Cuboid: Inverse' }, desc: { sv: 'Hitta saknad sida från volymen', en: 'Find missing side from volume' } },
          { key: 'vol_cuboid_scaling', level: 1, name: { sv: 'Rätblock: Skalning', en: 'Cuboid: Scaling' }, desc: { sv: 'Hur ändras volymen om sidorna dubblas?', en: 'How does volume change if sides double?' } },

          // LEVEL 2: Tresidingt Prisma (Triangular Prism)
          { 
            key: 'vol_tri_prism_std', 
            level: 2, 
            name: { sv: 'Volym: Prisma (Triangel)', en: 'Volume: Triangular Prism' }, 
            desc: { sv: 'Basytan (triangel) · höjden', en: 'Base area (triangle) · height' },
            tags: ['word_problem_ready'],
            contextType: 'vol_prism_std',
            extractorPattern: /^(?<b>\d+)\s*;\s*(?<hTri>\d+)\s*;\s*(?<hPrism>\d+)/
          },
          { key: 'vol_tri_prism_inverse', level: 2, name: { sv: 'Prisma: Invers', en: 'Prism: Inverse' }, desc: { sv: 'Hitta saknad längd/höjd', en: 'Find missing length/height' } },

          // LEVEL 3: Cylinder (Cylinder)
          { 
            key: 'vol_cyl_std', 
            level: 3, 
            name: { sv: 'Volym: Cylinder', en: 'Volume: Cylinder' }, 
            desc: { sv: 'π · r² · h', en: 'π · r² · h' },
            tags: ['word_problem_ready'],
            contextType: 'vol_cylinder_std',
            extractorPattern: /^(?<r>\d+)\s*;\s*(?<h>\d+)/
          },
          { key: 'vol_cyl_est', level: 3, name: { sv: 'Cylinder: Uppskattning', en: 'Cylinder: Estimation' }, desc: { sv: 'Rimlighetsbedömning (π ≈ 3)', en: 'Reasonableness check (π ≈ 3)' } },
          { key: 'vol_cyl_inverse', level: 3, name: { sv: 'Cylinder: Invers', en: 'Cylinder: Inverse' }, desc: { sv: 'Hitta radie eller höjd', en: 'Find radius or height' } },

          // LEVEL 4: Pyramid & Kon (Pyramid & Cone)
          { 
            key: 'vol_pyramid_std', 
            level: 4, 
            name: { sv: 'Volym: Pyramid', en: 'Volume: Pyramid' }, 
            desc: { sv: '(Basytan · h) / 3', en: '(Base area · h) / 3' },
            tags: ['word_problem_ready'],
            contextType: 'vol_pyramid_std',
            extractorPattern: /^(?<side>\d+)\s*;\s*(?<h>\d+)/
          },
          { key: 'vol_cone_rule3', level: 4, name: { sv: 'Kon: Tredjedelsregeln', en: 'Cone: Rule of Thirds' }, desc: { sv: 'En kon är 1/3 av en cylinder', en: 'A cone is 1/3 of a cylinder' } },
          { 
            key: 'vol_cone_std', 
            level: 4, 
            name: { sv: 'Volym: Kon', en: 'Volume: Cone' }, 
            desc: { sv: '(π · r² · h) / 3', en: '(π · r² · h) / 3' },
            tags: ['word_problem_ready'],
            contextType: 'vol_cone_std',
            extractorPattern: /^(?<r>\d+)\s*;\s*(?<h>\d+)/
          },

          // LEVEL 5: Klot & Sammansatta Figurer (Sphere & Composite)
          { 
            key: 'vol_sphere_std', 
            level: 5, 
            name: { sv: 'Volym: Klot', en: 'Volume: Sphere' }, 
            desc: { sv: '(4 · π · r³) / 3', en: '(4 · π · r³) / 3' },
            tags: ['word_problem_ready'],
            contextType: 'vol_sphere_std',
            extractorPattern: /^(?<r>\d+)/
          },
          { key: 'vol_silo_std', level: 5, name: { sv: 'Sammansatt: Silo', en: 'Composite: Silo' }, desc: { sv: 'Cylinder + Halvklot', en: 'Cylinder + Hemisphere' } },
          { key: 'vol_icecream_std', level: 5, name: { sv: 'Sammansatt: Glass', en: 'Composite: Ice cream' }, desc: { sv: 'Kon + Halvklot (från radie)', en: 'Cone + Hemisphere (from radius)' } },

          // LEVEL 6: Klot från Diameter (Mixed / Diameter)
          { key: 'vol_sphere_diameter', level: 6, name: { sv: 'Klot från diameter', en: 'Sphere from diameter' }, desc: { sv: 'Beräkna volym utifrån diametern', en: 'Calculate volume using diameter' } },
          { key: 'vol_icecream_diameter', level: 6, name: { sv: 'Glass från diameter', en: 'Ice cream from diameter' }, desc: { sv: 'Kon + Halvklot utifrån diametern', en: 'Cone + Hemisphere using diameter' } },

          // LEVEL 7: Enheter och Konverteringar (Units & Conversions)
          { key: 'vol_units_liter', level: 7, name: { sv: 'Enheter: Liter & dm³', en: 'Units: Liters & dm³' }, desc: { sv: 'Sambandet 1 dm³ = 1 liter', en: 'Connection 1 dm³ = 1 liter' } },
          { key: 'vol_units_m3', level: 7, name: { sv: 'Enheter: Kubikmeter', en: 'Units: Cubic meters' }, desc: { sv: '1 m³ = 1000 liter', en: '1 m³ = 1000 liters' } },
          { key: 'vol_unit_conv', level: 7, name: { sv: 'Direkt Enhetsomvandling', en: 'Direct Unit Conversion' }, desc: { sv: 'Omvandla mellan volym/rymdmått', en: 'Convert between volume units' } },
          { key: 'vol_word_unit', level: 7, name: { sv: 'Textproblem: Enheter', en: 'Word Problem: Units' }, desc: { sv: 'Volymberäkning med enhetsbyte', en: 'Volume calc with unit change' } },

          // LEVEL 8: Begränsningsarea (Surface Area)
          { key: 'sa_cuboid', level: 8, name: { sv: 'Begränsningsarea: Rätblock', en: 'Surface Area: Cuboid' }, desc: { sv: 'Area av alla 6 sidor', en: 'Area of all 6 sides' } },
          { key: 'sa_cylinder', level: 8, name: { sv: 'Begränsningsarea: Cylinder', en: 'Surface Area: Cylinder' }, desc: { sv: 'Två basytor + mantelarea', en: 'Two bases + lateral area' } },
          { key: 'sa_cone', level: 8, name: { sv: 'Begränsningsarea: Kon', en: 'Surface Area: Cone' }, desc: { sv: 'Basyta + mantelarea (πrs)', en: 'Base + lateral area (πrs)' } },
          { key: 'sa_sphere', level: 8, name: { sv: 'Begränsningsarea: Klot', en: 'Surface Area: Sphere' }, desc: { sv: '4 · π · r²', en: '4 · π · r²' } }
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
        name: { sv: 'Statistik & Lägesmått', en: 'Statistics & Measures of Center' },
        variations: [
          // LEVEL 1: Typvärde & Variationsbredd (Mode & Range)
          { key: 'find_mode', level: 1, name: { sv: 'Typvärde', en: 'Mode' }, desc: { sv: 'Det vanligaste värdet', en: 'The most common value' } },
          { key: 'find_range', level: 1, name: { sv: 'Variationsbredd', en: 'Range' }, desc: { sv: 'Största minus minsta värdet', en: 'Largest minus smallest value' } },
          { key: 'find_min_max', level: 1, name: { sv: 'Minsta & Största', en: 'Min & Max' }, desc: { sv: 'Identifiera extremvärden', en: 'Identify extreme values' } },
          { key: 'stats_lie', level: 1, name: { sv: 'Hitta felet: Lägesmått', en: 'Find error: Measures' }, desc: { sv: 'Konceptuella missuppfattningar', en: 'Conceptual misconceptions' } },

          // LEVEL 2: Medelvärde (Mean)
          { 
            key: 'calc_mean', 
            level: 2, 
            name: { sv: 'Beräkna medelvärde', en: 'Calculate mean' }, 
            desc: { sv: 'Summan delat på antalet', en: 'Sum divided by count' },
            tags: ['word_problem_ready'],
            contextType: 'stats_mean_calc',
            extractorPattern: /^(?<sum>\d+)\s*;\s*(?<count>\d+)\s*;\s*(?<mean>[\d.]+)/
          },
          { key: 'mean_concept_balance', level: 2, name: { sv: 'Koncept: Balans', en: 'Concept: Balance' }, desc: { sv: 'Förstå medelvärdet som en balanspunkt', en: 'Understand mean as a balance point' } },
          { key: 'mean_negatives', level: 2, name: { sv: 'Medelvärde (Negativa tal)', en: 'Mean (Negative numbers)' }, desc: { sv: 'Medelvärde med minusgrader/skulder', en: 'Mean involving negatives' } },

          // LEVEL 3: Median (Median)
          { key: 'median_odd', level: 3, name: { sv: 'Median (Udda antal)', en: 'Median (Odd count)' }, desc: { sv: 'Mittersta värdet i storleksordning', en: 'Middle value in order' } },
          { key: 'median_even', level: 3, name: { sv: 'Median (Jämnt antal)', en: 'Median (Even count)' }, desc: { sv: 'Medelvärdet av de två mittersta', en: 'Mean of the two middle values' } },
          { key: 'median_lie', level: 3, name: { sv: 'Hitta felet: Median', en: 'Find error: Median' }, desc: { sv: 'Vanligt misstag (t.ex. glömt sortera)', en: 'Common mistake (e.g. forgot sorting)' } },

          // LEVEL 4: Baklängesberäkning (Reverse Mean)
          { 
            key: 'reverse_mean_calc', 
            level: 4, 
            name: { sv: 'Hitta saknat värde', en: 'Find missing value' }, 
            desc: { sv: 'Givet medelvärdet, hitta x', en: 'Given the mean, find x' },
            tags: ['word_problem_ready'],
            contextType: 'stats_mean_reverse',
            extractorPattern: /^(?<mean>[\d.]+)\s*;\s*(?<count>\d+)\s*;\s*(?<currentSum>\d+)/
          },
          { key: 'mean_target_score', level: 4, name: { sv: 'Målpoäng', en: 'Target score' }, desc: { sv: 'Vad krävs för att höja snittet?', en: 'What is needed to raise the average?' } },

          // LEVEL 5: Frekvenstabeller (Frequency Tables)
          { key: 'freq_count', level: 5, name: { sv: 'Tabell: Antal observationer', en: 'Table: Total count' }, desc: { sv: 'Summera frekvenserna', en: 'Sum the frequencies' } },
          { key: 'freq_mode', level: 5, name: { sv: 'Tabell: Typvärde', en: 'Table: Mode' }, desc: { sv: 'Hitta värdet med högst frekvens', en: 'Find value with highest frequency' } },
          { key: 'freq_range', level: 5, name: { sv: 'Tabell: Variationsbredd', en: 'Table: Range' }, desc: { sv: 'Största x minus minsta x', en: 'Largest x minus smallest x' } },
          { key: 'freq_mean', level: 5, name: { sv: 'Tabell: Medelvärde', en: 'Table: Mean' }, desc: { sv: 'Frekvens multiplicerat med värde', en: 'Frequency multiplied by value' } },
          { key: 'freq_median', level: 5, name: { sv: 'Tabell: Median', en: 'Table: Median' }, desc: { sv: 'Hitta mittenvärdet i tabellen', en: 'Find middle value in table' } },

          // LEVEL 6: Tillämpningar & Vägt medelvärde (Real World & Weighted)
          { key: 'real_measure_choice', level: 6, name: { sv: 'Välj rätt lägesmått', en: 'Choose right measure' }, desc: { sv: 'När passar median bättre än medelvärde?', en: 'When is median better than mean?' } },
          { key: 'real_outlier_shift', level: 6, name: { sv: 'Effekt av extremvärden', en: 'Outlier effects' }, desc: { sv: 'Hur ändras medelvärdet?', en: 'How does the mean change?' } },
          { key: 'real_weighted_avg', level: 6, name: { sv: 'Vägt medelvärde', en: 'Weighted average' }, desc: { sv: 'Beräkna snitt med olika vikter/grupper', en: 'Calculate average of different groups' } },
          { key: 'real_weighted_missing', level: 6, name: { sv: 'Vägt medelvärde (Saknat)', en: 'Weighted avg (Missing)' }, desc: { sv: 'Hitta saknad vikt eller gruppsnitt', en: 'Find missing weight or group average' } }
        ]
      },
      probability: {
        name: { sv: 'Sannolikhet', en: 'Probability' },
        variations: [
          // LEVEL 1: Visualiseringar & Komplement (Visuals & Complements)
          { 
            key: 'visual_calc', 
            level: 1,
            name: { sv: 'Beräkna Sannolikhet', en: 'Calculate Probability' }, 
            desc: { sv: 'Gynsamma / Möjliga', en: 'Favorable / Possible' }, 
            tags: ['word_problem_ready'],
            contextType: 'discrete_pool',
            extractorPattern: /\\frac\{(?<match>\d+)\}\{(?<total>\d+)\}/
          },
          { key: 'visual_not', level: 1, name: { sv: 'Komplementhändelse', en: 'Complementary event' }, desc: { sv: 'Sannolikheten för "Inte"', en: 'Probability of "Not"' } },
          { key: 'visual_or', level: 1, name: { sv: 'Bild: Eller', en: 'Visual: Or' }, desc: { sv: 'Sannolikheten för A eller B', en: 'Probability of A or B' } },
          { key: 'visual_spinner', level: 1, name: { sv: 'Lyckohjul', en: 'Lucky wheel' }, desc: { sv: 'Sektorernas andel', en: 'Sector share' } },
          {
            key: "comp_multi",
            level: 1,
            name: { sv: "Komplement: Procent", en: "Complement: Percent" },
            desc: { sv: "Beräkna sannolikheten att något INTE händer utifrån procent", en: "Calculate the probability of an event NOT happening using percentages" },
            tags: ["word_problem_ready"],
            contextType: "prob_complement_pct",
            extractorPattern: /lotteri\s*är\s*(?<pWin>\d+)\s*%/i
          },
          { key: 'comp_at_least', level: 1, name: { sv: 'Minst en', en: 'At least one' }, desc: { sv: 'Sannolikhet via komplement', en: 'Probability via complement' } },
          { key: 'comp_lie', level: 1, name: { sv: 'Hitta felet: Komplement', en: 'Find error: Complement' }, desc: { sv: 'Analysera påståenden', en: 'Analyze statements' } },

          // LEVEL 2: Grupper & Tärningar (Groups & Dice)
          { key: 'dice_single', level: 2, name: { sv: 'Tärning: Enstaka tal', en: 'Dice: Single number' }, desc: { sv: 'Ex: Få en 5:a', en: 'Ex: Rolling a 5' } },
          {
            key: "dice_parity",
            level: 2,
            name: { sv: "Tärningskast: Egenskaper", en: "Die Toss: Properties" },
            desc: { sv: "Sannolikhet för jämna, udda eller specifika tärningsmönster", en: "Probability of rolling even, odd, or specific die patterns" },
            tags: ["word_problem_ready"],
            contextType: "prob_dice_parity",
            extractorPattern: /slå\s*ett\s*(?<label>jämnt|udda)\s*tal/i
          },
          { key: 'dice_range', level: 2, name: { sv: 'Tärning: Intervall', en: 'Dice: Range' }, desc: { sv: 'Större/Mindre än n', en: 'Greater/Smaller than n' } },
          {
            key: "group_ratio",
            level: 2,
            name: { sv: "Förhållande i grupp", en: "Ratios in Groups" },
            desc: { sv: "Beräkna sannolikhet utifrån ett givet proportionellt förhållande", en: "Calculate probability based on a given proportional ratio" },
            tags: ["word_problem_ready"],
            contextType: "prob_group_ratio",
            extractorPattern: /mellan\s*(?<label1>[^ och]+)\s*och\s*(?<label2>[^ ]+)\s*föremål\s*(?<r1>\d+):(?<r2>\d+)/i
          },
          { key: 'group_ternary', level: 2, name: { sv: 'Tre grupper', en: 'Three groups' }, desc: { sv: 'Hitta restens chans', en: 'Find rest\'s chance' } },

          // LEVEL 3: Koncept & Logik (Concepts & Logic)
          { key: 'concept_likelihood', level: 3, name: { sv: 'Begrepp: Chans', en: 'Concept: Chance' }, desc: { sv: 'Säkert / Omöjligt', en: 'Certain / Impossible' } },
          { key: 'concept_compare', level: 3, name: { sv: 'Jämför chans', en: 'Compare chance' }, desc: { sv: 'Vilken är mest sannolik?', en: 'Which is most likely?' } },
          { key: 'concept_validity', level: 3, name: { sv: 'Giltig sannolikhet', en: 'Valid probability' }, desc: { sv: 'Mellan 0 och 1 (0% till 100%)', en: 'Between 0 and 1 (0% to 100%)' } },

          // LEVEL 5: Träddiagram (Probability Trees)
          { key: 'tree_calc', level: 5, name: { sv: 'Sannolikhetsträd', en: 'Probability tree' }, desc: { sv: 'Dragning utan återläggning', en: 'Pick w/o replacement' } },
          { key: 'tree_missing', level: 5, name: { sv: 'Träddiagram: Saknad', en: 'Tree diagram: Missing' }, desc: { sv: 'Fyll i saknad gren', en: 'Fill in missing branch' } },

          // LEVEL 6: Händelsekedjor (Event Chains)
          { key: 'chain_any_order', level: 6, name: { sv: 'Oberoende ordning', en: 'Independent order' }, desc: { sv: 'En av varje färg', en: 'One of each color' } },
          { key: 'chain_fixed_order', level: 6, name: { sv: 'Bestämd ordning', en: 'Fixed order' }, desc: { sv: 'Sannolikhet i en specifik följd', en: 'Probability in a specific sequence' } },

          // LEVEL 7: Kombinatorik (Combinatorics)
          { key: 'comb_constraint', level: 7, name: { sv: 'Kombinatorik: Outfits', en: 'Combinatorics: Outfits' }, desc: { sv: 'Multiplikationsprincipen', en: 'Multiplication principle' } },
          { key: 'comb_handshake', level: 7, name: { sv: 'Handskakningar', en: 'Handshakes' }, desc: { sv: 'Alla hälsar på alla', en: 'Everyone greets everyone' } },

          // LEVEL 8: Avancerade Vägar (Complex Pathways)
          { key: 'pathways_basic', level: 8, name: { sv: 'Räkna Vägar', en: 'Count paths' }, desc: { sv: 'A till B nätverk', en: 'A to B network' } },
          { key: 'pathways_blocked', level: 8, name: { sv: 'Räkna vägar (Hinder)', en: 'Count paths (Blocked)' }, desc: { sv: 'Vägar förbi hinder', en: 'Paths bypassing obstacles' } },
          { key: 'pathways_prob', level: 8, name: { sv: 'Sannolikhet för väg', en: 'Path probability' }, desc: { sv: 'Sannolikhet att nå specifikt mål', en: 'Probability to reach specific goal' } }
        ]
      }
    }
  }
};