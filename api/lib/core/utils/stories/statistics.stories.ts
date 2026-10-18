// src/core/utils/stories/statistics.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

// =========================================================================
// 📊 1. STATS: FIND MODE (15 Stories) - Parameters: {list}
// =========================================================================
const MODE_STORIES: StoryScenario[] = [
    {
        id: "stat_mode_post_views",
        sv: "Här är antalet visningar på dina senaste inlägg: {list}. Vilket är typvärdet för visningarna?",
        en: "Here are the view counts on your recent post: {list}. What is the mode of the views?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_mode_candy_count",
        sv: "Du räknar antalet godisar i några påsar och får: {list}. Vilket är typvärdet för antalet godisar?",
        en: "You count the number of candies in a few bags and get: {list}. What is the mode of the candy count?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_mode_shoe_sizes",
        sv: "Ett gäng kompisar jämför sina skostorlekar: {list}. Bestäm skostorlekarnas typvärde.",
        en: "A group of friends compare their shoe sizes: {list}. Determine the mode of the shoe sizes.",
        rules: { minResult: 15 }
    },
    {
        id: "stat_mode_bus_wait_time",
        sv: "Du kollar hur många minuter du fick vänta på bussen i veckan: {list}. Vad är typvärdet?",
        en: "You check how many minutes you waited for the bus this week: {list}. What is the mode?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_mode_mobile_game_scores",
        sv: "Här är dina poäng på de senaste matcherna i ett mobilspel: {list}. Vilket är ditt typvärde?",
        en: "Here are your scores from the last few matches in a mobile game: {list}. What is the mode?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_mode_sleep_hours",
        sv: "Några kompisar skriver ner hur många timmar de sov i natt: {list}. Vad är sömnens typvärde?",
        en: "A few friends write down how many hours they slept last night: {list}. What is the mode of the sleeping hours?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_mode_playlist_songs",
        sv: "Du räknar hur många låtar som ligger på dina spellistor: {list}. Vilket är typvärdet?",
        en: "You count how many songs are on your playlists: {list}. What is the mode?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_mode_screen_hours",
        sv: "Några personer svarar på hur många skärmtimmar de hade igår: {list}. Vad är typvärdet?",
        en: "A few people share how many screen hours they had yesterday: {list}. What is the mode?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_mode_weekly_temperatures",
        sv: "Här är temperaturerna i Celsius under den senaste veckan: {list}. Bestäm veckans typvärde.",
        en: "Here are the temperatures in Celsius during the past week: {list}. Determine the week's mode."
    },
    {
        id: "stat_mode_pizza_slices",
        sv: "Du kollar hur många slices pizza dina kompisar orkar äta: {list}. Vilket är typvärdet?",
        en: "You check how many slices of pizza your friends can eat: {list}. What is the mode?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_mode_clan_ages",
        sv: "Här är åldrarna på personerna i ditt gaming-klan: {list}. Bestäm klanmedlemmarnas typvärde.",
        en: "Here are the ages of the people in your gaming clan: {list}. Determine the clan members' mode.",
        rules: { minResult: 5 }
    },
    {
        id: "stat_mode_pushup_reps",
        sv: "Du kollar hur många pushups dina kompisar klarar i sträck: {list}. Vad blir typvärdet?",
        en: "You check how many pushups your friends can do in a row: {list}. What is the mode?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_mode_likes_count",
        sv: "Här är antalet likes du fick på dina senaste posts: {list}. Vilket är typvärdet för dina likes?",
        en: "Here are the number of likes you got on your recent posts: {list}. What is the mode of your likes?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_mode_snapchat_streaks",
        sv: "Några personer räknar hur många Snapchat-streaks de har: {list}. Vad är streaksens typvärde?",
        en: "A few people count how many Snapchat streaks they have: {list}. What is the mode of the streaks?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_mode_soda_prices",
        sv: "Du kollar priset på några olika läskburkar i kiosken: {list} kr. Vilket är läskprisernas typvärde?",
        en: "You check the price of a few soda cans at the kiosk: {list} kr. What is the mode of the soda prices?",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 📊 2. STATS: FIND RANGE (15 Stories) - Parameters: {list}
// =========================================================================
const RANGE_STORIES: StoryScenario[] = [
    {
        id: "stat_range_quiz_scores",
        sv: "Dina senaste betygspoäng på några prov är: {list}. Beräkna variationsbredden för poängen.",
        en: "Your recent quiz scores are: {list}. Calculate the range of the scores.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_scrolling_minutes",
        sv: "Här är antalet minuter du scrollade på mobilen per dag i veckan: {list}. Vad är variationsbredden?",
        en: "Here are the minutes you spent scrolling on your phone per day this week: {list}. What is the range?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_gym_sessions",
        sv: "Ett gäng kompisar kollar hur många gym-pass de kört denna månad: {list}. Beräkna variationsbredden.",
        en: "A group of friends check how many gym sessions they completed this month: {list}. Calculate the range.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_playlist_lengths",
        sv: "Här är antalet låtar på dina kompisars favorit-spellistor: {list}. Vad är variationsbredden?",
        en: "Here are the number of songs on your friends' favorite playlists: {list}. What is the range?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_room_temperatures",
        sv: "Du mäter temperaturen i ditt rum under några dagar: {list} °C. Beräkna rummets variationsbredd.",
        en: "You measure the temperature in your room over a few days: {list} °C. Calculate the room's range.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_match_goals",
        sv: "Antalet gjorda mål för ditt fotbollslag under de senaste matcherna är: {list}. Bestäm variationsbredden.",
        en: "The goals scored by your football team during recent matches are: {list}. Determine the range.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_cousin_ages",
        sv: "Du kollar åldrarna på dina kusiner: {list} år. Räkna ut variationsbredden för deras åldrar.",
        en: "You check the ages of your cousins: {list} years. Calculate the range of their ages.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_caps_prices",
        sv: "Priserna på några olika kepsar i en onlinebutik är: {list} kr. Beräkna variationsbredden för priserna.",
        en: "The prices of a few caps in an online store are: {list} kr. Calculate the range of the prices.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_holiday_gaming_hours",
        sv: "Här är antalet timmar du spelat dator per dag under lovet: {list}. Vad är variationsbredden?",
        en: "Here are the hours you played computer games per day during the break: {list}. What is the range?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_series_watched",
        sv: "Några kompisar räknar hur många unika serier de kollat på i år: {list}. Bestäm variationsbredden.",
        en: "A few friends count how many unique series they watched this year: {list}. Determine the range.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_dumbbell_weights",
        sv: "Du kollar vikten i kg på några tunga hantlar i gymmet: {list}. Beräkna hantlarnas variationsbredd.",
        en: "You check the weight in kg of a few heavy dumbbells at the gym: {list}. Calculate the dumbbells' range.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_swish_amounts",
        sv: "Antalet fika-kronor dina kompisar har swishat dig är: {list} kr. Bestäm variationsbredden för swishen.",
        en: "The amounts in kr your friends swished you for snacks are: {list} kr. Determine the range of the swished amounts.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_book_pages",
        sv: "Du kollar hur många sidor det är i böckerna du har i din bokhylla: {list}. Vad är variationsbredden?",
        en: "You check how many pages are in the books on your bookshelf: {list}. What is the range?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_benchpress_reps",
        sv: "Här är antalet reps du klarade på bänkpressen under de senaste passen: {list}. Beräkna variationsbredden.",
        en: "Here are the reps you completed on the bench press during recent sessions: {list}. Calculate the range.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_range_snapchat_notifications",
        sv: "Du kollar hur många Snapchat-notiser du har fått under några timmar: {list}. Bestäm variationsbredden.",
        en: "You check how many Snapchat notifications you received over a few hours: {list}. Determine the range.",
        rules: { minResult: 0 }
    }
];

// =========================================================================
// 📊 3. STATS: CALC MEAN FROM SUM AND COUNT (15 Stories) - Groups: [sum, count, mean]
// =========================================================================
const STATS_MEAN_CALC_STORIES: StoryScenario[] = [
    {
        id: "stat_mc_screen_hours_total",
        sv: "Under {count} dagar hade du totalt {sum} skärmtimmar. Vad var ditt medelvärde per dag?",
        en: "Over {count} days you logged a total of {sum} screen hours. What was your daily mean?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mc_quiz_points_total",
        sv: "På {count} korta prov samlade du ihop sammanlagt {sum} poäng. Beräkna ditt medelvärde.",
        en: "Across {count} quizzes you scored a total of {sum} points. Calculate your mean.",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mc_lunch_costs_total",
        sv: "Du åt lunch ute {count} gånger och betalade totalt {sum} kr. Vad var medelkostnaden per lunch?",
        en: "You ate lunch out {count} times and spent a total of {sum} kr. What was the mean lunch cost?",
        rules: { integerOnly: ['count'], minResult: 1 }
    },
    {
        id: "stat_mc_running_sprint_total",
        sv: "Du sprang {count} sprintlopp och den sammanlagda tiden blev {sum} sekunder. Vad var din medeltid?",
        en: "You ran {count} sprints with a combined time of {sum} seconds. What was your mean time?",
        rules: { integerOnly: ['count'], minResult: 1 }
    },
    {
        id: "stat_mc_game_levels_total",
        sv: "Under {count} spelomgångar samlade laget ihop {sum} poäng totalt. Hur många poäng fick laget i snitt per omgång?",
        en: "Over {count} matches the team collected {sum} points in total. How many points did the team average per match?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mc_bottle_return_total",
        sv: "Under {count} veckor pantades totalt {sum} burkar i hushållet. Vad blev medelvärdet per vecka?",
        en: "Over {count} weeks a total of {sum} cans were recycled in the household. What was the weekly average?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mc_channel_followers_total",
        sv: "En ny kanal fick sammanlagt {sum} nya följare under {count} dagar. Beräkna det genomsnittliga antalet nya följare per dag.",
        en: "A new channel gained a total of {sum} followers over {count} days. Calculate the average follower gain per day.",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mc_stream_time_total",
        sv: "Dina {count} senaste streams varade sammanlagt i {sum} minuter. Vad var medellängden på dina streams?",
        en: "Your last {count} streams lasted a combined total of {sum} minutes. What was the mean duration?",
        rules: { integerOnly: ['count'], minResult: 1 }
    },
    {
        id: "stat_mc_movie_tickets_total",
        sv: "Ett kompisgäng köpte {count} biobiljetter för totalt {sum} kr. Vad var biljettpriset i genomsnitt?",
        en: "A group of friends bought {count} cinema tickets for a total of {sum} kr. What was the average ticket price?",
        rules: { integerOnly: ['count'], minResult: 1 }
    },
    {
        id: "stat_mc_homework_reading_total",
        sv: "Du läste {count} kapitel på totalt {sum} sidor. Hur många sidor innehöll varje kapitel i snitt?",
        en: "You read {count} chapters covering a total of {sum} pages. How many pages was each chapter on average?",
        rules: { integerOnly: ['count'], minResult: 1 }
    },
    {
        id: "stat_mc_chewing_gum_total",
        sv: "I {count} paket fanns sammanlagt {sum} tuggummin. Hur många tuggummin fanns det i snitt per paket?",
        en: "In {count} packs there were a total of {sum} chewing gums. How many chewing gums were there on average per pack?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mc_walk_to_school_total",
        sv: "Under {count} skoldagar tog det sammanlagt {sum} minuter att gå till skolan. Beräkna din medelgångtid.",
        en: "Over {count} school days it took a total of {sum} minutes to walk to school. Calculate your mean walking time.",
        rules: { integerOnly: ['count'], minResult: 1 }
    },
    {
        id: "stat_mc_unboxing_videos_total",
        sv: "Under {count} dagar kollade du på totalt {sum} unboxing-videor. Beräkna medelvärdet per dag.",
        en: "Over {count} days you watched a total of {sum} unboxing videos. Calculate the daily average.",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mc_tennis_net_hits_total",
        sv: "Under {count} tennisträningar slogs totalt {sum} bollar i nätet. Hur många nätbollar blev det i snitt per träning?",
        en: "During {count} tennis practices a total of {sum} balls hit the net. How many net balls were there on average per practice?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mc_saved_tiktoks_total",
        sv: "I {count} mappar har du sparat sammanlagt {sum} videoklipp. Vad är medelantalet klipp per mapp?",
        en: "In {count} folders you saved a total of {sum} video clips. What is the average number of clips per folder?",
        rules: { integerOnly: ['count'], minResult: 0 }
    }
];

// =========================================================================
// 📊 4. STATS: REVERSE MEAN FROM CURRENT SUM (15 Stories) - Groups: [mean, count, currentSum]
// =========================================================================
const STATS_MEAN_REVERSE_STORIES: StoryScenario[] = [
    {
        id: "stat_mr_screen_time_last",
        sv: "Medelvärdet av {count} personers skärmtid ska vara {mean} timmar. Tillsammans har de första personerna {currentSum} timmar. Vad måste den sista personens skärmtid vara?",
        en: "The mean screen time across {count} people is {mean} hours. Together the first people have {currentSum} hours. What must the final person's screen time be?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mr_quiz_scores_last",
        sv: "På {count} prov vill du nå ett medelvärde på {mean} poäng. På de tidigare proven har du samlat {currentSum} poäng. Hur många poäng behöver du på det sista provet?",
        en: "Across {count} quizzes you want to reach a mean of {mean} points. On the previous quizzes you collected {currentSum} points. How many points do you need on the final quiz?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mr_match_goals_last",
        sv: "Ett fotbollslag har målet att snitta {mean} mål per match över {count} matcher. Inför sista matchen har de gjort {currentSum} mål. Hur många mål måste de göra i den sista matchen?",
        en: "A football team aims to average {mean} goals per match over {count} matches. Before the final match they have scored {currentSum} goals. How many goals must they score in the last match?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mr_swish_balance_last",
        sv: "I en grupp på {count} kompisar ska genomsnittet på swish-saldot vara {mean} kr. Alla utom en person har tillsammans {currentSum} kr. Vad har den sista personen på sitt konto?",
        en: "In a group of {count} friends the average swish balance is {mean} kr. Everyone except one person has a combined {currentSum} kr. What balance does the final person have?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mr_dumbbell_weight_last",
        sv: "Medelvikten på {count} hantlar är {mean} kg. Vikten av alla hantlar utom en är tillsammans {currentSum} kg. Vad väger den sista hanteln?",
        en: "The mean weight of {count} dumbbells is {mean} kg. The combined weight of all except one is {currentSum} kg. How much does the last dumbbell weigh?",
        rules: { integerOnly: ['count'], minResult: 1 }
    },
    {
        id: "stat_mr_energy_drinks_last",
        sv: "Du köper {count} energidrycker med ett medelpris på {mean} kr. De första burkarna kostade tillsammans {currentSum} kr. Vad kostar den sista burken?",
        en: "You purchase {count} energy drinks with a mean cost of {mean} kr. The first cans cost a combined {currentSum} kr. What does the final can cost?",
        rules: { integerOnly: ['count'], minResult: 1 }
    },
    {
        id: "stat_mr_app_download_last",
        sv: "Snitt-tiden för att ladda ner {count} appar ska vara {mean} sekunder. De tidigare apparna tog tillsammans {currentSum} sekunder. Hur många sekunder tog den sista appen?",
        en: "The average download time for {count} apps is {mean} seconds. The previous apps took a total of {currentSum} seconds. How many seconds did the final app take?",
        rules: { integerOnly: ['count'], minResult: 1 }
    },
    {
        id: "stat_mr_tiktok_folders_last",
        sv: "Medelvärdet av antal sparade videor i {count} mappar är {mean}. I alla mappar utom en finns sammanlagt {currentSum} videor. Hur många videor finns i den sista mappen?",
        en: "The mean number of saved videos across {count} folders is {mean}. All folders except one contain a combined {currentSum} videos. How many videos are in the final folder?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mr_room_temp_last",
        sv: "Medeltemperaturen i ett rum under {count} dagar var {mean} °C. De första dagarna uppmätte tillsammans en temperatur-summa på {currentSum} °C. Vad var temperaturen den sista dagen?",
        en: "The mean temperature in a room over {count} days was {mean} °C. The first days had a combined temperature sum of {currentSum} °C. What was the temperature on the last day?",
        rules: { integerOnly: ['count'] }
    },
    {
        id: "stat_mr_pizza_slices_last",
        sv: "Ett sällskap på {count} personer åt i snitt {mean} pizzabitar var. Tillsammans åt alla utom en person {currentSum} bitar. Hur många bitar åt den sista personen?",
        en: "A group of {count} people ate an average of {mean} pizza slices each. Together all except one ate {currentSum} slices. How many slices did the last person eat?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mr_playlist_tracks_last",
        sv: "Ett gäng på {count} spellistor har i genomsnitt {mean} låtar. Alla spellistor utom en har tillsammans {currentSum} låtar. Hur många låtar har den sista spellistan?",
        en: "A group of {count} playlists has an average of {mean} songs. All playlists except one have a combined {currentSum} songs. How many songs does the final playlist have?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mr_snap_streak_last",
        sv: "Medelvärdet av Snapchat-streaks bland {count} kompisar är {mean}. Alla utom en person har tillsammans {currentSum} streaks. Hur många streaks har den sista kompisen?",
        en: "The mean Snapchat streak count among {count} friends is {mean}. Everyone except one person has a combined {currentSum} streaks. How many streaks does the final friend have?",
        rules: { integerOnly: ['count'], minResult: 0 }
    },
    {
        id: "stat_mr_family_shoe_size_last",
        sv: "Medelskostorleken i en grupp på {count} personer är {mean}. Alla utom en har skostorlekar som tillsammans summerar till {currentSum}. Vilken storlek har den sista personen?",
        en: "The mean shoe size in a group of {count} people is {mean}. All except one have shoe sizes summing up to {currentSum}. What shoe size does the final person have?",
        rules: { integerOnly: ['count'], minResult: 15 }
    },
    {
        id: "stat_mr_discord_age_last",
        sv: "Medelåldern för {count} personer i en röstkanal är {mean} år. Alla utom en har åldrar som summerar till {currentSum} år. Hur gammal är den sista personen?",
        en: "The mean age for {count} people in a voice channel is {mean} years. All except one have ages summing to {currentSum} years. How old is the final person?",
        rules: { integerOnly: ['count'], minResult: 1 }
    },
    {
        id: "stat_mr_recycled_cans_last",
        sv: "Familjen har målet att panta i snitt {mean} burkar per vecka under {count} veckor. Hittills har de pantat {currentSum} burkar. Hur många burkar måste de panta sista veckan?",
        en: "The family aims to recycle an average of {mean} cans per week over {count} weeks. So far they have recycled {currentSum} cans. How many cans must they recycle in the last week?",
        rules: { integerOnly: ['count'], minResult: 0 }
    }
];

// =========================================================================
// 📊 5. STATS: LEGACY LIST-BASED MEAN (15 Stories) - Parameters: {list}
// =========================================================================
const LIST_MEAN_STORIES: StoryScenario[] = [
    {
        id: "stat_lm_screen_hours",
        sv: "Här är antalet skärmtimmar du hade per dag under förra veckan: {list}. Beräkna ditt medelvärde.",
        en: "Here are the screen hours you had per day during last week: {list}. Calculate your mean.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_lm_chewing_gums",
        sv: "Du och dina kompisar räknar hur många tuggummin ni har i fickorna: {list}. Vad blir medelvärdet?",
        en: "You and your friends count how many chewing gums you have in your pockets: {list}. What is the mean?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_lm_level_scores",
        sv: "Dina poäng på de senaste fem nivåerna i ett spel är: {list}. Räkna ut medelvärdet för dina poäng.",
        en: "Your scores on the last five levels in a game are: {list}. Calculate the mean of your scores.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_lm_lunch_costs",
        sv: "Här är kostnaden för luncherna du köpte i veckan: {list} kr. Vad mäter lunchernas medelvärde?",
        en: "Here are the costs of the lunches you bought this week: {list} kr. What is the mean lunch cost?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_lm_channel_followers",
        sv: "Några kompisar kollar hur många följare de fick på sin nya kanal idag: {list}. Beräkna medelvärdet.",
        en: "A few friends check how many followers they gained on their new channel today: {list}. Calculate the mean.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_lm_school_walk_minutes",
        sv: "Här är tiderna i minuter det tog för dig att gå till skolan i veckan: {list}. Beräkna medelvärdet.",
        en: "Here are the times in minutes it took for you to walk to school this week: {list}. Calculate the mean.",
        rules: { minResult: 1 }
    },
    {
        id: "stat_lm_recycled_cans",
        sv: "Du räknar hur många läskburkar som pantades i din familj under några veckor: {list}. Vad blir snittet?",
        en: "You count how many soda cans were recycled in your family over a few weeks: {list}. What is the average?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_lm_quiz_points",
        sv: "Poängen du fick på några matte-glosor är: {list}. Räkna ut ditt medelvärde för glostesterna.",
        en: "The scores you got on a few math vocabulary quizzes are: {list}. Calculate your mean for the quizzes.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_lm_unboxing_videos",
        sv: "Här är antalet unboxing-videos du kollade på per dag i veckan: {list}. Beräkna medelvärdet.",
        en: "Here are the unboxing videos you watched per day this week: {list}. Calculate the mean.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_lm_queue_songs",
        sv: "Några kompisar skriver ner hur många låtar de har i sina favorit-köer: {list}. Beräkna medelvärdet.",
        en: "A few friends write down how many songs they have in their favorite queues: {list}. Calculate the mean.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_lm_stream_duration",
        sv: "Du kollar hur många minuter dina streams varade under veckan: {list}. Vad blir ditt medelvärde?",
        en: "You check how many minutes your streams lasted during the week: {list}. What is your mean?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_lm_sprint_seconds",
        sv: "Här är dina senaste tider i sekunder på 60 meter löpning: {list}. Räkna ut löptidernas medelvärde.",
        en: "Here are your recent times in seconds for a 60-meter sprint: {list}. Calculate the mean running time.",
        rules: { minResult: 5 }
    },
    {
        id: "stat_lm_net_hits",
        sv: "Du räknar hur många bollar du slog i nätet på tennisen under några träningar: {list}. Bestäm snittet.",
        en: "You count how many balls you hit into the net during a few tennis sessions: {list}. Determine the average.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_lm_movie_ticket_prices",
        sv: "Här är priserna på några olika biobiljetter i din stad: {list} kr. Beräkna biljetternas medelvärde.",
        en: "Here are the prices of a few movie tickets in your town: {list} kr. Calculate the mean ticket price.",
        rules: { minResult: 1 }
    },
    {
        id: "stat_lm_saved_tiktoks",
        sv: "Några vänner kollar hur många sparade tiktoks de har i sina mappar: {list}. Beräkna medelvärdet.",
        en: "A few friends check how many saved TikToks they have in their folders: {list}. Calculate the mean.",
        rules: { minResult: 0 }
    }
];

// =========================================================================
// 📊 6. STATS: MEDIAN ODD (15 Stories) - Parameters: {list}
// =========================================================================
const MEDIAN_ODD_STORIES: StoryScenario[] = [
    {
        id: "stat_med_matches_played",
        sv: "Här är antalet matcher du spelade per vecka under två månader: {list}. Bestäm medianen.",
        en: "Here are the matches you played per week over two months: {list}. Determine the median.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_med_chips_bags",
        sv: "Du kollar hur många chips-påsar ditt kompisgäng köpte under några helger: {list}. Hitta medianen.",
        en: "You check how many bags of chips your friend group bought over a few weekends: {list}. Find the median.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_med_homework_pages",
        sv: "Antalet sidor du fick läsa i läxa under några veckor var: {list}. Bestäm medianen.",
        en: "The homework pages assigned to you over a few weeks were: {list}. Determine the median.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_med_unread_snaps",
        sv: "Här är antalet oöppnade snaps du har liggande på mobilen: {list}. Vad är medianen för dina snaps?",
        en: "Here are the unread Snapchats waiting on your phone: {list}. What is the median of your snaps?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_med_dumbbell_reps",
        sv: "Du kollar hur många reps du orkar göra med en tung hantel: {list}. Räkna ut repsens median.",
        en: "You check how many reps you can complete with a heavy dumbbell: {list}. Calculate the median of the reps.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_med_quiz_scores",
        sv: "Här är dina poäng på de senaste testerna i engelska: {list}. Vilket värde blir medianen?",
        en: "Here are your scores on recent English quizzes: {list}. Which value is the median?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_med_lunch_queue",
        sv: "Du räknar hur många personer som stod i kön till skolmaten under några dagar: {list}. Hitta medianen.",
        en: "You count how many people stood in the lunch line over a few days: {list}. Find the median.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_med_video_comments",
        sv: "Antalet nya kommentarer du fick på din senaste video per dag är: {list}. Bestäm medianen.",
        en: "The new comments you got on your recent video per day are: {list}. Determine the median.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_med_playtime_hours",
        sv: "Dina kompisar kollar hur många timmar de har sparat i sin speltid-historik: {list}. Hitta medianen.",
        en: "Your friends check how many hours they have tracked in their playtime history: {list}. Find the median.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_med_energy_drink_prices",
        sv: "Här är priserna på några olika energidrycker i mataffären: {list} kr. Bestäm medianpriset.",
        en: "Here are the prices of a few energy drinks at the grocery store: {list} kr. Determine the median price.",
        rules: { minResult: 1 }
    },
    {
        id: "stat_med_download_minutes",
        sv: "Du kollar hur många minuter det tog att ladda ner några olika mobilspel: {list}. Hitta medianen.",
        en: "You check how many minutes it took to download a few mobile games: {list}. Find the median.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_med_saved_songs",
        sv: "Antalet sparade låtar på dina vänners Spotify-profiler är: {list}. Bestäm spellistornas median.",
        en: "The saved tracks on your friends' Spotify profiles are: {list}. Determine the median.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_med_goalpost_hits",
        sv: "Här är antalet bollar ditt lag sköt i stolpen under de senaste matcherna: {list}. Vad är medianen?",
        en: "Here are the number of times your team hit the goalpost during recent matches: {list}. What is the median?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_med_pc_boot_seconds",
        sv: "Du mäter hur många sekunder det tar att boota din gamingdator några gånger: {list}. Hitta medianen.",
        en: "You measure how many seconds it takes to boot your gaming computer a few times: {list}. Find the median.",
        rules: { minResult: 1 }
    },
    {
        id: "stat_med_laptop_stickers",
        sv: "Här är antalet klistermärken dina kompisar har på sina laptops: {list}. Räkna ut medianen.",
        en: "Here are the number of stickers your friends have on their laptops: {list}. Calculate the median.",
        rules: { minResult: 0 }
    }
];

// =========================================================================
// 📊 7. STATS: FREQUENCY COUNT (15 Stories)
// =========================================================================
const FREQ_COUNT_STORIES: StoryScenario[] = [
    {
        id: "stat_fc_screen_time_survey",
        sv: "Den här tabellen visar en undersökning om kompisars skärmtid igår. Hur många kompisar var med i undersökningen totalt?",
        en: "This table shows a survey about friends' screen time yesterday. How many friends participated in total?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_weekend_gaming_hours",
        sv: "Tabellen visar hur många timmar ett gäng spelar datorspel varje helg. Hur många personer ingår i datan totalt?",
        en: "The table tracks how many hours a group plays computer games every weekend. How many people are in the data in total?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_match_goals_total",
        sv: "Det här diagrammet visar antalet gjorda mål per match för ett lag. Räkna ut det totala antalet spelade matcher.",
        en: "This chart monitors the goals scored per match by a team. Calculate the total number of matches played.",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_soda_cans_vote",
        sv: "Klassen har röstat på hur många läskburkar de dricker i veckan. Hur många elever deltog i omröstningen totalt?",
        en: "The class voted on how many soda cans they drink per week. How many students participated in the vote in total?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_shoe_sizes_sample",
        sv: "Här visas en mätning av skostorlekar bland medlemmarna i en idrottsklubb. Hur många medlemmar har mätts totalt?",
        en: "This displays a measurement of shoe sizes among sports club members. How many members were measured in total?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_notifications_per_hour",
        sv: "Tabellen sammanställer hur många Snapchat-notiser ett gäng får per timme. Bestäm det totala antalet observationer.",
        en: "The table compiles how many Snapchat notifications a group gets per hour. Determine the total count of observations.",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_benchpress_records",
        sv: "Ett gym har sparat statistik över hur många tunga reps lyftare klarar i bänkpress. Hur många lyft har registrerats totalt?",
        en: "A gym tracked stats on how many heavy reps lifters complete on bench press. How many lifts were registered in total?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_sample_candy_bags",
        sv: "Den här frekvenstabellen visar hur många godisbitar det fanns i några provpåsar. Hur många påsar undersöktes totalt?",
        en: "This frequency table shows how many candies were in a few sample bags. How many bags were inspected in total?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_clan_ages_total",
        sv: "Tabellen visar en sammanställning av åldrar i ett gaming-klan. Hur många medlemmar finns det i klanen totalt?",
        en: "The table shows a compilation of ages in a gaming clan. How many members are in the clan in total?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_fastfood_survey",
        sv: "Det här diagrammet visar hur många gånger ett gäng kompisar käkat snabbmat denna månad. Hur många personer svarade totalt?",
        en: "This chart shows how many times a group of friends ate fast food this month. How many people answered in total?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_playlist_sample_count",
        sv: "Tabellen visar antalet sparade låtar i elevernas offline-spellistor. Hur många spellistor ingår i undersökningen totalt?",
        en: "The table details the number of saved songs in students' offline playlists. How many playlists are included in the survey in total?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_walking_times_sample",
        sv: "Här sammanställs hur många minuter det tog för ett gäng att gå till skolan idag. Hur många elever mättes totalt?",
        en: "This compiles how many minutes it took for a group to walk to school today. How many students were measured in total?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_posts_likes_sample",
        sv: "Den här tabellen visar antalet likes på ett gäng nyligen publicerade posts. Hur många posts har räknats med totalt?",
        en: "This table tracks the number of likes on a group of recently published posts. How many posts were counted in total?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_series_watched_sample",
        sv: "Kompisar har skrivit ner hur många streaming-serier de kollar på samtidigt. Hur många kompisar svarade på frågan totalt?",
        en: "Friends wrote down how many streaming series they watch simultaneously. How many friends answered the question in total?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fc_teen_workout_survey",
        sv: "Tabellen visar resultatet från en undersökning om antal timmar ungdomar tränar per vecka. Hur många svarades det totalt?",
        en: "The table shows the result from a survey on the hours teenagers workout per week. How many responses were collected in total?",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 📊 8. STATS: FREQUENCY MODE (15 Stories)
// =========================================================================
const FREQ_MODE_STORIES: StoryScenario[] = [
    {
        id: "stat_fm_screen_time_mode",
        sv: "Den här tabellen visar en undersökning om kompisars skärmtid igår. Vilket är typvärdet för skärmtiden?",
        en: "This table shows a survey about friends' screen time yesterday. What is the mode of the screen time?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_fm_playtime_mode",
        sv: "Tabellen visar hur många timmar ett gäng spelar datorspel varje helg. Bestäm speltimmarnas typvärde enligt datan.",
        en: "The table tracks how many hours a group plays computer games every weekend. Determine the mode of the playtime from the data.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_fm_goals_mode",
        sv: "Det här diagrammet visar antalet gjorda mål per match för ett lag. Vilket är typvärdet för gjorda mål?",
        en: "This chart monitors the goals scored per match by a team. What is the mode of the goals scored?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_fm_soda_consumption_mode",
        sv: "Klassen har röstat på hur många läskburkar de dricker i veckan. Identifiera typvärdet för läskdrickandet i tabellen.",
        en: "The class voted on how many soda cans they drink per week. Identify the mode of the soda consumption in the table.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_fm_shoe_size_mode",
        sv: "Här visas en mätning av skostorlekar bland medlemmarna i en idrottsklubb. Vilken skostorlek är typvärdet?",
        en: "This displays a measurement of shoe sizes among sports club members. Which shoe size is the mode?",
        rules: { minResult: 15 }
    },
    {
        id: "stat_fm_notifications_mode",
        sv: "Tabellen sammanställer hur många Snapchat-notiser ett gäng får per timme. Bestäm notisernas typvärde utifrån tabellen.",
        en: "The table compiles how many Snapchat notifications a group gets per hour. Determine the mode of the notifications from the table.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_fm_benchpress_mode",
        sv: "Ett gym har sparat statistik över hur många tunga reps lyftare klarar i bänkpress. Vilket antal reps är typvärdet?",
        en: "A gym tracked stats on how many heavy reps lifters complete on bench press. Which number of reps is the mode?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_fm_candy_count_mode",
        sv: "Den här frekvenstabellen visar hur många godisbitar det fanns i några provpåsar. Bestäm godisbitarnas typvärde.",
        en: "This frequency table shows how many candies were in a few sample bags. Determine the mode of the candy counts.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_fm_clan_age_mode",
        sv: "Tabellen visar en sammanställning av åldrar i ett gaming-klan. Vilken ålder är klanens typvärde?",
        en: "The table shows a compilation of ages in a gaming clan. Which age is the clan's mode?",
        rules: { minResult: 5 }
    },
    {
        id: "stat_fm_fastfood_mode",
        sv: "Det här diagrammet visar hur många gånger ett gäng kompisar käkat snabbmat denna månad. Bestäm typvärdet för besöken.",
        en: "This chart shows how many times a group of friends ate fast food this month. Determine the mode of the visits.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_fm_saved_songs_mode",
        sv: "Tabellen visar antalet sparade låtar i elevernas offline-spellistor. Vilket antal låtar representerar typvärdet?",
        en: "The table details the number of saved songs in students' offline playlists. What number of songs represents the mode?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_fm_walk_time_mode",
        sv: "Här sammanställs hur många minuter det tog för ett gäng att gå till skolan idag. Vilken gångtid är typvärdet?",
        en: "This compiles how many minutes it took for a group to walk to school today. Which walking time is the mode?",
        rules: { minResult: 1 }
    },
    {
        id: "stat_fm_post_likes_mode",
        sv: "Den här tabellen visar antalet likes på ett gäng nyligen publicerade posts. Bestäm typvärdet för likesen i tabellen.",
        en: "This table tracks the number of likes on a group of recently published posts. Determine the mode of the likes from the table.",
        rules: { minResult: 0 }
    },
    {
        id: "stat_fm_series_count_mode",
        sv: "Kompisar har skrivit ner hur många streaming-serier de kollar på samtidigt. Vilket är typvärdet för antalet serier?",
        en: "Friends wrote down how many streaming series they watch simultaneously. What is the mode of the number of series?",
        rules: { minResult: 0 }
    },
    {
        id: "stat_fm_teen_workout_mode",
        sv: "Tabellen visar resultatet från en undersökning om antal timmar ungdomar tränar per vecka. Identifiera träningstimmarnas typvärde.",
        en: "The table shows the result from a survey on the hours teenagers workout per week. Identify the mode of the workout hours.",
        rules: { minResult: 0 }
    }
];

export const STATISTICS_STORIES: Record<string, StoryScenario[]> = {
    stats_find_mode: MODE_STORIES,
    stats_find_range: RANGE_STORIES,
    stats_median_odd: MEDIAN_ODD_STORIES,
    stats_freq_count: FREQ_COUNT_STORIES,
    stats_freq_mode: FREQ_MODE_STORIES,

    // Keys matching SKILL_BUCKETS
    stats_mean_calc: STATS_MEAN_CALC_STORIES,
    stats_mean_reverse: STATS_MEAN_REVERSE_STORIES,

    // Legacy keys
    stats_calc_mean: LIST_MEAN_STORIES,
    stats_reverse_mean: STATS_MEAN_REVERSE_STORIES
};