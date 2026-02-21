import { MathUtils } from '../utils/MathUtils.js';

export class StatisticsGen {
    // --- CONTEXT LIBRARY ---
    private static readonly SCENARIOS = {
        lists: [
            { id: 'shoe', sv: "skostorlekar", en: "shoe sizes", unit: "", min: 36, max: 45 },
            { id: 'goals', sv: "gjorda mål", en: "goals scored", unit: " mål", min: 0, max: 5 },
            { id: 'temp', sv: "temperaturer", en: "temperatures", unit: "°C", min: 12, max: 24 },
            { id: 'age', sv: "åldrar", en: "ages", unit: " år", min: 11, max: 17 },
            { id: 'points', sv: "poäng", en: "points", unit: " p", min: 5, max: 25 }
        ],
        real_world: [
            { id: 'salary', sv: "månadslöner", en: "monthly salaries", unit: " kr", min: 28, max: 45, suffix: 'k' },
            { id: 'price', sv: "huspriser", en: "house prices", unit: " kr", min: 3, max: 9, suffix: ' milj.' }
        ]
    };

    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 is mastered, push to mean calculations
        if (level === 1 && options.hideConcept && options.exclude?.includes('stats_lie')) {
            return this.level2_Mean(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_ModeRange(lang, undefined, options);
            case 2: return this.level2_Mean(lang, undefined, options);
            case 3: return this.level3_Median(lang, undefined, options);
            case 4: return this.level4_ReverseMean(lang, undefined, options);
            case 5: return this.level5_FrequencyTable(lang, undefined, options);
            case 6: return this.level6_RealWorldMixed(lang, undefined, options);
            default: return this.level1_ModeRange(lang, undefined, options);
        }
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'find_mode':
            case 'find_range':
            case 'stats_lie':
            case 'find_min_max':
                return this.level1_ModeRange(lang, key);
            case 'calc_mean':
            case 'mean_concept_balance':
            case 'mean_negatives':
                return this.level2_Mean(lang, key);
            case 'median_odd':
            case 'median_even':
            case 'median_lie':
                return this.level3_Median(lang, key);
            case 'reverse_mean_calc':
            case 'mean_target_score':
                return this.level4_ReverseMean(lang, key);
            case 'freq_mean':
            case 'freq_count':
            case 'freq_mode':
            case 'freq_range':
                return this.level5_FrequencyTable(lang, key);
            case 'real_outlier_shift':
            case 'real_measure_choice':
            case 'real_weighted_avg':
            case 'real_weighted_missing':
                return this.level6_RealWorldMixed(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: MODE & RANGE (Atomic Clues) ---
    private level1_ModeRange(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'find_mode', type: 'calculate' },
            { key: 'find_range', type: 'calculate' },
            { key: 'find_min_max', type: 'calculate' },
            { key: 'stats_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.lists);
        
        const count = MathUtils.randomInt(6, 8);
        const modeVal = MathUtils.randomInt(s.min, s.max);
        const list = [modeVal, modeVal, modeVal]; // Ensure a clear mode
        while(list.length < count) list.push(MathUtils.randomInt(s.min, s.max));
        
        const shuffled = MathUtils.shuffle([...list]);
        const setStr = shuffled.join(', ');

        if (v === 'find_mode') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Studera listan över ${s.sv}: ${setStr}. Vilket är typvärdet?` : `Examine the list of ${s.en}: ${setStr}. What is the mode?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(modeVal.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Typvärdet är det tal som förekommer flest gånger i en samling data." : "Step 1: The mode is the number that appears most frequently in a data set." },
                    { text: lang === 'sv' ? "Gå igenom listan och räkna hur många gånger varje tal dyker upp." : "Go through the list and count how many times each number appears." },
                    { text: lang === 'sv' ? `Talet ${modeVal} förekommer 3 gånger, vilket är mer än något annat tal.` : `The number ${modeVal} appears 3 times, which is more than any other number.` },
                    { text: lang === 'sv' ? `Svar: ${modeVal}` : `Answer: ${modeVal}` }
                ]
            };
        }

        const min = Math.min(...list);
        const max = Math.max(...list);
        const range = max - min;

        if (v === 'find_range') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna variationsbredden för följande ${s.sv}: ${setStr}.` : `Calculate the range for the following ${s.en}: ${setStr}.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(range.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Variationsbredden är skillnaden mellan det största och det minsta värdet i listan." : "Step 1: The range is the difference between the largest and the smallest value in the list." },
                    { text: lang === 'sv' ? `Steg 2: Hitta det största talet i listan.` : `Step 2: Find the largest number in the list.`, latex: `\\text{Max} = ${max}` },
                    { text: lang === 'sv' ? `Steg 3: Hitta det minsta talet i listan.` : `Step 3: Find the smallest number in the list.`, latex: `\\text{Min} = ${min}` },
                    { text: lang === 'sv' ? "Steg 4: Subtrahera det minsta värdet från det största." : "Step 4: Subtract the smallest value from the largest.", latex: `${max} - ${min} = ${range}` },
                    { text: lang === 'sv' ? `Svar: ${range}` : `Answer: ${range}` }
                ]
            };
        }

        // find_min_max default
        const isMin = Math.random() > 0.5;
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket är det ${isMin ? 'minsta' : 'största'} värdet i listan: ${setStr}?` : `What is the ${isMin ? 'minimum' : 'maximum'} value in the list: ${setStr}?`,
                answerType: 'numeric'
            },
            token: this.toBase64((isMin ? min : max).toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Leta igenom listan metodiskt för att hitta det ${isMin ? 'lägsta' : 'högsta'} värdet.` : `Search the list methodically to find the ${isMin ? 'lowest' : 'highest'} value.` },
                { text: lang === 'sv' ? `Svar: ${isMin ? min : max}` : `Answer: ${isMin ? min : max}` }
            ]
        };
    }

    // --- LEVEL 2: MEAN (Atomic Clues) ---
    private level2_Mean(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'calc_mean', type: 'calculate' },
            { key: 'mean_negatives', type: 'calculate' },
            { key: 'mean_concept_balance', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.lists);

        if (v === 'mean_concept_balance') {
            const mean = 20;
            const newVal = MathUtils.randomChoice([10, 30]);
            const isLower = newVal < mean;
            const ans = isLower ? (lang === 'sv' ? "Det minskar" : "It decreases") : (lang === 'sv' ? "Det ökar" : "It increases");
            return {
                renderData: {
                    description: lang === 'sv' ? `Om medelvärdet för en grupp är ${mean} och vi lägger till ett nytt värde på ${newVal}, vad händer då med medelvärdet?` : `If the mean for a group is ${mean} and we add a new value of ${newVal}, what happens to the mean?`,
                    answerType: 'multiple_choice', options: lang === 'sv' ? ["Det ökar", "Det minskar", "Det förblir samma"] : ["It increases", "It decreases", "It remains the same"]
                },
                token: this.toBase64(ans), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Medelvärdet kan ses som en balanspunkt för alla värden." : "Step 1: The mean can be seen as a balance point for all values." },
                    { text: lang === 'sv' ? `Steg 2: Om det nya värdet (${newVal}) är lägre än snittet (${mean}), kommer det att dra ner balansen.` : `Step 2: If the new value (${newVal}) is lower than the average (${mean}), it will pull down the balance.` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const count = 5;
        const list = Array.from({length: count}, () => MathUtils.randomInt(s.min, s.max));
        const sum = list.reduce((a, b) => a + b, 0);
        const mean = sum / count;

        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna medelvärdet för följande ${s.sv}: ${list.join(', ')}.` : `Calculate the mean for the following ${s.en}: ${list.join(', ')}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(mean.toString()), variationKey: 'calc_mean', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Medelvärdet beräknas genom att dela den totala summan med antalet värden." : "Step 1: The mean is calculated by dividing the total sum by the count of values." },
                { text: lang === 'sv' ? "Steg 2: Addera alla tal i listan för att få totalsumman." : "Step 2: Add all the numbers in the list to get the total sum.", latex: `${list.join(' + ')} = ${sum}` },
                { text: lang === 'sv' ? `Steg 3: Dividera summan (${sum}) med antalet observationer (${count}).` : `Step 3: Divide the sum (${sum}) by the number of observations (${count}).`, latex: `\\frac{${sum}}{${count}} = ${mean}` },
                { text: lang === 'sv' ? `Svar: ${mean}` : `Answer: ${mean}` }
            ]
        };
    }

    // --- LEVEL 3: MEDIAN ---
    private level3_Median(lang: string, variationKey?: string, options: any = {}): any {
        const count = MathUtils.randomChoice([5, 7]); // Always odd for base clarity
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.lists);
        const list = Array.from({length: count}, () => MathUtils.randomInt(s.min, s.max));
        const sorted = [...list].sort((a, b) => a - b);
        const median = sorted[Math.floor(count / 2)];

        return {
            renderData: {
                description: lang === 'sv' ? `Bestäm medianen för följande ${s.sv}: ${list.join(', ')}.` : `Determine the median for the following ${s.en}: ${list.join(', ')}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(median.toString()), variationKey: 'median_odd', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: För att hitta medianen måste talen först sorteras i storleksordning." : "Step 1: To find the median, the numbers must first be sorted in order of size." },
                { text: lang === 'sv' ? "Sorterad lista:" : "Sorted list:", latex: sorted.join(', ') },
                { text: lang === 'sv' ? `Steg 2: Identifiera det mittersta talet i den sorterade listan.` : `Step 2: Identify the middle number in the sorted list.` },
                { text: lang === 'sv' ? `Svaret är talet som står på plats ${Math.ceil(count/2)}.` : `The answer is the number at position ${Math.ceil(count/2)}.` },
                { text: lang === 'sv' ? `Svar: ${median}` : `Answer: ${median}` }
            ]
        };
    }

    // --- LEVEL 4: REVERSE MEAN ---
    private level4_ReverseMean(lang: string, variationKey?: string, options: any = {}): any {
        const count = 4;
        const mean = MathUtils.randomInt(12, 18);
        const total = mean * count;
        const v1 = MathUtils.randomInt(8, 12), v2 = MathUtils.randomInt(15, 20), v3 = MathUtils.randomInt(10, 15);
        const missing = total - (v1 + v2 + v3);

        return {
            renderData: {
                description: lang === 'sv' ? `Medelvärdet av fyra tal är ${mean}. Tre av talen är ${v1}, ${v2} och ${v3}. Vilket är det fjärde talet?` : `The mean of four numbers is ${mean}. Three of the numbers are ${v1}, ${v2}, and ${v3}. What is the fourth number?`,
                answerType: 'numeric'
            },
            token: this.toBase64(missing.toString()), variationKey: 'reverse_mean_calc', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Beräkna vad den totala summan av de fyra talen måste vara." : "Step 1: Calculate what the total sum of the four numbers must be." },
                { text: lang === 'sv' ? `Multiplicera medelvärdet med antalet tal.` : `Multiply the mean by the count of numbers.`, latex: `${mean} · 4 = ${total}` },
                { text: lang === 'sv' ? "Steg 2: Beräkna summan av de tre kända talen." : "Step 2: Calculate the sum of the three known numbers.", latex: `${v1} + ${v2} + ${v3} = ${v1 + v2 + v3}` },
                { text: lang === 'sv' ? "Steg 3: Dra bort den kända summan från totalsumman för att hitta det saknade talet." : "Step 3: Subtract the known sum from the total sum to find the missing number.", latex: `${total} - ${v1+v2+v3} = ${missing}` },
                { text: lang === 'sv' ? `Svar: ${missing}` : `Answer: ${missing}` }
            ]
        };
    }

    // --- LEVEL 5: FREQUENCY TABLE (Visual-Safe) ---
    private level5_FrequencyTable(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || 'freq_count';
        const vals = [1, 2, 3, 4];
        const freqs = [MathUtils.randomInt(2, 4), MathUtils.randomInt(4, 6), MathUtils.randomInt(2, 4), MathUtils.randomInt(1, 2)];
        const rows = vals.map((v, i) => [v, freqs[i]]);
        const totalCount = freqs.reduce((a, b) => a + b, 0);

        if (v === 'freq_count') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Hur många observationer (totalt antal) visas i frekvenstabellen?" : "How many observations (total count) are shown in the frequency table?",
                    answerType: 'numeric',
                    geometry: { type: 'frequency_table', headers: lang === 'sv' ? ['Värde', 'Antal'] : ['Value', 'Count'], rows }
                },
                token: this.toBase64(totalCount.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: 'Antal' (frekvens) visar hur många gånger varje värde har mätts." : "Step 1: 'Count' (frequency) shows how many times each value was measured." },
                    { text: lang === 'sv' ? "Steg 2: Addera alla siffror i kolumnen för antal." : "Step 2: Add all the numbers in the count column.", latex: freqs.join(' + ') + ` = ${totalCount}` },
                    { text: lang === 'sv' ? `Svar: ${totalCount}` : `Answer: ${totalCount}` }
                ]
            };
        }

        const modeIdx = freqs.indexOf(Math.max(...freqs));
        const mode = vals[modeIdx];
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket är typvärdet enligt tabellen?" : "What is the mode according to the table?",
                answerType: 'numeric',
                geometry: { type: 'frequency_table', headers: lang === 'sv' ? ['Värde', 'Antal'] : ['Value', 'Count'], rows }
            },
            token: this.toBase64(mode.toString()), variationKey: 'freq_mode', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Typvärdet är det värde som förekommer flest gånger (har högst frekvens)." : "Step 1: The mode is the value that appears most often (has the highest frequency)." },
                { text: lang === 'sv' ? `Steg 2: Leta efter det största talet i kolumnen 'Antal'.` : `Step 2: Look for the largest number in the 'Count' column.` },
                { text: lang === 'sv' ? `Det största antalet är ${freqs[modeIdx]}, vilket hör till värdet ${mode}.` : `The largest count is ${freqs[modeIdx]}, which belongs to the value ${mode}.` },
                { text: lang === 'sv' ? `Svar: ${mode}` : `Answer: ${mode}` }
            ]
        };
    }

    // --- LEVEL 6: REAL WORLD MIXED (Outliers) ---
    private level6_RealWorldMixed(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || 'real_measure_choice';

        if (v === 'real_measure_choice') {
            const ans = lang === 'sv' ? "Median" : "Median";
            return {
                renderData: {
                    description: lang === 'sv' ? "Om en datamängd innehåller ett extremt värde (ett 'outlier'), vilket lägesmått är oftast mest rättvisande?" : "If a data set contains an extreme value (an 'outlier'), which measure of center is usually most accurate?",
                    answerType: 'multiple_choice', options: lang === 'sv' ? ["Medelvärde", "Median", "Typvärde"] : ["Mean", "Median", "Mode"]
                },
                token: this.toBase64(ans), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Medelvärdet påverkas mycket av extremvärden eftersom alla tal räknas in i summan." : "Step 1: The mean is heavily affected by outliers because all numbers are included in the sum." },
                    { text: lang === 'sv' ? "Steg 2: Medianen är mer stabil eftersom den bara bryr sig om vilket tal som hamnar i mitten." : "Step 2: The median is more stable because it only cares about which number ends up in the middle." },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        // Weighted Average Missing Value
        const weight1 = 2, weight2 = 3;
        const val1 = 20, mean = 26;
        const totalSum = mean * (weight1 + weight2);
        const missingSum = totalSum - (val1 * weight1);
        const ansVal = missingSum / weight2;

        return {
            renderData: {
                description: lang === 'sv' ? `Du köper 2 kg äpplen för 20 kr/kg och 3 kg till av en annan sort. Medelpriset blir 26 kr/kg. Vad kostade den andra sorten per kg?` : `You buy 2 kg of apples for 20 kr/kg and 3 kg of another kind. The mean price becomes 26 kr/kg. What was the price of the other kind per kg?`,
                answerType: 'numeric'
            },
            token: this.toBase64(ansVal.toString()), variationKey: 'real_weighted_missing', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Beräkna vad den totala kostnaden för alla 5 kg blev." : "Step 1: Calculate the total cost for all 5 kg." },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `5 · 26 = ${totalSum}` },
                { text: lang === 'sv' ? "Steg 2: Dra bort kostnaden för de första 2 kilona." : "Step 2: Subtract the cost for the first 2 kg.", latex: `${totalSum} - (2 · 20) = ${missingSum}` },
                { text: lang === 'sv' ? "Steg 3: Dela den återstående kostnaden på de 3 kilona av den andra sorten." : "Step 3: Divide the remaining cost by the 3 kg of the other kind.", latex: `\\frac{${missingSum}}{3} = ${ansVal}` },
                { text: lang === 'sv' ? `Svar: ${ansVal}` : `Answer: ${ansVal}` }
            ]
        };
    }

    private level7_Mixed(lang: string, options: any): any {
        const subLevel = MathUtils.randomInt(1, 6);
        return this.generate(subLevel, lang, options);
    }
}