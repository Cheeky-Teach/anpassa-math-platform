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
    ]
};