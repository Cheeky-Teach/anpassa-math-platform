// src/core/utils/stories/percent.stories.ts
import { StoryScenario } from '../WordProblemInterceptor.js';

export const PERCENT_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 🎯 1. PERCENT OF AMOUNT (Requires placeholders: {pct} and {base})
    // =========================================================================
    percent_of_amount: [
        {
            sv: "Din mobil har {base} mAh i batterikapacitet när den är fulladdad. Just nu är det {pct}% kvar på batteriet. Hur många mAh ström motsvarar det?",
            en: "Your phone has a maximum of {base} mAh of battery power when fully charged. Right now, there is {pct}% left. How many mAh of power is that?"
        },
        {
            sv: "Det går totalt {base} elever på en skola. En dag cyklade {pct}% av alla elever till skolan. Hur många elever cyklade?",
            en: "There are {base} students attending a school. One day, it turned out that {pct}% of all students rode their bike to school. How many students bicycled?"
        },
        {
            sv: "Ett nytt mobilspel tar totalt {base} GB i utrymme. Din nerladdning har precis nått {pct}%. Hur många GB har laddats ner hittills?",
            en: "A new mobile game takes {base} GB of total storage space. Your download has just reached {pct}%. How many GB have been downloaded so far?"
        },
        {
            sv: "En stor påse snacks väger {base} gram. Enligt förpackningen är {pct}% av innehållet extra krispiga linschips. Hur många gram linschips finns det i påsen?",
            en: "A large bag of snacks weighs {base} grams. According to the bag, {pct}% of the contents are extra crispy lentil chips. How many grams of lentil chips are in the bag?"
        },
        {
            sv: "Liam skrollade igenom {base} korta videoklipp i sitt flöde under kvällen. Han märkte att {pct}% av dem handlade om roliga husdjur. Hur många klipp handlade om husdjur?",
            en: "Liam scrolled through {base} short videos on his feed during the evening. He noticed that {pct}% of them were about funny pets. How many videos were about pets?"
        },
        {
            sv: "En bärbar högtalare har en maxvolym på {base} decibel. Under ett häng skruvar kompisarna ner ljudet till {pct}% av maxvolymen. På vilken volym spelas musiken?",
            en: "A portable speaker has a maximum volume of {base} decibels. During a hangout, the friends turn down the sound to {pct}% of the maximum. What volume is the music playing at?"
        },
        {
            sv: "En klädbutik köpte in {base} par av en snygg samlarsneaker. Redan under den första timmen såldes {pct}% av alla skor. Hur många par skor såldes direkt?",
            en: "A clothing store ordered {base} pairs of a stylish collectible sneaker. Within the first hour, {pct}% of all shoes were sold out. How many pairs of shoes were bought immediately?"
        },
        {
            sv: "Maja har {base} bilder sparade i sitt mobilgalleri. När hon bläddrade igenom dem såg hon att {pct}% var selfies med hennes kompisar. Hur många av bilderna är selfies?",
            en: "Maja has {base} photos saved in her phone gallery. When scrolling through them, she found that {pct}% were selfies with her friends. How many of the photos are selfies?"
        },
        {
            sv: "Din spellista för gymmet är totalt {base} minuter lång. Peppiga hiphop-låtar utgör {pct}% av den totala tiden. Hur många minuter hiphop är det?",
            en: "Your gym workout playlist is {base} minutes long in total. Energetic hip-hop tracks make up {pct}% of the total time. How many minutes of hip-hop is that?"
        },
        {
            sv: "En spännande streamingserie har totalt {base} avsnitt. Noah har kollat på {pct}% av hela serien. Hur många avsnitt har han sett?",
            en: "An exciting streaming series has {base} total episodes across all seasons. Noah has watched {pct}% of the entire series. How many episodes has he seen?"
        },
        {
            sv: "En livesändning på nätet höll på i {base} minuter totalt. Streamern la {pct}% av sändningen på att bara svara på frågor i chatten. Hur många minuter la streamern på chatten?",
            en: "A gaming live stream lasted for {base} minutes in total. The streamer spent {pct}% of the session simply answering questions in the chat. How many minutes were spent on the chat?"
        },
        {
            sv: "Olivia köpte ett storpack med {base} färgglada hårsnoddar. Hon bestämde sig för att ge {pct}% av dem till sin syster. Hur många snoddar fick systern?",
            en: "Olivia bought a large pack of {base} colorful hair ties. She decided to give {pct}% of them to her sister. How many hair ties did her sister get?"
        },
        {
            sv: "En ny skatepark täcker en markyta på {base} kvadratmeter. Själva betongramperna tar upp {pct}% av parkens totala yta. Hur stor yta täcker ramperna?",
            en: "A new skatepark covers a ground area of {base} square meters. The concrete ramps themselves take up {pct}% of the park's area. How much surface area do the ramps occupy?"
        },
        {
            sv: "En kiosk sålde {base} muggar boba-te under en solig lördag. Det visade sig att {pct}% av alla beställningar gällde muggar med extra boba-pärlor. Hur många muggar fick extra pärlor?",
            en: "A bubble tea shop sold {base} cups of boba milk tea on a sunny Saturday. It turned out that {pct}% of all orders requested extra tapioca pearls. How many cups got extra pearls?"
        },
        {
            sv: "Ett syskonpar sparade ihop {base} kr på sitt sommarjobb. De använde {pct}% av pengarna till att köpa konsertbiljetter. Hur mycket kostade biljetterna?",
            en: "A pair of siblings saved up {base} kr from their summer job allowance. They used {pct}% of that cash to buy concert tickets. How much did the tickets cost?"
        }
    ],

    // =========================================================================
    // 🎯 2. PERCENT BASE PART (Requires placeholders: {part} and {pct})
    // =========================================================================
    percent_base_part: [
        {
            sv: "Ett skollag samlade in {part} kr till sin klassresa. Det utgör {pct}% av vad hela resan kommer att kosta. Vad kostar resan totalt (100%)?",
            en: "A school team raised {part} kr for their class trip. That is {pct}% of what the entire trip will cost. What is the total cost of the trip (100%)?"
        },
        {
            sv: "En stor uppdatering till din spelkonsol har laddat ner {part} MB. Skärmen visar att det här är exakt {pct}% av hela filen. Hur stor är filen totalt i MB?",
            en: "A big update for your gaming console has downloaded {part} MB. The screen shows that this is exactly {pct}% of the whole file. How large is the file in total in MB?"
        },
        {
            sv: "Klara köpte {part} biljetter till en konsert och fick höra att det var {pct}% av alla biljetter som fanns kvar. Hur många biljetter fanns det kvar totalt?",
            en: "Klara bought {part} tickets for a concert, and was told that this was {pct}% of all the tickets left at the box office. How many tickets were left in total?"
        },
        {
            sv: "Inför en fredagsfilm är {part} av platserna i biosalongen bokade. Det motsvarar {pct}% av alla stolar i salongen. Hur många platser har salongen totalt?",
            en: "Ahead of a Friday movie, {part} of the seats in the cinema theater are booked. That is the same as {pct}% of all the seats in the theater. How many seats does the cinema have in total?"
        },
        {
            sv: "I Hugos garderob är {part} av alla tröjor svarta. De svarta tröjorna utgör exakt {pct}% av alla tröjor han äger. Hur många tröjor har Hugo totalt?",
            en: "In Hugo's wardrobe, {part} of all his shirts are black. The black shirts make up exactly {pct}% of all the shirts he owns. How many shirts does Hugo have in total?"
        },
        {
            sv: "En tecknare har gjort klart {part} rutor till sin serie. Det täcker exakt {pct}% av hela projektet. Hur många rutor kommer serien att ha när den är helt färdig?",
            en: "An artist completed {part} panels of a comic strip. This covers exactly {pct}% of the total project. How many panels will the comic strip have when it is finished?"
        },
        {
            sv: "I en mobilutmaning fick du ihop {part} poäng på den första banan. Det är {pct}% av poängen som behövs för att vinna. Hur många poäng krävs totalt för vinst?",
            en: "In a mobile game challenge, you scored {part} points on the first level. That is {pct}% of the score needed to win. What total score is required to win?"
        },
        {
            sv: "Lukas har sparat ihop {part} kr till ett nytt grafikkort. Det utgör {pct}% av vad kortet kostar i butiken. Vad är grafikkortets totala pris?",
            en: "Lukas saved up {part} kr for a new graphics card. That is {pct}% of what the card costs in the shop. What is the total retail price of the graphics card?"
        },
        {
            sv: "Ett videoredigeringsprogram har bearbetat {part} bilder av ett klipp. Enligt mätaren är klippet klart till {pct}%. Hur många bilder har hela klippet totalt?",
            en: "A video editing app processed {part} frames of a short clip. According to the loading bar, it is {pct}% complete. How many frames are in the whole clip in total?"
        },
        {
            sv: "Inför skoldansen hann kommittén dekorera {part} bord. Det visade sig motsvara {pct}% av alla bord i salen. Hur många bord ska dekoreras totalt?",
            en: "Ahead of a school dance, the committee decorated {part} tables. This turned out to be {pct}% of all tables in the hall. How many tables are there in total?"
        },
        {
            sv: "En elev läste ut {part} kapitel i en spännande bok under helgen. Det är {pct}% av alla kapitel som finns i boken. Hur många kapitel har boken totalt?",
            en: "A student read {part} chapters of an exciting book over the weekend. That is {pct}% of all the chapters in the book. How many chapters does the book have total?"
        },
        {
            sv: "Din smartklocka visar att du har gått {part} steg hittills idag. Du har därmed nått {pct}% av ditt dagliga mål. Vad är ditt totala stegmål för en hel dag?",
            en: "Your smartwatch shows that you walked {part} steps so far today. You achieved {pct}% of your daily goal. What is your total step count goal for a whole day?"
        },
        {
            sv: "Emma la {part} minuter på att plugga glosor i mobilen. Det utgjorde {pct}% av all tid hon la på läxor den dagen. Hur många minuter la hon på läxor totalt?",
            en: "Emma spent {part} minutes studying vocabulary on her phone. That was {pct}% of her total study time that day. How many minutes did she study in total?"
        },
        {
            sv: "Ett populärt fik sålde {part} kalla lattes före lunch. Det var {pct}% av alla drycker de sålde under hela dagen. Hur många drycker sålde de totalt?",
            en: "A popular cafe sold {part} iced lattes before noon. That was {pct}% of all the drinks they sold during the entire day. How many drinks did they sell in total?"
        },
        {
            sv: "Ett stort ark med klistermärken innehåller {part} glittriga märken. De glittriga märkena utgör {pct}% av alla klistermärken på arket. Hur många märken finns det totalt?",
            en: "A large sheet of stickers contains {part} glittery stickers. The glittery ones make up {pct}% of all the stickers on the sheet. How many stickers are there total?"
        }
    ],

    // =========================================================================
    // 🎯 3. PERCENT FIND RATE (Requires placeholders: {part} and {whole})
    // =========================================================================
    percent_find_rate: [
        {
            sv: "Till en klassfest köptes det in {whole} pizzabitar. När kvällen var slut hade man ätit upp {part} av bitarna. Hur många procent av pizzan gick åt?",
            en: "For a class party, {whole} pizza slices were bought. By the end of the evening, {part} of the slices had been eaten. What percentage of the pizza was consumed?"
        },
        {
            sv: "En skolbuss har plats för högst {whole} personer. På väg till matchen räknade ledaren till {part} passagerare på bussen. Hur många procent av platserna var upptagna?",
            en: "A school bus has room for at most {whole} people. On the way to the game, the leader counted {part} passengers on the bus. What percentage of the seats were taken?"
        },
        {
            sv: "På ett prov med totalt {whole} poäng fick Emma {part} poäng. Hur många procent rätt hade Emma på provet?",
            en: "On a test with a total of {whole} points, Emma scored {part} points. What percentage did Emma get right on the test?"
        },
        {
            sv: "Maja la upp en omröstning på sin story där totalt {whole} personer röstade. Av dessa svarade {part} personer 'Ja'. Hur många procent röstade 'Ja'?",
            en: "Maja posted a poll on her story where a total of {whole} people voted. Out of these, {part} people voted 'Yes'. What percentage voted 'Yes'?"
        },
        {
            sv: "Leo har en spellista med {whole} låtar totalt. Han hann lyssna på {part} av låtarna medan han åkte buss. Hur många procent av spellistan har han lyssnat på?",
            en: "Leo has a playlist with {whole} songs in total. He managed to listen to {part} of the songs while riding the bus. What percentage of the playlist has he listened to?"
        },
        {
            sv: "En kartong innehåller {whole} munkar. Ett kompisgäng lyckades äta upp {part} av dem under en pluggkväll. Hur många procent av munkarna åt de upp?",
            en: "A box contains {whole} donuts, and a group of friends managed to finish {part} of them during a study night. What percentage of the donuts did they eat?"
        },
        {
            sv: "En kreatör fick {whole} kommentarer på sitt senaste videoklipp. Av dessa bestod {part} stycken bara av glada emojis. Hur många procent av kommentarerna var glada emojis?",
            en: "A creator received {whole} comments on their latest video clip. Out of those, {part} were just happy emojis. What percentage of the comments were happy emojis?"
        },
        {
            sv: "I ett fotbollsspel på mobilen tog du {whole} straffsparkar under en match och satte bollen i mål på {part} av dem. Vad blev din målprocent?",
            en: "In a mobile soccer game, you took {whole} penalty kicks during a match and scored a goal on {part} of them. What was your scoring percentage?"
        },
        {
            sv: "En ryggsäck klarar av en maxvikt på {whole} kg. Idag väger de tunga skolböckerna i väskan {part} kg. Hur många procent av maxvikten utnyttjas?",
            en: "A backpack can handle a maximum weight of {whole} kg. Today, the heavy school books inside the bag weigh {part} kg. What percentage of the max weight is being used?"
        },
        {
            sv: "En biograf har totalt {whole} salonger. Just nu visar {part} av salongerna samma actionfilm. Hur många procent av biosalongerna visar actionfilmen?",
            en: "A local cinema theater has {whole} screens in total, and right now, {part} of those screens are showing the same action movie. What percentage of the screens show the action movie?"
        },
        {
            sv: "En påse surt godis innehåller {whole} bitar totalt. När du häller ut dem ser du att {part} bitar har smaken sur vattenmelon. Hur många procent av godiset har smak av vattenmelon?",
            en: "A bag of sour candy contains {whole} pieces total. When pouring them out, you see that {part} pieces are sour watermelon flavor. What percentage is watermelon?"
        },
        {
            sv: "Bland {whole} tillfrågade elever svarade {part} personer att de hellre spelar volleyboll än basket på gympan. Hur många procent föredrog volleyboll?",
            en: "Out of {whole} students surveyed during gym class, {part} people answered that they prefer playing volleyball over basketball. What percentage preferred volleyball?"
        },
        {
            sv: "Ett mål på en snabbmatsrestaurang innehåller {whole} kalorier totalt. Pommes fritesen står ensamma för {part} kalorier. Hur många procent av måltidens kalorier kommer från pommes fritesen?",
            en: "A combo meal at a fast-food restaurant contains {whole} calories in total. The French fries alone account for {part} calories. What percentage of the meal's calories comes from the fries?"
        },
        {
            sv: "Du la till {whole} korta videoklipp i en delad mapp. Just nu har {part} av klippen laddats upp helt. Hur många procent av uppladdningen är klar?",
            en: "You added {whole} short video clips to a shared online folder. Right now, {part} of the clips have finished uploading completely. What percentage of the upload is complete?"
        },
        {
            sv: "En samlarbox till ett kortspel innehåller {whole} kort totalt. Du bläddrar igenom dem och hittar {part} stycken sällsynta glittriga kort. Hur många procent av korten är sällsynta?",
            en: "A collector box of cards for a card game contains {whole} cards in total. You look through them and find {part} rare shiny cards. What percentage are rare?"
        }
    ],

    // =========================================================================
    // 🎯 4. VALUE DELTA (Requires placeholders: {diff} and {oldV})
    // =========================================================================
    value_delta: [
        {
            sv: "Månadsavgiften för en streamingtjänst var tidigare {oldV} kr. Nu har företaget ändrat priset med {diff} kr per månad. Hur stor var prisförändringen i procent?",
            en: "The monthly fee for a streaming service was previously {oldV} kr. Now, the company has changed the price by {diff} kr per month. What was the price change in percent?"
        },
        {
            sv: "En snygg hoodie kostade från början {oldV} kr i en nätbutik. Nu har priset sänkts med {diff} kr. Hur stor var prissänkningen i procent?",
            en: "A stylish hoodie originally cost {oldV} kr in an online store. Now, the price has been reduced by {diff} kr. What was the price reduction in percent?"
        },
        {
            sv: "Ett gamingkonto på sociala medier hade {oldV} följare förra veckan. Den här veckan ändrades antalet följare med {diff} personer. Hur stor var förändringen i procent?",
            en: "A gaming account on social media had {oldV} followers last week. This week, the follower count changed by {diff} people. What was the change in percent?"
        },
        {
            sv: "En elevs genomsnittliga skärmtid på mobilen var förra månaden {oldV} minuter. Den här månaden ändrades tiden med {diff} minuter. Hur stor var förändringen i procent?",
            en: "A student's average mobile screen time last month was {oldV} minutes. This month, the time changed by {diff} minutes. What was the screen time change in percent?"
        },
        {
            sv: "Priset på en trådlös gamingmus var {oldV} kr innan en rea startade. Under rean sänktes priset med {diff} kr. Hur många procents rabatt fick man?",
            en: "The price of a wireless gaming mouse was {oldV} kr before a sale started. During the sale, the price was reduced by {diff} kr. What percentage discount was given?"
        },
        {
            sv: "En löpares personliga rekordtid på en kort löprunda var {oldV} sekunder. Genom att träna hårt lyckades hen förbättra sin tid med {diff} sekunder. Hur stor var förändringen i procent?",
            en: "A runner's personal best time for a short sprint was {oldV} seconds. By training hard, they managed to improve their time by {diff} seconds. What was the change in percent?"
        },
        {
            sv: "Ett träningskort på ett gym kostade {oldV} kr under vintern, men inför sommaren ändrade gymmet priset med {diff} kr. Hur stor var prisförändringen i procent?",
            en: "A gym membership pass cost {oldV} kr during the winter, but ahead of the summer, the gym adjusted the price by {diff} kr. What was the price change in percent?"
        },
        {
            sv: "En aktiv Discord-kanal hade {oldV} medlemmar online under vardagarna. Under helgen ändrades antalet medlemmar med {diff} personer. Hur stor var förändringen i procent?",
            en: "An active Discord channel had {oldV} members online during weekdays. Over the weekend, the number of active members changed by {diff} people. What was the change in percent?"
        },
        {
            sv: "Batterihälsan på en gammal surfplatta försämrades från sitt ursprungliga maxvärde på {oldV} mAh med {diff} mAh efter två års användning. Hur stor var minskningen i procent?",
            en: "The battery health of an old tablet degraded from its original baseline of {oldV} mAh by {diff} mAh after two years of use. What was the performance loss in percent?"
        },
        {
            sv: "Biljettpriset till en konsert med ett kompisband var {oldV} kr, men för studenter ändrades priset med {diff} kr. Hur stor var rabatten i procent?",
            en: "The ticket price for a local garage concert with a friend's band was {oldV} kr, but for students, the price was adjusted by {diff} kr. What was the discount in percent?"
        },
        {
            sv: "Ett nytt videoklipp fick {oldV} visningar under sitt första dygn på nätet. Under det andra dygnet ändrades visningsantalet med {diff} visningar. Hur stor var förändringen i procent?",
            en: "A new video clip got {oldV} views during its first day online. During the second day, the view count changed by {diff} views. What was the view count change in percent?"
        },
        {
            sv: "Storleken på en mobilapp tog tidigare upp {oldV} MB utrymme. Efter en uppdatering minskade appens storlek med {diff} MB. Hur stor var minskningen i procent?",
            en: "The storage size of a mobile app occupied {oldV} MB of space. After an optimization update, the app's size was reduced by {diff} MB. What was the reduction in percent?"
        },
        {
            sv: "En snygg skateboard kostade från början {oldV} kr i en skateshop. På grund av en höstutförsäljning sänktes priset med {diff} kr. Hur stor var prissänkningen i procent?",
            en: "A cool skateboard originally cost {oldV} kr at a local skate shop. Due to an autumn clearance, the price tag was reduced by {diff} kr. What was the price drop in percent?"
        },
        {
            sv: "En skolmatsal serverade {oldV} lunchsallader under en måndag. På tisdagen ändrades efterfrågan med {diff} portioner. Hur stor var förändringen i procent?",
            en: "A school cafeteria served {oldV} lunch wraps on Monday. On Tuesday, the demand changed by {diff} servings. What was the consumption change in percent?"
        },
        {
            sv: "En elev fick {oldV} poäng på ett träningsprov i matte. Efter en veckas extra repetition ändrades resultatet med {diff} poäng på nästa prov. Hur stor var förändringen i procent?",
            en: "A student scored {oldV} points on a math practice exam. After an extra week of review, their test score changed by {diff} points on the next exam. What was the score change in percent?"
        }
    ]
};