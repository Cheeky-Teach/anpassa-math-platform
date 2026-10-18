// src/core/utils/stories/equations.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

const TWOSTEP_STORIES: Record<string, StoryScenario[]> = {
    multiply_plus: [
        {
            id: "eq_ts_movie_tickets_booking",
            sv: "Du köper {a} stycken likadana biobiljetter i en app. Det tillkommer en fast bokningsavgift på {b} kr. Hela köpet kostar {c} kr.",
            en: "A group of friends buys {a} identical movie tickets in an app. A fixed booking fee of {b} kr is added. The entire purchase costs {c} kr.",
            rules: {
                integerOnly: ['a'],
                greaterThan: ['c', 'b']
            }
        },
        {
            id: "eq_ts_streamer_viewers_gain",
            sv: "En streamer startar en sändning med en fast bas på {b} tittare. Varje minut ansluter {a} nya tittare, och till sist har sändningen {c} tittare totalt.",
            en: "A streamer starts a broadcast with a fixed baseline of {b} viewers. Each minute, {a} new viewers join, and finally, the stream reaches {c} viewers in total.",
            rules: {
                integerOnly: ['a', 'b', 'c'],
                greaterThan: ['c', 'b']
            }
        }
    ],
    multiply_minus: [
        {
            id: "eq_ts_shirts_discount_code",
            sv: "Du köper {a} stycken likadana tröjor på en sajt och använder en rabattkod som drar av {b} kr på hela köpet. Totalt betalar du {c} kr.",
            en: "You buy {a} identical shirts on a site and use a discount code that deducts {b} kr from the purchase. In total, you pay {c} kr.",
            rules: {
                integerOnly: ['a'],
                greaterThan: ['c', '0'] // or minResult: 1
            }
        },
        {
            id: "eq_ts_soda_cans_recycle",
            sv: "Du köper {a} stycken läskburkar i en affär och pantar samtidigt gamla flaskor som drar av {b} kr på kvittot. Du betalar {c} kr i kassan.",
            en: "You buy {a} soda cans in a store and recycle old bottles that deduct {b} kr from the invoice. You pay {c} kr at the register.",
            rules: {
                integerOnly: ['a'],
                greaterThan: ['c', '0'] // or minResult: 1
            }
        }
    ],
    divide_plus: [
        {
            id: "eq_ts_beads_bag_extra",
            sv: "En låda med pärlor delas upp helt lika i {a} mindre påsar. Du lägger till {b} extra pärlor i din påse och får då {c} pärlor totalt.",
            en: "A box of beads is divided completely equally into {a} smaller bags. You add {b} extra beads to your bag and end up with {c} beads in total.",
            rules: {
                integerOnly: ['a', 'b', 'c'],
                greaterThan: ['c', 'b']
            }
        },
        {
            id: "eq_ts_pizza_buffet_drink",
            sv: "En pizzabuffé delas helt jämnt mellan {a} kompisar. Du köper dessutom till en dricka för {b} kr, vilket gör att din del kostar {c} kr.",
            en: "A pizza buffet bill is split evenly among {a} friends. You also buy a drink for {b} kr, making your individual share cost {c} kr.",
            rules: {
                integerOnly: ['a'],
                greaterThan: ['c', 'b']
            }
        }
    ],
    divide_minus: [
        {
            id: "eq_ts_cards_binders_remove",
            sv: "En samling spelkort fördelas jämnt i {a} mappar. Du tar ut {b} kort ur en mapp för att ge bort, och mappen innehåller då {c} kort.",
            en: "A collection of gaming cards is distributed evenly into {a} binders. You remove {b} cards from one binder to give away, leaving that binder with {c} cards.",
            rules: {
                integerOnly: ['a', 'b', 'c'],
                minResult: 1
            }
        },
        {
            id: "eq_ts_screws_boxes_defective",
            sv: "Ett parti skruvar packas jämnt i {a} lådor. Du plockar ur {b} defekta skruvar ur en av lådorna och ser att den nu innehåller {c} skruvar.",
            en: "A batch of screws is packed evenly into {a} boxes. You remove {b} defective screws from one of the boxes, leaving it with exactly {c} screws.",
            rules: {
                integerOnly: ['a', 'b', 'c'],
                minResult: 1
            }
        }
    ]
};

