// src/core/utils/stories/equations.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const EQUATION_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. ALGEBRA ONESTEP (Placeholders: {op}, {a}, {b})
    // =========================================================================
    algebra_onestep: [
        // --- Writing Focus (1-7) ---
        {
            sv: "Du har ett okänt antal poäng, x, i ett mobilspel. Efter att du klarar en bonusrunda får du {a} poäng till. Ditt totala poängsaldo blir då {b}.",
            en: "You have an unknown number of points, x, in a mobile game. After clearing a bonus round, you gain another {a} points. Your total balance becomes {b}."
        },
        {
            sv: "Ett gäng har x antal tokens på ett konto. De köper ett föremål i spelet för {a} tokens, vilket lämnar kvar {b} tokens på kontot.",
            en: "A group has x tokens in an account. They buy an item for {a} tokens, leaving {b} tokens remaining in the account. "
        },
        {
            sv: "I en delad spellista finns det x låtar. Din kompis lägger till {a} nya låtar och nu innehåller listan totalt {b} stycken.",
            en: "There are x songs in a shared playlist. Your friend adds {a} new tracks and now the list has a total of {b}."
        },
        {
            sv: "En påse innehåller x godisbitar. Du bjuder bort {a} bitar till dina kompisar och räknar sedan till {b} bitar kvar i påsen.",
            en: "A bag contains x candies. You give away {a} pieces to your friends and then count {b} remaining pieces in the bag."
        },
        {
            sv: "Det finns x bilder sparade i ett gruppalbum på mobilen. Under dagen laddar medlemmarna upp {a} bilder till och albumet har nu {b} bilder totalt.",
            en: "There are x photos saved in a group album. During the day, members upload another {a} photos, bringing the album to {b} total photos."
        },
        {
            sv: "Lukas har x sparade kr på sitt konto. Efter att han köpt en mopedhjälm för {a} kr återstår det {b} kr på kontot.",
            en: "Lukas has x kr saved in his account. After buying a moped helmet for {a} kr, {b} kr remains in the account."
        },
        {
            sv: "En kartong rymmer x stycken munkar. När ett bageri lägger i {a} munkar till blir kartongen helt fylld med {b} stycken.",
            en: "A box holds x donuts. When a bakery adds another {a} donuts, the box becomes completely filled with {b} donuts."
        },
        // --- Solving Focus (8-15) ---
        {
            sv: "Maja har x kronor i sin digitala plånbok. Hon får en swish på {a} kr av sin pappa och har nu {b} kr totalt. Beräkna hur mycket pengar x Maja hade från början.",
            en: "Maja has x kronor in her digital wallet. She receives a swish of {a} kr from her dad and now has {b} kr total. Calculate how much money x Maja had from the start."
        },
        {
            sv: "En buss startar med x passagerare ombord. Vid den första hållplatsen kliver {a} personer av bussen. Det sitter då {b} passagerare kvar. Bestäm antalet personer x från start.",
            en: "A bus starts with x passengers on board. At the first stop, {a} people get off. There are {b} passengers left. Determine the number of people x from the start."
        },
        {
            sv: "Du har x följare på ett spelkonto. Efter att du lägger upp ett bra klipp får du {a} nya följare och har nu {b} stycken totalt. Hur många följare x hade du innan klippet?",
            en: "You have x followers on a gaming account. After posting a clip, you gain {a} new followers and now have {b} in total. How many followers x did you have before the clip?"
        },
        {
            sv: "En bit dekorationsband har längden x cm. Du klipper av en bit på {a} cm till ett paket och ser att det återstår {b} cm av bandet. Hur långt var bandet x från början?",
            en: "A piece of ribbon has a length of x cm. You cut off a piece of {a} cm for a package and see that {b} cm of ribbon remains. How long was the ribbon x from the start?"
        },
        {
            sv: "I en låda ligger det x stycken likadana markers. Du tar med dig {a} stycken till bildlektionen och det finns nu {b} markers kvar i lådan. Hur många markers x fanns det totalt?",
            en: "A box contains x identical markers. You take {a} markers to art class, leaving {b} markers in the box. How many markers x were there in total?"
        },
        {
            sv: "Det ligger x kalla drycker i en kyl i caféet. Under lunchrasten köper eleverna {a} drycker och efteråt finns det {b} stycken kvar. Hur många drycker x fanns det i kylen på morgonen?",
            en: "There are x cold drinks in a cafe cooler. During lunch break, students buy {a} drinks, leaving {b} remaining. How many drinks x were in the cooler in the morning?"
        },
        {
            sv: "Ett uppladdat klipp har x visningar. Efter en delning ökar visningarna med {a} stycken och har nu nått {b} visningar totalt. Hur många visningar x hade klippet innan delningen?",
            en: "An uploaded clip has x views. After a share, the views increase by {a} and have now reached {b} total views. How many views x did the clip have before the share?"
        },
        {
            sv: "Du har lagt x låtar i en kö. Efter att appen har spelat upp {a} låtar återstår det {b} låtar i kön. Hur många låtar x la du i kön från början?",
            en: "You placed x songs in a queue. After the app plays {a} songs, {b} songs remain in the queue. How many songs x did you place in the queue initially?"
        }
    ],

    // =========================================================================
    // 🎯 2. ALGEBRA TWOSTEP (Placeholders: {a}, {op}, {b}, {c})
    // =========================================================================
    algebra_twostep: [
        // --- Writing Focus (1-7) ---
        {
            sv: "Ett kompisgäng köper {a} stycken likadana biobiljetter i en app. Det tillkommer en fast bokningsavgift på {b} kr. Hela köpet kostar {c} kr.",
            en: "A group of friends buys {a} identical movie tickets in an app. A fixed booking fee of {b} kr is added. The entire purchase costs {c} kr."
        },
        {
            sv: "Du köper {a} stycken likadana tröjor på en sajt och använder en rabattkod som drar av {b} kr på hela köpet. Totalt betalar du {c} kr.",
            en: "You buy {a} identical shirts on a site and use a discount code that deducts {b} kr from the purchase. In total, you pay {c} kr."
        },
        {
            sv: "En streamer startar en sändning med en fast bas på {b} följare i chatten. Varje minut ansluter {a} nya tittare, och efter en stund har chatten nått {c} personer totalt.",
            en: "A streamer starts a broadcast with a fixed baseline of {b} followers in chat. Each minute, {a} new viewers join, and after a while, the chat reaches {c} people."
        },
        {
            sv: "Du har en låda med {c} stycken pärlor. Du sparar undan {b} pärlor och delar sedan upp resten helt lika i {a} stycken mindre påsar.",
            en: "You have a box of {c} beads. You save {b} beads and divide the rest equally into {a} smaller bags."
        },
        {
            sv: "En taxiresa har en startavgift på {b} kr. Därefter kostar resan {a} kr per kilometer. Om hela resan slutar på {c} kr, vilken ekvation visar hur många kilometer x man åkte?",
            en: "A taxi ride has a base startup fee of {b} kr. After that, the ride costs {a} kr per kilometer. If the entire trip ends up costing {c} kr, which equation shows how many kilometers x were driven?"
        },
        {
            sv: "En skola beställer in {a} lådor med likadana märkpennor till bildsalen. Samtidigt köper de in ett stort block för {b} kr. Hela beställningen går på {c} kr.",
            en: "A school orders {a} boxes of identical markers for the art room. At the same time, they buy a large sketchpad for {b} kr. The entire order costs {c} kr."
        },
        {
            sv: "Du köper {a} stycken läskburkar i en affär och pantar samtidigt gamla burkar som drar av {b} kr på kvittot. Du betalar {c} kr i kassan.",
            en: "You buy {a} soda cans in a store and recycle old cans that deduct {b} kr from the receipt. You pay {c} kr at the register."
        },
        // --- Solving Focus (8-15) ---
        {
            sv: "Hugo köper {a} stycken likadana affischer till sitt rum och ett anteckningsblock för {b} kr. Det kostar totalt {c} kr. Räkna ut vad en enskild affisch x kostade.",
            en: "Hugo buys {a} identical posters for his bedroom and a notebook for {b} kr. The total cost is {c} kr. Calculate how much a single poster x cost."
        },
        {
            sv: "Maja köper {a} stycken boba-te till sina kompisar och använder ett presentkort som drar av {b} kr. Slutsumman blir {c} kr. Hur mycket kostade en mugg boba-te x innan avdraget?",
            en: "Maja buys {a} bubble teas for her friends and uses a gift card that deducts {b} kr. The final amount is {c} kr. How much did one cup of bubble tea x cost before the deduction?"
        },
        {
            sv: "En hantverkare kapar en {c} cm lång träplanka. Han sparar en bit på {b} cm och sågar sedan resten till {a} stycken helt lika långa delar. Hur lång blir varje enskild del x?",
            en: "A craftsman cuts a {c} cm long wooden board. He saves a piece of {b} cm and saws the rest into {a} completely equal parts. How long will each individual piece x be?"
        },
        {
            sv: "En medlemsapp kostar en fast startavgift på {b} kr och sedan {a} kr per månad. Emma har betalat {c} kr totalt sedan hon startade. Hur många månader x har hon använt appen?",
            en: "A membership app costs a base startup fee of {b} kr and then {a} kr per month. Emma paid {c} kr in total since she started. How many months x has she used the app?"
        },
        {
            sv: "Du laddar ner {a} stycken likadana spelfiler till din konsol. Samtidigt raderar du en gammal fil på {b} MB vilket gör att det totala använda minnet ändras med {c} MB. Hur stor var varje spelfil x?",
            en: "You download {a} identical game files to your console. At the same time, you delete an old file of {b} MB, causing the total storage used to change by {c} MB. How large was each game file x?"
        },
        {
            sv: "En idrottsklubb köper in {a} paket med bollar och får en rabatt på {b} kr på hela fakturan. Klubbens slutpris blir {c} kr. Hur mycket kostar ett paket bollar x ordinarie pris?",
            en: "A sports club buys {a} packs of balls and receives a discount of {b} kr on the invoice. The club's final price is {c} kr. How much does a pack of balls x cost at regular price?"
        },
        {
            sv: "Oliver har lagt in {a} stycken likadana låtblock på en spellista. Han lägger också till {b} enskilda favoritlåtar så att listan får totalt {c} spår. Hur många låtar x finns det i varje block?",
            en: "Oliver placed {a} identical song blocks into a playlist. He also adds {b} individual favorite songs, making the list have {c} tracks in total. How many songs x are in each block?"
        },
        {
            sv: "En rulle med LED-tejp kapas i {a} stycken lika långa bitar. Efter att man slängt en trasig ändbit på {b} cm har man fått ut {c} cm tejp totalt. Hur lång var varje bit x?",
            en: "A roll of LED tape is cut into {a} pieces of equal length. After throwing away a broken end piece of {b} cm, a total of {c} cm of tape was obtained. How long was each piece x?"
        }
    ],

    // =========================================================================
    // 🎯 3. ALGEBRA PARENTHESES (Placeholders: {a}, {op}, {b}, {c})
    // =========================================================================
    algebra_parentheses: [
        // --- Writing Focus (1-7) ---
        {
            sv: "Ett bageri packar {a} stycken påsar med likadant innehåll. Varje påse får x vaniljbullar och {b} kanelbullar. Totalt packar bageriet {c} bullar.",
            en: "A bakery packs {a} bags with identical contents. Each bag gets x vanilla buns and {b} cinnamon buns. In total, the bakery packs {c} buns."
        },
        {
            sv: "Du köper {a} stycken likadana outfits till dina karaktärer i ett spel. Varje outfit består av en tröja för x tokens, men du har en rabattkupong som drar av {b} tokens på varje outfit. Totalt betalar du {c} tokens.",
            en: "You buy {a} identical outfits for your characters in a game. Each outfit consists of a shirt for x tokens, but you have a coupon that deducts {b} tokens from each outfit. In total, you pay {c} tokens."
        },
        {
            sv: "Ett träningspass körs i {a} stycken likadana block under veckan. Varje block består av x minuter styrka och {b} minuter kondition. Den totala träningstiden blir {c} minuter.",
            en: "A workout routine is run in {a} identical blocks during the week. Each block consists of x minutes of strength and {b} minutes of cardio. The total workout time is {c} minutes."
        },
        {
            sv: "Ett UF-företag säljer {a} stycken kombinationsboxar till sina kunder. Varje box innehåller x blockljus, men de drar av {b} kr i paketpris på varje box. Kunderna betalar totalt {c} kr.",
            en: "A student company sells {a} combo boxes to its customers. Each box contains x candles, but they deduct {b} kr as a bundle discount on each box. The customers pay {c} kr in total."
        },
        {
            sv: "Ett skollag köper in {a} stycken matchställ. Varje ställ innehåller en tröja för x kr och ett par shorts för {b} kr. Den totala fakturan slutar på {c} kr. Teckna ekvationen för tröjpriset x.",
            en: "A school team purchases {a} match kits. Each kit contains a jersey for x kr and shorts for {b} kr. The total invoice ends up at {c} kr. Write the equation for the jersey price x."
        },
        {
            sv: "Ett gäng ska ge bort {a} stycken likadana godispåsar. Varje påse ska ha x sura nappar, men man tvingas ta bort {b} nappar ur varje påse för att de inte ska ta slut. Kvar blir totalt {c} nappar.",
            en: "A group is giving away {a} identical candy bags. Each bag is supposed to have x sour drops, but they are forced to remove {b} drops from each bag so they don't run out. A total of {c} drops remain."
        },
        {
            sv: "En prenumerationstjänst erbjuder {a} stycken licenser i ett familjepaket. Varje licens har baspriset x kr, men ger en familjerabatt på {b} kr per licens. Totalpriset blir {c} kr.",
            en: "A subscription service offers {a} licenses in a family plan. Each license has a base price of x kr, but gives a family discount of {b} kr per license. The total price is {c} kr."
        },
        // --- Solving Focus (8-15) ---
        {
            sv: "Ett café säljer {a} stycken likadana fikakorgar. Varje korg innehåller x stycken chokladbollar och {b} bullar. Totalt i alla korgar finns det {c} bakverk. Hur många chokbollar x ligger i varje korg?",
            en: "A cafe sells {a} identical pastry baskets. Each basket contains x chocolate balls and {b} buns. In total across all baskets, there are {c} pastries. How many chocolate balls x are in each basket?"
        },
        {
            sv: "Du köper {a} stycken biobiljetter till dina kompisar. Eftersom ni är en grupp drar biografen av {b} kr på priset för varje enskild biljett. Totalt betalar du {c} kr. Vad var ordinarie pris x för en biljett?",
            en: "You buy {a} movie tickets for your friends. Because you are a group, the theater deducts {b} kr from the price of each individual ticket. In total you pay {c} kr. What was the regular price x for a ticket?"
        },
        {
            sv: "En lärare delar ut {a} stycken likadana skrivhäften till sina elever. Varje häfte har x linjerade sidor och {b} blanka sidor. Totalt i alla häften finns det {c} sidor. Hur många linjerade sidor x har varje häfte?",
            en: "A teacher distributes {a} identical notebooks to students. Each notebook has x lined pages and {b} blank pages. In total across all notebooks, there are {c} pages. How many lined pages x does each notebook have?"
        },
        {
            sv: "Ett e-sportlag beställer {a} stycken likadana musmattor med lagtryck. De får en rabatt på {b} kr per musmatta. Hela beställningen kostar {c} kr. Hur mycket kostade en musmatta x innan rabatten?",
            en: "An e-sports team orders {a} identical mousepads with a team print. They get a discount of {b} kr per mousepad. The entire order costs {c} kr. How much did a mousepad x cost before the discount?"
        },
        {
            sv: "En tränare packar {a} stycken bollar i var och en av sina väskor. Varje väska innehåller x fotbollar och {b} basketbollar. Totalt har tränaren {c} bollar med sig. Hur många fotbollar x finns det i varje väska?",
            en: "A coach packs {a} balls into each of his bags. Each bag contains x footballs and {b} basketballs. In total, the coach has {c} balls with him. How many footballs x are in each bag?"
        },
        {
            sv: "Ett gäng kompisar köper {a} stycken likadana menyer på en snabbmatsrestaurang. De använder en kupong som drar av {b} kr på varje meny. Slutnotan blir {c} kr. Vad kostade en meny x på menyn?",
            en: "A group of friends buys {a} identical combo meals at a fast-food restaurant. They use a coupon that deducts {b} kr from each meal. The final bill is {c} kr. What did a combo meal x cost regularly?"
        },
        {
            sv: "En konstnär skapar {a} stycken likadana designboxar. Varje box innehåller x affischer och {b} vykort. Totalt i alla boxar har hon lagt i {c} föremål. Hur många affischer x finns det i varje box?",
            en: "An artist creates {a} identical design boxes. Each box contains x posters and {b} postcards. In total across all boxes, she included {c} items. How many posters x are in each box?"
        },
        {
            sv: "Ett gäng hyr {a} stycken likadana elsparkcyklar. De använder en kod som sänker priset med {b} kr per cykel. De betalar totalt {c} kr. Vad var grundpriset x för att hyra en cykel?",
            en: "A group rents {a} identical e-scooters. They use a code that lowers the price by {b} kr per scooter. They pay {c} kr in total. What was the base price x to rent one scooter?"
        }
    ],

    // =========================================================================
    // 🎯 4. ALGEBRA BOTHSIDES (Placeholders: {a}, {op1}, {b}, {c}, {op2}, {d})
    // =========================================================================
    algebra_bothsides: [
        // --- Writing Focus (1-7) ---
        {
            sv: "Hugo och Nils sparar pengar till ett spel. Hugo har {a} stycken likadana sparboxar med x kr i varje, men han har också en skuld på {b} kr. Nils har {c} stycken likadana sparboxar och {d} kr löst i kontanter. De har exakt lika mycket pengar totalt.",
            en: "Hugo and Nils are saving money for a game. Hugo has {a} identical savings boxes with x kr in each, but he also has a debt of {b} kr. Nils has {c} identical savings boxes and {d} kr loose in cash. They have exactly the same amount of money in total."
        },
        {
            sv: "Två mobilabonnemang kostar lika mycket i slutändan. Det första alternativet har en startavgift på {b} kr och kostar sedan {a} kr per månad x. Det andra alternativet har en startavgift på {d} kr och kostar {c} kr per månad x.",
            en: "Two mobile plans cost the same in the end. The first option has a setup fee of {b} kr and then costs {a} kr per month x. The second option has a setup fee of {d} kr and costs {c} kr per month x."
        },
        {
            sv: "Två likadana godislådor väger lika mycket. Den första innehåller {a} påsar godis som väger x gram styck, samt en fast vikt på {b} gram. Den andra innehåller {c} påsar godis och en fast vikt på {d} gram.",
            en: "Two identical candy boxes weigh the same. The first contains {a} bags of candy weighing x grams each, plus a fixed weight of {b} grams. The second contains {c} bags of candy and a fixed weight of {d} grams."
        },
        {
            sv: "Maja och Klara köper likadana tyger på nätet och deras slutfakturor blir exakt lika stora. Maja beställer {a} meter tyg för x kr metern och får en rabatt på {b} kr. Klara beställer {c} meter tyg och betalar en fast frakt på {d} kr.",
            en: "Maja and Klara buy identical fabrics online and their final invoices are exactly the same. Maja orders {a} meters of fabric for x kr per meter and gets a discount of {b} kr. Klara orders {c} meters of fabric and pays a fixed shipping fee of {d} kr."
        },
        {
            sv: "Två kompisband hyr en replokal och betalar lika mycket totalt. Det första bandet repar i {a} timmar för x kr i timmen, men har en rabattkupong på {b} kr. Det andra bandet repar i {c} timmar och betalar en medlemsavgift på {d} kr.",
            en: "Two friend bands rent a rehearsal room and pay the same in total. The first band rehearses for {a} hours for x kr per hour, but has a coupon of {b} kr. The second band rehearses for {c} hours and pays a membership fee of {d} kr."
        },
        {
            sv: "Två likadana paket med träningsutrustning väger lika mycket. Det första paketet innehåller {a} stycken hantlar på x kg styck samt ett fäste på {b} kg. Det andra paketet har {c} hantlar och ett fäste på {d} kg.",
            en: "Two identical training equipment packages weigh the same. The first package contains {a} dumbbells of x kg each and a bracket of {b} kg. The second package has {c} dumbbells and a bracket of {d} kg."
        },
        {
            sv: "Två influencers har exakt lika många följare totalt på sina kanaler. Den första har {a} sidoprofiler med x följare på varje, men har raderat {b} inaktiva konton. Den andra har {c} sidoprofiler och {d} följare på sin huvudprofil.",
            en: "Two influencers have exactly the same number of total followers on their channels. The first has {a} side profiles with x followers on each, but deleted {b} inactive accounts. The second has {c} side profiles and {d} followers on their main profile."
        },
        // --- Solving Focus (8-15) ---
        {
            sv: "Två skollag samlar in pengar och har fått ihop exakt lika mycket. Lag A säljer {a} paket fika för x kr styck, men fick lägga ut {b} kr på omkostnader. Lag B säljer {c} paket fika och fick ett bidrag på {d} kr. Beräkna priset x på ett fikapaket.",
            en: "Two school teams raise money and have collected exactly the same amount. Team A sells {a} pastry packs for x kr each, but spent {b} kr on expenses. Team B sells {c} pastry packs and received a contribution of {d} kr. Calculate the price x of a pastry pack."
        },
        {
            sv: "Två taxiresor med olika bolag råkar kosta exakt lika mycket totalt. Den första resan kör {a} km med priset x kr per km, samt en startavgift på {b} kr. Den andra resan kör {c} km med priset x kr per km och en startavgift på {d} kr. Vad är kilometerpriset x?",
            en: "Two taxi rides with different companies happen to cost exactly the same in total. The first ride covers {a} km with a price of x kr per km, plus a startup fee of {b} kr. The second ride covers {c} km with a price of x kr per km and a startup fee of {d} kr. What is the kilometer price x?"
        },
        {
            sv: "Två kompisar har köpt mobiltelefoner och deras totala månadskostnad är exakt lika stor. Liam har en avbetalning på {a} månader för x kr i månaden och en fast försäkring på {b} kr. Emma har en avbetalning på {c} månader för x kr i månaden och en försäkring på {d} kr. Beräkna månadskostnaden x.",
            en: "Two friends bought mobile phones and their total monthly cost is exactly the same. Liam has a payment plan of {a} months for x kr per month and a fixed insurance of {b} kr. Emma has a payment plan of {c} months for x kr per month and an insurance of {d} kr. Calculate the monthly cost x."
        },
        {
            sv: "Två gymkedjor har erbjudanden som slutar på exakt samma totalbelopp. Den första kedjan tar betalt för {a} träningspass á x kr, men ger en välkomstrabatt på {b} kr. Den andra tar betalt för {c} pass á x kr och lägger till en startavgift på {d} kr. Vad kostar ett pass x?",
            en: "Two gym chains have offers that end up at exactly the same total amount. The first chain charges for {a} workout sessions at x kr, but gives a welcome discount of {b} kr. The second charges for {c} sessions at x kr and adds a registration fee of {d} kr. What does a session x cost?"
        },
        {
            sv: "Två likadana lådor med skruvar väger exakt lika mycket. Den första innehåller {a} påsar skruvar som väger x gram styck, samt en tomkartong på {b} gram. Den andra innehåller {c} påsar skruvar och en tyngre kartong på {d} gram. Hur mycket väger en enskild skruvpåse x?",
            en: "Two identical boxes of screws weigh exactly the same. The first contains {a} bags of screws weighing x grams each, plus an empty carton of {b} grams. The second contains {c} bags of screws and a heavier carton of {d} grams. How much does a single screw bag x weigh?"
        },
        {
            sv: "Två nätbutiker säljer hoodies för samma totalpris inklusive avgifter. Den första butiken säljer {a} tröjor för x kr styck och erbjuder en rabattkod på {b} kr. Den andra butiken säljer {c} tröjor för x kr styck och lägger på en fast fraktavgift på {d} kr. Vad är grundpriset x på en hoodie?",
            en: "Two online stores sell hoodies for the same total price including fees. The first store sells {a} shirts for x kr each and offers a discount code of {b} kr. The second store sells {c} shirts for x kr each and adds a fixed shipping fee of {d} kr. What is the base price x of a hoodie?"
        },
        {
            sv: "Två digitala ritytor har fått exakt lika många pixlar totalt i en layout. Den första ytan har {a} kolumner med x pixlar i varje, men har raderat en marginal på {b} pixlar. Den andra har {c} kolumner med x pixlar i varje och har lagt till en marginal på {d} pixlar. Hur många pixlar x finns i en kolumn?",
            en: "Two digital canvases have been allocated exactly the same number of total pixels in a layout. The first canvas has {a} columns with x pixels in each, but deleted a margin of {b} pixels. The second has {c} columns with x pixels in each and added a margin of {d} pixels. How many pixels x are in a column?"
        },
        {
            sv: "Två e-sportlag har samlat ihop exakt lika mycket poäng i en serie. Lag A har vunnit {a} matcher á x poäng, men har fått ett straffavdrag på {b} poäng. Lag B har vunnit {c} matcher á x poäng och har fått {d} bonuspoäng. Hur många poäng x ger en vunnen match?",
            en: "Two e-sports teams have gathered exactly the same points in a league. Team A won {a} matches at x points, but received a penalty deduction of {b} points. Team B won {c} matches at x points and received {d} bonus points. How many points x does a won match award?"
        }
    ]
};