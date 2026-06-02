// src/core/utils/stories/volume.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const VOLUME_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    //   1. CUBOID VOLUME (Key: volume_cuboid)
    //    Parameters parsed: {w} (bredd), {d} (djup/längd), {h} (höjd)
    // =========================================================================
    volume_cuboid: [
        { sv: "Ett akvarium har bredden {w} cm, djupet {d} cm och höjden {h} cm. Hur stor är akvariets volym i cm³?", en: "An aquarium has a width of {w} cm, a depth of {d} cm, and a height of {h} cm. What is its volume in cm³?" },
        { sv: "En flyttkartong har bredden {w} cm, djupet {d} cm och höjden {h} cm. Beräkna kartongens totala volym.", en: "A moving box has a width of {w} cm, a depth of {d} cm, and a height of {h} cm. Calculate the total volume of the box." },
        { sv: "En förvaringsbox av plast är {w} cm bred, {d} cm djup och {h} cm hög. Vad blir boxens volym i cm³?", en: "A plastic storage container is {w} cm wide, {d} cm deep, and {h} cm tall. What is the volume of the container in cm³?" },
        { sv: "En sandlåda har längden {w} m, bredden {d} m och djupet {h} m. Hur många kubikmeter rymmer lådan?", en: "A sandbox has a length of {w} m, a width of {d} m, and a depth of {h} m. How many cubic meters does it hold?" },
        { sv: "En frysbox har innermåtten bredd {w} cm, djup {d} cm och höjd {h} cm. Beräkna frysboxens volym.", en: "A freezer box has internal dimensions of width {w} cm, depth {d} cm, and height {h} cm. Calculate its volume." },
        { sv: "En tegelsten har måtten {w} cm, {d} cm och {h} cm. Vad blir stenens volym i cm³?", en: "A brick has dimensions of {w} cm, {d} cm, and {h} cm. What is the volume of the brick in cm³?" },
        { sv: "En resväska har måtten {w} cm gånger {d} cm, och höjden {h} cm. Hur stor är packvolymen i cm³?", en: "A suitcase measures {w} cm by {d} cm, with a height of {h} cm. What is the packing volume in cm³?" },
        { sv: "En bit choklad är formad som ett litet rätblock med bredden {w} mm, djupet {d} mm och höjden {h} mm. Beräkna chokladbitens volym.", en: "A piece of chocolate is shaped like a small rectangular block with width {w} mm, depth {d} mm, and height {h} mm. Calculate its volume." },
        { sv: "En sockerbit har måtten {w} mm, {d} mm och höjden {h} mm. Vilken volym har sockerbiten?", en: "A sugar cube has dimensions of {w} mm, {d} mm, and a height of {h} mm. What is the volume of the sugar cube?" },
        { sv: "En träbalk har en rektangulär profil med måtten {w} cm och {d} cm. Längden är {h} cm. Beräkna balkens totala volym.", en: "A wooden beam has rectangular cross-section measurements of {w} cm and {d} cm. Its length is {h} cm. Calculate its total volume." },
        { sv: "En skokartong är {w} cm bred, {d} cm djup och {h} cm hög. Vad är skokartongens volym?", en: "A shoebox is {w} cm wide, {d} cm deep, and {h} cm tall. What is the volume of the shoebox?" },
        { sv: "Ett mjölkpaket har basmåtten {w} cm och {d} cm samt höjden {h} cm. Beräkna paketets volym.", en: "A milk carton has base dimensions of {w} cm and {d} cm, and a height of {h} cm. Calculate the volume of the carton." },
        { sv: "Ett suddgummi är {w} mm brett, {d} mm långt och {h} mm tjockt. Bestäm suddgummits volym.", en: "An eraser is {w} mm wide, {d} mm long, and {h} mm thick. Determine the volume of the eraser." },
        { sv: "En presentbox har bredden {w} cm, längden {d} cm och höjden {h} cm. Hur mycket rymmer boxen?", en: "A gift box has a width of {w} cm, a length of {d} cm, and a height of {h} cm. How much volume does the box hold?" },
        { sv: "En liten stuga har basen {w} m gånger {d} m samt höjden {h} m. Beräkna skjulets inre volym.", en: "A small shed has a base of {w} m by {d} m, and a height of {h} m. Calculate the internal volume of the shed." },
        { sv: "En tändsticksask har måtten {w} mm, {d} mm och {h} mm. Vad blir tändsticksaskens volym?", en: "A matchbox has dimensions of {w} mm, {d} mm, and {h} mm. What is the volume of the matchbox?" },
        { sv: "En bit frigolit är {w} cm bred, {d} cm lång och {h} cm tjock. Beräkna volymen på frigolitbiten.", en: "A piece of styrofoam is {w} cm wide, {d} cm long, and {h} cm thick. Calculate the volume of the piece." },
        { sv: "Ett förråd har bredden {w} m, djupet {d} m och höjden {h} m. Vilken volym har förrådet?", en: "A storage unit has a width of {w} m, a depth of {d} m, and a height of {h} m. What is the volume of the storage unit?" },
        { sv: "En bit tvål har måtten {w} mm gånger {d} mm och höjden {h} mm. Bestäm tvålens volym.", en: "A bar of soap has dimensions of {w} mm by {d} mm and a height of {h} mm. Determine the volume of the soap." },
        { sv: "En verktygslåda är {w} cm bred, {d} cm djup och {h} cm hög. Beräkna verktygslådans volym.", en: "A tool box is {w} cm wide, {d} cm deep, and {h} cm tall. Calculate the volume of the tool box." }
    ],

    // =========================================================================
    //   2. TRIANGULAR PRISM VOLUME (Key: volume_prism)
    //    Parameters parsed: {b} (triangelns bas), {hTri} (triangelns höjd), {length} (prismats längd)
    // =========================================================================
    volume_prism: [
        { sv: "Ett tält har formen av ett prisma. Triangelns bas är {b} m och höjden är {hTri} m. Tältets längd är {length} m. Hur stor är volymen?", en: "A tent is shaped like a prism. The triangle base is {b} m and its height is {hTri} m. The length of the tent is {length} m. What is its volume?" },
        { sv: "En ostbit är skuren som ett prisma. Triangelbasen är {b} cm, höjden är {hTri} cm och tjockleken är {length} cm. Beräkna ostens volym.", en: "A wedge of cheese is shaped like a prism. The triangle base is {b} cm, the height is {hTri} cm, and its thickness is {length} cm. Calculate the volume of the cheese." },
        { sv: "En chokladask har triangulära gavlar med basen {b} cm och höjden {hTri} cm. Kartongens längd är {length} cm. Vad är volymen i cm³?", en: "A chocolate box has triangular ends with a base of {b} cm and a height of {hTri} cm. The length of the box is {length} cm. What is the volume in cm³?" },
        { sv: "Ett glastak över en gång har en triangelprofil med basen {b} m och höjden {hTri} m. Gångens längd är {length} m. Beräkna takets volym.", en: "A glass roof over a walkway has a triangular profile with base {b} m and height {hTri} m. The total length of the walkway is {length} m. Calculate the volume." },
        { sv: "Ett dörrstopp av trä är format som ett prisma. Basen är {b} cm, höjden är {hTri} cm och bredden är {length} cm. Beräkna trävolymen.", en: "A wooden doorstop is shaped like a prism. The base is {b} cm, the height is {hTri} cm, and the width is {length} cm. Calculate the volume of the wood." },
        { sv: "En bit tårta är skuren som ett triangulärt prisma. Basen är {b} cm, höjden är {hTri} cm och tårtbitens bredd är {length} cm. Beräkna volymen.", en: "A slice of cake is shaped like a triangular prism. The base is {b} cm, the height is {hTri} cm, and the width of the slice is {length} cm. Calculate the volume." },
        { sv: "Ett prisma av glas i ett experiment har en triangelbas på {b} mm, höjden {hTri} mm och längden {length} mm. Bestäm dess volym.", en: "A glass prism in an experiment has a triangle base of {b} mm, a height of {hTri} mm, and a length of {length} mm. Determine its volume." },
        { sv: "En sandhög har formats som ett prisma med en triangelbas på {b} m, höjd {hTri} m och längd {length} m. Beräkna sandhögens volym.", en: "A pile of sand is shaped like a prism with a triangle base of {b} m, height {hTri} m, and length {length} m. Calculate the volume of the pile." },
        { sv: "Ett litet växthustak har en triangulär gavel med basen {b} m och höjden {hTri} m. Takets längd är {length} m. Vad blir takets volym?", en: "A small greenhouse roof has a triangular gable with base {b} m and height {hTri} m. The length of the roof is {length} m. What is the volume?" },
        { sv: "En förpackning för smörgåsar har en triangelsida med basen {b} cm och höjden {hTri} cm. Djupet är {length} cm. Beräkna förpackningens volym.", en: "A sandwich container has a triangular side with base {b} cm and height {hTri} cm. Its depth is {length} cm. Calculate the container's volume." },
        { sv: "En bit metallskrot har formen av ett prisma. Triangelns bas är {b} mm, höjden är {hTri} mm och längden är {length} mm. Vad är volymen?", en: "A piece of scrap metal is shaped like a prism. The triangle base is {b} mm, the height is {hTri} mm, and the length is {length} mm. What is the volume?" },
        { sv: "Ett fodertråg för djur har triangulära kortsidor med basen {b} cm och höjden {hTri} cm. Trågets längd är {length} cm. Beräkna trågets volym.", en: "An animal feeding trough has triangular short sides with base {b} cm and height {hTri} cm. The length of the trough is {length} cm. Calculate its volume." },
        { sv: "En slipkloss av plast har en triangelprofil med måtten bas {b} cm och höjd {hTri} cm. Klossens längd är {length} cm. Bestäm klossens volym.", en: "A plastic sanding block has a triangular profile with base {b} cm and height {hTri} cm. The block's length is {length} cm. Determine its volume." },
        { sv: "En kartongbit är vikt som ett ihåligt prisma. Basen är {b} cm, höjden {hTri} cm och längden är {length} cm. Beräkna den inneslutna volymen.", en: "A piece of cardboard is folded as a hollow prism. The base is {b} cm, the height is {hTri} cm, and the length is {length} cm. Calculate the enclosed volume." },
        { sv: "Ett utställningsställ har en triangulär profil med basen {b} m, höjd {hTri} m och längden {length} m. Hur stor är ställets volym?", en: "An exhibition stand has a triangular profile with base {b} m, height {hTri} m, and length {length} m. How large is the volume of the stand?" },
        { sv: "En dekorsten är slipad som ett prisma. Triangelbasen är {b} cm, höjden är {hTri} cm och längden är {length} cm. Beräkna stenens volym.", en: "A decorative stone is cut as a prism. The triangle base is {b} cm, the height is {hTri} cm, and the length is {length} cm. Calculate the stone's volume." },
        { sv: "En modell av en ramp har en triangelsida med basen {b} cm och höjden {hTri} cm. Rampens bredd är {length} cm. Bestäm modellens volym.", en: "A model of a ramp has a triangular side with base {b} cm and height {hTri} cm. The width of the ramp is {length} cm. Determine the model's volume." },
        { sv: "En pappersvikt i glas är formad som ett prisma. Triangelbasen är {b} mm, höjden är {hTri} mm och längden är {length} mm. Beräkna volymen.", en: "A glass paperweight is shaped like a prism. The triangle base is {b} mm, the height is {hTri} mm, and the length is {length} mm. Calculate the volume." },
        { sv: "En bit vax är gjuten som ett triangulärt prisma. Basen är {b} cm, höjden är {hTri} cm och längden är {length} cm. Vad blir vaxbitens volym?", en: "A block of wax is cast as a triangular prism. The base is {b} cm, the height is {hTri} cm, and the length is {length} cm. What is the volume of the wax block?" },
        { sv: "En ränna har en triangelformad profil med basen {b} cm och höjden {hTri} cm. Rännans längd är {length} cm. Beräkna rännans totala volym.", en: "A section of gutter has a triangular profile with base {b} cm and height {hTri} cm. The length of the gutter is {length} cm. Calculate the total volume." }
    ],

    // =========================================================================
    //   3. CYLINDER VOLUME (Key: volume_cylinder)
    //    Parameters parsed: {r} (radie), {h} (höjd)
    // =========================================================================
    volume_cylinder: [
        { sv: "En läskburk har en bottenradie på {r} cm och höjden {h} cm. Beräkna läskburkens volym i cm³.", en: "A soda can has a base radius of {r} cm and a height of {h} cm. Calculate the volume of the soda can in cm³." },
        { sv: "Ett pelarljus har radien {r} cm och höjden {h} cm. Vad blir ljusets volym i kubikcentimeter?", en: "A pillar candle has a radius of {r} cm and a height of {h} cm. What is the volume of the candle in cubic centimeters?" },
        { sv: "Ett runt rör har en innerradie på {r} cm och är {h} cm långt. Hur stor volym ryms inuti röret?", en: "A round pipe has an internal radius of {r} cm and is {h} cm long. How much volume fits inside the pipe?" },
        { sv: "En oljetunna har en cylindrisk form med radien {r} dm och höjden {h} dm. Hur många liter (dm³) rymmer tunnan?", en: "An oil barrel has a cylindrical shape with a radius of {r} dm and a height of {h} dm. How many liters (dm³) does the barrel hold?" },
        { sv: "En rund glasmugg har innerradien {r} cm och höjden {h} cm. Beräkna muggens volym.", en: "A round glass mug has an internal radius of {r} cm and a height of {h} cm. Calculate the volume of the mug." },
        { sv: "Ett runt batteri har radien {r} mm och höjden {h} mm. Bestäm batteriets totala volym.", en: "A round battery has a radius of {r} mm and a height of {h} mm. Determine the total volume of the battery." },
        { sv: "En rund trästav har radien {r} cm och längden {h} cm. Beräkna trästavens volym.", en: "A piece of wooden dowel has a radius of {r} cm and a length of {h} cm. Calculate the volume of the wooden stick." },
        { sv: "En konservburk har radien {r} cm och höjden {h} cm. Vilken volym har burken i cm³?", en: "A tin can has a radius of {r} cm and a height of {h} cm. What volume does the can have in cm³?" },
        { sv: "En vattenslang har innerradien {r} cm och längden {h} cm. Hur stor volym vatten ryms i slangen?", en: "A water hose has an internal radius of {r} cm and a length of {h} cm. What volume of water fits inside the hose?" },
        { sv: "En rund tårtform har radien {r} cm och höjden {h} cm. Beräkna tårtformens volym.", en: "A round cake pan has a radius of {r} cm and a height of {h} cm. Calculate the volume of the cake pan." },
        { sv: "En rund krita har radien {r} mm och längden {h} mm. Vad blir kritans volym?", en: "A round piece of chalk has a radius of {r} mm and a length of {h} mm. What is the volume of the chalk?" },
        { sv: "En termos har innerradien {r} cm och höjden {h} cm. Beräkna hur mycket vätska termosen rymmer.", en: "A thermos has an internal radius of {r} cm and a height of {h} cm. Calculate how much liquid the thermos holds." },
        { sv: "En rund rulle med hushållspapper har radien {r} cm och höjden {h} cm. Bestäm pappersrullens volym.", en: "A round roll of paper towels has a radius of {r} cm and a height of {h} cm. Determine the volume of the paper roll." },
        { sv: "En cylindrisk vas har innerradien {r} cm och höjden {h} cm. Hur stor volym har vasen?", en: "A cylindrical vase has an internal radius of {r} cm and a height of {h} cm. What is the volume of the vase?" },
        { sv: "En rund metallbult har radien {r} mm och längden {h} mm. Beräkna bultens volym.", en: "A round metal bolt has a radius of {r} mm and a length of {h} mm. Calculate the volume of the bolt." },
        { sv: "En tunna för regnvatten har radien {r} cm och höjden {h} cm. Beräkna tunnans totala volym.", en: "A barrel for rainwater has a radius of {r} cm and a height of {h} cm. Calculate the total volume of the barrel." },
        { sv: "Ett rörformat piller har radien {r} mm och tjockleken {h} mm. Bestäm pillrets volym.", en: "A tablet shaped like a cylinder has a radius of {r} mm and a thickness of {h} mm. Determine the volume of the tablet." },
        { sv: "En rund trädstam har en snittradie på {r} cm och längden {h} cm. Beräkna stammens volym.", en: "A round tree trunk has a cross-section radius of {r} cm and a length of {h} cm. Calculate the volume of the trunk." },
        { sv: "Ett runt rör av plast har innerradien {r} cm och längden {h} cm. Vad blir plaströrets inre volym?", en: "A round plastic pipe has an internal radius of {r} cm and a length of {h} cm. What is the internal volume of the pipe?" },
        { sv: "En cylindrisk färgburk har radien {r} cm och höjden {h} cm. Beräkna färgburkens volym.", en: "A cylindrical paint can has a radius of {r} cm and a height of {h} cm. Calculate the volume of the paint can." }
    ],

    // =========================================================================
    //   4. PYRAMID VOLUME (Key: volume_pyramid)
    //    Parameters parsed: {s} (kvadratisk bassida), {h} (höjd)
    // =========================================================================
    volume_pyramid: [
        { sv: "En glasprydnad är formad som en pyramid med en kvadratisk bas där sidan är {s} cm. Höjden är {h} cm. Beräkna pyramidens volym.", en: "A glass ornament is shaped like a pyramid with a square base of side {s} cm. Its height is {h} cm. Calculate the volume of the pyramid." },
        { sv: "Ett tak på ett torn har formen av en kvadratisk pyramid. Basens sida är {s} m och takets höjd är {h} m. Vad blir takets volym?", en: "A tower roof is shaped like a square pyramid. The base side is {s} m and the roof height is {h} m. What is the volume of the roof?" },
        { sv: "En modell av en egyptisk pyramid har en kvadratisk bas med sidan {s} cm och en höjd på {h} cm. Beräkna modellens volym.", en: "A model of an Egyptian pyramid has a square base with side {s} cm and a height of {h} cm. Calculate the volume of the model." },
        { sv: "Ett tält är byggt som en pyramid med kvadratisk bottenyta där sidan är {s} m. Höjden i mitten är {h} m. Beräkna tältets volym.", en: "A tent is built like a pyramid with a square base of side {s} m. The center height is {h} m. Calculate the volume of the tent." },
        { sv: "En pappersvikt av metall är formad som en pyramid med bassidan {s} cm and höjden {h} cm. Vad är pappersviktens volym?", en: "A metal paperweight is shaped like a pyramid with a base side of {s} cm and a height of {h} cm. What is the volume of the paperweight?" },
        { sv: "En chokladbit har formen av en liten kvadratisk pyramid. Basens sida är {s} mm och höjden är {h} mm. Beräkna chokladbitens volym.", en: "A piece of chocolate is shaped like a small square pyramid. The base side is {s} mm and the height is {h} mm. Calculate its volume." },
        { sv: "Ett monument har en kvadratisk bas med sidan {s} m och en vinkelrät höjd på {h} m. Hur stor volym har monumentet?", en: "A monument has a square base with side {s} m and a perpendicular height of {h} m. What is the volume of the monument?" },
        { sv: "En ljusstake har en pyramidformad ovandel. Bassidan är {s} cm och höjden på pyramiden är {h} cm. Bestäm ovandelens volym.", en: "A candlestick has a pyramid-shaped top. The base side is {s} cm and the height of the pyramid is {h} cm. Determine the top's volume." },
        { sv: "En behållare för foder smalnar av som en uppochnedvänd pyramid. Öppningens sida är {s} cm och djupet är {h} cm. Beräkna behållarens volym.", en: "A feed hopper narrows like an inverted pyramid. The opening side is {s} cm and the depth is {h} cm. Calculate the volume of the hopper." },
        { sv: "Ett rymdobjekt i ett datorspel är format som en pyramid med bassidan {s} enheter och höjden {h} enheter. Vad blir objektets volym?", en: "A space object in a computer game is shaped like a pyramid with base side {s} units and height {h} units. What is the object's volume?" },
        { sv: "En bit kristall har vuxit som en pyramid med en kvadratisk bas på {s} mm och en höjd på {h} mm. Beräkna kristallens volym.", en: "A crystal has grown like a pyramid with a square base of {s} mm and a height of {h} mm. Calculate the volume of the crystal." },
        { sv: "Ett leksaksblock är format som en pyramid. Basens sida är {s} cm och höjden är {h} cm. Bestäm leksakens volym.", en: "A toy block is shaped like a pyramid. The base side is {s} cm and the height is {h} cm. Determine the volume of the toy." },
        { sv: "En pelarhatt av betong har formen av en flack pyramid med bassidan {s} cm och höjden {h} cm. Beräkna betongvolymen.", en: "A concrete pillar cap is shaped like a flat pyramid with a base side of {s} cm and a height of {h} cm. Calculate the concrete volume." },
        { sv: "En parfymflaska har en pyramidformad kork med bassidan {s} mm och höjden {h} mm. Hur stor volym har korken?", en: "A perfume bottle has a pyramid-shaped cap with a base side of {s} mm and a height of {h} mm. What is the volume of the cap?" },
        { sv: "Ett litet utställningsmonument har en kvadratisk bas med sidan {s} cm och en höjd på {h} cm. Beräkna dess volym.", en: "A small exhibition monument has a square base with side {s} cm and a height of {h} cm. Calculate its volume." },
        { sv: "En bit packmaterial är formad som en liten pyramid. Bassidan är {s} mm och höjden är {h} mm. Vad blir volymen?", en: "A piece of packaging material is shaped like a small pyramid. The base side is {s} mm and the height is {h} mm. What is the volume?" },
        { sv: "Ett pussel består av bitar där en är en pyramid med bassidan {s} cm och höjden {h} cm. Bestäm bitens volym.", en: "A puzzle consists of pieces where one is a pyramid with base side {s} cm and height {h} cm. Determine the piece's volume." },
        { sv: "En dekorativ träkloss är slipad som en pyramid. Bassidan mäter {s} cm och höjden är {h} cm. Beräkna träklossens volym.", en: "A decorative wooden block is cut like a pyramid. The base side measures {s} cm and the height is {h} cm. Calculate the volume of the block." },
        { sv: "En liten gjutform för gips är en kvadratisk pyramid med bassidan {s} cm och höjden {h} cm. Vilken volym rymmer formen?", en: "A small plaster mold is a square pyramid with base side {s} cm and height {h} cm. What volume does the mold hold?" },
        { sv: "Ett prydnadsföremål i metall har en kvadratisk bas med sidan {s} cm och höjden {h} cm. Beräkna föremålets volym.", en: "A metal decorative object has a square base with side {s} cm and a height of {h} cm. Calculate the object's volume." }
    ],

    // =========================================================================
    //   5. CONE VOLUME (Key: volume_cone)
    //    Parameters parsed: {r} (radie), {h} (höjd)
    // =========================================================================
    volume_cone: [
        { sv: "En glasstrut har radien {r} cm och höjden {h} cm. Hur stor volym glass ryms inuti struten om den fylls helt platt?", en: "An ice cream cone has a radius of {r} cm and a height of {h} cm. What volume of ice cream fits inside the cone if filled completely flat?" },
        { sv: "En festhatt har formen av en kon med radien {r} cm och höjden {h} cm. Beräkna hattens volym i cm³.", en: "A party hat is shaped like a cone with a radius of {r} cm and a height of {h} cm. Calculate the volume of the hat in cm³." },
        { sv: "En tratt har en konisk överdel med radien {r} cm och djupet {h} cm. Vilken volym rymmer trattens konformade del?", en: "A funnel has a conical top section with a radius of {r} cm and a depth of {h} cm. What volume does the conical part of the funnel hold?" },
        { sv: "En trafikkon har en radie på {r} cm vid basen och en höjd på {h} cm. Beräkna den totala volymen inuti konen.", en: "A traffic cone has a radius of {r} cm at the base and a height of {h} cm. Calculate the total volume inside the cone." },
        { sv: "En hög med grus har formen av en kon med basradien {r} m och höjden {h} m. Hur stor volym har grushögen?", en: "A pile of gravel is shaped like a cone with a base radius of {r} m and a height of {h} m. What is the volume of the gravel pile?" },
        { sv: "En dricksmugg av papper är konformad med radien {r} cm och höjden {h} cm. Beräkna muggens volym.", en: "A paper drinking cup is cone-shaped with a radius of {r} cm and a height of {h} cm. Calculate the volume of the cup." },
        { sv: "Ett litet konformat hänge till ett halsband har radien {r} mm och höjden {h} mm. Vad blir hängets volym?", en: "A small cone-shaped pendant for a necklace has a radius of {r} mm and a height of {h} mm. What is the volume of the pendant?" },
        { sv: "En spetsig takdel på ett torn är en kon med radien {r} m och höjden {h} m. Beräkna takdelens inneslutna volym.", en: "A pointed roof section on a tower is a cone with a radius of {r} m and a height of {h} m. Calculate the enclosed volume of the roof." },
        { sv: "En bit krita är vässad som en kon i änden med radien {r} mm och höjden {h} mm. Beräkna volymen på den konformade spetsen.", en: "A piece of chalk is sharpened into a cone at the end with radius {r} mm and height {h} mm. Calculate the volume of the conical tip." },
        { sv: "En modell av en vulkan är formad som en kon med radien {r} cm och höjden {h} cm. Bestäm vulkanmodellens volym.", en: "A model of a volcano is shaped like a cone with a radius of {r} cm and a height of {h} cm. Determine the volume of the volcano model." },
        { sv: "En leksakssnurra har en konformad underdel med radien {r} cm och höjden {h} cm. Beräkna snurrans volym under basen.", en: "A toy spinning top has a cone-shaped bottom with a radius of {r} cm and a height of {h} cm. Calculate its volume below the base." },
        { sv: "En taklampa sprider ljus i en konformad skärm med radien {r} cm och höjden {h} cm. Vad blir skärmens volym?", en: "A ceiling lamp has a cone-shaped shade with a radius of {r} cm and a height of {h} cm. What is the volume of the shade?" },
        { sv: "Ett litet koniskt viktlod har radien {r} mm och höjden {h} mm. Bestäm viktlodets volym.", en: "A small conical weight plumb bob has a radius of {r} mm and a height of {h} mm. Determine the volume of the plumb bob." },
        { sv: "En förvaringsbehållare för säd slutar i en kon med radien {r} m och höjden {h} m. Beräkna volymen på den koniska delen.", en: "A grain storage bin ends in a cone with a radius of {r} m and a height of {h} m. Calculate the volume of the conical section." },
        { sv: "En bit godis har formen av en kon med radien {r} mm och höjden {h} mm. Beräkna godisbitens volym.", en: "A piece of candy is shaped like a cone with a radius of {r} mm and a height of {h} mm. Calculate the volume of the candy piece." },
        { sv: "En dekorativ glaskon har radien {r} cm och höjden {h} cm. Hur stor volym har glaskonen?", en: "A decorative glass cone has a radius of {r} cm and a height of {h} cm. What is the volume of the glass cone?" },
        { sv: "Ett filter i ett experiment har en konisk form med radien {r} cm och djupet {h} cm. Beräkna filtrets volym.", en: "A filter in an experiment has a conical shape with a radius of {r} cm and a depth of {h} cm. Calculate the volume of the filter." },
        { sv: "En spetsig träplugg har radien {r} mm och höjden {h} mm. Bestäm pluggspetsens volym.", en: "A pointed wooden plug tip has a radius of {r} mm and a height of {h} mm. Determine the volume of the plug tip." },
        { sv: "En konformad parfymflaska har innerradien {r} cm och höjden {h} cm. Beräkna flaskans volym.", en: "A cone-shaped perfume bottle has an internal radius of {r} cm and a height of {h} cm. Calculate the volume of the bottle." },
        { sv: "En spetsig metalldel på en machine är en kon med radien {r} mm och höjden {h} mm. Vad blir delens volym?", en: "A pointed metal part on a machine is a cone with a radius of {r} mm and a height of {h} mm. What is the volume of the part?" }
    ],

    // =========================================================================
    // 🔮 5. SPHERE VOLUME (Key: volume_sphere)
    //    Parameters parsed: {r} (radie)
    // =========================================================================
    volume_sphere: [
        { sv: "En basketboll har en radie på {r} cm. Beräkna bollens volym i kubikcentimeter.", en: "A basketball has a radius of {r} cm. Calculate the volume of the ball in cubic centimeters." },
        { sv: "En glaskula har radien {r} mm. Vad är kulans volym i mm³?", en: "A glass marble has a radius of {r} mm. What is the volume of the marble in mm³?" },
        { sv: "En badboll pumpas upp så att dess radie blir {r} cm. Beräkna badbollens volym.", en: "A beach ball is inflated so that its radius becomes {r} cm. Calculate the volume of the beach ball." },
        { sv: "En dekorationslampa har formen av ett perfekt klot med radien {r} cm. Vad blir lampans volym?", en: "A decorative lamp is shaped like a perfect sphere with a radius of {r} cm. What is the volume of the lamp?" },
        { sv: "En tennisboll har en radie på {r} cm. Beräkna tennisbollens volym.", en: "A tennis ball has a radius of {r} cm. Calculate the volume of the tennis ball." },
        { sv: "En rund apelsin har en genomsnittlig radie på {r} cm. Bestäm apelsinens volym.", en: "A round orange has an average radius of {r} cm. Determine the volume of the orange." },
        { sv: "Ett runt sänke av bly har radien {r} mm. Beräkna blykulans volym i mm³.", en: "A round lead sinker has a radius of {r} mm. Calculate the volume of the lead ball in mm³?" },
        { sv: "En rund glob har radien {r} cm. Hur stor volym har globen?", en: "A round globe has a radius of {r} cm. What is the volume of the globe?" },
        { sv: "En rund vattenballong har radien {r} cm. Beräkna vattenballongens volym.", en: "A round water balloon has a radius of {r} cm. Calculate the volume of the water balloon." },
        { sv: "Ett klotformat tuggummi har radien {r} mm. Vad blir tuggummits volym?", en: "A spherical gumball has a radius of {r} mm. What is the volume of the gumball?" },
        { sv: "En planetmodell i ett klassrum har radien {r} cm. Bestäm modellens volym.", en: "A planet model in a classroom has a radius of {r} cm. Determine the volume of the model." },
        { sv: "En rund kula av stål i ett kullager har radien {r} mm. Beräkna stålkulans volym.", en: "A round steel ball in a bearing has a radius of {r} mm. Calculate the volume of the steel ball." },
        { sv: "En rund chokladpralin har radien {r} mm. Beräkna chokladkulans volym.", en: "A round chocolate truffle has a radius of {r} mm. Calculate the volume of the chocolate truffle." },
        { sv: "En klotformad glaskupa till en lampa har radien {r} cm. Vad blir kupans volym?", en: "A spherical glass shade for a lamp has a radius of {r} cm. What is the volume of the shade?" },
        { sv: "En rund träkula i ett pysselset har radien {r} mm. Bestäm träkulans volym.", en: "A round wooden bead in a craft set has a radius of {r} mm. Determine the volume of the wooden bead." },
        { sv: "Ett stort runt gummiklot på en lekplats har radien {r} cm. Beräkna klotets volym.", en: "A large round rubber sphere on a playground has a radius of {r} cm. Calculate the volume of the sphere." },
        { sv: "En rund isbit har radien {r} mm. Vad blir iskulans volym i mm³?", en: "A round ice ball has a radius of {r} mm. What is the volume of the ice ball in mm³?" },
        { sv: "En rund boll av frigolit har radien {r} cm. Bestäm frigolitbollens volym.", en: "A round styrofoam ball has a radius of {r} cm. Determine the volume of the styrofoam ball." },
        { sv: "Ett runt akvarium har radien {r} cm. Beräkna akvariets totala volym om det fylls helt.", en: "A spherical fishbowl has a radius of {r} cm. Calculate the total volume of the fishbowl if filled completely." },
        { sv: "En klotformad mikrofonpuff har radien {r} mm. Beräkna puffens volym.", en: "A spherical microphone windscreen has a radius of {r} mm. Calculate the volume of the windscreen." }
    ]
};