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

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
     */
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
                    description: lang === 'sv' ? `Här är en lista över ${s.sv}: ${setStr}. Vilket är typvärdet för detta datamaterial?` : `Here is a list of ${s.en}: ${setStr}. What is the mode for this data set?`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(modeVal.toString()),
                clues: [{ text: lang === 'sv' ? "Typvärdet är det tal som förekommer flest gånger i en samling data. Det är det mest 'typiska' värdet." : "The mode is the value that appears most frequently in a data set. It is the most 'typical' value." }],
                metadata: { variation_key: 'find_mode', difficulty: 1 }
            };
        }

        if (v === 'find_range') {
            const min = Math.min(...list);
            const max = Math.max(...list);
            return {
                renderData: { 
                    description: lang === 'sv' ? `Studera listan över ${s.sv}: ${setStr}. Vad är variationsbredden för dessa värden?` : `Study the list of ${s.en}: ${setStr}. What is the range for these values?`,
                    answerType: 'numeric' 
                },
                token: this.toBase64((max - min).toString()),
                clues: [{ text: lang === 'sv' ? "Variationsbredden beräknas genom att ta det största värdet minus det minsta värdet i listan." : "The range is calculated by taking the largest value minus the smallest value in the list.", latex: `${max} - ${min} = ${max - min}` }],
                metadata: { variation_key: 'find_range', difficulty: 1 }
            };
        }

        if (v === 'find_min_max') {
            const min = Math.min(...list);
            const max = Math.max(...list);
            const isMin = Math.random() > 0.5;
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilket är det ${isMin ? 'minsta' : 'största'} värdet i följande lista: ${setStr}?` : `What is the ${isMin ? 'minimum' : 'maximum'} value in the following list: ${setStr}?`,
                    answerType: 'numeric'
                },
                token: this.toBase64((isMin ? min : max).toString()),
                clues: [{ text: lang === 'sv' ? "Gå igenom listan metodiskt och leta efter det absolut lägsta eller högsta talet." : "Go through the list methodically and look for the absolute lowest or highest number." }],
                metadata: { variation_key: 'find_min_max', difficulty: 1 }
            };
        }

        // Spot the Lie
        const min = Math.min(...list);
        const max = Math.max(...list);
        const range = max - min;
        const t1 = lang === 'sv' ? `Typvärdet är ${modeVal}` : `Mode is ${modeVal}`;
        const t2 = lang === 'sv' ? `Variationsbredden är ${range}` : `Range is ${range}`;
        const sFalse = lang === 'sv' ? `Minsta värdet är ${min - 2}` : `Min value is ${min - 2}`;

        return {
            renderData: {
                description: lang === 'sv' ? `Granska listan: ${setStr}. Vilket av påståendena nedan är FALSKT?` : `Review the list: ${setStr}. Which of the statements below is FALSE?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([t1, t2, sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [{ text: lang === 'sv' ? "Gå igenom varje påstående och kontrollera det mot siffrorna i listan." : "Go through each statement and verify it against the numbers in the list." }],
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
                    description: lang === 'sv' ? `Beräkna medeltemperaturen för följande mätvärden: ${list.join('°C, ')}°C.` : `Calculate the mean temperature for the following readings: ${list.join('°C, ')}°C.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(mean.toString()),
                clues: [{ text: lang === 'sv' ? "Addera alla temperaturer (tänk på de negativa talen) och dela summan med 4." : "Add all temperatures (mind the negative numbers) and divide the sum by 4.", latex: `\\frac{${list.join(' + ')}}{4} = ${mean}` }],
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
                    description: lang === 'sv' ? `Om medelvärdet för en grupp är ${oldMean} och en ny person med värdet ${newVal} går med i gruppen, vad händer med medelvärdet?` : `If the mean for a group is ${oldMean} and a new person with the value ${newVal} joins the group, what happens to the mean?`,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Det ökar", "Det minskar", "Det är oförändrat"] : ["It increases", "It decreases", "It stays unchanged"]
                },
                token: this.toBase64(ans),
                clues: [{ text: lang === 'sv' ? "Om det nya värdet är lägre än snittet dras medelvärdet ner, och om det är högre dras det upp." : "If the new value is lower than the average, the mean is pulled down, and if it is higher, it is pulled up." }],
                metadata: { variation_key: 'mean_concept_balance', difficulty: 2 }
            };
        }

        const count = MathUtils.randomInt(4, 6);
        const list = Array.from({length: count}, () => MathUtils.randomInt(s.min, s.max));
        const sum = list.reduce((a, b) => a + b, 0);
        const mean = Math.round((sum / count) * 10) / 10;

        return {
            renderData: {
                description: lang === 'sv' ? `Räkna ut medelvärdet för dessa ${s.sv}: ${list.join(', ')}.` : `Calculate the mean for these ${s.en}: ${list.join(', ')}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(mean.toString()),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Addera alla tal för att få den totala summan." : "Step 1: Add all numbers to get the total sum.", latex: list.join(' + ') + ` = ${sum}` },
                { text: lang === 'sv' ? `Steg 2: Dividera summan med antalet tal (${count}).` : `Step 2: Divide the sum by the number of values (${count}).`, latex: `\\frac{${sum}}{${count}} = ${mean}` }
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
            const lie = sorted[0]; // Using min as a lie for median
            const sTrue = lang === 'sv' ? `Medianen är ${median}` : `Median is ${median}`;
            const sLie = lang === 'sv' ? `Medianen är ${lie}` : `Median is ${lie}`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Lista: ${list.join(', ')}. Vilket påstående om medianen stämmer?` : `List: ${list.join(', ')}. Which statement about the median is true?`,
                    answerType: 'multiple_choice',
                    options: [sTrue, sLie]
                },
                token: this.toBase64(sTrue),
                clues: [{ text: lang === 'sv' ? "Sortera alltid listan i storleksordning innan du letar efter det mittersta värdet." : "Always sort the list in size order before looking for the middle value." }],
                metadata: { variation_key: 'median_lie', difficulty: 2 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? `Bestäm medianen för följande ${s.sv}: ${list.sort(() => Math.random() - 0.5).join(', ')}.` : `Determine the median for the following ${s.en}: ${list.sort(() => Math.random() - 0.5).join(', ')}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(median.toString()),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Sortera talen från minst till störst." : "Step 1: Sort the numbers from smallest to largest.", latex: sorted.join(', ') },
                { text: lang === 'sv' ? (count % 2 !== 0 ? "Steg 2: Eftersom det är ett udda antal tal är medianen det tal som står precis i mitten." : "Steg 2: Vid ett jämnt antal tal är medianen medelvärdet av de två talen i mitten.") : (count % 2 !== 0 ? "Step 2: Since there is an odd number of values, the median is the value exactly in the middle." : "Step 2: With an even number of values, the median is the average of the two middle values."), latex: median.toString() }
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
                    description: lang === 'sv' ? `På de två första proven fick du ${score1} och ${score2} poäng. Vad behöver du få på det tredje provet för att ditt medelvärde ska bli exakt ${targetMean}?` : `On the first two tests, you scored ${score1} and ${score2} points. What do you need on the third test for your mean to be exactly ${targetMean}?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(required.toString()),
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Räkna ut vad summan av de tre proven måste vara.` : `Step 1: Calculate what the sum of the three tests must be.`, latex: `3 \\cdot ${targetMean} = ${targetMean * 3}` },
                    { text: lang === 'sv' ? `Steg 2: Dra ifrån de poäng du redan har.` : `Step 2: Subtract the points you already have.`, latex: `${targetMean * 3} - ${score1} - ${score2} = ${required}` }
                ],
                metadata: { variation_key: 'mean_target_score', difficulty: 4 }
            };
        }

        const count = 4, mean = 15;
        const total = mean * count; // 60
        const v1 = 12, v2 = 18, v3 = 14;
        const missing = total - (v1 + v2 + v3);

        return {
            renderData: {
                description: lang === 'sv' ? `Medelvärdet av fyra tal är ${mean}. Tre av talen är ${v1}, ${v2} och ${v3}. Vilket är det fjärde talet?` : `The mean of four numbers is ${mean}. Three of the numbers are ${v1}, ${v2}, and ${v3}. What is the fourth number?`,
                answerType: 'numeric'
            },
            token: this.toBase64(missing.toString()),
            clues: [{ text: lang === 'sv' ? "Om du vet medelvärdet kan du räkna ut den totala summan genom att multiplicera med antalet tal." : "If you know the mean, you can calculate the total sum by multiplying by the count.", latex: `${mean} \\cdot 4 = ${total}` }],
            metadata: { variation_key: 'reverse_mean_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 5: FREQUENCY TABLES ---
    private level5_FrequencyTable(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['freq_mean', 'freq_count', 'freq_mode', 'freq_range']);
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.lists);
        const rows = [[1, 2], [2, 5], [3, 3], [4, 1]]; // Value, Count
        const totalCount = 11;
        const totalSum = (1*2) + (2*5) + (3*3) + (4*1); // 2 + 10 + 9 + 4 = 25
        
        if (v === 'freq_mode') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Tabellen visar ${s.sv}. Vilket är typvärdet?` : `The table shows ${s.en}. What is the mode?`,
                    answerType: 'numeric',
                    geometry: { type: 'frequency_table', headers: lang === 'sv' ? ['Värde', 'Antal'] : ['Value', 'Count'], rows }
                },
                token: this.toBase64("2"),
                clues: [{ text: lang === 'sv' ? "Leta efter det värde som har högst siffra i kolumnen 'Antal'." : "Look for the value that has the highest number in the 'Count' column." }],
                metadata: { variation_key: 'freq_mode', difficulty: 2 }
            };
        }

        if (v === 'freq_count') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Hur många observationer gjordes totalt enligt tabellen?" : "How many observations were made in total according to the table?",
                    answerType: 'numeric',
                    geometry: { type: 'frequency_table', headers: lang === 'sv' ? ['Värde', 'Antal'] : ['Value', 'Count'], rows }
                },
                token: this.toBase64(totalCount.toString()),
                clues: [{ text: lang === 'sv' ? "Summera alla siffror i kolumnen 'Antal'." : "Sum all the numbers in the 'Count' column.", latex: `2 + 5 + 3 + 1 = ${totalCount}` }],
                metadata: { variation_key: 'freq_count', difficulty: 2 }
            };
        }

        const mean = Math.round((totalSum / totalCount) * 10) / 10;
        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna medelvärdet utifrån frekvenstabellen (avrunda till en decimal).` : `Calculate the mean based on the frequency table (round to one decimal).`,
                answerType: 'numeric',
                geometry: { type: 'frequency_table', headers: lang === 'sv' ? ['Värde', 'Antal'] : ['Value', 'Count'], rows }
            },
            token: this.toBase64(mean.toString()),
            clues: [{ text: lang === 'sv' ? "Multiplicera varje värde med dess antal, addera resultaten och dela med totala antalet observationer." : "Multiply each value by its count, add the results, and divide by the total number of observations.", latex: `\\frac{${totalSum}}{${totalCount}} = ${mean}` }],
            metadata: { variation_key: 'freq_mean', difficulty: 3 }
        };
    }

    // --- LEVEL 6: REAL WORLD ---
    private level6_RealWorldMixed(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['real_outlier_shift', 'real_measure_choice', 'real_weighted_avg', 'real_weighted_missing']);

        if (v === 'real_weighted_missing') {
            const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.shopping);
            const w1 = 2, p1 = 20;
            const w2 = 3;
            const targetAvg = 26;
            // (2*20 + 3*x) / 5 = 26 -> 40 + 3x = 130 -> 3x = 90 -> x = 30
            const ans = 30;

            return {
                renderData: {
                    description: lang === 'sv' ? `Du köper 2 kg ${s.sv} för 20 kr/kg och 3 kg till av en annan sort. Medelpriset blev 26 kr/kg. Vad kostade den andra sorten per kg?` : `You buy 2 kg of ${s.en} for 20 kr/kg and 3 kg more of another kind. The mean price was 26 kr/kg. What was the price of the other kind per kg?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Räkna ut den totala kostnaden för alla 5 kg." : "Step 1: Calculate the total cost for all 5 kg.", latex: `5 \\cdot 26 = 130` },
                    { text: lang === 'sv' ? "Steg 2: Ta bort kostnaden för de första 2 kilona." : "Step 2: Subtract the cost of the first 2 kg.", latex: `130 - (2 \\cdot 20) = 90` },
                    { text: lang === 'sv' ? "Steg 3: Dela resten på de 3 kilona som är kvar." : "Step 3: Divide the remainder by the remaining 3 kg.", latex: `90 / 3 = ${ans}` }
                ],
                metadata: { variation_key: 'real_weighted_missing', difficulty: 4 }
            };
        }

        if (v === 'real_outlier_shift') {
            const dataset = [25, 27, 28, 80]; // k salaries
            const diff = 13; // (160/4 = 40) vs (80/3 = 26.6) approx 13
            return {
                renderData: {
                    description: lang === 'sv' ? "Månadslönerna på ett litet företag är 25k, 27k, 28k och 80k. Hur mycket ändras medelvärdet om vi tar bort chefen som tjänar 80k? (Svara i hela tusentals kronor)" : "The monthly salaries at a small company are 25k, 27k, 28k, and 80k. By how much does the mean change if we remove the boss who earns 80k? (Answer in whole thousands)",
                    answerType: 'numeric'
                },
                token: this.toBase64(diff.toString()),
                clues: [{ text: lang === 'sv' ? "Räkna ut snittet för alla fyra, sedan snittet för bara de tre anställda, och jämför." : "Calculate the average for all four, then the average for just the three employees, and compare." }],
                metadata: { variation_key: 'real_outlier_shift', difficulty: 4 }
            };
        }

        // Default to measure choice
        const ans = lang === 'sv' ? "Median" : "Median";
        return {
            renderData: {
                description: lang === 'sv' ? "I en undersökning om huspriser finns det ett extremt dyrt lyxhus som kostar tio gånger mer än de andra. Vilket centralmått bör man använda för att få en rättvis bild av vad ett 'vanligt' hus kostar?" : "In a survey of house prices, there is one extremely expensive luxury house that costs ten times more than the others. Which measure of central tendency should be used to give a fair picture of what a 'typical' house costs?",
                answerType: 'multiple_choice',
                options: lang === 'sv' ? ["Medelvärde", "Median", "Variationsbredd"] : ["Mean", "Median", "Range"]
            },
            token: this.toBase64(ans),
            clues: [{ text: lang === 'sv' ? "Medelvärdet påverkas kraftigt av extremvärden (outliers), medan medianen förblir stabil." : "The mean is heavily influenced by outliers, while the median remains stable." }],
            metadata: { variation_key: 'real_measure_choice', difficulty: 3 }
        };
    }
}