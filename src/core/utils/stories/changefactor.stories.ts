// src/core/utils/stories/changefactor.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const CHANGE_FACTOR_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. APPLY FACTOR INCREASE (Key: apply_factor_inc)
    //    Parameters parsed: {base}, {factor}
    // =========================================================================
    apply_factor_inc: [
        {
            sv: "Ett litet café säljer vanligtvis {base} bullar under en vanlig vecka. Efter att de har visats i ett populärt klipp på nätet ökar efterfrågan snabbt, vilket gör att försäljningen multipliceras med förändringsfaktorn {factor}.",
            en: "A small bakery typically sells {base} buns during a regular week. After being featured in a popular online video, demand grows quickly, causing sales to be multiplied by a change factor of {factor}."
        },
        {
            sv: "Ett nytt onlinespel har {base} aktiva spelare på sin server. Efter en stor uppdatering under helgen växer antalet spelare med förändringsfaktorn {factor}.",
            en: "A new online game has {base} active players on its server. Following a big weekend update, the player count grows by a change factor of {factor}."
        },
        {
            sv: "Priset på en populär gamingskärm ligger från början på {base} kr. På grund av högre fraktkostnader tvingas butiken att höja priset med förändringsfaktorn {factor}.",
            en: "The price of a popular gaming monitor is originally {base} kr. Due to higher shipping costs, the store is forced to raise the price by a change factor of {factor}."
        },
        {
            sv: "Ett e-sportlag samlade ihop {base} poäng under de vanliga matcherna. Genom att vinna finalen får de en bonus som ökar deras totala poäng med förändringsfaktorn {factor}.",
            en: "An e-sports team gathered {base} points during the regular matches. By winning the finals, they get a bonus that scales their total points by a change factor of {factor}."
        },
        {
            sv: "En ny app för läxhjälp laddades ner {base} gånger under augusti. När skolan startar i september skjuter siffran i höjden och multipliceras med {factor}.",
            en: "A new tutoring app was downloaded {base} times during August. When school starts in September, the number shoots up and is multiplied by {factor}."
        },
        {
            sv: "Värdet på ett sällsynt samlarkort uppskattades till {base} kr förra året. Eftersom kortet har blivit väldigt populärt bland samlare har värdet nu ökat med förändringsfaktorn {factor}.",
            en: "The value of a rare collectible card was estimated at {base} kr last year. Since the card became very popular among collectors, the value has now increased by a change factor of {factor}."
        },
        {
            sv: "Ett lopp i stan brukar samla {base} löpare vid startlinjen under sommaren. Till höstens stora lopp utökar arrangörerna platserna och ökar antalet med förändringsfaktorn {factor}.",
            en: "A local race usually gets {base} runners at the starting line during the summer. For the big autumn race, organizers expand the event and increase the number by a change factor of {factor}."
        },
        {
            sv: "Ett litet klädmärke tillverkade {base} jackor under sitt allra första år. Till nästa kollektion bestämmer de sig för att öka produktionen med förändringsfaktorn {factor}.",
            en: "A small clothing brand made {base} jackets during its very first year. For the next collection, they decide to increase production by a change factor of {factor}."
        },
        {
            sv: "Antalet visningar på en video om programmering var {base} under den första veckan. Efter att länken har delats i ett stort forum multipliceras trafiken med {factor}.",
            en: "The views on a programming tutorial video reached {base} during its first week. After the link is shared on a large forum, the traffic is multiplied by {factor}."
        },
        {
            sv: "En liten planta i trädgården var från början {base} mm hög. Under en solig och regnig vecka växer plantan så att höjden multipliceras med förändringsfaktorn {factor}.",
            en: "A small plant in the garden was initially {base} mm tall. During a sunny and rainy week, the plant grows so that its height is multiplied by a change factor of {factor}."
        },
        {
            sv: "En biograf sålde {base} biljetter under sin filmfestival förra året. Genom att bygga ut och lägga till en extra salong ökar biljettkapaciteten med förändringsfaktorn {factor}.",
            en: "A cinema sold {base} tickets during its film festival last year. By expanding and adding an extra theater screen, ticket capacity increases by a change factor of {factor}."
        },
        {
            sv: "Du har sparat {base} bilder på ditt minneskort. När du kommer hem från en resa laddar du över en ny bunt bilder, vilket ökar det totala antalet med förändringsfaktorn {factor}.",
            en: "You have saved {base} photos on your memory card. When you return from a trip, you download a new batch of pictures, increasing the total count by a change factor of {factor}."
        },
        {
            sv: "En lokal idrottsförening har {base} ungdomar som spelar fotboll hos dem. Tack vare att de har byggt en ny fotbollsplan växer antalet spelare med förändringsfaktorn {factor}.",
            en: "A local sports club has {base} kids playing football with them. Thanks to the construction of a new football pitch, the number of players grows by a change factor of {factor}."
        },
        {
            sv: "Ett gym har {base} besökare i snitt per vecka under december. När alla ska ta tag i sina nyårslöften i januari ökar antalet tränande med förändringsfaktorn {factor}.",
            en: "A gym averages {base} visitors per week during December. When everyone starts working on their New Year's resolutions in January, the traffic increases by a change factor of {factor}."
        },
        {
            sv: "En skog rymde {base} fåglar under en räkning på våren. Efter att ett stort naturområde har skyddats och gjorts i ordning växer fågelfamiljen med förändringsfaktorn {factor}.",
            en: "A forest held {base} birds during a count in the spring. After a large nature area is protected and cleaned up, the bird family grows by a change factor of {factor}."
        }
    ],

    // =========================================================================
    // 🎯 2. APPLY FACTOR DECREASE (Key: apply_factor_dec)
    //    Parameters parsed: {base}, {factor}
    // =========================================================================
    apply_factor_dec: [
        {
            sv: "En korg med äpplen väger totalt {base} gram vid plockningen. När frukten ligger förvarad torkar den lite, vilket gör att den slutliga vikten ska multipliceras med förändringsfaktorn {factor}.",
            en: "A basket of apples weighs {base} grams when picked. While the fruit is stored, it dries out a little, meaning the final weight must be multiplied by a change factor of {factor}."
        },
        {
            sv: "Skärmen på en telefon drar {base} enheter ström vid maximal ljusstyrka. Genom att slå på telefonens automatiska strömsparläge minskar förbrukningen med förändringsfaktorn {factor}.",
            en: "A phone screen draws {base} units of power at maximum brightness. By turning on the phone's automatic power-saving mode, energy usage drops by a change factor of {factor}."
        },
        {
            sv: "En klädbutik har {base} stycken vinterjackor kvar på lagret i slutet av vintern. För att göra plats för vårkläder säljs jackorna ut på rea med förändringsfaktorn {factor}.",
            en: "A clothing store has {base} winter jackets left in stock at the end of winter. To make room for spring clothes, the jackets are sold off on clearance by a change factor of {factor}."
        },
        {
            sv: "En konsertplats har plats för {base} personer i publiken. Av säkerhetsskäl väljer arrangörerna att minska antalet biljetter till nästa kväll med förändringsfaktorn {factor}.",
            en: "A concert venue has space for {base} people in the audience. For safety reasons, organizers choose to reduce the number of tickets for the next night by a change factor of {factor}."
        },
        {
            sv: "När du kollar på video med högsta kvalitet drar appen {base} megabyte data per timme. Genom att sänka till standardkvalitet minskar datamängden med förändringsfaktorn {factor}.",
            en: "When watching video in the highest quality, the app uses {base} megabytes of data per hour. By lowering it to standard quality, the data usage drops by a change factor of {factor}."
        },
        {
            sv: "En butik köpte in {base} förpackningar av en leksak som visade sig sälja ganska dåligt. Inför nästa månad väljer butikschefen att minska beställningen med förändringsfaktorn {factor}.",
            en: "A shop ordered {base} boxes of a toy that turned out to sell quite poorly. Ahead of next month, the shop manager decides to cut the order by a change factor of {factor}."
        },
        {
            sv: "En moped drar i genomsnitt {base} ml bränsle under ett accelerationstest. Efter att motorn har rengjorts och servats ordentligt minskar förbrukningen med förändringsfaktorn {factor}.",
            en: "A moped uses an average of {base} ml of fuel during an acceleration test. After the engine is properly cleaned and serviced, fuel consumption drops by a change factor of {factor}."
        },
        {
            sv: "Batteriet i en begagnad smartphone har en maximal kapacitet på {base} mAh. Efter att ha laddats och använts flitigt i två år har batterihälsan sjunkit med förändringsfaktorn {factor}.",
            en: "The battery in a used smartphone has a maximum capacity of {base} mAh. After being charged and used heavily for two years, the battery health has dropped by a change factor of {factor}."
        },
        {
            sv: "Trafiken förbi en skola mättes till {base} bilar per dag under en vanlig vecka. När en ny cykelbana öppnar bredvid minskar antalet bilar med förändringsfaktorn {factor}.",
            en: "Traffic past a school was measured at {base} cars per day during a regular week. When a new bike lane opens nearby, the number of cars drops by a change factor of {factor}."
        },
        {
            sv: "Du la ner {base} minuter på att rensa gamla mejl och filer förra veckan. Genom att installera ett smart sorteringsprogram minskar tidsåtgången den här veckan med förändringsfaktorn {factor}.",
            en: "You spent {base} minutes cleaning out old emails and files last week. By installing a smart sorting tool, the time spent this week drops by a change factor of {factor}."
        },
        {
            sv: "Ljudnivån från en gammal datorfläkt uppmättes till effekten {base}. Efter att fläkten har torkats ren från damm och oljats in sjunker ljudnivån med förändringsfaktorn {factor}.",
            en: "The noise level from an old computer fan measured an output of {base}. After the fan is wiped clean of dust and oiled, the noise drops by a change factor of {factor}."
        },
        {
            sv: "En skolgård täckte en yta på {base} kvadratmeter från början. När skolan bygger ut en ny idrottshall minskar den öppna skolgårdsytan med förändringsfaktorn {factor}.",
            en: "A schoolyard covered an area of {base} square meters originally. When the school builds a new sports hall, the open schoolyard space shrinks by a change factor of {factor}."
        },
        {
            sv: "Ett skolkök slängde tyvärr {base} kg mat under en stressig vecka. Genom att planera portionerna bättre och låta eleverna ta själva minskar svinnet med förändringsfaktorn {factor}.",
            en: "A school kitchen unfortunately threw away {base} kg of food during a stressful week. By planning portions better, the waste drops by a change factor of {factor}."
        },
        {
            sv: "Antalet felrapporter i ett nystartat kodprojekt låg på {base} stycken. Efter en helg där utvecklarna samarbetade för att fixa buggar minskar antalet öppna fel med förändringsfaktorn {factor}.",
            en: "The number of bug reports in a new software project stood at {base}. After a weekend of developers working together to fix bugs, the open issues drop by a change factor of {factor}."
        },
        {
            sv: "Ett bageri använde {base} kg socker i sina kakor förra månaden. Genom att justera recepten till ett nytt alternativ minskar sockerblandningen med förändringsfaktorn {factor}.",
            en: "A bakery used {base} kg of sugar in its pastries last month. By adjusting the recipes to a new alternative, the sugar amount decreases by a change factor of {factor}."
        }
    ],

    // =========================================================================
    // 🎯 3. REVERSE FACTOR INCREASE (Key: find_original_inc)
    //    Parameters parsed: {newPrice}, {factor}
    // =========================================================================
    find_original_inc: [
        {
            sv: "Efter en prishöjning på grund av att en vara har blivit väldigt populär kostar ett gymkort nu {newPrice} kr. Det nya priset räknades ut med förändringsfaktorn {factor}.",
            en: "Following a price increase because an item became very popular, a gym pass now costs {newPrice} kr. The new price was calculated using a change factor of {factor}."
        },
        {
            sv: "Ett lag har samlat ihop {newPrice} poäng totalt i en speltävling efter att deras startpoäng har multiplicerats med en bonusfaktor på {factor}.",
            en: "A team earned {newPrice} points total in a gaming tournament after their starting score was multiplied by a bonus factor of {factor}."
        },
        {
            sv: "En streamer har {newPrice} aktiva tittare i sin livechatt just nu efter en plötslig rusch där antalet tittare ändrades med förändringsfaktorn {factor}.",
            en: "A streamer has {newPrice} active viewers in their live chat right now after a sudden rush where the viewer count shifted by a change factor of {factor}."
        },
        {
            sv: "En konsertbiljett säljs på nätet för {newPrice} kr. På grund av att biljetterna nästan är slut har priset höjts och beräknats med förändringsfaktorn {factor} jämfört med startpriset.",
            en: "A concert ticket is sold online for {newPrice} kr. Because the tickets are almost sold out, the price surged and was calculated with a factor of {factor} compared to the starting price."
        },
        {
            sv: "Antalet gilla-markeringar på ett videoklipp har nått {newPrice} efter en timme där visningarna och kicken har skalat om med förändringsfaktorn {factor}.",
            en: "The likes on a video clip reached {newPrice} after an hour where the views and interactions scaled by a change factor of {factor}."
        },
        {
            sv: "Månadskostnaden för att spara filer i molnet ligger nu på {newPrice} kr efter en prisändring där den gamla avgiften multiplicerades med förändringsfaktorn {factor}.",
            en: "The monthly cost to save files in the cloud is now {newPrice} kr following a price adjustment where the old fee was multiplied by a change factor of {factor}."
        },
        {
            sv: "Efter en lyckad reklamkampanj har en hemsida {newPrice} besökare per dag. Det beräknades utifrån en tillväxtfaktor på {factor} jämfört med hur det såg ut innan.",
            en: "Following a successful ad campaign, a website has {newPrice} daily visitors. This was calculated based on a growth factor of {factor} compared to how it looked before."
        },
        {
            sv: "Ett digitalt spelarkiv rymmer numera {newPrice} sparade spel efter att samlingen utökats med förändringsfaktorn {factor} under den senaste uppdateringen.",
            en: "A digital game archive currently holds {newPrice} saved games after the collection was expanded by a change factor of {factor} during the latest update."
        },
        {
            sv: "Priset för att hyra en elsparkcykel under en helg slutar på {newPrice} kr efter att en extra helgavgift lagts till som ändrade kostnaden med faktorn {factor}.",
            en: "The price to rent an e-scooter over a weekend ends up at {newPrice} kr after an extra weekend surcharge was added that shifted the cost by a factor of {factor}."
        },
        {
            sv: "En skog rymmer {newPrice} fåglar under den senaste räkningen, vilket motsvarar en ökning med förändringsfaktorn {factor} sedan förra året.",
            en: "A forest held {newPrice} birds during the latest count, which corresponds to an increase by a change factor of {factor} since last year."
        },
        {
            sv: "Datatrafiken till en skolas server har ökat till {newPrice} gigabyte. IT-avdelningen meddelar att belastningen har multiplicerats med förändringsfaktorn {factor}.",
            en: "Data traffic to a school server has increased to {newPrice} gigabytes. The IT department notes that the workload was multiplied by a change factor of {factor}."
        },
        {
            sv: "En liten ekplanta mäter nu {newPrice} mm. Under en solig och regnig sommarmånad ökade plantans höjd med förändringsfaktorn {factor}.",
            en: "A small oak sapling now measures {newPrice} mm. During a rainy and sunny summer month, the sapling's height increased by a change factor of {factor}."
        },
        {
            sv: "Medlemsantalet i en lokal idrottsförening har vuxit till {newPrice} ungdomar efter en stor värvningsvecka där klubben expanderade med förändringsfaktorn {factor}.",
            en: "The membership count in a local sports club grew to {newPrice} youth athletes after a big signup week where the club expanded by a change factor of {factor}."
        },
        {
            sv: "En rityta i ett ritprogram har justerats till bredden {newPrice} pixlar. Detta nya mått motsvarar en ändring med förändringsfaktorn {factor} av vad ytan mätte från början.",
            en: "A drawing canvas in a design program was adjusted to a width of {newPrice} pixels. This new dimension corresponds to a shift by a factor of {factor} of what the canvas measured originally."
        },
        {
            sv: "En sajt har {newPrice} aktiva prenumeranter efter en lyckad kampanj på sociala medier som skalade upp antalet medlemmar med förändringsfaktorn {factor}.",
            en: "A site has {newPrice} active subscribers following a successful social media campaign that scaled up the member count by a change factor of {factor}."
        }
    ],

    // =========================================================================
    // 🎯 4. REVERSE FACTOR DECREASE (Key: find_original_dec)
    //    Parameters parsed: {newPrice}, {factor}
    // =========================================================================
    find_original_dec: [
        {
            sv: "Ett sällsynt par sneakers säljs på en app för {newPrice} kr efter och att säljaren har sänkt priset till förändringsfaktorn {factor} av det ordinarie nypriset.",
            en: "A rare pair of sneakers is sold on an app for {newPrice} kr after the seller reduced the price to a change factor of {factor} of its original retail price."
        },
        {
            sv: "Du köper en begagnad dator av en kompis för {newPrice} kr. Kompisen säljer den billigt till dig och har satt priset till faktorn {factor} av vad den kostade som helt ny.",
            en: "You buy a used computer from a friend for {newPrice} kr. The friend sells it to you cheap, setting the price to a factor of {factor} of what the computer cost brand new."
        },
        {
            sv: "En telefon har efter en dags hård användning en kvarvarande batterikapacitet på {newPrice} mAh, vilket motsvarar förändringsfaktorn {factor} av ett fulladdat batteri.",
            en: "A phone battery has a remaining capacity of {newPrice} mAh after a day of heavy usage, which corresponds to a change factor of {factor} of a full charge."
        },
        {
            sv: "Mängden matsvinn i en skola uppmättes till {newPrice} kg under den här veckan. Tack vare att man har infört mindre tallrikar har svinnet ändrats med förändringsfaktorn {factor}.",
            en: "The amount of food waste in a school measured {newPrice} kg this week. Thanks to introducing smaller plates, the waste shifted by a change factor of {factor}."
        },
        {
            sv: "Efter att vaktmästaren tagit bort skadade träd finns det {newPrice} träd kvar på skolgården. Det kvarvarande antalet motsvarar förändringsfaktorn {factor} av beståndet innan rensningen.",
            en: "After the caretaker removed damaged trees, {newPrice} trees remain in the schoolyard. This remaining count corresponds to a factor of {factor} of the stock before thinning."
        },
        {
            sv: "En klädbutik har {newPrice} stycken jackor kvar på lagret efter en stor rea där lagersaldot multiplicerades med förändringsfaktorn {factor}.",
            en: "A clothing brand has {newPrice} jackets left in stock after a big sale where the inventory balance was multiplied by a change factor of {factor}."
        },
        {
            sv: "En bärbar dator drar bara {newPrice} enheter ström under sitt strömsparläge, vilket motsvarar den vanliga förbrukningen multiplicerat med förändringsfaktorn {factor}.",
            en: "A portable laptop draws only {newPrice} units of power under power-saver mode, which corresponds to the regular consumption multiplied by a change factor of {factor}."
        },
        {
            sv: "Antalet visningar på en video sjönk till {newPrice} per dag under sommarlovet. Nedgången beräknades med en säsongsfaktor på {factor} jämfört med skolterminen.",
            en: "The view count on a video dropped to {newPrice} per day during summer break. The drop was calculated with a seasonal factor of {factor} compared to the school term."
        },
        {
            sv: "Trafiken förbi ett vägbygge minskade till {newPrice} bilar per dygn efter att nya skyltar sattes upp som ändrade biltätheten med förändringsfaktorn {factor}.",
            en: "Traffic past a construction zone decreased to {newPrice} cars per day after new signs were put up that shifted traffic by a change factor of {factor}."
        },
        {
            sv: "Du la ner {newPrice} minuter på läxor den här veckan efter att ett nytt digitalt planeringsverktyg minskat tidsåtgången med förändringsfaktorn {factor}.",
            en: "You spent {newPrice} minutes on homework this week after a new digital planning tool cut down the time spent by a change factor of {factor}."
        },
        {
            sv: "Ljudnivån nära en fläkt i datasalen sjönk till effekten {newPrice} efter att de satt upp dämpande paneler som ändrade ljudet med förändringsfaktorn {factor}.",
            en: "The noise level near a fan in the computer lab dropped to an output of {newPrice} after mounting dampening panels that shifted output by a change factor of {factor}."
        },
        {
            sv: "En gräsmatta täckte en yta på {newPrice} kvadratmeter efter att ett nytt cykelförråd byggts och ändrat gräsytan med förändringsfaktorn {factor}.",
            en: "A lawn covered an area of {newPrice} square meters after a new bike shed was built, shifting the grass footprint by a change factor of {factor}."
        },
        {
            sv: "Antalet fel i ett spelprojekt minskade till {newPrice} stycken efter en fixarkväll där alla öppna buggar multiplicerades med förändringsfaktorn {factor}.",
            en: "The number of bugs in a game project dropped to {newPrice} after a patch night where open issues were multiplied by a change factor of {factor}."
        },
        {
            sv: "Ett bageri använde {newPrice} kg socker den här månaden. Genom att ändra om i sina recept minskade sockeråtgången med förändringsfaktorn {factor} jämfört med tidigare.",
            en: "A bakery consumed {newPrice} kg of sugar this month. By tweaking its recipes, sugar usage decreased by a change factor of {factor} compared to before."
        },
        {
            sv: "Ett parti frukter väger {newPrice} kg efter transporten eftersom en del vatten i frukten har dunstat bort enligt förändringsfaktorn {factor}.",
            en: "A batch of fruit weighs {newPrice} kg after shipping because some water in the fruit evaporated according to a change factor of {factor}."
        }
    ],

    // =========================================================================
    // 🎯 5. COMPOUND FACTORS (Key: sequential_factors)
    //    Parameters parsed: {f1}, {f2}
    // =========================================================================
    factor_compound: [
        {
            sv: "Priset på ett par hörlurar ändras i två steg på en hemsida. Först sker en förändring med faktorn {f1} under en rea, och kort därefter justeras priset igen med faktorn {f2}.",
            en: "The price of headphones changes in two successive steps on a website. First, a shift occurs by a factor of {f1} during a sale, and shortly after, the price is adjusted again by a factor of {f2}."
        },
        {
            sv: "Antalet visningar på en ny video ändras under två dagar i rad. På måndagen ändras trafiken med förändringsfaktorn {f1}, och på tisdagen ändras det nya värdet med faktorn {f2}.",
            en: "The view count on a new video shifts over two consecutive days. On Monday, traffic changes by a factor of {f1}, and on Tuesday, the new value changes again by a factor of {f2}."
        },
        {
            sv: "Värdet på ett föremål i ett spel shufflas upp och ner under en handelsdag. Under förmiddagen ändras värdet med faktorn {f1}, och under eftermiddagen ändras saldot med ytterligare faktorn {f2}.",
            en: "The value of a game item shuffles up and down over a trading day. In the morning, the value shifts by a factor of {f1}, and in the afternoon, the balance changes by another factor of {f2}."
        },
        {
            sv: "Antalet medlemmar i en Discord-kanal ändras under två veckor. Första veckan ändras antalet med förändringsfaktorn {f1}, och under den andra veckan ändras medlemmarna med faktorn {f2}.",
            en: "The member count in a Discord server shifts over two weeks. During the first week, the count adjusts by a factor of {f1}, and during the second week, members shift by a factor of {f2}."
        },
        {
            sv: "Laddningstiden för ett batteri optimeras i två steg av en ny mjukvara. Det första skriptet ändrar tiden med faktorn {f1}, och nästa uppdatering ändrar värdet med ytterligare faktorn {f2}.",
            en: "The charging speed of a battery is optimized in two steps by a new software patch. The first script shifts the runtime by a factor of {f1}, and the next update changes the value by another factor of {f2}."
        },
        {
            sv: "En bit snöre till ett bygge kapas och förlängs i två omgångar. Först ändras snörets längd med förändringsfaktorn {f1}, och i nästa skede ändras den nya biten med faktorn {f2}.",
            en: "A piece of string for a project is clipped and extended in two separate stages. First, the string length shifts by a factor of {f1}, and in the next step, the new piece changes by a factor of {f2}."
        },
        {
            sv: "Lagringsutrymmet för ett spel komprimeras i två omgångar av utvecklarna. Den första rensningen ändrar filstorleken med faktorn {f1}, och nästa optimering ändrar storleken med faktorn {f2}.",
            en: "The storage footprint of a game is compressed in two rounds by developers. The first compression shifts the file size by a factor of {f1}, and the next optimization changes the footprint by a factor of {f2}."
        },
        {
            sv: "Biljettpriset till en festival justeras i två tidsperioder. Inför förköpet ändras startpriset med förändringsfaktorn {f1}, och på själva evenemangsdagen ändras priset med faktorn {f2}.",
            en: "The ticket price for a festival is adjusted across two periods. Ahead of the pre-sale, the base price shifts by a factor of {f1}, and on the day of the event, the price changes by a factor of {f2}."
        },
        {
            sv: "Antalet aktiva spelare på en server skiftar under dygnet. Vid lunchtid ändras spelarantalet med förändringsfaktorn {f1}, och under sena kvällen ändras värdet med faktorn {f2}.",
            en: "The count of active players on a server shifts during the day. Around lunchtime, player volume changes by a factor of {f1}, and during late evening, the count shifts by a factor of {f2}."
        },
        {
            sv: "En planterad blomma ändrar sin tillväxttakt under två veckor. Under den soliga första veckan ändras höjden med faktorn {f1}, och under den torra andra veckan ändras höjden med faktorn {f2}.",
            en: "A planted flower shifts its growth rate over two weeks. During a sunny first week, its height changes by a factor of {f1}, and during a dry second week, its height shifts by a factor of {f2}."
        },
        {
            sv: "Ljudvolymen på en video finjusteras i två steg i ett redigeringsprogram. Först ändras effekten med förändringsfaktorn {f1}, och i nästa filterinställning ändras nivån med faktorn {f2}.",
            en: "The audio volume of a video is fine-tuned in two steps within an editing program. First, the output shifts by a factor of {f1}, and in the next filter setting, the level changes by a factor of {f2}."
        },
        {
            sv: "En klädbutik justerar sitt lager av jackor inför säsongsskiften. Först ändras antalet jackor på hyllan med förändringsfaktorn {f1}, och veckan efter ändras lagret med faktorn {f2}.",
            en: "A shop adjusts its inventory of jackets ahead of seasonal changes. First, the jacket count on shelves shifts by a factor of {f1}, and the week after, stock changes by a factor of {f2}."
        },
        {
            sv: "Trafiken till en webbsida ändras under julafton och nyårsafton. Under julen ändras besökarantalet med förändringsfaktorn {f1}, och under nyår ändras trafiken med faktorn {f2}.",
            en: "Web traffic to a page shifts over Christmas Eve and New Year's Eve. During Christmas, visitor volume changes by a factor of {f1}, and during New Year's, traffic shifts by a factor of {f2}."
        },
        {
            sv: "Vikten på ett nytt lättvikts-headset justeras i två designskisser. Den första skissen ändrar vikten med förändringsfaktorn {f1}, och den andra finjusteringen ändrar vikten med faktorn {f2}.",
            en: "The weight of a new lightweight headset is adjusted across two design revisions. The first revision shifts the weight by a factor of {f1}, and the second fine-tuning changes the weight by a factor of {f2}."
        },
        {
            sv: "Mängden kaffebönor i en förpackning ändras hos en tillverkare. Först ändras vikten med förändringsfaktorn {f1} i en kampanj, och efteråt återställs linjen och ändras med faktorn {f2}.",
            en: "The amount of coffee beans in a package is modified by a manufacturer. First, the weight shifts by a factor of {f1} in a promotion, and afterward, the line is reset and changes by a factor of {f2}."
        }
    ]
};