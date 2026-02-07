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
            { sv: "lax", en: "salmon", unit: "kr/kg", min: 200, max: 400 },
            { sv: "saffran", en: "saffron", unit: "kr/g", min: 40, max: 80 }
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

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: Mode & Range ---
    private level1_ModeRange(lang: string): any {
        const variation = Math.random();
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.lists);
        const len = MathUtils.randomInt(5, 9);
        const list: number[] = [];
        
        const modeVal = MathUtils.randomInt(s.min, s.max);
        for(let i=0; i<3; i++) list.push(modeVal); 
        for(let i=0; i<len-3; i++) list.push(MathUtils.randomInt(s.min, s.max));
        
        const shuffled = [...list].sort(() => Math.random() - 0.5);
        const setStr = shuffled.join(', ');
        
        // --- MODE ---
        if (variation < 0.3) {
            return {
                renderData: { 
                    description: lang==='sv' ? `Här är en lista över ${s.sv}: ${setStr}. Vad är typvärdet?` : `Here is a list of ${s.en}: ${setStr}. What is the mode?`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(modeVal.toString()),
                clues: [
                    { text: lang==='sv' ? "Typvärdet är det tal som förekommer flest gånger i listan. Tänk på ordet 'typisk'." : "The mode is the number that appears most frequently in the list. Think of what is 'typical'.", latex: "" },
                    { text: lang==='sv' ? `Räkna hur många av varje tal som finns. Talet ${modeVal} finns med flest gånger.` : `Count how many of each number there are. The number ${modeVal} appears the most times.`, latex: `\text{Flest förekomster} = ${modeVal}` }
                ],
                metadata: { variation: 'find_mode', difficulty: 1 }
            };
        }

        // --- RANGE ---
        if (variation < 0.6) {
            const min = Math.min(...list);
            const max = Math.max(...list);
            const range = max - min;
            return {
                renderData: { 
                    description: lang==='sv' ? `Här är en lista över ${s.sv}: ${setStr}. Vad är variationsbredden?` : `Here is a list of ${s.en}: ${setStr}. What is the range?`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(range.toString()),
                clues: [
                    { text: lang==='sv' ? "Variationsbredden visar hur stort gapet är mellan det minsta och det största talet." : "The range shows the gap between the smallest and the largest number.", latex: "" },
                    { text: lang==='sv' ? "Hitta det största och det minsta talet och räkna ut skillnaden." : "Find the largest and smallest numbers and calculate the difference.", latex: `${max} - ${min} = ${range}` }
                ],
                metadata: { variation: 'find_range', difficulty: 1 }
            };
        }

        // --- SPOT THE LIE ---
        const min = Math.min(...list);
        const max = Math.max(...list);
        const range = max - min;
        const t1 = lang==='sv' ? `Typvärdet är ${modeVal}` : `Mode is ${modeVal}`;
        const t2 = lang==='sv' ? `Variationsbredden är ${range}` : `Range is ${range}`;
        const lieVal = min - MathUtils.randomInt(1, 3);
        const lie = lang==='sv' ? `Minsta värdet är ${lieVal}` : `Min value is ${lieVal}`;

        return {
            renderData: {
                description: lang==='sv' ? `Lista: ${setStr}. Vilket påstående är FALSKT?` : `List: ${setStr}. Which statement is FALSE?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([t1, t2, lie])
            },
            token: this.toBase64(lie),
            clues: [
                { text: lang==='sv' ? "Gå igenom listan och kontrollera varje påstående. Hitta det som inte stämmer." : "Go through the list and check each statement. Find the one that is incorrect.", latex: "" },
                { text: lang==='sv' ? `Det lägsta talet i listan är faktiskt ${min}, inte ${lieVal}.` : `The lowest number in the list is actually ${min}, not ${lieVal}.`, latex: `${min} \neq ${lieVal}` }
            ],
            metadata: { variation: 'stats_lie', difficulty: 2 }
        };
    }

    // --- LEVEL 2: Mean ---
    private level2_Mean(lang: string): any {
        const variation = Math.random();
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.lists);
        
        if (variation < 0.7) {
            const count = MathUtils.randomInt(3, 8);
            const mean = MathUtils.randomInt(s.min, s.max);
            const targetSum = mean * count;
            const list = [];
            let currentSum = 0;
            for(let i=0; i<count-1; i++) {
                const val = MathUtils.randomInt(Math.max(s.min, mean - 5), Math.min(s.max, mean + 5));
                list.push(val);
                currentSum += val;
            }
            const lastVal = targetSum - currentSum;
            if (lastVal < 0 || Math.abs(lastVal - mean) > 15) return this.level2_Mean(lang);
            
            list.push(lastVal);
            const setStr = list.sort(() => Math.random() - 0.5).join(', ');
            return {
                renderData: {
                    description: lang==='sv' ? `Beräkna medelvärdet för dessa ${s.sv}: ${setStr}.` : `Calculate the mean for these ${s.en}: ${setStr}.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(mean.toString()),
                clues: [
                    { text: lang==='sv' ? "Medelvärdet är det tal man får om man delar upp summan jämnt på alla delar." : "The mean is the number you get if you distribute the sum evenly across all parts.", latex: "" },
                    { text: lang==='sv' ? "Addera alla tal först för att få den totala summan." : "Add all the numbers first to get the total sum.", latex: `${list.join(' + ')} = ${targetSum}` },
                    { text: lang==='sv' ? `Dela nu summan med antalet tal (${count}).` : `Now divide the sum by the number of values (${count}).`, latex: `\\frac{${targetSum}}{${count}} = ${mean}` }
                ],
                metadata: { variation: 'calc_mean', difficulty: 2 }
            };
        }

        const q = lang==='sv' ? "Om du lägger till ett tal som är STÖRRE än medelvärdet, vad händer med det nya medelvärdet?" : "If you add a number LARGER than the mean, what happens to the new mean?";
        const ans = lang==='sv' ? "Det ökar" : "It increases";
        const w1 = lang==='sv' ? "Det minskar" : "It decreases";
        return {
            renderData: { description: q, answerType: 'multiple_choice', options: MathUtils.shuffle([ans, w1]) },
            token: this.toBase64(ans),
            clues: [
                { text: lang==='sv' ? "Tänk på medelvärdet som en balanspunkt. Om du lägger på något tyngre på ena sidan dras punkten åt det hållet." : "Think of the mean as a balance point. If you add something heavier on one side, the point moves that way.", latex: "" },
                { text: lang==='sv' ? "Eftersom det nya talet är större än det gamla snittet, kommer det dras uppåt." : "Since the new number is larger than the old average, it will be pulled upwards.", latex: "\text{Nytt tal} > \text{Medel} \implies \text{Ökning}" }
            ],
            metadata: { variation: 'mean_concept_balance', difficulty: 2 }
        };
    }

    // --- LEVEL 3: Median ---
    private level3_Median(lang: string): any {
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.lists);
        const count = MathUtils.randomChoice([5, 6, 7]);
        const list = [];
        for(let i=0; i<count; i++) list.push(MathUtils.randomInt(s.min, s.max));
        const sorted = [...list].sort((a,b)=>a-b);
        
        let median = 0;
        let middleDesc = "";
        if (count % 2 !== 0) {
            median = sorted[Math.floor(count/2)];
            middleDesc = `${median}`;
        } else {
            const m1 = sorted[count/2 - 1];
            const m2 = sorted[count/2];
            median = (m1 + m2) / 2;
            middleDesc = `\\frac{${m1} + ${m2}}{2} = ${median}`;
        }

        const shuffled = [...list].sort(()=>Math.random()-0.5).join(', ');
        return {
            renderData: {
                description: lang==='sv' ? `Hitta medianen för dessa ${s.sv}: ${shuffled}.` : `Find the median for these ${s.en}: ${shuffled}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(median.toString()),
            clues: [
                { text: lang==='sv' ? "Medianen är det mittersta värdet. För att hitta det måste talen stå i ordning." : "The median is the middle value. To find it, the numbers must be in order.", latex: "" },
                { text: lang==='sv' ? "Sortera talen från minsta till största." : "Sort the numbers from smallest to largest.", latex: sorted.join(', ') },
                { text: lang==='sv' ? "Leta upp talet i mitten (eller medelvärdet av de två i mitten)." : "Identify the number in the middle (or the average of the two middle ones).", latex: `\text{Mitten} = ${middleDesc}` }
            ],
            metadata: { variation: count % 2 === 0 ? 'median_even' : 'median_odd', difficulty: 2 }
        };
    }

    // --- LEVEL 4: Reverse Mean ---
    private level4_ReverseMean(lang: string): any {
        const count = MathUtils.randomChoice([3, 4, 5]);
        const mean = MathUtils.randomInt(10, 20);
        const total = mean * count;
        const known: number[] = [];
        let currentSum = 0;
        for(let i=0; i<count-1; i++) {
            const v = MathUtils.randomInt(mean-5, mean+5);
            known.push(v);
            currentSum += v;
        }
        const missing = total - currentSum;
        if (missing < 0) return this.level4_ReverseMean(lang);
        
        return {
            renderData: {
                description: lang==='sv' ? `Medelvärdet av ${count} tal är ${mean}. ${count-1} av talen är: ${known.join(', ')}. Vilket är det sista talet?` : `The mean of ${count} numbers is ${mean}. ${count-1} of them are: ${known.join(', ')}. What is the last number?`,
                answerType: 'numeric'
            },
            token: this.toBase64(missing.toString()),
            clues: [
                { text: lang==='sv' ? "Om du vet medelvärdet och antalet kan du räkna ut vad alla talen ska bli tillsammans (summan)." : "If you know the mean and the count, you can calculate what all numbers should sum up to.", latex: `${mean} \\cdot ${count} = ${total}` },
                { text: lang==='sv' ? "Dra nu bort de tal du redan känner till från den totala summan." : "Now subtract the numbers you already know from the total sum.", latex: `${total} - (${known.join(' + ')}) = ${missing}` }
            ],
            metadata: { variation: 'reverse_mean_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 5: Frequency Table ---
    private level5_FrequencyTable(lang: string): any {
        const variation = Math.random();
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.lists);
        const startVal = MathUtils.randomInt(s.min, Math.max(s.min, s.max - 5));
        const vals = [startVal, startVal + 1, startVal + 2, startVal + 3, startVal + 4];
        const freqs = [MathUtils.randomInt(1, 4), MathUtils.randomInt(2, 6), MathUtils.randomInt(1, 5), MathUtils.randomInt(1, 3), MathUtils.randomInt(1, 2)];
        const rows = [];
        let totalSum = 0, totalCount = 0;
        
        vals.forEach((v, i) => {
            const f = freqs[i];
            rows.push([v, f]);
            totalSum += v * f;
            totalCount += f;
        });

        const isMean = variation < 0.5;
        const mean = Math.round((totalSum / totalCount) * 10) / 10;
        const target = isMean ? mean : totalCount;
        
        const q = isMean 
            ? (lang==='sv' ? `Tabellen visar ${s.sv} i en grupp. Beräkna medelvärdet.` : `The table shows ${s.en} in a group. Calculate the mean.`)
            : (lang==='sv' ? `Tabellen visar ${s.sv} i en undersökning. Hur många observationer (totalt antal) gjordes?` : `The table shows ${s.en} in a survey. How many total observations were made?`);

        const clues = isMean ? [
            { text: lang==='sv' ? "Multiplicera varje värde med dess antal för att få delsummor, och addera dem." : "Multiply each value by its count to get sub-sums, and add them up.", latex: `\text{Summa} = ${totalSum}` },
            { text: lang==='sv' ? "Dela totalsumman med det totala antalet observationer." : "Divide the total sum by the total number of observations.", latex: `\\frac{${totalSum}}{${totalCount}} = ${mean}` }
        ] : [
            { text: lang==='sv' ? "Kolumnen 'Antal' visar hur många gånger varje värde har mätts." : "The 'Count' column shows how many times each value was measured.", latex: "" },
            { text: lang==='sv' ? "Addera alla siffror i kolumnen 'Antal' för att få totalen." : "Add all the figures in the 'Count' column to get the total.", latex: `${freqs.join(' + ')} = ${totalCount}` }
        ];

        return {
            renderData: {
                description: q,
                answerType: 'numeric',
                geometry: { type: 'frequency_table', headers: lang==='sv'?[s.sv.charAt(0).toUpperCase() + s.sv.slice(1),'Antal']:[s.en.charAt(0).toUpperCase() + s.en.slice(1),'Count'], rows }
            },
            token: this.toBase64(target.toString()),
            clues,
            metadata: { variation: isMean ? 'freq_mean' : 'freq_count', difficulty: 3 }
        };
    }

    // --- LEVEL 6: Real World Mixed ---
    private level6_RealWorldMixed(lang: string): any {
        const variation = Math.random();

        // --- OUTLIER SENSITIVITY ---
        if (variation < 0.35) {
            const ctx = MathUtils.randomChoice(StatisticsGen.SCENARIOS.real_world);
            const base = MathUtils.randomInt(ctx.min, ctx.max);
            const outlier = base * MathUtils.randomInt(6, 12);
            const dataset = [base - 1, base, base + 1, outlier];
            const sumWith = dataset.reduce((a, b) => a + b, 0);
            const meanWith = sumWith / dataset.length;
            const meanWithout = (sumWith - outlier) / (dataset.length - 1);
            const diff = Math.round(Math.abs(meanWith - meanWithout));

            const desc = lang === 'sv'
                ? `Värden för ${ctx.sv}: ${dataset.join(ctx.suffix + ', ')}${ctx.suffix}. Om vi tar bort det extrema värdet (${outlier}${ctx.suffix}), hur mycket ändras medelvärdet? (Heltal)`
                : `Values for ${ctx.en}: ${dataset.join(ctx.suffix + ', ')}${ctx.suffix}. If we remove the outlier (${outlier}${ctx.suffix}), by how much does the mean change? (Integer)`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(diff.toString()),
                clues: [
                    { text: lang==='sv' ? "Medelvärdet påverkas mycket av extremt höga eller låga tal." : "The mean is heavily affected by extremely high or low numbers.", latex: "" },
                    { text: lang==='sv' ? "Räkna ut medelvärdet för alla 4 tal, sedan för de 3 normala talen. Beräkna skillnaden." : "Calculate the mean for all 4 numbers, then for the 3 normal numbers. Calculate the difference.", latex: `|${Math.round(meanWith)} - ${Math.round(meanWithout)}| = ${diff}` }
                ],
                metadata: { variation: 'real_outlier_shift', difficulty: 4 }
            };
        }

        // --- MEASURE CHOICE ---
        if (variation < 0.7) {
            const ctx = MathUtils.randomChoice(StatisticsGen.SCENARIOS.real_world);
            const base = MathUtils.randomInt(ctx.min, ctx.max);
            const hasOutlier = Math.random() > 0.5;
            const outlier = hasOutlier ? base * 20 : base + MathUtils.randomInt(1, 2);
            const dataset = [base, base + 1, base - 1, outlier].sort((a,b)=>a-b);
            
            const desc = lang === 'sv'
                ? `Data för ${ctx.sv}: ${dataset.join(ctx.suffix + ', ')}${ctx.suffix}. Vilket mått beskriver bäst ett "typiskt" värde?`
                : `Data for ${ctx.en}: ${dataset.join(ctx.suffix + ', ')}${ctx.suffix}. Which measure best describes a "typical" value?`;
            
            const ans = hasOutlier ? (lang==='sv'?"Median":"Median") : (lang==='sv'?"Båda funkar":"Both work");
            const options = hasOutlier ? ["Medelvärde", "Median"] : ["Median", "Båda funkar"];

            return {
                renderData: { description: desc, answerType: 'multiple_choice', options: MathUtils.shuffle(options) },
                token: this.toBase64(ans),
                clues: [
                    { text: lang==='sv' ? "Om det finns ett tal som är extremt mycket större än de andra (en outlier), så blir medelvärdet 'smittat' och för högt." : "If there is a number that is extremely much larger than the others (an outlier), the mean becomes 'tainted' and too high.", latex: "" },
                    { text: lang==='sv' ? "Medianen bryr sig inte om hur stora talen på kanterna är, bara vilket som är i mitten." : "The median doesn't care how large the numbers on the edges are, only which one is in the middle.", latex: hasOutlier ? "\text{Outlier finns} \implies \text{Median}" : "\text{Ingen outlier} \implies \text{Båda}" }
                ],
                metadata: { variation: 'real_measure_choice', difficulty: 3 }
            };
        }

        // --- WEIGHTED SHOPPING ---
        const s = MathUtils.randomChoice(StatisticsGen.SCENARIOS.shopping);
        const w1 = MathUtils.randomInt(2, 4), p1 = MathUtils.randomInt(s.min, s.max);
        const w2 = MathUtils.randomInt(2, 4), p2 = MathUtils.randomInt(s.min, s.max);
        const totalWeight = w1 + w2;
        const totalCost = (w1 * p1) + (w2 * p2);
        const avg = Math.round((totalCost / totalWeight) * 10) / 10;

        const item = lang === 'sv' ? s.sv : s.en;
        const desc = lang === 'sv'
            ? `Du köper ${w1} kg ${item} för ${p1} kr/kg och ${w2} kg för ${p2} kr/kg. Beräkna medelpriset per kg.`
            : `You buy ${w1} kg of ${item} for ${p1} kr/kg and ${w2} kg for ${p2} kr/kg. Calculate the average price per kg.`;

        return {
            renderData: { description: desc, answerType: 'numeric', suffix: 'kr/kg' },
            token: this.toBase64(avg.toString()),
            clues: [
                { text: lang==='sv' ? "Du kan inte bara ta medelvärdet av priserna, eftersom du köpt olika mycket av varje." : "You can't just take the average of the prices, because you bought different amounts of each.", latex: "" },
                { text: lang==='sv' ? "Räkna ut total kostnad och dela med total vikt." : "Calculate the total cost and divide by the total weight.", latex: `\\frac{(${w1} \\cdot ${p1}) + (${w2} \\cdot ${p2})}{${w1} + ${w2}} = ${avg}` }
            ],
            metadata: { variation: 'real_weighted_avg', difficulty: 4 }
        };
    }
}