export const EQUATION_STORIES: Record<string, any> = {
    // =========================================================================
    // 🎯 1. ALGEBRA ONESTEP (Key: algebra_onestep)
    // =========================================================================
    algebra_onestep: {
        add: [
            {
                id: "eq_os_add_bonuspoints",
                sv: "Du har ett okänt antal poäng x i ett spel. Du klarar en bonusrunda och får {a} extra poäng. Ditt totala poängsaldo blir {b}.",
                en: "You have an unknown number of points x in a game. You clear a bonus round and gain {a} additional points. Your total balance becomes {b}.",
                rules: {
                    integerOnly: ['a', 'b'],
                    greaterThan: ['b', 'a']
                }
            },
            {
                id: "eq_os_add_playlistsongs",
                sv: "I en spellista finns x låtar. Din kompis lägger till {a} nya spår och nu innehåller listan totalt {b} låtar.",
                en: "There are x songs in a playlist. Your friend adds {a} new tracks and now the list has a total of {b} songs.",
                rules: {
                    integerOnly: ['a', 'b'],
                    greaterThan: ['b', 'a']
                }
            },
            {
                id: "eq_os_add_photosalbum",
                sv: "Det finns x bilder sparade i ett album. Medlemmarna laddar upp {a} bilder till och albumet får då {b} bilder totalt.",
                en: "There are x photos saved in an album. Members upload another {a} photos, bringing the album to {b} total photos.",
                rules: {
                    integerOnly: ['a', 'b'],
                    greaterThan: ['b', 'a']
                }
            }
        ],
        sub: [
            {
                id: "eq_os_sub_headphones",
                sv: "Du har x kr på ditt konto. Du köper ett par hörlurar för {a} kr, vilket lämnar kvar {b} kr på kontot.",
                en: "You have x kr in your account. You buy headphones for {a} kr, leaving {b} kr remaining in the account.",
                rules: {
                    minResult: 1
                }
            },
            {
                id: "eq_os_sub_candiesbag",
                sv: "En påse innehåller x godisbitar. Du bjuder bort {a} bitar till dina kompisar och räknar sedan till {b} bitar kvar i påsen.",
                en: "A bag contains x candies. You give away {a} pieces to your friends and then count {b} remaining pieces in the bag.",
                rules: {
                    integerOnly: ['a', 'b']
                }
            },
            {
                id: "eq_os_sub_buspassengers",
                sv: "En buss startar med x passagerare ombord. Vid en hållplats kliver {a} personer av bussen. Det sitter då {b} passagerare kvar.",
                en: "A bus starts with x passengers on board. At a stop, {a} people get off. There are {b} passengers left.",
                rules: {
                    integerOnly: ['a', 'b']
                }
            }
        ],
        multiply: [
            {
                id: "eq_os_mult_posters",
                sv: "Du köper {a} stycken likadana affischer för x kr styck. Hela ditt inköp kostar {b} kr.",
                en: "You buy {a} identical posters for x kr each. Your entire purchase costs {b} kr.",
                rules: {
                    integerOnly: ['a'],
                    greaterThan: ['b', 'a']
                }
            },
            {
                id: "eq_os_mult_sportsballs",
                sv: "En idrottslärare packar {a} likadana påsar med x bollar i varje påse. Totalt förpackar läraren {b} bollar.",
                en: "A physical education teacher packs {a} identical bags with x balls in each bag. In total, the teacher packs {b} balls.",
                rules: {
                    integerOnly: ['a', 'b'],
                    greaterThan: ['b', 'a']
                }
            },
            {
                id: "eq_os_mult_bakerydonuts",
                sv: "Ett bageri förbereder {a} brickor med x munkar på varje bricka. Sammanlagt finns det {b} munkar på brickorna.",
                en: "A bakery prepares {a} trays with x donuts on each tray. Altogether there are {b} donuts on the trays.",
                rules: {
                    integerOnly: ['a', 'b'],
                    greaterThan: ['b', 'a']
                }
            }
        ]
    },

    // =========================================================================
    // 🎯 2. ALGEBRA TWOSTEP REGISTRY KEYS
    //    Fixes audit error #0 & #1:
    //    twostep_write_problem -> algebra_twostep_formulation
    //    twostep_solve_problem -> algebra_twostep_solver
    // =========================================================================
    algebra_twostep: TWOSTEP_STORIES,
    algebra_twostep_formulation: TWOSTEP_STORIES,
    algebra_twostep_solver: TWOSTEP_STORIES,

    // =========================================================================
    // 🎯 3. ALGEBRA PARENTHESES (Key: algebra_parentheses)
    // =========================================================================
    algebra_parentheses: [
        {
            id: "eq_par_bakerybuns",
            sv: "Ett bageri packar {a} stycken påsar med likadant innehåll. Varje påse får x vaniljbullar och {b} kanelbullar. Totalt packar bageriet {c} bullar.",
            en: "A bakery packs {a} bags with identical contents. Each bag gets x vanilla buns and {b} cinnamon buns. In total, the bakery packs {c} buns.",
            rules: {
                integerOnly: ['a', 'b', 'c']
            }
        },
        {
            id: "eq_par_workoutblocks",
            sv: "Ett träningspass körs i {a} stycken likadana block under veckan. Varje block består av x minuter styrka och {b} minuter kondition. Den totala träningstiden blir {c} minuter.",
            en: "A workout routine is run in {a} identical blocks during the week. Each block consists of x minutes of strength and {b} minutes of cardio. The total workout time is {c} minutes.",
            rules: {
                integerOnly: ['a']
            }
        },
        {
            id: "eq_par_matchkits",
            sv: "Ett skollag köper in {a} stycken matchställ. Varje ställ innehåller en tröja för x kr och ett par matchshorts för {b} kr. Den totala fakturan slutar på {c} kr.",
            en: "A school team purchases {a} match kits. Each kit contains a jersey for x kr and shorts for {b} kr. The total invoice ends up at {c} kr.",
            rules: {
                integerOnly: ['a']
            }
        },
        {
            id: "eq_par_cafebaskets",
            sv: "Ett café säljer {a} stycken likadana fikakorgar. Varje korg innehåller x stycken chokladbollar och {b} vanliga bullar. Totalt i alla korgar finns det {c} bakverk.",
            en: "A cafe sells {a} identical pastry baskets. Each basket contains x chocolate balls and {b} buns. In total across all baskets, there are {c} pastries.",
            rules: {
                integerOnly: ['a', 'b', 'c']
            }
        },
        {
            id: "eq_par_schoolnotebooks",
            sv: "En lärare delar ut {a} stycken likadana skrivhäften till sina elever. Varje häfte har x linjerade sidor och {b} blanka sidor. Totalt i alla häften finns det {c} sidor.",
            en: "A teacher distributes {a} identical notebooks to students. Each notebook has x lined pages and {b} blank pages. In total across all notebooks, there are {c} pages.",
            rules: {
                integerOnly: ['a', 'b', 'c']
            }
        },
        {
            id: "eq_par_coachbags",
            sv: "En tränare packar {a} stycken bollar i var och en av sina väskor. Varje väska innehåller x fotbollar och {b} basketbollar. Totalt har tränaren {c} bollar med sig.",
            en: "A coach packs {a} balls into each of his bags. Each bag contains x footballs and {b} basketballs. In total, the coach has {c} balls with him.",
            rules: {
                integerOnly: ['a', 'b', 'c']
            }
        },
        {
            id: "eq_par_artistboxes",
            sv: "En konstnär skapar {a} stycken likadana designboxar. Varje box innehåller x affischer och {b} vykort. Totalt i alla boxar har hon lagt i {c} föremål.",
            en: "An artist creates {a} identical design boxes. Each box contains x posters and {b} postcards. In total across all boxes, she included {c} items.",
            rules: {
                integerOnly: ['a', 'b', 'c']
            }
        }
    ],

    // =========================================================================
    // 🎯 4. ALGEBRA BOTHSIDES (Key: algebra_bothsides)
    // =========================================================================
    algebra_bothsides: [
        {
            id: "eq_bs_savingsboxes",
            sv: "Hugo och Nils sparar pengar till ett spel. Hugo har {a} stycken sparboxar med x kr i varje samt {b} kr i kontanter. Nils har {c} stycken sparboxar och {d} kr i kontanter. De har exakt lika mycket pengar totalt.",
            en: "Hugo and Nils are saving money for a game. Hugo has {a} identical savings boxes with x kr in each and {b} kr loose in cash. Nils has {c} identical savings boxes and {d} kr loose in cash. They have exactly the same amount of money in total.",
            rules: {
                integerOnly: ['a', 'c']
            }
        },
        {
            id: "eq_bs_mobileplans",
            sv: "Två mobilabonnemang kostar lika mycket i slutändan. Det första alternativet har en startavgift på {b} kr och kostar sedan {a} kr per månad x. Det andra alternativet har en startavgift på {d} kr och kostar {c} kr per månad x.",
            en: "Two mobile plans cost the same in the end. The first option has a setup fee of {b} kr and then costs {a} kr per month x. The second option has a setup fee of {d} kr and costs {c} kr per month x."
        },
        {
            id: "eq_bs_candyboxes",
            sv: "Två likadana godislådor väger lika mycket. Den första innehåller {a} påsar godis som väger x gram styck, samt en fast behållarvikt på {b} gram. Den andra innehåller {c} påsar godis och en behållarvikt på {d} gram.",
            en: "Two identical candy boxes weigh the same. The first contains {a} bags of candy weighing x grams each, plus a fixed container weight of {b} grams. The second contains {c} bags of candy and a container weight of {d} grams.",
            rules: {
                integerOnly: ['a', 'c']
            }
        },
        {
            id: "eq_bs_fabricsorders",
            sv: "Maja och Klara köper likadana tyger på nätet och deras slutfakturor blir exakt lika stora. Maja beställer {a} meter tyg för x kr metern och lägger till ett mönster för {b} kr. Klara beställer {c} meter tyg och betalar en fast frakt på {d} kr.",
            en: "Maja and Klara buy identical fabrics online and their final invoices are exactly the same. Maja orders {a} meters of fabric for x kr per meter and adds a pattern design for {b} kr. Klara orders {c} meters of fabric and pays a fixed shipping fee of {d} kr."
        },
        {
            id: "eq_bs_rehearsalroom",
            sv: "Två kompisband hyr en replokal och betalar lika mycket totalt. Det första bandet repar i {a} timmar för x kr i timmen och betalar en startavgift på {b} kr. Det andra bandet repar i {c} timmar och betalar en medlemsavgift på {d} kr.",
            en: "Two friend bands rent a rehearsal room and pay the same in total. The first band rehearses for {a} hours for x kr per hour and pays a setup fee of {b} kr. The second band rehearses for {c} hours and pays a membership fee of {d} kr."
        },
        {
            id: "eq_bs_equipmentpackages",
            sv: "Två paket med träningsutrustning väger lika mycket. Det första paketet innehåller {a} stycken hantlar på x kg styck samt ett fäste på {b} kg. Det andra paketet har {c} hantlar och ett tyngre fäste på {d} kg.",
            en: "Two identical training equipment packages weigh the same. The first package contains {a} dumbbells of x kg each and a bracket of {b} kg. The second package has {c} dumbbells and a heavier bracket of {d} kg.",
            rules: {
                integerOnly: ['a', 'c']
            }
        },
        {
            id: "eq_bs_influencerfollowers",
            sv: "Två influencers har exakt lika många följare totalt på sina kanaler. Den första har {a} sidoprofiler med x följare på varje samt {b} följare på en reservkanal. Den andra har {c} sidoprofiler och {d} följare på sin huvudprofil.",
            en: "Two influencers have exactly the same number of total followers on their channels. The first has {a} side profiles with x followers on each and {b} followers on a backup channel. The second has {c} side profiles and {d} followers on their main profile.",
            rules: {
                integerOnly: ['a', 'b', 'c', 'd']
            }
        }
    ]
};