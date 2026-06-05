// src/core/utils/stories/expressions.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const EXPRESSION_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    //  1. ALGEBRA EXPRESSIONS (Placeholders: {op1}, {a}, {op2}, {b})
    // =========================================================================
    algebra_expressions: [
        {
            sv: "Det finns x passagerare på en buss. Vid nästa hållplats går {a} personer av, sedan kliver {b}x passagerare på. Skriv och förenkla ett uttryck för det nya antalet passagerare.",
            en: "Initially, there are x passengers on a bus. At the next stop, {a} people get off, then {b}x passengers board. Write and simplify an expression for the new number of passengers."
        },
        {
            sv: "Du har x poäng på ditt spelkonto från start. Du köper ett föremål för {a} poäng och lyckas sedan vinna en utmaning som ger {b}x poäng till. Skriv uttrycket för ditt nya poängsaldo.",
            en: "You have x points on your game account from the start. You buy an item for {a} points and then manage to win a challenge that awards another {b}x points. Write the expression for your new point balance."
        },
        {
            sv: "En godispåse innehåller x sura nappar. Du äter upp {a} stycken nappar ur påsen och köper sedan till {b} stycken likadana påsar med x nappar i varje. Teckna uttrycket för det totala antalet nappar.",
            en: "A candy bag contains x sour drops. You eat {a} drops from the bag and then purchase another {b} identical bags with x drops in each. Write the expression for the total number of candy drops."
        },
        {
            sv: "I en spellista finns det x låtar. Du rensar bort {a} låtar som du tröttnat på, men lägger sedan till {b} stycken album som innehåller x låtar var. Skriv uttrycket för antalet låtar på listan.",
            en: "There are x songs in a playlist. You clear out {a} songs you are tired of, but then add {b} albums containing x songs each. Write the expression for the number of songs on the list."
        },
        {
            sv: "En streamer startar en livesändning med x tittare i chatten. Efter en stund lämnar {a} personer sändningen, men kort därefter blir kanalen rekommenderad och får {b}x nya tittare. Teckna uttrycket för chatten.",
            en: "A streamer starts a live broadcast with x viewers in chat. After a while, {a} people leave the stream, but shortly after, the channel gets recommended and gains {b}x new viewers. Write the expression for the chat."
        },
        {
            sv: "Du har x sparade kr i en digital plånbok. Du swishar {a} kr till en kompis och tjänar sedan ihop {b}x kr på ett sommarjobb. Skriv uttrycket som beskriver hur mycket pengar du har nu.",
            en: "You have x saved kr in a digital wallet. You swish {a} kr to a friend and then earn {b}x kr from a summer job. Write the expression describing how much money you have now."
        },
        {
            sv: "I en låda ligger det x stycken markers. Under en bildlektion försvinner {a} markers, men läraren fyller på förrådet med {b}x nya markers till lådan. Skriv uttrycket för antalet markers.",
            en: "A box contains x markers. During an art class, {a} markers go missing, but the teacher replenishes the stock with {b}x new markers for the box. Write the expression for the number of markers."
        },
        {
            sv: "Maja har x bilder sparade på sin telefon. Hon raderar {a} gamla dubbletter och laddar sedan ner {b}x nya bilder från ett delat album. Teckna uttrycket för Majas totala antal bilder.",
            en: "Maja has x photos saved on her phone. She deletes {a} old duplicates and then downloads {b}x new photos from a shared album. Write the expression for Maja's total photo count."
        },
        {
            sv: "Ett gamingkonto har x aktiva följare. Under en helg tappar kontot {a} följare, men efter ett lyckat klipp ökar följarantalet med {b}x personer till. Skriv uttrycket för kontots följare.",
            en: "A gaming account has x active followers. Over a weekend the account loses {a} followers, but after a successful clip the follower count increases by another {b}x people. Write the expression for the account's followers."
        },
        {
            sv: "Det ligger x kalla drycker i en kyl i caféet. Skolans personal plockar ut {a} drycker till ett möte, och fyller sedan på kylen med {b}x nya drycker inför rasten. Teckna uttrycket för dryckerna.",
            en: "There are x cold drinks in a cafe cooler. School staff take out {a} drinks for a meeting, and then refill the cooler with {b}x new drinks ahead of recess. Write the expression for the drinks."
        },
        {
            sv: "Du har lagt till x låtar i en kö. Appen spelar upp {a} av låtarna, men du lägger direkt till {b}x nya låtar till kön igen. Skriv uttrycket för hur många låtar som ligger i kön nu.",
            en: "You added x songs to a queue. The app plays {a} of the songs, but you immediately add {b}x new songs back to the queue. Write the expression for how many songs are in the queue now."
        },
        {
            sv: "En bit dekorationsband har längden x cm. Du klipper av en bit på {a} cm till ett pyssel, och köper sedan till {b}x cm band till rullen. Skriv uttrycket för bandets totala längd.",
            en: "A piece of decorative ribbon has a length of x cm. You cut off a piece of {a} cm for a craft project, and then buy another {b}x cm of ribbon for the roll. Write the expression for the ribbon's total length."
        },
        {
            sv: "Ett skript startar med en variabel satt till värdet x. Skriptet drar bort det fasta värdet {a} och adderar sedan värdet {b}x till variabeln. Teckna uttrycket som skriptet returnerar.",
            en: "A script starts with a variable set to the value x. The script subtracts the fixed value {a} and then adds the value {b}x to the variable. Write the expression that the script returns."
        },
        {
            sv: "En ryggsäck innehåller x stycken anteckningsblock. Du rensar ut {a} gamla block och packar sedan ner {b}x nya block inför terminsstarten. Skriv uttrycket för blocken i väskan.",
            en: "A backpack contains x notebooks. You clean out {a} old notebooks and then pack {b}x new notebooks ahead of the term start. Write the expression for the notebooks in the bag."
        },
        {
            sv: "På ett bord ligger det x stycken klistermärken. Du sätter {a} märken på din bärbara dator och lägger sedan till {b}x nya klistermärken till högen. Teckna uttrycket för märkena på bordet.",
            en: "There are x stickers lying on a table. You place {a} stickers on your laptop and then add {b}x new stickers to the pile. Write the expression for the stickers on the table."
        }
    ],

    // =========================================================================
    //  2. DISTRIBUTE PLUS (Placeholders: {a}, {b}, {c})
    // =========================================================================
    algebra_expressions_dist: [
        {
            sv: "Du startar med {a}x tokens på ditt spelkonto. På första dagen av ett event får du en bonusbox innehållande {b}x tokens plus ytterligare {c} fasta tokens.",
            en: "You start with {a}x tokens in your game account. On day one of an event, you receive a bonus box containing {b}x tokens plus an additional {c} flat tokens."
        },
        {
            sv: "En klädbutik har hängt upp {a}x stycken hoodies i butiken. Från lagret hämtar personalen ut en hel låda som innehåller ytterligare {b}x hoodies och {c} kepsar.",
            en: "A clothing store has hung up {a}x hoodies on display. From the back room, staff fetch a full crate containing an additional {b}x hoodies and {c} caps."
        },
        {
            sv: "På en spellista har du lagt till {a}x låtar. Din kompis delar en mapp med dig som innehåller {b}x låtar till och {c} sparade poddavsnitt som läggs till i kön.",
            en: "You have placed {a}x songs in a queue. Your friend shares a folder containing an additional {b}x songs and {c} saved podcast episodes that get added to the list."
        },
        {
            sv: "Det ligger {a}x kg lösgodis i en stor behållare på ett kalas. Arrangörerna öppnar en påfyllningspåse som bär på {b}x kg godis till och {c} kg snacks.",
            en: "There are {a}x kg of candy in a large tub at a party. The organizers open a replenishment pack carrying an additional {b}x kg of candy and {c} kg of snacks."
        },
        {
            sv: "En streamer startar en livesändning med {a}x personer i chatten. När sändningen hamnar på förstasidan ansluter en grupp bestående av {b}x nya tittare och {c} moderatorer.",
            en: "A streamer starts a live broadcast with {a}x people in chat. When featured on the home page, a group joins consisting of {b}x new viewers and {c} moderators."
        }
    ],

    // =========================================================================
    //  3. DISTRIBUTE MINUS (Placeholders: {a}, {b}, {c})
    // =========================================================================
    algebra_expressions_dist_neg: [
        {
            sv: "Ett lager har ett förråd på {a}x kepsar. För att skicka till en annan butik packar personalen ner ett paket innehållande {b}x kepsar och {c} stycken t-shirts.",
            en: "A warehouse has a supply of {a}x caps. To ship to another store, staff pack away a parcel containing {b}x caps and {c} t-shirts."
        },
        {
            sv: "Du har samlat på dig {a}x poäng i en app. Du väljer att köpa ett kosmetiskt paket som kostar {b}x poäng plus en fast transaktionsavgift på {c} poäng.",
            en: "You gathered {a}x points in an app. You choose to purchase a cosmetic bundle that costs {b}x points plus a flat transaction fee of {c} points."
        },
        {
            sv: "Inledningsvis finns det {a}x passagerare på ett tåg. Vid en centralstation kliver en grupp av tåget bestående av {b}x passagerare och {c} tågvärdar.",
            en: "Initially, there are {a}x passengers on a train. At a central station, a group exits the train consisting of {b}x passengers and {c} conductors."
        },
        {
            sv: "En designer har sorterat {a}x digitala skisser i en mapp. Under en rensning raderar han ett helt block som rymmer {b}x skisser och {c} ofärdiga bakgrunder.",
            en: "A designer sorted {a}x digital sketches in a folder. During a cleanup, they delete an entire block holding {b}x sketches and {c} unfinished backgrounds."
        },
        {
            sv: "Det ligger {a}x markers i en låda i bildsalen. Eleverna tar med sig ett sorterat ställ ut ur salen som rymmer {b}x markers och {c} stycken blyertspennor.",
            en: "There are {a}x markers in a box in the art room. Students take a sorted rack out of the room that holds {b}x markers and {c} graphite pencils."
        }
    ],

    // =========================================================================
    //  4. DISTRIBUTE COMBINE STD (Placeholders: {a}, {b}, {c}, {op}, {d})
    // =========================================================================
    algebra_expressions_expand: [
        {
            sv: "Du köper {a} stycken likadana mystery-boxar till din spelsamling. Varje box innehåller {b}x sällsynta kort och {c} vanliga klistermärken. Utöver boxarna har du redan {d}x lösa sällsynta kort liggande.",
            en: "You buy {a} identical mystery boxes for your collection. Each box contains {b}x rare cards and {c} standard stickers. Outside of the boxes, you already have {d}x loose rare cards lying around."
        },
        {
            sv: "Ett skollag beställer in {a} paket med utrustning. Varje förpackning bär på {b}x träningsbollar och {c} vattenflaskor. Lagkaptenen har sedan tidigare med sig {d}x bollar till planen.",
            en: "A school team orders {a} packs of gear. Each pack carries {b}x practice balls and {c} water bottles. The team captain already brought {d}x loose balls to the field."
        },
        {
            sv: "En kläddesigner förbereder {a} stycken klädhängare. På varje enskild hängare sätter han {b}x hoodies och {c} t-shirts. På en separat ställning bredvid hänger det ytterligare {d}x hoodies.",
            en: "A clothing designer prepares {a} clothing racks. On each individual rack, they place {b}x hoodies and {c} t-shirts. On a separate hanger nearby, an additional {d}x hoodies are hanging loose."
        },
        {
            sv: "Du bygger en ljusinstallation och köper {a} rullar med tillbehör. Varje rulle innehåller {b}x meter LED-tejp och {c} fästklämmor. Du har också en lös bit tejp på {d}x meter som ska kopplas på.",
            en: "You build a light installation and buy {a} rolls of supplies. Each roll contains {b}x meters of LED tape and {c} mounting clips. You also have a loose strip of tape measuring {d}x meters to connect."
        },
        {
            sv: "Inför en turnering packar arrangörerna {a} stycken likadana prislådor. Varje låda fylls med {b}x tokens och {c} nyckelringar. Dessutom delas en startbonus ut på {d}x tokens direkt på kontot.",
            en: "Ahead of a tournament, organizers pack {a} identical prize crates. Each crate is filled with {b}x tokens and {c} keychains. Additionally, a starting bonus of {d}x tokens is credited directly."
        },
        {
            sv: "En caféägare köper in {a} stycken likadana fikalådor till serveringen. Varje låda rymmer {b}x kalla drycker och {c} förpackningar snacks. I kylen står det sedan tidigare {d}x lösa drycker.",
            en: "A cafe owner purchases {a} identical snack boxes for the counter. Each box holds {b}x cold drinks and {c} snack packs. In the cooler, there are already {d}x loose drinks stored."
        },
        {
            sv: "Ett e-sportlag beställer {a} stycken lagboxar med merch. Varje box innehåller {b}x musmattor och {c} klistermärken. Laget har också fått {d}x lösa musmattor skickade direkt till sitt gamingrum.",
            en: "An e-sports team orders {a} team merch crates. Each box contains {b}x mousepads and {c} stickers. The team also received {d}x loose mousepads sent directly to their gaming room."
        },
        {
            sv: "Till en bildlektion köper skolan in {a} stycken likadana målarset. Varje set innehåller {b}x akrylfärger och {c} penslar. I ett skåp i salen har läraren dessutom en reservbunt med {d}x färger.",
            en: "For an art class, the school purchases {a} identical painting sets. Each set contains {b}x acrylic paints and {c} brushes. In a cabinet in the room, the teacher also has a reserve bundle of {d}x paints."
        },
        {
            sv: "Du sätter ihop {a} stycken likadana reservbatterier till ett teknikbygge. Varje batteriblock rymmer {b}x litiumceller och {c} fästskruvar. Du ansluter också en extern panel som bär på {d}x celler.",
            en: "You assemble {a} identical backup batteries for a tech project. Each battery block holds {b}x lithium cells and {c} mounting screws. You also connect an external panel carrying {d}x cells."
        },
        {
            sv: "Ett bussbolag köper in {a} stycken likadana reparationssatser. Varje sats innehåller {b}x reservkablar och {c} säkringar. Vaktmästaren har lagt undan {d}x lösa kablar på sin verktygsbänk.",
            en: "A bus company purchases {a} identical repair kits. Each kit contains {b}x spare cables and {c} fuses. The caretaker has set aside {d}x loose cables on his tool bench."
        },
        {
            sv: "En löparklubb packar {a} stycken likadana startpåsar till ett lopp. Varje påse förses med {b}x energidrycker och {c} reflexband. I klubbens förråd står det dessutom {d}x lösa drycker.",
            en: "A running club packs {a} identical starter bags for a race. Each bag is supplied with {b}x energy drinks and {c} reflective bands. In the club locker, there are also {d}x loose drinks left over."
        },
        {
            sv: "Du programmerar {a} stycken likadana spelfunktioner i en spelmotor. Varje funktion skapar {b}x fiendespawns och {c} fasta triggers. Baskoden i skriptet har sedan tidigare {d}x inlästa fiendespawns.",
            en: "You program {a} identical game functions in a game engine. Each function creates {b}x enemy spawns and {c} fixed triggers. The script's base code already has {d}x loaded enemy spawns."
        },
        {
            sv: "En skräddare klipper till {a} stycken likadana tygstycken till gardiner. Varje del förbrukar {b}x cm sidentyg och {c} cm fästband. På rullen finns det utöver detta {d}x cm sidentyg kvar.",
            en: "A tailor cuts {a} identical fabric pieces for curtains. Each section consumes {b}x cm of silk fabric and {c} cm of binding tape. On the roll, there is an additional {d}x cm of silk fabric remaining."
        },
        {
            sv: "Inför ett skolarbete köper du {a} stycken likadana häften med papper. Varje häfte har {b}x linjerade sidor och {c} blanka sidor. Hemma på skrivbordet har du ett löst block med {d}x linjerade sidor.",
            en: "For a school assignment, you buy {a} identical packages of paper. Each pack has {b}x lined pages and {c} blank pages. At home on your desk, you have a loose pad with {d}x lined pages."
        },
        {
            sv: "En musikstudio köper in {a} stycken likadana mikrofonkit. Varje kit innehåller {b}x anslutningskablar och {c} adaptrar. I studions kabelhylla ligger det sedan tidigare {d}x lösa kablar sorterade.",
            en: "A music studio purchases {a} identical microphone kits. Each kit contains {b}x connector cables and {c} adapters. On the studio's cable shelf, there are already {d}x loose cables sorted."
        }
    ]
};