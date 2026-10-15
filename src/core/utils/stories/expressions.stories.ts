// src/core/utils/stories/expressions.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

// =========================================================================
// 🎯 1. PURE DISTRIBUTION (PLUS): a(bx + c) -> Named groups: [a, b, c]
// =========================================================================
const DIST_STORIES_PLUS: StoryScenario[] = [
    {
        id: "expr_dist_p_mystery_boxes",
        sv: "Du köper {a} stycken mystery-boxar. Varje box innehåller {b}x sällsynta kort och {c} vanliga kort.",
        en: "You buy {a} mystery boxes. Each box contains {b}x rare cards and {c} common cards.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_esport_bags",
        sv: "Ett e-sportlag beställer {a} utrustningsväskor. Varje väska rymmer {b}x musmattor och {c} klistermärken.",
        en: "An e-sports team orders {a} equipment bags. Each bag holds {b}x mousepads and {c} stickers.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_art_room_boxes",
        sv: "Till bildsalen fixar läraren {a} lådor. Varje låda är fylld med {b}x penslar och {c} suddgummin.",
        en: "For the art room, the teacher prepares {a} boxes. Each box is filled with {b}x brushes and {c} erasers.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_lanparty_trays",
        sv: "Inför ett lanparty förbereds {a} brickor. På varje bricka ställs {b}x energidrycker och {c} påsar med snacks.",
        en: "Ahead of a LAN party, {a} trays are prepared. On each tray, {b}x energy drinks and {c} snack bags are placed.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_network_kits",
        sv: "Skolans elevråd sätter ihop {a} nätverkskit. Varje kit innehåller {b}x nätverkskablar och {c} adaptrar.",
        en: "The student council puts together {a} network kits. Each kit contains {b}x network cables and {c} adapters.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_picnic_baskets",
        sv: "Du förbereder {a} utflyktskorgar. Varje korg innehåller {b}x smörgåsar och {c} äpplen.",
        en: "You prepare {a} picnic baskets. Each basket contains {b}x sandwiches and {c} apples.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_goodie_bags",
        sv: "Till ett barnkalas görs {a} kalaspåsar. Varje påse fylls med {b}x godisbitar och {c} studsbollar.",
        en: "For a birthday party, {a} goodie bags are made. Each bag is filled with {b}x candies and {c} bouncy balls.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_craft_boxes",
        sv: "En fritidsgård köper in {a} pyssellådor. Varje låda rymmer {b}x limstift och {c} saxar.",
        en: "A youth center buys {a} craft boxes. Each box holds {b}x glue sticks and {c} scissors.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_toolboxes",
        sv: "Ett byggprojekt kräver {a} verktygslådor. Varje låda innehåller {b}x skruvmejslar och {c} skiftnycklar.",
        en: "A construction project requires {a} toolboxes. Each box contains {b}x screwdrivers and {c} wrenches.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_baking_sets",
        sv: "En hemkunskapslärare tar fram {a} bakset. Varje set har {b}x kristyrrör och {c} bakformar.",
        en: "A home economics teacher sets out {a} baking sets. Each set has {b}x frosting tubes and {c} baking molds.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_phone_bundles",
        sv: "En elektronikbutik säljer {a} mobilpaket. Varje paket innehåller {b}x laddare och {c} skal.",
        en: "An electronics store sells {a} phone bundles. Each bundle contains {b}x chargers and {c} cases.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_planting_kits",
        sv: "Biologiklassen får {a} odlingskit. Varje kit innehåller {b}x fröpåsar och {c} krukor.",
        en: "The biology class receives {a} planting kits. Each kit contains {b}x seed packets and {c} pots.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_gym_bags",
        sv: "Klubben delar ut {a} gymväskor. Varje väska har {b}x handdukar och {c} vattenflaskor.",
        en: "The club distributes {a} gym bags. Each bag has {b}x towels and {c} water bottles.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_camera_bags",
        sv: "Till en fotokurs hyrs {a} kameraväskor. Varje väska rymmer {b}x objektiv och {c} minneskort.",
        en: "For a photography course, {a} camera bags are rented. Each bag holds {b}x lenses and {c} memory cards.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_board_game_setups",
        sv: "Spelklubben ställer fram {a} brädspelsuppsättningar. Varje spel har {b}x träpjäser och {c} tärningar.",
        en: "The gaming club sets out {a} board game setups. Each game has {b}x wooden meeples and {c} dice.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_donated_backpacks",
        sv: "Inför skolstarten doneras {a} ryggsäckar. Varje ryggsäck innehåller {b}x anteckningsblock och {c} pennor.",
        en: "Ahead of the school start, {a} backpacks are donated. Each backpack contains {b}x notebooks and {c} pens.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_meal_kits",
        sv: "Du prenumererar på {a} matkassar. Varje kasse rymmer {b}x kryddburkar och {c} receptkort.",
        en: "You subscribe to {a} meal kits. Each kit holds {b}x spice jars and {c} recipe cards.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_pet_packages",
        sv: "Ett hundstall tar emot {a} husdjurspaket. Varje paket har {b}x leksaker och {c} tuggben.",
        en: "A dog shelter receives {a} pet care packages. Each package has {b}x toys and {c} chew bones.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_first_aid_kits",
        sv: "På en vandring bär gruppen med sig {a} förbandslådor. Varje låda innehåller {b}x plåster och {c} våtservetter.",
        en: "On a hike, the group carries {a} first aid kits. Each kit contains {b}x bandages and {c} wet wipes.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_p_tech_bundles",
        sv: "En skola köper {a} teknikpaket till sina elever. Varje paket rymmer {b}x USB-minnen och {c} adaptrar.",
        en: "A school buys {a} tech bundles for its students. Each bundle holds {b}x flash drives and {c} adapters.",
        rules: { integerOnly: ['a', 'c'] }
    }
];

