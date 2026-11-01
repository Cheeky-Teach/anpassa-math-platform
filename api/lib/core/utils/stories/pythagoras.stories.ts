// src/core/utils/stories/pythagoras.stories.ts
import { StoryScenario } from '../wordProblemContract.js';

// =========================================================================
// 🎯 1. PYTH HYPOTENUSE (Context: pyth_hypotenuse)
// Placeholders: {a}, {b}, {c}
// =========================================================================
const PYTH_HYPOTENUSE_STORIES: StoryScenario[] = [
    {
        id: "pyth_hyp_ladder_wall",
        sv: "En stege lutar mot en husvägg. Avståndet på marken från väggen till stegen är {a} m och höjden upp till väggens fäste är {b} m. Hur lång är stegen?",
        en: "A ladder leans against a house wall. The ground distance from the wall to the ladder is {a} m and the height up to the wall mount is {b} m. How long is the ladder?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_walk_north_east",
        sv: "Leo går {a} meter rakt norrut och svänger sedan och går {b} meter rakt österut. Hur långt är avståndet fågelvägen tillbaka till startpunkten?",
        en: "Leo walks {a} meters directly north, then turns and walks {b} meters directly east. What is the straight-line distance back to the starting point?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_wheelchair_ramp",
        sv: "En ramp byggs vid en trappa. Rampens marklängd är {b} m och dess vertikala höjd är {a} m. Hur lång är själva rampytan?",
        en: "A ramp is built next to stairs. The ground length of the ramp is {b} m and its vertical rise is {a} m. How long is the ramp surface itself?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_corner_shortcut",
        sv: "Två raka gångbanor möts i ett 90°-hörn. En genväg binder samman punkter {a} m och {b} m från hörnet. Hur lång är genvägen?",
        en: "Two straight walkways meet at a 90° corner. A shortcut connects points {a} m and {b} m from the corner. How long is the shortcut?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_sail_edges",
        sv: "Ett rätvinkligt segel har kortsidorna {a} dm och {b} dm. Beräkna längden på seglets längsta kant (hypotenusan).",
        en: "A right-angled sail has legs measuring {a} dm and {b} dm. Calculate the length of the sail's longest edge (hypotenuse).",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_robot_turn",
        sv: "En programmerad robot kör {a} cm rakt framåt, svänger 90° åt höger och kör {b} cm. Hur långt är det fågelvägen från start till mål?",
        en: "A programmed robot drives {a} cm straight ahead, turns 90° right, and drives {b} cm. What is the straight-line distance from start to finish?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_skate_ramp",
        sv: "En skejtramp har en horisontell marklängd på {b} dm och en höjd på {a} dm. Hur lång är själva åkytan?",
        en: "A skate ramp has a horizontal ground run of {b} dm and a height of {a} dm. How long is the riding surface?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_river_drift",
        sv: "En simmare simmar {a} m vinkelrätt över en å och driver samtidigt {b} m nedströms med strömmen. Hur lång blev simsträckan totalt?",
        en: "A swimmer swims {a} m perpendicularly across a stream while drifting {b} m downstream with the current. What was the total swim distance?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_tree_support_cord",
        sv: "Ett träd är {b} m högt. En stödtråd spänns från trädets topp till en markpunkt {a} m från stammens fot. Hur lång är stödtråden?",
        en: "A tree is {b} m tall. A support wire is tied from the tree top to a ground stake {a} m from the base of the trunk. How long is the support wire?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_shelf_bracket",
        sv: "En rätvinklig hyllkonsol har måtten {a} cm längs väggen och {b} cm ut under hyllan. Hur lång är den sneda stödstången?",
        en: "A right-angled shelf bracket measures {a} cm along the wall and {b} cm out under the shelf. How long is the diagonal support strut?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_car_trip",
        sv: "En bil kör {a} km rakt österut och sedan {b} km rakt söderut. Hur långt är avståndet fågelvägen från startpunkten?",
        en: "A car drives {a} km straight east and then {b} km straight south. What is the straight-line distance from the starting point?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_pole_wire",
        sv: "En kabel dras från toppen av en {b} m hög lyktstolpe till ett markfäste {a} m från stolpens bas. Beräkna kabelns längd.",
        en: "A cable is pulled from the top of a {b} m lamp post to a ground anchor {a} m from the base of the post. Calculate the cable length.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_tent_string",
        sv: "En lodrät tältstång är {b} dm hög och tältpinnen sitter i marken {a} dm från stångens fot. Hur lång är tältlinan?",
        en: "A vertical tent pole is {b} dm tall and the tent peg is driven into the ground {a} dm from the pole base. How long is the tent line?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_pitch_pass",
        sv: "En boll passas {a} m längs sidlinjen och sedan {b} m rakt inåt planen i 90° vinkel. Hur långt är det fågelvägen från startpunkten till bollen?",
        en: "A ball is passed {a} m along the sideline and then {b} m straight into the pitch at a 90° angle. How far is it in a straight line from start to ball?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_roof_pitch",
        sv: "Ett pulpettak sträcker sig {b} m horisontellt och stiger {a} m i höjd. Hur lång är den lutande takytan?",
        en: "A shed roof spans {b} m horizontally and rises {a} m vertically. How long is the sloping roof surface?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_wall_crawler",
        sv: "En leksaksbil kör {a} cm uppåt på en vägg och sedan {b} cm vinkelrätt åt sidan. Hur långt är avståndet fågelvägen från startpositionen?",
        en: "A toy car drives {a} cm upwards on a wall and then {b} cm perpendicularly sideways. What is the straight-line distance from the start position?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_sled_hill",
        sv: "En pulkabacke har en fallhöjd på {a} m och ett horisontellt markavstånd på {b} m. Hur lång är själva backens lutning?",
        en: "A sledding hill has a vertical drop of {a} m and a horizontal ground distance of {b} m. How long is the slope of the hill?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_garden_bed",
        sv: "En rätvinklig blomrabatt har katetlängderna {a} m och {b} m. Hur långt kantstål behövs till rabattens längsta sida?",
        en: "A right-angled flower bed has leg lengths of {a} m and {b} m. How much edging is needed for the longest side of the flower bed?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_crane_lift",
        sv: "En lyftkran flyttar en balk {a} m i sidled och samtidigt {b} m uppåt. Hur lång är balkens direkta förflyttningssträcka?",
        en: "A crane shifts a girder {a} m sideways and {b} m upwards. What is the direct displacement distance of the girder?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_hyp_lawn_shortcut",
        sv: "En asfalterad gångväg viker av i 90° runt en gräsmatta ({a} m och {b} m). Hur lång är den genande stigen rakt över gräsmattan?",
        en: "A paved walkway turns 90° around a lawn ({a} m and {b} m). How long is the shortcut straight across the lawn?",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 2. PYTH LEG (Context: pyth_leg)
// Placeholders: {a}, {b}, {c}
// =========================================================================
const PYTH_LEG_STORIES: StoryScenario[] = [
    {
        id: "pyth_leg_ladder_height",
        sv: "En stege är {c} m lång och står lutad mot en husvägg. Stegens fot står {b} m ut från väggen. Hur högt upp på väggen når stegen?",
        en: "A ladder is {c} m long and leans against a house wall. The foot of the ladder is {b} m out from the wall. How high up the wall does the ladder reach?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_mast_anchor",
        sv: "En stödvajer till en telemast är {c} m lång och är fäst i marken {b} m från mastens bas. Hur högt upp på masten sitter vajern fäst?",
        en: "A support wire for a radio tower is {c} m long and anchored to the ground {b} m from the tower base. How high up the tower is the wire attached?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_tv_screen",
        sv: "En rektangulär bildskärm har diagonalen {c} cm och bredden {b} cm. Beräkna skärmens vertikala höjd.",
        en: "A rectangular monitor has a diagonal of {c} cm and a width of {b} cm. Calculate the screen's vertical height.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_sail_height",
        sv: "Ett rätvinkligt segel har en hypotenusa på {c} m och en nedre bomkant på {b} m. Hur hög är seglets vertikala mastkant?",
        en: "A right-angled sail has a hypotenuse of {c} m and a bottom boom edge of {b} m. How tall is the sail's vertical mast edge?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_ramp_rise",
        sv: "En rullstolsramp är {c} m lång och når {b} m framåt längs marken. Hur hög är rampens vertikala nivåskillnad?",
        en: "A wheelchair ramp is {c} m long and extends {b} m forward along the ground. What is the vertical height rise of the ramp?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_flagpole_rope",
        sv: "Ett {c} m långt rep sträcks från toppen av en flaggstång till en markpunkt {b} m från stångens fot. Hur hög är flaggstången?",
        en: "A {c} m long rope is pulled tight from the top of a flagpole to a ground point {b} m from the pole foot. How tall is the flagpole?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_frame_height",
        sv: "En rektangulär tavelram har diagonalen {c} cm och bredden {b} cm. Hur hög är ramen?",
        en: "A rectangular picture frame has a diagonal of {c} cm and a width of {b} cm. What is the height of the frame?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_ship_north",
        sv: "Ett fartyg rör sig {c} km fågelvägen och förflyttar sig samtidigt {b} km österut. Hur lång sträcka förflyttade sig fartyget rakt norrut?",
        en: "A ship travels {c} km straight-line distance while displacing {b} km east. How far did the ship travel directly north?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_sign_post",
        sv: "En rätvinklig trekantig skylt har en hypotenusa på {c} dm och en horisontell bas på {b} dm. Beräkna skyltens lodräta höjd.",
        en: "A right-angled triangular sign has a hypotenuse of {c} dm and a horizontal base of {b} dm. Calculate the sign's vertical height.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_wall_brace",
        sv: "Ett snedstag på {c} cm stöttar en lodrät väggpelare. Stagets fot sitter {b} cm ut från pelarens bas på golvet. Hur högt upp når staget?",
        en: "A diagonal brace of {c} cm supports a vertical wall stud. The foot of the brace sits {b} cm from the stud base on the floor. How high does it reach?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_door_height",
        sv: "En dörr har diagonalmåttet {c} dm och bredden {b} dm. Beräkna dörrens höjd.",
        en: "A door has a diagonal measurement of {c} dm and a width of {b} dm. Calculate the height of the door.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_meadow_path",
        sv: "En diagonal stig på {c} m skär tvärs över en rektangulär äng med bredden {b} m. Hur lång är ängens andra sida?",
        en: "A diagonal path of {c} m cuts across a rectangular meadow with width {b} m. How long is the meadow's other side?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_window_cable",
        sv: "En lina på {c} m spänns från ett fönster ner till en markpunkt {b} m rakt ut från husväggen. Hur högt över marken sitter fönstret?",
        en: "A line of {c} m is pulled taut from a window down to a ground point {b} m out from the house wall. How high above the ground is the window?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_gate_crossbeam",
        sv: "En snedsträva på {c} dm stabiliserar en trägrind som är {b} dm bred. Hur hög är grinden?",
        en: "A diagonal brace of {c} dm reinforces a wooden gate that is {b} dm wide. How tall is the gate?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_kite_altitude",
        sv: "En drake hålls i en sträckt lina på {c} m. Punkten på marken rakt under draken befinner sig {b} m bort. Hur högt flyger draken?",
        en: "A kite is held on a taut line of {c} m. The ground point directly underneath the kite is {b} m away. What is the kite's altitude?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_ramp_wedge",
        sv: "En rätvinklig träkil är {c} cm lång längs lutningen och dess bas på golvet är {b} cm. Hur hög är kilens bakstycke?",
        en: "A right-angled wooden wedge is {c} cm long along its slope and its floor base is {b} cm. How tall is the back edge of the wedge?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_canyon_drop",
        sv: "En {c} m lång linbana går snett ner i en ravin med en horisontell spännvidd på {b} m. Hur stor är höjdskillnaden ner i ravinen?",
        en: "A {c} m long zipline travels down into a canyon spanning a horizontal distance of {b} m. What is the vertical height drop?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_table_edge",
        sv: "Ett rektangulärt bord har diagonalen {c} cm och bredden {b} cm. Beräkna bordets längd.",
        en: "A rectangular table has a diagonal of {c} cm and a width of {b} cm. Calculate the length of the table.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_fire_truck",
        sv: "En brandstege fälls ut till {c} m längd och når en balkong som är {b} m horisontellt från brandbilen. Hur högt upp sitter balkongen?",
        en: "A fire engine ladder extends to a length of {c} m, reaching a balcony that is {b} m horizontally from the truck. How high up is the balcony?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_leg_playground_slide",
        sv: "En rak rutschkana är {c} dm lång och slutar {b} dm horisontellt ut från tornet. Hur hög är rutschkanans startplattform?",
        en: "A straight playground slide is {c} dm long and ends {b} dm horizontally from the tower. How high is the launch platform?",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 3. PYTH COORD DIST (Context: pyth_coord_dist)
// Placeholders: {x1}, {y1}, {x2}, {y2}, {d}
// =========================================================================
const PYTH_COORD_DIST_STORIES: StoryScenario[] = [
    {
        id: "pyth_cd_grid_points",
        sv: "På ett rutnät ligger punkt A vid ({x1}, {y1}) och punkt B vid ({x2}, {y2}). Hur långt är avståndet mellan punkterna?",
        en: "On a coordinate grid, point A is at ({x1}, {y1}) and point B is at ({x2}, {y2}). What is the distance between the points?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_drone_flight",
        sv: "En drönare flyger raka vägen från startpunkten ({x1}, {y1}) till landningsplatsen ({x2}, {y2}). Beräkna flygsträckans längd.",
        en: "A drone flies in a straight line from launch position ({x1}, {y1}) to landing spot ({x2}, {y2}). Calculate the flight distance.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_game_board",
        sv: "Två spelpjäser på en digital spelplan står vid koordinaterna ({x1}, {y1}) och ({x2}, {y2}). Vad är det direkta avståndet mellan pjäserna?",
        en: "Two game tokens on a digital board stand at coordinates ({x1}, {y1}) and ({x2}, {y2}). What is the direct distance between the tokens?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_radar_planes",
        sv: "En radar registrerar ett flygplans förflyttning i en rät linje från position ({x1}, {y1}) till ({x2}, {y2}). Hur lång var sträckan?",
        en: "A radar system records an aircraft moving in a straight line from position ({x1}, {y1}) to ({x2}, {y2}). How long was the route?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_robot_path",
        sv: "En städrobot rullar i en rät linje över golvet från koordinat ({x1}, {y1}) till laddstationen vid ({x2}, {y2}). Hur långt rullar roboten?",
        en: "A vacuum robot rolls in a straight line across the floor from coordinate ({x1}, {y1}) to the dock at ({x2}, {y2}). How far does it roll?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_treasure_map",
        sv: "På en skattkarta är startlägret markerat vid ({x1}, {y1}) och skatten vid ({x2}, {y2}). Hur långt är avståndet fågelvägen?",
        en: "On a treasure map, the camp is pinned at ({x1}, {y1}) and the treasure at ({x2}, {y2}). What is the straight-line distance?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_sensor_network",
        sv: "En sensor sitter vid position ({x1}, {y1}) och sänder signaler till en basstation vid ({x2}, {y2}). Hur långt är det mellan sändarna?",
        en: "A sensor is located at position ({x1}, {y1}) and sends signals to a base station at ({x2}, {y2}). How far apart are they?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_canvas_line",
        sv: "I ett ritprogram dras ett rakt linjesegment från punkten ({x1}, {y1}) till punkten ({x2}, {y2}). Hur lång är linjen?",
        en: "In a vector drawing program, a straight line segment is drawn from ({x1}, {y1}) to ({x2}, {y2}). How long is the line segment?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_bird_nest",
        sv: "En fågel flyger fågelvägen rakt mellan två fågelholkar placerade vid ({x1}, {y1}) och ({x2}, {y2}). Beräkna flygsträckan.",
        en: "A bird flies straight between two nesting boxes placed at coordinates ({x1}, {y1}) and ({x2}, {y2}). Calculate the flight distance.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_park_lamps",
        sv: "Två gatlyktor i en park är utplacerade vid koordinaterna ({x1}, {y1}) och ({x2}, {y2}). Hur långt är det mellan lyktorna?",
        en: "Two streetlights in a park are situated at coordinates ({x1}, {y1}) and ({x2}, {y2}). What is the distance between the lights?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_satellite_tracking",
        sv: "En satellitmottagare flyttas i rät linje från koordinaten ({x1}, {y1}) till positionen ({x2}, {y2}). Beräkna sträckans längd.",
        en: "A GPS receiver is moved in a straight line from coordinate ({x1}, {y1}) to position ({x2}, {y2}). Calculate the distance moved.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_pipe_routing",
        sv: "En rak vattenledning ska grävas mellan brunn A vid ({x1}, {y1}) och brunn B vid ({x2}, {y2}). Hur lång ledning behövs?",
        en: "A straight water pipe is to be laid between well A at ({x1}, {y1}) and well B at ({x2}, {y2}). How long must the pipe be?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_rolling_ball",
        sv: "En boll rullar i en rät bana från koordinat ({x1}, {y1}) tills den stannar vid ({x2}, {y2}). Hur lång sträcka rullade bollen?",
        en: "A ball rolls in a straight path from coordinate ({x1}, {y1}) until stopping at ({x2}, {y2}). How far did the ball roll?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_city_map",
        sv: "Två hållplatser på en digital karta är markerade vid punkterna ({x1}, {y1}) och ({x2}, {y2}). Beräkna avståndet fågelvägen.",
        en: "Two transit stops on a digital map are pinned at points ({x1}, {y1}) and ({x2}, {y2}). Calculate the straight-line distance.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_laser_beam",
        sv: "En laserstråle riktas i en rät linje från en sändare vid ({x1}, {y1}) till en sensor vid ({x2}, {y2}). Hur lång är laserstrålen?",
        en: "A laser beam is directed in a straight line from an emitter at ({x1}, {y1}) to a sensor at ({x2}, {y2}). How long is the beam?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_orienteering",
        sv: "En orienterare springer raka vägen genom skogen från kontroll ({x1}, {y1}) till kontroll ({x2}, {y2}). Hur lång är löpsträckan?",
        en: "An orienteer runs straight through the woods from checkpoint ({x1}, {y1}) to checkpoint ({x2}, {y2}). How long is the run?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_fence_posts",
        sv: "Ett staket ska monteras rakt mellan två hörnstolpar vid koordinaterna ({x1}, {y1}) och ({x2}, {y2}). Hur långt staket behövs?",
        en: "A straight section of fencing connects two corner posts at coordinates ({x1}, {y1}) and ({x2}, {y2}). How much fence is needed?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_sea_navigation",
        sv: "Två båtar ligger för ankar vid positionerna ({x1}, {y1}) och ({x2}, {y2}) på sjökortet. Beräkna avståndet mellan båtarna.",
        en: "Two boats are anchored at positions ({x1}, {y1}) and ({x2}, {y2}) on a nautical chart. Calculate the distance between the boats.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_street_planning",
        sv: "En ny gata planeras i en rät linje från korsning ({x1}, {y1}) till korsning ({x2}, {y2}). Hur lång blir gatan?",
        en: "A new street is planned in a straight line from junction ({x1}, {y1}) to junction ({x2}, {y2}). How long will the street be?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_cd_cursor_movement",
        sv: "En muspekare flyttas i en rät linje över skärmen från koordinat ({x1}, {y1}) till ({x2}, {y2}). Hur lång sträcka flyttades markören?",
        en: "A mouse pointer moves in a straight line across the screen from coordinate ({x1}, {y1}) to ({x2}, {y2}). What distance did it move?",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 4. PYTH ISOSCELES (Context: pyth_isosceles)
// Placeholders: {b}, {s}, {h}, {area}
// =========================================================================
const PYTH_ISOSCELES_STORIES: StoryScenario[] = [
    {
        id: "pyth_iso_house_gable",
        sv: "En gavel på ett hus är formad som en likbent triangel med basen {b} m och två taksidor på vardera {s} m. Beräkna triangelns area.",
        en: "A house gable is shaped like an isosceles triangle with base {b} m and two roof edges of {s} m each. Calculate the area of the gable.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_road_sign",
        sv: "En likbent vägskylt har basbredden {b} cm och två sidor som vardera mäter {s} cm. Vad är skyltens area?",
        en: "An isosceles warning sign has a base width of {b} cm and two sides measuring {s} cm each. What is the area of the sign?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_tent_opening",
        sv: "Ett tält har en likbent öppning med golvbredden {b} dm och sidosömmarna {s} dm. Beräkna öppningens area.",
        en: "A camping tent has an isosceles front opening with floor width {b} dm and side seams of {s} dm. Calculate the opening's area.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_sailing_flag",
        sv: "Ett likbent segel har en nedre kant på {b} m och två sidokanter på {s} m vardera. Beräkna seglets area.",
        en: "An isosceles sail has a bottom edge of {b} m and two side edges of {s} m each. Calculate the sail's surface area.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_pennant",
        sv: "En likbent vimpel har kortsidan {b} cm och två långsidor på {s} cm vardera. Beräkna vimpelns area.",
        en: "An isosceles pennant has a short edge of {b} cm and two long edges of {s} cm each. Calculate the pennant's area.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_roof_truss",
        sv: "En takstol bildar en likbent triangel med spännvidden {b} m och takbjälkarna {s} m. Vad är takstolens inneslutna area?",
        en: "A roof truss forms an isosceles triangle with a span of {b} m and rafters of {s} m. What is the enclosed area of the truss?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_jewelry_pendant",
        sv: "Ett likbent hängsmycke i silver har basen {b} mm och sidosidorna {s} mm vardera. Beräkna smyckets framsidas area.",
        en: "An isosceles silver pendant has a base of {b} mm and side edges of {s} mm each. Calculate the surface area of the pendant.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_paving_stone",
        sv: "En dekorativ stenplatta är likbent med basen {b} cm och två sidor på {s} cm vardera. Beräkna stenplattans area.",
        en: "A decorative paving tile is an isosceles triangle with base {b} cm and two sides of {s} cm each. Calculate the tile's area.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_wood_wedge",
        sv: "En likbent träkil har basen {b} cm och två sidor på {s} cm vardera. Beräkna kilens triangulära tvärsnittsarea.",
        en: "An isosceles wooden wedge has base {b} cm and two sides of {s} cm each. Calculate the wedge's triangular cross-sectional area.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_triangle_flag",
        sv: "En flagga är formad som en likbent triangel med mastkanten {b} cm och de två sidorna {s} cm vardera. Hur stor är flaggans area?",
        en: "A flag is shaped like an isosceles triangle with hoist edge {b} cm and two sides of {s} cm each. What is the area of the flag?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_glass_mosaic",
        sv: "En mosaikbit av glas är likbent med basen {b} cm och två sidor på {s} cm vardera. Beräkna glasbitens area.",
        en: "A mosaic glass piece is an isosceles triangle with base {b} cm and two sides of {s} cm each. Calculate the area of the glass piece.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_bridge_frame",
        sv: "En likbent fackverksdel på en bro har basen {b} m och sidobalkarna {s} m vardera. Beräkna triangelns area.",
        en: "An isosceles truss element on a bridge has base {b} m and side beams of {s} m each. Calculate the triangle's area.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_paper_kite",
        sv: "Den övre delen av en pappersdrake är en likbent triangel med bredden {b} cm och sidorna {s} cm. Beräkna arean.",
        en: "The top section of a paper kite is an isosceles triangle with width {b} cm and sides {s} cm. Calculate its area.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_corner_shelf",
        sv: "Ett likbent hörnhyllplan har basen {b} dm och de två lika sidorna {s} dm. Beräkna hyllplanets area.",
        en: "An isosceles corner shelf has a base edge of {b} dm and two equal side edges of {s} dm. Calculate the shelf's surface area.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_arrowhead_sign",
        sv: "En pilspets på en vägmarkering är likbent med basen {b} mm och sidorna {s} mm vardera. Vad är pilspetsens area?",
        en: "An arrowhead on a road marking is an isosceles triangle with base {b} mm and sides {s} mm each. What is the arrowhead area?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_flowerbed",
        sv: "En likbent trädgårdsrabatt har kantbredden {b} m och sidorna {s} m vardera. Beräkna rabattens såyta.",
        en: "An isosceles garden plot has width {b} m and side borders of {s} m each. Calculate the planting area of the plot.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_metal_bracket",
        sv: "En metallkonsol är formad som en likbent triangel med basen {b} cm och sidorna {s} cm vardera. Beräkna konsolens area.",
        en: "A metal bracket is shaped like an isosceles triangle with base {b} cm and sides {s} cm each. Calculate the bracket's area.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_timber_panel",
        sv: "En likbent träpanel har basmåttet {b} dm och sidorna {s} dm vardera. Beräkna panelens area.",
        en: "An isosceles wooden panel has a base measure of {b} dm and side lengths of {s} dm each. Calculate the panel area.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_mirror_tile",
        sv: "En likbent spegel har bottenkanten {b} cm och två sidosidor på {s} cm vardera. Beräkna spegelytans area.",
        en: "An isosceles decorative mirror has a bottom edge of {b} cm and two side edges of {s} cm each. Calculate the mirror's area.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_iso_skylight_window",
        sv: "Ett likbent takfönster har bottenbredden {b} dm och de två sneda sidorna {s} dm vardera. Hur stor är fönstrets glasyta?",
        en: "An isosceles attic skylight has a bottom width of {b} dm and two slanted sides of {s} dm each. What is the glass area of the window?",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 5. PYTH DIAGONAL (Context: pyth_diagonal)
// Placeholders: {a}, {b}, {c}
// =========================================================================
const PYTH_DIAGONAL_STORIES: StoryScenario[] = [
    {
        id: "pyth_diag_soccer_pitch",
        sv: "En fotbollsplan är {b} m lång och {a} m bred. Hur lång är diagonalen tvärs över planen från hörn till hörn?",
        en: "A soccer pitch is {b} m long and {a} m wide. How long is the diagonal across the pitch from corner to corner?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_door_entry",
        sv: "En dörröppning är {b} cm bred och {a} cm hög. Hur lång är dörröppningens diagonal?",
        en: "A doorway is {b} cm wide and {a} cm high. What is the length of the doorway's diagonal?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_tabletop",
        sv: "En rektangulär bordsskiva är {b} cm lång och {a} cm bred. Beräkna diagonalens mått.",
        en: "A rectangular tabletop is {b} cm long and {a} cm wide. Calculate the diagonal dimension.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_farm_field",
        sv: "Ett rektangulärt fält är {b} m långt och {a} m brett. En rörledning ska dras diagonalt över fältet. Hur lång blir ledningen?",
        en: "A rectangular farm field is {b} m long and {a} m wide. A pipe is laid diagonally across the field. How long is the pipe?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_phone_screen",
        sv: "En mobilskärm har bredden {b} mm och höjden {a} mm. Vad är skärmens diagonala mått?",
        en: "A phone screen has a width of {b} mm and a height of {a} mm. What is the screen's diagonal measurement?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_swimming_pool",
        sv: "En rektangulär simbassäng är {b} m lång och {a} m bred. Hur lång simsträcka blir det om man simmar diagonalt?",
        en: "A rectangular pool is {b} m long and {a} m wide. How long is the swim distance if you swim diagonally across it?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_carpet_rug",
        sv: "En rektangulär matta mäter {b} dm på längden och {a} dm på bredden. Hur lång är diagonalen?",
        en: "A rectangular rug measures {b} dm in length and {a} dm in width. How long is the diagonal?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_wooden_crate",
        sv: "Botten på en rektangulär trälåda har måtten {b} cm gånger {a} cm. Beräkna bottenplattans diagonal.",
        en: "The bottom of a rectangular crate measures {b} cm by {a} cm. Calculate the diagonal of the bottom panel.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_window_pane",
        sv: "Ett fönster är {b} cm brett och {a} cm högt. Beräkna fönsterrutans diagonal.",
        en: "A window pane is {b} cm wide and {a} cm tall. Calculate the diagonal of the window.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_whiteboard",
        sv: "En whiteboardtavla är {b} dm bred och {a} dm hög. Hur lång är diagonalen tvärs över tavlan?",
        en: "A classroom whiteboard is {b} dm wide and {a} dm high. How long is the diagonal across the board?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_town_square",
        sv: "Ett torg är {b} m långt och {a} m brett. En gångbana går diagonalt tvärs över torget. Hur lång är gångbanan?",
        en: "A town square is {b} m long and {a} m wide. A walkway cuts diagonally across the square. How long is the walkway?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_drawing_paper",
        sv: "Ett ark ritpapper är {b} cm brett och {a} cm långt. Beräkna papprets diagonalmått.",
        en: "A sheet of drawing paper is {b} cm wide and {a} cm long. Calculate the paper's diagonal dimension.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_patio_deck",
        sv: "En rektangulär altan är {b} m lång och {a} m bred. En ljusslinga ska spännas diagonalt över altanen. Hur lång slinga behövs?",
        en: "A rectangular patio is {b} m long and {a} m wide. String lights are hung diagonally across the patio. How long string is needed?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_basketball_court",
        sv: "En basketplan är {b} m lång och {a} m bred. Beräkna sträckan diagonalt från ett hörn till motsatt hörn.",
        en: "A basketball court is {b} m long and {a} m wide. Calculate the diagonal distance from one corner to the opposite corner.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_envelope",
        sv: "Ett kuvert har bredden {b} cm och höjden {a} cm. Hur lång är kuvertets diagonal?",
        en: "An envelope has a width of {b} cm and a height of {a} cm. What is the length of the envelope's diagonal?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_room_floor",
        sv: "Ett rums golv mäter {b} m på längden och {a} m på bredden. Hur lång kabel behövs för att nå diagonalt över golvet?",
        en: "A room floor measures {b} m in length and {a} m in width. How long must a cable be to stretch diagonally across the floor?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_book_cover",
        sv: "Ett bokomslag är {b} cm brett och {a} cm högt. Beräkna diagonalens längd.",
        en: "A book cover is {b} cm wide and {a} cm tall. Calculate the length of the diagonal.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_parking_space",
        sv: "En rektangulär parkeringsruta är {b} dm lång och {a} dm bred. Hur lång är diagonalen mellan hörnen?",
        en: "A rectangular parking stall is {b} dm long and {a} dm wide. What is the diagonal length between the corners?",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_monitor_screen",
        sv: "En datorskärm har bredden {b} cm och höjden {a} cm. Beräkna skärmens diagonalmått.",
        en: "A computer monitor has a width of {b} cm and a height of {a} cm. Calculate the screen's diagonal measure.",
        rules: { minResult: 1 }
    },
    {
        id: "pyth_diag_backyard",
        sv: "En rektangulär trädgårdstomt är {b} m lång och {a} m bred. Hur lång är diagonalen rakt över tomten?",
        en: "A rectangular yard is {b} m long and {a} m wide. What is the diagonal distance straight across the yard?",
        rules: { minResult: 1 }
    }
];

// =========================================================================
// 🎯 MASTER REGISTRY EXPORT
// =========================================================================
export const PYTHAGORAS_STORIES: Record<string, StoryScenario[]> = {
    pyth_hypotenuse: PYTH_HYPOTENUSE_STORIES,
    pyth_leg: PYTH_LEG_STORIES,
    pyth_coord_dist: PYTH_COORD_DIST_STORIES,
    pyth_isosceles: PYTH_ISOSCELES_STORIES,
    pyth_diagonal: PYTH_DIAGONAL_STORIES
};