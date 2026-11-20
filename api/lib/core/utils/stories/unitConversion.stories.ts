// src/core/utils/stories/unitConversion.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

const LENGTH_TO_M: Record<string, number> = { km: 1000, m: 1, dm: 0.1, cm: 0.01, mm: 0.001 };
const WEIGHT_TO_G: Record<string, number> = { ton: 1_000_000, kg: 1000, hg: 100, g: 1, mg: 0.001 };
const VOLUME_TO_ML: Record<string, number> = { l: 1000, dl: 100, cl: 10, ml: 1 };

interface UnitBoundOptions {
    table: Record<string, number>;
    minBase: number;
    maxBase: number;
    allowedFrom?: string[];
    allowedTo?: string[];
}

const makeUnitRule = (opts: UnitBoundOptions) => (params: Record<string, any>): boolean => {
    const val = parseFloat(String(params.val).replace(',', '.'));
    const from = String(params.fromUnit);
    const to = String(params.toUnit);

    if (Number.isNaN(val)) return false;
    if (opts.allowedFrom && !opts.allowedFrom.includes(from)) return false;
    if (opts.allowedTo && !opts.allowedTo.includes(to)) return false;

    const baseVal = val * (opts.table[from] ?? 1);
    return baseVal >= opts.minBase && baseVal <= opts.maxBase;
};

