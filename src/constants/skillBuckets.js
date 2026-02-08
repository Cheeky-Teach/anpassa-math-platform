/**
 * MASTER REGISTRY OF SKILL BUCKETS (VARIATION KEYS)
 * Scanned directly from the .ts generator source code.
 */

export const SKILL_BUCKETS = {
  // --- ALGEBRA & MÖNSTER ---
  algebra: {
    id: 'algebra',
    name: 'Algebra & Mönster',
    topics: {
      equations: {
        name: 'Ekvationslösning',
        variations: [
          { key: 'onestep_concept_inverse', name: 'Koncept: Invers', desc: 'Motsatt räknesätt' },
          { key: 'onestep_spot_lie', name: 'Hitta felet (Ensteg)', desc: 'Vilken lösning är falsk?' },
          { key: 'onestep_calc', name: 'Enstegsekvationer', desc: 'Standard x + a = b' },
          { key: 'twostep_concept_order', name: 'Koncept: Ordning', desc: 'Prioritering i algebra' },
          { key: 'twostep_calc', name: 'Tvåstegsekvationer', desc: 'ax + b = c' },
          { key: 'paren_lie_distribution', name: 'Parentes-fällan', desc: 'Felaktig multiplikation' },
          { key: 'paren_calc', name: 'Ekvation m. parentes', desc: 'a(x + b) = c' },
          { key: 'bothsides_concept_strategy', name: 'Strategi: x på båda sidor', desc: 'Effektiv samling' },
          { key: 'bothsides_calc', name: 'X på båda sidor', desc: 'ax + b = cx + d' }
        ]
      },
      expressions: {
        name: 'Förenkling',
        variations: [
          { key: 'combine_lie_exponent', name: 'Exponent-fällan', desc: 'x + x vs x * x' },
          { key: 'combine_concept_id', name: 'Identifiera termer', desc: 'Vilka hör ihop?' },
          { key: 'combine_standard_mixed', name: 'Samla termer', desc: 'Standardförenkling' },
          { key: 'distribute_lie_partial', name: 'Partiell multiplikation', desc: 'Vanligt misstag' },
          { key: 'distribute_inverse_factor', name: 'Hitta faktorn', desc: 'Vad står utanför?' },
          { key: 'distribute_plus', name: 'Parentes (+)', desc: 'Multiplicera in positivt' },
          { key: 'distribute_minus', name: 'Parentes (-)', desc: 'Multiplicera in negativt' },
          { key: 'distribute_double', name: 'Dubbel parenteser', desc: 'Summa av uttryck' },
          { key: 'distribute_combine_std', name: 'Expandera & Förenkla', desc: 'Hela kedjan' },
          { key: 'sub_concept_plus_logic', name: 'Teckenbyte logik', desc: 'Minus framför parentes' },
          { key: 'sub_block_plus', name: 'Minusparentes (+)', desc: '-(x + a)' },
          { key: 'sub_block_minus', name: 'Minusparentes (-)', desc: '-(x - a)' }
        ]
      },
      equations_word: {
        name: 'Ekvationer: Vardag',
        variations: [
          { key: 'rate_fixed_add_write', name: 'Ställ upp: Rörlig + Fast', desc: 'ax + b' },
          { key: 'rate_fixed_add_solve', name: 'Lös: Rörlig + Fast', desc: 'Hitta x' },
          { key: 'rate_fixed_sub_write', name: 'Ställ upp: Minskning', desc: 'ax - b' },
          { key: 'rate_fixed_sub_solve', name: 'Lös: Minskning', desc: 'Hitta x' },
          { key: 'compare_word_sum_write', name: 'Ställ upp: Jämförelse', desc: 'x + (x + a)' },
          { key: 'compare_word_sum_solve', name: 'Lös: Jämförelse', desc: 'Hitta x' }
        ]
      },
      patterns: {
        name: 'Mönster & Formler',
        variations: [
          { key: 'seq_lie', name: 'Egenskaps-lögnen', desc: 'Analys av följd' },
          { key: 'seq_type', name: 'Aritmetisk/Geometrisk', desc: 'Typ av mönster' },
          { key: 'seq_diff', name: 'Hitta differensen', desc: 'Hoppstorlek' },
          { key: 'seq_next', name: 'Nästa tal', desc: 'Fortsätt följden' },
          { key: 'high_term', name: 'Hitta term n', desc: 'Genvägsräkning' },
          { key: 'formula_missing', name: 'Lös ? i formeln', desc: '?n + b' },
          { key: 'visual_calc', name: 'Matchsticksberäkning', desc: 'Hur många stickor?' },
          { key: 'find_formula', name: 'Skriv formeln', desc: 'an + b' },
          { key: 'reverse_calc', name: 'Hitta figurnummer', desc: 'Givet totalen, sök n' }
        ]
      },
      graphs: {
        name: 'Grafer & Funktioner',
        variations: [
          { key: 'intercept_id', name: 'Hitta m-värde', desc: 'y-axelns skärning' },
          { key: 'slope_pos_int', name: 'Lutning (k > 0)', desc: 'Stigande linje' },
          { key: 'slope_neg_int', name: 'Lutning (k < 0)', desc: 'Sjunkande linje' },
          { key: 'eq_standard', name: 'y = kx + m', desc: 'Hela ekvationen' },
          { key: 'eq_no_m', name: 'y = kx', desc: 'Proportionalitet' }
        ]
      }
    }
  },

  // --- ARITMETIK & TAL ---
  arithmetic: {
    id: 'arithmetic',
    name: 'Aritmetik & Tal',
    topics: {
      basic_arithmetic: {
        name: 'De fyra räknesätten',
        variations: [
          { key: 'add_std_vertical', name: 'Addition: Vertikal', desc: 'Uppställning' },
          { key: 'add_missing_variable', name: 'Addition: Saknat tal', desc: 'a + x = b' },
          { key: 'sub_std_vertical', name: 'Subtraktion: Vertikal', desc: 'Växling' },
          { key: 'sub_missing_variable', name: 'Subtraktion: Saknat tal', desc: 'a - x = b' },
          { key: 'mult_table_std', name: 'Multiplikationstabell', desc: '2-10' },
          { key: 'mult_decimal_std', name: 'Decimalmultiplikation', desc: 'Decimalsteg' },
          { key: 'div_basic_std', name: 'Kort division', desc: 'Standardmetod' }
        ]
      },
      negatives: {
        name: 'Negativa Tal',
        variations: [
          { key: 'theory_number_line', name: 'Tallinjen', desc: 'Position och hopp' },
          { key: 'theory_sign_dominance', name: 'Teckendominans', desc: 'Störst absolutbelopp' },
          { key: 'fluency_double_neg', name: 'Dubbeltecken', desc: '-(-) till +' },
          { key: 'mult_chain', name: 'Teckenkedjan', desc: '3-5 faktorer' },
          { key: 'div_check_logic', name: 'Bevisa division', desc: 'Via multiplikation' }
        ]
      },
      ten_powers: {
        name: 'Tiopotenser',
        variations: [
          { key: 'big_mult_std', name: 'Gånger 10/100/1000', desc: 'Flytta komma höger' },
          { key: 'big_div_std', name: 'Delat med 10/100/1000', desc: 'Flytta komma vänster' },
          { key: 'decimal_div_std', name: 'Dela med 0,1 / 0,01', desc: 'Resultatet blir större' },
          { key: 'power_discovery', name: 'Skriv som potens', desc: 'Bas 10' }
        ]
      },
      exponents: {
        name: 'Potenser',
        variations: [
          { key: 'exp_concept', name: 'Bas & Exponent', desc: 'Grundbegrepp' },
          { key: 'exp_mult_same_base', name: 'Multiplikation', desc: 'Addera exponenter' },
          { key: 'exp_neg_base', name: 'Negativ bas', desc: 'Udda/Jämn exponent' }
        ]
      },
      fractions_basics: {
        name: 'Bråk: Grunder',
        variations: [
          { key: 'visual_translation', name: 'Identifiera andel', desc: 'Bild till bråk' },
          { key: 'mixed_convert_imp', name: 'Blandad form', desc: 'Omvandling' },
          { key: 'simplify_calc', name: 'Förkortning', desc: 'Enklaste form' }
        ]
      }
    }
  },

  // --- GEOMETRI & MÄTNING ---
  geometry_cat: {
    id: 'geometry_cat',
    name: 'Geometri & Mätning',
    topics: {
      geometry: {
        name: 'Area & Omkrets',
        variations: [
          { key: 'perimeter_rect', name: 'Omkrets rektangel', desc: 'Sidorna runt om' },
          { key: 'perimeter_inverse', name: 'Hitta sidan (Omkrets)', desc: 'Givet O, sök b eller h' },
          { key: 'area_rect', name: 'Area rektangel', desc: 'b * h' },
          { key: 'area_triangle', name: 'Area triangel', desc: '(b * h) / 2' },
          { key: 'circle_area', name: 'Area cirkel', desc: 'pi * r^2' },
          { key: 'circle_perimeter', name: 'Omkrets cirkel', desc: 'pi * d' },
          { key: 'combined_house', name: 'Sammansatt: Huset', desc: 'Rektangel + Triangel' },
          { key: 'perimeter_portal', name: 'Portalen (Omkrets)', desc: 'Innehåller kurva' }
        ]
      },
      pythagoras: {
        name: 'Pythagoras Sats',
        variations: [
          { key: 'hyp_visual', name: 'Hitta c', desc: 'Standard rätvinklig' },
          { key: 'leg_visual', name: 'Hitta a eller b', desc: 'Subtraktion av kvadrater' },
          { key: 'app_ladder', name: 'Stegen', desc: 'Vardagsproblem' },
          { key: 'app_displacement', name: 'Fågelvägen', desc: 'Nord/Ost förflyttning' },
          { key: 'conv_trap', name: 'Triangel-lögnen', desc: 'Logiskt test' }
        ]
      },
      volume: {
        name: 'Volym & Yta',
        variations: [
          { key: 'vol_cuboid_std', name: 'Rätblock', desc: 'b * d * h' },
          { key: 'vol_cyl_std', name: 'Cylinder', desc: 'Cirkelarea * h' },
          { key: 'vol_cone_rule3', name: 'Tredjedelsregeln', desc: 'Kon vs Cylinder' },
          { key: 'vol_units_liter', name: 'Enheter: Liter', desc: 'dm3 till liter' },
          { key: 'sa_cuboid', name: 'Ytarea: Rätblock', desc: 'Begränsningsarea' }
        ]
      },
      scale: {
        name: 'Skala & Likformighet',
        variations: [
          { key: 'calc_real', name: 'Beräkna verklighet', desc: '1:X' },
          { key: 'determine_magnification', name: 'Bestäm förstoring', desc: 'X:1' },
          { key: 'area_reverse', name: 'Omvänd areaskala', desc: 'Längd via roten ur' },
          { key: 'sim_calc_big', name: 'Likformig sida', desc: 'Använd k-faktor' }
        ]
      },
      angles: {
        name: 'Vinklar',
        variations: [
          { key: 'id_type', name: 'Namnge vinkeltyp', desc: 'Spetsig/Trubbig/Rät' },
          { key: 'calc_missing_straight', name: 'Sidovinklar', desc: 'Summa 180' },
          { key: 'calc_missing_tri', name: 'Vinkelsumma triangel', desc: 'Hitta saknad vinkel' }
        ]
      }
    }
  },

  // --- DATA & CHANS ---
  data: {
    id: 'data',
    name: 'Data & Chans',
    topics: {
      statistics: {
        name: 'Statistik',
        variations: [
          { key: 'find_mode', name: 'Typvärde', desc: 'Vanligaste' },
          { key: 'find_range', name: 'Variationsbredd', desc: 'Största - Minsta' },
          { key: 'calc_mean', name: 'Medelvärde', desc: 'Summa / Antal' },
          { key: 'mean_target_score', name: 'Mål-medelvärde', desc: 'Vad krävs på nästa test?' },
          { key: 'real_measure_choice', name: 'Välj rätt mått', desc: 'Median vs Medel vid outliers' }
        ]
      },
      probability: {
        name: 'Sannolikhet',
        variations: [
          { key: 'visual_calc', name: 'Klassisk sannolikhet', desc: 'Vinstchans' },
          { key: 'visual_spinner', name: 'Lyckohjul', desc: 'Sektorer' },
          { key: 'comp_at_least', name: 'Minst en gång', desc: 'Komplementmetoden' },
          { key: 'tree_calc', name: 'Sannolikhetsträd', desc: 'Flerstegshändelser' },
          { key: 'comb_handshake', name: 'Kombinatorik', desc: 'Handskakningar' }
        ]
      }
    }
  }
};