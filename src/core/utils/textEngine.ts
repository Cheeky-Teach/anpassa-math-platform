import { Random } from "./random";

export interface LocalizedText {
    sv: string;
    en: string;
}

export type ContextKey = 'shopping' | 'school' | 'hobbies' | 'age';

interface ContextData {
    items: LocalizedText[];
    people: string[];
}

export const CONTEXTS: Record<ContextKey, ContextData> = {
    shopping: {
        items: [
            { sv: "äpplen", en: "apples" },
            { sv: "pennor", en: "pens" },
            { sv: "böcker", en: "books" },
            { sv: "godisbitar", en: "candies" },
            { sv: "tidningar", en: "magazines" },
            { sv: "bananer", en: "bananas" },
            { sv: "apelsiner", en: "oranges" },
            { sv: "chokladkakor", en: "chocolate bars" },
            { sv: "läskburkar", en: "soda cans" },
            { sv: "mjölkpaket", en: "milk cartons" },
            { sv: "brödlimpor", en: "loaves of bread" },
            { sv: "ostbitar", en: "pieces of cheese" },
            { sv: "kex", en: "biscuits" },
            { sv: "tuggummin", en: "gums" },
            { sv: "glassar", en: "ice creams" },
            { sv: "flaskor vatten", en: "bottles of water" },
            { sv: "chips", en: "chips" },
            { sv: "ägg", en: "eggs" },
            { sv: "tomater", en: "tomatoes" },
            { sv: "gurkor", en: "cucumbers" }
        ],
        people: ["Kim", "Alex", "Charlie", "Mika", "Robin", "Sasha", "Lo", "Eli", "Sam", "Noa"]
    },
    school: {
        items: [
            { sv: "suddgummin", en: "erasers" },
            { sv: "linjaler", en: "rulers" },
            { sv: "skrivböcker", en: "notebooks" },
            { sv: "markeingspennor", en: "markers" },
            { sv: "blyertspennor", en: "pencils" },
            { sv: "pennvässare", en: "pencil sharpeners" },
            { sv: "ryggsäckar", en: "backpacks" },
            { sv: "miniräknare", en: "calculators" },
            { sv: "gem", en: "paper clips" },
            { sv: "häftapparater", en: "staplers" },
            { sv: "saxar", en: "scissors" },
            { sv: "limstift", en: "glue sticks" },
            { sv: "mappar", en: "folders" },
            { sv: "kritor", en: "crayons" },
            { sv: "whiteboardpennor", en: "whiteboard markers" },
            { sv: "geometrikit", en: "geometry kits" },
            { sv: "passare", en: "compasses" },
            { sv: "gradskivor", en: "protractors" },
            { sv: "papper", en: "papers" },
            { sv: "böcker", en: "textbooks" }
        ],
        people: ["läraren", "eleven", "rektorn", "vaktmästaren", "bibliotekarien", "skolsyster", "syokonsulenten", "bildläraren", "idrottsläraren", "musikläraren"]
    },
    hobbies: {
        items: [
            { sv: "fotbollskort", en: "soccer cards" },
            { sv: "frimärken", en: "stamps" },
            { sv: "mynt", en: "coins" },
            { sv: "snäckor", en: "seashells" },
            { sv: "klistermärken", en: "stickers" },
            { sv: "pokémonkort", en: "Pokémon cards" },
            { sv: "glaskulor", en: "marbles" },
            { sv: "stenar", en: "stones" },
            { sv: "fjädrar", en: "feathers" },
            { sv: "knappar", en: "buttons" },
            { sv: "serietidningar", en: "comic books" },
            { sv: "actionfigurer", en: "action figures" },
            { sv: "bilar", en: "toy cars" },
            { sv: "dockor", en: "dolls" },
            { sv: "nyckelringar", en: "keychains" },
            { sv: "vykort", en: "postcards" },
            { sv: "poster", en: "posters" },
            { sv: "medaljer", en: "medals" },
            { sv: "troféer", en: "trophies" },
            { sv: "pusselbitar", en: "puzzle pieces" }
        ],
        people: ["Sam", "Noa", "Leo", "Mia", "Ella", "Liam", "William", "Elias", "Hugo", "Alice", "Maja", "Elsa", "Astrid", "Wilma", "Freja", "Olivia", "Selma", "Alma", "Signe", "Ebba"]
    },
    age: {
        items: [
            { sv: "år", en: "years" }
        ],
        people: ["Anna", "Björn", "Cecilia", "David", "Erik", "Fia", "Gustav", "Hanna", "Isak", "Julia", "Kalle", "Lisa", "Magnus", "Nina", "Oskar", "Petra", "Qasim", "Rebecka", "Simon", "Tove"]
    }
};

export class TextEngine {
    /**
     * Replaces placeholders like {name} or {value} in a string with actual values.
     */
    public static fillTemplate(template: string, replacements: Record<string, string | number>): string {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return replacements[key] !== undefined ? String(replacements[key]) : match;
        });
    }

    public static getRandomContextItem(rng: Random, context: ContextKey, lang: 'sv' | 'en'): string {
        const ctx = CONTEXTS[context];
        const item = rng.pick(ctx.items);
        return item[lang];
    }

    public static getRandomName(rng: Random, context: ContextKey): string {
        return rng.pick(CONTEXTS[context].people);
    }
}