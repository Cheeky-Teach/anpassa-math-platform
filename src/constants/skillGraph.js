/**
 * AUTO-GENERATED BEGREPPSKARTA / CONCEPT MAP GRAPH
 * Generated on: 2026-11-13T23:12:44.761Z
 * Do not edit manually — generated via scripts/generateContentMap.js
 */
export const SKILL_GRAPH = {
    "equations:1": {
        "id": "equations:1",
        "topicId": "equations",
        "level": 1,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Enkla steg (x+a=b)",
            "en": "One Step"
        },
        "example": "$$x - 18 = -7$$",
        "sampleVariationKey": "onestep_calc",
        "prerequisites": [
            "basic_arithmetic:1",
            "negatives:1"
        ],
        "unlocks": [
            "equations:2",
            "pythagoras:3",
            "similarity:2",
            "statistics:4"
        ],
        "tier": 3
    },
    "equations:2": {
        "id": "equations:2",
        "topicId": "equations",
        "level": 2,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Två steg (ax+b=c)",
            "en": "Two Steps"
        },
        "example": "$$2x + 5 = 29$$",
        "sampleVariationKey": "twostep_calc",
        "prerequisites": [
            "equations:1",
            "order_of_operations:1"
        ],
        "unlocks": [
            "equations:3",
            "equations:4",
            "equations_word:1",
            "algebraic_geometry:2",
            "algebraic_geometry:4",
            "algebraic_geometry:6",
            "patterns:5"
        ],
        "tier": 8
    },
    "equations:3": {
        "id": "equations:3",
        "topicId": "equations",
        "level": 3,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Med Parenteser",
            "en": "With Parentheses"
        },
        "example": "$$4(x + 6) = 44$$",
        "sampleVariationKey": "paren_calc",
        "prerequisites": [
            "equations:2",
            "expressions:3"
        ],
        "unlocks": [
            "equations:4"
        ],
        "tier": 10
    },
    "equations:4": {
        "id": "equations:4",
        "topicId": "equations",
        "level": 4,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Variabel på båda sidor",
            "en": "Variables on both sides"
        },
        "example": "$$9x + 4 = 2x + 46$$",
        "sampleVariationKey": "bothsides_calc",
        "prerequisites": [
            "equations:3",
            "expressions:1",
            "equations:2"
        ],
        "unlocks": [
            "equations:5"
        ],
        "tier": 11
    },
    "equations:5": {
        "id": "equations:5",
        "topicId": "equations",
        "level": 5,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Skriv Ekvation (Problem)",
            "en": "Write Equation (Word Problems)"
        },
        "example": "$$9x + 4 = 2x + 46$$",
        "sampleVariationKey": "bothsides_calc",
        "prerequisites": [
            "equations:4"
        ],
        "unlocks": [
            "equations:6"
        ],
        "tier": 12
    },
    "equations:6": {
        "id": "equations:6",
        "topicId": "equations",
        "level": 6,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Lös Problem (Ekvation)",
            "en": "Solve Word Problems"
        },
        "example": "$$9x + 4 = 2x + 46$$",
        "sampleVariationKey": "bothsides_calc",
        "prerequisites": [
            "equations:5"
        ],
        "unlocks": [
            "equations:7"
        ],
        "tier": 13
    },
    "equations:7": {
        "id": "equations:7",
        "topicId": "equations",
        "level": 7,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Blandade Ekvationer",
            "en": "Mixed Equations"
        },
        "example": "$$9x + 4 = 2x + 46$$",
        "sampleVariationKey": "bothsides_calc",
        "prerequisites": [
            "equations:6"
        ],
        "unlocks": [],
        "tier": 14
    },
    "equations_word:1": {
        "id": "equations_word:1",
        "topicId": "equations_word",
        "level": 1,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Ekvationer: Problemlösning",
            "en": "Equations: Problem Solving"
        },
        "levelDesc": {
            "sv": "Skriv: Fast + Rörlig",
            "en": "Write: Fixed + Variable"
        },
        "example": "$$12x+49=265$$",
        "sampleVariationKey": "rate_fixed_add_write",
        "prerequisites": [
            "equations:2"
        ],
        "unlocks": [],
        "tier": 9
    },
    "expressions:1": {
        "id": "expressions:1",
        "topicId": "expressions",
        "level": 1,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Uttryck",
            "en": "Expressions"
        },
        "levelDesc": {
            "sv": "Förenkla Uttryck (Enkel)",
            "en": "Simplify Expressions (Easy)"
        },
        "example": "$$18x + 12 + 5x - 5$$",
        "sampleVariationKey": "combine_standard_mixed",
        "prerequisites": [
            "basic_arithmetic:1",
            "negatives:1"
        ],
        "unlocks": [
            "equations:4",
            "expressions:2",
            "expressions:3",
            "algebraic_geometry:1",
            "algebraic_geometry:5",
            "patterns:2",
            "patterns:3"
        ],
        "tier": 3
    },
    "expressions:2": {
        "id": "expressions:2",
        "topicId": "expressions",
        "level": 2,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Uttryck",
            "en": "Expressions"
        },
        "levelDesc": {
            "sv": "Prioriteringsregler med x",
            "en": "Order of Ops with x"
        },
        "example": "$$6 \\cdot 5x - 4x - 5$$",
        "sampleVariationKey": "combine_mult_mixed",
        "prerequisites": [
            "expressions:1",
            "order_of_operations:1"
        ],
        "unlocks": [
            "expressions:3",
            "algebraic_geometry:3"
        ],
        "tier": 8
    },
    "expressions:3": {
        "id": "expressions:3",
        "topicId": "expressions",
        "level": 3,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Uttryck",
            "en": "Expressions"
        },
        "levelDesc": {
            "sv": "Parenteser (Addition)",
            "en": "Parentheses (Addition)"
        },
        "example": "$$20x + (4x + 3)$$",
        "sampleVariationKey": "distribute_plus",
        "prerequisites": [
            "expressions:2",
            "basic_arithmetic:5",
            "expressions:1"
        ],
        "unlocks": [
            "equations:3",
            "expressions:4",
            "expressions:5"
        ],
        "tier": 9
    },
    "expressions:4": {
        "id": "expressions:4",
        "topicId": "expressions",
        "level": 4,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Uttryck",
            "en": "Expressions"
        },
        "levelDesc": {
            "sv": "Parenteser (Multiplikation)",
            "en": "Parentheses (Multiplication)"
        },
        "example": "$$3(x + 5) - 2(x + 5)$$",
        "sampleVariationKey": "distribute_double",
        "prerequisites": [
            "expressions:3"
        ],
        "unlocks": [
            "expressions:5"
        ],
        "tier": 10
    },
    "expressions:5": {
        "id": "expressions:5",
        "topicId": "expressions",
        "level": 5,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Uttryck",
            "en": "Expressions"
        },
        "levelDesc": {
            "sv": "Parenteser (Subtraktion)",
            "en": "Parentheses (Subtraction)"
        },
        "example": "$$20x - (4x + 5)$$",
        "sampleVariationKey": "sub_block_plus",
        "prerequisites": [
            "expressions:4",
            "negatives:2",
            "expressions:3"
        ],
        "unlocks": [
            "expressions:6"
        ],
        "tier": 11
    },
    "expressions:6": {
        "id": "expressions:6",
        "topicId": "expressions",
        "level": 6,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Uttryck",
            "en": "Expressions"
        },
        "levelDesc": {
            "sv": "Blandade Nivåer",
            "en": "Mixed Levels"
        },
        "example": "$$20x - (4x + 5)$$",
        "sampleVariationKey": "sub_block_plus",
        "prerequisites": [
            "expressions:5"
        ],
        "unlocks": [],
        "tier": 12
    },
    "algebraic_geometry:1": {
        "id": "algebraic_geometry:1",
        "topicId": "algebraic_geometry",
        "level": 1,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Geometri med Algebra",
            "en": "Geometry with Algebra"
        },
        "levelDesc": {
            "sv": "Omkrets: Teckna uttryck",
            "en": "Perimeter: Write Expression"
        },
        "example": "Teckna ett förenklat uttryck för figurens omkrets.",
        "sampleVariationKey": "perimeter_write",
        "prerequisites": [
            "expressions:1",
            "geometry:1"
        ],
        "unlocks": [
            "algebraic_geometry:2"
        ],
        "tier": 4
    },
    "algebraic_geometry:2": {
        "id": "algebraic_geometry:2",
        "topicId": "algebraic_geometry",
        "level": 2,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Geometri med Algebra",
            "en": "Geometry with Algebra"
        },
        "levelDesc": {
            "sv": "Omkrets: Lös ut x",
            "en": "Perimeter: Solve for x"
        },
        "example": "En liksidig triangels omkrets är 21 cm. Beräkna x.",
        "sampleVariationKey": "perimeter_solve",
        "prerequisites": [
            "algebraic_geometry:1",
            "equations:2"
        ],
        "unlocks": [
            "algebraic_geometry:3"
        ],
        "tier": 9
    },
    "algebraic_geometry:3": {
        "id": "algebraic_geometry:3",
        "topicId": "algebraic_geometry",
        "level": 3,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Geometri med Algebra",
            "en": "Geometry with Algebra"
        },
        "levelDesc": {
            "sv": "Area: Teckna uttryck",
            "en": "Area: Write Expression"
        },
        "example": "Teckna ett förenklat uttryck för figurens area.",
        "sampleVariationKey": "area_write",
        "prerequisites": [
            "algebraic_geometry:2",
            "expressions:2",
            "geometry:2"
        ],
        "unlocks": [
            "algebraic_geometry:4"
        ],
        "tier": 10
    },
    "algebraic_geometry:4": {
        "id": "algebraic_geometry:4",
        "topicId": "algebraic_geometry",
        "level": 4,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Geometri med Algebra",
            "en": "Geometry with Algebra"
        },
        "levelDesc": {
            "sv": "Area: Lös ut x",
            "en": "Area: Solve for x"
        },
        "example": "Triangelns area är 175 cm². Beräkna x.",
        "sampleVariationKey": "area_solve",
        "prerequisites": [
            "algebraic_geometry:3",
            "equations:2"
        ],
        "unlocks": [
            "algebraic_geometry:5"
        ],
        "tier": 11
    },
    "algebraic_geometry:5": {
        "id": "algebraic_geometry:5",
        "topicId": "algebraic_geometry",
        "level": 5,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Geometri med Algebra",
            "en": "Geometry with Algebra"
        },
        "levelDesc": {
            "sv": "Vinklar: Teckna uttryck",
            "en": "Angles: Write Expression"
        },
        "example": "Teckna ett förenklat uttryck för de två vinklarnas sammanlagda summa.",
        "sampleVariationKey": "angles_write",
        "prerequisites": [
            "algebraic_geometry:4",
            "expressions:1",
            "angles:2"
        ],
        "unlocks": [
            "algebraic_geometry:6"
        ],
        "tier": 12
    },
    "algebraic_geometry:6": {
        "id": "algebraic_geometry:6",
        "topicId": "algebraic_geometry",
        "level": 6,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Geometri med Algebra",
            "en": "Geometry with Algebra"
        },
        "levelDesc": {
            "sv": "Vinklar: Lös ut x",
            "en": "Angles: Solve for x"
        },
        "example": "Vinklarna bildar tillsammans 180°. Beräkna x.",
        "sampleVariationKey": "angles_solve",
        "prerequisites": [
            "algebraic_geometry:5",
            "equations:2",
            "angles:2"
        ],
        "unlocks": [],
        "tier": 13
    },
    "patterns:1": {
        "id": "patterns:1",
        "topicId": "patterns",
        "level": 1,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Algebraiska mönster",
            "en": "Algebraic patterns"
        },
        "levelDesc": {
            "sv": "Hitta nästa tal & Skillnad",
            "en": "Next Number & Difference"
        },
        "example": "Vilket tal ska stå istället för frågetecknet?",
        "sampleVariationKey": "seq_type",
        "prerequisites": [],
        "unlocks": [
            "patterns:2"
        ],
        "tier": 0
    },
    "patterns:2": {
        "id": "patterns:2",
        "topicId": "patterns",
        "level": 2,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Algebraiska mönster",
            "en": "Algebraic patterns"
        },
        "levelDesc": {
            "sv": "Beräkna höga figurer",
            "en": "Calculate High Terms"
        },
        "example": "Vilket värde har tal nummer 50 i mönstret: 8, 17, 26... ?",
        "sampleVariationKey": "high_term",
        "prerequisites": [
            "patterns:1",
            "expressions:1"
        ],
        "unlocks": [
            "patterns:3"
        ],
        "tier": 4
    },
    "patterns:3": {
        "id": "patterns:3",
        "topicId": "patterns",
        "level": 3,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Algebraiska mönster",
            "en": "Algebraic patterns"
        },
        "levelDesc": {
            "sv": "Från bild till uttryck",
            "en": "From Visual to Expression"
        },
        "example": "Vilket uttryck beskriver antalet stickor i figur n?",
        "sampleVariationKey": "formula_missing",
        "prerequisites": [
            "patterns:2",
            "expressions:1"
        ],
        "unlocks": [
            "patterns:4"
        ],
        "tier": 5
    },
    "patterns:4": {
        "id": "patterns:4",
        "topicId": "patterns",
        "level": 4,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Algebraiska mönster",
            "en": "Algebraic patterns"
        },
        "levelDesc": {
            "sv": "Från tabell till formel",
            "en": "Table to Formula"
        },
        "example": "Bestäm uttrycket på formen $an + b$ som beskriver mönstret i tabellen.",
        "sampleVariationKey": "table_formula",
        "prerequisites": [
            "patterns:3"
        ],
        "unlocks": [
            "patterns:5",
            "graphs:3"
        ],
        "tier": 6
    },
    "patterns:5": {
        "id": "patterns:5",
        "topicId": "patterns",
        "level": 5,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Algebraiska mönster",
            "en": "Algebraic patterns"
        },
        "levelDesc": {
            "sv": "Lös ut n (baklänges)",
            "en": "Solve for n"
        },
        "example": "I ett mönster med formeln $V = 8n + 3$, vilket figurnummer (n) har värdet 307?",
        "sampleVariationKey": "reverse_calc",
        "prerequisites": [
            "patterns:4",
            "equations:2"
        ],
        "unlocks": [],
        "tier": 9
    },
    "graphs:1": {
        "id": "graphs:1",
        "topicId": "graphs",
        "level": 1,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Räta Linjens Ekvation",
            "en": "Linear Equations & Graphs"
        },
        "levelDesc": {
            "sv": "Hitta m-värdet (Starttal)",
            "en": "Find m-value (Intercept)"
        },
        "example": "Var skär linjen den stående y-axeln? Bestäm linjens m-värde (starttal).",
        "sampleVariationKey": "intercept_id",
        "prerequisites": [
            "negatives:1"
        ],
        "unlocks": [
            "graphs:2",
            "graphs:4",
            "pythagoras:5"
        ],
        "tier": 3
    },
    "graphs:2": {
        "id": "graphs:2",
        "topicId": "graphs",
        "level": 2,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Räta Linjens Ekvation",
            "en": "Linear Equations & Graphs"
        },
        "levelDesc": {
            "sv": "Lutning & Trappsteg (k-värde)",
            "en": "Slope & Rate of Change (k-value)"
        },
        "example": "Bestäm linjens lutning (k-värde).",
        "sampleVariationKey": "slope_pos_int",
        "prerequisites": [
            "graphs:1",
            "negatives:4",
            "fraction_arith:1"
        ],
        "unlocks": [
            "graphs:3",
            "graphs:4"
        ],
        "tier": 12
    },
    "graphs:3": {
        "id": "graphs:3",
        "topicId": "graphs",
        "level": 3,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Räta Linjens Ekvation",
            "en": "Linear Equations & Graphs"
        },
        "levelDesc": {
            "sv": "Värdetabell & Funktioner",
            "en": "Tables & Functions"
        },
        "example": "Vilken formel $y = kx + m$ beskriver sambandet i tabellen?",
        "sampleVariationKey": "table_to_function",
        "prerequisites": [
            "graphs:2",
            "patterns:4"
        ],
        "unlocks": [
            "graphs:4"
        ],
        "tier": 13
    },
    "graphs:4": {
        "id": "graphs:4",
        "topicId": "graphs",
        "level": 4,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Räta Linjens Ekvation",
            "en": "Linear Equations & Graphs"
        },
        "levelDesc": {
            "sv": "Linjens ekvation & Grafer",
            "en": "Line Equation & Graph Reading"
        },
        "example": "Bestäm linjens ekvation på formen y = kx + m.",
        "sampleVariationKey": "eq_standard",
        "prerequisites": [
            "graphs:3",
            "graphs:1",
            "graphs:2"
        ],
        "unlocks": [
            "graphs:5"
        ],
        "tier": 14
    },
    "graphs:5": {
        "id": "graphs:5",
        "topicId": "graphs",
        "level": 5,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Räta Linjens Ekvation",
            "en": "Linear Equations & Graphs"
        },
        "levelDesc": {
            "sv": "Koordinater & Parallella linjer",
            "en": "Coordinates & Parallel Lines"
        },
        "example": "Ligger punkten $(4, -4)$ på linjen $y=-x$?",
        "sampleVariationKey": "point_on_line",
        "prerequisites": [
            "graphs:4"
        ],
        "unlocks": [
            "graphs:6"
        ],
        "tier": 15
    },
    "graphs:6": {
        "id": "graphs:6",
        "topicId": "graphs",
        "level": 6,
        "category": "algebra",
        "color": "indigo",
        "topicLabel": {
            "sv": "Räta Linjens Ekvation",
            "en": "Linear Equations & Graphs"
        },
        "levelDesc": {
            "sv": "Blandade Linjära Funktioner",
            "en": "Mixed Linear Functions"
        },
        "example": "Läs av grafen. Vilket är startvärdet (m-värdet) där linjen skär den stående axeln?",
        "sampleVariationKey": "scaled_intercept",
        "prerequisites": [
            "graphs:5"
        ],
        "unlocks": [],
        "tier": 16
    },
    "basic_arithmetic:1": {
        "id": "basic_arithmetic:1",
        "topicId": "basic_arithmetic",
        "level": 1,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Addition (Uppställning)",
            "en": "Addition (Vertical)"
        },
        "example": "$$\\begin{array}{rr} & 20 \\\\ + & 10 \\\\ \\hline \\end{array}$$",
        "sampleVariationKey": "add_std_vertical",
        "prerequisites": [],
        "unlocks": [
            "equations:1",
            "expressions:1",
            "basic_arithmetic:2",
            "geometry:1",
            "statistics:2"
        ],
        "tier": 0
    },
    "basic_arithmetic:2": {
        "id": "basic_arithmetic:2",
        "topicId": "basic_arithmetic",
        "level": 2,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Subtraktion (Uppställning)",
            "en": "Subtraction (Vertical)"
        },
        "example": "$$\\begin{array}{rr} & 198 \\\\ - & 90 \\\\ \\hline \\end{array}$$",
        "sampleVariationKey": "sub_std_vertical",
        "prerequisites": [
            "basic_arithmetic:1"
        ],
        "unlocks": [
            "basic_arithmetic:3",
            "negatives:1"
        ],
        "tier": 1
    },
    "basic_arithmetic:3": {
        "id": "basic_arithmetic:3",
        "topicId": "basic_arithmetic",
        "level": 3,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Decimaltal (+/-)",
            "en": "Decimals (+/-)"
        },
        "example": "$$13,2 + 3,47$$",
        "sampleVariationKey": "dec_add_vertical",
        "prerequisites": [
            "basic_arithmetic:2"
        ],
        "unlocks": [
            "basic_arithmetic:4"
        ],
        "tier": 2
    },
    "basic_arithmetic:4": {
        "id": "basic_arithmetic:4",
        "topicId": "basic_arithmetic",
        "level": 4,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Multiplikation (Enkel)",
            "en": "Multiplication (Simple)"
        },
        "example": "$$9 \\cdot 6$$",
        "sampleVariationKey": "mult_table_std",
        "prerequisites": [
            "basic_arithmetic:3"
        ],
        "unlocks": [
            "basic_arithmetic:5",
            "order_of_operations:1",
            "exponents:1",
            "geometry:2",
            "scale:1",
            "probability:5"
        ],
        "tier": 3
    },
    "basic_arithmetic:5": {
        "id": "basic_arithmetic:5",
        "topicId": "basic_arithmetic",
        "level": 5,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Multiplikation (Medel)",
            "en": "Multiplication (Medium)"
        },
        "example": "$$\\begin{array}{rr} & 38 \\\\ \\times & 5 \\\\ \\hline \\end{array}$$",
        "sampleVariationKey": "mult_2x1_vertical",
        "prerequisites": [
            "basic_arithmetic:4"
        ],
        "unlocks": [
            "expressions:3",
            "basic_arithmetic:6",
            "volume:1"
        ],
        "tier": 4
    },
    "basic_arithmetic:6": {
        "id": "basic_arithmetic:6",
        "topicId": "basic_arithmetic",
        "level": 6,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Multiplikation (Svår)",
            "en": "Multiplication (Hard)"
        },
        "example": "$$0,81 \\cdot 8$$",
        "sampleVariationKey": "mult_decimal_std",
        "prerequisites": [
            "basic_arithmetic:5"
        ],
        "unlocks": [
            "basic_arithmetic:7",
            "change_factor:1",
            "ten_powers:1",
            "geometry:5"
        ],
        "tier": 5
    },
    "basic_arithmetic:7": {
        "id": "basic_arithmetic:7",
        "topicId": "basic_arithmetic",
        "level": 7,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Kort Division",
            "en": "Short Division"
        },
        "example": "$$\\frac{21}{7}$$",
        "sampleVariationKey": "div_basic_std",
        "prerequisites": [
            "basic_arithmetic:6"
        ],
        "unlocks": [
            "basic_arithmetic:8",
            "order_of_operations:1",
            "fractions_basics:1",
            "percent:2",
            "geometry:3",
            "statistics:2"
        ],
        "tier": 6
    },
    "basic_arithmetic:8": {
        "id": "basic_arithmetic:8",
        "topicId": "basic_arithmetic",
        "level": 8,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Delbarhetsregler",
            "en": "Divisibility Rules"
        },
        "example": "Vilket av följande tal är delbart med 5?",
        "sampleVariationKey": "div_rule_check",
        "prerequisites": [
            "basic_arithmetic:7"
        ],
        "unlocks": [
            "basic_arithmetic:9"
        ],
        "tier": 7
    },
    "basic_arithmetic:9": {
        "id": "basic_arithmetic:9",
        "topicId": "basic_arithmetic",
        "level": 9,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Division med Decimaler",
            "en": "Division with Decimals"
        },
        "example": "$$\\frac{4,8}{4}$$",
        "sampleVariationKey": "div_decimal_dividend",
        "prerequisites": [
            "basic_arithmetic:8"
        ],
        "unlocks": [
            "basic_arithmetic:10"
        ],
        "tier": 8
    },
    "basic_arithmetic:10": {
        "id": "basic_arithmetic:10",
        "topicId": "basic_arithmetic",
        "level": 10,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Blandade Heltal",
            "en": "Mixed Integers"
        },
        "example": "$$\\frac{4,8}{4}$$",
        "sampleVariationKey": "div_decimal_dividend",
        "prerequisites": [
            "basic_arithmetic:9"
        ],
        "unlocks": [
            "basic_arithmetic:11"
        ],
        "tier": 9
    },
    "basic_arithmetic:11": {
        "id": "basic_arithmetic:11",
        "topicId": "basic_arithmetic",
        "level": 11,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Blandade Decimaltal",
            "en": "Mixed Decimals"
        },
        "example": "$$\\frac{4,8}{4}$$",
        "sampleVariationKey": "div_decimal_dividend",
        "prerequisites": [
            "basic_arithmetic:10"
        ],
        "unlocks": [],
        "tier": 10
    },
    "place_value:1": {
        "id": "place_value:1",
        "topicId": "place_value",
        "level": 1,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Positionssystemet & Avrundning",
            "en": "Place Value & Rounding"
        },
        "levelDesc": {
            "sv": "Heltal (Position)",
            "en": "Whole Numbers (Place Value)"
        },
        "example": "Vilket värde har siffran 8 i talet 8152?",
        "sampleVariationKey": "pv_whole_value",
        "prerequisites": [],
        "unlocks": [
            "place_value:2"
        ],
        "tier": 0
    },
    "place_value:2": {
        "id": "place_value:2",
        "topicId": "place_value",
        "level": 2,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Positionssystemet & Avrundning",
            "en": "Place Value & Rounding"
        },
        "levelDesc": {
            "sv": "Decimaltal (Position)",
            "en": "Decimals (Place Value)"
        },
        "example": "Vilket värde har siffran 3 i talet 285,3? Svara i decimalform.",
        "sampleVariationKey": "pv_dec_value",
        "prerequisites": [
            "place_value:1"
        ],
        "unlocks": [
            "place_value:3",
            "percent:1",
            "ten_powers:1"
        ],
        "tier": 1
    },
    "place_value:3": {
        "id": "place_value:3",
        "topicId": "place_value",
        "level": 3,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Positionssystemet & Avrundning",
            "en": "Place Value & Rounding"
        },
        "levelDesc": {
            "sv": "Avrundning",
            "en": "Rounding"
        },
        "example": "Avrunda talet 9008,81 till närmaste hundratal. (Svara som ett heltal utan kommatecken)",
        "sampleVariationKey": "pv_round_whole",
        "prerequisites": [
            "place_value:2"
        ],
        "unlocks": [],
        "tier": 2
    },
    "order_of_operations:1": {
        "id": "order_of_operations:1",
        "topicId": "order_of_operations",
        "level": 1,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Prioriteringsregler",
            "en": "Order of Operations"
        },
        "levelDesc": {
            "sv": "Prioritering: Grund",
            "en": "Order: Basics"
        },
        "example": "$$7 · 4 + 9$$",
        "sampleVariationKey": "order_basic",
        "prerequisites": [
            "basic_arithmetic:4",
            "basic_arithmetic:7"
        ],
        "unlocks": [
            "equations:2",
            "expressions:2",
            "order_of_operations:2",
            "fraction_arith:7"
        ],
        "tier": 7
    },
    "order_of_operations:2": {
        "id": "order_of_operations:2",
        "topicId": "order_of_operations",
        "level": 2,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Prioriteringsregler",
            "en": "Order of Operations"
        },
        "levelDesc": {
            "sv": "Prioritering: Parenteser",
            "en": "Order: Parentheses"
        },
        "example": "$$6 + 4 \\cdot (7 - 3)$$",
        "sampleVariationKey": "order_paren",
        "prerequisites": [
            "order_of_operations:1"
        ],
        "unlocks": [
            "order_of_operations:3"
        ],
        "tier": 8
    },
    "order_of_operations:3": {
        "id": "order_of_operations:3",
        "topicId": "order_of_operations",
        "level": 3,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Prioriteringsregler",
            "en": "Order of Operations"
        },
        "levelDesc": {
            "sv": "Prioritering: Bråkstreck",
            "en": "Order: Fraction Bars"
        },
        "example": "$$(8 + 5) · 2 + 7 · 6 + 40$$",
        "sampleVariationKey": "order_fraction",
        "prerequisites": [
            "order_of_operations:2"
        ],
        "unlocks": [
            "order_of_operations:4"
        ],
        "tier": 9
    },
    "order_of_operations:4": {
        "id": "order_of_operations:4",
        "topicId": "order_of_operations",
        "level": 4,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Prioriteringsregler",
            "en": "Order of Operations"
        },
        "levelDesc": {
            "sv": "Prioritering: Potenser",
            "en": "Order: Powers"
        },
        "example": "$$16 - \\frac{3 + 15}{9} - 3^{2}$$",
        "sampleVariationKey": "order_powers",
        "prerequisites": [
            "order_of_operations:3",
            "exponents:1"
        ],
        "unlocks": [],
        "tier": 10
    },
    "negatives:1": {
        "id": "negatives:1",
        "topicId": "negatives",
        "level": 1,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Negativa Tal",
            "en": "Negative Numbers"
        },
        "levelDesc": {
            "sv": "Enkel Addition/Subtraktion",
            "en": "Simple Add/Sub"
        },
        "example": "",
        "sampleVariationKey": null,
        "prerequisites": [
            "basic_arithmetic:2"
        ],
        "unlocks": [
            "equations:1",
            "expressions:1",
            "graphs:1",
            "negatives:2",
            "fraction_arith:6"
        ],
        "tier": 2
    },
    "negatives:2": {
        "id": "negatives:2",
        "topicId": "negatives",
        "level": 2,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Negativa Tal",
            "en": "Negative Numbers"
        },
        "levelDesc": {
            "sv": "Svårare Addition/Subtraktion",
            "en": "Harder Add/Sub"
        },
        "example": "$$4 + 5 - 5 + 5$$",
        "sampleVariationKey": "fluency_chain_4",
        "prerequisites": [
            "negatives:1"
        ],
        "unlocks": [
            "expressions:5",
            "negatives:3",
            "pythagoras:5"
        ],
        "tier": 3
    },
    "negatives:3": {
        "id": "negatives:3",
        "topicId": "negatives",
        "level": 3,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Negativa Tal",
            "en": "Negative Numbers"
        },
        "levelDesc": {
            "sv": "Multiplikation",
            "en": "Multiplication"
        },
        "example": "$$(-6) \\cdot (-8)$$",
        "sampleVariationKey": "mult_same_sign",
        "prerequisites": [
            "negatives:2"
        ],
        "unlocks": [
            "negatives:4"
        ],
        "tier": 4
    },
    "negatives:4": {
        "id": "negatives:4",
        "topicId": "negatives",
        "level": 4,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Negativa Tal",
            "en": "Negative Numbers"
        },
        "levelDesc": {
            "sv": "Division",
            "en": "Division"
        },
        "example": "$$\\frac{-8}{-2}$$",
        "sampleVariationKey": "div_same_sign",
        "prerequisites": [
            "negatives:3"
        ],
        "unlocks": [
            "graphs:2",
            "negatives:5"
        ],
        "tier": 5
    },
    "negatives:5": {
        "id": "negatives:5",
        "topicId": "negatives",
        "level": 5,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Negativa Tal",
            "en": "Negative Numbers"
        },
        "levelDesc": {
            "sv": "Blandade + - x /",
            "en": "Mixed: + - x /"
        },
        "example": "$$\\frac{-8}{-2}$$",
        "sampleVariationKey": "div_same_sign",
        "prerequisites": [
            "negatives:4"
        ],
        "unlocks": [
            "negatives:6"
        ],
        "tier": 6
    },
    "negatives:6": {
        "id": "negatives:6",
        "topicId": "negatives",
        "level": 6,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Negativa Tal",
            "en": "Negative Numbers"
        },
        "levelDesc": {
            "sv": "Prioriteringsregler: Negativa tal",
            "en": "Order of Ops with Negative Numbers"
        },
        "example": "$$\\frac{-11  +  (-5)  \\cdot  (-1)}{-6}$$",
        "sampleVariationKey": "neg_order_frac_basic",
        "prerequisites": [
            "negatives:5"
        ],
        "unlocks": [],
        "tier": 7
    },
    "fractions_basics:1": {
        "id": "fractions_basics:1",
        "topicId": "fractions_basics",
        "level": 1,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Grunder",
            "en": "Fractions: Basics"
        },
        "levelDesc": {
            "sv": "Visuella Bråk",
            "en": "Visual Fractions"
        },
        "example": "Du har 20 kulor. Hur många kulor motsvarar 1/10?",
        "sampleVariationKey": "visual_inverse",
        "prerequisites": [
            "basic_arithmetic:7"
        ],
        "unlocks": [
            "fractions_basics:2",
            "probability:1"
        ],
        "tier": 7
    },
    "fractions_basics:2": {
        "id": "fractions_basics:2",
        "topicId": "fractions_basics",
        "level": 2,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Grunder",
            "en": "Fractions: Basics"
        },
        "levelDesc": {
            "sv": "Beräkna delen",
            "en": "Parts of a Quantity"
        },
        "example": "Om en 1/10 av ett okänt tal är 49, vad är då hela talet totalt?",
        "sampleVariationKey": "part_inverse",
        "prerequisites": [
            "fractions_basics:1"
        ],
        "unlocks": [
            "fractions_basics:3"
        ],
        "tier": 8
    },
    "fractions_basics:3": {
        "id": "fractions_basics:3",
        "topicId": "fractions_basics",
        "level": 3,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Grunder",
            "en": "Fractions: Basics"
        },
        "levelDesc": {
            "sv": "Blandad & Bråkform",
            "en": "Mixed & Improper"
        },
        "example": "Mellan vilka två hela siffror ligger bråket $\\frac{15}{4}$?",
        "sampleVariationKey": "mixed_bounds",
        "prerequisites": [
            "fractions_basics:2"
        ],
        "unlocks": [
            "fractions_basics:4",
            "fraction_arith:3"
        ],
        "tier": 9
    },
    "fractions_basics:4": {
        "id": "fractions_basics:4",
        "topicId": "fractions_basics",
        "level": 4,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Grunder",
            "en": "Fractions: Basics"
        },
        "levelDesc": {
            "sv": "Förlänga & Förkorta",
            "en": "Simplify & Extend"
        },
        "example": "$$\\frac{2}{9} = \\frac{?}{36}$$",
        "sampleVariationKey": "simplify_missing",
        "prerequisites": [
            "fractions_basics:3"
        ],
        "unlocks": [
            "fractions_basics:5",
            "fraction_arith:1",
            "fraction_arith:2",
            "probability:1"
        ],
        "tier": 10
    },
    "fractions_basics:5": {
        "id": "fractions_basics:5",
        "topicId": "fractions_basics",
        "level": 5,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Grunder",
            "en": "Fractions: Basics"
        },
        "levelDesc": {
            "sv": "Bråk & Decimaltal",
            "en": "Fractions & Decimals"
        },
        "example": "$$\\frac{2}{5} \\quad \\bigcirc \\quad 0,45$$",
        "sampleVariationKey": "decimal_inequality",
        "prerequisites": [
            "fractions_basics:4"
        ],
        "unlocks": [
            "percent:1",
            "probability:2"
        ],
        "tier": 11
    },
    "fraction_arith:1": {
        "id": "fraction_arith:1",
        "topicId": "fraction_arith",
        "level": 1,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Addition & Subtraktion (Lika)",
            "en": "Add & Sub (Same Denom)"
        },
        "example": "$$\\frac{8}{10} + \\frac{x}{10} = \\frac{9}{10}$$",
        "sampleVariationKey": "add_missing",
        "prerequisites": [
            "fractions_basics:4"
        ],
        "unlocks": [
            "graphs:2",
            "fraction_arith:2",
            "fraction_arith:6",
            "similarity:1",
            "scale:4",
            "probability:4"
        ],
        "tier": 11
    },
    "fraction_arith:2": {
        "id": "fraction_arith:2",
        "topicId": "fraction_arith",
        "level": 2,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Addition & Subtraktion (Olika)",
            "en": "Add & Sub (Diff Denom)"
        },
        "example": "Hitta den minsta gemensamma nämnaren (MGN) för 3 och 5.",
        "sampleVariationKey": "lcd_find",
        "prerequisites": [
            "fraction_arith:1",
            "fractions_basics:4"
        ],
        "unlocks": [
            "fraction_arith:3"
        ],
        "tier": 12
    },
    "fraction_arith:3": {
        "id": "fraction_arith:3",
        "topicId": "fraction_arith",
        "level": 3,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Blandad form (+ och -)",
            "en": "Mixed Numbers (+ and -)"
        },
        "example": "$$4\\frac{1}{4} + 1\\frac{1}{4}$$",
        "sampleVariationKey": "mixed_est",
        "prerequisites": [
            "fraction_arith:2",
            "fractions_basics:3"
        ],
        "unlocks": [
            "fraction_arith:4"
        ],
        "tier": 13
    },
    "fraction_arith:4": {
        "id": "fraction_arith:4",
        "topicId": "fraction_arith",
        "level": 4,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Multiplikation",
            "en": "Multiplication"
        },
        "example": "$$\\frac{8}{3} \\cdot \\frac{1}{3}$$",
        "sampleVariationKey": "mult_scaling",
        "prerequisites": [
            "fraction_arith:3"
        ],
        "unlocks": [
            "fraction_arith:5",
            "fraction_arith:7",
            "probability:6",
            "probability:7"
        ],
        "tier": 14
    },
    "fraction_arith:5": {
        "id": "fraction_arith:5",
        "topicId": "fraction_arith",
        "level": 5,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Division",
            "en": "Division"
        },
        "example": "$$\\frac{4}{12} \\div \\frac{1}{10}$$",
        "sampleVariationKey": "div_operator",
        "prerequisites": [
            "fraction_arith:4"
        ],
        "unlocks": [
            "fraction_arith:6"
        ],
        "tier": 15
    },
    "fraction_arith:6": {
        "id": "fraction_arith:6",
        "topicId": "fraction_arith",
        "level": 6,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Negativa Bråk",
            "en": "Negative Fractions"
        },
        "example": "$$\\frac{3}{5} + \\left(-\\frac{2}{3}\\right)$$",
        "sampleVariationKey": "neg_frac_add_sub",
        "prerequisites": [
            "fraction_arith:5",
            "negatives:1",
            "fraction_arith:1"
        ],
        "unlocks": [
            "fraction_arith:7",
            "fraction_arith:8"
        ],
        "tier": 16
    },
    "fraction_arith:7": {
        "id": "fraction_arith:7",
        "topicId": "fraction_arith",
        "level": 7,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Prioriteringsregler (Bråk)",
            "en": "Order of Ops (Fractions)"
        },
        "example": "$$\\frac{1}{2} \\cdot \\frac{3}{4} + \\frac{1}{2}$$",
        "sampleVariationKey": "frac_order_mult",
        "prerequisites": [
            "fraction_arith:6",
            "order_of_operations:1",
            "fraction_arith:4"
        ],
        "unlocks": [
            "fraction_arith:8"
        ],
        "tier": 17
    },
    "fraction_arith:8": {
        "id": "fraction_arith:8",
        "topicId": "fraction_arith",
        "level": 8,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Potenser & Negativa Bråk",
            "en": "Powers & Negative Fractions"
        },
        "example": "$$\\left(-\\frac{1}{3}\\right)^{2} - \\frac{1}{6}$$",
        "sampleVariationKey": "frac_exp_sign",
        "prerequisites": [
            "fraction_arith:7",
            "exponents:1",
            "fraction_arith:6"
        ],
        "unlocks": [],
        "tier": 18
    },
    "percent:1": {
        "id": "percent:1",
        "topicId": "percent",
        "level": 1,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Procent",
            "en": "Percentage"
        },
        "levelDesc": {
            "sv": "Grundläggande & Bildstöd",
            "en": "Basic Concepts & Visuals"
        },
        "example": "Hur många procent av rutnätet är färgat?",
        "sampleVariationKey": "visual_translation",
        "prerequisites": [
            "fractions_basics:5",
            "place_value:2"
        ],
        "unlocks": [
            "percent:2",
            "probability:2",
            "probability:4"
        ],
        "tier": 12
    },
    "percent:2": {
        "id": "percent:2",
        "topicId": "percent",
        "level": 2,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Procent",
            "en": "Percentage"
        },
        "levelDesc": {
            "sv": "Huvudräkning",
            "en": "Mental Math"
        },
        "example": "$$20\\% \\cdot 50$$",
        "sampleVariationKey": "benchmark_calc",
        "prerequisites": [
            "percent:1",
            "basic_arithmetic:7"
        ],
        "unlocks": [
            "percent:3"
        ],
        "tier": 13
    },
    "percent:3": {
        "id": "percent:3",
        "topicId": "percent",
        "level": 3,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Procent",
            "en": "Percentage"
        },
        "levelDesc": {
            "sv": "Beräkna andelen",
            "en": "Find the Rate / Percentage"
        },
        "example": "$$\\frac{90}{150}$$",
        "sampleVariationKey": "find_percent_basic",
        "prerequisites": [
            "percent:2"
        ],
        "unlocks": [
            "percent:4",
            "statistics:6"
        ],
        "tier": 14
    },
    "percent:4": {
        "id": "percent:4",
        "topicId": "percent",
        "level": 4,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Procent",
            "en": "Percentage"
        },
        "levelDesc": {
            "sv": "Beräkna delen & Byggstenar",
            "en": "Calculate Part of a Whole"
        },
        "example": "$$40\\% \\cdot 840$$",
        "sampleVariationKey": "composition",
        "prerequisites": [
            "percent:3"
        ],
        "unlocks": [
            "percent:5"
        ],
        "tier": 15
    },
    "percent:5": {
        "id": "percent:5",
        "topicId": "percent",
        "level": 5,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Procent",
            "en": "Percentage"
        },
        "levelDesc": {
            "sv": "Procentuell förändring",
            "en": "Percentage Change"
        },
        "example": "$$\\frac{25}{25}$$",
        "sampleVariationKey": "change_calc",
        "prerequisites": [
            "percent:4"
        ],
        "unlocks": [
            "percent:6",
            "change_factor:1"
        ],
        "tier": 16
    },
    "percent:6": {
        "id": "percent:6",
        "topicId": "percent",
        "level": 6,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Procent",
            "en": "Percentage"
        },
        "levelDesc": {
            "sv": "Beräkna det hela (100%)",
            "en": "Find the Whole (Reverse %)"
        },
        "example": "$$1\\% = 8$$",
        "sampleVariationKey": "reverse_find_whole",
        "prerequisites": [
            "percent:5"
        ],
        "unlocks": [],
        "tier": 17
    },
    "change_factor:1": {
        "id": "change_factor:1",
        "topicId": "change_factor",
        "level": 1,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Förändringsfaktor",
            "en": "Change Factor"
        },
        "levelDesc": {
            "sv": "Begrepp & Omvandling",
            "en": "Concepts & Conversion"
        },
        "example": "Ett värde ökar med 89%. Vilken förändringsfaktor motsvarar denna ökning?",
        "sampleVariationKey": "pct_to_factor_inc",
        "prerequisites": [
            "percent:5",
            "basic_arithmetic:6"
        ],
        "unlocks": [
            "change_factor:2"
        ],
        "tier": 17
    },
    "change_factor:2": {
        "id": "change_factor:2",
        "topicId": "change_factor",
        "level": 2,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Förändringsfaktor",
            "en": "Change Factor"
        },
        "levelDesc": {
            "sv": "Beräkna det nya värdet",
            "en": "Calculate New Value"
        },
        "example": "Ett värde på 1550 kr ska höjas med 82%. Beräkna det nya värdet med hjälp av förändringsfaktor.",
        "sampleVariationKey": "apply_factor_inc",
        "prerequisites": [
            "change_factor:1"
        ],
        "unlocks": [
            "change_factor:3"
        ],
        "tier": 18
    },
    "change_factor:3": {
        "id": "change_factor:3",
        "topicId": "change_factor",
        "level": 3,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Förändringsfaktor",
            "en": "Change Factor"
        },
        "levelDesc": {
            "sv": "Hitta ursprungsvärdet",
            "en": "Find Original Value"
        },
        "example": "Efter en höjning med 50% är det nya priset 600 kr. Vad var priset från början?",
        "sampleVariationKey": "find_original_inc",
        "prerequisites": [
            "change_factor:2"
        ],
        "unlocks": [
            "change_factor:4"
        ],
        "tier": 19
    },
    "change_factor:4": {
        "id": "change_factor:4",
        "topicId": "change_factor",
        "level": 4,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Förändringsfaktor",
            "en": "Change Factor"
        },
        "levelDesc": {
            "sv": "Sammansatt förändringsfaktor",
            "en": "Compound Change Factor"
        },
        "example": "Ett pris ändras i två steg: först en ökning med 40%, därefter en minskning med 25%. Beräkna den totala förändringsfaktorn.",
        "sampleVariationKey": "sequential_factors",
        "prerequisites": [
            "change_factor:3"
        ],
        "unlocks": [
            "change_factor:5"
        ],
        "tier": 20
    },
    "change_factor:5": {
        "id": "change_factor:5",
        "topicId": "change_factor",
        "level": 5,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Förändringsfaktor",
            "en": "Change Factor"
        },
        "levelDesc": {
            "sv": "Total förändring & Upprepad förändring",
            "en": "Net Change & Repeated Change"
        },
        "example": "Ett pris höjs först med 5% och sänks därefter med 40%. Med hur många procent har priset förändrats totalt?",
        "sampleVariationKey": "sequential_total_pct",
        "prerequisites": [
            "change_factor:4",
            "exponents:1"
        ],
        "unlocks": [],
        "tier": 21
    },
    "exponents:1": {
        "id": "exponents:1",
        "topicId": "exponents",
        "level": 1,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Grunder & x^0",
            "en": "Foundations & x^0"
        },
        "example": "$$161^{0}$$",
        "sampleVariationKey": "zero_rule",
        "prerequisites": [
            "basic_arithmetic:4"
        ],
        "unlocks": [
            "order_of_operations:4",
            "fraction_arith:8",
            "change_factor:5",
            "exponents:2",
            "geometry:5",
            "pythagoras:1",
            "scale:7",
            "scale:8"
        ],
        "tier": 4
    },
    "exponents:2": {
        "id": "exponents:2",
        "topicId": "exponents",
        "level": 2,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Tiopotenser",
            "en": "Powers of 10"
        },
        "example": "$$10^{4}$$",
        "sampleVariationKey": "ten_positive_exponent",
        "prerequisites": [
            "exponents:1",
            "ten_powers:1"
        ],
        "unlocks": [
            "exponents:3"
        ],
        "tier": 7
    },
    "exponents:3": {
        "id": "exponents:3",
        "topicId": "exponents",
        "level": 3,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Grundpotensform",
            "en": "Scientific Notation"
        },
        "example": "Skriv talet 2 000 i grundpotensform.",
        "sampleVariationKey": "scientific_to_form",
        "prerequisites": [
            "exponents:2",
            "ten_powers:3"
        ],
        "unlocks": [
            "exponents:4"
        ],
        "tier": 9
    },
    "exponents:4": {
        "id": "exponents:4",
        "topicId": "exponents",
        "level": 4,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Kvadratrötter",
            "en": "Square Roots"
        },
        "example": "$$\\sqrt{36}$$",
        "sampleVariationKey": "root_calc",
        "prerequisites": [
            "exponents:3"
        ],
        "unlocks": [
            "exponents:5",
            "pythagoras:2"
        ],
        "tier": 10
    },
    "exponents:5": {
        "id": "exponents:5",
        "topicId": "exponents",
        "level": 5,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Potenslagar (Enkel)",
            "en": "Exponent Laws (Basic)"
        },
        "example": "$$x^{9} \\cdot x^{10}$$",
        "sampleVariationKey": "law_multiplication",
        "prerequisites": [
            "exponents:4"
        ],
        "unlocks": [
            "exponents:6"
        ],
        "tier": 11
    },
    "exponents:6": {
        "id": "exponents:6",
        "topicId": "exponents",
        "level": 6,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Potenslagar (Avancerad)",
            "en": "Exponent Laws (Adv)"
        },
        "example": "$$(x^{3})^{3}$$",
        "sampleVariationKey": "law_power_of_power",
        "prerequisites": [
            "exponents:5"
        ],
        "unlocks": [
            "exponents:7"
        ],
        "tier": 12
    },
    "exponents:7": {
        "id": "exponents:7",
        "topicId": "exponents",
        "level": 7,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Räkna med grundpotens",
            "en": "Calculate with Scientific Notation"
        },
        "example": "$$2 \\cdot 10^{8} \\cdot 7 \\cdot 10^{-4}$$",
        "sampleVariationKey": "scientific_mult",
        "prerequisites": [
            "exponents:6"
        ],
        "unlocks": [],
        "tier": 13
    },
    "ten_powers:1": {
        "id": "ten_powers:1",
        "topicId": "ten_powers",
        "level": 1,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "10, 100, 1000",
            "en": "10, 100, 1000"
        },
        "levelDesc": {
            "sv": "Mult/Div med 10, 100, 1000",
            "en": "Mult/Div by 10, 100, 1000"
        },
        "example": "$$0,17 \\cdot 10000$$",
        "sampleVariationKey": "big_mult_std",
        "prerequisites": [
            "place_value:2",
            "basic_arithmetic:6"
        ],
        "unlocks": [
            "exponents:2",
            "ten_powers:2",
            "unit_conversion:1"
        ],
        "tier": 6
    },
    "ten_powers:2": {
        "id": "ten_powers:2",
        "topicId": "ten_powers",
        "level": 2,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "10, 100, 1000",
            "en": "10, 100, 1000"
        },
        "levelDesc": {
            "sv": "Begreppsförståelse",
            "en": "Conceptual Understanding"
        },
        "example": "Att multiplicera med 0,01 ger exakt samma svar som att dividera med...",
        "sampleVariationKey": "reciprocal_equivalence",
        "prerequisites": [
            "ten_powers:1"
        ],
        "unlocks": [
            "ten_powers:3"
        ],
        "tier": 7
    },
    "ten_powers:3": {
        "id": "ten_powers:3",
        "topicId": "ten_powers",
        "level": 3,
        "category": "arithmetic",
        "color": "pink",
        "topicLabel": {
            "sv": "10, 100, 1000",
            "en": "10, 100, 1000"
        },
        "levelDesc": {
            "sv": "Blandade Faktorer (0.1, 100...)",
            "en": "Mixed Factors"
        },
        "example": "$$0,38 \\cdot 0,1$$",
        "sampleVariationKey": "decimal_mult_std",
        "prerequisites": [
            "ten_powers:2"
        ],
        "unlocks": [
            "exponents:3"
        ],
        "tier": 8
    },
    "unit_conversion:1": {
        "id": "unit_conversion:1",
        "topicId": "unit_conversion",
        "level": 1,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Enhetsomvandling",
            "en": "Unit Conversions"
        },
        "levelDesc": {
            "sv": "Längd",
            "en": "Length"
        },
        "example": "$$79,8 \\text{ mm} = \\text{\\_\\_\\_} \\text{ m}$$",
        "sampleVariationKey": "len_basic",
        "prerequisites": [
            "ten_powers:1"
        ],
        "unlocks": [
            "unit_conversion:2",
            "scale:1",
            "scale:2"
        ],
        "tier": 7
    },
    "unit_conversion:2": {
        "id": "unit_conversion:2",
        "topicId": "unit_conversion",
        "level": 2,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Enhetsomvandling",
            "en": "Unit Conversions"
        },
        "levelDesc": {
            "sv": "Vikt",
            "en": "Weight"
        },
        "example": "$$176 \\text{ hg} = \\text{\\_\\_\\_} \\text{ g}$$",
        "sampleVariationKey": "weight_basic",
        "prerequisites": [
            "unit_conversion:1"
        ],
        "unlocks": [
            "unit_conversion:3"
        ],
        "tier": 8
    },
    "unit_conversion:3": {
        "id": "unit_conversion:3",
        "topicId": "unit_conversion",
        "level": 3,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Enhetsomvandling",
            "en": "Unit Conversions"
        },
        "levelDesc": {
            "sv": "Volym (L)",
            "en": "Volume (L)"
        },
        "example": "$$15,5 \\text{ cl} = \\text{\\_\\_\\_} \\text{ l}$$",
        "sampleVariationKey": "vol_basic",
        "prerequisites": [
            "unit_conversion:2"
        ],
        "unlocks": [
            "unit_conversion:4",
            "volume:7"
        ],
        "tier": 9
    },
    "unit_conversion:4": {
        "id": "unit_conversion:4",
        "topicId": "unit_conversion",
        "level": 4,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Enhetsomvandling",
            "en": "Unit Conversions"
        },
        "levelDesc": {
            "sv": "Blandad (1-3)",
            "en": "Mixed (1-3)"
        },
        "example": "$$15,5 \\text{ cl} = \\text{\\_\\_\\_} \\text{ l}$$",
        "sampleVariationKey": "vol_basic",
        "prerequisites": [
            "unit_conversion:3"
        ],
        "unlocks": [],
        "tier": 10
    },
    "geometry:1": {
        "id": "geometry:1",
        "topicId": "geometry",
        "level": 1,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Area & Omkrets",
            "en": "Area & Perimeter"
        },
        "levelDesc": {
            "sv": "Omkrets (Rektangel)",
            "en": "Perimeter (Rectangle)"
        },
        "example": "Beräkna kvadratens omkrets.",
        "sampleVariationKey": "perimeter_square",
        "prerequisites": [
            "basic_arithmetic:1"
        ],
        "unlocks": [
            "algebraic_geometry:1",
            "geometry:2"
        ],
        "tier": 1
    },
    "geometry:2": {
        "id": "geometry:2",
        "topicId": "geometry",
        "level": 2,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Area & Omkrets",
            "en": "Area & Perimeter"
        },
        "levelDesc": {
            "sv": "Area (Rektangel)",
            "en": "Area (Rectangle)"
        },
        "example": "Beräkna figurens area.",
        "sampleVariationKey": "area_square",
        "prerequisites": [
            "geometry:1",
            "basic_arithmetic:4"
        ],
        "unlocks": [
            "algebraic_geometry:3",
            "geometry:3",
            "similarity:1",
            "scale:7",
            "volume:1",
            "volume:8"
        ],
        "tier": 4
    },
    "geometry:3": {
        "id": "geometry:3",
        "topicId": "geometry",
        "level": 3,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Area & Omkrets",
            "en": "Area & Perimeter"
        },
        "levelDesc": {
            "sv": "Area (Triangel)",
            "en": "Area (Triangle)"
        },
        "example": "Beräkna triangelns area.",
        "sampleVariationKey": "area_triangle",
        "prerequisites": [
            "geometry:2",
            "basic_arithmetic:7"
        ],
        "unlocks": [
            "geometry:4",
            "pythagoras:1",
            "volume:2"
        ],
        "tier": 7
    },
    "geometry:4": {
        "id": "geometry:4",
        "topicId": "geometry",
        "level": 4,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Area & Omkrets",
            "en": "Area & Perimeter"
        },
        "levelDesc": {
            "sv": "Sammansatta (Rekt+Tri)",
            "en": "Composite Shapes (Rect+Tri)"
        },
        "example": "Figuren består av en rektangel och en triangel. Vad är totalarean?",
        "sampleVariationKey": "combined_rect_tri",
        "prerequisites": [
            "geometry:3"
        ],
        "unlocks": [
            "geometry:5"
        ],
        "tier": 8
    },
    "geometry:5": {
        "id": "geometry:5",
        "topicId": "geometry",
        "level": 5,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Area & Omkrets",
            "en": "Area & Perimeter"
        },
        "levelDesc": {
            "sv": "Cirkelns Area & Omkrets",
            "en": "Circle Area & Perimeter"
        },
        "example": "Beräkna cirkelns area (använd pi = 3,14). Avrunda svaret till två decimaler.",
        "sampleVariationKey": "circle_area",
        "prerequisites": [
            "geometry:4",
            "basic_arithmetic:6",
            "exponents:1"
        ],
        "unlocks": [
            "geometry:6",
            "volume:3",
            "volume:8"
        ],
        "tier": 9
    },
    "geometry:6": {
        "id": "geometry:6",
        "topicId": "geometry",
        "level": 6,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Area & Omkrets",
            "en": "Area & Perimeter"
        },
        "levelDesc": {
            "sv": "Sammansatta (Alla)",
            "en": "Composite Shapes (All)"
        },
        "example": "Beräkna husets omkrets.",
        "sampleVariationKey": "perimeter_house",
        "prerequisites": [
            "geometry:5"
        ],
        "unlocks": [],
        "tier": 10
    },
    "angles:1": {
        "id": "angles:1",
        "topicId": "angles",
        "level": 1,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Vinklar",
            "en": "Angles"
        },
        "levelDesc": {
            "sv": "Vinkeltyper",
            "en": "Types of Angles"
        },
        "example": "Vad kallas denna typ av vinkel?",
        "sampleVariationKey": "classification_visual",
        "prerequisites": [],
        "unlocks": [
            "angles:2"
        ],
        "tier": 0
    },
    "angles:2": {
        "id": "angles:2",
        "topicId": "angles",
        "level": 2,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Vinklar",
            "en": "Angles"
        },
        "levelDesc": {
            "sv": "Komplement & Supplement",
            "en": "Complementary & Supplementary"
        },
        "example": "Beräkna x.",
        "sampleVariationKey": "comp_supp_visual",
        "prerequisites": [
            "angles:1"
        ],
        "unlocks": [
            "algebraic_geometry:5",
            "algebraic_geometry:6",
            "angles:3"
        ],
        "tier": 1
    },
    "angles:3": {
        "id": "angles:3",
        "topicId": "angles",
        "level": 3,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Vinklar",
            "en": "Angles"
        },
        "levelDesc": {
            "sv": "Vertikal- & Sidovinklar",
            "en": "Vertical & Adjacent Angles"
        },
        "example": "Bestäm x.",
        "sampleVariationKey": "vertical_side_visual",
        "prerequisites": [
            "angles:2"
        ],
        "unlocks": [
            "angles:4"
        ],
        "tier": 2
    },
    "angles:4": {
        "id": "angles:4",
        "topicId": "angles",
        "level": 4,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Vinklar",
            "en": "Angles"
        },
        "levelDesc": {
            "sv": "Vinkelsumma (Triangel)",
            "en": "Triangle Angle Sum"
        },
        "example": "Beräkna x i triangeln.",
        "sampleVariationKey": "triangle_sum_visual",
        "prerequisites": [
            "angles:3"
        ],
        "unlocks": [
            "angles:5"
        ],
        "tier": 3
    },
    "angles:5": {
        "id": "angles:5",
        "topicId": "angles",
        "level": 5,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Vinklar",
            "en": "Angles"
        },
        "levelDesc": {
            "sv": "Vinkelsumma (Polygoner)",
            "en": "Polygon Angle Sum"
        },
        "example": "Beräkna x i fyrhörningen.",
        "sampleVariationKey": "polygon_sum",
        "prerequisites": [
            "angles:4"
        ],
        "unlocks": [
            "angles:6"
        ],
        "tier": 4
    },
    "angles:6": {
        "id": "angles:6",
        "topicId": "angles",
        "level": 6,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Vinklar",
            "en": "Angles"
        },
        "levelDesc": {
            "sv": "Likbelägna & Alternatvinklar",
            "en": "Parallel Lines"
        },
        "example": "Bestäm vinkeln x utifrån teorin om parallella linjer.",
        "sampleVariationKey": "parallel_visual",
        "prerequisites": [
            "angles:5"
        ],
        "unlocks": [],
        "tier": 5
    },
    "pythagoras:1": {
        "id": "pythagoras:1",
        "topicId": "pythagoras",
        "level": 1,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Pythagoras Sats",
            "en": "Pythagoras"
        },
        "levelDesc": {
            "sv": "Begrepp & Uppställning",
            "en": "Concept & Setup"
        },
        "example": "Vilken sida är hypotenusan i triangeln?",
        "sampleVariationKey": "pyth_identify_hypotenuse",
        "prerequisites": [
            "exponents:1",
            "geometry:3"
        ],
        "unlocks": [
            "pythagoras:2"
        ],
        "tier": 8
    },
    "pythagoras:2": {
        "id": "pythagoras:2",
        "topicId": "pythagoras",
        "level": 2,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Pythagoras Sats",
            "en": "Pythagoras"
        },
        "levelDesc": {
            "sv": "Beräkna Hypotenusan",
            "en": "Find Hypotenuse"
        },
        "example": "Beräkna hypotenusans längd c.",
        "sampleVariationKey": "pyth_hyp_calc",
        "prerequisites": [
            "pythagoras:1",
            "exponents:4"
        ],
        "unlocks": [
            "pythagoras:3",
            "pythagoras:5"
        ],
        "tier": 11
    },
    "pythagoras:3": {
        "id": "pythagoras:3",
        "topicId": "pythagoras",
        "level": 3,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Pythagoras Sats",
            "en": "Pythagoras"
        },
        "levelDesc": {
            "sv": "Beräkna Kateten",
            "en": "Find Leg"
        },
        "example": "Hypotenusan är 13 och den ena kateten är 12. Beräkna kateten a.",
        "sampleVariationKey": "pyth_leg_calc",
        "prerequisites": [
            "pythagoras:2",
            "equations:1"
        ],
        "unlocks": [
            "pythagoras:4"
        ],
        "tier": 12
    },
    "pythagoras:4": {
        "id": "pythagoras:4",
        "topicId": "pythagoras",
        "level": 4,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Pythagoras Sats",
            "en": "Pythagoras"
        },
        "levelDesc": {
            "sv": "Är den rätvinklig? (Omvänd sats)",
            "en": "Is it Right-Angled? (Converse)"
        },
        "example": "En triangel har sidorna 12 cm, 16 cm och 19 cm. Är den rätvinklig?",
        "sampleVariationKey": "pyth_converse_check",
        "prerequisites": [
            "pythagoras:3"
        ],
        "unlocks": [
            "pythagoras:5"
        ],
        "tier": 13
    },
    "pythagoras:5": {
        "id": "pythagoras:5",
        "topicId": "pythagoras",
        "level": 5,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Pythagoras Sats",
            "en": "Pythagoras"
        },
        "levelDesc": {
            "sv": "Avstånd i Koordinatsystem",
            "en": "Distance in Coordinates"
        },
        "example": "Bestäm avståndet d mellan punkterna A(0, 2) och B(6, 10).",
        "sampleVariationKey": "pyth_coord_dist_int",
        "prerequisites": [
            "pythagoras:4",
            "negatives:2",
            "graphs:1",
            "pythagoras:2"
        ],
        "unlocks": [
            "pythagoras:6"
        ],
        "tier": 14
    },
    "pythagoras:6": {
        "id": "pythagoras:6",
        "topicId": "pythagoras",
        "level": 6,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Pythagoras Sats",
            "en": "Pythagoras"
        },
        "levelDesc": {
            "sv": "Sammansatt & Rymddiagonal",
            "en": "Composite & 3D Diagonals"
        },
        "example": "En likbent triangel har basen 10 cm och två sidor på 13 cm vardera. Beräkna triangelns area.",
        "sampleVariationKey": "pyth_isosceles_height",
        "prerequisites": [
            "pythagoras:5"
        ],
        "unlocks": [],
        "tier": 15
    },
    "similarity:1": {
        "id": "similarity:1",
        "topicId": "similarity",
        "level": 1,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Likformighet",
            "en": "Similar Shapes"
        },
        "levelDesc": {
            "sv": "Är de likformiga?",
            "en": "Are they similar?"
        },
        "example": "Avgör om de två rektanglarna nedan är likformiga (perfekta kopior).",
        "sampleVariationKey": "sim_rect_check",
        "prerequisites": [
            "fraction_arith:1",
            "geometry:2"
        ],
        "unlocks": [
            "similarity:2"
        ],
        "tier": 12
    },
    "similarity:2": {
        "id": "similarity:2",
        "topicId": "similarity",
        "level": 2,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Likformighet",
            "en": "Similar Shapes"
        },
        "levelDesc": {
            "sv": "Beräkna sida (Enkel)",
            "en": "Calc Side (Simple)"
        },
        "example": "Beräkna den saknade sidan x i de likformiga figurerna.",
        "sampleVariationKey": "sim_calc_big",
        "prerequisites": [
            "similarity:1",
            "equations:1"
        ],
        "unlocks": [
            "similarity:3",
            "scale:5"
        ],
        "tier": 13
    },
    "similarity:3": {
        "id": "similarity:3",
        "topicId": "similarity",
        "level": 3,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Likformighet",
            "en": "Similar Shapes"
        },
        "levelDesc": {
            "sv": "Topptriangelsatsen",
            "en": "Top Triangle Theorem"
        },
        "example": "Beräkna längden på basen x med hjälp av likformighet.",
        "sampleVariationKey": "transversal_total",
        "prerequisites": [
            "similarity:2"
        ],
        "unlocks": [
            "similarity:4",
            "scale:6"
        ],
        "tier": 14
    },
    "similarity:4": {
        "id": "similarity:4",
        "topicId": "similarity",
        "level": 4,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Likformighet",
            "en": "Similar Shapes"
        },
        "levelDesc": {
            "sv": "Blandad (1-3)",
            "en": "Mixed (1-3)"
        },
        "example": "Beräkna längden på basen x med hjälp av likformighet.",
        "sampleVariationKey": "transversal_total",
        "prerequisites": [
            "similarity:3"
        ],
        "unlocks": [],
        "tier": 15
    },
    "scale:1": {
        "id": "scale:1",
        "topicId": "scale",
        "level": 1,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Begrepp & Skalriktning",
            "en": "Concepts & Direction"
        },
        "example": "Anger skalan 2:1 en förstoring eller en förminskning?",
        "sampleVariationKey": "scale_direction_type",
        "prerequisites": [
            "unit_conversion:1",
            "basic_arithmetic:4"
        ],
        "unlocks": [
            "scale:2"
        ],
        "tier": 8
    },
    "scale:2": {
        "id": "scale:2",
        "topicId": "scale",
        "level": 2,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Förminskning (Verklig längd)",
            "en": "Reduction (Real Length)"
        },
        "example": "En ritning har skalan 1:50. En sträcka på ritningen är 2 cm. Hur lång är sträckan i verkligheten? Svara i centimeter.",
        "sampleVariationKey": "reduction_calc_direct",
        "prerequisites": [
            "scale:1",
            "unit_conversion:1"
        ],
        "unlocks": [
            "scale:3",
            "scale:4"
        ],
        "tier": 9
    },
    "scale:3": {
        "id": "scale:3",
        "topicId": "scale",
        "level": 3,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Förstoring (Bildens mått)",
            "en": "Enlargement (Image Size)"
        },
        "example": "Ett litet föremål är 7 mm i verkligheten. Hur långt blir föremålet på en bild i skala 6:1? Svara i millimeter.",
        "sampleVariationKey": "enlargement_calc_direct",
        "prerequisites": [
            "scale:2"
        ],
        "unlocks": [
            "scale:4"
        ],
        "tier": 10
    },
    "scale:4": {
        "id": "scale:4",
        "topicId": "scale",
        "level": 4,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Bestäm Skalan",
            "en": "Determine Scale"
        },
        "example": "En sträcka är 20 m i verkligheten och 4 cm på en ritning. Vilken skala är ritningen ritad i? (Svara som 1:...)",
        "sampleVariationKey": "determine_scale_blueprint",
        "prerequisites": [
            "scale:3",
            "fraction_arith:1",
            "scale:2"
        ],
        "unlocks": [
            "scale:5"
        ],
        "tier": 12
    },
    "scale:5": {
        "id": "scale:5",
        "topicId": "scale",
        "level": 5,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Likformiga Trianglar",
            "en": "Similar Triangles"
        },
        "example": "De två rätvinkliga trianglarna nedan är likformiga. Beräkna längden på sidan som är markerad med x.",
        "sampleVariationKey": "similarity_tri_side",
        "prerequisites": [
            "scale:4",
            "similarity:2"
        ],
        "unlocks": [
            "scale:6",
            "scale:7"
        ],
        "tier": 14
    },
    "scale:6": {
        "id": "scale:6",
        "topicId": "scale",
        "level": 6,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Topptriangelsatsen",
            "en": "Triangle Proportionality"
        },
        "example": "Den horisontella transversalen är parallell med basen. Enligt topptriangelsatsen är den lilla topptriangeln likformig med hela triangeln. Beräkna x.",
        "sampleVariationKey": "nested_topptriangel_base",
        "prerequisites": [
            "scale:5",
            "similarity:3"
        ],
        "unlocks": [
            "scale:7"
        ],
        "tier": 15
    },
    "scale:7": {
        "id": "scale:7",
        "topicId": "scale",
        "level": 7,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Areaskala & Omvänd Areaskala",
            "en": "Area Scale & Inverse"
        },
        "example": "Två likformiga rektanglar har längdskalan 1:10. Den mindre rektangeln har arean 20 cm². Beräkna arean av den större rektangeln.",
        "sampleVariationKey": "area_scale_direct",
        "prerequisites": [
            "scale:6",
            "exponents:1",
            "geometry:2",
            "scale:5"
        ],
        "unlocks": [
            "scale:8"
        ],
        "tier": 16
    },
    "scale:8": {
        "id": "scale:8",
        "topicId": "scale",
        "level": 8,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Volymskala & Omvänd Volymskala",
            "en": "Volume Scale & Inverse"
        },
        "example": "Två likformiga cylindrar har längdskalan 1:2. Den mindre rymmer 15 liter. Hur många liter rymmer den större cylindern?",
        "sampleVariationKey": "volume_scale_direct",
        "prerequisites": [
            "scale:7",
            "exponents:1",
            "volume:1"
        ],
        "unlocks": [],
        "tier": 17
    },
    "volume:1": {
        "id": "volume:1",
        "topicId": "volume",
        "level": 1,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Rätblock & Kub",
            "en": "Cuboid & Cube"
        },
        "example": "Beräkna rätblockets volym.",
        "sampleVariationKey": "vol_cuboid_std",
        "prerequisites": [
            "geometry:2",
            "basic_arithmetic:5"
        ],
        "unlocks": [
            "scale:8",
            "volume:2",
            "volume:3",
            "volume:7"
        ],
        "tier": 5
    },
    "volume:2": {
        "id": "volume:2",
        "topicId": "volume",
        "level": 2,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Prisma",
            "en": "Prism"
        },
        "example": "Beräkna volymen for det triangulära prismat.",
        "sampleVariationKey": "vol_tri_prism_std",
        "prerequisites": [
            "volume:1",
            "geometry:3"
        ],
        "unlocks": [
            "volume:3"
        ],
        "tier": 8
    },
    "volume:3": {
        "id": "volume:3",
        "topicId": "volume",
        "level": 3,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Cylinder",
            "en": "Cylinder"
        },
        "example": "Beräkna cylinderns volym ($\\pi \\approx 3,14$).",
        "sampleVariationKey": "vol_cyl_std",
        "prerequisites": [
            "volume:2",
            "geometry:5",
            "volume:1"
        ],
        "unlocks": [
            "volume:4",
            "volume:8"
        ],
        "tier": 10
    },
    "volume:4": {
        "id": "volume:4",
        "topicId": "volume",
        "level": 4,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Pyramid & Kon",
            "en": "Pyramid & Cone"
        },
        "example": "Pyramiden har en kvadratisk basyta. Beräkna pyramidens volym.",
        "sampleVariationKey": "vol_pyramid_std",
        "prerequisites": [
            "volume:3"
        ],
        "unlocks": [
            "volume:5"
        ],
        "tier": 11
    },
    "volume:5": {
        "id": "volume:5",
        "topicId": "volume",
        "level": 5,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Klot & Sammansatta",
            "en": "Sphere & Composite"
        },
        "example": "Beräkna klotets volym med radien 7 cm.",
        "sampleVariationKey": "vol_sphere_std",
        "prerequisites": [
            "volume:4"
        ],
        "unlocks": [
            "volume:6"
        ],
        "tier": 12
    },
    "volume:6": {
        "id": "volume:6",
        "topicId": "volume",
        "level": 6,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Blandade Volymer",
            "en": "Mixed Volumes"
        },
        "example": "Pyramiden har en kvadratisk basyta. Beräkna pyramidens volym.",
        "sampleVariationKey": "vol_sphere_diameter",
        "prerequisites": [
            "volume:5"
        ],
        "unlocks": [
            "volume:7"
        ],
        "tier": 13
    },
    "volume:7": {
        "id": "volume:7",
        "topicId": "volume",
        "level": 7,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Enhetsomvandling",
            "en": "Unit Conversion"
        },
        "example": "En pool har formen av ett rätblock med bredden 10 cm, höjden 5 cm och djupet 4 cm. Vad är dess volym i liter?",
        "sampleVariationKey": "vol_units_liter",
        "prerequisites": [
            "volume:6",
            "unit_conversion:3",
            "volume:1"
        ],
        "unlocks": [
            "volume:8"
        ],
        "tier": 14
    },
    "volume:8": {
        "id": "volume:8",
        "topicId": "volume",
        "level": 8,
        "category": "geometry",
        "color": "emerald",
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Begränsningsyta",
            "en": "Surface Area"
        },
        "example": "Beräkna rätblockets ytarea (arean av alla sex sidor sammanlagt).",
        "sampleVariationKey": "sa_cuboid",
        "prerequisites": [
            "volume:7",
            "geometry:2",
            "geometry:5",
            "volume:3"
        ],
        "unlocks": [],
        "tier": 15
    },
    "statistics:1": {
        "id": "statistics:1",
        "topicId": "statistics",
        "level": 1,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Statistik",
            "en": "Statistics"
        },
        "levelDesc": {
            "sv": "Typvärde & Variationsbredd",
            "en": "Mode & Range"
        },
        "example": "Kolla igenom åldrar listan: 12, 14, 11, 13, 11, 11, 12. Vilket är typvärdet?",
        "sampleVariationKey": "find_mode",
        "prerequisites": [],
        "unlocks": [
            "statistics:2"
        ],
        "tier": 0
    },
    "statistics:2": {
        "id": "statistics:2",
        "topicId": "statistics",
        "level": 2,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Statistik",
            "en": "Statistics"
        },
        "levelDesc": {
            "sv": "Medelvärde",
            "en": "Mean"
        },
        "example": "Beräkna medelvärdet för följande poäng: 24, 23, 10, 12, 24.",
        "sampleVariationKey": "calc_mean",
        "prerequisites": [
            "statistics:1",
            "basic_arithmetic:1",
            "basic_arithmetic:7"
        ],
        "unlocks": [
            "statistics:3",
            "statistics:4",
            "statistics:6"
        ],
        "tier": 7
    },
    "statistics:3": {
        "id": "statistics:3",
        "topicId": "statistics",
        "level": 3,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Statistik",
            "en": "Statistics"
        },
        "levelDesc": {
            "sv": "Median",
            "en": "Median"
        },
        "example": "Bestäm medianen för följande temperaturer: 22, 17, 22, 15, 13.",
        "sampleVariationKey": "median_odd",
        "prerequisites": [
            "statistics:2"
        ],
        "unlocks": [
            "statistics:4"
        ],
        "tier": 8
    },
    "statistics:4": {
        "id": "statistics:4",
        "topicId": "statistics",
        "level": 4,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Statistik",
            "en": "Statistics"
        },
        "levelDesc": {
            "sv": "Baklänges medelvärde",
            "en": "Reverse Mean"
        },
        "example": "Medelvärdet av fyra tal är 13. Tre av talen är 8, 17 och 13. Vilket är det fjärde talet?",
        "sampleVariationKey": "reverse_mean_calc",
        "prerequisites": [
            "statistics:3",
            "equations:1",
            "statistics:2"
        ],
        "unlocks": [
            "statistics:5"
        ],
        "tier": 9
    },
    "statistics:5": {
        "id": "statistics:5",
        "topicId": "statistics",
        "level": 5,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Statistik",
            "en": "Statistics"
        },
        "levelDesc": {
            "sv": "Tabell och Diagram",
            "en": "Tables and Graphs"
        },
        "example": "Hur många observationer (totalt antal) visas i frekvenstabellen?",
        "sampleVariationKey": "freq_count",
        "prerequisites": [
            "statistics:4"
        ],
        "unlocks": [
            "statistics:6"
        ],
        "tier": 10
    },
    "statistics:6": {
        "id": "statistics:6",
        "topicId": "statistics",
        "level": 6,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Statistik",
            "en": "Statistics"
        },
        "levelDesc": {
            "sv": "Blandade begrepp",
            "en": "Mixed Concepts"
        },
        "example": "Du köper 2 kg äpplen för 20 kr/kg och 3 kg till av en annan sort. Medelpriset blir 26 kr/kg. Vad kostade den andra sorten per kg?",
        "sampleVariationKey": "real_outlier_shift",
        "prerequisites": [
            "statistics:5",
            "percent:3",
            "statistics:2"
        ],
        "unlocks": [],
        "tier": 15
    },
    "probability:1": {
        "id": "probability:1",
        "topicId": "probability",
        "level": 1,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "Sannolikhetsskalan & Visuella utfall",
            "en": "Probability Scale & Visual Outcomes"
        },
        "example": "Hur sannolikt är det: \"att få krona när du kastar ett vanligt mynt\"?",
        "sampleVariationKey": "prob_scale_vocab",
        "prerequisites": [
            "fractions_basics:1",
            "fractions_basics:4"
        ],
        "unlocks": [
            "probability:2"
        ],
        "tier": 11
    },
    "probability:2": {
        "id": "probability:2",
        "topicId": "probability",
        "level": 2,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "De tre uttrycksformerna (Bråk, Decimal, %)",
            "en": "The Three Forms (Fraction, Decimal, %)"
        },
        "example": "Sannolikheten för en vinst i ett lotteri är 2/5. Vad är sannolikheten uttryckt i procent?",
        "sampleVariationKey": "prob_rep_to_percent",
        "prerequisites": [
            "probability:1",
            "fractions_basics:5",
            "percent:1"
        ],
        "unlocks": [
            "probability:3"
        ],
        "tier": 13
    },
    "probability:3": {
        "id": "probability:3",
        "topicId": "probability",
        "level": 3,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "Likformiga utfall (Tärning & Kortlek)",
            "en": "Uniform Outcomes (Dice & Card Deck)"
        },
        "example": "Vad är sannolikheten att få en 4:a vid ett kast med en vanlig sexsidig tärning? Svar med bråk i enklaste form.",
        "sampleVariationKey": "prob_dice_single",
        "prerequisites": [
            "probability:2"
        ],
        "unlocks": [
            "probability:4"
        ],
        "tier": 14
    },
    "probability:4": {
        "id": "probability:4",
        "topicId": "probability",
        "level": 4,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "Komplementhändelse (INTE och ELLER)",
            "en": "Complementary Events (NOT and OR)"
        },
        "example": "Chansen att vinna i ett lotteri är 45%. Vad är sannolikheten att man INTE vinner?",
        "sampleVariationKey": "prob_comp_lottery",
        "prerequisites": [
            "probability:3",
            "percent:1",
            "fraction_arith:1"
        ],
        "unlocks": [
            "probability:5"
        ],
        "tier": 15
    },
    "probability:5": {
        "id": "probability:5",
        "topicId": "probability",
        "level": 5,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "Kombinatorik & Multiplikationsprincipen",
            "en": "Combinatorics & Multiplication Principle"
        },
        "example": "En restaurangmeny erbjuder 5 förrätter, 5 varmrätter och 4 efterrätter. På hur många olika sätt kan du komponera en trerättersmiddag?",
        "sampleVariationKey": "prob_comb_multiplication",
        "prerequisites": [
            "probability:4",
            "basic_arithmetic:4"
        ],
        "unlocks": [
            "probability:6"
        ],
        "tier": 16
    },
    "probability:6": {
        "id": "probability:6",
        "topicId": "probability",
        "level": 6,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "Flerstegsförsök – Med återläggning",
            "en": "Multi-Stage – With Replacement"
        },
        "example": "Du kastar ett mynt 3 gånger. Vad är sannolikheten att få krona alla 3 gånger? Svar med bråk i enklaste form.",
        "sampleVariationKey": "prob_indep_coins",
        "prerequisites": [
            "probability:5",
            "fraction_arith:4"
        ],
        "unlocks": [
            "probability:7"
        ],
        "tier": 17
    },
    "probability:7": {
        "id": "probability:7",
        "topicId": "probability",
        "level": 7,
        "category": "statistics",
        "color": "cyan",
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "Flerstegsförsök – Utan återläggning & Träd",
            "en": "Multi-Stage – Without Replacement & Trees"
        },
        "example": "I en påse finns 4 röda och 6 blåa kulor. Du drar två kulor utan återläggning. Vad är sannolikheten att få en röd först och sedan en blå? Svar med bråk i enklaste form.",
        "sampleVariationKey": "prob_dep_tree_branch",
        "prerequisites": [
            "probability:6",
            "fraction_arith:4"
        ],
        "unlocks": [],
        "tier": 18
    }
};

