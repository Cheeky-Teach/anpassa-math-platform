// src/constants/updates.js

export const APP_UPDATES = [
  {
    id: 'v111',
    date: '2024-03-21',
    version: '0.1.2',
    title: { sv: "Stora Volym-uppdateringen", en: "The Big Volume Update" },
    highlights: {
      sv: "Nya 3D-figurer och enhetsomvandlingar.",
      en: "New 3D shapes and unit conversions."
    },
    changes: {
      sv: [
        "Lagt till Nivå 7 i Volym: Enhetsomvandling och vardagsproblem med 3D-bildstöd.",
        "Uppdaterat Question Studio med smartare filtrering av sparade blad.",
        "Förbättrad rapportlayout i liggande format för Live-lektioner.",
        "Fixat formateringsfel i historikpanelen för matematiska tecken."
      ],
      en: [
        "Added Level 7 in Volume: Unit conversion and word problems with 3D visuals.",
        "Updated Question Studio with smarter filtering for saved sheets.",
        "Improved landscape report layout for Live lessons.",
        "Fixed formatting errors in the history panel for math symbols."
      ]
    }
  },
  {
    id: 'v110',
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