// src/core/utils/stories/probability.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const PROBABILITY_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. PROB COMPLEMENT PCT (Requires placeholders: {pWin})
    // =========================================================================
    prob_complement_pct: [
        {
            sv: "Väderappen visar att risken för regn under helgens utomhuskonsert är {pWin}%. Vad är sannolikheten i procent att det INTE regnar?",
            en: "The weather app shows that the chance of rain during this weekend's outdoor concert is {pWin}%. What is the percentage probability that it will NOT rain?"
        },
        {
            sv: "Ett bussbolag anger att {pWin}% av alla turer blir försenade under vintern. Vad är sannolikheten i procent att en buss avgår helt i tid?",
            en: "A bus company states that {pWin}% of all trips are delayed during winter. What is the percentage probability that a bus departs completely on time?"
        },
        {
            sv: "I ett mobilspel är risken {pWin}% att en uppgradering av ett föremål misslyckas. Vad är chansen i procent att uppgraderingen lyckas?",
            en: "In a mobile game, there is a {pWin}% risk that an item upgrade fails. What is the percentage chance that the upgrade succeeds?"
        },
        {
            sv: "En molntjänst anger att risken för att en filsynkning avbryts är {pWin}%. Vad är sannolikheten i procent att filerna synkas utan problem?",
            en: "A cloud service states that the risk of a file sync breaking is {pWin}%. What is the percentage probability that the files sync without any issues?"
        },
        {
            sv: "Chansen att en viss växt överlever vintern på balkongen är {pWin}%. Vad är sannolikheten i procent att växten tyvärr INTE överlever?",
            en: "The chance of a certain plant surviving the winter on the balcony is {pWin}%. What is the percentage probability that the plant unfortunately does NOT survive?"
        },
        {
            sv: "En omröstning visar och att {pWin}% av eleverna i en skola föredrar kolsyrat vatten framför stilla. Vad är sannolikheten i procent att en slumpmässigt utvald elev INTE föredrar kolsyrat vatten?",
            en: "A poll shows that {pWin}% of students in a school prefer sparkling water over still. What is the percentage probability that a randomly selected student does NOT prefer sparkling water?"
        },
        {
            sv: "I ett spel på nätet blir i snitt {pWin}% av alla spelare granskade för fusk. Vad är sannolikheten i procent att du spelar en runda utan att bli granskad?",
            en: "In an online game, an average of {pWin}% of all players are screened for cheating. What is the percentage probability that you play a round without being screened?"
        },
        {
            sv: "En basketspelare har en träffsäkerhet på {pWin}% på sina straffkast. Vad är sannolikheten i procent att hon missar sitt nästa straffkast?",
            en: "A basketball player has an accuracy of {pWin}% on her free throws. What is the percentage probability that she misses her next free throw?"
        },
        {
            sv: "Statistik visar att chansen för solsken under en specifik fredag i staden är {pWin}%. Vad är sannolikheten i procent att det blir mulet eller regn?",
            en: "Statistics show that the chance of sunshine on a specific Friday in the city is {pWin}%. What is the percentage probability that it will be cloudy or rainy?"
        },
        {
            sv: "Ett program har ett filter som flaggar {pWin}% av alla inkommande meddelanden som skräp. Vad är sannolikheten i procent att ett vanligt meddelande slipper igenom utan att flaggas?",
            en: "A program has a filter that flags {pWin}% of all incoming messages as spam. What is the percentage probability that a regular message gets through without being flagged?"
        },
        {
            sv: "Chansen att du hittar ett sällsynt föremål i en digital lootbox är {pWin}%. Vad är sannolikheten i procent att du INTE får det sällsynta föremålet?",
            en: "The chance of finding a rare item in a digital loot box is {pWin}%. What is the percentage probability that you do NOT get the rare item?"
        },
        {
            sv: "Risken att batteriet i din handkontroll dör under nästa spelsession är {pWin}%. Vad är sannolikheten i procent att batteriet håller hela sessionen?",
            en: "The risk of your controller battery dying during the next gaming session is {pWin}%. What is the percentage probability that the battery lasts the entire session?"
        },
        {
            sv: "En butik meddelar att {pWin}% av alla paket drabbas av transportskador. Vad är sannolikheten i procent att ett paket levereras helt utan skador?",
            en: "A shop announces that {pWin}% of all packages suffer transit damage. What is the percentage probability that a package is delivered completely without damage?"
        },
        {
            sv: "Chansen att du hinner med anslutningsbussen efter träningen är {pWin}%. Vad är sannolikheten i procent att du tyvärr missar bussen?",
            en: "The chance of making your connecting bus after practice is {pWin}%. What is the percentage probability that you unfortunately miss the bus?"
        },
        {
            sv: "En streamingsajt anger att risken för lagg under en livesändning är {pWin}%. Vad är sannolikheten i procent att sändningen flyter på utan lagg?",
            en: "A streaming site states that the risk of lag during a live stream is {pWin}%. What is the percentage probability that the stream runs smoothly without lag?"
        }
    ],

    // =========================================================================
    // 🎯 2. PROB DICE PARITY (Requires placeholders: {label})
    // =========================================================================
    prob_dice_parity: [
        {
            sv: "Du spelar ett brädspel där du måste slå ett {label} tal med en sexsidig tärning för att få flytta din spelpjäs. Vad är sannolikheten att du får flytta pjäsen på nästa kast?",
            en: "You are playing a board game where you must roll an {label} number with a six-sided die to move your game piece. What is the probability that you get to move your piece on the next toss?"
        },
        {
            sv: "En grupp ska utse vem som börjar en redovisning genom att kasta en tärning. Om tärningen visar ett {label} tal får grupp ett starta. Vad är sannolikheten att grupp ett får starta?",
            en: "A group draws the presentation order by rolling a die. If the die shows an {label} number, group one starts. What is the probability that group one gets to start?"
        },
        {
            sv: "I ett mattespel vinner du en poäng om en tärning visar ett {label} antal prickar. Hur stor är chansen att du tar poäng på ditt kast?",
            en: "In a math game, you win a point if a die shows an {label} number of dots. How large is the chance that you score a point on your roll?"
        },
        {
            sv: "Ett experiment går ut på att rulla en tärning. Man undersöker utfall som ger ett {label} resultat. Vad är sannolikheten för detta utfall?",
            en: "An experiment involves rolling a die. Investigators are interested in outcomes that yield an {label} result. What is the probability of this outcome?"
        },
        {
            sv: "För att bestämma vem som börjar städa rummet kastar Elsa en tärning. Ett {label} tal innebär att hon börjar. Vad är sannolikheten att Elsa får städa?",
            en: "To decide who starts cleaning the room, Elsa rolls a die. An {label} number means she starts. What is the probability that Elsa has to clean?"
        },
        {
            sv: "Ett digitalt tärningshjul har nummer 1 till 6. Hjulet snurras och stannar på ett värde. Vad är sannolikheten att pilen pekar på ett {label} nummer?",
            en: "A digital die wheel has numbers 1 to 6. The wheel is spun and stops on a value. What is the probability that the arrow points to an {label} number?"
        },
        {
            sv: "I en kodövning genereras ett slumptal mellan 1 och 6. Koden reagerar om talet är {label}. Vad är sannolikheten att koden reagerar?",
            en: "In a programming exercise, a random number between 1 and 6 is generated. The code triggers if the number is {label}. What is the probability that the code triggers?"
        },
        {
            sv: "En kub har sina sidor numrerade från 1 till 6. Om du kastar kuben på ett bord, vad är sannolikheten att den landar med ett {label} tal uppåt?",
            en: "A cube has its sides numbered from 1 to 6. If you toss the cube onto a table, what is the probability that it lands with an {label} number facing up?"
        },
        {
            sv: "Mio slår en tärning och hoppas på ett {label} tal för att slå ut sin motståndare i ett spel. Hur stor är sannolikheten att han lyckas?",
            en: "Mio rolls a die hoping for an {label} number to knock out his opponent in a game. How large is the probability that he succeeds?"
        },
        {
            sv: "Ett tärningskast görs i ett stängt rum. Du gissar på förhand att resultatet blir ett {label} tal. Vad är sannolikheten att din gissning stämmer?",
            en: "A die roll is made in a closed room. You guess in advance that the result will be an {label} number. What is the probability that your guess is correct?"
        },
        {
            sv: "I en utmaning ska du kasta en tärning. Du får gå vidare i banan om du slår ett {label} tal. Vad är sannolikheten att du får gå vidare på detta kast?",
            en: "In a challenge, you need to roll a die. You get to move forward if you roll an {label} number. What is the probability that you move forward on this roll?"
        },
        {
            sv: "En maskin slumpar fram en siffra från 1 till 6. Du vinner en token om talet som visas är {label}. Vad är sannolikheten att du vinner en token?",
            en: "A machine picks a number from 1 to 6 at random. You win a token if the number shown is {label}. What is the probability that you win a token?"
        },
        {
            sv: "Kalle kastar en tärning och vill ha ett {label} resultat för att klara sitt drag i ett sällskapsspel. Vad är sannolikheten att han klarar draget?",
            en: "Kalle rolls a die and wants an {label} result to complete his turn in a board game. What is the probability that he completes the turn?"
        },
        {
            sv: "En röd tärning rullas över golvet och stannar under en soffa. Vad är sannolikheten att den dolda ovansidan visar ett {label} antal prickar?",
            en: "A red die rolls across the floor and stops under a couch. What is the probability that the hidden top face shows an {label} number of dots?"
        },
        {
            sv: "Du programmerar en spelbot som ska slå en tärning. Boten gör ett val om talet är {label}. Vad är sannolikheten att boten gör valet?",
            en: "You are programming a game bot that will roll a die. The bot makes a choice if the number is {label}. What is the probability that the bot makes the choice?"
        }
    ],

    // =========================================================================
    // 🎯 3. PROB GROUP RATIO (Requires placeholders: {label1}, {label2}, {r1}, {r2})
    // =========================================================================
    prob_group_ratio: [
        {
            sv: "I en skål är förhållandet mellan {label1} och {label2} föremål {r1}:{r2}. Om du blundar och tar ett föremål, vad är sannolikheten att du får ett {label1} föremål?",
            en: "In a bowl, the ratio between {label1} and {label2} items is {r1}:{r2}. If you close your eyes and pick an item, what is the probability that you get a {label1} item?"
        },
        {
            sv: "På en parkering är förhållandet mellan {label1} och {label2} fordon {r1}:{r2}. Ett fordon kör ut slumpmässigt. Vad är sannolikheten att det är en {label1}?",
            en: "In a parking lot, the ratio between {label1} and {label2} vehicles is {r1}:{r2}. A vehicle drives out at random. What is the probability that it is a {label1}?"
        },
        {
            sv: "I en förvaringsbox är förhållandet mellan {label1} och {label2} saker {r1}:{r2}. Du plockar upp en sak utan att titta. Vad är sannolikheten det är en {label1}?",
            en: "In a storage box, the ratio between {label1} and {label2} things is {r1}:{r2}. You pick up an item without looking. What is the probability that it is a {label1}?"
        },
        {
            sv: "I en grupp är förhållandet mellan {label1} och {label2} deltagare {r1}:{r2}. En ledare drar ett namn ur en hatt för att utse en representant. Vad är sannolikheten att det blir en {label1}?",
            en: "In a group, the ratio between {label1} and {label2} participants is {r1}:{r2}. A leader draws a name from a hat to select a representative. What is the probability that it is a {label1}?"
        },
        {
            sv: "På en lista är förhållandet mellan {label1} och {label2} rätter {r1}:{r2}. En gäst väljer en rätt slumpmässigt. Vad är sannolikheten att gästen väljer en {label1}?",
            en: "On a list, the ratio between {label1} and {label2} dishes is {r1}:{r2}. A guest chooses a dish at random. What is the probability that the guest chooses a {label1}?"
        },
        {
            sv: "I ett förråd är förhållandet mellan {label1} och {label2} prylar {r1}:{r2}. Du tar med dig en pryl ut i mörkret. Vad är sannolikheten att du har tagit en {label1}?",
            en: "In a storage room, the ratio between {label1} and {label2} items is {r1}:{r2}. You take an item out into the dark. What is the probability that you have taken a {label1}?"
        },
        {
            sv: "I en godispåse är förhållandet mellan {label1} och {label2} bitar {r1}:{r2}. Du tar en bit utan att titta. Vad är sannolikheten att du får en {label1}?",
            en: "In a candy bag, the ratio between {label1} and {label2} pieces is {r1}:{r2}. You take a piece without looking. What is the probability that you get a {label1}?"
        },
        {
            sv: "I en samling är förhållandet mellan {label1} och {label2} växter {r1}:{r2}. Någon väljer ut ett prov slumpmässigt. Vad är sannolikheten att provet tas från en {label1}?",
            en: "In a collection, the ratio between {label1} and {label2} plants is {r1}:{r2}. Someone selects a sample at random. What is the probability that the sample is taken from a {label1}?"
        },
        {
            sv: "I en låda är förhållandet mellan {label1} och {label2} plagg {r1}:{r2}. Du drar ut ett plagg slumpmässigt. Vad är sannolikheten att det är en {label1}?",
            en: "In a box, the ratio between {label1} and {label2} garments is {r1}:{r2}. You pull out a garment at random. What is the probability that it is a {label1}?"
        },
        {
            sv: "I en monter är förhållandet mellan {label1} och {label2} föremål {r1}:{r2}. En samlare pekar ut ett föremål helt slumpmässigt. Vad är sannolikheten att hen väljer en {label1}?",
            en: "In a display case, the ratio between {label1} and {label2} items is {r1}:{r2}. A collector points out an item completely at random. What is the probability that they choose a {label1}?"
        },
        {
            sv: "Bland dina sparade filer är förhållandet mellan {label1} och {label2} dokument {r1}:{r2}. Du öppnar ett dokument på måfå. Vad är sannolikheten att det är en {label1}?",
            en: "Among your saved files, the ratio between {label1} and {label2} documents is {r1}:{r2}. You open a document at random. What is the probability that it is a {label1}?"
        },
        {
            sv: "I en kanal på Discord är förhållandet mellan {label1} och {label2} roller {r1}:{r2}. Systemet pingar en roll slumpmässigt. Vad är sannolikheten att den pingar en {label1}?",
            en: "In a Discord channel, the ratio between {label1} and {label2} roles is {r1}:{r2}. The system pings a role at random. What is the probability that it pings a {label1}?"
        },
        {
            sv: "I en väska är förhållandet mellan {label1} och {label2} tillbehör {r1}:{r2}. Du sträcker ner handen och tar upp ett tillbehör. Vad är sannolikheten att det är en {label1}?",
            en: "In a bag, the ratio between {label1} and {label2} accessories is {r1}:{r2}. You reach in and pick an accessory. What is the probability that it is a {label1}?"
        },
        {
            sv: "På en anslagstavla är förhållandet mellan {label1} och {label2} lappar {r1}:{r2}. Vinden blåser ner en lapp slumpmässigt. Vad är sannolikheten att det är en {label1}?",
            en: "On a bulletin board, the ratio between {label1} and {label2} notes is {r1}:{r2}. The wind blows down a note at random. What is the probability that it is a {label1}?"
        },
        {
            sv: "I en korg är förhållandet mellan {label1} och {label2} prylar {r1}:{r2}. Du tar upp en pryl utan att titta. Vad är sannolikheten att det är en {label1}?",
            en: "In a basket, the ratio between {label1} and {label2} items is {r1}:{r2}. You pick up an item without looking. What is the probability that it is a {label1}?"
        }
    ]
};