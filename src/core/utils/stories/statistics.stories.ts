// src/core/utils/stories/statistics.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const STATISTICS_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 📊 1. STATS: FIND MODE (15 Stories) - Parameters: {list}
    // =========================================================================
    stats_find_mode: [
        { sv: "Här är antalet visningar på dina senaste inlägg: {list}. Vilket är typvärdet för visningarna?", en: "Here are the view counts on your recent post: {list}. What is the mode of the views?" },
        { sv: "Du räknar antalet godisar i några påsar och får: {list}. Vilket är typvärdet för antalet godisar?", en: "You count the number of candies in a few bags and get: {list}. What is the mode of the candy count?" },
        { sv: "Ett gäng kompisar jämför sina skostorlekar: {list}. Bestäm skostorlekarnas typvärde.", en: "A group of friends compare their shoe sizes: {list}. Determine the mode of the shoe sizes." },
        { sv: "Du kollar hur många minuter du fick vänta på bussen i veckan: {list}. Vad är typvärdet?", en: "You check how many minutes you waited for the bus this week: {list}. What is the mode?" },
        { sv: "Här är dina poäng på de senaste matcherna i ett mobilspel: {list}. Vilket är ditt typvärde?", en: "Here are your scores from the last few matches in a mobile game: {list}. What is the mode?" },
        { sv: "Några kompisar skriver ner hur många timmar de sov i natt: {list}. Vad är sömnens typvärde?", en: "A few friends write down how many hours they slept last night: {list}. What is the mode of the sleeping hours?" },
        { sv: "Du räknar hur många låtar som ligger på dina spellistor: {list}. Vilket är typvärdet?", en: "You count how many songs are on your playlists: {list}. What is the mode?" },
        { sv: "Några personer svarar på hur många skärmtimmar de hade igår: {list}. Vad är typvärdet?", en: "A few people share how many screen hours they had yesterday: {list}. What is the mode?" },
        { sv: "Här är temperaturerna i Celsius under den senaste veckan: {list}. Bestäm veckans typvärde.", en: "Here are the temperatures in Celsius during the past week: {list}. Determine the week's mode." },
        { sv: "Du kollar hur många slices pizza dina kompisar orkar äta: {list}. Vilket är typvärdet?", en: "You check how many slices of pizza your friends can eat: {list}. What is the mode?" },
        { sv: "Här är åldrarna på personerna i ditt gaming-klan: {list}. Bestäm klanmedlemmarnas typvärde.", en: "Here are the ages of the people in your gaming clan: {list}. Determine the clan members' mode." },
        { sv: "Du kollar hur många pushups dina kompisar klarar i sträck: {list}. Vad blir typvärdet?", en: "You check how many pushups your friends can do in a row: {list}. What is the mode?" },
        { sv: "Här är antalet likes du fick på dina senaste posts: {list}. Vilket är typvärdet för dina likes?", en: "Here are the number of likes you got on your recent posts: {list}. What is the mode of your likes?" },
        { sv: "Några personer räknar hur många Snapchat-streaks de har: {list}. Vad är streaksens typvärde?", en: "A few people count how many Snapchat streaks they have: {list}. What is the mode of the streaks?" },
        { sv: "Du kollar priset på några olika läskburkar i kiosken: {list} kr. Vilket är läskprisernas typvärde?", en: "You check the price of a few soda cans at the kiosk: {list} kr. What is the mode of the soda prices?" }
    ],

    // =========================================================================
    // 📊 2. STATS: FIND RANGE (15 Stories) - Parameters: {list}
    // =========================================================================
    stats_find_range: [
        { sv: "Dina senaste betygspoäng på några prov är: {list}. Beräkna variationsbredden för poängen.", en: "Your recent quiz scores are: {list}. Calculate the range of the scores." },
        { sv: "Här är antalet minuter du scrollade på mobilen per dag i veckan: {list}. Vad är variationsbredden?", en: "Here are the minutes you spent scrolling on your phone per day this week: {list}. What is the range?" },
        { sv: "Ett gäng kompisar kollar hur många gym-pass de kört denna månad: {list}. Beräkna variationsbredden.", en: "A group of friends check how many gym sessions they completed this month: {list}. Calculate the range." },
        { sv: "Här är antalet låtar på dina kompisars favorit-spellistor: {list}. Vad är variationsbredden?", en: "Here are the number of songs on your friends' favorite playlists: {list}. What is the range?" },
        { sv: "Du mäter temperaturen i ditt rum under några dagar: {list} °C. Beräkna rummets variationsbredd.", en: "You measure the temperature in your room over a few days: {list} °C. Calculate the room's range." },
        { sv: "Antalet gjorda mål för ditt fotbollslag under de senaste matcherna är: {list}. Bestäm variationsbredden.", en: "The goals scored by your football team during recent matches are: {list}. Determine the range." },
        { sv: "Du kollar åldrarna på dina kusiner: {list} år. Räkna ut variationsbredden för deras åldrar.", en: "You check the ages of your cousins: {list} years. Calculate the range of their ages." },
        { sv: "Priserna på några olika kepsar i en onlinebutik är: {list} kr. Beräkna variationsbredden för priserna.", en: "The prices of a few caps in an online store are: {list} kr. Calculate the range of the prices." },
        { sv: "Här är antalet timmar du spelat dator per dag under lovet: {list}. Vad är variationsbredden?", en: "Here are the hours you played computer games per day during the break: {list}. What is the range?" },
        { sv: "Några kompisar räknar hur många unika serier de kollat på i år: {list}. Bestäm variationsbredden.", en: "A few friends count how many unique series they watched this year: {list}. Determine the range." },
        { sv: "Du kollar vikten i kg på några tunga hantlar i gymmet: {list}. Beräkna hantlarnas variationsbredd.", en: "You check the weight in kg of a few heavy dumbbells at the gym: {list}. Calculate the dumbbells' range." },
        { sv: "Antalet fika-kronor dina kompisar har swishat dig är: {list} kr. Bestäm variationsbredden för swishen.", en: "The amounts in kr your friends swished you for snacks are: {list} kr. Determine the range of the swished amounts." },
        { sv: "Du kollar hur många sidor det är i böckerna du har i din bokhylla: {list}. Vad är variationsbredden?", en: "You check how many pages are in the books on your bookshelf: {list}. What is the range?" },
        { sv: "Här är antalet reps du klarade på bänkpressen under de senaste passen: {list}. Beräkna variationsbredden.", en: "Here are the reps you completed on the bench press during recent sessions: {list}. Calculate the range." },
        { sv: "Du kollar hur många Snapchat-notiser du har fått under några timmar: {list}. Bestäm variationsbredden.", en: "You check how many Snapchat notifications you received over a few hours: {list}. Determine the range." }
    ],

    // =========================================================================
    // 📊 3. STATS: CALCULATE MEAN (15 Stories) - Parameters: {list}
    // =========================================================================
    stats_calc_mean: [
        { sv: "Här är antalet skärmtimmar du hade per dag under förra veckan: {list}. Beräkna ditt medelvärde.", en: "Here are the screen hours you had per day during last week: {list}. Calculate your mean." },
        { sv: "Du och dina kompisar räknar hur många tuggumin ni har i fickorna: {list}. Vad blir medelvärdet?", en: "You and your friends count how many chewing gums you have in your pockets: {list}. What is the mean?" },
        { sv: "Dina poäng på de senaste fem nivåerna i ett spel är: {list}. Räkna ut medelvärdet för dina poäng.", en: "Your scores on the last five levels in a game are: {list}. Calculate the mean of your scores." },
        { sv: "Här är kostnaden för luncherna du köpte i veckan: {list} kr. Vad mäter lunchernas medelvärde?", en: "Here are the costs of the lunches you bought this week: {list} kr. What is the mean lunch cost?" },
        { sv: "Några kompisar kollar hur många följare de fick på sin nya kanal idag: {list}. Beräkna medelvärdet.", en: "A few friends check how many followers they gained on their new channel today: {list}. Calculate the mean." },
        { sv: "Här är tiderna i minuter det tog för dig att gå till skolan i veckan: {list}. Beräkna medelvärdet.", en: "Here are the times in minutes it took for you to walk to school this week: {list}. Calculate the mean." },
        { sv: "Du räknar hur många läskburkar som pantades i din familj under några veckor: {list}. Vad blir snittet?", en: "You count how many soda cans were recycled in your family over a few weeks: {list}. What is the average?" },
        { sv: "Poängen du fick på några matte-glosor är: {list}. Räkna ut ditt medelvärde för glostesterna.", en: "The scores you got on a few math vocabulary quizzes are: {list}. Calculate your mean for the quizzes." },
        { sv: "Här är antalet unboxing-videos du kollade på per dag i veckan: {list}. Beräkna medelvärdet.", en: "Here are the unboxing videos you watched per day this week: {list}. Calculate the mean." },
        { sv: "Några kompisar skriver ner hur många låtar de har i sina favorit-köer: {list}. Beräkna medelvärdet.", en: "A few friends write down how many songs they have in their favorite queues: {list}. Calculate the mean." },
        { sv: "Du kollar hur många minuter dina streams varade under veckan: {list}. Vad blir ditt medelvärde?", en: "You check how many minutes your streams lasted during the week: {list}. What is your mean?" },
        { sv: "Här är dina senaste tider i sekunder på 60 meter löpning: {list}. Räkna ut löptidernas medelvärde.", en: "Here are your recent times in seconds for a 60-meter sprint: {list}. Calculate the mean running time." },
        { sv: "Du räknar hur många bollar du slog i nätet på tennisen under några träningar: {list}. Bestäm snittet.", en: "You count how many balls you hit into the net during a few tennis sessions: {list}. Determine the average." },
        { sv: "Här är priserna på några olika biobiljetter i din stad: {list} kr. Beräkna biljetternas medelvärde.", en: "Here are the prices of a few movie tickets in your town: {list} kr. Calculate the mean ticket price." },
        { sv: "Några vänner kollar hur många sparade tiktoks de har i sina mappar: {list}. Beräkna medelvärdet.", en: "A few friends check how many saved TikToks they have in their folders: {list}. Calculate the mean." }
    ],

    // =========================================================================
    // 📊 4. STATS: MEDIAN ODD (15 Stories) - Parameters: {list}
    // =========================================================================
    stats_median_odd: [
        { sv: "Här är antalet matcher du spelade per vecka under två månader: {list}. Bestäm medianen.", en: "Here are the matches you played per week over two months: {list}. Determine the median." },
        { sv: "Du kollar hur många chips-påsar ditt kompisgäng köpte under några helger: {list}. Hitta medianen.", en: "You check how many bags of chips your friend group bought over a few weekends: {list}. Find the median." },
        { sv: "Antalet läksidor du fick läsa i läxa under några veckor var: {list}. Bestäm läxornas median.", en: "The homework pages assigned to you over a few weeks were: {list}. Determine the median." },
        { sv: "Här är antalet oöppnade snaps du har liggande på mobilen: {list}. Vad är medianen för dina snaps?", en: "Here are the unread Snapchats waiting on your phone: {list}. What is the median of your snaps?" },
        { sv: "Du kollar hur många reps du orkar göra med en tung hantel: {list}. Räkna ut repsens median.", en: "You check how many reps you can complete with a heavy dumbbell: {list}. Calculate the median of the reps." },
        { sv: "Här är dina poäng på de senaste testerna i engelska: {list}. Vilket värde blir medianen?", en: "Here are your scores on recent English quizzes: {list}. Which value is the median?" },
        { sv: "Du räknar hur många personer som stod i kön till skolmaten under några dagar: {list}. Hitta medianen.", en: "You count how many people stood in the lunch line over a few days: {list}. Find the median." },
        { sv: "Antalet nya kommentarer du fick på din senaste video per dag är: {list}. Bestäm medianen.", en: "The new comments you got on your recent video per day are: {list}. Determine the median." },
        { sv: "Dina kompisar kollar hur många timmar de har sparat i sin speltid-historik: {list}. Hitta medianen.", en: "Your friends check how many hours they have tracked in their playtime history: {list}. Find the median." },
        { sv: "Här är priserna på några olika energidrycker i mataffären: {list} kr. Bestäm medianpriset.", en: "Here are the prices of a few energy drinks at the grocery store: {list} kr. Determine the median price." },
        { sv: "Du kollar hur många minuter det tog att ladda ner några olika mobilspel: {list}. Hitta medianen.", en: "You check how many minutes it took to download a few mobile games: {list}. Find the median." },
        { sv: "Antalet sparade låtar på dina vänners Spotify-profiler är: {list}. Bestäm spellistornas median.", en: "The saved tracks on your friends' Spotify profiles are: {list}. Determine the median." },
        { sv: "Här är antalet bollar ditt lag sköt i stolpen under de senaste matcherna: {list}. Vad är medianen?", en: "Here are the number of times your team hit the goalpost during recent matches: {list}. What is the median?" },
        { sv: "Du mäter hur många sekunder det tar att boota din gamingdator några gånger: {list}. Hitta medianen.", en: "You measure how many seconds it takes to boot your gaming computer a few times: {list}. Find the median." },
        { sv: "Här är antalet klistermärken dina kompisar har på sina laptops: {list}. Räkna ut medianen.", en: "Here are the number of stickers your friends have on their laptops: {list}. Calculate the median." }
    ],

    // =========================================================================
    // 📊 5. STATS: REVERSE MEAN (15 Stories) - Parameters: {mean}, {knownList}
    // =========================================================================
    stats_reverse_mean: [
        { sv: "Medelvärdet av fyra personers skärmtid är {mean} timmar. Tre av dem har tiderna {knownList} timmar. Hur många timmar har den fjärde personen?", en: "The mean screen time of four people is {mean} hours. Three of them have times of {knownList} hours. How many hours does the fourth person have?" },
        { sv: "Medelpoängen på fyra spelrundor är {mean}. På de tre första rundorna fick du {knownList} poäng. Hur många poäng fick du på den fjärde rundan?", en: "The mean score of four game rounds is {mean}. On the first three rounds, you scored {knownList} points. How many points did you score in the fourth round?" },
        { sv: "Fyra kompisar har i genomsnitt {mean} kr på sina swish-konton. Tre av dem har {knownList} kr. Hur mycket pengar har den fjärde kompisen?", en: "Four friends have an average of {mean} kr in their swish accounts. Three of them have {knownList} kr. How much money does the fourth friend have?" },
        { sv: "Medelvärdet av vikten på fyra träningshantlar är {mean} kg. Tre av hantlarna väger {knownList} kg. Vad väger den fjärde hanteln?", en: "The mean weight of four workout dumbbells is {mean} kg. Three of the dumbbells weigh {knownList} kg. What does the fourth dumbbell weigh?" },
        { sv: "Snittet för antalet gjorda mål under fyra fotbollsmatcher är {mean} mål. I tre av matcherna blev det {knownList} mål. Hur många mål gjordes i den fjärde matchen?", en: "The average goals scored over four football matches is {mean} goals. In three of the matches, there were {knownList} goals. How many goals were scored in the fourth match?" },
        { sv: "Du har köpt fyra energidrycker och medelpriset blev {mean} kr. Tre av dryckerna kostade {knownList} kr. Vad kostade den fjärde burken?", en: "You bought four energy drinks and the mean price was {mean} kr. Three of the drinks cost {knownList} kr. What did the fourth can cost?" },
        { sv: "Medelåldern på fyra personer i din Discord-grupp är {mean} år. Tre av dem är {knownList} år gamla. Hur gammal är den fjärde personen?", en: "The mean age of four people in your Discord group is {mean} years. Three of them are {knownList} years old. How old is the fourth person?" },
        { sv: "Snitt-tiden för att ladda ner fyra olika appar är {mean} sekunder. Tre av apparna tog {knownList} sekunder. Hur lång tid tog den fjärde appen?", en: "The average time to download four different apps is {mean} seconds. Three of the apps took {knownList} seconds. How long did the fourth app take?" },
        { sv: "Medelvärdet av antal sparade tiktoks i fyra mappar är {mean}. Tre av mapparna innehåller {knownList} tiktoks. Hur många finns det i den fjärde mappen?", en: "The mean number of saved TikToks in four folders is {mean}. Three of the folders contain {knownList} TikToks. How many are in the fourth folder?" },
        { sv: "Du har skrivit fyra korta prov i skolan och din medelpoäng är {mean}. På tre av proven fick du {knownList} poäng. Vad fick du på det fjärde provet?", en: "You completed four quizzes at school and your mean score is {mean}. On three of the quizzes, you scored {knownList} points. What did you get on the fourth quiz?" },
        { sv: "Medelvärdet av antal skostorlekar i en familj på fyra personer är {mean}. Tre av familjemedlemmarna har storlekarna {knownList}. Vilken storlek har den fjärde?", en: "The mean shoe size in a family of four is {mean}. Three of the family members have sizes of {knownList}. What size does the fourth member have?" },
        { sv: "Fyra kompisar kollar sina Snapchat-streaks, och medelvärdet är {mean}. Tre av dem har {knownList} streaks. Hur många streaks har den fjärde vännen?", en: "Four friends check their Snapchat streaks, and the mean is {mean}. Three of them have {knownList} streaks. How many streaks does the fourth friend have?" },
        { sv: "Medeltemperaturen i ditt rum under fyra dagar har varit {mean} °C. Tre av dagarna uppmättes {knownList} °C. Vilken temperatur var det den fjärde dagen?", en: "The mean temperature in your room over four days has been {mean} °C. Three of the days measured {knownList} °C. What temperature was it on the fourth day?" },
        { sv: "Fyra spellistor har i genomsnitt {mean} låtar. Tre av spellistorna innehåller {knownList} låtar. Hur många låtar har den fjärde spellistan?", en: "Four playlists have an average of {mean} songs. Three of the playlists contain {knownList} songs. How many songs does the fourth playlist have?" },
        { sv: "Medelvärdet av antal pizzabitar som fyra personer åt är {mean} stycken. Tre av dem åt {knownList} bitar. Hur många bitar åt den fjärde personen?", en: "The mean number of pizza slices eaten by four people is {mean}. Three of them ate {knownList} slices. How many slices did the fourth person eat?" }
    ],

    // =========================================================================
    // 📊 6. STATS: FREQUENCY COUNT (15 Stories) - Concise table descriptors
    // =========================================================================
    stats_freq_count: [
        { sv: "Den här tabellen visar en undersökning om kompisars skärmtid igår. Hur många kompisar var med i undersökningen totalt?", en: "This table shows a survey about friends' screen time yesterday. How many friends participated in total?" },
        { sv: "Tabellen visar hur många timmar ett gäng spelar datorspel varje helg. Hur många personer ingår i datan totalt?", en: "The table tracks how many hours a group plays computer games every weekend. How many people are in the data in total?" },
        { sv: "Det här diagrammet visar antalet gjorda mål per match för ett lag. Räkna ut det totala antalet spelade matcher.", en: "This chart monitors the goals scored per match by a team. Calculate the total number of matches played." },
        { sv: "Klassen har röstat på hur många läskburkar de dricker i veckan. Hur många elever deltog i omröstningen totalt?", en: "The class voted on how many soda cans they drink per week. How many students participated in the vote in total?" },
        { sv: "Här visas en mätning av skostorlekar bland medlemmarna i en idrottsklubb. Hur många medlemmar har mätts totalt?", en: "This displays a measurement of shoe sizes among sports club members. How many members were measured in total?" },
        { sv: "Tabellen sammanställer hur många Snapchat-notiser ett gäng får per timme. Bestäm det totala antalet observationer.", en: "The table compiles how many Snapchat notifications a group gets per hour. Determine the total count of observations." },
        { sv: "Ett gym har sparat statistik över hur många tunga reps lyftare klarar i bänkpress. Hur många lyft har registrerats totalt?", en: "A gym tracked stats on how many heavy reps lifters complete on bench press. How many lifts were registered in total?" },
        { sv: "Den här frekvenstabellen visar hur många godisbitar det fanns i några provpåsar. Hur många påsar undersöktes totalt?", en: "This frequency table shows how many candies were in a few sample bags. How many bags were inspected in total?" },
        { sv: "Tabellen visar en sammanställning av åldrar i ett gaming-klan. Hur många medlemmar finns det i klanen totalt?", en: "The table shows a compilation of ages in a gaming clan. How many members are in the clan in total?" },
        { sv: "Det här diagrammet visar hur många gånger ett gäng kompisar käkat snabbmat denna månad. Hur många personer svarade totalt?", en: "This chart shows how many times a group of friends ate fast food this month. How many people answered in total?" },
        { sv: "Tabellen visar antalet sparade låtar i elevernas offline-spellistor. Hur många spellistor ingår i undersökningen totalt?", en: "The table details the number of saved songs in students' offline playlists. How many playlists are included in the survey in total?" },
        { sv: "Här sammanställs hur många minuter det tog för ett gäng att gå till skolan idag. Hur många elever mättes totalt?", en: "This compiles how many minutes it took for a group to walk to school today. How many students were measured in total?" },
        { sv: "Den här tabellen visar antalet likes på ett gäng nyligen publicerade posts. Hur många posts har räknats med totalt?", en: "This table tracks the number of likes on a group of recently published posts. How many posts were counted in total?" },
        { sv: "Kompisar har skrivit ner hur många streaming-serier de kollar på samtidigt. Hur många kompisar svarade på frågan totalt?", en: "Friends wrote down how many streaming series they watch simultaneously. How many friends answered the question in total?" },
        { sv: "Tabellen visar resultatet från en undersökning om antal timmar ungdomar tränar per vecka. Hur många svarades det totalt?", en: "The table shows the result from a survey on the hours teenagers workout per week. How many responses were collected in total?" }
    ],

    // =========================================================================
    // 📊 7. STATS: FREQUENCY MODE (15 Stories) - Concise table descriptors
    // =========================================================================
    stats_freq_mode: [
        { sv: "Den här tabellen visar en undersökning om kompisars skärmtid igår. Vilket är typvärdet för skärmtiden?", en: "This table shows a survey about friends' screen time yesterday. What is the mode of the screen time?" },
        { sv: "Tabellen visar hur många timmar ett gäng spelar datorspel varje helg. Bestäm speltimmarnas typvärde enligt datan.", en: "The table tracks how many hours a group plays computer games every weekend. Determine the mode of the playtime from the data." },
        { sv: "Det här diagrammet visar antalet gjorda mål per match för ett lag. Vilket är typvärdet för gjorda mål?", en: "This chart monitors the goals scored per match by a team. What is the mode of the goals scored?" },
        { sv: "Klassen har röstat på hur många läskburkar de dricker i veckan. Identifiera typvärdet för läskdrickandet i tabellen.", en: "The class voted on how many soda cans they drink per week. Identify the mode of the soda consumption in the table." },
        { sv: "Här visas en mätning av skostorlekar bland medlemmarna i en idrottsklubb. Vilken skostorlek är typvärdet?", en: "This displays a measurement of shoe sizes among sports club members. Which shoe size is the mode?" },
        { sv: "Tabellen sammanställer hur många Snapchat-notiser ett gäng får per timme. Bestäm notisernas typvärde utifrån tabellen.", en: "The table compiles how many Snapchat notifications a group gets per hour. Determine the mode of the notifications from the table." },
        { sv: "Ett gym har sparat statistik över hur många tunga reps lyftare klarar i bänkpress. Vilket antal reps är typvärdet?", en: "A gym tracked stats on how many heavy reps lifters complete on bench press. Which number of reps is the mode?" },
        { sv: "Den här frekvenstabellen visar hur många godisbitar det fanns i några provpåsar. Bestäm godisbitarnas typvärde.", en: "This frequency table shows how many candies were in a few sample bags. Determine the mode of the candy counts." },
        { sv: "Tabellen visar en sammanställning av åldrar i ett gaming-klan. Vilken ålder är klanens typvärde?", en: "The table shows a compilation of ages in a gaming clan. Which age is the clan's mode?" },
        { sv: "Det här diagrammet visar hur många gånger ett gäng kompisar käkat snabbmat denna månad. Bestäm typvärdet för besöken.", en: "This chart shows how many times a group of friends ate fast food this month. Determine the mode of the visits." },
        { sv: "Tabellen visar antalet sparade låtar i elevernas offline-spellistor. Vilket antal låtar representerar typvärdet?", en: "The table details the number of saved songs in students' offline playlists. What number of songs represents the mode?" },
        { sv: "Här sammanställs hur många minuter det tog för ett gäng att gå till skolan idag. Vilken gångtid är typvärdet?", en: "This compiles how many minutes it took for a group to walk to school today. Which walking time is the mode?" },
        { sv: "Den här tabellen visar antalet likes på ett gäng nyligen publicerade posts. Bestäm typvärdet för likesen i tabellen.", en: "This table tracks the number of likes on a group of recently published posts. Determine the mode of the likes from the table." },
        { sv: "Kompisar har skrivit ner hur många streaming-serier de kollar på samtidigt. Vilket är typvärdet för antalet serier?", en: "Friends wrote down how many streaming series they watch simultaneously. What is the mode of the number of series?" },
        { sv: "Tabellen visar resultatet från en undersökning om antal timmar ungdomar tränar per vecka. Identifiera träningstimmarnas typvärde.", en: "The table shows the result from a survey on the hours teenagers workout per week. Identify the mode of the workout hours." }
    ]
};