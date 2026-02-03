import { MathUtils } from '../utils/MathUtils.js';

export class AnglesGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Terminology(lang);
            case 2: return this.level2_CompSupp(lang);
            case 3: return this.level3_Vertical(lang);
            case 4: return this.level4_TriangleSum(lang);
            case 5: return this.level5_Polygons(lang);
            case 6: return this.level6_Parallel(lang);
            default: return this.level1_Terminology(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // L1: Classification
    private level1_Terminology(lang: string): any {
        const type = MathUtils.randomChoice(['acute', 'right', 'obtuse', 'straight']);
        let angle = 0;
        let labelSv = "";
        let labelEn = "";

        if (type === 'acute') { angle = MathUtils.randomInt(20, 80); labelSv = "Spetsig"; labelEn = "Acute"; }
        else if (type === 'right') { angle = 90; labelSv = "Rät"; labelEn = "Right"; }
        else if (type === 'obtuse') { angle = MathUtils.randomInt(100, 170); labelSv = "Trubbig"; labelEn = "Obtuse"; }
        else { angle = 180; labelSv = "Rak"; labelEn = "Straight"; }

        const cx = 150, cy = 200;
        const len = 100;
        const x2 = cx + len * Math.cos(-angle * Math.PI / 180);
        const y2 = cy + len * Math.sin(-angle * Math.PI / 180);

        return {
            renderData: {
                description: lang === 'sv' ? "Vad kallas denna typ av vinkel?" : "What is this type of angle called?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle(lang === 'sv' ? ["Spetsig", "Rät", "Trubbig", "Rak"] : ["Acute", "Right", "Obtuse", "Straight"]),
                geometry: {
                    type: 'angle',
                    lines: [{x1: cx, y1: cy, x2: cx + len, y2: cy}, {x1: cx, y1: cy, x2, y2}],
                    arcs: [{ center: {x: cx, y: cy}, startAngle: 0, endAngle: angle, radius: 40, label: `${angle}°` }]
                }
            },
            token: this.toBase64(lang === 'sv' ? labelSv : labelEn),
            clues: [{ text: lang === 'sv' ? "Titta på gradtalet. Rät vinkel är 90°. Rak vinkel är 180°." : "Look at the degrees. Right angle is 90°. Straight is 180°." }]
        };
    }

    // L2: 90 / 180 Splits
    private level2_CompSupp(lang: string): any {
        const isSupp = MathUtils.randomInt(0, 1) === 1;
        const total = isSupp ? 180 : 90;
        const known = MathUtils.randomInt(20, total - 20);
        const unknown = total - known;
        const cx = 150, cy = 200;
        const len = 120;

        const lines = isSupp ? [{x1: cx - len, y1: cy, x2: cx + len, y2: cy}] : [{x1: cx, y1: cy, x2: cx + len, y2: cy}, {x1: cx, y1: cy, x2: cx, y2: cy - len}];
        const xCut = cx + len * Math.cos(-known * Math.PI / 180);
        const yCut = cy + len * Math.sin(-known * Math.PI / 180);
        lines.push({x1: cx, y1: cy, x2: xCut, y2: yCut});

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna vinkeln x." : "Calculate angle x.",
                answerType: 'numeric',
                geometry: {
                    type: 'angle', lines,
                    arcs: [
                        { center: {x: cx, y: cy}, startAngle: 0, endAngle: known, radius: 40, label: `${known}°` },
                        { center: {x: cx, y: cy}, startAngle: known, endAngle: total, radius: 50, label: 'x' }
                    ]
                }
            },
            token: this.toBase64(unknown.toString()),
            clues: [
                { text: lang === 'sv' ? (isSupp ? "En rak linje är 180°." : "Ett rätblockshörn är 90°.") : (isSupp ? "A straight line is 180°." : "A right angle is 90°.") },
                { text: lang === 'sv' ? `Subtrahera: ${total} - ${known} = x` : `Subtract: ${total} - ${known} = x` }
            ]
        };
    }

    // L3: Vertical & Side
    private level3_Vertical(lang: string): any {
        const angle = MathUtils.randomInt(40, 140);
        const type = MathUtils.randomChoice(['vertical', 'side']);
        const cx = 150, cy = 125, len = 100;
        const rot = 15;

        const lines = [
            {x1: cx - len * Math.cos(rot * Math.PI / 180), y1: cy + len * Math.sin(rot * Math.PI / 180), x2: cx + len * Math.cos(rot * Math.PI / 180), y2: cy - len * Math.sin(rot * Math.PI / 180)},
            {x1: cx - len * Math.cos((rot + angle) * Math.PI / 180), y1: cy + len * Math.sin((rot + angle) * Math.PI / 180), x2: cx + len * Math.cos((rot + angle) * Math.PI / 180), y2: cy - len * Math.sin((rot + angle) * Math.PI / 180)}
        ];

        let target = type === 'vertical' ? angle : 180 - angle;
        const arcs = [{ center: {x: cx, y: cy}, startAngle: rot, endAngle: rot + angle, radius: 40, label: `${angle}°` }];
        if (type === 'vertical') arcs.push({ center: {x: cx, y: cy}, startAngle: rot + 180, endAngle: rot + angle + 180, radius: 40, label: 'x' });
        else arcs.push({ center: {x: cx, y: cy}, startAngle: rot + angle, endAngle: rot + 180, radius: 35, label: 'x' });

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna x." : "Calculate x.",
                answerType: 'numeric',
                geometry: { type: 'angle', lines, arcs }
            },
            token: this.toBase64(target.toString()),
            clues: [{ text: type === 'vertical' ? (lang === 'sv' ? "Vertikalvinklar (mitt emot) är lika stora." : "Vertical angles (opposite) are equal.") : (lang === 'sv' ? "Sidovinklar blir 180° tillsammans." : "Adjacent angles sum to 180°.") }]
        };
    }

    // L4: Triangle Sum
    private level4_TriangleSum(lang: string): any {
        const a = MathUtils.randomInt(30, 80);
        const b = MathUtils.randomInt(30, 80);
        const x = 180 - a - b;
        
        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna den saknade vinkeln x i triangeln." : "Find the missing angle x in the triangle.",
                answerType: 'numeric',
                geometry: {
                    type: 'angle',
                    polygons: [{ points: "50,220 250,220 150,50" }],
                    labels: [{x: 65, y: 210, text: `${a}°`}, {x: 235, y: 210, text: `${b}°`}, {x: 150, y: 85, text: 'x'}]
                }
            },
            token: this.toBase64(x.toString()),
            clues: [
                { text: lang === 'sv' ? "Summan av vinklarna i en triangel är alltid 180°." : "The sum of angles in a triangle is always 180°." },
                { latex: `${a} + ${b} + x = 180` }
            ]
        };
    }

    // L5: Polygons (Sums & Missing Angle)
    private level5_Polygons(lang: string): any {
        // Mode 0: Calculate Sum (n-gon)
        // Mode 1: Find missing angle in Quadrilateral
        const type = MathUtils.randomInt(0, 1);

        if (type === 0) {
            const n = MathUtils.randomChoice([4, 5, 6]);
            const sum = (n - 2) * 180;
            const names = { 4: {sv:"fyrhörning", en:"quadrilateral"}, 5: {sv:"femhörning", en:"pentagon"}, 6: {sv:"sexhörning", en:"hexagon"} };
            
            // Draw Regular Polygon
            const r = 80;
            const cx = 150, cy = 125;
            let pointsStr = "";
            for(let i=0; i<n; i++) {
                const ang = (i * 2 * Math.PI / n) - Math.PI/2;
                pointsStr += `${cx + r*Math.cos(ang)},${cy + r*Math.sin(ang)} `;
            }

            return {
                renderData: {
                    description: lang === 'sv' ? `Vad är vinkelsumman i en ${names[n as keyof typeof names].sv}?` : `What is the sum of angles in a ${names[n as keyof typeof names].en}?`,
                    answerType: 'numeric',
                    geometry: { type: 'angle', polygons: [{points: pointsStr}] }
                },
                token: this.toBase64(sum.toString()),
                clues: [
                    { text: lang === 'sv' ? "Formel: (antal hörn - 2) × 180°" : "Formula: (number of corners - 2) × 180°" },
                    { latex: `(${n} - 2) \\cdot 180^\\circ` }
                ]
            };
        } else {
            // Find missing angle in Quadrilateral (Sum = 360)
            const a = MathUtils.randomInt(70, 110);
            const b = MathUtils.randomInt(70, 110);
            const c = MathUtils.randomInt(70, 110);
            const x = 360 - a - b - c;

            // Draw Irregular Quadrilateral
            const poly = { points: "50,50 250,50 230,200 70,200" };
            const labels = [
                {x: 70, y: 70, text: `${a}°`}, 
                {x: 230, y: 70, text: `${b}°`}, 
                {x: 210, y: 185, text: `${c}°`}, 
                {x: 90, y: 185, text: 'x'}
            ];

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna vinkeln x i fyrhörningen." : "Calculate angle x in the quadrilateral.",
                    answerType: 'numeric',
                    geometry: { type: 'angle', polygons: [poly], labels: labels }
                },
                token: this.toBase64(x.toString()),
                clues: [
                    { text: lang === 'sv' ? "Vinkelsumman i en fyrhörning är 360°." : "The sum of angles in a quadrilateral is 360°." },
                    { latex: `${a} + ${b} + ${c} + x = 360` }
                ]
            };
        }
    }

    // L6: Parallel Lines Advanced
    private level6_Parallel(lang: string): any {
        const angle = MathUtils.randomInt(50, 130);
        // Types: 
        // 'corr' (Corresponding - F)
        // 'alt_int' (Alternate Interior - Z)
        // 'alt_ext' (Alternate Exterior)
        // 'interior' (Co-interior - U / Sum 180)
        const type = MathUtils.randomChoice(['corr', 'alt_int', 'alt_ext', 'interior']);

        let target = (type === 'interior') ? 180 - angle : angle;
        const cx = 150, cy = 125, offset = 50;

        const lines = [
            {x1: 30, y1: cy - offset, x2: 270, y2: cy - offset}, // Top Parallel
            {x1: 30, y1: cy + offset, x2: 270, y2: cy + offset}, // Bottom Parallel
            {x1: 100, y1: 50, x2: 200, y2: 200} // Transversal
        ];

        const labels = [];
        // Define standard positions based on intersection points
        // Intersection Top: approx (117, 75)
        // Intersection Bot: approx (183, 175)
        
        // Let's assume standard position for Known Angle is Top-Right Intersection (Top Right sector)
        // This is an "Exterior" angle relative to the parallel band if it's above top line.
        // Let's place Known Angle at Top-Right-Interior (below top line, right of transversal) for simpler logic?
        // Or stick to Top-Right-Exterior (above top line). Let's use Top-Right-Exterior.
        labels.push({ x: 145, y: 65, text: `${angle}°` }); // Top-Right (Exterior)

        // Determine position of x based on relationship to Top-Right (Exterior)
        if (type === 'corr') {
            // Corresponding: Bottom-Right (Exterior) relative to bottom intersection?
            // No, Corresponding to Top-Right-Ext is Bottom-Right-Ext.
            // i.e. Same relative position at bottom intersection.
            // Pos: Above bottom line, right of transversal.
            labels.push({ x: 210, y: 165, text: 'x' });
        } else if (type === 'alt_ext') {
            // Alternate Exterior: Bottom-Left (Exterior).
            // Opposite side of transversal, outside parallel lines.
            labels.push({ x: 140, y: 195, text: 'x' });
        } else if (type === 'alt_int') {
            // Alternate Interior: 
            // Wait, Top-Right-Ext is NOT interior.
            // To test Alt-Int, we should probably START with an interior angle.
            // Let's change the setup dynamically based on type.
        } 
        
        // RE-SETUP based on Type to ensure clear diagrams
        // Clear labels
        labels.length = 0;

        if (type === 'alt_int') {
            // Known: Top-Right (Interior)
            labels.push({ x: 145, y: 90, text: `${angle}°` });
            // x: Bottom-Left (Interior) -> Z shape
            labels.push({ x: 155, y: 160, text: 'x' });
        } else if (type === 'interior') { // Co-interior
            // Known: Top-Right (Interior)
            labels.push({ x: 145, y: 90, text: `${angle}°` });
            // x: Bottom-Right (Interior) -> U shape (Sum 180)
            labels.push({ x: 195, y: 160, text: 'x' });
        } else if (type === 'alt_ext') {
            // Known: Top-Left (Exterior)
            labels.push({ x: 90, y: 60, text: `${angle}°` });
            // x: Bottom-Right (Exterior)
            labels.push({ x: 230, y: 190, text: 'x' });
        } else { // Corresponding
            // Known: Top-Right (Exterior)
            labels.push({ x: 145, y: 60, text: `${angle}°` });
            // x: Bottom-Right (Exterior)
            labels.push({ x: 215, y: 160, text: 'x' });
        }

        const clueSv = type === 'interior' 
            ? "Vinklar på samma sida innanför linjerna (U-form) blir tillsammans 180°." 
            : (type === 'alt_int' ? "Alternatvinklar (Z-form) är lika stora." 
            : (type === 'alt_ext' ? "Yttre alternatvinklar är lika stora." 
            : "Likbelägna vinklar (F-form) är lika stora."));

        return {
            renderData: {
                description: lang === 'sv' ? "Linjerna är parallella. Bestäm x." : "Lines are parallel. Find x.",
                answerType: 'numeric',
                geometry: { type: 'angle', lines, labels }
            },
            token: this.toBase64(target.toString()),
            clues: [
                {
                    text: lang === 'sv' ? clueSv : "Corresponding and Alternate angles are equal. Co-interior sum to 180°.",
                    latex: type === 'interior' ? `x + ${angle} = 180` : `x = ${angle}`
                }
            ]
        };
    }
}