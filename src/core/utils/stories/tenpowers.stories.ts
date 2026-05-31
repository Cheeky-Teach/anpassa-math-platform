// src/core/utils/stories/tenpowers.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const TENPOWERS_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. TEN POWERS MULT LARGE (Requires placeholders: {num} and {power})
    // =========================================================================
    ten_powers_mult_large: [
        {
            sv: "Ett gamingkonto laddar upp videoklipp som i genomsnitt får {num} visningar styck. En vecka går ett klipp viralt och får {power} gånger fler visningar. Hur många visningar fick det virala klippet?",
            en: "A gaming account uploads video clips that average {num} views each. One week, a clip goes viral and gets {power} times more views. How many views did the viral clip get?"
        },
        {
            sv: "En skola köper in {power} stycken likadana skrivblock till sina elever. Om varje enskilt block kostar {num} kr, vad blir då den totala kostnaden för alla block?",
            en: "A school purchases {power} identical notebooks for its students. If each individual notebook costs {num} kr, what is the total cost for all notebooks?"
        },
        {
            sv: "Ett kompisgäng ska köpa biljetter till en festival. Om {power} personer köper varsin biljett och varje biljett kostar {num} kr, hur mycket kostar alla biljetter totalt?",
            en: "A group of friends is buying tickets for a festival. If {power} people buy one ticket each and each ticket costs {num} kr, how much do all the tickets cost in total?"
        },
        {
            sv: "En streamer har i snitt {num} tittare samtidigt under sina vanliga sändningar. Under ett stort event ökar antalet tittare och blir {power} gånger så stort. Hur många tittare har sändningen då?",
            en: "A streamer averages {num} concurrent viewers during regular streams. During a major event, the viewer count increases to {power} times its usual size. How many viewers are watching then?"
        },
        {
            sv: "Priset på ett sällsynt föremål på en spelmarknad är {num} kr. Efter att en känd kreatör använde föremålet ökade efterfrågan så att priset gångrades med {power}. Vad kostar föremålet nu?",
            en: "The price of a rare item on a game marketplace is {num} kr. After a famous creator used the item, demand increased so the price was multiplied by {power}. What does the item cost now?"
        },
        {
            sv: "En designer gör ordning på {power} likadana hoodies till en klädinsamling. Om varje hoodie väger {num} kg, hur mycket väger hela sändningen med kläder totalt?",
            en: "A designer prepares {power} identical hoodies for a clothing drive. If each hoodie weighs {num} kg, how much does the entire shipment of clothes weigh in total?"
        },
        {
            sv: "Ett videoklipp på sociala medier delas vidare och sprids snabbt. Om klippet från början skickades till {num} personer och antalet mottagare sedan ökade med en faktor på {power}, hur många har fått klippet?",
            en: "A social media video is shared and spreads rapidly. If the video was initially sent to {num} people and the number of recipients then increased by a factor of {power}, how many people received it?"
        },
        {
            sv: "Du sparar undan {num} kr från din månadspeng varje vecka. Om du fortsätter i samma takt och sparar {power} gånger så länge, hur mycket pengar har du fått ihop till slut?",
            en: "You save {num} kr from your monthly allowance each week. If you continue at the same rate and save for {power} times as long, how much money have you gathered in the end?"
        },
        {
            sv: "En digital rityta i ett grafikprogram har en bredd på {num} mm. Du väljer att zooma ut så att arbetsytan förstoras med {power} gånger i bredd. Hur många millimeter bred blir ytan på skärmen?",
            en: "A digital drawing canvas in a graphics app has a width of {num} mm. You choose to zoom out so that the workspace is magnified {power} times in width. How many millimeters wide does the canvas become on screen?"
        },
        {
            sv: "Det ligger {num} gram snacks i en liten portionsförpackning. Till en fest köper du en stor hink som innehåller {power} gånger mer innehåll. Hur många gram snacks innehåller hinken?",
            en: "There are {num} grams of snacks in a small portion pack. For a party, you buy a large tub that contains {power} times more content. How many grams of snacks does the tub contain?"
        },
        {
            sv: "Ett skript i ett indiespel spawnar {num} monster per kvadratmeter i en startzon. I en svårare zon är spawn-takten programmerad att vara {power} gånger högre. Hur många monster spawnar där?",
            en: "A script in an indie game spawns {num} monsters per square meter in a starting zone. In a harder zone, the spawn rate is programmed to be {power} times higher. How many monsters spawn there?"
        },
        {
            sv: "En låt på Spotify strömmas i genomsnitt {num} gånger om dagen. Under julveckan ökar strömningarna och blir {power} gånger fler. Hur många gånger strömmas låten per dag under julen?",
            en: "A song on Spotify is streamed an average of {num} times a day. During Christmas week, streams increase by {power} times. How many times is the song streamed per day during Christmas?"
        },
        {
            sv: "En rulle med LED-tejp är {num} meter lång. Ett gym köper in ett storpack som innehåller {power} stycken likadana rullar för att lysa upp salen. Hur många meter LED-tejp får gymmet totalt?",
            en: "A roll of LED tape is {num} meters long. A gym purchases a bulk pack containing {power} identical rolls to light up the hall. How many meters of LED tape does the gym get in total?"
        },
        {
            sv: "En prenumerationstjänst för spel kostar {num} kr i månaden. Om du behåller din prenumeration löpande i {power} månader, hur mycket pengar har du betalat totalt under hela tiden?",
            en: "A game subscription service costs {num} kr a month. If you maintain your subscription continuously for {power} months, how much money have you paid in total over the entire time?"
        },
        {
            sv: "Ett klipp på TikTok fick {num} gilla-markeringar under den första timmen. Efter att det hamnade på For You-sidan ökade antalet markeringar med {power} gånger. Hur många gilla-markeringar har klippet nu?",
            en: "A TikTok clip received {num} likes during its first hour. After landing on the For You page, the number of likes increased by {power} times. How many likes does the clip have now?"
        }
    ],

    // =========================================================================
    // 🎯 2. TEN POWERS DIV LARGE (Requires placeholders: {num} and {power})
    // =========================================================================
    ten_powers_div_large: [
        {
            sv: "En vinstpott på {num} kr från en gamingturnering ska delas helt lika mellan de {power} deltagarna i laget. Hur mycket pengar får varje lagmedlem?",
            en: "A prize pool of {num} kr from a gaming tournament is to be split completely evenly among the {power} players on the team. How much money does each team member get?"
        },
        {
            sv: "Ett stort parti med {num} ml läsk ska fördelas i små provflaskor som rymmer {power} ml var. Hur många provflaskor kan man fylla helt med läsk?",
            en: "A large batch of {num} ml of soda is to be distributed into small sample bottles holding {power} ml each. How many sample bottles can be completely filled with soda?"
        },
        {
            sv: "Ett internetcafé har en total datamängd på {num} GB som ska delas jämnt på {power} datorer i nätverket. Hur många GB tilldelas varje enskild dator?",
            en: "An internet cafe has a total data volume of {num} GB to be shared equally among {power} computers in the network. How many GB are assigned to each individual computer?"
        },
        {
            sv: "En klädbutik köper in ett parti med kepsar för totalt {num} kr. Om partiet innehåller {power} stycken kepsar, vad blir då inköpspriset per keps?",
            en: "A clothing store purchases a batch of caps for a total of {num} kr. If the batch contains {power} caps, what is the purchase price per cap?"
        },
        {
            sv: "Ett gäng har samlat ihop {num} poäng tillsammans i ett mobilspel. Poängen ska fördelas helt lika mellan de {power} kompisarna. Hur många poäng får varje person?",
            en: "A group gathered {num} points together in a mobile game. The points are to be divided completely evenly among the {power} friends. How many points does each person get?"
        },
        {
            sv: "En digital bildfil har en total filstorlek på {num} KB. Du laddar upp den på en sajt som komprimerar filen så att den blir {power} gånger mindre. Vad blir den nya filstorleken?",
            en: "A digital image file has a total file size of {num} KB. You upload it to a site that compresses the file to be {power} times smaller. What is the new file size?"
        },
        {
            sv: "En fabrik tillverkar en lång kabel som mäter {num} cm. Kabeln ska kapas upp i {power} stycken helt lika långa delar för att säljas i butik. Hur lång blir varje del?",
            en: "A factory manufactures a long cable measuring {num} cm. The cable is to be cut into {power} completely equal parts to be sold in stores. How long will each part be?"
        },
        {
            sv: "Ett videoklipp har visats i totalt {num} minuter på nätet utspritt över {power} olika visningar. Hur lång var den genomsnittliga tittartiden per visning?",
            en: "A video clip has been watched for a total of {num} minutes online spread across {power} different views. How long was the average viewing time per view?"
        },
        {
            sv: "En rulle med skyddsplast till skärmar väger {num} gram. Plasten ska delas upp jämnt till {power} stycken förpackningar. Hur många gram plast hamnar i varje förpackning?",
            en: "A roll of protective screen film weighs {num} grams. The plastic is to be divided evenly into {power} packages. How many grams of plastic end up in each package?"
        },
        {
            sv: "Ett techbolag lägger ut {num} kr på reklam under en kampanj på sociala medier. Kampanjen genererade totalt {power} klick till deras sajt. Vad blev kostnaden per klick?",
            en: "A tech company spends {num} kr on advertising during a social media campaign. The campaign generated a total of {power} clicks to their site. What was the cost per click?"
        },
        {
            sv: "Ett lager med energidryck innehåller totalt {num} burkar. Burkarna ska fraktas bort i {power} stycken likadana kartonger. Hur många burkar ryms det i varje kartong?",
            en: "A warehouse stock of energy drinks contains a total of {num} cans. The cans are to be shipped away in {power} identical boxes. How many cans fit in each box?"
        },
        {
            sv: "Du har skapat en spellista med en total speltid på {num} minuter. Spellistan består av {power} stycken låtar som alla är exakt lika långa. Hur lång är varje låt?",
            en: "You created a playlist with a total runtime of {num} minutes. The playlist consists of {power} songs that are all exactly the same length. How long is each song?"
        },
        {
            sv: "Ett torg på en ritning har en area på {num} mm². Om ritningen görs om så att torget visas {power} gånger mindre, vilken area får torget på den nya skissen?",
            en: "A plaza on a drawing has an area of {num} mm². If the drawing is modified so that the plaza is shown {power} times smaller, what area does the plaza have on the new sketch?"
        },
        {
            sv: "En serverhall har laddat ner totalt {num} MB data fördelat på {power} stycken likadana uppdateringsfiler. Hur stor filstorlek i MB har varje enskild fil?",
            en: "A server room downloaded a total of {num} MB of data distributed across {power} identical update files. What file size in MB does each individual file have?"
        },
        {
            sv: "En rulle med fästande tejp till ett bygge är {num} cm lång. Du klipper upp hela rullen i {power} stycken lika långa bitar. Hur många centimeter lång blir varje bit?",
            en: "A roll of adhesive tape for a project is {num} cm long. You cut up the entire roll into {power} pieces of equal length. How many centimeters long will each piece be?"
        }
    ],

    // =========================================================================
    // 🎯 3. TEN POWERS MULT SMALL (Requires placeholders: {num} and {factor})
    // =========================================================================
    ten_powers_mult_small: [
        {
            sv: "Ett föremål i ett mobilspel mäter {num} mm på skärmen. När du förminskar vyn blir föremålet bara {factor} av sin ursprungliga storlek. Vad blir föremålets nya mått på skärmen?",
            en: "An item in a mobile game measures {num} mm on screen. When minimizing the view, the item becomes only {factor} of its original size. What is the item's new screen measurement?"
        },
        {
            sv: "En tråd till en 3D-printer har tjockleken {num} mm. Skrivaren kan justeras så att den matar ut en finare tråd som bara är {factor} av den vanliga tjockleken. Vad blir trådens mått?",
            en: "A filament thread for a 3D printer has a thickness of {num} mm. The printer can be adjusted to feed a finer thread that is only {factor} of the standard thickness. What is the thread measurement?"
        },
        {
            sv: "En textruta på en webbsida har bredden {num} pixlar. I mobilversionen skalas rutan ner så att den bara utgör {factor} av datorbredden. Hur många pixlar bred blir rutan i mobilen?",
            en: "A text box on a webpage has a width of {num} pixels. In the mobile version, the box scales down to make up only {factor} of the desktop width. How many pixels wide is the mobile box?"
        },
        {
            sv: "En bit plastfilm till ett skärmskydd väger {num} gram. En mindre variant av samma skydd väger bara {factor} av den vikten. Hur mycket väger den mindre plastfilmen?",
            en: "A piece of plastic film for a screen protector weighs {num} grams. A smaller variant of the same protector weighs only {factor} of that weight. How much does the smaller film weigh?"
        },
        {
            sv: "Laddningstiden för ett batteri var {num} minuter med en gammal sladd. Med en ny snabbladdare minskar tiden och blir bara {factor} av den gamla tiden. Hur många minuter tar laddningen nu?",
            en: "The charging time for a battery was {num} minutes with an old cable. With a new fast charger, the time drops to only {factor} of the old duration. How many minutes does charging take now?"
        },
        {
            sv: "En karaktär i ett spel rör sig med hastigheten {num} steg per sekund. När karaktären drabbas av en slow-effekt sjunker takten till {factor} av normal fart. Vad blir hastigheten under effekten?",
            en: "A game character moves at a speed of {num} steps per second. When hit by a slow effect, the rate drops to {factor} of normal speed. What is the speed during the effect?"
        },
        {
            sv: "En digital pensel i ett ritprogram är inställd på storleken {num} mm. När du aktiverar finjustering ändras penseldraget till {factor} av den inställda storleken. Vad blir penselns nya bredd?",
            en: "A digital brush in a drawing app is set to a size of {num} mm. When activating fine adjustment, the brush stroke changes to {factor} of the set size. What is the brush's new width?"
        },
        {
            sv: "En kaffemugg rymmer {num} ml vätska. En liten espressokopp mäter {factor} av muggens volym. Hur många milliliter rymmer espressokoppen?",
            en: "A coffee mug holds {num} ml of liquid. A small espresso cup measures {factor} of the mug's volume. How many milliliters does the espresso cup hold?"
        },
        {
            sv: "Ljudvolymen på en video är inställd på {num} decibel. Du sänker volymen i reglaget så att ljudnivån blir {factor} av den tidigare inställningen. Vilken decibelnivå har videon nu?",
            en: "The audio volume of a video is set to {num} decibels. You lower the volume slider so that the sound level becomes {factor} of the previous setting. What decibel level does the video have now?"
        },
        {
            sv: "En rektangulär banner på en sajt har arean {num} cm². En mindre annonsruta bredvid tar bara upp {factor} av bannerns yta. Vilken area har den mindre annonsrutan?",
            en: "A rectangular banner on a site has an area of {num} cm². A smaller ad box next to it takes up only {factor} of the banner's area. What area does the smaller ad box have?"
        },
        {
            sv: "En speltimer startar på {num} sekunder. I ett snabbare spelläge kortas timern ner så att starttiden bara är {factor} av den vanliga tiden. Hur många sekunder har man på sig i det snabba läget?",
            en: "A game timer starts at {num} seconds. In a faster game mode, the timer is shortened so that the starting time is only {factor} of the regular duration. How many seconds do you have in the fast mode?"
        },
        {
            sv: "Vikten på ett headset är {num} gram. Tillverkaren utvecklar en lättviktsmodell som väger {factor} av den ursprungliga modellen. Hur mycket väger lättviktsmodellen?",
            en: "The weight of a headset is {num} grams. The manufacturer develops a lightweight model weighing {factor} of the original model. How much does the lightweight model weigh?"
        },
        {
            sv: "En bit snöre till ett pyssel är {num} cm långt. Du klipper av en liten bit som utgör {factor} av snörets hela längd. Hur många centimeter lång är biten du klippte av?",
            en: "A piece of string for a craft project is {num} cm long. You cut off a small piece making up {factor} of the string's total length. How many centimeters long is the cut piece?"
        },
        {
            sv: "En prenumeration på en sajt kostade {num} kr om året. Under en kampanj sänktes avgiften för den första månaden till {factor} av årspriset. Vad kostade kampanjmånaden?",
            en: "A subscription to a site cost {num} kr a year. During a promotion, the fee for the first month was reduced to {factor} of the annual price. What did the promotional month cost?"
        },
        {
            sv: "Tjockleken på ett skyddsglas till en mobil är {num} mm. Ett tunnare premiumglas tillverkas med en tjocklek som bara är {factor} av det vanliga glaset. Hur tjockt är premiumglaset?",
            en: "The thickness of a protective glass for a phone is {num} mm. A thinner premium glass is manufactured with a thickness that is only {factor} of the standard glass. How thick is the premium glass?"
        }
    ],

    // =========================================================================
    // 🎯 4. TEN POWERS DIV SMALL (Requires placeholders: {num} and {factor})
    // =========================================================================
    ten_powers_div_small: [
        {
            sv: "En bit tråd till ett armband har längden {num} cm. Du ska klippa upp tråden i småbitar som är {factor} cm långa var. Hur många småbitar får du ut av tråden?",
            en: "A piece of string for a bracelet has a length of {num} cm. You are going to cut the string into small pieces that are {factor} cm long each. How many small pieces do you get from the string?"
        },
        {
            sv: "Du har en behållare med {num} ml flytande färg till ett pyssel. Färgen ska portioneras ut i små behållare som rymmer {factor} ml var. Hur många behållare kan fyllas?",
            en: "You have a container with {num} ml of liquid paint for a craft project. The paint is to be portioned into small cups holding {factor} ml each. How many cups can be filled?"
        },
        {
            sv: "En digital rityta har en total bredd på {num} mm. Du delar in ytan i små pixelsektioner som är {factor} mm breda var. Hur många sektioner får plats i bredd?",
            en: "A digital canvas has a total width of {num} mm. You divide the canvas into pixel sections that are {factor} mm wide each. How many sections fit across the width?"
        },
        {
            sv: "En bit skyddsfilm väger {num} gram totalt. Filmen ska skäras upp i små bitar till kretsar där varje liten bit väger {factor} gram. Hur många bitar får man ut?",
            en: "A piece of protective film weighs {num} grams in total. The film is to be cut into tiny pieces for chips where each small piece weighs {factor} grams. How many pieces do you get?"
        },
        {
            sv: "Ett minneskort har {num} GB ledigt utrymme. Du ska spara små sparfiler från ett spel som tar {factor} GB i anspråk styck. Hur många sparfiler får plats på kortet?",
            en: "A memory card has {num} GB of free space. You are going to save small save files from a game that take up {factor} GB each. How many save files can fit on the card?"
        },
        {
            sv: "En stor flaska med rengöringsvätska innehåller {num} liter. För att göra ett experiment behöver du dosera vätskan i provrör som rymmer {factor} liter var. Hur många rör kan du fylla?",
            en: "A large bottle of cleaning fluid contains {num} liters. To run an experiment, you need to dose the fluid into test tubes holding {factor} liters each. How many tubes can you fill?"
        },
        {
            sv: "En förpackning med metalltråd är {num} meter lång. Du ska klippa till korta bitar till ett teknikbygge där varje bit ska vara {factor} meter. Hur många bitar räcker tråden till?",
            en: "A pack of metal wire is {num} meters long. You are going to cut short pieces for a tech project where each piece must be {factor} meters. How many pieces will the wire last for?"
        },
        {
            sv: "Ett skript i ett spel körs under en total tid på {num} sekunder. Skriptet är indelat i små delmoment som tar {factor} sekunder var att köra. Hur många delmoment innehåller skriptet?",
            en: "A script in a game runs for a total time of {num} seconds. The script is divided into sub-steps that take {factor} seconds each to execute. How many sub-steps does the script contain?"
        },
        {
            sv: "En bit tejp till en TV-bänk är {num} cm lång. Du ska klippa upp tejpen i bitar som mäter {factor} cm var för att fästa sladdar. Hur många bitar får du?",
            en: "A piece of tape for a TV stand is {num} cm long. You are going to cut the tape into pieces measuring {factor} cm each to secure cords. How many pieces do you get?"
        },
        {
            sv: "Ett paket med modellera väger {num} gram. Du ska rulla små dekorationskulor till ett pyssel där varje kula väger {factor} gram. Hur många kulor kan du rulla totalt?",
            en: "A pack of modeling clay weighs {num} grams. You are going to roll small decorative beads for a craft where each bead weighs {factor} grams. How many beads can you roll in total?"
        },
        {
            sv: "En digital ljudfil är {num} sekunder lång. Du delar upp filen i korta samplingar som är {factor} sekunder långa var. Hur många samplingar får du ut av ljudfilen?",
            en: "A digital audio file is {num} seconds long. You split the file into short samples that are {factor} seconds long each. How many samples do you get from the audio file?"
        },
        {
            sv: "En rulle med färgband är {num} meter lång. Till en fest ska bandet klippas upp i korta bitar som mäter {factor} meter var. Hur många bitar räcker rullen till?",
            en: "A roll of colored ribbon is {num} meters long. For a party, the ribbon is to be cut into short pieces measuring {factor} meters each. How many pieces will the roll last for?"
        },
        {
            sv: "En bit skyddsplast till skärmar har arean {num} cm². Den ska skäras till små skyddslappar för smartklockor där varje lapp täcker {factor} cm². Hur många lappar får man ut?",
            en: "A sheet of screen protective plastic has an area of {num} cm². It is to be cut into small protective covers for smartwatches where each cover measures {factor} cm². How many covers do you get?"
        },
        {
            sv: "En behållare rymmer {num} dl vatten. Du använder en sked som rymmer {factor} dl för att tömma behållaren helt. Hur många skedar vatten måste du ösa upp?",
            en: "A container holds {num} dl of water. You use a scoop that holds {factor} dl to empty the container completely. How many scoops of water do you need to scoop up?"
        },
        {
            sv: "En bit kartong är {num} mm tjock. Du har ett verktyg som skär skivor som är {factor} mm tjocka var. Hur många skivor kan du dela kartongbiten i?",
            en: "A piece of cardboard is {num} mm thick. You have a tool that slices sheets that are {factor} mm thick each. How many sheets can you divide the piece of cardboard into?"
        }
    ]
};