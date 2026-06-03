// src/core/utils/stories/scale.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const SCALE_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. SCALE AREA REVERSE (Requires placeholders: {smallA} and {largeA})
    // =========================================================================
    scale_area_reverse: [
        {
            sv: "En liten bild av en park har arean {smallA} cm². Efter att bilden förstoras upp till en affisch är den nya arean {largeA} cm². Vilken är affschens längdskala jämfört med bilden?",
            en: "A small photograph of a park has an area of {smallA} cm². After being enlarged for a poster, the new area is {largeA} cm². What is the length scale of the poster compared to the photo?"
        },
        {
            sv: "En liten modell av ett bord täcker en yta på {smallA} cm². Det riktiga bordet täcker en yta på {largeA} cm². Bestäm längdskalan som användes för att bygga modellen.",
            en: "A miniature model of a table covers an area of {smallA} cm². The actual table covers an area of {largeA} cm². Determine the length scale used to build the model."
        },
        {
            sv: "En logotyp ritas på ett papper och har ytan {smallA} cm². När logotypen målas på en stor vägg upptar den {largeA} cm². Vilken längdskala har väggmålningen?",
            en: "A logo is drawn on paper and has an area of {smallA} cm². When painted on a large wall, it occupies {largeA} cm². What is the length scale of the wall painting?"
        },
        {
            sv: "Skissen av ett klistermärke upptar {smallA} cm² på en skärm. Det färdiga tryckta klistermärket har en area på {largeA} cm². Vilken längdskala har klistermärket?",
            en: "The sketch of a sticker occupies {smallA} cm² on a screen. The final printed sticker has an area of {largeA} cm². What is the length scale of the final printed sticker?"
        },
        {
            sv: "En layout för ett litet chip har arean {smallA} cm². På en stor monitor i labbet visas layouten med arean {largeA} cm². Vilken längdskala används på monitorn?",
            en: "A tiny microchip layout has an area of {smallA} cm². On a large monitor in the lab, the layout is shown with an area of {largeA} cm². What length scale is used on the screen?"
        },
        {
            sv: "Ett fönster på en bil har arean {smallA} cm² på en modellskiss. På den riktiga bilen är fönsterarean {largeA} cm². Vilken längdskala har skissen?",
            en: "A car's window has an area of {smallA} cm² on a model sketch. On the actual car, the window area is {largeA} cm². What is the length scale of the sketch?"
        },
        {
            sv: "Ett litet märke har ytan {smallA} cm². En flagga med exakt samma form har ytan {largeA} cm². Beräkna längdskalan mellan märket och flaggan.",
            en: "A small sticker has an area of {smallA} cm². An identical flag has an area of {largeA} cm². Calculate the length scale between the sticker and the flag."
        },
        {
            sv: "Arean av bottenplattan till ett leksakshus är {smallA} cm². Bottenplattan till det riktiga huset har arean {largeA} cm². Vilken längdskala har leksakshuset?",
            en: "The area of the baseplate for a toy house is {smallA} cm². The baseplate of the actual house has an area of {largeA} cm². What is the length scale of the toy house?"
        },
        {
            sv: "En rektangulär datorskärm har en ruta med ytan {smallA} cm². När rutan expanderas över hela skärmen blir dess area {largeA} cm². Vilken längdskala har förändringen?",
            en: "A rectangular computer screen has a box with an area of {smallA} cm² when minimized. When expanded across the full screen, its area becomes {largeA} cm². What is the length scale of the change?"
        },
        {
            sv: "Ett löv har på en bild arean {smallA} cm². Efter en förstoring visar skärmen lövet med arean {largeA} cm². Bestäm längdskalan för förstoringen.",
            en: "A leaf has an area of {smallA} cm² on an image. After an enlargement, the screen displays the leaf with an area of {largeA} cm². Determine the length scale of the enlargement."
        },
        {
            sv: "Ett mönster på en tröja täcker ytan {smallA} cm² på en skiss. På den färdiga tröjan tar trycket upp {largeA} cm². Vilken längdskala användes från skiss till tryck?",
            en: "A design pattern on a shirt covers an area of {smallA} cm² on a sketch. On the finished shirt, the print takes up {largeA} cm². What length scale was used from sketch to print?"
        },
        {
            sv: "Framsidan på ett litet spelkort mäter {smallA} cm². När bilden förstoras upp till en affisch i en butik blir arean {largeA} cm². Vilken längdskala har affischen?",
            en: "The front of a small gaming card measures {smallA} cm². When the image is enlarged for a store poster, the area becomes {largeA} cm². What is the length scale of the poster?"
        },
        {
            sv: "En musmatta i miniformat har arean {smallA} cm². Den vanliga modellen av samma musmatta har arean {largeA} cm². Vilken är längdskalan mellan de två modellerna?",
            en: "A mini-sized mousepad has an area of {smallA} cm². The standard model of the same mousepad has an area of {largeA} cm². What is the length scale between the two models?"
        },
        {
            sv: "En ritning av en skate-ramp täcker {smallA} cm² på ett papper. Sidan på den riktiga rampen har ytan {largeA} cm². Vilken längdskala har ritningen?",
            en: "A drawing of a skate ramp covers {smallA} cm² on paper. The side of the actual ramp has an area of {largeA} cm². What is the length scale of the drawing?"
        },
        {
            sv: "En profilbild på en telefon har arean {smallA} cm². När samma bild öppnas på en surfplatta blir dess yta {largeA} cm². Vilken längdskala har bilden på surfplattan?",
            en: "A profile picture on a phone has an area of {smallA} cm². When the same picture is opened on a tablet, its surface area becomes {largeA} cm². What length scale does the tablet view have?"
        }
    ],

    // =========================================================================
    // 🎯 2. SCALE AREA FORWARD (Requires placeholders: {scale} and {smallA})
    // =========================================================================
    scale_area_forward: [
        {
            sv: "En ritning av ett rum är gjord i längdskala 1:{scale}. Ett badrum har arean {smallA} cm² på ritningen. Hur stor är badrummets verkliga yta?",
            en: "A drawing of a room is made to a length scale of 1:{scale}. A bathroom has an area of {smallA} cm² on the drawing. How large is the actual area of the bathroom?"
        },
        {
            sv: "Du ritar av en rektangulär rabatt i skala 1:{scale}. På papperet mäter rabattens area {smallA} cm². Hur stor area har rabatten i verkligheten?",
            en: "You draw a rectangular flowerbed at a scale of 1:{scale}. On the paper, the flowerbed's area measures {smallA} cm². What is the actual area of the flowerbed in reality?"
        },
        {
            sv: "På en karta i skala 1:{scale} upptar en altan en area på {smallA} cm². Hur stor yta kommer den färdigbyggda altanen att täcka i verkligheten?",
            en: "On a map with a scale of 1:{scale}, a patio occupies an area of {smallA} cm². How large an area will the finished patio cover in reality?"
        },
        {
            sv: "Ett förrådsrum har ritats ut i skala 1:{scale}. Golvarean på ritningen är {smallA} cm². Hur stor golvyta har förrådet i verkligheten?",
            en: "A storage room is drawn at a scale of 1:{scale}. The floor area on the drawing is {smallA} cm². How much floor space does the storage room have in reality?"
        },
        {
            sv: "En gräsmatta är markerad på en karta i skala 1:{scale}. Om gräsmattans area på kartan är {smallA} cm², hur stor är dess verkliga area?",
            en: "A lawn is marked on a map at a scale of 1:{scale}. If the area of the lawn on the map is {smallA} cm², what is its actual area?"
        },
        {
            sv: "Skissen för en ny parkeringsplats har skala 1:{scale}. På skissen är asfaltytan markerad som {smallA} cm². Hur stor yta måste asfalteras i verkligheten?",
            en: "The sketch for a new parking lot has a scale of 1:{scale}. On the sketch, the asphalt area is marked as {smallA} cm². How large an area must be paved in reality?"
        },
        {
            sv: "En pool har ritats in på en tomt i skala 1:{scale}. Vattenytan mäter {smallA} cm² på ritningen. Hur stor yta upptar poolens vatten i verkligheten?",
            en: "A pool is drawn on a lot at a scale of 1:{scale}. The water surface measures {smallA} cm² on the drawing. What area does the pool's water occupy in reality?"
        },
        {
            sv: "Bottenvåningen på ett leksakshus är byggd i skala 1:{scale} jämfört med ett riktigt hus. Leksaksgolvet har ytan {smallA} cm². Vad är golvarean för rummet i det riktiga huset?",
            en: "The ground floor of a toy house is built to a scale of 1:{scale} compared to a real house. The toy floor has an area of {smallA} cm². What is the floor area for the corresponding room in the real house?"
        },
        {
            sv: "En modellscen har en yta som mäter {smallA} cm². Scenen är byggd i skala 1:{scale} av en riktig teaterscen. Hur stor är den riktiga scenens area?",
            en: "A model theater has a stage area measuring {smallA} cm². The stage is built to a scale of 1:{scale} of a real theater stage. How large is the actual stage area?"
        },
        {
            sv: "På en designskiss för en ny surfplatta är skärmarean {smallA} cm². Skissen är ritad i skala 1:{scale} av en stor skärm i ett klassrum. Hur stor area har klassrumsskärmen?",
            en: "On a design sketch for a new tablet, the screen area is {smallA} cm². The sketch is drawn to a scale of 1:{scale} of a large screen in a classroom. How large is the screen area of the classroom board?"
        },
        {
            sv: "En karta över en skatepark har skalan 1:{scale}. En rektangulär glidszon täcker {smallA} cm² på kartan. Vilken area har zonen i verkligheten?",
            en: "A map of a skatepark has a scale of 1:{scale}. A rectangular grind zone covers {smallA} cm² on the map. What area does the zone have in reality?"
        },
        {
            sv: "En ritning av en sporthall är gjord i skala 1:{scale}. Mattan på ritningen mäter {smallA} cm². Hur många kvadratmeter golvmatta behövs i verkligheten?",
            en: "A drawing of a sports hall is made to a scale of 1:{scale}. The mat on the drawing measures {smallA} cm². How many square meters of flooring are needed in reality?"
        },
        {
            sv: "Skissen av ett datorskrivbord har skalan 1:{scale}. Bordsskivan upptar {smallA} cm² på ritningen. Hur stor yta har det riktiga skrivbordet?",
            en: "The sketch of a computer desk has a scale of 1:{scale}. The desktop occupies {smallA} cm² on the drawing. What is the surface area of the actual desk?"
        },
        {
            sv: "En modell av ett garage är byggd i skala 1:{scale}. Modellens golvarea är {smallA} cm². Hur stor golvyta kommer det riktiga garaget att få?",
            en: "A model of a garage is built to a scale of 1:{scale}. The model's floor area is {smallA} cm². How much floor space will the actual garage have?"
        },
        {
            sv: "På ritningen av en innergård i skala 1:{scale} mäter en gräsyta {smallA} cm². Hur stor area har denna gräsyta i verkligheten?",
            en: "On the drawing of a courtyard at a scale of 1:{scale}, a grass area measures {smallA} cm². What area does this grass section have in reality?"
        }
    ],

    // =========================================================================
    // 🎯 3. SCALE CALC REAL (Requires placeholders: {scale} and {imgCm})
    // =========================================================================
    scale_calc_real: [
        {
            sv: "På en ritning i skala 1:{scale} mäter en gångväg {imgCm} cm. Hur lång är gångvägen i verkligheten?",
            en: "On a lot drawing at a scale of 1:{scale}, a walkway measures {imgCm} cm. How long is the walkway in reality?"
        },
        {
            sv: "En modellbil är byggd i skala 1:{scale}. Om modellens motorhuv är {imgCm} cm lång, hur lång är motorhuven på den riktiga bilen?",
            en: "A model car is built to a scale of 1:{scale}. If the model's hood is {imgCm} cm long, how long is the hood on the actual car?"
        },
        {
            sv: "På en planritning över ett kontor i skala 1:{scale} är ett skrivbord {imgCm} cm långt. Vad är skrivbordets verkliga längd?",
            en: "On an office floor plan at a scale of 1:{scale}, a desk counter is {imgCm} cm long. What is the actual length of the desk?"
        },
        {
            sv: "En skiss över ett förråd är ritad i skala 1:{scale}. På skissen är dörröppningen {imgCm} cm bred. Hur bred är dörren i verkligheten?",
            en: "A sketch of a storage shed is drawn at a scale of 1:{scale}. On the sketch, the doorway is {imgCm} cm wide. How wide is the door in reality?"
        },
        {
            sv: "En miniatyrbro har byggts i skala 1:{scale}. Om en stolpe på modellen mäter {imgCm} cm, hur hög är stolpen på den riktiga bron?",
            en: "A miniature bridge has been built to a scale of 1:{scale}. If a supporting pillar on the model measures {imgCm} cm, how high is the pillar on the actual bridge?"
        },
        {
            sv: "På en trädgårdsskiss i skala 1:{scale} är ett staket inritat med längden {imgCm} cm. Hur långt staket behöver köpas till trädgården i verkligheten?",
            en: "On a garden sketch at a scale of 1:{scale}, a fence is drawn with a length of {imgCm} cm. How much fencing needs to be purchased for the garden in reality?"
        },
        {
            sv: "En ritning för en bokhylla har skalan 1:{scale}. Ett av hyllplanen är utritat som {imgCm} cm långt. Hur långt blir hyllplanet när det monteras i verkligheten?",
            en: "A drawing for a bookshelf has a scale of 1:{scale}. One of the shelves is drawn as {imgCm} cm long. How long will the shelf be when assembled in reality?"
        },
        {
            sv: "Ett leksakståg är konstruerat i skala 1:{scale}. Om den främsta vagnen är {imgCm} cm lång, hur lång är vagnen på det riktiga tåget i verkligheten?",
            en: "A toy train is constructed to a scale of 1:{scale}. If the lead car is {imgCm} cm long, how long is the car on the actual train in reality?"
        },
        {
            sv: "På en garderobsritning i skala 1:{scale} är klädstången {imgCm} cm lång. Hur lång är stången som ska monteras i garderoben?",
            en: "On a wardrobe drawing at a scale of 1:{scale}, the clothes rail is {imgCm} cm long. How long is the rail to be mounted in the wardrobe?"
        },
        {
            sv: "En ritning över en fotbollsplan har gjorts i skala 1:{scale}. Straffområdet mäter {imgCm} cm på papperet. Vad är straffområdets verkliga längd?",
            en: "A drawing of a football pitch has been made at a scale of 1:{scale}. The penalty area measures {imgCm} cm on the paper. What is the actual length of the penalty area?"
        },
        {
            sv: "En modell av en skate-ramp har sågats ut i skala 1:{scale}. Om basplattan på modellen är {imgCm} cm bred, hur bred är rampplattan i verkligheten?",
            en: "A model of a skate ramp has been cut out to a scale of 1:{scale}. If the model baseplate is {imgCm} cm wide, how wide is the ramp plate in reality?"
        },
        {
            sv: "En skiss över en TV-bänk har ritats i skala 1:{scale}. På skissen är möbeln {imgCm} cm hög. Vilken blir TV-bänkens verkliga höjd?",
            en: "A sketch of a TV stand has been drawn at a scale of 1:{scale}. On the sketch, the furniture is {imgCm} cm high. What will be the actual height of the TV stand?"
        },
        {
            sv: "En ritning för en klädställning har gjorts i skala 1:{scale}. Sidoskenan är {imgCm} cm lång på ritningen. Hur lång skena behövs i verkligheten?",
            en: "A drawing for a clothes rack has been made at a scale of 1:{scale}. The side rail is {imgCm} cm long on the drawing. How long a rail is needed in reality?"
        },
        {
            sv: "En radiostyrd modellbil har skalan 1:{scale}. Om bilens hjulbas mäter {imgCm} cm på modellen, hur lång är hjulbasen på den riktiga bilen?",
            en: "A remote-controlled model car has a scale of 1:{scale}. If the car's wheelbase measures {imgCm} cm on the model, how long is the wheelbase on the actual car?"
        },
        {
            sv: "På en skiss över ett datorbygge i skala 1:{scale} är fläktgallret {imgCm} cm brett. Vad blir fläktgallrets bredd i verkligheten?",
            en: "On a computer build sketch at a scale of 1:{scale}, the fan grille is {imgCm} cm wide. What will be the actual width of the fan grille?"
        }
    ],
    // =========================================================================
    // 🎯 4. SCALE LINEAR IMAGE (15 Stories) - Parameters: {scale}, {realCm}, {imgCm}
    // =========================================================================
    scale_linear_image: [
        { sv: "En riktig datorskärm är {realCm} cm bred. Du ska rita av den på ett papper i skala 1:{scale}. Hur många centimeter bred blir skärmen på din ritning?", en: "A real computer screen is {realCm} cm wide. You are drawing it on paper at a scale of 1:{scale}. How many centimeters wide will the screen be on your drawing?" },
        { sv: "En stor affisch på väggen är {realCm} cm hög. En förminskad bild av affischen ska visas i en app i skala 1:{scale}. Hur många centimeter hög blir bilden i appen?", en: "A large poster on the wall is {realCm} cm tall. A reduced image of the poster is shown in an app at a scale of 1:{scale}. How many centimeters tall will the image be in the app?" },
        { sv: "En riktig skateboard är {realCm} cm lång. En liten leksaksmodell tillverkas i skala 1:{scale}. Hur lång blir leksaksskateboarden i centimeter?", en: "A real skateboard is {realCm} cm long. A small toy model is manufactured at a scale of 1:{scale}. How long will the toy skateboard be in centimeters?" },
        { sv: "Framsidan på en riktig spelkonsol är {realCm} cm bred. På en skiss i skala 1:{scale} ska den ritas ut. Bestäm dörr- eller sidobredden på skissen i centimeter.", en: "The front of a real gaming console is {realCm} cm wide. It needs to be drawn on a sketch at a scale of 1:{scale}. Determine the width on the sketch in centimeters." },
        { sv: "En stor pizzakartong är {realCm} cm bred. I en produktkatalog visas kartongen i skala 1:{scale}. Hur många centimeter bred är bilden i katalogen?", en: "A large pizza box is {realCm} cm wide. In a product catalog, the box is shown at a scale of 1:{scale}. How many centimeters wide is the image in the catalog?" },
        { sv: "En hoodie har ett tryck på ryggen som är {realCm} cm brett. På en liten förhandsvisning på webben visas trycket i skala 1:{scale}. Hur brett blir trycket på skärmen i cm?", en: "A hoodie has a print on the back that is {realCm} cm wide. On a small web preview, the print is shown at a scale of 1:{scale}. How wide will the print be on screen in cm?" },
        { sv: "En riktig gitarr är {realCm} cm lång. Du ritar av den i ditt block i skala 1:{scale}. Hur lång blir gitarren i ditt anteckningsblock?", en: "A real guitar is {realCm} cm long. You draw it in your notebook at a scale of 1:{scale}. How long will the guitar be in your notebook?" },
        { sv: "En TV-bänk är {realCm} cm lång i verkligheten. På en möbelritning i skala 1:{scale} ska den ritas ut. Hur lång blir bänken på ritningen?", en: "A TV stand is {realCm} cm long in reality. On a furniture drawing at a scale of 1:{scale}, it needs to be drawn. How long will the stand be on the drawing?" },
        { sv: "En fotoram på väggen är {realCm} cm hög. På en bild i en möbelkatalog visas ramen i skala 1:{scale}. Hur hög är bilden av ramen i centimeter?", en: "A photo frame on the wall is {realCm} cm tall. In a furniture catalog, the frame is shown at a scale of 1:{scale}. How tall is the frame image in centimeters?" },
        { sv: "En skolas basketplan är {realCm} cm lång. På en skolkarta i skala 1:{scale} är planen inritad. Hur många centimeter lång är basketplanen på kartan?", en: "A school basketball court is {realCm} cm long. On a school map at a scale of 1:{scale}, the court is drawn. How many centimeters long is the basketball court on the map?" },
        { sv: "En cykelram är {realCm} cm lång. En liten samlarmodell i metall görs i skala 1:{scale}. Bestäm modellens längd i centimeter.", en: "A bicycle frame is {realCm} cm long. A small metal collector's model is made at a scale of 1:{scale}. Determine the model's length in centimeters." },
        { sv: "Ett par sneakers är {realCm} cm långa. I en skokatalog är bilden av skon gjord i skala 1:{scale}. Hur lång blir skon i katalogen?", en: "A pair of sneakers is {realCm} cm long. In a shoe catalog, the image of the shoe is made at a scale of 1:{scale}. How long will the shoe be in the catalog?" },
        { sv: "En stor högtalare är {realCm} cm hög. På en skiss i en manual ritas den i skala 1:{scale}. Hur många centimeter hög blir högtalaren i manualen?", en: "A large speaker is {realCm} cm tall. On a sketch in a manual, it is drawn at a scale of 1:{scale}. How many centimeters tall will the speaker be in the manual?" },
        { sv: "En datormus är {realCm} cm lång. På baksidan av förpackningen visas en bild av musen i skala 1:{scale}. Hur lång är bilden på paketet?", en: "A computer mouse is {realCm} cm long. On the back of the packaging, a picture of the mouse is shown at a scale of 1:{scale}. How long is the image on the box?" },
        { sv: "En väska är {realCm} cm bred i butiken. På en reklambild i skala 1:{scale} visas väskan. Hur många centimeter bred är bilden av väskan?", en: "A backpack is {realCm} cm wide in the store. On an advertisement image at a scale of 1:{scale}, the backpack is shown. How many centimeters wide is the image?" }
    ],

    // =========================================================================
    // 🎯 5. SCALE MAP REAL (15 Stories) - Parameters: {scale}, {mapCm}, {ans}
    // =========================================================================
    scale_map_real: [
        { sv: "På en spelkarta i skala 1:{scale} är avståndet mellan två baser {mapCm} cm. Hur långt är avståndet i verkligheten?", en: "On a game map at a scale of 1:{scale}, the distance between two bases is {mapCm} cm. How long is the distance in reality?" },
        { sv: "Du kollar på en stadskarta i skala 1:{scale} och ser att vägen till gymmet är {mapCm} cm lång på kartan. Hur långt är det i verkligheten?", en: "You check a city map at a scale of 1:{scale} and see that the route to the gym is {mapCm} cm long on the map. How far is it in reality?" },
        { sv: "På en busskarta över stan i skala 1:{scale} mäter sträckan mellan två stationer {mapCm} cm. Hur långt är avståndet i verkligheten?", en: "On a city bus map at a scale of 1:{scale}, the route between two stations measures {mapCm} cm. How far is the distance in reality?" },
        { sv: "En orienteringskarta i skolan har skalan 1:{scale}. Sträckan till nästa kontroll är {mapCm} cm på kartan. Hur långt ska du springa i verkligheten?", en: "A school orienteering map has a scale of 1:{scale}. The distance to the next control is {mapCm} cm on the map. How far do you have to run in reality?" },
        { sv: "På en tunnelbanekarta i skala 1:{scale} är linjen mellan två stopp {mapCm} cm lång. Hur långt är det avståndet i verkligheten?", en: "On a subway map at a scale of 1:{scale}, the line between two stops is {mapCm} cm long. How long is that distance in reality?" },
        { sv: "En skattkarta i ett äventyrsspel har skalan 1:{scale}. Sträckan fram till kistan mäter {mapCm} cm på kartan. Hur lång är vägen i verkligheten?", en: "A treasure map in an adventure game has a scale of 1:{scale}. The path to the chest measures {mapCm} cm on the map. How long is the path in reality?" },
        { sv: "På en vandringskarta i skala 1:{scale} mäter en skogsstig {mapCm} cm. Hur lång är stigen i verkligheten för vandrarna?", en: "On a hiking map at a scale of 1:{scale}, a forest trail measures {mapCm} cm. How long is the trail in reality for the hikers?" },
        { sv: "En översiktskarta över en festival har skalan 1:{scale}. Avståndet mellan två scener är {mapCm} cm på papperet. Hur långt bort ligger scenen i verkligheten?", en: "An overview map of a festival has a scale of 1:{scale}. The distance between two stages is {mapCm} cm on paper. How far away is the stage in reality?" },
        { sv: "På en sjökortskarta i skala 1:{scale} mäter båtlinjen mellan två öar {mapCm} cm. Hur långt ska båten åka i verkligheten?", en: "On a nautical chart map at a scale of 1:{scale}, the boat line between two islands measures {mapCm} cm. How far does the boat travel in reality?" },
        { sv: "En app visar en cykelväg på en karta i skala 1:{scale}. Sträckan på skärmen är {mapCm} cm lång. Hur lång är cykelvägen i verkligheten?", en: "An app shows a bike path on a map at a scale of 1:{scale}. The segment on screen is {mapCm} cm long. How long is the bike path in reality?" },
        { sv: "På en turistkarta i skala 1:{scale} mäter vägen mellan två sevärdheter {mapCm} cm. Vad är det verkliga avståndet?", en: "On a tourist map at a scale of 1:{scale}, the road between two sights measures {mapCm} cm. What is the actual distance?" },
        { sv: "En löpar-app har en zoombild i skala 1:{scale}. Din senaste löprunda är inritad som en linje på {mapCm} cm. Hur långt sprang du i verkligheten?", en: "A running app has a zoomed view at a scale of 1:{scale}. Your latest run is drawn as a line of {mapCm} cm. How far did you run in reality?" },
        { sv: "På en nöjesparkskarta i skala 1:{scale} är kön till bergochdalbanan {mapCm} cm lång. Hur lång är köfållan i verkligheten?", en: "On an amusement park map at a scale of 1:{scale}, the queue line to the roller coaster is {mapCm} cm long. How long is the queue lane in reality?" },
        { sv: "En historisk karta i skolan har skalan 1:{scale}. En gammal mur mäter {mapCm} cm på kartan. Hur lång var muren i verkligheten?", en: "A history map at school has a scale of 1:{scale}. An ancient wall measures {mapCm} cm on the map. How long was the wall in reality?" },
        { sv: "På en campingkarta i skala 1:{scale} är avståndet från tältet till stranden {mapCm} cm. Hur långt har man att gå i verkligheten?", en: "On a campsite map at a scale of 1:{scale}, the distance from the tent to the beach is {mapCm} cm. How far do you have to walk in reality?" }
    ],

    // =========================================================================
    // 🎯 6. SCALE BLUEPRINT DRAW (15 Stories) - Parameters: {scale}, {realM}, {ans}
    // =========================================================================
    scale_blueprint_draw: [
        { sv: "En skiss över din skolas nya sporthall görs i skala 1:{scale}. I verkligheten ska en löparbana vara {realM} meter lång. Hur lång blir den på skissen i cm?", en: "A sketch of your school's new gym is made at a scale of 1:{scale}. In reality, a running track will be {realM} meters long. How long will it be on the sketch in cm?" },
        { sv: "En planlösning för ett nytt rum ritas i skala 1:{scale}. En säng är {realM} meter lång i verkligheten. Hur många centimeter lång blir sängen på ritningen?", en: "A floor plan for a new bedroom is drawn at a scale of 1:{scale}. A bed is {realM} meters long in reality. How many centimeters long will the bed be on the drawing?" },
        { sv: "En skiss över en skolgård ritas i skala 1:{scale}. I verkligheten är klätterväggen {realM} meter lång. Hur många centimeter blir klätterväggen på skissen?", en: "A sketch of a schoolyard is drawn at a scale of 1:{scale}. In reality, the climbing wall is {realM} meters long. How many centimeters will the wall be on the sketch?" },
        { sv: "Ett datorspel designar en rektangulär zon i skala 1:{scale}. Den riktiga zonen ska motsvara {realM} meter. Vad blir zonens längd på ritningen i cm?", en: "A video game designs a rectangular zone at a scale of 1:{scale}. The actual zone corresponds to {realM} meters. What will the zone's drawing length be in cm?" },
        { sv: "En ritning för en skateramp ritas i skala 1:{scale}. Rampernas platta del ska vara {realM} meter lång. Hur många centimeter ska linjen ritas på papperet?", en: "A drawing for a skate ramp is made at a scale of 1:{scale}. The flat part of the ramps is {realM} meters long. How many centimeters should the line be drawn on paper?" },
        { sv: "En trädgårdsskiss ritas upp i skala 1:{scale}. En ny altan ska bli {realM} meter lång i verkligheten. Hur lång blir altanlinjen på skissen i centimeter?", en: "A garden sketch is drawn up at a scale of 1:{scale}. A new patio will be {realM} meters long in reality. How long will the patio line be on the sketch in centimeters?" },
        { sv: "En planritning över en replokal görs i skala 1:{scale}. Scenytans långsida är {realM} meter i verkligheten. Hur lång blir den på papperet i cm?", en: "A floor plan for a rehearsal room is made at a scale of 1:{scale}. The long side of the stage is {realM} meters in reality. How long will it be on paper in cm?" },
        { sv: "En skiss över en fotbollsplan görs i skala 1:{scale}. Målet är {realM} meter brett i verkligheten. Hur många centimeter brett ska målet ritas på skissen?", en: "A sketch of a football field is made at a scale of 1:{scale}. The goal is {realM} meters wide in reality. How many centimeters wide should the goal be drawn on the sketch?" },
        { sv: "En ritning av en klätterställning görs i skala 1:{scale}. Balansbalken är {realM} meter lång i verkligheten. Bestäm dess mått på ritningen i cm.", en: "A drawing of a playground set is made at a scale of 1:{scale}. The balance beam is {realM} meters long in reality. Determine its measure on the drawing in cm." },
        { sv: "En skiss över en korridor i skolan ritas i skala 1:{scale}. Skåpsraden är {realM} meter lång i verkligheten. Hur många centimeter lång blir skåpsraden på skissen?", en: "A sketch of a school hallway is drawn at a scale of 1:{scale}. The row of lockers is {realM} meters long in reality. How many centimeters long will the row be on the sketch?" },
        { sv: "En ritning över en cykelbana ritas i skala 1:{scale}. Startsträckan är {realM} meter lång i verkligheten. Hur lång ritas den på papperet i cm?", en: "A drawing of a bike track is made at a scale of 1:{scale}. The starting segment is {realM} meters long in reality. How long is it drawn on paper in cm?" },
        { sv: "En skiss av en biolokal görs i skala 1:{scale}. Scenen är {realM} meter bred i verkligheten. Hur många centimeter bred blir scenen på skissen?", en: "A sketch of a cinema room is made at a scale of 1:{scale}. The stage is {realM} meters wide in reality. How many centimeters wide will the stage be on the sketch?" },
        { sv: "En planlösning för en kaféhörna ritas i skala 1:{scale}. Disken ska vara {realM} meter lång i verkligheten. Hur lång blir disken på ritningen i cm?", en: "A floor plan for a cafe corner is drawn at a scale of 1:{scale}. The counter is to be {realM} meters long in reality. How long will the counter be on the drawing in cm?" },
        { sv: "En skiss över ett garage ritas i skala 1:{scale}. Garageporten är {realM} meter bred i verkligheten. Hur många centimeter bred ritas porten på skissen?", en: "A sketch of a garage is drawn at a scale of 1:{scale}. The garage door is {realM} meters wide in reality. How many centimeters wide is the door drawn on the sketch?" },
        { sv: "En ritning av en busshållplats görs i skala 1:{scale}. Glasväggen är {realM} meter lång i verkligheten. Vad blir väggens längd på ritningen i cm?", en: "A drawing of a bus shelter is made at a scale of 1:{scale}. The glass wall is {realM} meters long in reality. What will the wall's length be on the drawing in cm?" }
    ],

    // =========================================================================
    // 🎯 7. SCALE MICROSCOPE CALC (15 Stories) - Parameters: {scale}, {realMm}, {ansMm}
    // =========================================================================
    scale_microscope_calc: [
        { sv: "En liten insekt är {realMm} mm lång i verkligheten. Du kollar på den i ett mikroskop med förstoringen {scale}:1. Hur lång ser insekten ut att vara i mikroskopet i mm?", en: "A tiny insect is {realMm} mm long in reality. You look at it through a microscope with a magnification of {scale}:1. How long does the insect appear to be under the microscope in mm?" },
        { sv: "Ett litet hårstrå är {realMm} mm tjockt. På en stor förstorad skärm visas hårstrået i skala {scale}:1. Hur brett visas hårstrået på skärmen i millimeter?", en: "A tiny hair strand is {realMm} mm thick. On a large magnified screen, the strand is displayed at a scale of {scale}:1. How wide is the hair strand shown on the screen in millimeters?" },
        { sv: "En liten detalj på ett kretskort mäter {realMm} mm. När man kollar i ett förstoringsglas med skalan {scale}:1, vad mäter detaljen i millimeter då?", en: "A small detail on a circuit board measures {realMm} mm. When viewing it through a magnifying glass at a scale of {scale}:1, what does the detail measure in millimeters?" },
        { sv: "Ett litet dammkorn är {realMm} mm brett. På en inzoomad bild i en bok visas kornet i skala {scale}:1. Hur stort mäter kornet på bilden i millimeter?", en: "A tiny dust mote is {realMm} mm wide. On a zoomed-in picture in a book, the grain is shown at a scale of {scale}:1. How large does the grain measure in the picture in millimeters?" },
        { sv: "En datorkomponent är {realMm} mm hög. På en stor instruktionsbild i labbet visas den förstorad i skala {scale}:1. Hur hög är komponenten på bilden i mm?", en: "A computer component is {realMm} mm tall. On a large instruction chart in the lab, it is shown magnified at a scale of {scale}:1. How tall is the component in the image in mm?" },
        { sv: "En liten vattendroppe mäter {realMm} mm på bredden. På en makrobild visas droppen likformigt förstorad i skala {scale}:1. Hur bred är droppen på makrobilden i mm?", en: "A small water droplet measures {realMm} mm in width. On a macro photograph, the droplet is shown similarly enlarged at a scale of {scale}:1. How wide is the droplet in the macro image in mm?" },
        { sv: "Ett pyttelitet tygfiber är {realMm} mm långt. I ett biologiskt diagram visas fibern förstorad i skala {scale}:1. Hur långt ritas tygfibret i diagrammet i mm?", en: "A tiny fabric fiber is {realMm} mm long. In a biological diagram, the fiber is shown magnified at a scale of {scale}:1. How long is the fabric fiber drawn in the diagram in mm?" },
        { sv: "En liten repa på en mobilskärm är {realMm} mm bred. När verkstaden filmar den med en lupp i skala {scale}:1, hur bred ser repan ut på skärmen i mm?", en: "A small scratch on a phone screen is {realMm} mm wide. When the workshop films it with a loupe at a scale of {scale}:1, how wide does the scratch look on screen in mm?" },
        { sv: "En liten pixel på en klockskärm mäter {realMm} mm. På en stor designritning visas pixeln i skala {scale}:1. Vad blir dess mått på ritningen i millimeter?", en: "A tiny pixel on a watch screen measures {realMm} mm. On a large design drawing, the pixel is shown at a scale of {scale}:1. What will its measure be on the drawing in millimeters?" },
        { sv: "Ett litet frö mäter {realMm} mm i diameter. På en förpackningsbild har fröet förstorats likformigt i skala {scale}:1. Hur stort är fröet på bilden i millimeter?", en: "A small seed measures {realMm} mm in diameter. On a packaging image, the seed has been magnified similarly at a scale of {scale}:1. How large is the seed in the picture in millimeters?" },
        { sv: "En mikroskopisk spricka i ett plastskal mäter {realMm} mm. I ett labbmikroskop (skala {scale}:1) undersöks den. Hur lång ser sprickan ut att vara i mm?", en: "A microscopic crack in a plastic shell measures {realMm} mm. It is examined under a lab microscope (scale {scale}:1). How long does the crack appear to be in mm?" },
        { sv: "Ett litet sandkorn är {realMm} mm brett. På en förstorad affisch visas sandkornet i skala {scale}:1. Hur många millimeter brett är sandkornet på affischen?", en: "A tiny grain of sand is {realMm} mm wide. On an enlarged poster, the grain of sand is shown at a scale of {scale}:1. How many millimeters wide is the grain of sand on the poster?" },
        { sv: "En liten textdetalj på ett frimärke är {realMm} mm hög. När man zoomar in på en datorskärm i skala {scale}:1, hur hög blir textdetaljen på skärmen i mm?", en: "A small text detail on a stamp is {realMm} mm tall. When zooming in on a computer screen at a scale of {scale}:1, how tall will the text detail be on the screen in mm?" },
        { sv: "Ett litet kryp mäter {realMm} mm över ryggen. På en bild i en naturbok visas krypet likformigt förstorat i skala {scale}:1. Hur brett är krypet i boken i mm?", en: "A tiny bug measures {realMm} mm across its back. On a picture in a nature book, the bug is shown similarly magnified at a scale of {scale}:1. How wide is the bug in the book in mm?" },
        { sv: "En liten glasbit på golvet mäter {realMm} mm. Genom ett kraftigt förstoringsglas i skala {scale}:1 undersöks den. Hur stor ser glasbiten ut att vara i mm?", en: "A small piece of glass on the floor measures {realMm} mm. It is examined through a powerful magnifying glass at a scale of {scale}:1. How large does the piece of glass appear to be in mm?" }
    ]
};