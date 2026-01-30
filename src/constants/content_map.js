export const CONTENT_MAP = {
    arithmetic: {
        title: "Taluppfattning",
        topics: [
            {
                id: "arithmetic",
                title: "De Fyra Räknesätten",
                levels: [
                    { lvl: 1, desc: "Addition (Uppställning)", ex: "345 + 129" },
                    { lvl: 2, desc: "Subtraktion (Uppställning)", ex: "502 - 148" },
                    { lvl: 3, desc: "Decimaltal (+/-)", ex: "4.5 + 2.15" },
                    { lvl: 4, desc: "Multiplikation (Enkel)", ex: "6 · 12" },
                    { lvl: 5, desc: "Multiplikation (Medel)", ex: "23 · 4" },
                    { lvl: 6, desc: "Multiplikation (Svår)", ex: "45 · 12" },
                    { lvl: 7, desc: "Kort Division", ex: "84 / 4" },
                    { lvl: 8, desc: "Blandade Heltal", ex: "Mix av alla räknesätt" },
                    { lvl: 9, desc: "Blandade Decimaltal", ex: "Mix med decimaler" }
                ]
            },
            {
                id: "negative",
                title: "Negativa Tal",
                levels: [
                    { lvl: 1, desc: "Enkel Addition/Subtraktion", ex: "-5 + 3, 2 - 8" },
                    { lvl: 2, desc: "Svårare Addition/Subtraktion", ex: "-5 - (-3)" },
                    { lvl: 3, desc: "Multiplikation", ex: "-4 · 3" },
                    { lvl: 4, desc: "Division", ex: "-20 / -5" },
                    { lvl: 5, desc: "Blandade Uppgifter", ex: "Mix av alla" }
                ]
            },
            {
                id: "ten_powers",
                title: "10, 100, 1000",
                levels: [
                    { lvl: 1, desc: "Mult/Div med 10, 100, 1000", ex: "4.5 · 100" },
                    { lvl: 2, desc: "Begreppsförståelse", ex: "Vilket tal är 100 gånger större?" },
                    { lvl: 3, desc: "Blandade Faktorer", ex: "0.1, 0.01, 1000" }
                ]
            },
            {
                id: "percent",
                title: "Procent",
                levels: [
                    { lvl: 1, desc: "Grundläggande & Omvandling", ex: "1/4 = 25% = 0.25" },
                    { lvl: 2, desc: "Huvudräkning (Benchmarks)", ex: "50%, 25%, 10% av tal" },
                    { lvl: 3, desc: "Byggstenar (Multiplar)", ex: "30% (3 · 10%)" },
                    { lvl: 4, desc: "Decimalmetoden", ex: "15% av 40 (0.15 · 40)" },
                    { lvl: 5, desc: "Det Hela", ex: "20% är 10. Vad är 100%?" },
                    { lvl: 6, desc: "Verklig Förändring", ex: "Lön, Rea, Skatt" }
                ]
            },
            {
                id: "exponents",
                title: "Potenser & Rötter",
                levels: [
                    { lvl: 1, desc: "Grunder & Nollregeln", ex: "3^3, x^0 = 1" },
                    { lvl: 2, desc: "Tiopotenser", ex: "10^5, 10^-2" },
                    { lvl: 3, desc: "Grundpotensform", ex: "4.5 · 10^4" },
                    { lvl: 4, desc: "Kvadratrötter & Uppskattning", ex: "sqrt(64), sqrt(50)" },
                    { lvl: 5, desc: "Potenslagar (Enkel)", ex: "x^2 · x^3" },
                    { lvl: 6, desc: "Potenslagar (Avancerad)", ex: "(x^2)^3" }
                ]
            }
        ]
    },
    algebra: {
        title: "Algebra",
        topics: [
            {
                id: "simplify",
                title: "Uttryck",
                levels: [
                    { lvl: 1, desc: "Förenkla Uttryck", ex: "3x + 2x + 5" },
                    { lvl: 2, desc: "Parenteser (Addition)", ex: "4 + (x + 2)" },
                    { lvl: 3, desc: "Parenteser (Multiplikation)", ex: "3(x + 2)" },
                    { lvl: 4, desc: "Parenteser (Subtraktion)", ex: "5x - (2x + 3)" },
                    { lvl: 5, desc: "Problemlösning", ex: "Skriv uttryck för omkrets" },
                    { lvl: 6, desc: "Blandade Nivåer", ex: "Mix av förenkling" }
                ]
            },
            {
                id: "equation",
                title: "Ekvationer",
                levels: [
                    { lvl: 1, desc: "Enkels steg", ex: "x + 5 = 12" },
                    { lvl: 2, desc: "Två steg", ex: "2x + 3 = 11" },
                    { lvl: 3, desc: "Med Parenteser", ex: "2(x + 1) = 10" },
                    { lvl: 4, desc: "Variabel på båda sidor", ex: "3x + 2 = x + 10" },
                    { lvl: 5, desc: "Problemlösning (Skriv)", ex: "Tolka text till ekvation" },
                    { lvl: 6, desc: "Problemlösning (Lös)", ex: "Lös textproblem" },
                    { lvl: 7, desc: "Blandade Ekvationer", ex: "Mix av alla typer" }
                ]
            }
        ]
    },
    geometry: {
        title: "Geometri",
        topics: [
            {
                id: "geometry",
                title: "Area & Omkrets",
                levels: [
                    { lvl: 1, desc: "Omkrets (Rektangel)", ex: "O = 2b + 2h" },
                    { lvl: 2, desc: "Area (Rektangel)", ex: "A = b · h" },
                    { lvl: 3, desc: "Area (Triangel)", ex: "A = (b · h) / 2" },
                    { lvl: 4, desc: "Cirkelns Area & Omkrets", ex: "Använd pi (3.14)" },
                    { lvl: 5, desc: "Sammansatta Figurer", ex: "Hus, Portaler" }
                ]
            },
            {
                id: "scale",
                title: "Skala",
                levels: [
                    { lvl: 1, desc: "Förstå Skala", ex: "Vad betyder 1:100?" },
                    { lvl: 2, desc: "Beräkna Längd (Enkel)", ex: "Bild -> Verklighet" },
                    { lvl: 3, desc: "Blandade Scenarier", ex: "Karta, Ritning, Mikroskop" },
                    { lvl: 4, desc: "Bestäm Skalan", ex: "Hitta skalan givet två mått" },
                    { lvl: 5, desc: "Problemlösning", ex: "Textuppgifter utan bild" },
                    { lvl: 6, desc: "Areaskala", ex: "Längdskala²" },
                    { lvl: 7, desc: "Blandat", ex: "Mix av alla" }
                ]
            },
            {
                id: "volume",
                title: "Volym",
                levels: [
                    { lvl: 1, desc: "Rätblock & Kub", ex: "V = b · d · h" },
                    { lvl: 2, desc: "Prisma", ex: "V = Bas · höjd" },
                    { lvl: 3, desc: "Cylinder", ex: "V = pi · r² · h" },
                    { lvl: 4, desc: "Pyramid & Kon", ex: "Spetsiga kroppar (/3)" },
                    { lvl: 5, desc: "Klot & Sammansatta", ex: "Silo, Glass, Klot" },
                    { lvl: 6, desc: "Blandade Volymer", ex: "Mix av kroppar" },
                    { lvl: 7, desc: "Enhetsomvandling", ex: "cm³ <-> liter <-> m³" }
                ]
            },
            {
                id: "similarity",
                title: "Likformighet",
                levels: [
                    { lvl: 1, desc: "Är de likformiga?", ex: "Jämför former" },
                    { lvl: 2, desc: "Beräkna sida (Enkel)", ex: "Använd skalfaktor" },
                    { lvl: 3, desc: "Topptriangelsatsen", ex: "Triangel inuti triangel" },
                    { lvl: 4, desc: "Pythagoras & Likformighet", ex: "Avancerad problemlösning" }
                ]
            },
            {
                id: "pythagoras",
                title: "Pythagoras Sats",
                levels: [
                    { lvl: 1, desc: "Kvadrater & Rötter", ex: "3^2, sqrt(25)" },
                    { lvl: 2, desc: "Hitta Hypotenusan", ex: "3-4-5 triangel" },
                    { lvl: 3, desc: "Hitta Kateten", ex: "c^2 - b^2 = a^2" },
                    { lvl: 4, desc: "Problemlösning", ex: "Stege mot vägg" },
                    { lvl: 5, desc: "Avstånd (Koordinater)", ex: "Mellan (1,1) och (4,5)" },
                    { lvl: 6, desc: "Är den rätvinklig?", ex: "Testa a^2 + b^2 = c^2" }
                ]
            }
        ]
    },
    samband: {
        title: "Samband",
        topics: [
            {
                id: "linear_graph",
                title: "Räta Linjen",
                levels: [
                    { lvl: 1, desc: "Hitta m-värdet", ex: "Var skär linjen y-axeln?" },
                    { lvl: 2, desc: "Hitta k-värdet (Positiv)", ex: "Lutning uppåt" },
                    { lvl: 3, desc: "Hitta k-värdet (Negativ)", ex: "Lutning nedåt" },
                    { lvl: 4, desc: "Bestäm funktionen", ex: "y = kx + m" },
                    { lvl: 5, desc: "Blandat", ex: "Mix av grafer" }
                ]
            }
        ]
    },
    statistics: {
        title: "Sannolikhet & Statistik",
        topics: [
            {
                id: "probability",
                title: "Sannolikhet",
                levels: [
                    { lvl: 1, desc: "Visuell Sannolikhet", ex: "Kulor i påse, Snurrhjul" },
                    { lvl: 2, desc: "Tärning & Slump", ex: "Tärning, Kortlek" },
                    { lvl: 3, desc: "Sannolikhet som Procent", ex: "Andel i %" },
                    { lvl: 4, desc: "Komplementhändelse", ex: "Sannolikhet för 'Inte'" },
                    { lvl: 5, desc: "Oberoende Händelser", ex: "Två mynt, Tärning + Mynt" },
                    { lvl: 6, desc: "Kombinatorik", ex: "Antal kombinationer (Träd)" }
                ]
            },
            {
                id: "statistics",
                title: "Statistik",
                levels: [
                    { lvl: 1, desc: "Typvärde & Variationsbredd", ex: "Mode, Range" },
                    { lvl: 2, desc: "Medelvärde", ex: "Summa / Antal" },
                    { lvl: 3, desc: "Median", ex: "Mittenvärdet (sorterat)" },
                    { lvl: 4, desc: "Baklänges medelvärde", ex: "Hitta saknat tal" },
                    { lvl: 5, desc: "Frekvenstabell", ex: "Analysera tabell" },
                    { lvl: 6, desc: "Blandade begrepp", ex: "Medel vs Median" }
                ]
            }
        ]
    }
};