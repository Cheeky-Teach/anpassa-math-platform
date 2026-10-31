// src/core/utils/stories/probability.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

// =========================================================================
// 🎯 1. PROB COMPLEMENT PCT (Context: prob_complement_pct)
// Placeholders: {pWin}
// =========================================================================
const PROB_COMPLEMENT_PCT: StoryScenario[] = [
    {
        id: "prob_comp_rain",
        sv: "Väderappen visar att risken för regn under helgens utomhuskonsert är {pWin}%. Vad är sannolikheten i procent att det INTE regnar?",
        en: "The weather app shows that the chance of rain during this weekend's outdoor concert is {pWin}%. What is the percentage probability that it will NOT rain?",
        rules: { minResult: 0, maxResult: 100 }
    },
    {
        id: "prob_comp_bus_delayed",
        sv: "Ett bussbolag anger att {pWin}% av alla turer blir försenade under vintern. Vad är sannolikheten i procent att en buss avgår helt i tid?",
        en: "A bus company states that {pWin}% of all trips are delayed during winter. What is the percentage probability that a bus departs completely on time?",
        rules: { minResult: 0, maxResult: 100 }
    },
    {
        id: "prob_comp_game_upgrade",
        sv: "I ett mobilspel är risken {pWin}% att en uppgradering av ett föremål misslyckas. Vad är chansen i procent att uppgraderingen lyckas?",
        en: "In a mobile game, there is a {pWin}% risk that an item upgrade fails. What is the percentage chance that the upgrade succeeds?",
        rules: { minResult: 0, maxResult: 100 }
    },
    {
        id: "prob_comp_cloud_sync",
        sv: "En molntjänst anger att risken för att en filsynkning avbryts är {pWin}%. Vad är sannolikheten i procent att filerna synkas utan problem?",
        en: "A cloud service states that the risk of a file sync breaking is {pWin}%. What is the percentage probability that the files sync without any issues?",
        rules: { minResult: 0, maxResult: 100 }
    },
    {
        id: "prob_comp_free_throws",
        sv: "En basketspelare har en träffsäkerhet på {pWin}% på sina straffkast. Vad är sannolikheten i procent att hon missar sitt nästa straffkast?",
        en: "A basketball player has an accuracy of {pWin}% on her free throws. What is the percentage probability that she misses her next free throw?",
        rules: { minResult: 0, maxResult: 100 }
    },
    {
        id: "prob_comp_spam_filter",
        sv: "Ett program har ett filter som flaggar {pWin}% av alla inkommande meddelanden som skräppost. Vad är sannolikheten i procent att ett vanligt meddelande slipper igenom utan att flaggas?",
        en: "A program has a filter that flags {pWin}% of all incoming messages as spam. What is the percentage probability that a regular message gets through without being flagged?",
        rules: { minResult: 0, maxResult: 100 }
    },
    {
        id: "prob_comp_lootbox_rare",
        sv: "Chansen att du hittar ett sällsynt föremål i en digital lootbox är {pWin}%. Vad är sannolikheten i procent att du INTE får det sällsynta föremålet?",
        en: "The chance of finding a rare item in a digital loot box is {pWin}%. What is the percentage probability that you do NOT get the rare item?",
        rules: { minResult: 0, maxResult: 100 }
    },
    {
        id: "prob_comp_battery_life",
        sv: "Risken att batteriet i din trådlösa handkontroll tar slut under nästa spelsession är {pWin}%. Vad är sannolikheten i procent att batteriet räcker hela sessionen?",
        en: "The risk of your wireless controller battery running out during the next gaming session is {pWin}%. What is the percentage probability that the battery lasts the entire session?",
        rules: { minResult: 0, maxResult: 100 }
    }
];

