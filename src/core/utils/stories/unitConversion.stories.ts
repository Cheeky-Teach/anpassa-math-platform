// src/core/utils/stories/unitConversion.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

// =========================================================================
// 📏 1. LENGTH CONVERSION (Basic & Decimals) - Placeholders: {val}, {fromUnit}, {toUnit}
// =========================================================================
const LENGTH_STORIES: StoryScenario[] = [
    {
        id: "uc_len_woodwork_plank",
        sv: "En planka till ett slöjdprojekt är {val} {fromUnit} lång. Hur många {toUnit} motsvarar det?",
        en: "A wooden board for a craft project is {val} {fromUnit} long. How many {toUnit} does that correspond to?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_len_running_track",
        sv: "En löparslinga i skogen mäter {val} {fromUnit}. Hur lång är sträckan uttryckt i {toUnit}?",
        en: "A running track in the forest measures {val} {fromUnit}. How long is the distance expressed in {toUnit}?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_len_sewing_fabric",
        sv: "Du köper ett tygstycke till en gardin som är {val} {fromUnit} långt. Skriv om längden till {toUnit}.",
        en: "You purchase a piece of fabric for a curtain that is {val} {fromUnit} long. Convert the length into {toUnit}.",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_len_phone_screen",
        sv: "Bredden på en surfplatta är {val} {fromUnit}. Vad blir måttet om du anger det i {toUnit}?",
        en: "The width of a tablet is {val} {fromUnit}. What is the measurement if you specify it in {toUnit}?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_len_room_wall",
        sv: "En vägg i ett klassrum är {val} {fromUnit} bred. Hur många {toUnit} är väggen?",
        en: "A wall in a classroom is {val} {fromUnit} wide. How many {toUnit} is the wall?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_len_jump_rope",
        sv: "Ett hopprep på idrotten är {val} {fromUnit} långt. Hur många {toUnit} är repet?",
        en: "A jump rope in gym class is {val} {fromUnit} long. How many {toUnit} is the rope?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_len_cable_length",
        sv: "En nätverkskabel till datorn har längden {val} {fromUnit}. Ange kabelns längd i {toUnit}.",
        en: "A network cable for a computer has a length of {val} {fromUnit}. State the cable's length in {toUnit}.",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_len_model_train",
        sv: "Ett modelljärnvägsspår mäter {val} {fromUnit}. Vad blir spårets längd i {toUnit}?",
        en: "A model railway track measures {val} {fromUnit}. What is the track length in {toUnit}?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_len_skate_ramp",
        sv: "En ramp i skateparken är {val} {fromUnit} lång. Hur många {toUnit} motsvarar det?",
        en: "A ramp in the skatepark is {val} {fromUnit} long. How many {toUnit} does that equal?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_len_plant_height",
        sv: "En planta i ett växthus har vuxit till {val} {fromUnit}. Skriv om plantans höjd till {toUnit}.",
        en: "A plant in a greenhouse has grown to {val} {fromUnit}. Convert the plant's height into {toUnit}.",
        rules: { minResult: 0.0001 }
    }
];

