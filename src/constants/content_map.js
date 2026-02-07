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
                id: "fraction_basics",
                title: "Bråk: Grunder",
                levels: [
                    { lvl: 1, desc: "Visuella Bråk", ex: "Del av helhet" },
                    { lvl: 2, desc: "Beräkna delen", ex: "1/4 av 20" },
                    { lvl: 3, desc: "Blandad & Bråkform", ex: "1 1/2 <-> 3/2" },
                    { lvl: 4, desc: "Förlänga & Förkorta", ex: "2/4 -> 1/2" },
                    { lvl: 5, desc: "Bråk & Decimaltal", ex: "1/5 = 0.2" }
                ]
            },
            {
                id: "fraction_arith",
                title: "Bråk: Räkna",
                levels: [
                    { lvl: 1, desc: "Addition & Subtraktion (Lika)", ex: "1/5 + 2/5" },
                    { lvl: 2, desc: "Addition & Subtraktion (Olika)", ex: "1/2 + 1/4" },
                    { lvl: 3, desc: "Blandad form (+)", ex: "1 1/2 + 3/4" },
                    { lvl: 4, desc: "Multiplikation", ex: "2/3 · 4/5" },
                    { lvl: 5, desc: "Division", ex: "1/2 / 1/4" }
                ]
            },
            {
                id: "negative",
                title: "Negativa Tal",
                levels: [
                    { lvl: 1, desc: "Enkel Addition/Subtraktion", ex: "5 - 8" },
                    { lvl: 2, desc: "Svårare Addition/Subtraktion", ex: "-5 - (-8)" },
                    { lvl: 3, desc: "Multiplikation", ex: "-3 · 4" },
                    { lvl: 4, desc: "Division", ex: "-12 / -3" },
                    { lvl: 5, desc: "Blandade Uppgifter", ex: "Mix av räknesätt" }
                ]
            },
            {
                id: "ten_powers",
                title: "10, 100, 1000",
                levels: [
                    { lvl: 1, desc: "Mult/Div med 10, 100, 1000", ex: "3.5 · 100" },
                    { lvl: 2, desc: "Begreppsförståelse", ex: "Vilket är störst?" },
                    { lvl: 3, desc: "Blandade Faktorer", ex: "0.1, 0.01, 1000" }
                ]
            },
            {
                id: "exponents",
                title: "Potenser & Rötter",
                levels: [
                    { lvl: 1, desc: "Grunder & x^0", ex: "3^2, 5^0" },
                    { lvl: 2, desc: "Tiopotenser", ex: "10^3, 10^-2" },
                    { lvl: 3, desc: "Grundpotensform", ex: "4.5 · 10^3" },
                    { lvl: 4, desc: "Kvadratrötter", ex: "sqrt(25)" },
                    { lvl: 5, desc: "Potenslagar (Enkel)", ex: "x^2 · x^3" },
                    { lvl: 6, desc: "Potenslagar (Avancerad)", ex: "(x^2)^3" }
                ]
            },
            {
                id: "percent",
                title: "Procent",
                levels: [
                    { lvl: 1, desc: "Grundläggande (Rutnät)", ex: "Bildstöd" },
                    { lvl: 2, desc: "Huvudräkning (10%, 50%)", ex: "10% av 500" },
                    { lvl: 3, desc: "Multiplar av 10%", ex: "30% av 200" },
                    { lvl: 4, desc: "Beräkna andelen (Decimal)", ex: "0.15 · 400" },
                    { lvl: 5, desc: "Hitta helheten (100%)", ex: "Delen är 20, andel 50%" },
                    { lvl: 6, desc: "Verklig Förändring", ex: "Prisökning" }
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
                    { lvl: 1, desc: "Förenkla Uttryck", ex: "2x + 3x" },
                    { lvl: 2, desc: "Parenteser (Addition)", ex: "2 + (x - 3)" },
                    { lvl: 3, desc: "Parenteser (Multiplikation)", ex: "3(x + 2)" },
                    { lvl: 4, desc: "Parenteser (Subtraktion)", ex: "5 - (x - 2)" },
                    { lvl: 5, desc: "Problemlösning", ex: "Skriv uttryck för omkrets" },
                    { lvl: 6, desc: "Blandade Nivåer", ex: "Mix av algebra" }
                ]
            },
            {
                id: "equation",
                title: "Ekvationer",
                levels: [
                    { lvl: 1, desc: "Enstegsekvationer", ex: "x + 5 = 12" },
                    { lvl: 2, desc: "Tvåstegsekvationer", ex: "2x + 3 = 11" },
                    { lvl: 3, desc: "Med Parenteser", ex: "2(x + 1) = 10" },
                    { lvl: 4, desc: "Variabel på båda sidor", ex: "3x + 2 = x + 8" },
                    { lvl: 5, desc: "Skriv Ekvation", ex: "Från text till ekvation" },
                    { lvl: 6, desc: "Lös Problem", ex: "Textuppgifter" },
                    { lvl: 7, desc: "Blandade Ekvationer", ex: "Mix av problem" }
                ]
            },
            {
                id: "linear_graph",
                title: "Räta Linjen",
                levels: [
                    { lvl: 1, desc: "Hitta m-värdet", ex: "Skärning y-axel" },
                    { lvl: 2, desc: "Hitta k-värdet (Pos)", ex: "Lutning uppåt" },
                    { lvl: 3, desc: "Hitta k-värdet (Neg)", ex: "Lutning nedåt" },
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
                    { lvl: 5, desc: "Frekvenstabell", ex: "Medel/Median ur tabell" },
                    { lvl: 6, desc: "Blandade begrepp", ex: "Jämför mått" }
                ]
            },
            {
                id: "change_factor",
                title: "Förändringsfaktor",
                levels: [
                    { lvl: 1, desc: "Begrepp & Definition", ex: "Ökning 20% -> 1.20" },
                    { lvl: 2, desc: "Beräkna nya värdet", ex: "500 * 1.20" },
                    { lvl: 3, desc: "Beräkna gamla värdet", ex: "Nytt / Faktor" },
                    { lvl: 4, desc: "Total förändring", ex: "1.10 * 0.90" },
                    { lvl: 5, desc: "Textuppgifter", ex: "Befolkning, Ränta" }
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
                    { lvl: 1, desc: "Omkrets (Rektangel)", ex: "2(b+h)" },
                    { lvl: 2, desc: "Area (Rektangel)", ex: "b*h" },
                    { lvl: 3, desc: "Area (Triangel)", ex: "b*h/2" },
                    { lvl: 4, desc: "Sammansatta (Rekt+Tri)", ex: "Rectanglar och trianglar" },
                    { lvl: 5, desc: "Cirklar", ex: "pi*r^2" },
                    { lvl: 6, desc: "Sammansatta (Alla)", ex: "Hus, Portal" }
                ]
            },
            {
                id: "scale",
                title: "Skala",
                levels: [
                    { lvl: 1, desc: "Begreppsförståelse", ex: "1:100 vs 100:1" },
                    { lvl: 2, desc: "Beräkna längd (Enkel)", ex: "Bild -> Verklighet" },
                    { lvl: 3, desc: "Blandade Scenarier", ex: "Karta, Ritning" },
                    { lvl: 4, desc: "Bestäm Skalan", ex: "Bild / Verklighet" },
                    { lvl: 5, desc: "Problemlösning", ex: "Textuppgifter" },
                    { lvl: 6, desc: "Areaskala", ex: "Längdskala^2" },
                    { lvl: 7, desc: "Blandat", ex: "Mix av uppgifter" }
                ]
            },
            {
                id: "volume",
                title: "Volym",
                levels: [
                    { lvl: 1, desc: "Rätblock & Kub", ex: "b*d*h" },
                    { lvl: 2, desc: "Prisma", ex: "B*h" },
                    { lvl: 3, desc: "Cylinder", ex: "pi*r^2*h" },
                    { lvl: 4, desc: "Pyramid & Kon", ex: "B*h/3" },
                    { lvl: 5, desc: "Klot", ex: "4*pi*r^3/3" },
                    { lvl: 6, desc: "Blandade Volymer", ex: "Mix av kroppar" },
                    { lvl: 7, desc: "Enhetsomvandling", ex: "dm3 <-> liter" },
                    { lvl: 8, desc: "Begränsningsyta", ex: "Area till 3D former" }
                ]
            },
            {
                id: "similarity",
                title: "Likformighet",
                levels: [
                    { lvl: 1, desc: "Likformig eller inte?", ex: "Jämför former" },
                    { lvl: 2, desc: "Beräkna sida", ex: "Skala * sida" },
                    { lvl: 3, desc: "Topptriangelsatsen", ex: "Liten/Stor triangel" },
                    { lvl: 4, desc: "Pythagoras", ex: "Rätvinklig triangel" }
                ]
            },
            {
                id: "pythagoras",
                title: "Pythagoras Sats",
                levels: [
                    { lvl: 1, desc: "Kvadrater & Rötter", ex: "3^2, sqrt(9)" },
                    { lvl: 2, desc: "Hitta Hypotenusan", ex: "a^2 + b^2 = c^2" },
                    { lvl: 3, desc: "Hitta Kateten", ex: "c^2 - b^2 = a^2" },
                    { lvl: 4, desc: "Problemlösning", ex: "Stege mot vägg" },
                    { lvl: 5, desc: "Avstånd", ex: "Koordinatsystem" },
                    { lvl: 6, desc: "Rätvinklig?", ex: "Omvänd sats" }
                ]
            },
            {
                id: "angles",
                title: "Vinklar", // NEW
                levels: [
                    { lvl: 1, desc: "Vinkeltyper", ex: "Spetsig, Rät, Trubbig" },
                    { lvl: 2, desc: "Komplement & Supplement", ex: "Summa 90/180" },
                    { lvl: 3, desc: "Vertikal- & Sidovinklar", ex: "Korsande linjer" },
                    { lvl: 4, desc: "Vinkelsumma (Triangel)", ex: "x + y + z = 180" },
                    { lvl: 5, desc: "Likbelägna & Alternatvinklar", ex: "Parallella linjer" },
                    { lvl: 6, desc: "Vinkelsumma (Polygoner)", ex: "(n-2)*180" }
                ]
            }
        ]
    }
};