// src/core/utils/stories/negatives.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

export const NEGATIVE_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. NEG ADD SUB CHAIN (Requires placeholders: {valA}, {valB}, {valC}, {valD})
    // =========================================================================
    neg_add_sub_chain: [
        {
            id: "neg_asc_game_points",
            sv: "Du startar med {valA} poäng i ett spel. Du lyckas få {valB} poäng, förlorar sedan {valC} poäng och får till slut {valD} poäng till. Vad blir din slutgiltiga poäng?",
            en: "You start with {valA} points in a game. You manage to gain {valB} points, then lose {valC} points, and finally get another {valD} points. What is your final score?",
            rules: {
                integerOnly: ['valA', 'valB', 'valC', 'valD']
            }
        },
        {
            id: "neg_asc_temp_abisko",
            sv: "Temperaturen i Abisko var {valA} °C på morgonen. Under dagen steg den med {valB} °C, sjönk sedan med {valC} °C och steg till sist med {valD} °C. Vad var temperaturen då?",
            en: "The temperature in Abisko was {valA} °C in the morning. During the day it rose by {valB} °C, then dropped by {valC} °C, and finally rose by {valD} °C. What was the temperature then?"
        },
        {
            id: "neg_asc_elevator_floors",
            sv: "En hiss startar på våning {valA}. Den åker upp {valB} våningar, ner {valC} våningar och åker sedan upp ytterligare {valD} våningar. Vilken våning står hissen på nu?",
            en: "An elevator starts on floor {valA}. It goes up {valB} floors, down {valC} floors, and then goes up another {valD} floors. What floor is the elevator on now?",
            rules: {
                integerOnly: ['valA', 'valB', 'valC', 'valD']
            }
        },
        {
            id: "neg_asc_drone_altitude",
            sv: "En drönare flyger på {valA} meters höjd över marken. Den stiger {valB} meter, sjunker {valC} meter och flyger sedan upp {valD} meter till. Vilken höjd flyger den på nu?",
            en: "A drone flies at an altitude of {valA} meters above the ground. It climbs {valB} meters, drops {valC} meters, and then flies up another {valD} meters. What altitude is it flying at now?"
        },
        {
            id: "neg_asc_bank_account",
            sv: "Du har {valA} kr på ditt konto. Du för över {valB} kr till sparkontot, får tillbaka en utgift på {valC} kr och får sedan en insättning på {valD} kr. Hur mycket har du kvar på kontot?",
            en: "You have {valA} kr in your account. You transfer {valB} kr, get a refund of {valC} kr, and then receive a deposit of {valD} kr. How much do you have left in your account?"
        },
        {
            id: "neg_asc_submarine_depth",
            sv: "En u-båt ligger på {valA} meters djup under havsytan. Den stiger {valB} meter, dyker ner {valC} meter och stiger sedan {valD} meter igen. Vilket djup ligger u-båten på nu?",
            en: "A submarine is at a depth of {valA} meters below sea level. It ascends {valB} meters, dives down {valC} meters, and then ascends {valD} meters again. What depth is the submarine at now?"
        },
        {
            id: "neg_asc_student_company",
            sv: "Ett nystartat UF-företag ligger ute med {valA} kr. De tjänar {valB} kr, betalar {valC} kr för material och får ett bidrag på {valD} kr. Vad är deras aktuella balans?",
            en: "A new student company is at a balance of {valA} kr. They earn {valB} kr, pay {valC} kr for materials, and receive a grant of {valD} kr. What is their current balance?"
        },
        {
            id: "neg_asc_mobile_rank",
            sv: "När du spelar ett mobilspel ligger din karaktär på nivån {valA} i rankning. Du klättrar {valB} steg, halkar ner {valC} steg och klättrar sedan {valD} steg till. Vilken rankning har du nu?",
            en: "When playing a mobile game, your character is at rank level {valA}. You climb {valB} steps, slip down {valC} steps, and then climb another {valD} steps. What rank do you have now?",
            rules: {
                integerOnly: ['valA', 'valB', 'valC', 'valD']
            }
        },
        {
            id: "neg_asc_pool_water_level",
            sv: "Vattennivån i en pool låg på {valA} cm från kanten. Efter ett kraftigt regn steg nivån med {valB} cm, sedan avdunstade {valC} cm i solen och till sist fyllde man på med {valD} cm. Vad är nivån nu?",
            en: "The water level in a pool was {valA} cm from the edge. After heavy rain the level rose by {valB} cm, then {valC} cm evaporated in the sun, and finally {valD} cm was added. What is the level now?"
        },
        {
            id: "neg_asc_minigolf_score",
            sv: "Leo spelar minigolf. På första hålet ligger han på {valA} slag jämfört med banans par. På nästa hål får han +{valB} slag, sen -{valC} slag och till sist +{valD} slag. Vad är hans totala resultat?",
            en: "Leo is playing minigolf. On the first hole he is at {valA} shots compared to par. On the next holes he gets +{valB} shots, then -{valC} shots, and finally +{valD} shots. What is his total score?",
            rules: {
                integerOnly: ['valA', 'valB', 'valC', 'valD']
            }
        },
        {
            id: "neg_asc_climbing_wall",
            sv: "En klättervägg har markeringar i höjdled. Du startar på {valA} meter, klättrar upp {valB} meter, firar ner dig {valC} meter och tar ett sista kliv upp på {valD} meter. Var är du nu?",
            en: "A climbing wall has height markings. You start at {valA} meters, climb up {valB} meters, rappel down {valC} meters, and take a final step up of {valD} meters. Where are you now?"
        },
        {
            id: "neg_asc_tiktok_followers",
            sv: "Ett TikTok-konto hade nettoförändringen {valA} följare i måndags. På tisdagen ökade det med {valB} följare, på onsdagen tappade kontot {valC} följare och på torsdagen ökade det med {valD}. Vad är veckans förändring?",
            en: "A TikTok account had a net change of {valA} followers on Monday. On Tuesday it increased by {valB} followers, on Wednesday it lost {valC}, and on Thursday it increased by {valD}. What is the week's change?",
            rules: {
                integerOnly: ['valA', 'valB', 'valC', 'valD']
            }
        },
        {
            id: "neg_asc_greenhouse_temp",
            sv: "Temperaturen i ett växthus startar på {valA} °C. När fläkten stängs av stiger den med {valB} °C, när solen går i moln sjunker den med {valC} °C och när värmen slås på stiger den med {valD} °C. Vad är temperaturen nu?",
            en: "The temperature in a greenhouse starts at {valA} °C. When the fan stops it rises by {valB} °C, when the sun goes behind a cloud it drops by {valC} °C, and when the heat turns on it rises by {valD} °C. What is it now?"
        },
        {
            id: "neg_asc_boardgame_penalties",
            sv: "I ett brädspel ligger du på {valA} straffpoäng. Du tjänar tillbaka {valB} poäng, drar ett kort som ger dig {valC} straffpoäng, och vinner sedan {valD} poäng. Vad är din status nu?",
            en: "In a board game you are at {valA} penalty points. You earn back {valB} points, draw a card giving you {valC} penalty points, and then win {valD} points. What is your status now?",
            rules: {
                integerOnly: ['valA', 'valB', 'valC', 'valD']
            }
        },
        {
            id: "neg_asc_game_tokens_jar",
            sv: "Ett gäng kompisar har en gemensam burk med speltokens. De startar på en skuld av {valA} tokens. De vinner {valB} stycken, förlorar {valC} stycken i en match och köper sedan till {valD} stycken. Vad är saldot nu?",
            en: "A group of friends has a shared token jar starting at a debt of {valA}. They win {valB}, lose {valC} in a match, and then purchase {valD} more. What is the balance now?",
            rules: {
                integerOnly: ['valA', 'valB', 'valC', 'valD']
            }
        }
    ],

    // =========================================================================
    // 🎯 2. NEG DOUBLE MINUS (Requires placeholders: {valA}, {valB})
    // =========================================================================
    neg_double_minus: [
        {
            id: "neg_dm_freezer_element",
            sv: "Temperaturen i en frysbox var {valA} °C. Forskaren stänger av ett extra kylelement som drog ner värmen med minus {valB} °C. Vad blir temperaturen nu?",
            en: "The temperature in a freezer was {valA} °C. The researcher turns off an extra cooling element that dropped the heat by minus {valB} °C. What is the temperature now?"
        },
        {
            id: "neg_dm_online_penalty_erased",
            sv: "Du spelar ett onlinespel och ligger på {valA} poäng. Efter en granskning raderar systemet bort en gammal straffavgift på minus {valB} poäng. Vad blir din nya poäng?",
            en: "You are playing an online game and are at {valA} points. After a review, the system erases a previous penalty of minus {valB} points. What is your new score?",
            rules: {
                integerOnly: ['valA', 'valB']
            }
        },
        {
            id: "neg_dm_altimeter_depth",
            sv: "En digital höjdmätare på en dykarklocka visar {valA} meter under havsytan. Du tar bort ett felaktigt djupavdrag på minus {valB} meter. Vilket värde visas på klockan nu?",
            en: "A digital altimeter on a diving watch shows {valA} meters below sea level. You remove an incorrect depth deduction of minus {valB} meters. What value is shown on the watch now?"
        },
        {
            id: "neg_dm_math_app_subtract",
            sv: "Ett startvärde i ett matteprogram är inställt på {valA}. Du ska nu subtrahera det negativa talet minus {valB} från startvärdet. Vilket svar får du?",
            en: "A starting value in a math app is set to {valA}. You are now going to subtract the negative number minus {valB} from the starting value. What answer do you get?"
        },
        {
            id: "neg_dm_gaming_account_charge",
            sv: "Nils har ett saldo på {valA} kr på sitt spelkonto. Kundtjänst tar bort en felaktig minuspost på minus {valB} kr från kontot. Vad blir hans nya saldo?",
            en: "Nils has a balance of {valA} kr on his gaming account. Customer service removes an incorrect negative charge of minus {valB} kr from the account. What is his new balance?"
        },
        {
            id: "neg_dm_physics_cold_factor",
            sv: "I en fiktiv fysikutmaning startar en mätare på {valA} grader. Du ska minska detta värde med köldfaktorn minus {valB} grader. Vad stannar mätaren på?",
            en: "In a fictional physics challenge, a gauge starts at {valA} degrees. You need to decrease this value by the cold factor of minus {valB} degrees. What does the gauge stop at?"
        },
        {
            id: "neg_dm_soccer_goal_diff",
            sv: "Ett fotbollslag har {valA} i målskillnad. Förbundet inser att de har räknat fel och tar bort ett gammalt avdrag på minus {valB} mål. Vad blir lagets nya målskillnad?",
            en: "A soccer team has a goal difference of {valA}. The league realizes a mistake and removes a previous deduction of minus {valB} goals. What is the team's new goal difference?",
            rules: {
                integerOnly: ['valA', 'valB']
            }
        },
        {
            id: "neg_dm_school_debt_forgiven",
            sv: "Du har hamnat på {valA} kr på ditt skolkonto efter att ha lånat pengar. Skolan bestämmer sig för att efterskänka en skuld på minus {valB} kr. Vad blir din nya balans?",
            en: "You ended up at {valA} kr on your school account after borrowing money. The school decides to forgive a debt of minus {valB} kr. What is your new balance?"
        },
        {
            id: "neg_dm_space_course_modifier",
            sv: "Ett rymdspel mäter din kursavvikelse till {valA} km. Du rensar bort en negativ systemmodifikation på minus {valB} km. Vilket avstånd visas på skärmen nu?",
            en: "A space game measures your course deviation at {valA} km. You clear a negative system modifier of minus {valB} km. What distance is shown on the screen now?"
        },
        {
            id: "neg_dm_lab_ice_factor",
            sv: "En kemisk lösning håller temperaturen {valA} °C i ett labb. Forskaren programmerar om maskinen för att subtrahera en isfaktor på minus {valB} °C. Vad blir den nya temperaturen?",
            en: "A chemical solution maintains a temperature of {valA} °C in a lab. The scientist reprograms the machine to subtract an ice factor of minus {valB} °C. What is the new temperature?"
        },
        {
            id: "neg_dm_leaderboard_deduction",
            sv: "En gamer har {valA} poäng på en global topplista. Spelets moderatorer stryker ett felaktigt minusavdrag på minus {valB} poäng. Vad blir spelarens nya poängsumma?",
            en: "A gamer has {valA} points on a global leaderboard. The game's moderators strike off an incorrect negative deduction of minus {valB} points. What is the player's new score?",
            rules: {
                integerOnly: ['valA', 'valB']
            }
        },
        {
            id: "neg_dm_test_tank_level",
            sv: "Vattennivån i en testtank visar ett felvärde på {valA} cm. Teknikern nollställer en felmarginal som sänkte mätaren med minus {valB} cm. Vilken nivå visar tanken nu?",
            en: "The water level in a test tank shows an error value of {valA} cm. The technician resets an error margin that lowered the gauge by minus {valB} cm. What level does the tank show now?"
        },
        {
            id: "neg_dm_script_subtract_negative",
            sv: "Du har skrivit ett skript som ger startvärdet {valA}. Skriptet ska sedan göra en beräkning där det drar ifrån det negativa värdet minus {valB}. Vad returnerar skriptet?",
            en: "You wrote a script that gives a starting value of {valA}. The script will then perform a calculation where it subtracts the negative value minus {valB}. What does it return?"
        },
        {
            id: "neg_dm_fairplay_penalty_lifted",
            sv: "Ett lags fairplay-konto står på {valA} poäng efter några varningar. Domaren väljer att upphäva en tidigare utdömd straffpoäng på minus {valB} poäng. Vad blir lagets nya poäng?",
            en: "A team's fair-play account stands at {valA} points after a few warnings. The referee chooses to lift a previously issued penalty of minus {valB} points. What is their new score?",
            rules: {
                integerOnly: ['valA', 'valB']
            }
        },
        {
            id: "neg_dm_battery_test_block",
            sv: "Ett batteritest startar på laddningsvärdet {valA}. Programmet plockar därefter bort en inbyggd spärr på minus {valB}. Vilket värde registrerar testet efter rensningen?",
            en: "A battery test starts at a charge value of {valA}. The program then removes a built-in block of minus {valB}. What value does the test register after clearing?"
        }
    ],

    // =========================================================================
    // 🎯 3. NEG MULTIPLICATION (Requires placeholders: {valA}, {valB})
    // =========================================================================
    neg_multiplication: [
        {
            id: "neg_mult_arcade_rounds",
            sv: "Din poäng i ett arkadspel ändras med {valA} poäng varje spelrunda. Vad är den totala förändringen efter {valB} spelrundor?",
            en: "Your score in an arcade game changes by {valA} points each round. What is the total change after {valB} rounds?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_mult_walkin_freezer",
            sv: "Temperaturen i ett frysrum ändras med {valA} °C varje timme. Vad är den totala temperaturändringen efter {valB} timmar?",
            en: "The temperature in a walk-in freezer changes by {valA} °C every hour. What is the total temperature change after {valB} hours?"
        },
        {
            id: "neg_mult_drone_altitude_rate",
            sv: "En liten forskningsdrönare justerar sin höjd så att den ändras med {valA} meter varje minut. Vilken blir den totala höjdförändringen efter {valB} minuter?",
            en: "A small research drone adjusts its altitude so that it changes by {valA} meters every minute. What will the total altitude change be after {valB} minutes?"
        },
        {
            id: "neg_mult_phone_battery_drain",
            sv: "Ett gammalt mobilbatteri förlorar ström och ändrar sin laddning med {valA}% varje timme. Hur mycket har batterinivån ändrats totalt efter {valB} timmar?",
            en: "An old mobile battery loses power and changes its charge by {valA}% every hour. How much has the battery level changed in total after {valB} hours?"
        },
        {
            id: "neg_mult_esports_penalties",
            sv: "Ett e-sportlag får ett straff på {valA} poäng för varje regelbrott. Hur mycket ändras lagets poäng totalt efter {valB} regelbrott?",
            en: "An e-sports team gets a penalty of {valA} points for each rule violation. How much does their score change in total after {valB} violations?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_mult_submarine_docking",
            sv: "En u-båt håller på att docka och ändrar sitt djup med {valA} meter varje minut. Vilken blir den totala förändringen efter {valB} minuters dockning?",
            en: "A submarine is docking and changes its depth by {valA} meters every minute. What will the total change be after {valB} minutes of docking?"
        },
        {
            id: "neg_mult_server_rent_fee",
            sv: "Ett gäng kompisar hyr en server ihop, vilket ändrar ditt saldo på kontot med {valA} kr varje månad. Vad är den totala förändringen på ditt konto efter {valB} månader?",
            en: "A group of friends rents a server together, which changes your account balance by {valA} kr each month. What is the total change on your account after {valB} months?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_mult_project_operating_costs",
            sv: "Ett techbolag har en driftskostnad på ett projekt, vilket ändrar deras resultat med {valA} miljoner kr per kvartal. Vad är den totala förändringen efter {valB} kvartal?",
            en: "A tech company has an operating cost on a project, changing their financial result by {valA} million kr per quarter. What is the total change after {valB} quarters?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_mult_game_obstacle_time",
            sv: "Du har skapat ett spel där deltagarnas tid ändras med {valA} sekunder för varje gång de nuddar ett hinder. Hur mycket ändras tiden totalt om en spelare krockar {valB} gånger?",
            en: "You created a game where players' time changes by {valA} seconds every time they touch an obstacle. How much does the time change in total if a player crashes {valB} times?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_mult_lake_water_level",
            sv: "Vattennivån i en sjö ändras med {valA} cm varje dygn. Vilken blir den totala nivåförändringen efter {valB} dygn?",
            en: "The water level in a lake changes by {valA} cm each day. What will the total level change be after {valB} days?"
        },
        {
            id: "neg_mult_streaming_subscriber_deviation",
            sv: "Ett streamingkonto får en daglig avvikelse som ändrar antalet prenumeranter med {valA} personer varje dag. Vad är den totala förändringen efter {valB} dagar?",
            en: "A streaming account experiences a daily deviation that changes the subscriber count by {valA} people each day. What is the total change after {valB} days?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_mult_cooler_bag_temp",
            sv: "En kylväska förlorar effekt i solen. Temperaturen inuti väskan ändras med {valA} °C per minut. Vad är den totala ändringen efter {valB} minuter?",
            en: "A cooler bag loses efficiency in the sun. The temperature inside the bag changes by {valA} °C per minute. What is the total change after {valB} minutes?"
        },
        {
            id: "neg_mult_instagram_follower_bug",
            sv: "Ett instagramkonto råkar ut för en bugg som gör att antalet följare ändras med {valA} personer per timme. Vad blir den totala förändringen efter {valB} timmar?",
            en: "An Instagram account suffers from a bug that causes the follower count to change by {valA} people per hour. What will the total change be after {valB} hours?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_mult_factory_machine_rate",
            sv: "En automatisk maskin i en fabrik slits ut och ändrar sin produktionstakt med {valA} enheter per vecka. Hur mycket har takten ändrats totalt efter {valB} veckor?",
            en: "An automatic machine in a factory wears down and changes its production rate by {valA} units per week. How much has the rate changed in total after {valB} weeks?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_mult_magazine_subscription_cost",
            sv: "Du prenumererar på ett månadsmagasin via mobilen, vilket ändrar dina sparpengar med {valA} kr varje månad. Vad är den totala förändringen efter {valB} månader?",
            en: "You subscribe to a monthly mobile magazine, which changes your savings by {valA} kr each month. What is the total change after {valB} months?",
            rules: {
                integerOnly: ['valB']
            }
        }
    ],

    // =========================================================================
    // 🎯 4. NEG MULT CHAIN (Requires placeholders: {valA}, {valB}, {valC})
    // =========================================================================
    neg_mult_chain: [
        {
            id: "neg_mc_loop_scaling",
            sv: "Ta startvärdet {valA} i en programmeringsloop. Multiplicera det med {valB} och multiplicera sedan resultatet med {valC}. Vad blir det slutgiltiga värdet?",
            en: "Take the starting value {valA} in a programming loop. Multiply it by {valB} and then multiply the result by {valC}. What is the final value?"
        },
        {
            id: "neg_mc_math_algorithm",
            sv: "Ett tal i en matematisk algoritm startar på {valA}. Det multipliceras först med faktorn {valB} och sedan med faktorn {valC}. Vilket tal får du då?",
            en: "A number in a mathematical algorithm starts at {valA}. It is multiplied first by the factor {valB} and then by the factor {valC}. What number do you get then?"
        },
        {
            id: "neg_mc_vector_scale",
            sv: "I ett grafikprogram skalas en vektor utifrån startvärdet {valA}. Programmet multiplicerar värdet med {valB} och sedan med {valC}. Vad blir slutresultatet?",
            en: "In a graphics program, a vector is scaled based on the starting value {valA}. The program multiplies the value by {valB} and then by {valC}. What is the final result?"
        },
        {
            id: "neg_mc_simulated_temp",
            sv: "En simulerad temperatur mäter startvärdet {valA} grader. Under en trestegsberäkning multipliceras det med {valB} och därefter med {valC}. Vad stannar simulationen på?",
            en: "A simulated temperature measures a starting value of {valA} degrees. During a three-step calculation, it is multiplied by {valB} and then by {valC}. What does the simulation stop at?"
        },
        {
            id: "neg_mc_strategy_portals",
            sv: "Ett konto i ett strategispel har balansfaktorn {valA}. Du passerar två portaler som multiplicerar faktorn med {valB} respektive {valC}. Vad blir din nya balansfaktor?",
            en: "An account in a strategy game has a balance factor of {valA}. You pass through two portals that multiply the factor by {valB} and {valC} respectively. What is your new balance factor?"
        },
        {
            id: "neg_mc_onscreen_chain",
            sv: "Ta värdet {valA} på skärmen. Kör en multiplikationskedja där du först gångrar med {valB} och sedan gångrar resultatet med {valC}. Vad blir svaret?",
            en: "Take the value {valA} on the screen. Run a multiplication chain where you first multiply by {valB} and then multiply the result by {valC}. What is the answer?"
        },
        {
            id: "neg_mc_script_variable",
            sv: "En scriptvariabel är satt till {valA}. Genomfölj två automatiska beräkningar där variabeln multipliceras med {valB} och sedan med {valC}. Vad blir slutvärdet?",
            en: "A script variable is set to {valA}. Follow two automatic calculations where the variable is multiplied by {valB} and then by {valC}. What is the final value?"
        },
        {
            id: "neg_mc_game_combo_score",
            sv: "Ett poängsystem i en spelkod utgår från {valA}. Om en spelare gör en Combo multipliceras poängen med {valB} och sedan med {valC}. Vad blir den uppdaterade poängen?",
            en: "A scoring system in a game code starts at {valA}. If a player hits a Combo, the score is multiplied by {valB} and then by {valC}. What is the updated score?"
        },
        {
            id: "neg_mc_physics_filters",
            sv: "En mätpunkt i ett fysiktest visar {valA}. Värdet passerar två digitala filter som multiplicerar det med {valB} och sedan med {valC}. Vad registrerar datorn till slut?",
            en: "A measurement point in a physics test shows {valA}. The value passes through two digital filters that multiply it by {valB} and then by {valC}. What does the computer register in the end?"
        },
        {
            id: "neg_mc_sequence_generator",
            sv: "Ett starttal i en talföljdsgenerator är inställt på {valA}. Generatorn är programmerad att multiplicera talet med {valB} och sedan med {valC}. Vad blir resultatet?",
            en: "A starting number in a sequence generator is set to {valA}. The generator is programmed to multiply the number by {valB} and then by {valC}. What is the result?"
        },
        {
            id: "neg_mc_calculator_input",
            sv: "Du matar in värdet {valA} i en miniräknare. Du trycker på multiplikation med {valB} och direkt efteråt på multiplikation med {valC}. Vad står det på skärmen?",
            en: "You input the value {valA} into a calculator. You press multiplication by {valB} and immediately after press multiplication by {valC}. What is displayed on the screen?"
        },
        {
            id: "neg_mc_signal_strength",
            sv: "En signalstyrka har ett initialt värde på {valA}. En algoritm multiplicerar styrkan med faktorn {valB} och sedan med {valC}. Vad blir det slutgiltiga utdatavärdet?",
            en: "A signal strength has an initial value of {valA}. An algorithm multiplies the strength by the factor {valB} and then by {valC}. What is the final output value?"
        },
        {
            id: "neg_mc_database_scaling",
            sv: "I en databas är en skalningsparameter satt till {valA}. Systemet uppdaterar parametern genom att multiplicera den med {valB} och sedan med {valC}. Vad blir det nya parametervärdet?",
            en: "In a database, a scaling parameter is set to {valA}. The system updates the parameter by multiplying it by {valB} and then by {valC}. What is the new parameter value?"
        },
        {
            id: "neg_mc_math_game_challenge",
            sv: "Ett mattespel genererar utmaningen att multiplicera {valA} med {valB} och sedan multiplicera produkten med {valC}. Vilket svar måste du skriva in för att vinna?",
            en: "A math game generates the challenge to multiply {valA} by {valB} and then multiply the product by {valC}. What answer must you type in to win?"
        },
        {
            id: "neg_mc_compression_baseline",
            sv: "En algoritm för komprimering utgår från basvärdet {valA}. Koden multipliceras med {valB} och sedan med {valC}. Vad returnerar verktyget?",
            en: "An algorithm for compression starts from the baseline value {valA}. The code is multiplied by {valB} and then by {valC}. What does the tool return?"
        }
    ],

    // =========================================================================
    // 🎯 5. NEG DIVISION (Requires placeholders: {valA}, {valB})
    // =========================================================================
    neg_division: [
        {
            id: "neg_div_team_penalty_split",
            sv: "Ett kompisgäng spelar ett onlinespel och deras lag får totalt {valA} poäng i straffavgift efter en runda. Avgiften delas helt lika på de {valB} spelarna. Hur mycket ändras poängen för varje enskild spelare?",
            en: "A group of friends plays an online game and their team gets a total of {valA} penalty points after a round. The penalty is split equally among the {valB} players. How much does the score change for each individual player?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_div_arcade_score_avg",
            sv: "Ett spelsaldo på en gemensam arkadmaskin har ändrats med totalt {valA} poäng under {valB} spelrundor. Hur stor blev förändringen per runda om den var exakt lika stor varje gång?",
            en: "A gaming balance on a shared arcade machine changed by a total of {valA} points over {valB} rounds. How large was the change per round if it was exactly the same each time?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_div_shared_savings_fees",
            sv: "Ett gemensamt sparkonto för ett kompisgäng har ändrats med totalt {valA} kr under {valB} veckor på grund av serveravgifter. Hur stor är förändringen i genomsnitt per vecka?",
            en: "A shared savings account for a group of friends changed by a total of {valA} kr over {valB} weeks due to server fees. What is the average change per week?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_div_lab_temp_hourly",
            sv: "Temperaturen i ett laboratorium ändrades med totalt {valA} °C under {valB} timmar. Hur stor var temperaturförändringen i genomsnitt per timme?",
            en: "The temperature in a laboratory changed by a total of {valA} °C over {valB} hours. What was the average temperature change per hour?"
        },
        {
            id: "neg_div_drone_altimeter_rate",
            sv: "En digital höjdmätare på en drönare ändrade sitt läge med totalt {valA} meter under {valB} minuter. Hur många meter rörde den sig i genomsnitt per minut?",
            en: "A digital altimeter on a drone changed its position by a total of {valA} meters over {valB} minutes. How many meters did it move on average per minute?"
        },
        {
            id: "neg_div_ice_block_melting",
            sv: "Ett stort isblock i ett experiment har smält så att dess tjocklek har ändrats med totalt {valA} mm under {valB} timmar. Hur stor har förändringen varit i genomsnitt per timme?",
            en: "A large ice block in an experiment melted so that its thickness changed by a total of {valA} mm over {valB} hours. What was the average change per hour?"
        },
        {
            id: "neg_div_student_company_monthly",
            sv: "Ett UF-företag har noterat en ekonomisk saldoändring på totalt {valA} kr under {valB} månader. Hur stor har den månatliga ekonomiska förändringen varit i snitt?",
            en: "A student company has noted an economic balance change totaling {valA} kr over {valB} months. What has been the average monthly financial change?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_div_social_follower_rate",
            sv: "En testprofil på sociala medier uppmätte en total följarförändring på {valA} personer under {valB} dagar. Vad var förändringen i snitt per dag?",
            en: "A test profile on social media measured a total follower change of {valA} people over {valB} days. What was the average change per day?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_div_powerbank_hourly_drain",
            sv: "Laddningen i en powerbank ändrades med totalt {valA} mAh under {valB} timmar. Hur stor var förändringen i genomsnitt per timme?",
            en: "The charge in a power bank changed by a total of {valA} mAh over {valB} hours. What was the average change per hour?"
        },
        {
            id: "neg_div_shared_cash_split",
            sv: "Ett gäng på {valB} personer delar helt lika på en gemensam utgift som ändrade deras samlade kassa med {valA} kr. Hur mycket ändras saldot för varje person?",
            en: "A group of {valB} people splits a shared expense equally, which changed their collective cash by {valA} kr. How much does the balance change for each person?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_div_clan_player_decay",
            sv: "Ett datorspel raderade automatiskt inaktiva konton. Totalt ändrades antalet spelare i en klan med {valA} personer under {valB} veckor. Vad var förändringen i snitt per vecka?",
            en: "A computer game automatically deleted inactive accounts. In total, the number of players in a clan changed by {valA} people over {valB} weeks. What was the average change per week?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_div_moped_oil_leak",
            sv: "Oljenivån i en mopedmotor ändrades med totalt {valA} ml under {valB} dagar. Hur stor var läckageförändringen i genomsnitt per dag?",
            en: "The oil level in a moped engine changed by a total of {valA} ml over {valB} days. What was the leakage change on average per day?"
        },
        {
            id: "neg_div_drive_cleanup_rate",
            sv: "En lagringsenhet rensades på gamla filer, vilket ändrade det använda utrymmet med {valA} GB under {valB} minuter. Hur stort var dataavdraget i snitt per minut?",
            en: "A storage drive was cleared of old files, changing the used space by {valA} GB over {valB} minutes. What was the data deduction on average per minute?"
        },
        {
            id: "neg_div_tournament_deduction_split",
            sv: "Ett gäng vänner fick ett samlat poängavdrag på {valA} poäng i en turnering. Avdraget ska fördelas helt jämnt mellan de {valB} lagmedlemmarna. Vilken poängförändring får varje medlem?",
            en: "A group of friends received a collective point deduction of {valA} points in a tournament. The deduction is to be split completely evenly among the {valB} team members. What score change does each member receive?",
            rules: {
                integerOnly: ['valB']
            }
        },
        {
            id: "neg_div_container_water_rate",
            sv: "Vattennivån i en experimentell behållare ändrades med totalt {valA} mm under {valB} minuter. Vad var ändringen i genomsnitt per minut?",
            en: "The water level in an experimental container changed by a total of {valA} mm over {valB} minutes. What was the change on average per minute?"
        }
    ],

    // =========================================================================
    // 🎯 6. NEG ORDER OF OPERATIONS (Key: neg_order_ops)
    //    Requires placeholders: {a}, {b}, {c}, {d} (matching SKILL_BUCKETS regex)
    // =========================================================================
    neg_order_ops: [
        {
            id: "neg_ord_game_score_combo",
            sv: "I en beräkning för ett strategispel startar grundvärdet på {a}. Detta multipliceras med faktorn {b}, varefter du drar bort kvoten mellan {c} och {d}. Vad blir det slutgiltiga resultatet?",
            en: "In a strategy game calculation, the base value starts at {a}. This is multiplied by the factor {b}, after which you subtract the quotient of {c} and {d}. What is the final result?"
        },
        {
            id: "neg_ord_physics_simulation",
            sv: "En forskningssensor mäter signalen {a}. Den justeras genom att addera produkten av {b} och skillnaden mellan {c} och {d}. Vilket värde beräknar sensorn?",
            en: "A research sensor measures signal {a}. It is adjusted by adding the product of {b} and the difference between {c} and {d}. What value does the sensor compute?"
        },
        {
            id: "neg_ord_financial_balance",
            sv: "Ett företag beräknar sin budgetbalans. Startbeloppet är {a} tkr. Till detta läggs resultatet av {b} multiplicerat med {c}, minus en fast kostnadsandel på {d} tkr. Vad blir balansen?",
            en: "A company calculates its budget balance. The starting amount is {a} kSEK. To this is added the result of {b} multiplied by {c}, minus a fixed cost share of {d} kSEK. What is the balance?"
        },
        {
            id: "neg_ord_temperature_profile",
            sv: "En klimatkammare programmeras med starttemperaturen {a} °C. Först justeras den med {b} gånger {c} °C, och därefter subtraheras {d} °C. Vilken temperatur uppnås?",
            en: "A climate chamber is programmed with an initial temperature of {a} °C. First it is adjusted by {b} times {c} °C, and then {d} °C is subtracted. What temperature is reached?"
        },
        {
            id: "neg_ord_math_expression_eval",
            sv: "Beräkna värdet av uttrycket där talet {a} kombineras med faktorn {b} och parentesen bestående av {c} och {d}. Vilket svar ger prioriteringsreglerna?",
            en: "Calculate the value of the expression where number {a} is combined with factor {b} and the parentheses consisting of {c} and {d}. What answer do the order of operations yield?"
        }
    ]
};