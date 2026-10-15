// src/core/utils/stories/arithmetic.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

export const ARITHMETIC_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. HORIZONTAL ADDITION (Key: arithmetic_add_std)
    //    Parameters parsed: {f1} (första talet), {f2} (andra talet)
    // =========================================================================
    arithmetic_add_std: [
        {
            id: "arith_add_piggybank",
            sv: "Du har {f1} kr i din spargris och får {f2} kr till av din mormor. Hur mycket pengar har du totalt?",
            en: "You have {f1} kr in your piggy bank and get another {f2} kr from your grandmother. How much money do you have in total?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "arith_add_gamecards",
            sv: "Liam samlar på spelkort. Han har {f1} kort och köper ett paket med {f2} kort till. Hur många kort har han nu?",
            en: "Liam collects gaming cards. He has {f1} cards and buys a pack with {f2} more cards. How many cards does he have now?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_mobilegamepoints",
            sv: "I ett mobilspel har du samlat {f1} poäng. Du klarar en bonusbana och får {f2} poäng till. Vad blir ditt nya poängsaldo?",
            en: "In a mobile game, you have collected {f1} points. You clear a bonus round and get {f2} more points. What is your new score?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_bookpages",
            sv: "En skolklass har läst {f1} sidor i en bokserie förra veckan, och {f2} sidor den här veckan. Hur många sidor har de läst totalt?",
            en: "A school class read {f1} pages in a book series last week, and {f2} pages this week. How many pages have they read in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_accountfollowers",
            sv: "Du har {f1} följare på ditt konto och ett av dina klipp blir viralt så att du får {f2} nya följare. Hur många följare har du nu?",
            en: "You have {f1} followers on your account and one of your videos goes viral, gaining you {f2} new followers. How many followers do you have now?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_applesbox",
            sv: "En fruktaffär har {f1} gröna äpplen och {f2} röda äpplen i en stor låda. Hur många äpplen finns det totalt i lådan?",
            en: "A fruit shop has {f1} green apples and {f2} red apples in a large box. How many apples are in the box in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_cyclingdistance",
            sv: "Under en cykelsemester cyklar du {f1} meter före lunch och ytterligare {f2} meter efter lunch. Hur långt har du cyklat totalt?",
            en: "During a cycling trip, you ride {f1} meters before lunch and another {f2} meters after lunch. How far have you ridden in total?"
        },
        {
            id: "arith_add_puzzlepieces",
            sv: "I ett pussel ligger det {f1} bitar på bordet och {f2} bitar kvar i kartongen. Hur många bitar har pusslet totalt?",
            en: "In a jigsaw puzzle, there are {f1} pieces on the table and {f2} pieces left in the box. How many pieces does the puzzle have in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_bakingcookies",
            sv: "Du bakar {f1} chokladkakor och {f2} vaniljkakor till ett skolfika. Hur många kakor har du bakat sammanlagt?",
            en: "You bake {f1} chocolate cookies and {f2} vanilla cookies for a school bake sale. How many cookies have you baked altogether?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_trainpassengers",
            sv: "Ett tåg har {f1} passagerare när det startar och plockar upp {f2} passagerare till vid nästa station. Hur många åker med tåget nu?",
            en: "A train has {f1} passengers when it starts and picks up another {f2} passengers at the next station. How many people are riding the train now?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_onlinefriends",
            sv: "Du har {f1} vänner på din spellista online och lägger till {f2} nya spelare efter en match. Hur många vänner har du på listan nu?",
            en: "You have {f1} friends on your online gaming list and add {f2} new players after a match. How many friends do you have on the list now?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_sportballs",
            sv: "I en sportaffär finns det {f1} fotbollar och {f2} basketbollar på lagret. Hur många bollar har affären totalt på lagret?",
            en: "In a sports shop, there are {f1} soccer balls and {f2} basketballs in the warehouse. How many balls does the shop have in the warehouse in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_gardenflowers",
            sv: "Du planterar blommor i trädgården. Det finns redan {f1} blommor och du sätter {f2} frön till som grott. Hur många blommor blir det totalt?",
            en: "You are planting flowers in the garden. There are already {f1} flowers and you plant {f2} more sprouted seeds. How many flowers will there be in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_cinematickets",
            sv: "En biograf säljer {f1} biljetter till eftermiddagsvisningen och {f2} biljetter till kvällsvisningen. Hur många biljetter säljs totalt?",
            en: "A cinema sells {f1} tickets for the afternoon screening and {f2} tickets for the evening screening. How many tickets are sold in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_phonephotos",
            sv: "Du har {f1} digitala bilder på din telefon och tar {f2} nya bilder under en konsert. Hur många bilder har du på telefonen nu?",
            en: "You have {f1} digital photos on your phone and take {f2} new photos during a concert. How many photos do you have on your phone now?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_schoolstudents",
            sv: "I en skola går det {f1} elever på lågstadiet och {f2} elever på mellanstadiet. Hur många elever går det totalt på de två stadierna?",
            en: "In a school, there are {f1} students in lower elementary and {f2} students in upper elementary. How many students are there in total across both levels?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_bakerybuns",
            sv: "Ett bageri säljer {f1} frallor på morgonen och bakar {f2} frallor till inför lunchen. Hur många frallor har bageriet hanterat totalt?",
            en: "A bakery sells {f1} buns in the morning and bakes {f2} more buns before lunch. How many buns has the bakery handled in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_stickersheet",
            sv: "Du samlar på klistermärken. Du har {f1} stycken och får ett ark med {f2} nya klistermärken av en kompis. Hur många har du nu?",
            en: "You collect stickers. You have {f1} pieces and get a sheet with {f2} new stickers from a friend. How many do you have now?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_add_fundraiser",
            sv: "Under en insamling samlar klassen in {f1} kr på måndagen och {f2} kr på tisdagen. Hur mycket pengar har klassen samlat in totalt?",
            en: "During a fundraiser, the class collects {f1} kr on Monday and {f2} kr on Tuesday. How much money has the class collected in total?",
            rules: {
                minResult: 1
            }
        },
        {
            id: "arith_add_librarybooks",
            sv: "Ett bibliotek köper in {f1} nya skönlitterära böcker och {f2} faktaböcker. Hur många nya böcker har biblioteket köpt in totalt?",
            en: "A library buys {f1} new fiction books and {f2} non-fiction books. How many new books has the library bought in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        }
    ],

    // =========================================================================
    // 🎯 2. HORIZONTAL SUBTRACTION (Key: arithmetic_sub_std)
    //    Parameters parsed: {f1} (startvärde), {f2} (avdrag/minskningsvärde)
    // =========================================================================
    arithmetic_sub_std: [
        {
            id: "arith_sub_snackpurchase",
            sv: "Du har {f1} kr på ditt konto och köper ett mellanmål för {f2} kr. Hur mycket pengar har du kvar på kontot?",
            en: "You have {f1} kr in your account and buy a snack for {f2} kr. How much money do you have left in your account?",
            rules: {
                greaterThan: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_fruitgrapes",
            sv: "En fruktskål innehåller {f1} vindruvor. Du äter upp {f2} stycken av dem. Hur många vindruvor finns kvar i skålen?",
            en: "A fruit bowl contains {f1} grapes. You eat {f2} of them. How many grapes are left in the bowl?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_songplaylist",
            sv: "Du har startat en spellista med {f1} låtar men rensar bort {f2} låtar som du har tröttnat på. Hur många låtar är kvar på listan?",
            en: "You started a playlist with {f1} songs but clear out {f2} tracks that you are tired of. How many songs are left on the list?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_puzzlelostpieces",
            sv: "Ett pussel har {f1} bitar från början. Du råkar tappa bort {f2} bitar under soffan. Hur många bitar kan du lägga pusslet med nu?",
            en: "A puzzle has {f1} pieces originally. You accidentally lose {f2} pieces under the couch. How many pieces can you build the puzzle with now?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_rosesclosing",
            sv: "En blombutik har {f1} rosor på morgonen och säljer {f2} rosor under dagen. Hur många rosor har butiken kvar när de stänger?",
            en: "A flower shop has {f1} roses in the morning and sells {f2} roses during the day. How many roses does the shop have left when closing?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_appdelete",
            sv: "Du har laddat ner {f1} appar på din surfplatta men raderar {f2} stora spel för att spara utrymme. Hur många appar har du kvar?",
            en: "You have downloaded {f1} apps on your tablet but delete {f2} large games to save space. How many apps do you have left?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_marathondropout",
            sv: "I ett maratonlopp startar {f1} löpare, men längs vägen väljer {f2} löpare att bryta loppet. Hur många löpare tar sig i mål?",
            en: "In a marathon race, {f1} runners start, but along the way, {f2} runners choose to drop out. How many runners make it to the finish line?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_readingremaining",
            sv: "En bok har {f1} sidor totalt. Du har redan hunnit läsa {f2} sidor. Hur många sidor har du kvar att läsa innan boken är slut?",
            en: "A book has {f1} pages in total. You have already managed to read {f2} pages. How many pages do you have left to read before the book ends?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_partybuns",
            sv: "Du har bakat {f1} bullar till ett kalas. Gästerna äter upp {f2} bullar under fikat. Hur många bullar får du över?",
            en: "You baked {f1} cinnamon buns for a party. The guests eat {f2} buns during the coffee break. How many buns do you have left over?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_laptopbattery",
            sv: "Ett batteri på en bärbar dator har en kapacitet på {f1} % på morgonen. Efter några timmars arbete har den sjunkit med {f2} %. Vad är batteriprocenten nu?",
            en: "A laptop battery has a capacity of {f1}% in the morning. After a few hours of work, it has dropped by {f2}%. What is the battery percentage now?",
            rules: {
                greaterThan: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_comiccollection",
            sv: "Du har en samling med {f1} serietidningar och väljer att sälja {f2} stycken på en loppis. Hur många tidningar har du kvar i din samling?",
            en: "You have a collection of {f1} comic books and choose to sell {f2} of them at a flea market. How many comics do you have left in your collection?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_cinemaseats",
            sv: "I en biosalong sitter det {f1} personer. När filmen är slut lämnar {f2} personer salongen direkt. Hur många personer sitter kvar under eftertexterna?",
            en: "In a cinema hall, there are {f1} people. When the movie ends, {f2} people leave the hall immediately. How many people stay during the credits?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_watertank",
            sv: "En vattentank innehåller {f1} liter vatten. Du använder {f2} liter för att vattna odlingarna i trädgården. Hur många liter vatten är kvar i tanken?",
            en: "A water tank contains {f1} liters of water. You use {f2} liters to water the crops in the garden. How many liters of water are left in the tank?",
            rules: {
                greaterThan: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_wordcount",
            sv: "Du har skrivit en text på datorn som innehåller {f1} ord, men din lärare ber dig att korta ner och ta bort {f2} ord. Hur många ord innehåller texten sen?",
            en: "You have written a text on the computer containing {f1} words, but your teacher asks you to shorten it and remove {f2} words. How many words does the text contain then?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_airplaneseats",
            sv: "Ett flygplan har {f1} sittplatser totalt. Om {f2} platser är tomma under en flygning, hur många passagerare är ombord på planet?",
            en: "An airplane has {f1} seats in total. If {f2} seats are empty during a flight, how many passengers are on board the plane?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_braceletbeads",
            sv: "Du har {f1} pärlor i en burk för att göra armband. Du använder {f2} pärlor till ett stort halsband. Hur många pärlor finns kvar i burken?",
            en: "You have {f1} beads in a jar to make bracelets. You use {f2} beads for a large necklace. How many beads are left in the jar?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_warehouseboxes",
            sv: "Ett lager har {f1} kartonger med varor. En lastbil hämtar {f2} kartonger för att köra ut till kunder. Hur många kartonger finns kvar på lagret?",
            en: "A warehouse has {f1} boxes of goods. A truck picks up {f2} boxes to deliver to customers. How many boxes are left in the warehouse?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_schoolmedals",
            sv: "En skola har {f1} idrottsmedaljer i ett skåp. Under skol-OS delas {f2} av medaljerna ut till eleverna. Hur många medaljer finns kvar i skåpet?",
            en: "A school has {f1} sports medals in a cabinet. During the school Olympics, {f2} of the medals are handed out to students. How many medals are left in the cabinet?",
            rules: {
                greaterThan: ['f1', 'f2'],
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_movieticketcash",
            sv: "Du har {f1} kr i kontanter i din plånbok och köper en biobiljett för {f2} kr. Hur mycket pengar har du kvar i plånboken efter köpet?",
            en: "You have {f1} kr in cash in your wallet and buy a movie ticket for {f2} kr. How much money do you have left in your wallet after the purchase?",
            rules: {
                greaterThan: ['f1', 'f2']
            }
        },
        {
            id: "arith_sub_phonestorage",
            sv: "En mobiltelefon har {f1} GB lagringsutrymme totalt. Om dina appar och bilder tar upp {f2} GB, hur många gigabyte ledigt utrymme har du kvar?",
            en: "A mobile phone has {f1} GB of storage space in total. If your apps and photos take up {f2} GB, how many gigabytes of free space do you have left?",
            rules: {
                greaterThan: ['f1', 'f2']
            }
        }
    ],

    // =========================================================================
    // 🎯 3. STANDARD MULTIPLICATION (Key: arithmetic_mult_std)
    //    Parameters parsed: {f1} (antal grupper), {f2} (antal i varje grupp)
    // =========================================================================
    arithmetic_mult_std: [
        {
            id: "arith_mult_chewinggum",
            sv: "Du köper {f1} paket med tuggummi, och varje paket innehåller exakt {f2} tuggummin. Hur många tuggummin har du totalt?",
            en: "You buy {f1} packs of chewing gum, and each pack contains exactly {f2} pieces. How many pieces of gum do you have in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_cinemarows",
            sv: "I en biosalong finns det {f1} rader med stolar, och varje rad har {f2} sittplatser. Hur många sittplatser finns det totalt i salongen?",
            en: "In a cinema hall, there are {f1} rows of chairs, and each row has {f2} seats. How many seats are there in total in the hall?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_savingsweekly",
            sv: "Du sparar {f2} kr i en burk varje vecka under {f1} veckor. Hur mycket pengar har du lyckats spara ihop totalt under den tiden?",
            en: "You save {f2} kr in a jar every week for {f1} weeks. How much money have you managed to save up in total during that time?",
            rules: {
                integerOnly: ['f1']
            }
        },
        {
            id: "arith_mult_cardpacks",
            sv: "Liam köper {f1} plastförpackningar med samlarkort. Varje förpackning innehåller {f2} kort. Hur många samlarkort får han totalt?",
            en: "Liam buys {f1} plastic packs of trading cards. Each pack contains {f2} cards. How many trading cards does he get in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_worksheets",
            sv: "En lärare delar ut {f2} arbetsblad till var och en av de {f1} eleverna i klassrummet. Hur många arbetsblad har läraren delat ut totalt?",
            en: "A teacher hands out {f2} worksheets to each of the {f1} students in the classroom. How many worksheets has the teacher distributed in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_miniseries",
            sv: "Du laddar ner en miniserie på {f1} avsnitt där varje avsnitt är exakt {f2} minuter långt. Hur många minuter tar det att se hela serien?",
            en: "You download a mini-series of {f1} episodes where each episode is exactly {f2} minutes long. How many minutes does it take to watch the whole series?",
            rules: {
                integerOnly: ['f1']
            }
        },
        {
            id: "arith_mult_chocolatebox",
            sv: "En chokladask har {f1} rader med chokladbitar, och det ligger {f2} bitar i varje rad. Hur många chokladbitar innehåller asken totalt?",
            en: "A chocolate box has {f1} rows of chocolates, and there are {f2} pieces in each row. How many chocolate pieces does the box contain in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_tracklaps",
            sv: "Du tränar inför ett lopp och springer {f2} varv runt en idrottsplats under {f1} dagar i rad. Hur många varv har du sprungit totalt?",
            en: "You are training for a race and run {f2} laps around a sports field for {f1} days in a row. How many laps have you run in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_bakerybags",
            sv: "Ett bageri packar bullar i påsar. De fyller {f1} påsar med {f2} bullar i varje påse. Hur många bullar har bageriet packat totalt?",
            en: "A bakery packs buns into bags. They fill {f1} bags with {f2} buns in each bag. How many buns has the bakery packed in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_sodacrates",
            sv: "Du köper {f1} läskbackar till en klassfest, och varje back innehåller {f2} flaskor läsk. Hur många flaskor läsk har du till festen?",
            en: "You buy {f1} soda crates for a class party, and each crate contains {f2} bottles of soda. How many bottles of soda do you have for the party?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_schoollaptops",
            sv: "En skola beställer nya datorer och packar upp {f1} lådor med {f2} bärbara datorer i varje låda. Hur många batorer har skolan köpt?",
            en: "A school orders new computers and unpacks {f1} boxes with {f2} laptops in each box. How many laptops has the school purchased?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_eveningreading",
            sv: "Du läser {f2} sidor i din bok varje kväll. Hur många sidor har du hunnit läsa totalt efter {f1} kvällars läsning?",
            en: "You read {f2} pages in your book every evening. How many pages have you managed to read in total after {f1} evenings of reading?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_parkinggarage",
            sv: "I ett parkeringshus finns det {f1} våningar, och på varje våning ryms exakt {f2} bilar. Hur många bilar ryms totalt i parkeringshuset?",
            en: "In a parking garage, there are {f1} floors, and each floor accommodates exactly {f2} cars. How many cars fit in the parking garage in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_sweatershipment",
            sv: "Ett klädföretag skickar {f1} kartonger med tröjor till en butik. Varje kartong innehåller {f2} tröjor. Hur många tröjor får butiken?",
            en: "A clothing company ships {f1} boxes of sweaters to a store. Each box contains {f2} sweaters. How many sweaters does the store receive?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_braceletbeads",
            sv: "Du gör egna armband och använder {f2} pärlor till varje armband. Hur många pärlor går åt om du gör {f1} stycken armband?",
            en: "You make custom bracelets and use {f2} beads for each bracelet. How many beads are used if you make {f1} bracelets?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_gamemissions",
            sv: "Ett onlinespel släpper {f1} nya säsonger per år, och varje säsong innehåller {f2} unika uppdrag. Hur många uppdrag släpps totalt på ett år?",
            en: "An online game releases {f1} new seasons per year, and each season contains {f2} unique missions. How many missions are released in total in a year?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_stoolcrews",
            sv: "En hantverkare bygger pallar och använder {f2} skruvar till varje pall. Hur många skruvar går åt för att montera {f1} pallar?",
            en: "A craftsman builds stools and uses {f2} screws for each stool. How many screws are needed to assemble {f1} stools?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_eraserpacks",
            sv: "Du köper {f1} paket med suddgummin till skolan, och varje paket innehåller {f2} suddgummin. Hur många suddgummin har du fått totalt?",
            en: "You buy {f1} packs of erasers for school, and each pack contains {f2} erasers. How many erasers have you obtained in total?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_greenhousetomatoes",
            sv: "Ett växthus har {f1} rader med tomatplantor, och varje rad har {f2} plantor. Hur många tomatplantor finns det totalt i växthuset?",
            en: "A greenhouse has {f1} rows of tomato plants, and each row has {f2} plantor. How many tomato plants are there in total in the greenhouse?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        },
        {
            id: "arith_mult_magazinesubscription",
            sv: "Du prenumererar på en tidning och får {f2} nummer per månad. Hur många tidningar har du samlat på dig efter {f1} månader?",
            en: "You subscribe to a magazine and receive {f2} issues per month. How many magazines have you collected after {f1} months?",
            rules: {
                integerOnly: ['f1', 'f2']
            }
        }
    ],

    // =========================================================================
    // 🎯 4. BASIC EXACT DIVISION (Key: arithmetic_div_std)
    //    Parameters parsed: {prod} (totalt antal), {f1} (delningsfaktor/nämnare)
    // =========================================================================
    arithmetic_div_std: [
        // =====================================================================
        // 💧 Continuous / Decimal Division Scenarios (Supports Decimals & prod < f1)
        // =====================================================================
        {
            id: "arith_div_juice_pitcher",
            sv: "En kanna med {prod} liter saft hälls upp helt jämnt i {f1} glas. Hur många liter saft hamnar i varje glas?",
            en: "A pitcher with {prod} liters of juice is poured completely evenly into {f1} glasses. How many liters of juice end up in each glass?",
            rules: {
                minResult: 0.001
            }
        },
        {
            id: "arith_div_ribbon_craft",
            sv: "Ett sidenband som är {prod} meter långt klipps i {f1} lika långa bitar till ett pyssel. Hur lång blir varje bit i meter?",
            en: "A silk ribbon measuring {prod} meters in length is cut into {f1} equal pieces for a craft project. How long is each piece in meters?",
            rules: {
                minResult: 0.001
            }
        },
        {
            id: "arith_div_flour_baking",
            sv: "En påse med {prod} kg mjöl ska fördelas i mindre behållare så att varje behållare rymmer {f1} kg. Hur många behållare fylls?",
            en: "A bag of {prod} kg of flour is to be split into containers holding {f1} kg each. How many containers are filled?",
            rules: {
                minResult: 0.001
            }
        },
        {
            id: "arith_div_runner_track_laps",
            sv: "En löparbana runt en park är {f1} km lång. Om en person sammanlagt har sprungit {prod} km, hur många varv runt banan motsvarar det?",
            en: "A running track around a park is {f1} km long. If a runner has completed {prod} km in total, how many laps does that correspond to?",
            rules: {
                minResult: 0.001
            }
        },
        {
            id: "arith_div_paint_portions",
            sv: "En burk innehåller {prod} liter färg som delas upp i mindre färgkoppar som rymmer {f1} liter var. Hur många koppar kan fyllas?",
            en: "A tin contains {prod} liters of paint divided into cups holding {f1} liters each. How many cups can be filled?",
            rules: {
                minResult: 0.001
            }
        },

        // =====================================================================
        // 🍬 Discrete / Integer Division Scenarios (Requires Integers & prod > f1)
        // =====================================================================
        {
            id: "arith_div_candysplit",
            sv: "Du har {prod} godisbitar som du vill dela helt lika mellan dina {f1} kompisar. Hur många godisbitar får varje kompis?",
            en: "You have {prod} candies that you want to split completely evenly among your {f1} friends. How many candies does each friend get?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_flowerrows",
            sv: "En trädgårdsmästare ska plantera {prod} blommor i {f1} lika långa rader. Hur många blommor ska planteras i varje rad?",
            en: "A gardener is going to plant {prod} flowers in {f1} equal rows. How many flowers should be planted in each row?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_fundraisereven",
            sv: "Klassen har samlat in {prod} kr till en skolresa och ska fördela pengarna på {f1} elever. Hur mycket får varje elev?",
            en: "The class has raised {prod} kr for a school trip and will distribute the money among {f1} students. How much does each student get?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['f1']
            }
        },
        {
            id: "arith_div_cookiepack",
            sv: "Du har bakat {prod} kakor som ska packas i {f1} likadana kakburkar. Hur många kakor ska du lägga i varje burk för att det ska bli jämnt?",
            en: "You baked {prod} cookies to be packed into {f1} identical cookie jars. How many cookies should you put in each jar to make it even?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_floorballbaskets",
            sv: "En idrottslärare har {prod} innebandybollar som ska fördelas helt jämnt i {f1} materialkorgar. Hur många bollar hamnar i varje korg?",
            en: "A sports teacher has {prod} floorball balls to be distributed completely evenly into {f1} equipment baskets. How many balls end up in each basket?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_movietimesplit",
            sv: "Du har en filmfil som tar {prod} minuter att spela upp totalt. Om du delar upp tittandet på {f1} lika långa kvällar, hur många minuter kollar du per kväll?",
            en: "You have a movie file that takes {prod} minutes to play in total. If you split the viewing into {f1} equal evenings, how many minutes do you watch per evening?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['f1']
            }
        },
        {
            id: "arith_div_bakerybunpackaging",
            sv: "Ett bageri har {prod} frallor som ska förpackas i påsar med {f1} frallor i varje påse. Hur många påsar kan bageriet fylla totalt?",
            en: "A bakery has {prod} buns to be packed into bags with {f1} buns in each bag. How many bags can the bakery fill in total?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_camphike",
            sv: "Under en lägervecka vandrar en grupp totalt {prod} meter. De delar upp sträckan på {f1} dagar. Hur många meter vandrar de i genomsnitt per dag?",
            en: "During a camp week, a group hikes {prod} meters in total. They split the distance over {f1} days. How many meters do they hike on average per day?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['f1']
            }
        },
        {
            id: "arith_div_stickerpages",
            sv: "Du köper en stor förpackning med {prod} klistermärken och delar upp dem jämnt på {f1} boksidor. Hur många klistermärken sätter du på varje sida?",
            en: "You buy a large pack of {prod} stickers and divide them evenly across {f1} book pages. How many stickers do you put on each page?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_garagefloorcars",
            sv: "Ett parkeringshus har {prod} parkeringsplatser fördelade på {f1} lika stora våningsplan. Hur många bilar får det plats på varje våningsplan?",
            en: "A parking garage has {prod} parking spaces distributed across {f1} equal floors. How many cars can fit on each floor plan?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_laptopdistribution",
            sv: "En skola har fått {prod} bärbara datorer som ska fördelas helt jämnt mellan {f1} klassrum. Hur många datorer får varje klassrum?",
            en: "A school has received {prod} laptops to be distributed completely evenly among {f1} classrooms. How many laptops does each classroom get?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_bookreadingdays",
            sv: "Du har en bok med {prod} sidor totalt. Om du planerar att läsa ut boken på {f1} dagar, hur många sidor måste du läsa i genomsnitt per dag?",
            en: "You have a book with {prod} pages in total. If you plan to finish the book in {f1} days, how many pages must you read on average per day?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_truckloads",
            sv: "Ett lager ska skicka {prod} kartonger med varor och lastar dem helt jämnt på {f1} lastbilar. Hur många kartonger får varje lastbil med sig?",
            en: "A warehouse needs to ship {prod} boxes of goods and loads them completely evenly onto {f1} trucks. How many boxes does each truck carry?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_necklacebeads",
            sv: "Du har {prod} pärlor och ska trä dem på trådar för att göra {f1} likadana halsband. Hur många pärlor ska du använda till varje halsband?",
            en: "You have {prod} beads and will string them onto threads to make {f1} identical necklaces. How many beads should you use for each necklace?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_postertubes",
            sv: "Ett tryckeri har producerat {prod} affischer. De packas i rullar med {f1} affischer i varje rulle. Hur många rullar fyller tryckeriet totalt?",
            en: "A printing shop has produced {prod} posters. They are packed into tubes with {f1} posters in each tube. How many tubes does the print shop fill in total?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_orchardcrates",
            sv: "En fruktodling skördar {prod} kg äpplen och fördelar dem jämnt i {f1} trälådor för transport. Hur många kilo äpplen väger varje trälåda?",
            en: "A fruit orchard harvests {prod} kg of apples and distributes them evenly into {f1} wooden crates for transport. How many kilograms of apples does each wooden crate weigh?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['f1']
            }
        },
        {
            id: "arith_div_gamexp",
            sv: "Ett onlinespel har ett stort uppdrag som ger {prod} erfarenhetspoäng totalt. Poängen fördelas helt jämnt mellan de {f1} spelarna i gruppen. Hur många poäng får varje spelare?",
            en: "An online game has a large mission that awards {prod} experience points in total. The points are distributed completely evenly among the {f1} players in the group. How many points does each player get?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_wireenclosures",
            sv: "Du har köpt en rulle med {prod} meter stängseltråd för att bygga {f1} inhägnader. Hur många meter tråd räcker det till för varje inhägnad?",
            en: "You have bought a roll of {prod} meters of fencing wire to build {f1} enclosures. How many meters of wire does that allow for each enclosure?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['f1']
            }
        },
        {
            id: "arith_div_growingbeds",
            sv: "Ett växthus har fått {prod} tomatplantor som ska planteras i {f1} likadana odlingsbäddar. Hur många plantor ska sättas i varje bädd?",
            en: "A greenhouse has received {prod} tomato plants to be planted in {f1} identical growing beds. How many plants should be set in each bed?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        },
        {
            id: "arith_div_envelopecash",
            sv: "Du har {prod} tior i en spargris och vill fördela dem helt jämnt i {f1} kuvert för att spara till olika saker. Hur många tior lägger du i varje kuvert?",
            en: "You have {prod} ten-kronor coins in a piggy bank and want to distribute them completely evenly into {f1} envelopes to save for different things. How many coins do you put in each envelope?",
            rules: {
                greaterThan: ['prod', 'f1'],
                integerOnly: ['prod', 'f1']
            }
        }
    ]
};