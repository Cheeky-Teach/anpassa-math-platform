/**
 * MASTER REGISTRY OF SKILL BUCKETS (VARIATION KEYS)
 * Generated from source code analysis of 21 Math Generators.
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
    name: 'Algebra & Mönster',
    topics: {
      equations: {
        name: 'Ekvationslösning',
        variations: [
          { key: 'onestep_add', name: 'Ensteg: Addition', desc: 'x + a = b' },
          { key: 'onestep_sub', name: 'Ensteg: Subtraktion', desc: 'x - a = b' },
          { key: 'onestep_mult', name: 'Ensteg: Multiplikation', desc: 'ax = b' },
          { key: 'onestep_div', name: 'Ensteg: Division', desc: 'x/a = b' },
          { key: 'onestep_lie', name: 'Hitta felet: Ensteg', desc: 'Identifiera felaktig lösning' },
          { key: 'twostep_mult_add', name: 'Tvåsteg: ax + b', desc: 'ax + b = c' },
          { key: 'twostep_mult_sub', name: 'Tvåsteg: ax - b', desc: 'ax - b = c' },
          { key: 'twostep_div_add', name: 'Tvåsteg: x/a + b', desc: 'x/a + b = c' },
          { key: 'twostep_div_sub', name: 'Tvåsteg: x/a - b', desc: 'x/a - b = c' },
          { key: 'twostep_lie', name: 'Hitta felet: Tvåsteg', desc: 'Analysera lösningens steg' },
          { key: 'paren_mult_add', name: 'Parentes: a(x+b)', desc: 'Distributiva lagen' },
          { key: 'paren_mult_sub', name: 'Parentes: a(x-b)', desc: 'Distributiva lagen med minus' },
          { key: 'paren_lie', name: 'Hitta felet: Parenteser', desc: 'Vanliga distributionsfel' },
          { key: 'bothsides_add', name: 'X på båda sidor (+)', desc: 'ax + b = cx + d' },
          { key: 'bothsides_sub', name: 'X på båda sidor (-)', desc: 'Hantera negativa koefficienter' },
          { key: 'bothsides_mixed', name: 'X på båda sidor (Blandat)', desc: 'Komplexa ekvationer' }
        ]
      },
      equations_word: {
        name: 'Ekvationer: Problemlösning',
        variations: [
          { key: 'rate_fixed_add_write', name: 'Skriv: Fast + Rörlig', desc: 'Teckna uttryck y = kx + m' },
          { key: 'rate_fixed_add_solve', name: 'Lös: Fast + Rörlig', desc: 'Beräkna x givet total' },
          { key: 'rate_fixed_sub_write', name: 'Skriv: Minskning', desc: 'Teckna uttryck y = m - kx' },
          { key: 'rate_fixed_sub_solve', name: 'Lös: Minskning', desc: 'När tar värdet slut?' },
          { key: 'compare_word_sum_write', name: 'Skriv: Jämförelse (Summa)', desc: 'x + (x+a) = Total' },
          { key: 'compare_word_sum_solve', name: 'Lös: Jämförelse (Summa)', desc: 'Hitta delarna' },
          { key: 'compare_word_diff_write', name: 'Skriv: Jämförelse (Diff)', desc: 'x + (x-a) = Total' },
          { key: 'compare_word_diff_solve', name: 'Lös: Jämförelse (Diff)', desc: 'Hitta delarna' }
        ]
      },
      expressions: {
        name: 'Förenkling av Uttryck',
        variations: [
          { key: 'combine_lie_exponent', name: 'Hitta felet: Potenser', desc: 'x + x vs x * x' },
          { key: 'combine_concept_id', name: 'Begrepp: Termer', desc: 'Identifiera lika termer' },
          { key: 'combine_standard_mixed', name: 'Förenkla uttryck', desc: 'Samla x och tal' },
          { key: 'distribute_lie_partial', name: 'Hitta felet: Parentes', desc: 'Partiell distribution' },
          { key: 'distribute_inverse_factor', name: 'Faktorisera', desc: 'Bryt ut största faktor' },
          { key: 'distribute_plus', name: 'Parentes (+)', desc: 'Multiplicera in positivt tal' },
          { key: 'distribute_minus', name: 'Parentes (-)', desc: 'Multiplicera in negativt tal' },
          { key: 'distribute_double', name: 'Dubbla parenteser', desc: 'Expandera två parenteser' },
          { key: 'distribute_combine_std', name: 'Expandera & Förenkla', desc: 'Multiplicera och samla termer' },
          { key: 'sub_concept_plus_logic', name: 'Teckenregler', desc: 'Plus framför parentes' },
          { key: 'sub_block_plus', name: 'Minusparentes (+)', desc: '-(ax + b)' },
          { key: 'sub_block_minus', name: 'Minusparentes (-)', desc: '-(ax - b)' },
          { key: 'word_candy', name: 'Uttryck: Godispåsar', desc: 'Teckna uttryck' },
          { key: 'word_discount', name: 'Uttryck: Rabatt', desc: 'Prisrelationer' },
          { key: 'word_combined_age_tri', name: 'Uttryck: Åldrar', desc: 'Tre personers ålder' },
          { key: 'word_rect_perimeter', name: 'Uttryck: Omkrets', desc: 'Rektangel med x' },
          { key: 'word_savings', name: 'Uttryck: Sparande', desc: 'Saldo med uttag/insättning' },
          { key: 'word_passengers', name: 'Uttryck: Passagerare', desc: 'Förändring på buss' },
          { key: 'word_garden', name: 'Uttryck: Trädgård', desc: 'Plantering och bortfall' },
          { key: 'word_sports', name: 'Uttryck: Sport', desc: 'Poängberäkning' },
          { key: 'word_phone_battery', name: 'Uttryck: Batteri', desc: 'Laddning och förbrukning' }
        ]
      },
      patterns: {
        name: 'Mönster & Formler',
        variations: [
          { key: 'seq_lie', name: 'Hitta felet: Talföljd', desc: 'Analysera mönsterlogik' },
          { key: 'seq_type', name: 'Mönstertyp', desc: 'Aritmetisk vs Geometrisk' },
          { key: 'seq_diff', name: 'Hitta differensen', desc: 'Ökning per steg' },
          { key: 'seq_next', name: 'Nästa tal', desc: 'Fortsätt talföljden' },
          { key: 'high_term', name: 'Hitta tal n', desc: 'Beräkna värdet långt fram' },
          { key: 'formula_missing', name: 'Hitta formeln (Bild)', desc: 'Koppla bild till uttryck' },
          { key: 'visual_calc', name: 'Beräkna antal (Bild)', desc: 'Hur många tändstickor?' },
          { key: 'find_formula', name: 'Skriv formeln', desc: 'Skapa y = kn + m' },
          { key: 'table_formula', name: 'Tabell till Formel', desc: 'Hitta mönster i värdetabell' },
          { key: 'table_fill', name: 'Fyll i tabell', desc: 'Använd formeln' },
          { key: 'reverse_calc', name: 'Hitta n (Ekvation)', desc: 'Vilket figurnummer har värdet X?' }
        ]
      },
      graphs: {
        name: 'Räta Linjens Ekvation',
        variations: [
          { key: 'intercept_id', name: 'Hitta m-värde', desc: 'Var skär linjen y-axeln?' },
          { key: 'slope_pos_int', name: 'Positiv Lutning (Heltal)', desc: 'Stigande k-värde' },
          { key: 'slope_pos_frac', name: 'Positiv Lutning (Bråk)', desc: 'Stigande, flack/brant' },
          { key: 'slope_neg_int', name: 'Negativ Lutning (Heltal)', desc: 'Sjunkande k-värde' },
          { key: 'slope_neg_frac', name: 'Negativ Lutning (Bråk)', desc: 'Sjunkande, flack/brant' },
          { key: 'eq_standard', name: 'Bestäm ekvation', desc: 'y = kx + m' },
          { key: 'eq_no_m', name: 'Proportionalitet', desc: 'y = kx (Går genom origo)' },
          { key: 'eq_horizontal', name: 'Horisontell linje', desc: 'y = m (k=0)' }
        ]
      }
    }
  },

  // ==========================================
  // 2. ARITMETIK
  // ==========================================
  arithmetic: {
    id: 'arithmetic',
    name: 'Aritmetik & Tal',
    topics: {
      basic_arithmetic: {
        name: 'De 4 Räknesätten',
        variations: [
          { key: 'add_std_vertical', name: 'Addition: Uppställning', desc: 'Stora tal' },
          { key: 'add_std_horizontal', name: 'Addition: Huvudräkning', desc: 'Strategier' },
          { key: 'add_missing_variable', name: 'Addition: Hitta termen', desc: 'a + x = b' },
          { key: 'add_spot_the_lie', name: 'Hitta felet: Addition', desc: 'Felsökning' },
          { key: 'sub_std_vertical', name: 'Subtraktion: Uppställning', desc: 'Växling' },
          { key: 'sub_std_horizontal', name: 'Subtraktion: Huvudräkning', desc: 'Strategier' },
          { key: 'sub_missing_variable', name: 'Subtraktion: Hitta termen', desc: 'a - x = b' },
          { key: 'dec_add_vertical', name: 'Decimaler: Addition', desc: 'Passa kommatecknet' },
          { key: 'dec_sub_vertical', name: 'Decimaler: Subtraktion', desc: 'Passa kommatecknet' },
          { key: 'mult_table_std', name: 'Multiplikationstabellen', desc: 'Grundläggande tabeller' },
          { key: 'mult_commutative', name: 'Kommutativa lagen', desc: 'a * b = b * a' },
          { key: 'mult_2x1_vertical', name: 'Mult: Uppställning', desc: 'Två siffror * en siffra' },
          { key: 'mult_distributive', name: 'Distributiva lagen', desc: 'Dela upp faktorer' },
          { key: 'mult_decimal_std', name: 'Decimalmultiplikation', desc: 'Räkna decimaler' },
          { key: 'mult_decimal_placement', name: 'Placera kommatecknet', desc: 'Uppskattning' },
          { key: 'div_basic_std', name: 'Kort division', desc: 'Standardalgoritm' },
          { key: 'div_inverse_logic', name: 'Division via multiplikation', desc: 'Samband' }
        ]
      },
      negatives: {
        name: 'Negativa Tal',
        variations: [
          { key: 'theory_number_line', name: 'Tallinjen', desc: 'Positionering' },
          { key: 'theory_sign_dominance', name: 'Teckenregler', desc: 'Blir svaret plus eller minus?' },
          { key: 'theory_spot_lie', name: 'Hitta felet: Negativa', desc: 'Vanliga missuppfattningar' },
          { key: 'fluency_chain_4', name: 'Add/Sub Kedja (4)', desc: 'Flerstegsräkning' },
          { key: 'fluency_chain_5', name: 'Add/Sub Kedja (5)', desc: 'Långa uttryck' },
          { key: 'fluency_double_neg', name: 'Dubbla minustecken', desc: '-(-a) = +a' },
          { key: 'fluency_plus_neg', name: 'Plus minus', desc: '+(-a) = -a' },
          { key: 'fluency_transform_match', name: 'Matcha uttryck', desc: 'Olika skrivsätt' },
          { key: 'mult_same_sign', name: 'Mult: Samma tecken', desc: 'Minus * Minus = Plus' },
          { key: 'mult_diff_sign', name: 'Mult: Olika tecken', desc: 'Minus * Plus = Minus' },
          { key: 'mult_chain', name: 'Mult: Kedja', desc: 'Jämnt/Udda antal minus' },
          { key: 'div_basic', name: 'Division: Grund', desc: 'Enkel division' },
          { key: 'div_fraction', name: 'Division: Bråkform', desc: 'Tecken i bråk' },
          { key: 'div_check_logic', name: 'Division: Kontroll', desc: 'Rimlighetsbedömning' }
        ]
      },
      fractions_basics: {
        name: 'Bråk: Grunder',
        variations: [
          { key: 'visual_lie', name: 'Hitta felet: Bilder', desc: 'Visuell tolkning' },
          { key: 'visual_inverse', name: 'Bild: Hitta helheten', desc: 'Givet del, sök helhet' },
          { key: 'visual_calc', name: 'Bild: Beräkna andel', desc: 'Färgad del av total' },
          { key: 'part_inverse', name: 'Hitta helheten', desc: '1/n är x, vad är allt?' },
          { key: 'part_compare', name: 'Jämför andelar', desc: 'Vilken del är störst?' },
          { key: 'part_calc', name: 'Beräkna del av antal', desc: '1/n av x' },
          { key: 'mixed_bounds', name: 'Storleksbedömning', desc: 'Större/Mindre än heltal' },
          { key: 'mixed_missing', name: 'Blandad form: Pussel', desc: 'Hitta täljaren' },
          { key: 'mixed_convert_imp', name: 'Till bråkform', desc: 'Blandad -> Bråk' },
          { key: 'mixed_convert_mix', name: 'Till blandad form', desc: 'Bråk -> Blandad' },
          { key: 'simplify_missing', name: 'Likvärdiga bråk', desc: 'Förlängning/Förkortning' },
          { key: 'simplify_concept', name: 'Koncept: Förkortning', desc: 'Ändras värdet?' },
          { key: 'simplify_calc', name: 'Förkorta bråk', desc: 'Enklaste form' },
          { key: 'decimal_inequality', name: 'Jämför bråk/decimal', desc: 'Större, mindre, lika' },
          { key: 'decimal_to_dec', name: 'Bråk till decimal', desc: 'Ex: 1/4 = 0.25' },
          { key: 'decimal_to_frac', name: 'Decimal till bråk', desc: 'Ex: 0.5 = 1/2' }
        ]
      },
      fractions_arith: {
        name: 'Bråk: Räknesätt',
        variations: [
          { key: 'add_concept', name: 'Addition: Regler', desc: 'Addera täljare, ej nämnare' },
          { key: 'add_missing', name: 'Addition: Pussel', desc: 'Hitta saknad term' },
          { key: 'add_calc', name: 'Addition: Samma nämnare', desc: 'Enkel addition' },
          { key: 'lcd_find', name: 'Hitta MGN', desc: 'Minsta gemensamma nämnare' },
          { key: 'add_error_spot', name: 'Hitta felet: Olika nämnare', desc: 'Vanliga misstag' },
          { key: 'add_diff_denom', name: 'Addition: Olika nämnare', desc: 'Förlängning krävs' },
          { key: 'mixed_est', name: 'Blandad: Uppskattning', desc: 'Rimlighet' },
          { key: 'mixed_add_same', name: 'Blandad Add: Samma', desc: 'Addera heltal och bråk' },
          { key: 'mixed_add_diff', name: 'Blandad Add: Olika', desc: 'MGN med blandad form' },
          { key: 'mixed_sub_same', name: 'Blandad Sub: Samma', desc: 'Subtraktion' },
          { key: 'mixed_sub_diff', name: 'Blandad Sub: Olika', desc: 'Låna från heltal' },
          { key: 'mult_scaling', name: 'Multiplikation: Skalning', desc: 'Större eller mindre?' },
          { key: 'mult_area', name: 'Multiplikation: Area', desc: 'Visuell modell' },
          { key: 'mult_calc', name: 'Multiplikation', desc: 'Täljare*Täljare / Nämnare*Nämnare' },
          { key: 'div_operator', name: 'Division: Koncept', desc: 'Hur många ryms?' },
          { key: 'div_reciprocal', name: 'Inverterade tal', desc: 'Vänd på bråket' },
          { key: 'div_calc', name: 'Division', desc: 'Mult med invers' }
        ]
      },
      percent: {
        name: 'Procent',
        variations: [
          { key: 'visual_translation', name: 'Bild till Procent', desc: 'Tolka figurer' },
          { key: 'visual_lie', name: 'Hitta felet: Bild', desc: 'Visuell analys' },
          { key: 'equivalence', name: 'Bråk-Decimal-Procent', desc: 'Samband' },
          { key: 'benchmark_calc', name: 'Huvudräkning (Bas)', desc: '10%, 25%, 50%' },
          { key: 'benchmark_inverse', name: 'Hitta 100% (Bas)', desc: 'Om 10% är 5, vad är allt?' },
          { key: 'benchmark_commutative', name: 'Kommutativitet', desc: 'x% av y = y% av x' },
          { key: 'composition', name: 'Sammansättning', desc: 'Bygg 35% av 10% och 25%' },
          { key: 'decomposition', name: 'Uppdelning', desc: 'Dela upp svåra procent' },
          { key: 'estimation', name: 'Överslagsräkning', desc: 'Ungefärligt värde' },
          { key: 'equation_calc', name: 'Procentekvationen', desc: 'Andelen * Hela = Delen' },
          { key: 'equation_missing_part', name: 'Hitta delen', desc: 'x% av y' },
          { key: 'equation_missing_whole', name: 'Hitta det hela', desc: 'Delen / Andelen' },
          { key: 'reverse_add_tax', name: 'Baklänges: Moms', desc: 'Hitta pris före skatt' },
          { key: 'reverse_find_original', name: 'Baklänges: Ursprung', desc: 'Hitta startvärde' },
          { key: 'change_calc', name: 'Beräkna förändring', desc: 'Skillnad / Ursprung' },
          { key: 'change_diff_vs_pct', name: 'Kronor vs Procent', desc: 'Enhetsförståelse' },
          { key: 'change_sequential_trap', name: 'Fälla: Dubbla ändringar', desc: '+10% sen -10%' }
        ]
      },
      change_factor: {
        name: 'Förändringsfaktor',
        variations: [
          { key: 'pct_to_factor_inc', name: 'Ökning till Faktor', desc: '+20% -> 1.20' },
          { key: 'pct_to_factor_dec', name: 'Minskning till Faktor', desc: '-20% -> 0.80' },
          { key: 'factor_to_pct_inc', name: 'Faktor till Ökning', desc: '1.20 -> +20%' },
          { key: 'factor_to_pct_dec', name: 'Faktor till Minskning', desc: '0.80 -> -20%' },
          { key: 'apply_factor_inc', name: 'Beräkna nytt (Ökning)', desc: 'Start * Faktor' },
          { key: 'apply_factor_dec', name: 'Beräkna nytt (Minskning)', desc: 'Start * Faktor' },
          { key: 'find_original_inc', name: 'Hitta gamla (Ökning)', desc: 'Nytt / Faktor' },
          { key: 'find_original_dec', name: 'Hitta gamla (Minskning)', desc: 'Nytt / Faktor' },
          { key: 'sequential_factors', name: 'Total faktor', desc: 'Faktor1 * Faktor2' },
          { key: 'word_population', name: 'Problem: Befolkning', desc: 'Tillämpning' },
          { key: 'word_interest', name: 'Problem: Ränta', desc: 'Bank och lån' },
          { key: 'word_depreciation', name: 'Problem: Värdeminskning', desc: 'Bil/Maskin' },
          { key: 'word_sale', name: 'Problem: Rea', desc: 'Rabatter' },
          { key: 'word_decay', name: 'Problem: Sönderfall', desc: 'Naturvetenskap' },
          { key: 'word_salary', name: 'Problem: Lön', desc: 'Löneförhandling' },
          { key: 'word_inflation', name: 'Problem: Inflation', desc: 'Prisökningar' },
          { key: 'word_stock', name: 'Problem: Aktier', desc: 'Börsutveckling' }
        ]
      },
      exponents: {
        name: 'Potenser',
        variations: [
          { key: 'zero_rule', name: 'Noll-regeln', desc: 'x^0 = 1' },
          { key: 'power_of_one', name: 'Upphöjt till 1', desc: 'x^1 = x' },
          { key: 'foundations_calc', name: 'Beräkna potenser', desc: 'Bas * Bas...' },
          { key: 'foundations_spot_the_lie', name: 'Hitta felet: Bas/Exp', desc: 'Vanliga misstag' },
          { key: 'ten_positive_exponent', name: 'Tiopotenser (Pos)', desc: 'Stora tal' },
          { key: 'ten_negative_exponent', name: 'Tiopotenser (Neg)', desc: 'Små tal' },
          { key: 'ten_inverse_counting', name: 'Räkna nollor', desc: 'Skriv som 10^n' },
          { key: 'scientific_to_form', name: 'Till Grundpotensform', desc: 'a * 10^n' },
          { key: 'scientific_missing_mantissa', name: 'Hitta mantissan', desc: 'Talet mellan 1-10' },
          { key: 'scientific_missing_exponent', name: 'Hitta exponenten', desc: 'Antal steg' },
          { key: 'root_calc', name: 'Kvadratrötter', desc: 'Roten ur x' },
          { key: 'root_inverse_algebra', name: 'Ekvation x^2', desc: 'Lös ut x' },
          { key: 'law_multiplication', name: 'Lag: Multiplikation', desc: 'Addera exponenter' },
          { key: 'law_division', name: 'Lag: Division', desc: 'Subtrahera exponenter' },
          { key: 'law_addition_trap', name: 'Fälla: Addition', desc: 'Ingen regel för plus' },
          { key: 'law_mult_div_combined', name: 'Lag: Mult & Div', desc: 'Blandade regler' },
          { key: 'law_power_of_power', name: 'Lag: Potens av potens', desc: 'Multiplicera exponenter' },
          { key: 'law_inverse_algebra', name: 'Potensekvationer', desc: 'Hitta exponenten' },
          { key: 'law_all_combined', name: 'Blandade Lagar', desc: 'Avancerad förenkling' }
        ]
      },
      ten_powers: {
        name: 'Tiopotenser & Prefix',
        variations: [
          { key: 'big_mult_std', name: 'Mult med 10/100', desc: 'Flytta komma höger' },
          { key: 'big_div_std', name: 'Div med 10/100', desc: 'Flytta komma vänster' },
          { key: 'big_missing_factor', name: 'Hitta 10-faktorn', desc: 'Vad multiplicerades?' },
          { key: 'power_discovery', name: 'Potensform', desc: 'Skriv som 10^n' },
          { key: 'reciprocal_equivalence', name: 'Inverser', desc: '0.1 = 1/10' },
          { key: 'concept_spot_lie', name: 'Hitta felet: 10-bas', desc: 'Konceptuell förståelse' },
          { key: 'decimal_div_std', name: 'Div med 0.1/0.01', desc: 'Talet blir större' },
          { key: 'decimal_mult_std', name: 'Mult med 0.1/0.01', desc: 'Talet blir mindre' },
          { key: 'decimal_logic_trap', name: 'Fälla: Mult/Div', desc: 'Logiskt tänkande' }
        ]
      }
    }
  },

  // ==========================================
  // 3. GEOMETRI
  // ==========================================
  geometry_cat: {
    id: 'geometry_cat',
    name: 'Geometri',
    topics: {
      geometry: {
        name: 'Area & Omkrets',
        variations: [
          { key: 'perimeter_square', name: 'Omkrets: Kvadrat', desc: '4 * sida' },
          { key: 'perimeter_rect', name: 'Omkrets: Rektangel', desc: '2b + 2h' },
          { key: 'perimeter_parallel', name: 'Omkrets: Parallellogram', desc: 'Samma som rektangel' },
          { key: 'perimeter_inverse', name: 'Omkrets: Hitta sidan', desc: 'Givet O, hitta x' },
          { key: 'perimeter_lie', name: 'Hitta felet: Omkrets', desc: 'Analysera påstående' },
          { key: 'area_square', name: 'Area: Kvadrat', desc: 's * s' },
          { key: 'area_rect', name: 'Area: Rektangel', desc: 'b * h' },
          { key: 'area_parallel', name: 'Area: Parallellogram', desc: 'b * h (ej sida)' },
          { key: 'area_inverse', name: 'Area: Hitta sidan', desc: 'Givet A, hitta x' },
          { key: 'area_trap', name: 'Fälla: Area', desc: 'Vinkelrät höjd!' },
          { key: 'area_triangle', name: 'Area: Triangel', desc: '(b * h) / 2' },
          { key: 'inverse_triangle', name: 'Triangel: Hitta höjd', desc: 'Givet A, hitta h' },
          { key: 'perimeter_triangle_right', name: 'Omkrets: Rätvinklig', desc: 'Summa av sidor' },
          { key: 'perimeter_triangle_iso', name: 'Omkrets: Likbent', desc: 'Två lika sidor' },
          { key: 'perimeter_triangle_scalene', name: 'Omkrets: Oliksidig', desc: 'Alla sidor olika' },
          { key: 'combined_rect_tri', name: 'Sammansatt: Rekt+Tri', desc: 'Additionsmetoden' },
          { key: 'combined_l_shape', name: 'Sammansatt: L-form', desc: 'Delning' },
          { key: 'combined_house', name: 'Sammansatt: Hus', desc: 'Kvadrat + Triangel' },
          { key: 'circle_area', name: 'Cirkel: Area', desc: 'pi * r^2' },
          { key: 'circle_perimeter', name: 'Cirkel: Omkrets', desc: 'pi * d' },
          { key: 'semicircle_area', name: 'Halvcirkel: Area', desc: 'Halva arean' },
          { key: 'semicircle_perimeter', name: 'Halvcirkel: Omkrets', desc: 'Båge + Diameter' },
          { key: 'area_quarter', name: 'Kvartscirkel: Area', desc: 'Fjärdedels area' },
          { key: 'perimeter_quarter', name: 'Kvartscirkel: Omkrets', desc: 'Båge + Radier' },
          { key: 'perimeter_house', name: 'Omkrets: Hus', desc: 'Avancerad (Tak)' },
          { key: 'perimeter_portal', name: 'Omkrets: Portal', desc: 'Väggar + Båge' }
        ]
      },
      angles: {
        name: 'Vinklar',
        variations: [
          { key: 'classification_visual', name: 'Vinkeltyper', desc: 'Spetsig, Rät, Trubbig' },
          { key: 'classification_inverse_numeric', name: 'Klassificera tal', desc: 'Vilken typ är 120°?' },
          { key: 'classification_lie', name: 'Hitta felet: Typer', desc: 'Falska påståenden' },
          { key: 'comp_supp_visual', name: 'Grannvinklar', desc: 'Summa 180 eller 90' },
          { key: 'comp_supp_inverse', name: 'Terminologi', desc: 'Supplement/Komplement' },
          { key: 'vertical_side_visual', name: 'Vertikalvinklar', desc: 'Mittemot varandra' },
          { key: 'vertical_side_lie', name: 'Hitta felet: Relationer', desc: 'Analys' },
          { key: 'triangle_sum_visual', name: 'Triangelns summa', desc: 'Alltid 180 grader' },
          { key: 'triangle_isosceles', name: 'Likbent triangel', desc: 'Basvinklar lika' },
          { key: 'polygon_sum', name: 'Polygoners summa', desc: '(n-2) * 180' },
          { key: 'polygon_inverse', name: 'Hitta antalet hörn', desc: 'Givet vinkelsumma' },
          { key: 'quad_missing', name: 'Fyrhörning', desc: 'Summa 360' },
          { key: 'parallel_visual', name: 'Parallella linjer', desc: 'Z, F och U-vinklar' },
          { key: 'parallel_lie', name: 'Hitta felet: Parallell', desc: 'Regler för linjer' }
        ]
      },
      pythagoras: {
        name: 'Pythagoras Sats',
        variations: [
          { key: 'sqrt_calc', name: 'Kvadratrot', desc: 'Beräkning' },
          { key: 'square_calc', name: 'Kvadrat', desc: 'Tal gånger sig självt' },
          { key: 'missing_square', name: 'Invers kvadrat', desc: 'x^2 = a' },
          { key: 'sqrt_estimation', name: 'Uppskatta rot', desc: 'Mellan vilka heltal?' },
          { key: 'hyp_visual', name: 'Hitta Hypotenusan', desc: 'a^2 + b^2 = c^2' },
          { key: 'hyp_equation', name: 'Ekvation: Hypotenusa', desc: 'Lös ut c' },
          { key: 'hyp_error', name: 'Hitta felet: Hyp', desc: 'Vanliga fel' },
          { key: 'leg_visual', name: 'Hitta Kateten', desc: 'c^2 - a^2 = b^2' },
          { key: 'leg_concept', name: 'Koncept: Katet', desc: 'Subtraktion krävs' },
          { key: 'leg_text', name: 'Textproblem: Katet', desc: 'Tillämpning' },
          { key: 'app_ladder', name: 'Problem: Stegen', desc: 'Vardagsproblem' },
          { key: 'app_displacement', name: 'Problem: Fågelvägen', desc: 'Avstånd' },
          { key: 'app_diagonal', name: 'Problem: Diagonal', desc: 'Rektangelns diagonal' },
          { key: 'conv_check', name: 'Rätvinklig?', desc: 'Kontrollera satsen' },
          { key: 'conv_trap', name: 'Triangel-fällan', desc: 'Är den rät?' }
        ]
      },
      scale: {
        name: 'Skala',
        variations: [
          { key: 'calc_real', name: 'Beräkna verklighet', desc: 'Från bild till verklighet' },
          { key: 'calc_map', name: 'Beräkna avbildning', desc: 'Från verklighet till bild' },
          { key: 'determine_scale', name: 'Bestäm skalan', desc: 'Bild / Verklighet' },
          { key: 'compare_scales', name: 'Jämför skalor', desc: 'Vilken är störst?' },
          { key: 'area_calc_large', name: 'Areaskala: Förstoring', desc: 'Längdskala i kvadrat' },
          { key: 'area_calc_small', name: 'Areaskala: Förminskning', desc: 'Dividera med kvadrat' },
          { key: 'area_find_scale', name: 'Hitta Areaskala', desc: 'Roten ur areakvot' }
        ]
      },
      similarity: {
        name: 'Likformighet',
        variations: [
          { key: 'sim_rect_check', name: 'Är de likformiga?', desc: 'Rektanglar' },
          { key: 'sim_tri_angle_check', name: 'Likformighet: Vinklar', desc: 'AA-kriteriet' },
          { key: 'sim_tri_side_check', name: 'Likformighet: Sidor', desc: 'Proportioner' },
          { key: 'sim_concept_lie', name: 'Hitta felet: Likformighet', desc: 'Teori' },
          { key: 'sim_calc_big', name: 'Beräkna stor sida', desc: 'Multiplicera med skala' },
          { key: 'sim_calc_small', name: 'Beräkna liten sida', desc: 'Dividera med skala' },
          { key: 'sim_find_k', name: 'Hitta skalfaktor', desc: 'Stor / Liten' },
          { key: 'sim_calc_lie', name: 'Hitta felet: Beräkning', desc: 'Kontrollera kvoter' },
          { key: 'transversal_total', name: 'Topptriangelsatsen', desc: 'Hela sidan' },
          { key: 'transversal_extension', name: 'Parallelltransversal', desc: 'Del av sida' },
          { key: 'transversal_concept_id', name: 'Identifiera fall', desc: 'Topp vs Transversal' },
          { key: 'pythagoras_sim_hyp', name: 'Likformighet & Pythagoras', desc: 'Kombination (Hyp)' },
          { key: 'pythagoras_sim_leg', name: 'Likformighet & Pythagoras', desc: 'Kombination (Kat)' }
        ]
      },
      volume: {
        name: 'Volym & Area',
        variations: [
          { key: 'vol_cuboid_std', name: 'Volym: Rätblock', desc: 'b * d * h' },
          { key: 'vol_cuboid_inverse', name: 'Rätblock: Hitta sida', desc: 'Volym / Area' },
          { key: 'vol_cuboid_scaling', name: 'Rätblock: Skalning', desc: 'Dubbla sidor -> 8x volym' },
          { key: 'vol_tri_prism_std', name: 'Volym: Prisma', desc: 'Basarea * höjd' },
          { key: 'vol_tri_prism_inverse', name: 'Prisma: Hitta höjd', desc: 'Volym / Basarea' },
          { key: 'vol_cyl_std', name: 'Volym: Cylinder', desc: 'pi * r^2 * h' },
          { key: 'vol_cyl_inverse', name: 'Cylinder: Hitta höjd', desc: 'Ekvationslösning' },
          { key: 'vol_pyramid_sq', name: 'Volym: Pyramid', desc: '(Bas * h) / 3' },
          { key: 'vol_cone_std', name: 'Volym: Kon', desc: '(Cirkel * h) / 3' },
          { key: 'vol_sphere_std', name: 'Volym: Klot', desc: '4 * pi * r^3 / 3' },
          { key: 'vol_semi_sphere', name: 'Volym: Halvklot', desc: 'Hälften av klot' },
          { key: 'vol_composite_silo', name: 'Sammansatt: Silo', desc: 'Cylinder + Kon' },
          { key: 'vol_composite_house', name: 'Sammansatt: Hus', desc: 'Rätblock + Prisma' },
          { key: 'unit_liters_basic', name: 'Enheter: Liter', desc: 'dm3 till liter' },
          { key: 'unit_cubic_conversion', name: 'Enheter: Kubik', desc: 'm3 till dm3' },
          { key: 'sa_cuboid', name: 'Begränsningsarea: Rätblock', desc: 'Summa av sidor' },
          { key: 'sa_cylinder', name: 'Begränsningsarea: Cylinder', desc: 'Mantel + 2 Cirklar' },
          { key: 'sa_sphere', name: 'Begränsningsarea: Klot', desc: '4 * pi * r^2' },
          { key: 'sa_cone', name: 'Begränsningsarea: Kon', desc: 'Mantel + Cirkel' }
        ]
      }
    }
  },

  // ==========================================
  // 4. DATA & SANNOLIKHET
  // ==========================================
  data: {
    id: 'data',
    name: 'Data & Sannolikhet',
    topics: {
      statistics: {
        name: 'Statistik',
        variations: [
          { key: 'find_mode', name: 'Typvärde', desc: 'Vanligaste värdet' },
          { key: 'find_median_odd', name: 'Median (Udda)', desc: 'Mittersta värdet' },
          { key: 'find_median_even', name: 'Median (Jämnt)', desc: 'Medel av mitten' },
          { key: 'find_mean', name: 'Medelvärde', desc: 'Summa / Antal' },
          { key: 'find_range', name: 'Variationsbredd', desc: 'Max - Min' },
          { key: 'find_outlier', name: 'Hitta extremvärde', desc: 'Avvikande data' },
          { key: 'mean_target_score', name: 'Mål-medelvärde', desc: 'Vad krävs på provet?' },
          { key: 'mean_missing_value', name: 'Medelvärde: Hitta tal', desc: 'Beräkna talet med hjälp av medelvärdet' },
          { key: 'median_missing_value', name: 'Median-pussel', desc: 'Logiskt tänkande' },
          { key: 'freq_table_mode', name: 'Tabell: Typvärde', desc: 'Högst frekvens' },
          { key: 'freq_table_range', name: 'Tabell: Bredd', desc: 'Max - Min obs' },
          { key: 'freq_table_mean', name: 'Tabell: Medelvärde', desc: 'Summa(f*x) / n' },
          { key: 'freq_table_median', name: 'Tabell: Median', desc: 'Median utifrån frekvenstabell' },
          { key: 'real_measure_choice', name: 'Vilket lägesmått', desc: 'Median vs medelvärde' },
          { key: 'real_outlier_shift', name: 'Effekt av extremvärde', desc: 'Påverkan på medelvärdet' }
        ]
      },
      probability: {
        name: 'Sannolikhet',
        variations: [
          { key: 'visual_simple_prob', name: 'Enkel Sannolikhet', desc: 'Gynsamma / Möjliga' },
          { key: 'visual_complement', name: 'Komplementhändelse', desc: 'P(Inte A) = 1 - P(A)' },
          { key: 'visual_comparison', name: 'Jämför Chanser', desc: 'Var är chansen störst?' },
          { key: 'spinner_simple', name: 'Lyckohjul', desc: 'Sektorernas andel' },
          { key: 'spinner_color', name: 'Lyckohjul: Färg', desc: 'Additionsprincipen' },
          { key: 'spinner_comparison', name: 'Jämför Hjul', desc: 'Bästa hjulet' },
          { key: 'independent_dice', name: 'Oberoende: Tärning', desc: 'Flera tärningar' },
          { key: 'independent_coin', name: 'Oberoende: Mynt', desc: 'Krona/Klave serier' },
          { key: 'independent_mixed', name: 'Oberoende: Blandat', desc: 'Mynt och Tärning' },
          { key: 'dependent_marbles_2', name: 'Beroende: 2 Drag', desc: 'Utan återläggning' },
          { key: 'dependent_marbles_3', name: 'Beroende: 3 Drag', desc: 'Komplexa träd' },
          { key: 'dependent_calc', name: 'Beräkna Beroende', desc: 'P(A) * P(B|A)' },
          { key: 'tree_visual_2', name: 'Trädiagram (2 steg)', desc: 'Tolka diagram' },
          { key: 'tree_visual_3', name: 'Trädiagram (3 steg)', desc: 'Avancerad tolkning' },
          { key: 'pathways_count', name: 'Räkna Vägar', desc: 'Kombinatorik' },
          { key: 'pathways_prob', name: 'Sannolikhet Väg', desc: 'Produktregeln' }
        ]
      }
    }
  }
};