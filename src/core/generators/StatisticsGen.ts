import { MathUtils } from '../utils/MathUtils.js';

export class StatisticsGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_ModeRange(lang);
            case 2: return this.level2_Mean(lang);
            case 3: return this.level3_Median(lang);
            case 4: return this.level4_ReverseMean(lang);
            case 5: return this.level5_FrequencyTable(lang);
            case 6: return this.level6_RealWorldMixed(lang);
            default: return this.level1_ModeRange(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: Mode (Typvärde) & Range (Variationsbredd) ---
    private level1_ModeRange(lang: string): any {
        const scenarios = [
            { id: 'shoe', sv: "skostorlekar", en: "shoe sizes", vals: [36, 37, 38, 39, 40, 41, 42] },
            { id: 'goals', sv: "gjorda mål", en: "goals scored", vals: [0, 1, 2, 3, 4, 5] },
            { id: 'temp', sv: "temperaturer (°C)", en: "temperatures (°C)", vals: [-5, -2, 0, 1, 3, 5, 8] },
            { id: 'age', sv: "åldrar i en grupp", en: "ages in a group", vals: [10, 11, 12, 13, 14, 15] },
            { id: 'dice', sv: "tärningsslag", en: "dice rolls", vals: [1, 2, 3, 4, 5, 6] },
            { id: 'points', sv: "poäng på prov", en: "test points", vals: [5, 6, 7, 8, 9, 10] },
            { id: 'pets', sv: "husdjur per familj", en: "pets per family", vals: [0, 1, 2, 3] }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const len = MathUtils.randomInt(5, 9);
        const list: number[] = [];
        
        // Generate list with a clear Mode
        const modeVal = MathUtils.randomChoice(s.vals);
        for(let i=0; i<3; i++) list.push(modeVal); // Ensure mode exists
        for(let i=0; i<len-3; i++) list.push(MathUtils.randomChoice(s.vals));
        
        // Manual shuffle to avoid dependency
        const shuffled = list.sort(() => Math.random() - 0.5);
        const setStr = shuffled.join(', ');

        const type = MathUtils.randomInt(1, 2); // 1=Mode, 2=Range

        if (type === 1) { // Mode
            const desc = lang === 'sv' 
                ? `Här är en lista över ${s.sv}: ${setStr}. Vad är typvärdet?` 
                : `Here is a list of ${s.en}: ${setStr}. What is the mode?`;
            
            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(modeVal.toString()),
                clues: [
                    { text: lang === 'sv' ? "Typvärdet är det tal som förekommer flest gånger." : "The mode is the number that appears most often." },
                    { text: lang === 'sv' ? `Talet ${modeVal} finns med flest gånger.` : `The number ${modeVal} appears most times.` }
                ]
            };
        } else { // Range
            const min = Math.min(...list);
            const max = Math.max(...list);
            const range = max - min;
            const desc = lang === 'sv'
                ? `Här är en lista över ${s.sv}: ${setStr}. Vad är variationsbredden?`
                : `Here is a list of ${s.en}: ${setStr}. What is the range?`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(range.toString()),
                clues: [
                    { text: lang === 'sv' ? "Variationsbredd = Största värdet - Minsta värdet." : "Range = Max value - Min value." },
                    { latex: `${max} - ${min} = ${range}` }
                ]
            };
        }
    }

    // --- LEVEL 2: Mean (Medelvärde) ---
    private level2_Mean(lang: string): any {
        const scenarios = [
            { sv: "sju kompisar", en: "seven friends", unit: "år", count: 7 },
            { sv: "fem dagar", en: "five days", unit: "°C", count: 5 },
            { sv: "fyra påsar godis", en: "four bags of candy", unit: "g", count: 4 },
            { sv: "tre hopp", en: "three jumps", unit: "m", count: 3 },
            { sv: "sex matcher", en: "six matches", unit: "mål", count: 6 },
            { sv: "fem kvitton", en: "five receipts", unit: "kr", count: 5 },
            { sv: "fyra provresultat", en: "four test scores", unit: "poäng", count: 4 }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const mean = MathUtils.randomInt(5, 20);
        const targetSum = mean * s.count;
        
        let currentSum = 0;
        const list: number[] = [];
        for(let i=0; i<s.count-1; i++) {
            const val = MathUtils.randomInt(1, mean + 5);
            list.push(val);
            currentSum += val;
        }
        const lastVal = targetSum - currentSum;
        list.push(lastVal);
        
        // Safety check for negatives if context forbids
        if ((s.unit === 'år' || s.unit === 'kr' || s.unit === 'g') && lastVal < 0) {
            return this.level2_Mean(lang); // Retry
        }

        const setStr = list.sort(() => Math.random() - 0.5).join(', ');
        
        const desc = lang === 'sv'
            ? `Beräkna medelvärdet för: ${setStr} (${s.unit}).`
            : `Calculate the mean for: ${setStr} (${s.unit}).`;

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(mean.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Addera alla talen först (Summan)." : "Add all numbers first (The Sum).", 
                    latex: `${list.join('+')} = ${targetSum}` 
                },
                { 
                    text: lang === 'sv' ? `Dela summan med antalet tal (${s.count}).` : `Divide the sum by the count (${s.count}).`, 
                    latex: `${targetSum} / ${s.count} = ${mean}` 
                }
            ]
        };
    }

    // --- LEVEL 3: Median ---
    private level3_Median(lang: string): any {
        const scenarios = [
            { sv: "husnummer", en: "house numbers" },
            { sv: "längder (cm)", en: "heights (cm)" },
            { sv: "skostorlekar", en: "shoe sizes" },
            { sv: "tärningsslag", en: "dice rolls" },
            { sv: "åldrar", en: "ages" },
            { sv: "timmar sömn", en: "hours of sleep" },
            { sv: "antal syskon", en: "number of siblings" }
        ];
        const s = MathUtils.randomChoice(scenarios);
        const isOdd = MathUtils.randomInt(0, 1) === 1;
        const len = isOdd ? MathUtils.randomChoice([5, 7, 9]) : MathUtils.randomChoice([4, 6, 8]);
        
        const list: number[] = [];
        for(let i=0; i<len; i++) list.push(MathUtils.randomInt(1, 20));
        
        const shuffled = [...list];
        const sorted = list.sort((a,b) => a-b);
        
        let median = 0;
        let explanation = "";

        if (isOdd) {
            const midIdx = Math.floor(len / 2);
            median = sorted[midIdx];
            explanation = lang === 'sv' 
                ? `Mittenvärdet i den sorterade listan är ${median}.` 
                : `The middle value in the sorted list is ${median}.`;
        } else {
            const mid1 = sorted[len/2 - 1];
            const mid2 = sorted[len/2];
            median = (mid1 + mid2) / 2;
            explanation = lang === 'sv'
                ? `Mitten består av ${mid1} och ${mid2}. Medelvärdet av dem är ${median}.`
                : `The middle is ${mid1} and ${mid2}. The average of them is ${median}.`;
        }

        const desc = lang === 'sv'
            ? `Hitta medianen för dessa ${s.sv}: ${shuffled.sort(() => Math.random() - 0.5).join(', ')}`
            : `Find the median for these ${s.en}: ${shuffled.sort(() => Math.random() - 0.5).join(', ')}`;

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(median.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Först måste du sortera talen i storleksordning!" : "First you must sort the numbers in order!",
                    latex: sorted.join(', ')
                },
                { text: explanation }
            ]
        };
    }

    // --- LEVEL 4: Reverse Mean ---
    private level4_ReverseMean(lang: string): any {
        const scenarios = [
            { sv: "påsar väger", en: "bags weigh" },
            { sv: "personer är", en: "people are" },
            { sv: "prov gav", en: "tests gave" },
            { sv: "dagar var", en: "days were" },
            { sv: "varor kostade", en: "items cost" },
            { sv: "hopp mätte", en: "jumps measured" },
            { sv: "matchers mål", en: "match goals" }
        ];
        const s = MathUtils.randomChoice(scenarios);
        
        const count = 3; 
        const mean = MathUtils.randomInt(5, 15);
        const total = mean * count;
        
        const val1 = MathUtils.randomInt(mean - 4, mean + 4);
        const val2 = MathUtils.randomInt(mean - 4, mean + 4);
        const missing = total - (val1 + val2);

        const desc = lang === 'sv'
            ? `Medelvärdet av tre tal är ${mean}. Två av talen är ${val1} och ${val2}. Vilket är det tredje talet?`
            : `The mean of three numbers is ${mean}. Two numbers are ${val1} and ${val2}. What is the third number?`;

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(missing.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Räkna ut vad summan av alla tre måste vara." : "Calculate what the sum of all three must be.",
                    latex: `Summa = ${mean} \\cdot 3 = ${total}`
                },
                { 
                    text: lang === 'sv' ? "Dra bort de tal du vet från summan." : "Subtract the known numbers from the sum.",
                    latex: `${total} - ${val1} - ${val2} = ${missing}` 
                }
            ]
        };
    }

    // --- LEVEL 5: Frequency Table (VISUAL) ---
    private level5_FrequencyTable(lang: string): any {
        const vals = [1, 2, 3, 4, 5];
        const freqs = [
            MathUtils.randomInt(1, 3),
            MathUtils.randomInt(2, 5),
            MathUtils.randomInt(2, 5),
            MathUtils.randomInt(1, 3),
            MathUtils.randomInt(0, 2)
        ];
        
        let sumProd = 0;
        let totalCount = 0;
        const rows: any[] = [];
        
        vals.forEach((v, i) => {
            const f = freqs[i];
            if (f > 0) {
                sumProd += v * f;
                totalCount += f;
                rows.push([v, f]);
            }
        });

        // Calculate targets
        const mean = Math.round((sumProd / totalCount) * 10) / 10;
        
        const expanded: number[] = [];
        vals.forEach((v, i) => {
            for(let k=0; k<freqs[i]; k++) expanded.push(v);
        });
        const mid = Math.floor(expanded.length / 2);
        const median = expanded.length % 2 !== 0 ? expanded[mid] : (expanded[mid-1] + expanded[mid])/2;

        const isMean = MathUtils.randomInt(0, 1) === 1;
        const target = isMean ? mean : median;
        const targetName = isMean ? (lang==='sv'?'medelvärdet':'the mean') : (lang==='sv'?'medianen':'the median');

        const desc = lang === 'sv'
            ? `Tabellen visar resultat (Värde vs Antal). Beräkna ${targetName}.`
            : `The table shows results (Value vs Count). Calculate ${targetName}.`;

        const headers = lang === 'sv' ? ["Värde", "Antal"] : ["Value", "Count"];

        return {
            renderData: { 
                description: desc,
                answerType: 'numeric',
                geometry: { 
                    type: 'frequency_table', 
                    headers: headers, 
                    rows: rows 
                }
            },
            token: this.toBase64(target.toString()),
            clues: [
                { 
                    text: isMean 
                        ? (lang==='sv' ? "Multiplicera värde med antal för att få summan." : "Multiply value by count to get sum.")
                        : (lang==='sv' ? "Skriv ut alla talen på en rad: 1, 1, 2, 2, 2..." : "Write out all numbers: 1, 1, 2, 2, 2...")
                },
                {
                    latex: isMean 
                        ? `\\frac{${sumProd}}{${totalCount}}` 
                        : `\\text{Mitten} = ${target}`
                }
            ]
        };
    }

    // --- LEVEL 6: Real World Mixed ---
    private level6_RealWorldMixed(lang: string): any {
        const type = MathUtils.randomInt(1, 2);
        
        if (type === 1) {
            const desc = lang === 'sv'
                ? `Löner: 20k, 21k, 22k, 20.5k, 1000k. Vilket mått beskriver "vanlig lön" bäst: Medelvärde eller Median? (Svara med ordet)`
                : `Salaries: 20k, 21k, 22k, 20.5k, 1000k. Which measure fits best: Mean or Median? (Answer with word)`;
            
            return {
                renderData: { description: desc, answerType: 'text' },
                token: this.toBase64("Median"),
                clues: [{ text: lang === 'sv' ? "Medelvärdet påverkas mycket av det jättestora talet (1000k)." : "The mean is heavily affected by the outlier (1000k)." }]
            };
        } else {
            const desc = lang === 'sv'
                ? `Talserie: 1, 1, 2, 8, 9. Beräkna differensen mellan Medelvärde och Median.`
                : `List: 1, 1, 2, 8, 9. Calculate the difference between Mean and Median.`;
            
            // Mean = 21/5 = 4.2. Median = 2. Diff = 2.2
            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64("2.2"),
                clues: [
                    { latex: `\\text{Medel} = 21/5 = 4.2` },
                    { latex: `\\text{Median} = 2` },
                    { latex: `4.2 - 2 = 2.2` }
                ]
            };
        }
    }
}