// =========================================================================
// 🎯 2. PURE DISTRIBUTION (MINUS): a(bx - c) -> Named groups: [a, b, c]
// =========================================================================
const DIST_STORIES_MINUS: StoryScenario[] = [
    {
        id: "expr_dist_m_phone_bundle",
        sv: "En elektronikbutik säljer {a} paket. Varje paket innehåller {b}x mobiltillbehör men har ett avdrag på {c} kr i rabatt.",
        en: "An electronics store sells {a} packages. Each package contains {b}x mobile accessories with a discount deduction of {c} kr.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_craft_kits",
        sv: "Du köper {a} materialsatser för {b}x kr styck. I varje sats dras en kupong på {c} kr bort.",
        en: "You purchase {a} material kits for {b}x kr each. In each kit, a coupon of {c} kr is deducted.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_sports_packs",
        sv: "En idrottsförening köper {a} lagpaket. Varje paket innehåller {b}x träningsplagg minus {c} plagg som restnoteras.",
        en: "A sports club purchases {a} team packs. Each pack contains {b}x training garments minus {c} backordered items.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_baking_flour",
        sv: "Ett bageri blandar {a} satser deg. Till varje sats beräknas {b}x dl mjöl, men {c} dl sållas bort.",
        en: "A bakery prepares {a} batches of dough. Each batch calls for {b}x dl of flour, but {c} dl is sifted out.",
        rules: { integerOnly: ['a'] }
    },
    {
        id: "expr_dist_m_photo_albums",
        sv: "Du sammanställer {a} fotoböcker med {b}x bilder i varje, men tar bort {c} dubbletter ur varje bok.",
        en: "You compile {a} photo books with {b}x pictures each, but remove {c} duplicates from each book.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_gaming_crates",
        sv: "Ett gäng köper {a} spelleveranser med {b}x mynt var, men varje leverans beläggs med en avgift på {c} mynt.",
        en: "A group buys {a} game crates with {b}x coins each, but each crate carries a fee of {c} coins.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_cable_rolls",
        sv: "En elektriker förbereder {a} kabelslingor som mäter {b}x meter var, men klipper bort {c} meter från varje slinga.",
        en: "An electrician prepares {a} cable runs measuring {b}x meters each, but cuts off {c} meters from each run.",
        rules: { integerOnly: ['a'] }
    },
    {
        id: "expr_dist_m_snack_packs",
        sv: "En kiosk packar {a} påsar godis med {b}x gram var, men tar bort {c} gram provsmak ur varje påse.",
        en: "A kiosk packs {a} candy bags with {b}x grams each, but removes {c} grams of tasting samples from each bag.",
        rules: { integerOnly: ['a'] }
    },
    {
        id: "expr_dist_m_plant_seeds",
        sv: "En trädgårdsmästare sätter {a} rader med {b}x frön i varje rad, men rensar bort {c} skadade frön per rad.",
        en: "A gardener plants {a} rows with {b}x seeds per row, but discards {c} damaged seeds per row.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_event_tickets",
        sv: "Ett kompisgäng beställer {a} paket med {b}x festivalpass i varje, men avbokar {c} pass per paket.",
        en: "A group of friends orders {a} bundles with {b}x festival passes each, but cancels {c} passes per bundle.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_fishing_hooks",
        sv: "En fiskebutik säljer {a} askar med {b}x krokar i varje, men plockar ur {c} defekta krokar per ask.",
        en: "A tackle shop sells {a} boxes with {b}x hooks each, but removes {c} defective hooks per box.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_art_pencils",
        sv: "En konstskola köper {a} set med {b}x blyertspennor, men delar ut {c} pennor ur varje set direkt.",
        en: "An art school buys {a} sets of {b}x drawing pencils, but gives away {c} pencils from each set immediately.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_book_bundles",
        sv: "Ett förlag packar {a} bokpaket med {b}x böcker var, men tar bort {c} provexemplar från varje paket.",
        en: "A publisher packs {a} book bundles with {b}x books each, but removes {c} sample copies from each bundle.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_toy_sets",
        sv: "En leksaksbutik tar emot {a} leveranser med {b}x figurer i varje, men returnerar {c} trasiga figurer per leverans.",
        en: "A toy store receives {a} shipments with {b}x figures each, but returns {c} damaged figures per shipment.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_storage_bins",
        sv: "Ett lager fyller {a} plastbackar med {b}x komponenter, men reserverar {c} delar per back för kvalitetskontroll.",
        en: "A warehouse fills {a} bins with {b}x components, but reserves {c} parts per bin for quality control.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_candle_boxes",
        sv: "Ett varuhus säljer {a} kartonger med {b}x doftljus, men drar av {c} kr i kampanjrabatt på varje kartong.",
        en: "A department store sells {a} boxes of {b}x scented candles, but deducts {c} kr promotional discount per box.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_bead_tubes",
        sv: "Till ett smyckesprojekt används {a} rör med {b}x glaspärlor, men {c} spruckna pärlor sorteras bort ur varje rör.",
        en: "For a jewelry project, {a} tubes of {b}x glass beads are used, but {c} cracked beads are sorted out from each tube.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_smoothie_bottles",
        sv: "Ett café förbereder {a} korgar med {b}x flaskor juice, men tar undan {c} flaskor per korg för provsmakning.",
        en: "A cafe prepares {a} baskets of {b}x juice bottles, but sets aside {c} bottles per basket for tasting.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_sticker_packs",
        sv: "Du köper {a} paket med {b}x samlarmärken, men byter bort {c} dubbletter ur varje paket.",
        en: "You buy {a} packs of {b}x collectible stickers, but trade away {c} duplicates from each pack.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_dist_m_hardware_nuts",
        sv: "En mekaniker köper {a} påsar med {b}x muttrar, men kasserar {c} rostiga muttrar ur varje påse.",
        en: "A mechanic buys {a} bags of {b}x nuts, but discards {c} rusted nuts from each bag.",
        rules: { integerOnly: ['a', 'c'] }
    }
];