// =========================================================================
// 🎯 2. PROB DICE PARITY (Context: prob_dice_parity)
// Placeholders: {label}
// =========================================================================
const PROB_DICE_PARITY: StoryScenario[] = [
    {
        id: "prob_dp_board_game",
        sv: "Du spelar ett brädspel där du måste slå ett {label} tal med en sexsidig tärning för att få flytta din spelpjäs. Vad är sannolikheten att du får flytta pjäsen på nästa kast? Ange svaret som ett förkortat bråk.",
        en: "You are playing a board game where you must roll an {label} number with a six-sided die to move your game piece. What is the probability that you get to move your piece on the next toss? Provide the answer as a fraction in simplest form."
    },
    {
        id: "prob_dp_presentation_order",
        sv: "En klass ska utse vilken grupp som börjar redovisningen genom att slå en tärning. Om tärningen visar ett {label} tal får grupp 1 starta. Vad är sannolikheten att grupp 1 får starta? Ange svaret som ett förkortat bråk.",
        en: "A class decides which group starts presentations by rolling a die. If the die shows an {label} number, group 1 starts. What is the probability that group 1 gets to start? Provide the answer as a fraction in simplest form."
    },
    {
        id: "prob_dp_battle_knockout",
        sv: "I ett strategispel måste du slå ett {label} tal på en sexsidig tärning för att besegra motståndarens riddare. Hur stor är sannolikheten att du lyckas? Ange svaret som ett förkortat bråk.",
        en: "In a strategy game, you must roll an {label} number on a six-sided die to defeat the opponent's knight. What is the probability that you succeed? Provide the answer as a fraction in simplest form."
    },
    {
        id: "prob_dp_cleaning_turn",
        sv: "För att avgöra vem som tar ut soporna kastar Sam en sexsidig tärning. Ett {label} tal innebär att Sam måste göra det. Vad är sannolikheten att Sam slipper? Ange svaret som ett förkortat bråk.",
        en: "To decide who takes out the trash, Sam rolls a six-sided die. An {label} number means Sam has to do it. What is the probability that Sam avoids it? Provide the answer as a fraction in simplest form."
    }
];

// =========================================================================
// 🎯 3. DISCRETE POOL (Context: discrete_pool)
// Placeholders: {match}, {total}
// =========================================================================
const DISCRETE_POOL_STORIES: StoryScenario[] = [
    {
        id: "prob_pool_marbles_jar",
        sv: "I en glasburk ligger det totalt {total} kulor, varav {match} är vinstkulor. Du plockar en kula slumpmässigt utan att titta. Vad är sannolikheten att du drar en vinstkula? Ange svaret som ett förkortat bråk.",
        en: "In a glass jar there are {total} marbles in total, of which {match} are winning marbles. You pick one marble at random without looking. What is the probability of picking a winning marble? Provide the answer as a fraction in simplest form.",
        rules: { integerOnly: ['match', 'total'], greaterThan: ['total', 'match'] }
    },
    {
        id: "prob_pool_lottery_tickets",
        sv: "I en lottkorg finns det {total} lotter kvar. Exakt {match} av lotterna ger vinst. Om du köper en lott, vad är sannolikheten att du vinner? Ange svaret som ett förkortat bråk.",
        en: "In a raffle drum there are {total} tickets left. Exactly {match} of the tickets are winning tickets. If you buy one ticket, what is the probability that you win? Provide the answer as a fraction in simplest form.",
        rules: { integerOnly: ['match', 'total'], greaterThan: ['total', 'match'] }
    },
    {
        id: "prob_pool_colored_socks",
        sv: "I en byrålåda ligger {total} strumpor blandade. Exakt {match} av dem är svarta. Vad är sannolikheten att du drar en svart strumpa i mörkret? Ange svaret som ett förkortat bråk.",
        en: "In a drawer there are {total} mixed socks. Exactly {match} of them are black. What is the probability of picking a black sock in the dark? Provide the answer as a fraction in simplest form.",
        rules: { integerOnly: ['match', 'total'], greaterThan: ['total', 'match'] }
    },
    {
        id: "prob_pool_fruit_basket",
        sv: "I en fruktkorg ligger det totalt {total} frukter, varav {match} är äpplen. Du tar en frukt på måfå. Vad är sannolikheten att det blir ett äpple? Ange svaret som ett förkortat bråk.",
        en: "In a fruit basket there are {total} fruits in total, of which {match} are apples. You take a fruit at random. What is the probability that it is an apple? Provide the answer as a fraction in simplest form.",
        rules: { integerOnly: ['match', 'total'], greaterThan: ['total', 'match'] }
    },
    {
        id: "prob_pool_gaming_cards",
        sv: "En korthög består av totalt {total} samlarkort. Av dessa är {match} sällsynta holografiska kort. Om du drar det översta kortet, vad är sannolikheten att det är holografiskt? Ange svaret som ett förkortat bråk.",
        en: "A deck consists of {total} collectible cards. Of these, {match} are rare holographic cards. If you draw the top card, what is the probability that it is holographic? Provide the answer as a fraction in simplest form.",
        rules: { integerOnly: ['match', 'total'], greaterThan: ['total', 'match'] }
    },
    {
        id: "prob_pool_cupcakes_tray",
        sv: "På ett kalasfat står det {total} muffins, varav {match} har chokladglasyr. Du väljer en muffins utan att titta. Vad är sannolikheten att få en med chokladglasyr? Ange svaret som ett förkortat bråk.",
        en: "On a party tray there are {total} cupcakes, of which {match} have chocolate frosting. You choose a cupcake without looking. What is the probability of getting one with chocolate frosting? Provide the answer as a fraction in simplest form.",
        rules: { integerOnly: ['match', 'total'], greaterThan: ['total', 'match'] }
    }
];

