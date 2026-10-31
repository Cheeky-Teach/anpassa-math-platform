// src/core/utils/stories/linearGraphs.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

export const LINEAR_GRAPHS_STORIES: Record<string, StoryScenario[]> = {
    // =========================================================================
    // 📈 1. GRAPH INTERCEPT M (20 Stories) - Parameters: {m}, {k}
    // Asks purely for the starting amount, base fee, or initial state.
    // =========================================================================
    graph_intercept_m: [
        // --- Micro Scale (Levels 1–5) ---
        {
            id: "lg_m_horse_obstacle_course",
            sv: "En ryttare rider en hoppbana där man får grundpoäng innan man börjar ta hinder. Hur många poäng hade ryttaren vid start?",
            en: "A rider enters a show jumping course that grants base points before the first jump. How many points did the rider start with?",
            rules: { minResult: 0, maxResult: 15, integerOnly: ['m'] }
        },
        {
            id: "lg_m_lab_temperature",
            sv: "Du mäter temperaturen i en vätska under en kemilaboration. Vilken temperatur hade vätskan innan uppvärmningen började?",
            en: "You measure liquid temperature during a chemistry lab. What temperature was the liquid before heating began?",
            rules: { minResult: -10, maxResult: 15 }
        },
        {
            id: "lg_m_diving_depth",
            sv: "En dykare rör sig under vattenytan. På vilket djup i meter befinner sig dykaren vid tidpunkten noll?",
            en: "A diver moves beneath the surface. At what depth in meters is the diver located at time zero?",
            rules: { minResult: -10, maxResult: 0 }
        },
        {
            id: "lg_m_sword_base_damage",
            sv: "Grafen visar ett svärds styrka när det uppgraderas i ett spel. Hur mycket skada gör svärdet innan några uppgraderingar gjorts?",
            en: "The graph shows sword strength across upgrades in an RPG. How much damage does the sword deal before any upgrades?",
            rules: { minResult: 0, maxResult: 15, integerOnly: ['m'] }
        },
        {
            id: "lg_m_plant_height_start",
            sv: "En solros mäts under flera veckor. Hur hög var grodden i centimeter när mätningen startade?",
            en: "A sunflower is tracked over several weeks. How tall was the sprout in centimeters when measuring began?",
            rules: { minResult: 0, maxResult: 12 }
        },
        {
            id: "lg_m_horse_saddlepad_layers",
            sv: "Grafen visar total tjocklek när du sadlar en häst. Vilken är tjockleken på vojlocken innan några extra paddar läggs på?",
            en: "The graph shows total pad thickness when saddling a horse. What is the saddle pad thickness before any extra pads are added?",
            rules: { minResult: 0, maxResult: 10 }
        },
        {
            id: "lg_m_running_track_start_laps",
            sv: "En löpare har redan joggat några varv före träningen. Hur många uppvärmningsvarv hade löparen gjort innan passet startade?",
            en: "A runner jogs a few laps before practice. How many warm-up laps had the runner completed before training officially began?",
            rules: { minResult: 0, maxResult: 10, integerOnly: ['m'] }
        },
        {
            id: "lg_m_candle_initial_height",
            sv: "Ett stearinljus mäts i centimeter. Hur långt var ljuset innan det tändes?",
            en: "A wax candle is measured in centimeters. How tall was the candle before being lit?",
            rules: { minResult: 2, maxResult: 15 }
        },
        {
            id: "lg_m_backpack_empty_weight",
            sv: "Grafen visar ryggsäckens vikt när du packar böcker i den. Vad vägde den tomma väskan i kilogram?",
            en: "The graph shows backpack weight as you pack books inside. What did the empty bag weigh in kilograms?",
            rules: { minResult: 0, maxResult: 8 }
        },
        {
            id: "lg_m_game_initial_tokens",
            sv: "I ett brädspel startar varje spelare med en hand resurser. Hur många spelbrickor hade du innan första omgången spelades?",
            en: "In a strategy game every player starts with resources. How many game tokens did you hold before round one began?",
            rules: { minResult: 0, maxResult: 12, integerOnly: ['m'] }
        },

        // --- Macro Scale (Level 6) ---
        {
            id: "lg_m_stable_box_rent",
            sv: "Grafen visar månadskostnaden för att ha en häst i ett stall. Vad är grundhyran varje månad innan några extratjänster läggs till?",
            en: "The graph shows the monthly cost of keeping a horse at a stable. What is the base rent each month before any extra services are added?",
            rules: { minResult: 50 }
        },
        {
            id: "lg_m_scooter_unlock_fee",
            sv: "Grafen visar vad det kostar att åka elsparkcykel. Vilken är den fasta startavgiften för att låsa upp den?",
            en: "The graph shows electric scooter rental prices. What is the fixed unlocking fee to start the ride?",
            rules: { minResult: 10 }
        },
        {
            id: "lg_m_taxi_flag_drop",
            sv: "En taxiresa debiteras med startavgift och kilometerpris. Vad kostar resan i samma sekund som du kliver in i bilen?",
            en: "A taxi ride bills a base charge plus distance. How much is charged the exact second you step into the car?",
            rules: { minResult: 30 }
        },
        {
            id: "lg_m_phone_battery_start",
            sv: "Grafen visar batterinivån när telefonen laddas. Hur många procents laddning fanns i batteriet när sladden sattes i?",
            en: "The graph tracks battery percentage during charging. What percent charge remained when the cable was plugged in?",
            rules: { minResult: 0, maxResult: 100 }
        },
        {
            id: "lg_m_giftcard_initial_value",
            sv: "Grafen visar saldot på ett presentkort som används i en ridsportbutik. Vilket belopp fanns på presentkortet från början?",
            en: "The graph tracks the balance of a tack shop gift card. What amount was loaded onto the card initially?",
            rules: { minResult: 50 }
        },
        {
            id: "lg_m_tank_water_level",
            sv: "En vattentank i ett stall fylls på med slang. Hur många liter vatten fanns i tanken innan påfyllningen sattes igång?",
            en: "A barn water tank is being replenished with a hose. How many liters of water were in the tank before refilling started?",
            rules: { minResult: 20 }
        },
        {
            id: "lg_m_pizza_delivery_fee",
            sv: "Du beställer mat med hemkörning. Vilken är restaurangens fasta utkörningsavgift innan matens pris räknas in?",
            en: "You order food with home delivery. What is the restaurant's flat delivery charge before food items are added?",
            rules: { minResult: 20 }
        },
        {
            id: "lg_m_savings_initial_deposit",
            sv: "Grafen visar ditt sparande över tid. Hur mycket pengar hade du på kontot allra första veckan innan sparandet kom igång?",
            en: "The graph tracks savings over time. How much money was in the account during the very first week before deposits began?",
            rules: { minResult: 50 }
        },
        {
            id: "lg_m_catering_service_fee",
            sv: "En cateringfirma ordnar mat till en idrottsgala. Vilken fast grundavgift tar firman innan kuvertpriset läggs på?",
            en: "A catering company supplies food for a sports gala. What flat service fee does the company charge before per-plate costs?",
            rules: { minResult: 50 }
        },
        {
            id: "lg_m_truck_cargo_base_weight",
            sv: "Grafen visar vikten på en hästtransport med packning. Vad väger släpet i kilogram när det är helt tomt?",
            en: "The graph tracks total weight of a horse trailer with cargo. What does the trailer weigh in kilograms when completely empty?",
            rules: { minResult: 100 }
        }
    ],

    // =========================================================================
    // 📈 2. GRAPH SLOPE POS (20 Stories) - Parameters: {dy}, {dx}, {kDisplay}
    // Asks purely for the rate of increase, speed, or price per unit.
    // =========================================================================
    graph_slope_pos: [
        // --- Micro Scale (Levels 1–5) ---
        {
            id: "lg_sp_horse_jumping_faults",
            sv: "Grafen visar felpoäng i banhoppning. Hur många straffpoäng får en ryttare för varje rivet hinder?",
            en: "The graph tracks penalties in show jumping. How many penalty points does a rider receive for each knocked fence?",
            rules: { minResult: 1, maxResult: 8, integerOnly: ['kDisplay'] }
        },
        {
            id: "lg_sp_swimming_laps",
            sv: "En simmare tränar i en bassäng. Hur många längder simmar personen per minut?",
            en: "A swimmer trains in a pool. How many laps does the swimmer complete per minute?",
            rules: { minResult: 1, maxResult: 5 }
        },
        {
            id: "lg_sp_beaker_liquid_rise",
            sv: "Vätska droppar ner i ett provrör under en laboration. Hur många centimeter stiger vätskenivån varje minut?",
            en: "Liquid drips into a test tube during an experiment. By how many centimeters does the level rise each minute?",
            rules: { minResult: 0.2, maxResult: 5 }
        },
        {
            id: "lg_sp_pushups_daily_increase",
            sv: "Ett styrkeprogram ökar svårigheten efter hand. Hur många extra armhävningar läggs till per träningsdag?",
            en: "A fitness program increases volume over time. How many extra pushups are added each workout day?",
            rules: { minResult: 1, maxResult: 6, integerOnly: ['kDisplay'] }
        },
        {
            id: "lg_sp_knitting_scarf_rate",
            sv: "Grafen visar längden på en stickad halsduk över tid. Hur många centimeter växer halsduken för varje stickad timme?",
            en: "The graph tracks a knitted scarf's length over time. How many centimeters does the scarf grow for each hour of knitting?",
            rules: { minResult: 1, maxResult: 8 }
        },
        {
            id: "lg_sp_stable_feeding_hay",
            sv: "Grafen visar foderåtgången i ett stall. Hur många kakor hö äter varje häst per dygn?",
            en: "The graph shows forage use in a stable. How many flakes of hay does each horse consume per day?",
            rules: { minResult: 1, maxResult: 6, integerOnly: ['kDisplay'] }
        },
        {
            id: "lg_sp_running_track_speed",
            sv: "En traillöpare springer uppför en brant backe. Hur många höjdmeter stiger löparen per minut?",
            en: "A trail runner heads up a steep incline. How many vertical meters does the runner gain per minute?",
            rules: { minResult: 1, maxResult: 10 }
        },
        {
            id: "lg_sp_tournament_points_avg",
            sv: "Grafen visar inspelade matchpoäng i en turnering. Hur många poäng ger varje vunnen match i genomsnitt?",
            en: "The graph tracks tournament match points. How many points are earned per victory on average?",
            rules: { minResult: 1, maxResult: 5, integerOnly: ['kDisplay'] }
        },
        {
            id: "lg_sp_climbing_rope_ascent",
            sv: "Under en idrottslektion klättrar elever uppför ett rep. Hur många meter klättrar eleven per sekund?",
            en: "During gym class students climb a rope. How many meters does the student climb per second?",
            rules: { minResult: 0.2, maxResult: 3 }
        },
        {
            id: "lg_sp_baking_batches_cookies",
            sv: "Ett bageri bakar bullar på förmiddagen. Hur många plåtar hinner bagaren grädda varje timme?",
            en: "A bakery bakes pastries in the morning. How many trays does the baker finish each hour?",
            rules: { minResult: 1, maxResult: 6, integerOnly: ['kDisplay'] }
        },

        // --- Macro Scale (Level 6) ---
        {
            id: "lg_sp_hourly_wage",
            sv: "Du jobbar extra på en ridskola på helgerna. Vad är din timlön i kronor för varje arbetad timme?",
            en: "You work weekends at a riding school. What is your hourly wage in kronor for each hour worked?",
            rules: { minResult: 50 }
        },
        {
            id: "lg_sp_taxi_kilometer_rate",
            sv: "Grafen visar kostnaden för en taxiresa. Hur mycket ökar taxan för varje körd kilometer?",
            en: "The graph shows taxi trip fares. By how much does the fare increase for each kilometer driven?",
            rules: { minResult: 10 }
        },
        {
            id: "lg_sp_mobile_data_cost_per_gb",
            sv: "Grafen visar räkningen för ett mobilabonnemang. Vad kostar varje extra gigabyte surf du förbrukar?",
            en: "The graph tracks a phone bill with data usage. How much does each additional gigabyte of data cost?",
            rules: { minResult: 15 }
        },
        {
            id: "lg_sp_escooter_speed_kmh",
            sv: "Du kör en elsparkcykel längs en rak cykelväg. Vilken är din hastighet i kilometer i timmen?",
            en: "You ride an electric scooter down a straight path. What is your speed in kilometers per hour?",
            rules: { minResult: 10, maxResult: 30 }
        },
        {
            id: "lg_sp_fuel_pump_liters",
            sv: "Grafen visar tankningen av en personbil. Hur många liter bensin rinner ner i tanken per minut?",
            en: "The graph tracks fueling a car at a gas pump. How many liters of fuel flow into the tank per minute?",
            rules: { minResult: 15, maxResult: 50 }
        },
        {
            id: "lg_sp_download_speed_mbit",
            sv: "Du laddar ner en stor spelfil. Vad är nedladdningshastigheten i megabyte per sekund?",
            en: "You download a large game patch. What is the download speed in megabytes per second?",
            rules: { minResult: 10 }
        },
        {
            id: "lg_sp_horse_riding_lesson_fee",
            sv: "Grafen visar terminsavgiften för ridträning. Vad kostar varje genomförd ridlektion?",
            en: "The graph tracks training fees across a riding semester. What is the charge for each completed lesson?",
            rules: { minResult: 100 }
        },
        {
            id: "lg_sp_catering_price_per_plate",
            sv: "Ett kafé levererar mat till en föreningsfest. Vad är priset per gäst för maten?",
            en: "A cafe caters food for a club event. What is the price per guest for dinner?",
            rules: { minResult: 50 }
        },
        {
            id: "lg_sp_solar_panel_kwh_daily",
            sv: "Solceller på ett stalltak producerar ström under sommaren. Hur många kilowattimmar el genereras per solig dag?",
            en: "Solar panels on a barn roof generate power in summer. How many kilowatt-hours of power are produced per sunny day?",
            rules: { minResult: 20 }
        },
        {
            id: "lg_sp_farm_harvest_grain_tons",
            sv: "En tröska skördar havre på ett fält. Hur många ton säd skördas för varje arbetad timme?",
            en: "A harvester combines an oat field. How many metric tons of grain are harvested each working hour?",
            rules: { minResult: 5 }
        }
    ],

    // =========================================================================
    // 📈 3. GRAPH SLOPE NEG (20 Stories) - Parameters: {dy}, {dx}, {kDisplay}
    // Asks purely for rate of loss, drain, descent, or burn per unit.
    // =========================================================================
    graph_slope_neg: [
        // --- Micro Scale (Levels 1–5) ---
        {
            id: "lg_sn_horse_endurance_energy",
            sv: "Under en tuff distansritt tappar hästen energi. Med hur många energinivåer minskar hästens ork per mil?",
            en: "During a strenuous endurance ride a horse expends stamina. By how many energy levels does endurance drop per 10 km?",
            rules: { maxResult: -1, minResult: -6, integerOnly: ['kDisplay'] }
        },
        {
            id: "lg_sn_candle_burn_rate",
            sv: "Ett blockljus står tänt i ett rum. Hur många centimeter av ljuset smälter bort varje timme?",
            en: "A pillar candle burns in a room. How many centimeters of wax melt away each hour?",
            rules: { maxResult: -0.5, minResult: -5 }
        },
        {
            id: "lg_sn_water_evaporation_beaker",
            sv: "Vatten avdunstar från ett fat i ett växthus. Med hur många millimeter sjunker vattenytan per dygn?",
            en: "Water evaporates from a dish inside a greenhouse. By how many millimeters does the water level drop each day?",
            rules: { maxResult: -0.5, minResult: -6 }
        },
        {
            id: "lg_sn_battery_draining_phone",
            sv: "Du streamar video från telefonen utomhus. Med hur många procent minskar batteriet för varje timmes tittande?",
            en: "You stream video on your phone outdoors. By how many percent does battery charge drop for each hour watched?",
            rules: { maxResult: -1, minResult: -8 }
        },
        {
            id: "lg_sn_runner_water_flask_sip",
            sv: "En terränglöpare dricker ur sin vätskeflaska. Hur många deciliter vatten förbrukas per kilometer?",
            en: "A trail runner sips from a hydration vest. How many deciliters of water are used up per kilometer?",
            rules: { maxResult: -0.5, minResult: -4 }
        },
        {
            id: "lg_sn_ice_cube_melting_thickness",
            sv: "Ett isblock smälter i solen. Med hur många centimeter minskar isblockets tjocklek varje timme?",
            en: "An ice block melts in the sun. By how many centimeters does the ice thickness decrease each hour?",
            rules: { maxResult: -0.5, minResult: -5 }
        },
        {
            id: "lg_sn_horse_pasture_grass_height",
            sv: "Två ponnyer betar i en sommarhage. Med hur många centimeter minskar gräsets höjd per vecka?",
            en: "Two ponies graze in a summer pasture. By how many centimeters does the grass height drop per week?",
            rules: { maxResult: -1, minResult: -6 }
        },
        {
            id: "lg_sn_boardgame_resource_spend",
            sv: "Varje handling i ett strategispel förbrukar magipoäng. Hur många poäng kostar det per drag?",
            en: "Every action in a fantasy board game expends mana. How many points are spent per turn?",
            rules: { maxResult: -1, minResult: -5, integerOnly: ['kDisplay'] }
        },
        {
            id: "lg_sn_swimming_oxygen_tanks",
            sv: "En dykare tränar i en djup bassäng. Med hur många bar sjunker trycket i lufttanken per minut?",
            en: "A diver trains in a deep dive pool. By how many bars does air tank pressure drop per minute?",
            rules: { maxResult: -1, minResult: -6 }
        },
        {
            id: "lg_sn_chips_snacking_rate",
            sv: "Du äter ur en chipsskål under en match. Hur många deciliter snacks försvinner per halvtimme?",
            en: "You eat from a snack bowl during a match. How many deciliters of chips vanish every half hour?",
            rules: { maxResult: -0.5, minResult: -4 }
        },

        // --- Macro Scale (Level 6) ---
        {
            id: "lg_sn_horse_hay_bale_depletion",
            sv: "Ett stall tar foder från sitt höförråd. Hur många kilo hö går åt per dygn för alla hästarna?",
            en: "A horse barn draws feed from storage. How many kilograms of hay are used per day for all horses?",
            rules: { maxResult: -10 }
        },
        {
            id: "lg_sn_fuel_tank_driving_consumption",
            sv: "Grafen visar bränslemängden i en bil under en bilsemester. Hur många liter bensin förbrukas per körd mil?",
            en: "The graph tracks fuel volume in a vehicle on a road trip. How many liters of gas are consumed per 10 km driven?",
            rules: { maxResult: -5 }
        },
        {
            id: "lg_sn_giftcard_spending_visits",
            sv: "Du handlar med ett presentkort i stallets kafeteria. Hur många kronor dras från kortet vid varje besök?",
            en: "You pay using a gift card at the stable cafe. How many kronor are deducted on each visit?",
            rules: { maxResult: -25 }
        },
        {
            id: "lg_sn_pc_depreciation_monthly",
            sv: "Grafen visar andrahandsvärdet på en dator över tid. Med hur många kronor minskar datorns värde varje månad?",
            en: "The graph shows a computer's resale value over time. By how many kronor does its value drop each month?",
            rules: { maxResult: -50 }
        },
        {
            id: "lg_sn_airplane_altitude_descent",
            sv: "Ett passagerarflygplan närmar sig flygplatsen. Hur många meter sjunker planet i höjd per minut?",
            en: "A passenger plane approaches the airport. How many meters of altitude does the plane lose per minute?",
            rules: { maxResult: -50 }
        },
        {
            id: "lg_sn_pool_drain_liters",
            sv: "En simbassäng töms på vatten inför vintern. Hur många liter vatten pumpas ut per minut?",
            en: "A public pool is drained ahead of winter. How many liters of water are pumped out per minute?",
            rules: { maxResult: -50 }
        },
        {
            id: "lg_sn_loan_payoff_monthly",
            sv: "Du betalar av en ny sadel med en månadsbetalning. Med hur många kronor minskar din återstående skuld varje månad?",
            en: "You pay off a new horse saddle via installments. By how many kronor does your remaining debt drop each month?",
            rules: { maxResult: -100 }
        },
        {
            id: "lg_sn_ev_battery_range_drop",
            sv: "Grafen visar räckvidden på en elbil som drar ett tungt släp. Hur många kilometer räckvidd tappar bilen per mil?",
            en: "The graph tracks an EV's remaining range towing a heavy trailer. How many kilometers of range are lost per 10 km?",
            rules: { maxResult: -10 }
        },
        {
            id: "lg_sn_tickets_remaining_dance",
            sv: "Biljetterna till en hopptävling säljs på nätet. Hur många biljetter säljs i genomsnitt varje timme?",
            en: "Tickets to an equestrian tournament sell online. How many tickets are purchased each hour on average?",
            rules: { maxResult: -10, integerOnly: ['kDisplay'] }
        },
        {
            id: "lg_sn_water_tower_reservoir_drain",
            sv: "Ett vattentorn försörjer ett samhälle vid ett ledningsbrott. Hur många kubikmeter vatten tappas per timme?",
            en: "A municipal water tower supplies a town during a pipe repair. How many cubic meters of water are drawn each hour?",
            rules: { maxResult: -20 }
        }
    ],

    // =========================================================================
    // 📈 4. GRAPH EQUATION (20 Stories) - Parameters: {k}, {m}, {eq}
    // Prompts students to determine the complete mathematical formula/relationship.
    // =========================================================================
    graph_equation: [
        // --- Micro Scale (Levels 1–5) ---
        {
            id: "lg_eq_horse_jump_points",
            sv: "I en precisionstävling till häst räknas totalpoängen y utifrån genomförda hinder x. Bestäm sambandet mellan x och y.",
            en: "In an equestrian precision course total points y depend on completed obstacles x. Determine the formula relating x and y.",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eq_chemistry_heating_rate",
            sv: "Grafen visar temperaturen y i en vätska efter x minuters uppvärmning. Vilken formel beskriver vätskans temperatur?",
            en: "The graph shows liquid temperature y after x minutes of heating. Which formula describes the liquid's temperature?",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eq_runner_training_laps",
            sv: "Grafen visar totalt antal sprungna varv y efter x timmars träning. Bestäm sambandet som ger antalet varv.",
            en: "The graph shows total laps completed y after x hours of practice. Determine the formula yielding total laps.",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eq_candle_burn_equation",
            sv: "Ett ljus brinner ner i jämn takt. Vilken formel beskriver ljusets återstående höjd y efter x timmar?",
            en: "A candle burns down at a steady pace. Which formula describes the candle's remaining height y after x hours?",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eq_quest_tokens_reward",
            sv: "I ett spel får du en grundbelöning samt extra brickor för varje avklarat uppdrag x. Bestäm formeln för totala brickor y.",
            en: "In an adventure game you earn starting tokens plus extra tokens per quest x. Write the formula for total tokens y.",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eq_swimming_workout_sets",
            sv: "Grafen visar antal simmade intervaller y under x genomförda träningspass. Bestäm formeln för hur antalet växer.",
            en: "The graph shows swimming sets y completed across x training sessions. Determine the formula modeling this growth.",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eq_plant_growth_curve",
            sv: "Grafen visar en bönstjälks höjd y i centimeter efter x dagar. Vilken formel beskriver plantans tillväxt?",
            en: "The graph shows bean sprout height y in centimeters after x days. Which formula describes the plant's growth?",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eq_backpack_load_weight",
            sv: "Grafen visar ryggsäckens totala vikt y i kg när du packar x pärmar i den. Bestäm formeln för väskans vikt.",
            en: "The graph tracks total backpack weight y in kg when packing x binders inside. Determine the formula for backpack weight.",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eq_diving_submersion_line",
            sv: "Grafen visar djupet y under vattenytan för en undervattensfarkost efter x minuters färd. Vilken formel beskriver djupet?",
            en: "The graph tracks the depth y beneath the surface of an underwater craft after x minutes. Which formula describes its depth?",
            rules: { minResult: -15, maxResult: 0 }
        },
        {
            id: "lg_eq_climbing_wall_height",
            sv: "En klättrare tar sig uppför en vägg med jämn stigning. Vilken formel anger klättrarens höjd y efter x minuter?",
            en: "A climber scales a wall at a constant pace. Which formula gives the climber's altitude y after x minutes?",
            rules: { maxResult: 15 }
        },

        // --- Macro Scale (Level 6) ---
        {
            id: "lg_eq_stable_boarding_invoice",
            sv: "Ett häststall tar en fast månadshyra och sedan en avgift för varje extra ridlektion x. Vilken formel ger månadskostnaden y?",
            en: "A stable charges a fixed monthly rent plus a fee for each extra riding lesson x. Which formula gives the total monthly cost y?",
            rules: { minResult: 50 }
        },
        {
            id: "lg_eq_horse_trailer_rental",
            sv: "Grafen visar hyrespriset y för ett hästsläp baserat på antal dygn x du lånar det. Bestäm kostnadsformeln.",
            en: "The graph shows the rental charge y for a horse trailer based on days borrowed x. Determine the cost formula.",
            rules: { minResult: 50 }
        },
        {
            id: "lg_eq_streaming_subscription",
            sv: "Grafen visar månadskostnaden y för ett streamingabonnemang med x extra användarkonton. Bestäm formeln för kostnaden.",
            en: "The graph models total monthly cost y for a streaming plan with x additional profiles. Determine the pricing formula.",
            rules: { minResult: 30 }
        },
        {
            id: "lg_eq_scooter_pricing",
            sv: "Grafen visar vad det kostar att köra elsparkcykel i x minuter. Vilken formel beskriver resans pris y?",
            en: "The graph shows the price to ride an electric scooter for x minutes. Which formula describes trip price y?",
            rules: { minResult: 20 }
        },
        {
            id: "lg_eq_veterinary_home_visit",
            sv: "En veterinär gör hembesök till ett stall och fakturerar per arbetad timme x. Bestäm formeln för totalkostnaden y.",
            en: "A mobile vet visits a barn and invoices per working hour x. Determine the formula for the total invoice amount y.",
            rules: { minResult: 100 }
        },
        {
            id: "lg_eq_taxi_fare_formula",
            sv: "Grafen visar priset y för en taxiresa som är x kilometer lång. Vilken formel beräknar priset för resan?",
            en: "The graph shows total taxi fare y for a trip spanning x kilometers. Which formula calculates the trip fare?",
            rules: { minResult: 30 }
        },
        {
            id: "lg_eq_hourly_wage_model",
            sv: "Grafen visar din intjänade lön y i kronor när du jobbar x timmar. Bestäm formeln för din lön.",
            en: "The graph tracks total earnings y in kronor when working x hours. Determine the formula for your paycheck.",
            rules: { minResult: 50 }
        },
        {
            id: "lg_eq_catering_pricing_curve",
            sv: "Ett cateringföretag offererar mat till en föreningsfest med x gäster. Vilken formel ger totalsumman y?",
            en: "A catering business bids on food for an athletic banquet of x guests. Which formula models the total invoice y?",
            rules: { minResult: 50 }
        },
        {
            id: "lg_eq_storage_unit_fee",
            sv: "Ett förråd för hästutrustning debiterar grundhyra samt en avgift per hyrd hylla x. Skriv formeln för månadskostnaden y.",
            en: "An equestrian storage unit charges base rent plus a fee per shelf rented x. Write the formula for monthly fee y.",
            rules: { minResult: 40 }
        },
        {
            id: "lg_eq_foodtruck_revenue",
            sv: "En foodtruck säljer hamburgare under en cup. Vilken formel beskriver intäkten y när de sålt x menyer?",
            en: "A food truck sells meals during a sports tournament. Which formula models total revenue y after selling x combo meals?",
            rules: { minResult: 50 }
        }
    ],

    // =========================================================================
    // 📈 5. GRAPH EVAL (20 Stories) - Parameters: {k}, {m}, {x}, {y}
    // Asks students to calculate or find the output for a specific input {x}.
    // =========================================================================
    graph_eval: [
        // --- Micro Scale (Levels 1–5) ---
        {
            id: "lg_eval_horse_training_jumps",
            sv: "En ryttare tränar teknikhoppning och samlar poäng. Hur många totalpoäng har ryttaren efter {x} felfria hinder?",
            en: "An equestrian practices jumping drills to earn points. What is the total score after clearing {x} clean fences?",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eval_liquid_cooling",
            sv: "En varm bägare svalnar i ett laboratorium. Vilken temperatur håller vätskan efter {x} minuter?",
            en: "A warm beaker cools on a lab bench. What temperature does the liquid reach after {x} minutes?",
            rules: { minResult: -10, maxResult: 15 }
        },
        {
            id: "lg_eval_candle_burn_down",
            sv: "Ett ljus brinner i ett rum. Hur många centimeter högt är ljuset efter att det har brunnit i {x} timmar?",
            en: "A candle burns in a room. How many centimeters tall is the candle after burning for {x} hours?",
            rules: { minResult: 0, maxResult: 15 }
        },
        {
            id: "lg_eval_runner_laps_completed",
            sv: "En löpare håller jämnt tempo under ett träningspass. Hur många varv runt banan har löparen sprungit efter {x} timmar?",
            en: "A runner holds a steady pace during track practice. How many laps has the runner completed after {x} hours?",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eval_game_quest_xp",
            sv: "I ett äventyrsspel får du erfarenhetspoäng när du slutför uppgifter. Hur många poäng har du efter {x} avklarade uppdrag?",
            en: "In an adventure game you earn XP for completing tasks. How many points do you hold after {x} completed quests?",
            rules: { maxResult: 15, integerOnly: ['y'] }
        },
        {
            id: "lg_eval_plant_sprout_height",
            sv: "En böna växer i en kruka i fönstret. Vilken höjd i centimeter når bönstjälken efter {x} dygn?",
            en: "A bean plant grows on a windowsill. What height in centimeters does the shoot reach after {x} days?",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eval_swimming_intervals",
            sv: "En simmare kör serier i bassängen. Hur många längder har simmaren hunnit simma efter {x} minuter?",
            en: "A swimmer trains sets in the pool. How many lengths has the swimmer finished after {x} minutes?",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eval_book_pages_read",
            sv: "Du läser en spännande bok i ett jämnt tempo varje dag. Vilket kapitel eller avsnitt har du nått efter {x} dagar?",
            en: "You read an adventure novel at a steady daily pace. What chapter or section mark do you reach after {x} days?",
            rules: { maxResult: 15, integerOnly: ['y'] }
        },
        {
            id: "lg_eval_water_tank_level_small",
            sv: "En vattenhink fylls med en trädgårdsslang. Hur många liter vatten finns i hinken efter {x} minuter?",
            en: "A water pail is filled from a garden hose. How many liters of water are in the pail after {x} minutes?",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_eval_diver_submersion_depth",
            sv: "En robot undersöker botten i en sjö. På vilket djup i meter befinner sig roboten efter {x} minuters nedsänkning?",
            en: "A research drone explores a lake bottom. At what depth in meters is the drone located after {x} minutes of descent?",
            rules: { minResult: -15, maxResult: 0 }
        },

        // --- Macro Scale (Level 6) ---
        {
            id: "lg_eval_scooter_ride_total",
            sv: "Du hyr en elsparkcykel för att åka till träningen. Vad landar kostnaden på för en resa som tar {x} minuter?",
            en: "You rent an electric scooter to ride to practice. What is the total fare for a trip lasting {x} minutes?",
            rules: { minResult: 20 }
        },
        {
            id: "lg_eval_taxi_trip_cost",
            sv: "Ett taxibolag kör dig och dina vänner hem. Vad kostar det att åka en sträcka på {x} kilometer?",
            en: "A taxi service drives you and your friends home. How much does it cost to travel a distance of {x} kilometers?",
            rules: { minResult: 50 }
        },
        {
            id: "lg_eval_hourly_paycheck",
            sv: "Du jobbar extra på ett ridläger under sommarlovet. Hur mycket tjänar du totalt på att arbeta {x} timmar?",
            en: "You work as an assistant at an equestrian summer camp. How much do you earn in total for working {x} hours?",
            rules: { minResult: 100 }
        },
        {
            id: "lg_eval_phone_data_bill",
            sv: "Du behöver köpa extra surf till mobilen under semestern. Vad blir månadens totala faktura om du köper till {x} gigabyte?",
            en: "You purchase extra mobile data while traveling. What is the total monthly bill if you add on {x} gigabytes?",
            rules: { minResult: 50 }
        },
        {
            id: "lg_eval_catering_event_total",
            sv: "En idrottsförening beställer mat till sin årliga klubbfest. Vad kostar hela beställningen för {x} personer?",
            en: "A sports club orders dinner for their annual celebration. What does the entire order cost for {x} people?",
            rules: { minResult: 100 }
        },
        {
            id: "lg_eval_horse_trailer_trip_rent",
            sv: "Du hyr ett hästsläp för att åka på bortatävling. Vad kostar hyran om du lånar släpet i {x} dygn?",
            en: "You rent a horse trailer to travel to an away competition. What is the rental fee if you keep the trailer for {x} days?",
            rules: { minResult: 100 }
        },
        {
            id: "lg_eval_handyman_labor_cost",
            sv: "En snickare reparerar en trasig stalldörr. Vad blir arbetskostnaden om reparationen tar {x} timmar?",
            en: "A carpenter repairs a damaged barn door. What is the labor charge if the repair takes {x} hours?",
            rules: { minResult: 100 }
        },
        {
            id: "lg_eval_savings_timeline_months",
            sv: "Du sätter undan pengar varje månad för att köpa ny sportutrustning. Hur mycket har du sparat efter {x} månader?",
            en: "You set aside money monthly to buy new sports gear. How much money have you saved up after {x} months?",
            rules: { minResult: 100 }
        },
        {
            id: "lg_eval_pizza_party_order",
            sv: "Ett fotbollslag firar efter säsongen och beställer mat med utkörning. Vad blir slutnotan vid beställning av {x} pizzor?",
            en: "A soccer team celebrates season end with delivery food. What is the final bill when ordering {x} pizzas?",
            rules: { minResult: 100 }
        },
        {
            id: "lg_eval_car_fuel_consumption",
            sv: "Familjen kör bil till en tävlingsplats. Hur många liter bränsle finns kvar i tanken efter att ha kört {x} mil?",
            en: "A family drives to a tournament venue. How many liters of fuel remain in the tank after driving {x} Swedish mil (10 km)?",
            rules: { minResult: 10 }
        }
    ],

    // =========================================================================
    // 📈 6. GRAPH POINT CHECK (20 Stories) - Parameters: {k}, {m}, {x}, {y}, {isMatch}
    // Asks yes/no questions verifying whether coordinate ({x}, {y}) satisfies the model.
    // =========================================================================
    graph_point_check: [
        // --- Micro Scale (Levels 1–5) ---
        {
            id: "lg_check_horse_score_target",
            sv: "Enligt poängreglerna i banhoppningen, stämmer det att en ryttare har exakt {y} poäng efter {x} hinder?",
            en: "According to the show jumping scoring rules, is it true that a rider has exactly {y} points after {x} fences?",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_check_candle_height_match",
            sv: "Ett ljus brinner i ett rum. Stämmer det att ljusets höjd är exakt {y} centimeter efter {x} timmar?",
            en: "A candle burns in a room. Is it true that the candle's height is exactly {y} centimeters after {x} hours?",
            rules: { minResult: 0, maxResult: 15 }
        },
        {
            id: "lg_check_plant_growth_check",
            sv: "En planta mäts under sitt första skede. Har stjälken verkligen nått en höjd på {y} centimeter efter {x} dagar?",
            en: "A seedling is tracked during early growth. Has the stem truly reached a height of {y} centimeters after {x} days?",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_check_running_laps_count",
            sv: "En tränare räknar varv under ett friidrottspass. Har löparen hunnit precis {y} varv efter {x} timmars träning?",
            en: "A coach counts laps during track training. Has the runner finished exactly {y} laps after {x} hours of running?",
            rules: { maxResult: 15, integerOnly: ['y'] }
        },
        {
            id: "lg_check_chemistry_temperature",
            sv: "Under en laboration kontrolleras vätskans temperatur. Håller bägaren temperaturen {y} °C efter {x} minuter?",
            en: "During a laboratory experiment solution temperature is checked. Is the beaker temperature {y} °C after {x} minutes?",
            rules: { minResult: -10, maxResult: 15 }
        },
        {
            id: "lg_check_game_tokens_balance",
            sv: "I ett brädspel kontrolleras spelarnas resurser. Har en spelare exakt {y} brickor efter {x} genomförda drag?",
            en: "In a board game players verify resource counts. Does a player hold exactly {y} tokens after {x} completed turns?",
            rules: { maxResult: 15, integerOnly: ['y'] }
        },
        {
            id: "lg_check_swimming_drills_done",
            sv: "En simmare kollar träningsklockan. Stämmer det att simmaren har avverkat {y} längder efter {x} minuter?",
            en: "A swimmer checks the pool pace clock. Is it accurate that the swimmer has completed {y} laps after {x} minutes?",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_check_diving_depth_robot",
            sv: "En dykare läser av sin djupmätare. Befinner sig dykaren på djupet {y} meter efter {x} minuters dykning?",
            en: "A diver checks the depth gauge. Is the diver at a depth of {y} meters after {x} minutes of diving?",
            rules: { minResult: -15, maxResult: 0 }
        },
        {
            id: "lg_check_backpack_weight_check",
            sv: "En elev väger sin skolväska i kapprummet. Väger ryggsäcken verkligen {y} kg när den är packad med {x} pärmar?",
            en: "A student weighs a backpack in the hallway. Does the bag truly weigh {y} kg when holding {x} binders?",
            rules: { maxResult: 15 }
        },
        {
            id: "lg_check_stable_hay_ration",
            sv: "Ett stall räknar på dagens foder. Stämmer det att en häst har ätit {y} foderkakor hö efter {x} dagar?",
            en: "A barn staff checks feed logs. Is it correct that a pony has consumed {y} flakes of hay after {x} days?",
            rules: { maxResult: 15, integerOnly: ['y'] }
        },

        // --- Macro Scale (Level 6) ---
        {
            id: "lg_check_scooter_receipt",
            sv: "Du kontrollerar kvittot i elsparkcykelns app. Stämmer det att en tur på {x} minuter ska kosta {y} kronor?",
            en: "You check the receipt in an electric scooter app. Is it correct that a ride of {x} minutes costs {y} kronor?",
            rules: { minResult: 20 }
        },
        {
            id: "lg_check_taxi_fare_bill",
            sv: "En taxichaufför lämnar ett prisförslag innan avfärd. Kostar en resa på {x} kilometer verkligen {y} kronor?",
            en: "A taxi driver gives a price quote before departure. Does a trip spanning {x} kilometers truly cost {y} kronor?",
            rules: { minResult: 50 }
        },
        {
            id: "lg_check_phone_invoice_data",
            sv: "Månadsräkningen för mobilabonnemanget kommer. Blir totalsumman exakt {y} kronor när du har köpt till {x} gigabyte surf?",
            en: "The monthly phone bill arrives. Is the total invoice exactly {y} kronor when adding on {x} gigabytes of data?",
            rules: { minResult: 50 }
        },
        {
            id: "lg_check_stable_rent_invoice",
            sv: "Du får en räkning från häststallet. Stämmer det att hyran med {x} extra ridlektioner ska kosta {y} kronor?",
            en: "You receive a bill from the horse stable. Is it correct that the rent with {x} extra riding lessons costs {y} kronor?",
            rules: { minResult: 100 }
        },
        {
            id: "lg_check_repair_labor_bill",
            sv: "En cykelverkstad lämnar kostnadsförslag för en reparation. Stämmer det att {x} timmars arbete ska kosta {y} kronor?",
            en: "A bicycle repair shop issues an estimate. Is it accurate that {x} hours of labor costs {y} kronor?",
            rules: { minResult: 100 }
        },
        {
            id: "lg_check_catering_order_sum",
            sv: "En cateringfirma bekräftar en beställning inför en cupmiddag. Blir priset för {x} gäster exakt {y} kronor?",
            en: "A catering vendor confirms a booking for a tournament banquet. Is the price for {x} guests exactly {y} kronor?",
            rules: { minResult: 100 }
        },
        {
            id: "lg_check_horse_trailer_total",
            sv: "Du granskar bokningen av ett hästsläp. Kostar det verkligen {y} kronor att hyra släpet under {x} dygn?",
            en: "You review a horse trailer reservation. Does renting the trailer for {x} days really cost {y} kronor?",
            rules: { minResult: 100 }
        },
        {
            id: "lg_check_savings_goal_target",
            sv: "Du kollar saldot på ditt sparkonto. Har du nått exakt {y} kronor på kontot efter {x} månaders sparande?",
            en: "You check your bank savings account balance. Have you reached exactly {y} kronor after {x} months of saving?",
            rules: { minResult: 100 }
        },
        {
            id: "lg_check_battery_stream_drain",
            sv: "Du har streamat en match på surfplattan. Återstår verkligen {y} procents batteri efter {x} timmars tittande?",
            en: "You streamed a match on a tablet. Does exactly {y} percent battery remain after {x} hours of streaming?",
            rules: { minResult: 0, maxResult: 100 }
        },
        {
            id: "lg_check_car_fuel_remaining",
            sv: "Föraren tittar på bilens bränslemätare under resan. Finns det verkligen {y} liter bensin kvar i tanken efter {x} körda mil?",
            en: "The driver checks the fuel gauge during the trip. Do exactly {y} liters of fuel remain in the tank after {x} Swedish mil (10 km)?",
            rules: { minResult: 10 }
        }
    ]
};