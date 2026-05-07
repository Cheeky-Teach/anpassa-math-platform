// src/constants/updates.js

export const APP_UPDATES = [
  {
    id: 'v016',
    date: '2026-05-07',
    version: '0.1.6',
    title: { sv: "Session-statistik & Generatorlyft", en: "Session Stats & Generator Boost" },
    highlights: {
      sv: "Integrerad statistik i övningsvyn, ökad svårighetsgrad.",
      en: "Integrated stats in practice view, increased difficulty ranges."
    },
    changes: {
      sv: [
        "Session-statistik: Statistik-modalen har flyttat in i övningsvyn! Se dina framsteg direkt i historikpanelen med färgkodade staplar och resultatsammanfattning.",
        "Ökade talområden: Flera generatorer har uppdaterats med bredare slumpmässiga intervall för att erbjuda mer utmanande uppgifter.",
        "Variabilitet i Prioritering: Nivå 3 och 4 i Prioriteringsregler har gjorts om för att slumpa ordningen på termer och operatorer, vilket ger miljontals unika kombinationer.",
        "Bråk vid Division: Tiopotens-uppgifter visar nu division som snygga bråk (\\frac{a}{b}) istället för snedstreck.",
        "Layoutfix för 3D: Justerat positionering för glasstrutar och rätblock för att förhindra att bilder och höjd-etiketter klipps bort."
      ],
      en: [
        "Integrated Session Stats: The stats modal metrics are now visible directly in the practice view's history panel with segmented progress bars and key metrics.",
        "Expanded Number Ranges: Increased the random range values in multiple question generators to provide a wider variety of difficulty.",
        "Priority Variability: Level 3 and 4 in Order of Operations now feature shuffled terms and randomized operators for near-limitless question combinations.",
        "Fraction Division: Division in Powers of Ten is now rendered as vertical fractions (\\frac{a}{b}) instead of using slashes.",
        "3D Geometry Polish: Refined the drawing coordinates for ice cream cones and triangular prisms to ensure visual clarity and prevent label clipping."
      ]
    }
  },
  {
    id: 'v015',
    date: '2026-05-06',
    version: '0.1.5',
    title: { sv: "Smart Zoom, 3D-modeller, rättning, stabilitet", en: "Smart Zoom, 3D model updates, stability" },
    highlights: {
      sv: "Smart zoom i Do Now, tydligare 3D-modeller och förbättrad rättningslogik.",
      en: "Smart zoom in Do Now, clearer 3D models, and improved grading logic."
    },
    changes: {
      sv: [
        "Silent Refresh: Fixade buggen där appen laddades om varje gång man bytte webbläsarflik.",
        "Bild Zoom: I Do Now-grid kan bilder nu zoomas upp till 400% oberoende av containern, med automatisk förskjutning för att maximera synlig yta.",
        "Förbättrad 3D-geometri: Höjdindikatorer med 'h=' och måttlinjer tillagda för koner, cylindrar, pyramider och prismor för ökad tydlighet.",
        "Algebraisk Rättning: Systemet accepterar nu svar som 'x=7' (om svaret var 7) genom automatiskt borttagning av 'x=' från svaret",
        "Layoutoptimering för koner: Etiketter för radie och diameter har flyttats under figurens bas för att inte skymma den 3D-modellen.",
        "Smartare Pyramider: Renderingsmotorn ritar nu automatiskt kvadratiska baser som standard för att matcha aktuella beräkningsuppgifter."
      ],
      en: [
        "Silent Refresh: Fixed the issue where the app would 'flicker' and reload when switching browser tabs.",
        "Image Zoom: Do Now Grid images can now be zoomed up to 400% with a dynamic 'shifting' effect that re-centers the diagram to prevent clipping.",
        "Enhanced 3D Visuals: Added height indicators (h=) and dimension lines for cones, cylinders, pyramids, and prisms to improve instructional clarity.",
        "Algebra-Aware Grading: Support for answers like 'x=7' by automatically removing 'x=' from the submitted answer. If the answer is 7 and the user types 'x=7' both are correct.",
        "Cone Labeling Refined: Radius and diameter labels moved beneath the cone base to provide an unobstructed view of the geometry.",
        "Smarter Pyramids: The rendering engine now defaults to square bases to align accurately with current volume calculation generators."
      ]
    }
  },
  {
    id: 'v014',
    date: '2026-04-24',
    version: '0.1.4',
    title: { sv: "Arkiv- & Layoutförbättring", en: "Archive & Layout Improvements" },
    highlights: {
      sv: "Längre arkiveringstid och mer kompakta utskriftsformat.",
      en: "Extended archive duration and more compact print layouts."
    },
    changes: {
      sv: [
        "Förlängd datalagring: Lektionsarkivet sparar nu resultat i 7 dagar istället för 48 timmar.",
        "Kompakt utskriftslayout: Justerad textstorlek och marginaler på arbetsblad för att rymma fler frågor per sida.",
        "Layoutfix för mobil: Förhindrar att bilder och grafer klipps bort på mindre skärmar i Live-vy och Test Lab.",
        "Uppdaterad informationstext i verktygsfältet för tydligare tidsangivelser."
      ],
      en: [
        "Extended data retention: Session Archive now stores results for 7 days instead of 48 hours.",
        "Compact print layout: Adjusted text size and margins on worksheets to fit more questions per page.",
        "Mobile layout fix: Prevents images and graphs from being clipped on smaller screens in Live view and Test Lab.",
        "Updated information text in the toolbar for clearer timing references."
      ]
    }
  },
  {
    id: 'v013',
    date: '2026-04-15',
    version: '0.1.3',
    title: { sv: "Live Lektion & Utskriftsfix", en: "Live Lesson & Print Fix" },
    highlights: {
      sv: "Manuell rättning, förbättrade rapporter och fix för stora utskrifter.",
      en: "Manual grading, improved reports, and fixes for large printouts."
    },
    changes: {
      sv: [
        "Kritisk buggfix för utskrift: Rapporter renderar nu all data korrekt oavsett längd utan att klippas.",
        "Manuell rättning: Lärare kan nu klicka direkt på en elevs svar i tabellen på live lektioenr för att ändra rättningen (t.ex. vid 'x=7').",
        "Ny vy: Växla mellan status-ikoner och faktiska elevsvar direkt i live-översikten.",
        "Buggfix till flervalsalternativ frågor där rätta svar markerades som fel."
      ],
      en: [
        "Critical print fix: Reports now render all data correctly regardless of length without clipping.",
        "Manual grading override: Teachers can now click directly on a student answer to manually correct it (e.g., for 'x=7').",
        "New view mode: Toggle between status icons and actual student answers directly in the live overview.",
        "Bug fix for multiple choice answers being marked incorrect when actually correct."
      ]
    }
  },
  {
    id: 'v012',
    date: '2024-03-21',
    version: '0.1.2',
    title: { sv: "Stora Geometri/Volym-uppdateringen", en: "The Big Geometry and Volume Update" },
    highlights: {
      sv: "Nya 3D-figurer och enhetsomvandlingar.",
      en: "New 3D shapes and unit conversions."
    },
    changes: {
      sv: [
        "Enhetsomvandling mängdträning finns nu under Geometri.",
        "Lagt till Nivå 7 i Volym: Enhetsomvandling och vardagsproblem med 3D-bildstöd.",
        "Uppdaterat Question Studio med smartare filtrering av sparade blad.",
        "Förbättrad rapportlayout i liggande format för Live-lektioner.",
        "Fixat formateringsfel i historikpanelen för matematiska tecken."
      ],
      en: [
        "Unit conversion practice is now available in Geometry.",
        "Added Level 7 in Volume: Unit conversion and word problems with 3D visuals.",
        "Updated Question Studio with smarter filtering for saved sheets.",
        "Improved landscape report layout for Live lessons.",
        "Fixed formatting errors in the history panel for math symbols."
      ]
    }
  },
  {
    id: 'v011',
    date: '2024-03-15',
    version: '0.1.1',
    title: { sv: "Question Studio Förbättringar", en: "Question Studio Enhancements" },
    highlights: {
      sv: "Enklare att hantera stora paket.",
      en: "Easier management of large packets."
    },
    changes: {
      sv: ["Snabbare slumpning", "Drag-and-drop sortering"],
      en: ["Faster randomization", "Drag-and-drop sorting"]
    }
  }
];