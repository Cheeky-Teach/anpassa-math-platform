import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Data derived directly from Lgr22 Kursplan i Matematik (Årskurs 7-9)
  const curriculumData = {
    title: "Koppling till Lgr22",
    description: "Anpassa är utformad för att direkt stödja undervisningen enligt Skolverkets läroplan (Lgr22) för årskurs 7-9.",
    
    // Syfte (Purpose) from Lgr22
    syfte: [
      "Förmåga att använda och analysera matematiska begrepp och samband mellan begrepp.",
      "Förmåga att välja och använda lämpliga matematiska metoder för att göra beräkningar och lösa rutinuppgifter.",
      "Förmåga att formulera och lösa problem med hjälp av matematik samt värdera valda strategier och metoder.",
      "Förmåga att föra och följa matematiska resonemang.",
      "Förmåga att använda matematikens uttrycksformer för att samtala om, argumentera och redogöra för frågeställningar, beräkningar och slutsatser."
    ],

    // Centralt Innehåll (Core Content)
    // Mapped to specific modules in the app
    centralt_innehall: {
      taluppfattning: {
        category: "Taluppfattning och tals användning",
        modules: ["arithmetic", "negative", "ten_powers", "exponents", "percent", "fraction_basics", "fraction_arith"],
        content: [
          "Reella tal och deras egenskaper samt deras användning i vardagliga och matematiska situationer.", // arithmetic
          "Talsystemets utveckling från naturliga tal till reella tal.", // negative
          "Tal i bråk- och decimalform samt deras användning i vardagliga och matematiska situationer.", // fraction_basics
          "Centrala metoder för beräkningar med tal i bråk- och decimalform.", // fraction_arith
          "Procent för att uttrycka förändring och förändringsfaktor samt beräkningar med procent i vardagliga situationer och i situationer inom olika ämnesområden.", // percent, change_factor
          "Potensform för att uttrycka små och stora tal samt användning av prefix." // ten_powers, exponents
        ]
      },
      algebra: {
        category: "Algebra",
        modules: ["simplify", "equation", "linear_graph"],
        content: [
          "Innebörden av variabelbegreppet och dess användning i algebraiska uttryck, formler och ekvationer.", // simplify
          "Algebraiska uttryck, formler och ekvationer i situationer som är relevanta för eleven.",
          "Algebraiska mönster och hur de kan beskrivas med uttryck.",
          "Metoder för ekvationslösning.", // equation
          "Funktioner och räta linjens ekvation." // linear_graph
        ]
      },
      geometri: {
        category: "Geometri",
        modules: ["geometry", "scale", "volume", "similarity", "pythagoras","angles"],
        content: [
          "Geometriska objekt och deras egenskaper.",
          "Avbildning och konstruktion av geometriska objekt. Skala vid förminskning och förstoring av en- och tvådimensionella objekt.", // scale
          "Likformighet och symmetri i planet.", // similarity
          "Geometriska satser och formler och behovet av argumentation för deras giltighet. Pythagoras sats.", // pythagoras
          "Metoder för beräkning av area, omkrets och volym hos geometriska objekt, samt enhetsbyten i samband med detta.", // geometry, volume
          "Vinkelbegreppet och vinkelmätning. Vinkelsumman i månghörningar." // Vinklar
        ]
      },
      samband: {
        category: "Samband och förändring",
        modules: ["graph"], // change_factor fits here too conceptually, but mapped to statistics in app structure
        content: [
          "Proportionalitet och linjära samband samt hur de kan beskrivas med tabeller, grafer, ekvationer och ord.",
          "Räta linjens ekvation."
        ]
      },
      statistik: {
        category: "Sannolikhet och statistik",
        modules: ["probability", "statistics", "change_factor"], // Added change_factor here as requested
        content: [
          "Likformig sannolikhet och metoder för att beräkna sannolikhet i vardagliga situationer.", // probability
          "Tabeller och diagram för att beskriva resultat från undersökningar.", // statistics
          "Lägesmått: medelvärde, median och typvärde.", // statistics
          "Spridningsmått: variationsbredd.", // statistics
          "Förändringsfaktor och procentuella förändringar." // change_factor
        ]
      },
      problem: {
        category: "Problemlösning",
        modules: ["equation"],
        content: [
          "Strategier för problemlösning i vardagliga situationer och inom olika ämnesområden.",
          "Värdering av valda strategier och metoder."
        ]
      }
    }
  };

  res.status(200).json(curriculumData);
}