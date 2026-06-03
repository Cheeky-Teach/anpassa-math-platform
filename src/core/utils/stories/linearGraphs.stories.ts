// src/core/utils/stories/linearGraphs.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const LINEAR_GRAPHS_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 📈 1. GRAPH INTERCEPT M (15 Stories) - Parameters: {m}, {k}
    // =========================================================================
    graph_intercept_m: [
        { sv: "Grafen visar ditt saldo på ett spelkonto över tid. Vad var ditt startbelopp (m-värdet) enligt y-axeln?", en: "The graph tracks your game account balance over time. What was your starting amount (m-value) according to the y-axis?" },
        { sv: "Du mäter temperaturen i ett experiment. Vilken starttemperatur (m-värde) visar grafen där tiden är noll?", en: "You measure temperature in a lab experiment. What starting temperature (m-value) does the graph show at time zero?" },
        { sv: "Grafen visar höjden för en dykar-app under vattenytan. Vilket startmått på y-axeln visar m-värdet?", en: "The graph shows a diving app's elevation relative to sea level. What starting depth on the y-axis represents the m-value?" },
        { sv: "Ett gäng följer sina rankingpoäng på en leaderboard. Vad mäter m-värdet i början av tidsaxeln?", en: "A team tracks their rank points on a leaderboard. What does the m-value measure at the start of the timeline?" },
        { sv: "Grafen visar kostnaden för att hyra en elsparkcykel. Vilken fast startavgift (m-värde) läser du av på y-axeln?", en: "The graph shows the cost of renting an electric scooter. What fixed starting fee (m-value) do you read on the y-axis?" },
        { sv: "Du laddar din mobil. Grafen visar batteriprocenten från start. Vilken procent (m-värde) hade mobilen när laddningen började?", en: "You charge your phone. The graph shows battery percentage from the start. What percent (m-value) did it have when charging began?" },
        { sv: "Grafen visar värdet på ett presentkort som används i en onlinebutik. Vilket startvärde har presentkortet på y-axeln?", en: "The graph tracks the value of a gift card used in an online store. What starting value does the card have on the y-axis?" },
        { sv: "En tank fylls med vatten och vattennivån mäts i cm. Vilket startdjup (m-värde) visar linjen vid tidpunkten noll?", en: "A tank is being filled with water, and the level is measured in cm. What starting depth (m-value) does the line show at time zero?" },
        { sv: "Grafen visar skadan ditt svärd gör per uppgradering. Vilken grundskada (m-värde) har svärdet innan några upgrades?", en: "The graph shows your sword's damage per upgrade. What base damage (m-value) does it have before any upgrades?" },
        { sv: "Du kollar priset för en pizzaleverans baserat på antal km bort. Vilken fast utkörningsavgift (m-värde) visar grafen?", en: "You check pizza delivery prices based on distance in km. What fixed delivery fee (m-value) does the graph show?" },
        { sv: "Grafen visar din sparbank över några veckor. Vilken summa (m-värde) hade du på kontot allra första veckan?", en: "The graph tracks your savings over a few weeks. What sum (m-value) did you have in the account the very first week?" },
        { sv: "Mängden lagringsutrymme på en server minskar när du laddar upp filer. Vilket startutrymme (m-värde) visas på y-axeln?", en: "The storage space on a server decreases as you upload files. What starting space (m-value) is shown on the y-axis?" },
        { sv: "Grafen visar din höjd i meter när du åker en hiss uppåt eller nedåt. På vilken våningshöjd (m-värde) klev du in i hissen?", en: "The graph shows your height in meters riding an elevator up or down. At what initial height (m-value) did you enter the elevator?" },
        { sv: "Ett Discord-community följer sitt medlemsantal över tid. Hur många medlemmar (m-värde) hade servern vid start?", en: "A Discord community tracks its member count over time. How many members (m-value) did the server have at launch?" },
        { sv: "Grafen visar vikten på en ryggsäck baserat på antal tunga böcker du packar. Vad väger tomma väskan (m-värdet)?", en: "The graph tracks a backpack's weight based on the number of heavy books packed. What does the empty bag weigh (m-value)?" }
    ],

    // =========================================================================
    // 📈 2. GRAPH SLOPE POS (15 Stories) - Parameters: {dy}, {dx}, {kDisplay}
    // =========================================================================
    graph_slope_pos: [
        { sv: "Grafen visar priset för en medlemsapp. Hur mycket ökar kostnaden per månad? Hitta linjens k-värde.", en: "The graph shows the price of a subscription app. How much does the cost increase per month? Find the k-value." },
        { sv: "Du tjänar pengar på ett extrajobb. Bestäm din timlön (k-värdet) genom att läsa av linjens lutning.", en: "You earn money from a part-time job. Determine your hourly wage (k-value) by reading the slope of the line." },
        { sv: "Grafen visar hur mycket din mobil laddas per minut. Med hur många procent ökar laddningen per minut (k-värdet)?", en: "The graph tracks your phone charging over minutes. By how many percent does it increase per minute (k-value)?" },
        { sv: "Du laddar ner ett stort spel till din konsol. Bestäm nedladdningshastigheten i MB/s (k-värdet) utifrån grafen.", en: "You download a large game to your console. Determine the download speed in MB/s (k-value) from the graph." },
        { sv: "Grafen visar poäng du samlar in per match i en turnering. Hur många poäng får du i snitt per match (k-värde)?", en: "The graph shows points accumulated per match in a tournament. How many points do you average per match (k-value)?" },
        { sv: "En prenumerationsbox skickar hem snacks varje månad. Bestäm kostnaden per box (k-värdet) utifrån linjens lutning.", en: "A subscription box ships snacks to your house each month. Determine the cost per box (k-value) from the slope." },
        { sv: "Grafen visar hur mycket pengar du sparar varje vecka. Hur mycket sätter du in i spargrisen per vecka (k-värde)?", en: "The graph tracks the money you save each week. How much do you deposit in your piggy bank per week (k-value)?" },
        { sv: "Ett träningsprogram ökar antalet pushups du ska göra per dag. Hur många fler reps läggs till per dag (k-värde)?", en: "A workout routine increases the pushups you must do daily. How many reps are added per day (k-value)?" },
        { sv: "Grafen visar totalvikten när du köper godis i lösvikt. Vad är priset i kr per hektogram (k-värdet) enligt linjen?", en: "The graph tracks total cost when buying candy in bulk. What is the price in kr per hectogram (k-value) according to the line?" },
        { sv: "Du kör en elscooter och ser hur sträckan ökar över tid. Vilken är din hastighet i meter per sekund (k-värdet)?", en: "You ride an electric scooter and see distance increase over time. What is your speed in meters per second (k-value)?" },
        { sv: "Grafen visar hur en bils bränsletank fylls på vid en mack. Hur många liter pumpas i sekunden (k-värdet)?", en: "The graph shows a car's fuel tank being filled at a station. How many liters are pumped per second (k-value)?" },
        { sv: "Antalet visningar på en video stiger linjärt. Bestäm hur många nya visningar klippet får per timme (k-värdet).", en: "The views on a video increase linearly. Determine how many new views the clip gets per hour (k-value)." },
        { sv: "Grafen visar priset för ett antal biobiljetter. Vad kostar en enskild biobiljett (k-värdet) enligt lutningen?", en: "The graph tracks the cost for a number of movie tickets. What does a single ticket cost (k-value) according to the slope?" },
        { sv: "Ett bageri bakar pizzabottnar i ett jämt tempo. Hur många pizzabottnar görs det per timme (k-värdet) i grafen?", en: "A bakery makes pizza crusts at a steady pace. How many crusts are made per hour (k-value) in the graph?" },
        { sv: "Grafen visar hur din klan ökar i medlemsantal under veckorna. Hur många nya spelare går med per vecka (k-värde)?", en: "The graph tracks your clan's member growth over weeks. How many new players join per week (k-value)?" }
    ],

    // =========================================================================
    // 📈 3. GRAPH SLOPE NEG (15 Stories) - Parameters: {dy}, {dx}, {kDisplay}
    // =========================================================================
    graph_slope_neg: [
        { sv: "Grafen visar hur batteriet i din mobil laddas ur. Med hur många procent minskar batteriet per timme (k-värdet)?", en: "The graph tracks your phone battery draining. By how many percent does the battery decrease per hour (k-value)?" },
        { sv: "Du använder ett presentkort när du fikar. Bestäm hur mycket saldo som dras per fika (k-värdet) utifrån grafen.", en: "You use a gift card when getting snacks. Determine how much balance is deducted per visit (k-value) from the graph." },
        { sv: "Grafen visar hur värdet på en gamingdator sjunker med månaderna. Med hur mycket minskar värdet per månad (k-värde)?", en: "The graph shows how a gaming PC's value drops over months. By how much does the value decrease per month (k-value)?" },
        { sv: "Ett gäng cyklar nerför ett högt berg. Bestäm hur många höjdmeter de tappar per minut (k-värdet) enligt linjen.", en: "A group cycles down a high mountain. Determine how many meters of altitude they lose per minute (k-value) according to the line." },
        { sv: "Grafen visar hur mycket läsk som är kvar i en dispenser under en fest. Hur många liter dricks upp per timme (k-värde)?", en: "The graph tracks how much soda is left in a dispenser during a party. How many liters are consumed per hour (k-value)?" },
        { sv: "Du betalar av en avbetalning på en ny keps varje vecka. Med hur många kronor minskar skulden per vecka (k-värde)?", en: "You pay off an installment on a new cap each week. By how many kronor does the debt decrease per week (k-value)?" },
        { sv: "Grafen visar temperaturen på en dricka som ställts i frysen. Med hur många grader sjunker den per minut (k-värde)?", en: "The graph tracks the temperature of a drink placed in the freezer. By how many degrees does it drop per minute (k-value)?" },
        { sv: "Ett flygplan sjunker inför landning. Bestäm linjens k-värde för att hitta hur många meter planet tappar i höjd per sekund.", en: "An airplane descends for landing. Find the line's k-value to determine how many meters the plane loses in altitude per second." },
        { sv: "Grafen visar ditt saldo på ett resekort när du åker tunnelbana. Hur mycket kostar en enskild resa (k-värdet)?", en: "The graph tracks your travel card balance when riding the subway. How much does a single trip cost (k-value)?" },
        { sv: "Mängden lagrad data på ett minneskort raderas i ett jämnt tempo. Hur många GB tas bort per sekund (k-värdet)?", en: "The stored data on a memory card is erased at a steady pace. How many GB are deleted per second (k-value)?" },
        { sv: "Grafen visar hur vattennivån i en pool sjunker när den töms på vatten. Hur många cm sjunker nivån per timme (k-värde)?", en: "The graph shows the water level in a pool dropping as it is drained. How many cm does the level drop per hour (k-value)?" },
        { sv: "Du äter ur en stor påse chips under en stream. Bestäm hur många gram chips som försvinner per minut (k-värdet).", en: "You eat from a large bag of chips during a stream. Determine how many grams of chips disappear per minute (k-value)." },
        { sv: "Grafen visar räckvidden på en elbil under en långkörning. Hur många km kortare blir räckvidden per körd mil (k-värde)?", en: "The graph tracks an EV's range during a long drive. How many km shorter does the range get per mile driven (k-value)?" },
        { sv: "Ett ljus brinner ner i ett rum. Bestäm hur många centimeter av ljusets längd som smälter bort per timme (k-värdet).", en: "A candle burns down in a room. Determine how many centimeters of the candle's length melt away per hour (k-value)." },
        { sv: "Grafen visar antalet osålda biljetter till en skolfest under dagarna. Hur många biljetter säljs per dag (k-värde)?", en: "The graph tracks unsold tickets to a school dance over the days. How many tickets are sold per day (k-value)?" }
    ],

    // =========================================================================
    // 📈 4. GRAPH EQUATION (15 Stories) - Parameters: {k}, {m}, {eq}
    // =========================================================================
    graph_equation: [
        { sv: "Skriv den fullständiga formeln på formen y = kx + m som beskriver kostnaden för en streaming-app utifrån grafen.", en: "Write the complete formula in the form y = kx + m that describes the cost of a streaming app from the graph." },
        { sv: "Grafen visar din totala besparing i kronor över veckorna. Bestäm linjens ekvation på formen y = kx + m.", en: "The graph tracks your total savings in kronor over weeks. Determine the equation of the line in the form y = kx + m." },
        { sv: "Du hyr en elscooter med en startavgift och minutkostnad. Vilken blir linjens ekvation y = kx + m utifrån grafen?", en: "You rent an electric scooter with a startup fee and minute cost. What is the line's equation y = kx + m based on the graph?" },
        { sv: "Grafen visar hur mycket din telefon laddas över tid. Skriv linjens ekvation på formen y = kx + m.", en: "The graph tracks how much your phone charges over time. Write the equation of the line in the form y = kx + m." },
        { sv: "Du kollar en graf över din timlön plus en fast bonus. Bestäm linjens ekvation på formen y = kx + m.", en: "You check a graph of your hourly wage plus a fixed bonus. Determine the equation of the line in the form y = kx + m." },
        { sv: "Grafen visar temperaturen i Celsius under ett experiment. Bestäm linjens fullständiga ekvation y = kx + m.", en: "The graph shows the temperature in Celsius during an experiment. Determine the complete equation y = kx + m of the line." },
        { sv: "Du kollar saldot på ett fika-kort som minskar för varje köp. Skriv linjens ekvation på formen y = kx + m.", en: "You check the balance on a snack card that decreases with each purchase. Write the equation of the line in the form y = kx + m." },
        { sv: "Grafen visar höjden för en hiss som rör sig i ett hus. Skriv linjens ekvation på formen y = kx + m utifrån grafen.", en: "The graph tracks the height of an elevator moving in a building. Write the equation of the line in the form y = kx + m from the graph." },
        { sv: "Du har köpt ett antal biobiljetter online med en fast bokningsavgift. Bestäm linjens ekvation på formen y = kx + m.", en: "You bought a number of movie tickets online with a fixed booking fee. Determine the equation of the line in the form y = kx + m." },
        { sv: "Grafen visar medlemsantalet på din nya sociala media grupp. Bestäm linjens fullständiga ekvation på formen y = kx + m.", en: "The graph tracks the member count on your new social media group. Determine the complete equation of the line in the form y = kx + m." },
        { sv: "Ett onlinespel delar ut poäng per avklarat uppdrag plus startpoäng. Skriv linjens ekvation y = kx + m utifrån grafen.", en: "An online game awards points per completed quest plus starting points. Write the line's equation y = kx + m from the graph." },
        { sv: "Grafen visar vikten på en fraktlåda baserat på antal t-shirts du lägger i. Bestäm linjens ekvation y = kx + m.", en: "The graph tracks a shipping box's weight based on the number of t-shirts packed. Determine the line's equation y = kx + m." },
        { sv: "Du mäter hur mycket vatten som är kvar i en flaska under en träning. Skriv linjens ekvation på formen y = kx + m.", en: "You track how much water is left in a bottle during a workout. Write the equation of the line in the form y = kx + m." },
        { sv: "Grafen visar räckvidden på en elscooter baserat på hastigheten. Bestäm linjens ekvation på formen y = kx + m.", en: "The graph tracks an electric scooter's range based on speed. Determine the equation of the line in the form y = kx + m." },
        { sv: "En foodtruck säljer hamburgare och följer sin vinst. Bestäm linjens ekvation på formen y = kx + m utifrån grafen.", en: "A food truck sells burgers and tracks its profit. Determine the equation of the line in the form y = kx + m from the graph." }
    ]
};