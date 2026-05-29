import { StoryScenario } from '../WordProblemInterceptor.js';

export const TEN_POWER_STORIES: Record<string, StoryScenario[]> = {
    ten_powers_mult_large: [
        {
            sv: "En kartong med skruvar väger {num} kilo. Hur mycket väger ett parti på {power} stycken likadana kartonger totalt?",
            en: "A box of screws weighs {num} kg. How much does a batch of {power} identical boxes weigh in total?"
        },
        {
            sv: "En löpare dricker {num} liter vatten under ett träningspass. Hur många liter vatten går det åt om {power} löpare dricker lika mycket var?",
            en: "A runner drinks {num} liters of water during a workout. How many liters of water are needed if {power} runners drink the same amount each?"
        },
        {
            sv: "Ett litet solcellsbatteri kan lagra {num} kWh energi. Hur mycket energi kan en stor anläggning med {power} sammankopplade batterier lagra?",
            en: "A small solar battery can store {num} kWh of energy. How much energy can a large facility with {power} interconnected batteries store?"
        },
        {
            sv: "En skola köper in block för {num} kr styck. Vad blir den totala kostnaden om skolan beställer hem ett paket med {power} block?",
            en: "A school purchases notebooks for {num} kr each. What is the total cost if the school orders a package of {power} notebooks?"
        },
        {
            sv: "Ett bageri använder i genomsnitt {num} kilo mjöl per timme. Hur mycket mjöl förbrukar bageriet under en period på {power} timmar?",
            en: "A bakery uses an average of {num} kg of flour per hour. How much flour does the bakery consume over a period of {power} hours?"
        },
        {
            sv: "Tjockleken på ett pappersark är {num} mm. Hur högt blir ett pappersblock om du travar {power} likadana ark på varandra?",
            en: "The thickness of a sheet of paper is {num} mm. How high will a stack of paper be if you pile {power} identical sheets on top of each other?"
        },
        {
            sv: "En datamodul skickar {num} megabyte data per sekund. Hur många megabyte har skickats efter {power} sekunder?",
            en: "A data module transmits {num} megabytes of data per second. How many megabytes have been transmitted after {power} seconds?"
        },
        {
            sv: "En behållare rymmer {num} liter flytande tvål. Hur många liter tvål behövs för att fylla en fabrikstank som motsvarar volymen av {power} sådana behållare?",
            en: "A container holds {num} liters of liquid soap. How many liters of soap are needed to fill a factory tank equal to the volume of {power} such containers?"
        },
        {
            sv: "Varje biljett till en välgörenhetskonsert kostar {num} kr. Hur mycket pengar samlas in om arrangörerna säljer exakt {power} biljetter?",
            en: "Each ticket to a charity concert costs {num} kr. How much money is raised if the organizers sell exactly {power} tickets?"
        },
        {
            sv: "Ett tåg rör sig framåt med {num} meter per sekund. Hur många meter har tåget färdats efter {power} sekunder?",
            en: "A train moves forward at {num} meters per second. How many meters has the train traveled after {power} seconds?"
        }
    ],

    ten_powers_div_large: [
        {
            sv: "Ett parti med färska bär väger totalt {num} kilo. Bären ska fördelas helt lika i {power} mindre plastaskar. Hur mycket väger bären i varje ask?",
            en: "A batch of fresh berries weighs a total of {num} kg. The berries are to be divided completely equally into {power} smaller plastic containers. How much do the berries in each container weigh?"
        },
        {
            sv: "En vinstpott på {num} kr ska delas helt lika mellan de {power} personerna som köpte en gemensam lott. Hur mycket får varje person?",
            en: "A prize pool of {num} kr is to be split completely equally among the {power} people who bought a joint lottery ticket. How much does each person receive?"
        },
        {
            sv: "Ett långt rep mäter {num} meter. Du klipper repet i {power} exakt lika långa bitar. Hur lång blir varje enskild repbit?",
            en: "A long rope measures {num} meters. You cut the rope into {power} exactly equal pieces. How long will each individual piece of rope be?"
        },
        {
            sv: "En fabrik har producerat {num} liter saft. Vätskan ska tappas upp på {power} likadana flaskor. Hur mycket saft ska fyllas i varje flaska?",
            en: "A factory has produced {num} liters of juice. The liquid is to be bottled into {power} identical bottles. How much juice should be filled into each bottle?"
        },
        {
            sv: "En löpare har sprungit totalt {num} meter under ett antal intervaller. Om hon sprang exakt {power} lika långa intervaller, hur lång var då varje intervall?",
            en: "A runner has run a total of {num} meters over a number of intervals. If she ran exactly {power} equally long intervals, how long was each interval?"
        },
        {
            sv: "En stor rulle kabel väger {num} kilo. Om rullen innehåller en kabel som är {power} meter lång, hur mycket väger då varje meter av kabelan?",
            en: "A large roll of cable weighs {num} kg. If the roll contains a cable that is {power} meters long, how much does each meter of the cable weigh?"
        },
        {
            sv: "Ett lager har {num} stycken glödlampor packade i {power} likadana lådor. Hur många glödlampor finns det i varje låda?",
            en: "A warehouse has {n} light bulbs packed into {power} identical boxes. How many light bulbs are there in each box?"
        },
        {
            sv: "Ett byggföretag har {num} ton grus som ska köras bort i {power} lika stora lass med en lastbil. Hur mycket grus tas med i varje lass?",
            en: "A construction company has {num} tons of gravel to be hauled away in {power} equal loads by a truck. How much gravel is taken in each load?"
        },
        {
            sv: "En vattentank rymmer {num} liter. Vattnet töms ut genom en ventil och det tar exakt {power} minuter innan tanken är helt tom. Hur många liter rinner ut per minut i snitt?",
            en: "A water tank holds {num} liters. The water drains through a valve and it takes exactly {power} minutes before the tank is completely empty. How many liters drain out per minute on average?"
        },
        {
            sv: "En digital sändning på {num} megabyte skickas uppdelat i {power} lika stora datapaket. Hur många megabyte innehåller varje datapaket?",
            en: "A digital transmission of {num} megabytes is sent divided into {power} equally sized data packets. How many megabytes does each data packet contain?"
        }
    ],

    ten_powers_mult_small: [
        {
            sv: "Ett stort lagerområde har en total yta på {num} kvadratmeter. En mindre kontorsmodul upptar en area som motsvarar {factor} av lagerytan. Hur stor är kontorsmodulens yta?",
            en: "A large warehouse area has a total space of {num} square meters. A smaller office module occupies an area corresponding to {factor} of the warehouse space. How large is the office module's area?"
        },
        {
            sv: "Ett cykellopp sträcker sig över {num} meter. Efter att ha cyklat {factor} av den totala sträckan får en deltagare punktering. Hur många meter hann han cykla?",
            en: "A bicycle race covers {num} meters. After cycling {factor} of the total distance, a participant gets a flat tire. How many meters did he manage to cycle?"
        },
        {
            sv: "En kommun har en årlig budget på {num} miljoner kr för idrottsaktiviteter. Av denna budget går {factor} direkt till simhallar. Hur mycket pengar tilldelas simhallarna?",
            en: "A municipality has an annual budget of {num} million kr for sports activities. Out of this budget, {factor} goes directly to swimming pools. How much money is allocated to the swimming pools?"
        },
        {
            sv: "Ett oljefat innehåller {num} liter råolja. På grund av en spricka läcker {factor} av oljan ut på golvet. Hur många liter olja har läckt ut?",
            en: "An oil barrel contains {num} liters of crude oil. Due to a crack, {factor} of the oil leaks out onto the floor. How many liters of oil have leaked out?"
        },
        {
            sv: "Skalan på en ritning är satt så att längden av en modell är {factor} av den verkliga längden. Om det verkliga föremålet är {num} cm långt, hur långt blir det på ritningen?",
            en: "The scale on a drawing is set so that the length of a model is {factor} of the real length. If the real object is {num} cm long, how long will it be on the drawing?"
        },
        {
            sv: "En skogsägare har {num} träd på sin fastighet. Under en storm faller {factor} av träden till marken. Hur många träd har fallit?",
            en: "A forest owner has {num} trees on his property. During a storm, {factor} of the trees fall to the ground. How many trees have fallen?"
        },
        {
            sv: "Ett fraktfartyg bär en last som väger {num} ton. Vid den första hamnen lastas {factor} av den totala vikten av. Hur många ton lastas av?",
            en: "A cargo ship carries a load weighing {num} tons. At the first port, {factor} of the total weight is unloaded. How many tons are unloaded?"
        },
        {
            sv: "Ett dataspel kräver {num} megabyte lagringsutrymme. En mindre uppdatering motsvarar {factor} av grundspelets storlek. Hur stor är uppdateringen?",
            en: "A computer game requires {num} megabytes of storage space. A small update corresponds to {factor} of the base game's size. How large is the update?"
        },
        {
            sv: "Priset på en jacka var {num} kr. Under en utförsäljning sänks priset med en rabattfaktor på {factor} av det ursprungliga priset. Hur stor är prissänkningen i kr?",
            en: "The price of a jacket was {num} kr. During a clearance sale, the price is reduced by a discount factor of {factor} of the original price. How large is the price reduction in kr?"
        },
        {
            sv: "En skola har {num} elever. Av dessa är det {factor} som deltar i schackturneringen. Hur många elever från skolan spelar i turneringen?",
            en: "A school has {num} students. Out of these, {factor} participate in the chess tournament. How many students from the school are playing in the tournament?"
        }
    ],

    ten_powers_div_small: [
        {
            sv: "En mikroskopisk cell har längden {num} mm på en bildskärm. Bilden är tagen med en lins som krympt motivet till {factor} av dess storlek. Vad är cellens faktiska längd?",
            en: "A microscopic cell measures {num} mm on a monitor display. The image was captured with a lens that shrank the subject to {factor} of its size. What is the actual length of the cell?"
        },
        {
            sv: "Ett kemiskt prov väger {num} gram efter att det har torkats. Torkningsprocessen gjorde att vikten minskade till {factor} av ursprungsvikten. Vad vägde provet från början?",
            en: "A chemical sample weighs {num} grams after being dried. The drying process caused the weight to decrease to {factor} of its original weight. What did the sample weigh initially?"
        },
        {
            sv: "En miniatyrmodell av en båt är {num} cm lång. Modellen är byggd så att dess längd motsvarar {factor} av den riktiga båtens längd. Hur lång är den riktiga båten?",
            en: "A miniature model of a boat is {num} cm long. The model is built so that its length corresponds to {factor} of the actual boat's length. How long is the actual boat?"
        },
        {
            sv: "Ett företag redovisar en vinst på {num} miljoner kr för en mindre underavdelning. Denna delvinst utgör {factor} av hela koncernens totala vinst. Hur stor är koncernens vinst?",
            en: "A company reports a profit of {num} million kr for a small subsidiary. This partial profit constitutes {factor} of the entire group's total profit. How large is the group's profit?"
        },
        {
            sv: "En liten bit av en karta visar en sträcka som mäter {num} cm. Sträckan utgör {factor} av den totala längden på hela vandringsleden. Hur lång är vandringsleden i cm?",
            en: "A small segment of a map shows a trail measuring {num} cm. This segment constitutes {factor} of the total length of the entire hiking trail. How long is the hiking trail in cm?"
        },
        {
            sv: "En behållare innehåller {num} liter koncentrerad juice efter en indunstning. Detta motsvarar {factor} av den ursprungliga juicemängden före koncentreringen. Hur många liter fanns det från början?",
            en: "A container holds {num} liters of concentrated juice after evaporation. This corresponds to {factor} of the original amount of juice before concentration. How many liters were there initially?"
        },
        {
            sv: "Du har sparat {num} kr på ett särskilt sparkonto. Denna summa motsvarar {factor} av dina totala samlade sparpengar. Hur mycket sparpengar har du sammanlagt?",
            en: "You have saved {num} kr in a specific savings account. This sum corresponds to {factor} of your total accumulated savings. How much savings do you have in total?"
        },
        {
            sv: "En liten testpanel bestående av {num} personer godkände en ny produkt. Testpanelen utgjorde {factor} av det totala antalet personer i hela marknadsundersökningen. Hur många deltog totalt?",
            en: "A small test panel consisting of {num} people approved a new product. The test panel constituted {factor} of the total number of people in the entire market survey. How many people participated in total?"
        },
        {
            sv: "En hantverkare har gjort klart en sektion på {num} meter av ett staket. Den färdiga sektionen utgör {factor} av staketets totala planerade längd. Hur långt ska staketet bli?",
            en: "A craftsman has finished a section measuring {num} meters of a fence. The completed section constitutes {factor} of the total planned length of the fence. How long will the fence be?"
        },
        {
            sv: "Efter en gallring finns det {num} tallar kvar i ett skogsparti. Detta antal motsvarar {factor} av det ursprungliga antalet tallar före gallringen. Hur många tallar fanns där i början?",
            en: "After thinning, {num} pine trees remain in a section of forest. This count corresponds to {factor} of the original number of pine trees before thinning. How many pine trees were there initially?"
        }
    ]
};