// =========================================================================
// 📏 1. LENGTH CONVERSION (18 Everyday Stories)
// =========================================================================
const LENGTH_STORIES: StoryScenario[] = [
    // --- Universal Safe Fallbacks (Always valid, everyday language) ---
    {
        id: "uc_len_univ_string",
        sv: "Ett snöre är {val} {fromUnit} långt. Hur många {toUnit} är snöret?",
        en: "A piece of string is {val} {fromUnit} long. How many {toUnit} is the string?"
    },
    {
        id: "uc_len_univ_ribbon",
        sv: "Ett presentband är {val} {fromUnit} långt. Skriv om längden till {toUnit}.",
        en: "A gift ribbon is {val} {fromUnit} long. Convert the length into {toUnit}."
    },
    {
        id: "uc_len_univ_tape",
        sv: "Du mäter en sträcka med ett måttband och får den till {val} {fromUnit}. Hur många {toUnit} motsvarar det?",
        en: "You measure a distance with a tape measure and get {val} {fromUnit}. How many {toUnit} does that equal?"
    },
    {
        id: "uc_len_univ_yarn",
        sv: "En bit garn till ett pyssel är {val} {fromUnit} lång. Vad blir längden i {toUnit}?",
        en: "A piece of yarn for a craft project is {val} {fromUnit} long. What is the length in {toUnit}?"
    },

    // --- Tiny Objects (5 mm – 12 cm) ---
    {
        id: "uc_len_micro_screw",
        sv: "En skruv i slöjdsalen är {val} {fromUnit} lång. Hur många {toUnit} är skruven?",
        en: "A screw in woodshop class is {val} {fromUnit} long. How many {toUnit} is the screw?",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 0.005, maxBase: 0.12, allowedFrom: ['cm', 'mm'], allowedTo: ['cm', 'mm'] }) }
    },
    {
        id: "uc_len_micro_coin",
        sv: "Ett mynt är {val} {fromUnit} brett. Vad blir bredden i {toUnit}?",
        en: "A coin is {val} {fromUnit} wide. What is the width in {toUnit}?",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 0.012, maxBase: 0.04, allowedFrom: ['cm', 'mm'], allowedTo: ['cm', 'mm'] }) }
    },
    {
        id: "uc_len_micro_book_thick",
        sv: "En mattebok är {val} {fromUnit} tjock. Hur många {toUnit} tjock är boken?",
        en: "A math book is {val} {fromUnit} thick. How many {toUnit} thick is the book?",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 0.008, maxBase: 0.08, allowedFrom: ['cm', 'mm'], allowedTo: ['cm', 'mm'] }) }
    },
    {
        id: "uc_len_micro_eraser",
        sv: "Ett suddgummi är {val} {fromUnit} långt. Skriv om längden till {toUnit}.",
        en: "An eraser is {val} {fromUnit} long. Convert the length into {toUnit}.",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 0.02, maxBase: 0.09, allowedFrom: ['cm', 'mm'], allowedTo: ['cm', 'mm'] }) }
    },
    {
        id: "uc_len_micro_key",
        sv: "En nyckel är {val} {fromUnit} lång. Hur lång är nyckeln i {toUnit}?",
        en: "A key is {val} {fromUnit} long. How long is the key in {toUnit}?",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 0.03, maxBase: 0.12, allowedFrom: ['dm', 'cm', 'mm'], allowedTo: ['dm', 'cm', 'mm'] }) }
    },

    // --- Handheld & Desk Objects (10 cm – 1.2 m) ---
    {
        id: "uc_len_small_tablet",
        sv: "Bredden på en surfplatta är {val} {fromUnit}. Vad blir måttet i {toUnit}?",
        en: "The width of a tablet is {val} {fromUnit}. What is the measurement in {toUnit}?",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 0.12, maxBase: 0.4, allowedFrom: ['dm', 'cm', 'mm'], allowedTo: ['dm', 'cm', 'mm'] }) }
    },
    {
        id: "uc_len_small_ruler",
        sv: "En linjal i pennskrinet är {val} {fromUnit} lång. Hur många {toUnit} motsvarar det?",
        en: "A ruler in a pencil case is {val} {fromUnit} long. How many {toUnit} does that equal?",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 0.15, maxBase: 0.5, allowedFrom: ['dm', 'cm', 'mm'], allowedTo: ['dm', 'cm', 'mm'] }) }
    },
    {
        id: "uc_len_small_plant",
        sv: "En blomma i fönstret har vuxit till höjden {val} {fromUnit}. Ange höjden i {toUnit}.",
        en: "A flower by the window has grown to a height of {val} {fromUnit}. State the height in {toUnit}.",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 0.1, maxBase: 1.2, allowedFrom: ['m', 'dm', 'cm'], allowedTo: ['m', 'dm', 'cm'] }) }
    },

    // --- Everyday Room, Yard & Sports Distances (1 m – 100 m) ---
    {
        id: "uc_len_med_plank",
        sv: "En planka till en trädkoja är {val} {fromUnit} lång. Hur många {toUnit} motsvarar det?",
        en: "A wooden board for a treehouse is {val} {fromUnit} long. How many {toUnit} does that correspond to?",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 0.8, maxBase: 6, allowedFrom: ['m', 'dm', 'cm'], allowedTo: ['m', 'dm', 'cm'] }) }
    },
    {
        id: "uc_len_med_jump_rope",
        sv: "Ett hopprep på idrotten är {val} {fromUnit} långt. Hur många {toUnit} är repet?",
        en: "A jump rope in gym class is {val} {fromUnit} long. How many {toUnit} is the rope?",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 1.8, maxBase: 5, allowedFrom: ['m', 'dm', 'cm'], allowedTo: ['m', 'dm', 'cm'] }) }
    },
    {
        id: "uc_len_med_wall",
        sv: "En vägg i ett klassrum är {val} {fromUnit} lång. Hur många {toUnit} är väggen?",
        en: "A wall in a classroom is {val} {fromUnit} long. How many {toUnit} is the wall?",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 3, maxBase: 20, allowedFrom: ['m', 'dm', 'cm'], allowedTo: ['m', 'dm', 'cm'] }) }
    },
    {
        id: "uc_len_med_pool",
        sv: "En simbassäng i simhallen är {val} {fromUnit} lång. Skriv om längden till {toUnit}.",
        en: "A swimming pool is {val} {fromUnit} long. Convert the length into {toUnit}.",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 10, maxBase: 100, allowedFrom: ['km', 'm', 'dm'], allowedTo: ['km', 'm', 'dm'] }) }
    },

    // --- Long Distances (300 m – 50 km) ---
    {
        id: "uc_len_long_track",
        sv: "En löparslinga i skogen är {val} {fromUnit} lång. Hur många {toUnit} är slingan?",
        en: "A running track in the forest is {val} {fromUnit} long. How many {toUnit} is the track?",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 400, maxBase: 50_000, allowedFrom: ['km', 'm'], allowedTo: ['km', 'm'] }) }
    },
    {
        id: "uc_len_long_bike_ride",
        sv: "Du cyklar {val} {fromUnit} till skolan. Hur många {toUnit} är cykelvägen?",
        en: "You ride your bike {val} {fromUnit} to school. How many {toUnit} is the bike route?",
        rules: { custom: makeUnitRule({ table: LENGTH_TO_M, minBase: 300, maxBase: 40_000, allowedFrom: ['km', 'm'], allowedTo: ['km', 'm'] }) }
    }
];

