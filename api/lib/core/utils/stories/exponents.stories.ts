// src/core/utils/stories/exponents.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

export const EXPONENTS_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // ⚡ 1. FOUNDATIONS CALC (15 Stories) - Parameters: {base}, {exp}
    // =========================================================================
    exp_foundations_calc: [
        {
            id: "exp_fc_viral_post_views",
            sv: "En bild du delade sprider sig. Varje timme blir visningarna {base} gånger fler. Hur många visningar har den efter {exp} timmar?",
            en: "A picture you shared is spreading. Every hour, the views increase {base} times. How many views does it have after {exp} hours?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_sword_upgrade_damage",
            sv: "Ditt svärd i ett mobilspel levlar upp. Varje uppgradering gör skadan {base} gånger större. Du uppgraderar det {exp} gånger. Hur mycket skada gör det nu?",
            en: "Your sword in a mobile game levels up. Every upgrade makes the damage {base} times stronger. You upgrade it {exp} times. How much damage does it do now?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_server_video_chain",
            sv: "En video delas på en server. Varje sekund sparar {base} nya personer klippet i en kedja. Hur många filer finns det efter {exp} sekunder?",
            en: "A video is shared on a server. Every second, {base} new people save the clip in a chain. How many files exist after {exp} seconds?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_folder_unpack_steps",
            sv: "Du packar upp en fil i flera mappar. Varje mapp har {base} undermappar. Detta sker i {exp} steg. Hur många undermappar finns i det sista steget?",
            en: "You unpack a file into folders. Each folder has {base} subfolders. This happens in {exp} steps. How many subfolders are in the final step?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_online_game_virus",
            sv: "Ett virus i ett onlinespel sprider sig. Varje timme blir de smittade spelarna {base} ggr fler. Hur många är smittade efter {exp} timmar?",
            en: "A virus in an online game spreads. Every hour, the infected players increase {base} times. How many are infected after {exp} hours?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_soda_can_pyramid",
            sv: "Du bygger en pyramid av läskburkar. Varje lager har {base} gånger fler burkar än lagret ovanför. Överst finns 1 burk. Hur många finns i lager {exp}?",
            en: "You build a pyramid of soda cans. Each layer has {base} times more cans than the layer above. The top has 1 can. How many are in layer {exp}?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_subscriber_growth_rate",
            sv: "En kanal ökar sina prenumeranter. Varje månad blir ökningen {base} gånger större. Ökningen håller i sig i {exp} månader. Hur stor är den sista månaden?",
            en: "A channel gains subscribers. Every month, the growth is {base} times larger. This continues for {exp} months. How large is the growth in the last month?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_gold_coins_multiplier",
            sv: "Dina guldmynt i ett spel blir {base} gånger fler varje dygn om du sparar dem. Du sparar i {exp} dygn. Hur många gånger större blir din guldhög?",
            en: "Your gold coins in a game multiply by {base} every day you save them. You save for {exp} days. How many times larger does your gold stash become?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_influencer_challenge_chain",
            sv: "En influencer startar en utmaning. Varje person utmanar {base} nya vänner. Utmaningen sprider sig i {exp} led. Hur många utmanas i det sista ledet?",
            en: "An influencer starts a challenge. Each person challenges {base} new friends. This goes on for {exp} rounds. How many are challenged in the final round?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_light_filter_split",
            sv: "Ett filter delar upp en ljusstråle i {base} nya strålar. Strålarna går igenom {exp} likadana filter. Hur många strålar kommer ut i slutet?",
            en: "A filter splits a light beam into {base} new beams. The beams pass through {exp} identical filters. How many beams come out at the end?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_memory_card_version",
            sv: "Ett minneskort ökar sin lagring med en faktor på {base} för varje ny version. Hur mycket mer data rymmer version {exp} än grundversionen?",
            en: "A memory card multiplies its storage by {base} for each new version. How much more data does version {exp} hold than the base version?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_chat_group_invites",
            sv: "En chattgrupp växer genom att varje medlem bjuder in {base} kompisar nästa dag. Detta pågår i {exp} dagar. Hur många bjuds in sista dagen?",
            en: "A chat group grows by each member inviting {base} friends the next day. This goes on for {exp} days. How many are invited on the final day?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_school_rumor_breaks",
            sv: "Ett rykte sprids på skolan. Varje person berättar det för {base} nya i nästa rast. Det sprids under {exp} raster. Hur många hör det sista rasten?",
            en: "A rumor spreads at school. Each person tells {base} new people during the next break. It spreads for {exp} breaks. How many hear it during the last break?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_robot_code_replication",
            sv: "I ett rymdspel kopierar en robotkod sig själv till {base} nya kopior varje minut. Hur många robotkoder finns det efter {exp} minuter?",
            en: "In a space game, a robot code makes {base} new copies of itself every minute. How many robot codes exist after {exp} minuter?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        },
        {
            id: "exp_fc_paper_folding_layers",
            sv: "Du viker ett papper på mitten om och om igen. Varje vikning gör papperslagren {base} gånger fler. Hur många lager tjockt är det efter {exp} vikningar?",
            en: "You fold a paper in half over and over. Each fold makes the layers {base} times more. How many layers thick is it after {exp} folds?",
            rules: { integerOnly: ['base', 'exp'], minResult: 1 }
        }
    ],

    // =========================================================================
    // ⚡ 2. EXP TEN POSITIVE (15 Stories) - Parameters: {exp}
    // =========================================================================
    exp_ten_positive: [
        {
            id: "exp_tp_viral_video_views",
            sv: "En viral video har nått 10^{exp} visningar. Skriv detta antal som ett vanligt heltal.",
            en: "A viral video has reached 10^{exp} views. Write this number as a regular integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_cloud_bytes_free",
            sv: "Ett molnkonto har en ledig kapacitet på 10^{exp} bytes. Hur många bytes är det skrivet som ett vanligt heltal?",
            en: "A cloud drive has 10^{exp} bytes of free space. How many bytes is that written as a regular integer?",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_highscore_points",
            sv: "Du samlar poäng i ett spel och din highscore har nått 10^{exp} poäng. Skriv poängen som ett vanligt heltal.",
            en: "You score points in a game and your highscore has reached 10^{exp} points. Write the score as a regular integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_server_searches_sec",
            sv: "En server klarar av 10^{exp} sökningar per sekund. Skriv antalet sökningar som ett vanligt heltal.",
            en: "A server handles 10^{exp} searches per second. Write the number of searches as a regular integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_color_combinations",
            sv: "Antalet färgkombinationer i ett ritprogram är 10^{exp}. Hur många kombinationer är det som ett vanligt heltal?",
            en: "The number of color combinations in a paint app is 10^{exp}. How many combinations is that as a regular integer?",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_online_shop_parcels",
            sv: "En nätbutik skickade ut 10^{exp} paket förra året. Skriv antalet paket som ett vanligt heltal.",
            en: "An online shop shipped 10^{exp} packages last year. Write the number of packages as a regular integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_gaming_event_kilobytes",
            sv: "Ett gaming-event gjorde av med totalt 10^{exp} kilobyte data. Skriv datamängden som ett vanligt heltal.",
            en: "A gaming event used a total of 10^{exp} kilobytes of data. Write the amount of data as a regular integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_music_saved_tracks",
            sv: "Antalet sparade låtar i en musik-app är totalt 10^{exp} stycken. Skriv antalet låtar som ett vanligt heltal.",
            en: "The number of saved tracks in a music app is 10^{exp} in total. Write the number of tracks as a regular integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_display_resolution_pixels",
            sv: "En ny skärm har en upplösning med totalt 10^{exp} pixlar. Skriv antalet pixlar som ett vanligt heltal.",
            en: "A new monitor screen has a resolution of 10^{exp} pixels in total. Write the pixel count as a regular integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_discord_messages_total",
            sv: "En Discord-server har skickat totalt 10^{exp} meddelanden. Skriv antalet meddelanden som ett vanligt heltal.",
            en: "A Discord server has sent a total of 10^{exp} messages. Write the number of messages as a regular integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_space_planet_meters",
            sv: "Avståndet till en planet i ett rymdspel anges till 10^{exp} meter. Skriv avståndet som ett vanligt heltal.",
            en: "The distance to a planet in a space game is 10^{exp} meters. Write the distance as a regular integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_microsecond_calculations",
            sv: "En dator gör 10^{exp} beräkningar på en mikrosekund under ett test. Skriv antalet beräkningar som ett heltal.",
            en: "A computer performs 10^{exp} calculations in one microsecond during a test. Write the number of calculations as an integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_song_streams_plays",
            sv: "Streams på en populär låt nådde totalt 10^{exp} uppspelningar igår. Skriv antalet streams som ett vanligt heltal.",
            en: "Streams on a popular song reached 10^{exp} plays yesterday. Write the stream count as a regular integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_black_friday_clicks",
            sv: "En hemsida fick 10^{exp} klick under Black Friday. Skriv det totala antalet klick som ett heltal.",
            en: "A website received 10^{exp} clicks during Black Friday. Write the total number of clicks as an integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        },
        {
            id: "exp_tp_server_watt_seconds",
            sv: "En serverhall förbrukar 10^{exp} wattsekunder energi under en timme. Skriv energimängden som ett vanligt heltal.",
            en: "A server hall consumes 10^{exp} watt-seconds of energy during one hour. Write the energy amount as a regular integer.",
            rules: { integerOnly: ['exp'], minResult: 1 }
        }
    ],

    // =========================================================================
    // ⚡ 3. EXP TEN NEGATIVE (15 Stories) - Parameters: {exp}
    // =========================================================================
    exp_ten_negative: [
        {
            id: "exp_tn_screen_response_time",
            sv: "Svarstiden för en gamingskärm är 10^{-{exp}} sekunder. Skriv denna korta tid som ett vanligt decimaltal.",
            en: "The response time for a gaming screen is 10^{-{exp}} seconds. Write this short time as a regular decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_chip_line_width_mm",
            sv: "Bredden på en linje i ett nytt mobil-chip är 10^{-{exp}} millimeter. Skriv detta mått som ett decimaltal.",
            en: "The width of a line in a new phone chip is 10^{-{exp}} millimeters. Write this measure as a decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_vr_pixel_refresh",
            sv: "Laddningstiden för en pixel i VR-brillor är 10^{-{exp}} sekunder. Skriv om detta till ett vanligt decimaltal.",
            en: "The refresh time for a pixel in VR goggles is 10^{-{exp}} seconds. Rewrite this as a regular decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_laser_cutter_margin_cm",
            sv: "En laserskärare har en felmarginal på 10^{-{exp}} cm när den klipper kepsar. Skriv felmarginalen som ett decimaltal.",
            en: "A laser cutter has a margin of error of 10^{-{exp}} cm when shaping caps. Write the margin of error as a decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_protector_thickness_m",
            sv: "Tjockleken på skyddsfilmen till en mobilskärm är 10^{-{exp}} meter. Skriv tjockleken som ett decimaltal.",
            en: "The thickness of the screen protector for a phone is 10^{-{exp}} meters. Write the thickness as a decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_lens_movement_per_click",
            sv: "Ett verktyg flyttar en lins 10^{-{exp}} mm per klick när kameran ställs in. Skriv sträckan som ett decimaltal.",
            en: "A tool moves a lens 10^{-{exp}} mm per click when adjusting a camera. Write the distance as a decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_dust_speck_grams",
            sv: "Ett dammkorn som hamnat på din datormus väger 10^{-{exp}} gram. Skriv dammkornets vikt som ett decimaltal.",
            en: "A speck of dust that landed on your computer mouse weighs 10^{-{exp}} grams. Write the dust's weight as a decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_audio_cable_signal_time",
            sv: "Tiden det tar för en signal att gå genom en ljudsladd är 10^{-{exp}} sekunder. Skriv tiden som ett vanligt decimaltal.",
            en: "The time for a signal to pass through an audio cable is 10^{-{exp}} seconds. Write the time as a regular decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_printer_ink_per_pixel",
            sv: "Mängden bläck per pixel i en skrivare är 10^{-{exp}} ml. Skriv denna volym som ett decimaltal.",
            en: "The amount of ink per pixel in a printer is 10^{-{exp}} ml. Write this volume as a decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_joystick_sensor_movement",
            sv: "En sensor känner av en rörelse på 10^{-{exp}} centimeter på en styrspak. Skriv rörelsen som ett decimaltal.",
            en: "A sensor detects a movement of 10^{-{exp}} centimeters on a joystick. Write the movement as a decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_network_cable_lag",
            sv: "Fördröjningen i en nätverkskabel mäts till 10^{-{exp}} sekunder. Skriv fördröjningen som ett decimaltal.",
            en: "The lag in a network cable is measured at 10^{-{exp}} seconds. Write the lag as a decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_thread_diameter_m",
            sv: "En specialtråd till en hoodie-logga har tråddiametern 10^{-{exp}} meter. Skriv diametern som ett vanligt decimaltal.",
            en: "A special thread for a hoodie logo has a diameter of 10^{-{exp}} meters. Write the diameter as a regular decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_3d_printer_precision_mm",
            sv: "Noggrannheten i en 3D-skrivare mäts till 10^{-{exp}} mm. Skriv måttet som ett decimaltal.",
            en: "The precision of a 3D printer measures 10^{-{exp}} mm. Write the measure as a decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_graphic_pixel_detail_cm",
            sv: "Storleken på en pixeldetalj i en bildfil är 10^{-{exp}} cm på skärmen. Skriv storleken som ett vanligt decimaltal.",
            en: "The size of a pixel detail in a graphic file is 10^{-{exp}} cm on screen. Write the size as a regular decimal number.",
            rules: { integerOnly: ['exp'] }
        },
        {
            id: "exp_tn_camera_shutter_speed",
            sv: "Tiden det tar för en kameraslutare att stängas är 10^{-{exp}} sekunder. Skriv tiden som ett decimaltal.",
            en: "The time it takes for a camera shutter to close is 10^{-{exp}} seconds. Write the time as a decimal number.",
            rules: { integerOnly: ['exp'] }
        }
    ],

    // =========================================================================
    // ⚡ 4. EXP TEN INVERSE (15 Stories) - Parameters: {num}
    // =========================================================================
    exp_ten_inverse: [
        {
            id: "exp_ti_youtube_view_milestone",
            sv: "En video på Youtube nådde precis {num} visningar. Skriv detta stora antal som en kort tiopotens.",
            en: "A video on YouTube just reached {num} views. Write this large number as a short power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_server_capacity_bytes",
            sv: "En server för sparade skolarbeten rymmer filer upp till {num} bytes. Skriv kapaciteten som en tiopotens.",
            en: "A server for schoolwork holds files up to {num} bytes. Write the capacity as a power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_followers_milestone",
            sv: "Ditt favoriting-konto nådde precis {num} följare. Skriv antalet följare som en tiopotens.",
            en: "Your favorite account just reached {num} followers. Write the follower count as a power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_gaming_monitor_contrast",
            sv: "En ny spelskärm har en kontrast på {num} till 1. Skriv talet {num} som en kort tiopotens.",
            en: "A new gaming monitor has a contrast ratio of {num} to 1. Write the number {num} as a short power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_chocolate_factory_bars",
            sv: "En fabrik tillverkade totalt {num} chokladkakor i veckan. Skriv antalet som en tiopotens.",
            en: "A factory manufactured a total of {num} chocolate bars this week. Write the count as a power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_database_concurrent_users",
            sv: "En databas för ett onlinespel klarar av {num} spelarkonton samtidigt. Skriv antalet konton som en tiopotens.",
            en: "A database for an online game handles {num} player accounts simultaneously. Write the number of accounts as a power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_shoe_factory_sneakers",
            sv: "En sko-fabrik tillverkade {num} par sneakers förra året. Skriv antalet sneakers som en tiopotens.",
            en: "A shoe factory produced {num} pairs of sneakers last year. Write the number of sneakers as a power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_music_app_saved_songs",
            sv: "Antalet sparade låtar i en musik-app nådde milstolpen {num} stycken. Skriv talet {num} som en tiopotens.",
            en: "The number of saved tracks in a music app reached the milestone of {num} songs. Write the number {num} as a power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_website_download_logs",
            sv: "Du ser i loggen att en hemsida har laddats ner {num} gånger. Skriv antalet nedladdningar som en tiopotens.",
            en: "You see in the logs that a website has been downloaded {num} times. Write the number of downloads as a power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_clothing_brand_hoodie_logos",
            sv: "Ett klädmärke har tryckt totalt {num} loggor på sina hoodies i år. Skriv antalet loggor som en tiopotens.",
            en: "A clothing brand printed a total of {num} logos on its hoodies this year. Write the number of logos as a power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_hard_drive_kilobytes",
            sv: "En ny hårddisk rymmer totalt {num} kilobyte lagringsutrymme. Skriv utrymmet som en tiopotens.",
            en: "A new hard drive holds a total of {num} kilobytes of storage space. Write the space as a power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_network_switch_packets",
            sv: "En nätverksswitch har skickat {num} datapaket det senaste dygnet. Skriv mängden paket som en tiopotens.",
            en: "A network switch transmitted {num} data packets over the past 24 hours. Write the packet amount as a power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_ad_wall_total_pixels",
            sv: "Det totala antalet pixlar i en stor reklamvägg är {num}. Omvandla antalet pixlar till en kort tiopotens.",
            en: "The total number of pixels in a large advertising wall is {num}. Convert the pixel count into a short power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_pizzeria_baked_pizzas",
            sv: "En pizzeria har gräddat totalt {num} pizzor sedan de öppnade. Skriv antalet pizzor som en tiopotens.",
            en: "A pizza shop has baked a total of {num} pizzas since opening. Write the number of pizzas as a power of ten.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_ti_channel_short_views",
            sv: "En kanal har nått totalt {num} visningar på sina korta videoklipp. Skriv visningsantalet som en tiopotens.",
            en: "A channel reached a total of {num} views on its short clips. Write the view count as a power of ten.",
            rules: { minResult: 1 }
        }
    ],

    // =========================================================================
    // ⚡ 5. EXP SCIENTIFIC TO FORM (15 Stories) - Parameters: {number}
    // =========================================================================
    exp_scientific_to_form: [
        {
            id: "exp_st_global_game_players",
            sv: "Antalet aktiva spelare i ett globalt spel är {number}. Skriv detta stora antal i grundpotensform.",
            en: "The number of active players in a global game is {number}. Write this large number in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_server_hall_bandwidth",
            sv: "En serverhall skickar {number} bytes data varje sekund. Skriv om datamängden till grundpotensform.",
            en: "A server hall transmits {number} bytes of data every second. Rewrite the data amount in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_phone_microcircuits",
            sv: "Ett teknikföretag har tillverkat {number} små kretsar till mobiler. Skriv antalet kretsar i grundpotensform.",
            en: "A tech company made {number} tiny circuits for phones. Write the number of circuits in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_music_searches_annual",
            sv: "Antalet sökningar på en musiksida under ett år var {number}. Skriv antalet sökningar i grundpotensform.",
            en: "The number of searches on a music site in a year was {number}. Write the number of searches in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_monitor_color_shades",
            sv: "En ny skärm kan visa {number} olika färgnyanser. Skriv färgantalet i grundpotensform.",
            en: "A new monitor screen can display {number} different color shades. Write the color count in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_beach_sand_grains",
            sv: "Det beräknade antalet sandkorn på en badstrand är {number} stycken. Skriv sandkornens antal i grundpotensform.",
            en: "The estimated number of sand grains on a beach is {number}. Write the grain count in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_soda_can_production",
            sv: "En fabrik har producerat totalt {number} läskburkar sedan starten. Skriv antalet burkar i grundpotensform.",
            en: "A factory has produced a total of {number} soda cans since starting. Write the can count in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_channel_monthly_views",
            sv: "Visningarna på en spelares kanal nådde totalt {number} förra månaden. Skriv detta i grundpotensform.",
            en: "The views on a player's channel reached a total of {number} last month. Write this in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_cloud_saved_images",
            sv: "En molntjänst har sparat totalt {number} bildfiler i sina databaser. Skriv antalet filer i grundpotensform.",
            en: "A cloud service saved a total of {number} image files in its databases. Write the file count in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_space_game_star_dist",
            sv: "Avståndet i meter till en stjärna i ett rymdspel anges till {number} meter. Skriv avståndet i grundpotensform.",
            en: "The distance in meters to a star in a space game is given as {number} meters. Write the distance in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_clothing_sale_garments",
            sv: "Ett klädmärke sålde totalt {number} plagg under sitt stora rea-event. Skriv antalet plagg i grundpotensform.",
            en: "A clothing brand sold a total of {number} garments during its big sale event. Write the garment count in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_viral_link_clicks",
            sv: "Det totala antalet klick på en viral länk under en vecka mäter {number}. Omvandla klickmängden till grundpotensform.",
            en: "The total number of clicks on a viral link during a week measures {number}. Convert the click amount into scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_school_paper_sheets",
            sv: "En skola har använt totalt {number} pappersark under de senaste tio åren. Skriv antalet ark i grundpotensform.",
            en: "A school has used a total of {number} sheets of paper over the past ten years. Write the sheet count in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_secret_level_unlock_codes",
            sv: "Antalet unika koder för att låsa upp en hemlig nivå i ett spel är {number}. Skriv kodantalet i grundpotensform.",
            en: "The number of unique codes to unlock a secret level in a game is {number}. Write the code count in scientific notation.",
            rules: { minResult: 1 }
        },
        {
            id: "exp_st_holiday_sorted_packages",
            sv: "Ett företag sorterade totalt {number} paket under julsäsongen på sitt lager. Skriv antalet paket i grundpotensform.",
            en: "A logistics company sorted a total of {number} packages during the holidays at its warehouse. Write the package count in scientific notation.",
            rules: { minResult: 1 }
        }
    ],

    // =========================================================================
    // ⚡ 6. EXP SCIENTIFIC MISSING (15 Stories) - Parameters: {number}, {exponent}
    // =========================================================================
    exp_scientific_missing: [
        {
            id: "exp_sm_game_registered_users",
            sv: "Ett onlinespel har {number} användare registrerade. Detta skrivs som a · 10^{exponent}. Vilket värde har 'a'?",
            en: "An online game has {number} users registered. This is written as a · 10^{exponent}. What value does 'a' have?",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_server_daily_uploads",
            sv: "En serverhall laddar upp {number} filer per dygn, vilket förkortas till a · 10^{exponent}. Vilket värde på 'a' saknas?",
            en: "A server hall uploads {number} files per day, which is shortened to a · 10^{exponent}. What value of 'a' is missing?",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_image_file_pixels",
            sv: "En bildfil på en dator innehåller {number} pixlar totalt. Det visas som a · 10^{exponent}. Bestäm talet 'a'.",
            en: "An image file on a computer contains {number} pixels in total. It is displayed as a · 10^{exponent}. Determine the number 'a'.",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_channel_views_count",
            sv: "Antalet visningar på din kanal nådde {number} stycken, vilket skrivs som a · 10^{exponent}. Vilket värde har 'a'?",
            en: "The view count on your channel reached {number}, which is written as a · 10^{exponent}. What value does 'a' have?",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_hoodie_batch_manufacturing",
            sv: "Ett klädmärke har tillverkat {number} hoodies i en stor batch. Siffran anges som a · 10^{exponent}. Hitta värdet på 'a'.",
            en: "A clothing brand manufactured {number} hoodies in a large batch. The figure is given as a · 10^{exponent}. Find the value of 'a'.",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_chocolate_factory_output",
            sv: "En chokladfabrik packade {number} chokladkakor förra veckan. I statistiken står det a · 10^{exponent}. Hitta 'a'.",
            en: "A chocolate factory packed {number} chocolate bars last week. In the stats, it reads a · 10^{exponent}. Find 'a'.",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_music_database_tracks",
            sv: "Det totala antalet låtar i en musikdatabas är {number}, vilket förkortas till a · 10^{exponent}. Bestäm talet 'a'.",
            en: "The total number of tracks in a music database is {number}, which is shortened to a · 10^{exponent}. Determine the number 'a'.",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_space_station_distance",
            sv: "Ett rymdspel anger avståndet till en station som {number} meter, eller a · 10^{exponent} m. Vilket värde på 'a' saknas?",
            en: "A space game states the distance to a station as {number} meters, or a · 10^{exponent} m. What value of 'a' is missing?",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_ecommerce_sale_turnover",
            sv: "En online-butik omsatte {number} kr under sin rea. Systemet visar summan som a · 10^{exponent} kr. Vad är 'a'?",
            en: "An online store turned over {number} kr during its sale. The system displays the sum as a · 10^{exponent} kr. What is 'a'?",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_app_account_growth",
            sv: "Antalet användare på en app ökade med {number} stycken i år. Det ritas i en graf som a · 10^{exponent}. Bestäm 'a'.",
            en: "The number of unique accounts on an app increased by {number} this year. It is graphed as a · 10^{exponent}. Determine 'a'.",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_sneaker_product_clicks",
            sv: "Ett par sneakers har klickats på {number} gånger i en webbshop. Siffran förkortas till a · 10^{exponent}. Bestäm talet 'a'.",
            en: "A pair of sneakers has been clicked {number} times on a webshop. The figure is abbreviated to a · 10^{exponent}. Determine 'a'.",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_school_term_kilobytes",
            sv: "En skola har laddat ner totalt {number} kilobyte data under terminen. Det loggas som a · 10^{exponent}. Vad är 'a'?",
            en: "A school downloaded a total of {number} kilobytes of data during the term. It is logged as a · 10^{exponent}. What is 'a'?",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_tiktok_database_archive",
            sv: "Antalet sparade tiktoks i en databas är {number} stycken totalt. Detta anges i en rapport som a · 10^{exponent}. Räkna ut 'a'.",
            en: "The total number of saved TikToks in a database is {number}. This is stated in a report as a · 10^{exponent}. Calculate 'a'.",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_video_streamed_minutes",
            sv: "En video-app streamade {number} minuter video globalt igår kväll. I loggen skrivs detta som a · 10^{exponent}. Hitta 'a'.",
            en: "A video app streamed {number} minutes of video globally last night. In the log, this is written as a · 10^{exponent}. Find 'a'.",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        },
        {
            id: "exp_sm_food_app_pizza_orders",
            sv: "En pizzeria har sålt totalt {number} pizzor via en mat-app. I databasen lagras detta som a · 10^{exponent}. Vilket värde på 'a' saknas?",
            en: "A bakery sold a total of {number} pizzas via a food app. This is stored in the database as a · 10^{exponent}. What value of 'a' is missing?",
            rules: { integerOnly: ['exponent'], minResult: 1 }
        }
    ],

    // =========================================================================
    // ⚡ 7. EXP ROOT CALC (15 Stories) - Parameters: {square}
    // =========================================================================
    exp_root_calc: [
        {
            id: "exp_rc_widget_edge_pixels",
            sv: "En fyrkantig widget på din mobilskärm har arean {square} pixlar. Hur många pixlar lång är widgetens kant?",
            en: "A square widget on your phone screen has an area of {square} pixels. How many pixels long is the widget's edge?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_bedroom_square_rug",
            sv: "En fyrkantig matta på golvet i ditt rum täcker en yta på {square} dm². Bestäm mattans sidolängd i decimeter.",
            en: "A square rug on the floor of your bedroom covers an area of {square} dm². Determine the rug's side length in decimeters.",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_tshirt_square_logo",
            sv: "En fyrkantig logga på en t-shirt har ytan {square} cm². Hur bred är loggan längst ner?",
            en: "A square logo on a t-shirt has an area of {square} cm². How wide is the logo along its bottom edge?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_strategy_game_base_tiles",
            sv: "Du bygger en fyrkantig bas i ett spel som täcker en area på {square} rutor. Hur många rutor lång är basens sida?",
            en: "You build a square base in a strategy game that occupies an area of {square} tiles. How many tiles long is the side of the base?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_laptop_square_sticker",
            sv: "Ett fyrkantigt klistermärke på din laptop täcker ytan {square} mm². Räkna ut klistermärkets sidolängd i millimeter.",
            en: "A square sticker on your laptop covers an area of {square} mm². Calculate the sticker's side length in millimeters?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_dance_stage_front_edge",
            sv: "En fyrkantig scen för en skoldans har golvytan {square} m². Hur många meter lång är scenens framkant?",
            en: "A square stage for a school dance has a floor area of {square} m². How many meters long is the front edge of the stage?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_cropped_profile_pic_height",
            sv: "En profilbild klipps om till en perfekt kvadrat med ytan {square} mm². Bestäm profilbildens nya höjd i millimeter.",
            en: "A profile picture is cropped into a perfect square with an area of {square} mm². Determine the profile picture's new height in millimeters.",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_pizza_box_edge_cm",
            sv: "En fyrkantig pizzakartong täcker en bordsyta på {square} cm². Hur lång är kartongens kant i centimeter?",
            en: "A square pizza box covers a table surface area of {square} cm². How long is the box's edge in centimeters?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_cap_fabric_square_side",
            sv: "En bit kvadratiskt tyg till en keps har ytan {square} cm². Vad mäter tygbitens sida i centimeter?",
            en: "A piece of square fabric for a cap has an area of {square} cm². What does the side of the fabric piece measure in centimeters?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_schoolyard_basketball_zone",
            sv: "En skolgård har en kvadratisk basketzon med arean {square} m². Hur många meter lång är zonens linje på marken?",
            en: "A schoolyard has a square basketball zone with an area of {square} m². How many meters long is the zone's line on the ground?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_mousepad_width_cm",
            sv: "En fyrkantig musmatta har en total yta på {square} cm². Hur bred är musmattan i centimeter?",
            en: "A square mousepad has a total area of {square} cm². How wide is the mousepad along the edge in centimeters?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_hoodie_pattern_side_mm",
            sv: "Ett fyrkantigt mönster tryckt på en hoodie har ytan {square} mm². Beräkna mönstrets sidolängd i millimeter.",
            en: "A square pattern printed on a hoodie occupies an area of {square} mm². Calculate the pattern's side length in millimeters.",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_toy_mockup_floor_side",
            sv: "Ett fyrkantigt golv i en leksaksmodell har ytan {square} cm². Vad mäter golvets kortsida i centimeter?",
            en: "A square floor in a toy mockup has an area of {square} cm². What does the floor's short side measure in centimeters?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_roof_solar_panel_dm",
            sv: "En fyrkantig solcell på ett tak har ytan {square} dm². Bestäm solcellens sidolängd i decimeter.",
            en: "A square solar panel on a roof has an area of {square} dm². Determine the solar panel's side length in decimeters.",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_rc_origami_paper_edge_cm",
            sv: "Ett kvadratiskt papper till ett origami-projekt har ytan {square} cm². Hur många centimeter lång är papperskanten?",
            en: "A piece of square paper for an origami project has an area of {square} cm². How many centimeters long is the paper edge?",
            rules: { integerOnly: ['square'], minResult: 1 }
        }
    ],

    // =========================================================================
    // ⚡ 8. EXP ROOT INVERSE (15 Stories) - Parameters: {square}
    // =========================================================================
    exp_root_inverse: [
        {
            id: "exp_ri_screen_area_equation",
            sv: "Ekvationen x² = {square} anger arean för en kvadratisk skärm. Lös ekvationen för att hitta skärmens sidolängd x.",
            en: "The equation x² = {square} represents the area of a square screen. Solve the equation to find the side length x of the screen.",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_skate_ramp_floor_area",
            sv: "Du bygger en kvadratisk skateramp där golvytan beskrivs med formeln x² = {square} dm². Lös ut x för att hitta sidans mått.",
            en: "A group is building a square skate ramp where the floor area is described by x² = {square} dm². Solve for x to find the side measure.",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_game_base_zone_area",
            sv: "Ett spel skapar en kvadratisk baszon vars yta mäts via ekvationen x² = {square}. Vilket värde har zonsidan x?",
            en: "A video game creates a square base zone whose area is measured via x² = {square}. What value does the zone side x have?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_cardboard_box_side_calc",
            sv: "En kvadratisk bit kartong till en låda har ytan x² = {square} cm². Räkna ut kartongens sidolängd x genom att lösa ekvationen.",
            en: "A square piece of cardboard for a box has an area of x² = {square} cm². Calculate the cardboard's side length x by solving the equation.",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_hoodie_print_square_width",
            sv: "Ett tryck på en hoodie bildar en kvadrat med ytan x² = {square} mm². Bestäm tryckets bredd x genom att lösa ut x.",
            en: "A print on a hoodie forms a square with an area of x² = {square} mm². Determine the print's width x by solving for x.",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_school_stage_floor_area",
            sv: "En kvadratisk scen på en skola har golvytan x² = {square} m². Hur många meter lång är scenens sida x?",
            en: "A square stage at a school has a floor area of x² = {square} m². How many meters long is the stage's side x?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_cropped_screen_height_eqn",
            sv: "Arean för en skärm som klipps till en perfekt kvadrat blir x² = {square} mm². Lös ekvationen för att hitta höjden x.",
            en: "The area of a screen cropped into a perfect square is x² = {square} mm². Solve the equation to find the height x.",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_pizza_box_surface_area",
            sv: "En kvadratisk pizzakartong täcker en bordsyta som beskrivs av x² = {square} cm². Hur lång är kantlinjen x i centimeter?",
            en: "A square pizza box occupies a table surface area described by x² = {square} cm². How long is the edge line x in centimeters?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_laptop_sticker_side_eqn",
            sv: "Ett kvadratiskt klistermärke till en laptop har ytan x² = {square} cm². Vad mäter klistermärkets sida x i centimeter?",
            en: "A square sticker for a laptop has an area of x² = {square} cm². What does the sticker's side x measure in centimeters?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_basketball_court_outline",
            sv: "En kvadratisk basketplan på skolgården har ytan x² = {square} m². Hur många meter lång är planens ytterlinje x?",
            en: "A square basketball court on the schoolyard has an area of x² = {square} m². How many meters long is the court's outer line x?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_mousepad_manufacture_eqn",
            sv: "En kvadratisk musmatta har ytan x² = {square} cm². Lös ekvationen för att hitta musmattans bredd x i cm.",
            en: "A square mousepad is manufactured with an area of x² = {square} cm². Solve the equation to find the mousepad's width x in cm.",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_cap_pattern_side_calc",
            sv: "Ett kvadratiskt mönster på en keps täcker ytan x² = {square} mm². Beräkna mönstrets sidolängd x genom att lösa ekvationen.",
            en: "A square pattern on a cap covers an area of x² = {square} mm². Calculate the pattern's side length x by solving the equation.",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_game_room_floor_side",
            sv: "Golvytan i ett kvadratiskt rum i ett spel anges som x² = {square} m². Vad blir rummets sidolängd x i meter?",
            en: "The floor area of a square room in a game is stated as x² = {square} m². What will the room's side length x be in meters?",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_solar_panel_satisfy_eqn",
            sv: "En kvadratisk solcell har en yta som uppfyller ekvationen x² = {square} dm². Bestäm solcellens sidomått x.",
            en: "A square solar panel has an area that satisfies the equation x² = {square} dm². Determine the solar panel's exact side measure x.",
            rules: { integerOnly: ['square'], minResult: 1 }
        },
        {
            id: "exp_ri_art_project_paper_edge",
            sv: "Ett kvadratiskt papper till ett konstprojekt har ytan x² = {square} cm². Hur många centimeter lång är papperskanten x?",
            en: "A square piece of paper for an art project has an area of x² = {square} cm². How many centimeters long is the paper edge x?",
            rules: { integerOnly: ['square'], minResult: 1 }
        }
    ]
};