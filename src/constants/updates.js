// src/constants/updates.js

export const APP_UPDATES = [
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