// =========================================================================
// ⚖️ 2. WEIGHT CONVERSION (18 Everyday Stories)
// =========================================================================
const WEIGHT_STORIES: StoryScenario[] = [
    // --- Universal Safe Fallbacks ---
    {
        id: "uc_wgt_univ_parcel",
        sv: "Ett paket som ska skickas med posten väger {val} {fromUnit}. Vad blir vikten i {toUnit}?",
        en: "A parcel to be sent by mail weighs {val} {fromUnit}. What is the weight in {toUnit}?"
    },
    {
        id: "uc_wgt_univ_bag",
        sv: "En tygkasse med saker väger {val} {fromUnit}. Ange vikten i {toUnit}.",
        en: "A tote bag full of items weighs {val} {fromUnit}. State the weight in {toUnit}."
    },
    {
        id: "uc_wgt_univ_box",
        sv: "En kartong i förrådet väger {val} {fromUnit}. Skriv om vikten till {toUnit}.",
        en: "A cardboard box in the storage room weighs {val} {fromUnit}. Convert the weight into {toUnit}."
    },
    {
        id: "uc_wgt_univ_basket",
        sv: "En korg full med varor väger {val} {fromUnit}. Hur många {toUnit} motsvarar det?",
        en: "A basket full of groceries weighs {val} {fromUnit}. How many {toUnit} does that correspond to?"
    },

    // --- Tiny / Very Light (10 mg – 100 g) ---
    {
        id: "uc_wgt_micro_vitamin",
        sv: "En vitamintablett väger {val} {fromUnit}. Hur många {toUnit} är det?",
        en: "A vitamin tablet weighs {val} {fromUnit}. How many {toUnit} is that?",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 0.01, maxBase: 5, allowedFrom: ['g', 'mg'], allowedTo: ['g', 'mg'] }) }
    },
    {
        id: "uc_wgt_micro_paperclip",
        sv: "Ett gem på skrivbordet väger {val} {fromUnit}. Vad blir gemets vikt i {toUnit}?",
        en: "A paperclip on the desk weighs {val} {fromUnit}. What is the paperclip's weight in {toUnit}?",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 0.2, maxBase: 10, allowedFrom: ['g', 'mg'], allowedTo: ['g', 'mg'] }) }
    },
    {
        id: "uc_wgt_micro_ring",
        sv: "En guldring väger {val} {fromUnit}. Ange ringens vikt i {toUnit}.",
        en: "A gold ring weighs {val} {fromUnit}. State the ring's weight in {toUnit}.",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 2, maxBase: 40, allowedFrom: ['hg', 'g', 'mg'], allowedTo: ['hg', 'g', 'mg'] }) }
    },
    {
        id: "uc_wgt_micro_spice",
        sv: "Till en gryta behövs {val} {fromUnit} kryddor. Hur många {toUnit} kryddor är det?",
        en: "A stew needs {val} {fromUnit} of spices. How many {toUnit} of spices is that?",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 1, maxBase: 100, allowedFrom: ['hg', 'g', 'mg'], allowedTo: ['hg', 'g', 'mg'] }) }
    },

    // --- Kitchen & Groceries (50 g – 8 kg) ---
    {
        id: "uc_wgt_food_chocolate",
        sv: "En chokladkaka väger {val} {fromUnit}. Skriv om chokladkakans vikt till {toUnit}.",
        en: "A chocolate bar weighs {val} {fromUnit}. Convert the chocolate bar's weight into {toUnit}.",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 50, maxBase: 500, allowedFrom: ['kg', 'hg', 'g'], allowedTo: ['kg', 'hg', 'g'] }) }
    },
    {
        id: "uc_wgt_food_candy",
        sv: "Du köper en påse lösgodis som väger {val} {fromUnit}. Hur mycket väger godiset i {toUnit}?",
        en: "You buy a bag of pick-and-mix candy weighing {val} {fromUnit}. How much does the candy weigh in {toUnit}?",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 80, maxBase: 2500, allowedFrom: ['kg', 'hg', 'g'], allowedTo: ['kg', 'hg', 'g'] }) }
    },
    {
        id: "uc_wgt_food_flour",
        sv: "Till ett brödbak väger du upp {val} {fromUnit} mjöl. Hur mycket väger mjölet i {toUnit}?",
        en: "For baking bread, you measure out {val} {fromUnit} of flour. How much does the flour weigh in {toUnit}?",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 100, maxBase: 5000, allowedFrom: ['kg', 'hg', 'g'], allowedTo: ['kg', 'hg', 'g'] }) }
    },
    {
        id: "uc_wgt_food_apples",
        sv: "En påse med äpplen i mataffären väger {val} {fromUnit}. Vad blir vikten i {toUnit}?",
        en: "A bag of apples at the grocery store weighs {val} {fromUnit}. What is the weight in {toUnit}?",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 300, maxBase: 8000, allowedFrom: ['kg', 'hg', 'g'], allowedTo: ['kg', 'hg', 'g'] }) }
    },

    // --- Everyday Gear & Pets (1 kg – 75 kg) ---
    {
        id: "uc_wgt_gear_dumbbell",
        sv: "En hantel på gymmet väger {val} {fromUnit}. Hur många {toUnit} motsvarar det?",
        en: "A dumbbell at the gym weighs {val} {fromUnit}. How many {toUnit} does that correspond to?",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 1000, maxBase: 50_000, allowedFrom: ['kg', 'hg', 'g'], allowedTo: ['kg', 'hg', 'g'] }) }
    },
    {
        id: "uc_wgt_gear_backpack",
        sv: "En packad ryggsäck väger {val} {fromUnit}. Hur många {toUnit} väger ryggsäcken?",
        en: "A packed backpack weighs {val} {fromUnit}. How many {toUnit} does the backpack weigh?",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 2000, maxBase: 35_000, allowedFrom: ['kg', 'hg', 'g'], allowedTo: ['kg', 'hg', 'g'] }) }
    },
    {
        id: "uc_wgt_pet_dog",
        sv: "Hos veterinären väger en hund {val} {fromUnit}. Vad är hundens vikt i {toUnit}?",
        en: "At the vet clinic, a dog weighs {val} {fromUnit}. What is the dog's weight in {toUnit}?",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 2000, maxBase: 75_000, allowedFrom: ['kg', 'hg', 'g'], allowedTo: ['kg', 'hg', 'g'] }) }
    },

    // --- Heavy Vehicles & Loads (800 kg – 500 ton) ---
    {
        id: "uc_wgt_heavy_car",
        sv: "En personbil väger {val} {fromUnit}. Hur många {toUnit} väger bilen?",
        en: "A family car weighs {val} {fromUnit}. How many {toUnit} does the car weigh?",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 800_000, maxBase: 3_500_000, allowedFrom: ['ton', 'kg'], allowedTo: ['ton', 'kg'] }) }
    },
    {
        id: "uc_wgt_heavy_truck",
        sv: "En lastbil med släp väger {val} {fromUnit}. Skriv om vikten till {toUnit}.",
        en: "A truck with a trailer weighs {val} {fromUnit}. Convert the weight into {toUnit}.",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 5_000_000, maxBase: 60_000_000, allowedFrom: ['ton', 'kg'], allowedTo: ['ton', 'kg'] }) }
    },
    {
        id: "uc_wgt_heavy_gravel",
        sv: "Ett lass med sand till en lekplats väger {val} {fromUnit}. Ange vikten i {toUnit}.",
        en: "A load of sand for a playground weighs {val} {fromUnit}. State the weight in {toUnit}.",
        rules: { custom: makeUnitRule({ table: WEIGHT_TO_G, minBase: 1_000_000, maxBase: 500_000_000, allowedFrom: ['ton', 'kg'], allowedTo: ['ton', 'kg'] }) }
    }
];

