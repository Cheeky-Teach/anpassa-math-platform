import { StoryScenario } from '../WordProblemInterceptor.js';

export const GEOMETRY_STORIES: Record<string, StoryScenario[]> = {
    geom_perimeter_square: [
        {
            sv: "En kvadratisk innergård ska ramas in med en ljusslinga längs hela ytterkanten. En av innergårdens sidor mäter {s} meter. Hur många meter ljusslinga behövs?",
            en: "A square courtyard is to be framed with a string of lights along its entire outer edge. One side of the courtyard measures {s} meters. How many meters of lights are needed?"
        },
        {
            sv: "Ett kvadratiskt grönsaksland har sidlängden {s} meter. Du ska sätta upp ett skyddsnät runt hela landet. Hur långt stängsel går det åt?",
            en: "A square vegetable patch has a side length of {s} meters. You need to put a protective fence around the entire patch. How much fencing is required?"
        },
        {
            sv: "En kvadratisk hage ska hägnas in med rep. Om hagens sida är {s} meter, hur långt rep behövs för att nå exakt ett varv runt hagen?",
            en: "A square paddock is to be enclosed with rope. If the side of the paddock is {s} meters, how much rope is needed to go exactly once around it?"
        },
        {
            sv: "En kvadratisk altan har sidans längd {s} meter. Snickaren ska montera en kantlist runt hela altanen. Hur många meter list behöver han såga till?",
            en: "A square deck has a side length of {s} meters. The carpenter needs to install an edge trim around the entire deck. How many meters of trim does he need to cut?"
        },
        {
            sv: "Ett torg har formen av en perfekt kvadrat där varje sida mäter {s} meter. En sopmaskin kör ett helt varv längs torgets ytterkanter. Hur långt kör maskinen?",
            en: "A town square is shaped like a perfect square where each side measures {s} meters. A street sweeper drives one full lap along the outer edges of the square. How far does it drive?"
        },
        {
            sv: "En kvadratisk hoppmatta på en lekplats har sidlängden {s} meter. Det finns en säkerhetskant runt hela mattan. Vad är omkretsen på denna säkerhetskant?",
            en: "A square jumping mat at a playground has a side length of {s} meters. There is a safety border around the entire mat. What is the perimeter of this safety border?"
        },
        {
            sv: "En tavla är helt kvadratisk och ramen har sidlängden {s} cm. Hur lång blir den sammanlagda träramen runt hela tavlan?",
            en: "A painting is perfectly square and the frame has a side length of {s} cm. What is the total length of the wooden frame around the entire painting?"
        },
        {
            sv: "Ett kvadratiskt klinkergolv har en sidlängd på {s} meter. Du ska lägga en silikonfog längs alla fyra väggkanter. Hur lång blir fogen totalt?",
            en: "A square tiled floor has a side length of {s} meters. You are going to apply a silicone seal along all four wall edges. How long will the seal be in total?"
        },
        {
            sv: "Ett arkitektritat kontorsrum är kvadratiskt med vägglängden {s} meter. Golvläggaren ska montera golvlister runt hela rummet (bortse från dörröppningar). Hur många meter list går åt?",
            en: "An architect-designed office room is square with a wall length of {s} meters. The floor layer is installing baseboards around the entire room (ignore doorways). How many meters of baseboards are used?"
        },
        {
            sv: "En kvadratisk glasskiva till ett växthustak har sidlängden {s} cm. Man sätter en gummipackning runt glasets alla ytterkanter. Hur lång packning behövs per glasskiva?",
            en: "A square glass pane for a greenhouse roof has a side length of {s} cm. A rubber gasket is placed around all outer edges of the glass. How long a gasket is needed per glass pane?"
        }
    ],

    geom_perimeter_inverse: [
        {
            sv: "En rektangulär blomrabatt har den totala omkretsen {p} meter. Rabattens korta bas mäter {b} meter. Hur lång är rabattens höjd?",
            en: "A rectangular flowerbed has a total perimeter of {p} meters. The short base of the bed measures {b} meters. How long is the height of the bed?"
        },
        {
            sv: "Du har {p} meter stängsel för att hägna in en rektangulär rastgård för hundar. Du vet att kortsidan (basen) måste vara {b} meter lång. Hur lång blir långsidan (höjden)?",
            en: "You have {p} meters of fencing to enclose a rectangular dog run. You know the short side (base) must be {b} meters long. How long will the long side (height) be?"
        },
        {
            sv: "Ett rektangulärt rum har omkretsen {p} meter. Om rummets bredd är {b} meter, vad är då rummets längd?",
            en: "A rectangular room has a perimeter of {p} meters. If the width of the room is {b} meters, what is the length of the room?"
        },
        {
            sv: "En spånskiva har omkretsen {p} cm. Snickaren mäter upp basen till {b} cm. Hur många centimeter är skivans höjd?",
            en: "A particle board has a perimeter of {p} cm. The carpenter measures the base to be {b} cm. How many centimeters is the height of the board?"
        },
        {
            sv: "Ett rektangulärt trädgårdsland ska kantas med timmerstockar som mäter totalt {p} meter. Om kortsidan är {b} meter, hur lång blir då långsidan?",
            en: "A rectangular vegetable plot is to be edged with logs measuring a total of {p} meters. If the short side is {b} meters, how long will the long side be?"
        },
        {
            sv: "Ramen runt en rektangulär spegel har den totala längden {p} cm. Om spegelns bredd mäter {b} cm, hur hög är spegeln?",
            en: "The frame around a rectangular mirror has a total length of {p} cm. If the width of the mirror measures {b} cm, how tall is the mirror?"
        },
        {
            sv: "En fotbollsplan för knattar har en omkrets på {p} meter. Om planens kortsida är ritad till {b} meter, hur lång är då långsidan?",
            en: "A youth football pitch has a perimeter of {p} meters. If the short side of the pitch is drawn to {b} meters, how long is the long side?"
        },
        {
            sv: "En rektangulär poolanläggning ska spärras av med ett {p} meter långt rep. Om anläggningens bredd är {b} meter, hur lång är dess sträckning åt andra hållet?",
            en: "A rectangular pool area is to be cordoned off with a {p}-meter-long rope. If the width of the area is {b} meters, how long is its stretch in the other direction?"
        },
        {
            sv: "Ett rektangulärt parkeringsområde har en total omkrets på {p} meter. Om infartsbredden (basen) är {b} meter, hur djupt är parkeringsområdet (höjden)?",
            en: "A rectangular parking zone has a total perimeter of {p} meters. If the entrance width (base) is {b} meters, how deep is the parking zone (height)?"
        },
        {
            sv: "En bit mark har formen av en parallellogram med omkretsen {p} meter. Den ena kända kortsidan mäter {b} meter. Hur lång är den lutande långsidan?",
            en: "A plot of land is shaped like a parallelogram with a perimeter of {p} meters. One known short side measures {b} meters. How long is the slanted long side?"
        }
    ],

    geom_area_quad: [
        {
            sv: "Ett rektangulärt golv har basen {b} meter och höjden {h} meter. Golvläggaren ska lägga in en ny matta. Hur många kvadratmeter matta behöver beställas?",
            en: "A rectangular floor has a base of {b} meters and a height of {h} meters. The floor layer is putting down a new carpet. How many square meters of carpet need to be ordered?"
        },
        {
            sv: "En garageuppfart har formen av en parallellogram med basen {b} meter och den vinkelräta höjden {h} meter. Hur stor yta ska plattsättas?",
            en: "A driveway is shaped like a parallelogram with a base of {b} meters and a perpendicular height of {h} meters. How large an area is to be paved?"
        },
        {
            sv: "En rektangulär gräsmatta har bredden {b} meter och längden {h} meter. Hur stor yta täcker gräsmattan totalt?",
            en: "A rectangular lawn has a width of {b} meters and a length of {h} meters. How large an area does the lawn cover in total?"
        },
        {
            sv: "En husvägg som mäter {b} meter i basen och {h} meter i höjd ska målas om. Hur stor är väggytan som ska täckas med färg?",
            en: "A house wall measuring {b} meters at the base and {h} meters in height is to be repainted. How large is the wall surface to be covered with paint?"
        },
        {
            sv: "Ett rektangulärt segel har måtten {b} meter i underkant och en höjd på {h} meter. Hur stor är segeldukens totala area?",
            en: "A rectangular sail has measurements of {b} meters at the bottom and a height of {h} meters. What is the total area of the sail canvas?"
        },
        {
            sv: "En köksbänk i granit har längden {b} cm och djupet {h} cm. Hur stor är arbetsytans area på köksbänken?",
            en: "A granite kitchen countertop has a length of {b} cm and a depth of {h} cm. What is the surface area of the countertop workspace?"
        },
        {
            sv: "En reklamskylt har basen {b} meter och höjden {h} meter. Företaget debiteras baserat på skyltens area. Hur stor yta upptar skylten?",
            en: "A billboard has a base of {b} meters and a height of {h} meters. The company is billed based on the billboard's area. How much surface area does the sign occupy?"
        },
        {
            sv: "Ett rektangulärt fönster är {b} cm brett och {h} cm högt. Hur stor glasyta har fönstret?",
            en: "A rectangular window is {b} cm wide and {h} cm high. How much glass surface area does the window have?"
        },
        {
            sv: "En rektangulär solpanel har måtten {b} cm gånger {h} cm. Hur stor aktiv yta har panelen för att samla upp solljus?",
            en: "A rectangular solar panel measures {b} cm by {h} cm. How large is the panel's active surface area for collecting sunlight?"
        },
        {
            sv: "Ett fält har formen av en parallellogram med en baslinje på {b} meter och ett vinkelrätt djup på {h} meter. Hur stor är fältets totala odlingsyta?",
            en: "A field is shaped like a parallelogram with a baseline of {b} meters and a perpendicular depth of {h} meters. What is the total cultivation area of the field?"
        }
    ],

    geom_area_triangle: [
        {
            sv: "En triangelformad gavel på ett hustak har basen {base} meter och höjden {height} meter. Hur stor är gavelns area?",
            en: "A triangular gable on a house roof has a base of {base} meters and a height of {height} meters. What is the area of the gable?"
        },
        {
            sv: "Ett trädgårdsland är byggt som en rätvinklig triangel där basen mäter {base} meter och höjden är {height} meter. Hur stor odlingsyta ger detta?",
            en: "A garden plot is built as a right-angled triangle where the base measures {base} meters and the height is {height} meters. How much cultivation area does this provide?"
        },
        {
            sv: "En bit segelduk har skurits ut som en triangel med basen {base} meter och höjden {height} meter. Beräkna dukens area.",
            en: "A piece of sailcloth has been cut into a triangle with a base of {base} meters and a height of {height} meters. Calculate the area of the cloth."
        },
        {
            sv: "En triangelformad varningsskylt har en bas på {base} cm och en höjd på {height} cm. Hur stor är skyltens främre yta?",
            en: "A triangular warning sign has a base of {base} cm and a height of {height} cm. How large is the front surface area of the sign?"
        },
        {
            sv: "Ett hörn i en park ska planteras med gräs och bildar en triangel med baslinjen {base} meter och höjden {height} meter. Hur stor area ska sås med gräsfrön?",
            en: "A corner in a park is to be planted with grass, forming a triangle with a baseline of {base} meters and a height of {height} meters. How large an area needs to be sown with grass seeds?"
        },
        {
            sv: "En dekorationsflagga är triangelformad med måtten {base} cm i basen och {height} cm i höjd. Hur stor är flaggans tygyta?",
            en: "A decorative flag is triangular with dimensions of {base} cm at the base and {height} cm in height. What is the surface area of the flag fabric?"
        },
        {
            sv: "Ett rätvinkligt glaselement till ett räcke har en bas på {base} cm och en höjd på {height} cm. Vad är glaselementets area?",
            en: "A right-angled glass element for a railing has a base of {base} cm and a height of {height} cm. What is the area of the glass element?"
        },
        {
            sv: "En pappersbit klipps diagonalt till en triangel med basen {base} mm och höjden {height} mm. Hur stor är pappersbitens area?",
            en: "A piece of paper is cut diagonally into a triangle with a base of {base} mm and a height of {height} mm. What is the area of the piece of paper?"
        },
        {
            sv: "Ett arkitektoniskt stag bildar en triangel mot en husvägg. Basen längs marken är {base} meter och höjden upp längs väggen är {height} meter. Hur stor är den inneslutna väggytan?",
            en: "An architectural brace forms a triangle against a house wall. The base along the ground is {base} meters and the height up the wall is {height} meters. What is the enclosed wall area?"
        },
        {
            sv: "En spegel är slipad som en triangel med basen {base} cm och höjden {height} cm. Hur stor är spegelytan?",
            en: "A mirror is ground into a triangle with a base of {base} cm and a height of {height} cm. How large is the mirror surface area?"
        }
    ],

    geom_area_l_shape: [
        {
            sv: "Ett L-format vardagsrum ska få nytt parkettgolv. Den stående rektangeln mäter {vW} gånger {vH} meter, och den liggande delen mäter {hW} gånger {hH} meter. Vad är rummets totala golvarea?",
            en: "An L-shaped living room is getting new parquet flooring. The vertical rectangle measures {vW} by {vH} meters, and the horizontal section measures {hW} by {hH} meters. What is the total floor area of the room?"
        },
        {
            sv: "En L-formad garageuppfart ska asfalteras. Uppfarten kan delas i en vertikal del på {vW}x{vH} meter och en anslutande del på {hW}x{hH} meter. Hur stor yta ska täckas med asfalt?",
            en: "An L-shaped driveway is to be paved. The driveway can be split into a vertical part of {vW}x{vH} meters and an adjoining part of {hW}x{hH} meters. How large an area needs to be paved?"
        },
        {
            sv: "En köksbänk är formad som ett L. Den längre sammanhängande skivan har måtten {vW}x{vH} cm och den mindre sidoskivan har måtten {hW}x{hH} cm. Vad är köksbänkens totala area?",
            en: "A kitchen countertop is shaped like an L. The longer continuous slab has dimensions of {vW}x{vH} cm and the smaller side slab has dimensions of {hW}x{hH} cm. What is the total area of the countertop?"
        },
        {
            sv: "Ett L-format trädgårdsland mäter {vW}x{vH} meter i sin stora zon och {hW}x{hH} meter i sin lilla zon. Hur stor är den totala odlingsytan?",
            en: "An L-shaped garden bed measures {vW}x{vH} meters in its large zone and {hW}x{hH} meters in its small zone. What is the total cultivation area?"
        },
        {
            sv: "En L-formad pool ska kaklas invändigt längs botten. Poolen består av två sammansatta rektangulära sektioner med måtten {vW}x{vH} meter respektive {hW}x{hH} meter. Hur stor bottenarea har poolen?",
            en: "An L-shaped pool is to be tiled internally along the bottom. The pool consists of two joined rectangular sections measuring {vW}x{vH} meters and {hW}x{hH} meters respectively. What is the bottom area of the pool?"
        },
        {
            sv: "En plåtbit har stansats ut i formen av ett L. Den vertikala stammen är {vW} mm bred och {vH} mm hög, medan den utstickande foten är {hW} mm bred och {hH} mm hög. Vad är plåtbitens area?",
            en: "A piece of sheet metal has been stamped out in the shape of an L. The vertical stem is {vW} mm wide and {vH} mm high, while the protruding foot is {hW} mm wide and {hH} mm high. What is the area of the sheet metal?"
        },
        {
            sv: "Ett L-format trädäck har byggts runt ett hörn på ett hus. Däcket delas upp i två rektanglar med måtten {vW}x{vH} meter och {hW}x{hH} meter. Hur stor är trallens totala area?",
            en: "An L-shaped wooden deck has been built around a corner of a house. The deck is divided into two rectangles measuring {vW}x{vH} meters and {hW}x{hH} meters. What is the total area of the decking?"
        },
        {
            sv: "En L-formad lagerlokal har en huvudhall på {vW}x{vH} meter och en sidohall på {hW}x{hH} meter. Hur stor är den totala lagerytan i lokalen?",
            en: "An L-shaped warehouse has a main hall measuring {vW}x{vH} meters and a side hall measuring {hW}x{hH} meters. What is the total storage area in the facility?"
        },
        {
            sv: "En monteringsyta på ett kretskort bildar ett L. De två rektangulära delarna har måtten {vW}x{vH} mm och {hW}x{hH} mm. Beräkna den totala monteringsarean.",
            en: "A mounting area on a circuit board forms an L. The two rectangular parts measure {vW}x{vH} mm and {hW}x{hH} mm. Calculate the total mounting area."
        },
        {
            sv: "En fastighetstomt har formen av ett L. Kommunen mäter upp delarna till {vW}x{vH} meter och {hW}x{hH} meter. Vad blir tomtens totala area?",
            en: "A property lot is shaped like an L. The municipality measures the parts to be {vW}x{vH} meters and {hW}x{hH} meters. What is the total area of the lot?"
        }
    ],

    geom_area_circle: [
        {
            sv: "En cirkelformad fontän har radien {r} meter. Man vill lägga stensättning över hela fontänens botten. Hur stor area ska täckas? (Använd pi = 3,14)",
            en: "A circular fountain has a radius of {r} meters. They want to lay stone paving across the entire bottom of the fountain. How large an area needs to be covered? (Use pi = 3.14)"
        },
        {
            sv: "En rund matta har radien {r} meter. Hur stor golvyta täcker mattan i rummet? (Använd pi = 3,14)",
            en: "A round rug has a radius of {r} meters. How much floor space does the rug cover in the room? (Use pi = 3.14)"
        },
        {
            sv: "Ett runt köksbord har en radie på {r} dm. Du ska köpa en vaxduk som täcker hela bordsskivan perfekt. Vad är bordsskivans area? (Använd pi = 3,14)",
            en: "A round kitchen table has a radius of {r} dm. You need to buy an oilcloth that covers the entire tabletop perfectly. What is the area of the tabletop? (Use pi = 3.14)"
        },
        {
            sv: "En cirkulär helikopterplatta har ritats med en radie på {r} meter. Hur stor landningsyta har plattan totalt? (Använd pi = 3,14)",
            en: "A circular helipad has been designed with a radius of {r} meters. How large is the total landing surface area of the pad? (Use pi = 3.14)"
        },
        {
            sv: "En rund rabatt har radien {r} meter och ska fyllas med ny planteringsjord. Hur stor yta har rabatten? (Använd pi = 3,14)",
            en: "A round flowerbed has a radius of {r} meters and is to be filled with new planting soil. How large an area does the bed have? (Use pi = 3.14)"
        },
        {
            sv: "Ett runt fönster i en kyrka har radien {r} cm. Hur stor är glasyta som släpper in ljus? (Använd pi = 3,14)",
            en: "A round window in a church has a radius of {r} cm. How large is the glass surface area letting in light? (Use pi = 3.14)"
        },
        {
            sv: "En cirkulär datadisk har en radie på {r} cm. Hur stor är diskens totala ovansida? (Använd pi = 3,14)",
            en: "A circular data disc has a radius of {r} cm. How large is the entire top surface area of the disc? (Use pi = 3.14)"
        },
        {
            sv: "En rund väggspegel har radien {r} cm. Hur stor reflekterande spegelyta har den? (Använd pi = 3,14)",
            en: "A round wall mirror has a radius of {r} cm. How large a reflecting mirror surface area does it have? (Use pi = 3.14)"
        },
        {
            sv: "Ett cirkulärt ventilationshål har borrats med radien {r} mm. Hur stor är öppningens area? (Använd pi = 3,14)",
            en: "A circular ventilation hole has been drilled with a radius of {r} mm. What is the area of the opening? (Use pi = 3.14)"
        },
        {
            sv: "En rund scen på en teater har radien {r} meter. Scengolvet ska målas om med svart färg. Hur stor är ytan som ska målas? (Använd pi = 3,14)",
            en: "A round stage at a theater has a radius of {r} meters. The stage floor is to be repainted with black paint. How large is the surface area to be painted? (Use pi = 3.14)"
        }
    ],

    geom_area_house: [
        {
            sv: "Gaveln på en lagerbyggnad är formad som ett hus. Den rektangulära väggen mäter {w} meter i bredd och {h} meter i höjd, och det triangulära taket har höjden {hr} meter. Vad är gavelns totala area?",
            en: "The gable of a warehouse building is shaped like a house. The rectangular wall measures {w} meters in width and {h} meters in height, and the triangular roof has a height of {hr} meters. What is the total area of the gable?"
        },
        {
            sv: "En fågelholk har en framsida formad som ett hus. Väggdelen mäter {w}x{h} cm och taktriangeln har höjden {hr} cm. Hur stor är framsidans totala area?",
            en: "A birdhouse has a front shaped like a house. The wall section measures {w}x{h} cm and the roof triangle has a height of {hr} cm. What is the total area of the front?"
        },
        {
            sv: "En vägskylt har formen av en hussiluett. Basrektangeln har måtten {w}x{h} cm och den övre triangeln har höjden {hr} cm. Hur stor är skyltens area?",
            en: "A road sign has the shape of a house silhouette. The base rectangle measures {w}x{h} cm and the upper triangle has a height of {hr} cm. What is the area of the sign?"
        },
        {
            sv: "En teckning av ett hus består av en kvadratisk bas med bredden {w} cm och höjden {h} cm, samt ett tak med höjden {hr} cm. Vad är hela husritningens area?",
            en: "A drawing of a house consists of a square base with a width of {w} cm and a height of {h} cm, plus a roof with a height of {hr} cm. What is the area of the entire house drawing?"
        },
        {
            sv: "En mässmonter har byggts med en bakvägg som ser ut som ett hus. Rektangeln nertill är {w} meter bred och {h} meter hög. Takspetsen går upp ytterligare {hr} meter. Vad är bakväggens area?",
            en: "An exhibition booth has been built with a back wall that looks like a house. The rectangle at the bottom is {w} meters wide and {h} meters high. The roof apex goes up another {hr} meters. What is the area of the back wall?"
        },
        {
            sv: "Framsidan på ett växthus har bredden {w} meter och sidoväggens höjd är {h} meter. Tak nocken skjuter upp {hr} meter ovanför sidoväggarna. Vad är framsidans totala area?",
            en: "The front of a greenhouse has a width of {w} meters and the side wall height is {h} meters. The roof ridge projects {hr} meters above the side walls. What is the total area of the front?"
        },
        {
            sv: "En logotyp har formen av ett litet hus. Basen är {w} mm bred och {h} mm hög, och taktriangeln är {hr} mm hög. Beräkna logotypens area.",
            en: "A logo is shaped like a small house. The base is {w} mm wide and {h} mm high, and the roof triangle is {hr} mm high. Calculate the area of the logo."
        },
        {
            sv: "Ett förråd har en kortsida utformad som en hussiluett med måtten {w}x{h} meter på rektangeln och {hr} meter i takhöjd. Vad är kortsidans totala area?",
            en: "A shed has a short side designed as a house silhouette with dimensions of {w}x{h} meters for the rectangle and {hr} meters for the roof height. What is the total area of the short side?"
        },
        {
            sv: "En bit dekorationskartong har skurits ut som ett hus. Väggdelen mäter {w}x{h} cm och takdelen har en vinkelrät höjd på {hr} cm. Hur stor är kartongbitens area?",
            en: "A piece of decorative cardboard has been cut out like a house. The wall part measures {w}x{h} cm and the roof part has a perpendicular height of {hr} cm. What is the area of the cardboard piece?"
        },
        {
            sv: "Ett klossbygge bildar en hussiluett. Basblocket är en rektangel med måtten {w}x{h} cm och takblocket är en triangel med höjden {hr} cm. Vad är siluettens sammanlagda area?",
            en: "A block structure forms a house silhouette. The base block is a rectangle measuring {w}x{h} cm and the roof block is a triangle with a height of {hr} cm. What is the combined area of the silhouette?"
        }
    ]
};