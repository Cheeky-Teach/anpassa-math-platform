// src/core/utils/stories/volume.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

// =========================================================================
// 🎯 1. CUBOID VOLUME: {l}, {b}, {h}
// =========================================================================
const CUBOID_STORIES: StoryScenario[] = [
    {
        id: "vol_cub_aquarium",
        sv: "Ett akvarium har längden {l} cm, bredden {b} cm och höjden {h} cm. Hur stor är akvariets volym i cm³?",
        en: "An aquarium has a length of {l} cm, a width of {b} cm, and a height of {h} cm. What is its volume in cm³?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_moving_box",
        sv: "En flyttkartong har längden {l} cm, bredden {b} cm och höjden {h} cm. Beräkna kartongens totala volym.",
        en: "A moving box has a length of {l} cm, a width of {b} cm, and a height of {h} cm. Calculate the total volume of the box.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_plastic_box",
        sv: "En förvaringsbox av plast är {l} cm lång, {b} cm bred och {h} cm hög. Vad blir boxens volym i cm³?",
        en: "A plastic storage container is {l} cm long, {b} cm wide, and {h} cm tall. What is the volume of the container in cm³?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_sandbox",
        sv: "En sandlåda har längden {l} m, bredden {b} m och djupet {h} m. Hur många kubikmeter rymmer lådan?",
        en: "A sandbox has a length of {l} m, a width of {b} m, and a depth of {h} m. How many cubic meters does it hold?",
        rules: { minResult: 0.01 }
    },
    {
        id: "vol_cub_freezer",
        sv: "En frysbox har innermåtten längd {l} cm, bredd {b} cm och höjd {h} cm. Beräkna frysboxens volym.",
        en: "A freezer box has internal dimensions of length {l} cm, width {b} cm, and height {h} cm. Calculate its volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_brick",
        sv: "En tegelsten har måtten {l} cm, {b} cm och {h} cm. Vad blir stenens volym i cm³?",
        en: "A brick has dimensions of {l} cm, {b} cm, and {h} cm. What is the volume of the brick in cm³?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_suitcase",
        sv: "En resväska har måtten {l} cm gånger {b} cm, och höjden {h} cm. Hur stor är packvolymen i cm³?",
        en: "A suitcase measures {l} cm by {b} cm, with a height of {h} cm. What is the packing volume in cm³?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_chocolate_piece",
        sv: "En bit choklad är formad som ett litet rätblock med längden {l} mm, bredden {b} mm och höjden {h} mm. Beräkna chokladbitens volym.",
        en: "A piece of chocolate is shaped like a small rectangular block with length {l} mm, width {b} mm, and height {h} mm. Calculate its volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_sugarcube",
        sv: "En sockerbit har måtten {l} mm, {b} mm och höjden {h} mm. Vilken volym har sockerbiten?",
        en: "A sugar cube has dimensions of {l} mm, {b} mm, and a height of {h} mm. What is the volume of the sugar cube?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_wooden_beam",
        sv: "En träbalk har en rektangulär profil med måtten {l} cm och {b} cm. Längden är {h} cm. Beräkna balkens totala volym.",
        en: "A wooden beam has rectangular cross-section measurements of {l} cm and {b} cm. Its length is {h} cm. Calculate its total volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_shoebox",
        sv: "En skokartong är {l} cm lång, {b} cm bred och {h} cm hög. Vad är skokartongens volym?",
        en: "A shoebox is {l} cm long, {b} cm wide, and {h} cm tall. What is the volume of the shoebox?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_milk_carton",
        sv: "Ett mjölkpaket har basmåtten {l} cm och {b} cm samt höjden {h} cm. Beräkna paketets volym.",
        en: "A milk carton has base dimensions of {l} cm and {b} cm, and a height of {h} cm. Calculate the volume of the carton.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_eraser",
        sv: "Ett suddgummi är {l} mm långt, {b} mm brett och {h} mm tjockt. Bestäm suddgummits volym.",
        en: "An eraser is {l} mm long, {b} mm wide, and {h} mm thick. Determine the volume of the eraser.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_giftbox",
        sv: "En presentbox har längden {l} cm, bredden {b} cm och höjden {h} cm. Hur mycket rymmer boxen?",
        en: "A gift box has a length of {l} cm, a width of {b} cm, and a height of {h} cm. How much volume does the box hold?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_shed",
        sv: "En liten stuga har basen {l} m gånger {b} m samt höjden {h} m. Beräkna skjulets inre volym.",
        en: "A small shed has a base of {l} m by {b} m, and a height of {h} m. Calculate the internal volume of the shed.",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_cub_matchbox",
        sv: "En tändsticksask har måtten {l} mm, {b} mm och {h} mm. Vad blir tändsticksaskens volym?",
        en: "A matchbox has dimensions of {l} mm, {b} mm, and {h} mm. What is the volume of the matchbox?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_styrofoam",
        sv: "En bit frigolit är {l} cm lång, {b} cm bred och {h} cm tjock. Beräkna volymen på frigolitbiten.",
        en: "A piece of styrofoam is {l} cm long, {b} cm wide, and {h} cm thick. Calculate the volume of the piece.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_storage_unit",
        sv: "Ett förråd har längden {l} m, bredden {b} m och höjden {h} m. Vilken volym har förrådet?",
        en: "A storage unit has a length of {l} m, a width of {b} m, and a height of {h} m. What is the volume of the storage unit?",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_cub_soap_bar",
        sv: "En bit tvål har måtten {l} mm gånger {b} mm och höjden {h} mm. Bestäm tvålens volym.",
        en: "A bar of soap has dimensions of {l} mm by {b} mm and a height of {h} mm. Determine the volume of the soap.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cub_toolbox",
        sv: "En verktygslåda är {l} cm lång, {b} cm bred och {h} cm hög. Beräkna verktygslådans volym.",
        en: "A tool box is {l} cm long, {b} cm wide, and {h} cm tall. Calculate the volume of the tool box.",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 2. TRIANGULAR PRISM VOLUME: {b}, {hTri}, {hPrism}
// =========================================================================
const PRISM_STORIES: StoryScenario[] = [
    {
        id: "vol_prism_tent",
        sv: "Ett tält har formen av ett prisma. Triangelns bas är {b} m och höjden är {hTri} m. Tältets längd är {hPrism} m. Hur stor är volymen?",
        en: "A tent is shaped like a prism. The triangle base is {b} m and its height is {hTri} m. The length of the tent is {hPrism} m. What is its volume?",
        rules: { minResult: 0.01 }
    },
    {
        id: "vol_prism_cheese_wedge",
        sv: "En ostbit är skuren som ett prisma. Triangelbasen är {b} cm, höjden är {hTri} cm och tjockleken är {hPrism} cm. Beräkna ostens volym.",
        en: "A wedge of cheese is shaped like a prism. The triangle base is {b} cm, the height is {hTri} cm, and its thickness is {hPrism} cm. Calculate the volume of the cheese.",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_prism_chocolate_box",
        sv: "En chokladask har triangulära gavlar med basen {b} cm och höjden {hTri} cm. Kartongens längd är {hPrism} cm. Vad är volymen i cm³?",
        en: "A chocolate box has triangular ends with a base of {b} cm and a height of {hTri} cm. The length of the box is {hPrism} cm. What is the volume in cm³?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_glass_roof",
        sv: "Ett glastak över en gång har en triangelprofil med basen {b} m och höjden {hTri} m. Gångens längd är {hPrism} m. Beräkna takets volym.",
        en: "A glass roof over a walkway has a triangular profile with base {b} m and height {hTri} m. The total length of the walkway is {hPrism} m. Calculate the volume.",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_prism_doorstop",
        sv: "Ett dörrstopp av trä är format som ett prisma. Basen är {b} cm, höjden är {hTri} cm och bredden är {hPrism} cm. Beräkna trävolymen.",
        en: "A wooden doorstop is shaped like a prism. The base is {b} cm, the height is {hTri} cm, and the width is {hPrism} cm. Calculate the volume of the wood.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_cake_slice",
        sv: "En bit tårta är skuren som ett triangulärt prisma. Basen är {b} cm, höjden är {hTri} cm och tårtbitens bredd är {hPrism} cm. Beräkna volymen.",
        en: "A slice of cake is shaped like a triangular prism. The base is {b} cm, the height is {hTri} cm, and the width of the slice is {hPrism} cm. Calculate the volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_glass_experiment",
        sv: "Ett prisma av glas i ett experiment har en triangelbas på {b} mm, höjden {hTri} mm och längden {hPrism} mm. Bestäm dess volym.",
        en: "A glass prism in an experiment has a triangle base of {b} mm, a height of {hTri} mm, and a length of {hPrism} mm. Determine its volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_sand_pile",
        sv: "En sandhög har formats som ett prisma med en triangelbas på {b} m, höjd {hTri} m och längd {hPrism} m. Beräkna sandhögens volym.",
        en: "A pile of sand is shaped like a prism with a triangle base of {b} m, height {hTri} m, and length {hPrism} m. Calculate the volume of the pile.",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_prism_greenhouse_roof",
        sv: "Ett litet växthustak har en triangulär gavel med basen {b} m och höjden {hTri} m. Takets längd är {hPrism} m. Vad blir takets volym?",
        en: "A small greenhouse roof has a triangular gable with base {b} m and height {hTri} m. The length of the roof is {hPrism} m. What is the volume?",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_prism_sandwich_box",
        sv: "En förpackning för smörgåsar har en triangelsida med basen {b} cm och höjden {hTri} cm. Djupet är {hPrism} cm. Beräkna förpackningens volym.",
        en: "A sandwich container has a triangular side with base {b} cm and height {hTri} cm. Its depth is {hPrism} cm. Calculate the container's volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_metal_scrap",
        sv: "En bit metallskrot har formen av ett prisma. Triangelns bas är {b} mm, höjden är {hTri} mm och längden är {hPrism} mm. Vad är volymen?",
        en: "A piece of scrap metal is shaped like a prism. The triangle base is {b} mm, the height is {hTri} mm, and the length is {hPrism} mm. What is the volume?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_animal_trough",
        sv: "Ett fodertråg för djur har triangulära kortsidor med basen {b} cm och höjden {hTri} cm. Trågets längd är {hPrism} cm. Beräkna trågets volym.",
        en: "An animal feeding trough has triangular short sides with base {b} cm and height {hTri} cm. The length of the trough is {hPrism} cm. Calculate its volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_sanding_block",
        sv: "En slipkloss av plast har en triangelprofil med måtten bas {b} cm och höjd {hTri} cm. Klossens längd är {hPrism} cm. Bestäm klossens volym.",
        en: "A plastic sanding block has a triangular profile with base {b} cm and height {hTri} cm. The block's length is {hPrism} cm. Determine its volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_cardboard_fold",
        sv: "En kartongbit är vikt som ett ihåligt prisma. Basen är {b} cm, höjden {hTri} cm och längden är {hPrism} cm. Beräkna den inneslutna volymen.",
        en: "A piece of cardboard is folded as a hollow prism. The base is {b} cm, the height is {hTri} cm, and the length is {hPrism} cm. Calculate the enclosed volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_exhibition_stand",
        sv: "Ett utställningsställ har en triangulär profil med basen {b} m, höjd {hTri} m och längden {hPrism} m. Hur stor är ställets volym?",
        en: "An exhibition stand has a triangular profile with base {b} m, height {hTri} m, and length {hPrism} m. How large is the volume of the stand?",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_prism_decorative_stone",
        sv: "En dekorsten är slipad som ett prisma. Triangelbasen är {b} cm, höjden är {hTri} cm och längden är {hPrism} cm. Beräkna stenens volym.",
        en: "A decorative stone is cut as a prism. The triangle base is {b} cm, the height is {hTri} cm, and the length is {hPrism} cm. Calculate the stone's volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_ramp_model",
        sv: "En modell av en ramp har en triangelsida med basen {b} cm och höjden {hTri} cm. Rampens bredd är {hPrism} cm. Bestäm modellens volym.",
        en: "A model of a ramp has a triangular side with base {b} cm and height {hTri} cm. The width of the ramp is {hPrism} cm. Determine the model's volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_glass_paperweight",
        sv: "En pappersvikt i glas är formad som ett prisma. Triangelbasen är {b} mm, höjden är {hTri} mm och längden är {hPrism} mm. Beräkna volymen.",
        en: "A glass paperweight is shaped like a prism. The triangle base is {b} mm, the height is {hTri} mm, and the length is {hPrism} mm. Calculate the volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_wax_block",
        sv: "En bit vax är gjuten som ett triangulärt prisma. Basen är {b} cm, höjden är {hTri} cm och längden är {hPrism} cm. Vad blir vaxbitens volym?",
        en: "A block of wax is cast as a triangular prism. The base is {b} cm, the height is {hTri} cm, and the length is {hPrism} cm. What is the volume of the wax block?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_prism_gutter_section",
        sv: "En ränna har en triangelformad profil med basen {b} cm och höjden {hTri} cm. Rännans längd är {hPrism} cm. Beräkna rännans totala volym.",
        en: "A section of gutter has a triangular profile with base {b} cm and height {hTri} cm. The length of the gutter is {hPrism} cm. Calculate the total volume.",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 3. CYLINDER VOLUME: {r}, {h}
// =========================================================================
const CYLINDER_STORIES: StoryScenario[] = [
    {
        id: "vol_cyl_soda_can",
        sv: "En läskburk har en bottenradie på {r} cm och höjden {h} cm. Beräkna läskburkens volym i cm³.",
        en: "A soda can has a base radius of {r} cm and a height of {h} cm. Calculate the volume of the soda can in cm³.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_pillar_candle",
        sv: "Ett pelarljus har radien {r} cm och höjden {h} cm. Vad blir ljusets volym i kubikcentimeter?",
        en: "A pillar candle has a radius of {r} cm and a height of {h} cm. What is the volume of the candle in cubic centimeters?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_round_pipe",
        sv: "Ett runt rör har en innerradie på {r} cm och är {h} cm långt. Hur stor volym ryms inuti röret?",
        en: "A round pipe has an internal radius of {r} cm and is {h} cm long. How much volume fits inside the pipe?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_oil_barrel",
        sv: "En oljetunna har en cylindrisk form med radien {r} dm och höjden {h} dm. Hur många liter (dm³) rymmer tunnan?",
        en: "An oil barrel has a cylindrical shape with a radius of {r} dm and a height of {h} dm. How many liters (dm³) does the barrel hold?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_glass_mug",
        sv: "En rund glasmugg har innerradien {r} cm och höjden {h} cm. Beräkna muggens volym.",
        en: "A round glass mug has an internal radius of {r} cm and a height of {h} cm. Calculate the volume of the mug.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_round_battery",
        sv: "Ett runt batteri har radien {r} mm och höjden {h} mm. Bestäm batteriets totala volym.",
        en: "A round battery has a radius of {r} mm and a height of {h} mm. Determine the total volume of the battery.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_wooden_dowel",
        sv: "En rund trästav har radien {r} cm och längden {h} cm. Beräkna trästavens volym.",
        en: "A piece of wooden dowel has a radius of {r} cm and a length of {h} cm. Calculate the volume of the wooden stick.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_tin_can",
        sv: "En konservburk har radien {r} cm och höjden {h} cm. Vilken volym har burken i cm³?",
        en: "A tin can has a radius of {r} cm and a height of {h} cm. What volume does the can have in cm³?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_water_hose",
        sv: "En vattenslang har innerradien {r} cm och längden {h} cm. Hur stor volym vatten ryms i slangen?",
        en: "A water hose has an internal radius of {r} cm and a length of {h} cm. What volume of water fits inside the hose?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_cake_pan",
        sv: "En rund tårtform har radien {r} cm och höjden {h} cm. Beräkna tårtformens volym.",
        en: "A round cake pan has a radius of {r} cm and a height of {h} cm. Calculate the volume of the cake pan.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_chalk",
        sv: "En rund krita har radien {r} mm och längden {h} mm. Vad blir kritans volym?",
        en: "A round piece of chalk has a radius of {r} mm and a length of {h} mm. What is the volume of the chalk?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_thermos",
        sv: "En termos har innerradien {r} cm och höjden {h} cm. Beräkna hur mycket vätska termosen rymmer.",
        en: "A thermos has an internal radius of {r} cm and a height of {h} cm. Calculate how much liquid the thermos holds.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_paper_towel_roll",
        sv: "En rund rulle med hushållspapper har radien {r} cm och höjden {h} cm. Bestäm pappersrullens volym.",
        en: "A round roll of paper towels has a radius of {r} cm and a height of {h} cm. Determine the volume of the paper roll.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_vase",
        sv: "En cylindrisk vas har innerradien {r} cm och höjden {h} cm. Hur stor volym har vasen?",
        en: "A cylindrical vase has an internal radius of {r} cm and a height of {h} cm. What is the volume of the vase?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_metal_bolt",
        sv: "En rund metallbult har radien {r} mm och längden {h} mm. Beräkna bultens volym.",
        en: "A round metal bolt has a radius of {r} mm and a length of {h} mm. Calculate the volume of the bolt.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_rain_barrel",
        sv: "En tunna för regnvatten har radien {r} cm och höjden {h} cm. Beräkna tunnans totala volym.",
        en: "A barrel for rainwater has a radius of {r} cm and a height of {h} cm. Calculate the total volume of the barrel.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_tablet_pill",
        sv: "Ett rörformat piller har radien {r} mm och tjockleken {h} mm. Bestäm pillrets volym.",
        en: "A tablet shaped like a cylinder has a radius of {r} mm and a thickness of {h} mm. Determine the volume of the tablet.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_tree_trunk",
        sv: "En rund trädstam har en snittradie på {r} cm och längden {h} cm. Beräkna stammens volym.",
        en: "A round tree trunk has a cross-section radius of {r} cm and a length of {h} cm. Calculate the volume of the trunk.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_plastic_pipe",
        sv: "Ett runt rör av plast har innerradien {r} cm och längden {h} cm. Vad blir plaströrets inre volym?",
        en: "A round plastic pipe has an internal radius of {r} cm and a length of {h} cm. What is the internal volume of the pipe?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cyl_paint_can",
        sv: "En cylindrisk färgburk har radien {r} cm och höjden {h} cm. Beräkna färgburkens volym.",
        en: "A cylindrical paint can has a radius of {r} cm and a height of {h} cm. Calculate the volume of the paint can.",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 4. PYRAMID VOLUME: {side}, {h}
// =========================================================================
const PYRAMID_STORIES: StoryScenario[] = [
    {
        id: "vol_pyr_glass_ornament",
        sv: "En glasprydnad är formad som en pyramid med en kvadratisk bas där sidan är {side} cm. Höjden är {h} cm. Beräkna pyramidens volym.",
        en: "A glass ornament is shaped like a pyramid with a square base of side {side} cm. Its height is {h} cm. Calculate the volume of the pyramid.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_tower_roof",
        sv: "Ett tak på ett torn har formen av en kvadratisk pyramid. Basens sida är {side} m och takets höjd är {h} m. Vad blir takets volym?",
        en: "A tower roof is shaped like a square pyramid. The base side is {side} m and the roof height is {h} m. What is the volume of the roof?",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_pyr_egyptian_model",
        sv: "En modell av en egyptisk pyramid har en kvadratisk bas med sidan {side} cm och en höjd på {h} cm. Beräkna modellens volym.",
        en: "A model of an Egyptian pyramid has a square base with side {side} cm and a height of {h} cm. Calculate the volume of the model.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_tent",
        sv: "Ett tält är byggt som en pyramid med kvadratisk bottenyta där sidan är {side} m. Höjden i mitten är {h} m. Beräkna tältets volym.",
        en: "A tent is built like a pyramid with a square base of side {side} m. The center height is {h} m. Calculate the volume of the tent.",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_pyr_paperweight",
        sv: "En pappersvikt av metall är formad som en pyramid med bassidan {side} cm and höjden {h} cm. Vad är pappersviktens volym?",
        en: "A metal paperweight is shaped like a pyramid with a base side of {side} cm and a height of {h} cm. What is the volume of the paperweight?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_chocolate",
        sv: "En chokladbit har formen av en liten kvadratisk pyramid. Basens sida är {side} mm och höjden är {h} mm. Beräkna chokladbitens volym.",
        en: "A piece of chocolate is shaped like a small square pyramid. The base side is {side} mm and the height is {h} mm. Calculate its volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_monument",
        sv: "Ett monument har en kvadratisk bas med sidan {side} m och en vinkelrät höjd på {h} m. Hur stor volym har monumentet?",
        en: "A monument has a square base with side {side} m and a perpendicular height of {h} m. What is the volume of the monument?",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_pyr_candlestick",
        sv: "En ljusstake har en pyramidformad ovandel. Bassidan är {side} cm och höjden på pyramiden är {h} cm. Bestäm ovandelens volym.",
        en: "A candlestick has a pyramid-shaped top. The base side is {side} cm and the height of the pyramid is {h} cm. Determine the top's volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_feed_hopper",
        sv: "En behållare för foder smalnar av som en uppochnedvänd pyramid. Öppningens sida är {side} cm och djupet är {h} cm. Beräkna behållarens volym.",
        en: "A feed hopper narrows like an inverted pyramid. The opening side is {side} cm and the depth is {h} cm. Calculate the volume of the hopper.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_game_space_object",
        sv: "Ett rymdobjekt i ett datorspel är format som en pyramid med bassidan {side} enheter och höjden {h} enheter. Vad blir objektets volym?",
        en: "A space object in a computer game is shaped like a pyramid with base side {side} units and height {h} units. What is the object's volume?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_crystal",
        sv: "En bit kristall har vuxit som en pyramid med en kvadratisk bas på {side} mm och en höjd på {h} mm. Beräkna kristallens volym.",
        en: "A crystal has grown like a pyramid with a square base of {side} mm and a height of {h} mm. Calculate the volume of the crystal.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_toy_block",
        sv: "Ett leksaksblock är format som en pyramid. Basens sida är {side} cm och höjden är {h} cm. Bestäm leksakens volym.",
        en: "A toy block is shaped like a pyramid. The base side is {side} cm and the height is {h} cm. Determine the volume of the toy.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_pillar_cap",
        sv: "En pelarhatt av betong har formen av en flack pyramid med bassidan {side} cm och höjden {h} cm. Beräkna betongvolymen.",
        en: "A concrete pillar cap is shaped like a flat pyramid with a base side of {side} cm and a height of {h} cm. Calculate the concrete volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_perfume_cap",
        sv: "En parfymflaska har en pyramidformad kork med bassidan {side} mm och höjden {h} mm. Hur stor volym har korken?",
        en: "A perfume bottle has a pyramid-shaped cap with a base side of {side} mm and a height of {h} mm. What is the volume of the cap?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_exhibition_monument",
        sv: "Ett litet utställningsmonument har en kvadratisk bas med sidan {side} cm och en höjd på {h} cm. Beräkna dess volym.",
        en: "A small exhibition monument has a square base with side {side} cm and a height of {h} cm. Calculate its volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_packaging_corner",
        sv: "En bit packmaterial är formad som en liten pyramid. Bassidan är {side} mm och höjden är {h} mm. Vad blir volymen?",
        en: "A piece of packaging material is shaped like a small pyramid. The base side is {side} mm and the height is {h} mm. What is the volume?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_puzzle_piece",
        sv: "Ett pussel består av bitar där en är en pyramid med bassidan {side} cm och höjden {h} cm. Bestäm bitens volym.",
        en: "A puzzle consists of pieces where one is a pyramid with base side {side} cm and height {h} cm. Determine the piece's volume.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_wood_block",
        sv: "En dekorativ träkloss är slipad som en pyramid. Bassidan mäter {side} cm och höjden är {h} cm. Beräkna träklossens volym.",
        en: "A decorative wooden block is cut like a pyramid. The base side measures {side} cm and the height is {h} cm. Calculate the volume of the block.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_plaster_mold",
        sv: "En liten gjutform för gips är en kvadratisk pyramid med bassidan {side} cm och höjden {h} cm. Vilken volym rymmer formen?",
        en: "A small plaster mold is a square pyramid with base side {side} cm and height {h} cm. What volume does the mold hold?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_pyr_metal_decor",
        sv: "Ett prydnadsföremål i metall har en kvadratisk bas med sidan {side} cm och höjden {h} cm. Beräkna föremålets volym.",
        en: "A metal decorative object has a square base with side {side} cm and a height of {h} cm. Calculate the object's volume.",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 5. CONE VOLUME: {r}, {h}
// =========================================================================
const CONE_STORIES: StoryScenario[] = [
    {
        id: "vol_cone_ice_cream",
        sv: "En glasstrut har radien {r} cm och höjden {h} cm. Hur stor volym glass ryms inuti struten om den fylls helt platt?",
        en: "An ice cream cone has a radius of {r} cm and a height of {h} cm. What volume of ice cream fits inside the cone if filled completely flat?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_party_hat",
        sv: "En festhatt har formen av en kon med radien {r} cm och höjden {h} cm. Beräkna hattens volym i cm³.",
        en: "A party hat is shaped like a cone with a radius of {r} cm and a height of {h} cm. Calculate the volume of the hat in cm³.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_funnel",
        sv: "En tratt har en konisk överdel med radien {r} cm och djupet {h} cm. Vilken volym rymmer trattens konformade del?",
        en: "A funnel has a conical top section with a radius of {r} cm and a depth of {h} cm. What volume does the conical part of the funnel hold?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_traffic_cone",
        sv: "En trafikkon har en radie på {r} cm vid basen och en höjd på {h} cm. Beräkna den totala volymen inuti konen.",
        en: "A traffic cone has a radius of {r} cm at the base and a height of {h} cm. Calculate the total volume inside the cone.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_gravel_pile",
        sv: "En hög med grus har formen av en kon med basradien {r} m och höjden {h} m. Hur stor volym har grushögen?",
        en: "A pile of gravel is shaped like a cone with a base radius of {r} m and a height of {h} m. What is the volume of the gravel pile?",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_cone_paper_cup",
        sv: "En dricksmugg av papper är konformad med radien {r} cm och höjden {h} cm. Beräkna muggens volym.",
        en: "A paper drinking cup is cone-shaped with a radius of {r} cm and a height of {h} cm. Calculate the volume of the cup.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_necklace_pendant",
        sv: "Ett litet konformat hänge till ett halsband har radien {r} mm och höjden {h} mm. Vad blir hängets volym?",
        en: "A small cone-shaped pendant for a necklace has a radius of {r} mm and a height of {h} mm. What is the volume of the pendant?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_tower_roof",
        sv: "En spetsig takdel på ett torn är en kon med radien {r} m och höjden {h} m. Beräkna takdelens inneslutna volym.",
        en: "A pointed roof section on a tower is a cone with a radius of {r} m and a height of {h} m. Calculate the enclosed volume of the roof.",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_cone_chalk_tip",
        sv: "En bit krita är vässad som en kon i änden med radien {r} mm och höjden {h} mm. Beräkna volymen på den konformade spetsen.",
        en: "A piece of chalk is sharpened into a cone at the end with radius {r} mm and height {h} mm. Calculate the volume of the conical tip.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_volcano_model",
        sv: "En modell av en vulkan är formad som en kon med radien {r} cm och höjden {h} cm. Bestäm vulkanmodellens volym.",
        en: "A model of a volcano is shaped like a cone with a radius of {r} cm and a height of {h} cm. Determine the volume of the volcano model.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_spinning_top",
        sv: "En leksakssnurra har en konformad underdel med radien {r} cm och höjden {h} cm. Beräkna snurrans volym under basen.",
        en: "A toy spinning top has a cone-shaped bottom with a radius of {r} cm and a height of {h} cm. Calculate its volume below the base.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_lamp_shade",
        sv: "En taklampa sprider ljus i en konformad skärm med radien {r} cm och höjden {h} cm. Vad blir skärmens volym?",
        en: "A ceiling lamp has a cone-shaped shade with a radius of {r} cm and a height of {h} cm. What is the volume of the shade?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_plumb_bob",
        sv: "Ett litet koniskt viktlod har radien {r} mm och höjden {h} mm. Bestäm viktlodets volym.",
        en: "A small conical weight plumb bob has a radius of {r} mm and a height of {h} mm. Determine the volume of the plumb bob.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_grain_bin",
        sv: "En förvaringsbehållare för säd slutar i en kon med radien {r} m och höjden {h} m. Beräkna volymen på den koniska delen.",
        en: "A grain storage bin ends in a cone with a radius of {r} m and a height of {h} m. Calculate the volume of the conical section.",
        rules: { minResult: 0.1 }
    },
    {
        id: "vol_cone_candy",
        sv: "En bit godis har formen av en kon med radien {r} mm och höjden {h} mm. Beräkna godisbitens volym.",
        en: "A piece of candy is shaped like a cone with a radius of {r} mm and a height of {h} mm. Calculate the volume of the candy piece.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_glass_cone",
        sv: "En dekorativ glaskon har radien {r} cm och höjden {h} cm. Hur stor volym har glaskonen?",
        en: "A decorative glass cone has a radius of {r} cm and a height of {h} cm. What is the volume of the glass cone?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_lab_filter",
        sv: "Ett filter i ett experiment har en konisk form med radien {r} cm och djupet {h} cm. Beräkna filtrets volym.",
        en: "A filter in an experiment has a conical shape with a radius of {r} cm and a depth of {h} cm. Calculate the volume of the filter.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_wood_plug",
        sv: "En spetsig träplugg har radien {r} mm och höjden {h} mm. Bestäm pluggspetsens volym.",
        en: "A pointed wooden plug tip has a radius of {r} mm and a height of {h} mm. Determine the volume of the plug tip.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_perfume_bottle",
        sv: "En konformad parfymflaska har innerradien {r} cm och höjden {h} cm. Beräkna flaskans volym.",
        en: "A cone-shaped perfume bottle has an internal radius of {r} cm and a height of {h} cm. Calculate the volume of the bottle.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_cone_machine_tip",
        sv: "En spetsig metalldel på en maskin är en kon med radien {r} mm och höjden {h} mm. Vad blir delens volym?",
        en: "A pointed metal part on a machine is a cone with a radius of {r} mm and a height of {h} mm. What is the volume of the part?",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 6. SPHERE VOLUME: {r}
// =========================================================================
const SPHERE_STORIES: StoryScenario[] = [
    {
        id: "vol_sph_basketball",
        sv: "En basketboll har en radie på {r} cm. Beräkna bollens volym i kubikcentimeter.",
        en: "A basketball has a radius of {r} cm. Calculate the volume of the ball in cubic centimeters.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_marble",
        sv: "En glaskula har radien {r} mm. Vad är kulans volym i mm³?",
        en: "A glass marble has a radius of {r} mm. What is the volume of the marble in mm³?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_beachball",
        sv: "En badboll pumpas upp så att dess radie blir {r} cm. Beräkna badbollens volym.",
        en: "A beach ball is inflated so that its radius becomes {r} cm. Calculate the volume of the beach ball.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_lamp",
        sv: "En dekorationslampa har formen av ett perfekt klot med radien {r} cm. Vad blir lampans volym?",
        en: "A decorative lamp is shaped like a perfect sphere with a radius of {r} cm. What is the volume of the lamp?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_tennisball",
        sv: "En tennisboll har en radie på {r} cm. Beräkna tennisbollens volym.",
        en: "A tennis ball has a radius of {r} cm. Calculate the volume of the tennis ball.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_orange",
        sv: "En rund apelsin har en genomsnittlig radie på {r} cm. Bestäm apelsinens volym.",
        en: "A round orange has an average radius of {r} cm. Determine the volume of the orange.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_lead_sinker",
        sv: "Ett runt sänke av bly har radien {r} mm. Beräkna blykulans volym i mm³.",
        en: "A round lead sinker has a radius of {r} mm. Calculate the volume of the lead ball in mm³?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_globe",
        sv: "En rund glob har radien {r} cm. Hur stor volym har globen?",
        en: "A round globe has a radius of {r} cm. What is the volume of the globe?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_water_balloon",
        sv: "En rund vattenballong har radien {r} cm. Beräkna vattenballongens volym.",
        en: "A round water balloon has a radius of {r} cm. Calculate the volume of the water balloon.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_gumball",
        sv: "Ett klotformat tuggummi har radien {r} mm. Vad blir tuggummits volym?",
        en: "A spherical gumball has a radius of {r} mm. What is the volume of the gumball?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_planet_model",
        sv: "En planetmodell i ett klassrum har radien {r} cm. Bestäm modellens volym.",
        en: "A planet model in a classroom has a radius of {r} cm. Determine the volume of the model.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_steel_bearing",
        sv: "En rund kula av stål i ett kullager har radien {r} mm. Beräkna stålkulans volym.",
        en: "A round steel ball in a bearing has a radius of {r} mm. Calculate the volume of the steel ball.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_chocolate_truffle",
        sv: "En rund chokladpralin har radien {r} mm. Beräkna chokladkulans volym.",
        en: "A round chocolate truffle has a radius of {r} mm. Calculate the volume of the chocolate truffle.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_glass_shade",
        sv: "En klotformad glaskupa till en lampa har radien {r} cm. Vad blir kupans volym?",
        en: "A spherical glass shade for a lamp has a radius of {r} cm. What is the volume of the shade?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_wooden_bead",
        sv: "En rund träkula i ett pysselset har radien {r} mm. Bestäm träkulans volym.",
        en: "A round wooden bead in a craft set has a radius of {r} mm. Determine the volume of the wooden bead.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_rubber_ball",
        sv: "Ett stort runt gummiklot på en lekplats har radien {r} cm. Beräkna klotets volym.",
        en: "A large round rubber sphere on a playground has a radius of {r} cm. Calculate the volume of the sphere.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_ice_ball",
        sv: "En rund isbit har radien {r} mm. Vad blir iskulans volym i mm³?",
        en: "A round ice ball has a radius of {r} mm. What is the volume of the ice ball in mm³?",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_styrofoam_ball",
        sv: "En rund boll av frigolit har radien {r} cm. Bestäm frigolitbollens volym.",
        en: "A round styrofoam ball has a radius of {r} cm. Determine the volume of the styrofoam ball.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_fishbowl",
        sv: "Ett runt akvarium har radien {r} cm. Beräkna akvariets totala volym om det fylls helt.",
        en: "A spherical fishbowl has a radius of {r} cm. Calculate the total volume of the fishbowl if filled completely.",
        rules: { minResult: 1 }
    },
    {
        id: "vol_sph_mic_windscreen",
        sv: "En klotformad mikrofonpuff har radien {r} mm. Beräkna puffens volym.",
        en: "A spherical microphone windscreen has a radius of {r} mm. Calculate the volume of the windscreen.",
        rules: { minResult: 1 }
    }
];

export const VOLUME_STORIES: Record<string, StoryScenario[]> = {
    // Standard keys matching SKILL_BUCKETS
    vol_cuboid_std: CUBOID_STORIES,
    vol_prism_std: PRISM_STORIES,
    vol_cylinder_std: CYLINDER_STORIES,
    vol_pyramid_std: PYRAMID_STORIES,
    vol_cone_std: CONE_STORIES,
    vol_sphere_std: SPHERE_STORIES,

    // Aliases for backwards compatibility
    volume_cuboid: CUBOID_STORIES,
    volume_prism: PRISM_STORIES,
    volume_cylinder: CYLINDER_STORIES,
    volume_pyramid: PYRAMID_STORIES,
    volume_cone: CONE_STORIES,
    volume_sphere: SPHERE_STORIES
};