// =========================================================================
// ⚖️ 2. WEIGHT CONVERSION (Basic & Decimals) - Placeholders: {val}, {fromUnit}, {toUnit}
// =========================================================================
const WEIGHT_STORIES: StoryScenario[] = [
    {
        id: "uc_wgt_baking_flour",
        sv: "Till ett brödbak väger du upp {val} {fromUnit} mjöl. Hur mycket väger mjölet i {toUnit}?",
        en: "For baking bread, you measure out {val} {fromUnit} of flour. How much does the flour weigh in {toUnit}?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_wgt_fruit_bag",
        sv: "En påse med äpplen i mataffären väger {val} {fromUnit}. Vad blir vikten angiven i {toUnit}?",
        en: "A bag of apples at the grocery store weighs {val} {fromUnit}. What is the weight specified in {toUnit}?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_wgt_backpack_load",
        sv: "En vandringsryggsäck är packad och väger {val} {fromUnit}. Hur många {toUnit} väger ryggsäcken?",
        en: "A hiking backpack is packed and weighs {val} {fromUnit}. How many {toUnit} does the backpack weigh?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_wgt_pet_dog",
        sv: "Hos veterinären väger en hund {val} {fromUnit}. Vad är hundens vikt omvandlad till {toUnit}?",
        en: "At the vet clinic, a dog weighs {val} {fromUnit}. What is the dog's weight converted into {toUnit}?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_wgt_candy_bag",
        sv: "Du köper en påse lösgodis som väger {val} {fromUnit}. Hur mycket väger godiset i {toUnit}?",
        en: "You buy a bag of pick-and-mix candy weighing {val} {fromUnit}. How much does the candy weigh in {toUnit}?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_wgt_gold_ring",
        sv: "En guldring i en smyckesbutik har massan {val} {fromUnit}. Ange ringens massa i {toUnit}.",
        en: "A gold ring at a jewelry shop has a mass of {val} {fromUnit}. State the ring's mass in {toUnit}.",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_wgt_shipping_parcel",
        sv: "Ett postpaket som ska skickas väger {val} {fromUnit}. Vad blir paketets vikt uttryckt i {toUnit}?",
        en: "A postal parcel to be shipped weighs {val} {fromUnit}. What is the parcel's weight expressed in {toUnit}?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_wgt_gym_dumbbell",
        sv: "En hantel på gymmet har vikten {val} {fromUnit}. Hur många {toUnit} motsvarar det?",
        en: "A dumbbell at the gym has a weight of {val} {fromUnit}. How many {toUnit} does that correspond to?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_wgt_chocolate_bar",
        sv: "En chokladkaka har nettovikten {val} {fromUnit}. Skriv om chokladkakans vikt till {toUnit}.",
        en: "A chocolate bar has a net weight of {val} {fromUnit}. Convert the chocolate bar's weight into {toUnit}.",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_wgt_copper_wire",
        sv: "En rulle koppartråd har massan {val} {fromUnit}. Hur många {toUnit} väger tråden?",
        en: "A roll of copper wire has a mass of {val} {fromUnit}. How many {toUnit} does the wire weigh?",
        rules: { minResult: 0.0001 }
    }
];

// =========================================================================
// 🧪 3. VOLUME CONVERSION (Basic & Decimals) - Placeholders: {val}, {fromUnit}, {toUnit}
// =========================================================================
const VOLUME_STORIES: StoryScenario[] = [
    {
        id: "uc_vol_water_bottle",
        sv: "En vattenflaska rymmer {val} {fromUnit} dryck. Hur mycket är det i {toUnit}?",
        en: "A water bottle holds {val} {fromUnit} of water. How much is that in {toUnit}?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_vol_milk_carton",
        sv: "Ett paket mjölk innehåller {val} {fromUnit}. Ange volymen i {toUnit}.",
        en: "A carton of milk contains {val} {fromUnit}. State the volume in {toUnit}.",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_vol_cooking_sauce",
        sv: "Till en pastasås tillsätts {val} {fromUnit} grädde. Hur många {toUnit} motsvarar det?",
        en: "For a pasta sauce, {val} {fromUnit} of cream is added. How many {toUnit} does that correspond to?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_vol_juice_jug",
        sv: "En tillbringare med äppeljuice rymmer {val} {fromUnit}. Vad blir volymen i {toUnit}?",
        en: "A pitcher of apple juice holds {val} {fromUnit}. What is the volume in {toUnit}?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_vol_medicine_dose",
        sv: "En dos hostmedicin mäter {val} {fromUnit}. Skriv om volymen till {toUnit}.",
        en: "A dose of cough medicine measures {val} {fromUnit}. Convert the volume into {toUnit}.",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_vol_fishbowl_water",
        sv: "Ett litet akvarium fylls med {val} {fromUnit} vatten. Hur många {toUnit} rymmer akvariet?",
        en: "A small fishbowl is filled with {val} {fromUnit} of water. How many {toUnit} does the bowl hold?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_vol_fuel_tank",
        sv: "Bensintanken på en moped rymmer {val} {fromUnit}. Vad motsvarar det i {toUnit}?",
        en: "The fuel tank on a moped holds {val} {fromUnit}. What does that equal in {toUnit}?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_vol_soda_can",
        sv: "En burk läsk rymmer {val} {fromUnit}. Hur många {toUnit} läsk innehåller burken?",
        en: "A can of soda contains {val} {fromUnit}. How many {toUnit} of soda does the can contain?",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_vol_paint_bucket",
        sv: "En hink med målarfärg innehåller {val} {fromUnit}. Ange färgvolymen i {toUnit}.",
        en: "A bucket of paint contains {val} {fromUnit}. State the paint volume in {toUnit}.",
        rules: { minResult: 0.0001 }
    },
    {
        id: "uc_vol_perfume_bottle",
        sv: "En parfymflaska rymmer {val} {fromUnit} vätska. Hur många {toUnit} är flaskans volym?",
        en: "A perfume bottle holds {val} {fromUnit} of liquid. How many {toUnit} is the bottle's volume?",
        rules: { minResult: 0.0001 }
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