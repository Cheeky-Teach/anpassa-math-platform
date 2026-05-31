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
    // 🎯 7. GEOM AREA HOUSE (Requires placeholders: {w}, {h}, {hr})
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
    ]
};