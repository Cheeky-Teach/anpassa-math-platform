import { MathUtils } from '../utils/MathUtils.js';

export class StatisticsGen {
    // --- CONTEXT LIBRARY ---
    private static readonly SCENARIOS = {
        lists: [
            { id: 'shoe', sv: "skostorlekar", en: "shoe sizes", unit: "", min: 35, max: 45 },
            { id: 'goals', sv: "gjorda mål", en: "goals scored", unit: "mål", min: 0, max: 6 },
            { id: 'temp', sv: "temperaturer", en: "temperatures", unit: "°C", min: 15, max: 25 },
            { id: 'age', sv: "åldrar", en: "ages", unit: "år", min: 10, max: 16 },
            { id: 'points', sv: "poäng", en: "points", unit: "p", min: 5, max: 20 },
            { id: 'height', sv: "längder", en: "heights", unit: "cm", min: 150, max: 170 },
            { id: 'sleep', sv: "sömntimmar", en: "hours of sleep", unit: "h", min: 6, max: 10 }
        ],
        real_world: [
            { sv: "löner", en: "salaries", unit: "kr", min: 25, max: 45, suffix: 'k' },
            { sv: "huspriser", en: "house prices", unit: "kr", min: 2, max: 8, suffix: ' milj.' },
            { sv: "tävlingsresultat", en: "competition scores", unit: "p", min: 50, max: 100, suffix: '' }
        ],
        shopping: [
            { sv: "äpplen", en: "apples", unit: "kr/kg", min: 15, max: 35 },
            { sv: "godis", en: "candy", unit: "kr/hg", min: 8, max: 15 },
            { sv: "potatis", en: "potatoes", unit: "kr/kg", min: 10, max: 20 },
            { sv: "oxfilé", en: "beef fillet", unit: "kr/kg", min: 300, max: 600 },
            { sv: "lax", en: "salmon", unit: "kr/kg", min: 200, max: 400 }
        ]
    };

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

