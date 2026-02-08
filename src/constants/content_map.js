/**
 * CONTENT_MAP
 * En omfattande guide över alla ämnesområden, nivåer och variationer i Anpassa.
 * Används för att visa innehållskartan för lärare och elever.
 */

export const CONTENT_MAP = {
    arithmetic: {
        title: "Taluppfattning & Aritmetik",
        topics: [
            {
                id: "arithmetic",
                title: "De Fyra Räknesätten",
                levels: [
                    { lvl: 1, desc: "Addition: Uppställning & Övergångar", ex: "345 + 129" },
                    { lvl: 2, desc: "Subtraktion: Växling & Lån", ex: "502 - 148" },
                    { lvl: 3, desc: "Decimaltal: Vertikal räkning", ex: "12,45 + 8,7" },
                    { lvl: 4, desc: "Multiplikation: Tabellträning", ex: "7 • 8" },
                    { lvl: 5, desc: "Multiplikation: 2-siffrigt", ex: "23 • 4" },
                    { lvl: 6, desc: "Multiplikation: Decimaler", ex: "0,5 • 12" },
                    { lvl: 7, desc: "Kort Division: Grunder", ex: "84 / 4" },
                    { lvl: 8, desc: "Division med rest & Decimaler", ex: "125 / 4" },
                    { lvl: 9, desc: "Algebraisk Aritmetik (Saknat tal)", ex: "45 + x = 112" }
                ]
            },
            {
                id: "negative",
                title: "Negativa Tal",
                levels: [
                    { lvl: 1, desc: "Tallinjen & Storleksordning", ex: "Vilket tal är minst: -5 eller -8?" },
                    { lvl: 2, desc: "Addition & Subtraktion (Enkel)", ex: "5 - 8" },
                    { lvl: 3, desc: "Dubbeltecken: Förenkling", ex: "-5 - (-8) = -5 + 8" },
                    { lvl: 4, desc: "Multiplikation & Division", ex: "-3 • (-4)" },
                    { lvl: 5, desc: "Räknekedjor & Teckenregler", ex: "(-2) • 3 • (-4)" }
                ]
            },
            {
                id: "ten_powers",
                title: "Tiopotenser & Decimaler",
                levels: [
                    { lvl: 1, desc: "Multiplikation/Division med 10, 100, 1000", ex: "3,5 • 100" },
                    { lvl: 2, desc: "Begrepp: Skriva som potens", ex: "1000 = 10^3" },
                    { lvl: 3, desc: "Division med 0,1 och 0,01", ex: "5 / 0,1 = 50" }
                ]
            },
            {
                id: "exponents",
                title: "Potenser & Rötter",
                levels: [
                    { lvl: 1, desc: "Grunder: Bas & Exponent", ex: "3^2 = 9" },
                    { lvl: 2, desc: "Tiopotenser & Negativa exponenter", ex: "10^-2" },
                    { lvl: 3, desc: "Grundpotensform", ex: "4,5 • 10^3" },
                    { lvl: 4, desc: "Kvadratrötter & Uppskattning", ex: "sqrt(25)" },
                    { lvl: 5, desc: "Potenslagar: Multiplikation", ex: "x^2 • x^3 = x^5" },
                    { lvl: 6, desc: "Potenslagar: Division & Parentes", ex: "(x^2)^3" }
                ]
            },
            {
                id: "fraction_basics",
                title: "Bråk: Grunderna",
                levels: [
                    { lvl: 1, desc: "Visuella Bråk: Del av helhet", ex: "Hur stor andel är färgad?" },
                    { lvl: 2, desc: "Beräkna delen av ett antal", ex: "1/4 av 20" },
                    { lvl: 3, desc: "Blandad form & Bråkform", ex: "1 1/2 <-> 3/2" },
                    { lvl: 4, desc: "Förkortning & Förlängning", ex: "2/4 -> 1/2" },
                    { lvl: 5, desc: "Decimaltal <-> Bråk", ex: "1/5 = 0,2" }
                ]
            },
            {
                id: "fraction_arith",
                title: "Bråkräkning",
                levels: [
                    { lvl: 1, desc: "Addition & Subtraktion (Lika nämnare)", ex: "1/5 + 2/5" },
                    { lvl: 2, desc: "Addition & Subtraktion (MGN)", ex: "1/2 + 1/4" },
                    { lvl: 3, desc: "Blandade tal i beräkningar", ex: "1 1/2 + 3/4" },
                    { lvl: 4, desc: "Multiplikation", ex: "2/3 • 4/5" },
                    { lvl: 5, desc: "Division (Invertera)", ex: "1/2 / 1/4" }
                ]
            }
        ]
    },
    algebra: {
        title: "Algebra & Funktioner",
        topics: [
            {
                id: "simplify",
                title: "Uttryck & Förenkling",
                levels: [
                    { lvl: 1, desc: "Samla termer (Addition/Subtraktion)", ex: "2x + 3x - x" },
                    { lvl: 2, desc: "Parenteser med plus framför", ex: "2 + (x - 3)" },
                    { lvl: 3, desc: "Multiplicera in i parentes", ex: "3(x + 2)" },
                    { lvl: 4, desc: "Minusparenteser (Teckenbyte)", ex: "5 - (x - 2)" },
                    { lvl: 5, desc: "Sammansatta uttryck", ex: "2(x+3) - (x-1)" },
                    { lvl: 6, desc: "Problemlösning med variabler", ex: "Uttryck för omkrets" }
                ]
            },
            {
                id: "equation",
                title: "Ekvationslösning",
                levels: [
                    { lvl: 1, desc: "Enstegsekvationer", ex: "x + 5 = 12" },
                    { lvl: 2, desc: "Tvåstegsekvationer", ex: "2x + 3 = 11" },
                    { lvl: 3, desc: "Ekvationer med parenteser", ex: "2(x + 1) = 10" },
                    { lvl: 4, desc: "Variabel på båda sidor", ex: "3x + 2 = x + 8" },
                    { lvl: 5, desc: "Skriva ekvationer från text", ex: "Ställ upp ax + b = c" },
                    { lvl: 6, desc: "Lösa vardagsproblem", ex: "Rörlig kostnad + Fast avgift" }
                ]
            },
            {
                id: "patterns",
                title: "Mönster & Talföljder",
                levels: [
                    { lvl: 1, desc: "Identifiera nästa tal", ex: "2, 5, 8, ..." },
                    { lvl: 2, desc: "Aritmetiska mönster", ex: "Differensen är konstant" },
                    { lvl: 3, desc: "Skapa formeln (an + b)", ex: "y = 3n + 2" },
                    { lvl: 4, desc: "Baklängesräkning (Figurnummer)", ex: "Vilken figur har 100 delar?" }
                ]
            },
            {
                id: "linear_graph",
                title: "Räta Linjens Ekvation",
                levels: [
                    { lvl: 1, desc: "Identifiera m-värde", ex: "Skärning med y-axeln" },
                    { lvl: 2, desc: "Identifiera k-värde (Lutning)", ex: "Trappstegsmetoden" },
                    { lvl: 3, desc: "Bestäm funktionen y = kx + m", ex: "Från graf till formel" },
                    { lvl: 4, desc: "Proportionalitet", ex: "Linjer genom origo" }
                ]
            }
        ]
    },
    geometry: {
        title: "Geometri & Mätning",
        topics: [
            {
                id: "geometry",
                title: "Area & Omkrets",
                levels: [
                    { lvl: 1, desc: "Omkrets: Rektanglar & Kvadrater", ex: "Vägen runt om" },
                    { lvl: 2, desc: "Area: Rektangel & Parallellogram", ex: "Bas • Höjd" },
                    { lvl: 3, desc: "Area: Triangel", ex: "(Bas • Höjd) / 2" },
                    { lvl: 4, desc: "Sammansatta figurer (L-form)", ex: "Dela upp i kända ytor" },
                    { lvl: 5, desc: "Cirkelns Area & Omkrets", ex: "Beräkningar med Pi" },
                    { lvl: 6, desc: "Sammansatta figurer (Hus/Portaler)", ex: "Mix av former" }
                ]
            },
            {
                id: "angles",
                title: "Vinklar",
                levels: [
                    { lvl: 1, desc: "Vinkeltyper", ex: "Spetsig, rät, trubbig" },
                    { lvl: 2, desc: "Sidovinklar & Vertikalvinklar", ex: "Summan är 180 grader" },
                    { lvl: 3, desc: "Vinkelsumma i en triangel", ex: "180 - (v1 + v2)" }
                ]
            },
            {
                id: "pythagoras",
                title: "Pythagoras Sats",
                levels: [
                    { lvl: 1, desc: "Kvadrater & Rötter", ex: "Basen för Pythagoras" },
                    { lvl: 2, desc: "Hitta Hypotenusan (c)", ex: "a^2 + b^2 = c^2" },
                    { lvl: 3, desc: "Hitta Kateten (a/b)", ex: "c^2 - b^2 = a^2" },
                    { lvl: 4, desc: "Tillämpningar (Stegen/Diagonalen)", ex: "Problemlösning" }
                ]
            },
            {
                id: "volume",
                title: "Volym & Yta",
                levels: [
                    { lvl: 1, desc: "Rätblock & Kub", ex: "Bredden • Djupet • Höjden" },
                    { lvl: 2, desc: "Prisma & Cylinder", ex: "Basytan • Höjden" },
                    { lvl: 3, desc: "Pyramid & Kon", ex: "(Basytan • Höjden) / 3" },
                    { lvl: 4, desc: "Klot (Sfär)", ex: "Volym för bollar" },
                    { lvl: 5, desc: "Enhetsomvandling (Liter)", ex: "dm3 <-> Liter" },
                    { lvl: 6, desc: "Begränsningsyta", ex: "Arean på utsidan" }
                ]
            },
            {
                id: "scale",
                title: "Skala & Likformighet",
                levels: [
                    { lvl: 1, desc: "Begrepp: Förstoring & Förminskning", ex: "1:100 vs 2:1" },
                    { lvl: 2, desc: "Beräkna verklig längd", ex: "Från karta till verklighet" },
                    { lvl: 3, desc: "Bestäm skalan", ex: "Bild / Verklighet" },
                    { lvl: 4, desc: "Areaskala", ex: "Längdskala i kvadrat" },
                    { lvl: 5, desc: "Likformighet: Kontroll", ex: "Jämför sidförhållanden" },
                    { lvl: 6, desc: "Likformighet: Beräkna sida", ex: "Topptriangelsatsen" }
                ]
            }
        ]
    },
    data: {
        title: "Statistik & Sannolikhet",
        topics: [
            {
                id: "probability",
                title: "Sannolikhet",
                levels: [
                    { lvl: 1, desc: "Klassisk sannolikhet (Visuell)", ex: "Kulor i påse" },
                    { lvl: 2, desc: "Händelser i flera steg", ex: "Tärning + Mynt" },
                    { lvl: 3, desc: "Komplementhändelse", ex: "Sannolikheten för 'Inte'" },
                    { lvl: 4, desc: "Sannolikhetsträd", ex: "Beroende händelser" },
                    { lvl: 5, desc: "Kombinatorik", ex: "Handskakningsproblemet" }
                ]
            },
            {
                id: "statistics",
                title: "Statistik",
                levels: [
                    { lvl: 1, desc: "Typvärde & Variationsbredd", ex: "Vanligaste värdet" },
                    { lvl: 2, desc: "Medelvärde: Grund", ex: "Summa / Antal" },
                    { lvl: 3, desc: "Median", ex: "Mittenvärdet (sorterat)" },
                    { lvl: 4, desc: "Frekvenstabell", ex: "Viktat medelvärde" },
                    { lvl: 5, desc: "Analys: Outliers & Centralmått", ex: "Välj rätt mått" },
                    { lvl: 6, desc: "Mål-medelvärde", ex: "Vad krävs på nästa test?" }
                ]
            },
            {
                id: "percent",
                title: "Procent & Förändring",
                levels: [
                    { lvl: 1, desc: "Huvudräkning (10%, 25%, 50%)", ex: "Benchmarks" },
                    { lvl: 2, desc: "Beräkna delen", ex: "15% av 400" },
                    { lvl: 3, desc: "Hitta helheten (100%)", ex: "Baklängesräkning" },
                    { lvl: 4, desc: "Förändringsfaktor: Ökning", ex: "FF > 1" },
                    { lvl: 5, desc: "Förändringsfaktor: Minskning", ex: "FF < 1" },
                    { lvl: 6, desc: "Procentfällan: Upprepad förändring", ex: "Höjning sen sänkning" }
                ]
            }
        ]
    }
};