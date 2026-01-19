export interface QuestionRenderData {
  type: 'text' | 'image' | 'scale_draw';
  content: string;
  params?: any;
}

export interface GeneratedQuestion {
  id: string;
  renderData: QuestionRenderData;
  clue: string;
  answer: string | number;
}

/**
 * Generates Scale problems (Skala).
 * Logic: Relies on Relation: Real Length = Drawing Length * Scale Factor
 */
export class ScaleGenerator {
  
  // Helper to get random int between min and max
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public generate(level: number, lang: 'sv' | 'en' = 'sv'): GeneratedQuestion {
    const isSwedish = lang === 'sv';
    
    // Level 1: Calculate Real Length (1:X)
    // Level 2: Calculate Drawing Length (1:X)
    // Level 3: Calculate Scale (Drawing vs Real)
    
    // Simplified logic for this example focusing on Level 1 & 2
    const mode = Math.random() > 0.5 ? 'find_real' : 'find_drawing';
    const scaleFactor = [10, 20, 50, 100, 200, 500][this.getRandomInt(0, 5)];
    
    // We stick to Right-Angled or Isosceles triangles or Rectangles (No Scalene)
    // For text problems, we use "lines" or "walls" to be clear.
    
    // Setup units
    const drawingUnit = 'cm';
    const realUnit = scaleFactor >= 100 ? 'm' : 'cm';
    
    let drawingVal = this.getRandomInt(2, 9); // e.g., 5 cm
    let realValRaw = drawingVal * scaleFactor; // e.g., 500 cm
    
    // Convert to meters if needed
    let realValDisplay = realUnit === 'm' ? realValRaw / 100 : realValRaw;

    let questionText = "";
    let answer: number = 0;
    let clue = "";

    if (mode === 'find_real') {
      // Q: Drawing is X, Scale is 1:Y. Find Reality.
      questionText = isSwedish
        ? `På en ritning i skala 1:${scaleFactor} är en vägg ${drawingVal} ${drawingUnit} lång. Hur lång är väggen i verkligheten? (Svara i ${realUnit})`
        : `On a drawing with scale 1:${scaleFactor}, a wall is ${drawingVal} ${drawingUnit} long. How long is the wall in reality? (Answer in ${realUnit})`;
      
      answer = realValDisplay;
      clue = isSwedish 
        ? `Multiplicera måttet på ritningen med skalan (${scaleFactor}).`
        : `Multiply the drawing length by the scale factor (${scaleFactor}).`;
    
    } else {
      // Q: Reality is Y, Scale is 1:X. Find Drawing.
      // We must ensure the answer is clean (integer or simple .5)
      // Reverse engineer:
      const targetDrawing = this.getRandomInt(2, 10);
      drawingVal = targetDrawing;
      realValRaw = drawingVal * scaleFactor;
      realValDisplay = realUnit === 'm' ? realValRaw / 100 : realValRaw;

      questionText = isSwedish
        ? `I verkligheten är en bil ${realValDisplay} ${realUnit} lång. Hur lång blir den på en ritning i skala 1:${scaleFactor}? (Svara i ${drawingUnit})`
        : `In reality, a car is ${realValDisplay} ${realUnit} long. How long will it be on a drawing with scale 1:${scaleFactor}? (Answer in ${drawingUnit})`;

      answer = drawingVal;
      clue = isSwedish
        ? `Dividera verklighetens mått (omvandlat till cm) med ${scaleFactor}.`
        : `Convert reality to cm, then divide by ${scaleFactor}.`;
    }

    return {
      id: `scale-${Date.now()}`,
      renderData: {
        type: 'text', // In full app, this would be 'scale_draw' for visual components
        content: questionText
      },
      clue: clue,
      answer: answer
    };
  }
}