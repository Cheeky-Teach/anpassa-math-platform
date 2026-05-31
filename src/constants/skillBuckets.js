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
            // Matches: x + 5 = 12 OR x - 3 = 8
            extractorPattern: /^x\s*(?<op>[\+\-])\s*(?<a>\d+)\s*=\s*(?<b>\d+)$/
          },
          { key: 'onestep_concept_inverse', name: { sv: 'Ensteg: Invers', en: 'One-step: Inverse' }, desc: { sv: 'Välj rätt räknesätt (+/-/*/÷)', en: 'Choose the correct operation' } },
          { key: 'onestep_spot_lie', name: { sv: 'Hitta felet: Ensteg', en: 'Find the error: One-step' }, desc: { sv: 'Identifiera felaktig lösning', en: 'Identify incorrect solutions' } },
          { 
            key: 'twostep_calc', 
            name: { sv: 'Tvåsteg: Beräkning', en: 'Two-step: Calculation' }, 
            desc: { sv: 'ax + b = c eller ax - b = c', en: 'ax + b = c or ax - b = c' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_twostep',
            // Matches: 3x + 12 = 36 OR 4x - 5 = 15
            extractorPattern: /^(?<a>\d+)x\s*(?<op>[\+\-])\s*(?<b>\d+)\s*=\s*(?<c>\d+)$/
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
          { key: 'bothsides_concept_strategy', name: { sv: 'X på båda sidor: Strategi', en: 'X on both sides: Strategy' }, desc: { sv: 'Håll antalet x positivt', en: 'Keep the number of x positive' } }
        ]
      },
      expressions: {
        name: { sv: 'Förenkling av Uttryck', en: 'Expression Simplification' },
        variations: [
          { key: 'combine_lie_exponent', name: { sv: 'Hitta felet: Potenser', en: 'Find error: Exponents' }, desc: { sv: 'x + x vs x * x', en: 'x + x vs x * x' } },
          { key: 'combine_concept_id', name: { sv: 'Begrepp: Termer', en: 'Concept: Terms' }, desc: { sv: 'Identifiera lika termer', en: 'Identify like terms' } },
          { 
            key: 'combine_standard_mixed', 
            name: { sv: 'Förenkla uttryck', en: 'Simplify expressions' }, 
            desc: { sv: 'Samla x och tal i ordning', en: 'Combine x and constants' },
            tags: ['word_problem_ready'],
            contextType: 'algebra_expressions',
            // 🟢 Captures all 4 terms and both operators dynamically!
            // Matches formats like: "12x + 15 - 4x + 6", "10x - 8 - 2x - 3", etc.
            extractorPattern: /^(?<a>\d+)x\s*(?<op1>[\+\-])\s*(?<b>\d+)\s*(?<op2>[\+\-])\s*(?<c>\d+)x\s*(?<op3>[\+\-])\s*(?<d>\d+)$/
          }
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
          { key: 'combine_lie_exponent', name: { sv: 'Hitta felet: Potenser', en: 'Find error: Exponents' }, desc: { sv: 'x + x vs x * x', en: 'x + x vs x * x' } },
          { key: 'combine_concept_id', name: { sv: 'Begrepp: Termer', en: 'Concept: Terms' }, desc: { sv: 'Identifiera lika termer', en: 'Identify like terms' } },
          { key: 'combine_standard_mixed', name: { sv: 'Förenkla uttryck', en: 'Simplify expressions' }, desc: { sv: 'Samla x och tal', en: 'Combine x and constants' } },
          { key: 'distribute_lie_partial', name: { sv: 'Hitta felet: Parentes', en: 'Find error: Parentheses' }, desc: { sv: 'Partiell distribution', en: 'Partial distribution' } },
          { 
            key: 'distribute_plus', 
            name: { sv: 'Parentes (+)', en: 'Parentheses (+)' }, 
            tags: ['word_problem_ready'],
            contextType: 'algebra_expressions_dist',
            extractorPattern: /^(?<a>\d+)x\s*\+\s*\(?(?<b>\d*)x\s*\+\s*(?<c>\d+)\)?$/
          },
          { 
            key: 'distribute_minus', 
            name: { sv: 'Parentes (-)', en: 'Parentheses (-)' }, 
            tags: ['word_problem_ready'],
            contextType: 'algebra_expressions_dist_neg',
            extractorPattern: /^(?<a>\d+)x\s*-\s*\(?(?<b>\d*)x\s*\+\s*(?<c>\d+)\)?$/
          },

          { key: 'distribute_double', name: { sv: 'Dubbla parenteser', en: 'Double parentheses' }, desc: { sv: 'Expandera två parenteser', en: 'Expand two parentheses' } },
          { 
            key: 'distribute_combine_std', 
            name: { sv: 'Expandera & Förenkla', en: 'Expand & Simplify' }, 
            tags: ['word_problem_ready'],
            contextType: 'algebra_expressions_expand',
            extractorPattern: /^(?<a>\d+)\((?<b>\d*)x\s*\+\s*(?<c>\d+)\)\s*(?<op>[\+\-])\s*(?<d>\d+)x$/
          },
          { key: 'sub_concept_plus_logic', name: { sv: 'Teckenregler', en: 'Sign rules' }, desc: { sv: 'Minus framför parentes', en: 'Minus in front of parentheses' } },
          { key: 'sub_block_plus', name: { sv: 'Minusparentes (+)', en: 'Minus parentheses (+)' }, desc: { sv: '-(ax + b)', en: '-(ax + b)' } },
          { key: 'sub_block_minus', name: { sv: 'Minusparentes (-)', en: 'Minus parentheses (-)' }, desc: { sv: '-(ax - b)', en: '-(ax - b)' } },
          { key: 'word_candy', name: { sv: 'Uttryck: Godispåsar', en: 'Expressions: Candy bags' }, desc: { sv: 'Teckna uttryck', en: 'Formulate expression' } },
          { key: 'word_combined_age_tri', name: { sv: 'Uttryck: Åldrar', en: 'Expressions: Ages' }, desc: { sv: 'Tre personers ålder', en: 'Ages of three people' } },
          { key: 'word_passengers', name: { sv: 'Uttryck: Passagerare', en: 'Expressions: Passengers' }, desc: { sv: 'Förändring på buss', en: 'Changes on a bus' } }
        ]
      },
      patterns: {
        name: { sv: 'Mönster & Formler', en: 'Patterns & Formulas' },
        variations: [
          { key: 'seq_lie', name: { sv: 'Hitta felet: Talföljd', en: 'Find error: Sequence' }, desc: { sv: 'Analysera mönsterlogik', en: 'Analyze pattern logic' } },
          { key: 'seq_type', name: { sv: 'Mönstertyp', en: 'Pattern type' }, desc: { sv: 'Aritmetisk vs Geometrisk', en: 'Arithmetic vs Geometric' } },
          { key: 'seq_diff', name: { sv: 'Hitta differensen', en: 'Find the difference' }, desc: { sv: 'Ökning per steg', en: 'Increase per step' } },
          { key: 'seq_next', name: { sv: 'Nästa tal', en: 'Next number' }, desc: { sv: 'Fortsätt talföljden', en: 'Continue the sequence' } },
          { key: 'high_term', name: { sv: 'Hitta tal n', en: 'Find term n' }, desc: { sv: 'Beräkna värdet långt fram', en: 'Calculate far-off values' } },
          { key: 'formula_missing', name: { sv: 'Hitta formeln (Bild)', en: 'Find formula (Visual)' }, desc: { sv: 'Koppla bild till uttryck', en: 'Link image to expression' } },
          { key: 'visual_calc', name: { sv: 'Beräkna antal (Bild)', en: 'Calculate count (Visual)' }, desc: { sv: 'Hur många tändstickor?', en: 'How many matches?' } },
          { key: 'find_formula', name: { sv: 'Skriv formeln', en: 'Write the formula' }, desc: { sv: 'Skapa y = kn + m', en: 'Create y = kn + m' } },
          { key: 'table_formula', name: { sv: 'Tabell till Formel', en: 'Table to Formula' }, desc: { sv: 'Hitta mönster i värdetabell', en: 'Find patterns in value tables' } },
          { key: 'table_fill', name: { sv: 'Fyll i tabell', en: 'Fill in table' }, desc: { sv: 'Använd formeln', en: 'Use the formula' } },
          { key: 'reverse_calc', name: { sv: 'Hitta n (Ekvation)', en: 'Find n (Equation)' }, desc: { sv: 'Vilket figurnummer har värdet X?', en: 'Which figure number has value X?' } }
        ]
      },
      graphs: {
        name: { sv: 'Räta Linjens Ekvation', en: 'Linear Equations & Graphs' },
        variations: [
          { key: 'intercept_id', name: { sv: 'Hitta m-värde', en: 'Find m-value' }, desc: { sv: 'Var skär linjen y-axeln?', en: 'Where does the line cross the y-axis?' } },
          { key: 'slope_pos_int', name: { sv: 'Positiv Lutning (Heltal)', en: 'Positive Slope (Integer)' }, desc: { sv: 'Stigande k-värde', en: 'Rising k-value' } },
          { key: 'slope_pos_frac', name: { sv: 'Positiv Lutning (Bråk)', en: 'Positive Slope (Fraction)' }, desc: { sv: 'Stigande, flack/brant', en: 'Rising, shallow/steep' } },
          { key: 'slope_neg_int', name: { sv: 'Negativ Lutning (Heltal)', en: 'Negative Slope (Integer)' }, desc: { sv: 'Sjunkande k-värde', en: 'Falling k-value' } },
          { key: 'slope_neg_frac', name: { sv: 'Negativ Lutning (Bråk)', en: 'Negative Slope (Fraction)' }, desc: { sv: 'Sjunkande, flack/brant', en: 'Falling, shallow/steep' } },
          { key: 'eq_standard', name: { sv: 'Bestäm ekvation', en: 'Determine equation' }, desc: { sv: 'y = kx + m', en: 'y = kx + m' } },
          { key: 'eq_no_m', name: { sv: 'Proportionalitet', en: 'Proportionality' }, desc: { sv: 'y = kx (Går genom origo)', en: 'y = kx (Passes through origin)' } },
          { key: 'eq_horizontal', name: { sv: 'Horisontell linje', en: 'Horizontal line' }, desc: { sv: 'y = m (k=0)', en: 'y = m (k=0)' } }
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
          { key: 'add_std_vertical', name: { sv: 'Addition: Uppställning', en: 'Addition: Column Method' }, desc: { sv: 'Stora tal', en: 'Large numbers' } },
          { key: 'add_std_horizontal', name: { sv: 'Addition: Horisontell', en: 'Addition: Horizontal' }, desc: { sv: 'Strategier', en: 'Strategies' } },
          { key: 'add_missing_variable', name: { sv: 'Addition: Hitta termen', en: 'Addition: Find the term' }, desc: { sv: 'a + x = b', en: 'a + x = b' } },
          { key: 'add_spot_the_lie', name: { sv: 'Hitta felet: Addition', en: 'Find error: Addition' }, desc: { sv: 'Felsökning', en: 'Troubleshooting' } },
          { key: 'sub_std_vertical', name: { sv: 'Subtraktion: Uppställning', en: 'Subtraction: Column Method' }, desc: { sv: 'Växling', en: 'Borrowing' } },
          { key: 'sub_std_horizontal', name: { sv: 'Subtraktion: Horisontell', en: 'Subtraction: Horizontal' }, desc: { sv: 'Strategier', en: 'Strategies' } },
          { key: 'sub_missing_variable', name: { sv: 'Subtraktion: Hitta termen', en: 'Subtraction: Find the term' }, desc: { sv: 'a - x = b', en: 'a - x = b' } },
          { key: 'dec_add_vertical', name: { sv: 'Decimaler: Addition', en: 'Decimals: Addition' }, desc: { sv: 'Passa kommatecknet', en: 'Align decimal point' } },
          { key: 'dec_sub_vertical', name: { sv: 'Decimaler: Subtraktion', en: 'Decimals: Subtraction' }, desc: { sv: 'Passa kommatecknet', en: 'Align decimal point' } },
          { key: 'mult_table_std', name: { sv: 'Multiplikationstabellen', en: 'Multiplication Tables' }, desc: { sv: 'Grundläggande tabeller', en: 'Basic tables' } },
          { key: 'mult_commutative', name: { sv: 'Kommutativa lagen', en: 'Commutative Law' }, desc: { sv: 'a * b = b * a', en: 'a * b = b * a' } },
          { key: 'mult_2x1_vertical', name: { sv: 'Mult: Uppställning', en: 'Mult: Column Method' }, desc: { sv: 'Två siffror * en siffra', en: 'Two digits * one digit' } },
          { key: 'mult_distributive', name: { sv: 'Distributiva lagen', en: 'Distributive Law' }, desc: { sv: 'Dela upp faktorer', en: 'Split factors' } },
          { key: 'mult_decimal_std', name: { sv: 'Decimalmultiplikation', en: 'Decimal Multiplication' }, desc: { sv: 'Räkna decimaler', en: 'Count decimals' } },
          { key: 'mult_decimal_placement', name: { sv: 'Placera kommatecknet', en: 'Place decimal point' }, desc: { sv: 'Uppskattning', en: 'Estimation' } },
          { key: 'div_basic_std', name: { sv: 'Kort division', en: 'Short Division' }, desc: { sv: 'Standardalgoritm', en: 'Standard algorithm' } },
          { key: 'div_inverse_logic', name: { sv: 'Division via multiplikation', en: 'Division via mult' }, desc: { sv: 'Samband', en: 'Connection' } }
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
            key: 'mult_same_sign', 
            name: { sv: 'Mult: Samma tecken', en: 'Mult: Same signs' }, 
            desc: { sv: 'Minus * Minus = Plus', en: 'Minus * Minus = Plus' },
            tags: ['word_problem_ready'],
            contextType: 'neg_multiplication',
            extractorPattern: /^(?<valA>\(-?\d+\)|-?\d+)\s*·\s*(?<valB>\(-?\d+\)|-?\d+)$/
          },
          { 
            key: 'mult_diff_sign', 
            name: { sv: 'Mult: Olika tecken', en: 'Mult: Different signs' }, 
            desc: { sv: 'Minus * Plus = Minus', en: 'Minus * Plus = Minus' },
            tags: ['word_problem_ready'],
            contextType: 'neg_multiplication',
            extractorPattern: /^(?<valA>\(-?\d+\)|-?\d+)\s*·\s*(?<valB>\(-?\d+\)|-?\d+)$/
          },
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
            key: 'div_diff_sign', 
            name: { sv: 'Division: Olika tecken', en: 'Division: Different signs' }, 
            desc: { sv: 'Svaret blir negativt', en: 'Answer is negative' },
            tags: ['word_problem_ready'],
            contextType: 'neg_division',
            extractorPattern: /\\frac\{(?<valA>-?\d+)\}\{(?<valB>-?\d+)\}/
          },
          { key: 'div_check_logic', name: { sv: 'Division: Kontroll', en: 'Division: Checking' }, desc: { sv: 'Använd multiplikation', en: 'Use multiplication' } }
        ]
      },
      fractions_basics: {
        name: { sv: 'Bråk: Grunder', en: 'Fractions: Basics' },
        variations: [
          { key: 'visual_lie', name: { sv: 'Hitta felet: Bilder', en: 'Find error: Visuals' }, desc: { sv: 'Visuell tolkning', en: 'Visual interpretation' } },
          { key: 'visual_inverse', name: { sv: 'Bild: Hitta helheten', en: 'Visual: Find whole' }, desc: { sv: 'Givet del, sök helhet', en: 'Given part, seek whole' } },
          { key: 'visual_calc', name: { sv: 'Bild: Beräkna andel', en: 'Visual: Calculate share' }, desc: { sv: 'Färgad del av total', en: 'Colored part of total' } },
          { key: 'part_inverse', name: { sv: 'Hitta helheten', en: 'Find the whole' }, desc: { sv: '1/n är x, vad är allt?', en: '1/n is x, what is total?' } },
          { key: 'part_compare', name: { sv: 'Jämför andelar', en: 'Compare shares' }, desc: { sv: 'Vilken del är störst?', en: 'Which part is largest?' } },
          { key: 'part_calc', name: { sv: 'Beräkna del av antal', en: 'Calculate part of count' }, desc: { sv: '1/n av x', en: '1/n of x' } },
          { key: 'mixed_bounds', name: { sv: 'Storleksbedömning', en: 'Size assessment' }, desc: { sv: 'Större/Mindre än heltal', en: 'Greater/Smaller than integer' } },
          { key: 'mixed_convert_imp', name: { sv: 'Till bråkform', en: 'To improper fraction' }, desc: { sv: 'Blandad -> Bråk', en: 'Mixed -> Improper' } },
          { key: 'mixed_convert_mix', name: { sv: 'Till blandad form', en: 'To mixed form' }, desc: { sv: 'Bråk -> Blandad', en: 'Improper -> Mixed' } },
          { key: 'simplify_missing', name: { sv: 'Likvärdiga bråk', en: 'Equivalent fractions' }, desc: { sv: 'Förlängning/Förkortning', en: 'Extension/Simplification' } },
          { key: 'simplify_concept', name: { sv: 'Koncept: Förkortning', en: 'Concept: Simplification' }, desc: { sv: 'Ändras värdet?', en: 'Does the value change?' } },
          { key: 'simplify_calc', name: { sv: 'Förkorta bråk', en: 'Simplify fraction' }, desc: { sv: 'Enklaste form', en: 'Simplest form' } },
          { key: 'equivalence_basic_frac', name: { sv: 'Basfakta: Bråk till %', en: 'Basic Facts: Fraction to %' }, desc: { sv: 'Ex: 1/4 = 25%', en: 'Ex: 1/4 = 25%' } },
          { key: 'equivalence_basic_dec', name: { sv: 'Basfakta: Decimal till %', en: 'Basic Facts: Decimal to %' }, desc: { sv: 'Ex: 0,2 = 20%', en: 'Ex: 0.2 = 20%' } },
          { key: 'decimal_inequality', name: { sv: 'Jämför bråk/decimal', en: 'Compare fraction/decimal' }, desc: { sv: 'Större, mindre, lika', en: 'Greater, smaller, equal' } },
          { key: 'decimal_to_dec', name: { sv: 'Bråk till decimal', en: 'Fraction to decimal' }, desc: { sv: 'Ex: 1/4 = 0,25', en: 'Ex: 1/4 = 0.25' } },
          { key: 'decimal_to_frac', name: { sv: 'Decimal till bråk', en: 'Decimal to fraction' }, desc: { sv: 'Ex: 0,5 = 1/2', en: 'Ex: 0.5 = 1/2' } }
        ]
      },
      fraction_arith: {
        name: { sv: 'Bråk: Räknesätt', en: 'Fraction Operations' },
        variations: [
          { key: 'add_concept', name: { sv: 'Addition: Regler', en: 'Addition: Rules' }, desc: { sv: 'Addera täljare, ej nämnare', en: 'Add numerators, not denominators' } },
          { key: 'add_missing', name: { sv: 'Addition: Pussel', en: 'Addition: Puzzle' }, desc: { sv: 'Hitta saknad term', en: 'Find missing term' } },
          {
            key: "add_calc",
            name: { sv: "Bråkaddition: Lika nämnare", en: "Fraction Addition: Same Denominator" },
            desc: { sv: "Addera bråk med gemensam nämnare och svara i enklaste form", en: "Add fractions with a common denominator and simplify the answer" },
            tags: ["word_problem_ready"],
            contextType: "frac_same_denom_add",
            extractorPattern: /\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d>\d+)\s*}\s*\+\s*\\frac{\s*(?<n2>\d+)\s*}{\s*(?:\k<d>)\s*}/
          },
          {
            key: "sub_calc",
            name: { sv: "Bråksubtraktion: Lika nämnare", en: "Fraction Subtraction: Same Denominator" },
            desc: { sv: "Subtrahera bråk med gemensam nämnare och svara i enklaste form", en: "Subtract fractions with a common denominator and simplify the answer" },
            tags: ["word_problem_ready"],
            contextType: "frac_same_denom_sub",
            extractorPattern: /\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d>\d+)\s*}\s*-\s*\\frac{\s*(?<n2>\d+)\s*}{\s*(?:\k<d>)\s*}/
          },
          { key: 'lcd_find', name: { sv: 'Hitta MGN', en: 'Find LCD' }, desc: { sv: 'Minsta gemensamma nämnare', en: 'Lowest common denominator' } },
          { key: 'add_error_spot', name: { sv: 'Hitta felet: Olika nämnare', en: 'Find error: Diff denom' }, desc: { sv: 'Vanliga misstag', en: 'Common mistakes' } },
          {
            key: "add_diff_denom",
            name: { sv: "Bråkaddition: Olika nämnare", en: "Fraction Addition: Different Denominators" },
            desc: { sv: "Hitta MGN för att addera bråk med olika nämnare", en: "Find the LCD to add fractions with different denominators" },
            tags: ["word_problem_ready"],
            contextType: "frac_diff_denom_add",
            extractorPattern: /\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d1>\d+)\s*}\s*\+\s*\\frac{\s*(?<n2>\d+)\s*}{\s*(?<d2>\d+)\s*}/
          },
          {
            key: "sub_diff_denom",
            name: { sv: "Bråksubtraktion: Olika nämnare", en: "Fraction Subtraction: Different Denominators" },
            desc: { sv: "Hitta MGN för att subtrahera bråk med olika nämnare", en: "Find the LCD to subtract fractions with different denominators" },
            tags: ["word_problem_ready"],
            contextType: "frac_diff_denom_sub",
            extractorPattern: /\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d1>\d+)\s*}\s*-\s*\\frac{\s*(?<n2>\d+)\s*}{\s*(?<d2>\d+)\s*}/
          },
          {
            key: "mixed_add_diff",
            name: { sv: "Addition: Blandad form", en: "Addition: Mixed Form" },
            desc: { sv: "Addera bråk i blandad form genom att omvandla till bråkform", en: "Add fractions in mixed form by converting to improper fractions" },
            tags: ["word_problem_ready"],
            contextType: "frac_mixed_add",
            extractorPattern: /(?<w1>\d+)\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d1>\d+)\s*}\s*\+\s*(?<w2>\d+)\\frac{\s*(?<n2>\d+)\s*}{\s*(?<d2>\d+)\s*}/
          },
          {
            key: "mixed_sub_diff",
            name: { sv: "Subtraktion: Blandad form", en: "Subtraction: Mixed Form" },
            desc: { sv: "Subtrahera bråk i blandad form genom att omvandla till bråkform", en: "Subtract fractions in mixed form by converting to improper fractions" },
            tags: ["word_problem_ready"],
            contextType: "frac_mixed_sub",
            extractorPattern: /(?<w1>\d+)\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d1>\d+)\s*}\s*-\s*(?<w2>\d+)\\frac{\s*(?<n2>\d+)\s*}{\s*(?<d2>\d+)\s*}/
          },
          { key: 'mult_scaling', name: { sv: 'Multiplikation: Skalning', en: 'Mult: Scaling' }, desc: { sv: 'Större eller mindre?', en: 'Larger or smaller?' } },
          {
            key: "mult_calc",
            name: { sv: "Bråkmultiplikation", en: "Fraction Multiplication" },
            desc: { sv: "Multiplicera täljare för sig och nämnare för sig till enklaste form", en: "Multiply numerators and denominators separately into simplest form" },
            tags: ["word_problem_ready"],
            contextType: "frac_multiplication",
            extractorPattern: /\\frac{\s*(?<n1>\d+)\s*}{\s*(?<d1>\d+)\s*}\s*\\cdot\s*\\frac{\s*(?<n2>\d+)\s*}{\s*(?<d2>\d+)\s*}/
          },
          { key: 'div_reciprocal', name: { sv: 'Inverterade tal', en: 'Reciprocal numbers' }, desc: { sv: 'Vänd på bråket', en: 'Flip the fraction' } },
          {
            key: "div_calc",
            name: { sv: "Bråkdivision", en: "Fraction Division" },
            desc: { sv: "Dividera bråk genom att multiplicera med det inverterade bråket", en: "Divide fractions by multiplying by the reciprocal" },
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
            key: 'benchmark_inverse',
            name: { sv: 'Hitta 100% (Bas)', en: 'Find 100% (Basic)' },
            desc: { sv: 'Om 10% är 5, vad är allt?', en: 'If 10% is 5, what is total?' },
            tags: ['word_problem_ready'],
            contextType: 'percent_base_part',
            extractorPattern: /^(?<pct>\d+)\\%\\s*=\\s*(?<part>\d+)/
          },
          {
            key: 'composition',
            name: { sv: 'Sammansättning', en: 'Composition' },
            desc: { sv: 'Bygg 30, 40, 70%', en: 'Build 30, 40, 70%' },
            tags: ['word_problem_ready'],
            contextType: 'percent_of_amount',
            extractorPattern: /^(?<pct>\d+)\\%\\s*\\cdot\\s*(?<base>\d+)/
          },
          { key: 'decomposition', name: { sv: 'Uppdelning (5%)', en: 'Decomposition (5%)' }, desc: { sv: 'Använd 10% för att hitta 5%', en: 'Use 10% to find 5%' } },
          {
            key: 'find_percent_test',
            name: { sv: 'Procentsats: Prov', en: 'Percent: Test' },
            desc: { sv: 'Delen / Hela', en: 'Part / Whole' },
            tags: ['word_problem_ready'],
            contextType: 'percent_find_rate',
            extractorPattern: /\\frac\{(?<part>\d+)\}\{(?<whole>\d+)\}/
          },
          {
            key: 'find_percent_discount',
            name: { sv: 'Procentsats: Rabatt', en: 'Percent: Discount' },
            desc: { sv: 'Beräkna andelen', en: 'Calculate share' },
            tags: ['word_problem_ready'],
            contextType: 'percent_find_rate',
            extractorPattern: /\\frac\{(?<part>\d+)\}\{(?<whole>\d+)\}/
          },
          {
            key: 'reverse_find_whole',
            name: { sv: 'Hitta 100%', en: 'Find 100%' },
            desc: { sv: 'Beräkna hela summan', en: 'Calculate total sum' },
            tags: ['word_problem_ready'],
            contextType: 'percent_base_part',
            extractorPattern: /^(?<pct>\d+)\\%\\s*=\\s*(?<part>\d+)/
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
          { key: 'pct_to_factor_inc', name: { sv: 'Ökning till Faktor', en: 'Increase to Factor' }, desc: { sv: '+20% -> 1,20', en: '+20% -> 1.20' } },
          { key: 'pct_to_factor_dec', name: { sv: 'Minskning till Faktor', en: 'Decrease to Factor' }, desc: { sv: '-20% -> 0,80', en: '-20% -> 0.80' } },
          { key: 'factor_to_pct_inc', name: { sv: 'Factor till Ökning', en: 'Factor to Increase' }, desc: { sv: '1,20 -> +20%', en: '1.20 -> +20%' } },
          { key: 'factor_to_pct_dec', name: { sv: 'Factor till Minskning', en: 'Factor to Decrease' }, desc: { sv: '0,80 -> -20%', en: '0.80 -> -20%' } },
          { 
            key: 'apply_factor_inc', 
            name: { sv: 'Beräkna nytt (Ökning)', en: 'Calc new (Increase)' }, 
            desc: { sv: 'Startvärde · Ökningsfaktor', en: 'Initial value · Growth factor' }, // 🟢 Restores studio subtitle labels
            tags: ['word_problem_ready'],
            contextType: 'apply_factor_inc', 
            // 🟢 Embraces both dot notation layout strings '·' and code-escaped '\\cdot' configurations dynamically
            extractorPattern: /^(?<base>\d+)\s*(?:\\cdot|·)\s*(?<factor>1[.,]\d+)$/
          },
          { 
            key: 'apply_factor_dec', 
            name: { sv: 'Beräkna nytt (Minskning)', en: 'Calc new (Decrease)' }, 
            desc: { sv: 'Startvärde · Minskningsfaktor', en: 'Initial value · Decay factor' },
            tags: ['word_problem_ready'],
            contextType: 'apply_factor_dec',
            extractorPattern: /^(?<base>\d+)\s*(?:\\cdot|·)\s*(?<factor>0[.,]\d+)$/
          },
          { 
            key: 'find_original_inc', 
            name: { sv: 'Hitta gamla (Ökning)', en: 'Find old (Increase)' }, 
            desc: { sv: 'Nytt värde / Ökningsfaktor', en: 'New value / Growth factor' },
            tags: ['word_problem_ready'],
            contextType: 'find_original_inc',
            extractorPattern: /^\\frac\{(?<newPrice>\d+)\}\{(?<factor>1[.,]\d+)\}$/
          },
          { 
            key: 'find_original_dec', 
            name: { sv: 'Hitta gamla (Minskning)', en: 'Find old (Decrease)' }, 
            desc: { sv: 'Nytt värde / Minskningsfaktor', en: 'New value / Decay factor' },
            tags: ['word_problem_ready'],
            contextType: 'find_original_dec',
            extractorPattern: /^\\frac\{(?<newPrice>\d+)\}\{(?<factor>0[.,]\d+)\}$/
          },
          { 
            key: 'sequential_factors', 
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
          { key: 'zero_rule', name: { sv: 'Noll-regeln', en: 'Zero rule' }, desc: { sv: 'x^0 = 1', en: 'x^0 = 1' } },
          { key: 'power_of_one', name: { sv: 'Upphöjt till 1', en: 'Power of one' }, desc: { sv: 'x^1 = x', en: 'x^1 = x' } },
          { key: 'foundations_calc', name: { sv: 'Beräkna potenser', en: 'Calc powers' }, desc: { sv: 'Bas * Bas...', en: 'Base * Base...' } },
          { key: 'foundations_spot_the_lie', name: { sv: 'Hitta felet: Bas/Exp', en: 'Find error: Base/Exp' }, desc: { sv: 'Vanliga misstag', en: 'Common mistakes' } },
          { key: 'ten_positive_exponent', name: { sv: 'Tiopotenser (Pos)', en: 'Powers of ten (Pos)' }, desc: { sv: 'Stora tal', en: 'Large numbers' } },
          { key: 'ten_negative_exponent', name: { sv: 'Tiopotenser (Neg)', en: 'Powers of ten (Neg)' }, desc: { sv: 'Små tal', en: 'Small numbers' } },
          { key: 'ten_inverse_counting', name: { sv: 'Räkna nollor', en: 'Count zeros' }, desc: { sv: 'Skriv som 10^n', en: 'Write as 10^n' } },
          { key: 'scientific_to_form', name: { sv: 'Till Grundpotensform', en: 'To Scientific Notation' }, desc: { sv: 'a * 10^n', en: 'a * 10^n' } },
          { key: 'scientific_missing_mantissa', name: { sv: 'Hitta mantissan', en: 'Find mantissa' }, desc: { sv: 'Talet mellan 1-10', en: 'Number between 1-10' } },
          { key: 'root_calc', name: { sv: 'Kvadratrötter', en: 'Square roots' }, desc: { sv: 'Roten ur x', en: 'Square root of x' } },
          { key: 'root_inverse_algebra', name: { sv: 'Ekvation x^2', en: 'Equation x^2' }, desc: { sv: 'Lös ut x', en: 'Solve for x' } },
          { key: 'law_multiplication', name: { sv: 'Lag: Multiplikation', en: 'Law: Multiplication' }, desc: { sv: 'Addera exponenter', en: 'Add exponents' } },
          { key: 'law_division', name: { sv: 'Lag: Division', en: 'Law: Division' }, desc: { sv: 'Subtrahera exponenter', en: 'Subtract exponents' } },
          { key: 'law_mult_div_combined', name: { sv: 'Lag: Mult & Div', en: 'Law: Mult & Div' }, desc: { sv: 'Blandade regler', en: 'Mixed rules' } },
          { key: 'law_power_of_power', name: { sv: 'Lag: Potens av potens', en: 'Law: Power of power' }, desc: { sv: 'Multiplicera exponenter', en: 'Multiply exponents' } },
          { key: 'law_all_combined', name: { sv: 'Blandade Lagar', en: 'Mixed Laws' }, desc: { sv: 'Avancerad förenkling', en: 'Advanced simplification' } }
        ]
      },
      ten_powers: {
        name: { sv: 'Tiopotenser & Prefix', en: 'Powers of Ten & Prefixes' },
        variations: [
          {
            key: "big_mult_std",
            name: { sv: "Multiplikation: Stora tal", en: "Multiplication: Large numbers" },
            desc: { sv: "Multiplicera decimaltal med 10, 100, 1000", en: "Multiply decimals by 10, 100, 1000" },
            tags: ["word_problem_ready"],
            contextType: "ten_powers_mult_large",
            extractorPattern: /(?<num>[\d,.]+)\s*·\s*(?<power>10|100|1000|10000)/
          },
          {
            key: "big_div_std",
            name: { sv: "Division: Stora tal", en: "Division: Large numbers" },
            desc: { sv: "Dividera decimaltal med 10, 100, 1000", en: "Divide decimals by 10, 100, 1000" },
            tags: ["word_problem_ready"],
            contextType: "ten_powers_div_large",
            extractorPattern: /\\frac{\s*(?<num>[\d,.]+)\s*}{\s*(?<power>10|100|1000|10000)\s*}/
          },
          { key: 'big_missing_factor', name: { sv: 'Hitta 10-faktorn', en: 'Find 10-factor' }, desc: { sv: 'Vad multiplicerades?', en: 'What was multiplied?' } },
          { key: 'power_discovery', name: { sv: 'Potensform', en: 'Power form' }, desc: { sv: 'Skriv som 10^n', en: 'Write as 10^n' } },
          { key: 'reciprocal_equivalence', name: { sv: 'Inverser (0,1/0,01)', en: 'Reciprocals (0.1/0.01)' }, desc: { sv: '0,1 = 1/10', en: '0.1 = 1/10' } },
          { key: 'concept_spot_lie', name: { sv: 'Hitta felet: 10-bas', en: 'Find error: base 10' }, desc: { sv: 'Konceptuell förståelse', en: 'Conceptual understanding' } },
          {
            key: "decimal_mult_std",
            name: { sv: "Multiplikation: Små tal", en: "Multiplication: Small numbers" },
            desc: { sv: "Multiplicera med decimala tiopotenser (0,1, 0,01)", en: "Multiply by decimal powers of ten (0.1, 0.01)" },
            tags: ["word_problem_ready"],
            contextType: "ten_powers_mult_small",
            extractorPattern: /(?<num>[\d,.]+)\s*·\s*(?<factor>0[.,]0*1)/
          },
          {
            key: "decimal_div_std",
            name: { sv: "Division: Små tal", en: "Division: Small numbers" },
            desc: { sv: "Dividera med decimala tiopotenser (0,1, 0,01)", en: "Divide by decimal powers of ten (0.1, 0.01)" },
            tags: ["word_problem_ready"],
            contextType: "ten_powers_div_small",
            extractorPattern: /\\frac{\s*(?<num>[\d,.]+)\s*}{\s*(?<factor>0[.,]0*1)\s*}/
          }
        ]
      }
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
          { key: 'classification_visual', name: { sv: 'Vinkeltyper', en: 'Angle types' }, desc: { sv: 'Spetsig, Rät, Trubbig', en: 'Acute, Right, Obtuse' } },
          { key: 'classification_check_acute', name: { sv: 'Är det spetsig?', en: 'Is it acute?' }, desc: { sv: '<90 grader', en: '<90 degrees' } },
          { key: 'comp_supp_visual', name: { sv: 'Grannvinklar', en: 'Neighbor angles' }, desc: { sv: 'Summa 180 eller 90', en: 'Sum 180 or 90' } },
          { key: 'vertical_side_visual', name: { sv: 'Vertikalvinklar', en: 'Vertical angles' }, desc: { sv: 'Mittemot varandra', en: 'Opposite each other' } },
          { key: 'triangle_sum_visual', name: { sv: 'Triangelns summa', en: 'Triangle sum' }, desc: { sv: 'Alltid 180 grader', en: 'Always 180 degrees' } },
          { key: 'quad_missing', name: { sv: 'Fyrhörning', en: 'Quadrilateral' }, desc: { sv: 'Summa 360 grader', en: 'Sum 360 degrees' } },
          { key: 'parallel_visual', name: { sv: 'Parallella linjer', en: 'Parallel lines' }, desc: { sv: 'Alternat/Likbelägen', en: 'Alternate/Corresponding' } }
        ]
      },
      pythagoras: {
        name: { sv: 'Pythagoras Sats', en: 'Pythagorean Theorem' },
        variations: [
          { key: 'sqrt_calc', name: { sv: 'Kvadratrot', en: 'Square root' }, desc: { sv: 'Beräkning', en: 'Calculation' } },
          { key: 'square_calc', name: { sv: 'Kvadrat', en: 'Square' }, desc: { sv: 'Tal i kvadrat', en: 'Number squared' } },
          { key: 'missing_square', name: { sv: 'Invers kvadrat', en: 'Inverse square' }, desc: { sv: 'x^2 = a', en: 'x^2 = a' } },
          { key: 'sqrt_estimation', name: { sv: 'Uppskatta rot', en: 'Estimate root' }, desc: { sv: 'Ja/Nej frågor', en: 'Yes/No questions' } },
          { key: 'hyp_visual', name: { sv: 'Hitta Hypotenusan', en: 'Find Hypotenuse' }, desc: { sv: 'a^2 + b^2 = c^2', en: 'a^2 + b^2 = c^2' } },
          { key: 'hyp_equation', name: { sv: 'Ekvation: Hypotenusa', en: 'Equation: Hypotenuse' }, desc: { sv: 'Rätt uppställning', en: 'Correct setup' } },
          { key: 'leg_visual', name: { sv: 'Hitta Kateten', en: 'Find Leg' }, desc: { sv: 'c^2 - a^2 = b^2', en: 'c^2 - a^2 = b^2' } },
          { key: 'leg_concept', name: { sv: 'Koncept: Katet', en: 'Concept: Leg' }, desc: { sv: 'Subtraktion krävs', en: 'Subtraction required' } },
          { key: 'app_ladder', name: { sv: 'Problem: Stegen', en: 'Problem: The Ladder' }, desc: { sv: 'Lutande stege', en: 'Leaning ladder' } },
          { key: 'app_diagonal', name: { sv: 'Problem: Diagonal', en: 'Problem: Diagonal' }, desc: { sv: 'Rektangelns diagonal', en: 'Rectangle diagonal' } },
          { key: 'conv_check', name: { sv: 'Rätvinklig?', en: 'Right-angled?' }, desc: { sv: 'Kontrollera satsen', en: 'Check the theorem' } }
        ]
      },
      similarity: {
        name: { sv: 'Likformighet', en: 'Similarity' },
        variations: [
          { key: 'sim_rect_check', name: { sv: 'Är de likformiga?', en: 'Are they similar?' }, desc: { sv: 'Rektanglar', en: 'Rectangles' } },
          { key: 'sim_tri_angle_check', name: { sv: 'Likformighet: Vinklar', en: 'Similarity: Angles' }, desc: { sv: 'Samma vinklar', en: 'Same angles' } },
          { key: 'sim_tri_side_check', name: { sv: 'Likformighet: Sidor', en: 'Similarity: Sides' }, desc: { sv: 'Proportioner', en: 'Proportions' } },
          { key: 'sim_concept_lie', name: { sv: 'Hitta felet: Teori', en: 'Find error: Theory' }, desc: { sv: 'Begreppsförståelse', en: 'Conceptual understanding' } },
          { key: 'sim_calc_big', name: { sv: 'Beräkna stor sida', en: 'Calculate long side' }, desc: { sv: 'Multiplicera med k', en: 'Multiply by k' } },
          { key: 'sim_calc_small', name: { sv: 'Beräkna liten sida', en: 'Calculate short side' }, desc: { sv: 'Dividera med k', en: 'Divide by k' } },
          { key: 'sim_find_k', name: { sv: 'Hitta skalfaktor', en: 'Find scale factor' }, desc: { sv: 'Kvot av sidor', en: 'Ratio of sides' } },
          { key: 'transversal_total', name: { sv: 'Transversal: Hela', en: 'Transversal: Total' }, desc: { sv: 'Söker stora basen', en: 'Seeking large base' } },
          { key: 'transversal_extension', name: { sv: 'Transversal: Del', en: 'Transversal: Part' }, desc: { sv: 'Del av sidosidan', en: 'Part of side' } },
          { key: 'transversal_concept_id', name: { sv: 'Identifiera fall', en: 'Identify case' }, desc: { sv: 'Topp vs Transversal', en: 'Top vs Transversal' } },
          { key: 'pythagoras_sim_hyp', name: { sv: 'Likf. & Pythagoras', en: 'Sim. & Pythagoras' }, desc: { sv: 'Kombinerad (Hyp)', en: 'Combined (Hyp)' } }
        ]
      },
      scale: {
        name: { sv: 'Skala', en: 'Scale' },
        variations: [
          { key: 'concept_lie', name: { sv: 'Hitta felet: Skala', en: 'Find error: Scale' }, desc: { sv: 'Analysera påstående', en: 'Analyze statement' } },
          {
            key: "calc_real",
            name: { sv: "Beräkna verklighet: Längd", en: "Calculate Reality: Length" },
            desc: { sv: "Använd skalan 1:X och ritningens mått för att beräkna den verkliga längden", en: "Use scale 1:X and drawing measurements to calculate the actual length" },
            tags: ["word_problem_ready"],
            contextType: "scale_calc_real",
            extractorPattern: /1:(?<scale>\d+)[\s\S]*sträcka\s*(?<imgCm>\d+)\s*cm/i
          },
          { key: 'calc_image', name: { sv: 'Beräkna bild', en: 'Calculate image' }, desc: { sv: 'Verklighet till bild', en: 'Reality to image' } },
          { key: 'find_scale', name: { sv: 'Bestäm skalan', en: 'Determine scale' }, desc: { sv: '1:X form', en: '1:X form' } },
          { key: 'map_real', name: { sv: 'Karta till verklighet', en: 'Map to reality' }, desc: { sv: 'Använd kartskala', en: 'Use map scale' } },
          { key: 'blueprint_draw', name: { sv: 'Ritning: Beräkna cm', en: 'Blueprint: Calc cm' }, desc: { sv: 'Skala 1:50', en: 'Scale 1:50' } },
          { key: 'microscope_calc', name: { sv: 'Förstoring (Mikroskop)', en: 'Magnification (Micro)' }, desc: { sv: 'X:1 form', en: 'X:1 form' } },
          { key: 'area_concept', name: { sv: 'Areaskala: Koncept', en: 'Area scale: Concept' }, desc: { sv: 'Längdskala i kvadrat', en: 'Length scale squared' } },
          {
            key: "area_calc_large",
            name: { sv: "Beräkna verklighet: Area", en: "Calculate Reality: Area" },
            desc: { sv: "Använd längdskalan i kvadrat för att beräkna den verkliga arean", en: "Use the length scale squared to calculate the actual area" },
            tags: ["word_problem_ready"],
            contextType: "scale_area_forward",
            extractorPattern: /1:(?<scale>\d+)[\s\S]*arean\s*(?<smallA>\d+)\s*cm²/i
          },
          {
            key: "area_reverse",
            name: { sv: "Bestäm skala utifrån area", en: "Determine Scale from Area" },
            desc: { sv: "Beräkna längdskalan genom att dra kvadratroten ur areaskalan", en: "Calculate the length scale by taking the square root of the area scale" },
            tags: ["word_problem_ready"],
            contextType: "scale_area_reverse",
            extractorPattern: /arean\s*(?<smallA>\d+)\s*cm²[\s\S]*arean\s*(?<largeA>\d+)\s*cm²/i
          }
        ]
      },
      volume: {
        name: { sv: 'Volym & Yta', en: 'Volume & Surface Area' },
        variations: [
          { key: 'vol_cuboid_std', name: { sv: 'Volym: Rätblock', en: 'Volume: Cuboid' }, desc: { sv: 'l * b * h', en: 'l * w * h' } },
          { key: 'vol_cuboid_inverse', name: { sv: 'Rätblock: Hitta höjd', en: 'Cuboid: Find height' }, desc: { sv: 'Givet V, sök h', en: 'Given V, seek h' } },
          { key: 'vol_cuboid_scaling', name: { sv: 'Rätblock: Skalning', en: 'Cuboid: Scaling' }, desc: { sv: 'Ökad höjd', en: 'Increased height' } },
          { key: 'vol_tri_prism_std', name: { sv: 'Volym: Prisma', en: 'Volume: Prism' }, desc: { sv: 'Basarea * längd', en: 'Base area * length' } },
          { key: 'vol_cyl_std', name: { sv: 'Volym: Cylinder', en: 'Volume: Cylinder' }, desc: { sv: 'pi * r^2 * h', en: 'pi * r^2 * h' } },
          { key: 'vol_pyramid_std', name: { sv: 'Volym: Pyramid', en: 'Volume: Pyramid' }, desc: { sv: '(Bas * h) / 3', en: '(Base * h) / 3' } },
          { key: 'vol_cone_std', name: { sv: 'Volym: Kon', en: 'Volume: Cone' }, desc: { sv: '(Cirkel * h) / 3', en: '(Circle * h) / 3' } },
          { key: 'vol_sphere_std', name: { sv: 'Volym: Klot', en: 'Volume: Sphere' }, desc: { sv: '4*pi*r^3 / 3', en: '4*pi*r^3 / 3' } },
          { key: 'vol_silo_std', name: { sv: 'Silo (Cyl+Halvklot)', en: 'Silo (Cyl+Hemis)' }, desc: { sv: 'Sammansatt volym', en: 'Composite volume' } },
          { key: 'vol_icecream_std', name: { sv: 'Strut (Kon+Halvklot)', en: 'Cone (Cone+Hemis)' }, desc: { sv: 'Sammansatt volym', en: 'Composite volume' } },
          { key: 'vol_units_liter', name: { sv: 'Enheter: Liter', en: 'Units: Liter' }, desc: { sv: 'dm3 = liter', en: 'dm3 = liter' } },
          { key: 'vol_units_m3', name: { sv: 'Enheter: Kubikmeter', en: 'Units: Cubic meter' }, desc: { sv: 'm3 till liter', en: 'm3 to liter' } },
          { key: 'sa_cuboid', name: { sv: 'Begränsningsyta: Rätbl.', en: 'Surface area: Cuboid' }, desc: { sv: 'Alla sex sidor', en: 'All six sides' } },
          { key: 'sa_sphere', name: { sv: 'Begränsningsyta: Klot', en: 'Surface area: Sphere' }, desc: { sv: '4 * pi * r^2', en: '4 * pi * r^2' } },
          { key: 'vol_unit_conv', name: { sv: 'Volym: Enheter', en: 'Volume: Units' }, desc: { sv: 'Omvandla mellan dm³, cm³, liter och ml', en: 'Convert between dm³, cm³, liters and ml' } },
          { key: 'vol_word_unit', name: { sv: 'Volym: Vardagsproblem', en: 'Volume: Word Problems' }, desc: { sv: 'Beräkna volym och svara i liter/ml (med bild)', en: 'Calculate volume and answer in liters/ml (with image)' } }
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
          { key: 'find_mode', name: { sv: 'Typvärde', en: 'Mode' }, desc: { sv: 'Vanligaste värdet', en: 'Most common value' } },
          { key: 'find_range', name: { sv: 'Variationsbredd', en: 'Range' }, desc: { sv: 'Max - Min', en: 'Max - Min' } },
          { key: 'find_min_max', name: { sv: 'Minsta/Största tal', en: 'Min/Max number' }, desc: { sv: 'Hitta extrempunkter', en: 'Find extremes' } },
          { key: 'calc_mean', name: { sv: 'Medelvärde', en: 'Mean' }, desc: { sv: 'Beräkna genomsnitt', en: 'Calculate average' } },
          { key: 'mean_concept_balance', name: { sv: 'Medel: Koncept', en: 'Mean: Concept' }, desc: { sv: 'Effekt av nytt tal', en: 'Effect of new value' } },
          { key: 'median_odd', name: { sv: 'Median', en: 'Median' }, desc: { sv: 'Talet i mitten', en: 'Middle number' } },
          { key: 'reverse_mean_calc', name: { sv: 'Hitta saknat tal', en: 'Find missing number' }, desc: { sv: 'Givet medelvärde', en: 'Given mean' } },
          { key: 'freq_count', name: { sv: 'Tabell: Totalt antal', en: 'Table: Total count' }, desc: { sv: 'Summera frekvens', en: 'Sum frequency' } },
          { key: 'freq_mode', name: { sv: 'Tabell: Typvärde', en: 'Table: Mode' }, desc: { sv: 'Högst frekvens', en: 'Highest frequency' } },
          { key: 'real_measure_choice', name: { sv: 'Välj Lägesmått', en: 'Choose measure' }, desc: { sv: 'Medel vs Median', en: 'Mean vs Median' } },
          { key: 'real_weighted_missing', name: { sv: 'Viktat medelvärde', en: 'Weighted average' }, desc: { sv: 'Sammansatt snitt', en: 'Composite average' } }
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