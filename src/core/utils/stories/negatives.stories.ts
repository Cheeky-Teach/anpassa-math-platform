import { StoryScenario } from '../WordProblemInterceptor.js';

export const NEGATIVE_STORIES: Record<string, StoryScenario[]> = {
    neg_add_sub_chain: [
        {
            sv: "Du har {valA} poäng i ett spel. Du får {valB} poäng, förlorar {valC} poäng och får sedan {valD} poäng. Vad blir din poäng?",
            en: "You have {valA} points in a game. You gain {valB} points, lose {valC} points, and then gain {valD} points. What is your score?"
        },
        {
            sv: "Temperaturen startar på {valA}°C. Den stiger med {valB}°C, sjunker med {valC}°C och stiger sedan med {valD}°C. Vad är temperaturen nu?",
            en: "The temperature starts at {valA}°C. It rises by {valB}°C, drops by {valC}°C, and then rises by {valD}°C. What is the temperature now?"
        },
        {
            sv: "En hiss är på våning {valA}. Den åker upp {valB} våningar, ner {valC} våningar och slutligen upp {valD} våningar. Vilken våning är den på?",
            en: "An elevator is on floor {valA}. It goes up {valB} floors, down {valC} floors, and finally up {valD} floors. What floor is it on?"
        },
        {
            sv: "En drönare flyger på {valA} meters höjd. Den stiger {valB} meter, sjunker {valC} meter och stiger sedan {valD} meter. Vilken är höjden nu?",
            en: "A drone flies at {valA} meters. It climbs {valB} meters, drops {valC} meters, and then climbs {valD} meters. What is the altitude now?"
        },
        {
            sv: "Du har {valA} kr på ditt konto. Du får {valB} kr, spenderar {valC} kr och får sedan {valD} kr. Hur mycket har du på kontot nu?",
            en: "You have {valA} kr in your account. You get {valB} kr, spend {valC} kr, and then get {valD} kr. How much do you have now?"
        },
        {
            sv: "En u-båt befinner sig på {valA} meters djup. Den stiger {valB} meter, sjunker {valC} meter och stiger sedan {valD} meter. Vilket är u-båtens nya djupförhållande?",
            en: "A submarine is at a depth of {valA} meters. It ascends {valB} meters, dives {valC} meters, and then ascends {valD} meters. What is the submarine's new depth?"
        },
        {
            sv: "Ett företag har ett ekonomiskt resultat på {valA} miljoner kr. De gör en vinst på {valB} miljoner, drabbas av en förlust på {valC} miljoner och får sedan ett bidrag på {valD} miljoner. Vad blir slutresultatet?",
            en: "A company has a financial result of {valA} million SEK. They make a profit of {valB} million, suffer a loss of {valC} million, and then receive a grant of {valD} million. What is the final financial result?"
        },
        {
            sv: "Arkeologer gräver ut en gammal brunn och startar på {valA} meter under markytan. De gräver sig upp {valB} meter, gräver ner {valC} meter och klättrar sedan upp {valD} meter. Vilken är deras position nu?",
            en: "Archaeologists are excavating an old well and start at {valA} meters below the surface. They dig upwards {valB} meters, dig down {valC} meters, and then climb up {valD} meters. What is their position now?"
        }
    ],

    neg_double_minus: [
        {
            sv: "Temperaturen i en frys är {valA}°C. Temperaturen höjs sedan med {valB}°C. Vilken temperatur visar displayen nu?",
            en: "The temperature in a freezer is {valA}°C. The temperature is then raised by {valB}°C. What temperature does the display show now?"
        },
        {
            sv: "Du har {valA} poäng i ett mobilspel. Du lyckas få en bonus på {valB} poäng. Hur många poäng har du nu?",
            en: "You have {valA} points in a mobile game. You manage to get a bonus of {valB} points. How many points do you have now?"
        },
        {
            sv: "Du har {valA} poäng i ett spel. Domaren tar bort en gammal straffavgift på minus {valB} poäng. Vad blir din nya poäng?",
            en: "You have {valA} points in a game. The referee removes a previous penalty of minus {valB} points. What is your new score?"
        },
        {
            sv: "En digital höjdmätare visar {valA} meter. Du raderar ett felaktigt djupavdrag på minus {valB} meter. Vilket värde visas nu?",
            en: "A digital altimeter shows {valA} meters. You erase an incorrect depth deduction of minus {valB} meters. What value is shown now?"
        },
        {
            sv: "Ett startvärde är {valA}. Minska detta värde med det negativa talet minus {valB}. Vad blir det nya resultatet?",
            en: "A starting value is {valA}. Decrease this value by the negative number minus {valB}. What is the new result?"
        }
    ],

    neg_multiplication: [
        {
            sv: "Din poäng ändras med {valA} poäng varje runda. Vad är den totala förändringen efter {valB} rundor?",
            en: "Your score changes by {valA} points each round. What is the total change after {valB} rounds?"
        },
        {
            sv: "Temperaturen ändras med {valA}°C varje timme. Vad är den totala temperaturändringen efter {valB} timmar?",
            en: "The temperature changes by {valA}°C every hour. What is the total temperature change after {valB} hours?"
        },
        {
            sv: "En sökrobot rör sig med höjdändringen {valA} meter varje minut. Vilket läge har den efter {valB} minuter?",
            en: "A robot moves with an altitude change of {valA} meters per minute. What is its position after {valB} minutes?"
        },
        {
            sv: "Ett batteri laddas ur med {valA} procentenheter per timme. Vad blir den totala ändringen efter {valB} timmar?",
            en: "The battery charge changes by {valA} units per hour. What is the total change after {valB} hours?"
        },
        {
            sv: "Ett lag får {valA} poäng för varje missat skott. Hur mycket ändras lagets poäng totalt efter {valB} missar?",
            en: "A team gets {valA} points for each missed shot. How much does the score change after {valB} misses?"
        },
        {
            sv: "Ett gruvschakt grävs djupare och höjden ändras med {valA} meter varje dag. Vilken är den totala höjdförändringen efter {valB} dagars grävande?",
            en: "A mine shaft is being dug deeper and the altitude changes by {valA} meters each day. What is the total altitude change after {valB} days of digging?"
        },
        {
            sv: "Ett oljefat har ett litet läckage som ändrar oljenivån med {valA} cm varje timme. Vad blir den totala nivånförändringen efter {valB} timmar?",
            en: "An oil barrel has a small leak that changes the oil level by {valA} cm every hour. What will be the total level change after {valB} hours?"
        }
    ],

    neg_mult_chain: [
        {
            sv: "Ta startvärdet {valA}. Multiplicera det med {valB} och multiplicera sedan resultatet med {valC}. Vad blir slutsvaret?",
            en: "Take the starting value {valA}. Multiply it by {valB} and then multiply the result by {valC}. What is the final answer?"
        },
        {
            sv: "Talet {valA} ska multipliceras. Den multipliceras först med {valB} och sedan med {valC}. Vad blir det nya talet?",
            en: "The number {valA} is to be multiplied. It is multiplied first by {valB} and then by {valC}. What is the new number?"
        },
        {
            sv: "Ett startvärde är {valA}. Multiplicera det först med {valB} och multiplicera sedan resultatet med {valC}. Vad blir slutresultatet?",
            en: "A starting value is {valA}. Multiply it first by {valB} and then multiply the result by {valC}. What is the final result?"
        }
    ],

    neg_division: [
        {
            sv: "Fyra kompisar spelar ett datorspel ihop och deras lag får totalt {valA} poäng. Förlusten delas lika på de {valB} spelarna. Hur mycket ändras poängen för varje spelare?",
            en: "Four friends play a computer game together and their team gets a total of {valA} points. The loss is split equally among the {valB} players. How much does the score change for each player?"
        },
        {
            sv: "Ett spelsaldo ändras med totalt {valA} poäng under {valB} spelrundor. Hur stor blir förändringen per runda om det delas helt lika?",
            en: "A game balance changes by a total of {valA} points over {valB} rounds. How large is the change per round if split completely equally?"
        },
        {
            sv: "Ett sparkonto ändras med totalt {valA} kr under {valB} veckor. Hur stor är förändringen i genomsnitt per vecka?",
            en: "A savings account changes by a total of {valA} kr over {valB} weeks. What is the average change per week?"
        },
        {
            sv: "Temperaturen föll med totalt {valA}°C under {valB} timmar. Hur stor var temperaturändringen i genomsnitt per timme?",
            en: "The temperature dropped by a total of {valA}°C over {valB} hours. What was the average temperature change per hour?"
        },
        {
            sv: "En sänkbar mätare ändrade sitt läge med {valA} meter på {valB} minuter. Hur många meter rörde den sig i snitt per minut?",
            en: "A submersible gauge changed its position by {valA} meters over {valB} minutes. How many meters did it move per minute on average?"
        },
        {
            sv: "Ett glaciärområde har smält och dess tjocklek har ändrats med totalt {valA} meter under de senaste {valB} månaderna. Hur stor har förändringen varit i genomsnitt per månad?",
            en: "A glacier area has melted and its thickness changed by a total of {valA} meters over the last {valB} months. What has been the average thickness change per month?"
        }
    ]
};