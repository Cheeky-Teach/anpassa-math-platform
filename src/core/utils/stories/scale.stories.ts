import { StoryScenario } from '../WordProblemInterceptor.js';

export const SCALE_STORIES: Record<string, StoryScenario[]> = {
    scale_area_reverse: [
        {
            sv: "Ett litet fotografi av en park har arean {smallA} cm². Efter att bilden förstoras upp för en utställningsaffisch är den nya arean {largeA} cm². Vilken är affschens längdskala jämfört med fotot?",
            en: "A small photograph of a park has an area of {smallA} cm². After being enlarged for an exhibition poster, the new area is {largeA} cm². What is the length scale of the poster compared to the photo?"
        },
        {
            sv: "En miniatyrmodell av ett köksbord täcker en yta på {smallA} cm². Det riktiga köksbordet täcker en yta på {largeA} cm². Bestäm längdskalan som användes för att bygga miniatyren.",
            en: "A miniature model of a kitchen table covers an area of {smallA} cm². The actual kitchen table covers an area of {largeA} cm². Determine the length scale used to build the miniature."
        },
        {
            sv: "En logotyp ritas på ett papper och har ytan {smallA} cm². När logotypen målas på en stor väggreklam upptar den {largeA} cm². Vilken längdskala har väggreklamen?",
            en: "A logo is drawn on paper and has an area of {smallA} cm². When painted on a large wall advertisement, it occupies {largeA} cm². What is the length scale of the wall advertisement?"
        },
        {
            sv: "Skissen av ett frimärke upptar {smallA} cm² på datorskärmen. Det tryckta frimärket har en area på {largeA} cm². Vilken längdskala har det färdigtryckta frimärket?",
            en: "The sketch of a postage stamp occupies {smallA} cm² on the computer screen. The printed stamp has an area of {largeA} cm². What is the length scale of the final printed stamp?"
        },
        {
            sv: "En liten datachip-layout har arean {smallA} cm². På en jättestor projektionsskärm i labbet visas layouten med arean {largeA} cm². Vilken längdskala används på skärmen?",
            en: "A tiny microchip layout has an area of {smallA} cm². On a huge projection screen in the lab, the layout is shown with an area of {largeA} cm². What length scale is used on the screen?"
        },
        {
            sv: "En bils sidoruta har arean {smallA} cm² på en modellskiss. På den verkliga tillverkade bilen är fönsterarean {largeA} cm². Vilken längdskala har skissen?",
            en: "A car's side window has an area of {smallA} cm² on a model sketch. On the actual manufactured car, the window area is {largeA} cm². What is the length scale of the sketch?"
        },
        {
            sv: "Ett litet klistermärke har ytan {smallA} cm². En exakt likadan dekorationsflagga har ytan {largeA} cm². Beräkna längdskalan mellan klistermärket och flaggan.",
            en: "A small sticker has an area of {smallA} cm². An identical decorative flag has an area of {largeA} cm². Calculate the length scale between the sticker and the flag."
        },
        {
            sv: "Arean av bottenplattan till ett leksakshus är {smallA} cm². Bottenplattan till det riktiga huset har arean {largeA} cm². Vilken längdskala har leksakshuset?",
            en: "The area of the baseplate for a toy house is {smallA} cm². The baseplate of the actual house has an area of {largeA} cm². What is the length scale of the toy house?"
        },
        {
            sv: "En rektangulär datorskärm har i viloläge en widget med ytan {smallA} cm². När widgeten expanderas över hela skärmen blir dess area {largeA} cm². Vilken längdskala har förändringen?",
            en: "A rectangular computer screen has a widget with an area of {smallA} cm² when idle. When expanded across the full screen, its area becomes {largeA} cm². What is the length scale of the change?"
        },
        {
            sv: "Ett löv har på en inskannad bild arean {smallA} cm². Efter en digital förstoring i ett bildprogram visar skärmen lövet med arean {largeA} cm². Bestäm bildprogrammets längdskala.",
            en: "A leaf has an area of {smallA} cm² on a scanned image. After a digital enlargement in an image program, the screen displays the leaf with an area of {largeA} cm². Determine the image program's length scale."
        }
    ],

    scale_area_forward: [
        {
            sv: "En arkitektritning är gjord i längdskala 1:{scale}. Ett badrum har arean {smallA} cm² på ritningen. Hur stor är badrummets verkliga yta?",
            en: "An architectural drawing is made to a length scale of 1:{scale}. A bathroom has an area of {smallA} cm² on the drawing. How large is the actual area of the bathroom?"
        },
        {
            sv: "Du ritar av en rektangulär rabatt i skala 1:{scale}. På papperet mäter rabattens area {smallA} cm². Hur stor area har trädgårdsrabatten i verkligheten?",
            en: "You draw a rectangular flowerbed at a scale of 1:{scale}. On the paper, the flowerbed's area measures {smallA} cm². What is the actual area of the flowerbed in reality?"
        },
        {
            sv: "På en tomtkarta i skala 1:{scale} upptar en altan en area på {smallA} cm². Hur stor yta kommer den färdigbyggda altanen att täcka i verkligheten?",
            en: "On a property map with a scale of 1:{scale}, a patio occupies an area of {smallA} cm². How large an area will the finished patio cover in reality?"
        },
        {
            sv: "Ett förrådsrum har ritats ut i skala 1:{scale}. Golvarean på ritningen är {smallA} cm². Hur stor golvyta har förrådet i verkligheten?",
            en: "A storage room is drawn at a scale of 1:{scale}. The floor area on the drawing is {smallA} cm². How much floor space does the storage room have in reality?"
        },
        {
            sv: "En gräsmatta är markerad på en stadsplaneringstavla i skala 1:{scale}. Om gräsmattans area på tavlan är {smallA} cm², hur stor är dess verkliga area?",
            en: "A lawn is marked on a city planning board at a scale of 1:{scale}. If the area of the lawn on the board is {smallA} cm², what is its actual area?"
        },
        {
            sv: "Skissen för en ny parkeringsplats har skala 1:{scale}. På skissen är asfaltytan markerad som {smallA} cm². Hur stor yta måste asfalteras i verkligheten?",
            en: "The sketch for a new parking lot has a scale of 1:{scale}. On the sketch, the asphalt area is marked as {smallA} cm². How large an area must be paved in reality?"
        },
        {
            sv: "En pool har ritats in på en hustomt i skala 1:{scale}. Vattenytan mäter {smallA} cm² på ritningen. Hur stor yta upptar poolens vatten i verkligheten?",
            en: "A pool is drawn on a house lot at a scale of 1:{scale}. The water surface measures {smallA} cm² on the drawing. What area does the pool's water occupy in reality?"
        },
        {
            sv: "Bottenvåningen på ett Dockhus är byggt i skala 1:{scale} jämfört med ett riktigt hus. Leksaksgolvet har ytan {smallA} cm². Vad är golvarean för motsvarande rum i det riktiga huset?",
            en: "The ground floor of a dollhouse is built to a scale of 1:{scale} compared to a real house. The toy floor has an area of {smallA} cm². What is the floor area for the corresponding room in the real house?"
        },
        {
            sv: "En modellteater har en scenyta som mäter {smallA} cm². Scenen är byggd i skala 1:{scale} av en teaterscen i Stockholm. Hur stor är den riktiga scenens area?",
            en: "A model theater has a stage area measuring {smallA} cm². The stage is built to a scale of 1:{scale} of a theater stage in Stockholm. How large is the actual stage area?"
        },
        {
            sv: "På en designskiss för en ny surfplatta är skärmarean {smallA} cm². Skissen är ritad i skala 1:{scale} av en stor interaktiv presentationstavla. Hur stor area har presentationstavlans skärm?",
            en: "On a design sketch for a new tablet, the screen area is {smallA} cm². The sketch is drawn to a scale of 1:{scale} of a large interactive presentation board. How large is the screen area of the presentation board?"
        }
    ],

    scale_calc_real: [
        {
            sv: "På en hustomt-ritning i skala 1:{scale} mäter en gångväg {imgCm} cm. Hur lång är gångvägen i verkligheten?",
            en: "On a house lot drawing at a scale of 1:{scale}, a walkway measures {imgCm} cm. How long is the walkway in reality?"
        },
        {
            sv: "En modellbil är byggd i skala 1:{scale}. Om modellens motorhuv är {imgCm} cm lång, hur lång är motorhuven på den riktiga bilen?",
            en: "A model car is built to a scale of 1:{scale}. If the model's hood is {imgCm} cm long, how long is the hood on the actual car?"
        },
        {
            sv: "På en planritning över ett kontor i skala 1:{scale} är en skrivbordsbänk {imgCm} cm lång. Vad är skrivbordets verkliga längd?",
            en: "On an office floor plan at a scale of 1:{scale}, a desk counter is {imgCm} cm long. What is the actual length of the desk?"
        },
        {
            sv: "En skiss över ett växthus är ritad i skala 1:{scale}. På skissen är dörröppningen {imgCm} cm bred. Hur bred är dörren i verkligheten?",
            en: "A sketch of a greenhouse is drawn at a scale of 1:{scale}. On the sketch, the doorway is {imgCm} cm wide. How wide is the door in reality?"
        },
        {
            sv: "En miniatyrbro har byggts i skala 1:{scale}. Om en bärande stolpe på modellen mäter {imgCm} cm, hur hög är stolpen på den riktiga bron?",
            en: "A miniature bridge has been built to a scale of 1:{scale}. If a supporting pillar on the model measures {imgCm} cm, how high is the pillar on the actual bridge?"
        },
        {
            sv: "På en trädgårdsskiss i skala 1:{scale} är ett staket inritat med längden {imgCm} cm. Hur långt staket behöver köpas in till trädgården i verkligheten?",
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
        }
    ]
};