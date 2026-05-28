export interface VariationConfig {
    key: string;
    contextType?: string;
    extractorPattern?: RegExp;
    tags?: string[];
}

interface StoryScenario {
    sv: string;
    en: string;
}

// 1. SYSTEM SCENARIO REGISTRY (Supports both flat objects and scalable multi-scenario arrays)
const STORY_REGISTRY: Record<string, StoryScenario | StoryScenario[]> = {
    // --- Existing Phase 1 Core Fallbacks ---
    discrete_pool: {
        sv: "I en skål ligger det totalt {total} frukter. Av dessa är {match} stycken äpplen och resten är päron. Om du tar en frukt helt slumpmässigt utan att titta, vad är sannolikheten att du får ett äpple?",
        en: "In a bowl there are {total} pieces of fruit in total. Of these, {match} are apples and the rest are pears. If you pick a fruit completely at random without looking, what is the probability that you get an apple?"
    },
    value_delta: {
        sv: "Ett par skor kostade ursprungligen {oldV} kr. Under en rea sänktes priset med {diff} kr. Hur stor var prissänkningen uttryckt i procent?",
        en: "A pair of shoes originally cost {oldV} kr. During a sale, the price was reduced by {diff} kr. How large was the price reduction expressed as a percentage?"
    },

    // --- NEW: SUCCINCT NEGATIVE NUMBERS SCENARIO LIBRARIES ---
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
            sv: "Strömsaldot i ett batteri ändras med {valA} enheter per timme. Vad blir den totala ändringen efter {valB} timmar?",
            en: "The battery charge changes by {valA} units per hour. What is the total change after {valB} hours?"
        },
        {
            sv: "Ett lag får {valA} poäng för varje missat skott. Hur mycket ändras lagets poäng totalt efter {valB} missar?",
            en: "A team gets {valA} points for each missed shot. How much does the score change after {valB} misses?"
        }
    ],

    neg_mult_chain: [
        {
            sv: "Ta startvärdet {valA}. Multiplicera det med {valB} och multiplicera sedan resultatet med {valC}. Vad blir slutsvaret?",
            en: "Take the starting value {valA}. Multiply it by {valB} and then multiply the result by {valC}. What is the final answer?"
        },
        {
            sv: "En poängförändring på {valA} ska skalas om. Den multipliceras först med {valB} och sedan med {valC}. Vad blir den nya förändringen?",
            en: "A score change of {valA} is to be rescaled. It is multiplied first by {valB} and then by {valC}. What is the new change?"
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
        }
    ]
};

export class WordProblemInterceptor {
    public static process(questionData: any, variationConfig: VariationConfig, lang: string = 'sv'): any {
        if (!variationConfig || !variationConfig.contextType || !variationConfig.extractorPattern) {
            return questionData;
        }

        const latexSource = questionData?.renderData?.latex;
        if (!latexSource || typeof latexSource !== 'string') {
            return questionData;
        }

        const matchResult = latexSource.match(variationConfig.extractorPattern);
        if (!matchResult || !matchResult.groups) {
            return questionData; 
        }

        const extractedParams = matchResult.groups;
        const entry = STORY_REGISTRY[variationConfig.contextType];
        if (!entry) {
            return questionData;
        }

        // --- DYNAMIC SEED RESOLVER FOR ARRAY LIBRARIES ---
        let activeScenario: StoryScenario;
        if (Array.isArray(entry)) {
            const seedValue = Object.values(extractedParams).reduce((acc, val) => {
                const num = parseInt(String(val).replace(/[()]/g, '')) || 0;
                return acc + num;
            }, 0);
            const selectedIndex = Math.abs(seedValue) % entry.length;
            activeScenario = entry[selectedIndex];
        } else {
            activeScenario = entry;
        }

        let localizedStory = activeScenario[lang === 'en' ? 'en' : 'sv'];

        // --- COMPILER PASS ---
        Object.entries(extractedParams).forEach(([key, value]) => {
            // Remove algebraic structural parentheses style wrappers e.g. (-3) -> -3
            const cleanValue = String(value).replace(/[()]/g, '');
            localizedStory = localizedStory.replace(new RegExp(`{${key}}`, 'g'), cleanValue);
        });

        return {
            ...questionData,
            renderData: {
                ...questionData.renderData,
                description: localizedStory
            },
            metadata: {
                ...questionData.metadata,
                isWordProblemApplied: true
            }
        };
    }
}