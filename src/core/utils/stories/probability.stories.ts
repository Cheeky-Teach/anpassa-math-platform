import { StoryScenario } from '../WordProblemInterceptor.js';

export const PROBABILITY_STORIES: Record<string, StoryScenario[]> = {
    prob_complement_pct: [
        {
            sv: "SMHI rapporterar att risken för regn under lördagens utomhusfestival är {pWin}%. Vad är sannolikheten att det INTE regnar under festivalen?",
            en: "The weather service reports that the chance of rain during Saturday's outdoor festival is {pWin}%. What is the probability that it will NOT rain during the festival?"
        },
        {
            sv: "Ett transportbolag konstaterar att {pWin}% av tågen drabbas av förseningar under vintermånaderna. Vad är sannolikheten att ett tåg avgår helt i tid?",
            en: "A transport company notes that {pWin}% of trains experience delays during winter months. What is the probability that a train departs completely on time?"
        },
        {
            sv: "I en fabrikstillverkning är felmarginalen {pWin}% för en specifik komponent. Om du plockar en komponent direkt från bandet, vad är chansen att den är helt felfri?",
            en: "In a manufacturing line, the error margin is {pWin}% for a specific component. If you pick a component directly from the line, what is the chance that it is completely defect-free?"
        },
        {
            sv: "En digital backup-tjänst anger att risken för att en synkning misslyckas är {pWin}%. Vad är sannolikheten att synkningen lyckas utan problem?",
            en: "A digital backup service states that the risk of a sync failing is {pWin}%. What is the probability that the sync succeeds without any issues?"
        },
        {
            sv: "Chansen att en viss planta överlever vintern i växthuset är {pWin}%. Vad är sannolikheten att plantan tyvärr INTE överlever?",
            en: "The chance of a certain plant surviving the winter in the greenhouse is {pWin}%. What is the probability that the plant unfortunately does NOT survive?"
        },
        {
            sv: "En marknadsundersökning visar att {pWin}% av kunderna föredrar kolsyrat vatten framför stilla. Vad är sannolikheten att en slumpmässigt utvald kund INTE föredrar kolsyrat vatten?",
            en: "A market survey shows that {pWin}% of customers prefer sparkling water over still. What is the probability that a randomly selected customer does NOT prefer sparkling water?"
        },
        {
            sv: "Vid en säkerhetskontroll på en flygplats blir i snitt {pWin}% av alla väskor uttagna för extra manuell granskning. Vad är sannolikheten att en väska passerar utan att bli uttagen?",
            en: "At an airport security check, an average of {pWin}% of all bags are selected for extra manual screening. What is the probability that a bag passes through without being selected?"
        },
        {
            sv: "En basketspelare har en statistisk träffsäkerhet på {pWin}% på sina straffkast. Vad är sannolikheten att hon missar sitt nästa straffkast?",
            en: "A basketball player has a statistical accuracy of {pWin}% on her free throws. What is the probability that she misses her next free throw?"
        },
        {
            sv: "Historisk data visar att chansen för solsken på midsommarafton i en viss stad är {pWin}%. Vad är sannolikheten att det blir mulet eller regn?",
            en: "Historical data shows that the chance of sunshine on Midsummer's Eve in a certain town is {pWin}%. What is the probability that it will be cloudy or rainy?"
        },
        {
            sv: "Ett datorsystem har en automatisk spamspärr som felaktigt flaggar {pWin}% av vanliga mail som skräppost. Vad är sannolikheten att ett vanligt mail slipper igenom utan att flaggas?",
            en: "A computer system has an automatic spam filter that incorrectly flags {pWin}% of regular emails as spam. What is the probability that a regular email gets through without being flagged?"
        }
    ],

    prob_dice_parity: [
        {
            sv: "Du spelar ett brädspel där du måste slå ett {label} tal med en sexsidig tärning för att få flytta din spelpjäs. Vad är sannolikheten att du får flytta pjäsen på nästa kast?",
            en: "You are playing a board game where you must roll an {label} number with a six-sided die to move your game piece. What is the probability that you get to move your piece on the next toss?"
        },
        {
            sv: "En lärare lottar ut en presentationsordning genom att kasta en tärning. Om tärningen visar ett {label} tal får grupp ett starta. Vad är sannolikheten att grupp ett får starta?",
            en: "A teacher draws the presentation order by rolling a die. If the die shows an {label} number, group one starts. What is the probability that group one gets to start?"
        },
        {
            sv: "I ett mattespel vinner du en poäng om tärningen visar ett {label} antal prickar. Hur stor är chansen att du tar poäng på ditt kast?",
            en: "In a math game, you win a point if the die shows an {label} number of dots. How large is the chance that you score a point on your roll?"
        },
        {
            sv: "Ett experiment går ut på att rulla en balanserad tärning. Man är intresserad av utfall som ger ett {label} resultat. Vad är sannolikheten för detta utfall?",
            en: "An experiment involves rolling a balanced die. Investigators are interested in outcomes that yield an {label} result. What is the probability of this outcome?"
        },
        {
            sv: "För att bestämma vem som börjar städa förrådet kastar Elsa en tärning. Hon bestämmer att ett {label} tal innebär att hon börjar. Vad är sannolikheten att Elsa får städa?",
            en: "To decide who starts cleaning the storage room, Elsa rolls a die. She decides that an {label} number means she starts. What is the probability that Elsa has to clean?"
        },
        {
            sv: "Ett tärningshjul har nummer 1 till 6. Hjulet snurras och stannar på ett värde. Vad är sannolikheten att pilen pekar på ett {label} nummer?",
            en: "A die wheel has numbers 1 to 6. The wheel is spun and stops on a value. What is the probability that the arrow points to an {label} number?"
        },
        {
            sv: "Vid en programmeringsövning genereras ett slumptal mellan 1 och 6. Koden reagerar om talet är {label}. Vad är sannolikheten att koden reagerar?",
            en: "In a programming exercise, a random number between 1 and 6 is generated. The code triggers if the number is {label}. What is the probability that the code triggers?"
        },
        {
            sv: "En geometrisk kub har sina sidor numrerade från 1 till 6. Om du kastar kuben på ett bord, vad är sannolikheten att den landar med ett {label} tal uppåt?",
            en: "A geometric cube has its sides numbered from 1 to 6. If you toss the cube onto a table, what is the probability that it lands with an {label} number facing up?"
        },
        {
            sv: "Mio slår en tärning och hoppas på ett {label} tal för att slå ut sin motståndare i spelet. Hur stor är sannolikheten att han lyckas?",
            en: "Mio rolls a die hoping for an {label} number to knock out his opponent in the game. How large is the probability that he succeeds?"
        },
        {
            sv: "Ett tärningskast ska göras i ett slutet rum. Du gissar på förhand att resultatet kommer att bli ett {label} tal. Vad är sannolikheten att din gissning stämmer?",
            en: "A die roll is to be made in a closed room. You guess in advance that the result will be an {label} number. What is the probability that your guess is correct?"
        }
    ],

    prob_group_ratio: [
        {
            sv: "I en fruktskål är förhållandet mellan {label1} och {label2} föremål {r1}:{r2}. Om du blundar och tar ett föremål, vad är sannolikheten att du får ett {label1} föremål?",
            en: "In a fruit bowl, the ratio between {label1} and {label2} items is {r1}:{r2}. If you close your eyes and pick an item, what is the probability that you get a {label1} item?"
        },
        {
            sv: "På en parkeringsplats är förhållandet mellan {label1} och {label2} föremål {r1}:{r2}. En bil kör ut helt slumpmässigt. Vad är sannolikheten att det är en {label1}?",
            en: "In a parking lot, the ratio between {label1} and {label2} items is {r1}:{r2}. A car drives out completely at random. What is the probability that it is a {label1}?"
        },
        {
            sv: "I en förvaringsbox är förhållandet mellan {label1} och {label2} föremål {r1}:{r2}. Du plockar upp ett föremål utan att titta. Vad är sannolikheten att det är en {label1}?",
            en: "In a storage box, the ratio between {label1} and {label2} items is {r1}:{r2}. You pick up an item without looking. What is the probability that it is a {label1}?"
        },
        {
            sv: "I en skolklass är förhållandet mellan {label1} och {label2} föremål {r1}:{r2}. Läraren drar ett namn ur en hatt för att utse en klassrepresentant. Vad är sannolikheten att det blir en {label1}?",
            en: "In a classroom, the ratio between {label1} and {label2} items is {r1}:{r2}. The teacher draws a name from a hat to select a class representative. What is the probability that it is a {label1}?"
        },
        {
            sv: "På en meny är förhållandet mellan {label1} och {label2} föremål {r1}:{r2}. En gäst beställer en rätt helt slumpmässigt. Vad är sannolikheten att gästen väljer en {label1}?",
            en: "On a menu, the ratio between {label1} and {label2} items is {r1}:{r2}. A guest orders a dish completely at random. What is the probability that the guest chooses a {label1}?"
        },
        {
            sv: "I ett förråd är förhållandet mellan {label1} och {label2} föremål {r1}:{r2}. Du tar med dig ett verktyg ut i mörkret. Vad är sannolikheten att du har tagit en {label1}?",
            en: "In a storage facility, the ratio between {label1} and {label2} items is {r1}:{r2}. You take a tool out into the dark. What is the probability that you have taken a {label1}?"
        },
        {
            sv: "I en godispåse är förhållandet mellan {label1} och {label2} föremål {r1}:{r2}. Du tar en bit utan att titta. Vad är sannolikheten att du får en {label1}?",
            en: "In a candy bag, the ratio between {label1} and {label2} items is {r1}:{r2}. You take a piece without looking. What is the probability that you get a {label1}?"
        },
        {
            sv: "I en trädgård är förhållandet mellan {label1} och {label2} föremål {r1}:{r2}. En botaniker väljer ut ett växtprov slumpmässigt. Vad är sannolikheten att provet tas från en {label1}?",
            en: "In a garden, the ratio between {label1} and {label2} items is {r1}:{r2}. A botanist selects a plant sample at random. What is the probability that the sample is taken from a {label1}?"
        },
        {
            sv: "I en tyglåda är förhållandet mellan {label1} och {label2} föremål {r1}:{r2}. En skräddare drar ut ett plagg slumpmässigt. Vad är sannolikheten att det är en {label1}?",
            en: "In a fabric box, the ratio between {label1} and {label2} items is {r1}:{r2}. A tailor pulls out a garment at random. What is the probability that it is a {label1}?"
        },
        {
            sv: "I en monter är förhållandet mellan {label1} och {label2} föremål {r1}:{r2}. En samlare pekar ut ett föremål helt slumpmässigt. Vad är sannolikheten att han väljer en {label1}?",
            en: "In a display case, the ratio between {label1} and {label2} items is {r1}:{r2}. A collector points out an item completely at random. What is the probability that he chooses a {label1}?"
        }
    ]
};