// src/core/utils/stories/scale.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

export const SCALE_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. SCALE READING / INTERPRETATION (Placeholders: {k})
    // Context: scale_reading_val
    // =========================================================================
    scale_reading_val: [
        {
            id: "scale_read_orienteering",
            sv: "På en orienteringskarta med skalan 1:{k} mäter du 1 cm mellan två kontroller med din kompasslinjal. Hur många centimeter motsvarar det i terrängen?",
            en: "On an orienteering map with scale 1:{k}, you measure 1 cm between two controls using your compass ruler. How many centimeters does that represent in terrain?"
        },
        {
            id: "scale_read_blueprintfurniture",
            sv: "En arkitekt ritar en planlösning i skala 1:{k}. En bokhylla mäter 1 cm på ritningen. Hur många centimeter bred är hyllan i verkligheten?",
            en: "An architect drafts a floor plan at scale 1:{k}. A bookshelf measures 1 cm on the blueprint. How many centimeters wide is the shelf in reality?"
        },
        {
            id: "scale_read_modelairplane",
            sv: "Ett modellflygplan är byggt i skalan 1:{k}. Planets vingspets är 1 cm lång på modellen. Hur många centimeter motsvarar detta på det riktiga flygplanet?",
            en: "A model airplane is built to scale 1:{k}. The wingtip is 1 cm long on the model. How many centimeters does this equal on the real aircraft?"
        },
        {
            id: "scale_read_schoolmap",
            sv: "På en översiktskarta över skolgården i skala 1:{k} är fotbollsmålet 1 cm brett. Hur många centimeter brett är målet i verkligheten?",
            en: "On an overview map of the schoolyard at scale 1:{k}, the soccer goal is 1 cm wide. How many centimeters wide is the goal in reality?"
        },
        {
            id: "scale_read_dollhousechair",
            sv: "I ett detaljerat dockskåp i skala 1:{k} mäter en matsalsstol 1 cm på höjden. Hur många centimeter hög är motsvarande stol i naturlig storlek?",
            en: "In a detailed dollhouse at scale 1:{k}, a dining chair measures 1 cm in height. How many centimeters tall is the corresponding real-life chair?"
        },
        {
            id: "scale_read_hikingtrail",
            sv: "En naturstig är markerad på en vandringskarta i skala 1:{k}. Ett avstånd mellan två rastplatser är 1 cm på kartan. Hur många centimeter är det i skogen?",
            en: "A nature trail is marked on a hiking map at scale 1:{k}. The distance between two rest spots is 1 cm on the map. How many centimeters is that in the forest?"
        },
        {
            id: "scale_read_carblueprint",
            sv: "På en verkstadsritning av en elbil i skala 1:{k} är batteripackets tjocklek 1 cm. Hur många centimeter tjockt är batteripacket i den riktiga bilen?",
            en: "On an engineering blueprint of an electric car at scale 1:{k}, the battery pack thickness is 1 cm. How many centimeters thick is the battery pack in the real car?"
        },
        {
            id: "scale_read_subwaymap",
            sv: "På en schematisk spårkarta i skala 1:{k} är perrongen 1 cm lång. Hur många centimeter lång är perrongen i verkligheten?",
            en: "On a schematic transit map at scale 1:{k}, the station platform is 1 cm long. How many centimeters long is the platform in reality?"
        },
        {
            id: "scale_read_parkpond",
            sv: "En trädgårdsarkitekt ritar en damm på en parkkarta i skala 1:{k}. Dammen mäter 1 cm tvärs över på ritningen. Hur många centimeter bred är dammen i verkligheten?",
            en: "A landscape designer drafts a pond on a park map at scale 1:{k}. The pond measures 1 cm across on the drawing. How many centimeters wide is the pond in reality?"
        },
        {
            id: "scale_read_stageplan",
            sv: "Inför en konsert ritas scenen upp i skala 1:{k}. Trumsetets podium är 1 cm djupt på ritningen. Hur många centimeter motsvarar det på själva konsertscenen?",
            en: "Before a concert, the stage is mapped at scale 1:{k}. The drum riser is 1 cm deep on the layout. How many centimeters does that represent on the actual stage?"
        },
        {
            id: "scale_read_trainset",
            sv: "Till en modelljärnväg i skala 1:{k} mäter en godsvagn 1 cm på längden. Hur många centimeter lång är den verkliga godsvagnen på spåret?",
            en: "For a model railway at scale 1:{k}, a cargo car measures 1 cm in length. How many centimeters long is the real freight wagon on the track?"
        },
        {
            id: "scale_read_cityneighborhood",
            sv: "På en stadsdelsplan i skala 1:{k} mäter en trottoarkant 1 cm. Hur många centimeter bred är trottoaren i verkligheten?",
            en: "On a city neighborhood plan at scale 1:{k}, a sidewalk edge measures 1 cm. How many centimeters wide is the sidewalk in reality?"
        },
        {
            id: "scale_read_sailingboat",
            sv: "På konstruktionsritningen för en segelbåt i skala 1:{k} är rodret 1 cm djupt. Hur många centimeter djupt är rodret i verkligheten?",
            en: "On the construction drawing for a sailboat at scale 1:{k}, the rudder is 1 cm deep. How many centimeters deep is the rudder in reality?"
        },
        {
            id: "scale_read_greenhouse",
            sv: "En ritning över ett växthus är utförd i skalan 1:{k}. Dörröppningen är 1 cm bred på pappret. Hur många centimeter bred är dörren i växthuset?",
            en: "A drawing of a greenhouse is made at scale 1:{k}. The doorway is 1 cm wide on paper. How many centimeters wide is the door in the greenhouse?"
        },
        {
            id: "scale_read_museumreplica",
            sv: "Ett historiskt museum ställer ut en modell av ett vikingaskepp i skala 1:{k}. En sköld på relingen är 1 cm bred på modellen. Hur bred var skölden i verkligheten?",
            en: "A historical museum displays a model of a Viking longship at scale 1:{k}. A shield on the railing is 1 cm wide on the model. How wide was the shield in reality?"
        }
    ],

    // =========================================================================
    // 🎯 2. REDUCTION CALCULATE CM (Placeholders: {scale}, {imgCm})
    // Context: scale_calc_real
    // =========================================================================
    scale_calc_real: [
        {
            id: "scale_red_modelcar",
            sv: "En modellbil är byggd i skalan 1:{scale}. På modellen är motorhuven {imgCm} cm lång. Hur lång är huven på den verkliga bilen i centimeter?",
            en: "A model car is built to a scale of 1:{scale}. On the model, the hood is {imgCm} cm long. What is the actual length of the hood in centimeters?"
        },
        {
            id: "scale_red_dollhousebed",
            sv: "I ett dockskåp i skala 1:{scale} är en säng {imgCm} cm lång. Hur många centimeter lång är sängen i verkligheten?",
            en: "In a dollhouse at scale 1:{scale}, a bed is {imgCm} cm long. How many centimeters long is the bed in reality?"
        },
        {
            id: "scale_red_gardenplanter",
            sv: "På en trädgårdsskiss i skala 1:{scale} är en blomlåda {imgCm} cm lång. Hur många centimeter lång är blomlådan i verkligheten?",
            en: "On a garden sketch at scale 1:{scale}, a planter box is {imgCm} cm long. How many centimeters long is the box in reality?"
        },
        {
            id: "scale_red_deskblueprint",
            sv: "På en möbelritning med skala 1:{scale} är ett skrivbord {imgCm} cm brett. Hur många centimeter brett är skrivbordet i verkligheten?",
            en: "On a furniture drawing with scale 1:{scale}, a desk is {imgCm} cm wide. How many centimeters wide is the desk in reality?"
        },
        {
            id: "scale_red_guitarcase",
            sv: "En gitarrbyggare ritar ett instrumentfodral i skala 1:{scale}. På ritningen mäter fodralet {imgCm} cm. Hur långt är fodralet i verkligheten i centimeter?",
            en: "A luthier sketches a guitar case at scale 1:{scale}. On the drawing, the case measures {imgCm} cm. What is the real length of the case in centimeters?"
        },
        {
            id: "scale_red_kitchenshelf",
            sv: "En ritning över ett kök har skalan 1:{scale}. En kryddhylla är utritad med längden {imgCm} cm. Hur lång är kryddhyllan i centimeter i verkligheten?",
            en: "A kitchen layout has a scale of 1:{scale}. A spice rack is drawn with a length of {imgCm} cm. How long is the spice rack in centimeters in reality?"
        },
        {
            id: "scale_red_skateboardramp",
            sv: "En miniatyrmodell av en skateboardramp är byggd i skala 1:{scale}. Rampens höjd på modellen är {imgCm} cm. Hur hög är rampen i verkligheten i centimeter?",
            en: "A miniature model of a skate ramp is built at scale 1:{scale}. The ramp height on the model is {imgCm} cm. How tall is the ramp in reality in centimeters?"
        },
        {
            id: "scale_red_aquariumstand",
            sv: "En akvariebänk ritas upp i skala 1:{scale}. På ritningen mäter bänkens toppskiva {imgCm} cm. Hur bred är bänken i verkligheten i centimeter?",
            en: "An aquarium stand is sketched at scale 1:{scale}. On paper, the top surface measures {imgCm} cm. How wide is the stand in centimeters in reality?"
        },
        {
            id: "scale_red_doghouse",
            sv: "På en ritning över en hundkoja i skala 1:{scale} är ingångshålet {imgCm} cm högt. Hur högt är ingångshålet i verkligheten uttryckt i centimeter?",
            en: "On a doghouse plan at scale 1:{scale}, the entrance hole is {imgCm} cm high. How high is the entrance hole in reality expressed in centimeters?"
        },
        {
            id: "scale_red_computercase",
            sv: "Ett datorchassi ritas i skala 1:{scale}. Chassits framsida mäter {imgCm} cm på ritningen. Hur många centimeter högt är chassit i verkligheten?",
            en: "A computer chassis is modeled at scale 1:{scale}. The front panel measures {imgCm} cm on the schematic. How many centimeters tall is the chassis in reality?"
        },
        {
            id: "scale_red_rabbitcage",
            sv: "En ritning för en kaninbur har skalan 1:{scale}. Burens taklucka är {imgCm} cm bred på ritningen. Vad är takluckans verkliga bredd i centimeter?",
            en: "A blueprint for a rabbit hutch uses scale 1:{scale}. The roof hatch is {imgCm} cm wide on the drawing. What is the actual width of the hatch in centimeters?"
        },
        {
            id: "scale_red_wardrobedoor",
            sv: "En garderobsdörr ritas upp i skalan 1:{scale}. På skissen är dörren {imgCm} cm bred. Hur många centimeter bred är garderobsdörren i verkligheten?",
            en: "A wardrobe door is drafted at scale 1:{scale}. On the sketch, the door is {imgCm} cm wide. How many centimeters wide is the door in reality?"
        },
        {
            id: "scale_red_toolchest",
            sv: "En verktygslåda i en produktkatalog är avbildad i skala 1:{scale}. Handtaget på lådan är {imgCm} cm långt i bilden. Hur långt är handtaget i verkligheten i centimeter?",
            en: "A tool chest in a catalog is pictured at scale 1:{scale}. The handle is {imgCm} cm long in the photo. How long is the handle in reality in centimeters?"
        },
        {
            id: "scale_red_workbench",
            sv: "En snickarbänk är ritad i skala 1:{scale}. Bänkens djup mäter {imgCm} cm på ritningen. Hur djupt är arbetsbordet i centimeter i verkligheten?",
            en: "A workbench is drawn at scale 1:{scale}. The bench depth measures {imgCm} cm on the layout. How deep is the worktable in centimeters in reality?"
        },
        {
            id: "scale_red_speakerbox",
            sv: "En ljudtekniker bygger en högtalarlåda efter en skiss i skala 1:{scale}. Basportens diameter är {imgCm} cm på skissen. Hur stor är diametern i verkligheten i centimeter?",
            en: "An audio engineer builds a speaker cabinet from a sketch at scale 1:{scale}. The bass port diameter is {imgCm} cm on the sketch. How large is the real diameter in centimeters?"
        }
    ],

    // =========================================================================
    // 🎯 3. REDUCTION CONVERT TO METERS (Placeholders: {scale}, {imgCm})
    // Context: scale_calc_real_m
    // =========================================================================
    scale_calc_real_m: [
        {
            id: "scale_redm_swimmingpool",
            sv: "En simbassäng är utritad på en ritning i skala 1:{scale}. Bassängens längd på ritningen är {imgCm} cm. Hur lång är simbassängen i verkligheten? Svara i meter.",
            en: "A swimming pool is drawn on a blueprint at scale 1:{scale}. The pool's length on the drawing is {imgCm} cm. What is the real length of the pool? Answer in meters."
        },
        {
            id: "scale_redm_housewall",
            sv: "På en husritning med skalan 1:{scale} är ytterväggen {imgCm} cm lång. Vad är ytterväggens verkliga längd i meter?",
            en: "On a house blueprint with scale 1:{scale}, an exterior wall is {imgCm} cm long. What is the actual length of the wall in meters?"
        },
        {
            id: "scale_redm_fenceline",
            sv: "På en tomtkarta i skala 1:{scale} är ett tomtstaket {imgCm} cm långt. Hur många meter staket behövs i verkligheten?",
            en: "On a property map at scale 1:{scale}, a fence measures {imgCm} cm. How many meters of fencing are needed in reality?"
        },
        {
            id: "scale_redm_footballpitch",
            sv: "På en skiss i skala 1:{scale} över en idrottsplats mäter fotbollsplanens sidlinje {imgCm} cm. Hur många meter motsvarar detta i verkligheten?",
            en: "On a sketch at scale 1:{scale} of a sports facility, the soccer field sideline measures {imgCm} cm. How many meters does this correspond to in reality?"
        },
        {
            id: "scale_redm_driveway",
            sv: "En asfalterad garageuppfart mäter {imgCm} cm på en byggritning i skala 1:{scale}. Hur många meter lång är garageuppfarten i verkligheten?",
            en: "A paved driveway measures {imgCm} cm on a construction plan at scale 1:{scale}. How many meters long is the driveway in reality?"
        },
        {
            id: "scale_redm_pedestrianbridge",
            sv: "En gångbro över en bäck ritas i skala 1:{scale}. Bron är {imgCm} cm lång på ritningen. Hur lång är bron i verkligheten i meter?",
            en: "A footbridge over a stream is drafted at scale 1:{scale}. The bridge is {imgCm} cm long on the blueprint. What is the real length of the bridge in meters?"
        },
        {
            id: "scale_redm_gymnasiumsfloor",
            sv: "Golvet i en gymnastiksal ritas upp i skala 1:{scale}. Längden på ritningen är {imgCm} cm. Hur lång är gymnastiksalen i meter?",
            en: "A gymnasium floor is designed at scale 1:{scale}. The length on the drawing is {imgCm} cm. How long is the gym in meters?"
        },
        {
            id: "scale_redm_patioflagstones",
            sv: "En stensatt uteplats har måttet {imgCm} cm på en trädgårdsritning i skala 1:{scale}. Hur många meter lång blir uteplatsen i verkligheten?",
            en: "A stone patio measures {imgCm} cm on a landscape blueprint at scale 1:{scale}. How many meters long will the patio be in reality?"
        },
        {
            id: "scale_redm_warehouseaisle",
            sv: "En lagerkorridor är {imgCm} cm lång på en logistikritning med skalan 1:{scale}. Hur många meter lång är korridoren i lagerbyggnaden?",
            en: "A warehouse aisle is {imgCm} cm long on a logistics plan with scale 1:{scale}. How many meters long is the aisle in the warehouse building?"
        },
        {
            id: "scale_redm_trainplatform",
            sv: "En tågperrong mäter {imgCm} cm på en stationsritning i skala 1:{scale}. Vad är perrongens verkliga längd uttryckt i meter?",
            en: "A train platform measures {imgCm} cm on a station plan at scale 1:{scale}. What is the actual platform length expressed in meters?"
        },
        {
            id: "scale_redm_schoolcorridor",
            sv: "Skolans huvudkorridor är {imgCm} cm lång på arkitektritningen i skala 1:{scale}. Hur många meter lång är korridoren i verkligheten?",
            en: "The school's main hallway is {imgCm} cm long on the architectural blueprint at scale 1:{scale}. How many meters long is the hallway in reality?"
        },
        {
            id: "scale_redm_parkinglot",
            sv: "En parkeringsplats för bussar är {imgCm} cm bred på en översiktsplan i skala 1:{scale}. Hur bred är parkeringen i verkligheten i meter?",
            en: "A bus parking area is {imgCm} cm wide on a site plan at scale 1:{scale}. How wide is the parking area in reality in meters?"
        },
        {
            id: "scale_redm_roofterrace",
            sv: "En takterrass är utritad med längden {imgCm} cm på en ritning i skala 1:{scale}. Hur många meter lång är takterrassen i verkligheten?",
            en: "A rooftop terrace is drawn with length {imgCm} cm on a layout at scale 1:{scale}. How many meters long is the rooftop terrace in reality?"
        },
        {
            id: "scale_redm_icehockeyrink",
            sv: "En ishockeyrink mäter {imgCm} cm på en anläggningsskiss i skala 1:{scale}. Hur lång är rinken i verkligheten i meter?",
            en: "An ice hockey rink measures {imgCm} cm on a sports facility sketch at scale 1:{scale}. How long is the rink in reality in meters?"
        },
        {
            id: "scale_redm_canalboatlock",
            sv: "En sluss i en kanal är ritad i skala 1:{scale}. Slusskammaren är {imgCm} cm lång på ritningen. Hur många meter lång är slusskammaren i verkligheten?",
            en: "A canal lock is drawn at scale 1:{scale}. The lock chamber is {imgCm} cm long on paper. How many meters long is the lock chamber in reality?"
        }
    ],

    // =========================================================================
    // 🎯 4. ENLARGEMENT CALCULATE MM (Placeholders: {scale}, {realMm})
    // Context: scale_calc_enlarge
    // =========================================================================
    scale_calc_enlarge: [
        {
            id: "scale_enl_microchip",
            sv: "En mikroskopisk komponent på ett kretskort är {realMm} mm lång. På en förstorad ritning i skala {scale}:1, hur många millimeter lång blir komponenten?",
            en: "A microscopic component on a circuit board is {realMm} mm long. On an enlarged schematic at scale {scale}:1, how many millimeters long will the component be?"
        },
        {
            id: "scale_enl_antleg",
            sv: "Ett myrben är {realMm} mm långt i verkligheten. En biolog ritar av benet i förstoringen {scale}:1. Hur många millimeter långt är benet på bilden?",
            en: "An ant's leg is {realMm} mm long in reality. A biologist draws the leg at magnification {scale}:1. How many millimeters long is the leg in the drawing?"
        },
        {
            id: "scale_enl_watchscrew",
            sv: "En liten skruv inuti ett armbandsur är {realMm} mm lång. Hur många millimeter blir skruven på en detaljritning i skala {scale}:1?",
            en: "A tiny screw inside a wristwatch is {realMm} mm long. How many millimeters long will the screw be on a detail blueprint at scale {scale}:1?"
        },
        {
            id: "scale_enl_plantseed",
            sv: "Ett litet vallmofrö är {realMm} mm brett i verkligheten. Hur brett blir fröet på ett fotografi i skala {scale}:1 i millimeter?",
            en: "A small poppy seed is {realMm} mm wide in reality. How wide will the seed be on a photo at scale {scale}:1 in millimeters?"
        },
        {
            id: "scale_enl_sandgrain",
            sv: "Ett sandkorn från en strand mäter {realMm} mm under en lupp. Hur stort blir sandkornet på en affisch i skala {scale}:1 i millimeter?",
            en: "A grain of sand from a beach measures {realMm} mm under a loupe. How large will the sand grain be on a poster at scale {scale}:1 in millimeters?"
        },
        {
            id: "scale_enl_mosquitoantenna",
            sv: "En myggas antenn är {realMm} mm lång. En entomolog fotograferar den i mikroskop med skalan {scale}:1. Hur många millimeter lång är antennen på bilden?",
            en: "A mosquito's antenna is {realMm} mm long. An entomologist photographs it through a microscope at scale {scale}:1. How many millimeters long is the antenna in the photo?"
        },
        {
            id: "scale_enl_leddiode",
            sv: "En ytmonterad lysdiod har längden {realMm} mm. En ingenjör ritar upp den i skala {scale}:1. Hur många millimeter lång blir lysdioden på ritningen?",
            en: "A surface-mount LED diode has a length of {realMm} mm. An engineer drafts it at scale {scale}:1. How many millimeters long is the diode on the schematic?"
        },
        {
            id: "scale_enl_eyelashhair",
            sv: "Ett ögonfranshårstrå har tjockleken {realMm} mm. I en dermatologisk instruktionsbok förstoras det i skalan {scale}:1. Hur brett visas hårstrået i millimeter?",
            en: "An eyelash hair has a thickness of {realMm} mm. In a dermatology handbook it is magnified at scale {scale}:1. How wide is the hair shown in millimeters?"
        },
        {
            id: "scale_enl_penciltip",
            sv: "Spetsen på en stiftpenna har bredden {realMm} mm. Den avbildas på förpackningen i skala {scale}:1. Hur många millimeter bred är spetsen på förpackningsbilden?",
            en: "The lead tip of a mechanical pencil is {realMm} mm wide. It is pictured on the packaging at scale {scale}:1. How many millimeters wide is the tip on the box?"
        },
        {
            id: "scale_enl_gemfacet",
            sv: "En liten fasett på en slipad diamant mäter {realMm} mm. En guldsmed gör en detaljskiss i skala {scale}:1. Hur många millimeter mäter fasetten på skissen?",
            en: "A small facet on a cut diamond measures {realMm} mm. A jeweler makes a detailed sketch at scale {scale}:1. How many millimeters does the facet measure on the sketch?"
        },
        {
            id: "scale_enl_waterdroplet",
            sv: "En regndroppe på ett blad är {realMm} mm bred. På ett makrofotografi i skala {scale}:1, hur många millimeter bred blir droppen i bilden?",
            en: "A raindrop on a leaf is {realMm} mm wide. On a macro photograph at scale {scale}:1, how many millimeters wide is the droplet in the picture?"
        },
        {
            id: "scale_enl_fiberglassstrand",
            sv: "En glasfibersträng är {realMm} mm tjock. En materialforskare illustrerar trådens tvärsnitt i skala {scale}:1. Vad blir bredden på illustrationen i millimeter?",
            en: "A fiberglass strand is {realMm} mm thick. A materials scientist illustrates the cross-section at scale {scale}:1. What is the width of the illustration in millimeters?"
        },
        {
            id: "scale_enl_beeeye",
            sv: "Ett fasettöga på ett bi mäter {realMm} mm i diameter. I ett undervisningshäfte avbildas ögat i skala {scale}:1. Hur stor är diametern på bilden i millimeter?",
            en: "A compound eye of a bee measures {realMm} mm in diameter. In a study pamphlet, the eye is shown at scale {scale}:1. What is the diameter in the picture in millimeters?"
        },
        {
            id: "scale_enl_sugarshard",
            sv: "En sockerkristall mäter {realMm} mm. På en plansch i kemisalen är kristallen förstorad i skala {scale}:1. Hur många millimeter mäter kristallen på planschen?",
            en: "A sugar crystal measures {realMm} mm. On a chemistry poster, the crystal is magnified at scale {scale}:1. How many millimeters does the crystal measure on the poster?"
        },
        {
            id: "scale_enl_watchspring",
            sv: "En fjäder i ett urverk är {realMm} mm bred. Urskissen visar fjädern i förstoringen {scale}:1. Hur många millimeter bred är fjädern på ritningen?",
            en: "A balance spring in a watch mechanism is {realMm} mm wide. The schematic displays the spring at magnification {scale}:1. How many millimeters wide is the spring on the drawing?"
        }
    ],

    // =========================================================================
    // 🎯 5. ENLARGEMENT CONVERT TO CM (Placeholders: {scale}, {realMm})
    // Context: scale_calc_enlarge_cm
    // =========================================================================
    scale_calc_enlarge_cm: [
        {
            id: "scale_enlcm_ladybug",
            sv: "En liten nyckelpiga är {realMm} mm lång. På en affisch i biologisalen är den avbildad i skala {scale}:1. Hur många centimeter lång är nyckelpigan på affischen?",
            en: "A small ladybug is {realMm} mm long. On a biology poster, it is depicted at scale {scale}:1. How many centimeters long is the ladybug on the poster?"
        },
        {
            id: "scale_enlcm_flea",
            sv: "Ett mikroskopiskt frö är {realMm} mm långt. I en lärobok avbildas fröet i skalan {scale}:1. Hur många centimeter långt blir fröet i boken?",
            en: "A microscopic seed is {realMm} mm long. In a textbook, the seed is pictured at scale {scale}:1. How many centimeters long will the seed be in the book?"
        },
        {
            id: "scale_enlcm_waterflea",
            sv: "En sötvattendaphnia (vattenloppa) är {realMm} mm lång i verkligheten. I en lupp förstoras den med skalan {scale}:1. Hur många centimeter lång upplevs bilden?",
            en: "A freshwater daphnia is {realMm} mm long in reality. Under a magnifying glass, it is enlarged by scale {scale}:1. How many centimeters long does the image appear?"
        },
        {
            id: "scale_enlcm_beesting",
            sv: "En getinggadd är {realMm} mm lång. På en pedagogisk museiutställning är gadden förstorad i skala {scale}:1. Hur många centimeter lång är modellen på museet?",
            en: "A wasp stinger is {realMm} mm long. In an educational museum exhibit, the stinger is enlarged at scale {scale}:1. How many centimeters long is the model at the museum?"
        },
        {
            id: "scale_enlcm_computertrack",
            sv: "En ledningsbana på ett moderkort är {realMm} mm bred. På en demonstrationsskärm förstoras bilden i skala {scale}:1. Hur många centimeter bred visas banan?",
            en: "A trace line on a motherboard is {realMm} mm wide. On a demo screen, the image is enlarged at scale {scale}:1. How many centimeters wide is the trace displayed?"
        },
        {
            id: "scale_enlcm_flowerpollen",
            sv: "Ett pollenkorn från en tall är {realMm} mm brett. Ett mikroskopfoto förstorar kornet i skalan {scale}:1. Vad är kornets bredd på fotografiet uttryckt i centimeter?",
            en: "A pollen grain from a pine tree is {realMm} mm wide. A microscope photo magnifies the grain at scale {scale}:1. What is the grain's width on the photo expressed in centimeters?"
        },
        {
            id: "scale_enlcm_spideregg",
            sv: "Ett spindelägg har en diameter på {realMm} mm. I en naturdokumentär visas ägget på en bild i skala {scale}:1. Hur många centimeter stor är äggets diameter på bilden?",
            en: "A spider egg has a diameter of {realMm} mm. In a nature documentary, the egg is shown in an image at scale {scale}:1. How many centimeters is the egg diameter in the picture?"
        },
        {
            id: "scale_enlcm_microbattery",
            sv: "Ett batteri till en hörapparat är {realMm} mm högt. I en bruksanvisning visas det i skala {scale}:1. Hur många centimeter högt är batteriet i bruksanvisningen?",
            en: "A battery for a hearing aid is {realMm} mm high. In a user manual it is shown at scale {scale}:1. How many centimeters tall is the battery in the manual?"
        },
        {
            id: "scale_enlcm_butterflyscale",
            sv: "Ett fjäll från en fjärilsvinge är {realMm} mm långt. En forskningsplansch visar fjället i skala {scale}:1. Hur många centimeter långt är fjället på planschen?",
            en: "A scale from a butterfly wing is {realMm} mm long. A research poster displays the scale at magnification {scale}:1. How many centimeters long is the scale on the poster?"
        },
        {
            id: "scale_enlcm_engravinggroove",
            sv: "Ett graverat spår i en guldring är {realMm} mm djupt. En guldsmed granskar en bild i skala {scale}:1. Hur många centimeter djupt visas spåret på bilden?",
            en: "An engraved groove on a gold ring is {realMm} mm deep. A jeweler inspects an image at scale {scale}:1. How many centimeters deep is the groove shown on the image?"
        },
        {
            id: "scale_enlcm_cellmembrane",
            sv: "En encellig organism är {realMm} mm lång. På en projektorduk i labbet projiceras organismen i skala {scale}:1. Hur många centimeter lång är organismen på duken?",
            en: "A single-celled organism is {realMm} mm long. On a projector screen in the lab, it is displayed at scale {scale}:1. How many centimeters long is the organism on the screen?"
        },
        {
            id: "scale_enlcm_threadthickness",
            sv: "En operationssytråd har en tjocklek på {realMm} mm. I en kirurgisk handbok visas tråden i skalan {scale}:1. Hur många centimeter tjock är tråden i handboken?",
            en: "A surgical suture has a thickness of {realMm} mm. In a surgery handbook, the suture is illustrated at scale {scale}:1. How many centimeters thick is the thread in the handbook?"
        },
        {
            id: "scale_enlcm_sandflea",
            sv: "En sandloppa är {realMm} mm lång i verkligheten. I en marinbiologisk atlas förstoras den med skalan {scale}:1. Hur många centimeter lång är loppan i atlasen?",
            en: "A sand flea is {realMm} mm long in reality. In a marine biology atlas it is magnified by scale {scale}:1. How many centimeters long is the flea in the atlas?"
        },
        {
            id: "scale_enlcm_needleeye",
            sv: "Ögat på en mycket tunn synål är {realMm} mm brett. På en instruktionsskylt förstoras nålen i skala {scale}:1. Hur många centimeter brett är nålsögat på skylten?",
            en: "The eye of an ultra-fine sewing needle is {realMm} mm wide. On an instruction sign, the needle is magnified at scale {scale}:1. How many centimeters wide is the eye on the sign?"
        },
        {
            id: "scale_enlcm_flameparticle",
            sv: "En sotpartikel från ett ljus mäter {realMm} mm. En miljörapport visar partikeln i skala {scale}:1. Hur många centimeter mäter sotpartikeln på rapportbilden?",
            en: "A soot particle from a candle measures {realMm} mm. An environmental report depicts the particle at scale {scale}:1. How many centimeters does the particle measure on the report image?"
        }
    ],

    // =========================================================================
    // 🎯 6. DETERMINE SCALE (BLUEPRINT / METERS) (Placeholders: {picCm}, {realM})
    // Context: scale_determine_ratio
    // =========================================================================
    scale_determine_ratio: [
        {
            id: "scale_det_livingroom",
            sv: "Ett vardagsrum är {realM} meter långt i verkligheten. På planritningen ritas det med längden {picCm} cm. Vilken skala är ritningen gjord i? Svara som 1:...",
            en: "A living room is {realM} meters long in reality. On the floor plan, it is drawn with a length of {picCm} cm. What scale is the drawing made in? Answer as 1:..."
        },
        {
            id: "scale_det_storagegarage",
            sv: "Ett garage har den verkliga bredden {realM} meter. På bygglovsritningen är bredden {picCm} cm. Vilken skala har bygglovsritningen? Svara som 1:...",
            en: "A garage has a real width of {realM} meters. On the building permit drawing, the width is {picCm} cm. What scale does the permit drawing use? Answer as 1:..."
        },
        {
            id: "scale_det_classroom",
            sv: "Ett klassrum är {realM} meter långt. På en arkitektskiss är rummet {picCm} cm långt. Bestäm ritningens skala på formen 1:...",
            en: "A classroom is {realM} meters long. On an architectural sketch, the room is {picCm} cm long. Determine the scale of the sketch in the format 1:..."
        },
        {
            id: "scale_det_balcony",
            sv: "En inglasad balkong har längden {realM} meter i verkligheten. På en fasadritning är balkongen {picCm} cm lång. Vilken skala är fasadritningen ritad i?",
            en: "A glazed balcony has a real-world length of {realM} meters. On an elevation drawing, the balcony is {picCm} cm long. What scale is the elevation drawing in?"
        },
        {
            id: "scale_det_gardenshed",
            sv: "Ett trädgårdsskjul är {realM} meter brett. På tomtritningen mäter skjulet {picCm} cm. Bestäm skalan på formen 1:...",
            en: "A garden shed is {realM} meters wide. On the plot layout, the shed measures {picCm} cm. Determine the scale in the format 1:..."
        },
        {
            id: "scale_det_swimmingpool",
            sv: "En trädgårdspool är {realM} meter lång. På en tomtkarta har poolen ritats med längden {picCm} cm. Vilken skala har kartan?",
            en: "A backyard pool is {realM} meters long. On a property plan, the pool has been drawn with length {picCm} cm. What is the scale of the plan?"
        },
        {
            id: "scale_det_greenhousewall",
            sv: "Långsidan på ett växthus är {realM} meter i verkligheten. På konstruktionsritningen är sidan {picCm} cm. Vilken skala är ritningen ritad i?",
            en: "The long wall of a greenhouse is {realM} meters in reality. On the design layout, the side is {picCm} cm. What scale is the drawing made to?"
        },
        {
            id: "scale_det_carport",
            sv: "En carport mäter {realM} meter i verkligheten. På byggritningen är måttet {picCm} cm. Ange ritningens skala på formen 1:...",
            en: "A carport measures {realM} meters in reality. On the blueprint, the dimension is {picCm} cm. State the drawing's scale as 1:..."
        },
        {
            id: "scale_det_patioawning",
            sv: "En terrassmarkis är {realM} meter bred i utfällt läge. På en skiss mäter den {picCm} cm. Bestäm skalan på formen 1:...",
            en: "A terrace awning is {realM} meters wide when deployed. On a sketch, it measures {picCm} cm. Determine the scale in the format 1:..."
        },
        {
            id: "scale_det_woodendeck",
            sv: "Ett altandäck har längden {realM} meter. På byggskissen är altandäcket {picCm} cm långt. Vilken skala är skissen uppritad i?",
            en: "A wooden deck has a length of {realM} meters. On the building sketch, the deck is {picCm} cm long. In what scale was the sketch prepared?"
        },
        {
            id: "scale_det_conferencetable",
            sv: "Ett konferensbord i ett kontor är {realM} meter långt. På inredningsritningen är bordet {picCm} cm långt. Vilken skala har inredningsritningen?",
            en: "A conference table in an office is {realM} meters long. On the interior blueprint, the table is {picCm} cm long. What scale does the blueprint use?"
        },
        {
            id: "scale_det_boatjetty",
            sv: "En båtbrygga är {realM} meter lång i verkligheten. På sjötomtskartan är bryggan {picCm} cm. Ange kartans skala på formen 1:...",
            en: "A boat jetty is {realM} meters long in reality. On the shoreline map, the jetty is {picCm} cm. Give the scale of the map in the form 1:..."
        },
        {
            id: "scale_det_storagecontainer",
            sv: "En fraktcontainer har längden {realM} meter. På hamnterminalens planritning är containern {picCm} cm lång. Vilken skala gäller för ritningen?",
            en: "A shipping container is {realM} meters long. On the terminal blueprint, the container is {picCm} cm long. What scale applies to the drawing?"
        },
        {
            id: "scale_det_housedoor",
            sv: "En villadörr är {realM} meter hög i verkligheten. På snittritningen av villan mäter dörren {picCm} cm. Bestäm snittritningens skala på formen 1:...",
            en: "A house door is {realM} meters tall in reality. On the sectional drawing, the door measures {picCm} cm. Determine the scale in the form 1:..."
        },
        {
            id: "scale_det_padelcourt",
            sv: "En padelbana är {realM} meter lång i verkligheten. På en hallskiss ritas banan med måttet {picCm} cm. Vilken skala är hallskissen upprättad i?",
            en: "A padel court is {realM} meters long in reality. On a sports center layout, the court is drawn with length {picCm} cm. What scale is the layout drawn in?"
        }
    ],

    // =========================================================================
    // 🎯 7. DETERMINE SCALE (MAP / KM) (Placeholders: {picCm}, {realKm})
    // Context: scale_determine_map_ratio
    // =========================================================================
    scale_determine_map_ratio: [
        {
            id: "scale_det_hikingtrail",
            sv: "Fågelvägen mellan två sjöar är {realKm} km i verkligheten. På en vandringskarta mäts samma avstånd till {picCm} cm. Vilken är kartans skala? Svara som 1:...",
            en: "The straight-line distance between two lakes is {realKm} km in reality. On a hiking map, the same distance measures {picCm} cm. What is the map's scale? Answer as 1:..."
        },
        {
            id: "scale_det_citydistance",
            sv: "Avståndet mellan två tätorter är {realKm} km. På en länskarta är sträckan {picCm} cm. Bestäm kartans skala på formen 1:...",
            en: "The distance between two towns is {realKm} km. On a county map, the distance is {picCm} cm. Determine the scale of the map in the format 1:..."
        },
        {
            id: "scale_det_bicycleroute",
            sv: "En cykelled är {realKm} km lång. På en turistkarta mäter cykelleden {picCm} cm mellan start och mål. Vilken skala är kartan tryckt i?",
            en: "A cycling trail is {realKm} km long. On a tourist map, the trail measures {picCm} cm from start to finish. What scale is the map printed in?"
        },
        {
            id: "scale_det_islandsound",
            sv: "Bredden på ett sund mellan två öar är {realKm} km i verkligheten. På sjökortet är sundet {picCm} cm brett. Bestäm sjökortets skala på formen 1:...",
            en: "The width of a sound between two islands is {realKm} km in reality. On the nautical chart, the sound is {picCm} cm wide. Determine the scale as 1:..."
        },
        {
            id: "scale_det_forestreserve",
            sv: "Längden på ett naturreservat är {realKm} km. På en översiktskarta är reservatets gräns {picCm} cm lång. Vilken skala har kartan?",
            en: "The length of a nature reserve is {realKm} km. On an overview map, the reserve's border is {picCm} cm long. What scale does the map have?"
        },
        {
            id: "scale_det_motorwaysegment",
            sv: "En ny motorvägssträcka mäter {realKm} km i verkligheten. På en vägkarta är sträckan {picCm} cm. Bestäm vägkartans skala på formen 1:...",
            en: "A new motorway segment measures {realKm} km in reality. On a road map, the segment is {picCm} cm. Determine the scale in the form 1:..."
        },
        {
            id: "scale_det_powerline",
            sv: "En högspänningsledning sträcker sig {realKm} km genom landskapet. På en elnätskarta är linjen {picCm} cm lång. Vilken skala är elnätskartan ritad i?",
            en: "A high-voltage power line stretches {realKm} km across the terrain. On a grid map, the line is {picCm} cm long. In what scale is the grid map drawn?"
        },
        {
            id: "scale_det_canoeroute",
            sv: "En kanotled längs en älv är {realKm} km lång fågelvägen. På paddlingskartan mäter sträckan {picCm} cm. Ange kartans skala på formen 1:...",
            en: "A canoe route along a river is {realKm} km as the crow flies. On the paddle map, the distance measures {picCm} cm. State the scale in the form 1:..."
        },
        {
            id: "scale_det_railwaylink",
            sv: "Avståndet mellan två järnvägsstationer är {realKm} km. På en tågtidtabellskarta mäter spåret {picCm} cm. Vilken skala har spårkartan?",
            en: "The distance between two railway stations is {realKm} km. On a transit route map, the track measures {picCm} cm. What is the scale of the route map?"
        },
        {
            id: "scale_det_skitrail",
            sv: "Ett längdskidspår i fjällen är {realKm} km långt. På pistkartan är spåret utritat med längden {picCm} cm. Bestäm skalan på formen 1:...",
            en: "A cross-country ski track in the mountains is {realKm} km long. On the trail map, the track is drawn with length {picCm} cm. Determine the scale as 1:..."
        },
        {
            id: "scale_det_commuterline",
            sv: "En pendelbusslinje färdas {realKm} km mellan två ändhållplatser. På linjekartan mäter sträckan {picCm} cm. Vilken skala är linjekartan ritad i?",
            en: "A commuter bus line travels {realKm} km between two terminals. On the transit diagram, the line measures {picCm} cm. In what scale is the transit diagram drawn?"
        },
        {
            id: "scale_det_coastlinewalk",
            sv: "En kustled för vandrare är {realKm} km lång. På kommunens friluftskarta mäter sträckan {picCm} cm. Ange kartans skala på formen 1:...",
            en: "A coastal walking path is {realKm} km long. On the municipal recreation map, the path measures {picCm} cm. State the scale in the form 1:..."
        },
        {
            id: "scale_det_marathoncourse",
            sv: "Ett motionslopp har en distans på {realKm} km. På banskissen är loppets sträcka {picCm} cm lång. Vilken skala är banskissen ritad i?",
            en: "A fun run course has a distance of {realKm} km. On the course diagram, the route is {picCm} cm long. What scale is the diagram drawn in?"
        },
        {
            id: "scale_det_airportsurveillance",
            sv: "Övervakningsradien runt en flygplats är {realKm} km. På flygledarens radarskärm motsvarar denna radie {picCm} cm. Bestäm skalan på formen 1:...",
            en: "The surveillance perimeter around an airport is {realKm} km. On the air traffic radar display, this radius equals {picCm} cm. Determine the scale as 1:..."
        },
        {
            id: "scale_det_windfarmboundary",
            sv: "Bredden på en havsbaserad vindkraftspark är {realKm} km i verkligheten. På sjökortet är parkens zon {picCm} cm bred. Vilken skala är sjökortet ritat i?",
            en: "The width of an offshore wind farm zone is {realKm} km in reality. On the nautical chart, the zone is {picCm} cm wide. In what scale is the chart drawn?"
        }
    ]
};