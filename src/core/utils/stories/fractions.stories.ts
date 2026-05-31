// src/core/utils/stories/fractions.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const FRACTION_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. FRAC SAME DENOM ADD (Requires placeholders: {n1}, {n2}, {d})
    // =========================================================================
    frac_same_denom_add: [
        {
            sv: "Leo äter {n1}/{d} av en pizza på eftermiddagen och {n2}/{d} till av samma pizza på kvällen. Hur stor del av pizzan har han ätit totalt?",
            en: "Leo eats {n1}/{d} of a pizza in the afternoon, and another {n2}/{d} of the same pizza in the evening. What fraction of the pizza has he eaten in total?"
        },
        {
            sv: "I en plastburk finns det {n1}/{d} liter vit färg. Du häller i {n2}/{d} liter färg till i burken. Hur mycket färg innehåller den nu?",
            en: "A plastic container contains {n1}/{d} liters of white paint. You pour another {n2}/{d} liters into the container. How much paint does it contain now?"
        },
        {
            sv: "På måndagen läste Hanna {n1}/{d} av en bok, och på tisdagen läste hon {n2}/{d} till av boken. Hur stor del har hon läst totalt?",
            en: "On Monday Hanna read {n1}/{d} of a book, and on Tuesday she read another {n2}/{d} of the book. What fraction has she read in total?"
        },
        {
            sv: "En löpare har sprungit {n1}/{d} av ett motionsspår och fortsätter sedan {n2}/{d} till före nästa paus. Hur stor del av spåret har hen sprungit nu?",
            en: "A runner completes {n1}/{d} of a jogging track and then continues for another {n2}/{d} before their next break. What fraction of the track is completed now?"
        },
        {
            sv: "På en odlingslott används {n1}/{d} av ytan till potatis och {n2}/{d} av ytan till morötter. Hur stor del av lotten upptas av dessa två grönsaker tillsammans?",
            en: "In a garden plot, {n1}/{d} of the area is used for potatoes and {n2}/{d} of the area for carrots. What fraction of the plot is occupied by these two vegetables combined?"
        },
        {
            sv: "Vid frukosten drack en familj {n1}/{d} liter mjölk och till middagen drack de {n2}/{d} liter till ur ett mjölkpaket. Hur mycket mjölk gick åt totalt?",
            en: "During breakfast the family drank {n1}/{d} liters of milk, and at dinner they drank another {n2}/{d} liters from a large milk carton. How much milk did they use in total?"
        },
        {
            sv: "En snickare monterar en skiva som täcker {n1}/{d} av en vägg. En skiva till fästs bredvid och täcker {n2}/{d} till av väggen. Hur stor del av väggen är nu täckt?",
            en: "A carpenter mounts a drywall panel covering {n1}/{d} of a wall. Another panel is attached next to it, covering another {n2}/{d} of the wall. What fraction of the wall is now covered?"
        },
        {
            sv: "Av eleverna i en klass åker {n1}/{d} moped till skolan och {n2}/{d} åker buss. Hur stor del av klassen åker antingen moped eller buss?",
            en: "Of the students in a class, {n1}/{d} ride a moped to school and {n2}/{d} take the bus. What fraction of the class takes either a moped or a bus?"
        },
        {
            sv: "En flaska är fylld till {n1}/{d} med vatten. Du fyller på med ytterligare {n2}/{d} av flaskans totala volym. Hur stor del av flaskan är fylld nu?",
            en: "A bottle is filled to {n1}/{d} with water. You top it up with another {n2}/{d} of the bottle's total volume. What fraction of the bottle is filled now?"
        },
        {
            sv: "Liam målar {n1}/{d} av ett staket på förmiddagen och hinner med {n2}/{d} till under eftermiddagen. Hur stor del av staketet har han målat under dagen?",
            en: "Liam paints {n1}/{d} of a fence in the morning and manages another {n2}/{d} during the afternoon. What fraction of the fence has he painted during the day?"
        },
        {
            sv: "Du dricker {n1}/{d} liter saft på förmiddagen och din kompis dricker {n2}/{d} liter ur samma tillbringare. Hur mycket saft har ni druckit tillsammans?",
            en: "You drink {n1}/{d} liters of juice in the morning and your friend drinks {n2}/{d} liters from the same pitcher. How much juice have you drunk together?"
        },
        {
            sv: "Under en spelsession laddar din handkontroll upp {n1}/{d} av batteriet, och under nästa paus laddar den {n2}/{d} till. Hur stor del av batteriet har laddats?",
            en: "During a gaming session, your controller charges {n1}/{d} of its battery, and during the next break it charges another {n2}/{d}. What fraction of the battery has charged?"
        },
        {
            sv: "För att sy en tygkasse går det åt {n1}/{d} meter av ett tygstycke, och till ett band går det åt {n2}/{d} meter till. Hur mycket tyg har använts totalt?",
            en: "To sew a tote bag, {n1}/{d} meters of a fabric piece are used, and for a strap another {n2}/{d} meters are used. How much fabric has been used in total?"
        },
        {
            sv: "Bilderna på din telefon tar upp {n1}/{d} av minnet och dina sparade appar tar upp {n2}/{d} till. Hur stor del av telefonens minne upptas av bilder och appar?",
            en: "The photos on your phone take up {n1}/{d} of the storage and your saved apps take up another {n2}/{d}. What fraction of the phone's storage is occupied by photos and apps?"
        },
        {
            sv: "Maja gjorde klart {n1}/{d} av sina läxor i skolan och gjorde {n2}/{d} till hemma under kvällen. Hur stor del av läxorna har hon gjort klart under dagen?",
            en: "Maja completed {n1}/{d} of her homework at school and did another {n2}/{d} at home during the evening. What fraction of the homework has she finished during the day?"
        }
    ],

    // =========================================================================
    // 🎯 2. FRAC SAME DENOM SUB (Requires placeholders: {n1}, {n2}, {d})
    // =========================================================================
    frac_same_denom_sub: [
        {
            sv: "En flaska innehåller {n1}/{d} liter juice. Saga dricker upp {n2}/{d} liter. Hur mycket juice finns kvar i flaskan?",
            en: "A bottle contains {n1}/{d} liters of juice. Saga drinks {n2}/{d} liters of it. How much juice is left in the bottle?"
        },
        {
            sv: "Ett skolprojekt hade {n1}/{d} kvar av sina träskivor, men efter ett bygge användes {n2}/{d} av det ursprungliga materialet. Hur stor del av träskivorna återstår?",
            en: "A school project had {n1}/{d} left of its wooden boards, but after a build, {n2}/{d} of the original material was used. What fraction of the wooden boards remains?"
        },
        {
            sv: "Det finns {n1}/{d} kvar av en tårta. Gästerna tar bitar som motsvarar {n2}/{d} av hela tårtan. Hur stor del av tårtan finns kvar efter det?",
            en: "There is {n1}/{d} left of a cake. The guests take pieces corresponding to {n2}/{d} of the whole cake. What fraction of the cake is left after that?"
        },
        {
            sv: "Du har fyllt en vattenkanna till {n1}/{d}. Efter att ha vattnat blommorna har {n2}/{d} av den totala volymen gått åt. Hur stor del är kvar?",
            en: "You filled a watering can to {n1}/{d}. After watering the flowers, {n2}/{d} of the total volume has been used. What fraction is left?"
        },
        {
            sv: "Ett cykelhjul var fyllt till {n1}/{d} med luft. På grund av en liten läcka försvann {n2}/{d} av luften. Hur stor del luft är kvar i hjulet?",
            en: "A bicycle wheel was filled to {n1}/{d} with air. Due to a small leak, {n2}/{d} of the air escaped. What fraction of air is left in the wheel?"
        },
        {
            sv: "En tygrulle mäter {n1}/{d} av en hel rulle. En hantverkare klipper av en bit som motsvarar {n2}/{d} av en hel rulle. Hur stor del av rullen finns kvar?",
            en: "A roll of fabric measures {n1}/{d} of a full roll. A crafter cuts off a piece corresponding to {n2}/{d} of a full roll. What fraction of the roll remains?"
        },
        {
            sv: "Ett batteri var laddat till {n1}/{d} av sin maxnivå. Efter en stunds användning har laddningen sjunkit med {n2}/{d} av maxnivån. Vad är laddningsnivån nu?",
            en: "A battery was charged to {n1}/{d} of its maximum level. After some use, the charge dropped by {n2}/{d} of the maximum level. What is the charge level now?"
        },
        {
            sv: "På en spellista är {n1}/{d} av låtarna hiphop. Du städar listan och tar bort låtar som utgör {n2}/{d} av det totala antalet låtar. Hur stor del av listan är nu hiphop?",
            en: "On a playlist, {n1}/{d} of the songs are hip-hop. You clean up the list and remove tracks making up {n2}/{d} of the total songs. What fraction of the list is now hip-hop?"
        },
        {
            sv: "Ett skåp i skolan var fyllt till {n1}/{d} av sin volym. Innan sommarlovet tog du ut böcker som motsvarade {n2}/{d} av volymen. Hur stor del av skåpet är fyllt nu?",
            en: "A school locker was filled to {n1}/{d} of its volume. Before summer break, you took out books corresponding to {n2}/{d} of the volume. What fraction of the locker is filled now?"
        },
        {
            sv: "I en påse godis är {n1}/{d} av bitarna choklad. Kompisarna äter upp en mängd som motsvarar {n2}/{d} av påsens totala innehåll. Hur stor andel choklad ligger kvar?",
            en: "In a bag of candy, {n1}/{d} of the pieces are chocolate. The friends eat an amount corresponding to {n2}/{d} of the bag's total contents. What fraction of chocolate is left?"
        },
        {
            sv: "Ett juicepaket innehåller {n1}/{d} liter läsk. Hugo dricker upp {n2}/{d} liter under lunchen. Hur mycket läsk finns kvar i paketet?",
            en: "A juice carton contains {n1}/{d} liters of soda. Hugo drinks {n2}/{d} liters during lunch. How much soda is left in the carton?"
        },
        {
            sv: "Ett häfte med matteuppgifter har {n1}/{d} av sidorna kvar att räkna. Du gör bort {n2}/{d} av sidorna under lektionen. Hur stor del av häftet återstår nu?",
            en: "A booklet of math exercises has {n1}/{d} of its pages left to solve. You finish {n2}/{d} of the pages during class. What fraction of the booklet remains now?"
        },
        {
            sv: "Ett nystan med garn väger {n1}/{d} av sin fulla vikt. Du stickar en liten mössa och använder {n2}/{d} av nystanets totala vikt. Hur stor del finns kvar?",
            en: "A skein of yarn weighs {n1}/{d} of its full weight. You knit a small beanie and use {n2}/{d} of the yarn's total weight. What fraction is left?"
        },
        {
            sv: "Din vattenflaska under gympalektionen var fylld till {n1}/{d}. Efter halva lektionen har du druckit upp {n2}/{d} av flaskans totala volym. Hur stor del är kvar?",
            en: "Your water bottle during gym class was filled to {n1}/{d}. After half the class, you have drunk {n2}/{d} of the bottle's total volume. What fraction is left?"
        },
        {
            sv: "En nedladdning till ett spel har nått {n1}/{d} av filens storlek. Datorn pausar och raderar en skadad del som utgör {n2}/{d} av filen. Vad är framstegsnivån nu?",
            en: "A game download has reached {n1}/{d} of the file size. The computer pauses and deletes a corrupted part making up {n2}/{d} of the file. What is the progress level now?"
        }
    ],

    // =========================================================================
    // 🎯 3. FRAC DIFF DENOM ADD (Requires placeholders: {n1}, {d1}, {n2}, {d2})
    // =========================================================================
    frac_diff_denom_add: [
        {
            sv: "Maja använder {n1}/{d1} av sina pengar till böcker och {n2}/{d2} på ett café. Hur stor del av sina totala pengar har hon gjort av med?",
            en: "Maja spends {n1}/{d1} of her savings on books and {n2}/{d2} on café visits. What fraction of her total savings has she spent?"
        },
        {
            sv: "En kruka med blommor består till {n1}/{d1} av jord och till {n2}/{d2} av sand. Hur stor del av krukan upptas av dessa två delar tillsammans?",
            en: "A flowerpot consists of {n1}/{d1} soil and {n2}/{d2} sand. What fraction of the pot is occupied by these two parts combined?"
        },
        {
            sv: "Du blandar fruktdryck i en tillbringare. Först hälls {n1}/{d1} liter juice i och sedan tillsätts {n2}/{d2} liter vatten. Vad blir den totala volymen i tillbringaren?",
            en: "You mix a fruit drink in a pitcher. First, {n1}/{d1} liters of juice are poured in, and then {n2}/{d2} liters of water are added. What is the total volume in the pitcher?"
        },
        {
            sv: "Under förmiddagen plockade Oliver {n1}/{d1} kilo bär, och under eftermiddagen plockade han {n2}/{d2} kilo bär till. Hur mycket bär har han plockat totalt under dagen?",
            en: "During the morning Oliver picked {n1}/{d1} kg of berries, and during the afternoon he picked another {n2}/{d2} kg of berries. How many berries has he picked in total today?"
        },
        {
            sv: "En musiker har skrevet {n1}/{d1} av en låt och gör sedan ytterligare {n2}/{d2} av låten. Hur stor del av hela låten är färdig nu?",
            en: "A musician has written {n1}/{d1} of a piece of music and then composes another {n2}/{d2} of it. What fraction of the entire piece is finished now?"
        },
        {
            sv: "För att blanda till en grön färg använder en målare {n1}/{d1} liter blå färg och {n2}/{d2} liter gul färg. Hur mycket färdig färgblandning ger detta?",
            en: "To mix a shade of green, a painter uses {n1}/{d1} liters of blue paint and {n2}/{d2} liters of yellow paint. How much total paint mixture does this yield?"
        },
        {
            sv: "Lagringsutrymmet på en telefon är fyllt med bilder till {n1}/{d1} och med sparade appar till {n2}/{d2}. Hur stor del av utrymmet upptas av bilder och appar tillsammans?",
            en: "The storage space on a phone is filled with photos to {n1}/{d1} and with saved apps to {n2}/{d2}. What fraction of the space is occupied by photos and apps combined?"
        },
        {
            sv: "Av deltagarna på en idrottsträff spelar {n1}/{d1} fotboll på fritiden och {n2}/{d2} spelar tennis. Hur stor del av deltagarna utövar någon av dessa två sporter?",
            en: "Of the participants at a sports gathering, {n1}/{d1} play football in their spare time and {n2}/{d2} play tennis. What fraction of the participants practices either of these two sports?"
        },
        {
            sv: "Lagringsutrymmet på en surfplatta är fyllt med filmer till {n1}/{d1} och med musikfiler till {n2}/{d2}. Hur stor del av utrymmet upptas av filmer och musik tillsammans?",
            en: "The storage space on a tablet is filled with movies to {n1}/{d1} and with music files to {n2}/{d2}. What fraction of the space is occupied by movies and music combined?"
        },
        {
            sv: "Under den första timmen fylldes en pool till {n1}/{d1} av sin volym, och under den andra timmen fylldes ytterligare {n2}/{d2}. Hur stor del av poolen är fylld efter de två timmarna?",
            en: "During the first hour, a pool was filled to {n1}/{d1} of its volume, and during the second hour another {n2}/{d2} was filled. What fraction of the pool is filled after the two hours?"
        },
        {
            sv: "Till en kaksmet behövs {n1}/{d1} dl mjöl och till glasyren behövs {n2}/{d2} dl mjöl till. Hur mycket mjöl går det åt totalt till baket?",
            en: "For a cake batter, {n1}/{d1} dl of flour is needed, and for the icing another {n2}/{d2} dl of flour is used. How much flour is used in total for baking?"
        },
        {
            sv: "Du lägger {n1}/{d1} av din kväll på att plugga matte och {n2}/{d2} på att läsa engelska glosor. Hur stor del av kvällen har gått åt till studier?",
            en: "You spend {n1}/{d1} of your evening studying math and {n2}/{d2} reading English vocabulary. What fraction of the evening has been spent on studies?"
        },
        {
            sv: "När du åker till träningen går {n1}/{d1} av sträckan genom att åka buss och {n2}/{d2} genom att gå. Hur stor del av hela sträckan har du klarat av då?",
            en: "When going to practice, {n1}/{d1} of the distance is covered by riding the bus and {n2}/{d2} by walking. What fraction of the entire distance have you completed then?"
        },
        {
            sv: "Först städar du {n1}/{d1} av ditt rum före lunch och tar sedan {n2}/{d2} till under eftermiddagen. Hur stor del av rummet har du städat totalt under dagen?",
            en: "First you clean {n1}/{d1} of your room before lunch and then take another {n2}/{d2} during the afternoon. What fraction of the room have you cleaned in total during the day?"
        },
        {
            sv: "I ett litet akvarium fyller dekorationsstenar {n1}/{d1} av botten och växterna tar upp {n2}/{d2} till. Hur stor del av bottenytan täcks av stenar och växter?",
            en: "In a small aquarium, decorative stones fill {n1}/{d1} of the bottom and plants take up another {n2}/{d2}. What fraction of the bottom surface is covered by stones and plants?"
        }
    ],

    // =========================================================================
    // 🎯 4. FRAC DIFF DENOM SUB (Requires placeholders: {n1}, {d1}, {n2}, {d2})
    // =========================================================================
    frac_diff_denom_sub: [
        {
            sv: "Linus har en träplanka som är {n1}/{d1} meter lång. Han sågar bort en bit som är {n2}/{d2} meter. Hur lång är plankan som är kvar?",
            en: "Linus has a wooden plank that is {n1}/{d1} meters long. He saws off a piece measuring {n2}/{d2} meters. How long is the remaining plank?"
        },
        {
            sv: "I en kanna finns det {n1}/{d1} liter mjölk. Du häller ut {n2}/{d2} liter i en smet till pannkakor. Hur mycket mjölk finns kvar i kannan?",
            en: "A pitcher contains {n1}/{d1} liters of milk. You pour {n2}/{d2} liters into a baking batter. How much milk is left in the pitcher?"
        },
        {
            sv: "Ett batteri var laddat till {n1}/{d1} och efter ett videosamtal har laddningen minskat med {n2}/{d2} av full nivå. Vad är laddningsnivån nu?",
            en: "A battery was charged to {n1}/{d1} and after a video call, the charge decreased by {n2}/{d2} of full capacity. What is the charge level now?"
        },
        {
            sv: "En burk innehåller {n1}/{d1} kilo mjöl till ett bak. Du tar ut {n2}/{d2} kilo för att baka frallor. Hur mycket mjöl finns kvar i burken?",
            en: "A container contains {n1}/{d1} kg of chemicals. A lab technician takes out {n2}/{d2} kg for an experiment. How many chemicals are left in the container?"
        },
        {
            sv: "I en skål fanns det {n1}/{d1} kilo godis. Kompisarna äter upp {n2}/{d2} kilo under kvällen. Hur mycket godis finns kvar i skålen efteråt?",
            en: "In a bowl there was {n1}/{d1} kg of candy. The children eat {n2}/{d2} kg during the evening. How much candy is left in the bowl afterward?"
        },
        {
            sv: "Du har sorterat {n1}/{d1} av dina skolarbeten i en mapp. Under en rensning tar du bort gamla filer som utgör {n2}/{d2} av hela mappen. Hur stor del är kvar?",
            en: "A warehouse had {n1}/{d1} of its items sorted. During a check, damage was found on {n2}/{d2} of the total items, and these were removed. What fraction is sorted and defect-free?"
        },
        {
            sv: "Bensintanken på en moped var fylld till {n1}/{d1}. Efter en åktur har en mängd motsvarande {n2}/{d2} av tankens totala volym gått åt. Hur stor del bensin är kvar?",
            en: "A tanker truck's cistern was filled to {n1}/{d1} with gasoline. At the first station, an amount corresponding to {n2}/{d2} of the tank's total volume was pumped out. What fraction of gasoline is left in the cistern?"
        },
        {
            sv: "Du har köpt ett tygstycke som är {n1}/{d1} meter långt. Du klipper bort en bit på {n2}/{d2} meter för att sy en kudde. Hur långt är tygstycket som återstår?",
            en: "You bought a piece of fabric that is {n1}/{d1} meters long. You cut off a piece of {n2}/{d2} meters to sew a pillow. How long is the remaining piece of fabric?"
        },
        {
            sv: "Du har sparat ner spel på din hårddisk som tar upp {n1}/{d1} av utrymmet. Du raderar några gamla spel som motsvarar {n2}/{d2} av hela disken. Hur stor del upptas nu?",
            en: "A transport company usually has {n1}/{d1} of its vehicles in operation. Due to urgent servicing, they are forced to ground {n2}/{d2} of their entire fleet. What fraction of the fleet is still running?"
        },
        {
            sv: "Du har ett dekorationsband som är {n1}/{d1} meter långt. Du klipper av en bit på {n2}/{d2} meter till ett paket. Hur lång del av bandet är kvar?",
            en: "A farmer harvested {n1}/{d1} of a large field. A machine breaks down, meaning an area corresponding to {n2}/{d2} of the whole field is lost. What fraction of the field's harvest is left?"
        },
        {
            sv: "Ett juicepaket innehöll {n1}/{d1} liter dricka. Du häller upp ett glas till mellis som rymmer {n2}/{d2} liter. Hur mycket juice finns kvar i paketet?",
            en: "A juice carton contained {n1}/{d1} liters of drink. You pour a glass for a snack holding {n2}/{d2} liters. How much juice is left in the carton?"
        },
        {
            sv: "Du fick {n1}/{d1} kr i månadspeng den här månaden. Du köper ett föremål i ett spel för {n2}/{d2} av hela summan. Hur stor del av månadspengen har du kvar?",
            en: "You received {n1}/{d1} kr in monthly allowance this month. You buy an item in a game for {n2}/{d2} of the total sum. What fraction of the allowance do you have left?"
        },
        {
            sv: "En speltimer för en utmaning var inställd på {n1}/{d1} av en timme. När du startar dras en tidsbonus bort på {n2}/{d2} av en timme. Hur stor del av tiden har du på dig nu?",
            en: "A game timer for a challenge was set to {n1}/{d1} of an hour. When you start, a time bonus of {n2}/{d2} of an hour is deducted. What fraction of the time do you have now?"
        },
        {
            sv: "Det ligger {n1}/{d1} av en familjepizza kvar i kartongen. Du tar en bit till kvällsmat som motsvarar {n2}/{d2} av hela pizzan. Hur stor del ligger kvar i kartongen sedan?",
            en: "There is {n1}/{d1} of a family pizza left in the box. You take a slice for supper corresponding to {n2}/{d2} of the whole pizza. What fraction is left in the box afterward?"
        },
        {
            sv: "Ett ljus som brann under kvällen har minskat med {n1}/{d1} av sin ursprungliga längd. Efter en stund till har det brunnit ner {n2}/{d2} till. Hur stor del av längden har brunnit ner totalt?",
            en: "A candle burning during the evening decreased by {n1}/{d1} of its original length. After a while longer, it burned down another {n2}/{d2}. What fraction of the length burned down in total?"
        }
    ],

    // =========================================================================
    // 🎯 5. FRAC MIXED ADD (Requires placeholders: {w1}, {n1}, {d1}, {w2}, {n2}, {d2})
    // =========================================================================
    frac_mixed_add: [
        {
            sv: "En snickare använder {w1} {n1}/{d1} meter virke till en hylla och {w2} {n2}/{d2} meter till en annan. Hur mycket virke går åt totalt?",
            en: "A carpenter uses {w1} {n1}/{d1} meters of lumber for one shelf and {w2} {n2}/{d2} meters for another. How much lumber is used in total?"
        },
        {
            sv: "Till ett bakrecept behövs {w1} {n1}/{d1} deciliter socker till degen och {w2} {n2}/{d2} deciliter till glasyren. Hur mycket socker behövs sammanlagt?",
            en: "A baking recipe requires {w1} {n1}/{d1} deciliters of sugar for the dough and {w2} {n2}/{d2} deciliters for the icing. How much sugar is needed in total?"
        },
        {
            sv: "Vid redigering av en video klipper du ihop en sekvens på {w1} {n1}/{d1} minuter med en sista del på {w2} {n2}/{d2} minuter. Hur lång blir videon totalt?",
            en: "A forestry team clears {w1} {n1}/{d1} hectares of land during the first week and {w2} {n2}/{d2} hectares during the second week. How many hectares have they cleared in total?"
        },
        {
            sv: "En målare förbrukar {w1} {n1}/{d1} burkar färg på rummets väggar och {w2} {n2}/{d2} burkar på listerna runt om. Hur många burkar färg går åt sammanlagt?",
            en: "A painter consumes {w1} {n1}/{d1} cans of paint on the front of the house and {w2} {n2}/{d2} cans on the back of the house. How many cans of paint are used in total?"
        },
        {
            sv: "Du packar ner två paket i din ryggsäck som väger {w1} {n1}/{d1} kg respektive {w2} {n2}/{d2} kg. Vad blir deras sammanlagda vikt i väskan?",
            en: "Two freight containers weigh {w1} {n1}/{d1} tons and {w2} {n2}/{d2} tons respectively. What is their combined weight if loaded onto the same truck?"
        },
        {
            sv: "En löpare vilar efter att ha sprungit {w1} {n1}/{d1} kilometer och fortsätter sedan ytterligare {w2} {n2}/{d2} kilometer. Hur långt har löparen sprungit totalt?",
            en: "A runner rests after running {w1} {n1}/{d1} kilometers and then continues for another {w2} {n2}/{d2} kilometers. How far has the runner jogged in total?"
        },
        {
            sv: "Till en fest köps det in {w1} {n1}/{d1} stora påsar med chips och {w2} {n2}/{d2} påsar till med annat snacks. Hur många påsar snacks blir det sammanlagt?",
            en: "A farmer sells {w1} {n1}/{d1} bags of potatoes in the morning and {w2} {n2}/{d2} bags in the afternoon. How many bags of potatoes has the farmer sold during the day?"
        },
        {
            sv: "Under helgen åker du moped {w1} {n1}/{d1} kilometer på lördagen och {w2} {n2}/{d2} kilometer till på söndagen. Hur långt har du kört moped totalt?",
            en: "A road construction crew finishes {w1} {n1}/{d1} kilometers of road before the holidays and {w2} {n2}/{d2} kilometers after the holidays. How much road has been built in total?"
        },
        {
            sv: "För att göra en fruktsmoothie mixar du {w1} {n1}/{d1} hekto bananer med {w2} {n2}/{d2} hekto frysta jordgubbar. Hur mycket väger frukten sammanlagt?",
            en: "In a fruit shop, first {w1} {n1}/{d1} boxes of apples are sold and then {w2} {n2}/{d2} boxes of pears. How many boxes of fruit have been sold in total?"
        },
        {
            sv: "En familj köper {w1} {n1}/{d1} kilo mat till en grillkväll och kompletterar med {w2} {n2}/{d2} kilo tillbehör. Hur mycket har de köpt sammanlagt?",
            en: "A family buys {w1} {n1}/{d1} kg of barbecue meat for a party and supplements it with {w2} {n2}/{d2} kg of sausages. How much have they bought in total?"
        },
        {
            sv: "Du använder {w1} {n1}/{d1} nystan med garn till en halsduk och behöver {w2} {n2}/{d2} nystan till för att göra den helt klar. Hur mycket går åt totalt?",
            en: "You use {w1} {n1}/{d1} skeins of yarn for a scarf and need another {w2} {n2}/{d2} skeins to complete it. How much is used in total?"
        },
        {
            sv: "Under en helg la du {w1} {n1}/{d1} timmar på att titta på en serie och {w2} {n2}/{d2} timmar på att spela dator. Hur mycket tid la du på det totalt?",
            en: "Over a weekend, you spent {w1} {n1}/{d1} hours watching a series and {w2} {n2}/{d2} hours gaming. How much time did you spend in total?"
        },
        {
            sv: "För att fixa ett tygstycke till en gardin behövs {w1} {n1}/{d1} meter tyg och till en annan del går det åt {w2} {n2}/{d2} meter till. Hur mycket tyg går åt totalt?",
            en: "To prepare a fabric piece for a curtain, {w1} {n1}/{d1} meters of fabric are needed and for another section another {w2} {n2}/{d2} meters are used. How much fabric is used total?"
        },
        {
            sv: "Till din hund köper du en påse torrfoder på {w1} {n1}/{d1} kg och en mindre påse hundgodis på {w2} {n2}/{d2} kg. Vad väger djurmaten sammanlagt?",
            en: "For your dog, you buy a bag of dry food weighing {w1} {n1}/{d1} kg and a smaller bag of treats weighing {w2} {n2}/{d2} kg. What does the pet food weigh in total?"
        },
        {
            sv: "Inför ett födelsedagskalas köps det in {w1} {n1}/{d1} liter läsk och {w2} {n2}/{d2} liter saft till gästerna. Hur mycket dryck har köpts in totalt?",
            en: "Ahead of a birthday party, {w1} {n1}/{d1} liters of soda and {w2} {n2}/{d2} liters of juice are purchased for the guests. How much drink has been bought in total?"
        }
    ],

    // =========================================================================
    // 🎯 6. FRAC MIXED SUB (Requires placeholders: {w1}, {n1}, {d1}, {w2}, {n2}, {d2})
    // =========================================================================
    frac_mixed_sub: [
        {
            sv: "Ett bageri har {w1} {n1}/{d1} säckar mjöl på lager. Under morgonen går det åt {w2} {n2}/{d2} säckar. Hur mycket mjöl finns kvar på lagret?",
            en: "A bakery has {w1} {n1}/{d1} bags of flour in stock. During the morning, {w2} {n2}/{d2} bags are used. How much flour is left in stock?"
        },
        {
            sv: "En hantverkare har en {w1} {n1}/{d1} meter lång vajer till ett bygge. Han kapar bort en bit på {w2} {n2}/{d2} meter. Hur mycket vajer återstår?",
            en: "A construction worker has a wire rope that is {w1} {n1}/{d1} meters long. He cuts off a piece of {w2} {n2}/{d2} meters. How much wire rope remains?"
        },
        {
            sv: "Ett fik köpte in {w1} {n1}/{d1} kilo ost till sina mackor. Efter helgen har man förbrukat {w2} {n2}/{d2} kilo. Hur mycket ost finns kvar i kylen?",
            en: "A restaurant purchased {w1} {n1}/{d1} kg of cheese. After the weekend, the chefs consumed {w2} {n2}/{d2} kg of it. How much cheese is left in the fridge?"
        },
        {
            sv: "Ett akvarium i ett rum hade en vattenhöjd på {w1} {n1}/{d1} dm. Under en vecka avdunstade vattnet så att nivån sjönk med {w2} {n2}/{d2} dm. Vilken är vattenhöjden nu?",
            en: "A watercourse had a flow height of {w1} {n1}/{d1} meters. During a dry week, the water level dropped by {w2} {n2}/{d2} meters. What is the flow height now?"
        },
        {
            sv: "Du har fyllt en mopedtank med {w1} {n1}/{d1} liter bensin. Efter en åktur har du förbrukat {w2} {n2}/{d2} liter. Hur mycket bensin är kvar i tanken?",
            en: "You filled a tank with {w1} {n1}/{d1} liters of gasoline. After a road trip, you have consumed {w2} {n2}/{d2} liters. How much gasoline is left in the tank?"
        },
        {
            sv: "En elev har samlat ihop {w1} {n1}/{d1} kilo lera till bildlektionen. Han använder {w2} {n2}/{d2} kilo till en skulptur. Hur mycket lera finns kvar i burken?",
            en: "A gardener collected {w1} {n1}/{d1} kg of soil. He spreads {w2} {n2}/{d2} kg in a greenhouse. How much soil is left in his storage area?"
        },
        {
            sv: "En bit dekorationsband mäter {w1} {n1}/{d1} meter. Du sågar bort en skadad ändbit på {w2} {n2}/{d2} meter. Hur långt är bandet efter kapningen?",
            en: "A piece of timber measures {w1} {n1}/{d1} meters. A craftsman saws off a defective end piece of {w2} {n2}/{d2} meters. How long is the timber after cutting?"
        },
        {
            sv: "Du har bokat upp {w1} {n1}/{d1} GB lagringsutrymme på en extern disk. På grund av en rensning raderar du filer på {w2} {n2}/{d2} GB. Hur stort utrymme upptas nu?",
            en: "A transport company has booked {w1} {n1}/{d1} tons of freight capacity on a cargo train. Due to a change, {w2} {n2}/{d2} tons are removed from the booking. How large a freight volume remains?"
        },
        {
            sv: "En idrottsförening hade {w1} {n1}/{d1} timmar halltid bokad under en månad. De avbokar {w2} {n2}/{d2} timmar på grund av matchkrockar. Hur mycket halltid har de kvar?",
            en: "A sports club had {w1} {n1}/{d1} hours of gym time booked during a month. They cancel {w2} {n2}/{d2} hours due to match clashes. How much gym time do they have left?"
        },
        {
            sv: "En skräddare har {w1} {n1}/{d1} meter sidentyg på rullen. Efter att ha sytt en kjol har {w2} {n2}/{d2} meter tyg gått åt. Hur mycket sidentyg finns kvar?",
            en: "A tailor has {w1} {n1}/{d1} meters of silk fabric. After sewing a dress, {w2} {n2}/{d2} meters of fabric have been used. How much silk fabric is left on the roll?"
        },
        {
            sv: "En glassbar har {w1} {n1}/{d1} stora lådor med vaniljglass i frysen. Efter en solig eftermiddag har man sålt bort {w2} {n2}/{d2} lådor. Hur mycket glass finns kvar?",
            en: "An ice cream shop has {w1} {n1}/{d1} large tubs of vanilla ice cream in the freezer. After a sunny afternoon, {w2} {n2}/{d2} tubs are sold. How much ice cream is left?"
        },
        {
            sv: "Du köpte en stor behållare med {w1} {n1}/{d1} kg proteinpulver till din träning. Efter en månad har du använt {w2} {n2}/{d2} kg. Hur mycket pulver finns kvar?",
            en: "You bought a large container with {w1} {n1}/{d1} kg of protein powder for your training. After a month, you have used {w2} {n2}/{d2} kg. How much powder remains?"
        },
        {
            sv: "Ett träningskort på ett gym hade en giltighetstid på {w1} {n1}/{d1} timmar. Du har utnyttjat {w2} {n2}/{d2} timmar till pass. Hur mycket tid har du kvar på kortet?",
            en: "A gym pass had a validity of {w1} {n1}/{d1} hours. You have utilized {w2} {n2}/{d2} hours for sessions. How much time do you have left on the card?"
        },
        {
            sv: "Efter ett kalas fanns det {w1} {n1}/{d1} stora flaskor med läsk kvar i köket. Under kvällen dricker familjen upp {w2} {n2}/{d2} flaskor. Hur mycket läsk finns kvar?",
            en: "After a party, there were {w1} {n1}/{d1} large bottles of soda left in the kitchen. During the evening, the family finishes {w2} {n2}/{d2} bottles. How much soda is left?"
        },
        {
            sv: "Ett kopieringspapper i skolan innehöll {w1} {n1}/{d1} hela paket papper. Lärarna använde {w2} {n2}/{d2} paket till ett prov. Hur många paket papper finns kvar i maskinen?",
            en: "A copier station at school contained {w1} {n1}/{d1} full packages of paper. The teachers used {w2} {n2}/{d2} packages for an exam. How many packages of paper are left?"
        }
    ],

    // =========================================================================
    // 🎯 7. FRAC MULTIPLICATION (Requires placeholders: {n1}, {d1}, {n2}, {d2})
    // =========================================================================
    frac_multiplication: [
        {
            sv: "En gräsmatta täcker {n1}/{d1} av en villatomt. Du klipper {n2}/{d2} av denna gräsmatta innan regnet börjar. Hur stor del av hela tomten har du klippt?",
            en: "A lawn covers {n1}/{d1} of a backyard lot. You mow {n2}/{d2} of this lawn before it starts raining. What fraction of the entire lot have you mowed?"
        },
        {
            sv: "En odlingslott utgörs till {n1}/{d1} av öppen mark. På {n2}/{d2} av denna areal odlas det morötter. Hur stor del av hela lotten består av morotsodling?",
            en: "A field is made up of {n1}/{d1} cultivation land. On {n2}/{d2} of this acreage, carrots are grown. What fraction of the entire field consists of carrots?"
        },
        {
            sv: "I ett akvarium är {n1}/{d1} av fiskarna färgglada arter. Av dessa fiskar utgörs {n2}/{d2} av neontetror. Hur stor del av samtliga fiskar i akvariet är neontetror?",
            en: "In an aquarium, {n1}/{d1} of the fish are tropical species. Of these tropical fish, {n2}/{d2} are neon tetras. What fraction of all fish in the aquarium are neon tetras?"
        },
        {
            sv: "Du väljer att spara {n1}/{d1} av din månadspeng på ett konto. Av dessa sparade pengar lägger du {n2}/{d2} på att köpa ett datorspel. Hur stor del av månadspengen gick till spelet?",
            en: "A company allocates {n1}/{d1} of its profits to environmental projects. Of this money, {n2}/{d2} goes directly to tree planting. What fraction of the total profit goes to tree planting?"
        },
        {
            sv: "En färgburk är fylld till {n1}/{d1} med vit färg. Du använder {n2}/{d2} av färgen till att måla en liten pall. Hur stor del av en hel färgburk gick åt till pallen?",
            en: "A paint can is filled to {n1}/{d1} with base paint. You use {n2}/{d2} of that paint to paint a stool. What fraction of a full paint can was used for the stool?"
        },
        {
            sv: "Av eleverna på en skola läser {n1}/{d1} ett modernt språk som tillval. Bland dessa elever har {n2}/{d2} valt spanska. Hur stor del av skolans totala elevantal läser spanska?",
            en: "Of the students at a college, {n1}/{d1} study computer science. Among these computer science students, {n2}/{d2} chose an AI specialization. What fraction of the total college student body studies AI?"
        },
        {
            sv: "Ett bakrecept rekommenderar att fylla {n1}/{d1} av en form med smet. Om {n2}/{d2} av denna smet ska bestå av krossade chokladknappar, hur stor del av formen täcks av choklad?",
            en: "A recipe recommends filling {n1}/{d1} of a baking dish with vegetables. If {n2}/{d2} of the vegetables are to be sliced onions, what fraction of the baking dish is covered by onions?"
        },
        {
            sv: "En bit grepptejp täcker {n1}/{d1} av ovansidan på en skateboard. Du väljer att rita ett mönster på {n2}/{d2} av denna tejpade yta. Hur stor del av hela brädan täcks av mönstret?",
            en: "A freight train is loaded so that {n1}/{d1} of the cars carry timber. Of these timber cars, {n2}/{d2} are to be uncoupled in Skövde. What fraction of all the train's cars will be deleted in Skövde?"
        },
        {
            sv: "Ett videoklipp har bearbetats så att {n1}/{d1} av filen är färdigrenderad. Under en kontroll laddas {n2}/{d2} av denna färdiga del upp på nätet. Hur stor del av hela klippet har laddats upp?",
            en: "A land area corresponding to {n1}/{d1} of a forest property is designated as a nature reserve. On {n2}/{d2} of this reserve land, entry is strictly prohibited. What fraction of the entire property is covered by the restriction?"
        },
        {
            sv: "En frukthandlare använder {n1}/{d1} av sitt förråd till att göra smoothies. Av denna frukt utgörs {n2}/{d2} av pressade apelsiner. Hur stor del av hela förrådet blir till apelsinjuice?",
            en: "A bakery uses {n1}/{d1} of its daily butter for baking buns. Of this butter, {n2}/{d2} goes into the filling. What fraction of the bakery's total butter consumption is used for the bun filling?"
        },
        {
            sv: "Skärmen på din telefon drar {n1}/{d1} av batteriets ström under en dag. En specifik app står ensam för {n2}/{d2} av skärmens strömförbrukning. Hur stor del av hela batteriet drog appen?",
            en: "Your phone screen uses {n1}/{d1} of the battery during a day. A specific app accounts for {n2}/{d2} of the screen's power usage. What fraction of the total battery did the app draw?"
        },
        {
            sv: "Du lägger {n1}/{d1} av din lediga tid på läxor under en vecka. Av denna studietid läggs {n2}/{d2} på att lösa matteuppgifter. Hur stor del av din lediga tid la du på matte?",
            en: "You spend {n1}/{d1} of your free time on homework during a week. Of this study time, {n2}/{d2} is spent solving math problems. What fraction of your free time did you spend on math?"
        },
        {
            sv: "I en påse surt godis är {n1}/{d1} av bitarna röda nappar. När du räknar dem ser du att {n2}/{d2} av de röda napparna har smaken sur vattenmelon. Hur stor del av hela påsen är sur vattenmelon?",
            en: "In a bag of sour candy, {n1}/{d1} of the pieces are red drops. When counting them, you see that {n2}/{d2} of the red drops have a sour watermelon flavor. What fraction of the whole bag is sour watermelon?"
        },
        {
            sv: "I Hugos garderob utgörs {n1}/{d1} av alla plagg av tröjor. Av dessa tröjor är {n2}/{d2} svarta hoodies. Hur stor del av alla hans kläder i garderoben är svarta hoodies?",
            en: "In Hugo's wardrobe, {n1}/{d1} of all garments consist of shirts. Of these shirts, {n2}/{d2} are black hoodies. What fraction of all his clothes in the wardrobe are black hoodies?"
        },
        {
            sv: "En spellista på Spotify innehåller {n1}/{d1} låtar som är hiphop. Av dessa hiphop-låtar är {n2}/{d2} gjorda av samma favoritartist. Hur stor del av hela spellistan är låtar med din favoritartist?",
            en: "A Spotify playlist contains {n1}/{d1} songs that are hip-hop. Of these hip-hop tracks, {n2}/{d2} are made by the same favorite artist. What fraction of the entire playlist consists of songs by your favorite artist?"
        }
    ],

    // =========================================================================
    // 🎯 8. FRAC DIVISION (Requires placeholders: {n1}, {d1}, {n2}, {d2})
    // =========================================================================
    frac_division: [
        {
            sv: "Du har {n1}/{d1} liter juice som ska fördelas i små bägare. Varje bägare rymmer {n2}/{d2} liter. Hur många bägare kan du fylla?",
            en: "You have {n1}/{d1} liters of juice to be distributed into small cups. Each cup holds {n2}/{d2} liters. How many cups can you fill?"
        },
        {
            sv: "Ett snöre mäter {n1}/{d1} meter. Du klipper snöret i korta bitar till armband där varje bit ska vara {n2}/{d2} meter lång. Hur många sådana bitar får du ut?",
            en: "A piece of string measures {n1}/{d1} meters. You cut the string into smaller pieces where each piece must be {n2}/{d2} meters long. How many such pieces do you get?"
        },
        {
            sv: "En burk innehåller {n1}/{d1} kilo proteinpulver till träningen. Varje portion du blandar till kräver {n2}/{d2} kilo pulver. Hur många portioner räcker burken till?",
            en: "A laboratory experiment requires doses of {n2}/{d2} grams of a powder. You have a container with {n1}/{d1} grams of powder left. How many full doses will it last for?"
        },
        {
            sv: "Du har en flaska som innehåller {n1}/{d1} liter färg till ett bygge. Du portionerar ut vätskan i mindre skålar som rymmer {n2}/{d2} liter var. Hur många skålar kan du fylla?",
            en: "A machine fills small perfume bottles holding {n2}/{d2} liters each. The machine has a reservoir with {n1}/{d1} liters of perfume oil left. How many bottles can the machine fill?"
        },
        {
            sv: "Du har en flaska med {n1}/{d1} centiliter såpvatten. Du ska fylla små rör med bubbelvätska som rymmer {n2}/{d2} centiliter styck. Hur många rör kan du fylla helt?",
            en: "A medical lab distributes {n1}/{d1} centiliters of serum into test tubes holding {n2}/{d2} centiliters each. How many test tubes can they fill completely?"
        },
        {
            sv: "En slöjdlärare har en träläkt på {n1}/{d1} meter. Eleverna ska såga till bitar som är {n2}/{d2} meter långa till ett projekt. Hur många bitar räcker läkten till?",
            en: "A woodwork teacher has a wooden lath measuring {n1}/{d1} meters. The students need to saw pieces that are {n2}/{d2} meters long for a project. How many pieces will the lath yield?"
        },
        {
            sv: "En trädgårdsmästare portionerar ut flytande växtnäring. Han har {n1}/{d1} liter näring och varje planta ska ha {n2}/{d2} liter. Till hur många plantor räcker näringen?",
            en: "A gardener portions out liquid plant fertilizer. He has {n1}/{d1} liters of fertilizer, and each plant requires {n2}/{d2} liters. For how many plants will the fertilizer suffice?"
        },
        {
            sv: "En stor påse med godis väger {n1}/{d1} kilo. Du ska fördela godiset i mindre kalaspåsar som rymmer {n2}/{d2} kilo styck. Hur många påsar kan du fylla helt?",
            en: "A shipment of {n1}/{d1} tons of gravel is to be distributed into smaller bags holding {n2}/{d2} tons each. How many such bags can be filled completely?"
        },
        {
            sv: "En bagare ska dela upp en stor deg som väger {n1}/{d1} kilo till mindre brödbullar. Varje bulle ska vika {n2}/{d2} kilo före gräddning. Hur många bullar får bagaren ut?",
            en: "A baker needs to divide a large dough weighing {n1}/{d1} kg into smaller buns. Each bun must weigh {n2}/{d2} kg before baking. How many buns will the baker get?"
        },
        {
            sv: "En stor kanna innehåller {n1}/{d1} deciliter varm choklad. Du häller upp drycken i mindre koppar som rymmer {n2}/{d2} deciliter styck. Hur många koppar kan du fylla?",
            en: "A coffee bar serves tasting cups of espresso holding {n2}/{d2} deciliters each. The brewer contains {n1}/{d1} deciliters of espresso. How many cups can be filled?"
        },
        {
            sv: "Du har en flaska med {n1}/{d1} liter läsk kvar efter en fest. Du häller upp läsken i mindre glas som rymmer {n2}/{d2} liter var. Hur många glas räcker det till?",
            en: "You have a bottle containing {n1}/{d1} liters of soda left after a party. You pour the soda into small glasses holding {n2}/{d2} liters each. How many glasses can you fill?"
        },
        {
            sv: "En dunk innehåller {n1}/{d1} liter bensin. Du portionerar ut bränslet i små reservflaskor till en moped där varje flaska rymmer {n2}/{d2} liter. Hur många flaskor kan fyllas?",
            en: "A canister contains {n1}/{d1} liters of gasoline. You portion out the fuel into small reserve bottles for a moped, where each bottle holds {n2}/{d2} liters. How many bottles can be filled?"
        },
        {
            sv: "Ett dekorationsband på en rulle mäter {n1}/{d1} meter. Till en skolfest ska bandet klippas upp i korta bitar på {n2}/{d2} meter var. Hur många bitar räcker rullen till?",
            en: "A colored ribbon on a roll measures {n1}/{d1} meters. For a school party, the ribbon is to be cut into short pieces of {n2}/{d2} meters each. How many pieces will the roll last for?"
        },
        {
            sv: "En stor förpackning innehåller {n1}/{d1} kilo snacks. Du ska hälla upp innehållet i små skålar till kompisarna där varje skål rymmer {n2}/{d2} kilo. Hur många skålar kan du fylla?",
            en: "A large package contains {n1}/{d1} kg of snacks. You are going to pour the contents into small bowls for your friends, where each bowl holds {n2}/{d2} kg. How many bowls can you fill?"
        },
        {
            sv: "En hel rulle med monteringstejp är {n1}/{d1} meter lång. Du klipper upp hela rullen i korta bitar som mäter {n2}/{d2} meter var. Hur många tejpbitar får du ut totalt?",
            en: "A whole roll of mounting tape is {n1}/{d1} meters long. You cut up the entire roll into short pieces measuring {n2}/{d2} meters each. How many pieces of tape do you get in total?"
        }
    ]
};