// =========================================================================
// 🧪 3. VOLUME CONVERSION (18 Everyday Stories)
// =========================================================================
const VOLUME_STORIES: StoryScenario[] = [
    // --- Universal Safe Fallbacks ---
    {
        id: "uc_vol_univ_pitcher",
        sv: "En stor tillbringare fylls med {val} {fromUnit} vatten. Hur många {toUnit} motsvarar det?",
        en: "A large pitcher is filled with {val} {fromUnit} of water. How many {toUnit} does that correspond to?"
    },
    {
        id: "uc_vol_univ_bowl",
        sv: "I en skål finns {val} {fromUnit} saft. Skriv om volymen till {toUnit}.",
        en: "A bowl contains {val} {fromUnit} of juice. Convert the volume into {toUnit}."
    },
    {
        id: "uc_vol_univ_jug",
        sv: "En karaff med vatten rymmer {val} {fromUnit}. Vad blir volymen i {toUnit}?",
        en: "A carafe of water holds {val} {fromUnit}. What is the volume in {toUnit}?"
    },
    {
        id: "uc_vol_univ_canister",
        sv: "En vattendunk rymmer {val} {fromUnit} vatten. Ange volymen i {toUnit}.",
        en: "A water jug holds {val} {fromUnit} of water. State the volume in {toUnit}."
    },

    // --- Tiny Doses (2 ml – 200 ml) ---
    {
        id: "uc_vol_tiny_medicine",
        sv: "En sked hostmedicin är {val} {fromUnit}. Skriv om volymen till {toUnit}.",
        en: "A spoonful of cough medicine is {val} {fromUnit}. Convert the volume into {toUnit}.",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 2, maxBase: 40, allowedFrom: ['cl', 'ml'], allowedTo: ['cl', 'ml'] }) }
    },
    {
        id: "uc_vol_tiny_vanilla",
        sv: "Till en sockerkaka behövs {val} {fromUnit} vaniljsås i smeten. Hur många {toUnit} är det?",
        en: "A cake recipe needs {val} {fromUnit} of flavoring. How many {toUnit} is that?",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 2, maxBase: 50, allowedFrom: ['dl', 'cl', 'ml'], allowedTo: ['dl', 'cl', 'ml'] }) }
    },
    {
        id: "uc_vol_tiny_perfume",
        sv: "En parfymflaska rymmer {val} {fromUnit}. Hur många {toUnit} rymmer flaskan?",
        en: "A perfume bottle holds {val} {fromUnit}. How many {toUnit} does the bottle hold?",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 15, maxBase: 200, allowedFrom: ['dl', 'cl', 'ml'], allowedTo: ['dl', 'cl', 'ml'] }) }
    },

    // --- Glasses, Cans & Cooking (100 ml – 2 l) ---
    {
        id: "uc_vol_med_glass",
        sv: "Ett dricksglas fylls med {val} {fromUnit} saft. Hur många {toUnit} saft är det i glaset?",
        en: "A drinking glass is filled with {val} {fromUnit} of juice. How many {toUnit} of juice are in the glass?",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 100, maxBase: 500, allowedFrom: ['l', 'dl', 'cl', 'ml'], allowedTo: ['l', 'dl', 'cl', 'ml'] }) }
    },
    {
        id: "uc_vol_med_soda_can",
        sv: "En burk läsk rymmer {val} {fromUnit}. Hur många {toUnit} läsk innehåller burken?",
        en: "A can of soda contains {val} {fromUnit}. How many {toUnit} of soda does the can contain?",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 150, maxBase: 500, allowedFrom: ['l', 'dl', 'cl', 'ml'], allowedTo: ['l', 'dl', 'cl', 'ml'] }) }
    },
    {
        id: "uc_vol_med_cream",
        sv: "Till en pastasås tillsätts {val} {fromUnit} grädde. Hur många {toUnit} motsvarar det?",
        en: "For a pasta sauce, {val} {fromUnit} of cream is added. How many {toUnit} does that correspond to?",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 100, maxBase: 1000, allowedFrom: ['l', 'dl', 'cl', 'ml'], allowedTo: ['l', 'dl', 'cl', 'ml'] }) }
    },
    {
        id: "uc_vol_med_bottle",
        sv: "En vattenflaska rymmer {val} {fromUnit}. Hur mycket är det i {toUnit}?",
        en: "A water bottle holds {val} {fromUnit}. How much is that in {toUnit}?",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 300, maxBase: 2000, allowedFrom: ['l', 'dl', 'cl', 'ml'], allowedTo: ['l', 'dl', 'cl', 'ml'] }) }
    },
    {
        id: "uc_vol_med_milk",
        sv: "Ett paket mjölk innehåller {val} {fromUnit}. Ange volymen i {toUnit}.",
        en: "A carton of milk contains {val} {fromUnit}. State the volume in {toUnit}.",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 300, maxBase: 2000, allowedFrom: ['l', 'dl', 'cl', 'ml'], allowedTo: ['l', 'dl', 'cl', 'ml'] }) }
    },

    // --- Pitchers, Buckets & Home Containers (1 l – 400 l) ---
    {
        id: "uc_vol_large_jug",
        sv: "En tillbringare med äppeljuice rymmer {val} {fromUnit}. Vad blir volymen i {toUnit}?",
        en: "A pitcher of apple juice holds {val} {fromUnit}. What is the volume in {toUnit}?",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 1000, maxBase: 5000, allowedFrom: ['l', 'dl', 'cl'], allowedTo: ['l', 'dl', 'cl'] }) }
    },
    {
        id: "uc_vol_large_fuel",
        sv: "Bensintanken på en moped rymmer {val} {fromUnit}. Vad motsvarar det i {toUnit}?",
        en: "The fuel tank on a moped holds {val} {fromUnit}. What does that equal in {toUnit}?",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 3000, maxBase: 15_000, allowedFrom: ['l', 'dl'], allowedTo: ['l', 'dl'] }) }
    },
    {
        id: "uc_vol_large_paint",
        sv: "En hink med målarfärg rymmer {val} {fromUnit}. Ange volymen i {toUnit}.",
        en: "A bucket of paint holds {val} {fromUnit}. State the volume in {toUnit}.",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 2000, maxBase: 25_000, allowedFrom: ['l', 'dl'], allowedTo: ['l', 'dl'] }) }
    },
    {
        id: "uc_vol_large_fishbowl",
        sv: "Ett akvarium fylls med {val} {fromUnit} vatten. Hur många {toUnit} rymmer akvariet?",
        en: "An aquarium is filled with {val} {fromUnit} of water. How many {toUnit} does the aquarium hold?",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 10_000, maxBase: 250_000, allowedFrom: ['l', 'dl'], allowedTo: ['l', 'dl'] }) }
    },
    {
        id: "uc_vol_large_car_tank",
        sv: "Bensintanken i en bil rymmer {val} {fromUnit}. Hur många {toUnit} bensin går det i tanken?",
        en: "The fuel tank in a car holds {val} {fromUnit}. How many {toUnit} of gas fit in the tank?",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 35_000, maxBase: 90_000, allowedFrom: ['l', 'dl'], allowedTo: ['l', 'dl'] }) }
    },
    {
        id: "uc_vol_large_bathtub",
        sv: "Ett badkar fylls med {val} {fromUnit} varmvatten. Vad blir volymen i {toUnit}?",
        en: "A bathtub is filled with {val} {fromUnit} of warm water. What is the volume in {toUnit}?",
        rules: { custom: makeUnitRule({ table: VOLUME_TO_ML, minBase: 100_000, maxBase: 400_000, allowedFrom: ['l', 'dl'], allowedTo: ['l', 'dl'] }) }
    }
];

export const UNIT_CONVERSION_STORIES: Record<string, StoryScenario[]> = {
    units_length: LENGTH_STORIES,
    units_length_dec: LENGTH_STORIES,
    units_weight: WEIGHT_STORIES,
    units_weight_dec: WEIGHT_STORIES,
    units_volume: VOLUME_STORIES,
    units_volume_dec: VOLUME_STORIES
};