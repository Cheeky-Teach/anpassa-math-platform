/**
 * MASTER REGISTRY OF SKILL BUCKETS (VARIATION KEYS)
 * Refactored for Bilingual Support (SV/EN)
 * * STRUCTURE:
 * Category -> Topic -> Variations
 * Each variation corresponds to a specific 'case' in the generator's generateByVariation() method.
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
          { key: 'onestep_calc', name: { sv: 'Ensteg: Beräkning', en: 'One-step: Calculation' }, desc: { sv: 'Lös enkla x + a = b', en: 'Solve simple x + a = b' } },
          { key: 'onestep_concept_inverse', name: { sv: 'Ensteg: Invers', en: 'One-step: Inverse' }, desc: { sv: 'Välj rätt räknesätt (+/-/*/÷)', en: 'Choose the correct operation' } },
          { key: 'onestep_spot_lie', name: { sv: 'Hitta felet: Ensteg', en: 'Find the error: One-step' }, desc: { sv: 'Identifiera felaktig lösning', en: 'Identify incorrect solutions' } },
          { key: 'twostep_calc', name: { sv: 'Tvåsteg: Beräkning', en: 'Two-step: Calculation' }, desc: { sv: 'ax + b = c', en: 'ax + b = c' } },
          { key: 'twostep_concept_order', name: { sv: 'Tvåsteg: Ordning', en: 'Two-step: Order' }, desc: { sv: 'Vilket steg tas först?', en: 'Which step is taken first?' } },
          { key: 'paren_calc', name: { sv: 'Parenteser: Beräkning', en: 'Parentheses: Calculation' }, desc: { sv: 'a(x + b) = c', en: 'a(x + b) = c' } },
          { key: 'paren_lie_distribution', name: { sv: 'Hitta felet: Parentes', en: 'Find the error: Parentheses' }, desc: { sv: 'Analysera multiplikation i parentes', en: 'Analyze distribution errors' } },
          { key: 'bothsides_calc', name: { sv: 'X på båda sidor', en: 'X on both sides' }, desc: { sv: 'Samla x-termer på en sida', en: 'Collect x-terms on one side' } },
          { key: 'bothsides_concept_strategy', name: { sv: 'X på båda sidor: Strategi', en: 'X on both sides: Strategy' }, desc: { sv: 'Håll antalet x positivt', en: 'Keep the number of x positive' } }
        ]
      },
      equations_word: {
        name: { sv: 'Ekvationer: Problemlösning', en: 'Equations: Problem Solving' },
        variations: [
          { key: 'rate_fixed_add_write', name: { sv: 'Skriv: Fast + Rörlig', en: 'Write: Fixed + Variable' }, desc: { sv: 'Teckna uttryck y = kx + m', en: 'Formulate expression y = kx + m' } },
          { key: 'rate_fixed_add_solve', name: { sv: 'Lös: Fast + Rörlig', en: 'Solve: Fixed + Variable' }, desc: { sv: 'Beräkna x givet total', en: 'Calculate x given total' } },
          { key: 'rate_fixed_sub_write', name: { sv: 'Skriv: Minskning', en: 'Write: Decrease' }, desc: { sv: 'Teckna uttryck y = m - kx', en: 'Formulate expression y = m - kx' } },
          { key: 'rate_fixed_sub_solve', name: { sv: 'Lös: Minskning', en: 'Solve: Decrease' }, desc: { sv: 'När tar värdet slut?', en: 'When does the value run out?' } },
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
          { key: 'distribute_inverse_factor', name: { sv: 'Faktorisera', en: 'Factorize' }, desc: { sv: 'Bryt ut största faktor', en: 'Factor out greatest common factor' } },
          { key: 'distribute_plus', name: { sv: 'Parentes (+)', en: 'Parentheses (+)' }, desc: { sv: 'Multiplicera in positivt tal', en: 'Multiply in positive number' } },
          { key: 'distribute_minus', name: { sv: 'Parentes (-)', en: 'Parentheses (-)' }, desc: { sv: 'Multiplicera in negativt tal', en: 'Multiply in negative number' } },
          { key: 'distribute_double', name: { sv: 'Dubbla parenteser', en: 'Double parentheses' }, desc: { sv: 'Expandera två parenteser', en: 'Expand two parentheses' } },
          { key: 'distribute_combine_std', name: { sv: 'Expandera & Förenkla', en: 'Expand & Simplify' }, desc: { sv: 'Multiplicera och samla termer', en: 'Multiply and combine terms' } },
          { key: 'sub_concept_plus_logic', name: { sv: 'Teckenregler', en: 'Sign rules' }, desc: { sv: 'Plus framför parentes', en: 'Plus in front of parentheses' } },
          { key: 'sub_block_plus', name: { sv: 'Minusparentes (+)', en: 'Minus parentheses (+)' }, desc: { sv: '-(ax + b)', en: '-(ax + b)' } },
          { key: 'sub_block_minus', name: { sv: 'Minusparentes (-)', en: 'Minus parentheses (-)' }, desc: { sv: '-(ax - b)', en: '-(ax - b)' } },
          { key: 'word_candy', name: { sv: 'Uttryck: Godispåsar', en: 'Expressions: Candy bags' }, desc: { sv: 'Teckna uttryck', en: 'Formulate expression' } },
          { key: 'word_discount', name: { sv: 'Uttryck: Rabatt', en: 'Expressions: Discount' }, desc: { sv: 'Prisrelationer', en: 'Price relations' } },
          { key: 'word_combined_age_tri', name: { sv: 'Uttryck: Åldrar', en: 'Expressions: Ages' }, desc: { sv: 'Tre personers ålder', en: 'Ages of three people' } },
          { key: 'word_rect_perimeter', name: { sv: 'Uttryck: Omkrets', en: 'Expressions: Perimeter' }, desc: { sv: 'Rektangel med x', en: 'Rectangle with x' } },
          { key: 'word_savings', name: { sv: 'Uttryck: Sparande', en: 'Expressions: Savings' }, desc: { sv: 'Saldo med uttag/insättning', en: 'Balance with withdrawal/deposit' } },
          { key: 'word_passengers', name: { sv: 'Uttryck: Passagerare', en: 'Expressions: Passengers' }, desc: { sv: 'Förändring på buss', en: 'Changes on a bus' } },
          { key: 'word_garden', name: { sv: 'Uttryck: Trädgård', en: 'Expressions: Garden' }, desc: { sv: 'Plantering och bortfall', en: 'Planting and loss' } },
          { key: 'word_sports', name: { sv: 'Uttryck: Sport', en: 'Expressions: Sports' }, desc: { sv: 'Poängberäkning', en: 'Score calculation' } },
          { key: 'word_phone_battery', name: { sv: 'Uttryck: Batteri', en: 'Expressions: Battery' }, desc: { sv: 'Laddning och förbrukning', en: 'Charging and consumption' } }
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
          { key: 'add_std_horizontal', name: { sv: 'Addition: Huvudräkning', en: 'Addition: Mental Math' }, desc: { sv: 'Strategier', en: 'Strategies' } },
          { key: 'add_missing_variable', name: { sv: 'Addition: Hitta termen', en: 'Addition: Find the term' }, desc: { sv: 'a + x = b', en: 'a + x = b' } },
          { key: 'add_spot_the_lie', name: { sv: 'Hitta felet: Addition', en: 'Find error: Addition' }, desc: { sv: 'Felsökning', en: 'Troubleshooting' } },
          { key: 'sub_std_vertical', name: { sv: 'Subtraktion: Uppställning', en: 'Subtraction: Column Method' }, desc: { sv: 'Växling', en: 'Borrowing' } },
          { key: 'sub_std_horizontal', name: { sv: 'Subtraktion: Huvudräkning', en: 'Subtraction: Mental Math' }, desc: { sv: 'Strategier', en: 'Strategies' } },
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
          { key: 'fluency_chain_4', name: { sv: 'Add/Sub Kedja (4)', en: 'Add/Sub Chain (4)' }, desc: { sv: 'Flerstegsräkning', en: 'Multi-step calculation' } },
          { key: 'fluency_chain_5', name: { sv: 'Add/Sub Kedja (5)', en: 'Add/Sub Chain (5)' }, desc: { sv: 'Långa uttryck', en: 'Long expressions' } },
          { key: 'fluency_double_neg', name: { sv: 'Dubbla minustecken', en: 'Double negative signs' }, desc: { sv: '-(-a) = +a', en: '-(-a) = +a' } },
          { key: 'fluency_plus_neg', name: { sv: 'Plus minus', en: 'Plus minus' }, desc: { sv: '+(-a) = -a', en: '+(-a) = -a' } },
          { key: 'fluency_transform_match', name: { sv: 'Matcha uttryck', en: 'Match expressions' }, desc: { sv: 'Olika skrivsätt', en: 'Different notations' } },
          { key: 'mult_same_sign', name: { sv: 'Mult: Samma tecken', en: 'Mult: Same signs' }, desc: { sv: 'Minus * Minus = Plus', en: 'Minus * Minus = Plus' } },
          { key: 'mult_diff_sign', name: { sv: 'Mult: Olika tecken', en: 'Mult: Different signs' }, desc: { sv: 'Minus * Plus = Minus', en: 'Minus * Plus = Minus' } },
          { key: 'mult_chain', name: { sv: 'Mult: Kedja', en: 'Mult: Chain' }, desc: { sv: 'Jämnt/Udda antal minus', en: 'Even/Odd number of minuses' } },
          { key: 'div_basic', name: { sv: 'Division: Grund', en: 'Division: Basic' }, desc: { sv: 'Enkel division', en: 'Simple division' } },
          { key: 'div_fraction', name: { sv: 'Division: Bråkform', en: 'Division: Fractions' }, desc: { sv: 'Tecken i bråk', en: 'Signs in fractions' } },
          { key: 'div_check_logic', name: { sv: 'Division: Kontroll', en: 'Division: Checking' }, desc: { sv: 'Rimlighetsbedömning', en: 'Reasonableness' } }
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
          { key: 'mixed_missing', name: { sv: 'Blandad form: Pussel', en: 'Mixed form: Puzzle' }, desc: { sv: 'Hitta täljaren', en: 'Find the numerator' } },
          { key: 'mixed_convert_imp', name: { sv: 'Till bråkform', en: 'To improper fraction' }, desc: { sv: 'Blandad -> Bråk', en: 'Mixed -> Improper' } },
          { key: 'mixed_convert_mix', name: { sv: 'Till blandad form', en: 'To mixed form' }, desc: { sv: 'Bråk -> Blandad', en: 'Improper -> Mixed' } },
          { key: 'simplify_missing', name: { sv: 'Likvärdiga bråk', en: 'Equivalent fractions' }, desc: { sv: 'Förlängning/Förkortning', en: 'Extension/Simplification' } },
          { key: 'simplify_concept', name: { sv: 'Koncept: Förkortning', en: 'Concept: Simplification' }, desc: { sv: 'Ändras värdet?', en: 'Does the value change?' } },
          { key: 'simplify_calc', name: { sv: 'Förkorta bråk', en: 'Simplify fraction' }, desc: { sv: 'Enklaste form', en: 'Simplest form' } },
          { key: 'decimal_inequality', name: { sv: 'Jämför bråk/decimal', en: 'Compare fraction/decimal' }, desc: { sv: 'Större, mindre, lika', en: 'Greater, smaller, equal' } },
          { key: 'decimal_to_dec', name: { sv: 'Bråk till decimal', en: 'Fraction to decimal' }, desc: { sv: 'Ex: 1/4 = 0,25', en: 'Ex: 1/4 = 0.25' } },
          { key: 'decimal_to_frac', name: { sv: 'Decimal till bråk', en: 'Decimal to fraction' }, desc: { sv: 'Ex: 0,5 = 1/2', en: 'Ex: 0.5 = 1/2' } }
        ]
      },
      fractions_arith: {
        name: { sv: 'Bråk: Räknesätt', en: 'Fraction Operations' },
        variations: [
          { key: 'add_concept', name: { sv: 'Addition: Regler', en: 'Addition: Rules' }, desc: { sv: 'Addera täljare, ej nämnare', en: 'Add numerators, not denominators' } },
          { key: 'add_missing', name: { sv: 'Addition: Pussel', en: 'Addition: Puzzle' }, desc: { sv: 'Hitta saknad term', en: 'Find missing term' } },
          { key: 'add_calc', name: { sv: 'Addition: Samma nämnare', en: 'Addition: Same denom' }, desc: { sv: 'Enkel addition', en: 'Simple addition' } },
          { key: 'lcd_find', name: { sv: 'Hitta MGN', en: 'Find LCD' }, desc: { sv: 'Minsta gemensamma nämnare', en: 'Lowest common denominator' } },
          { key: 'add_error_spot', name: { sv: 'Hitta felet: Olika nämnare', en: 'Find error: Diff denom' }, desc: { sv: 'Vanliga misstag', en: 'Common mistakes' } },
          { key: 'add_diff_denom', name: { sv: 'Addition: Olika nämnare', en: 'Addition: Diff denom' }, desc: { sv: 'Förlängning krävs', en: 'Extension required' } },
          { key: 'mixed_est', name: { sv: 'Blandad: Uppskattning', en: 'Mixed: Estimation' }, desc: { sv: 'Rimlighet', en: 'Reasonableness' } },
          { key: 'mixed_add_same', name: { sv: 'Blandad Add: Samma', en: 'Mixed Add: Same' }, desc: { sv: 'Addera heltal och bråk', en: 'Add integers and fractions' } },
          { key: 'mixed_add_diff', name: { sv: 'Blandad Add: Olika', en: 'Mixed Add: Diff' }, desc: { sv: 'MGN med blandad form', en: 'LCD with mixed form' } },
          { key: 'mixed_sub_same', name: { sv: 'Blandad Sub: Samma', en: 'Mixed Sub: Same' }, desc: { sv: 'Subtraktion', en: 'Subtraction' } },
          { key: 'mixed_sub_diff', name: { sv: 'Blandad Sub: Olika', en: 'Mixed Sub: Diff' }, desc: { sv: 'Låna från heltal', en: 'Borrow from integer' } },
          { key: 'mult_scaling', name: { sv: 'Multiplikation: Skalning', en: 'Mult: Scaling' }, desc: { sv: 'Större eller mindre?', en: 'Larger or smaller?' } },
          { key: 'mult_area', name: { sv: 'Multiplikation: Area', en: 'Mult: Area' }, desc: { sv: 'Visuell modell', en: 'Visual model' } },
          { key: 'mult_calc', name: { sv: 'Multiplikation', en: 'Multiplication' }, desc: { sv: 'Täljare*Täljare / Nämnare*Nämnare', en: 'Top*Top / Bottom*Bottom' } },
          { key: 'div_operator', name: { sv: 'Division: Koncept', en: 'Division: Concept' }, desc: { sv: 'Hur många ryms?', en: 'How many fit?' } },
          { key: 'div_reciprocal', name: { sv: 'Inverterade tal', en: 'Reciprocal numbers' }, desc: { sv: 'Vänd på bråket', en: 'Flip the fraction' } },
          { key: 'div_calc', name: { sv: 'Division', en: 'Division' }, desc: { sv: 'Mult med invers', en: 'Mult by inverse' } }
        ]
      },
      percent: {
        name: { sv: 'Procent', en: 'Percent' },
        variations: [
          { key: 'visual_translation', name: { sv: 'Bild till Procent', en: 'Visual to Percent' }, desc: { sv: 'Tolka figurer', en: 'Interpret figures' } },
          { key: 'visual_lie', name: { sv: 'Hitta felet: Bild', en: 'Find error: Visual' }, desc: { sv: 'Visuell analys', en: 'Visual analysis' } },
          { key: 'equivalence', name: { sv: 'Bråk-Decimal-Procent', en: 'Fraction-Decimal-Percent' }, desc: { sv: 'Samband', en: 'Relationships' } },
          { key: 'benchmark_calc', name: { sv: 'Huvudräkning (Bas)', en: 'Mental Math (Basic)' }, desc: { sv: '10%, 25%, 50%', en: '10%, 25%, 50%' } },
          { key: 'benchmark_inverse', name: { sv: 'Hitta 100% (Bas)', en: 'Find 100% (Basic)' }, desc: { sv: 'Om 10% är 5, vad är allt?', en: 'If 10% is 5, what is total?' } },
          { key: 'benchmark_commutative', name: { sv: 'Kommutativitet', en: 'Commutativity' }, desc: { sv: 'x% av y = y% av x', en: 'x% of y = y% of x' } },
          { key: 'composition', name: { sv: 'Sammansättning', en: 'Composition' }, desc: { sv: 'Bygg 35% av 10% och 25%', en: 'Build 35% from 10% and 25%' } },
          { key: 'decomposition', name: { sv: 'Uppdelning', en: 'Decomposition' }, desc: { sv: 'Dela upp svåra procent', en: 'Break down hard percents' } },
          { key: 'estimation', name: { sv: 'Överslagsräkning', en: 'Estimation' }, desc: { sv: 'Ungefärligt värde', en: 'Approximate value' } },
          { key: 'equation_calc', name: { sv: 'Procentekvationen', en: 'Percent Equation' }, desc: { sv: 'Andelen * Hela = Delen', en: 'Share * Whole = Part' } },
          { key: 'equation_missing_part', name: { sv: 'Hitta delen', en: 'Find the part' }, desc: { sv: 'x% av y', en: 'x% of y' } },
          { key: 'equation_missing_whole', name: { sv: 'Hitta det hela', en: 'Find the whole' }, desc: { sv: 'Delen / Andelen', en: 'Part / Share' } },
          { key: 'reverse_add_tax', name: { sv: 'Baklänges: Moms', en: 'Backwards: VAT' }, desc: { sv: 'Hitta pris före skatt', en: 'Find price before tax' } },
          { key: 'reverse_find_original', name: { sv: 'Baklänges: Ursprung', en: 'Backwards: Original' }, desc: { sv: 'Hitta startvärde', en: 'Find starting value' } },
          { key: 'change_calc', name: { sv: 'Beräkna förändring', en: 'Calculate change' }, desc: { sv: 'Skillnad / Ursprung', en: 'Difference / Original' } },
          { key: 'change_diff_vs_pct', name: { sv: 'Kronor vs Procent', en: 'Currency vs Percent' }, desc: { sv: 'Enhetsförståelse', en: 'Unit understanding' } },
          { key: 'change_sequential_trap', name: { sv: 'Fälla: Dubbla ändringar', en: 'Trap: Double changes' }, desc: { sv: '+10% sen -10%', en: '+10% then -10%' } }
        ]
      },
      change_factor: {
        name: { sv: 'Förändringsfaktor', en: 'Change Factor' },
        variations: [
          { key: 'pct_to_factor_inc', name: { sv: 'Ökning till Faktor', en: 'Increase to Factor' }, desc: { sv: '+20% -> 1,20', en: '+20% -> 1.20' } },
          { key: 'pct_to_factor_dec', name: { sv: 'Minskning till Faktor', en: 'Decrease to Factor' }, desc: { sv: '-20% -> 0,80', en: '-20% -> 0.80' } },
          { key: 'factor_to_pct_inc', name: { sv: 'Faktor till Ökning', en: 'Factor to Increase' }, desc: { sv: '1,20 -> +20%', en: '1.20 -> +20%' } },
          { key: 'factor_to_pct_dec', name: { sv: 'Faktor till Minskning', en: 'Factor to Decrease' }, desc: { sv: '0,80 -> -20%', en: '0.80 -> -20%' } },
          { key: 'apply_factor_inc', name: { sv: 'Beräkna nytt (Ökning)', en: 'Calc new (Increase)' }, desc: { sv: 'Start * Faktor', en: 'Start * Factor' } },
          { key: 'apply_factor_dec', name: { sv: 'Beräkna nytt (Minskning)', en: 'Calc new (Decrease)' }, desc: { sv: 'Start * Faktor', en: 'Start * Factor' } },
          { key: 'find_original_inc', name: { sv: 'Hitta gamla (Ökning)', en: 'Find old (Increase)' }, desc: { sv: 'Nytt / Faktor', en: 'New / Factor' } },
          { key: 'find_original_dec', name: { sv: 'Hitta gamla (Minskning)', en: 'Find old (Decrease)' }, desc: { sv: 'Nytt / Faktor', en: 'New / Factor' } },
          { key: 'sequential_factors', name: { sv: 'Total faktor', en: 'Total factor' }, desc: { sv: 'Faktor1 * Faktor2', en: 'Factor1 * Factor2' } },
          { key: 'word_population', name: { sv: 'Problem: Befolkning', en: 'Problem: Population' }, desc: { sv: 'Tillämpning', en: 'Application' } },
          { key: 'word_interest', name: { sv: 'Problem: Ränta', en: 'Problem: Interest' }, desc: { sv: 'Bank och lån', en: 'Bank and loans' } },
          { key: 'word_depreciation', name: { sv: 'Problem: Värdeminskning', en: 'Problem: Depreciation' }, desc: { sv: 'Bil/Maskin', en: 'Car/Machine' } },
          { key: 'word_sale', name: { sv: 'Problem: Rea', en: 'Problem: Sale' }, desc: { sv: 'Rabatter', en: 'Discounts' } },
          { key: 'word_decay', name: { sv: 'Problem: Sönderfall', en: 'Problem: Decay' }, desc: { sv: 'Naturvetenskap', en: 'Science' } },
          { key: 'word_salary', name: { sv: 'Problem: Lön', en: 'Problem: Salary' }, desc: { sv: 'Löneförhandling', en: 'Salary negotiation' } },
          { key: 'word_inflation', name: { sv: 'Problem: Inflation', en: 'Problem: Inflation' }, desc: { sv: 'Prisökningar', en: 'Price increases' } },
          { key: 'word_stock', name: { sv: 'Problem: Aktier', en: 'Problem: Stocks' }, desc: { sv: 'Börsutveckling', en: 'Market development' } }
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
          { key: 'scientific_missing_exponent', name: { sv: 'Hitta exponenten', en: 'Find exponent' }, desc: { sv: 'Antal steg', en: 'Number of steps' } },
          { key: 'root_calc', name: { sv: 'Kvadratrötter', en: 'Square roots' }, desc: { sv: 'Roten ur x', en: 'Square root of x' } },
          { key: 'root_inverse_algebra', name: { sv: 'Ekvation x^2', en: 'Equation x^2' }, desc: { sv: 'Lös ut x', en: 'Solve for x' } },
          { key: 'law_multiplication', name: { sv: 'Lag: Multiplikation', en: 'Law: Multiplication' }, desc: { sv: 'Addera exponenter', en: 'Add exponents' } },
          { key: 'law_division', name: { sv: 'Lag: Division', en: 'Law: Division' }, desc: { sv: 'Subtrahera exponenter', en: 'Subtract exponents' } },
          { key: 'law_addition_trap', name: { sv: 'Fälla: Addition', en: 'Trap: Addition' }, desc: { sv: 'Ingen regel för plus', en: 'No rule for plus' } },
          { key: 'law_mult_div_combined', name: { sv: 'Lag: Mult & Div', en: 'Law: Mult & Div' }, desc: { sv: 'Blandade regler', en: 'Mixed rules' } },
          { key: 'law_power_of_power', name: { sv: 'Lag: Potens av potens', en: 'Law: Power of power' }, desc: { sv: 'Multiplicera exponenter', en: 'Multiply exponents' } },
          { key: 'law_inverse_algebra', name: { sv: 'Potensekvationer', en: 'Power equations' }, desc: { sv: 'Hitta exponenten', en: 'Find the exponent' } },
          { key: 'law_all_combined', name: { sv: 'Blandade Lagar', en: 'Mixed Laws' }, desc: { sv: 'Avancerad förenkling', en: 'Advanced simplification' } }
        ]
      },
      ten_powers: {
        name: { sv: 'Tiopotenser & Prefix', en: 'Powers of Ten & Prefixes' },
        variations: [
          { key: 'big_mult_std', name: { sv: 'Mult med 10/100', en: 'Mult by 10/100' }, desc: { sv: 'Flytta komma höger', en: 'Move decimal right' } },
          { key: 'big_div_std', name: { sv: 'Div med 10/100', en: 'Div by 10/100' }, desc: { sv: 'Flytta komma vänster', en: 'Move decimal left' } },
          { key: 'big_missing_factor', name: { sv: 'Hitta 10-faktorn', en: 'Find 10-factor' }, desc: { sv: 'Vad multiplicerades?', en: 'What was multiplied?' } },
          { key: 'power_discovery', name: { sv: 'Potensform', en: 'Power form' }, desc: { sv: 'Skriv som 10^n', en: 'Write as 10^n' } },
          { key: 'reciprocal_equivalence', name: { sv: 'Inverser', en: 'Reciprocals' }, desc: { sv: '0,1 = 1/10', en: '0.1 = 1/10' } },
          { key: 'concept_spot_lie', name: { sv: 'Hitta felet: 10-bas', en: 'Find error: base 10' }, desc: { sv: 'Konceptuell förståelse', en: 'Conceptual understanding' } },
          { key: 'decimal_div_std', name: { sv: 'Div med 0,1/0,01', en: 'Div by 0.1/0.01' }, desc: { sv: 'Talet blir större', en: 'Number gets larger' } },
          { key: 'decimal_mult_std', name: { sv: 'Mult med 0,1/0,01', en: 'Mult by 0.1/0.01' }, desc: { sv: 'Talet blir mindre', en: 'Number gets smaller' } },
          { key: 'decimal_logic_trap', name: { sv: 'Fälla: Mult/Div', en: 'Trap: Mult/Div' }, desc: { sv: 'Logiskt tänkande', en: 'Logical thinking' } }
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
      geometry: {
        name: { sv: 'Area & Omkrets', en: 'Area & Perimeter' },
        variations: [
          { key: 'perimeter_square', name: { sv: 'Omkrets: Kvadrat', en: 'Perimeter: Square' }, desc: { sv: '4 * sida', en: '4 * side' } },
          { key: 'perimeter_rect', name: { sv: 'Omkrets: Rektangel', en: 'Perimeter: Rectangle' }, desc: { sv: '2b + 2h', en: '2w + 2h' } },
          { key: 'perimeter_parallel', name: { sv: 'Omkrets: Parallellogram', en: 'Perimeter: Parallelogram' }, desc: { sv: 'Samma som rektangel', en: 'Same as rectangle' } },
          { key: 'perimeter_inverse', name: { sv: 'Omkrets: Hitta sidan', en: 'Perimeter: Find side' }, desc: { sv: 'Givet O, hitta x', en: 'Given P, find x' } },
          { key: 'perimeter_lie', name: { sv: 'Hitta felet: Omkrets', en: 'Find error: Perimeter' }, desc: { sv: 'Analysera påstående', en: 'Analyze statement' } },
          { key: 'area_square', name: { sv: 'Area: Kvadrat', en: 'Area: Square' }, desc: { sv: 's * s', en: 's * s' } },
          { key: 'area_rect', name: { sv: 'Area: Rektangel', en: 'Area: Rectangle' }, desc: { sv: 'b * h', en: 'w * h' } },
          { key: 'area_parallel', name: { sv: 'Area: Parallellogram', en: 'Area: Parallelogram' }, desc: { sv: 'b * h (ej sida)', en: 'w * h (not side)' } },
          { key: 'area_inverse', name: { sv: 'Area: Hitta sidan', en: 'Area: Find side' }, desc: { sv: 'Givet A, hitta x', en: 'Given A, find x' } },
          { key: 'area_trap', name: { sv: 'Fälla: Area', en: 'Trap: Area' }, desc: { sv: 'Vinkelrät höjd!', en: 'Perpendicular height!' } },
          { key: 'area_triangle', name: { sv: 'Area: Triangel', en: 'Area: Triangle' }, desc: { sv: '(b * h) / 2', en: '(b * h) / 2' } },
          { key: 'inverse_triangle', name: { sv: 'Triangel: Hitta höjd', en: 'Triangle: Find height' }, desc: { sv: 'Givet A, hitta h', en: 'Given A, find h' } },
          { key: 'perimeter_triangle_right', name: { sv: 'Omkrets: Rätvinklig', en: 'Perimeter: Right-angled' }, desc: { sv: 'Summa av sidor', en: 'Sum of sides' } },
          { key: 'perimeter_triangle_iso', name: { sv: 'Omkrets: Likbent', en: 'Perimeter: Isosceles' }, desc: { sv: 'Två lika sidor', en: 'Two equal sides' } },
          { key: 'perimeter_triangle_scalene', name: { sv: 'Omkrets: Oliksidig', en: 'Perimeter: Scalene' }, desc: { sv: 'Alla sidor olika', en: 'All sides different' } },
          { key: 'combined_rect_tri', name: { sv: 'Sammansatt: Rekt+Tri', en: 'Composite: Rect+Tri' }, desc: { sv: 'Additionsmetoden', en: 'Addition method' } },
          { key: 'combined_l_shape', name: { sv: 'Sammansatt: L-form', en: 'Composite: L-shape' }, desc: { sv: '2 Rektanglar (ihop)', en: '2 Rectangles (joined)' } },
          { key: 'combined_house', name: { sv: 'Sammansatt: Hus', en: 'Composite: House' }, desc: { sv: 'Kvadrat + Triangel', en: 'Square + Triangle' } },
          { key: 'circle_area', name: { sv: 'Cirkel: Area', en: 'Circle: Area' }, desc: { sv: 'pi * r^2', en: 'pi * r^2' } },
          { key: 'circle_perimeter', name: { sv: 'Cirkel: Omkrets', en: 'Circle: Perimeter' }, desc: { sv: 'pi * d', en: 'pi * d' } },
          { key: 'semicircle_area', name: { sv: 'Halvcirkel: Area', en: 'Semicircle: Area' }, desc: { sv: 'Halva arean', en: 'Half the area' } },
          { key: 'semicircle_perimeter', name: { sv: 'Halvcirkel: Omkrets', en: 'Semicircle: Perimeter' }, desc: { sv: 'Båge + Diameter', en: 'Arc + Diameter' } },
          { key: 'area_quarter', name: { sv: 'Kvartscirkel: Area', en: 'Quarter circle: Area' }, desc: { sv: 'Fjärdedels area', en: 'Quarter of area' } },
          { key: 'perimeter_quarter', name: { sv: 'Kvartscirkel: Omkrets', en: 'Quarter circle: Perimeter' }, desc: { sv: 'Båge + Radier', en: 'Arc + Radii' } },
          { key: 'perimeter_house', name: { sv: 'Omkrets: Hus', en: 'Perimeter: House' }, desc: { sv: 'Avancerad (Tak)', en: 'Advanced (Roof)' } },
          { key: 'perimeter_portal', name: { sv: 'Omkrets: Portal', en: 'Perimeter: Portal' }, desc: { sv: 'Väggar + Båge', en: 'Walls + Arc' } },
          { key: 'area_house', name: { sv: 'Area: Hus', en: 'Area: House' }, desc: { sv: 'Rektangel + Triangel', en: 'Rectangle + Triangle' } },
          { key: 'area_portal', name: { sv: 'Area: Portal', en: 'Area: Portal' }, desc: { sv: 'Rektangel + Halvcirkel', en: 'Rectangle + Semicircle' } }
        ]
      },
      angles: {
        name: { sv: 'Vinklar', en: 'Angles' },
        variations: [
          { key: 'classification_visual', name: { sv: 'Vinkeltyper', en: 'Angle types' }, desc: { sv: 'Spetsig, Rät, Trubbig', en: 'Acute, Right, Obtuse' } },
          { key: 'classification_inverse_numeric', name: { sv: 'Klassificera tal', en: 'Classify numbers' }, desc: { sv: 'Vilken typ är 120°?', en: 'What type is 120°?' } },
          { key: 'classification_lie', name: { sv: 'Hitta felet: Typer', en: 'Find error: Types' }, desc: { sv: 'Falska påståenden', en: 'False statements' } },
          { key: 'comp_supp_visual', name: { sv: 'Grannvinklar', en: 'Neighbor angles' }, desc: { sv: 'Summa 180 eller 90', en: 'Sum 180 or 90' } },
          { key: 'comp_supp_inverse', name: { sv: 'Terminologi', en: 'Terminology' }, desc: { sv: 'Supplement/Komplement', en: 'Supp/Comp' } },
          { key: 'vertical_side_visual', name: { sv: 'Vertikalvinklar', en: 'Vertical angles' }, desc: { sv: 'Mittemot varandra', en: 'Opposite each other' } },
          { key: 'vertical_side_lie', name: { sv: 'Hitta felet: Relationer', en: 'Find error: Relations' }, desc: { sv: 'Analys', en: 'Analysis' } },
          { key: 'triangle_sum_visual', name: { sv: 'Triangelns summa', en: 'Triangle sum' }, desc: { sv: 'Alltid 180 grader', en: 'Always 180 degrees' } },
          { key: 'triangle_isosceles', name: { sv: 'Likbent triangel', en: 'Isosceles triangle' }, desc: { sv: 'Basvinklar lika', en: 'Base angles equal' } },
          { key: 'polygon_sum', name: { sv: 'Polygoners summa', en: 'Polygon sum' }, desc: { sv: '(n-2) * 180', en: '(n-2) * 180' } },
          { key: 'polygon_inverse', name: { sv: 'Hitta antalet hörn', en: 'Find vertices' }, desc: { sv: 'Givet vinkelsumma', en: 'Given angle sum' } },
          { key: 'quad_missing', name: { sv: 'Fyrhörning', en: 'Quadrilateral' }, desc: { sv: 'Summa 360', en: 'Sum 360' } },
          { key: 'parallel_visual', name: { sv: 'Parallella linjer', en: 'Parallel lines' }, desc: { sv: 'Z, F och U-vinklar', en: 'Z, F and U angles' } },
          { key: 'parallel_lie', name: { sv: 'Hitta felet: Parallell', en: 'Find error: Parallel' }, desc: { sv: 'Regler för linjer', en: 'Line rules' } }
        ]
      },
      pythagoras: {
        name: { sv: 'Pythagoras Sats', en: 'Pythagorean Theorem' },
        variations: [
          { key: 'sqrt_calc', name: { sv: 'Kvadratrot', en: 'Square root' }, desc: { sv: 'Beräkning', en: 'Calculation' } },
          { key: 'square_calc', name: { sv: 'Kvadrat', en: 'Square' }, desc: { sv: 'Tal gånger sig självt', en: 'Number times itself' } },
          { key: 'missing_square', name: { sv: 'Invers kvadrat', en: 'Inverse square' }, desc: { sv: 'x^2 = a', en: 'x^2 = a' } },
          { key: 'sqrt_estimation', name: { sv: 'Uppskatta rot', en: 'Estimate root' }, desc: { sv: 'Mellan vilka heltal?', en: 'Between which integers?' } },
          { key: 'hyp_visual', name: { sv: 'Hitta Hypotenusan', en: 'Find Hypotenuse' }, desc: { sv: 'a^2 + b^2 = c^2', en: 'a^2 + b^2 = c^2' } },
          { key: 'hyp_equation', name: { sv: 'Ekvation: Hypotenusa', en: 'Equation: Hypotenuse' }, desc: { sv: 'Lös ut c', en: 'Solve for c' } },
          { key: 'hyp_error', name: { sv: 'Hitta felet: Hyp', en: 'Find error: Hyp' }, desc: { sv: 'Vanliga fel', en: 'Common errors' } },
          { key: 'leg_visual', name: { sv: 'Hitta Kateten', en: 'Find Leg' }, desc: { sv: 'c^2 - a^2 = b^2', en: 'c^2 - a^2 = b^2' } },
          { key: 'leg_concept', name: { sv: 'Koncept: Katet', en: 'Concept: Leg' }, desc: { sv: 'Subtraktion krävs', en: 'Subtraction required' } },
          { key: 'leg_text', name: { sv: 'Textproblem: Katet', en: 'Word problem: Leg' }, desc: { sv: 'Tillämpning', en: 'Application' } },
          { key: 'app_ladder', name: { sv: 'Problem: Stegen', en: 'Problem: The Ladder' }, desc: { sv: 'Vardagsproblem', en: 'Everyday problem' } },
          { key: 'app_displacement', name: { sv: 'Problem: Fågelvägen', en: 'Problem: As the crow flies' }, desc: { sv: 'Avstånd', en: 'Distance' } },
          { key: 'app_diagonal', name: { sv: 'Problem: Diagonal', en: 'Problem: Diagonal' }, desc: { sv: 'Rektangelns diagonal', en: 'Rectangle diagonal' } },
          { key: 'conv_check', name: { sv: 'Rätvinklig?', en: 'Right-angled?' }, desc: { sv: 'Kontrollera satsen', en: 'Check the theorem' } },
          { key: 'conv_trap', name: { sv: 'Triangel-fällan', en: 'Triangle trap' }, desc: { sv: 'Är den rät?', en: 'Is it right-angled?' } }
        ]
      },
      scale: {
        name: { sv: 'Skala', en: 'Scale' },
        variations: [
          { key: 'calc_real', name: { sv: 'Beräkna verklighet', en: 'Calculate reality' }, desc: { sv: 'Från bild till verklighet', en: 'From image to reality' } },
          { key: 'calc_map', name: { sv: 'Beräkna avbildning', en: 'Calculate image' }, desc: { sv: 'Från verklighet till bild', en: 'From reality to image' } },
          { key: 'determine_scale', name: { sv: 'Bestäm skalan', en: 'Determine scale' }, desc: { sv: 'Bild / Verklighet', en: 'Image / Reality' } },
          { key: 'compare_scales', name: { sv: 'Jämför skalor', en: 'Compare scales' }, desc: { sv: 'Vilken är störst?', en: 'Which is largest?' } },
          { key: 'area_calc_large', name: { sv: 'Areaskala: Förstoring', en: 'Area scale: Enlargement' }, desc: { sv: 'Längdskala i kvadrat', en: 'Length scale squared' } },
          { key: 'area_calc_small', name: { sv: 'Areaskala: Förminskning', en: 'Area scale: Reduction' }, desc: { sv: 'Dividera med kvadrat', en: 'Divide by square' } },
          { key: 'area_find_scale', name: { sv: 'Hitta Areaskala', en: 'Find Area scale' }, desc: { sv: 'Roten ur areakvot', en: 'Root of area ratio' } }
        ]
      },
      similarity: {
        name: { sv: 'Likformighet', en: 'Similarity' },
        variations: [
          { key: 'sim_rect_check', name: { sv: 'Är de likformiga?', en: 'Are they similar?' }, desc: { sv: 'Rektanglar', en: 'Rectangles' } },
          { key: 'sim_tri_angle_check', name: { sv: 'Likformighet: Vinklar', en: 'Similarity: Angles' }, desc: { sv: 'AA-kriteriet', en: 'AA criterion' } },
          { key: 'sim_tri_side_check', name: { sv: 'Likformighet: Sidor', en: 'Similarity: Sides' }, desc: { sv: 'Proportioner', en: 'Proportions' } },
          { key: 'sim_concept_lie', name: { sv: 'Hitta felet: Likformighet', en: 'Find error: Similarity' }, desc: { sv: 'Teori', en: 'Theory' } },
          { key: 'sim_calc_big', name: { sv: 'Beräkna stor sida', en: 'Calculate long side' }, desc: { sv: 'Multiplicera med skala', en: 'Multiply by scale' } },
          { key: 'sim_calc_small', name: { sv: 'Beräkna liten sida', en: 'Calculate short side' }, desc: { sv: 'Dividera med skala', en: 'Divide by scale' } },
          { key: 'sim_find_k', name: { sv: 'Hitta skalfaktor', en: 'Find scale factor' }, desc: { sv: 'Stor / Liten', en: 'Large / Small' } },
          { key: 'sim_calc_lie', name: { sv: 'Hitta felet: Beräkning', en: 'Find error: Calculation' }, desc: { sv: 'Kontrollera kvoter', en: 'Check ratios' } },
          { key: 'transversal_total', name: { sv: 'Topptriangelsatsen', en: 'Top triangle theorem' }, desc: { sv: 'Hela sidan', en: 'Entire side' } },
          { key: 'transversal_extension', name: { sv: 'Parallelltransversal', en: 'Parallel transversal' }, desc: { sv: 'Del av sida', en: 'Part of side' } },
          { key: 'transversal_concept_id', name: { sv: 'Identifiera fall', en: 'Identify case' }, desc: { sv: 'Topp vs Transversal', en: 'Top vs Transversal' } },
          { key: 'pythagoras_sim_hyp', name: { sv: 'Likformighet & Pythagoras', en: 'Similarity & Pythagoras' }, desc: { sv: 'Kombination (Hyp)', en: 'Combination (Hyp)' } },
          { key: 'pythagoras_sim_leg', name: { sv: 'Likformighet & Pythagoras', en: 'Similarity & Pythagoras' }, desc: { sv: 'Kombination (Kat)', en: 'Combination (Leg)' } }
        ]
      },
      volume: {
        name: { sv: 'Volym & Begränsningsyta', en: 'Volume & Surface Area' },
        variations: [
          { key: 'vol_cuboid_std', name: { sv: 'Volym: Rätblock', en: 'Volume: Cuboid' }, desc: { sv: 'b * d * h', en: 'w * d * h' } },
          { key: 'vol_cuboid_inverse', name: { sv: 'Rätblock: Hitta sida', en: 'Cuboid: Find side' }, desc: { sv: 'Volym / Area', en: 'Volume / Area' } },
          { key: 'vol_cuboid_scaling', name: { sv: 'Rätblock: Skalning', en: 'Cuboid: Scaling' }, desc: { sv: 'Dubbla sidor -> 8x volym', en: 'Double sides -> 8x vol' } },
          { key: 'vol_tri_prism_std', name: { sv: 'Volym: Prisma', en: 'Volume: Prism' }, desc: { sv: 'Basarea * höjd', en: 'Base area * height' } },
          { key: 'vol_tri_prism_inverse', name: { sv: 'Prisma: Hitta höjd', en: 'Prism: Find height' }, desc: { sv: 'Volym / Basarea', en: 'Volume / Base area' } },
          { key: 'vol_cyl_std', name: { sv: 'Volym: Cylinder', en: 'Volume: Cylinder' }, desc: { sv: 'pi * r^2 * h', en: 'pi * r^2 * h' } },
          { key: 'vol_cyl_inverse', name: { sv: 'Cylinder: Hitta höjd', en: 'Cylinder: Find height' }, desc: { sv: 'Ekvationslösning', en: 'Equation solving' } },
          { key: 'vol_pyramid_sq', name: { sv: 'Volym: Pyramid', en: 'Volume: Pyramid' }, desc: { sv: '(Bas * h) / 3', en: '(Base * h) / 3' } },
          { key: 'vol_cone_std', name: { sv: 'Volym: Kon', en: 'Volume: Cone' }, desc: { sv: '(Cirkel * h) / 3', en: '(Circle * h) / 3' } },
          { key: 'vol_sphere_std', name: { sv: 'Volym: Klot', en: 'Volume: Sphere' }, desc: { sv: '4 * pi * r^3 / 3', en: '4 * pi * r^3 / 3' } },
          { key: 'vol_semi_sphere', name: { sv: 'Volym: Halvklot', en: 'Volume: Hemisphere' }, desc: { sv: 'Hälften av klot', en: 'Half a sphere' } },
          { key: 'vol_composite_silo', name: { sv: 'Sammansatt: Silo', en: 'Composite: Silo' }, desc: { sv: 'Cylinder + Kon', en: 'Cylinder + Cone' } },
          { key: 'vol_composite_house', name: { sv: 'Sammansatt: Hus', en: 'Composite: House' }, desc: { sv: 'Rätblock + Prisma', en: 'Cuboid + Prism' } },
          { key: 'unit_liters_basic', name: { sv: 'Enheter: Liter', en: 'Units: Liters' }, desc: { sv: 'dm3 till liter', en: 'dm3 to liters' } },
          { key: 'unit_cubic_conversion', name: { sv: 'Enheter: Kubik', en: 'Units: Cubic' }, desc: { sv: 'm3 till dm3', en: 'm3 to dm3' } },
          { key: 'sa_cuboid', name: { sv: 'Begränsningsarea: Rätblock', en: 'Surface Area: Cuboid' }, desc: { sv: 'Summa av sidor', en: 'Sum of sides' } },
          { key: 'sa_cylinder', name: { sv: 'Begränsningsarea: Cylinder', en: 'Surface Area: Cylinder' }, desc: { sv: 'Mantel + 2 Cirklar', en: 'Mantle + 2 Circles' } },
          { key: 'sa_sphere', name: { sv: 'Begränsningsarea: Klot', en: 'Surface Area: Sphere' }, desc: { sv: '4 * pi * r^2', en: '4 * pi * r^2' } },
          { key: 'sa_cone', name: { sv: 'Begränsningsarea: Kon', en: 'Surface Area: Cone' }, desc: { sv: 'Mantel + Cirkel', en: 'Mantle + Circle' } }
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
          { key: 'mean_negatives', name: { sv: 'Medelvärde: Negativa', en: 'Mean: Negatives' }, desc: { sv: 'Temperaturer etc.', en: 'Temperatures etc.' } },
          { key: 'median_odd', name: { sv: 'Median (Udda)', en: 'Median (Odd)' }, desc: { sv: 'Mittersta värdet', en: 'Middle value' } },
          { key: 'median_even', name: { sv: 'Median (Jämnt)', en: 'Median (Even)' }, desc: { sv: 'Medel av mittentalen', en: 'Mean of middle values' } },
          { key: 'reverse_mean_calc', name: { sv: 'Hitta saknat tal', en: 'Find missing number' }, desc: { sv: 'Givet medelvärde', en: 'Given mean' } },
          { key: 'mean_target_score', name: { sv: 'Mål-medelvärde', en: 'Target mean' }, desc: { sv: 'Vad krävs för snittet?', en: 'What is required for the average?' } },
          { key: 'freq_mode', name: { sv: 'Tabell: Typvärde', en: 'Table: Mode' }, desc: { sv: 'Högst frekvens', en: 'Highest frequency' } },
          { key: 'freq_mean', name: { sv: 'Tabell: Medelvärde', en: 'Table: Mean' }, desc: { sv: 'Summa(f*x) / n', en: 'Sum(f*x) / n' } },
          { key: 'freq_count', name: { sv: 'Tabell: Observationer', en: 'Table: Observations' }, desc: { sv: 'Summera antal', en: 'Sum count' } },
          { key: 'real_measure_choice', name: { sv: 'Välj Lägesmått', en: 'Choose measure' }, desc: { sv: 'Medel vs Median', en: 'Mean vs Median' } },
          { key: 'real_outlier_shift', name: { sv: 'Effekt av extremvärde', en: 'Outlier effect' }, desc: { sv: 'Påverkan på medel', en: 'Impact on mean' } },
          { key: 'real_weighted_missing', name: { sv: 'Viktat medelvärde', en: 'Weighted average' }, desc: { sv: 'Blandade priser/mängder', en: 'Mixed prices/quantities' } }
        ]
      },
      probability: {
        name: { sv: 'Sannolikhet', en: 'Probability' },
        variations: [
          { key: 'visual_calc', name: { sv: 'Enkel Sannolikhet', en: 'Basic Probability' }, desc: { sv: 'Gynsamma / Möjliga (Bilder)', en: 'Favorable / Possible (Visual)' } },
          { key: 'visual_not', name: { sv: 'Komplementhändelse', en: 'Complementary event' }, desc: { sv: 'Sannolikheten för "Inte"', en: 'Probability of "Not"' } },
          { key: 'visual_or', name: { sv: 'Antingen Eller', en: 'Either Or' }, desc: { sv: 'Addition av sannolikheter', en: 'Addition of probabilities' } },
          { key: 'visual_spinner', name: { sv: 'Lyckohjul', en: 'Lucky wheel' }, desc: { sv: 'Sektorernas andel', en: 'Sector share' } },
          { key: 'group_ratio', name: { sv: 'Förhållanden', en: 'Ratios' }, desc: { sv: 'Sannolikhet utifrån n:m', en: 'Probability from n:m' } },
          { key: 'group_ternary', name: { sv: 'Tre grupper', en: 'Three groups' }, desc: { sv: 'A, B och Resten', en: 'A, B and the rest' } },
          { key: 'concept_likelihood', name: { sv: 'Begrepp: Chans', en: 'Concept: Chance' }, desc: { sv: 'Säkert, Omöjligt, Even', en: 'Certain, Impossible, Even' } },
          { key: 'concept_compare', name: { sv: 'Jämför Chanser', en: 'Compare chances' }, desc: { sv: 'Var är chansen störst?', en: 'Where is the highest chance?' } },
          { key: 'comp_at_least', name: { sv: 'Minst en gång', en: 'At least once' }, desc: { sv: '1 - P(Ingen)', en: '1 - P(None)' } },
          { key: 'tree_calc', name: { sv: 'Sannolikhetsträd', en: 'Probability tree' }, desc: { sv: 'Dragning utan återläggning', en: 'Drawing without replacement' } },
          { key: 'tree_missing', name: { sv: 'Pussel: Träd', en: 'Puzzle: Tree' }, desc: { sv: 'Hitta saknad gren', en: 'Find missing branch' } },
          { key: 'chain_any_order', name: { sv: 'Oberoende ordning', en: 'Independent order' }, desc: { sv: 'En av varje färg', en: 'One of each color' } },
          { key: 'chain_fixed_order', name: { sv: 'Bestämd ordning', en: 'Fixed order' }, desc: { sv: 'Två av samma i rad', en: 'Two of same in a row' } },
          { key: 'comb_constraint', name: { sv: 'Kombinatorik: Outfits', en: 'Combinatorics: Outfits' }, desc: { sv: 'Multiplikationsprincipen', en: 'Multiplication principle' } },
          { key: 'comb_handshake', name: { sv: 'Handskakningar', en: 'Handshakes' }, desc: { sv: 'n(n-1)/2', en: 'n(n-1)/2' } },
          { key: 'pathways_basic', name: { sv: 'Räkna Vägar', en: 'Count paths' }, desc: { sv: 'A till B genom nätverk', en: 'A to B via network' } },
          { key: 'pathways_prob', name: { sv: 'Sannolikhet Väg', en: 'Path probability' }, desc: { sv: 'Chansen att en väg är öppen', en: 'Chance path is open' } }
        ]
      }
    }
  }
};