// =========================================================================
// 🎯 3. FULL 20-STORY 5-TERM EXPANSION (Placeholders: {a}, {b}, {c}, {op}, {d})
// =========================================================================
const EXPAND_STORIES: StoryScenario[] = [
    {
        id: "expr_exp_mystery_boxes",
        sv: "Du köper {a} stycken mystery-boxar. Varje box innehåller {b}x sällsynta kort och {c} vanliga kort. Senare under dagen sker en justering: {op} {d}x sällsynta kort i din samling.",
        en: "You buy {a} mystery boxes. Each box contains {b}x rare cards and {c} common cards. Later in the day, an adjustment occurs: {op} {d}x rare cards in your collection.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_esport_bags",
        sv: "Ett e-sportlag beställer {a} utrustningsväskor. Varje väska rymmer {b}x musmattor och {c} klistermärken. Dagen efter gör lagledaren en ändring på lagret: {op} {d}x musmattor.",
        en: "An e-sports team orders {a} equipment bags. Each bag holds {b}x mousepads and {c} stickers. The next day, the team manager makes an inventory change: {op} {d}x mousepads.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_art_room_boxes",
        sv: "Till bildsalen fixar läraren {a} lådor. Varje låda är fylld med {b}x penslar och {c} suddgummin. I skåpet bredvid görs en oberoende lagerjustering: {op} {d}x penslar.",
        en: "For the art room, the teacher prepares {a} boxes. Each box is filled with {b}x brushes and {c} erasers. In the cabinet nearby, an independent inventory adjustment is made: {op} {d}x brushes.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_lanparty_trays",
        sv: "Inför ett lanparty förbereds {a} brickor. På varje bricka ställs {b}x energidrycker och {c} påsar med snacks. Kort därefter noteras en justering av dryckerna: {op} {d}x energidrycker.",
        en: "Ahead of a LAN party, {a} trays are prepared. On each tray, {b}x energy drinks and {c} snack bags are placed. Shortly after, a beverage adjustment is noted: {op} {d}x energy drinks.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_network_kits",
        sv: "Skolans elevråd sätter ihop {a} nätverkskit. Varje kit innehåller {b}x nätverkskablar och {c} adaptrar. Från reservlagret registreras sedan ett tillägg/avdrag: {op} {d}x nätverkskablar.",
        en: "The student council puts together {a} network kits. Each kit contains {b}x network cables and {c} adapters. An addition/deduction is then registered from the reserve stock: {op} {d}x network cables.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_picnic_baskets",
        sv: "Du förbereder {a} utflyktskorgar. Varje korg innehåller {b}x smörgåsar och {c} äpplen. Innan bussen åker görs en sista ändring i packningen: {op} {d}x smörgåsar.",
        en: "You prepare {a} picnic baskets. Each basket contains {b}x sandwiches and {c} apples. Before the bus leaves, a final change is made to the packing: {op} {d}x sandwiches.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_goodie_bags",
        sv: "Till ett barnkalas görs {a} kalaspåsar. Varje påse fylls med {b}x godisbitar och {c} studsbollar. Precis innan gästerna kommer sker en ändring: {op} {d}x godisbitar.",
        en: "For a birthday party, {a} goodie bags are made. Each bag is filled with {b}x candies and {c} bouncy balls. Just before guests arrive, a change occurs: {op} {d}x candies.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_craft_boxes",
        sv: "En fritidsgård köper in {a} pyssellådor. Varje låda rymmer {b}x limstift och {c} saxar. Efter första veckan noteras en justering i inventariet: {op} {d}x limstift.",
        en: "A youth center buys {a} craft boxes. Each box holds {b}x glue sticks and {c} scissors. After the first week, an inventory adjustment is noted: {op} {d}x glue sticks.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_toolboxes",
        sv: "Ett byggprojekt kräver {a} verktygslådor. Varje låda innehåller {b}x skruvmejslar och {c} skiftnycklar. Chefen gör därefter en materialuppdatering: {op} {d}x skruvmejslar.",
        en: "A construction project requires {a} toolboxes. Each box contains {b}x screwdrivers and {c} wrenches. The boss then makes a material update: {op} {d}x screwdrivers.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_baking_sets",
        sv: "En hemkunskapslärare tar fram {a} bakset. Varje set har {b}x kristyrrör och {c} bakformar. Från det gemensamma skåpet loggas en ändring: {op} {d}x kristyrrör.",
        en: "A home economics teacher sets out {a} baking sets. Each set has {b}x frosting tubes and {c} baking molds. From the shared cabinet, a change is logged: {op} {d}x frosting tubes.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_phone_bundles",
        sv: "En elektronikbutik säljer {a} mobilpaket. Varje paket innehåller {b}x laddare och {c} skal. Under inventeringen justeras saldot för lösa delar: {op} {d}x laddare.",
        en: "An electronics store sells {a} phone bundles. Each bundle contains {b}x chargers and {c} cases. During inventory, the balance for loose parts is adjusted: {op} {d}x chargers.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_planting_kits",
        sv: "Biologiklassen får {a} odlingskit. Varje kit innehåller {b}x fröpåsar och {c} krukor. Läraren skriver upp en ändring i loggboken: {op} {d}x fröpåsar.",
        en: "The biology class receives {a} planting kits. Each kit contains {b}x seed packets and {c} pots. The teacher notes a change in the logbook: {op} {d}x seed packets.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_gym_bags",
        sv: "Klubben delar ut {a} gymväskor. Varje väska har {b}x handdukar och {c} vattenflaskor. Efter träningen görs en inventering av tvättkorgen: {op} {d}x handdukar.",
        en: "The club distributes {a} gym bags. Each bag has {b}x towels and {c} water bottles. After practice, an inventory of the laundry basket is made: {op} {d}x towels.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_camera_bags",
        sv: "Till en fotokurs hyrs {a} kameraväskor. Varje väska rymmer {b}x objektiv och {c} minneskort. När utrustningen återlämnas rapporteras en differens: {op} {d}x objektiv.",
        en: "For a photography course, {a} camera bags are rented. Each bag holds {b}x lenses and {c} memory cards. When the equipment is returned, a difference is reported: {op} {d}x lenses.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_board_game_setups",
        sv: "Spelklubben ställer fram {a} brädspelsuppsättningar. Varje spel har {b}x träpjäser och {c} tärningar. I den gemensamma lådan registreras en justering: {op} {d}x träpjäser.",
        en: "The gaming club sets out {a} board game setups. Each game has {b}x wooden meeples and {c} dice. In the communal box, an adjustment is registered: {op} {d}x wooden meeples.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_donated_backpacks",
        sv: "Inför skolstarten doneras {a} ryggsäckar. Varje ryggsäck innehåller {b}x anteckningsblock och {c} pennor. Skolans förråd uppdateras sedan med: {op} {d}x anteckningsblock.",
        en: "Ahead of the school start, {a} backpacks are donated. Each backpack contains {b}x notebooks and {c} pens. The school's supply room is then updated with: {op} {d}x notebooks.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_meal_kits",
        sv: "Du prenumererar på {a} matkassar. Varje kasse rymmer {b}x kryddburkar och {c} receptkort. I ditt eget skafferi sker en separat ändring: {op} {d}x kryddburkar.",
        en: "You subscribe to {a} meal kits. Each kit holds {b}x spice jars and {c} recipe cards. In your own pantry, a separate change occurs: {op} {d}x spice jars.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_pet_packages",
        sv: "Ett hundstall tar emot {a} husdjurspaket. Varje paket har {b}x leksaker och {c} tuggben. Efter en utflykt gör personalen en notering i lagersaldot: {op} {d}x leksaker.",
        en: "A dog shelter receives {a} pet care packages. Each package has {b}x toys and {c} chew bones. After an outing, staff makes a note in the inventory balance: {op} {d}x toys.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_first_aid_kits",
        sv: "På en vandring bär gruppen med sig {a} förbandslådor. Varje låda innehåller {b}x plåster och {c} våtservetter. Vid dagens slut noteras en justering: {op} {d}x plåster.",
        en: "On a hike, the group carries {a} first aid kits. Each kit contains {b}x bandages and {c} wet wipes. At the end of the day, an adjustment is noted: {op} {d}x bandages.",
        rules: { integerOnly: ['a', 'c'] }
    },
    {
        id: "expr_exp_tech_bundles",
        sv: "En skola köper {a} teknikpaket till sina elever. Varje paket rymmer {b}x USB-minnen och {c} adaptrar. IT-avdelningen loggar därefter en förändring: {op} {d}x USB-minnen.",
        en: "A school buys {a} tech bundles for its students. Each bundle holds {b}x flash drives and {c} adapters. The IT department subsequently logs a change: {op} {d}x flash drives.",
        rules: { integerOnly: ['a', 'c'] }
    }
];

