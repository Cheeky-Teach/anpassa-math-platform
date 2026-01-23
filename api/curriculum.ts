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
      "Förmåga att föra och följa matematiska resonemang."
    ],

    // Mapping modules to "Centralt Innehåll" (Core Content)
    mapping: {
      taluppfattning: {
        category: "Taluppfattning och tals användning",
        modules: ["arithmetic", "negative"],
        content: [
          "Reella tal och deras egenskaper samt deras användning i vardagliga och matematiska situationer.",
          "Centrala metoder för beräkningar med tal i bråk- och decimalform vid överslagsräkning, huvudräkning samt vid beräkningar med skriftliga metoder.",
          "Tal i potensform. Grundpotensform."
        ]
      },
      algebra: {
        category: "Algebra",
        modules: ["equation", "simplify"],
        content: [
          "Innebörden av variabelbegreppet och dess användning i algebraiska uttryck, formler och ekvationer.",
          "Algebraiska uttryck, formler och ekvationer i situationer som är relevanta för eleven.",
          "Metoder för ekvationslösning."
        ]
      },
      geometri: {
        category: "Geometri",
        modules: ["geometry", "scale", "volume"],
        content: [
          "Geometriska objekt och deras egenskaper.",
          "Avbildning och konstruktion av geometriska objekt, såväl med som utan digitala verktyg. Skala och dess användning i vardagliga situationer.",
          "Metoder för beräkning av area, omkrets och volym hos geometriska objekt, samt enhetsbyten i samband med detta."
        ]
      },
      samband: {
        category: "Samband och förändring",
        modules: ["graph"],
        content: [
          "Proportionalitet och linjära samband samt hur de kan beskrivas med tabeller, grafer, ekvationer och ord.",
          "Räta linjens ekvation."
        ]
      },
      problem: {
        category: "Problemlösning",
        modules: ["equation"], // Specifically word problems in equations
        content: [
          "Strategier för problemlösning i vardagliga situationer och inom olika ämnesområden.",
          "Värdering av valda strategier och metoder."
        ]
      }
    }
  };

  return res.status(200).json(curriculumData);
}