    // --- LEVEL 1: MODE & RANGE ---
    private level1_ModeRange(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['find_mode', 'find_range', 'stats_lie', 'find_min_max']);
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.lists);
        const len = MathUtils.randomInt(6, 9);
        const list: number[] = [];
        
        const modeVal = MathUtils.randomInt(s.min, s.max);
        if (v !== 'find_min_max') {
            for(let i=0; i<3; i++) list.push(modeVal); 
            for(let i=0; i<len-3; i++) list.push(MathUtils.randomInt(s.min, s.max));
        } else {
            for(let i=0; i<len; i++) list.push(MathUtils.randomInt(s.min, s.max));
        }
        
        const shuffled = [...list].sort(() => Math.random() - 0.5);
        const setStr = shuffled.join(', ');

        if (v === 'find_mode') {
            return {
                renderData: { 
                    description: lang === 'sv' ? `Vilket är typvärdet för följande ${s.sv}: ${setStr}?` : `What is the mode for the following ${s.en}: ${setStr}?`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(modeVal.toString()),
                clues: [
                    { text: lang === 'sv' ? "Typvärdet är det värde som förekommer flest gånger i datamängden." : "The mode is the value that appears most frequently in the data set." },
                    { text: lang === 'sv' ? `Värdet som upprepas mest är:` : `The value repeated the most is:`, latex: `${modeVal}` }
                ],
                metadata: { variation_key: 'find_mode', difficulty: 1 }
            };
        }

        if (v === 'find_range') {
            const min = Math.min(...list);
            const max = Math.max(...list);
            const range = max - min;
            return {
                renderData: { 
                    description: lang === 'sv' ? `Beräkna variationsbredden för dessa ${s.sv}: ${setStr}.` : `Calculate the range for these ${s.en}: ${setStr}.`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(range.toString()),
                clues: [
                    { text: lang === 'sv' ? "Variationsbredden är skillnaden mellan det största och det minsta värdet." : "The range is the difference between the largest and the smallest value." },
                    { text: lang === 'sv' ? "Hitta max och min och beräkna differensen:" : "Find the max and min and calculate the difference:", latex: `${max} - ${min} = ${range}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${range}` }
                ],
                metadata: { variation_key: 'find_range', difficulty: 1 }
            };
        }

        if (v === 'find_min_max') {
            const min = Math.min(...list);
            const max = Math.max(...list);
            const isMin = Math.random() > 0.5;
            const ans = isMin ? min : max;
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilket är det ${isMin ? 'minsta' : 'största'} värdet i listan: ${setStr}?` : `What is the ${isMin ? 'minimum' : 'maximum'} value in the list: ${setStr}?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Leta igenom listan metodiskt efter det ${isMin ? 'lägsta' : 'högsta'} talet.` : `Search the list methodically for the ${isMin ? 'lowest' : 'highest'} number.` },
                    { text: lang === 'sv' ? "Värdet är:" : "The value is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'find_min_max', difficulty: 1 }
            };
        }

        const minVal = Math.min(...list);
        const maxVal = Math.max(...list);
        const rangeVal = maxVal - minVal;
        const sFalse = lang === 'sv' ? `Minsta värdet är ${minVal - 2}` : `Min value is ${minVal - 2}`;

        return {
            renderData: {
                description: lang === 'sv' ? `Granska listan: ${setStr}. Vilket påstående är FALSKT?` : `Review the list: ${setStr}. Which statement is FALSE?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([
                    lang === 'sv' ? `Typvärdet är ${modeVal}` : `Mode is ${modeVal}`,
                    lang === 'sv' ? `Variationsbredden är ${rangeVal}` : `Range is ${rangeVal}`,
                    sFalse
                ])
            },
            token: this.toBase64(sFalse),
            clues: [
                { text: lang === 'sv' ? "Kontrollera påståendena genom att identifiera min, max och typvärde i listan." : "Verify the statements by identifying min, max, and mode in the list." },
                { text: lang === 'sv' ? "Detta påstående stämmer inte:" : "This statement is not correct:", latex: `\\text{${sFalse}}` }
            ],
            metadata: { variation_key: 'stats_lie', difficulty: 2 }
        };
    }

    // --- LEVEL 2: MEAN ---
    private level2_Mean(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['calc_mean', 'mean_concept_balance', 'mean_negatives']);
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.lists);

        if (v === 'mean_negatives' || s.id === 'temp') {
            const list = Array.from({length: 4}, () => MathUtils.randomInt(-5, 5));
            const sum = list.reduce((a, b) => a + b, 0);
            const mean = Math.round((sum / 4) * 10) / 10;
            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna medeltemperaturen för: ${list.join('°C, ')}°C.` : `Calculate the mean temperature for: ${list.join('°C, ')}°C.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(mean.toString()),
                clues: [
                    { text: lang === 'sv' ? "Summan av värdena delat med antalet värden ger medelvärdet." : "The sum of the values divided by the count of values gives the mean." },
                    { text: lang === 'sv' ? "Beräkna summan först (tänk på tecknen):" : "Calculate the sum first (watch the signs):", latex: `${list.join(' + ')} = ${sum}` },
                    { text: lang === 'sv' ? "Dela summan med 4:" : "Divide the sum by 4:", latex: `\\frac{${sum}}{4} = ${mean}` },
                    { text: lang === 'sv' ? "Medelvärdet är:" : "The mean is:", latex: `${mean}` }
                ],
                metadata: { variation_key: 'mean_negatives', difficulty: 3 }
            };
        }

        if (v === 'mean_concept_balance') {
            const oldMean = 20;
            const newVal = MathUtils.randomChoice([10, 30]);
            const isLower = newVal < oldMean;
            const ans = isLower ? (lang === 'sv' ? "Det minskar" : "It decreases") : (lang === 'sv' ? "Det ökar" : "It increases");
            return {
                renderData: {
                    description: lang === 'sv' ? `Om medelvärdet är ${oldMean} och ett nytt värde på ${newVal} läggs till, vad händer med medelvärdet?` : `If the mean is ${oldMean} and a new value of ${newVal} is added, what happens to the mean?`,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Det ökar", "Det minskar", "Det är oförändrat"] : ["It increases", "It decreases", "It stays unchanged"]
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Om ett värde som är lägre än det nuvarande snittet läggs till så sjunker medelvärdet. Om det är högre så stiger det." : "If a value lower than the current average is added, the mean drops. If it is higher, it rises." },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `\\text{${ans}}` }
                ],
                metadata: { variation_key: 'mean_concept_balance', difficulty: 2 }
            };
        }

        const count = MathUtils.randomInt(4, 5);
        const list = Array.from({length: count}, () => MathUtils.randomInt(s.min, s.max));
        const sum = list.reduce((a, b) => a + b, 0);
        const mean = Math.round((sum / count) * 10) / 10;

        return {
            renderData: {
                description: lang === 'sv' ? `Räkna ut medelvärdet för: ${list.join(', ')}.` : `Calculate the mean for: ${list.join(', ')}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(mean.toString()),
            clues: [
                { text: lang === 'sv' ? "Addera alla tal för att få totalsumman." : "Add all numbers to get the total sum.", latex: `${list.join(' + ')} = ${sum}` },
                { text: lang === 'sv' ? `Dividera summan med antalet tal (${count}).` : `Divide the sum by the number of values (${count}).`, latex: `\\frac{${sum}}{${count}} = ${mean}` },
                { text: lang === 'sv' ? "Medelvärdet blir:" : "The mean becomes:", latex: `${mean}` }
            ],
            metadata: { variation_key: 'calc_mean', difficulty: 2 }
        };
    }

    // --- LEVEL 3: MEDIAN ---
    private level3_Median(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['median_odd', 'median_even', 'median_lie']);
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.lists);
        const count = v === 'median_even' ? 6 : 5;
        const list = Array.from({length: count}, () => MathUtils.randomInt(s.min, s.max));
        const sorted = [...list].sort((a, b) => a - b);
        
        let median = 0;
        if (count % 2 !== 0) {
            median = sorted[Math.floor(count / 2)];
        } else {
            median = (sorted[count/2 - 1] + sorted[count/2]) / 2;
        }

        if (v === 'median_lie') {
            const sTrue = lang === 'sv' ? `Medianen är ${median}` : `Median is ${median}`;
            const sLie = lang === 'sv' ? `Medianen är ${sorted[0]}` : `Median is ${sorted[0]}`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Givet listan ${list.join(', ')}, vilket påstående stämmer?` : `Given the list ${list.join(', ')}, which statement is true?`,
                    answerType: 'multiple_choice',
                    options: [sTrue, sLie]
                },
                token: this.toBase64(sTrue),
                clues: [
                    { text: lang === 'sv' ? "Sortera talen och hitta det mittersta värdet för att bestämma medianen." : "Sort the numbers and find the middle value to determine the median.", latex: sorted.join(', ') },
                    { text: lang === 'sv' ? "Rätt svar är:" : "The correct answer is:", latex: `\\text{${sTrue}}` }
                ],
                metadata: { variation_key: 'median_lie', difficulty: 2 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? `Bestäm medianen för: ${list.sort(() => Math.random() - 0.5).join(', ')}.` : `Determine the median for: ${list.sort(() => Math.random() - 0.5).join(', ')}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(median.toString()),
            clues: [
                { text: lang === 'sv' ? "Sortera först talen i storleksordning." : "First, sort the numbers in size order.", latex: sorted.join(', ') },
                { text: lang === 'sv' ? (count % 2 !== 0 ? "Eftersom det är ett udda antal tal är medianen talet i mitten." : "Vid ett jämnt antal tal är medianen snittet av de två talen i mitten.") : (count % 2 !== 0 ? "Since there is an odd number of values, the median is the number in the middle." : "With an even number of values, the median is the average of the two numbers in the middle."), latex: count % 2 !== 0 ? `${median}` : `\\frac{${sorted[count/2 - 1]} + ${sorted[count/2]}}{2} = ${median}` },
                { text: lang === 'sv' ? "Medianen är:" : "The median is:", latex: `${median}` }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // --- LEVEL 4: REVERSE MEAN ---
    private level4_ReverseMean(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['reverse_mean_calc', 'mean_target_score']);
        
        if (v === 'mean_target_score') {
            const score1 = MathUtils.randomInt(10, 15), score2 = MathUtils.randomInt(12, 18);
            const targetMean = 16;
            const required = (targetMean * 3) - score1 - score2;
            return {
                renderData: {
                    description: lang === 'sv' ? `Du har ${score1} och ${score2} poäng på två prov. Vad krävs på det tredje provet för att snittet ska bli ${targetMean}?` : `You have ${score1} and ${score2} points on two tests. What is required on the third test for the average to be ${targetMean}?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(required.toString()),
                clues: [
                    { text: lang === 'sv' ? `Räkna ut vad den totala summan av 3 prov måste vara.` : `Calculate what the total sum of 3 tests must be.`, latex: `3 \\cdot ${targetMean} = ${targetMean * 3}` },
                    { text: lang === 'sv' ? `Dra bort de poäng du redan har från målet.` : `Subtract the points you already have from the target.`, latex: `${targetMean * 3} - ${score1} - ${score2} = ${required}` },
                    { text: lang === 'sv' ? "Du behöver:" : "You need:", latex: `${required}` }
                ],
                metadata: { variation_key: 'mean_target_score', difficulty: 4 }
            };
        }

        const count = 4, mean = 15;
        const total = mean * count;
        const v1 = 12, v2 = 18, v3 = 14;
        const missing = total - (v1 + v2 + v3);

        return {
            renderData: {
                description: lang === 'sv' ? `Medelvärdet av fyra tal är ${mean}. Tre av talen är ${v1}, ${v2} och ${v3}. Vad är det fjärde?` : `The mean of four numbers is ${mean}. Three of the numbers are ${v1}, ${v2}, and ${v3}. What is the fourth?`,
                answerType: 'numeric'
            },
            token: this.toBase64(missing.toString()),
            clues: [
                { text: lang === 'sv' ? "Beräkna den totala summan utifrån medelvärdet." : "Calculate the total sum based on the mean.", latex: `${mean} \\cdot 4 = ${total}` },
                { text: lang === 'sv' ? "Dra bort summan av de kända talen från totalsumman." : "Subtract the sum of the known numbers from the total sum.", latex: `${total} - (${v1} + ${v2} + ${v3}) = ${missing}` },
                { text: lang === 'sv' ? "Det fjärde talet är:" : "The fourth number is:", latex: `${missing}` }
            ],
            metadata: { variation_key: 'reverse_mean_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 5: FREQUENCY TABLES ---
    private level5_FrequencyTable(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['freq_mean', 'freq_count', 'freq_mode']);
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.lists);
        const rows = [[1, 2], [2, 5], [3, 3], [4, 1]];
        const totalCount = 11;
        const totalSum = 25; 
        
        if (v === 'freq_mode') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilket är typvärdet enligt tabellen?` : `What is the mode according to the table?`,
                    answerType: 'numeric',
                    geometry: { type: 'frequency_table', headers: lang === 'sv' ? ['Värde', 'Antal'] : ['Value', 'Count'], rows }
                },
                token: this.toBase64("2"),
                clues: [
                    { text: lang === 'sv' ? "Typvärdet är det värde som har högst frekvens (störst antal)." : "The mode is the value that has the highest frequency (largest count)." },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: "2" }
                ],
                metadata: { variation_key: 'freq_mode', difficulty: 2 }
            };
        }

        if (v === 'freq_count') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Hur många observationer gjordes totalt?" : "How many observations were made in total?",
                    answerType: 'numeric',
                    geometry: { type: 'frequency_table', headers: lang === 'sv' ? ['Värde', 'Antal'] : ['Value', 'Count'], rows }
                },
                token: this.toBase64(totalCount.toString()),
                clues: [
                    { text: lang === 'sv' ? "Addera alla siffror i kolumnen för 'Antal'." : "Add all the numbers in the 'Count' column.", latex: `2 + 5 + 3 + 1 = ${totalCount}` },
                    { text: lang === 'sv' ? "Totalt antal:" : "Total count:", latex: `${totalCount}` }
                ],
                metadata: { variation_key: 'freq_count', difficulty: 2 }
            };
        }

        const mean = Math.round((totalSum / totalCount) * 10) / 10;
        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna medelvärdet för tabellen (en decimal).` : `Calculate the mean for the table (one decimal).`,
                answerType: 'numeric',
                geometry: { type: 'frequency_table', headers: lang === 'sv' ? ['Värde', 'Antal'] : ['Value', 'Count'], rows }
            },
            token: this.toBase64(mean.toString()),
            clues: [
                { text: lang === 'sv' ? "Beräkna totala summan genom att multiplicera värdena med deras antal." : "Calculate the total sum by multiplying the values by their counts.", latex: `(1 \\cdot 2) + (2 \\cdot 5) + (3 \\cdot 3) + (4 \\cdot 1) = ${totalSum}` },
                { text: lang === 'sv' ? "Dividera totalsumman med det totala antalet observationer." : "Divide the total sum by the total number of observations.", latex: `\\frac{${totalSum}}{${totalCount}} = ${mean}` },
                { text: lang === 'sv' ? "Medelvärdet är:" : "The mean is:", latex: `${mean}` }
            ],
            metadata: { variation_key: 'freq_mean', difficulty: 3 }
        };
    }

    // --- LEVEL 6: REAL WORLD ---
    private level6_RealWorldMixed(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['real_weighted_missing', 'real_outlier_shift', 'real_measure_choice']);

        if (v === 'real_weighted_missing') {
            const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.shopping);
            const ans = 30;
            return {
                renderData: {
                    description: lang === 'sv' ? `Du köper 2 kg ${s.sv} för 20 kr/kg och 3 kg till. Medelpriset blev 26 kr/kg. Vad kostade den andra sorten?` : `You buy 2 kg of ${s.en} for 20 kr/kg and 3 kg more. The mean price was 26 kr/kg. What was the price of the second kind?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Räkna ut totalsumman för alla 5 kg." : "Calculate the total cost for all 5 kg.", latex: `5 \\cdot 26 = 130` },
                    { text: lang === 'sv' ? "Ta bort kostnaden för de första 2 kilona." : "Subtract the cost of the first 2 kg.", latex: `130 - (2 \\cdot 20) = 90` },
                    { text: lang === 'sv' ? "Dela resten på de återstående 3 kilona." : "Divide the remainder by the remaining 3 kg.", latex: `\\frac{90}{3} = ${ans}` },
                    { text: lang === 'sv' ? "Priset per kg var:" : "The price per kg was:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'real_weighted_missing', difficulty: 4 }
            };
        }

        if (v === 'real_outlier_shift') {
            const diff = 13;
            return {
                renderData: {
                    description: lang === 'sv' ? "Lönerna är 25k, 27k, 28k och 80k. Hur mycket ändras snittet om chefen (80k) tas bort?" : "Salaries are 25k, 27k, 28k, and 80k. How much does the mean change if the boss (80k) is removed?",
                    answerType: 'numeric'
                },
                token: this.toBase64(diff.toString()),
                clues: [
                    { text: lang === 'sv' ? "Jämför snittet för alla fyra anställda med snittet för de tre som tjänar minst." : "Compare the mean of all four employees with the mean of the three lowest earners." },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{160}{4} - \\frac{80}{3} \\approx ${diff}` },
                    { text: lang === 'sv' ? "Skillnaden är:" : "The difference is:", latex: `${diff}` }
                ],
                metadata: { variation_key: 'real_outlier_shift', difficulty: 4 }
            };
        }

        const ans = lang === 'sv' ? "Median" : "Median";
        return {
            renderData: {
                description: lang === 'sv' ? "Vid extremvärden (som ett lyxhus bland vanliga hus), vilket mått är mest rättvist?" : "With extreme values (like a luxury house among normal houses), which measure is fairest?",
                answerType: 'multiple_choice',
                options: lang === 'sv' ? ["Medelvärde", "Median", "Variationsbredd"] : ["Mean", "Median", "Range"]
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? "Medelvärdet dras upp kraftigt av extremvärden, medan medianen förblir stabil." : "The mean is pulled up significantly by extreme values, while the median remains stable." },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `\\text{${ans}}` }
            ],
            metadata: { variation_key: 'real_measure_choice', difficulty: 3 }
        };
    }
}