// =========================================================================
// 🎯 4. FULL 20-STORY 4-TERM EXPRESSIONS ({a}x, {op1}, {b}, {op2}, {c}x, {op3}, {d})
// =========================================================================
const FOUR_TERM_STORIES: StoryScenario[] = [
    {
        id: "expr_4t_trading_cards",
        sv: "Du har {a} askar med x samlarkort i varje. Under en bytardag loggar du tre förändringar i din samling: {op1} {b} lösa kort, {op2} {c} askar, och {op3} {d} lösa kort.",
        en: "You have {a} boxes with x trading cards each. During a trading event, you log three changes to your collection: {op1} {b} loose cards, {op2} {c} boxes, and {op3} {d} loose cards.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_game_chests",
        sv: "I ett spel startar du med {a} kistor som rymmer x mynt vardera. På skärmen dyker följande händelselogg upp: {op1} {b} lösa mynt, {op2} {c} kistor, och {op3} {d} lösa mynt.",
        en: "In a game, you start with {a} chests holding x coins each. On the screen, the following event log appears: {op1} {b} loose coins, {op2} {c} chests, and {op3} {d} loose coins.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_store_caps",
        sv: "En klädbutik har {a} lådor med x kepsar i varje. Under dagen registreras följande inventering på lagret: {op1} {b} lösa kepsar, {op2} {c} lådor, och {op3} {d} lösa kepsar.",
        en: "A clothing store has {a} boxes with x caps in each. During the day, the following inventory changes are registered: {op1} {b} loose caps, {op2} {c} boxes, and {op3} {d} loose caps.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_playlist_albums",
        sv: "På din spellista har du {a} album med x låtar i varje. Du gör sedan följande justeringar i kön: {op1} {b} lösa låtar, {op2} {c} album, och {op3} {d} lösa låtar.",
        en: "On your playlist, you have {a} albums with x songs in each. You then make the following adjustments to the queue: {op1} {b} loose songs, {op2} {c} albums, and {op3} {d} loose songs.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_party_chocolates",
        sv: "Till en klassfest köps det in {a} påsar med x chokladbitar. Innan festen börjar sker dessa justeringar: {op1} {b} lösa chokladbitar, {op2} {c} påsar, och {op3} {d} lösa chokladbitar.",
        en: "For a class party, {a} bags with x chocolates are bought. Before the party begins, these adjustments occur: {op1} {b} loose chocolates, {op2} {c} bags, and {op3} {d} loose chocolates.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_art_markers",
        sv: "Du har {a} förpackningar med x tuschpennor i varje. Under bildlektionen sker följande förändringar i materialet: {op1} {b} lösa pennor, {op2} {c} förpackningar, och {op3} {d} lösa pennor.",
        en: "You have {a} packs with x markers in each. During art class, the following material changes occur: {op1} {b} loose markers, {op2} {c} packs, and {op3} {d} loose markers.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_energy_drinks",
        sv: "I kylen står {a} flak med x energidrycker i varje. Kafépersonalen gör en lageruppdatering: {op1} {b} lösa burkar, {op2} {c} flak, och {op3} {d} lösa burkar.",
        en: "In the cooler, there are {a} trays with x energy drinks each. The cafe staff makes an inventory update: {op1} {b} loose cans, {op2} {c} trays, and {op3} {d} loose cans.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_sticker_sheets",
        sv: "Du pysslar med {a} ark som har x klistermärken vardera. Du noterar sedan dessa ändringar på skrivbordet: {op1} {b} lösa klistermärken, {op2} {c} ark, och {op3} {d} lösa klistermärken.",
        en: "You are crafting with {a} sheets that have x stickers each. You then note these changes on your desk: {op1} {b} loose stickers, {op2} {c} sheets, and {op3} {d} loose stickers.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_battery_packs",
        sv: "Ett teknikskåp rymmer {a} paket med x batterier i varje. Under veckan loggas följande förbrukning: {op1} {b} lösa batterier, {op2} {c} paket, och {op3} {d} lösa batterier.",
        en: "A tech cabinet holds {a} packs with x batteries in each. During the week, the following usage is logged: {op1} {b} loose batteries, {op2} {c} packs, and {op3} {d} loose batteries.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_gym_weights",
        sv: "I gymmet finns {a} ställ med x vikter i varje. Vid stängning visar inventeringen: {op1} {b} lösa vikter, {op2} {c} ställ, och {op3} {d} lösa vikter.",
        en: "In the gym, there are {a} racks with x weights each. At closing, the inventory shows: {op1} {b} loose weights, {op2} {c} racks, and {op3} {d} loose weights.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_board_game_tokens",
        sv: "Ett brädspel har {a} påsar med x spelmarker i varje. Efter en match uppdateras tillgångarna: {op1} {b} lösa marker, {op2} {c} påsar, och {op3} {d} lösa marker.",
        en: "A board game has {a} bags with x tokens in each. After a match, the assets are updated: {op1} {b} loose tokens, {op2} {c} bags, and {op3} {d} loose tokens.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_studio_cables",
        sv: "Studion har {a} buntar med x kablar. En tekniker loggar följande ändringar i systemet: {op1} {b} lösa kablar, {op2} {c} buntar, och {op3} {d} lösa kablar.",
        en: "The studio has {a} bundles with x cables. A technician logs the following changes in the system: {op1} {b} loose cables, {op2} {c} bundles, and {op3} {d} loose cables.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_library_shelves",
        sv: "Ett bibliotek har {a} hyllor med x böcker. Vid en omorganisation sker dessa justeringar: {op1} {b} lösa böcker, {op2} {c} hyllor, och {op3} {d} lösa böcker.",
        en: "A library has {a} shelves with x books. During a reorganization, these adjustments occur: {op1} {b} loose books, {op2} {c} shelves, and {op3} {d} loose books.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_cinema_snacks",
        sv: "En bio har {a} kartonger med x snacks i varje. Kiosken rapporterar dagens förändringar: {op1} {b} lösa snacks, {op2} {c} kartonger, och {op3} {d} lösa snacks.",
        en: "A cinema has {a} boxes with x snacks in each. The kiosk reports the day's changes: {op1} {b} loose snacks, {op2} {c} boxes, and {op3} {d} loose snacks.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_amusement_tickets",
        sv: "På ett nöjesfält har du {a} rullar med x biljetter. Efter att ha spelat flera spel visar saldot: {op1} {b} lösa biljetter, {op2} {c} rullar, och {op3} {d} lösa biljetter.",
        en: "At an amusement park, you have {a} rolls with x tickets. After playing several games, the balance shows: {op1} {b} loose tickets, {op2} {c} rolls, and {op3} {d} loose tickets.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_fishing_lures",
        sv: "Fiskeutrustningen består av {a} askar med x drag i varje. Efter helgens fiske noteras: {op1} {b} lösa drag, {op2} {c} askar, och {op3} {d} lösa drag.",
        en: "The fishing gear consists of {a} boxes with x lures in each. After the weekend's fishing, the following is noted: {op1} {b} loose lures, {op2} {c} boxes, and {op3} {d} loose lures.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_store_bracelets",
        sv: "En butik har {a} lådor med x armband. Vid inventeringen lägger personalen in följande i datorn: {op1} {b} lösa armband, {op2} {c} lådor, och {op3} {d} lösa armband.",
        en: "A store has {a} boxes with x bracelets. During inventory, staff enter the following into the computer: {op1} {b} loose bracelets, {op2} {c} boxes, and {op3} {d} loose bracelets.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_skatepark_bearings",
        sv: "Du bygger en skatepark och har {a} rör med x kullager. Under bygget sker dessa materialändringar: {op1} {b} lösa kullager, {op2} {c} rör, och {op3} {d} lösa kullager.",
        en: "You are building a skatepark and have {a} tubes with x bearings. During construction, these material changes occur: {op1} {b} loose bearings, {op2} {c} tubes, and {op3} {d} loose bearings.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_school_seeds",
        sv: "För ett skolprojekt finns {a} krukor med x frön i varje. Läraren gör en justering för klassen: {op1} {b} lösa frön, {op2} {c} krukor, och {op3} {d} lösa frön.",
        en: "For a school project, there are {a} pots with x seeds each. The teacher makes an adjustment for the class: {op1} {b} loose seeds, {op2} {c} pots, and {op3} {d} loose seeds.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    },
    {
        id: "expr_4t_graduation_balloons",
        sv: "Till avslutningen finns {a} paket med x ballonger. Festkommittén loggar följande ändringar i förrådet: {op1} {b} lösa ballonger, {op2} {c} paket, och {op3} {d} lösa ballonger.",
        en: "For graduation, there are {a} packs with x balloons. The party committee logs the following changes in storage: {op1} {b} loose balloons, {op2} {c} packs, and {op3} {d} loose balloons.",
        rules: { integerOnly: ['a', 'b', 'c', 'd'] }
    }
];

export const EXPRESSION_STORIES: Record<string, StoryScenario[]> = {
    algebra_expressions: FOUR_TERM_STORIES,
    algebra_expressions_dist: DIST_STORIES_PLUS,
    algebra_expressions_dist_neg: DIST_STORIES_MINUS,
    algebra_expressions_expand: EXPAND_STORIES
};