import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

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
        // Adaptive Fallback: If base concepts are satisfied, push forward to computation chains
        if (level === 1 && options.hideConcept) {
            return this.level2_Mean(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_ModeRange(lang, undefined, options); break;
            case 2: questionData = this.level2_Mean(lang, undefined, options); break;
            case 3: questionData = this.level3_Median(lang, undefined, options); break;
            case 4: questionData = this.level4_ReverseMean(lang, undefined, options); break;
            case 5: questionData = this.level5_FrequencyTable(lang, undefined, options); break;
            case 6: questionData = this.level6_RealWorldMixed(lang, undefined, options); break;
            default: questionData = this.level1_ModeRange(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 3, 4, 6];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }
    public generateByVariation(key: string, lang: string = 'sv', options: any = {}): any {
        switch (key) {
            case 'find_mode':
            case 'find_range':
            case 'stats_lie':
            case 'find_min_max':
                return this.level1_ModeRange(lang, key, options);
            case 'calc_mean':
            case 'mean_concept_balance':
            case 'mean_negatives':
                return this.level2_Mean(lang, key, options);
            case 'median_odd':
            case 'median_even':
            case 'median_lie':
                return this.level3_Median(lang, key, options);
            case 'reverse_mean_calc':
            case 'mean_target_score':
                return this.level4_ReverseMean(lang, key, options);
            case 'freq_mean':
            case 'freq_count':
            case 'freq_mode':
            case 'freq_range':
                return this.level5_FrequencyTable(lang, key, options);
            case 'real_outlier_shift':
            case 'real_measure_choice':
            case 'real_weighted_avg':
            case 'real_weighted_missing':
                return this.level6_RealWorldMixed(lang, key, options);
            default:
                return this.generate(1, lang, options);
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
                    description: lang === 'sv' ? `Kolla igenom ${s.sv} listan: ${setStr}. Vilket är typvärdet?` : `Examine the list of ${s.en}: ${setStr}. What is the mode?`,
                    interceptorToken: `${setStr} ; ${modeVal}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(modeVal.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Typvärdet är helt enkelt det tal som är populärast och dyker upp flest gånger i hela listan." : "The mode is simply the most popular number that appears the most times in the entire list.", 
                        latex: `\\text{Leta efter flest upprepningar}` 
                    },
                    { 
                        text: lang === 'sv' ? "Gå igenom sifferraden noggrant och räkna hur många gånger varje enskilt tal finns med." : "Go through the number row carefully and count how many times each individual number is included.", 
                        latex: `\\text{Lista: } ${setStr}` 
                    },
                    { 
                        text: lang === 'sv' ? `Vi ser att talet ${modeVal} förekommer 3 gånger. Det är fler gånger än något annat tal i listan.` : `We can see that the number ${modeVal} appears 3 times. That is more times than any other number in the list.`, 
                        latex: `\\text{Populärast} = \\mathbf{${modeVal}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${modeVal}` : `Answer: ${modeVal}`, 
                        latex: `${modeVal}` 
                    }
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
                    interceptorToken: `${setStr} ; ${max} ; ${min} ; ${range}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(range.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Variationsbredden beskriver det totala gapet eller avståndet mellan det absolut största och det minsta talet i listan." : "The range describes the total gap or distance between the absolute largest and the smallest number in the list.", 
                        latex: `\\text{Variationsbredd} = \\text{Största talet} - \\text{Minsta talet}` 
                    },
                    { 
                        text: lang === 'sv' ? `Leta reda på det högsta numret och det lägsta numret i sifferraden.` : `Find the highest number and the lowest number in the row of numbers.`, 
                        latex: `\\text{Största} = \\mathbf{${max}} \\quad \\text{Minsta} = \\mathbf{${min}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Ta nu det största talet (${max}) minus det minsta talet (${min}) för och räkna ut skillnaden.` : `Now take the largest number (${max}) minus the smallest number (${min}) to calculate the difference.`, 
                        latex: `\\text{Variationsbredd} = \\mathbf{${max} - ${min}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Slutför subtraktionen för att bestämma storleken på siffer-gapet." : "Complete the final subtraction to determine the size of the number gap.", 
                        latex: `\\text{Variationsbredd} = \\mathbf{${range}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${range}` : `Answer: ${range}`, 
                        latex: `${range}` 
                    }
                ]
            };
        }
        // ==========================================
        // VARIATION: STATS LIE (Misidentified Concept)
        // ==========================================
        if (v === 'stats_lie') {
            // 1. Calculate all 4 actual statistical values
            const sum = list.reduce((a, b) => a + b, 0);
            const mean = +(sum / count).toFixed(1);
            const sortedList = [...list].sort((a, b) => a - b);
            const median = count % 2 === 0 
                ? (sortedList[count / 2 - 1] + sortedList[count / 2]) / 2 
                : sortedList[Math.floor(count / 2)];
            
            // 2. Map all concepts with definitions and LaTeX calculation steps
            const concepts = [
                { 
                    key: 'Typvärde', enKey: 'Mode', val: modeVal, 
                    svName: 'typvärdet (det vanligaste värdet)', enName: 'the mode (most common value)', 
                    svDesc: 'Typvärdet är det tal som förekommer flest gånger', enDesc: 'The mode is the number that appears the most times', 
                    latexSteps: `\\mathbf{${modeVal}}`
                },
                { 
                    key: 'Variationsbredd', enKey: 'Range', val: range, 
                    svName: 'variationsbredden (största minus minsta)', enName: 'the range (maximum minus minimum)', 
                    svDesc: `Variationsbredden beräknas som ${max} - ${min}`, enDesc: `The range is calculated as ${max} - ${min}`, 
                    latexSteps: `${max} - ${min} = \\mathbf{${range}}` 
                },
                { 
                    key: 'Median', enKey: 'Median', val: median, 
                    svName: 'medianen (mitternsta värdet när listan sorterats)', enName: 'the median (middle value when sorted)', 
                    svDesc: 'Medianen är det mittersta talet i storleksordning', enDesc: 'The median is the middle number in order of size', 
                    latexSteps: `\\mathbf{${median}}` 
                },
                { 
                    key: 'Medelvärde', enKey: 'Mean', val: mean, 
                    svName: 'medelvärdet (summan delat på antalet)', enName: 'the mean (sum divided by count)', 
                    svDesc: `Medelvärdet är summan (${sum}) delat på antalet tal (${count})`, enDesc: `The mean is the sum (${sum}) divided by the number of values (${count})`, 
                    latexSteps: `\\frac{${sum}}{${count}} = \\mathbf{${mean}}` 
                }
            ];

            // 3. Pick what they were *supposed* to do, and what they *actually* did
            MathUtils.shuffle(concepts);
            const intended = concepts[0];
            // Finds another concept that produced a distinctly different number
            const calculated = concepts.find(c => c.val !== intended.val)!; 

            const ans = lang === 'sv' ? calculated.key : calculated.enKey;
                
            const description = lang === 'sv' 
                ? `En elev ska bestämma ${intended.svName} för listan: ${setStr}.\n\nEleven får fram svaret ${calculated.val}, men det är fel! Vilket statistiskt begrepp har eleven egentligen räknat ut för att få fram det talet?`
                : `A student needs to determine ${intended.enName} for the list: ${setStr}.\n\nThe student answers ${calculated.val}, but this is incorrect! Which statistical concept did the student *actually* calculate to get that number?`;

            return {
                renderData: {
                    description: description,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Medelvärde", "Median", "Typvärde", "Variationsbredd"] : ["Mean", "Median", "Mode", "Range"]
                },
                token: this.toBase64(ans), 
                variationKey: v, 
                type: 'concept',
                clues: [
                    {
                        text: lang === 'sv' 
                            ? `Låt oss undersöka vilket begrepp som faktiskt ger värdet ${calculated.val}.` 
                            : `Let's investigate which concept actually gives the value ${calculated.val}.`,
                        latex: `\\text{Elevens svar} = ${calculated.val}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Testa att beräkna de olika statistiska måtten. ${calculated.svDesc}, vilket blir exakt ${calculated.val}.`
                            : `Try calculating the different statistical measures. ${calculated.enDesc}, which is exactly ${calculated.val}.`,
                        latex: `\\text{${lang === 'sv' ? calculated.key : calculated.enKey}} = ${calculated.latexSteps}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Eleven har alltså blandat ihop namnen och räknat ut ${calculated.key.toLowerCase()} istället för ${intended.key.toLowerCase()}.`
                            : `The student has thus mixed up the names and calculated the ${calculated.enKey.toLowerCase()} instead of the ${intended.enKey.toLowerCase()}.`,
                        latex: `\\text{Sökt begrepp} = \\text{${ans}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                        latex: `\\text{${ans}}`
                    }
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
                { 
                    text: lang === 'sv' ? `Skanna igenom sifferraden metodiskt från start till slut för att hitta det ${isMin ? 'allra lägsta' : 'allra högsta'} värdet.` : `Scan through the number row methodically from start to finish to find the ${isMin ? 'absolute lowest' : 'absolute highest'} value.`, 
                    latex: `\\text{Lista: } ${setStr}` 
                },
                { 
                    text: lang === 'sv' ? `Det ${isMin ? 'lägsta' : 'högsta'} talet vi hittar är ${isMin ? min : max}.` : `The ${isMin ? 'lowest' : 'highest'} number we can find is ${isMin ? min : max}.`, 
                    latex: `\\text{Resultat} = \\mathbf{${isMin ? min : max}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${isMin ? min : max}` : `Answer: ${isMin ? min : max}`, 
                    latex: `${isMin ? min : max}` 
                }
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
                    { 
                        text: lang === 'sv' ? `Tänk på medelvärdet (${mean}) som en perfekt, stabil balanspunkt eller en jämvikt för hela gruppen.` : `Think of the mean (${mean}) as a perfect, stable balance point or an equilibrium for the entire group.`, 
                        latex: `\\text{Balanspunkt} = ${mean}` 
                    },
                    { 
                        text: lang === 'sv' ? (isLower ? `Eftersom det nya talet (${newVal}) är LÄGRE än gruppens nuvarande balanspunkt, kommer det att tynga ner och sänka det totala snittet.` : `Eftersom det nya talet (${newVal}) är HÖGRE än gruppens nuvarande balanspunkt, kommer det att lyfta upp och höja det totala snittet.`) : (isLower ? `Since the new number (${newVal}) is LOWER than the group's current balance point, it will weigh down and decrease the overall average.` : `Since the new number (${newVal}) is HIGHER than the group's current balance point, it will lift up and increase the overall average.`), 
                        latex: isLower ? `${newVal} < ${mean} \\rightarrow \\mathbf{\\text{Svaret sjunker}}` : `${newVal} > ${mean} \\rightarrow \\mathbf{\\text{Svaret höjs}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `\\text{${ans}}` 
                    }
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
                interceptorToken: `${list.join(', ')} ; ${sum} ; ${count} ; ${mean}`,
                answerType: 'numeric'
            },
            token: this.toBase64(mean.toString()), variationKey: 'calc_mean', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Medelvärdet betyder att vi slår ihop allt vi har till en stor gemensam pott, och delar sedan ut det helt rättvist och lika till alla." : "The mean means we pool everything we have into one big pile, and then distribute it completely fairly and equally to everyone.", 
                    latex: `\\text{Medelvärde} = \\frac{\\text{Hela summan tillsammans}}{\\text{Antalet personer / saker}}` 
                },
                { 
                    text: lang === 'sv' ? "Börja med att plussa ihop alla talen i listan för att ta reda på vad den gemensamma potten blir." : "Start by adding all the numbers in the list together to find out what the shared pool total will be.", 
                    latex: `\\text{Hela summan} = ${list.join(' + ')} = \\mathbf{${sum}}` 
                },
                { 
                    text: lang === 'sv' ? `Dela nu potten (${sum}) med hur många siffror det fanns i listan från början (${count} stycken).` : `Now divide the shared pool (${sum}) by how many numbers were in the list at the start (${count} numbers).`, 
                    latex: `\\text{Medelvärde} = \\frac{\\mathbf{${sum}}}{\\mathbf{${count}}}` 
                },
                { 
                    text: lang === 'sv' ? "Utför divisionen för att få fram det färdiga, rättvisa snittvärdet." : "Execute the division step to find the finished, fair average value.", 
                    latex: `\\text{Medelvärde} = \\mathbf{${mean}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${mean}` : `Answer: ${mean}`, 
                    latex: `${mean}` 
                }
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
                interceptorToken: `${list.join(', ')} ; ${median}`,
                answerType: 'numeric'
            },
            token: this.toBase64(median.toString()), variationKey: 'median_odd', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Medianen betyder mitt-talet. Men se upp! För att hitta talet i mitten måste siffrorna STÄLLAS I STORLEKSORDNING allra först, som en kö från kortast till längst." : "The median means the middle number. But watch out! To find the number in the center, the digits must BE SORTED BY SIZE first, like a line from shortest to tallest.", 
                    latex: `\\text{Sortera från minst till störst}` 
                },
                { 
                    text: lang === 'sv' ? "Här är sifferraden uppställd i perfekt ordning på tavlan:" : "Here is the row of numbers arranged in perfect order on the board:", 
                    latex: `\\text{Sorterad kö: } \\mathbf{${sorted.join(', ')}}` 
                },
                { 
                    text: lang === 'sv' ? `Kolla nu vilket tal som står exakt i mitten av kön och har lika många kompisar till vänster som till höger.` : `Now check which number stands exactly in the middle of the line, having just as many neighbors to its left as to its right.`, 
                    latex: `\\text{Mittersta platsen} = \\mathbf{${median}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${median}` : `Answer: ${median}`, 
                    latex: `${median}` 
                }
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
                interceptorToken: `${mean} ; ${v1}, ${v2}, ${v3} ; ${missing}`,
                answerType: 'numeric'
            },
            token: this.toBase64(missing.toString()), variationKey: 'reverse_mean_calc', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Vi ska räkna baklänges! Om medelvärdet för 4 stycken tal ska bli ${mean}, kan vi direkt räkna ut vad den stora gemensamma totalsumman måste vara.` : `We are going to work backwards! If the average for 4 numbers is supposed to equal ${mean}, we can immediately calculate what the big grand total sum must be.`, 
                    latex: `\\text{Måste-summa totalt} = \\text{Medelvärde} \\cdot \\text{Antal tal}` 
                },
                { 
                    text: lang === 'sv' ? `Gångra (multiplicera) medelvärdet ${mean} med 4 tal totalt:` : `Multiply the mean ${mean} by 4 total numbers:`, 
                    latex: `\\text{Måste-summa totalt} = ${mean} \\cdot 4 = \\mathbf{${total}}` 
                },
                { 
                    text: lang === 'sv' ? `Lägg nu ihop de tre talen som vi redan känner till för att se hur mycket av den summan vi har skrapat ihop hittills.` : `Now add up the three numbers we already know to see how much of that total sum we have gathered so far.`, 
                    latex: `\\text{Känd delsumma} = ${v1} + ${v2} + ${v3} = \\mathbf{${v1 + v2 + v3}}` 
                },
                { 
                    text: lang === 'sv' ? `Dra bort den kända summan (${v1 + v2 + v3}) från den totala måstebasen (${total}) för att avslöja det dolda fjärde talet.` : `Subtract the known sum (${v1 + v2 + v3}) from the required grand total (${total}) to reveal the hidden fourth number.`, 
                    latex: `\\text{Saknat tal} = ${total} - \\mathbf{${v1 + v2 + v3}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut skillnaden för att få fram det saknade värdet." : "Compute the difference to discover the missing value token code.", 
                    latex: `\\text{Saknat tal} = \\mathbf{${missing}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${missing}` : `Answer: ${missing}`, 
                    latex: `${missing}` 
                }
            ]
        };
    }

    // --- LEVEL 5: TABLES AND GRAPHS ---
    private level5_FrequencyTable(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'freq_count', type: 'calculate' },
            { key: 'freq_mode', type: 'calculate' },
            { key: 'freq_mean', type: 'calculate' },
            { key: 'freq_median', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        // 1. Math Data (Identical for both views)
        const vals = [1, 2, 3, 4];
        const freqs = [MathUtils.randomInt(2, 4), MathUtils.randomInt(4, 6), MathUtils.randomInt(2, 4), MathUtils.randomInt(1, 2)];
        const rows = vals.map((v, i) => [v, freqs[i]]);
        const totalCount = freqs.reduce((a, b) => a + b, 0);

        // 2. 🟢 UI Toggle: 50% chance to render a graph instead of a table
        const isGraph = Math.random() > 0.5;
        const geomType = isGraph ? 'bar_graph' : 'frequency_table';
        const headers = lang === 'sv' ? ['Värde', 'Antal'] : ['Value', 'Count'];

        // 3. 🟢 Dynamic Text Helpers for Clues
        const tVis = isGraph 
            ? (lang === 'sv' ? "stolpdiagrammet" : "the bar graph") 
            : (lang === 'sv' ? "frekvenstabellen" : "the frequency table");
        const tCountSrc = isGraph 
            ? (lang === 'sv' ? "y-axeln (stapelns höjd)" : "the y-axis (bar height)") 
            : (lang === 'sv' ? "kolumnen 'Antal'" : "the 'Count' column");
        const tValSrc = isGraph 
            ? (lang === 'sv' ? "x-axeln" : "the x-axis") 
            : (lang === 'sv' ? "kolumnen 'Värde'" : "the 'Value' column");

        // ==========================================
        // VARIATION A: Total Count
        // ==========================================
        if (v === 'freq_count') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Hur många observationer (totalt antal) visas i ${tVis}?` : `How many observations (total count) are shown in ${tVis}?`,
                    interceptorToken: `${totalCount}`, answerType: 'numeric',
                    geometry: { type: geomType, headers, rows }
                },
                token: this.toBase64(totalCount.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Genom att läsa av ${tCountSrc} ser vi exakt hur många gånger varje enskilt värde har räknats upp.` : `By reading ${tCountSrc}, we can see exactly how many times each individual value was counted.`, 
                        latex: "" 
                    },
                    { 
                        text: lang === 'sv' ? `För att hitta hela gruppens storlek adderar vi helt enkelt ihop alla dessa antal.` : `To find the size of the entire group, we simply add all of these counts together.`, 
                        latex: `\\text{Totalt antal} = ${freqs.join(' + ')}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${totalCount}` : `Answer: ${totalCount}`, 
                        latex: `\\mathbf{${totalCount}}` 
                    }
                ]
            };
        }

        // ==========================================
        // VARIATION B: Mean (Medelvärde)
        // ==========================================
        if (v === 'freq_mean') {
            const sumProducts = rows.reduce((acc, [val, freq]) => acc + (val * freq), 0);
            const mean = +(sumProducts / totalCount).toFixed(1);
            
            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna medelvärdet för mätningarna i ${tVis}. (Avrunda till en decimal om det behövs)` : `Calculate the mean for the measurements in ${tVis}. (Round to one decimal if needed)`,
                    interceptorToken: `${mean}`, answerType: 'numeric',
                    geometry: { type: geomType, headers, rows }
                },
                token: this.toBase64(mean.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `För att räkna ut medelvärdet från ${isGraph ? 'ett diagram' : 'en tabell'} måste vi först hitta den totala summan av alla värden tillsammans.` : `To calculate the mean from ${isGraph ? 'a graph' : 'a table'}, we first need to find the total sum of all values combined.`, 
                        latex: `\\text{Steg 1: Hitta den totala summan}` 
                    },
                    { 
                        text: lang === 'sv' ? `Multiplicera varje värde på ${tValSrc} med sitt antal från ${tCountSrc}.` : `Multiply each value on ${tValSrc} by its count from ${tCountSrc}.`, 
                        latex: `\\text{Summa} = ${rows.map(r => `${r[0]} \\cdot ${r[1]}`).join(' + ')}` 
                    },
                    { 
                        text: lang === 'sv' ? `Steg 2: Dela den totala summan (${sumProducts}) med det totala antalet observationer (${totalCount}) för att få fram medelvärdet.` : `Step 2: Divide the total sum (${sumProducts}) by the total number of observations (${totalCount}) to get the mean.`, 
                        latex: `\\text{Medelvärde} = \\frac{${sumProducts}}{${totalCount}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${mean}` : `Answer: ${mean}`, 
                        latex: `\\mathbf{${mean}}` 
                    }
                ]
            };
        }

        // ==========================================
        // VARIATION C: Median
        // ==========================================
        if (v === 'freq_median') {
            const flatList: number[] = [];
            rows.forEach(([val, freq]) => { for(let i=0; i<freq; i++) flatList.push(val); });
            const isEven = totalCount % 2 === 0;
            const median = isEven ? (flatList[totalCount / 2 - 1] + flatList[totalCount / 2]) / 2 : flatList[Math.floor(totalCount / 2)];

            return {
                renderData: {
                    description: lang === 'sv' ? `Bestäm medianen för värdena i ${tVis}.` : `Determine the median for the values in ${tVis}.`,
                    interceptorToken: `${median}`, answerType: 'numeric',
                    geometry: { type: geomType, headers, rows }
                },
                token: this.toBase64(median.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Medianen är det mittersta värdet när vi skriver ut alla observationer från ${tVis} i en lång rad.` : `The median is the middle value when we write out all observations from ${tVis} in a long row.`, 
                        latex: `\\text{Steg 1: Skriv ut värdena i en kö}` 
                    },
                    { 
                        text: lang === 'sv' ? `Om ett värde är 1 och ${isGraph ? 'stapeln är 2 hög' : 'antalet är 2'}, skriver vi två ettor (1, 1). Hela kön ser ut så här:` : `If a value is 1 and ${isGraph ? 'the bar is 2 high' : 'the count is 2'}, we write two ones (1, 1). The entire line looks like this:`, 
                        latex: `\\text{Kö: } ${flatList.join(', ')}` 
                    },
                    { 
                        text: lang === 'sv' ? `Steg 2: Hitta mitten av kön. Det finns totalt ${totalCount} värden uppskrivna.` : `Step 2: Find the middle of the line. There are a total of ${totalCount} values written down.`, 
                        latex: isEven ? `\\text{Mitten är mellan } ${flatList[totalCount/2 - 1]} \\text{ och } ${flatList[totalCount/2]}` : `\\text{Mittenplatsen är värdet } ${median}` 
                    },
                    ...(isEven ? [{
                        text: lang === 'sv' ? "Eftersom kön är jämn, tar vi medelvärdet av de två mittersta siffrorna." : "Since the line is even, we take the mean of the two middle digits.",
                        latex: `\\text{Median} = \\frac{${flatList[totalCount/2 - 1]} + ${flatList[totalCount/2]}}{2} = \\mathbf{${median}}`
                    }] : []),
                    { text: lang === 'sv' ? `Svar: ${median}` : `Answer: ${median}`, latex: `\\mathbf{${median}}` }
                ]
            };
        }

        // ==========================================
        // VARIATION D: Mode (Typvärde)
        // ==========================================
        const modeIdx = freqs.indexOf(Math.max(...freqs));
        const mode = vals[modeIdx];
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket är typvärdet enligt ${tVis}?` : `What is the mode according to ${tVis}?`,
                interceptorToken: `${mode}`, answerType: 'numeric',
                geometry: { type: geomType, headers, rows }
            },
            token: this.toBase64(mode.toString()), variationKey: 'freq_mode', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Typvärdet är det värde som har absolut ${isGraph ? 'högst stapel' : 'högst siffra i Antal-spalten'}.` : `The mode is the value that has the absolute ${isGraph ? 'highest bar' : 'highest number in the Count column'}.`, 
                    latex: `\\text{Leta efter det största antalet}` 
                },
                { 
                    text: lang === 'sv' ? `Leta efter den ${isGraph ? 'högsta stapeln. Vi ser att den når upp till' : 'största siffran i kolumnen Antal. Vi ser att toppsiffran är'} ${freqs[modeIdx]}.` : `Look for the ${isGraph ? 'highest bar. We see it reaches up to' : 'largest number in the Count column. We see the top digit is'} ${freqs[modeIdx]}.`, 
                    latex: `\\text{Största antal} = \\mathbf{${freqs[modeIdx]}}` 
                },
                { 
                    text: lang === 'sv' ? `Kolla nu ${isGraph ? 'rakt ner på x-axeln under den stapeln' : 'horisontellt till vänster på samma rad'} för att se vilket värde som vann.` : `Now look ${isGraph ? 'straight down to the x-axis under that bar' : 'horizontally to the left on the same row'} to see which value won.`, 
                    latex: `\\text{Motsvarande värde} = \\mathbf{${mode}}` 
                },
                { text: lang === 'sv' ? `Svar: ${mode}` : `Answer: ${mode}`, latex: `\\mathbf{${mode}}` }
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
                    description: lang === 'sv' ? "Om en datamängd innehåller ett extremt värde (en 'outlier' som skiljer sig enormt), vilket lägesmått är oftast mest rättvisande?" : "If a data set contains an extreme value (an 'outlier' that is vastly different), which measure of center is usually most accurate?",
                    answerType: 'multiple_choice', options: lang === 'sv' ? ["Medelvärde", "Median", "Typvärde"] : ["Mean", "Median", "Mode"]
                },
                token: this.toBase64(ans), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "Tänk på vad som händer med medelvärdet: Eftersom alla tal plussas ihop i summan kommer en enda gigantisk lyxvilla eller jättehög miljonlön att förvränga och dra upp snittet jättemycket." : "Think about what happens to the mean: Since all numbers are added together into the sum, a single gigantic luxury mansion or ultra-high salary will distort and pull up the average massively.", 
                        latex: `\\text{Medelvärde} \\rightarrow \\text{Känsligt för chocksiffror}` 
                    },
                    { 
                        text: lang === 'sv' ? "Medianen bryr sig däremot bara om vilket tal som hamnar exakt i mitten av kön. Den struntar fullständigt i hur extrema talsiffrorna är ute i kanterna." : "The median, on the other hand, only cares about which number ends up exactly in the middle of the line. It completely ignores how extreme the numbers are out on the edges.", 
                        latex: `\\text{Median} \\rightarrow \\text{Oskadd av chocksiffror}` 
                    },
                    { 
                        text: lang === 'sv' ? "Därför är medianen bäst och mest rättvisande att använda när vi har konstiga avvikande fantasisiffror i datan." : "Therefore, the median is best and most fair to use when we have weird, skewed outlier numbers in our data setup.", 
                        latex: `\\text{Bästa val} = \\mathbf{\\text{Median}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `\\text{${ans}}` 
                    }
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
                { 
                    text: lang === 'sv' ? "Vi löser uppgiften baklänges! Om medelpriset för alla 5 kg äpplen (2 kg + 3 kg) ska landa på 26 kr/kg, kan vi direkt räkna ut vad kassan ska kosta totalt." : "We solve this task backwards! If the average price for all 5 kg of apples (2 kg + 3 kg) is supposed to land on 26 kr/kg, we can directly calculate what the register total must equal.", 
                    latex: `\\text{Total kostnad i kassan} = 5 \\text{ kg} \\cdot 26 \\text{ kr/kg}` 
                },
                { 
                    text: lang === 'sv' ? "Gångra vikten med medelpriset för att hitta kassa-totalen:" : "Multiply the weight by the average price to find the register total:", 
                    latex: `\\text{Total kostnad i kassan} = 5 \\cdot 26 = \\mathbf{${totalSum}}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut vad den första kända sorten kostade: 2 kg gånger 20 kr/kg blir ${val1 * weight1} kr.` : `Calculate what the first known kind costed: 2 kg times 20 kr/kg equals ${val1 * weight1} kr.`, 
                    latex: `\\text{Kostnad sort 1} = 2 \\cdot 20 = \\mathbf{${val1 * weight1}}` 
                },
                { 
                    text: lang === 'sv' ? `Dra bort sort 1 (${val1 * weight1} kr) från hela kassa-totalen (${totalSum} kr) för att se hur mycket pengar som läggs på den andra sorten.` : `Subtract kind 1 (${val1 * weight1} kr) from the register total (${totalSum} kr) to see how much money is spent on the second kind.`, 
                    latex: `\\text{Kostnad sort 2 samlat} = ${totalSum} - \\mathbf{${val1 * weight1}} = \\mathbf{${missingSum}}` 
                },
                { 
                    text: lang === 'sv' ? `Eftersom de ${missingSum} kronorna fördelas jämnt på de återstående 3 kilona av den andra sorten, delar (dividerar) vi med 3.` : `Since those ${missingSum} crowns are spread evenly across the remaining 3 kg of the second kind, we divide by 3.`, 
                    latex: `\\text{Pris per kg för sort 2} = \\frac{${missingSum}}{\\mathbf{3}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut delningen för att hitta kilopriset på den andra äppelsorten." : "Compute the final division fraction to establish the per-kilogram price of the second apple group.", 
                    latex: `\\text{Pris per kg för sort 2} = \\mathbf{${ansVal}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ansVal} kr/kg` : `Answer: ${ansVal} kr/kg`, 
                    latex: `${ansVal}` 
                }
            ]
        };
    }

    private level7_Mixed(lang: string, options: any): any {
        const subLevel = MathUtils.randomInt(1, 6);
        return this.generate(subLevel, lang, options);
    }
}