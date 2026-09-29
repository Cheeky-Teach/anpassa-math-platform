// src/core/utils/stories/geometry.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const GEOMETRY_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. GEOM PERIMETER SQUARE (Requires placeholders: {s})
    // =========================================================================
    geom_perimeter_square: [
        {
            sv: "Du ska sätta upp en LED-ljusslinga runt hela din kvadratiska gamingbänk. En av bänkens sidor mäter {s} dm. Hur många decimeter ljusslinga behöver du köpa?",
            en: "You are putting up an LED light strip around your entire square gaming desk. One side of the desk measures {s} dm. How many decimeters of light strip do you need to buy?"
        },
        {
            sv: "Ett kvadratiskt rum i en inspelningsstudio har en vägglängd på {s} meter. En snickare ska montera en golvlist runt hela rummet. Hur många meter list går det åt?",
            en: "A square room in a recording studio has a wall length of {s} meters. A carpenter is installing a baseboard around the entire room. How many meters of trim are used?"
        },
        {
            sv: "Ett gäng har byggt en kvadratisk inhägnad för att spela fotboll på skolgården. Varje sidoplanka är {s} meter lång. Vad blir inhägnadens totala omkrets?",
            en: "A group built a square enclosure to play soccer in the schoolyard. Each side plank is {s} meters long. What will be the total perimeter of the enclosure?"
        },
        {
            sv: "En kvadratisk musmatta till ett skrivbord har en sidlängd på {s} cm. Tillverkaren syr en kantsöm runt hela musmattan. Hur lång blir sömmen totalt?",
            en: "A square desk mousepad has a side length of {s} cm. The manufacturer sews a border stitch around the entire pad. How long will the stitch be in total?"
        },
        {
            sv: "Ett torg på en mobilbana har formen av en kvadrat där varje sida mäter {s} meter. Din spelkaraktär springer ett helt varv längs ytterkanterna. Hur långt rör sig karaktären?",
            en: "A plaza on a mobile game map is shaped like a square where each side measures {s} meters. Your game character runs one full lap along the outer edges. How far does it move?"
        },
        {
            sv: "En kvadratisk studsmatta har en sidlängd på {s} meter. Det sitter ett kantskydd fäst runt hela studsmattans ytterkant. Vad är omkretsen på detta kantskydd?",
            en: "A square trampoline has a side length of {s} meters. There is a safety border attached around the entire outer edge. What is the perimeter of this safety border?"
        },
        {
            sv: "En poster med ett skivomslag är helt kvadratisk, och ramen har sidlängden {s} cm. Hur lång blir ramen runt hela postern?",
            en: "A poster of an album cover is perfectly square, and the frame has a side length of {s} cm. What is the total length of the frame around the entire poster?"
        },
        {
            sv: "Ett litet kvadratiskt dansgolv har en sidlängd på {s} meter. Man ska fästa tejp på golvet längs alla fyra väggkanter. Hur lång blir tejpen totalt?",
            en: "A small square dance floor has a side length of {s} meters. Tape needs to be applied to the floor along all four wall edges. How long will the tape be in total?"
        },
        {
            sv: "Ett kvadratiskt fönster i ett rum har en sidlängd på {s} cm. Du ska sätta en tätningslist runt glasets alla fyra ytterkanter. Hur många centimeter list behövs?",
            en: "A square window in a room has a side length of {s} cm. You are installing a weather strip around all four outer edges of the glass. How many centimeters of strip are needed?"
        },
        {
            sv: "Ett klistermärke till en bärbar dator har formen av en kvadrat med sidlängden {s} mm. Vad är klistermärkets totala omkrets?",
            en: "A sticker for a laptop is shaped like a square with a side length of {s} mm. What is the total perimeter of the sticker?"
        },
        {
            sv: "Du bygger en kvadratisk ram av trä till en spegel. Varje bit ska sågas till längden {s} cm. Hur mycket trälina går det åt totalt till hela ramen?",
            en: "You are building a square wooden frame for a mirror. Each piece needs to be cut to a length of {s} cm. How much wood is used in total for the whole frame?"
        },
        {
            sv: "En kvadratisk scen för en DJ på en festival mäter {s} meter på varje sida. Arrangörerna spärrar av alla fyra sidor med plastband. Hur många meter plastband går det åt?",
            en: "A square DJ stage at a festival measures {s} meters on each side. The organizers block off all four sides with plastic tape. How many meters of tape are used?"
        },
        {
            sv: "Ett torg på en karta har formen av en kvadrat där varje sida är {s} mm lång. Hur lång är omkretsen på torget på ritningen?",
            en: "A plaza on a blueprint is shaped like a square where each side is {s} mm long. How long is the perimeter of the plaza on the drawing?"
        },
        {
            sv: "En kvadratisk skärm till en surfplatta har sidlängden {s} cm. Man sätter en gummipackning runt skärmens alla fyra kanter. Hur lång packning behövs?",
            en: "A square tablet screen has a side length of {s} cm. A rubber gasket is placed around all four edges of the screen. How long of a gasket is needed?"
        },
        {
            sv: "En kvadratisk tårta har sidlängden {s} cm. Ett bageri dekorerar tårtan med ett band längs alla fyra ytterkanter. Hur långt blir bandet?",
            en: "A square cake has a side length of {s} cm. A bakery decorates the cake with a ribbon along all four outer edges. How long will the ribbon be?"
        }
    ],

    // =========================================================================
    // 🎯 2. GEOM PERIMETER INVERSE (Requires placeholders: {p}, {b})
    // =========================================================================
    geom_perimeter_inverse: [
        {
            sv: "En rektangulär träningsmatta har en total omkrets på {p} cm. Mattans korta bas mäter {b} cm. Hur lång är mattans långsida (höjden)?",
            en: "A rectangular workout mat has a total perimeter of {p} cm. The short base of the mat measures {b} cm. How long is the long side (height) of the mat?"
        },
        {
            sv: "Du har ett {p} meter långt nät för att bygna en rektangulär rastgård till dina kaniner. Kortsidan (basen) måste vara {b} meter lång. Hur lång blir då långsidan?",
            en: "You have a {p}-meter-long net to build a rectangular bunny run. The short side (base) must be {b} meters long. How long will the long side be?"
        },
        {
            sv: "Ett rektangulärt rum har omkretsen {p} meter. Om rummets bredd (basen) är {b} meter, vad är då rummets längd (höjden)?",
            en: "A rectangular room has a perimeter of {p} meters. If the width of the room (base) is {b} meters, what is the length of the room (height)?"
        },
        {
            sv: "En rektangulär skateboardramp har en omkrets på {p} dm. En åkare mäter upp basen till {b} dm. Hur många decimeter är rampens höjd?",
            en: "A rectangular skateboard ramp has a perimeter of {p} dm. A skater measures the base to be {b} dm. How many decimeters is the height of the ramp?"
        },
        {
            sv: "En rektangulär affisch har en ram som mäter totalt {p} cm i omkrets. Om affischens kortsida är {b} cm, hur lång är då dess långsida?",
            en: "A rectangular poster has a frame measuring a total of {p} cm in perimeter. If the short side of the poster is {b} cm, how long is its long side?"
        },
        {
            sv: "Kanten runt en rektangulär datorskärm har den totala längden {p} cm. Om skärmens bredd utgör {b} cm, hur hög är skärmen?",
            en: "The border around a rectangular computer monitor has a total length of {p} cm. If the width of the screen makes up {b} cm, how tall is the monitor?"
        },
        {
            sv: "En fotbollsplan på en skolgård har en omkrets på {p} meter. Om planens kortsida är markerad till {b} meter, hur lång är då planens långsida?",
            en: "A football pitch in a schoolyard has a perimeter of {p} meters. If the short side of the pitch is marked as {b} meters, how long is the pitch's long side?"
        },
        {
            sv: "En rektangulär volleybollplan ska spärras av med ett {p} meter långt plastband. Om banans bredd utgör {b} meter, hur lång är banans sträckning åt andra hållet?",
            en: "A rectangular volleyball court is to be cordoned off with a {p}-meter-long plastic tape. If the width of the court makes up {b} meters, how long is its stretch in the other direction?"
        },
        {
            sv: "Ett rektangulärt område för cykelparkering har en total omkrets på {p} meter. Om bredden (basen) utgör {b} meter, hur djup är cykelparkeringen (höjden)?",
            en: "A rectangular bicycle parking zone has a total perimeter of {p} meters. If the width (base) makes up {b} meters, how deep is the parking zone (height)?"
        },
        {
            sv: "En bit papper har formen av en parallellogram med omkretsen {p} mm. Den ena kända kortsidan mäter {b} mm. Hur lång är den lutande långsidan?",
            en: "A piece of paper is shaped like a parallelogram with a perimeter of {p} mm. One known short side measures {b} mm. How long is the slanted long side?"
        },
        {
            sv: "En rektangulär databox har en total omkrets på {p} mm längs framsidan. Om bredden mäts till {b} mm, vad blir då höjden på boxens framsida?",
            en: "A rectangular computer case has a total perimeter of {p} mm along the front panel. If the width is measured to be {b} mm, what is the height of the front panel?"
        },
        {
            sv: "En rektangulär spegel har en metallram som är {p} cm lång totalt. Om spegelns bredd mäter {b} cm, hur hög är spegeln?",
            en: "A rectangular mirror has a metal frame that is {p} cm long in total. If the width of the mirror measures {b} cm, how tall is the mirror?"
        },
        {
            sv: "Du gör en rektangulär banner till din kanal. Den totala omkretsen är {p} pixlar. Om bredden sätts till {b} pixlar, hur många pixlar hög blir bannern?",
            en: "You are making a rectangular banner for your channel. The total perimeter is {p} pixels. If the width is set to {b} pixels, how many pixels high will the banner be?"
        },
        {
            sv: "Kanten runt en rektangulär surfplatta mäter totalt {p} mm. Om kortsidan utgör {b} mm, hur lång är surfplattans långsida?",
            en: "The edge around a rectangular tablet measures {p} mm total. If the short side makes up {b} mm, how long is the long side of the tablet?"
        },
        {
            sv: "En rektangulär bild har en ram med omkretsen {p} mm. Om bildens bredd är {b} mm, hur hög är bilden?",
            en: "A rectangular image has a border with a perimeter of {p} mm. If the width of the image is {b} mm, how high is the image?"
        }
    ],

    // =========================================================================
    // 🎯 3. GEOM AREA QUAD (Requires placeholders: {b}, {h})
    // =========================================================================
    geom_area_quad: [
        {
            sv: "Ett rektangulärt rum har basen {b} meter och höjden {h} meter. Du ska lägga in en matta som täcker hela golvet. Hur många kvadratmeter matta behöver du köpa?",
            en: "A rectangular bedroom has a base of {b} meters and a height of {h} meters. You are laying a rug covering the whole floor. How many square meters of rug do you need to buy?"
        },
        {
            sv: "En bit papper till ett pyssel har formen av en parallellogram med basen {b} cm och den vinkelräta höjden {h} cm. Hur stor är pappersbitens area?",
            en: "A piece of paper for a craft project is shaped like a parallelogram with a base of {b} cm and a perpendicular height of {h} cm. What is the area of the piece of paper?"
        },
        {
            sv: "En rektangulär datorskärm har bredden {b} cm och höjden {h} cm. Hur stor yta har skärmen totalt?",
            en: "A rectangular computer monitor has a width of {b} cm and a height of {h} cm. How large is the screen's surface area in total?"
        },
        {
            sv: "En vägg i ett rum mäter {b} meter i basen och {h} meter i höjd. Du ska måla om hela väggen. Hur stor är väggytan som ska täckas med färg?",
            en: "A wall in a bedroom measures {b} meters at the base and {h} meters in height. You are going to repaint the whole wall. How large is the wall surface to be covered with paint?"
        },
        {
            sv: "En bit tyg till en flagga är rektangulär och har måtten {b} cm i underkant och en höjd på {h} cm. Hur stor är tygflaggans totala area?",
            en: "A piece of fabric for a flag is rectangular and has measurements of {b} cm at the bottom and a height of {h} cm. What is the total area of the fabric flag?"
        },
        {
            sv: "En musmatta till ett skrivbord har längden {b} cm and djupet {h} cm. Hur stor är arbetsytans area på musmattan?",
            en: "A mousepad for a desk has a length of {b} cm and a depth of {h} cm. What is the surface area of the mousepad workspace?"
        },
        {
            sv: "En rektangulär affisch på en busshållplats har basen {b} cm och höjden {h} cm. Hur stor yta upptar affischen?",
            en: "A rectangular poster at a bus stop has a base of {b} cm and a height of {h} cm. How much surface area does the poster occupy?"
        },
        {
            sv: "Ett rektangulärt fönster på ett rum är {b} cm brett och {h} cm högt. Hur stor glasyta har fönstret?",
            en: "A rectangular window is {b} cm wide and {h} cm high. How much glass surface area does the window have?"
        },
        {
            sv: "En rektangulär solpanel till en powerbank har måtten {b} mm gånger {h} mm. Hur stor aktiv yta har panelen för att samla upp ljus?",
            en: "A rectangular solar panel for a power bank measures {b} mm by {h} mm. How large is the panel's active surface area for collecting light?"
        },
        {
            sv: "En bit mark på ett mobilspel har formen av en parallellogram med en baslinje på {b} meter och ett vinkelrätt djup på {h} meter. Hur stor är markytans totala area?",
            en: "A plot of land on a mobile game has the shape of a parallelogram with a baseline of {b} meters and a perpendicular depth of {h} meters. What is the total area of the land surface?"
        },
        {
            sv: "Ett klistermärke till baksidan av en mobil är {b} mm brett och {h} mm högt. Vilken area har klistermärket?",
            en: "A sticker for the back of a phone is {b} mm wide and {h} mm high. What area does the sticker have?"
        },
        {
            sv: "En rektangulär spegel har bredden {b} cm och höjden {h} cm. Hur stor är spegelytan?",
            en: "A rectangular mirror has a width of {b} cm and a height of {h} cm. What is the area of the mirror surface?"
        },
        {
            sv: "Ett ritblock har rektangulära sidor som är {b} cm breda och {h} cm höga. Hur stor rityta har varje sida?",
            en: "A drawing pad has rectangular pages that are {b} cm wide and {h} cm high. How large is the drawing area on each page?"
        },
        {
            sv: "En rektangulär skateboardpark utomhus mäter {b} meter i basen och {h} meter i höjd. Hur stor är parkens totala yta?",
            en: "An outdoor rectangular skatepark measures {b} meters at the base and {h} meters in height. What is the total area of the park?"
        },
        {
            sv: "En bit skyddsfilm till skärmen på en spelkonsol mäter {b} mm i bredd och {h} mm i höjd. Vilken area har skyddsfilmen?",
            en: "A piece of protective film for a gaming console screen measures {b} mm in width and {h} mm in height. What area does the protective film have?"
        }
    ],

    // =========================================================================
    // 🎯 4. GEOM AREA TRIANGLE (Requires placeholders: {base}, {height})
    // =========================================================================
    geom_area_triangle: [
        {
            sv: "En triangelformad logotyp till ett klädmärke har basen {base} mm och höjden {height} mm. Hur stor area har logotypen?",
            en: "A triangular logo for a clothing brand has a base of {base} mm and a height of {height} mm. What is the area of the logo?"
        },
        {
            sv: "En ramp har en kortsida som bildar en rätvinklig triangel där basen mäter {base} cm och höjden är {height} cm. Hur stor träyta har denna kortsida?",
            en: "A ramp has a side profile forming a right-angled triangle where the base measures {base} cm and the height is {height} cm. What is the surface area of this wooden profile?"
        },
        {
            sv: "En bit tyg till en triangelformad flagga har basen {base} cm och höjden {height} cm. Beräkna flaggans area.",
            en: "A piece of fabric for a triangular flag has a base of {base} cm and a height of {height} cm. Calculate the area of the flag."
        },
        {
            sv: "En triangelformad varningsskylt längs en cykelbana har en bas på {base} cm och en höjd på {height} cm. Hur stor är skyltens främre yta?",
            en: "A triangular warning sign along a bicycle path has a base of {base} cm and a height of {height} cm. How large is the front surface area of the sign?"
        },
        {
            sv: "Ett hörn i ett rum ska ha en triangelformad hylla som har baslinjen {base} cm och djupet (höjden) {height} cm. Hur stor blir hyllans ovansida?",
            en: "A corner in a bedroom is being styled with a triangular shelf that has a baseline of {base} cm and a depth (height) of {height} cm. What is the surface area of the shelf top?"
        },
        {
            sv: "En flagga till ett rum utgör en triangel med måtten {base} cm i basen och {height} cm i höjd. Hur stor är flaggans tygyta?",
            en: "A flag for a bedroom forms a triangle with dimensions of {base} cm at the base and {height} cm in height. What is the surface area of the flag fabric?"
        },
        {
            sv: "Ett glaselement till ett räcke har formen av en rätvinklig triangel med en bas på {base} cm och en höjd på {height} cm. Vad är glasets area?",
            en: "A glass panel for a railing is shaped like a right-angled triangle with a base of {base} cm and a height of {height} cm. What is the area of the glass?"
        },
        {
            sv: "En bit papper klipps diagonalt till en triangel med basen {base} mm och höjden {height} mm. Hur stor area har pappersbiten?",
            en: "A piece of paper is cut diagonally into a triangle with a base of {base} mm and a height of {height} mm. What area does the piece of paper have?"
        },
        {
            sv: "En bit plexiglas har skurits ut som en triangel till ett skolarbete. Basen är {base} cm och höjden är {height} cm. Vad blir plexiglasets area?",
            en: "A piece of plexiglass has been cut into a triangle for a school project. The base is {base} cm and the height is {height} cm. What will be the area of the plexiglass?"
        },
        {
            sv: "En bit spegelglas är slipad som en triangel med basen {base} cm och höjden {height} cm. Hur stor är spegelytan?",
            en: "A piece of mirror glass is ground into a triangle with a base of {base} cm and a height of {height} cm. How large is the mirror surface area?"
        },
        {
            sv: "Ett tryck på en hoodie har formen av en triangel med basen {base} mm och höjden {height} mm. Vilken area täcker trycket på tröjan?",
            en: "A print on a hoodie is shaped like a triangle with a base of {base} mm and a height of {height} mm. What area does the print cover on the sweatshirt?"
        },
        {
            sv: "En triangelformad pizzaslice har basen {base} cm och höjden {height} cm. Hur stor area har pizzabiten?",
            en: "A triangular pizza slice has a base of {base} cm and a height of {height} cm. What is the surface area of the pizza slice?"
        },
        {
            sv: "Ett märke till en jacka är triangelformat. Basen är {base} mm och höjden utgör {height} mm. Vad blir märkets area?",
            en: "A patch for a jacket is triangular. The base is {base} mm and the height makes up {height} mm. What will be the area of the patch?"
        },
        {
            sv: "En triangelformad bit av en affisch har basen {base} cm och höjden {height} cm. Vilken area har denna pappersbit?",
            en: "A triangular piece of a poster has a base of {base} cm and a height of {height} cm. What area does this piece of paper have?"
        },
        {
            sv: "Ett mönster består av trianglar med basen {base} mm och höjden {height} mm. Vilken area har varje liten triangel?",
            en: "A pattern consists of small triangles with a base of {base} mm and a height of {height} mm. What area does each small triangle have?"
        }
    ],

    // =========================================================================
    // 🎯 5. GEOM AREA L SHAPE (Requires placeholders: {vW}, {vH}, {hW}, {hH})
    // =========================================================================
    geom_area_l_shape: [
        {
            sv: "Ett L-format rum ska få ett nytt golv. Den stående rektangeln mäter {vW} gånger {vH} meter, och den liggande sektionen mäter {hW} gånger {hH} meter. Vad utgör rummets totala golvarea?",
            en: "An L-shaped bedroom is getting a new floor. The vertical rectangle measures {vW} by {vH} meters, and the horizontal section measures {hW} by {hH} meters. What is the total floor area of the room?"
        },
        {
            sv: "En L-formad yta på en skolgård ska målas med asfaltsfärg. Ytan kan delas upp i en vertikal del på {vW}x{vH} meter och en anslutande del på {hW}x{hH} meter. Hur stor yta ska målas till slut?",
            en: "An L-shaped area in a schoolyard is to be painted with asphalt paint. The surface can be split into a vertical part of {vW}x{vH} meters and an adjoining part of {hW}x{hH} meters. How large an area needs to be painted in total?"
        },
        {
            sv: "En bänk i ett hörn är formad som ett L. Den längre skivan har måtten {vW}x{vH} cm och den mindre sidoskivan har måtten {hW}x{hH} cm. Vad blir bänkens totala area?",
            en: "A corner desk is shaped like an L. The longer board has dimensions of {vW}x{vH} cm and the smaller side board has dimensions of {hW}x{hH} cm. What is the total area of the desk?"
        },
        {
            sv: "Ett L-format utrymme på en mobilbana mäter {vW}x{vH} meter i sin stora zon och {hW}x{hH} meter i sin lilla zon. Hur stor är zonsytans totala area?",
            en: "An L-shaped zone on a mobile game map measures {vW}x{vH} meters in its large zone and {hW}x{hH} meters in its small zone. What is the total area of the zone surface?"
        },
        {
            sv: "En L-formad pool består av två rektangulära sektioner med måtten {vW}x{vH} meter respektive {hW}x{hH} meter. Hur stor bottenarea har poolen?",
            en: "An L-shaped pool consists of two rectangular sections measuring {vW}x{vH} meters and {hW}x{hH} meters respectively. What is the bottom area of the pool?"
        },
        {
            sv: "En plåtbit till ett bygge har stansats ut i formen av ett L. Den vertikala stammen är {vW} mm bred och {vH} mm hög, medan den utstickande foten är {hW} mm bred och {hH} mm hög. Vad är plåtbitens area?",
            en: "A piece of sheet metal for a project has been stamped out in the shape of an L. The vertical stem is {vW} mm wide and {vH} mm high, while the protruding foot is {hW} mm wide and {hH} mm high. What is the area of the sheet metal?"
        },
        {
            sv: "Ett L-format trädäck har byggts på baksidan av ett hus. Däcket kan delas upp i två rektanglar med måtten {vW}x{vH} meter och {hW}x{hH} meter. Hur stor är trallens totala area?",
            en: "An L-shaped wooden deck has been built at the back of a house. The deck can be divided into two rectangles measuring {vW}x{vH} meters and {hW}x{hH} meters. What is the total area of the decking?"
        },
        {
            sv: "En L-formad studio har en huvuddel på {vW}x{vH} meter och en sidadel på {hW}x{hH} meter. Hur stor är den totala golvytan i studion?",
            en: "An L-shaped studio has a main section measuring {vW}x{vH} meters and a side section measuring {hW}x{hH} meters. What is the total floor area in the studio?"
        },
        {
            sv: "En monteringsyta på ett kretskort bildar ett L. De två rektangulära delarna har måtten {vW}x{vH} mm och {hW}x{hH} mm. Beräkna den totala monteringsarean.",
            en: "A mounting area on a circuit board forms an L. The two rectangular parts measure {vW}x{vH} mm and {hW}x{hH} mm. Calculate the total mounting area."
        },
        {
            sv: "En bit kartong till en låda har klippts ut som ett L. Måtten på de två rektangulära delarna är {vW}x{vH} cm och {hW}x{hH} cm. Vad blir kartongbitens totala area?",
            en: "A piece of cardboard for a box has been cut out like an L. The dimensions of the two rectangular parts are {vW}x{vH} cm and {hW}x{hH} cm. What is the total area of the cardboard piece?"
        },
        {
            sv: "En L-formad datorskärm på en panel består av en huvudskärm på {vW}x{vH} cm och en sidoskärm på {hW}x{hH} cm. Vad blir den totala skärmarean?",
            en: "An L-shaped screen layout on a panel consists of a main monitor measuring {vW}x{vH} cm and a side panel measuring {hW}x{hH} cm. What is the total screen area?"
        },
        {
            sv: "En bit klisterfilm till en L-formad hylla har måtten {vW}x{vH} cm på den ena delen och {hW}x{hH} cm på den andra. Vilken area har klisterfilmen totalt?",
            en: "A piece of adhesive film for an L-shaped shelf measures {vW}x{vH} cm on one part and {hW}x{hH} cm on the other. What area does the film cover in total?"
        },
        {
            sv: "En L-formad scen till en föreställning har satts ihop av två rektangulära plattformar med måtten {vW}x{vH} meter och {hW}x{hH} meter. Vad utgör scenens totala area?",
            en: "An L-shaped stage for a play has been assembled from two rectangular platforms measuring {vW}x{vH} meters and {hW}x{hH} meters. What is the total area of the stage?"
        },
        {
            sv: "En bit plastfilm har skurits till ett L för att skydda ett skrivbords hörn. Delarna mäter {vW}x{vH} cm och {hW}x{hH} cm. Vilken area har skyddsfilmen?",
            en: "A piece of plastic film has been cut into an L to protect a desk corner. The parts measure {vW}x{vH} cm and {hW}x{hH} cm. What area does the protective film have?"
        },
        {
            sv: "En L-formad logotyp på en skylt utgörs av två rektangulära block med måtten {vW}x{vH} mm och {hW}x{hH} mm. Vad blir logotypens totala area?",
            en: "An L-shaped logo on a sign consists of two rectangular blocks measuring {vW}x{vH} mm and {hW}x{hH} mm. What is the total area of the logo?"
        }
    ],

    // =========================================================================
    // 🎯 6. GEOM AREA CIRCLE (Requires placeholders: {r})
    // =========================================================================
    geom_area_circle: [
        {
            sv: "En rund matta till ett rum har radien {r} dm. Hur stor golvyta täcker mattan? (Räkna med pi = 3,14)",
            en: "A round rug for a bedroom has a radius of {r} dm. How much floor space does the rug cover? (Calculate using pi = 3.14)"
        },
        {
            sv: "En cirkelformad panel på en högtalare har radien {r} cm. Hur stor area täcker panelen? (Räkna med pi = 3,14)",
            en: "A circular panel on a speaker has a radius of {r} cm. How large an area does the panel cover? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett runt bord på ett café har en radie på {r} cm. Du ska köpa en plastfilm som täcker hela bordsskivan. Vad blir bordsskivans area? (Räkna med pi = 3,14)",
            en: "A round cafe table has a radius of {r} cm. You are going to buy a plastic film that covers the entire tabletop. What is the area of the tabletop? (Calculate using pi = 3.14)"
        },
        {
            sv: "En cirkulär landningszon för en drönare har ritats med en radie på {r} meter. Hur stor yta har zonen totalt? (Räkna med pi = 3,14)",
            en: "A circular landing zone for a drone has been designed with a radius of {r} meters. How large is the total surface area of the zone? (Calculate using pi = 3.14)"
        },
        {
            sv: "En rund logotyp på en skateboard har radien {r} cm. Hur stor area har klistermärket? (Räkna med pi = 3,14)",
            en: "A round logo sticker on a skateboard has a radius of {r} cm. How large an area does the sticker have? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett runt fönster på en dörr har radien {r} cm. Hur stor är glasyta som släpper in ljus? (Räkna med pi = 3,14)",
            en: "A round window on a door has a radius of {r} cm. How large is the glass surface area letting in light? (Calculate using pi = 3.14)"
        },
        {
            sv: "En cirkulär musmatta har en radie på {r} cm. Hur stor är musmattans totala ovansida? (Räkna med pi = 3,14)",
            en: "A circular mousepad has a radius of {r} cm. How large is the entire top surface area of the mousepad? (Calculate using pi = 3.14)"
        },
        {
            sv: "En rund väggspegel har radien {r} cm. Hur stor reflekterande spegelyta har den? (Räkna med pi = 3,14)",
            en: "A round wall mirror has a radius of {r} cm. How large a reflecting mirror surface area does it have? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett cirkulärt hål för en sladd i en skrivbordsplatta har borrats med radien {r} mm. Hur stor är öppningens area? (Räkna med pi = 3,14)",
            en: "A circular cord hole in a desk setup has been drilled with a radius of {r} mm. What is the area of the opening? (Calculate using pi = 3.14)"
        },
        {
            sv: "En rund scen till en föreställning har radien {r} meter. Scengolvet ska målas om med svart färg. Hur stor är ytan som ska målas? (Räkna med pi = 3,14)",
            en: "A round stage for a performance has a radius of {r} meters. The stage floor is to be repainted with black paint. How large is the surface area to be painted? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett tryck på en t-shirt utgörs av en cirkel med radien {r} cm. Vilken area har trycket? (Räkna med pi = 3,14)",
            en: "A print on a t-shirt forms a circle with a radius of {r} cm. What area does the print have? (Calculate using pi = 3.14)"
        },
        {
            sv: "En rund pizzabas har radien {r} cm. Hur stor yta har pizzan som man ska lägga fyllning på? (Räkna med pi = 3,14)",
            en: "A round pizza base has a radius of {r} cm. How large is the surface area of the pizza to be topped? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett runt märke som man sätter på en ryggsäck har radien {r} mm. Vilken area har märket? (Räkna med pi = 3,14)",
            en: "A round patch for a backpack has a radius of {r} mm. What area does the patch have? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett runt lock till en dricksflaska har radien {r} mm. Hur stor area har lockets ovansida? (Räkna med pi = 3,14)",
            en: "A round cap for a water bottle has a radius of {r} mm. What is the area of the cap's top surface? (Calculate using pi = 3.14)"
        },
        {
            sv: "En cirkulär klocka på en vägg har radien {r} cm. Hur stor yta har klockans framsida? (Räkna med pi = 3,14)",
            en: "A circular wall clock has a radius of {r} cm. What is the area of the clock's front face? (Calculate using pi = 3.14)"
        }
    ],

    // =========================================================================
    //   7. GEOM PERIMETER CIRCLE (Requires placeholders: {r})
    // =========================================================================
    geom_perimeter_circle: [
        {
            sv: "Du ska fästa en LED-ljusslinga runt ytterkanten på en helt rund spegel. Spegelns radie är {r} cm. Hur lång ljusslinga behöver du köpa? (Räkna med pi = 3,14)",
            en: "You are attaching an LED light strip around the outer edge of a perfectly round mirror. The mirror's radius is {r} cm. How long of a light strip do you need to buy? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett runt bord har radien {r} cm. En snickare ska limma fast en skyddande plastlist runt hela bordets ytterkant. Hur lång list går det åt? (Räkna med pi = 3,14)",
            en: "A round table has a radius of {r} cm. A carpenter is gluing a protective plastic edge trim around the entire outer edge of the table. How much trim is used? (Calculate using pi = 3.14)"
        },
        {
            sv: "En cirkelformad pool har radien {r} meter. Du ska bygga ett litet staket som går exakt längs poolens runda kant. Hur långt blir staketet? (Räkna med pi = 3,14)",
            en: "A circular pool has a radius of {r} meters. You are building a small fence that runs exactly along the pool's round edge. How long will the fence be? (Calculate using pi = 3.14)"
        },
        {
            sv: "En bagare knyter ett vackert snöre runt kanten på en rund tårta. Tårtans radie är {r} cm. Hur långt måste snöret vara för att räcka exakt ett varv runt? (Räkna med pi = 3,14)",
            en: "A baker ties a beautiful ribbon around the edge of a round cake. The cake's radius is {r} cm. How long must the ribbon be to reach exactly one lap around? (Calculate using pi = 3.14)"
        },
        {
            sv: "Mittcirkeln på en fotbollsplan ska målas med en vit linje. Cirkelns radie är {r} meter. Hur många meter vit linje måste målas? (Räkna med pi = 3,14)",
            en: "The center circle on a football pitch is to be painted with a white line. The circle's radius is {r} meters. How many meters of white line must be painted? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett runt fönster har radien {r} cm. Du ska sätta en gummitätning längs hela fönstrets ytterkant för att stoppa drag. Hur lång tätning behövs? (Räkna med pi = 3,14)",
            en: "A round window has a radius of {r} cm. You are placing a rubber seal along the entire outer edge of the window to stop drafts. How long of a seal is needed? (Calculate using pi = 3.14)"
        },
        {
            sv: "En cirkulär musmatta har radien {r} cm. Tillverkaren syr en förstärkt söm runt hela den runda ytterkanten. Hur lång blir sömmen? (Räkna med pi = 3,14)",
            en: "A circular mousepad has a radius of {r} cm. The manufacturer sews a reinforced stitch around the entire round outer edge. How long will the stitch be? (Calculate using pi = 3.14)"
        },
        {
            sv: "En guldring ska smidas med radien {r} mm. Hur lång bit guldtråd måste smeden använda för att böja ihop till ringen? (Räkna med pi = 3,14)",
            en: "A gold ring is to be forged with a radius of {r} mm. How long of a piece of gold wire must the blacksmith use to bend into the ring? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett cykelhjul har radien {r} cm från mitten ut till metallfälgen. Hur långt rullar hjulet på marken under exakt ett helt varv? (Räkna med pi = 3,14)",
            en: "A bicycle wheel has a radius of {r} cm from the center out to the metal rim. How far does the wheel roll on the ground during exactly one full revolution? (Calculate using pi = 3.14)"
        },
        {
            sv: "En drönare flyger i en perfekt cirkel runt ett torn. Flygbanans radie är {r} meter. Hur långt flyger drönaren under ett helt varv? (Räkna med pi = 3,14)",
            en: "A drone flies in a perfect circle around a tower. The flight path's radius is {r} meters. How far does the drone fly during one full lap? (Calculate using pi = 3.14)"
        },
        {
            sv: "Du tejpar kanten på en rund frisbee för att göra den mjukare. Frisbeens radie är {r} cm. Hur mycket tejp går åt till ett varv? (Räkna med pi = 3,14)",
            en: "You tape the edge of a round frisbee to make it softer. The frisbee's radius is {r} cm. How much tape is used for one lap? (Calculate using pi = 3.14)"
        },
        {
            sv: "Runt en cirkelformad rabatt med radien {r} meter ska man lägga runda kantstenar. Vilken omkrets måste kantstenarna täcka totalt? (Räkna med pi = 3,14)",
            en: "Round curbstones are to be laid around a circular flowerbed with a radius of {r} meters. What perimeter must the curbstones cover in total? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett runt märke till en jacka har radien {r} mm. Du ska sy fast märket längs hela den runda ytterkanten. Hur lång blir trådsömmen? (Räkna med pi = 3,14)",
            en: "A round patch for a jacket has a radius of {r} mm. You are going to sew the patch on along its entire round outer edge. How long will the thread stitch be? (Calculate using pi = 3.14)"
        },
        {
            sv: "Kanten på en rund klocka är gjord av metall. Klockans radie är {r} cm. Hur lång är metallramen som går runt hela klockan? (Räkna med pi = 3,14)",
            en: "The edge of a round clock is made of metal. The clock's radius is {r} cm. How long is the metal frame that goes around the entire clock? (Calculate using pi = 3.14)"
        },
        {
            sv: "En cirkulär radar på en skärm visar ett område med radien {r} mm. Hur lång är den ritade linjen som visar radarns yttersta gräns? (Räkna med pi = 3,14)",
            en: "A circular radar on a screen shows an area with a radius of {r} mm. How long is the drawn line that shows the radar's outermost boundary? (Calculate using pi = 3.14)"
        }
    ],

    // =========================================================================
    //   8. GEOM AREA SEMICIRCLE (Requires placeholders: {r})
    // =========================================================================
    geom_area_semicircle: [
        {
            sv: "En dörrmatta är formad som en halvcirkel med radien {r} cm. Hur stor golvyta täcker dörrmattan totalt? (Räkna med pi = 3,14)",
            en: "A doormat is shaped like a semicircle with a radius of {r} cm. How much floor surface does the doormat cover in total? (Calculate using pi = 3.14)"
        },
        {
            sv: "En scen har formen av en halvcirkel med radien {r} meter. Scengolvet ska lackeras. Hur stor yta ska lackeras? (Räkna med pi = 3,14)",
            en: "A stage has the shape of a semicircle with a radius of {r} meters. The stage floor is to be varnished. How large an area is to be varnished? (Calculate using pi = 3.14)"
        },
        {
            sv: "Fönstret ovanför en dörr är format som en halvcirkel med radien {r} cm. Hur stor area har fönsterglaset som släpper in ljus? (Räkna med pi = 3,14)",
            en: "The window above a door is shaped like a semicircle with a radius of {r} cm. What is the area of the window glass that lets in light? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett bord som ställs mot en vägg ser ut som en halvcirkel ovanifrån och har radien {r} cm. Vad blir bordsskivans area? (Räkna med pi = 3,14)",
            en: "A table placed against a wall looks like a semicircle from above and has a radius of {r} cm. What is the area of the tabletop? (Calculate using pi = 3.14)"
        },
        {
            sv: "Tyget till en utfälld solfjäder bildar en perfekt halvcirkel med radien {r} cm. Hur stor tygyta har solfjädern? (Räkna med pi = 3,14)",
            en: "The fabric of an unfolded hand fan forms a perfect semicircle with a radius of {r} cm. How large is the fabric surface of the fan? (Calculate using pi = 3.14)"
        },
        {
            sv: "En pizzabagare har gjort en inbakad pizza formad som en halvcirkel. Pizzans radie är {r} cm. Hur stor yta har pizzans ovansida? (Räkna med pi = 3,14)",
            en: "A pizza baker has made a folded calzone pizza shaped like a semicircle. The pizza's radius is {r} cm. How large is the surface area of the top of the pizza? (Calculate using pi = 3.14)"
        },
        {
            sv: "En trädgård har en gräsmatta formad som en halvcirkel med radien {r} meter. Hur stor yta täcks av gräs? (Räkna med pi = 3,14)",
            en: "A garden has a lawn shaped like a semicircle with a radius of {r} meters. How large an area is covered by grass? (Calculate using pi = 3.14)"
        },
        {
            sv: "En speedometer på en skärm ritas som en halvcirkel med radien {r} mm. Hur stor area täcker speedometern på skärmen? (Räkna med pi = 3,14)",
            en: "A speedometer on a screen is drawn as a semicircle with a radius of {r} mm. What area does the speedometer cover on the screen? (Calculate using pi = 3.14)"
        },
        {
            sv: "Du skär en rund tårta mitt i tu. Halvcirkeln som bildas har radien {r} cm. Hur stor är ytan på tårtans ovansida nu? (Räkna med pi = 3,14)",
            en: "You cut a round cake exactly in half. The semicircle formed has a radius of {r} cm. What is the surface area of the cake's top now? (Calculate using pi = 3.14)"
        },
        {
            sv: "En halvcirkelformad altan har radien {r} meter. Du ska köpa trall för att täcka golvet. Hur många kvadratmeter är altanen? (Räkna med pi = 3,14)",
            en: "A semicircular patio has a radius of {r} meters. You are buying decking to cover the floor. How many square meters is the patio? (Calculate using pi = 3.14)"
        },
        {
            sv: "I ett basketspel är straffområdet målat som en halvcirkel med radien {r} meter. Hur stor area har detta målade område? (Räkna med pi = 3,14)",
            en: "In a basketball game, the free-throw area is painted as a semicircle with a radius of {r} meters. What is the area of this painted zone? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett halvmåne-format klistermärke har formen av en halvcirkel med radien {r} mm. Vilken area har märket? (Räkna med pi = 3,14)",
            en: "A half-moon shaped sticker has the shape of a semicircle with a radius of {r} mm. What area does the sticker have? (Calculate using pi = 3.14)"
        },
        {
            sv: "Du lägger en plastduk över en liten halvcirkelformad damm med radien {r} dm. Hur stor vattenyta täcker plastduken? (Räkna med pi = 3,14)",
            en: "You lay a plastic tarp over a small semicircular pond with a radius of {r} dm. How much water surface does the plastic tarp cover? (Calculate using pi = 3.14)"
        },
        {
            sv: "En solpanel för båtar är formad som en halvcirkel med radien {r} cm. Hur stor aktiv yta har panelen för att fånga solljus? (Räkna med pi = 3,14)",
            en: "A solar panel for boats is shaped like a semicircle with a radius of {r} cm. How large an active surface area does the panel have to catch sunlight? (Calculate using pi = 3.14)"
        },
        {
            sv: "En bit papper klipps till en exakt halvcirkel med radien {r} cm till ett konstprojekt. Vilken area har pappersbiten? (Räkna med pi = 3,14)",
            en: "A piece of paper is cut into an exact semicircle with a radius of {r} cm for an art project. What area does the piece of paper have? (Calculate using pi = 3.14)"
        }
    ],

    // =========================================================================
    //   9. GEOM PERIMETER SEMICIRCLE (Requires placeholders: {r})
    // =========================================================================
    geom_perimeter_semicircle: [
        {
            sv: "Ett fällbart bord har formen av en halvcirkel med radien {r} cm. Du fäster en gummilist längs hela bordets ytterkant (både den runda kanten och den raka kanten). Hur lång list behövs? (Räkna med pi = 3,14)",
            en: "A folding table is shaped like a semicircle with a radius of {r} cm. You attach a rubber bumper along the entire outer edge of the table (both the round edge and the straight edge). How much bumper is needed? (Calculate using pi = 3.14)"
        },
        {
            sv: "En dörrmatta är formad som en halvcirkel med radien {r} cm. Det går ett svart band runt hela mattans ytterkant. Hur långt är bandet totalt? (Räkna med pi = 3,14)",
            en: "A doormat is shaped like a semicircle with a radius of {r} cm. There is a black ribbon stitched around the mat's entire outer edge. How long is the ribbon in total? (Calculate using pi = 3.14)"
        },
        {
            sv: "En rabatt i trädgården ser ut som en halvcirkel med radien {r} meter. Du ska sätta upp ett staket som går hela vägen runt rabatten. Vad blir staketets totala längd? (Räkna med pi = 3,14)",
            en: "A flowerbed in the garden looks like a semicircle with a radius of {r} meters. You are putting up a fence that goes all the way around the flowerbed. What will be the total length of the fence? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett halvcirkelformat fönster har radien {r} cm. Fönstret kantas av en stålram som omsluter hela glaset (både snittet och bågen). Hur lång är stålramen? (Räkna med pi = 3,14)",
            en: "A semicircular window has a radius of {r} cm. The window is edged by a steel frame enclosing the entire glass (both the cut and the arc). How long is the steel frame? (Calculate using pi = 3.14)"
        },
        {
            sv: "Du tejpar marken för att skapa en halvcirkelformad spelzon med radien {r} meter. Hur många meter tejp går åt till att rama in hela zonen? (Räkna med pi = 3,14)",
            en: "You tape the ground to create a semicircular gaming zone with a radius of {r} meters. How many meters of tape are used to frame the entire zone? (Calculate using pi = 3.14)"
        },
        {
            sv: "En halv pizza har radien {r} cm. Hur lång blir ostkanten plus den raka snittlinjen om du mäter hela bitens omkrets? (Räkna med pi = 3,14)",
            en: "A half pizza has a radius of {r} cm. How long will the cheese crust plus the straight cut line be if you measure the entire slice's perimeter? (Calculate using pi = 3.14)"
        },
        {
            sv: "En pappersbit klipps till en halvcirkel med radien {r} mm. En maskin drar en bläcklinje längs pappersbitens alla kanter. Hur lång blir linjen? (Räkna med pi = 3,14)",
            en: "A piece of paper is cut into a semicircle with a radius of {r} mm. A machine draws an ink line along all edges of the paper piece. How long will the line be? (Calculate using pi = 3.14)"
        },
        {
            sv: "En träskiva har sågats till en halvcirkel med radien {r} dm. Du ska sätta kanttejp runt hela skivans yttre gräns. Hur mycket tejp behövs? (Räkna med pi = 3,14)",
            en: "A wooden board has been sawed into a semicircle with a radius of {r} dm. You are applying edge tape around the board's entire outer boundary. How much tape is needed? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett skyddande glas till en lampa har formen av en halvcirkel med radien {r} mm. Glaset har en metallkant som går hela vägen runt om. Vad är metallkantens omkrets? (Räkna med pi = 3,14)",
            en: "A protective glass for a lamp is shaped like a semicircle with a radius of {r} mm. The glass has a metal rim going all the way around it. What is the perimeter of the metal rim? (Calculate using pi = 3.14)"
        },
        {
            sv: "På en scen som ser ut som en halvcirkel med radien {r} meter, ska man lägga en led-sladd längs golvets hela ytterkant. Hur lång sladd krävs? (Räkna med pi = 3,14)",
            en: "On a stage that looks like a semicircle with a radius of {r} meters, an LED cord is to be laid along the floor's entire outer edge. How long a cord is required? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett märke till en mössa är en halvcirkel med radien {r} mm. Märket sys fast med en söm längs hela omkretsen. Beräkna sömmens totala längd. (Räkna med pi = 3,14)",
            en: "A patch for a beanie is a semicircle with a radius of {r} mm. The patch is sewn on with a stitch along the entire perimeter. Calculate the total length of the stitch. (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett halvmåneformat hänge till ett halsband (halvcirkel) har radien {r} mm. Hur lång är silverkanten som ramar in hela hänget? (Räkna med pi = 3,14)",
            en: "A half-moon pendant for a necklace (semicircle) has a radius of {r} mm. How long is the silver edge framing the entire pendant? (Calculate using pi = 3.14)"
        },
        {
            sv: "En musmatta är kapad till en halvcirkel med radien {r} cm för att passa ett skrivbord. Kantsömmen går runt hela musmattan. Hur lång är sömmen? (Räkna med pi = 3,14)",
            en: "A mousepad is cut into a semicircle with a radius of {r} cm to fit a desk. The edge stitch runs around the entire mousepad. How long is the stitch? (Calculate using pi = 3.14)"
        },
        {
            sv: "En halvcirkelformad balkong har radien {r} meter. Ett räcke sätts upp längs den runda kanten och en list sätts längs den raka väggen. Vad är den totala omkretsen? (Räkna med pi = 3,14)",
            en: "A semicircular balcony has a radius of {r} meters. A railing is put up along the round edge and a trim is put along the straight wall. What is the total perimeter? (Calculate using pi = 3.14)"
        },
        {
            sv: "Du ritar en halvcirkel på marken med radien {r} meter. Du ska sedan gå exakt längs det kritade strecket hela varvet runt (inklusive basen). Hur långt går du? (Räkna med pi = 3,14)",
            en: "You draw a semicircle on the ground with a radius of {r} meters. You are then going to walk exactly along the chalked line the entire lap around (including the base). How far do you walk? (Calculate using pi = 3.14)"
        }
    ],

    // =========================================================================
    //   10. GEOM AREA QUARTER CIRCLE (Requires placeholders: {r})
    // =========================================================================
    geom_area_quarter: [
        {
            sv: "En hörnhylla har formen av en kvartscirkel med radien {r} cm. Hur stor träyta har hyllans ovansida? (Räkna med pi = 3,14)",
            en: "A corner shelf is shaped like a quarter circle with a radius of {r} cm. How large a wooden surface does the shelf's top have? (Calculate using pi = 3.14)"
        },
        {
            sv: "En musmatta anpassad för ett skrivbordshörn ser ut som en kvartscirkel med radien {r} cm. Vilken area har musmattan? (Räkna med pi = 3,14)",
            en: "A mousepad adapted for a desk corner looks like a quarter circle with a radius of {r} cm. What area does the mousepad have? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett scenbygge i ett hörn består av en plattform formad som en kvartscirkel med radien {r} meter. Hur många kvadratmeter golv har scenen? (Räkna med pi = 3,14)",
            en: "A corner stage setup consists of a platform shaped like a quarter circle with a radius of {r} meters. How many square meters of floor does the stage have? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett stycke tårta är uppskuret som en perfekt kvartscirkel med radien {r} cm. Hur stor är tårtbitens ovansida där glasyren ligger? (Räkna med pi = 3,14)",
            en: "A piece of cake is sliced as a perfect quarter circle with a radius of {r} cm. How large is the cake slice's top where the icing sits? (Calculate using pi = 3.14)"
        },
        {
            sv: "En radar på en skärm skannar en sektor som motsvarar exakt en kvartscirkel med radien {r} mm. Hur stor area skannas? (Räkna med pi = 3,14)",
            en: "A radar on a screen scans a sector corresponding to exactly a quarter circle with a radius of {r} mm. What area is scanned? (Calculate using pi = 3.14)"
        },
        {
            sv: "En bit tyg till en kjol är klippt som en kvartscirkel med radien {r} cm. Hur stor tygyta är detta? (Räkna med pi = 3,14)",
            en: "A piece of fabric for a skirt is cut as a quarter circle with a radius of {r} cm. How large a fabric surface is this? (Calculate using pi = 3.14)"
        },
        {
            sv: "I ett hörn av trädgården finns en rabatt formad som en kvartscirkel med radien {r} meter. Hur stor yta täcks av jord? (Räkna med pi = 3,14)",
            en: "In a corner of the garden there is a flowerbed shaped like a quarter circle with a radius of {r} meters. How large an area is covered by soil? (Calculate using pi = 3.14)"
        },
        {
            sv: "En fönsterruta sitter i ett hörn och har formen av en kvartscirkel med radien {r} cm. Beräkna glasets area. (Räkna med pi = 3,14)",
            en: "A windowpane sits in a corner and has the shape of a quarter circle with a radius of {r} cm. Calculate the glass's area. (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett duschgolv i ett hörn har formen av en kvartscirkel med radien {r} dm. Hur stor area täcker duschmattan? (Räkna med pi = 3,14)",
            en: "A corner shower floor has the shape of a quarter circle with a radius of {r} dm. What area does the shower mat cover? (Calculate using pi = 3.14)"
        },
        {
            sv: "En bit mosaik till ett konstverk är en kvartscirkel med radien {r} mm. Hur stor platt yta täcker mosaikbiten? (Räkna med pi = 3,14)",
            en: "A mosaic piece for an artwork is a quarter circle with a radius of {r} mm. How large a flat surface does the mosaic piece cover? (Calculate using pi = 3.14)"
        },
        {
            sv: "Du skär ut en bit vattenmelon som ser ut som en exakt kvartscirkel med radien {r} cm. Hur stor area har melonbitens flata röda sida? (Räkna med pi = 3,14)",
            en: "You cut out a piece of watermelon that looks like an exact quarter circle with a radius of {r} cm. What is the area of the melon slice's flat red side? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett fläktblad till en AC är format som en kvartscirkel med radien {r} cm. Vilken area har fläktbladets yta? (Räkna med pi = 3,14)",
            en: "A fan blade for an AC is shaped like a quarter circle with a radius of {r} cm. What area does the fan blade's surface have? (Calculate using pi = 3.14)"
        },
        {
            sv: "En logotyp är ritad på marken. En av sektionerna är en målad kvartscirkel med radien {r} cm. Hur stor yta utgör just denna sektion? (Räkna med pi = 3,14)",
            en: "A logo is drawn on the ground. One of the sections is a painted quarter circle with a radius of {r} cm. What area does this particular section make up? (Calculate using pi = 3.14)"
        },
        {
            sv: "En markis ovanför en dörr fälls ut som en kvartscirkel och har radien {r} dm. Hur stor skuggyta ovanifrån skapar tyget? (Räkna med pi = 3,14)",
            en: "An awning above a door folds out as a quarter circle and has a radius of {r} dm. How large a shadow surface from above does the fabric create? (Calculate using pi = 3.14)"
        },
        {
            sv: "En bit av ett runt pussel motsvarar exakt en kvartscirkel med radien {r} cm. Vilken area har denna pusselbit? (Räkna med pi = 3,14)",
            en: "A piece of a round puzzle corresponds exactly to a quarter circle with a radius of {r} cm. What area does this puzzle piece have? (Calculate using pi = 3.14)"
        }
    ],

    // =========================================================================
    //   11. GEOM PERIMETER QUARTER CIRCLE (Requires placeholders: {r})
    // =========================================================================
    geom_perimeter_quarter: [
        {
            sv: "Du fäster en skyddslist runt en hörnhylla formad som en kvartscirkel. Hyllans radie är {r} cm. Hur lång blir skyddslisten om den går runt hela hyllan (inklusive de två raka väggsidorna)? (Räkna med pi = 3,14)",
            en: "You attach a protective edge trim around a corner shelf shaped like a quarter circle. The shelf's radius is {r} cm. How long will the trim be if it goes around the entire shelf (including the two straight wall sides)? (Calculate using pi = 3.14)"
        },
        {
            sv: "En kvartscirkelformad musmatta för hörn har radien {r} cm. Sömmen går runt alla tre sidor av mattan. Vad blir sömmens totala längd? (Räkna med pi = 3,14)",
            en: "A quarter-circle corner mousepad has a radius of {r} cm. The stitch runs around all three sides of the pad. What will be the total length of the stitch? (Calculate using pi = 3.14)"
        },
        {
            sv: "En hörnscen är en kvartscirkel med radien {r} meter. Arrangörerna drar tejp längs hela scenens ytterkant (mot väggarna och den runda framsidan). Hur mycket tejp behövs? (Räkna med pi = 3,14)",
            en: "A corner stage is a quarter circle with a radius of {r} meters. Organizers run tape along the entire outer edge of the stage (against the walls and the round front). How much tape is needed? (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett staket byggs runt en rabatt i ett trädgårdshörn. Rabatten är formad som en kvartscirkel med radien {r} meter. Vilken blir den totala omkretsen för staketet? (Räkna med pi = 3,14)",
            en: "A fence is built around a flowerbed in a garden corner. The flowerbed is shaped like a quarter circle with a radius of {r} meters. What will be the total perimeter of the fence? (Calculate using pi = 3.14)"
        },
        {
            sv: "En bit glasklipp från ett fönster är en kvartscirkel med radien {r} cm. Man sätter en metalltejp runt alla tre glaskanter för säkerhet. Hur lång tejp går åt? (Räkna med pi = 3,14)",
            en: "A piece of glass cut from a window is a quarter circle with a radius of {r} cm. Metal tape is applied around all three glass edges for safety. How much tape is used? (Calculate using pi = 3.14)"
        },
        {
            sv: "En hörnduschmatta är formad som en kvartscirkel med radien {r} dm. Mattan har en gummilist som löper hela vägen runt omkretsen. Vad är gummilistens längd? (Räkna med pi = 3,14)",
            en: "A corner shower mat is shaped like a quarter circle with a radius of {r} dm. The mat has a rubber seal running all the way around the perimeter. What is the length of the rubber seal? (Calculate using pi = 3.14)"
        },
        {
            sv: "En LED-slinga klistras fast under en skrivbordsdel som utgör en kvartscirkel. Skivans radie är {r} cm. Hur lång blir LED-slingan om den täcker hela omkretsen? (Räkna med pi = 3,14)",
            en: "An LED strip is glued under a desk section forming a quarter circle. The board's radius is {r} cm. How long will the LED strip be if it covers the entire perimeter? (Calculate using pi = 3.14)"
        },
        {
            sv: "Du skär ut en fjärdedel av en tårta (kvartscirkel) med radien {r} cm. Om du mäter kanten runt hela denna tårtbit (de raka snitten plus den rundade baksidan), hur lång är den? (Räkna med pi = 3,14)",
            en: "You cut out a quarter of a cake (quarter circle) with a radius of {r} cm. If you measure the edge around this entire cake slice (the straight cuts plus the curved back), how long is it? (Calculate using pi = 3.14)"
        },
        {
            sv: "En stålram böjs och svetsas för att runda in en kvartscirkelformad lykta med radien {r} cm. Ramverket går längs hela formens ytterlinjer. Hur långt är stålramverket? (Räkna med pi = 3,14)",
            en: "A steel frame is bent and welded to enclose a quarter-circle shaped lantern with a radius of {r} cm. The framework runs along the entire outer lines of the shape. How long is the steel framework? (Calculate using pi = 3.14)"
        },
        {
            sv: "I en verkstad skärs ett papper ut som en kvartscirkel med radien {r} mm. Du drar ett streck med en penna runt papperets tre kanter. Hur långt är strecket totalt? (Räkna med pi = 3,14)",
            en: "In a workshop, paper is cut out as a quarter circle with a radius of {r} mm. You draw a line with a pen around the paper's three edges. How long is the line in total? (Calculate using pi = 3.14)"
        },
        {
            sv: "En trädgårdsplatta av sten formar en kvartscirkel med radien {r} dm. En dekorationsremsa läggs runt plattans hela omkrets. Hur lång är remsan? (Räkna med pi = 3,14)",
            en: "A garden stone paver forms a quarter circle with a radius of {r} dm. A decorative strip is laid around the paver's entire perimeter. How long is the strip? (Calculate using pi = 3.14)"
        },
        {
            sv: "En bit parkettgolv i ett hörn har formen av en kvartscirkel med radien {r} cm. Man fäster en tröskellist runt alla dess sidor. Hur många centimeter list behövs? (Räkna med pi = 3,14)",
            en: "A piece of parquet floor in a corner is shaped like a quarter circle with a radius of {r} cm. A threshold trim is attached around all its sides. How many centimeters of trim are needed? (Calculate using pi = 3.14)"
        },
        {
            sv: "I ett brädspel lägger du en bricka som är en kvartscirkel med radien {r} mm. En gränslinje går längs hela brickans ytterkant. Beräkna gränslinjens längd. (Räkna med pi = 3,14)",
            en: "In a board game, you place a tile that is a quarter circle with a radius of {r} mm. A border line runs along the tile's entire outer edge. Calculate the length of the border line. (Calculate using pi = 3.14)"
        },
        {
            sv: "Ett straffområde i ett påhittat spel utgör en kvartscirkel med radien {r} meter från målstolpen. En tjock linje ritas runt hela området. Vad blir linjens totala omkrets? (Räkna med pi = 3,14)",
            en: "A penalty area in an invented game forms a quarter circle with a radius of {r} meters from the goalpost. A thick line is drawn around the entire area. What will be the total perimeter of the line? (Calculate using pi = 3.14)"
        },
        {
            sv: "En flagga är skuren i form av en kvartscirkel med radien {r} cm. En förstärkningstråd är insydd i alla tre kanter på tyget. Vad är trådens totala längd? (Räkna med pi = 3,14)",
            en: "A flag is cut in the shape of a quarter circle with a radius of {r} cm. A reinforcing thread is sewn into all three edges of the fabric. What is the total length of the thread? (Calculate using pi = 3.14)"
        }
    ],

    // =========================================================================
    // 🎯 12. GEOM AREA HOUSE (Requires placeholders: {w}, {h}, {hr})
    // =========================================================================
    geom_area_house: [
        {
            sv: "En ritning av en logotyp till en app ser ut som ett hus. Den rektangulära basen är {w} mm bred och {h} mm hög, och den övre triangeln har höjden {hr} mm. Vad blir logotypens totala area?",
            en: "A logo drawing for an app looks like a house. The rectangular base is {w} mm wide and {h} mm high, and the upper triangle has a height of {hr} mm. What is the total area of the logo?"
        },
        {
            sv: "Framsidan på en fågelholk är utskuren som en hussiluett. Väggdelen utgörs av en rektangel med måtten {w}x{h} cm och taktriangeln har höjden {hr} cm. Hur stor är framsidans totala area?",
            en: "The front of a birdhouse is cut out like a house silhouette. The wall section consists of a rectangle measuring {w}x{h} cm and the roof triangle has a height of {hr} cm. What is the total area of the front?"
        },
        {
            sv: "Ett klistermärke till en dator har formen av ett hus. Basrektangeln har måtten {w}x{h} cm och den övre triangeln har höjden {hr} cm. Hur stor utgör klistermärkets area?",
            en: "A sticker for a laptop has the shape of a house. The base rectangle measures {w}x{h} cm and the upper triangle has a height of {hr} cm. What is the total area of the sticker?"
        },
        {
            sv: "En teckning föreställer ett hus. Det består av en rektangulär bas med bredden {w} cm och höjden {h} cm, samt ett tak med höjden {hr} cm. Vad blir hela husritningens area?",
            en: "A drawing depicts a house. It consists of a rectangular base with a width of {w} cm and a height of {h} cm, plus a roof with a height of {hr} cm. What is the area of the entire house drawing?"
        },
        {
            sv: "En bit kartong till ett bygge har klippts ut som en hussiluett. Rektangeln nertill är {w} cm bred och {h} cm hög. Takspetsen går upp ytterligare {hr} cm. Vad blir kartongbitens area?",
            en: "A piece of cardboard for a project has been cut out like a house silhouette. The rectangle at the bottom is {w} cm wide and {h} cm high. The roof apex goes up another {hr} cm. What is the area of the cardboard piece?"
        },
        {
            sv: "En kortsida på ett förråd mäter {w} meter i bredd och väggens höjd är {h} meter. Taknocken går upp {hr} meter ovanför sidoväggarna. Vad utgör kortsidans totala area?",
            en: "A short side of a storage shed measures {w} meters in width and the wall height is {h} meters. The roof ridge projects {hr} meters above the side walls. What is the total area of the short side?"
        },
        {
            sv: "Ett tryck på en tröja har formen av ett hus. Basen är {w} mm bred och {h} mm hög, och taktriangeln är {hr} mm hög. Beräkna tryckets totala area.",
            en: "A print on a shirt is shaped like a house. The base is {w} mm wide and {h} mm high, and the roof triangle is {hr} mm high. Calculate the total area of the print."
        },
        {
            sv: "Ett hundkojebygge har en sida utformad som en hussiluett med måtten {w}x{h} cm på rektangeln och {hr} cm i taktriandeln. Vad blir sidans totala area?",
            en: "A doghouse project has a side designed as a house silhouette with dimensions of {w}x{h} cm for the rectangle and {hr} cm for the roof triangle height. What is the total area of the side?"
        },
        {
            sv: "En bit reflextejp har skurits ut som ett hus till en ryggsäck. Väggdelen mäter {w}x{h} mm och takdelen har en vinkelrät höjd på {hr} mm. Hur stor area har reflextejpen?",
            en: "A piece of reflective tape has been cut out like a house for a backpack. The wall part measures {w}x{h} mm and the roof part has a perpendicular height of {hr} mm. What area does the tape have?"
        },
        {
            sv: "Ett klossbygge bildar en hussiluett. Basblocket är en rektangel med måtten {w}x{h} cm och takblocket är en triangel med höjden {hr} cm. Vad utgör siluettens sammanlagda area?",
            en: "A block structure forms a house silhouette. The base block is a rectangle measuring {w}x{h} cm and the roof block is a triangle with a height of {hr} cm. What is the combined area of the silhouette?"
        },
        {
            sv: "En bit vaxduk har klippts ut i form av ett hus till ett pyssel. Basen är {w} cm bred, väggen är {h} cm hög och takhöjden utgör {hr} cm. Vilken area har biten?",
            en: "A piece of oilcloth has been cut out in the shape of a house for a craft project. The base is {w} cm wide, the wall is {h} cm high, and the roof height makes up {hr} cm. What area does the piece have?"
        },
        {
            sv: "Ett radergummi har en platt framsida formad som ett hus. Basmåtten är {w} mm i bredd, {h} mm i höjd och taktriangeln mäter {hr} mm. Vad blir framsidans area?",
            en: "An eraser has a flat front side shaped like a house. The base measurements are {w} mm in width, {h} mm in height, and the roof triangle measures {hr} mm. What is the area of the front face?"
        },
        {
            sv: "Ett emblem på en keps har formen av en hussiluett. Basdelen utgörs av en rektangel på {w}x{h} mm och takdelen har höjden {hr} mm. Beräkna emblemets totala area.",
            en: "A patch on a cap is shaped like a house silhouette. The base part consists of a rectangle of {w}x{h} mm and the roof section has a height of {hr} mm. Calculate the total area of the patch."
        },
        {
            sv: "En bit plywood har sågats ut som en hussiluett till en ramp. Rektangeln nertill har måtten {w}x{h} cm och taket sträcker sig {hr} cm upp. Vilken area har plywoodskivan?",
            en: "A piece of plywood has been sawed out as a house silhouette for a ramp setup. The rectangle at the bottom measures {w}x{h} cm and the roof extends {hr} cm up. What area does the plywood sheet have?"
        },
        {
            sv: "En stencil för graffiti har skurits ut som ett hus. Väggdelen mäter {w}x{h} cm och taktriangelns höjd utgör {hr} cm. Vad blir stencilhålets totala area?",
            en: "A stencil for graffiti has been cut out like a house. The wall part measures {w}x{h} cm and the roof triangle height makes up {hr} cm. What is the total area of the stencil opening?"
        }
    ],
    // =========================================================================
    //   13. GEOM PERIMETER RECTANGLE/PARALLELOGRAM (Requires placeholders: {b}, {h})
    // =========================================================================
    geom_perimeter_rect: [
        { sv: "En rektangulär fotbollsplan mäter {b} meter i basen och {h} meter i höjd (kortsidan). Hur långt är det om man springer ett helt varv runt planen?", en: "A rectangular football pitch measures {b} meters at the base and {h} meters in height (short side). How far is it if you run one full lap around the pitch?" },
        { sv: "Du fäster en LED-ljusslinga runt ytterkanten på ditt rektangulära skrivbord. Skrivbordet är {b} cm brett och {h} cm djupt. Hur lång ljusslinga går åt?", en: "You attach an LED light strip around the outer edge of your rectangular desk. The desk is {b} cm wide and {h} cm deep. How much light strip is used?" },
        { sv: "En rektangulär tavelram har bredden {b} cm och höjden {h} cm. Hur lång är själva träramen som går runt hela tavlan?", en: "A rectangular picture frame has a width of {b} cm and a height of {h} cm. How long is the wooden frame itself that goes around the whole picture?" },
        { sv: "Ett staket ska byggas runt en rektangulär tomt. Tomtens bottenlinje är {b} meter och sidolinjen är {h} meter. Vad blir staketets totala längd?", en: "A fence is to be built around a rectangular plot. The plot's baseline is {b} meters and the sideline is {h} meters. What will be the total length of the fence?" },
        { sv: "En musmatta är {b} cm bred och {h} cm hög. Kanten är sydd med en färgstark tråd runt hela omkretsen. Hur lång är sömmen?", en: "A mousepad is {b} cm wide and {h} cm high. The edge is stitched with colorful thread around the entire perimeter. How long is the stitch?" },
        { sv: "Du sätter en gummilist runt en rektangulär surfplatta som är {b} mm bred och {h} mm hög. Hur lång gummilist behöver du?", en: "You put a rubber bumper around a rectangular tablet that is {b} mm wide and {h} mm high. How long of a rubber bumper do you need?" },
        { sv: "En dörr är {b} cm bred och {h} cm hög. En tätningslist ska sättas längs alla fyra ytterkanter. Beräkna listlängden.", en: "A door is {b} cm wide and {h} cm high. A weather strip is to be placed along all four outer edges. Calculate the strip length." },
        { sv: "Ett rektangulärt rum har väggarna {b} meter och {h} meter. Du ska sätta upp golvlister runt hela golvet. Hur många meter list går det åt?", en: "A rectangular room has walls of {b} meters and {h} meters. You are putting up baseboards around the entire floor. How many meters of baseboard are used?" },
        { sv: "Ett pappersark formad som ett parallellogram har den platta basen {b} mm och den sneda sidan {h} mm. Hur lång är papprets omkrets?", en: "A sheet of paper shaped like a parallelogram has a flat base of {b} mm and a slanted side of {h} mm. How long is the perimeter of the paper?" },
        { sv: "Du lägger metalltejp runt en rektangulär spegel med bredden {b} cm och höjden {h} cm. Hur mycket tejp behövs?", en: "You put metal tape around a rectangular mirror with a width of {b} cm and a height of {h} cm. How much tape is needed?" },
        { sv: "Kanten på ett rektangulärt bord med måtten {b} cm gånger {h} cm ska skyddas med skumgummi. Hur lång måste skumgummilisten vara?", en: "The edge of a rectangular table measuring {b} cm by {h} cm is to be protected with foam. How long must the foam strip be?" },
        { sv: "Ett rektangulärt fält mäter {b} meter i botten och {h} meter längs sidan. En traktor kör ett helt varv runt fältets gräns. Hur långt kör traktorn?", en: "A rectangular field measures {b} meters at the bottom and {h} meters along the side. A tractor drives one full lap around the field's boundary. How far does the tractor drive?" },
        { sv: "Ett tygmärke format som en rektangel är {b} mm brett och {h} mm högt. En vit tråd sys längs hela ytterkanten. Hur lång blir tråden?", en: "A fabric patch shaped like a rectangle is {b} mm wide and {h} mm high. A white thread is sewn along the entire outer edge. How long will the thread be?" },
        { sv: "En mobilskärm har bredden {b} mm och höjden {h} mm. Metallramen går runt hela skärmens kant. Hur lång är ramen?", en: "A phone screen has a width of {b} mm and a height of {h} mm. The metal frame goes around the entire edge of the screen. How long is the frame?" },
        { sv: "En rektangulär matta har längden {b} dm och bredden {h} dm. Det sitter fransar runt mattans alla fyra sidor. Vilken sträcka täcker fransarna?", en: "A rectangular rug has a length of {b} dm and a width of {h} dm. There are fringes around all four sides of the rug. What distance do the fringes cover?" }
    ],

    // =========================================================================
    //   14. GEOM PERIMETER TRIANGLE (Requires placeholders: {a}, {b}, {c})
    // =========================================================================
    geom_perimeter_triangle: [
        { sv: "En triangelformad rabatt har tre sidor som mäter {a} meter, {b} meter och {c} meter. Du bygger ett lågt staket runt hela rabatten. Hur långt blir staketet?", en: "A triangular flowerbed has three sides measuring {a} meters, {b} meters, and {c} meters. You build a low fence around the entire bed. How long will the fence be?" },
        { sv: "Ett triangelformat tygmärke har kantlängderna {a} mm, {b} mm och {c} mm. Du syr fast märket med en tråd längs ytterkanterna. Beräkna sömmens längd.", en: "A triangular fabric patch has edge lengths of {a} mm, {b} mm, and {c} mm. You sew the patch on with a thread along the outer edges. Calculate the length of the stitch." },
        { sv: "En cykelbana formar en triangel. Sträckorna är {a} km, {b} km och {c} km. Hur långt cyklar du om du tar ett helt varv?", en: "A bike path forms a triangle. The segments are {a} km, {b} km, and {c} km. How far do you cycle if you take one full lap?" },
        { sv: "En triangelformad skylt har sidorna {a} cm, {b} cm och {c} cm. En röd reflextejp fästs längs alla tre kanterna. Hur lång blir tejpen?", en: "A triangular sign has sides of {a} cm, {b} cm, and {c} cm. A red reflective tape is attached along all three edges. How long will the tape be?" },
        { sv: "Du tillverkar en ram i form av en triangel av tre trälister. Listerna mäter {a} cm, {b} cm och {c} cm. Hur mycket trälinjal går åt?", en: "You make a frame in the shape of a triangle from three wooden slats. The slats measure {a} cm, {b} cm, and {c} cm. How much wood is used?" },
        { sv: "En segelbåts segel är en triangel där kanterna mäter {a} meter, {b} meter och {c} meter. En förstärkningstråd sys längs hela ytterkanten. Hur lång är tråden?", en: "A sailboat's sail is a triangle where the edges measure {a} meters, {b} meters, and {c} meters. A reinforcing thread is sewn along the entire outer edge. How long is the thread?" },
        { sv: "En bit metalltråd böjs till en triangel med sidorna {a} cm, {b} cm och {c} cm. Hur lång var metalltråden innan den böjdes?", en: "A piece of metal wire is bent into a triangle with sides {a} cm, {b} cm, and {c} cm. How long was the metal wire before it was bent?" },
        { sv: "En triangelformad scen har sidorna {a} meter, {b} meter och {c} meter. Arrangörerna tejpar fast led-ljus runt hela scenens kant. Vad är omkretsen?", en: "A triangular stage has sides of {a} meters, {b} meters, and {c} meters. The organizers tape LED lights around the entire edge of the stage. What is the perimeter?" },
        { sv: "En park har en triangelformad gräsmatta. Gångstigarna runt gräsmattan är {a} m, {b} m och {c} m långa. Hur lång är promenaden runt parken?", en: "A park has a triangular lawn. The walkways around the lawn are {a} m, {b} m, and {c} m long. How long is the walk around the park?" },
        { sv: "En glasbit klipps i en triangelform med kanterna {a} cm, {b} cm och {c} cm. En metallist monteras för att skydda alla tre sidor. Hur lång är metallisten?", en: "A piece of glass is cut into a triangle shape with edges of {a} cm, {b} cm, and {c} cm. A metal strip is mounted to protect all three sides. How long is the metal strip?" },
        { sv: "Ett hörn av ett rum avgränsas med tre linjer som mäter {a} dm, {b} dm och {c} dm i form av en triangel. Vad är omkretsen?", en: "A corner of a room is bounded by three lines measuring {a} dm, {b} dm, and {c} dm forming a triangle. What is the perimeter?" },
        { sv: "En triangelformad skärbräda har ytterkanter på {a} cm, {b} cm och {c} cm. Hur långt är det runt hela skärbrädan?", en: "A triangular cutting board has outer edges of {a} cm, {b} cm, and {c} cm. How far is it around the entire cutting board?" },
        { sv: "En pappersbit klipps till en rätvinklig triangel. Sidorna är {a} mm, {b} mm och hypotenusan {c} mm. Vad blir omkretsen?", en: "A piece of paper is cut into a right-angled triangle. The sides are {a} mm, {b} mm, and the hypotenuse {c} mm. What is the perimeter?" },
        { sv: "Ett triangulärt område i ett spel markeras med en röd ram. De tre sidorna är {a} m, {b} m och {c} m. Hur lång är ramen totalt?", en: "A triangular zone in a game is highlighted with a red frame. The three sides are {a} m, {b} m, and {c} m. How long is the frame in total?" },
        { sv: "Ett tak i form av en triangel har ytterkanterna {a} meter, {b} meter och {c} meter. Du ska sätta upp en ljusslinga runt hela taket. Hur lång måste slingan vara?", en: "A roof in the shape of a triangle has outer edges of {a} meters, {b} meters, and {c} meters. You are putting up a light strip around the entire roof. How long must the strip be?" }
    ],

    // =========================================================================
    //   15. GEOM COMBINED RECTANGLE & TRIANGLE AREA (Requires placeholders: {rw}, {rh}, {tb})
    // =========================================================================
    geom_combined_rect_tri: [
        { sv: "En specialdesignad vägg består av en rektangel (bas {rw} m, höjd {rh} m) och en utskjutande triangel intill (bas {tb} m, med samma höjd {rh} m). Hur stor väggyta ska målas?", en: "A custom-designed wall consists of a rectangle (base {rw} m, height {rh} m) and an adjoining protruding triangle (base {tb} m, with the same height {rh} m). How large a wall surface is to be painted?" },
        { sv: "Ett torgsediment har formen av en rektangel på {rw}x{rh} meter, följt av en triangelformad spets med basen {tb} meter (höjd {rh} m). Beräkna byggets totala area.", en: "A plaza segment has the shape of a rectangle of {rw}x{rh} meters, followed by a triangular tip with a base of {tb} meters (height {rh} m). Calculate the build's total area." },
        { sv: "En tygflagga består av en rektangulär kropp (bredd {rw} cm, höjd {rh} cm) och en trekantig spets med basen {tb} cm och höjden {rh} cm. Vad är flaggans totala yta?", en: "A fabric flag consists of a rectangular body (width {rw} cm, height {rh} cm) and a triangular point with a base of {tb} cm and a height of {rh} cm. What is the flag's total surface area?" },
        { sv: "Ett rum har en rektangulär sektion ({rw}x{rh} m) och en intilliggande trekantig alkov (bas {tb} m, höjd {rh} m). Hur många kvadratmeter golv finns det totalt?", en: "A bedroom has a rectangular section ({rw}x{rh} m) and an adjoining triangular alcove (base {tb} m, height {rh} m). How many square meters of floor are there in total?" },
        { sv: "En bit metallplåt skärs ut som en rektangel ({rw}x{rh} mm) plus en triangel ({tb} mm i bas, {rh} mm hög) på sidan. Vilken area har metallbiten?", en: "A piece of sheet metal is cut out as a rectangle ({rw}x{rh} mm) plus a triangle ({tb} mm base, {rh} mm high) on the side. What area does the metal piece have?" },
        { sv: "En klisterdekal till en bil dörr är uppbyggd av en rektangel ({rw}x{rh} cm) som övergår i en rätvinklig triangel (bas {tb} cm). Vad är klistermärkets totala area?", en: "A decal for a car door is made up of a rectangle ({rw}x{rh} cm) that transitions into a right-angled triangle (base {tb} cm). What is the total area of the sticker?" },
        { sv: "En skatepark byggs med en rektangulär zon ({rw} m bred, {rh} m djup) och en triangelformad flygel (bas {tb} m, {rh} m djup). Hur stor yta asfalteras?", en: "A skatepark is built with a rectangular zone ({rw} m wide, {rh} m deep) and a triangular wing (base {tb} m, {rh} m deep). How large an area is paved?" },
        { sv: "Ett fönster har en rektangulär huvuddel ({rw}x{rh} cm) och ett snett triangulärt sidofönster (bas {tb} cm, höjd {rh} cm). Hur stor glasyta behövs totalt?", en: "A window has a rectangular main part ({rw}x{rh} cm) and a slanted triangular side window (base {tb} cm, height {rh} cm). How much glass area is needed in total?" },
        { sv: "En pusselbit består av en kvadratisk mittdel ({rw}x{rh} mm) och en triangelformad spets (bas {tb} mm, höjd {rh} mm). Vad är pusselbitens yta?", en: "A puzzle piece consists of a rectangular middle ({rw}x{rh} mm) and a triangular tip (base {tb} mm, height {rh} mm). What is the area of the puzzle piece?" },
        { sv: "En brygga utgörs av en rektangulär huvudbrygga ({rw}x{rh} m) och en spetsig förtöjningsdel (triangel med bas {tb} m). Beräkna den totala träytan.", en: "A dock is made up of a rectangular main pier ({rw}x{rh} m) and a pointed mooring section (triangle with base {tb} m). Calculate the total wooden surface area." },
        { sv: "En scen är formad som en rektangel ({rw}x{rh} m) med ett triangelformat sidobord (bas {tb} m). Hur stor blir ytan som artisterna kan stå på?", en: "A stage is shaped like a rectangle ({rw}x{rh} m) with a triangular side extension (base {tb} m). How large will the surface be that the artists can stand on?" },
        { sv: "En logotyp har en rektangulär kropp ({rw}x{rh} cm) följt av en triangel ({tb} cm bas, {rh} cm höjd). Vad är logotypens totala area?", en: "A logo has a rectangular body ({rw}x{rh} cm) followed by a triangle ({tb} cm base, {rh} cm height). What is the logo's total area?" },
        { sv: "Ett område på en dataskärm markerar en zon med en rektangel ({rw}x{rh} px) och en rätvinklig triangel (bas {tb} px, höjd {rh} px). Hur stor pixelarea täcks?", en: "An area on a monitor highlights a zone using a rectangle ({rw}x{rh} px) and a right triangle (base {tb} px, height {rh} px). How large a pixel area is covered?" },
        { sv: "En gräsmatta klipps i två delar: en rektangel ({rw}x{rh} m) och en triangel (bas {tb} m, höjd {rh} m). Hur stor yta klipps sammanlagt?", en: "A lawn is mowed in two parts: a rectangle ({rw}x{rh} m) and a triangle (base {tb} m, height {rh} m). How large a surface is mowed altogether?" },
        { sv: "Ett klädesplagg mönstras med en geometrisk figur bestående av en rektangel ({rw}x{rh} mm) och en anslutande triangel (bas {tb} mm). Vad blir figurens area?", en: "A garment is patterned with a geometric figure consisting of a rectangle ({rw}x{rh} mm) and an adjoining triangle (base {tb} mm). What will the figure's area be?" }
    ],

    // =========================================================================
    //   16. GEOM PERIMETER HOUSE (Requires placeholders: {rw}, {rh}, {roof_slant})
    // =========================================================================
    geom_perimeter_house: [
        { sv: "Ett bygge är format som en hussiluett. Botten är {rw} meter bred, väggarna är {rh} meter höga och de två taksidorna mäter {roof_slant} meter var. Vad blir den totala yttre omkretsen?", en: "A build is shaped like a house silhouette. The bottom is {rw} meters wide, the walls are {rh} meters high, and the two roof sides measure {roof_slant} meters each. What is the total outer perimeter?" },
        { sv: "Ett klistermärke ser ut som ett hus. Basen är {rw} cm, de två väggarna {rh} cm och takkanterna är {roof_slant} cm långa. En vit linje går längs ytterkanten. Hur lång är linjen?", en: "A sticker looks like a house. The base is {rw} cm, the two walls {rh} cm, and the roof edges are {roof_slant} cm long. A white line runs along the outer edge. How long is the line?" },
        { sv: "En fågelholk har en hussiluett på framsidan. Basen mäter {rw} cm, väggarna {rh} cm och taklisterna mäter {roof_slant} cm styck. Vad är omkretsen på fågelholkens framsida?", en: "A birdhouse has a house silhouette on the front. The base measures {rw} cm, the walls {rh} cm, and the roof trims measure {roof_slant} cm each. What is the perimeter of the birdhouse's front?" },
        { sv: "En LED-slinga fästs runt en väggdekoration formad som ett hus. Marklinjen är {rw} dm, de två sidoväggarna är {rh} dm, och taklinjerna {roof_slant} dm var. Hur lång LED-slinga behövs?", en: "An LED strip is attached around a wall decoration shaped like a house. The ground line is {rw} dm, the two side walls are {rh} dm, and the roof lines {roof_slant} dm each. How much LED strip is needed?" },
        { sv: "En hundkoja har bottenbredden {rw} cm, vägghöjden {rh} cm och två taksidor som mäter {roof_slant} cm var. Om du ska sätta en tätningslist längs ytterkanten, hur lång list krävs?", en: "A doghouse has a bottom width of {rw} cm, wall height of {rh} cm, and two roof sides measuring {roof_slant} cm each. If you are to put a weather strip along the outer edge, how long of a strip is required?" },
        { sv: "Ett tryck på en väska är ett hus. Marksträckan är {rw} mm, stående väggar är {rh} mm och taksträckorna {roof_slant} mm. En söm går runt tryckets ytterkant. Hur lång är sömmen?", en: "A print on a bag is a house. The ground stretch is {rw} mm, standing walls are {rh} mm, and roof stretches {roof_slant} mm. A seam goes around the print's outer edge. How long is the seam?" },
        { sv: "En ritning av ett litet förråd visar basen {rw} m, sidoväggarna {rh} m och två sluttande taklinjer på {roof_slant} m. Vilken omkrets har förrådet på ritningen?", en: "A drawing of a small shed shows the base {rw} m, side walls {rh} m, and two sloping roof lines of {roof_slant} m. What perimeter does the shed have on the drawing?" },
        { sv: "Ett papphus byggs till en modellstad. Botten är {rw} cm, väggarna {rh} cm och takhalvorna {roof_slant} cm långa. Du målar en kantlinje runt husets yttre form. Hur lång blir den?", en: "A cardboard house is built for a model city. The bottom is {rw} cm, walls {rh} cm, and roof halves {roof_slant} cm long. You paint a border line around the house's outer shape. How long will it be?" },
        { sv: "En utskuren träbit har husform. Basen mäter {rw} cm, de två väggarna {rh} cm och taksidorna {roof_slant} cm. Beräkna den totala omkretsen runt träbiten.", en: "A cut-out wooden piece has a house shape. The base measures {rw} cm, the two walls {rh} cm, and the roof sides {roof_slant} cm. Calculate the total perimeter around the wooden piece." },
        { sv: "I ett plattformsspel är ett hus ritat med basen {rw} pixlar, väggar på {rh} pixlar och taksidor på {roof_slant} pixlar. Spelaren går ett varv runt husets ytterkant. Vad är sträckan?", en: "In a platformer game, a house is drawn with a base of {rw} pixels, walls of {rh} pixels, and roof sides of {roof_slant} pixels. The player walks a lap around the house's outer edge. What is the distance?" },
        { sv: "En husformad skylt har basen {rw} dm, väggarna {rh} dm och taklutningarna {roof_slant} dm. En kantlist fästs runt om hela skylten. Hur lång är listen?", en: "A house-shaped sign has a base of {rw} dm, walls of {rh} dm, and roof slopes of {roof_slant} dm. An edge trim is attached around the entire sign. How long is the trim?" },
        { sv: "Du bygger en sänggavel som ser ut som ett hus. Bottenbredden är {rw} cm, höjden på sidorna är {rh} cm och takets sneda kanter är {roof_slant} cm. Vad är sänggavelns yttre omkrets?", en: "You build a headboard that looks like a house. The bottom width is {rw} cm, the height of the sides is {rh} cm, and the roof's slanted edges are {roof_slant} cm. What is the headboard's outer perimeter?" },
        { sv: "Ett tält har en husliknande profil: {rw} meter bred botten, {rh} meter höga väggar och ett tak med {roof_slant} meters sidor. En förstärkt söm går längs hela ytterkanten. Hur lång är sömmen?", en: "A tent has a house-like profile: {rw} meter wide bottom, {rh} meter high walls, and a roof with {roof_slant} meter sides. A reinforced seam runs along the entire outer edge. How long is the seam?" },
        { sv: "Ett radergummi är format som ett hus. Basen är {rw} mm, väggarna {rh} mm och taksidorna är {roof_slant} mm. Vad är omkretsen runt radergummit?", en: "An eraser is shaped like a house. The base is {rw} mm, the walls {rh} mm, and the roof sides are {roof_slant} mm. What is the perimeter around the eraser?" },
        { sv: "En bit reflexväst är skuren i form av ett hus. Baslinjen mäter {rw} cm, väggarna {rh} cm och taket {roof_slant} cm per sida. Hur långt är det runt hela reflexbiten?", en: "A piece of reflective vest is cut in the shape of a house. The baseline measures {rw} cm, the walls {rh} cm, and the roof {roof_slant} cm per side. How far is it around the entire reflective piece?" }
    ],

    // =========================================================================
    //   17. GEOM AREA PORTAL (Requires placeholders: {rw}, {rh})
    // =========================================================================
    geom_area_portal: [
        { sv: "Ett fönster är format som en portal: en rektangel nertill ({rw} cm bred, {rh} cm hög) med en halvcirkel på toppen. Vad är den totala glasytan? (Räkna med pi = 3,14)", en: "A window is shaped like a portal: a rectangle at the bottom ({rw} cm wide, {rh} cm high) with a semicircle on top. What is the total glass area? (Calculate using pi = 3.14)" },
        { sv: "En trädgårdsvalvbåge täcks av ett portaltformat nät. Den rektangulära basen mäter {rw}x{rh} meter. På toppen sitter en halvcirkel. Vilken yta täcker nätet totalt?", en: "A garden arch is covered by a portal-shaped net. The rectangular base measures {rw}x{rh} meters. On top sits a semicircle. What area does the net cover in total?" },
        { sv: "En dörr är formad som en portal med en {rw} cm bred och {rh} cm hög rektangulär nederdel och en halvrund överdel. Hur stor yta ska målas på dörren?", en: "A door is shaped like a portal with a {rw} cm wide and {rh} cm high rectangular lower part and a half-round upper part. How large an area is to be painted on the door?" },
        { sv: "Ett datorspel har en spegelportal. Den undre delen är en rektangel på {rw}x{rh} pixlar och den övre delen är en perfekt halvcirkel. Vad blir portalens totala area?", en: "A computer game has a mirror portal. The lower part is a rectangle of {rw}x{rh} pixels and the upper part is a perfect semicircle. What will be the portal's total area?" },
        { sv: "En skylt är portalformad. Rektangeln är {rw} cm bred och {rh} cm hög, avslutad med en halvcirkel på toppen. Vilken yta har framsidan på skylten?", en: "A sign is portal-shaped. The rectangle is {rw} cm wide and {rh} cm high, topped off with a semicircle. What area does the front of the sign have?" },
        { sv: "Ett tryck på en tröja visar en arkadmaskin. Skärmen bildar en portal: {rw} mm i bredd, {rh} mm i stående höjd och sen en halvcirkel på toppen. Beräkna ytan.", en: "A print on a shirt shows an arcade machine. The screen forms a portal: {rw} mm in width, {rh} mm in standing height, and then a semicircle on top. Calculate the area." },
        { sv: "En bit metallskiva har klippts ut som en portal. Den är {rw} mm bred i basen, {rh} mm hög på raka sidorna, plus en halvcirkel upptill. Vilken yta har metallbiten?", en: "A piece of sheet metal has been cut out as a portal. It is {rw} mm wide at the base, {rh} mm high on the straight sides, plus a semicircle on top. What area does the metal piece have?" },
        { sv: "En rundad spegel är en rektangel ({rw}x{rh} cm) i botten och slutar i en halvcirkel på toppen. Hur många kvadratcentimeter spegelglas har använts totalt?", en: "A rounded mirror is a rectangle ({rw}x{rh} cm) at the bottom and ends in a semicircle on top. How many square centimeters of mirror glass have been used in total?" },
        { sv: "En dörrmatta är gjord som en portal för att passa i en hall. Rektangeln är {rw} cm bred och {rh} cm djup, med en runda på toppen. Hur stor golvyta täcks?", en: "A doormat is made as a portal to fit in a hallway. The rectangle is {rw} cm wide and {rh} cm deep, with a curve on top. How much floor area is covered?" },
        { sv: "En bricka i ett spel är formad som en gravsten (portal). Basen är {rw} mm, de raka väggarna {rh} mm och på toppen en halvcirkel. Vad är brickans area?", en: "A token in a game is shaped like a tombstone (portal). The base is {rw} mm, the straight walls {rh} mm, and on top a semicircle. What is the token's area?" },
        { sv: "Ett tunnel-ingång är portalformad. Rektangeldelen är {rw} meter bred och {rh} meter hög, följt av ett halvcirkelformat valv. Vad är den totala arean på öppningen?", en: "A tunnel entrance is portal-shaped. The rectangle part is {rw} meters wide and {rh} meters high, followed by a semicircular arch. What is the total area of the opening?" },
        { sv: "Du bygger ett fotobås med portalform. Träbotten är {rw} cm bred och {rh} cm hög, medan toppen är en halvcirkel. Hur stor yta tar bakgrunden upp?", en: "You build a photo booth with a portal shape. The wooden bottom is {rw} cm wide and {rh} cm high, while the top is a semicircle. How large an area does the background take up?" },
        { sv: "En uppblåsbar hoppborg har en ingång i form av en portal. Basmåtten är {rw}x{rh} cm plus en halvcirkel på toppen. Vilken area har ingången?", en: "An inflatable bouncy castle has an entrance in the shape of a portal. The base measurements are {rw}x{rh} cm plus a semicircle on top. What area does the entrance have?" },
        { sv: "Ett konstverk består av en duk formad som en portal. Den nedre rutan mäter {rw} cm i bredd och {rh} cm i höjd, och toppen är rundad i en halvcirkel. Vad är konstverkets yta?", en: "An artwork consists of a canvas shaped like a portal. The lower square measures {rw} cm in width and {rh} cm in height, and the top is rounded into a semicircle. What is the surface area of the artwork?" },
        { sv: "I ett designprogram ritar du en form som är en {rw}x{rh} mm rektangel krönt med en halvcirkel. Hur många kvadratmillimeter är hela formen?", en: "In a design program, you draw a shape that is a {rw}x{rh} mm rectangle crowned with a semicircle. How many square millimeters is the entire shape?" }
    ],

    // =========================================================================
    //   18. GEOM PERIMETER PORTAL (Requires placeholders: {rw}, {rh}, {arcLength})
    // =========================================================================
    geom_perimeter_portal: [
        { sv: "En fönsterram går runt ett portalformat fönster. Fönstret har bredden {rw} cm, de raka sidoväggarna är {rh} cm, och den övre runda halvcirkeln mäter {arcLength} cm. Hur lång blir hela fönsterramen?", en: "A window frame goes around a portal-shaped window. The window has a width of {rw} cm, the straight side walls are {rh} cm, and the upper round semicircle measures {arcLength} cm. How long will the entire window frame be?" },
        { sv: "En portal i en trädgård är gjord av metallrör. Bottenbredden är {rw} meter, de två sidostolparna är {rh} meter, och valvbågen upptill är {arcLength} meter. Vilken längd har hela metallröret?", en: "A portal in a garden is made of metal piping. The bottom width is {rw} meters, the two side posts are {rh} meters, and the arch on top is {arcLength} meters. What is the length of the entire metal pipe?" },
        { sv: "Du lägger in en gummilist runt hela ytterkanten på en portalformad dörr. Basen är {rw} cm, höjden på sidorna är {rh} cm, och den rundade överdelen är {arcLength} cm. Beräkna gummilistens totala längd.", en: "You install a rubber seal around the entire outer edge of a portal-shaped door. The base is {rw} cm, the height of the sides is {rh} cm, and the rounded top part is {arcLength} cm. Calculate the total length of the rubber seal." },
        { sv: "Ett spegelglas formas som en portal med basen {rw} mm, de raka höjderna {rh} mm, och bågen {arcLength} mm. Hur lång är listen som monteras runt hela kanten?", en: "A mirror glass is shaped like a portal with the base {rw} mm, the straight heights {rh} mm, and the arc {arcLength} mm. How long is the trim mounted around the entire edge?" },
        { sv: "En LED-ljusslinga klistras fast runt ett portalformat skrivbordstillbehör. Botten mäter {rw} cm, sidorna {rh} cm och den runda ovansidan {arcLength} cm. Vad är omkretsen?", en: "An LED light strip is glued around a portal-shaped desk accessory. The bottom measures {rw} cm, the sides {rh} cm, and the round top {arcLength} cm. What is the perimeter?" },
        { sv: "En tygpatch till en jacka har portalform: botten är {rw} mm, sidorna {rh} mm och halvcirkeln {arcLength} mm. En stygnkant går runt hela märket. Hur lång är sömmen?", en: "A fabric patch for a jacket has a portal shape: bottom is {rw} mm, sides {rh} mm, and the semicircle {arcLength} mm. A stitched edge goes around the entire patch. How long is the seam?" },
        { sv: "En tunnelformad leksak av plast har en markbas på {rw} dm, raka sidor på {rh} dm och ett välvt tak på {arcLength} dm. Hur långt är det runt tunnelns ytterkant?", en: "A tunnel-shaped plastic toy has a ground base of {rw} dm, straight sides of {rh} dm, and a vaulted roof of {arcLength} dm. How far is it around the tunnel's outer edge?" },
        { sv: "En skylt är portalformad. Rektangeldelens kortsida är {rw} cm, sidoväggarna är {rh} cm, och bågen på toppen är {arcLength} cm. Kantbandet löper runt hela skylten. Vad är omkretsen?", en: "A sign is portal-shaped. The rectangle's short side is {rw} cm, the side walls are {rh} cm, and the arc on top is {arcLength} cm. The edge banding runs around the entire sign. What is the perimeter?" },
        { sv: "Ett spelkort har formen av en gravsten. Bottenbredden är {rw} mm, sidorna är {rh} mm höga, och den rundade överkanten är {arcLength} mm. Vad är kortets totala omkrets?", en: "A playing card is shaped like a tombstone. The bottom width is {rw} mm, the sides are {rh} mm high, and the rounded top edge is {arcLength} mm. What is the card's total perimeter?" },
        { sv: "En rundad ugn har en portalöppning. Golvbasen mäter {rw} cm, de raka sidoväggarna är {rh} cm och ugnsvalvet är {arcLength} cm. Muraren sätter tegelstenar runt kanten. Vilken längd har kanten?", en: "A rounded oven has a portal opening. The floor base measures {rw} cm, the straight side walls are {rh} cm, and the oven vault is {arcLength} cm. The mason puts bricks around the edge. What length does the edge have?" },
        { sv: "Du skär ut en portal i en träskiva. Baslinjen är {rw} dm, de stående linjerna är {rh} dm och den halvrunda bågen är {arcLength} dm. Hur lång sågning krävs för att följa hela ytterkanten?", en: "You cut out a portal in a wooden board. The baseline is {rw} dm, the standing lines are {rh} dm, and the half-round arc is {arcLength} dm. How long of a cut is required to follow the entire outer edge?" },
        { sv: "En hundkoja har en portalformad dörröppning. Tröskeln mäter {rw} cm, sidoväggarna är {rh} cm, och det rundade överstycket är {arcLength} cm. Vad är öppningens totala omkrets?", en: "A doghouse has a portal-shaped door opening. The threshold measures {rw} cm, the side walls are {rh} cm, and the rounded top section is {arcLength} cm. What is the opening's total perimeter?" },
        { sv: "En sköld i ett fantasyspel ser ut som en portal. Den nedre kanten är {rw} px, höjderna {rh} px och valvbågen är {arcLength} px lång. En gyllene glöd går runt kanten. Hur långt är det runt?", en: "A shield in a fantasy game looks like a portal. The lower edge is {rw} px, the heights {rh} px, and the arch is {arcLength} px long. A golden glow goes around the edge. How far is it around?" },
        { sv: "En portalformad reflex klistras på en cykel. Botten mäter {rw} mm, kanterna {rh} mm och halvcirkeln upptill mäter {arcLength} mm. Hur lång är reflexens ytterlinje?", en: "A portal-shaped reflector is glued to a bike. The bottom measures {rw} mm, the edges {rh} mm, and the semicircle on top measures {arcLength} mm. How long is the reflector's outer line?" },
        { sv: "Ett chokladgodis har en portalformad kontur. Botten är {rw} mm, höjderna är {rh} mm, och kupolen upptill är {arcLength} mm. Vad är omkretsen på godisbiten?", en: "A chocolate candy has a portal-shaped outline. The bottom is {rw} mm, the heights are {rh} mm, and the dome on top is {arcLength} mm. What is the perimeter of the candy piece?" }
    ]
};