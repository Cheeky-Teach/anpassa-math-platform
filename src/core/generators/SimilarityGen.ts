import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class SimilarityGen {
    // A pool of "instructive" scale factors to build student intuition
    private static readonly COMMON_K = [1.5, 2, 2.5, 3, 4, 5, 10];

    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to Level 2 calculations
        if (level === 1 && options.hideConcept && options.exclude?.includes('sim_concept_lie')) {
            return this.level2_CalcSide(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_Concept(lang, undefined, options); break;
            case 2: questionData = this.level2_CalcSide(lang, undefined, options); break;
            case 3: questionData = this.level3_TopTriangle(lang, undefined, options); break;
            case 4: questionData = this.level4_Mixed(lang, options); break;
            default: questionData = this.level1_Concept(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [2, 3, 4];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to maintain Studio compatibility.
     */

    public generateByVariation(key: string, lang: string = 'sv', options: any = {}): any {
        // Map the flipped local variable references seamlessly so the inner conditions execute correctly
        const variationKey = key; 
        
        const k = MathUtils.randomChoice(SimilarityGen.COMMON_K);
        const shapeType = MathUtils.randomChoice(['rectangle', 'parallelogram', 'triangle']);
        if (['sim_calc_big', 'sim_calc_small', 'sim_find_k'].includes(key)) {
            return this.level2_CalcSide(lang, key, options);
        }
        if (['transversal_total', 'transversal_extension'].includes(key)) {
            return this.level3_TopTriangle(lang, key, options);
        }
        // Fallback for concepts
        switch (key) {
            case 'sim_rect_check':
            case 'sim_tri_angle_check':
            case 'sim_tri_side_check':
            case 'sim_concept_lie':
                return this.level1_Concept(lang, key);
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

    // --- LEVEL 1: CONCEPT (Identifying Similarity) ---
    private level1_Concept(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'sim_rect_check', type: 'concept' },
            { key: 'sim_tri_angle_check', type: 'concept' },
            { key: 'sim_tri_side_check', type: 'concept' },
            { key: 'sim_concept_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'sim_concept_lie') {
            const sTrue1 = lang === 'sv' ? "Alla liksidiga trianglar har samma form." : "All equilateral triangles have the same shape.";
            const sTrue2 = lang === 'sv' ? "Alla cirklar har exakt samma runda form." : "All circles have exactly the same round shape.";
            const sLie = lang === 'sv' ? "Alla rektanglar har exakt samma form." : "All rectangles have exactly the same shape.";
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket av följande påståenden om likformighet stämmer INTE?" : "Which of the following statements about similarity is FALSE?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([sTrue1, sTrue2, sLie])
                },
                token: this.toBase64(sLie), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "Likformighet betyder att två figurer är perfekta kopior av varandra. De måste ha exakt samma form, men den ena kan vara uppförstoring eller nedkrympning." : "Similarity means two shapes are perfect copies of each other. They must have exactly the same shape, but one can be magnified or shrunk down.", 
                        latex: `\\text{Likformig} = \\text{Exakt samma form}` 
                    },
                    { 
                        text: lang === 'sv' ? "Alla cirklar är alltid perfekt runda. Alla liksidiga trianglar har alltid exakt vinklarna 60°, 60° och 60°, så de har alltid samma form." : "All circles are always perfectly round. All equilateral triangles always have exactly the angles 60°, 60°, and 60°, so they always share the same shape.", 
                        latex: `\\text{Cirklar och liksidiga trianglar} \\rightarrow \\text{Alltid samma form}` 
                    },
                    { 
                        text: lang === 'sv' ? "Men rektanglar kan se helt olika ut! En rektangel kan vara jättelång och smal, medan en annan är nästan som en kvadrat. De har alltså inte alltid samma form, vilket gör det här påståendet till en lögn:" : "But rectangles can look completely different! One rectangle can be very long and narrow, while another is almost like a square. They don't always share the same shape, making this statement the lie:", 
                        latex: `\\mathbf{\\text{Lögn: } ${sLie}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${sLie}` : `Answer: ${sLie}`, latex: `\\text{${sLie}}` }
                ]
            };
        }

        const isSimilar = Math.random() > 0.5;
        const k = MathUtils.randomChoice(SimilarityGen.COMMON_K);
        let geom: any = { type: 'similarity_compare' };
        let desc = "", clueText = "", clueLatex = "";

        if (v === 'sim_rect_check') {
            geom.shapeType = 'rectangle';
            const w1 = MathUtils.randomInt(2, 10), h1 = MathUtils.randomInt(2, 8);
            const w2 = w1 * k;
            const h2 = isSimilar ? h1 * k : h1 * (k + 0.5);
            geom.left = { labels: { b: w1, h: h1 } };
            geom.right = { labels: { b: w2, h: h2 } };
            desc = lang === 'sv' ? "Avgör om de två rektanglarna nedan är likformiga (perfekta kopior)." : "Determine if the two rectangles below are similar (perfect copies).";
            clueText = lang === 'sv' ? "Vi kollar om bredden och höjden har förstorats lika många gånger. Dela den stora figurens mått med den lillas motsvarande mått." : "Let's check if the width and height have been magnified the same number of times. Divide the large shape's dimensions by the small one's corresponding dimensions.";
            clueLatex = `\\frac{${w2}}{${w1}} = ${w2/w1} \\quad \\text{vs} \\quad \\frac{${h2}}{${h1}} = ${h2/h1}`;
        } else if (v === 'sim_tri_angle_check') {
            geom.shapeType = 'triangle';
            const a1 = MathUtils.randomChoice([30, 45, 60]), a2 = MathUtils.randomChoice([40, 70, 80]);
            const b1 = isSimilar ? a1 : a1 + 10;
            geom.left = { labels: { angle1: `${a1}°`, angle2: `${a2}°` } };
            geom.right = { labels: { angle1: `${b1}°`, angle2: `${a2}°` } };
            desc = lang === 'sv' ? "Är trianglarna likformiga baserat på vinklarna?" : "Are the triangles similar based on the angles?";
            clueText = lang === 'sv' ? "För att två trianglar ska ha exakt samma form måste deras vinklar matcha varandra perfekt." : "For two triangles to have exactly the same shape, their angles must match each other perfectly.";
            clueLatex = lang === 'sv' ? `\\text{Jämför hörnens öppningar}` : `\\text{Compare corresponding corner angles}`;
        } else {
            geom.shapeType = 'triangle';
            const s1 = MathUtils.randomInt(3, 8), s2 = MathUtils.randomInt(6, 10);
            const r1 = s1 * k, r2 = isSimilar ? s2 * k : s2 * (k + 1);
            geom.left = { labels: { s1, s2 } };
            geom.right = { labels: { s1: r1, s2: r2 } };
            desc = lang === 'sv' ? "Undersök sidorna nedan. Är figurerna likformiga (lika formade)?" : "Examine the sides below. Are the shapes similar (identically shaped)?";
            clueText = lang === 'sv' ? "Dela måtten i den stora figuren med motsvarande vägg i den lilla figuren för att se om de har växt i samma takt." : "Divide the measurements in the large shape by the corresponding wall in the small shape to see if they grew at the exact same rate.";
            clueLatex = `\\frac{${r1}}{${s1}} = ${r1/s1} \\quad \\text{vs} \\quad \\frac{${r2}}{${s2}} = ${r2/s2}`;
        }

        const ans = isSimilar ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");
        return {
            renderData: { description: desc, answerType: 'multiple_choice', options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"], geometry: geom },
            token: this.toBase64(ans), variationKey: v, type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' ? "Kom ihåg regeln: Likformiga figurer är som foton i olika storlekar. Alla vinklar måste vara helt identiska och sidorna måste ha förstorats eller krympts exakt lika mycket." : "Remember the rule: Similar shapes are like photos in different sizes. All angles must be completely identical and the sides must have been magnified or shrunk by the exact same amount.", 
                    latex: `\\text{Likformig} = \\text{Samma form, men olika storlek}` 
                },
                { text: clueText, latex: clueLatex },
                { 
                    text: lang === 'sv' ? (isSimilar ? "Eftersom båda sidorna har växt i exakt samma takt blir svaret Ja!" : "Eftersom sidorna inte har växt i samma takt (olika förstoring) blir svaret Nej.") : (isSimilar ? "Since both sides grew at the exact same rate, the answer is Yes!" : "Since the sides did not grow at the same rate (different magnification), the answer is No."), 
                    latex: isSimilar ? `\\text{Resultat} = \\mathbf{\\text{${ans}}}` : `\\text{Resultat} = \\mathbf{\\text{${ans}}}` 
                },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, latex: `\\text{${ans}}` }
            ]
        };
    }

    // --- LEVEL 2: CALCULATE SIDE ---
    private level2_CalcSide(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'sim_calc_big', type: 'calculate' },
            { key: 'sim_calc_small', type: 'calculate' },
            { key: 'sim_find_k', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const k = MathUtils.randomChoice(SimilarityGen.COMMON_K);
        
        const shapeType = MathUtils.randomChoice(['rectangle', 'parallelogram', 'triangle']);
        const s1 = MathUtils.randomChoice([4, 6, 8, 10]), s2 = MathUtils.randomChoice([3, 5, 7, 9]);
        const bigS1 = s1 * k, bigS2 = s2 * k;

        // 🟢 FIXED HOISTING BUG: Declare labels and answers upfront so they are available in all branches
        const findBig = v === 'sim_calc_big';
        const ans = findBig ? bigS1 : s1;
        
        // For scale finding, both are labeled; for side calculations, 'x' is positioned appropriately
        const labelsL = v === 'sim_find_k' ? { b: s1, h: s2 } : (findBig ? { b: s1, h: s2 } : { b: 'x', h: s2 });
        const labelsR = v === 'sim_find_k' ? { b: bigS1, h: bigS2 } : (findBig ? { b: 'x', h: bigS2 } : { b: bigS1, h: bigS2 });

        if (v === 'sim_find_k') {
            return {
                renderData: {
                    geometry: { type: 'similarity_compare', shapeType, left: { labels: labelsL }, right: { labels: labelsR } },
                    description: lang === 'sv' ? `Beräkna den saknade sidan x i de likformiga figurerna.` : `Calculate the missing side x in the similar shapes.`,
                    interceptorToken: `${s1} ; ${s2} ; ${bigS1} ; ${bigS2} ; ${k}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(k.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Vi vill ta reda på hur många gånger större den stora kopian är jämfört med den lilla originalfiguren. Det gör vi genom att jämföra två kända väggar som matchar varandra." : "We want to find out how many times larger the large copy is compared to the small original shape. We do this by comparing two known walls that match each other.", 
                        latex: `\\text{Förstoringstakt} = \\frac{\\text{Matchande sida i STORA figuren}}{\\text{Matchande sida i LILLA figuren}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Ta den kända bottenlinjen i den stora figuren (${bigS1}) och dela (dividera) med bottenlinjen i den lilla figuren (${s1}).` : `Take the known baseline in the large shape (${bigS1}) and divide by the baseline in the small shape (${s1}).`, 
                        latex: `\\text{Förstoringstakt} = \\frac{${bigS1}}{\\mathbf{${s1}}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut divisionen för att hitta hur många gånger större figuren har blivit." : "Calculate the division to find out how many times larger the shape has become.", 
                        latex: `\\text{Förndringstakt} = \\mathbf{${k}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${k}` : `Answer: ${k}`, latex: `${k}` }
                ]
            };
        }

        return {
            renderData: {
                geometry: { type: 'similarity_compare', shapeType, left: { labels: labelsL }, right: { labels: labelsR } },
                description: lang === 'sv' ? `Beräkna den saknade sidan x i de likformiga figurerna.` : `Calculate the missing side x in the similar shapes.`,
                interceptorToken: `${s1} ; ${s2} ; ${k}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Först tar vi reda på förstoringstakten (hur många gånger större den stora figuren är). Det gör vi genom att dela de två kända väggarna som matchar varandra." : "First, let's find out the magnification rate (how many times larger the big shape is). We do this by dividing the two known walls that match each other.", 
                    latex: `\\text{Förstoringstakt} = \\frac{\\text{Stora väggen}}{\\text{Lilla väggen}} = \\frac{${bigS2}}{${s2}}` 
                },
                { 
                    text: lang === 'sv' ? `Uträkningen visar att den stora figuren är exakt ${k} gånger större än den lilla.` : `The calculation shows that the large shape is exactly ${k} times larger than the small one.`, 
                    latex: `\\text{Förstoringstakt} = \\mathbf{${k}}` 
                },
                { 
                    text: lang === 'sv' ? (findBig ? `Eftersom vi letar efter en lång sida x i den STORA figuren, tar vi den lilla sidans mått (${s1}) och gångrar (multiplicerar) med förstoringen ${k}.` : `Eftersom vi letar efter en kort sida x i den LILLA figuren, tar vi den stora bildens mått (${bigS1}) och delar (dividerar) med ${k}.`) : (findBig ? `Since we are looking for a long side x in the LARGE shape, we take the small side's dimension (${s1}) and multiply by the magnification factor ${k}.` : `Since we are looking for a short side x in the SMALL shape, we take the large image's dimension (${bigS1}) and divide by ${k}.`), 
                    latex: findBig ? `x = ${s1} \\cdot \\mathbf{${k}}` : `x = \\frac{${bigS1}}{\\mathbf{${k}}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut det sista steget för att låsa upp längden på väggen x." : "Calculate the final step to unlock the length of wall x.", 
                    latex: `x = \\mathbf{${ans}}` 
                },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, latex: `${ans}` }
            ]
        };
    }

    // --- LEVEL 3: TOP TRIANGLE ---
    private level3_TopTriangle(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || this.getVariation([
            { key: 'transversal_total', type: 'calculate' },
            { key: 'transversal_extension', type: 'calculate' },
            { key: 'transversal_concept_id', type: 'concept' }
        ], options);

        const top = MathUtils.randomInt(2, 10), extra = MathUtils.randomInt(2, 10);
        const smallBase = MathUtils.randomInt(3, 9);
        const totSide = top + extra;
        const k = totSide / top;
        const bigBase = smallBase * k;

        if (v === 'transversal_concept_id') {
            const correct = lang === 'sv' ? "Topptriangeln och hela den stora triangeln" : "The top triangle and the whole large triangle";
            return {
                renderData: {
                    description: lang === 'sv' ? "När en triangel delas av en rät linje parallell med basen, vilka två figurer är då likformiga (perfekta kopior)?" : "When a triangle is divided by a straight line parallel to the base, which two shapes are then similar (perfect copies)?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, lang === 'sv' ? "Den övre triangeln och den nedre fyrhörningen" : "The upper triangle and the lower quadrilateral", lang === 'sv' ? "Inga delar alls är likformiga" : "No parts at all are similar"])
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "När vi drar ett rakt streck inuti triangeln som lutar exakt likadant som bottenlinjen, knoppar vi av en liten miniatyr-triangel högst upp." : "When we draw a straight line inside the triangle that slants exactly like the baseline, we bud off a small miniature triangle at the very top.", 
                        latex: `\\text{Parallell linje i triangeln}` 
                    },
                    { 
                        text: lang === 'sv' ? "Den här lilla 'topptriangeln' behåller exakt samma hörnöppningar (vinklar) som den stora originaltriangeln. De har alltså exakt samma form!" : "This small 'top triangle' retains exactly the same corner openings (angles) as the original big triangle. Therefore, they have exactly the same shape!", 
                        latex: `\\text{Miniatyr och Original} \\rightarrow \\text{Samma form}` 
                    },
                    { 
                        text: lang === 'sv' ? `Det betyder att det är topptriangeln och hela den stora triangeln som är likformiga kopior av varandra.` : `This means that the top triangle and the whole large triangle are similar copies of each other.`, 
                        latex: `\\mathbf{\\text{Svar: } ${correct}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}`, latex: `\\text{${correct}}` }
                ]
            };
        }

        const isExt = v === 'transversal_extension';
        const labels = isExt 
            ? { left_top: top, left_bot: extra, base_top: smallBase, base_bot: 'x' }
            : { left_top: top, left_tot: totSide, base_top: smallBase, base_bot: 'x' };

        return {
            renderData: {
                geometry: { type: 'transversal', labels },
                description: lang === 'sv' ? "Beräkna längden på basen x med hjälp av likformighet." : "Calculate the length of base x using similarity.",
                interceptorToken: `${top} ; ${extra} ; ${smallBase} ; ${totSide} ; ${bigBase} ; ${k}`,
                answerType: 'numeric'
            },
            token: this.toBase64(bigBase.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Den lilla triangeln högst upp (topptriangeln) är en perfekt liten kopia av hela den jättestora triangeln. Vi kan hitta förstoringen genom att jämföra deras kända långsidor." : "The small triangle at the very top (the top triangle) is a perfect little copy of the entire huge triangle. We can find the magnification factor by comparing their known long sides.", 
                    latex: `\\text{Förstoringstakt} = \\frac{\\text{Hela stora trianglens vägg}}{\\text{Lilla topptriangelns vägg}}` 
                },
                { 
                    text: lang === 'sv' ? (isExt ? `Räkna först ut hela den långa vänstersidan på den stora triangeln genom att plussa ihop bitarna: ${top} + ${extra} blir ${totSide}.` : `Vi ser i bilden att den lilla topptriangelns vägg är ${top} och hela den stora trianglens vägg är ${totSide}.`) : (isExt ? `First, calculate the complete long left side of the large triangle by adding the pieces together: ${top} + ${extra} equals ${totSide}.` : `We can see in the diagram that the small top triangle's wall is ${top} and the whole large triangle's wall is ${totSide}.`), 
                    latex: isExt ? `\\text{Hela stora väggen} = ${top} + ${extra} = \\mathbf{${totSide}}` : `\\text{Hela stora väggen} = \\mathbf{${totSide}}` 
                },
                { 
                    text: lang === 'sv' ? `Dela nu hela den stora väggen (${totSide}) med den lilla toppväggen (${top}) för att se hur många gånger större den stora triangeln är.` : `Now divide the complete large wall (${totSide}) by the small top wall (${top}) to see how many times larger the big triangle is.`, 
                    latex: `\\text{Förstoringstakt} = \\frac{${totSide}}{\\mathbf{${top}}} = \\mathbf{${k}}` 
                },
                { 
                    text: lang === 'sv' ? `Eftersom hela den stora triangeln är exakt ${k} gånger större, tar vi den lilla innermuren (${smallBase}) och gångrar (multiplicerar) med ${k} för att hitta botten x.` : `Since the entire large triangle is exactly ${k} times larger, we take the small inner base (${smallBase}) and multiply by ${k} to find the bottom base x.`, 
                    latex: `x = ${smallBase} \\cdot \\mathbf{${k}}` 
                },
                { 
                    text: lang === 'sv' ? "Slutför multiplikationen för att få fram det färdiga bottenmåttet." : "Complete the multiplication to get the finished bottom baseline measurement.", 
                    latex: `x = \\mathbf{${bigBase}}` 
                },
                { text: lang === 'sv' ? `Svar: ${bigBase}` : `Answer: ${bigBase}`, latex: `${bigBase}` }
            ]
        };
    }

    // --- LEVEL 4: MIXED (Variety and Comprehensive Review) ---
    private level4_Mixed(lang: string, options: any): any {
        const subLevel = MathUtils.randomInt(1, 3);
        const data = this.generate(subLevel, lang, options);
        
        // Ensure metadata exists and mark as mixed
        if (!data.metadata) data.metadata = {};
        data.metadata.mixed = true;
        data.metadata.original_level = subLevel;
        
        return data;
    }
}