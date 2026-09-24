// src/core/utils/stories/expressions.stories.ts

export const EXPRESSION_STORIES: Record<string, any[]> = {
    // =========================================================================
    //  1. ALGEBRA EXPRESSIONS (4 Terms: {a}x, {op1}, {b}, {op2}, {c}x, {op3}, {d})
    // =========================================================================
    algebra_expressions: [
        {
            sv: "Du har {a} askar med x samlarkort i varje. Under en bytardag loggar du tre förändringar i din samling: {op1} {b} lösa kort, {op2} {c} askar, och {op3} {d} lösa kort.",
            en: "You have {a} boxes with x trading cards each. During a trading event, you log three changes to your collection: {op1} {b} loose cards, {op2} {c} boxes, and {op3} {d} loose cards."
        },
        {
            sv: "I ett spel startar du med {a} kistor som rymmer x mynt vardera. På skärmen dyker följande händelselogg upp: {op1} {b} lösa mynt, {op2} {c} kistor, och {op3} {d} lösa mynt.",
            en: "In a game, you start with {a} chests holding x coins each. On the screen, the following event log appears: {op1} {b} loose coins, {op2} {c} chests, and {op3} {d} loose coins."
        },
        {
            sv: "En klädbutik har {a} lådor med x kepsar i varje. Under dagen registreras följande inventering på lagret: {op1} {b} lösa kepsar, {op2} {c} lådor, och {op3} {d} lösa kepsar.",
            en: "A clothing store has {a} boxes with x caps in each. During the day, the following inventory changes are registered: {op1} {b} loose caps, {op2} {c} boxes, and {op3} {d} loose caps."
        },
        {
            sv: "På din spellista har du {a} album med x låtar i varje. Du gör sedan följande justeringar i kön: {op1} {b} lösa låtar, {op2} {c} album, och {op3} {d} lösa låtar.",
            en: "On your playlist, you have {a} albums with x songs in each. You then make the following adjustments to the queue: {op1} {b} loose songs, {op2} {c} albums, and {op3} {d} loose songs."
        },
        {
            sv: "Till en klassfest köps det in {a} påsar med x chokladbitar. Innan festen börjar sker dessa justeringar: {op1} {b} lösa chokladbitar, {op2} {c} påsar, och {op3} {d} lösa chokladbitar.",
            en: "For a class party, {a} bags with x chocolates are bought. Before the party begins, these adjustments occur: {op1} {b} loose chocolates, {op2} {c} bags, and {op3} {d} loose chocolates."
        },
        {
            sv: "Du har {a} förpackningar med x tuschpennor i varje. Under bildlektionen sker följande förändringar i materialet: {op1} {b} lösa pennor, {op2} {c} förpackningar, och {op3} {d} lösa pennor.",
            en: "You have {a} packs with x markers in each. During art class, the following material changes occur: {op1} {b} loose markers, {op2} {c} packs, and {op3} {d} loose markers."
        },
        {
            sv: "I kylen står {a} flak med x energidrycker i varje. Kafépersonalen gör en lageruppdatering: {op1} {b} lösa burkar, {op2} {c} flak, och {op3} {d} lösa burkar.",
            en: "In the cooler, there are {a} trays with x energy drinks each. The cafe staff makes an inventory update: {op1} {b} loose cans, {op2} {c} trays, and {op3} {d} loose cans."
        },
        {
            sv: "Du pysslar med {a} ark som har x klistermärken vardera. Du noterar sedan dessa ändringar på skrivbordet: {op1} {b} lösa klistermärken, {op2} {c} ark, och {op3} {d} lösa klistermärken.",
            en: "You are crafting with {a} sheets that have x stickers each. You then note these changes on your desk: {op1} {b} loose stickers, {op2} {c} sheets, and {op3} {d} loose stickers."
        },
        {
            sv: "Ett teknikskåp rymmer {a} paket med x batterier i varje. Under veckan loggas följande förbrukning: {op1} {b} lösa batterier, {op2} {c} paket, och {op3} {d} lösa batterier.",
            en: "A tech cabinet holds {a} packs with x batteries in each. During the week, the following usage is logged: {op1} {b} loose batteries, {op2} {c} packs, and {op3} {d} loose batteries."
        },
        {
            sv: "I gymmet finns {a} ställ med x vikter i varje. Vid stängning visar inventeringen: {op1} {b} lösa vikter, {op2} {c} ställ, och {op3} {d} lösa vikter.",
            en: "In the gym, there are {a} racks with x weights each. At closing, the inventory shows: {op1} {b} loose weights, {op2} {c} racks, and {op3} {d} loose weights."
        },
        {
            sv: "Ett brädspel har {a} påsar med x spelmarker i varje. Efter en match uppdateras tillgångarna: {op1} {b} lösa marker, {op2} {c} påsar, och {op3} {d} lösa marker.",
            en: "A board game has {a} bags with x tokens in each. After a match, the assets are updated: {op1} {b} loose tokens, {op2} {c} bags, and {op3} {d} loose tokens."
        },
        {
            sv: "Studion har {a} buntar med x kablar. En tekniker loggar följande ändringar i systemet: {op1} {b} lösa kablar, {op2} {c} buntar, och {op3} {d} lösa kablar.",
            en: "The studio has {a} bundles with x cables. A technician logs the following changes in the system: {op1} {b} loose cables, {op2} {c} bundles, and {op3} {d} loose cables."
        },
        {
            sv: "Ett bibliotek har {a} hyllor med x böcker. Vid en omorganisation sker dessa justeringar: {op1} {b} lösa böcker, {op2} {c} hyllor, och {op3} {d} lösa böcker.",
            en: "A library has {a} shelves with x books. During a reorganization, these adjustments occur: {op1} {b} loose books, {op2} {c} shelves, and {op3} {d} loose books."
        },
        {
            sv: "En bio har {a} kartonger med x snacks i varje. Kiosken rapporterar dagens förändringar: {op1} {b} lösa snacks, {op2} {c} kartonger, och {op3} {d} lösa snacks.",
            en: "A cinema has {a} boxes with x snacks in each. The kiosk reports the day's changes: {op1} {b} loose snacks, {op2} {c} boxes, and {op3} {d} loose snacks."
        },
        {
            sv: "På ett nöjesfält har du {a} rullar med x biljetter. Efter att ha spelat flera spel visar saldot: {op1} {b} lösa biljetter, {op2} {c} rullar, och {op3} {d} lösa biljetter.",
            en: "At an amusement park, you have {a} rolls with x tickets. After playing several games, the balance shows: {op1} {b} loose tickets, {op2} {c} rolls, and {op3} {d} loose tickets."
        },
        {
            sv: "Fiskeutrustningen består av {a} askar med x drag i varje. Efter helgens fiske noteras: {op1} {b} lösa drag, {op2} {c} askar, och {op3} {d} lösa drag.",
            en: "The fishing gear consists of {a} boxes with x lures in each. After the weekend's fishing, the following is noted: {op1} {b} loose lures, {op2} {c} boxes, and {op3} {d} loose lures."
        },
        {
            sv: "En butik har {a} lådor med x armband. Vid inventeringen lägger personalen in följande i datorn: {op1} {b} lösa armband, {op2} {c} lådor, och {op3} {d} lösa armband.",
            en: "A store has {a} boxes with x bracelets. During inventory, staff enter the following into the computer: {op1} {b} loose bracelets, {op2} {c} boxes, and {op3} {d} loose bracelets."
        },
        {
            sv: "Du bygger en skatepark och har {a} rör med x kullager. Under bygget sker dessa materialändringar: {op1} {b} lösa kullager, {op2} {c} rör, och {op3} {d} lösa kullager.",
            en: "You are building a skatepark and have {a} tubes with x bearings. During construction, these material changes occur: {op1} {b} loose bearings, {op2} {c} tubes, and {op3} {d} loose bearings."
        },
        {
            sv: "För ett skolprojekt finns {a} krukor med x frön i varje. Läraren gör en justering för klassen: {op1} {b} lösa frön, {op2} {c} krukor, och {op3} {d} lösa frön.",
            en: "For a school project, there are {a} pots with x seeds each. The teacher makes an adjustment for the class: {op1} {b} loose seeds, {op2} {c} pots, and {op3} {d} loose seeds."
        },
        {
            sv: "Till avslutningen finns {a} paket med x ballonger. Festkommittén loggar följande ändringar i förrådet: {op1} {b} lösa ballonger, {op2} {c} paket, och {op3} {d} lösa ballonger.",
            en: "For graduation, there are {a} packs with x balloons. The party committee logs the following changes in storage: {op1} {b} loose balloons, {op2} {c} packs, and {op3} {d} loose balloons."
        }
    ],

    // =========================================================================
    //  4. DISTRIBUTE COMBINE STD (Placeholders: {a}, {b}x, {c}, {op}, {d}x)
    // =========================================================================
    algebra_expressions_expand: [
        {
            sv: "Du köper {a} stycken mystery-boxar. Varje box innehåller {b}x sällsynta kort och {c} vanliga kort. Senare under dagen sker en justering: {op} {d}x sällsynta kort i din samling.",
            en: "You buy {a} mystery boxes. Each box contains {b}x rare cards and {c} common cards. Later in the day, an adjustment occurs: {op} {d}x rare cards in your collection."
        },
        {
            sv: "Ett e-sportlag beställer {a} utrustningsväskor. Varje väska rymmer {b}x musmattor och {c} klistermärken. Dagen efter gör lagledaren en ändring på lagret: {op} {d}x musmattor.",
            en: "An e-sports team orders {a} equipment bags. Each bag holds {b}x mousepads and {c} stickers. The next day, the team manager makes an inventory change: {op} {d}x mousepads."
        },
        {
            sv: "Till bildsalen fixar läraren {a} lådor. Varje låda är fylld med {b}x penslar och {c} suddgummin. I skåpet bredvid görs en oberoende lagerjustering: {op} {d}x penslar.",
            en: "For the art room, the teacher prepares {a} boxes. Each box is filled with {b}x brushes and {c} erasers. In the cabinet nearby, an independent inventory adjustment is made: {op} {d}x brushes."
        },
        {
            sv: "Inför ett lanparty förbereds {a} brickor. På varje bricka ställs {b}x energidrycker och {c} påsar med snacks. Kort därefter noteras en justering av dryckerna: {op} {d}x energidrycker.",
            en: "Ahead of a LAN party, {a} trays are prepared. On each tray, {b}x energy drinks and {c} snack bags are placed. Shortly after, a beverage adjustment is noted: {op} {d}x energy drinks."
        },
        {
            sv: "Skolans elevråd sätter ihop {a} nätverkskit. Varje kit innehåller {b}x nätverkskablar och {c} adaptrar. Från reservlagret registreras sedan ett tillägg/avdrag: {op} {d}x nätverkskablar.",
            en: "The student council puts together {a} network kits. Each kit contains {b}x network cables and {c} adapters. An addition/deduction is then registered from the reserve stock: {op} {d}x network cables."
        },
        {
            sv: "Du förbereder {a} utflyktskorgar. Varje korg innehåller {b}x smörgåsar och {c} äpplen. Innan bussen åker görs en sista ändring i packningen: {op} {d}x smörgåsar.",
            en: "You prepare {a} picnic baskets. Each basket contains {b}x sandwiches and {c} apples. Before the bus leaves, a final change is made to the packing: {op} {d}x sandwiches."
        },
        {
            sv: "Till ett barnkalas görs {a} kalaspåsar. Varje påse fylls med {b}x godisbitar och {c} studsbollar. Precis innan gästerna kommer sker en ändring: {op} {d}x godisbitar.",
            en: "For a birthday party, {a} goodie bags are made. Each bag is filled with {b}x candies and {c} bouncy balls. Just before guests arrive, a change occurs: {op} {d}x candies."
        },
        {
            sv: "En fritidsgård köper in {a} pyssellådor. Varje låda rymmer {b}x limstift och {c} saxar. Efter första veckan noteras en justering i inventariet: {op} {d}x limstift.",
            en: "A youth center buys {a} craft boxes. Each box holds {b}x glue sticks and {c} scissors. After the first week, an inventory adjustment is noted: {op} {d}x glue sticks."
        },
        {
            sv: "Ett byggprojekt kräver {a} verktygslådor. Varje låda innehåller {b}x skruvmejslar och {c} skiftnycklar. Chefen gör därefter en materialuppdatering: {op} {d}x skruvmejslar.",
            en: "A construction project requires {a} toolboxes. Each box contains {b}x screwdrivers and {c} wrenches. The boss then makes a material update: {op} {d}x screwdrivers."
        },
        {
            sv: "En hemkunskapslärare tar fram {a} bakset. Varje set har {b}x kristyrrör och {c} bakformar. Från det gemensamma skåpet loggas en ändring: {op} {d}x kristyrrör.",
            en: "A home economics teacher sets out {a} baking sets. Each set has {b}x frosting tubes and {c} baking molds. From the shared cabinet, a change is logged: {op} {d}x frosting tubes."
        },
        {
            sv: "En elektronikbutik säljer {a} mobilpaket. Varje paket innehåller {b}x laddare och {c} skal. Under inventeringen justeras saldot för lösa delar: {op} {d}x laddare.",
            en: "An electronics store sells {a} phone bundles. Each bundle contains {b}x chargers and {c} cases. During inventory, the balance for loose parts is adjusted: {op} {d}x chargers."
        },
        {
            sv: "Biologiklassen får {a} odlingskit. Varje kit innehåller {b}x fröpåsar och {c} krukor. Läraren skriver upp en ändring i loggboken: {op} {d}x fröpåsar.",
            en: "The biology class receives {a} planting kits. Each kit contains {b}x seed packets and {c} pots. The teacher notes a change in the logbook: {op} {d}x seed packets."
        },
        {
            sv: "Klubben delar ut {a} gymväskor. Varje väska har {b}x handdukar och {c} vattenflaskor. Efter träningen görs en inventering av tvättkorgen: {op} {d}x handdukar.",
            en: "The club distributes {a} gym bags. Each bag has {b}x towels and {c} water bottles. After practice, an inventory of the laundry basket is made: {op} {d}x towels."
        },
        {
            sv: "Till en fotokurs hyrs {a} kameraväskor. Varje väska rymmer {b}x objektiv och {c} minneskort. När utrustningen återlämnas rapporteras en differens: {op} {d}x objektiv.",
            en: "For a photography course, {a} camera bags are rented. Each bag holds {b}x lenses and {c} memory cards. When the equipment is returned, a difference is reported: {op} {d}x lenses."
        },
        {
            sv: "Spelklubben ställer fram {a} brädspelsuppsättningar. Varje spel har {b}x träpjäser och {c} tärningar. I den gemensamma lådan registreras en justering: {op} {d}x träpjäser.",
            en: "The gaming club sets out {a} board game setups. Each game has {b}x wooden meeples and {c} dice. In the communal box, an adjustment is registered: {op} {d}x wooden meeples."
        },
        {
            sv: "Inför skolstarten doneras {a} ryggsäckar. Varje ryggsäck innehåller {b}x anteckningsblock och {c} pennor. Skolans förråd uppdateras sedan med: {op} {d}x anteckningsblock.",
            en: "Ahead of the school start, {a} backpacks are donated. Each backpack contains {b}x notebooks and {c} pens. The school's supply room is then updated with: {op} {d}x notebooks."
        },
        {
            sv: "Du prenumererar på {a} matkassar. Varje kasse rymmer {b}x kryddburkar och {c} receptkort. I ditt eget skafferi sker en separat ändring: {op} {d}x kryddburkar.",
            en: "You subscribe to {a} meal kits. Each kit holds {b}x spice jars and {c} recipe cards. In your own pantry, a separate change occurs: {op} {d}x spice jars."
        },
        {
            sv: "Ett hundstall tar emot {a} husdjurspaket. Varje paket har {b}x leksaker och {c} tuggben. Efter en utflykt gör personalen en notering i lagersaldot: {op} {d}x leksaker.",
            en: "A dog shelter receives {a} pet care packages. Each package has {b}x toys and {c} chew bones. After an outing, staff makes a note in the inventory balance: {op} {d}x toys."
        },
        {
            sv: "På en vandring bär gruppen med sig {a} förbandslådor. Varje låda innehåller {b}x plåster och {c} våtservetter. Vid dagens slut noteras en justering: {op} {d}x plåster.",
            en: "On a hike, the group carries {a} first aid kits. Each kit contains {b}x bandages and {c} wet wipes. At the end of the day, an adjustment is noted: {op} {d}x bandages."
        },
        {
            sv: "En skola köper {a} teknikpaket till sina elever. Varje paket rymmer {b}x USB-minnen och {c} adaptrar. IT-avdelningen loggar därefter en förändring: {op} {d}x USB-minnen.",
            en: "A school buys {a} tech bundles for its students. Each bundle holds {b}x flash drives and {c} adapters. The IT department subsequently logs a change: {op} {d}x flash drives."
        }
    ]
};