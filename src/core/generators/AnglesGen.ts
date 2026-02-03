import { MathUtils } from '../utils/MathUtils.js';

export class AnglesGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Terminology(lang);
            case 2: return this.level2_CompSupp(lang);
            case 3: return this.level3_Vertical(lang);
            case 4: return this.level4_TriangleSum(lang);
            case 5: return this.level5_Polygons(lang); // Swapped
            case 6: return this.level6_Parallel(lang); // Swapped
            default: return this.level1_Terminology(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // L1: Terminology (Acute, Right, Obtuse, Straight)
    private level1_Terminology(lang: string): any {
        const type = MathUtils.randomChoice(['acute', 'right', 'obtuse', 'straight']);
        let angle = 0;
        let labelSv = "";
        let labelEn = "";

        if (type === 'acute') { angle = MathUtils.randomInt(20, 80); labelSv = "Spetsig"; labelEn = "Acute"; }
        else if (type === 'right') { angle = 90; labelSv = "Rät"; labelEn = "Right"; }
        else if (type === 'obtuse') { angle = MathUtils.randomInt(100, 170); labelSv = "Trubbig"; labelEn = "Obtuse"; }
        else { angle = 180; labelSv = "Rak"; labelEn = "Straight"; }

        // Visual Data
        const cx = 150, cy = 200;
        const len = 100;
        // Ray 1 always flat right
        const x1 = cx + len, y1 = cy;
        // Ray 2 rotated by -angle (since SVG y is down)
        const rad = angle * (Math.PI / 180);
        const x2 = cx + len * Math.cos(-rad);
        const y2 = cy + len * Math.sin(-rad);

        const arcs = [{
            center: {x: cx, y: cy},
            startAngle: -angle, // SVG coordinates
            endAngle: 0,
            radius: 40,
            label: `${angle}°`,
            color: type === 'right' ? 'rgba(239, 68, 68, 0.2)' : undefined // Red square hint for right
        }];

        // If right angle, draw square marker logic in component? 
        // For simplicity, we just label it 90 degrees.

        const desc = lang === 'sv' 
            ? "Vad kallas denna typ av vinkel?" 
            : "What is this type of angle called?";
        
        const options = lang === 'sv' 
            ? ["Spetsig", "Rät", "Trubbig", "Rak"]
            : ["Acute", "Right", "Obtuse", "Straight"];

        return {
            renderData: {
                description: desc,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle(options),
                geometry: {
                    type: 'angle',
                    lines: [{x1: cx, y1: cy, x2: x1, y2: y1}, {x1: cx, y1: cy, x2: x2, y2: y2}],
                    arcs: arcs
                }
            },
            token: this.toBase64(lang === 'sv' ? labelSv : labelEn),
            clues: [
                {
                    text: lang === 'sv' ? "Jämför med 90° (ett hörn). Är den mindre, lika med, eller större?" : "Compare with 90° (a corner). Is it smaller, equal, or larger?",
                    latex: `v = ${angle}^\\circ`
                }
            ]
        };
    }

    // L2: Complementary & Supplementary (x + 40 = 90 or 180)
    private level2_CompSupp(lang: string): any {
        const isSupp = MathUtils.randomInt(0, 1) === 1; // 180 vs 90
        const total = isSupp ? 180 : 90;
        const known = MathUtils.randomInt(20, total - 20);
        const unknown = total - known;

        // Visuals
        const cx = 150, cy = 200;
        const len = 120;
        
        // Base line
        const lines = [];
        if (isSupp) {
            lines.push({x1: cx - len, y1: cy, x2: cx + len, y2: cy}); // Straight line
        } else {
            lines.push({x1: cx, y1: cy, x2: cx + len, y2: cy}); // Horizontal
            lines.push({x1: cx, y1: cy, x2: cx, y2: cy - len}); // Vertical
        }

        // Cutting ray
        const cutAngle = isSupp ? (180 - known) : (90 - known);
        const rad = cutAngle * (Math.PI / 180);
        const xCut = cx + len * Math.cos(-rad);
        const yCut = cy + len * Math.sin(-rad);
        lines.push({x1: cx, y1: cy, x2: xCut, y2: yCut});

        const arcs = [
            { center: {x: cx, y: cy}, startAngle: -cutAngle, endAngle: 0, radius: 40, label: `${known}°` },
            { center: {x: cx, y: cy}, startAngle: isSupp ? -180 : -90, endAngle: -cutAngle, radius: 50, label: 'x' }
        ];

        const desc = lang === 'sv' ? "Beräkna vinkeln x." : "Calculate angle x.";

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: { type: 'angle', lines, arcs }
            },
            token: this.toBase64(unknown.toString()),
            clues: [
                {
                    text: lang === 'sv' 
                        ? (isSupp ? "En rak linje är 180°." : "Ett rätblock hörn är 90°.") 
                        : (isSupp ? "A straight line is 180°." : "A right angle is 90°."),
                    latex: isSupp ? "x + " + known + "^\\circ = 180^\\circ" : "x + " + known + "^\\circ = 90^\\circ"
                },
                {
                    text: lang === 'sv' ? "Subtrahera den kända vinkeln från totalen." : "Subtract the known angle from the total.",
                    latex: `x = ${total} - ${known} = ${unknown}`
                }
            ]
        };
    }

    // L3: Vertical angles
    private level3_Vertical(lang: string): any {
        const angle = MathUtils.randomInt(30, 150);
        const type = MathUtils.randomChoice(['vertical', 'side']); // Vertical (equal) or Side (sum 180)
        
        // Lines crossing "X"
        const cx = 150, cy = 125;
        const len = 100;
        
        // Line 1: Flat-ish but rotated slightly for style
        const rot = 10; 
        const r1 = rot * (Math.PI/180);
        
        // Line 2: Rotated by 'angle' relative to Line 1
        const r2 = (rot + angle) * (Math.PI/180);

        const lines = [
            // Line 1 extends both ways
            {x1: cx - len*Math.cos(r1), y1: cy + len*Math.sin(r1), x2: cx + len*Math.cos(r1), y2: cy - len*Math.sin(r1)},
            // Line 2 extends both ways
            {x1: cx - len*Math.cos(r2), y1: cy + len*Math.sin(r2), x2: cx + len*Math.cos(r2), y2: cy - len*Math.sin(r2)}
        ];

        let target = 0;
        const arcs = [];
        
        if (type === 'vertical') {
            target = angle;
            // Draw known angle
            arcs.push({center: {x:cx, y:cy}, startAngle: -rot-angle, endAngle: -rot, radius: 40, label: `${angle}°`});
            // Draw x (opposite)
            arcs.push({center: {x:cx, y:cy}, startAngle: 180-rot-angle, endAngle: 180-rot, radius: 40, label: 'x'});
        } else {
            target = 180 - angle;
             // Draw known angle
            arcs.push({center: {x:cx, y:cy}, startAngle: -rot-angle, endAngle: -rot, radius: 40, label: `${angle}°`});
            // Draw x (adjacent)
            arcs.push({center: {x:cx, y:cy}, startAngle: 180-rot, endAngle: -rot-angle, radius: 40, label: 'x'});
        }

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna x." : "Calculate x.",
                answerType: 'numeric',
                geometry: { type: 'angle', lines, arcs }
            },
            token: this.toBase64(target.toString()),
            clues: [
                {
                    text: type === 'vertical' 
                        ? (lang === 'sv' ? "Vertikalvinklar (mittemot) är lika stora." : "Vertical angles (opposite) are equal.")
                        : (lang === 'sv' ? "Sidovinklar (bredvid) blir tillsammans 180°." : "Adjacent angles sum to 180°."),
                    latex: type === 'vertical' ? `x = ${angle}^\\circ` : `x + ${angle}^\\circ = 180^\\circ`
                }
            ]
        };
    }

    // L4: Triangle Sum
    private level4_TriangleSum(lang: string): any {
        const a = MathUtils.randomInt(30, 80);
        const b = MathUtils.randomInt(30, 80);
        const c = 180 - a - b;
        
        // Generate Triangle Points
        const p1 = {x: 50, y: 200};
        const p2 = {x: 250, y: 200};
        // P3 calculation using trigonometry to match angles A and B at base
        // Let A be at P1, B at P2.
        const baseLen = 200;
        // P3.y = baseLen * sin(A) * sin(B) / sin(A+B)
        // Simple logic: Use known coordinates or just approximate for visual?
        // Let's approximate a standard triangle visual but label it accurately.
        // Or specific logic:
        const x3 = 150 + MathUtils.randomInt(-30, 30);
        const y3 = 50; 
        
        // Actually, let's just draw a generic triangle and label it.
        const poly = { points: "50,200 250,200 150,50" }; // Generic shape
        
        const labels = [
            {x: 60, y: 190, text: `${a}°`},
            {x: 240, y: 190, text: `${b}°`},
            {x: 150, y: 80, text: 'x'}
        ];

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna x." : "Calculate x.",
                answerType: 'numeric',
                geometry: { type: 'angle', polygons: [poly], labels }
            },
            token: this.toBase64(c.toString()),
            clues: [
                {
                    text: lang === 'sv' ? "Vinkelsumman i en triangel är alltid 180°." : "The sum of angles in a triangle is always 180°.",
                    latex: `A + B + C = 180^\\circ`
                },
                {
                    latex: `${a} + ${b} + x = 180`
                }
            ]
        };
    }

    // L5: Polygons (Swapped with L6)
    private level5_Polygons(lang: string): any {
        const sides = MathUtils.randomChoice([4, 5, 6]);
        const sum = (sides - 2) * 180;
        const name = sides === 4 ? "Fyrhörning" : (sides === 5 ? "Femhörning" : "Sexhörning");
        
        const desc = lang === 'sv' 
            ? `Vad är vinkelsumman i en ${name.toLowerCase()}?` 
            : `What is the sum of angles in a ${sides}-gon?`;

        // Visual: Draw polygon
        // Logic: Generate regular polygon points
        const r = 80;
        const cx = 150, cy = 125;
        let pointsStr = "";
        for(let i=0; i<sides; i++) {
            const ang = (i * 2 * Math.PI / sides) - Math.PI/2;
            const px = cx + r * Math.cos(ang);
            const py = cy + r * Math.sin(ang);
            pointsStr += `${px},${py} `;
        }

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: { type: 'angle', polygons: [{points: pointsStr}] }
            },
            token: this.toBase64(sum.toString()),
            clues: [
                {
                    text: lang === 'sv' ? "Formeln för vinkelsumma:" : "Formula for angle sum:",
                    latex: `(n - 2) \\cdot 180^\\circ`
                },
                {
                    text: lang === 'sv' ? `Sätt in n = ${sides}.` : `Plug in n = ${sides}.`,
                    latex: `(${sides} - 2) \\cdot 180 = ${sides-2} \\cdot 180`
                }
            ]
        };
    }

    // L6: Parallel Lines (Swapped with L5)
    private level6_Parallel(lang: string): any {
        const angle = MathUtils.randomInt(50, 130);
        // Types: corresponding (F), alternate (Z), co-interior (U - sum 180)
        const type = MathUtils.randomChoice(['corr', 'alt', 'interior']);
        
        let target = 0;
        if (type === 'interior') target = 180 - angle;
        else target = angle;

        // Visuals
        const cx = 150, cy = 125;
        const len = 120;
        const offset = 60;
        
        // Parallel lines
        const lines = [
            {x1: cx-len, y1: cy-offset, x2: cx+len, y2: cy-offset}, // Top
            {x1: cx-len, y1: cy+offset, x2: cx+len, y2: cy+offset}, // Bottom
            // Transversal
            {x1: cx-40, y1: cy-offset-20, x2: cx+40, y2: cy+offset+20}
        ];

        // Label placement logic is tricky without hardcoding
        // Let's create specific scenarios
        const labels = [];
        // Transversal intersects top at roughly (130, 65) and bottom at (170, 185)
        
        // Set known angle at Top-Right (Acute if angle < 90)
        labels.push({x: 160, y: 60, text: `${angle}°`});
        
        if (type === 'corr') {
            // Corresponding: Bottom-Right
            labels.push({x: 200, y: 180, text: 'x'});
        } else if (type === 'alt') {
            // Alternate: Bottom-Left
            labels.push({x: 140, y: 190, text: 'x'});
        } else {
            // Interior: Top-Left (Same side interior)
            // Wait, usually Co-interior are between lines.
            // Let's put x at Bottom-Right (same side inside)
            // Known at Top-Right (inside? No above is inside).
            // Let's simplify: Known Top-Right (Acute). X Bottom-Right (Obtuse). Sum 180.
            labels.push({x: 185, y: 175, text: 'x'});
        }

        return {
            renderData: {
                description: lang === 'sv' ? "Linjerna är parallella. Bestäm x." : "Lines are parallel. Find x.",
                answerType: 'numeric',
                geometry: { type: 'angle', lines, labels }
            },
            token: this.toBase64(target.toString()),
            clues: [
                {
                    text: lang === 'sv' 
                        ? (type === 'interior' ? "Likbelägna inre vinklar summerar till 180°." : "Likbelägna eller alternatvinklar är lika.")
                        : (type === 'interior' ? "Co-interior angles sum to 180°." : "Corresponding/Alternate angles are equal."),
                    latex: type === 'interior' ? `x + ${angle} = 180` : `x = ${angle}`
                }
            ]
        };
    }
}