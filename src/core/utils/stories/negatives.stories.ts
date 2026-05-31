// src/core/utils/stories/negatives.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const NEGATIVE_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. NEG ADD SUB CHAIN (Requires placeholders: {valA}, {valB}, {valC}, {valD})
    // =========================================================================
    neg_add_sub_chain: [
        {
            sv: "Du startar med {valA} poäng i ett spel. Du lyckas få {valB} poäng, förlorar sedan {valC} poäng och får till slut {valD} poäng till. Vad blir din slutgiltiga poäng?",
            en: "You start with {valA} points in a game. You manage to gain {valB} points, then lose {valC} points, and finally get another {valD} points. What is your final score?"
        },
        {
            sv: "Temperaturen i Abisko var {valA} °C på morgonen. Under dagen steg den med {valB} °C, sjönk sedan med {valC} °C och steg till sist med {valD} °C. Vad var temperaturen då?",
            en: "The temperature in Abisko was {valA} °C in the morning. During the day it rose by {valB} °C, then dropped by {valC} °C, and finally rose by {valD} °C. What was the temperature then?"
        },
        {
            sv: "En hiss startar på våning {valA}. Den åker upp {valB} våningar, ner {valC} våningar och åker sedan upp ytterligare {valD} våningar. Vilken våning står hissen på nu?",
            en: "An elevator starts on floor {valA}. It goes up {valB} floors, down {valC} floors, and then goes up another {valD} floors. What floor is the elevator on now?"
        },
        {
            sv: "En drönare flyger på {valA} meters höjd över marken. Den stiger {valB} meter, sjunker {valC} meter och flyger sedan upp {valD} meter till. Vilken höjd flyger den på nu?",
            en: "A drone flies at an altitude of {valA} meters above the ground. It climbs {valB} meters, drops {valC} meters, and then flies up another {valD} meters. What altitude is it flying at now?"
        },
        {
            sv: "Du har {valA} kr på ditt konto. Du swishar iväg {valB} kr, får tillbaka {valC} kr från en kompis och köper sedan snacks för {valD} kr. Hur mycket har du kvar på kontot?",
            en: "You have {valA} kr in your account. You swish {valB} kr, get {valC} kr back from a friend, and then buy snacks for {valD} kr. How much do you have left in your account?"
        },
        {
            sv: "En u-båt ligger på {valA} meters djup under havsytan. Den stiger {valB} meter, dyker ner {valC} meter och stiger sedan {valD} meter igen. Vilket djup ligger u-båten på nu?",
            en: "A submarine is at a depth of {valA} meters below sea level. It ascends {valB} meters, dives down {valC} meters, and then ascends {valD} meters again. What depth is the submarine at now?"
        },
        {
            sv: "Ett nystartat UF-företag har {valA} kr i kassan. De tjänar {valB} kr på sin första försäljning, betalar {valC} kr för material och får ett bidrag på {valD} kr. Hur mycket har de i kassan nu?",
            en: "A new student company has {valA} kr in its cash box. They earn {valB} kr on their first sale, pay {valC} kr for materials, and receive a grant of {valD} kr. How much cash do they have now?"
        },
        {
            sv: "När du spelar ett mobilspel ligger din karaktär på nivån {valA} i rankning. Du klättrar {valB} steg, halkar ner {valC} steg och klättrar sedan {valD} steg till. Vilken rankning har du nu?",
            en: "When playing a mobile game, your character is at rank level {valA}. You climb {valB} steps, slip down {valC} steps, and then climb another {valD} steps. What rank do you have now?"
        },
        {
            sv: "Vattennivån i en pool låg på {valA} cm från kanten. Efter ett kraftigt regn steg nivån med {valB} cm, sedan avdunstade {valC} cm i solen och till sist fyllde man på med {valD} cm. Vad är nivån nu?",
            en: "The water level in a pool was {valA} cm from the edge. After heavy rain the level rose by {valB} cm, then {valC} cm evaporated in the sun, and finally {valD} cm was added. What is the level now?"
        },
        {
            sv: "Leo spelar minigolf. På första hålet ligger han på {valA} slag jämfört med banans par. På nästa hål får han +{valB} slag, sen -{valC} slag och till sist +{valD} slag. Vad är hans totala resultat?",
            en: "Leo is playing minigolf. On the first hole he is at {valA} shots compared to par. On the next holes he gets +{valB} shots, then -{valC} shots, and finally +{valD} shots. What is his total score?"
        },
        {
            sv: "En klättervägg har markeringar i höjdled. Du startar på {valA} meter, klättrar upp {valB} meter, firar ner dig {valC} meter och tar ett sista kliv upp på {valD} meter. Var är du nu?",
            en: "A climbing wall has height markings. You start at {valA} meters, climb up {valB} meters, rappel down {valC} meters, and take a final step up of {valD} meters. Where are you now?"
        },
        {
            sv: "Ett TikTok-konto hade {valA} följare i måndags. På tisdagen ökade det med {valB} följare, på onsdagen tappade kontot {valC} följare och på torsdagen ökade det med {valD} till. Hur många följare har kontot nu?",
            en: "A TikTok account had {valA} followers on Monday. On Tuesday it increased by {valB} followers, on Wednesday it lost {valC} followers, and on Thursday it increased by {valD} more. How many followers does it have now?"
        },
        {
            sv: "Temperaturen i ett växthus startar på {valA} °C. När fläkten startar sjunker den med {valB} °C, när solen går i moln sjunker den med {valC} °C till och när värmen slås på stiger den med {valD} °C. Vad är temperaturen nu?",
            en: "The temperature in a greenhouse starts at {valA} °C. When the fan starts it drops by {valB} °C, when the sun goes behind a cloud it drops another {valC} °C, and when the heat turns on it rises by {valD} °C. What is it now?"
        },
        {
            sv: "Du har lagt till {valA} låtar på en delad spellista. Din kompis lägger till {valB} låtar, raderar {valC} låtar som inte passade och lägger till {valD} låtar till. Hur många låtar har spellistan nu?",
            en: "You added {valA} songs to a shared playlist. Your friend adds {valB} songs, deletes {valC} songs that didn't fit, and adds another {valD} songs. How many songs does the playlist have now?"
        },
        {
            sv: "Ett gäng kompisar har en gemensam burk med speltokens. De startar med {valA} stycken. De vinner {valB} stycken, förlorar {valC} stycken i en match och köper sedan till {valD} stycken. Hur många tokens har de nu?",
            en: "A group of friends has a shared jar of gaming tokens. They start with {valA}. They win {valB}, lose {valC} in a match, and then purchase {valD} more. How many tokens do they have now?"
        }
    ],

    // =========================================================================
    // 🎯 2. NEG DOUBLE MINUS (Requires placeholders: {valA}, {valB})
    // =========================================================================
    neg_double_minus: [
        {
            sv: "Temperaturen i en frys är {valA} °C. Du vrider på reglaget så att temperaturen höjs med {valB} °C. Vad visar frysens display nu?",
            en: "The temperature in a freezer is {valA} °C. You turn the dial so the temperature is raised by {valB} °C. What does the freezer display show now?"
        },
        {
            sv: "Du spelar ett onlinespel och ligger på {valA} poäng. Efter en granskning raderar systemet bort en gammal straffavgift på minus {valB} poäng. Vad blir din nya poäng?",
            en: "You are playing an online game and are at {valA} points. After a review, the system erases a previous penalty of minus {valB} points. What is your new score?"
        },
        {
            sv: "En digital höjdmätare på en dykar klocka visar {valA} meter under havsytan. Du tar bort ett felaktigt djupavdrag på minus {valB} meter. Vilket värde visas på klockan nu?",
            en: "A digital altimeter on a diving watch shows {valA} meters below sea level. You remove an incorrect depth deduction of minus {valB} meters. What value is shown on the watch now?"
        },
        {
            sv: "Ett startvärde i ett matteprogram är inställt på {valA}. Du ska nu subtrahera det negativa talet minus {valB} från startvärdet. Vilket svar får du?",
            en: "A starting value in a math app is set to {valA}. You are now going to subtract the negative number minus {valB} from the starting value. What answer do you get?"
        },
        {
            sv: "Nils har ett saldo på {valA} kr på sitt spelkonto. Kundtjänst tar bort en felaktig minuspost på {valB} kr från kontot. Vad blir hans nya saldo?",
            en: "Nils has a balance of {valA} kr on his gaming account. Customer service removes an incorrect negative charge of {valB} kr from the account. What is his new balance?"
        },
        {
            sv: "I en fiktiv temperaturutmaning startar en mätare på {valA} grader. Du ska minska detta värde med minus {valB} grader. Vad stannar mätaren på?",
            en: "In a fictional temperature challenge, a gauge starts at {valA} degrees. You need to decrease this value by minus {valB} degrees. What does the gauge stop at?"
        },
        {
            sv: "Ett fotbollslag har {valA} mål i målskillnad. Förbundet inser att de har räknat fel och tar bort ett gammal avdrag på minus {valB} mål. Vad blir lagets nya målskillnad?",
            en: "A soccer team has a goal difference of {valA}. The league realizes a mistake and removes a previous deduction of minus {valB} goals. What is the team's new goal difference?"
        },
        {
            sv: "Du har hamnat på minus {valA} kr på ditt skolkonto efter att ha lånat pengar. Skolan bestämmer sig för att efterskänka en skuld på {valB} kr. Vad blir din nya balans?",
            en: "You ended up at minus {valA} kr on your school account after borrowing money. The school decides to forgive a debt of {valB} kr. What is your new balance?"
        },
        {
            sv: "Ett rymdspel mäter din position till {valA} km från baslinjen. Du rensar bort en negativ kursavvikelse på minus {valB} km. Vilket avstånd visas på skärmen nu?",
            en: "A space game measures your position as {valA} km from the baseline. You clear a negative course deviation of minus {valB} km. What distance is shown on the screen now?"
        },
        {
            sv: "En kemisk lösning håller temperaturen {valA} °C i ett labb. Forskaren programmerar om maskinen så att den drar av en köldfaktor på minus {valB} °C. Vad blir den nya temperaturen?",
            en: "A chemical solution maintains a temperature of {valA} °C in a lab. The scientist reprograms the machine to subtract a cold factor of minus {valB} °C. What is the new temperature?"
        },
        {
            sv: "En gamer har {valA} poäng på en global topplista. Spelets moderatorer tar bort ett felaktigt minusavdrag på {valB} poäng. Vad blir spelarens nya poängsumma?",
            en: "A gamer has {valA} points on a global leaderboard. The game's moderators remove an incorrect negative deduction of {valB} points. What is the player's new score?"
        },
        {
            sv: "Vattennivån i en testtank är {valA} cm under nollstrecket. Teknikern nollställer en felmarginal på minus {valB} cm. Vilken nivå visar tanken nu?",
            en: "The water level in a test tank is {valA} cm below the zero mark. The technician resets an error margin of minus {valB} cm. What level does the tank show now?"
        },
        {
            sv: "Du har skrivit ett skript som ger startvärdet {valA}. Skriptet ska sedan göra en beräkning där det drar ifrån det negativa värdet minus {valB}. Vad returnerar skriptet?",
            en: "You wrote a script that gives a starting value of {valA}. The script will then perform a calculation where it subtracts the negative value minus {valB}. What does it return?"
        },
        {
            sv: "Ett lags fairplay-konto står på {valA} poäng efter några varningar. Domaren väljer att stryka en tidigare rapporterad straffpoäng på minus {valB} poäng. Vad blir lagets nya poäng?",
            en: "A team's fair-play account stands at {valA} points after a few warnings. The referee chooses to cancel a previously reported penalty of minus {valB} points. What is their new score?"
        },
        {
            sv: "Ett batteritest startar på laddningsvärdet {valA}. Programmet rensar en kalibreringsförlust på minus {valB}. Vilket värde registrerar testet efter rensningen?",
            en: "A battery test starts at a charge value of {valA}. The program clears a calibration loss of minus {valB}. What value does the test register after clearing?"
        }
    ],

    // =========================================================================
    // 🎯 3. NEG MULTIPLICATION (Requires placeholders: {valA}, {valB})
    // =========================================================================
    neg_multiplication: [
        {
            sv: "Din poäng i ett arkadspel ändras med {valA} poäng varje spelrunda. Vad är den totala förändringen efter {valB} spelrundor?",
            en: "Your score in an arcade game changes by {valA} points each round. What is the total change after {valB} rounds?"
        },
        {
            sv: "Temperaturen i ett frysrum sjunker regelbundet och ändras med {valA} °C varje timme. Vad är den totala temperaturändringen efter {valB} timmar?",
            en: "The temperature in a walk-in freezer drops regularly and changes by {valA} °C every hour. What is the total temperature change after {valB} hours?"
        },
        {
            sv: "En liten forskningsdrönare sjunker neråt så att höjden ändras med {valA} meter varje minut. Vilken blir den totala höjdförändringen efter {valB} minuter?",
            en: "A small research drone descends so that its altitude changes by {valA} meters every minute. What will the total altitude change be after {valB} minutes?"
        },
        {
            sv: "Ett gammalt mobilbatteri laddas ur snabbt och förlorar {valA}% i laddning varje timme. Hur mycket har batterinivån ändrats totalt efter {valB} timmar?",
            en: "An old mobile battery discharges quickly and loses {valA}% of charge every hour. How much has the battery level changed in total after {valB} hours?"
        },
        {
            sv: "Ett e-sportlag får ett straffavdrag på {valA} poäng för varje regelbrott de gör under en turnering. Hur mycket ändras lagets poäng totalt efter {valB} regelbrott?",
            en: "An e-sports team gets a penalty deduction of {valA} points for each rule violation they commit during a tournament. How much does their score change in total after {valB} violations?"
        },
        {
            sv: "En u-båt håller på att docka och ändrar sitt djup med {valA} meter varje minut. Vilken blir den totala förändringen efter {valB} minuters dockning?",
            en: "A submarine is docking and changes its depth by {valA} meters every minute. What will the total change be after {valB} minutes of docking?"
        },
        {
            sv: "Ett gäng kompisar hyr en server ihop, vilket ändrar ditt saldo på kontot med {valA} kr varje månad. Vad är den totala förändringen på ditt konto efter {valB} månader?",
            en: "A group of friends rents a server together, which changes your account balance by {valA} kr each month. What is the total change on your account after {valB} months?"
        },
        {
            sv: "Ett techbolag förlorar pengar på en gammal app, vilket ändrar deras resultat med {valA} miljoner kr per kvartal. Vad är den totala förändringen efter {valB} kvartal?",
            en: "A tech company is losing money on an old app, changing their financial result by {valA} million kr per quarter. What is the total change after {valB} quarters?"
        },
        {
            sv: "Du har skapat ett spel där deltagarna tappar {valA} sekunder i tid för varje gång de nuddar ett hinder. Hur mycket ändras tiden totalt om en spelare krockar {valB} gånger?",
            en: "You created a game where players lose {valA} seconds of time every time they touch an obstacle. How much does the time change in total if a player crashes {valB} times?"
        },
        {
            sv: "Vattennivån i en sjö sjunker under en torka och ändras med {valA} cm varje dygn. Vilken blir den totala nivåförändringen efter {valB} dygn?",
            en: "The water level in a lake drops during a drought and changes by {valA} cm each day. What will the total level change be after {valB} days?"
        },
        {
            sv: "Ett streamingkonto tappar medlemmar i jämn takt, vilket ändrar antalet prenumeranter med {valA} personer varje dag. Vad är den totala förändringen efter {valB} dagar?",
            en: "A streaming account is losing members at a steady rate, changing the subscriber count by {valA} people each day. What is the total change after {valB} days?"
        },
        {
            sv: "En kylväska tappar kyla när den står i solen. Temperaturen inuti väskan ändras med {valA} °C per minut. Vad är den totala ändringen efter {valB} minuter?",
            en: "A cooler bag loses cold when standing in the sun. The temperature inside the bag changes by {valA} °C per minute. What is the total change after {valB} minutes?"
        },
        {
            sv: "Ett instagramkonto råkar ut för en bugg som gör att antalet följare ändras med {valA} personer per timme. Vad blir den totala förändringen efter {valB} timmar?",
            en: "An Instagram account suffers from a bug that causes the follower count to change by {valA} people per hour. What will the total change be after {valB} hours?"
        },
        {
            sv: "En automatisk maskin i en fabrik slits ut och ändrar sin produktionstakt med {valA} enheter per vecka. Hur mycket har takten ändrats totalt efter {valB} veckor?",
            en: "An automatic machine in a factory wears down and changes its production rate by {valA} units per week. How much has the rate changed in total after {valB} weeks?"
        },
        {
            sv: "Du prenumererar på ett månadsmagasin via mobilen, vilket ändrar dina sparpengar med {valA} kr varje månad. Vad är den totala förändringen efter {valB} månader?",
            en: "You subscribe to a monthly mobile magazine, which changes your savings by {valA} kr each month. What is the total change after {valB} months?"
        }
    ],

    // =========================================================================
    // 🎯 4. NEG MULT CHAIN (Requires placeholders: {valA}, {valB}, {valC})
    // =========================================================================
    neg_mult_chain: [
        {
            sv: "Ta startvärdet {valA} i en programmerings loop. Multiplicera det med {valB} och multiplicera sedan resultatet med {valC}. Vad blir det slutgiltiga värdet?",
            en: "Take the starting value {valA} in a programming loop. Multiply it by {valB} and then multiply the result by {valC}. What is the final value?"
        },
        {
            sv: "Ett tal i en matematisk algoritm startar på {valA}. Det multipliceras först med faktorn {valB} och sedan med faktorn {valC}. Vilket tal får du då?",
            en: "A number in a mathematical algorithm starts at {valA}. It is multiplied first by the factor {valB} and then by the factor {valC}. What number do you get then?"
        },
        {
            sv: "I ett grafikprogram skalas en vektor utifrån startvärdet {valA}. Programmet multiplicerar värdet med {valB} och sedan med {valC}. Vad blir slutresultatet?",
            en: "In a graphics program, a vector is scaled based on the starting value {valA}. The program multiplies the value by {valB} and then by {valC}. What is the final result?"
        },
        {
            sv: "En simulerad temperatur mäter startvärdet {valA} grader. Under en trestegsberäkning multipliceras det med {valB} och därefter med {valC}. Vad stannar simulationen på?",
            en: "A simulated temperature measures a starting value of {valA} degrees. During a three-step calculation, it is multiplied by {valB} and then by {valC}. What does the simulation stop at?"
        },
        {
            sv: "Ett konto i ett strategispel har balansfaktorn {valA}. Du passerar två portaler som multiplicerar faktorn med {valB} respektive {valC}. Vad blir din nya balansfaktor?",
            en: "An account in a strategy game has a balance factor of {valA}. You pass through two portals that multiply the factor by {valB} and {valC} respectively. What is your new balance factor?"
        },
        {
            sv: "Ta värdet {valA} på skärmen. Kör en multiplikationskedja där du först gångrar med {valB} och sedan gångrar resultatet med {valC}. Vad blir svaret?",
            en: "Take the value {valA} on the screen. Run a multiplication chain where you first multiply by {valB} and then multiply the result by {valC}. What is the answer?"
        },
        {
            sv: "En scriptvariabel är satt till {valA}. Genomfölj två automatiska beräkningar där variabeln multipliceras med {valB} och sedan med {valC}. Vad blir slutvärdet?",
            en: "A script variable is set to {valA}. Follow two automatic calculations where the variable is multiplied by {valB} and then by {valC}. What is the final value?"
        },
        {
            sv: "Ett poängsystem i en spelkod utgår från {valA}. Om en spelare gör en Combo multipliceras poängen med {valB} och sedan med {valC}. Vad blir den uppdaterade poängen?",
            en: "A scoring system in a game code starts at {valA}. If a player hits a Combo, the score is multiplied by {valB} and then by {valC}. What is the updated score?"
        },
        {
            sv: "En mätpunkt i ett fysiktest visar {valA}. Värdet passerar två digitala filter som multiplicerar det med {valB} och sedan med {valC}. Vad registrerar datorn till slut?",
            en: "A measurement point in a physics test shows {valA}. The value passes through two digital filters that multiply it by {valB} and then by {valC}. What does the computer register in the end?"
        },
        {
            sv: "Ett starttal i en talföljdsgenerator är inställt på {valA}. Generatorn är programmerad att multiplicera talet med {valB} och sedan med {valC}. Vad blir resultatet?",
            en: "A starting number in a sequence generator is set to {valA}. The generator is programmed to multiply the number by {valB} and then by {valC}. What is the result?"
        },
        {
            sv: "Du matar in värdet {valA} i en miniräknare. Du trycker på multiplikation med {valB} och direkt efteråt på multiplikation med {valC}. Vad står det på skärmen?",
            en: "You input the value {valA} into a calculator. You press multiplication by {valB} and immediately after press multiplication by {valC}. What is displayed on the screen?"
        },
        {
            sv: "En ljudfil har en initial signalstyrka på {valA}. En effektbox multiplicerar styrkan med faktorn {valB} och sedan med {valC}. Vad blir den slutgiltiga signalstyrkan?",
            en: "A audio file has an initial signal strength of {valA}. An effects unit multiplies the strength by the factor {valB} and then by {valC}. What is the final signal strength?"
        },
        {
            sv: "I en databas är en skalningsparameter satt till {valA}. Systemet uppdaterar parametern genom att multiplicera den med {valB} och sedan med {valC}. Vad blir det nya parametervärdet?",
            en: "In a database, a scaling parameter is set to {valA}. The system updates the parameter by multiplying it by {valB} and then by {valC}. What is the new parameter value?"
        },
        {
            sv: "Ett mattespel genererar utmaningen att multiplicera {valA} med {valB} och sedan multiplicera produkten med {valC}. Vilket svar måste du skriva in för att vinna?",
            en: "A math game generates the challenge to multiply {valA} by {valB} and then multiply the product by {valC}. What answer must you type in to win?"
        },
        {
            sv: "En algoritm för bildkomprimering ändrar en färgkod utifrån startvärdet {valA}. Koden multipliceras med {valB} och sedan med {valC}. Vad returnerar komprimeringsverktyget?",
            en: "An algorithm for image compression modifies a color code starting from the baseline {valA}. The code is multiplied by {valB} and then by {valC}. What does the compression tool return?"
        }
    ],

    // =========================================================================
    // 🎯 5. NEG DIVISION (Requires placeholders: {valA}, {valB})
    // =========================================================================
    neg_division: [
        {
            sv: "Ett kompisgäng spelar ett onlinespel och deras lag får totalt {valA} poäng i straffavgift efter en runda. Avgiften delas helt lika på de {valB} spelarna. Hur mycket ändras poängen för varje enskild spelare?",
            en: "A group of friends plays an online game and their team gets a total of {valA} penalty points after a round. The penalty is split equally among the {valB} players. How much does the score change for each individual player?"
        },
        {
            sv: "Ett spelsaldo på en gemensam arkadmaskin har ändrats med totalt {valA} poäng under {valB} spelrundor. Hur stor blev förändringen per runda om den var exakt lika stor varje gång?",
            en: "A gaming balance on a shared arcade machine changed by a total of {valA} points over {valB} rounds. How large was the change per round if it was exactly the same each time?"
        },
        {
            sv: "Ett gemensamt sparkonto för ett kompisgäng har ändrats med totalt {valA} kr under {valB} veckor på grund av serveravgifter. Hur stor är förändringen i genomsnitt per vecka?",
            en: "A shared savings account for a group of friends changed by a total of {valA} kr over {valB} weeks due to server fees. What is the average change per week?"
        },
        {
            sv: "Temperaturen i ett laboratorium föll jämnt och ändrades med totalt {valA} °C under {valB} timmar. Hur stor var temperaturförändringen i genomsnitt per timme?",
            en: "The temperature in a laboratory dropped steadily and changed by a total of {valA} °C over {valB} hours. What was the average temperature change per hour?"
        },
        {
            sv: "En digital höjdmätare på en sjunkande drönare ändrade sitt läge med totalt {valA} meter under {valB} minuter. Hur många meter rörde den sig i genomsnitt per minut?",
            en: "A digital altimeter on a descending drone changed its position by a total of {valA} meters over {valB} minutes. How many meters did it move on average per minute?"
        },
        {
            sv: "Ett stort isblock i ett experiment har smält så att dess tjocklek har ändrats med totalt {valA} mm under {valB} timmar. Hur stor har förändringen varit i genomsnitt per timme?",
            en: "A large ice block in an experiment melted so that its thickness changed by a total of {valA} mm over {valB} hours. What was the average change per hour?"
        },
        {
            sv: "Ett UF-företag har dragit på sig en total skuld på {valA} kr under {valB} månader. Hur stor har den månatliga ekonomiska förändringen varit i snitt?",
            en: "A student company accumulated a total debt of {valA} kr over {valB} months. What has been the average monthly financial change?"
        },
        {
            sv: "En testprofil på sociala medier tappade följare under en rensning, vilket ändrade totalen med {valA} personer under {valB} dagar. Vad var förändringen i snitt per dag?",
            en: "A test profile on social media lost followers during a cleanup, changing the total by {valA} people over {valB} days. What was the average change per day?"
        },
        {
            sv: "Laddningen i en powerbank sjönk under ett test och ändrades med totalt {valA} mAh under {valB} timmar. Hur stor var förändringen i genomsnitt per timme?",
            en: "The charge in a power bank dropped during a test and changed by a total of {valA} mAh over {valB} hours. What was the average change per hour?"
        },
        {
            sv: "Ett gäng på {valB} personer delar helt lika på en gemensam utgift som ändrade deras samlade kassa med {valA} kr. Hur mycket ändras saldot för varje person?",
            en: "A group of {valB} people splits a shared expense equally, which changed their collective cash by {valA} kr. How much does the balance change for each person?"
        },
        {
            sv: "Ett datorspel raderade automatiskt inaktiva konton. Totalt ändrades antalet spelare i en klan med {valA} personer under {valB} veckor. Vad var förändringen i snitt per vecka?",
            en: "A computer game automatically deleted inactive accounts. In total, the number of players in a clan changed by {valA} people over {valB} weeks. What was the average change per week?"
        },
        {
            sv: "Oljenivån i en mopedmotor läckte ut och ändrades med totalt {valA} ml under {valB} dagar. Hur stor var läckageförändringen i genomsnitt per dag?",
            en: "The oil level in a moped engine leaked out and changed by a total of {valA} ml over {valB} days. What was the leakage change on average per day?"
        },
        {
            sv: "En lagringsenhet rensades på gamla filer, vilket ändrade det använda utrymmet med {valA} GB under {valB} minuter. Hur stort var dataavdraget i snitt per minut?",
            en: "A storage drive was cleared of old files, changing the used space by {valA} GB over {valB} minutes. What was the data deduction on average per minute?"
        },
        {
            sv: "Ett gäng vänner förlorade totalt {valA} poäng i en turnering. Förlusten ska fördelas helt jämnt mellan de {valB} lagmedlemmarna. Vilken poängförändring får varje medlem?",
            en: "A group of friends lost a total of {valA} points in a tournament. The loss is to be split completely evenly among the {valB} team members. What score change does each member receive?"
        },
        {
            sv: "Vattennivån i en experimentell behållare sjönk på grund av ett litet hål. Nivån ändrades med totalt {valA} mm under {valB} minuter. Vad var ändringen i genomsnitt per minut?",
            en: "The water level in an experimental container dropped due to a small hole. The level changed by a total of {valA} mm over {valB} minutes. What was the change on average per minute?"
        }
    ]
};