export const CONCEPT_SEARCH_INDEX = [
    {
        "id": "equations:1",
        "topicId": "equations",
        "level": 1,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Enkla steg (x+a=b)",
            "en": "One Step"
        },
        "example": "$$x - 18 = -7$$",
        "keywords": "equations ekvationer equations enkla steg (x+a=b) one step nivå 1 level 1"
    },
    {
        "id": "equations:2",
        "topicId": "equations",
        "level": 2,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Två steg (ax+b=c)",
            "en": "Two Steps"
        },
        "example": "$$2x + 5 = 29$$",
        "keywords": "equations ekvationer equations två steg (ax+b=c) two steps nivå 2 level 2"
    },
    {
        "id": "equations:3",
        "topicId": "equations",
        "level": 3,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Med Parenteser",
            "en": "With Parentheses"
        },
        "example": "$$4(x + 6) = 44$$",
        "keywords": "equations ekvationer equations med parenteser with parentheses nivå 3 level 3"
    },
    {
        "id": "equations:4",
        "topicId": "equations",
        "level": 4,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Variabel på båda sidor",
            "en": "Variables on both sides"
        },
        "example": "$$9x + 4 = 2x + 46$$",
        "keywords": "equations ekvationer equations variabel på båda sidor variables on both sides nivå 4 level 4"
    },
    {
        "id": "equations:5",
        "topicId": "equations",
        "level": 5,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Skriv Ekvation (Problem)",
            "en": "Write Equation (Word Problems)"
        },
        "example": "$$9x + 4 = 2x + 46$$",
        "keywords": "equations ekvationer equations skriv ekvation (problem) write equation (word problems) nivå 5 level 5"
    },
    {
        "id": "equations:6",
        "topicId": "equations",
        "level": 6,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Lös Problem (Ekvation)",
            "en": "Solve Word Problems"
        },
        "example": "$$9x + 4 = 2x + 46$$",
        "keywords": "equations ekvationer equations lös problem (ekvation) solve word problems nivå 6 level 6"
    },
    {
        "id": "equations:7",
        "topicId": "equations",
        "level": 7,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Ekvationer",
            "en": "Equations"
        },
        "levelDesc": {
            "sv": "Blandade Ekvationer",
            "en": "Mixed Equations"
        },
        "example": "$$9x + 4 = 2x + 46$$",
        "keywords": "equations ekvationer equations blandade ekvationer mixed equations nivå 7 level 7"
    },
    {
        "id": "equations_word:1",
        "topicId": "equations_word",
        "level": 1,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Ekvationer: Problemlösning",
            "en": "Equations: Problem Solving"
        },
        "levelDesc": {
            "sv": "Skriv: Fast + Rörlig",
            "en": "Write: Fixed + Variable"
        },
        "example": "$$12x+49=265$$",
        "keywords": "equations_word ekvationer: problemlösning equations: problem solving skriv: fast + rörlig write: fixed + variable nivå 1 level 1"
    },
    {
        "id": "expressions:1",
        "topicId": "expressions",
        "level": 1,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Uttryck",
            "en": "Expressions"
        },
        "levelDesc": {
            "sv": "Förenkla Uttryck (Enkel)",
            "en": "Simplify Expressions (Easy)"
        },
        "example": "$$18x + 12 + 5x - 5$$",
        "keywords": "expressions uttryck expressions förenkla uttryck (enkel) simplify expressions (easy) nivå 1 level 1"
    },
    {
        "id": "expressions:2",
        "topicId": "expressions",
        "level": 2,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Uttryck",
            "en": "Expressions"
        },
        "levelDesc": {
            "sv": "Prioriteringsregler med x",
            "en": "Order of Ops with x"
        },
        "example": "$$6 \\cdot 5x - 4x - 5$$",
        "keywords": "expressions uttryck expressions prioriteringsregler med x order of ops with x nivå 2 level 2"
    },
    {
        "id": "expressions:3",
        "topicId": "expressions",
        "level": 3,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Uttryck",
            "en": "Expressions"
        },
        "levelDesc": {
            "sv": "Parenteser (Addition)",
            "en": "Parentheses (Addition)"
        },
        "example": "$$20x + (4x + 3)$$",
        "keywords": "expressions uttryck expressions parenteser (addition) parentheses (addition) nivå 3 level 3"
    },
    {
        "id": "expressions:4",
        "topicId": "expressions",
        "level": 4,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Uttryck",
            "en": "Expressions"
        },
        "levelDesc": {
            "sv": "Parenteser (Multiplikation)",
            "en": "Parentheses (Multiplication)"
        },
        "example": "$$3(x + 5) - 2(x + 5)$$",
        "keywords": "expressions uttryck expressions parenteser (multiplikation) parentheses (multiplication) nivå 4 level 4"
    },
    {
        "id": "expressions:5",
        "topicId": "expressions",
        "level": 5,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Uttryck",
            "en": "Expressions"
        },
        "levelDesc": {
            "sv": "Parenteser (Subtraktion)",
            "en": "Parentheses (Subtraction)"
        },
        "example": "$$20x - (4x + 5)$$",
        "keywords": "expressions uttryck expressions parenteser (subtraktion) parentheses (subtraction) nivå 5 level 5"
    },
    {
        "id": "expressions:6",
        "topicId": "expressions",
        "level": 6,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Uttryck",
            "en": "Expressions"
        },
        "levelDesc": {
            "sv": "Blandade Nivåer",
            "en": "Mixed Levels"
        },
        "example": "$$20x - (4x + 5)$$",
        "keywords": "expressions uttryck expressions blandade nivåer mixed levels nivå 6 level 6"
    },
    {
        "id": "algebraic_geometry:1",
        "topicId": "algebraic_geometry",
        "level": 1,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Geometri med Algebra",
            "en": "Geometry with Algebra"
        },
        "levelDesc": {
            "sv": "Omkrets: Teckna uttryck",
            "en": "Perimeter: Write Expression"
        },
        "example": "Teckna ett förenklat uttryck för figurens omkrets.",
        "keywords": "algebraic_geometry geometri med algebra geometry with algebra omkrets: teckna uttryck perimeter: write expression nivå 1 level 1"
    },
    {
        "id": "algebraic_geometry:2",
        "topicId": "algebraic_geometry",
        "level": 2,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Geometri med Algebra",
            "en": "Geometry with Algebra"
        },
        "levelDesc": {
            "sv": "Omkrets: Lös ut x",
            "en": "Perimeter: Solve for x"
        },
        "example": "En liksidig triangels omkrets är 21 cm. Beräkna x.",
        "keywords": "algebraic_geometry geometri med algebra geometry with algebra omkrets: lös ut x perimeter: solve for x nivå 2 level 2"
    },
    {
        "id": "algebraic_geometry:3",
        "topicId": "algebraic_geometry",
        "level": 3,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Geometri med Algebra",
            "en": "Geometry with Algebra"
        },
        "levelDesc": {
            "sv": "Area: Teckna uttryck",
            "en": "Area: Write Expression"
        },
        "example": "Teckna ett förenklat uttryck för figurens area.",
        "keywords": "algebraic_geometry geometri med algebra geometry with algebra area: teckna uttryck area: write expression nivå 3 level 3"
    },
    {
        "id": "algebraic_geometry:4",
        "topicId": "algebraic_geometry",
        "level": 4,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Geometri med Algebra",
            "en": "Geometry with Algebra"
        },
        "levelDesc": {
            "sv": "Area: Lös ut x",
            "en": "Area: Solve for x"
        },
        "example": "Triangelns area är 175 cm². Beräkna x.",
        "keywords": "algebraic_geometry geometri med algebra geometry with algebra area: lös ut x area: solve for x nivå 4 level 4"
    },
    {
        "id": "algebraic_geometry:5",
        "topicId": "algebraic_geometry",
        "level": 5,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Geometri med Algebra",
            "en": "Geometry with Algebra"
        },
        "levelDesc": {
            "sv": "Vinklar: Teckna uttryck",
            "en": "Angles: Write Expression"
        },
        "example": "Teckna ett förenklat uttryck för de två vinklarnas sammanlagda summa.",
        "keywords": "algebraic_geometry geometri med algebra geometry with algebra vinklar: teckna uttryck angles: write expression nivå 5 level 5"
    },
    {
        "id": "algebraic_geometry:6",
        "topicId": "algebraic_geometry",
        "level": 6,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Geometri med Algebra",
            "en": "Geometry with Algebra"
        },
        "levelDesc": {
            "sv": "Vinklar: Lös ut x",
            "en": "Angles: Solve for x"
        },
        "example": "Vinklarna bildar tillsammans 180°. Beräkna x.",
        "keywords": "algebraic_geometry geometri med algebra geometry with algebra vinklar: lös ut x angles: solve for x nivå 6 level 6"
    },
    {
        "id": "patterns:1",
        "topicId": "patterns",
        "level": 1,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Algebraiska mönster",
            "en": "Algebraic patterns"
        },
        "levelDesc": {
            "sv": "Hitta nästa tal & Skillnad",
            "en": "Next Number & Difference"
        },
        "example": "Vilket tal ska stå istället för frågetecknet?",
        "keywords": "patterns algebraiska mönster algebraic patterns hitta nästa tal & skillnad next number & difference nivå 1 level 1"
    },
    {
        "id": "patterns:2",
        "topicId": "patterns",
        "level": 2,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Algebraiska mönster",
            "en": "Algebraic patterns"
        },
        "levelDesc": {
            "sv": "Beräkna höga figurer",
            "en": "Calculate High Terms"
        },
        "example": "Vilket värde har tal nummer 50 i mönstret: 8, 17, 26... ?",
        "keywords": "patterns algebraiska mönster algebraic patterns beräkna höga figurer calculate high terms nivå 2 level 2"
    },
    {
        "id": "patterns:3",
        "topicId": "patterns",
        "level": 3,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Algebraiska mönster",
            "en": "Algebraic patterns"
        },
        "levelDesc": {
            "sv": "Från bild till uttryck",
            "en": "From Visual to Expression"
        },
        "example": "Vilket uttryck beskriver antalet stickor i figur n?",
        "keywords": "patterns algebraiska mönster algebraic patterns från bild till uttryck from visual to expression nivå 3 level 3"
    },
    {
        "id": "patterns:4",
        "topicId": "patterns",
        "level": 4,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Algebraiska mönster",
            "en": "Algebraic patterns"
        },
        "levelDesc": {
            "sv": "Från tabell till formel",
            "en": "Table to Formula"
        },
        "example": "Bestäm uttrycket på formen $an + b$ som beskriver mönstret i tabellen.",
        "keywords": "patterns algebraiska mönster algebraic patterns från tabell till formel table to formula nivå 4 level 4"
    },
    {
        "id": "patterns:5",
        "topicId": "patterns",
        "level": 5,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Algebraiska mönster",
            "en": "Algebraic patterns"
        },
        "levelDesc": {
            "sv": "Lös ut n (baklänges)",
            "en": "Solve for n"
        },
        "example": "I ett mönster med formeln $V = 8n + 3$, vilket figurnummer (n) har värdet 307?",
        "keywords": "patterns algebraiska mönster algebraic patterns lös ut n (baklänges) solve for n nivå 5 level 5"
    },
    {
        "id": "graphs:1",
        "topicId": "graphs",
        "level": 1,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Räta Linjens Ekvation",
            "en": "Linear Equations & Graphs"
        },
        "levelDesc": {
            "sv": "Hitta m-värdet (Starttal)",
            "en": "Find m-value (Intercept)"
        },
        "example": "Var skär linjen den stående y-axeln? Bestäm linjens m-värde (starttal).",
        "keywords": "graphs räta linjens ekvation linear equations & graphs hitta m-värdet (starttal) find m-value (intercept) nivå 1 level 1"
    },
    {
        "id": "graphs:2",
        "topicId": "graphs",
        "level": 2,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Räta Linjens Ekvation",
            "en": "Linear Equations & Graphs"
        },
        "levelDesc": {
            "sv": "Lutning & Trappsteg (k-värde)",
            "en": "Slope & Rate of Change (k-value)"
        },
        "example": "Bestäm linjens lutning (k-värde).",
        "keywords": "graphs räta linjens ekvation linear equations & graphs lutning & trappsteg (k-värde) slope & rate of change (k-value) nivå 2 level 2"
    },
    {
        "id": "graphs:3",
        "topicId": "graphs",
        "level": 3,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Räta Linjens Ekvation",
            "en": "Linear Equations & Graphs"
        },
        "levelDesc": {
            "sv": "Värdetabell & Funktioner",
            "en": "Tables & Functions"
        },
        "example": "Vilken formel $y = kx + m$ beskriver sambandet i tabellen?",
        "keywords": "graphs räta linjens ekvation linear equations & graphs värdetabell & funktioner tables & functions nivå 3 level 3"
    },
    {
        "id": "graphs:4",
        "topicId": "graphs",
        "level": 4,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Räta Linjens Ekvation",
            "en": "Linear Equations & Graphs"
        },
        "levelDesc": {
            "sv": "Linjens ekvation & Grafer",
            "en": "Line Equation & Graph Reading"
        },
        "example": "Bestäm linjens ekvation på formen y = kx + m.",
        "keywords": "graphs räta linjens ekvation linear equations & graphs linjens ekvation & grafer line equation & graph reading nivå 4 level 4"
    },
    {
        "id": "graphs:5",
        "topicId": "graphs",
        "level": 5,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Räta Linjens Ekvation",
            "en": "Linear Equations & Graphs"
        },
        "levelDesc": {
            "sv": "Koordinater & Parallella linjer",
            "en": "Coordinates & Parallel Lines"
        },
        "example": "Ligger punkten $(4, -4)$ på linjen $y=-x$?",
        "keywords": "graphs räta linjens ekvation linear equations & graphs koordinater & parallella linjer coordinates & parallel lines nivå 5 level 5"
    },
    {
        "id": "graphs:6",
        "topicId": "graphs",
        "level": 6,
        "category": "algebra",
        "categoryLabel": {
            "sv": "Algebra",
            "en": "Algebra"
        },
        "topicLabel": {
            "sv": "Räta Linjens Ekvation",
            "en": "Linear Equations & Graphs"
        },
        "levelDesc": {
            "sv": "Blandade Linjära Funktioner",
            "en": "Mixed Linear Functions"
        },
        "example": "Läs av grafen. Vilket är startvärdet (m-värdet) där linjen skär den stående axeln?",
        "keywords": "graphs räta linjens ekvation linear equations & graphs blandade linjära funktioner mixed linear functions nivå 6 level 6"
    },
    {
        "id": "basic_arithmetic:1",
        "topicId": "basic_arithmetic",
        "level": 1,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Addition (Uppställning)",
            "en": "Addition (Vertical)"
        },
        "example": "$$\\begin{array}{rr} & 20 \\\\ + & 10 \\\\ \\hline \\end{array}$$",
        "keywords": "basic_arithmetic de fyra räknesätten basic counting addition (uppställning) addition (vertical) nivå 1 level 1"
    },
    {
        "id": "basic_arithmetic:2",
        "topicId": "basic_arithmetic",
        "level": 2,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Subtraktion (Uppställning)",
            "en": "Subtraction (Vertical)"
        },
        "example": "$$\\begin{array}{rr} & 198 \\\\ - & 90 \\\\ \\hline \\end{array}$$",
        "keywords": "basic_arithmetic de fyra räknesätten basic counting subtraktion (uppställning) subtraction (vertical) nivå 2 level 2"
    },
    {
        "id": "basic_arithmetic:3",
        "topicId": "basic_arithmetic",
        "level": 3,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Decimaltal (+/-)",
            "en": "Decimals (+/-)"
        },
        "example": "$$13,2 + 3,47$$",
        "keywords": "basic_arithmetic de fyra räknesätten basic counting decimaltal (+/-) decimals (+/-) nivå 3 level 3"
    },
    {
        "id": "basic_arithmetic:4",
        "topicId": "basic_arithmetic",
        "level": 4,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Multiplikation (Enkel)",
            "en": "Multiplication (Simple)"
        },
        "example": "$$9 \\cdot 6$$",
        "keywords": "basic_arithmetic de fyra räknesätten basic counting multiplikation (enkel) multiplication (simple) nivå 4 level 4"
    },
    {
        "id": "basic_arithmetic:5",
        "topicId": "basic_arithmetic",
        "level": 5,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Multiplikation (Medel)",
            "en": "Multiplication (Medium)"
        },
        "example": "$$\\begin{array}{rr} & 38 \\\\ \\times & 5 \\\\ \\hline \\end{array}$$",
        "keywords": "basic_arithmetic de fyra räknesätten basic counting multiplikation (medel) multiplication (medium) nivå 5 level 5"
    },
    {
        "id": "basic_arithmetic:6",
        "topicId": "basic_arithmetic",
        "level": 6,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Multiplikation (Svår)",
            "en": "Multiplication (Hard)"
        },
        "example": "$$0,81 \\cdot 8$$",
        "keywords": "basic_arithmetic de fyra räknesätten basic counting multiplikation (svår) multiplication (hard) nivå 6 level 6"
    },
    {
        "id": "basic_arithmetic:7",
        "topicId": "basic_arithmetic",
        "level": 7,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Kort Division",
            "en": "Short Division"
        },
        "example": "$$\\frac{21}{7}$$",
        "keywords": "basic_arithmetic de fyra räknesätten basic counting kort division short division nivå 7 level 7"
    },
    {
        "id": "basic_arithmetic:8",
        "topicId": "basic_arithmetic",
        "level": 8,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Delbarhetsregler",
            "en": "Divisibility Rules"
        },
        "example": "Vilket av följande tal är delbart med 5?",
        "keywords": "basic_arithmetic de fyra räknesätten basic counting delbarhetsregler divisibility rules nivå 8 level 8"
    },
    {
        "id": "basic_arithmetic:9",
        "topicId": "basic_arithmetic",
        "level": 9,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Division med Decimaler",
            "en": "Division with Decimals"
        },
        "example": "$$\\frac{4,8}{4}$$",
        "keywords": "basic_arithmetic de fyra räknesätten basic counting division med decimaler division with decimals nivå 9 level 9"
    },
    {
        "id": "basic_arithmetic:10",
        "topicId": "basic_arithmetic",
        "level": 10,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Blandade Heltal",
            "en": "Mixed Integers"
        },
        "example": "$$\\frac{4,8}{4}$$",
        "keywords": "basic_arithmetic de fyra räknesätten basic counting blandade heltal mixed integers nivå 10 level 10"
    },
    {
        "id": "basic_arithmetic:11",
        "topicId": "basic_arithmetic",
        "level": 11,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "De Fyra Räknesätten",
            "en": "Basic Counting"
        },
        "levelDesc": {
            "sv": "Blandade Decimaltal",
            "en": "Mixed Decimals"
        },
        "example": "$$\\frac{4,8}{4}$$",
        "keywords": "basic_arithmetic de fyra räknesätten basic counting blandade decimaltal mixed decimals nivå 11 level 11"
    },
    {
        "id": "place_value:1",
        "topicId": "place_value",
        "level": 1,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Positionssystemet & Avrundning",
            "en": "Place Value & Rounding"
        },
        "levelDesc": {
            "sv": "Heltal (Position)",
            "en": "Whole Numbers (Place Value)"
        },
        "example": "Vilket värde har siffran 8 i talet 8152?",
        "keywords": "place_value positionssystemet & avrundning place value & rounding heltal (position) whole numbers (place value) nivå 1 level 1"
    },
    {
        "id": "place_value:2",
        "topicId": "place_value",
        "level": 2,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Positionssystemet & Avrundning",
            "en": "Place Value & Rounding"
        },
        "levelDesc": {
            "sv": "Decimaltal (Position)",
            "en": "Decimals (Place Value)"
        },
        "example": "Vilket värde har siffran 3 i talet 285,3? Svara i decimalform.",
        "keywords": "place_value positionssystemet & avrundning place value & rounding decimaltal (position) decimals (place value) nivå 2 level 2"
    },
    {
        "id": "place_value:3",
        "topicId": "place_value",
        "level": 3,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Positionssystemet & Avrundning",
            "en": "Place Value & Rounding"
        },
        "levelDesc": {
            "sv": "Avrundning",
            "en": "Rounding"
        },
        "example": "Avrunda talet 9008,81 till närmaste hundratal. (Svara som ett heltal utan kommatecken)",
        "keywords": "place_value positionssystemet & avrundning place value & rounding avrundning rounding nivå 3 level 3"
    },
    {
        "id": "order_of_operations:1",
        "topicId": "order_of_operations",
        "level": 1,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Prioriteringsregler",
            "en": "Order of Operations"
        },
        "levelDesc": {
            "sv": "Prioritering: Grund",
            "en": "Order: Basics"
        },
        "example": "$$7 · 4 + 9$$",
        "keywords": "order_of_operations prioriteringsregler order of operations prioritering: grund order: basics nivå 1 level 1"
    },
    {
        "id": "order_of_operations:2",
        "topicId": "order_of_operations",
        "level": 2,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Prioriteringsregler",
            "en": "Order of Operations"
        },
        "levelDesc": {
            "sv": "Prioritering: Parenteser",
            "en": "Order: Parentheses"
        },
        "example": "$$6 + 4 \\cdot (7 - 3)$$",
        "keywords": "order_of_operations prioriteringsregler order of operations prioritering: parenteser order: parentheses nivå 2 level 2"
    },
    {
        "id": "order_of_operations:3",
        "topicId": "order_of_operations",
        "level": 3,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Prioriteringsregler",
            "en": "Order of Operations"
        },
        "levelDesc": {
            "sv": "Prioritering: Bråkstreck",
            "en": "Order: Fraction Bars"
        },
        "example": "$$(8 + 5) · 2 + 7 · 6 + 40$$",
        "keywords": "order_of_operations prioriteringsregler order of operations prioritering: bråkstreck order: fraction bars nivå 3 level 3"
    },
    {
        "id": "order_of_operations:4",
        "topicId": "order_of_operations",
        "level": 4,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Prioriteringsregler",
            "en": "Order of Operations"
        },
        "levelDesc": {
            "sv": "Prioritering: Potenser",
            "en": "Order: Powers"
        },
        "example": "$$16 - \\frac{3 + 15}{9} - 3^{2}$$",
        "keywords": "order_of_operations prioriteringsregler order of operations prioritering: potenser order: powers nivå 4 level 4"
    },
    {
        "id": "negatives:1",
        "topicId": "negatives",
        "level": 1,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Negativa Tal",
            "en": "Negative Numbers"
        },
        "levelDesc": {
            "sv": "Enkel Addition/Subtraktion",
            "en": "Simple Add/Sub"
        },
        "example": "",
        "keywords": "negatives negativa tal negative numbers enkel addition/subtraktion simple add/sub nivå 1 level 1"
    },
    {
        "id": "negatives:2",
        "topicId": "negatives",
        "level": 2,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Negativa Tal",
            "en": "Negative Numbers"
        },
        "levelDesc": {
            "sv": "Svårare Addition/Subtraktion",
            "en": "Harder Add/Sub"
        },
        "example": "$$4 + 5 - 5 + 5$$",
        "keywords": "negatives negativa tal negative numbers svårare addition/subtraktion harder add/sub nivå 2 level 2"
    },
    {
        "id": "negatives:3",
        "topicId": "negatives",
        "level": 3,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Negativa Tal",
            "en": "Negative Numbers"
        },
        "levelDesc": {
            "sv": "Multiplikation",
            "en": "Multiplication"
        },
        "example": "$$(-6) \\cdot (-8)$$",
        "keywords": "negatives negativa tal negative numbers multiplikation multiplication nivå 3 level 3"
    },
    {
        "id": "negatives:4",
        "topicId": "negatives",
        "level": 4,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Negativa Tal",
            "en": "Negative Numbers"
        },
        "levelDesc": {
            "sv": "Division",
            "en": "Division"
        },
        "example": "$$\\frac{-8}{-2}$$",
        "keywords": "negatives negativa tal negative numbers division division nivå 4 level 4"
    },
    {
        "id": "negatives:5",
        "topicId": "negatives",
        "level": 5,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Negativa Tal",
            "en": "Negative Numbers"
        },
        "levelDesc": {
            "sv": "Blandade + - x /",
            "en": "Mixed: + - x /"
        },
        "example": "$$\\frac{-8}{-2}$$",
        "keywords": "negatives negativa tal negative numbers blandade + - x / mixed: + - x / nivå 5 level 5"
    },
    {
        "id": "negatives:6",
        "topicId": "negatives",
        "level": 6,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Negativa Tal",
            "en": "Negative Numbers"
        },
        "levelDesc": {
            "sv": "Prioriteringsregler: Negativa tal",
            "en": "Order of Ops with Negative Numbers"
        },
        "example": "$$\\frac{-11  +  (-5)  \\cdot  (-1)}{-6}$$",
        "keywords": "negatives negativa tal negative numbers prioriteringsregler: negativa tal order of ops with negative numbers nivå 6 level 6"
    },
    {
        "id": "fractions_basics:1",
        "topicId": "fractions_basics",
        "level": 1,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Grunder",
            "en": "Fractions: Basics"
        },
        "levelDesc": {
            "sv": "Visuella Bråk",
            "en": "Visual Fractions"
        },
        "example": "Du har 20 kulor. Hur många kulor motsvarar 1/10?",
        "keywords": "fractions_basics bråk: grunder fractions: basics visuella bråk visual fractions nivå 1 level 1"
    },
    {
        "id": "fractions_basics:2",
        "topicId": "fractions_basics",
        "level": 2,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Grunder",
            "en": "Fractions: Basics"
        },
        "levelDesc": {
            "sv": "Beräkna delen",
            "en": "Parts of a Quantity"
        },
        "example": "Om en 1/10 av ett okänt tal är 49, vad är då hela talet totalt?",
        "keywords": "fractions_basics bråk: grunder fractions: basics beräkna delen parts of a quantity nivå 2 level 2"
    },
    {
        "id": "fractions_basics:3",
        "topicId": "fractions_basics",
        "level": 3,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Grunder",
            "en": "Fractions: Basics"
        },
        "levelDesc": {
            "sv": "Blandad & Bråkform",
            "en": "Mixed & Improper"
        },
        "example": "Mellan vilka två hela siffror ligger bråket $\\frac{15}{4}$?",
        "keywords": "fractions_basics bråk: grunder fractions: basics blandad & bråkform mixed & improper nivå 3 level 3"
    },
    {
        "id": "fractions_basics:4",
        "topicId": "fractions_basics",
        "level": 4,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Grunder",
            "en": "Fractions: Basics"
        },
        "levelDesc": {
            "sv": "Förlänga & Förkorta",
            "en": "Simplify & Extend"
        },
        "example": "$$\\frac{2}{9} = \\frac{?}{36}$$",
        "keywords": "fractions_basics bråk: grunder fractions: basics förlänga & förkorta simplify & extend nivå 4 level 4"
    },
    {
        "id": "fractions_basics:5",
        "topicId": "fractions_basics",
        "level": 5,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Grunder",
            "en": "Fractions: Basics"
        },
        "levelDesc": {
            "sv": "Bråk & Decimaltal",
            "en": "Fractions & Decimals"
        },
        "example": "$$\\frac{2}{5} \\quad \\bigcirc \\quad 0,45$$",
        "keywords": "fractions_basics bråk: grunder fractions: basics bråk & decimaltal fractions & decimals nivå 5 level 5"
    },
    {
        "id": "fraction_arith:1",
        "topicId": "fraction_arith",
        "level": 1,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Addition & Subtraktion (Lika)",
            "en": "Add & Sub (Same Denom)"
        },
        "example": "$$\\frac{8}{10} + \\frac{x}{10} = \\frac{9}{10}$$",
        "keywords": "fraction_arith bråk: räkna fractions: arithmetic addition & subtraktion (lika) add & sub (same denom) nivå 1 level 1"
    },
    {
        "id": "fraction_arith:2",
        "topicId": "fraction_arith",
        "level": 2,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Addition & Subtraktion (Olika)",
            "en": "Add & Sub (Diff Denom)"
        },
        "example": "Hitta den minsta gemensamma nämnaren (MGN) för 3 och 5.",
        "keywords": "fraction_arith bråk: räkna fractions: arithmetic addition & subtraktion (olika) add & sub (diff denom) nivå 2 level 2"
    },
    {
        "id": "fraction_arith:3",
        "topicId": "fraction_arith",
        "level": 3,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Blandad form (+ och -)",
            "en": "Mixed Numbers (+ and -)"
        },
        "example": "$$4\\frac{1}{4} + 1\\frac{1}{4}$$",
        "keywords": "fraction_arith bråk: räkna fractions: arithmetic blandad form (+ och -) mixed numbers (+ and -) nivå 3 level 3"
    },
    {
        "id": "fraction_arith:4",
        "topicId": "fraction_arith",
        "level": 4,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Multiplikation",
            "en": "Multiplication"
        },
        "example": "$$\\frac{8}{3} \\cdot \\frac{1}{3}$$",
        "keywords": "fraction_arith bråk: räkna fractions: arithmetic multiplikation multiplication nivå 4 level 4"
    },
    {
        "id": "fraction_arith:5",
        "topicId": "fraction_arith",
        "level": 5,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Division",
            "en": "Division"
        },
        "example": "$$\\frac{4}{12} \\div \\frac{1}{10}$$",
        "keywords": "fraction_arith bråk: räkna fractions: arithmetic division division nivå 5 level 5"
    },
    {
        "id": "fraction_arith:6",
        "topicId": "fraction_arith",
        "level": 6,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Negativa Bråk",
            "en": "Negative Fractions"
        },
        "example": "$$\\frac{3}{5} + \\left(-\\frac{2}{3}\\right)$$",
        "keywords": "fraction_arith bråk: räkna fractions: arithmetic negativa bråk negative fractions nivå 6 level 6"
    },
    {
        "id": "fraction_arith:7",
        "topicId": "fraction_arith",
        "level": 7,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Prioriteringsregler (Bråk)",
            "en": "Order of Ops (Fractions)"
        },
        "example": "$$\\frac{1}{2} \\cdot \\frac{3}{4} + \\frac{1}{2}$$",
        "keywords": "fraction_arith bråk: räkna fractions: arithmetic prioriteringsregler (bråk) order of ops (fractions) nivå 7 level 7"
    },
    {
        "id": "fraction_arith:8",
        "topicId": "fraction_arith",
        "level": 8,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Bråk: Räkna",
            "en": "Fractions: Arithmetic"
        },
        "levelDesc": {
            "sv": "Potenser & Negativa Bråk",
            "en": "Powers & Negative Fractions"
        },
        "example": "$$\\left(-\\frac{1}{3}\\right)^{2} - \\frac{1}{6}$$",
        "keywords": "fraction_arith bråk: räkna fractions: arithmetic potenser & negativa bråk powers & negative fractions nivå 8 level 8"
    },
    {
        "id": "percent:1",
        "topicId": "percent",
        "level": 1,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Procent",
            "en": "Percentage"
        },
        "levelDesc": {
            "sv": "Grundläggande & Bildstöd",
            "en": "Basic Concepts & Visuals"
        },
        "example": "Hur många procent av rutnätet är färgat?",
        "keywords": "percent procent percentage grundläggande & bildstöd basic concepts & visuals nivå 1 level 1"
    },
    {
        "id": "percent:2",
        "topicId": "percent",
        "level": 2,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Procent",
            "en": "Percentage"
        },
        "levelDesc": {
            "sv": "Huvudräkning",
            "en": "Mental Math"
        },
        "example": "$$20\\% \\cdot 50$$",
        "keywords": "percent procent percentage huvudräkning mental math nivå 2 level 2"
    },
    {
        "id": "percent:3",
        "topicId": "percent",
        "level": 3,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Procent",
            "en": "Percentage"
        },
        "levelDesc": {
            "sv": "Beräkna andelen",
            "en": "Find the Rate / Percentage"
        },
        "example": "$$\\frac{90}{150}$$",
        "keywords": "percent procent percentage beräkna andelen find the rate / percentage nivå 3 level 3"
    },
    {
        "id": "percent:4",
        "topicId": "percent",
        "level": 4,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Procent",
            "en": "Percentage"
        },
        "levelDesc": {
            "sv": "Beräkna delen & Byggstenar",
            "en": "Calculate Part of a Whole"
        },
        "example": "$$40\\% \\cdot 840$$",
        "keywords": "percent procent percentage beräkna delen & byggstenar calculate part of a whole nivå 4 level 4"
    },
    {
        "id": "percent:5",
        "topicId": "percent",
        "level": 5,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Procent",
            "en": "Percentage"
        },
        "levelDesc": {
            "sv": "Procentuell förändring",
            "en": "Percentage Change"
        },
        "example": "$$\\frac{25}{25}$$",
        "keywords": "percent procent percentage procentuell förändring percentage change nivå 5 level 5"
    },
    {
        "id": "percent:6",
        "topicId": "percent",
        "level": 6,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Procent",
            "en": "Percentage"
        },
        "levelDesc": {
            "sv": "Beräkna det hela (100%)",
            "en": "Find the Whole (Reverse %)"
        },
        "example": "$$1\\% = 8$$",
        "keywords": "percent procent percentage beräkna det hela (100%) find the whole (reverse %) nivå 6 level 6"
    },
    {
        "id": "change_factor:1",
        "topicId": "change_factor",
        "level": 1,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Förändringsfaktor",
            "en": "Change Factor"
        },
        "levelDesc": {
            "sv": "Begrepp & Omvandling",
            "en": "Concepts & Conversion"
        },
        "example": "Ett värde ökar med 89%. Vilken förändringsfaktor motsvarar denna ökning?",
        "keywords": "change_factor förändringsfaktor change factor begrepp & omvandling concepts & conversion nivå 1 level 1"
    },
    {
        "id": "change_factor:2",
        "topicId": "change_factor",
        "level": 2,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Förändringsfaktor",
            "en": "Change Factor"
        },
        "levelDesc": {
            "sv": "Beräkna det nya värdet",
            "en": "Calculate New Value"
        },
        "example": "Ett värde på 1550 kr ska höjas med 82%. Beräkna det nya värdet med hjälp av förändringsfaktor.",
        "keywords": "change_factor förändringsfaktor change factor beräkna det nya värdet calculate new value nivå 2 level 2"
    },
    {
        "id": "change_factor:3",
        "topicId": "change_factor",
        "level": 3,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Förändringsfaktor",
            "en": "Change Factor"
        },
        "levelDesc": {
            "sv": "Hitta ursprungsvärdet",
            "en": "Find Original Value"
        },
        "example": "Efter en höjning med 50% är det nya priset 600 kr. Vad var priset från början?",
        "keywords": "change_factor förändringsfaktor change factor hitta ursprungsvärdet find original value nivå 3 level 3"
    },
    {
        "id": "change_factor:4",
        "topicId": "change_factor",
        "level": 4,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Förändringsfaktor",
            "en": "Change Factor"
        },
        "levelDesc": {
            "sv": "Sammansatt förändringsfaktor",
            "en": "Compound Change Factor"
        },
        "example": "Ett pris ändras i två steg: först en ökning med 40%, därefter en minskning med 25%. Beräkna den totala förändringsfaktorn.",
        "keywords": "change_factor förändringsfaktor change factor sammansatt förändringsfaktor compound change factor nivå 4 level 4"
    },
    {
        "id": "change_factor:5",
        "topicId": "change_factor",
        "level": 5,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Förändringsfaktor",
            "en": "Change Factor"
        },
        "levelDesc": {
            "sv": "Total förändring & Upprepad förändring",
            "en": "Net Change & Repeated Change"
        },
        "example": "Ett pris höjs först med 5% och sänks därefter med 40%. Med hur många procent har priset förändrats totalt?",
        "keywords": "change_factor förändringsfaktor change factor total förändring & upprepad förändring net change & repeated change nivå 5 level 5"
    },
    {
        "id": "exponents:1",
        "topicId": "exponents",
        "level": 1,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Grunder & x^0",
            "en": "Foundations & x^0"
        },
        "example": "$$161^{0}$$",
        "keywords": "exponents potenser & rötter exponents & roots grunder & x^0 foundations & x^0 nivå 1 level 1"
    },
    {
        "id": "exponents:2",
        "topicId": "exponents",
        "level": 2,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Tiopotenser",
            "en": "Powers of 10"
        },
        "example": "$$10^{4}$$",
        "keywords": "exponents potenser & rötter exponents & roots tiopotenser powers of 10 nivå 2 level 2"
    },
    {
        "id": "exponents:3",
        "topicId": "exponents",
        "level": 3,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Grundpotensform",
            "en": "Scientific Notation"
        },
        "example": "Skriv talet 2 000 i grundpotensform.",
        "keywords": "exponents potenser & rötter exponents & roots grundpotensform scientific notation nivå 3 level 3"
    },
    {
        "id": "exponents:4",
        "topicId": "exponents",
        "level": 4,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Kvadratrötter",
            "en": "Square Roots"
        },
        "example": "$$\\sqrt{36}$$",
        "keywords": "exponents potenser & rötter exponents & roots kvadratrötter square roots nivå 4 level 4"
    },
    {
        "id": "exponents:5",
        "topicId": "exponents",
        "level": 5,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Potenslagar (Enkel)",
            "en": "Exponent Laws (Basic)"
        },
        "example": "$$x^{9} \\cdot x^{10}$$",
        "keywords": "exponents potenser & rötter exponents & roots potenslagar (enkel) exponent laws (basic) nivå 5 level 5"
    },
    {
        "id": "exponents:6",
        "topicId": "exponents",
        "level": 6,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Potenslagar (Avancerad)",
            "en": "Exponent Laws (Adv)"
        },
        "example": "$$(x^{3})^{3}$$",
        "keywords": "exponents potenser & rötter exponents & roots potenslagar (avancerad) exponent laws (adv) nivå 6 level 6"
    },
    {
        "id": "exponents:7",
        "topicId": "exponents",
        "level": 7,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "Potenser & Rötter",
            "en": "Exponents & Roots"
        },
        "levelDesc": {
            "sv": "Räkna med grundpotens",
            "en": "Calculate with Scientific Notation"
        },
        "example": "$$2 \\cdot 10^{8} \\cdot 7 \\cdot 10^{-4}$$",
        "keywords": "exponents potenser & rötter exponents & roots räkna med grundpotens calculate with scientific notation nivå 7 level 7"
    },
    {
        "id": "ten_powers:1",
        "topicId": "ten_powers",
        "level": 1,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "10, 100, 1000",
            "en": "10, 100, 1000"
        },
        "levelDesc": {
            "sv": "Mult/Div med 10, 100, 1000",
            "en": "Mult/Div by 10, 100, 1000"
        },
        "example": "$$0,17 \\cdot 10000$$",
        "keywords": "ten_powers 10, 100, 1000 10, 100, 1000 mult/div med 10, 100, 1000 mult/div by 10, 100, 1000 nivå 1 level 1"
    },
    {
        "id": "ten_powers:2",
        "topicId": "ten_powers",
        "level": 2,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "10, 100, 1000",
            "en": "10, 100, 1000"
        },
        "levelDesc": {
            "sv": "Begreppsförståelse",
            "en": "Conceptual Understanding"
        },
        "example": "Att multiplicera med 0,01 ger exakt samma svar som att dividera med...",
        "keywords": "ten_powers 10, 100, 1000 10, 100, 1000 begreppsförståelse conceptual understanding nivå 2 level 2"
    },
    {
        "id": "ten_powers:3",
        "topicId": "ten_powers",
        "level": 3,
        "category": "arithmetic",
        "categoryLabel": {
            "sv": "Taluppfattning",
            "en": "Number Theory"
        },
        "topicLabel": {
            "sv": "10, 100, 1000",
            "en": "10, 100, 1000"
        },
        "levelDesc": {
            "sv": "Blandade Faktorer (0.1, 100...)",
            "en": "Mixed Factors"
        },
        "example": "$$0,38 \\cdot 0,1$$",
        "keywords": "ten_powers 10, 100, 1000 10, 100, 1000 blandade faktorer (0.1, 100...) mixed factors nivå 3 level 3"
    },
    {
        "id": "unit_conversion:1",
        "topicId": "unit_conversion",
        "level": 1,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Enhetsomvandling",
            "en": "Unit Conversions"
        },
        "levelDesc": {
            "sv": "Längd",
            "en": "Length"
        },
        "example": "$$79,8 \\text{ mm} = \\text{\\_\\_\\_} \\text{ m}$$",
        "keywords": "unit_conversion enhetsomvandling unit conversions längd length nivå 1 level 1"
    },
    {
        "id": "unit_conversion:2",
        "topicId": "unit_conversion",
        "level": 2,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Enhetsomvandling",
            "en": "Unit Conversions"
        },
        "levelDesc": {
            "sv": "Vikt",
            "en": "Weight"
        },
        "example": "$$176 \\text{ hg} = \\text{\\_\\_\\_} \\text{ g}$$",
        "keywords": "unit_conversion enhetsomvandling unit conversions vikt weight nivå 2 level 2"
    },
    {
        "id": "unit_conversion:3",
        "topicId": "unit_conversion",
        "level": 3,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Enhetsomvandling",
            "en": "Unit Conversions"
        },
        "levelDesc": {
            "sv": "Volym (L)",
            "en": "Volume (L)"
        },
        "example": "$$15,5 \\text{ cl} = \\text{\\_\\_\\_} \\text{ l}$$",
        "keywords": "unit_conversion enhetsomvandling unit conversions volym (l) volume (l) nivå 3 level 3"
    },
    {
        "id": "unit_conversion:4",
        "topicId": "unit_conversion",
        "level": 4,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Enhetsomvandling",
            "en": "Unit Conversions"
        },
        "levelDesc": {
            "sv": "Blandad (1-3)",
            "en": "Mixed (1-3)"
        },
        "example": "$$15,5 \\text{ cl} = \\text{\\_\\_\\_} \\text{ l}$$",
        "keywords": "unit_conversion enhetsomvandling unit conversions blandad (1-3) mixed (1-3) nivå 4 level 4"
    },
    {
        "id": "geometry:1",
        "topicId": "geometry",
        "level": 1,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Area & Omkrets",
            "en": "Area & Perimeter"
        },
        "levelDesc": {
            "sv": "Omkrets (Rektangel)",
            "en": "Perimeter (Rectangle)"
        },
        "example": "Beräkna kvadratens omkrets.",
        "keywords": "geometry area & omkrets area & perimeter omkrets (rektangel) perimeter (rectangle) nivå 1 level 1"
    },
    {
        "id": "geometry:2",
        "topicId": "geometry",
        "level": 2,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Area & Omkrets",
            "en": "Area & Perimeter"
        },
        "levelDesc": {
            "sv": "Area (Rektangel)",
            "en": "Area (Rectangle)"
        },
        "example": "Beräkna figurens area.",
        "keywords": "geometry area & omkrets area & perimeter area (rektangel) area (rectangle) nivå 2 level 2"
    },
    {
        "id": "geometry:3",
        "topicId": "geometry",
        "level": 3,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Area & Omkrets",
            "en": "Area & Perimeter"
        },
        "levelDesc": {
            "sv": "Area (Triangel)",
            "en": "Area (Triangle)"
        },
        "example": "Beräkna triangelns area.",
        "keywords": "geometry area & omkrets area & perimeter area (triangel) area (triangle) nivå 3 level 3"
    },
    {
        "id": "geometry:4",
        "topicId": "geometry",
        "level": 4,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Area & Omkrets",
            "en": "Area & Perimeter"
        },
        "levelDesc": {
            "sv": "Sammansatta (Rekt+Tri)",
            "en": "Composite Shapes (Rect+Tri)"
        },
        "example": "Figuren består av en rektangel och en triangel. Vad är totalarean?",
        "keywords": "geometry area & omkrets area & perimeter sammansatta (rekt+tri) composite shapes (rect+tri) nivå 4 level 4"
    },
    {
        "id": "geometry:5",
        "topicId": "geometry",
        "level": 5,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Area & Omkrets",
            "en": "Area & Perimeter"
        },
        "levelDesc": {
            "sv": "Cirkelns Area & Omkrets",
            "en": "Circle Area & Perimeter"
        },
        "example": "Beräkna cirkelns area (använd pi = 3,14). Avrunda svaret till två decimaler.",
        "keywords": "geometry area & omkrets area & perimeter cirkelns area & omkrets circle area & perimeter nivå 5 level 5"
    },
    {
        "id": "geometry:6",
        "topicId": "geometry",
        "level": 6,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Area & Omkrets",
            "en": "Area & Perimeter"
        },
        "levelDesc": {
            "sv": "Sammansatta (Alla)",
            "en": "Composite Shapes (All)"
        },
        "example": "Beräkna husets omkrets.",
        "keywords": "geometry area & omkrets area & perimeter sammansatta (alla) composite shapes (all) nivå 6 level 6"
    },
    {
        "id": "angles:1",
        "topicId": "angles",
        "level": 1,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Vinklar",
            "en": "Angles"
        },
        "levelDesc": {
            "sv": "Vinkeltyper",
            "en": "Types of Angles"
        },
        "example": "Vad kallas denna typ av vinkel?",
        "keywords": "angles vinklar angles vinkeltyper types of angles nivå 1 level 1"
    },
    {
        "id": "angles:2",
        "topicId": "angles",
        "level": 2,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Vinklar",
            "en": "Angles"
        },
        "levelDesc": {
            "sv": "Komplement & Supplement",
            "en": "Complementary & Supplementary"
        },
        "example": "Beräkna x.",
        "keywords": "angles vinklar angles komplement & supplement complementary & supplementary nivå 2 level 2"
    },
    {
        "id": "angles:3",
        "topicId": "angles",
        "level": 3,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Vinklar",
            "en": "Angles"
        },
        "levelDesc": {
            "sv": "Vertikal- & Sidovinklar",
            "en": "Vertical & Adjacent Angles"
        },
        "example": "Bestäm x.",
        "keywords": "angles vinklar angles vertikal- & sidovinklar vertical & adjacent angles nivå 3 level 3"
    },
    {
        "id": "angles:4",
        "topicId": "angles",
        "level": 4,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Vinklar",
            "en": "Angles"
        },
        "levelDesc": {
            "sv": "Vinkelsumma (Triangel)",
            "en": "Triangle Angle Sum"
        },
        "example": "Beräkna x i triangeln.",
        "keywords": "angles vinklar angles vinkelsumma (triangel) triangle angle sum nivå 4 level 4"
    },
    {
        "id": "angles:5",
        "topicId": "angles",
        "level": 5,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Vinklar",
            "en": "Angles"
        },
        "levelDesc": {
            "sv": "Vinkelsumma (Polygoner)",
            "en": "Polygon Angle Sum"
        },
        "example": "Beräkna x i fyrhörningen.",
        "keywords": "angles vinklar angles vinkelsumma (polygoner) polygon angle sum nivå 5 level 5"
    },
    {
        "id": "angles:6",
        "topicId": "angles",
        "level": 6,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Vinklar",
            "en": "Angles"
        },
        "levelDesc": {
            "sv": "Likbelägna & Alternatvinklar",
            "en": "Parallel Lines"
        },
        "example": "Bestäm vinkeln x utifrån teorin om parallella linjer.",
        "keywords": "angles vinklar angles likbelägna & alternatvinklar parallel lines nivå 6 level 6"
    },
    {
        "id": "pythagoras:1",
        "topicId": "pythagoras",
        "level": 1,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Pythagoras Sats",
            "en": "Pythagoras"
        },
        "levelDesc": {
            "sv": "Begrepp & Uppställning",
            "en": "Concept & Setup"
        },
        "example": "Vilken sida är hypotenusan i triangeln?",
        "keywords": "pythagoras pythagoras sats pythagoras begrepp & uppställning concept & setup nivå 1 level 1"
    },
    {
        "id": "pythagoras:2",
        "topicId": "pythagoras",
        "level": 2,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Pythagoras Sats",
            "en": "Pythagoras"
        },
        "levelDesc": {
            "sv": "Beräkna Hypotenusan",
            "en": "Find Hypotenuse"
        },
        "example": "Beräkna hypotenusans längd c.",
        "keywords": "pythagoras pythagoras sats pythagoras beräkna hypotenusan find hypotenuse nivå 2 level 2"
    },
    {
        "id": "pythagoras:3",
        "topicId": "pythagoras",
        "level": 3,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Pythagoras Sats",
            "en": "Pythagoras"
        },
        "levelDesc": {
            "sv": "Beräkna Kateten",
            "en": "Find Leg"
        },
        "example": "Hypotenusan är 13 och den ena kateten är 12. Beräkna kateten a.",
        "keywords": "pythagoras pythagoras sats pythagoras beräkna kateten find leg nivå 3 level 3"
    },
    {
        "id": "pythagoras:4",
        "topicId": "pythagoras",
        "level": 4,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Pythagoras Sats",
            "en": "Pythagoras"
        },
        "levelDesc": {
            "sv": "Är den rätvinklig? (Omvänd sats)",
            "en": "Is it Right-Angled? (Converse)"
        },
        "example": "En triangel har sidorna 12 cm, 16 cm och 19 cm. Är den rätvinklig?",
        "keywords": "pythagoras pythagoras sats pythagoras är den rätvinklig? (omvänd sats) is it right-angled? (converse) nivå 4 level 4"
    },
    {
        "id": "pythagoras:5",
        "topicId": "pythagoras",
        "level": 5,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Pythagoras Sats",
            "en": "Pythagoras"
        },
        "levelDesc": {
            "sv": "Avstånd i Koordinatsystem",
            "en": "Distance in Coordinates"
        },
        "example": "Bestäm avståndet d mellan punkterna A(0, 2) och B(6, 10).",
        "keywords": "pythagoras pythagoras sats pythagoras avstånd i koordinatsystem distance in coordinates nivå 5 level 5"
    },
    {
        "id": "pythagoras:6",
        "topicId": "pythagoras",
        "level": 6,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Pythagoras Sats",
            "en": "Pythagoras"
        },
        "levelDesc": {
            "sv": "Sammansatt & Rymddiagonal",
            "en": "Composite & 3D Diagonals"
        },
        "example": "En likbent triangel har basen 10 cm och två sidor på 13 cm vardera. Beräkna triangelns area.",
        "keywords": "pythagoras pythagoras sats pythagoras sammansatt & rymddiagonal composite & 3d diagonals nivå 6 level 6"
    },
    {
        "id": "similarity:1",
        "topicId": "similarity",
        "level": 1,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Likformighet",
            "en": "Similar Shapes"
        },
        "levelDesc": {
            "sv": "Är de likformiga?",
            "en": "Are they similar?"
        },
        "example": "Avgör om de två rektanglarna nedan är likformiga (perfekta kopior).",
        "keywords": "similarity likformighet similar shapes är de likformiga? are they similar? nivå 1 level 1"
    },
    {
        "id": "similarity:2",
        "topicId": "similarity",
        "level": 2,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Likformighet",
            "en": "Similar Shapes"
        },
        "levelDesc": {
            "sv": "Beräkna sida (Enkel)",
            "en": "Calc Side (Simple)"
        },
        "example": "Beräkna den saknade sidan x i de likformiga figurerna.",
        "keywords": "similarity likformighet similar shapes beräkna sida (enkel) calc side (simple) nivå 2 level 2"
    },
    {
        "id": "similarity:3",
        "topicId": "similarity",
        "level": 3,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Likformighet",
            "en": "Similar Shapes"
        },
        "levelDesc": {
            "sv": "Topptriangelsatsen",
            "en": "Top Triangle Theorem"
        },
        "example": "Beräkna längden på basen x med hjälp av likformighet.",
        "keywords": "similarity likformighet similar shapes topptriangelsatsen top triangle theorem nivå 3 level 3"
    },
    {
        "id": "similarity:4",
        "topicId": "similarity",
        "level": 4,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Likformighet",
            "en": "Similar Shapes"
        },
        "levelDesc": {
            "sv": "Blandad (1-3)",
            "en": "Mixed (1-3)"
        },
        "example": "Beräkna längden på basen x med hjälp av likformighet.",
        "keywords": "similarity likformighet similar shapes blandad (1-3) mixed (1-3) nivå 4 level 4"
    },
    {
        "id": "scale:1",
        "topicId": "scale",
        "level": 1,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Begrepp & Skalriktning",
            "en": "Concepts & Direction"
        },
        "example": "Anger skalan 2:1 en förstoring eller en förminskning?",
        "keywords": "scale skala scale begrepp & skalriktning concepts & direction nivå 1 level 1"
    },
    {
        "id": "scale:2",
        "topicId": "scale",
        "level": 2,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Förminskning (Verklig längd)",
            "en": "Reduction (Real Length)"
        },
        "example": "En ritning har skalan 1:50. En sträcka på ritningen är 2 cm. Hur lång är sträckan i verkligheten? Svara i centimeter.",
        "keywords": "scale skala scale förminskning (verklig längd) reduction (real length) nivå 2 level 2"
    },
    {
        "id": "scale:3",
        "topicId": "scale",
        "level": 3,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Förstoring (Bildens mått)",
            "en": "Enlargement (Image Size)"
        },
        "example": "Ett litet föremål är 7 mm i verkligheten. Hur långt blir föremålet på en bild i skala 6:1? Svara i millimeter.",
        "keywords": "scale skala scale förstoring (bildens mått) enlargement (image size) nivå 3 level 3"
    },
    {
        "id": "scale:4",
        "topicId": "scale",
        "level": 4,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Bestäm Skalan",
            "en": "Determine Scale"
        },
        "example": "En sträcka är 20 m i verkligheten och 4 cm på en ritning. Vilken skala är ritningen ritad i? (Svara som 1:...)",
        "keywords": "scale skala scale bestäm skalan determine scale nivå 4 level 4"
    },
    {
        "id": "scale:5",
        "topicId": "scale",
        "level": 5,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Likformiga Trianglar",
            "en": "Similar Triangles"
        },
        "example": "De två rätvinkliga trianglarna nedan är likformiga. Beräkna längden på sidan som är markerad med x.",
        "keywords": "scale skala scale likformiga trianglar similar triangles nivå 5 level 5"
    },
    {
        "id": "scale:6",
        "topicId": "scale",
        "level": 6,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Topptriangelsatsen",
            "en": "Triangle Proportionality"
        },
        "example": "Den horisontella transversalen är parallell med basen. Enligt topptriangelsatsen är den lilla topptriangeln likformig med hela triangeln. Beräkna x.",
        "keywords": "scale skala scale topptriangelsatsen triangle proportionality nivå 6 level 6"
    },
    {
        "id": "scale:7",
        "topicId": "scale",
        "level": 7,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Areaskala & Omvänd Areaskala",
            "en": "Area Scale & Inverse"
        },
        "example": "Två likformiga rektanglar har längdskalan 1:10. Den mindre rektangeln har arean 20 cm². Beräkna arean av den större rektangeln.",
        "keywords": "scale skala scale areaskala & omvänd areaskala area scale & inverse nivå 7 level 7"
    },
    {
        "id": "scale:8",
        "topicId": "scale",
        "level": 8,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Skala",
            "en": "Scale"
        },
        "levelDesc": {
            "sv": "Volymskala & Omvänd Volymskala",
            "en": "Volume Scale & Inverse"
        },
        "example": "Två likformiga cylindrar har längdskalan 1:2. Den mindre rymmer 15 liter. Hur många liter rymmer den större cylindern?",
        "keywords": "scale skala scale volymskala & omvänd volymskala volume scale & inverse nivå 8 level 8"
    },
    {
        "id": "volume:1",
        "topicId": "volume",
        "level": 1,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Rätblock & Kub",
            "en": "Cuboid & Cube"
        },
        "example": "Beräkna rätblockets volym.",
        "keywords": "volume volym volume rätblock & kub cuboid & cube nivå 1 level 1"
    },
    {
        "id": "volume:2",
        "topicId": "volume",
        "level": 2,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Prisma",
            "en": "Prism"
        },
        "example": "Beräkna volymen for det triangulära prismat.",
        "keywords": "volume volym volume prisma prism nivå 2 level 2"
    },
    {
        "id": "volume:3",
        "topicId": "volume",
        "level": 3,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Cylinder",
            "en": "Cylinder"
        },
        "example": "Beräkna cylinderns volym ($\\pi \\approx 3,14$).",
        "keywords": "volume volym volume cylinder cylinder nivå 3 level 3"
    },
    {
        "id": "volume:4",
        "topicId": "volume",
        "level": 4,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Pyramid & Kon",
            "en": "Pyramid & Cone"
        },
        "example": "Pyramiden har en kvadratisk basyta. Beräkna pyramidens volym.",
        "keywords": "volume volym volume pyramid & kon pyramid & cone nivå 4 level 4"
    },
    {
        "id": "volume:5",
        "topicId": "volume",
        "level": 5,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Klot & Sammansatta",
            "en": "Sphere & Composite"
        },
        "example": "Beräkna klotets volym med radien 7 cm.",
        "keywords": "volume volym volume klot & sammansatta sphere & composite nivå 5 level 5"
    },
    {
        "id": "volume:6",
        "topicId": "volume",
        "level": 6,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Blandade Volymer",
            "en": "Mixed Volumes"
        },
        "example": "Pyramiden har en kvadratisk basyta. Beräkna pyramidens volym.",
        "keywords": "volume volym volume blandade volymer mixed volumes nivå 6 level 6"
    },
    {
        "id": "volume:7",
        "topicId": "volume",
        "level": 7,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Enhetsomvandling",
            "en": "Unit Conversion"
        },
        "example": "En pool har formen av ett rätblock med bredden 10 cm, höjden 5 cm och djupet 4 cm. Vad är dess volym i liter?",
        "keywords": "volume volym volume enhetsomvandling unit conversion nivå 7 level 7"
    },
    {
        "id": "volume:8",
        "topicId": "volume",
        "level": 8,
        "category": "geometry",
        "categoryLabel": {
            "sv": "Geometri",
            "en": "Geometry"
        },
        "topicLabel": {
            "sv": "Volym",
            "en": "Volume"
        },
        "levelDesc": {
            "sv": "Begränsningsyta",
            "en": "Surface Area"
        },
        "example": "Beräkna rätblockets ytarea (arean av alla sex sidor sammanlagt).",
        "keywords": "volume volym volume begränsningsyta surface area nivå 8 level 8"
    },
    {
        "id": "statistics:1",
        "topicId": "statistics",
        "level": 1,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Statistik",
            "en": "Statistics"
        },
        "levelDesc": {
            "sv": "Typvärde & Variationsbredd",
            "en": "Mode & Range"
        },
        "example": "Kolla igenom åldrar listan: 12, 14, 11, 13, 11, 11, 12. Vilket är typvärdet?",
        "keywords": "statistics statistik statistics typvärde & variationsbredd mode & range nivå 1 level 1"
    },
    {
        "id": "statistics:2",
        "topicId": "statistics",
        "level": 2,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Statistik",
            "en": "Statistics"
        },
        "levelDesc": {
            "sv": "Medelvärde",
            "en": "Mean"
        },
        "example": "Beräkna medelvärdet för följande poäng: 24, 23, 10, 12, 24.",
        "keywords": "statistics statistik statistics medelvärde mean nivå 2 level 2"
    },
    {
        "id": "statistics:3",
        "topicId": "statistics",
        "level": 3,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Statistik",
            "en": "Statistics"
        },
        "levelDesc": {
            "sv": "Median",
            "en": "Median"
        },
        "example": "Bestäm medianen för följande temperaturer: 22, 17, 22, 15, 13.",
        "keywords": "statistics statistik statistics median median nivå 3 level 3"
    },
    {
        "id": "statistics:4",
        "topicId": "statistics",
        "level": 4,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Statistik",
            "en": "Statistics"
        },
        "levelDesc": {
            "sv": "Baklänges medelvärde",
            "en": "Reverse Mean"
        },
        "example": "Medelvärdet av fyra tal är 13. Tre av talen är 8, 17 och 13. Vilket är det fjärde talet?",
        "keywords": "statistics statistik statistics baklänges medelvärde reverse mean nivå 4 level 4"
    },
    {
        "id": "statistics:5",
        "topicId": "statistics",
        "level": 5,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Statistik",
            "en": "Statistics"
        },
        "levelDesc": {
            "sv": "Tabell och Diagram",
            "en": "Tables and Graphs"
        },
        "example": "Hur många observationer (totalt antal) visas i frekvenstabellen?",
        "keywords": "statistics statistik statistics tabell och diagram tables and graphs nivå 5 level 5"
    },
    {
        "id": "statistics:6",
        "topicId": "statistics",
        "level": 6,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Statistik",
            "en": "Statistics"
        },
        "levelDesc": {
            "sv": "Blandade begrepp",
            "en": "Mixed Concepts"
        },
        "example": "Du köper 2 kg äpplen för 20 kr/kg och 3 kg till av en annan sort. Medelpriset blir 26 kr/kg. Vad kostade den andra sorten per kg?",
        "keywords": "statistics statistik statistics blandade begrepp mixed concepts nivå 6 level 6"
    },
    {
        "id": "probability:1",
        "topicId": "probability",
        "level": 1,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "Sannolikhetsskalan & Visuella utfall",
            "en": "Probability Scale & Visual Outcomes"
        },
        "example": "Hur sannolikt är det: \"att få krona när du kastar ett vanligt mynt\"?",
        "keywords": "probability sannolikhet probability sannolikhetsskalan & visuella utfall probability scale & visual outcomes nivå 1 level 1"
    },
    {
        "id": "probability:2",
        "topicId": "probability",
        "level": 2,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "De tre uttrycksformerna (Bråk, Decimal, %)",
            "en": "The Three Forms (Fraction, Decimal, %)"
        },
        "example": "Sannolikheten för en vinst i ett lotteri är 2/5. Vad är sannolikheten uttryckt i procent?",
        "keywords": "probability sannolikhet probability de tre uttrycksformerna (bråk, decimal, %) the three forms (fraction, decimal, %) nivå 2 level 2"
    },
    {
        "id": "probability:3",
        "topicId": "probability",
        "level": 3,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "Likformiga utfall (Tärning & Kortlek)",
            "en": "Uniform Outcomes (Dice & Card Deck)"
        },
        "example": "Vad är sannolikheten att få en 4:a vid ett kast med en vanlig sexsidig tärning? Svar med bråk i enklaste form.",
        "keywords": "probability sannolikhet probability likformiga utfall (tärning & kortlek) uniform outcomes (dice & card deck) nivå 3 level 3"
    },
    {
        "id": "probability:4",
        "topicId": "probability",
        "level": 4,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "Komplementhändelse (INTE och ELLER)",
            "en": "Complementary Events (NOT and OR)"
        },
        "example": "Chansen att vinna i ett lotteri är 45%. Vad är sannolikheten att man INTE vinner?",
        "keywords": "probability sannolikhet probability komplementhändelse (inte och eller) complementary events (not and or) nivå 4 level 4"
    },
    {
        "id": "probability:5",
        "topicId": "probability",
        "level": 5,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "Kombinatorik & Multiplikationsprincipen",
            "en": "Combinatorics & Multiplication Principle"
        },
        "example": "En restaurangmeny erbjuder 5 förrätter, 5 varmrätter och 4 efterrätter. På hur många olika sätt kan du komponera en trerättersmiddag?",
        "keywords": "probability sannolikhet probability kombinatorik & multiplikationsprincipen combinatorics & multiplication principle nivå 5 level 5"
    },
    {
        "id": "probability:6",
        "topicId": "probability",
        "level": 6,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "Flerstegsförsök – Med återläggning",
            "en": "Multi-Stage – With Replacement"
        },
        "example": "Du kastar ett mynt 3 gånger. Vad är sannolikheten att få krona alla 3 gånger? Svar med bråk i enklaste form.",
        "keywords": "probability sannolikhet probability flerstegsförsök – med återläggning multi-stage – with replacement nivå 6 level 6"
    },
    {
        "id": "probability:7",
        "topicId": "probability",
        "level": 7,
        "category": "statistics",
        "categoryLabel": {
            "sv": "Sannolikhet & Statistik",
            "en": "Probability & Statistics"
        },
        "topicLabel": {
            "sv": "Sannolikhet",
            "en": "Probability"
        },
        "levelDesc": {
            "sv": "Flerstegsförsök – Utan återläggning & Träd",
            "en": "Multi-Stage – Without Replacement & Trees"
        },
        "example": "I en påse finns 4 röda och 6 blåa kulor. Du drar två kulor utan återläggning. Vad är sannolikheten att få en röd först och sedan en blå? Svar med bråk i enklaste form.",
        "keywords": "probability sannolikhet probability flerstegsförsök – utan återläggning & träd multi-stage – without replacement & trees nivå 7 level 7"
    }
];

/**
 * Returns the ordered prerequisite chain (upstream -> target) for a given topic & level.
 * Ideal for TeacherHubManager "Auto-Fill Prerequisites" and student detour routing.
 */
export function getPrerequisiteChain(topicId, level, maxDepth = 4) {
    const targetId = `${topicId}:${level}`;
    const visited = new Set();
    const ordered = [];

    function visit(nodeId, depth) {
        if (!SKILL_GRAPH[nodeId] || visited.has(nodeId) || depth > maxDepth) return;
        visited.add(nodeId);
        for (const prereqId of SKILL_GRAPH[nodeId].prerequisites) {
            visit(prereqId, depth + 1);
        }
        ordered.push(SKILL_GRAPH[nodeId]);
    }

    visit(targetId, 0);
    return ordered;
}
