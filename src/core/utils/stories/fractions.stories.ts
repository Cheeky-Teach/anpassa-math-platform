import { StoryScenario } from '../WordProblemInterceptor.js';

export const FRACTION_STORIES: Record<string, StoryScenario[]> = {
    frac_same_denom_add: [
        {
            sv: "Leo äter {n1}/{d} av en pizza på eftermiddagen och {n2}/{d} till av samma pizza på kvällen. Hur stor del av pizzan har han ätit totalt?",
            en: "Leo eats {n1}/{d} of a pizza in the afternoon, and another {n2}/{d} of the same pizza in the evening. What fraction of the pizza has he eaten in total?"
        },
        {
            sv: "I en färgburk finns det {n1}/{d} liter vit färg. Du häller i ytterligare {n2}/{d} liter i burken. Hur mycket färg innehåller den nu?",
            en: "A paint can contains {n1}/{d} liters of white paint. You pour another {n2}/{d} liters into the can. How much paint does it contain now?"
        },
        {
            sv: "På måndagen läste Hanna {n1}/{d} av en bok, och på tisdagen läste hon ytterligare {n2}/{d} av boken. Hur stor del har hon läst totalt?",
            en: "On Monday Hanna read {n1}/{d} of a book, and on Tuesday she read another {n2}/{d} of the book. What fraction has she read in total?"
        },
        {
            sv: "En löpare har sprungit {n1}/{d} av ett motionsspår och fortsätter sedan {n2}/{d} till innan nästa drickapaus. Hur stor del av spåret är har hen sprungit?",
            en: "A runner completes {n1}/{d} of a jogging track and then continues for another {n2}/{d} before their next water break. What fraction of the track is completed now?"
        },
        {
            sv: "På en bondgård används {n1}/{d} av ytan till potatis och {n2}/{d} av ytan till morötter. Hur stor del av gården upptas av dessa två grönsaker tillsammans?",
            en: "In a garden plot, {n1}/{d} of the area is used for potatoes and {n2}/{d} of the area for carrots. What fraction of the plot is occupied by these two vegetables combined?"
        },
        {
            sv: "Vid frukosten drack familjen {n1}/{d} liter mjölk och till middagen drack de {n2}/{d} liter till ur ett stort mjölkpaket. Hur mycket mjölk gick åt totalt?",
            en: "During breakfast the family drank {n1}/{d} liters of milk, and at dinner they drank another {n2}/{d} liters from a large milk carton. How much milk did they use in total?"
        },
        {
            sv: "En snickare monterar en gipsskiva som täcker {n1}/{d} av en vägg. En skiva till fästs bredvid och täcker {n2}/{d} till av väggen. Hur stor del av väggen är nu täckt?",
            en: "A carpenter mounts a drywall panel covering {n1}/{d} of a wall. Another panel is attached next to it, covering another {n2}/{d} of the wall. What fraction of the wall is now covered?"
        },
        {
            sv: "Av de anställda på ett kontor pendlar {n1}/{d} med tåg och {n2}/{d} med buss. Hur stor del av personalen pendlar med antingen tåg eller buss?",
            en: "Of the employees at an office, {n1}/{d} commute by train and {n2}/{d} by bus. What fraction of the staff commutes by either train or bus?"
        },
        {
            sv: "En maskintank är fylld till {n1}/{d} med hydraulolja. Mekanikern fyller på med ytterligare {n2}/{d} av tankens totala volym. Hur stor del av tanken är fylld nu?",
            en: "A machine tank is filled to {n1}/{d} with hydraulic oil. The mechanic tops it up with another {n2}/{d} of the tank's total volume. What fraction of the tank is filled now?"
        },
        {
            sv: "Liam målar {n1}/{d} av ett staket på förmiddagen och hinner med {n2}/{d} till under eftermiddagen. Hur stor del av staketet har han målat under dagen?",
            en: "Liam paints {n1}/{d} of a fence in the morning and manages another {n2}/{d} during the afternoon. What fraction of the fence has he painted during the day?"
        }
    ],

    frac_same_denom_sub: [
        {
            sv: "En flaska innehåller {n1}/{d} liter juice. Saga dricker upp {n2}/{d} liter. Hur mycket juice finns kvar i flaskan?",
            en: "A bottle contains {n1}/{d} liters of juice. Saga drinks {n2}/{d} liters of it. How much juice is left in the bottle?"
        },
        {
            sv: "En skola renoverade olika rum och hade {n1}/{d} av sin budget kvar, men efter ett inköp drogs {n2}/{d} av den ursprungliga budgeten bort. Hur stor del av budgeten återstår?",
            en: "A school project had {n1}/{d} of its budget remaining, but a purchase subtracted {n2}/{d} of the original budget. What fraction of the budget remains?"
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
            sv: "Ett cykelhjul hade {n1}/{d} av sin fulla luftkapacitet. På grund av en pyspunka försvann {n2}/{d} av kapaciteten. Hur stor del luft är kvar i hjulet?",
            en: "A bicycle wheel had {n1}/{d} of its full air capacity. Due to a small leak, {n2}/{d} of the capacity escaped. What fraction of air is left in the wheel?"
        },
        {
            sv: "En tygrulle mäter {n1}/{d} av en hel rulle. En skräddare klipper av en bit som motsvarar {n2}/{d} av en hel rulle. Hur stor del av rullen finns kvar?",
            en: "A roll of fabric measures {n1}/{d} of a full roll. A tailor cuts off a piece corresponding to {n2}/{d} of a full roll. What fraction of the roll remains?"
        },
        {
            sv: "Ett batteri var laddat till {n1}/{d} av sin maxkapacitet. Efter en stunds användning har laddningen sjunkit med {n2}/{d} av maxkapaciteten. Vad är laddningsnivån nu?",
            en: "A battery was charged to {n1}/{d} of its maximum capacity. After some use, the charge dropped by {n2}/{d} of the maximum capacity. What is the charge level now?"
        },
        {
            sv: "I en skogsdunge är {n1}/{d} av träden tallar. Man gallrar området och tar bort tallar motsvarande {n2}/{d} av det totala trädbeståndet. Hur stor del av dungen är nu tallar?",
            en: "In a small grove, {n1}/{d} of the trees are pines. The area is thinned out, removing pines equal to {n2}/{d} of the total tree stock. What fraction of the grove is now pine trees?"
        },
        {
            sv: "En flyttbil var fylld till {n1}/{d} av sin maxvolym. Vid det första stoppet lastades flyttlådor ut som motsvarade {n2}/{d} av maxvolymen. Hur stor del av bilen är fylld nu?",
            en: "A moving truck was filled to {n1}/{d} of its maximum volume. At the first stop, moving boxes corresponding to {n2}/{d} of the maximum volume were unloaded. What fraction of the truck is filled now?"
        },
        {
            sv: "I en fruktskål är {n1}/{d} av frukterna ekologiska. Barnen äter upp en mängd som motsvarar {n2}/{d} av skålens totala innehåll. Hur stor andel ekologisk frukt ligger kvar?",
            en: "In a fruit bowl, {n1}/{d} of the fruits are organic. The children eat an amount corresponding to {n2}/{d} of the bowl's total contents. What fraction of organic fruit is left?"
        }
    ],

    frac_diff_denom_add: [
        {
            sv: "Maja spenderar {n1}/{d1} av sina sparpengar på böcker och {n2}/{d2} på cafébesök. Hur stor del av sina totala sparpengar har hon gjort av med?",
            en: "Maja spends {n1}/{d1} of her savings on books and {n2}/{d2} on café visits. What fraction of her total savings has she spent?"
        },
        {
            sv: "En blomsterback består till {n1}/{d1} av rosor och till {n2}/{d2} av tulpaner. Hur stor del av ytan upptas av dessa två blomsorter tillsammans?",
            en: "A flowerbed consists of {n1}/{d1} roses and {n2}/{d2} tulips. What fraction of the area is occupied by these two types of flowers combined?"
        },
        {
            sv: "En kemist blandar vätskor i ett provrör. Först hälls {n1}/{d1} liter syra i röret och sedan tillsätts {n2}/{d2} liter destillerat vatten. Vad är den totala volymen i röret?",
            en: "A chemist mixes liquids in a test tube. First, {n1}/{d1} liters of acid are poured into the tube, and then {n2}/{d2} liters of distilled water are added. What is the total volume in the tube?"
        },
        {
            sv: "Under förmiddagen plockade Oliver {n1}/{d1} kilo bär, och under eftermiddagen plockade han {n2}/{d2} kilo bär till. Hur mycket bär har han plockat totalt under dagen?",
            en: "During the morning Oliver picked {n1}/{d1} kg of berries, and during the afternoon he picked another {n2}/{d2} kg of berries. How many berries has he picked in total today?"
        },
        {
            sv: "En musiker har skrivit {n1}/{d1} av ett musikstycke och komponerar sedan ytterligare {n2}/{d2} av stycket. Hur stor del av hela stycket är färdigt nu?",
            en: "A musician has written {n1}/{d1} of a piece of music and then composes another {n2}/{d2} of it. What fraction of the entire piece is finished now?"
        },
        {
            sv: "För att blanda till en grön nyans använder en målare {n1}/{d1} liter blå färg och {n2}/{d2} liter gul färg. Hur mycket färdig färgblandning ger detta?",
            en: "To mix a shade of green, a painter uses {n1}/{d1} liters of blue paint and {n2}/{d2} liters of yellow paint. How much total paint mixture does this yield?"
        },
        {
            sv: "Ett fraktfartyg lastar {n1}/{d1} av sin maxkapacitet i Göteborg och ytterligare {n2}/{d2} av kapaciteten i Malmö. Hur stor del av fartygets totala kapacitet är utnyttjad?",
            en: "A cargo ship loads {n1}/{d1} of its maximum capacity in Gothenburg and another {n2}/{d2} of its capacity in Malmö. What fraction of the ship's total capacity is utilized?"
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
            sv: "Under det första dygnet fylldes en pool till {n1}/{d1} av sin volym, och under det andra dygnet fylldes ytterligare {n2}/{d2}. Hur stor del av poolen är fylld efter de två dygnen?",
            en: "During the first day, a pool was filled to {n1}/{d1} of its volume, and during the second day another {n2}/{d2} was filled. What fraction of the pool is filled after the two days?"
        }
    ],

    frac_diff_denom_sub: [
        {
            sv: "Linus har en planka som är {n1}/{d1} meter lång. Han sågar bort en bit som är {n2}/{d2} meter. Hur lång är plankan som är kvar?",
            en: "Linus has a wooden plank that is {n1}/{d1} meters long. He saws off a piece measuring {n2}/{d2} meters. How long is the remaining plank?"
        },
        {
            sv: "I en kanna finns det {n1}/{d1} liter mjölk. Du häller ut {n2}/{d2} liter i en baksmet. Hur mycket mjölk finns kvar i kannan?",
            en: "A pitcher contains {n1}/{d1} liters of milk. You pour {n2}/{d2} liters into a baking batter. How much milk is left in the pitcher?"
        },
        {
            sv: "Ett batteri var laddat till {n1}/{d1} och efter ett videosamtal har laddningen minskat med {n2}/{d2} av full kapacitet. Vad är laddningsnivån nu?",
            en: "A battery was charged to {n1}/{d1} and after a video call, the charge decreased by {n2}/{d2} of full capacity. What is the charge level now?"
        },
        {
            sv: "En behållare innehåller {n1}/{d1} kilo kemikalier. En laborant tar ut {n2}/{d2} kilo för ett experiment. Hur mycket kemikalier finns kvar i behållaren?",
            en: "A container contains {n1}/{d1} kg of chemicals. A lab technician takes out {n2}/{d2} kg for an experiment. How many chemicals are left in the container?"
        },
        {
            sv: "I en skål fanns det {n1}/{d1} kilo godis. Barnen äter upp {n2}/{d2} kilo under kvällen. Hur mycket godis finns kvar i skålen efteråt?",
            en: "In a bowl there was {n1}/{d1} kg of candy. The children eat {n2}/{d2} kg during the evening. How much candy is left in the bowl afterward?"
        },
        {
            sv: "Ett lager hade {n1}/{d1} av sina artiklar sorterade. Under en kontroll upptäcktes skador på {n2}/{d2} av det totala antalet artiklar, och dessa togs bort. Hur stor del är sorterad och felfri?",
            en: "A warehouse had {n1}/{d1} of its items sorted. During a check, damage was found on {n2}/{d2} of the total items, and these were removed. What fraction is sorted and defect-free?"
        },
        {
            sv: "En tankbils cistern var fylld till {n1}/{d1} med bensin. Vid den första stationen pumpades en mängd motsvarande {n2}/{d2} av tankens totala volym ut. Hur stor del bensin är kvar i cisternen?",
            en: "A tanker truck's cistern was filled to {n1}/{d1} with gasoline. At the first station, an amount corresponding to {n2}/{d2} of the tank's total volume was pumped out. What fraction of gasoline is left in the cistern?"
        },
        {
            sv: "Du har köpt ett tygstycke som är {n1}/{d1} meter långt. Du klipper bort en bit på {n2}/{d2} meter för att sy en kudde. Hur långt är tygstycket som återstår?",
            en: "You bought a piece of fabric that is {n1}/{d1} meters long. You cut off a piece of {n2}/{d2} meters to sew a pillow. How long is the remaining piece of fabric?"
        },
        {
            sv: "Ett transportbolag har vanligtvis {n1}/{d1} av sina fordon i drift. På grund av akut service tvingas de ställa in {n2}/{d2} av hela sin fordonsflotta. Hur stor del av flottan är fortfarande igång?",
            en: "A transport company usually has {n1}/{d1} of its vehicles in operation. Due to urgent servicing, they are forced to ground {n2}/{d2} of their entire fleet. What fraction of the fleet is still running?"
        },
        {
            sv: "En bonde har skördat {n1}/{d1} av ett stort fält. En maskin går sönder vilket gör att ett område motsvarande {n2}/{d2} av hela fältet går förlorat. Hur stor del av fältets skörd är kvar?",
            en: "A farmer harvested {n1}/{d1} of a large field. A machine breaks down, meaning an area corresponding to {n2}/{d2} of the whole field is lost. What fraction of the field's harvest is left?"
        }
    ],

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
            sv: "Ett skogsteam rensar {w1} {n1}/{d1} hektar mark under den första veckan och {w2} {n2}/{d2} hektar under den andra veckan. Hur många hektar har de rensat totalt?",
            en: "A forestry team clears {w1} {n1}/{d1} hectares of land during the first week and {w2} {n2}/{d2} hectares during the second week. How many hectares have they cleared in total?"
        },
        {
            sv: "En målare förbrukar {w1} {n1}/{d1} burkar färg på husets framsida och {w2} {n2}/{d2} burkar på husets baksida. Hur många burkar färg går åt sammanlagt?",
            en: "A painter consumes {w1} {n1}/{d1} cans of paint on the front of the house and {w2} {n2}/{d2} cans on the back of the house. How many cans of paint are used in total?"
        },
        {
            sv: "Två fraktcontainrar väser {w1} {n1}/{d1} ton respektive {w2} {n2}/{d2} ton. Vad är deras sammanlagda vikt om de lastas på samma bil?",
            en: "Two freight containers weigh {w1} {n1}/{d1} tons and {w2} {n2}/{d2} tons respectively. What is their combined weight if loaded onto the same truck?"
        },
        {
            sv: "En löpare vilar efter att ha sprungit {w1} {n1}/{d1} kilometer och fortsätter sedan ytterligare {w2} {n2}/{d2} kilometer. Hur långt har löparen sprungit totalt?",
            en: "A runner rests after running {w1} {n1}/{d1} kilometers and then continues for another {w2} {n2}/{d2} kilometers. How far has the runner jogged in total?"
        },
        {
            sv: "En bonde säljer {w1} {n1}/{d1} säckar potatis på morgonen och {w2} {n2}/{d2} säckar på eftermiddagen. Hur många säckar potatis har bonden sålt under dagen?",
            en: "A farmer sells {w1} {n1}/{d1} bags of potatoes in the morning and {w2} {n2}/{d2} bags in the afternoon. How many bags of potatoes has the farmer sold during the day?"
        },
        {
            sv: "Ett vägbygge färdigställer {w1} {n1}/{d1} kilometer väg före semestern och {w2} {n2}/{d2} kilometer efter semestern. Hur mycket väg har byggts totalt?",
            en: "A road construction crew finishes {w1} {n1}/{d1} kilometers of road before the holidays and {w2} {n2}/{d2} kilometers after the holidays. How much road has been built in total?"
        },
        {
            sv: "I en frukthandel säljs först {w1} {n1}/{d1} lådor äpplen och sedan {w2} {n2}/{d2} lådor päron. Hur många lådor frukt har sålts sammanlagt?",
            en: "In a fruit shop, first {w1} {n1}/{d1} boxes of apples are sold and then {w2} {n2}/{d2} boxes of pears. How many boxes of fruit have been sold in total?"
        },
        {
            sv: "En familj köper {w1} {n1}/{d1} kilo grillkött till en fest och kompletterar med {w2} {n2}/{d2} kilo korv. Hur mycket har de köpt sammanlagt?",
            en: "A family buys {w1} {n1}/{d1} kg of barbecue meat for a party and supplements it with {w2} {n2}/{d2} kg of sausages. How much have they bought in total?"
        }
    ],

    frac_mixed_sub: [
        {
            sv: "Ett bageri har {w1} {n1}/{d1} säckar mjöl på lager. Under morgonen går det åt {w2} {n2}/{d2} säckar. Hur mycket mjöl finns kvar på lagret?",
            en: "A bakery has {w1} {n1}/{d1} bags of flour in stock. During the morning, {w2} {n2}/{d2} bags are used. How much flour is left in stock?"
        },
        {
            sv: "En byggarbetare har en {w1} {n1}/{d1} meter lång vajer. Han kapar bort en bit på {w2} {n2}/{d2} meter. Hur mycket vajer återstår?",
            en: "A construction worker has a wire rope that is {w1} {n1}/{d1} meters long. He cuts off a piece of {w2} {n2}/{d2} meters. How much wire rope remains?"
        },
        {
            sv: "En restaurang köpte in {w1} {n1}/{d1} kilo ost. Efter helgen har kockarna förbrukat {w2} {n2}/{d2} kilo. Hur mycket ost finns kvar i kylen?",
            en: "A restaurant purchased {w1} {n1}/{d1} kg of cheese. After the weekend, the chefs consumed {w2} {n2}/{d2} kg of it. How much cheese is left in the fridge?"
        },
        {
            sv: "Ett vattendrag hade en flödeshöjd på {w1} {n1}/{d1} meter. Under en torrvecka sjönk vattennivån med {w2} {n2}/{d2} meter. Vilken är flödeshöjden nu?",
            en: "A watercourse had a flow height of {w1} {n1}/{d1} meters. During a dry week, the water level dropped by {w2} {n2}/{d2} meters. What is the flow height now?"
        },
        {
            sv: "Du har fyllt en tank med {w1} {n1}/{d1} liter bensin. Efter en bilresa har du förbrukat {w2} {n2}/{d2} liter. Hur mycket bensin är kvar i tanken?",
            en: "You filled a tank with {w1} {n1}/{d1} liters of gasoline. After a road trip, you have consumed {w2} {n2}/{d2} liters. How much gasoline is left in the tank?"
        },
        {
            sv: "En trädgårdsmästare har samlat in {w1} {n1}/{d1} kilo jord. Han sprider ut {w2} {n2}/{d2} kilo i ett växthus. Hur mycket jord finns kvar i hans förråd?",
            en: "A gardener collected {w1} {n1}/{d1} kg of soil. He spreads {w2} {n2}/{d2} kg in a greenhouse. How much soil is left in his storage area?"
        },
        {
            sv: "En bit timmer mäter {w1} {n1}/{d1} meter. En hantverkare sågar bort en defekt ändbit på {w2} {n2}/{d2} meter. Hur långt är timret efter kapningen?",
            en: "A piece of timber measures {w1} {n1}/{d1} meters. A craftsman saws off a defective end piece of {w2} {n2}/{d2} meters. How long is the timber after cutting?"
        },
        {
            sv: "Ett transportbolag har bokat {w1} {n1}/{d1} ton fraktkapacitet på ett godståg. På grund av en ändring tas {w2} {n2}/{d2} ton bort från bokningen. Hur stor fraktvolym återstår?",
            en: "A transport company booked {w1} {n1}/{d1} tons of freight capacity on a cargo train. Due to a change, {w2} {n2}/{d2} tons are removed from the booking. What freight volume remains?"
        },
        {
            sv: "En idrottsförening hade {w1} {n1}/{d1} timmar halltid bokad under en månad. De avbokar {w2} {n2}/{d2} timmar på grund av matchkrockar. Hur mycket halltid har de kvar?",
            en: "A sports club had {w1} {n1}/{d1} hours of gym time booked during a month. They cancel {w2} {n2}/{d2} hours due to match clashes. How much gym time do they have left?"
        },
        {
            sv: "En skräddare har {w1} {n1}/{d1} meter sidentyg. Efter att ha sytt en klänning har {w2} {n2}/{d2} meter tyg gått åt. Hur mycket sidentyg finns kvar på rullen?",
            en: "A tailor has {w1} {n1}/{d1} meters of silk fabric. After sewing a dress, {w2} {n2}/{d2} meters of fabric have been used. How much silk fabric is left on the roll?"
        }
    ],

    frac_multiplication: [
        {
            sv: "En gräsmatta täcker {n1}/{d1} av en villatomt. Du klipper {n2}/{d2} av denna gräsmatta innan regnet börjar. Hur stor del av hela tomten har du klippt?",
            en: "A lawn covers {n1}/{d1} of a backyard lot. You mow {n2}/{d2} of this lawn before it starts raining. What fraction of the entire lot have you mowed?"
        },
        {
            sv: "Ett fält utgörs till {n1}/{d1} av odlingsmark. På {n2}/{d2} av denna areal odlas det morötter. Hur stor del av hela fältet består av morotsodling?",
            en: "A field is made up of {n1}/{d1} cultivation land. On {n2}/{d2} of this acreage, carrots are grown. What fraction of the entire field consists of carrots?"
        },
        {
            sv: "I ett akvarium är {n1}/{d1} av fiskarna tropiska arter. Av dessa tropiska fiskar är {n2}/{d2} neontetror. Hur stor del av samtliga fiskar i akvariet är neontetror?",
            en: "In an aquarium, {n1}/{d1} of the fish are tropical species. Of these tropical fish, {n2}/{d2} are neon tetras. What fraction of all fish in the aquarium are neon tetras?"
        },
        {
            sv: "Ett företag avsätter {n1}/{d1} av sin vinst till miljöprojekt. Av dessa pengar går {n2}/{d2} direkt till trädplantering. Hur stor del av den totala vinsten går till trädplantering?",
            en: "A company allocates {n1}/{d1} of its profits to environmental projects. Of this money, {n2}/{d2} goes directly to tree planting. What fraction of the total profit goes to tree planting?"
        },
        {
            sv: "En färgburk är fylld till {n1}/{d1} med basfärg. Du använder {n2}/{d2} av färgen till att måla en pall. Hur stor del av en hel färgburk gick åt till pallen?",
            en: "A paint can is filled to {n1}/{d1} with base paint. You use {n2}/{d2} of that paint to paint a stool. What fraction of a full paint can was used for the stool?"
        },
        {
            sv: "Av studenterna på en högskola läser {n1}/{d1} datavetenskap. Bland dessa datastudenter har {n2}/{d2} valt inriktningen AI. Hur stor del av högskolans totala studentantal läser AI?",
            en: "Of the students at a college, {n1}/{d1} study computer science. Among these computer science students, {n2}/{d2} chose an AI specialization. What fraction of the total college student body studies AI?"
        },
        {
            sv: "Ett recept rekommenderar att fylla {n1}/{d1} av en ugnsform med grönsaker. Om {n2}/{d2} av grönsakerna ska vara skivad lök, hur stor del av ugnsformen täcks då av lök?",
            en: "A recipe recommends filling {n1}/{d1} of a baking dish with vegetables. If {n2}/{d2} of the vegetables are to be sliced onions, what fraction of the baking dish is covered by onions?"
        },
        {
            sv: "Ett godståg lastas så att {n1}/{d1} av vagnarna bär timmer. Av dessa timmervagnar ska {n2}/{d2} kopplas loss i Skövde. Hur stor del av tågets samtliga vagnar lossas i Skövde?",
            en: "A freight train is loaded so that {n1}/{d1} of the cars carry timber. Of these timber cars, {n2}/{d2} are to be uncoupled in Skövde. What fraction of all the train's cars will be unloaded in Skövde?"
        },
        {
            sv: "Ett markområde motsvarande {n1}/{d1} av en skogsfastighet är avsett som naturreservat. På {n2}/{d2} av denna reservatmark råder totalt beträdnadsförbud. Hur stor del av hela fastigheten omfattas av förbudet?",
            en: "A land area corresponding to {n1}/{d1} of a forest property is designated as a nature reserve. On {n2}/{d2} of this reserve land, entry is strictly prohibited. What fraction of the entire property is covered by the restriction?"
        },
        {
            sv: "Ett bageri använder {n1}/{d1} av sitt dagliga smör till bullbak. Av detta smör går {n2}/{d2} åt till fyllningen. Hur stor del av bageriets totala smörförbrukning används till bullfyllningen?",
            en: "A bakery uses {n1}/{d1} of its daily butter for baking buns. Of this butter, {n2}/{d2} goes into the filling. What fraction of the bakery's total butter consumption is used for the bun filling?"
        }
    ],

    frac_division: [
        {
            sv: "Du har {n1}/{d1} liter saft som ska fördelas i små bägare. Varje bägare rymmer {n2}/{d2} liter. Hur många bägare kan du fylla?",
            en: "You have {n1}/{d1} liters of juice to be distributed into small cups. Each cup holds {n2}/{d2} liters. How many cups can you fill?"
        },
        {
            sv: "Ett snöre mäter {n1}/{d1} meter. Du klipper snöret i mindre bitar där varje bit ska vara {n2}/{d2} meter lång. Hur många sådana bitar får du ut?",
            en: "A piece of string measures {n1}/{d1} meters. You cut the string into smaller pieces where each piece must be {n2}/{d2} meters long. How many such pieces do you get?"
        },
        {
            sv: "Ett laboratorieexperiment kräver doser om {n2}/{d2} gram av ett pulver. Du har en behållare med {n1}/{d1} gram pulver kvar. Hur många fulla doser räcker det till?",
            en: "A laboratory experiment requires doses of {n2}/{d2} grams of a powder. You have a container with {n1}/{d1} grams of powder left. How many full doses will it last for?"
        },
        {
            sv: "En maskin fyller små parfymflaskor som rymmer {n2}/{d2} liter styck. Maskinen har en behållare med {n1}/{d1} liter parfymolja kvar. Hur många flaskor kan maskinen fylla?",
            en: "A machine fills small perfume bottles holding {n2}/{d2} liters each. The machine has a reservoir with {n1}/{d1} liters of perfume oil left. How many bottles can the machine fill?"
        },
        {
            sv: "Ett medicinskt laboratorium fördelar {n1}/{d1} centiliter serum i provrör som rymmer {n2}/{d2} centiliter styck. Hur många provrör kan de fylla helt?",
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
            sv: "En sändning med {n1}/{d1} ton grus ska fördelas i mindre säckar som rymmer {n2}/{d2} ton styck. Hur många sådana säckar kan man fylla helt?",
            en: "A shipment of {n1}/{d1} tons of gravel is to be distributed into smaller bags holding {n2}/{d2} tons each. How many such bags can be filled completely?"
        },
        {
            sv: "En bagare ska dela upp en stor deg som väger {n1}/{d1} kilo till mindre brödbullar. Varje bulle ska väga {n2}/{d2} kilo innan gräddning. Hur många bullar får bagaren ut?",
            en: "A baker needs to divide a large dough weighing {n1}/{d1} kg into smaller buns. Each bun must weigh {n2}/{d2} kg before baking. How many buns will the baker get?"
        },
        {
            sv: "En kaffebar serverar provsmakningskoppar av espresso som rymmer {n2}/{d2} deciliter styck. Bryggaren innehåller {n1}/{d1} deciliter espresso. Hur många koppar kan fyllas?",
            en: "A coffee bar serves tasting cups of espresso holding {n2}/{d2} deciliters each. The brewer contains {n1}/{d1} deciliters of espresso. How many cups can be filled?"
        }
    ]
};