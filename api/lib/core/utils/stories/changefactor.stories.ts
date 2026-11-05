// src/core/utils/stories/changefactor.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

// =========================================================================
// 🎯 1. APPLY FACTOR INCREASE (Key: apply_factor_inc)
//    Parameters parsed: {base}, {factor}
// =========================================================================
const APPLY_FACTOR_INC: StoryScenario[] = [
    {
        id: "cf_ai_pocket_money_raise",
        sv: "Alex får {base} kr i månadspeng. Efter en överenskommelse hemma höjs månadspengen med förändringsfaktorn {factor}.",
        en: "Alex receives {base} kr in monthly allowance. Following an agreement at home, the allowance increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_winter_jacket_price",
        sv: "En varm vinterjacka kostade {base} kr före säsongen. Inför vintern höjs priset med förändringsfaktorn {factor}.",
        en: "A warm winter jacket cost {base} kr before the season. Ahead of winter, the price increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_savings_account_interest",
        sv: "På ett sparkonto finns det {base} kr. Under ett år växer sparbeloppet med ränta enligt förändringsfaktorn {factor}.",
        en: "A savings account holds {base} kr. Over the course of a year, the savings grow with interest by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_vintage_guitar_value",
        sv: "En akustisk gitarr i fint skick värderades till {base} kr. Ett år senare har gitarrens andrahandsvärde ökat med förändringsfaktorn {factor}.",
        en: "A vintage acoustic guitar in good condition was valued at {base} kr. One year later, its collector value increased by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_summer_job_wage",
        sv: "Timlönen på ett sommarjobb i ett trädgårdsmästeri var {base} kr. Inför nästa sommar höjs timlönen med förändringsfaktorn {factor}.",
        en: "The hourly wage for a gardening summer job was {base} kr. For the next summer, the wage increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_rent_apartment_increase",
        sv: "Månadshyran för en lägenhet låg tidigare på {base} kr. Vid årsskiftet justeras hyran uppåt med förändringsfaktorn {factor}.",
        en: "The monthly rent for an apartment was previously {base} kr. At the turn of the year, the rent increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_concert_ticket_price",
        sv: "En konsertbiljett kostade från början {base} kr i förköp. Närmare konsertdatumet stiger biljettpriset med förändringsfaktorn {factor}.",
        en: "A concert ticket originally cost {base} kr during early bird sales. Closer to the show date, the ticket price increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_cinema_ticket_weekend",
        sv: "En vanlig biobiljett kostar {base} kr på vardagar. För kvällsvisningar på helger justeras biljettpriset uppåt med förändringsfaktorn {factor}.",
        en: "A regular cinema ticket costs {base} kr on weekdays. For weekend evening screenings, the ticket price increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_bus_card_annual_price",
        sv: "Ett månadskort för kollektivtrafiken kostade {base} kr under våren. Inför hösten höjs priset med förändringsfaktorn {factor}.",
        en: "A monthly transit card cost {base} kr in the spring. Ahead of autumn, the transit fare increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_bicycle_repair_cost",
        sv: "En grundservice för en cykel kostade tidigare {base} kr hos den lokala verkstaden. På grund av dyrare reservdelar ökar servicepriset med förändringsfaktorn {factor}.",
        en: "A standard bicycle tune-up previously cost {base} kr at a local shop. Due to higher parts costs, the service fee increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_bakery_sourdough_bread",
        sv: "Ett hantverksbakat surdegsbröd kostade {base} kr på bageriet. När mjölpriserna stiger höjs brödpriset med förändringsfaktorn {factor}.",
        en: "An artisan sourdough loaf cost {base} kr at the bakery. When flour costs rise, the bread price increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_coffee_beans_kilo",
        sv: "Ett kilo hela kaffebönor kostade tidigare {base} kr i mataffären. Efter en dålig skörd i producentlandet stiger kilopriset med förändringsfaktorn {factor}.",
        en: "A kilogram of whole coffee beans previously cost {base} kr at the grocery store. Following a poor harvest, the price per kilo increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_sports_club_membership",
        sv: "Årsavgiften i en idrottsförening var {base} kr förra året. För att renovera omklädningsrummen höjs medlemsavgiften med förändringsfaktorn {factor}.",
        en: "The annual membership fee at a sports club was {base} kr last year. To fund renovations, the fee increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_swim_hall_entry",
        sv: "Inträdet till badhuset kostade {base} kr för ungdomar. Efter att en ny vattenrutschbana byggts höjs entrépriset med förändringsfaktorn {factor}.",
        en: "Admission to the indoor public pool cost {base} kr for youth. After adding a new waterslide, the admission fee increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_restaurant_lunch_buffet",
        sv: "En lunchbuffé på en kvarterskrog kostade {base} kr. När råvarupriserna går upp justeras buffépriset med förändringsfaktorn {factor}.",
        en: "A lunch buffet at a neighborhood restaurant cost {base} kr. When food supply costs rise, the buffet price increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_football_match_attendance",
        sv: "Ett lokalt fotbollslag hade i genomsnitt {base} åskådare per hemmamatch förra säsongen. Efter ett avancemang i seriesystemet ökar publiksnittet med förändringsfaktorn {factor}.",
        en: "A local football team averaged {base} spectators per home match last season. After being promoted, average attendance increases by a change factor of {factor}.",
        rules: { integerOnly: ['base'], minResult: 1 }
    },
    {
        id: "cf_ai_antique_furniture_auction",
        sv: "Ett matsalsbord i massiv ek såldes för {base} kr på auktion för fem år sedan. Vid en ny värdering har bordets marknadsvärde ökat med förändringsfaktorn {factor}.",
        en: "A solid oak dining table sold for {base} kr at an auction five years ago. At a new appraisal, its market value has increased by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_ski_pass_day_ticket",
        sv: "Ett dagskort i skidbacken kostade {base} kr under försäsongen. Under sportlovet höjs priset med förändringsfaktorn {factor}.",
        en: "A single-day ski pass cost {base} kr during the pre-season. During peak winter break, the pass price increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_museum_annual_pass",
        sv: "Ett årskort till stadens museer kostade {base} kr förra året. Inför det nya året höjs kortets pris med förändringsfaktorn {factor}.",
        en: "An annual pass to the city museums cost {base} kr last year. Ahead of the new year, the pass price increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ai_ice_cream_cone_parlor",
        sv: "En stor glasstrut med tre kulor kostade {base} kr i glasskiosken förra sommaren. Till årets säsong höjs priset med förändringsfaktorn {factor}.",
        en: "A large three-scoop ice cream cone cost {base} kr at the harbor kiosk last summer. For this season, the price increases by a change factor of {factor}.",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 2. APPLY FACTOR DECREASE (Key: apply_factor_dec)
//    Parameters parsed: {base}, {factor}
// =========================================================================
const APPLY_FACTOR_DEC: StoryScenario[] = [
    {
        id: "cf_ad_running_shoes_sale",
        sv: "Ett par löparskor kostade ordinarie {base} kr i sportbutiken. Under mellandagsrean sänks priset med förändringsfaktorn {factor}.",
        en: "A pair of running shoes regularly cost {base} kr in the sporting goods store. During the holiday sale, the price drops by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_winter_jacket_clearance",
        sv: "En vinterjacka kostade {base} kr under hösten. När våren närmar sig sänks priset på utförsäljningen med förändringsfaktorn {factor}.",
        en: "A winter jacket cost {base} kr during the fall. As spring approaches, the clearance price drops by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_used_car_depreciation",
        sv: "En begagnad familjebil köptes in för {base} kr. Efter ett års körning och slitage har bilens värde minskat med förändringsfaktorn {factor}.",
        en: "A used family car was purchased for {base} kr. After one year of driving and mileage, the car's value decreases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_bicycle_helmet_discount",
        sv: "En cykelhjälm med säkerhetsspänne kostade {base} kr i cykelaffären. För alla medlemmar i cykelklubben sänks priset med förändringsfaktorn {factor}.",
        en: "A bicycle helmet cost {base} kr in the bike shop. For members of the local cycling club, the price is reduced by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_backpack_back_to_school",
        sv: "En ergonomisk skolryggsäck kostade {base} kr. Under skolstartskampanjen sänks priset med förändringsfaktorn {factor}.",
        en: "An ergonomic school backpack cost {base} kr. During the back-to-school sale, the price drops by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_bookstore_novel_paperback",
        sv: "En inbunden roman kostade {base} kr när den släpptes. När pocketversionen kommer ut sänks priset på den inbundna boken med förändringsfaktorn {factor}.",
        en: "A hardcover novel cost {base} kr upon release. When the paperback arrives, the hardcover price drops by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_fruit_evening_clearance",
        sv: "En trälåda med färska jordgubbar kostade {base} kr på morgonen. Sent på eftermiddagen sänker torghandlaren priset med förändringsfaktorn {factor}.",
        en: "A wooden crate of fresh strawberries cost {base} kr in the morning. Late in the afternoon, the market stall lowers the price by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_electric_scooter_end_season",
        sv: "En elsparkcykel kostade {base} kr under sommarsäsongen. Inför hösten sänker återförsäljaren priset med förändringsfaktorn {factor}.",
        en: "An electric scooter cost {base} kr during summer. Ahead of the cold season, the retailer lowers the price by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_water_bottle_sports_deal",
        sv: "En rostfri termosflaska kostade {base} kr i butiken. Under en idrottsturnering ges en rabatt som sänker priset med förändringsfaktorn {factor}.",
        en: "A stainless steel water bottle cost {base} kr in the shop. During a regional sports tournament, a promotional discount lowers the price by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_jeans_student_discount",
        sv: "Ett par slitstarka jeans kostar {base} kr i klädbutiken. Med ett giltigt studentkort sänks priset i kassan med förändringsfaktorn {factor}.",
        en: "A pair of durable jeans costs {base} kr in the clothing store. With a valid student ID, the checkout price drops by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_wool_sweater_spring_sale",
        sv: "En stickad ulltröja kostade {base} kr under vintern. Vid vårens säsongsrensning sänks tröjans pris med förändringsfaktorn {factor}.",
        en: "A knitted wool sweater cost {base} kr in the winter. During the spring clearance, the sweater's price is reduced by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_skateboard_complete_deal",
        sv: "En komplett skateboard kostade {base} kr på skatebutikens vägg. Under en säsongsrea sänks priset med förändringsfaktorn {factor}.",
        en: "A complete skateboard cost {base} kr on the skate shop wall. During a seasonal clearance, the price drops by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_gym_membership_intro_offer",
        sv: "Ett halvårskort på simhallen kostar vanligtvis {base} kr. Som öppningserbjudande sänks priset för nya medlemmar med förändringsfaktorn {factor}.",
        en: "A six-month pass to the local pool normally costs {base} kr. As an opening offer, the fee for new members decreases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_cinema_matinee_screening",
        sv: "Ordinarie biljettpris till en teaterföreställning är {base} kr. För eftermiddagsföreställningar på vardagar sänks priset med förändringsfaktorn {factor}.",
        en: "Regular admission to an afternoon theater show is {base} kr. For weekday matinee shows, the ticket price drops by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_sleeping_bag_camping_outlet",
        sv: "En sovsäck för friluftsliv kostade {base} kr i vildmarksbutiken. På outletavdelningen sänks priset med förändringsfaktorn {factor}.",
        en: "A camping sleeping bag cost {base} kr in the outdoor gear shop. In the outlet section, the price decreases by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_tennis_racket_model_year",
        sv: "Ett tennisracket kostade {base} kr när årsmodellen lanserades. När nästa års modell anländer sänks priset med förändringsfaktorn {factor}.",
        en: "A tennis racket cost {base} kr when the model launched. When next year's model arrives, the price drops by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_car_insurance_safe_driver",
        sv: "En årlig bilförsäkring kostade {base} kr. Efter flera skadefria år sänks försäkringspremien med förändringsfaktorn {factor}.",
        en: "An annual car insurance premium cost {base} kr. After multiple accident-free years, the premium is reduced by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_furniture_display_model",
        sv: "En fåtölj i butikens utställning kostade {base} kr som ny i kartong. Som visningsexemplar säljs den med ett pris som sänkts med förändringsfaktorn {factor}.",
        en: "An armchair cost {base} kr brand-new in the box. As a showroom display model, it is sold at a price reduced by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_headphones_black_friday",
        sv: "Ett par brusreducerande hörlurar kostade {base} kr före jul. Under en reahelg sänks priset med förändringsfaktorn {factor}.",
        en: "A pair of noise-cancelling headphones cost {base} kr before the holidays. Over a promotional weekend, the price drops by a change factor of {factor}.",
        rules: { minResult: 1 }
    },
    {
        id: "cf_ad_plant_pot_garden_sale",
        sv: "En stor kruka i terrakotta kostade {base} kr på trädgårdsbutiken. I slutet av trädgårdssäsongen sänks priset med förändringsfaktorn {factor}.",
        en: "A large terracotta planter pot cost {base} kr at the nursery. At the close of the gardening season, the price drops by a change factor of {factor}.",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 3. REVERSE FACTOR INCREASE (Key: find_original_inc)
//    Parameters parsed: {newPrice}, {factor}
// =========================================================================
const FIND_ORIGINAL_INC: StoryScenario[] = [
    {
        id: "cf_oi_gym_card_new_price",
        sv: "Efter en prishöjning motsvarande förändringsfaktorn {factor} kostar ett gymkort nu {newPrice} kr. Vad kostade kortet från början?",
        en: "Following a price rise corresponding to a change factor of {factor}, a gym membership now costs {newPrice} kr. What was the original price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_apartment_rent_adjusted",
        sv: "Månadshyran för en lägenhet har höjts till {newPrice} kr enligt förändringsfaktorn {factor}. Vad låg månadshyran på före höjningen?",
        en: "The monthly apartment rent has increased to {newPrice} kr by a change factor of {factor}. What was the rent before the increase?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_winter_boots_inflation",
        sv: "Ett par fodrade kängor kostar nu {newPrice} kr efter att butiken höjde priset med förändringsfaktorn {factor}. Vad var priset från början?",
        en: "A pair of winter boots now costs {newPrice} kr after the store raised the price by a change factor of {factor}. What was the initial price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_train_season_ticket",
        sv: "Ett månadskort på tåget har höjts till {newPrice} kr med förändringsfaktorn {factor}. Vad kostade tågkortet innan prishöjningen?",
        en: "A monthly commuter train ticket rose to {newPrice} kr by a change factor of {factor}. What did the ticket cost before the fare increase?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_savings_account_one_year",
        sv: "Efter ett år med ränta har behållningen på ett sparkonto vuxit till {newPrice} kr med förändringsfaktorn {factor}. Hur mycket pengar sattes in från början?",
        en: "After one year of earned interest, the balance in a savings account reached {newPrice} kr by a change factor of {factor}. How much was originally deposited?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_acoustic_guitar_value",
        sv: "Värdet på en begagnad gitarr har stigit till {newPrice} kr enligt förändringsfaktorn {factor}. Vad värderades gitarren till innan värdeökningen?",
        en: "The value of an acoustic guitar rose to {newPrice} kr according to a change factor of {factor}. What was its valuation before the increase?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_monthly_salary_raise",
        sv: "Efter en löneförhandling höjdes månadslönen för en anställd till {newPrice} kr med förändringsfaktorn {factor}. Vad var månadslönen före förhandlingen?",
        en: "Following a salary review, an employee's monthly salary rose to {newPrice} kr by a change factor of {factor}. What was the salary prior to review?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_concert_ticket_tier",
        sv: "En konsertbiljett säljs nu för {newPrice} kr efter en efterfrågehöjning motsvarande förändringsfaktorn {factor}. Vad var startpriset i förköp?",
        en: "A concert ticket is now priced at {newPrice} kr after a demand hike by a change factor of {factor}. What was the initial early bird price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_sports_membership_dues",
        sv: "Årsavgiften i en orienteringsklubb höjdes till {newPrice} kr med förändringsfaktorn {factor}. Vad kostade medlemskapet förra året?",
        en: "The annual membership in an orienteering club increased to {newPrice} kr by a change factor of {factor}. What did membership cost last year?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_restaurant_dinner_menu",
        sv: "En trerättersmiddag på restaurangen kostar nu {newPrice} kr efter att menyn justerats med förändringsfaktorn {factor}. Vad kostade menyn innan justeringen?",
        en: "A three-course dinner at a restaurant now costs {newPrice} kr after the menu was adjusted by a change factor of {factor}. What was the price before?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_sourdough_bread_price",
        sv: "Ett surdegsbröd på bageriet kostar nu {newPrice} kr efter en prishöjning med förändringsfaktorn {factor}. Vad kostade brödet tidigare?",
        en: "A sourdough loaf at the bakery now costs {newPrice} kr following a price hike by a change factor of {factor}. What did the loaf cost previously?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_coffee_package_price",
        sv: "Ett paket kaffe kostar nu {newPrice} kr i butiken efter att grossisten höjde priset med förändringsfaktorn {factor}. Vad var priset före höjningen?",
        en: "A pack of coffee now costs {newPrice} kr in the store after a supplier hike by a change factor of {factor}. What was the price before the hike?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_bicycle_service_standard",
        sv: "En grundservice för cykel kostar numera {newPrice} kr på verkstaden efter en prishöjning med förändringsfaktorn {factor}. Vad kostade servicen tidigare?",
        en: "A standard bicycle tune-up currently costs {newPrice} kr at the workshop after an increase by a change factor of {factor}. What did it cost before?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_hockey_match_tickets",
        sv: "Biljettpriset till en hockeymatch har justerats uppåt till {newPrice} kr med förändringsfaktorn {factor}. Vad kostade biljetterna före säsongsstarten?",
        en: "The ticket price for an ice hockey match was adjusted upward to {newPrice} kr by a change factor of {factor}. What was the ticket price prior to the season?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_antique_mirror_appraisal",
        sv: "En förgylld spegel värderas nu till {newPrice} kr efter en värdestegring med förändringsfaktorn {factor}. Vad uppskattades spegelns värde till från början?",
        en: "A gilded antique mirror is appraised at {newPrice} kr after an appreciation by a change factor of {factor}. What was the mirror valued at initially?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_ski_lift_pass_peak",
        sv: "Ett helgkort i skidliften kostar {newPrice} kr under högsäsongen efter en prishöjning med förändringsfaktorn {factor}. Vad kostade helgkortet under lågsäsong?",
        en: "A weekend ski lift pass costs {newPrice} kr during peak season after a price increase by a change factor of {factor}. What was the off-peak rate?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_music_school_term_fee",
        sv: "Terminsavgiften på den kommunala musikskolan höjdes till {newPrice} kr med förändringsfaktorn {factor}. Vad låg terminsavgiften på innan höjningen?",
        en: "The semester tuition at the music school increased to {newPrice} kr by a change factor of {factor}. What was the tuition fee before the raise?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_cinema_ticket_inflation",
        sv: "En biobiljett kostar nu {newPrice} kr efter att biografen höjde biljettpriserna med förändringsfaktorn {factor}. Vad kostade biobiljetten dessförinnan?",
        en: "A movie ticket now costs {newPrice} kr after the theater raised ticket prices by a change factor of {factor}. What did the ticket cost beforehand?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_housing_association_fee",
        sv: "Månadsavgiften till bostadsrättsföreningen höjdes till {newPrice} kr enligt förändringsfaktorn {factor}. Vad betalade de boende per månad innan höjningen?",
        en: "The monthly fee for the housing co-op was raised to {newPrice} kr by a change factor of {factor}. What did residents pay per month prior to the hike?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_oi_swim_hall_membership",
        sv: "Ett årskort till simhallen kostar {newPrice} kr efter att anläggningen justerade priset med förändringsfaktorn {factor}. Vad kostade årskortet från början?",
        en: "An annual pool membership costs {newPrice} kr after the facility adjusted its rate by a change factor of {factor}. What was the starting price of the pass?",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 4. REVERSE FACTOR DECREASE (Key: find_original_dec)
//    Parameters parsed: {newPrice}, {factor}
// =========================================================================
const FIND_ORIGINAL_DEC: StoryScenario[] = [
    {
        id: "cf_od_running_shoes_sale_orig",
        sv: "Ett par löparskor säljs på rea för {newPrice} kr efter att priset sänkts med förändringsfaktorn {factor}. Vad var det ordinarie priset?",
        en: "A pair of running shoes is on sale for {newPrice} kr after being discounted by a change factor of {factor}. What was the original retail price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_used_bicycle_friend",
        sv: "Du köper en begagnad mountainbike av en granne för {newPrice} kr. Grannen säljer den för förändringsfaktorn {factor} av nypriset. Vad kostade cykeln som helt ny?",
        en: "You buy a used mountain bike from a neighbor for {newPrice} kr. The neighbor sells it at a change factor of {factor} of retail. What was the bike's price brand-new?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_winter_jacket_outlet",
        sv: "En varm vinterjacka säljs på en klädoutlet för {newPrice} kr efter att priset sänkts med förändringsfaktorn {factor}. Vad kostade jackan innan rean?",
        en: "A warm winter jacket is sold at an apparel outlet for {newPrice} kr after being marked down by a change factor of {factor}. What did it cost before the sale?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_backpack_clearance",
        sv: "En vandringsryggsäck reas ut för {newPrice} kr efter en prissänkning motsvarande förändringsfaktorn {factor}. Vad var det ordinarie priset?",
        en: "A hiking backpack is cleared out for {newPrice} kr after a markdown corresponding to a change factor of {factor}. What was the regular price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_used_car_one_year_value",
        sv: "Efter ett års värdeminskning motsvarande förändringsfaktorn {factor} värderas en bil till {newPrice} kr. Vad kostade bilen när den köptes för ett år sedan?",
        en: "After one year of depreciation matching a change factor of {factor}, a car is appraised at {newPrice} kr. What did the car cost when bought a year ago?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_wool_blanket_discount",
        sv: "En pläd i ren ull kostar {newPrice} kr i butiken efter att en medlemsrabatt med förändringsfaktorn {factor} dragits av. Vad var ordinarie pris?",
        en: "A pure wool blanket costs {newPrice} kr after a member discount with a change factor of {factor} was deducted. What was the regular retail price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_tennis_racket_sale",
        sv: "Ett tennisracket säljs på kampanj för {newPrice} kr efter en prissänkning med förändringsfaktorn {factor}. Vad kostade racketen före kampanjen?",
        en: "A tennis racket is on promotional sale for {newPrice} kr following a price drop by a change factor of {factor}. What was the pre-promotion price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_sleeping_bag_outlet_price",
        sv: "En lättviktssovsäck säljs på friluftsrea för {newPrice} kr efter att ha sänkts med förändringsfaktorn {factor}. Vad kostade sovsäcken från början?",
        en: "A lightweight sleeping bag is sold on outdoor sale for {newPrice} kr after being lowered by a change factor of {factor}. What was the original price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_jeans_student_price",
        sv: "Med studentrabatt kostar ett par jeans {newPrice} kr i kassan. Rabatten motsvarar en sänkning med förändringsfaktorn {factor}. Vad var ordinarie pris?",
        en: "With a student discount, a pair of jeans costs {newPrice} kr at the register. The discount represents a factor of {factor}. What was the regular price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_water_bottle_promo",
        sv: "En termosmugg kostar {newPrice} kr under en säsongsrabatt där priset sänkts med förändringsfaktorn {factor}. Vad kostade muggen före rabatten?",
        en: "An insulated travel mug costs {newPrice} kr under a seasonal promotion lowering the price by a factor of {factor}. What was the pre-discount price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_tent_end_of_summer",
        sv: "Ett tremannatält säljs i slutet av sommaren för {newPrice} kr efter att butiken sänkt priset med förändringsfaktorn {factor}. Vad var ordinarie tältpris?",
        en: "A three-person camping tent is sold at the end of summer for {newPrice} kr after the shop lowered the price by a factor of {factor}. What was the regular price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_rollerblades_clearance",
        sv: "Ett par inlines säljs på höstrea för {newPrice} kr efter en prissänkning med förändringsfaktorn {factor}. Vad kostade de innan rean började?",
        en: "A pair of inline skates sells on autumn clearance for {newPrice} kr following a markdown by a factor of {factor}. What was the price before the sale?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_coffee_maker_damaged_box",
        sv: "En kaffebryggare med skadad kartong säljs för {newPrice} kr i fyndhörnan, vilket motsvarar förändringsfaktorn {factor} av ordinarie pris. Vad var nypriset?",
        en: "A coffee maker with a damaged carton sells for {newPrice} kr in the bargain corner, matching a factor of {factor} of list price. What was the original price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_ceramic_plant_pot_sale",
        sv: "En stor kruka kostar {newPrice} kr i handelsträdgården efter att priset sänkts med förändringsfaktorn {factor}. Vad kostade krukan tidigare?",
        en: "A large ceramic flower pot costs {newPrice} kr at the garden nursery after a price reduction by a factor of {factor}. What did it cost previously?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_electric_toothbrush_deal",
        sv: "En eltandborste säljs på apoteket för {newPrice} kr efter att priset sänkts med förändringsfaktorn {factor}. Vad kostade tandborsten till ordinarie pris?",
        en: "An electric toothbrush sells at the pharmacy for {newPrice} kr after the price was lowered by a change factor of {factor}. What was the regular price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_bedsheets_linen_set",
        sv: "Ett påslakanset i linne kostar {newPrice} kr efter en säkning med förändringsfaktorn {factor}. Vad kostade bäddsetet till ordinarie pris?",
        en: "A set of pure linen bedsheets costs {newPrice} kr after a markdown by a change factor of {factor}. What was the original list price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_frying_pan_kitchen_outlet",
        sv: "En stekpanna i gjutjärn reas ut för {newPrice} kr i köksbutiken efter en sänkning med förändringsfaktorn {factor}. Vad var ordinarie pris?",
        en: "A cast-iron frying pan is cleared out for {newPrice} kr in the cookware shop after a reduction by a factor of {factor}. What was the regular price?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_ski_helmet_clearance",
        sv: "En skidhjälm kostar {newPrice} kr i sportbutiken efter att priset sänkts med förändringsfaktorn {factor}. Vad kostade hjälmen innan rean?",
        en: "A ski helmet costs {newPrice} kr in the sports store after the price was reduced by a change factor of {factor}. What did the helmet cost before the sale?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_boardgame_damaged_box",
        sv: "Ett sällskapsspel säljs för {newPrice} kr efter att butiken sänkt priset med förändringsfaktorn {factor} på grund av en kantstött låda. Vad kostade spelet som nytt?",
        en: "A board game sells for {newPrice} kr after the shop dropped the price by a change factor of {factor} due to box shelf wear. What did the game cost as brand-new?",
        rules: { minResult: 1 }
    },
    {
        id: "cf_od_winter_gloves_spring_deal",
        sv: "Ett par fodrade skinnhandskar kostar {newPrice} kr i butiken efter en utförsäljningsrabatt med förändringsfaktorn {factor}. Vad var handskarnas ordinarie pris?",
        en: "A pair of lined leather gloves costs {newPrice} kr in the store following a seasonal markdown by a change factor of {factor}. What was their regular price?",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 5. COMPOUND FACTORS (Key: factor_compound / sequential_factors)
//    Parameters parsed: {f1}, {f2}
// =========================================================================
const FACTOR_COMPOUND: StoryScenario[] = [
    {
        id: "cf_fc_jacket_two_step_sale",
        sv: "Priset på en vinterjacka justeras i två på varandra följande steg: först med förändringsfaktorn {f1} och därefter med faktorn {f2}.",
        en: "The price of a winter jacket is adjusted in two consecutive steps: first by a change factor of {f1} and then by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_gym_membership_annual_shifts",
        sv: "Medlemsavgiften på ett träningscenter ändrades i två omgångar: först med förändringsfaktorn {f1} och året efter med faktorn {f2}.",
        en: "The membership fee at a fitness center changed in two rounds: first by a change factor of {f1} and the following year by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_apartment_rent_two_years",
        sv: "Hyran för en bostadslägenhet justerades under två år i rad: första året med förändringsfaktorn {f1} och andra året med faktorn {f2}.",
        en: "The rent for an apartment was adjusted over two consecutive years: the first year by a change factor of {f1} and the second year by {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_used_car_depreciation_stages",
        sv: "Värdet på en begagnad bil minskar i två skeden: först under det första ägaråret med faktorn {f1} och därefter under nästa år med faktorn {f2}.",
        en: "The value of a used car depreciates in two stages: first during the initial year of ownership by a factor of {f1} and the following year by {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_concert_ticket_tier_shifts",
        sv: "Priset på en konsertbiljett justerades i två etapper: först under förköpsperioden med förändringsfaktorn {f1} och därefter vid dörren med faktorn {f2}.",
        en: "The price of a concert ticket changed in two phases: first during the advance sale by a factor of {f1} and then at the door by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_bus_card_fare_revisions",
        sv: "Priset på ett länskort för buss och tåg ändrades vid två tillfällen: först med förändringsfaktorn {f1} och sex månader senare med faktorn {f2}.",
        en: "The fare for a regional transit pass was updated twice: first by a change factor of {f1} and six months later by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_coffee_beans_wholesale_shifts",
        sv: "Kilopriset på kaffe hos en grossist ändrades under två skördeperioder: först med förändringsfaktorn {f1} och därefter med faktorn {f2}.",
        en: "The wholesale price per kilogram of coffee shifted across two harvests: first by a change factor of {f1} and then by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_savings_account_compound_rate",
        sv: "Behållningen på ett räntekonto förändrades under två år: under det första året med faktorn {f1} och under det andra året med faktorn {f2}.",
        en: "The balance in a savings account shifted over two years: during the first year by a factor of {f1} and in the second year by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_restaurant_lunch_price_steps",
        sv: "Dagens lunch på en restaurang ändrades i pris vid två separata tillfällen: först med förändringsfaktorn {f1} och sedan med faktorn {f2}.",
        en: "The price of the daily lunch special at a bistro changed on two occasions: first by a change factor of {f1} and later by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_sports_shoes_clearance_steps",
        sv: "Priset på ett par träningsskor sänktes i två omgångar i sportbutiken: först med förändringsfaktorn {f1} och vid slutrean med ytterligare faktorn {f2}.",
        en: "The price of athletic sneakers was marked down in two rounds: first by a change factor of {f1} and during final clearance by another factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_antique_clock_value_trend",
        sv: "Marknadsvärdet på ett antikt väggur förändrades under två auktionssäsonger: först med faktorn {f1} och därefter med faktorn {f2}.",
        en: "The market value of an antique clock shifted across two auction seasons: first by a factor of {f1} and subsequently by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_ski_pass_seasonal_pricing",
        sv: "Ett säsongskort i fjällen justerades i två prissteg: först vid en boka-tidigt-kampanj med faktorn {f1} och därefter vid säsongsstarten med faktorn {f2}.",
        en: "A ski resort season pass was adjusted in two stages: first during an early bird sale by a factor of {f1} and at season launch by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_housing_electricity_rate",
        sv: "Elpriset per kilowattimme för ett hushåll förändrades under två kvartal: först med förändringsfaktorn {f1} och nästföljande kvartal med faktorn {f2}.",
        en: "The kilowatt-hour electricity rate for a home changed across two quarters: first by a factor of {f1} and the following quarter by {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_theatre_season_ticket_price",
        sv: "Priset på ett abonnemang till stadsteatern ändrades vid två tillfällen: först med förändringsfaktorn {f1} och sedan med faktorn {f2}.",
        en: "The subscription price for the city theatre season changed at two intervals: first by a change factor of {f1} and then by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_sourdough_flour_cost",
        sv: "Inköpspriset på ekologiskt mjöl till ett bageri förändrades i två steg: först med förändringsfaktorn {f1} och en månad senare med faktorn {f2}.",
        en: "The purchase price of organic flour for a bakery shifted in two phases: first by a change factor of {f1} and one month later by {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_wool_yarn_raw_material",
        sv: "Priset på ospunnet ullgarn till ett väveri justerades i två omgångar: först med förändringsfaktorn {f1} och därefter med faktorn {f2}.",
        en: "The wholesale price of raw wool yarn for a weaving mill was adjusted in two steps: first by a factor of {f1} and then by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_book_hardcover_to_clearance",
        sv: "Priset på en inbunden bok ändrades i två steg: först vid en bokrea med förändringsfaktorn {f1} och senare på fyndbordet med faktorn {f2}.",
        en: "The price of a hardcover novel changed in two rounds: first during an annual book sale by a factor of {f1} and later on the bargain table by {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_tennis_court_hourly_fee",
        sv: "Banhyran i en tennishall ändrades vid två tillfällen: först inför vintern med förändringsfaktorn {f1} och därefter inför våren med faktorn {f2}.",
        en: "Court rental at a tennis center changed twice: first ahead of winter by a factor of {f1} and subsequently ahead of spring by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_guitar_amplifier_price",
        sv: "Priset på en rörförstärkare för gitarr justerades i två steg i musikaffären: först med förändringsfaktorn {f1} och därefter med faktorn {f2}.",
        en: "The price of a tube guitar amplifier was adjusted in two steps in the music store: first by a factor of {f1} and then by a factor of {f2}.",
        rules: { minResult: 0.01 }
    },
    {
        id: "cf_fc_hotel_room_seasonal_rates",
        sv: "Rumspriset på ett hotell ändrades i två etapper inför sommaren: först med förändringsfaktorn {f1} och under högsäsongsveckorna med ytterligare faktorn {f2}.",
        en: "The room rate at a hotel was adjusted in two phases ahead of summer: first by a factor of {f1} and during peak season by an additional factor of {f2}.",
        rules: { minResult: 0.01 }
    }
];

export const CHANGE_FACTOR_STORIES: Record<string, StoryScenario[]> = {
    apply_factor_inc: APPLY_FACTOR_INC,
    apply_factor_dec: APPLY_FACTOR_DEC,
    find_original_inc: FIND_ORIGINAL_INC,
    find_original_dec: FIND_ORIGINAL_DEC,
    factor_compound: FACTOR_COMPOUND,
    sequential_factors: FACTOR_COMPOUND,
    sequential_total_pct: FACTOR_COMPOUND
};