// =========================================================================
// 🎯 4. PROB COMBINATORICS (Context: prob_combinatorics)
// Placeholders: {c1}, {c2}, {c3}
// =========================================================================
const PROB_COMBINATORICS: StoryScenario[] = [
    {
        id: "prob_comb_skateboard",
        sv: "En skateboardbutik låter dig bygga en egen bräda. Du kan välja mellan {c1} olika brädor, {c2} sorters truckar och {c3} olika hjulfärger. Hur många unika skateboards kan du sätta ihop?",
        en: "A skate shop lets you build a custom board. You can choose from {c1} different decks, {c2} types of trucks, and {c3} wheel colors. How many unique skateboards can you assemble?",
        rules: { integerOnly: ['c1', 'c2', 'c3'] }
    },
    {
        id: "prob_comb_lunch_special",
        sv: "En restaurang erbjuder en lunchmeny där du väljer mellan {c1} förrätter, {c2} varmrätter och {c3} drycker. På hur många olika sätt kan du kombinera din lunchmåltid?",
        en: "A restaurant offers a lunch special where you pick from {c1} appetizers, {c2} main courses, and {c3} beverages. In how many different ways can you combine your meal?",
        rules: { integerOnly: ['c1', 'c2', 'c3'] }
    },
    {
        id: "prob_comb_avatar_builder",
        sv: "När du skapar en spelkaraktär kan du välja mellan {c1} frisyrer, {c2} jackor och {c3} par skor. På hur många unika sätt kan din karaktär se ut?",
        en: "When creating a game character, you can choose between {c1} hairstyles, {c2} jackets, and {c3} pairs of shoes. In how many unique ways can your character look?",
        rules: { integerOnly: ['c1', 'c2', 'c3'] }
    },
    {
        id: "prob_comb_ice_cream_cone",
        sv: "En glasstårta kan anpassas med {c1} olika bottnar, {c2} olika glassmaker och {c3} olika strössel. Hur många unika glasstårtor går det att beställa?",
        en: "An ice cream cake can be customized with {c1} base crusts, {c2} ice cream flavors, and {c3} toppings. How many unique ice cream cakes can be ordered?",
        rules: { integerOnly: ['c1', 'c2', 'c3'] }
    }
];

// =========================================================================
// 🎯 5. PROB TWO-STAGE DEPENDENT (Context: prob_two_stage_dependent)
// Placeholders: {r}, {b}, {total}
// =========================================================================
const PROB_TWO_STAGE_DEPENDENT: StoryScenario[] = [
    {
        id: "prob_dep_socks_morning",
        sv: "I en låda ligger {r} röda och {b} blåa strumpor. Du drar två strumpor i mörkret utan återläggning. Vad är sannolikheten att du först får en röd och sedan en blå strumpa? Ange svaret som ett förkortat bråk.",
        en: "In a drawer there are {r} red and {b} blue socks. You pull two socks in the dark without replacement. What is the probability that you first get a red and then a blue sock? Provide the answer as a fraction in simplest form.",
        rules: { integerOnly: ['r', 'b', 'total'] }
    },
    {
        id: "prob_dep_committee_draw",
        sv: "I en förening finns {r} juniorer och {b} seniorer. Två representanter ska väljas ut slumpmässigt efter varandra. Vad är sannolikheten att en junior dras först och därefter en senior? Ange svaret som ett förkortat bråk.",
        en: "In a club there are {r} juniors and {b} seniors. Two delegates are selected at random one after another. What is the probability that a junior is picked first and then a senior? Provide the answer as a fraction in simplest form.",
        rules: { integerOnly: ['r', 'b', 'total'] }
    },
    {
        id: "prob_dep_tournament_tickets",
        sv: "I ett kuvert ligger {r} guldpass och {b} silverpass till en e-sportturnering. Två kompisar drar varsitt pass utan återläggning. Vad är sannolikheten att den första personen får ett guldpass och den andra ett silverpass? Ange svaret som ett förkortat bråk.",
        en: "In an envelope there are {r} gold passes and {b} silver passes to an esports event. Two friends draw one pass each without replacement. What is the probability that the first person gets a gold pass and the second gets a silver pass? Provide the answer as a fraction in simplest form.",
        rules: { integerOnly: ['r', 'b', 'total'] }
    }
];

export const PROBABILITY_STORIES: Record<string, StoryScenario[]> = {
    prob_complement_pct: PROB_COMPLEMENT_PCT,
    prob_dice_parity: PROB_DICE_PARITY,
    discrete_pool: DISCRETE_POOL_STORIES,
    prob_combinatorics: PROB_COMBINATORICS,
    prob_two_stage_dependent: PROB_TWO_STAGE_DEPENDENT
};