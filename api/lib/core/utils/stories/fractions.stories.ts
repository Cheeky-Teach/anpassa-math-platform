// src/core/utils/stories/fractions.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

export const FRACTION_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. FRAC SAME DENOM ADD (Requires placeholders: {n1}, {n2}, {d})
    // =========================================================================
    frac_same_denom_add: [
        {
            id: "frac_sda_pizzadough",
            sv: "Leo bakar med {n1}/{d} kilo pizzadeg på eftermiddagen och {n2}/{d} kilo till på kvällen. Hur mycket pizzadeg har han använt totalt?",
            en: "Leo bakes using {n1}/{d} kg of pizza dough in the afternoon, and another {n2}/{d} kg in the evening. How much pizza dough has he used in total?"
        },
        {
            id: "frac_sda_whitepaint",
            sv: "I en plastburk finns det {n1}/{d} liter vit färg. Du häller i {n2}/{d} liter färg till i burken. Hur mycket färg innehåller den nu?",
            en: "A plastic container contains {n1}/{d} liters of white paint. You pour another {n2}/{d} liters into the container. How much paint does it contain now?"
        },
        {
            id: "frac_sda_readinghours",
            sv: "På måndagen läste Hanna i {n1}/{d} timmar, och på tisdagen läste hon i {n2}/{d} timmar till. Hur många timmar har hon läst totalt?",
            en: "On Monday Hanna read for {n1}/{d} hours, and on Tuesday she read for another {n2}/{d} hours. How many hours has she read in total?"
        },
        {
            id: "frac_sda_runnersplit",
            sv: "En löpare springer {n1}/{d} kilometer före sin paus och fortsätter sedan {n2}/{d} kilometer till. Hur långt har hen sprungit nu?",
            en: "A runner completes {n1}/{d} kilometers before their break and then continues for another {n2}/{d} kilometers. How far have they run now?"
        },
        {
            id: "frac_sda_gardenharvest",
            sv: "På en odlingslott skördas {n1}/{d} kilo potatis och {n2}/{d} kilo morötter. Hur mycket väger grönsakerna tillsammans?",
            en: "In a garden plot, {n1}/{d} kg of potatoes and {n2}/{d} kg of carrots are harvested. How much do the vegetables weigh combined?"
        },
        {
            id: "frac_sda_milkbottles",
            sv: "Vid frukosten drack en familj {n1}/{d} liter mjölk och till middagen drack de {n2}/{d} liter till. Hur mycket mjölk gick åt totalt?",
            en: "During breakfast the family drank {n1}/{d} liters of milk, and at dinner they drank another {n2}/{d} liters. How much milk did they use in total?"
        },
        {
            id: "frac_sda_carpenterboards",
            sv: "En snickare använder en bräda som är {n1}/{d} meter lång. En bräda till fästs bredvid som är {n2}/{d} meter lång. Hur många meter brädor har använts?",
            en: "A carpenter uses a board that is {n1}/{d} meters long. Another board is attached next to it measuring {n2}/{d} meters. How many meters of boards have been used?"
        },
        {
            id: "frac_sda_schoolcommute",
            sv: "En elev cyklar {n1}/{d} kilometer till skolan och går sedan {n2}/{d} kilometer. Hur lång sträcka har eleven tagit sig totalt?",
            en: "A student bicycles {n1}/{d} kilometers to school and then walks {n2}/{d} kilometers. What total distance has the student covered?"
        },
        {
            id: "frac_sda_waterbucket",
            sv: "En hink fylls med {n1}/{d} liter vatten. Du fyller på med ytterligare {n2}/{d} liter vatten. Hur mycket vatten finns det i hinken nu?",
            en: "A bucket is filled with {n1}/{d} liters of water. You top it up with another {n2}/{d} liters of water. How much water is in the bucket now?"
        },
        {
            id: "frac_sda_fencepainting",
            sv: "Liam målar staketet i {n1}/{d} timmar på förmiddagen och målar {n2}/{d} timmar till under eftermiddagen. Hur länge har han målat under dagen?",
            en: "Liam paints the fence for {n1}/{d} hours in the morning and paints for another {n2}/{d} hours during the afternoon. How long has he been painting during the day?"
        },
        {
            id: "frac_sda_juicedrinking",
            sv: "Du dricker {n1}/{d} liter saft på förmiddagen och din kompis dricker {n2}/{d} liter. Hur mycket saft har ni druckit tillsammans?",
            en: "You drink {n1}/{d} liters of juice in the morning and your friend drinks {n2}/{d} liters. How much juice have you drunk together?"
        },
        {
            id: "frac_sda_solarpower",
            sv: "En solpanel genererar {n1}/{d} kWh energi på morgonen och {n2}/{d} kWh till på kvällen. Hur mycket energi har genererats?",
            en: "A solar panel generates {n1}/{d} kWh of energy in the morning and another {n2}/{d} kWh in the evening. How much energy has been generated?"
        },
        {
            id: "frac_sda_totebagsewing",
            sv: "För att sy en tygkasse går det åt {n1}/{d} meter tyg, och till ett band går det åt {n2}/{d} meter till. Hur mycket tyg har använts totalt?",
            en: "To sew a tote bag, {n1}/{d} meters of fabric are used, and for a strap another {n2}/{d} meters are used. How much fabric has been used in total?"
        },
        {
            id: "frac_sda_usbdrivestorage",
            sv: "Ett USB-minne fylls med {n1}/{d} GB bilder och {n2}/{d} GB appar. Hur mycket data har sparats på minnet?",
            en: "A USB drive is filled with {n1}/{d} GB of photos and {n2}/{d} GB of apps. How much data has been saved to the drive?"
        },
        {
            id: "frac_sda_homeworkstudy",
            sv: "Maja ägnade {n1}/{d} timmar åt läxor i skolan och {n2}/{d} timmar åt läxor hemma. Hur många timmar har hon pluggat under dagen?",
            en: "Maja spent {n1}/{d} hours on homework at school and {n2}/{d} hours on homework at home. How many hours has she studied during the day?"
        }
    ],

    // =========================================================================
    // 🎯 2. FRAC SAME DENOM SUB (Requires placeholders: {n1}, {n2}, {d})
    // =========================================================================
    frac_same_denom_sub: [
        {
            id: "frac_sds_jugjuice",
            sv: "En dunk innehåller {n1}/{d} liter juice. Saga dricker {n2}/{d} liter. Hur mycket juice finns kvar i dunken?",
            en: "A jug contains {n1}/{d} liters of juice. Saga drinks {n2}/{d} liters of it. How much juice is left in the jug?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_ropeproject",
            sv: "Ett skolprojekt hade {n1}/{d} meter rep. Under bygget användes {n2}/{d} meter av repet. Hur mycket rep återstår?",
            en: "A school project had {n1}/{d} meters of rope. During the build, {n2}/{d} meters of the rope were used. How much rope remains?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_cakeeaten",
            sv: "Det finns {n1}/{d} kilo tårta. Gästerna äter {n2}/{d} kilo. Hur mycket tårta finns kvar efter det?",
            en: "There is {n1}/{d} kg of cake. The guests eat {n2}/{d} kg. How much cake is left after that?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_barrelwater",
            sv: "Du har fyllt en tunna med {n1}/{d} liter vatten. Efter att ha vattnat blommorna har {n2}/{d} liter gått åt. Hur mycket vatten är kvar?",
            en: "You filled a barrel with {n1}/{d} liters of water. After watering the flowers, {n2}/{d} liters have been used. How much water is left?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_compressorair",
            sv: "En kompressor innehöll {n1}/{d} liter tryckluft. På grund av en liten läcka försvann {n2}/{d} liter luft. Hur mycket luft är kvar i kompressorn?",
            en: "A compressor contained {n1}/{d} liters of compressed air. Due to a small leak, {n2}/{d} liters of air escaped. How much air is left in the compressor?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_fabricroll",
            sv: "En tygrulle mäter {n1}/{d} meter. En hantverkare klipper av en bit som är {n2}/{d} meter. Hur mycket tyg finns kvar på rullen?",
            en: "A roll of fabric measures {n1}/{d} meters. A crafter cuts off a piece that is {n2}/{d} meters. How much fabric remains on the roll?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_batterypower",
            sv: "Ett batteri hade lagrat {n1}/{d} kWh energi. Efter en stunds användning förbrukades {n2}/{d} kWh. Hur mycket energi finns kvar?",
            en: "A battery had stored {n1}/{d} kWh of energy. After some use, {n2}/{d} kWh was consumed. How much energy is left?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_harddrivemusic",
            sv: "På en hårddisk låg det {n1}/{d} GB musikfiler. Du städar och raderar {n2}/{d} GB av musiken. Hur mycket plats tar musiken nu?",
            en: "On a hard drive, there was {n1}/{d} GB of music files. You clean up and delete {n2}/{d} GB of music. How much space does the music take now?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_bookbox",
            sv: "En låda rymde {n1}/{d} kilo böcker. Innan sommarlovet tog du ut {n2}/{d} kilo böcker. Hur många kilo böcker finns i lådan nu?",
            en: "A box contained {n1}/{d} kg of books. Before summer break, you took out {n2}/{d} kg of books. How many kilos of books are in the box now?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_chocolatebag",
            sv: "I en påse finns det {n1}/{d} kilo choklad. Kompisarna äter upp {n2}/{d} kilo under kvällen. Hur mycket choklad ligger kvar?",
            en: "In a bag there is {n1}/{d} kg of chocolate. The friends eat {n2}/{d} kg during the evening. How much chocolate is left?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_sodabarrel",
            sv: "En tunna innehåller {n1}/{d} liter läsk. Hugo tappar upp {n2}/{d} liter under lunchen. Hur mycket läsk finns kvar i tunnan?",
            en: "A barrel contains {n1}/{d} liters of soda. Hugo pours out {n2}/{d} liters during lunch. How much soda is left in the barrel?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_studysession",
            sv: "Du planerade att plugga matte i {n1}/{d} timmar. Du har redan arbetat i {n2}/{d} timmar. Hur mycket tid återstår av ditt pluggpass?",
            en: "You planned to study math for {n1}/{d} hours. You have already worked for {n2}/{d} hours. How much time remains of your study session?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_yarnskein",
            sv: "Ett nystan med garn väger {n1}/{d} kilo. Du stickar en liten mössa och använder {n2}/{d} kilo av garnet. Hur mycket garn finns kvar?",
            en: "A skein of yarn weighs {n1}/{d} kg. You knit a small beanie and use {n2}/{d} kg of the yarn. How much yarn is left?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_waterjug",
            sv: "Din vattendunk innehöll {n1}/{d} liter. Efter halva dagen har du druckit {n2}/{d} liter av vattnet. Hur mycket finns kvar?",
            en: "Your water jug contained {n1}/{d} liters. After half the day, you have drunk {n2}/{d} liters of the water. How much is left?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        },
        {
            id: "frac_sds_filedownload",
            sv: "En fil som ska laddas ner är {n1}/{d} GB stor. Du avbryter och tar bort {n2}/{d} GB som redan laddats ner. Hur mycket data återstår att ladda ner sedan?",
            en: "A file to be downloaded is {n1}/{d} GB in size. You cancel and delete {n2}/{d} GB that had already downloaded. How much data remains to be downloaded then?",
            rules: {
                greaterThan: ['n1', 'n2']
            }
        }
    ],

    // =========================================================================
    // 🎯 3. FRAC DIFF DENOM ADD (Requires placeholders: {n1}, {d1}, {n2}, {d2})
    // =========================================================================
    frac_diff_denom_add: [
        {
            id: "frac_dda_fruitpurchase",
            sv: "Maja köper {n1}/{d1} kilo äpplen och {n2}/{d2} kilo bananer. Hur mycket frukt har hon köpt totalt?",
            en: "Maja buys {n1}/{d1} kg of apples and {n2}/{d2} kg of bananas. How much fruit has she bought in total?"
        },
        {
            id: "frac_dda_soilsack",
            sv: "En säck blandas med {n1}/{d1} kilo jord och {n2}/{d2} kilo sand. Vad väger blandningen i säcken tillsammans?",
            en: "A sack is mixed with {n1}/{d1} kg of soil and {n2}/{d2} kg of sand. What does the mixture in the sack weigh combined?"
        },
        {
            id: "frac_dda_fruitdrinkpitcher",
            sv: "Du blandar fruktdryck i en tillbringare. Först hälls {n1}/{d1} liter juice i och sedan tillsätts {n2}/{d2} liter vatten. Vad blir den totala volymen?",
            en: "You mix a fruit drink in a pitcher. First, {n1}/{d1} liters of juice are poured in, and then {n2}/{d2} liters of water are added. What is the total volume?"
        },
        {
            id: "frac_dda_berrypicking",
            sv: "Under förmiddagen plockade Oliver {n1}/{d1} kilo bär, och under eftermiddagen plockade han {n2}/{d2} kilo bär till. Hur mycket bär plockade han?",
            en: "During the morning Oliver picked {n1}/{d1} kg of berries, and during the afternoon he picked another {n2}/{d2} kg. How many berries did he pick?"
        },
        {
            id: "frac_dda_musicianpractice",
            sv: "En musiker övar i {n1}/{d1} timmar på morgonen och sedan ytterligare {n2}/{d2} timmar på kvällen. Hur mycket har musikern övat totalt?",
            en: "A musician practices for {n1}/{d1} hours in the morning and then another {n2}/{d2} hours in the evening. How long has the musician practiced in total?"
        },
        {
            id: "frac_dda_paintmixing",
            sv: "För att blanda till en grön färg använder en målare {n1}/{d1} liter blå färg och {n2}/{d2} liter gul färg. Hur mycket färdig färgblandning ger detta?",
            en: "To mix a shade of green, a painter uses {n1}/{d1} liters of blue paint and {n2}/{d2} liters of yellow paint. How much total paint mixture does this yield?"
        },
        {
            id: "frac_dda_harddrivedata",
            sv: "En hårddisk fylls med {n1}/{d1} GB bilder och {n2}/{d2} GB sparade appar. Hur mycket utrymme tar bilder och appar tillsammans?",
            en: "A hard drive is filled with {n1}/{d1} GB of photos and {n2}/{d2} GB of saved apps. How much space do the photos and apps take combined?"
        },
        {
            id: "frac_dda_sportsweekend",
            sv: "Under helgen spenderade Kalle {n1}/{d1} timmar på fotboll och {n2}/{d2} timmar på tennis. Hur mycket tid la han på dessa två sporter?",
            en: "During the weekend, Kalle spent {n1}/{d1} hours on football and {n2}/{d2} hours on tennis. How much time did he spend on these two sports?"
        },
        {
            id: "frac_dda_tabletsavedfiles",
            sv: "Du har sparat {n1}/{d1} GB filmer och {n2}/{d2} GB musik på din surfplatta. Hur mycket data tar filmer och musik totalt?",
            en: "You have saved {n1}/{d1} GB of movies and {n2}/{d2} GB of music on your tablet. How much data do movies and music take in total?"
        },
        {
            id: "frac_dda_poolfilling",
            sv: "Under den första timmen pumpades {n1}/{d1} liter vatten in i poolen, och under nästa timme pumpades {n2}/{d2} liter in. Hur mycket vatten har pumpats in?",
            en: "During the first hour, {n1}/{d1} liters of water were pumped into the pool, and during the next hour {n2}/{d2} liters were pumped in. How much water has been pumped?"
        },
        {
            id: "frac_dda_cakeflour",
            sv: "Till en kaksmet behövs {n1}/{d1} dl mjöl och till glasyren behövs {n2}/{d2} dl mjöl till. Hur mycket mjöl går det åt totalt till baket?",
            en: "For a cake batter, {n1}/{d1} dl of flour is needed, and for the icing another {n2}/{d2} dl of flour is used. How much flour is used in total for baking?"
        },
        {
            id: "frac_dda_studyhours",
            sv: "Du lägger {n1}/{d1} timmar på att plugga matte och {n2}/{d2} timmar på att läsa engelska. Hur många timmar har gått åt till studier?",
            en: "You spend {n1}/{d1} hours studying math and {n2}/{d2} hours reading English. How many hours have been spent on studies?"
        },
        {
            id: "frac_dda_practicetravel",
            sv: "När du åker till träningen färdas du {n1}/{d1} kilometer med buss och går {n2}/{d2} kilometer. Hur lång är sträckan totalt?",
            en: "When going to practice, you travel {n1}/{d1} kilometers by bus and walk {n2}/{d2} kilometers. How long is the total distance?"
        },
        {
            id: "frac_dda_cleaninghours",
            sv: "Först städar du i {n1}/{d1} timmar före lunch och städar sedan i {n2}/{d2} timmar till. Hur många timmar städade du totalt?",
            en: "First you clean for {n1}/{d1} hours before lunch and then clean for another {n2}/{d2} hours. How many hours did you clean in total?"
        },
        {
            id: "frac_dda_aquariumweight",
            sv: "I ett akvarium väger dekorationsstenarna {n1}/{d1} kilo och sanden väger {n2}/{d2} kilo. Vad väger stenar och sand tillsammans?",
            en: "In an aquarium, the decorative stones weigh {n1}/{d1} kg and the sand weighs {n2}/{d2} kg. What do the stones and sand weigh together?"
        }
    ],

    // =========================================================================
    // 🎯 4. FRAC DIFF DENOM SUB (Requires placeholders: {n1}, {d1}, {n2}, {d2})
    // =========================================================================
    frac_diff_denom_sub: [
        {
            id: "frac_dds_planksaw",
            sv: "Linus har en träplanka som är {n1}/{d1} meter lång. Han sågar bort en bit som är {n2}/{d2} meter. Hur lång är plankan som är kvar?",
            en: "Linus has a wooden plank that is {n1}/{d1} meters long. He saws off a piece measuring {n2}/{d2} meters. How long is the remaining plank?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_milkpannkakor",
            sv: "I en kanna finns det {n1}/{d1} liter mjölk. Du häller ut {n2}/{d2} liter i en smet till pannkakor. Hur mycket mjölk finns kvar i kannan?",
            en: "A pitcher contains {n1}/{d1} liters of milk. You pour {n2}/{d2} liters into a baking batter. How much milk is left in the pitcher?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_batterysystem",
            sv: "Ett batteri genererade {n1}/{d1} kWh energi och maskinen förbrukade {n2}/{d2} kWh. Hur mycket energi finns kvar i systemet?",
            en: "A battery generated {n1}/{d1} kWh of energy and the machine consumed {n2}/{d2} kWh. How much energy remains in the system?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_labchemicals",
            sv: "En låda innehåller {n1}/{d1} kilo kemikalier. En labassistent tar ut {n2}/{d2} kilo för ett experiment. Hur mycket finns kvar i lådan?",
            en: "A box contains {n1}/{d1} kg of chemicals. A lab technician takes out {n2}/{d2} kg for an experiment. How much is left in the box?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_candysump",
            sv: "I en skål fanns det {n1}/{d1} kilo godis. Barnen äter upp {n2}/{d2} kilo under kvällen. Hur mycket godis finns kvar i skålen efteråt?",
            en: "In a bowl there was {n1}/{d1} kg of candy. The children eat {n2}/{d2} kg during the evening. How much candy is left in the bowl afterward?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_sheetmetalstock",
            sv: "Ett lager hade {n1}/{d1} ton stålplåt. Under dagen såldes och levererades {n2}/{d2} ton plåt. Hur mycket stålplåt finns kvar på lagret?",
            en: "A warehouse had {n1}/{d1} tons of sheet metal. During the day, {n2}/{d2} tons were sold and delivered. How much sheet metal is left in stock?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_gastank",
            sv: "En tank fylldes med {n1}/{d1} liter bensin. På en bensinstation pumpades {n2}/{d2} liter ut. Hur mycket bensin är kvar i tanken?",
            en: "A tank was filled with {n1}/{d1} liters of gasoline. At a gas station, {n2}/{d2} liters were pumped out. How much gasoline is left in the tank?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_fabricpillow",
            sv: "Du har köpt ett tygstycke som är {n1}/{d1} meter långt. Du klipper bort en bit på {n2}/{d2} meter för att sy en kudde. Hur långt är tygstycket som återstår?",
            en: "You bought a piece of fabric that is {n1}/{d1} meters long. You cut off a piece of {n2}/{d2} meters to sew a pillow. How long is the remaining piece of fabric?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_diskgames",
            sv: "Du har sparat filer på din disk som tar upp {n1}/{d1} GB. Du raderar några gamla spel som tar upp {n2}/{d2} GB. Hur mycket data finns kvar?",
            en: "You have saved files on your drive taking up {n1}/{d1} GB. You delete some old games taking up {n2}/{d2} GB. How much data remains?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_ribbongift",
            sv: "Du har ett dekorationsband som är {n1}/{d1} meter långt. Du klipper av en bit på {n2}/{d2} meter till ett paket. Hur lång del av bandet är kvar?",
            en: "You have a decorative ribbon that is {n1}/{d1} meters long. You cut off a piece of {n2}/{d2} meters for a gift. How long is the remaining ribbon?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_drinkglass",
            sv: "En flaska innehöll {n1}/{d1} liter dricka. Du häller upp ett glas som rymmer {n2}/{d2} liter. Hur mycket dricka finns kvar i flaskan?",
            en: "A bottle contained {n1}/{d1} liters of drink. You pour a glass holding {n2}/{d2} liters. How much drink is left in the bottle?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_fencepaint",
            sv: "Du hade {n1}/{d1} liter färg i en hink. Du använder {n2}/{d2} liter färg för att måla ett staket. Hur mycket färg har du kvar i hinken?",
            en: "You had {n1}/{d1} liters of paint in a bucket. You use {n2}/{d2} liters of paint to coat a fence. How much paint do you have left in the bucket?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_timertask",
            sv: "Du satte timern på {n1}/{d1} timmar för din uppgift. När du pausar dras {n2}/{d2} timmar bort som du redan jobbat. Hur mycket tid återstår?",
            en: "You set the timer to {n1}/{d1} hours for your task. When you pause, {n2}/{d2} hours are deducted for what you've already worked. How much time remains?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_frozenpizza",
            sv: "Det ligger {n1}/{d1} kilo fryst pizza i frysen. Du tillagar {n2}/{d2} kilo av den till kvällsmat. Hur mycket pizza ligger kvar i frysen?",
            en: "There is {n1}/{d1} kg of frozen pizza in the freezer. You cook {n2}/{d2} kg of it for supper. How much pizza is left in the freezer?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        },
        {
            id: "frac_dds_candlewax",
            sv: "Ett ljus består av {n1}/{d1} kilo stearin. Efter att ha brunnit en kväll har {n2}/{d2} kilo stearin smält bort. Hur mycket stearin är kvar?",
            en: "A candle consists of {n1}/{d1} kg of wax. After burning for an evening, {n2}/{d2} kg of wax has melted away. How much wax is left?",
            rules: {
                greaterThan: ['n1_over_d1', 'n2_over_d2']
            }
        }
    ],

    // =========================================================================
    // 🎯 5. FRAC MIXED ADD (Requires placeholders: {w1} och, {n1}, {d1}, {w2} och, {n2}, {d2})
    // =========================================================================
    frac_mixed_add: [
        {
            id: "frac_ma_lumber",
            sv: "En snickare använder {w1} och {n1}/{d1} meter virke till en hylla och {w2} och {n2}/{d2} meter till en annan. Hur mycket virke går åt totalt?",
            en: "A carpenter uses {w1} och {n1}/{d1} meters of lumber for one shelf and {w2} och {n2}/{d2} meters for another. How much lumber is used in total?"
        },
        {
            id: "frac_ma_sugar",
            sv: "Till ett bakrecept behövs {w1} och {n1}/{d1} deciliter socker till degen och {w2} och {n2}/{d2} deciliter till glasyren. Hur mycket socker behövs sammanlagt?",
            en: "A baking recipe requires {w1} och {n1}/{d1} deciliters of sugar for the dough and {w2} och {n2}/{d2} deciliters for the icing. How much sugar is needed in total?"
        },
        {
            id: "frac_ma_videoedit",
            sv: "Vid redigering klipper du ihop en videosekvens på {w1} och {n1}/{d1} minuter med en sista del på {w2} och {n2}/{d2} minuter. Hur lång blir videon totalt?",
            en: "While editing, you splice a video sequence of {w1} och {n1}/{d1} minutes with a final part of {w2} och {n2}/{d2} minutes. How long is the video in total?"
        },
        {
            id: "frac_ma_paintcans",
            sv: "En målare förbrukar {w1} och {n1}/{d1} burkar färg på rummets väggar och {w2} och {n2}/{d2} burkar på listerna runt om. Hur många burkar färg går åt sammanlagt?",
            en: "A painter consumes {w1} och {n1}/{d1} cans of paint on the walls and {w2} och {n2}/{d2} cans on the trim. How many cans of paint are used in total?"
        },
        {
            id: "frac_ma_backpack",
            sv: "Du packar ner två paket i din ryggsäck som väger {w1} och {n1}/{d1} kg respektive {w2} och {n2}/{d2} kg. Vad blir deras sammanlagda vikt i väskan?",
            en: "You pack two packages in your backpack weighing {w1} och {n1}/{d1} kg and {w2} och {n2}/{d2} kg respectively. What is their combined weight in the bag?"
        },
        {
            id: "frac_ma_runner",
            sv: "En löpare vilar efter att ha sprungit {w1} och {n1}/{d1} kilometer och fortsätter sedan ytterligare {w2} och {n2}/{d2} kilometer. Hur långt har löparen sprungit totalt?",
            en: "A runner rests after running {w1} och {n1}/{d1} kilometers and then continues for another {w2} och {n2}/{d2} kilometers. How far has the runner jogged in total?"
        },
        {
            id: "frac_ma_potatobags",
            sv: "En bondgård skördar {w1} och {n1}/{d1} säckar potatis på morgonen och {w2} och {n2}/{d2} säckar på eftermiddagen. Hur många säckar har de skördat totalt?",
            en: "A farm harvests {w1} och {n1}/{d1} bags of potatoes in the morning and {w2} och {n2}/{d2} bags in the afternoon. How many bags have they harvested in total?"
        },
        {
            id: "frac_ma_moped",
            sv: "Under helgen kör du moped {w1} och {n1}/{d1} kilometer på lördagen och {w2} och {n2}/{d2} kilometer till på söndagen. Hur långt har du kört moped totalt?",
            en: "Over the weekend, you ride a moped {w1} och {n1}/{d1} kilometers on Saturday and another {w2} och {n2}/{d2} kilometers on Sunday. How far have you ridden in total?"
        },
        {
            id: "frac_ma_smoothie",
            sv: "För att göra en fruktsmoothie mixar du {w1} och {n1}/{d1} hekto bananer med {w2} och {n2}/{d2} hekto frysta jordgubbar. Hur mycket väger frukten sammanlagt?",
            en: "To make a fruit smoothie, you blend {w1} och {n1}/{d1} hectograms of bananas with {w2} och {n2}/{d2} hectograms of strawberries. How much does the fruit weigh in total?"
        },
        {
            id: "frac_ma_meatbarbecue",
            sv: "En familj köper {w1} och {n1}/{d1} kilo kött till en grillkväll och kompletterar med {w2} och {n2}/{d2} kilo korv. Hur mycket har de köpt sammanlagt?",
            en: "A family buys {w1} och {n1}/{d1} kg of meat for a barbecue and supplements it with {w2} och {n2}/{d2} kg of sausages. How much have they bought in total?"
        },
        {
            id: "frac_ma_yarnscarf",
            sv: "Du använder {w1} och {n1}/{d1} nystan med garn till en halsduk och behöver {w2} och {n2}/{d2} nystan till för att göra den helt klar. Hur mycket går åt totalt?",
            en: "You use {w1} och {n1}/{d1} skeins of yarn for a scarf and need another {w2} och {n2}/{d2} skeins to complete it. How much is used in total?"
        },
        {
            id: "frac_ma_tvgaming",
            sv: "Under en helg la du {w1} och {n1}/{d1} timmar på att titta på en serie och {w2} och {n2}/{d2} timmar på att spela dator. Hur mycket tid la du på det totalt?",
            en: "Over a weekend, you spent {w1} och {n1}/{d1} hours watching a series and {w2} och {n2}/{d2} hours gaming. How much time did you spend in total?"
        },
        {
            id: "frac_ma_curtainfabric",
            sv: "För att fixa ett tygstycke till en gardin behövs {w1} och {n1}/{d1} meter tyg och till en annan del går det åt {w2} och {n2}/{d2} meter till. Hur mycket tyg går åt totalt?",
            en: "To prepare a fabric piece for a curtain, {w1} och {n1}/{d1} meters of fabric are needed and for another section another {w2} och {n2}/{d2} meters are used. How much fabric is used total?"
        },
        {
            id: "frac_ma_petfood",
            sv: "Till din hund köper du en påse torrfoder på {w1} och {n1}/{d1} kg och en mindre påse hundgodis på {w2} och {n2}/{d2} kg. Vad väger djurmaten sammanlagt?",
            en: "For your dog, you buy a bag of dry food weighing {w1} och {n1}/{d1} kg and a smaller bag of treats weighing {w2} och {n2}/{d2} kg. What does the pet food weigh in total?"
        },
        {
            id: "frac_ma_partydrinks",
            sv: "Inför ett födelsedagskalas köps det in {w1} och {n1}/{d1} liter läsk och {w2} och {n2}/{d2} liter saft till gästerna. Hur mycket dryck har köpts in totalt?",
            en: "Ahead of a birthday party, {w1} och {n1}/{d1} liters of soda and {w2} och {n2}/{d2} liters of juice are purchased for the guests. How much drink has been bought in total?"
        }
    ],

    // =========================================================================
    // 🎯 6. FRAC MIXED SUB (Requires placeholders: {w1} och, {n1}, {d1}, {w2} och, {n2}, {d2})
    // =========================================================================
    frac_mixed_sub: [
        {
            id: "frac_ms_flourbags",
            sv: "Ett bageri har {w1} och {n1}/{d1} säckar mjöl på lager. Under morgonen går det åt {w2} och {n2}/{d2} säckar. Hur mycket mjöl finns kvar på lagret?",
            en: "A bakery has {w1} och {n1}/{d1} bags of flour in stock. During the morning, {w2} och {n2}/{d2} bags are used. How much flour is left in stock?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_wirerope",
            sv: "En hantverkare har en {w1} och {n1}/{d1} meter lång vajer till ett bygge. Han kapar bort en bit på {w2} och {n2}/{d2} meter. Hur mycket vajer återstår?",
            en: "A construction worker has a wire rope that is {w1} och {n1}/{d1} meters long. He cuts off a piece of {w2} och {n2}/{d2} meters. How much wire rope remains?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_cheesestorage",
            sv: "Ett fik köpte in {w1} och {n1}/{d1} kilo ost till sina mackor. Efter helgen har man förbrukat {w2} och {n2}/{d2} kilo. Hur mycket ost finns kvar i kylen?",
            en: "A café purchased {w1} och {n1}/{d1} kg of cheese. After the weekend, they have consumed {w2} och {n2}/{d2} kg of it. How much cheese is left in the fridge?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_aquariumwater",
            sv: "Ett akvarium hade en vattenhöjd på {w1} och {n1}/{d1} dm. Under en vecka avdunstade vattnet så att nivån sjönk med {w2} och {n2}/{d2} dm. Vilken är vattenhöjden nu?",
            en: "An aquarium had a water level of {w1} och {n1}/{d1} dm. During a week, the water evaporated and the level dropped by {w2} och {n2}/{d2} dm. What is the level now?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_mopedfuel",
            sv: "Du har fyllt en mopedtank med {w1} och {n1}/{d1} liter bensin. Efter en åktur har du förbrukat {w2} och {n2}/{d2} liter. Hur mycket bensin är kvar i tanken?",
            en: "You filled a tank with {w1} och {n1}/{d1} liters of gasoline. After a road trip, you have consumed {w2} och {n2}/{d2} liters. How much gasoline is left in the tank?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_claysculpture",
            sv: "En elev har samlat ihop {w1} och {n1}/{d1} kilo lera till bildlektionen. Han använder {w2} och {n2}/{d2} kilo till en skulptur. Hur mycket lera finns kvar i burken?",
            en: "A student collected {w1} och {n1}/{d1} kg of clay. He uses {w2} och {n2}/{d2} kg for a sculpture. How much clay is left in the container?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_ribbontrim",
            sv: "En bit dekorationsband mäter {w1} och {n1}/{d1} meter. Du klipper bort en skadad ändbit på {w2} och {n2}/{d2} meter. Hur långt är bandet efter kapningen?",
            en: "A piece of ribbon measures {w1} och {n1}/{d1} meters. You cut off a damaged end piece of {w2} och {n2}/{d2} meters. How long is the ribbon after cutting?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_diskstorage",
            sv: "Du har bokat upp {w1} och {n1}/{d1} GB lagringsutrymme på en disk. På grund av en rensning raderar du filer på {w2} och {n2}/{d2} GB. Hur stort utrymme upptas nu?",
            en: "You have booked {w1} och {n1}/{d1} GB of storage space on a drive. Due to cleaning, you delete files of {w2} och {n2}/{d2} GB. How much space is occupied now?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_gymhall",
            sv: "En idrottsförening hade {w1} och {n1}/{d1} timmar halltid bokad under en månad. De avbokar {w2} och {n2}/{d2} timmar. Hur mycket halltid har de kvar?",
            en: "A sports club had {w1} och {n1}/{d1} hours of gym time booked during a month. They cancel {w2} och {n2}/{d2} hours. How much gym time do they have left?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_silkfabric",
            sv: "En skräddare har {w1} och {n1}/{d1} meter sidentyg på rullen. Efter att ha sytt en kjol har {w2} och {n2}/{d2} meter tyg gått åt. Hur mycket sidentyg finns kvar?",
            en: "A tailor has {w1} och {n1}/{d1} meters of silk fabric. After sewing a dress, {w2} och {n2}/{d2} meters of fabric have been used. How much silk fabric is left on the roll?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_icecreamtubs",
            sv: "En glassbar har {w1} och {n1}/{d1} stora lådor med glass i frysen. Efter en solig eftermiddag har man sålt bort {w2} och {n2}/{d2} lådor. Hur mycket glass finns kvar?",
            en: "An ice cream shop has {w1} och {n1}/{d1} large tubs of ice cream in the freezer. After a sunny afternoon, {w2} och {n2}/{d2} tubs are sold. How much ice cream is left?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_proteinpowder",
            sv: "Du köpte en stor behållare med {w1} och {n1}/{d1} kg proteinpulver. Efter en månad har du använt {w2} och {n2}/{d2} kg. Hur mycket pulver finns kvar?",
            en: "You bought a large container with {w1} och {n1}/{d1} kg of protein powder. After a month, you have used {w2} och {n2}/{d2} kg. How much powder remains?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_gympass",
            sv: "Ett träningskort hade en giltighetstid på {w1} och {n1}/{d1} timmar. Du har utnyttjat {w2} och {n2}/{d2} timmar till pass. Hur mycket tid har du kvar på kortet?",
            en: "A gym pass had a validity of {w1} och {n1}/{d1} hours. You have utilized {w2} och {n2}/{d2} hours for sessions. How much time do you have left on the card?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_sodabottles",
            sv: "Efter ett kalas fanns det {w1} och {n1}/{d1} stora flaskor med läsk kvar i köket. Under kvällen dricker familjen upp {w2} och {n2}/{d2} flaskor. Hur mycket läsk finns kvar?",
            en: "After a party, there were {w1} och {n1}/{d1} large bottles of soda left in the kitchen. During the evening, the family finishes {w2} och {n2}/{d2} bottles. How much soda is left?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        },
        {
            id: "frac_ms_paperpackages",
            sv: "Ett kopieringsrum i skolan innehöll {w1} och {n1}/{d1} paket papper. Lärarna använde {w2} och {n2}/{d2} paket till ett prov. Hur många paket papper finns kvar i maskinen?",
            en: "A copier station at school contained {w1} och {n1}/{d1} packages of paper. The teachers used {w2} och {n2}/{d2} packages for an exam. How many packages of paper are left?",
            rules: {
                custom: (p) => (p.w1 + (p.n1_over_d1 || 0)) > (p.w2 + (p.n2_over_d2 || 0))
            }
        }
    ],

    // =========================================================================
    // 🎯 7. FRAC MULTIPLICATION (Requires placeholders: {n1}, {d1}, {n2}, {d2})
    // =========================================================================
    frac_multiplication: [
        {
            id: "frac_mult_gardendim",
            sv: "En rektangulär trädgård är {n1}/{d1} meter lång och {n2}/{d2} meter bred. Vad är trädgårdens area i kvadratmeter?",
            en: "A rectangular garden is {n1}/{d1} meters long and {n2}/{d2} meters wide. What is the area of the garden in square meters?"
        },
        {
            id: "frac_mult_pancakebatter",
            sv: "Ett recept kräver {n1}/{d1} liter mjölk per sats pannkakor. Om du bakar {n2}/{d2} satser, hur mycket mjölk går det åt?",
            en: "A recipe requires {n1}/{d1} liters of milk per batch of pancakes. If you bake {n2}/{d2} batches, how much milk is used?"
        },
        {
            id: "frac_mult_carspeed",
            sv: "En bil kör med en medelhastighet på {n1}/{d1} kilometer per timme. Hur långt hinner bilen köra på {n2}/{d2} timmar?",
            en: "A car drives at an average speed of {n1}/{d1} kilometers per hour. How far does the car travel in {n2}/{d2} hours?"
        },
        {
            id: "frac_mult_candycost",
            sv: "Priset på exklusivt lösgodis är {n1}/{d1} kronor per kilo. Du köper {n2}/{d2} kilo av godiset. Hur mycket kommer det att kosta?",
            en: "The price of exclusive pick-and-mix candy is {n1}/{d1} SEK per kg. You buy {n2}/{d2} kg of the candy. How much will it cost?"
        },
        {
            id: "frac_mult_customshirt",
            sv: "För att sy en specialdesignad tröja behövs det {n1}/{d1} meter tyg. En kläddesigner planerar att sy {n2}/{d2} sådana tröjor. Hur många meter tyg behövs totalt?",
            en: "To sew a custom-designed shirt, {n1}/{d1} meters of fabric is needed. A clothing designer plans to sew {n2}/{d2} such shirts. How many meters of fabric are needed in total?"
        },
        {
            id: "frac_mult_paintwall",
            sv: "En målare använder {n1}/{d1} liter färg för att måla en standardvägg. Han får i uppdrag att måla {n2}/{d2} sådana väggar. Hur mycket färg går åt?",
            en: "A painter uses {n1}/{d1} liters of paint to coat a standard wall. He is tasked with painting {n2}/{d2} such walls. How much paint is consumed?"
        },
        {
            id: "frac_mult_zoofeed",
            sv: "Ett djur på en djurpark äter {n1}/{d1} kilo specialfoder varje dag. Hur mycket foder äter djuret under en period på {n2}/{d2} dagar?",
            en: "An animal at a zoo eats {n1}/{d1} kg of special feed every day. How much feed does the animal eat over a period of {n2}/{d2} days?"
        },
        {
            id: "frac_mult_waterpump",
            sv: "En vattenpump kan pumpa ut {n1}/{d1} liter vatten per minut. Hur mycket vatten har pumpen flyttat efter {n2}/{d2} minuter?",
            en: "A water pump can pump out {n1}/{d1} liters of water per minute. How much water has the pump moved after {n2}/{d2} minutes?"
        },
        {
            id: "frac_mult_freelancer",
            sv: "En frilansare tjänar {n1}/{d1} hundralappar för varje timmes arbete. Hen arbetar i {n2}/{d2} timmar med ett projekt. Hur mycket pengar tjänar frilansaren?",
            en: "A freelancer earns {n1}/{d1} hundreds of SEK for every hour of work. They work for {n2}/{d2} hours on a project. How much money does the freelancer earn?"
        },
        {
            id: "frac_mult_wheatfield",
            sv: "På ett fält växer det i genomsnitt {n1}/{d1} kilo vete per kvadratmeter. Bonden ska skörda en yta på {n2}/{d2} kvadratmeter. Vad blir den förväntade vikten på vetet?",
            en: "In a field, an average of {n1}/{d1} kg of wheat grows per square meter. The farmer is harvesting an area of {n2}/{d2} square meters. What is the expected weight of the wheat?"
        },
        {
            id: "frac_mult_heaterspower",
            sv: "Ett värmeelement förbrukar {n1}/{d1} kWh el per timme det är påslaget. Om elementet är igång i {n2}/{d2} timmar, hur mycket el har förbrukats?",
            en: "A heater consumes {n1}/{d1} kWh of electricity per hour it is turned on. If the heater runs for {n2}/{d2} hours, how much electricity has been consumed?"
        },
        {
            id: "frac_mult_breadflour",
            sv: "En bagare använder {n1}/{d1} kilo mjöl för att baka en stor brödlimpa. Under förmiddagen bakar bagaren {n2}/{d2} limpor. Hur mycket mjöl används?",
            en: "A baker uses {n1}/{d1} kg of flour to bake a large loaf of bread. During the morning, the baker bakes {n2}/{d2} loaves. How much flour is used?"
        },
        {
            id: "frac_mult_printerfilament",
            sv: "En 3D-skrivare använder {n1}/{d1} gram plast för att skriva ut en specifik detalj. En tekniker beställer {n2}/{d2} utskrifter av denna detalj. Hur mycket plast går åt?",
            en: "A 3D printer uses {n1}/{d1} grams of plastic to print a specific part. A technician orders {n2}/{d2} prints of this part. How much plastic is used?"
        },
        {
            id: "frac_mult_fertilizerspread",
            sv: "En maskin fördelar gödningsmedel och sprider ut {n1}/{d1} liter per hektar åkermark. Maskinen körs över en yta på {n2}/{d2} hektar. Hur mycket gödningsmedel har spridits ut?",
            en: "A machine distributes fertilizer, spreading {n1}/{d1} liters per hectare of farmland. The machine is driven over an area of {n2}/{d2} hectares. How much fertilizer has been spread?"
        },
        {
            id: "frac_mult_bookreading",
            sv: "En snabb läsare kan läsa {n1}/{d1} sidor av en bok per minut. Om personen läser intensivt i {n2}/{d2} minuter, hur många sidor hinner hen läsa?",
            en: "A fast reader can read {n1}/{d1} pages of a book per minute. If the person reads intensely for {n2}/{d2} minutes, how many pages will they manage to read?"
        }
    ],

    // =========================================================================
    // 🎯 8. FRAC DIVISION (Requires placeholders: {n1}, {d1}, {n2}, {d2})
    // =========================================================================
    frac_division: [
        // =====================================================================
        // 🧁 GROUP A: Fraction-of-a-Whole / Quotients < 1 (minResult: 0.01)
        // Natural narratives for when n1/d1 is smaller than (or equal to) n2/d2
        // =====================================================================
        {
            id: "frac_div_recipe_portion",
            sv: "Ett recept kräver {n2}/{d2} kg mjöl. Du har bara {n1}/{d1} kg hemma. Hur stor andel av receptet kan du baka?",
            en: "A recipe calls for {n2}/{d2} kg of flour. You only have {n1}/{d1} kg at home. What fraction of the recipe can you bake?",
            rules: {
                minResult: 0.01
            }
        },
        {
            id: "frac_div_daily_run_target",
            sv: "Ditt träningsmål är att springa {n2}/{d2} mil. På morgonen hinner du springa {n1}/{d1} mil. Hur stor del av målet har du klarat av?",
            en: "Your training goal is to run {n2}/{d2} Swedish miles. In the morning you run {n1}/{d1} miles. What fraction of your goal have you completed?",
            rules: {
                minResult: 0.01
            }
        },
        {
            id: "frac_div_battery_charge_share",
            sv: "En full laddningscykel kräver {n2}/{d2} kilowattimmar energi. Du laddar upp med {n1}/{d1} kilowattimmar. Hur stor andel av en full cykel motsvarar det?",
            en: "A full charging cycle requires {n2}/{d2} kilowatt-hours. You charge up with {n1}/{d1} kilowatt-hours. What fraction of a full cycle does that equal?",
            rules: {
                minResult: 0.01
            }
        },
        {
            id: "frac_div_fence_paint_progress",
            sv: "För att måla hela staketet går det åt {n2}/{d2} burkar färg. Du har {n1}/{d1} burkar kvar. Hur stor del av staketet räcker färgen till?",
            en: "Painting the entire fence requires {n2}/{d2} cans of paint. You have {n1}/{d1} cans left. What fraction of the fence will the paint cover?",
            rules: {
                minResult: 0.01
            }
        },
        {
            id: "frac_div_tank_fill_level",
            sv: "En vattentank rymmer {n2}/{d2} kubikmeter. Just nu finns det {n1}/{d1} kubikmeter i tanken. Hur stor andel av tanken är fylld?",
            en: "A water tank holds {n2}/{d2} cubic meters. Right now there is {n1}/{d1} cubic meters in it. What fraction of the tank is filled?",
            rules: {
                minResult: 0.01
            }
        },
        {
            id: "frac_div_study_chapter_quota",
            sv: "Ett kapitel beräknas ta {n2}/{d2} timmar att läsa. Du har studerat i {n1}/{d1} timmar. Hur stor andel av kapitlet är avklarat?",
            en: "A chapter is estimated to take {n2}/{d2} hours to read. You have studied for {n1}/{d1} hours. What fraction of the chapter is completed?",
            rules: {
                minResult: 0.01
            }
        },
        {
            id: "frac_div_fabric_curtain_cut",
            sv: "En gardinlängd behöver {n2}/{d2} meter tyg. Du har en tygbit på {n1}/{d1} meter. Hur stor del av en hel gardinlängd räcker tygbiten till?",
            en: "A full curtain requires {n2}/{d2} meters of fabric. You have a scrap measuring {n1}/{d1} meters. What fraction of a full curtain does it make?",
            rules: {
                minResult: 0.01
            }
        },
        {
            id: "frac_div_lawn_mower_fuel",
            sv: "Att klippa hela gräsmattan förbrukar {n2}/{d2} liter bensin. I tanken finns {n1}/{d1} liter. Hur stor andel av gräsmattan kan du klippa innan bensinen tar slut?",
            en: "Mowing the whole lawn consumes {n2}/{d2} liters of petrol. In the tank there is {n1}/{d1} liters. What fraction of the lawn can you mow before running out?",
            rules: {
                minResult: 0.01
            }
        },
        {
            id: "frac_div_dough_batch_share",
            sv: "En sats kanelbullar kräver {n2}/{d2} kilo smör. Du hittar {n1}/{d1} kilo smör i kylskåpet. Hur stor sats kan du baka?",
            en: "A batch of cinnamon buns requires {n2}/{d2} kg of butter. You find {n1}/{d1} kg in the fridge. What fraction of a full batch can you bake?",
            rules: {
                minResult: 0.01
            }
        },
        {
            id: "frac_div_commute_bike_fraction",
            sv: "Hela cykelvägen till skolan är {n2}/{d2} mil lång. Du har hunnit cykla {n1}/{d1} mil. Hur stor andel av hela vägen har du lagt bakom dig?",
            en: "The bike route to school is {n2}/{d2} Swedish miles long. You have cycled {n1}/{d1} miles. What fraction of the total route have you covered?",
            rules: {
                minResult: 0.01
            }
        },

        // =====================================================================
        // 📦 GROUP B: Packaging / Division into Units (minResult: 1)
        // Natural narratives for when n1/d1 >= n2/d2 (yields 1 or more units)
        // =====================================================================
        {
            id: "frac_div_juicecups",
            sv: "Du har {n1}/{d1} liter juice som ska fördelas i små bägare. Varje bägare rymmer {n2}/{d2} liter. Hur många bägare kan du fylla?",
            en: "You have {n1}/{d1} liters of juice to be distributed into small cups. Each cup holds {n2}/{d2} liters. How many cups can you fill?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_stringbracelets",
            sv: "Ett snöre mäter {n1}/{d1} meter. Du klipper snöret i korta bitar till armband där varje bit ska vara {n2}/{d2} meter lång. Hur många sådana bitar får du ut?",
            en: "A piece of string measures {n1}/{d1} meters. You cut the string into smaller pieces where each piece must be {n2}/{d2} meters long. How many such pieces do you get?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_proteinportions",
            sv: "En burk innehåller {n1}/{d1} kilo proteinpulver till träningen. Varje portion du blandar till kräver {n2}/{d2} kilo pulver. Hur många portioner räcker burken till?",
            en: "A container holds {n1}/{d1} kg of protein powder. Each serving requires {n2}/{d2} kg of powder. How many full servings will it last for?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_paintbowls",
            sv: "Du har en hink som innehåller {n1}/{d1} liter färg till ett bygge. Du portionerar ut färgen i mindre skålar som rymmer {n2}/{d2} liter var. Hur många skålar kan du fylla?",
            en: "A bucket contains {n1}/{d1} liters of paint. You portion out the paint into smaller bowls holding {n2}/{d2} liters each. How many bowls can you fill?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_bubblesoap",
            sv: "Du har en flaska med {n1}/{d1} centiliter såpvatten. Du ska fylla små rör med bubbelvätska som rymmer {n2}/{d2} centiliter styck. Hur många rör kan du fylla helt?",
            en: "You have a bottle with {n1}/{d1} centiliters of soap water. You distribute it into small tubes holding {n2}/{d2} centiliters each. How many tubes can you fill completely?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_woodlath",
            sv: "En slöjdlärare har en träläkt på {n1}/{d1} meter. Eleverna ska såga till bitar som är {n2}/{d2} meter långa till ett projekt. Hur många bitar räcker läkten till?",
            en: "A woodwork teacher has a wooden lath measuring {n1}/{d1} meters. The students need to saw pieces that are {n2}/{d2} meters long for a project. How many pieces will the lath yield?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_plantfertilizer",
            sv: "En trädgårdsmästare portionerar ut flytande växtnäring. Han har {n1}/{d1} liter näring och varje planta ska ha {n2}/{d2} liter. Till hur många plantor räcker näringen?",
            en: "A gardener portions out liquid plant fertilizer. He has {n1}/{d1} liters of fertilizer, and each plant requires {n2}/{d2} liters. For how many plants will the fertilizer suffice?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_partybags",
            sv: "En stor påse med godis väger {n1}/{d1} kilo. Du ska fördela godiset i mindre kalaspåsar som rymmer {n2}/{d2} kilo styck. Hur många påsar kan du fylla helt?",
            en: "A large bag of candy weighs {n1}/{d1} kg. You are going to distribute the candy into smaller bags holding {n2}/{d2} kg each. How many such bags can be filled completely?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_breadbuns",
            sv: "En bagare ska dela upp en stor deg som väger {n1}/{d1} kilo till mindre brödbullar. Varje bulle ska väga {n2}/{d2} kilo före gräddning. Hur många bullar får bagaren ut?",
            en: "A baker needs to divide a large dough weighing {n1}/{d1} kg into smaller buns. Each bun must weigh {n2}/{d2} kg before baking. How many buns will the baker get?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_chocolatecups",
            sv: "En stor kanna innehåller {n1}/{d1} deciliter varm choklad. Du häller upp drycken i mindre koppar som rymmer {n2}/{d2} deciliter styck. Hur många koppar kan du fylla?",
            en: "A large pitcher contains {n1}/{d1} deciliters of hot chocolate. You pour the drink into smaller cups holding {n2}/{d2} deciliters each. How many cups can be filled?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_sodaglasses",
            sv: "Du har en flaska med {n1}/{d1} liter läsk kvar efter en fest. Du häller upp läsken i mindre glas som rymmer {n2}/{d2} liter var. Hur många glas räcker det till?",
            en: "You have a bottle containing {n1}/{d1} liters of soda left after a party. You pour the soda into small glasses holding {n2}/{d2} liters each. How many glasses can you fill?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_mopedfuel",
            sv: "En dunk innehåller {n1}/{d1} liter bensin. Du portionerar ut bränslet i små reservflaskor till en moped där varje flaska rymmer {n2}/{d2} liter. Hur många flaskor kan fyllas?",
            en: "A canister contains {n1}/{d1} liters of gasoline. You portion out the fuel into small reserve bottles for a moped, where each bottle holds {n2}/{d2} liters. How many bottles can be filled?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_ribbonstrips",
            sv: "Ett dekorationsband på en rulle mäter {n1}/{d1} meter. Till en skolfest ska bandet klippas upp i korta bitar på {n2}/{d2} meter var. Hur många bitar räcker rullen till?",
            en: "A colored ribbon on a roll measures {n1}/{d1} meters. For a school party, the ribbon is to be cut into short pieces of {n2}/{d2} meters each. How many pieces will the roll last for?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_snackbowls",
            sv: "En stor förpackning innehåller {n1}/{d1} kilo snacks. Du ska hälla upp innehållet i små skålar till kompisarna där varje skål rymmer {n2}/{d2} kilo. Hur många skålar kan du fylla?",
            en: "A large package contains {n1}/{d1} kg of snacks. You are going to pour the contents into small bowls for your friends, where each bowl holds {n2}/{d2} kg. How many bowls can you fill?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "frac_div_tapesections",
            sv: "En hel rulle med monteringstejp är {n1}/{d1} meter lång. Du klipper upp hela rullen i korta bitar som mäter {n2}/{d2} meter var. Hur många tejpbitar får du ut totalt?",
            en: "A whole roll of mounting tape is {n1}/{d1} meters long. You cut up the entire roll into short pieces measuring {n2}/{d2} meters each. How many pieces of tape do you get in total?",
            rules: {
                minResult: 1
            }
        }
    ]
};