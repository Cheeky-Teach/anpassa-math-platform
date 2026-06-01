// src/core/utils/stories/patterns.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const PATTERN_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    //   1. PATTERN HIGH TERM (Key: pattern_high_term)
    //    Parameters: {s} (värde vecka 1), {s+d} (värde vecka 2), {targetN} (målvecka)
    //    Plumbing: Matchar ledtråd 1: (s + d) - s = d för att räkna ut differensen.
    // =========================================================================
    pattern_high_term: [
        {
            sv: "Du sparar i en burk för att köpa ett spel. Efter vecka 1 har du {s} kr, och efter vecka 2 har du {s+d} kr. Om sparandet ökar i samma jämna takt, hur mycket pengar har du efter {targetN} veckor?",
            en: "You are saving money in a jar to buy a game. After week 1 you have {s} kr, and after week 2 you have {s+d} kr. If your savings grow at the same steady rate, how much money do you have after {targetN} weeks?"
        },
        {
            sv: "Liam samlar på kort. Under månad 1 har han {s} kort, och under månad 2 har han {s+d} kort. Om han fortsätter köpa lika många kort varje månad, hur många har han totalt efter {targetN} månader?",
            en: "Liam collects trading cards. During month 1 he has {s} cards, and during month 2 he has {s+d} cards. If he continues to buy the same number of cards every month, how many does he have in total after {targetN} months?"
        },
        {
            sv: "I ett mobilspel har din karaktär {s} poäng i styrka efter uppdrag 1. Efter uppdrag 2 har styrkan ökat till {s+d} poäng. Om styrkan ökar med lika mycket för varje avklarat uppdrag, vad är din styrka efter {targetN} uppdrag?",
            en: "In a mobile game, your character has {s} strength points after mission 1. After mission 2 your strength has increased to {s+d} points. If your strength increases by the same amount for each completed mission, what is your strength after {targetN} missions?"
        },
        {
            sv: "En solros är {s} mm hög dag 1. Dag 2 mäter du den igen och då är den {s+d} mm hög. Om solrosen fortsätter växa i samma jämna takt per dag, hur hög är den på dag {targetN}?",
            en: "A sunflower is {s} mm tall on day 1. On day 2 it is {s+d} mm tall. If the sunflower continues to grow at the same steady rate per day, how tall is it on day {targetN}?"
        },
        {
            sv: "Du läser en bokserie. Efter första kvällen har du läst {s} sidor totalt, och efter andra kvällen är du uppe i {s+d} sidor. Om du läser exakt lika många sidor varje kväll, hur många sidor har du läst efter {targetN} kvällar?",
            en: "You are reading a book series. After the first evening you have read {s} pages total, and after the second evening you have reached {s+d} pages. If you read exactly the same number of pages each evening, how many pages have you read after {targetN} evenings?"
        },
        {
            sv: "Elin tränar inför ett lopp. Under första passet springer hon {s} meter, och under andra passet ökar hon till {s+d} meter. Om hon ökar sträckan med lika många meter inför varje nytt pass, hur många meter springer hon under sitt {targetN}:e träningspass?",
            en: "Elin is training for a race. During her first run she covers {s} meters, and during her second run she increases it to {s+d} meters. If she increases her distance by the same number of meters for each new run, how many meters will she run during her {targetN}th run?"
        },
        {
            sv: "Din bas i ett onlinespel har producerat {s} energikristaller efter första timmen, och totalt {s+d} kristaller efter andra timmen. Om produktionen ökar i samma jämna takt per timme, hur många kristaller har basen producerat efter {targetN} timmar?",
            en: "Your base in an online game has produced {s} energy crystals after the first hour, and a total of {s+d} crystals after the second hour. If production grows at the same steady rate per hour, how many crystals has the base produced after {targetN} hours?"
        },
        {
            sv: "Ett konto på sociala medier har {s} följare efter första veckan och {s+d} följare efter andra veckan. Om följarantalet ökar med exakt lika många följare varje vecka, hur många följare har kontot efter {targetN} veckor?",
            en: "A social media account has {s} followers after the first week and {s+d} followers after the second week. If the follower count grows by the exact same number each week, how many followers does the account have after {targetN} weeks?"
        },
        {
            sv: "Ett torn byggs av likadana byggklossar. När tornet är 1 rad högt har det gått åt {s} klossar totalt, och när det är 2 rader högt har det tagit {s+d} klossar. Om mönstret fortsätter på samma sätt, hur många klossar har gått åt när tornet är {targetN} rader högt?",
            en: "A tower is built from identical blocks. When the tower is 1 row high it uses {s} blocks total, and when it is 2 rows high it uses {s+d} blocks. If the pattern continues in the same way, how many blocks are used when the tower is {targetN} rows high?"
        },
        {
            sv: "Du bakar kakor till ett skolfika. Efter första timmen har du bakat {s} kakor totalt, och efter andra timmen är du uppe i {s+d} kakor. Om du fortsätter baka i samma jämna takt, hur många kakor har du gjort efter {targetN} timmar?",
            en: "You are baking cookies for a school bake sale. After the first hour you have baked {s} cookies total, and after the second hour you have reached {s+d} cookies. If you continue baking at the same steady pace, how many cookies have you made after {targetN} hours?"
        },
        {
            sv: "En experimentell behållare innehåller {s} liter vatten efter 1 minut. Påfyllningen sker i jämn takt och efter 2 minuter innehåller behållaren {s+d} liter. Om påfyllningen fortsätter i samma takt, hur många liter vatten innehåller den efter {targetN} minuter?",
            en: "An experimental tank holds {s} liters of water after 1 minute. Refilling occurs at a steady rate and after 2 minutes the tank holds {s+d} liters. If refilling continues at the same rate, how many liters of water does it hold after {targetN} minutes?"
        },
        {
            sv: "Du samlar på serietidningar. Din samling har ökat till {s} tidningar efter din första loppisrunda, och till {s+d} tidningar efter din andra runda. Om du köper exakt lika många nya tidningar under varje runda, hur många har du efter {targetN} loppisrundor?",
            en: "You collect comic books. Your collection has grown to {s} comics after your first flea market trip, and to {s+d} comics after your second trip. If you buy the exact same number of new comics during every trip, how many do you have after {targetN} flea market trips?"
        },
        {
            sv: "I en fågelklubb har medlemmarna registrerat {s} fågelarter under första veckan. Under andra veckan har det totala antalet arter stigit till {s+d}. Om de hittar nya arter i samma jämna takt varje vecka, hur många arter har de registrerat efter {targetN} veckor?",
            en: "In a bird watching club, members registered {s} bird species during their first week. During the second week, the total number of unique registered species rose to {s+d}. If they find new species at the same steady rate each week, how many species have they registered in total after {targetN} weeks?"
        },
        {
            sv: "Ett planterat träd har fått {s} grenar totalt efter sitt första år. Efter sitt andra år har trädet utvecklat totalt {s+d} grenar. Om trädet får exakt lika många nya grenar varje år, hur många grenar har det totalt efter {targetN} år?",
            en: "A planted tree has grown a total of {s} branches after its first year. After its second year, the tree has developed a total of {s+d} branches. If the tree gets the exact same number of new branches each year, how many branches does it have in total after {targetN} years?"
        },
        {
            sv: "Du sparar på tior i en spargris. Det ligger {s} tior i grisen efter första månaden, och sparandet växer jämnt så att det ligger {s+d} tior i grisen efter andra månaden. Om du fortsätter lägga i exakt lika många tior varje månad, hur många tior ligger det i spargrisen efter {targetN} månader?",
            en: "You are saving ten-kronor coins in a piggy bank. There are {s} coins in the bank after the first month, and the savings grow steadily so there are {s+d} coins in the bank after the second month. If you continue to add the exact same number of coins every month, how many coins will be in the piggy bank after {targetN} months?"
        }
    ],

    // =========================================================================
    //   2. PATTERN LINEAR CALC (Key: pattern_linear_calc)
    //    Parameters: {a} (pris per enhet), {target} (antal köpta enheter), {b} (fast startavgift)
    // =========================================================================
    pattern_linear_calc: [
        {
            sv: "Inträdet till ett nöjesfält kostar {b} kr. Väl där inne kostar varje åkbiljett {a} kr. Vad blir den totala kostnaden om du köper {target} åkbiljetter?",
            en: "Admission to an amusement park costs {b} kr. Once inside, each ride ticket costs {a} kr. What is the total cost if you buy {target} ride tickets?"
        },
        {
            sv: "Att hyra en bowlingbana kostar en fast startavgift på {b} kr för skor och klot. Efter det kostar banan {a} kr per timme. Hur mycket ska ni betala totalt om ni spelar i {target} timmar?",
            en: "Renting a bowling lane costs a fixed fee of {b} kr for shoes and balls. After that, the lane costs {a} kr per hour. How much will you pay in total if you play for {target} hours?"
        },
        {
            sv: "En strömningstjänst har en fast månadsavgift på {b} kr. Om du vill hyra nya premiärfilmer kostar de {a} kr styck. Vad blir din totala kostnad för en månad där du har hyrt {target} premiärfilmer?",
            en: "A streaming service has a fixed monthly fee of {b} kr. If you want to rent new premium movies, they cost {a} kr each. What is your total bill for a month where you rented {target} premium movies?"
        },
        {
            sv: "Att köpa en bas till en skateboard kostar {b} kr. Om du vill lägga till snygga klistermärken kostar de {a} kr styck. Vad blir det totala priset om du väljer att köpa {target} klistermärken?",
            en: "Buying a standard skateboard deck costs {b} kr. If you want to add stickers, they cost {a} kr each. What is the total price if you choose to buy {target} stickers?"
        },
        {
            sv: "En pizzabuffé kostar {b} kr i grundpris. Om du vill köpa till extra dricka kostar varje burk {a} kr. Vad betalar du totalt om du dricker {target} burkar under besöket?",
            en: "A pizza buffet costs a base price of {b} kr. If you want to buy extra canned sodas, each drink costs {a} kr. What do you pay in total if you drink {target} cans during your visit?"
        },
        {
            sv: "En taxiresa har en startavgift på {b} kr när du sätter dig i bilen. Sedan kostar resan {a} kr per kilometer. Vad blir det totala priset om din resa hem är {target} kilometer lång?",
            en: "A taxi ride has a starting fee of {b} kr when you get into the car. After that, the ride costs {a} kr per kilometer. What is the total price if your journey home is {target} kilometers long?"
        },
        {
            sv: "Ett mobilabonnemang har en fast grundavgift på {b} kr varje månad. Om du behöver köpa till extra mobildata kostar varje gigabyte {a} kr. Vad betalar du totalt för en månad där du köper {target} extra gigabyte?",
            en: "A mobile subscription has a fixed base fee of {b} kr every month. If you need to buy extra data, each gigabyte costs {a} kr. What do you pay in total for a month where you buy {target} extra gigabytes?"
        },
        {
            sv: "Att hyra en cykel kostar en fast avgift på {b} kr för att låsa upp den. Därefter betalar man {a} kr per timme. Hur mycket kostar det totalt att använda cykeln i {target} timmar?",
            en: "Renting a bicycle costs a fixed fee of {b} kr to unlock it. After that, you pay {a} kr per hour. How much does it cost in total to use the bicycle for {target} hours?"
        },
        {
            sv: "Att spela laserdome kostar {b} kr i grundpris för utrustning. Sedan kostar varje spelomgång {a} kr. Vad betalar du totalt om du ska spela {target} omgångar?",
            en: "Playing laser tag costs a base price of {b} kr for equipment. After that, each game round costs {a} kr. What do you pay in total if you are going to play {target} rounds?"
        },
        {
            sv: "När klassen beställer klasströjor är fraktkostnaden för hela paketet {b} kr. Själva tröjorna kostar sedan {a} kr styck. Vad kostar hela beställningen om ni beställer {target} tröjor till klassen?",
            en: "When the class orders graduation hoodies, the shipping cost for the whole package is {b} kr. The hoodies cost {a} kr each. What does the entire order cost if your class orders {target} hoodies?"
        },
        {
            sv: "Att spela en runda minigolf kostar {b} kr i entré. Om du vill köpa till snacks kostar varje påse {a} kr. Vad blir det totala priset om du köper {target} påsar under rundan?",
            en: "Playing a round of mini-golf costs {b} kr for admission. If you want to buy snacks, each bag costs {a} kr. What is the total price if you buy {target} bags during the round?"
        },
        {
            sv: "En biltvätt har en grundkostnad på {b} kr för en enkel tvätt. Om du vill lägga till extra glansvax kostar varje omgång {a} kr. Vad kostar tvätten totalt om du väljer till {target} vaxningar?",
            en: "A car wash has a baseline cost of {b} kr for a basic wash. If you want to add extra premium polish cycles, each cycle costs {a} kr. What does the wash cost in total if you add {target} polish cycles?"
        },
        {
            sv: "En musiksajt kostar {b} kr för att registrera ett konto. Efter det kostar varje låt du vill ladda ner {a} kr. Vad betalar du totalt om du laddar ner {target} låtar?",
            en: "A music website costs {b} kr to register an account. After that, each song you want to download costs {a} kr. What do you pay in total if you download {target} songs?"
        },
        {
            sv: "Att hyra en studio för att spela in musik kostar {b} kr i startavgift för utrustningen. Sedan kostar studiotiden {a} kr per timme. Vad kostar det totalt om du bokar den i {target} timmar?",
            en: "Renting a studio to record music costs a starting fee of {b} kr for the equipment setup. After that, the studio time costs {a} kr per hour. What does it cost in total if you book it for {target} hours?"
        },
        {
            sv: "Ett startset för att sticka kostar {b} kr. Om du vill köpa till extra nystan med färgat garn kostar varje nystan {a} kr. Vad blir den totala kostnaden om du köper {target} extra garnnystan?",
            en: "A starting set for knitting costs {b} kr. If you want to buy extra balls of colored yarn, each ball costs {a} kr. What is the total cost if you purchase {target} extra balls of yarn?"
        }
    ],

    // =========================================================================
    //   3. PATTERN LINEAR REVERSE (Key: pattern_linear_reverse)
    //    Parameters: {a} (pris per enhet), {b} (fast startavgift), {total} (slutnota)
    // =========================================================================
    pattern_linear_reverse: [
        {
            sv: "Ett besök på ett arkadhus kostar {b} kr i entré, och sedan kostar varje spelpollett {a} kr. När du går därifrån har du spenderat totalt {total} kr. Hur många spelpolletter köpte du?",
            en: "A visit to an arcade center costs {b} kr for entry, and then each game token costs {a} kr. When you leave, you have spent a total of {total} kr. How many game tokens did you buy?"
        },
        {
            sv: "Att hyra skridskor i ishallen kostar {b} kr i fast avgift för skyddsutrustning. Sedan betalar man {a} kr per timme som man åker på isen. Om ditt kvitto slutade på totalt {total} kr, hur många timmar åkte du?",
            en: "Renting ice skates at the rink costs a fixed fee of {b} kr for safety gear. After that, you pay {a} kr per hour on the ice. If your final receipt came to a total of {total} kr, how many hours did you skate?"
        },
        {
            sv: "Du beställer egna klistermärken från en hemsida. Frakten kostar en fast avgift på {b} kr och varje ark med klistermärken kostar {a} kr. Om hela din beställning kostade {total} kr, hur många ark köpte du?",
            en: "You order custom stickers from a website. Shipping costs a flat fee of {b} kr and each sheet of stickers costs {a} kr. If your entire order cost {total} kr, how many sheets did you purchase?"
        },
        {
            sv: "På en matmarknad kostar inträdet {b} kr. Inne på området kan man köpa kuponger till olika matstånd för {a} kr styck. Om du spenderade totalt {total} kr under dagen, hur många kuponger köpte du?",
            en: "At a food festival, admission costs {b} kr. Inside the area, you can buy coupons for different food trucks for {a} kr each. If you spent a total of {total} kr during the day, how many coupons did you buy?"
        },
        {
            sv: "Ett månadskort till ett onlinespel kostar {b} kr i baspris. Om du vill köpa till extra utrustning till din karaktär kostar varje pryl {a} kr. Om du totalt har betalat {total} kr den här månaden, hur många prylar köpte du?",
            en: "A monthly pass to an online game costs a base price of {b} kr. If you want to buy extra items for your character, each item costs {a} kr. If you paid a total of {total} kr this month, how many items did you buy?"
        },
        {
            sv: "Att hyra en kajak vid en sjö kostar {b} kr i fast startavgift. Efter det kostar hyran {a} kr per timme. Om du betalade totalt {total} kr när du lämnade tillbaka kajaken, hur många timmar hyrde du den?",
            en: "Renting a kayak at a lake costs a fixed starting fee of {b} kr. After that, the rental costs {a} kr per hour. If you paid a total of {total} kr when you returned the kayak, how many hours did you rent it?"
        },
        {
            sv: "Ett tryckeri tar en fast startavgift på {b} kr för att ställa in maskinen. Sedan kostar varje affisch som trycks {a} kr. Om hela räkningen för klassens affischer landade på {total} kr, hur många affischer trycktes?",
            en: "A printing shop charges a fixed setup fee of {b} kr to configure the machine. After that, each poster printed costs {a} kr. If the total bill for the class posters landed at {total} kr, how many posters were printed?"
        },
        {
            sv: "När du beställer en pizza kostar den {b} kr i grundpris för tomatsås och ost. Om du vill lägga till extra ingredienser kostar varje pålägg {a} kr. Om din specialpizza slutade på {total} kr, hur många extra pålägg valde du?",
            en: "When ordering a pizza, it costs a baseline price of {b} kr for tomato sauce and cheese. If you want to add extra ingredients, each topping costs {a} kr. If your custom pizza ended up costing {total} kr, how many extra toppings did you choose?"
        },
        {
            sv: "Att slå bollar i en basebollbur kostar {b} kr för att låna klubba och hjälm. Sedan kostar varje pollett till bollmaskinen {a} kr. Om du betalade totalt {total} kr i kassan, hur många polletter köpte du?",
            en: "Hitting balls at a batting cage costs {b} kr to borrow a bat and helmet. After that, each token for the ball machine costs {a} kr. If you paid a total of {total} kr at the counter, how many tokens did you buy?"
        },
        {
            sv: "Skolans filmklubb ordnar en filmkväll där medlemskapet kostar {b} kr i engångsavgift. Sedan kostar varje popcornbägare {a} kr. Om en grupp kompisar betalade totalt {total} kr ihop, hur många popcornbägare köpte de?",
            en: "The school cinema club organizes a movie night where membership costs a one-time fee of {b} kr. After that, each popcorn bucket costs {a} kr. If a group of friends paid a total of {total} kr together, how many popcorn buckets did they buy?"
        },
        {
            sv: "Att besöka en trampolinpark kostar {b} kr för greppstrumpor som man får behålla. Sedan betalar man {a} kr för varje halvtimme man hoppar. Om din slutnota blev {total} kr, hur många halvtimmar hoppade du?",
            en: "Visiting a trampoline park costs {b} kr for grip socks that you keep. After that, you pay {a} kr for each half-hour jump block. If your final bill comes to {total} kr, how many half-hours did you jump?"
        },
        {
            sv: "En konststudio har en målarworkshop där materialet och duken kostar {b} kr. Om du behöver extra tuber med färg kostar varje tub {a} kr. Om du betalade totalt {total} kr, hur många extra tuber köpte du?",
            en: "An art studio has a painting workshop where the canvas and base materials cost {b} kr. If you need extra tubes of paint, each tube costs {a} kr. If you paid a total of {total} kr, how many extra tubes did you buy?"
        },
        {
            sv: "Att hyra ett värdeskåp på ett badhus kostar {b} kr i registreringsavgift. Efter det kostar skåpet {a} kr per dag som det används. Om den totala kostnaden blev {total} kr, hur många dagar användes skåpet?",
            en: "Renting a locker for valuables at a water park costs a registration fee of {b} kr. After that, the locker costs {a} kr per day of usage. If the total cost turned out to be {total} kr, how many days was the locker used?"
        },
        {
            sv: "Du beställer egna pins till din ryggsäck. Företaget tar {b} kr för designmallen, och sedan kostar varje tillverkad pin {a} kr. Om hela beställningen kostade {total} kr, hur många pins köpte du?",
            en: "You order custom pins for your backpack. The company charges {b} kr to set up the design template, and then each manufactured pin costs {a} kr. If the entire order cost {total} kr, how many pins did you buy?"
        },
        {
            sv: "Att åka elsparkcykel kostar {b} kr för att låsa upp den, och sedan kostar åkturen {a} kr för varje minut du kör. Om din resa avslutades och kostade totalt {total} kr, hur många minuter körde du?",
            en: "Renting an electric scooter costs {b} kr to unlock it. After that, the ride costs {a} kr for every minute you ride. If your trip finished and cost a total of {total} kr, how many minutes did you ride?"
        }
    ]
};