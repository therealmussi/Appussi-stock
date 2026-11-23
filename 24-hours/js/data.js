/* ============================================================
   24 HOURS — game data: city, characters, clues
   ============================================================ */
"use strict";

const DATA = {};

/* ---- time helpers (minutes since 00:00) ---- */
function h(hh, mm) { return hh * 60 + (mm || 0); }
function fmt(min) {
  if (min >= 1440) return "24:00";
  const hh = Math.floor(min / 60), mm = Math.floor(min % 60);
  return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
}

/* ---- travel time matrix (minutes, symmetric) ---- */
DATA.MATRIX = {
  apartment: { station: 12, oldtown: 18, business: 25, riverside: 15, industrial: 35 },
  station:   { oldtown: 10, business: 15, riverside: 20, industrial: 30 },
  oldtown:   { business: 12, riverside: 15, industrial: 25 },
  business:  { riverside: 15, industrial: 20 },
  riverside: { industrial: 25 },
  industrial:{}
};

DATA.LOCATIONS = {
  apartment: {
    name: "The Apartment",
    area: "Venskaya Hill",
    hoursLabel: "HOME · ALWAYS OPEN",
    desc: {
      morning: "Grey light through the blinds. The kettle you never replaced hums. Alex's hoodie is still on the chair where he threw it last month, before the argument you never really finished.",
      afternoon: "Dust drifts in the afternoon light. The apartment is quiet, full of the day you are not spending anywhere else.",
      evening: "The window holds Vespera's lights at arm's length. From up here the city looks like a circuit board of obligations.",
      night: "The street lamp flicks shadows across the ceiling. Midnight is a finish line, and you can feel the hours thinning."
    }
  },
  station: {
    name: "Central Station",
    area: "Transit Hub",
    hoursLabel: "HALLS 05:00–24:00 · LOCKER HALL 06:00–22:00",
    lockers: [h(6,0), h(22,0)],
    desc: {
      morning: "Announcements stack over announcements. Commuters pour down the escalators in slow grey rivers. The 10:30 from the Capital sits on the departures board.",
      afternoon: "The hall breathes out. Tourists photograph the Art Nouveau clock, pigeons audit the floor. The locker hall hums like a beehive of small metal secrets.",
      evening: "Shift workers, one evening departure, a janitor's wide slow mop. The board lists one train to Kyrdal at 19:20, mostly empty.",
      night: "The vapour lamps make the marble glisten as if wet. A last train sighs somewhere far off. Almost nobody is left to arrive."
    }
  },
  oldtown: {
    name: "The Old Town",
    area: "Historic Quarter",
    hoursLabel: "CAFÉ HALCYON 07:00–20:00 · PAWNSHOP 10:00–20:00",
    hours: [h(0), h(23,59)],
    desc: {
      morning: "Delivery vans quarrel with tram bells. Café Halcyon vents coffee and warm pastry smell across the square. Shutters are still opening down the narrow streets.",
      afternoon: "Tourists kneel before menus. The pawnshop's little brass bell keeps its laconic appointments. Someone always leaves the fountain square just as you arrive.",
      evening: "Lanterns come on in stages, as if the streets were being paid one by one. The trattoria glows orange. Halcyon's sign flickers — Mara closes alone at eight.",
      night: "Empty chair legs, distant laughter, your own footsteps with nowhere to be. Old Town at night is honest about how late it is."
    }
  },
  business: {
    name: "Business District",
    area: "Meridian Quays",
    hoursLabel: "OFFICES 08:30–18:30 · HERALD OFFICE 11:30–21:00",
    hours: [h(7,30), h(21,0)],
    desc: {
      morning: "Glass towers hold the morning sun like accountants. Badges, espresso, the tidal motion of the employed. The Vespera Herald occupies a stubborn old bank building on the corner.",
      afternoon: "Lunch-hour exodus; ties loosened like a mutual treaty. Inside the lobbies, telephones ring for people who are never there.",
      evening: "Cleaning crews inherit the corridors. A few offices burn long past the healthy hour. The Herald's window is still lit.",
      night: "The towers go dark floor by floor, correct to the minute. The district admits it was never really about people."
    }
  },
  riverside: {
    name: "The Riverside",
    area: "Vodna Quay",
    hoursLabel: "HOSPITAL 24H · QUIET QUAYS",
    hours: [h(0), h(23,59)],
    desc: {
      morning: "The river carries the city's morning noise away. Rowers, nurses on early shift, bread crumbs for the swans at the old stone bench.",
      afternoon: "Warm stone, children racing paper boats. The hospital announces itself only by the ambulance lane and its terrible climate control.",
      evening: "The water turns to poured copper, then to ink. Lamps on the quay take their posts one by one. The bench faces west; everything here ends facing west.",
      night: "River mist. Every sound arrives delayed, as if the water were translating it. The swans have moored for the night near the pilings."
    }
  },
  industrial: {
    name: "Industrial District",
    area: "Kessler Zone",
    hoursLabel: "KESSLER LOGISTICS 08:30–18:00 · SCRAPYARD (evening)",
    hours: [h(6,0), h(23,59)],
    desc: {
      morning: "Freight trams and forklifts. Ketl salt dust coats the railings. Kessler Logistics dominates the low skyline with its loading cranes and its confident fence.",
      afternoon: "Heat off the corrugated steel. Trucks queue at the gate; a guard stamps manifests he does not read.",
      evening: "The great cranes stand still like folded birds. Sodium lamps over the scrapyard, dogs auditing fences. Time here is measured in shifts, not hours.",
      night: "No one, on paper, is here at night. The fence hums. The yard lights draw watchful circles on wet gravel. This is where the day hides what it did."
    }
  }
};

/* ---- clues ---- */
DATA.CLUES = {
  begin_day:      { cat:"Places", title:"Mysterious call at 08:00", text:"Alex: 'We need to talk. Something happened last night. I can't explain over the phone. Meet me before midnight.' The line died before you said a word." },
  alex_chat:      { cat:"People", title:"Alex's last messages", text:"23:58 last night, from the apartment computer: '…it wasn't supposed to happen. Not like this. Tomorrow. Before midnight. If I don't call you it's because I can't.'" },
  bday:           { cat:"People", title:"Alex's birthday", text:"November 23rd. You sang the wrong year two years in a row. As a code order: 23, then 11 → 2311." },
  jonas_borrowed: { cat:"People", title:"Jonas borrowed money", text:"Two years ago Jonas asked you for 2,000 marks and never mentioned it again. There's a note in your drawer: 'I'll fix it, I promise. Do NOT tell Alex.'" },
  customs_check:  { cat:"Events", title:"Customs spot-checks", text:"This morning's paper: unannounced customs spot-checks at the freight terminal. Several firms 'in administrative review'. Kessler Logistics is listed only by section number." },
  devin_mara:     { cat:"People", title:"The man who asked about Alex", text:"Grey coat, broken nose. He pressed Mara about where Alex was last night. Someone called him 'Devin'. A collector who works for Viktor Sera." },
  jonas_debt_hint:{ cat:"People", title:"Jonas on the phone", text:"Overheard at Meridian's lobby, 11:00: '…I said I'd pay by the 20th… no, not at home… don't call this number again.' He wasn't arguing about a subscription." },
  lobby_gossip:   { cat:"People", title:"Meridian lobby gossip", text:"A colleague mentioned Jonas has been 'withdrawn' since spring — lost money somewhere, and covers it with overtime." },
  debt_note:      { cat:"People", title:"Alex and the 2,000 marks", text:"Mara: in spring Alex lent Jonas 2,000 marks — Jonas's 'bank thing'. Alex called it 'the last thing I can do for him.' It was also what they fought about a month ago." },
  fraud_link:     { cat:"Events", title:"Brandt and Sera", text:"From behind Kessler's fence: Director Brandt handed Viktor Sera a grey envelope. No receipt; manifests stamped and re-stamped in the same minute; customs names crossed out and re-entered. This is what Alex saw." },
  manifest_seen:  { cat:"Documents", title:"Falsified manifests", text:"Duplicate customs manifests in Alex's handwriting-label folder. Numbers re-stamped in red, consignees crossed out and re-entered, two years of it. Signed strip: 'T. Brandt'. Sera's emblem marks payment dates." },
  alex_witness:   { cat:"People", title:"Alex saw them", text:"Alex was closing Kessler's yard office at 23:40 last night when Brandt and Sera arrived for an unscheduled drop. He photographed one page from the shadows. His phone died at the worst moment, and he believes Devin caught the screen's glow. He is afraid of exactly the wrong person." },
  quiet_place:    { cat:"Places", title:"The quiet place", text:"'Where we used to feed them' — the swans' bench on the Vodna quay, Riverside. Alex wants you there at 23:00." },
  locker_code:    { cat:"Places", title:"Locker 14 · code 2311", text:"Central Station locker hall, box 14. Alex's code, always: his birthday — 23/11 → 2311." },
  locker_full:    { cat:"Documents", title:"Locker 14 opened", text:"Inside: a folder labelled 'IN CASE I'M WRONG' — the duplicate customs manifests, two photographs of Brandt and Sera in the yard at night, and a clinic receipt: Sofia Lark, 03:12 last night." },
  brandt_alerted: { cat:"Events", title:"Brandt knows", text:"You showed Brandt the manifests. He smiled, called it 'revised logistics', and made a long calm phone call. You should not have done that." },
  doc_gone:       { cat:"Documents", title:"Evidence sold", text:"The duplicate manifests now sit in Viktor Sera's drawer, filed as 'acquisitions of the afternoon'. Whatever you tell Alex tonight, the proof is dead." },
  sofia_night:    { cat:"People", title:"Sofia: 03:12 at the ER", text:"Alex came in last night with a split lip, refused stitches, refused the police. He said: 'If I don't show up, tell them about the quiet place.' He asked what it costs to become untraceable for a week." },
  elio_favor:     { cat:"Places", title:"Elio owes you one", text:"Elio now opens the locker hall after hours 'for brief technical visits'. A small kindness, remembered." },
  devin_key:      { cat:"Places", title:"Devin has a brass key", text:"17:30, station locker hall: Devin collected something small and brass from the floor office — a locker key was on the floor. Whose key opens what?" },
  scrap_won:      { cat:"Places", title:"The brass key", text:"Devin sold you his brass key for a day of your respect and a favor unnamed. Locker 14 no longer needs a code." },
  mara_favor:     { cat:"People", title:"Delivered Mara's package", text:"You ran Mara's ceremonial tin across to the station before 11:00. Gratitude, in this city, is a currency few can counterfeit." },
  nadia_interest: { cat:"People", title:"Nadia is interested", text:"Nadia Petrov of the Herald has a two-year file on Kessler 'customs adjustments'. She lacked one thing: a witness with a face, and now a document." },
  trucks_note:    { cat:"Events", title:"The 14:15 departure", text:"You watched Viktor Sera's old green car pull out of Old Town toward the industrial zone, as regular as a heartbeat." },
  station_plan_b: { cat:"Places", title:"Mara: 'If things go wrong'", text:"Mara remembered Alex's plan B: 'If anyone's there, he waits inside — station hall, under the departures board, same time. He told me months ago, when he was being followed before.'" }
};

/* ---- characters ---- */
/* schedule entry: [fromMin, toMin, loc, talkable, note] */
DATA.SCHED = {
  mara: [
    [h(8,0),  h(8,30),  "apartment", false, "at home, getting ready"],
    [h(8,30), h(15,0),  "oldtown",  true,  "Café Halcyon — morning shift"],
    [h(15,0), h(15,40), "oldtown",  true,  "errands around the fountain square"],
    [h(15,40),h(17,0),  "riverside",true,  "jogging on the quay"],
    [h(17,0), h(20,0),  "oldtown",  true,  "Café Halcyon — evening shift"],
    [h(20,0), h(20,45), "oldtown",  true,  "closing the café alone"],
    [h(20,45),h(24,0),  "riverside",false, "on her way home"]
  ],
  sofia: [
    [h(8,0),  h(8,30),  "station",   true,  "commuting"],
    [h(8,30), h(14,0),  "riverside", true,  "Vespera Clinic — morning shift"],
    [h(14,0), h(14,20), "riverside", false, "walking home"],
    [h(14,20),h(19,0),  "apartment", false, "studying; phone sometimes on"],
    [h(19,0), h(23,30), "riverside", true,  "Vespera Clinic — evening shift"]
  ],
  jonas: [
    [h(8,0),  h(8,30),  "station",  false, "commuting"],
    [h(8,30), h(9,0),   "business", true,  "Meridian Partners — arriving"],
    [h(9,0),  h(12,30), "business", true,  "Meridian Partners — 4th floor"],
    [h(12,30),h(13,30), "oldtown",  true,  "trattoria Cervo — lunch, alone, phone face-down"],
    [h(13,30),h(18,0),  "business", true,  "Meridian Partners — 4th floor"],
    [h(18,0), h(19,0),  "business", true,  "lobby — endless phone calls"]
  ],
  elio: [
    [h(8,0),  h(13,0),  "station", true,  "Station information & lost property"],
    [h(13,0), h(13,45), "oldtown", true,  "lunch at the kiosk by the fountain"],
    [h(13,45),h(22,0),  "station", true,  "Station information & lost property"]
  ],
  viktor: [
    [h(10,0), h(14,15), "oldtown",    true,  "his pawnshop of curiosities"],
    [h(14,15),h(15,45), "industrial", false, "at Kessler's loading yard (private)"],
    [h(15,45),h(16,30), "oldtown",    true,  "his pawnshop of curiosities"],
    [h(16,30),h(18,0),  "riverside",  true,  "walking the quay, coat too heavy for the weather"],
    [h(18,0), h(20,0),  "oldtown",    true,  "his pawnshop of curiosities"]
  ],
  brandt: [
    [h(8,30), h(12,30), "industrial", true,  "Kessler Logistics — office"],
    [h(12,30),h(13,15), "business",   true,  "business lunch at the Tower Bar"],
    [h(13,15),h(18,0),  "industrial", true,  "Kessler Logistics — office"],
    [h(18,0), h(18,40), "industrial", false, "on the warehouse floor"]
  ],
  devin: [
    [h(9,15), h(10,0),  "oldtown",    true,  "at Café Halcyon, asking after Alex"],
    [h(10,0), h(12,0),  "oldtown",    false, "at Sera's shop, back room"],
    [h(12,0), h(17,30), "riverside",  true,  "loitering by the quay like he owns the shade"],
    [h(17,30),h(18,0),  "station",    true,  "at the locker hall"],
    [h(18,0), h(21,0),  "industrial", true,  "his scrapyard, between the stacked cars"],
    [h(21,0), h(24,0),  "oldtown",    false, "moving through the old streets"]
  ],
  nadia: [
    [h(10,30),h(11,15), "station",  true,  "just off the 10:30 from the Capital"],
    [h(11,30),h(15,0),  "business", true,  "Vespera Herald office"],
    [h(15,0), h(15,30), "oldtown",  true,  "buying flowers on the square"],
    [h(15,30),h(21,0),  "business", true,  "Vespera Herald office"],
    [h(21,0), h(22,0),  "oldtown",  true,  "late dinner at trattoria Cervo"]
  ],
  alex: [
    [h(8,0), h(24,0), "station", false, "location unknown"]
  ]
};

DATA.CHARS = {
  mara: {
    id:"mara", name:"Mara Voss", role:"Barista, Café Halcyon", age:21,
    bio:"Your oldest friend. Talks in refills and half-finished sentences. Knows everyone's schedule and owes nobody an explanation.",
    personality:"Dry, warm, allergic to being managed.",
    relation:"Close friend. She covered for you the time you disguised a day off as flu.",
    color:"#e7a03c"
  },
  sofia: {
    id:"sofia", name:"Sofia Lark", role:"Nursing student, Vespera Clinic", age:23,
    bio:"Steady hands, terrible taste in movies. Knows Alex from the clinic; keeps other people's secrets professionally.",
    personality:"Calm, precise, quietly brave.",
    relation:"Close friend. She fixed your shoulder last winter and billed you in coffee, not money.",
    color:"#7ec8a0"
  },
  jonas: {
    id:"jonas", name:"Jonas Renaud", role:"Financial analyst, Meridian Partners", age:28,
    bio:"Alex's older brother. Correct, exhausted, ironed shirt even on Fridays. Something heavy has been resting on him since spring.",
    personality:"Controlled, proud, denial as a lifestyle.",
    relation:"Alex's brother. You and he have a history of frost.",
    color:"#9aa7c7"
  },
  elio: {
    id:"elio", name:"Elio Marchetti", role:"Station information & lost property", age:57,
    bio:"Thirty years of announcements in his voice. Sees everything and only half of it interests him.",
    personality:"Dry humor, procedural kindness.",
    relation:"Friendly regular. He notices who misses the 08:12 twice.",
    color:"#c9b27c"
  },
  viktor: {
    id:"viktor", name:"Viktor Sera", role:"Pawnshop of curiosities", age:49,
    bio:"Buys other people's urgent decisions. Invoices the city between debt and mercy.",
    personality:"Soft-spoken, complete, cold.",
    relation:"None — but you have heard his name now.",
    color:"#b06a5a"
  },
  brandt: {
    id:"brandt", name:"Tomas Brandt", role:"Director, Kessler Logistics", age:52,
    bio:"Award-winning logistics; ironed smile. The kind of man who thanks you before cutting the brake line.",
    personality:"Corporate warmth over a locked room.",
    relation:"None — yet. The yard is his kingdom.",
    color:"#8f9aa3"
  },
  devin: {
    id:"devin", name:"Devin Kray", role:"Waiting, professionally", age:33,
    bio:"Grey coat, broken nose, waits like weather. Viktor Sera's message, delivered in person.",
    personality:"Monosyllabic menace.",
    relation:"None. You have now met.",
    color:"#7a7f88"
  },
  nadia: {
    id:"nadia", name:"Nadia Petrov", role:"Investigative writer, Vespera Herald", age:35,
    bio:"Half a file on Kessler 'customs adjustments' and nobody willing to be a face. Sleeps with the window open in any weather.",
    personality:"Piercing, ethical, allergic to compromise.",
    relation:"Good acquaintance — she got you a stringer job once; you owe her a story.",
    color:"#c9a3d0"
  },
  alex: {
    id:"alex", name:"Alex Renaud", role:"Warehouse clerk, Kessler Logistics", age:23,
    bio:"Alex works the Kessler yard office evenings and studies logistics at home. Sings to no one. Your closest friend since school.",
    personality:"Careful the way children of chaotic households are careful: plans B through F, all pre-written.",
    relation:"The call at 08:00 was about him. His phone is 'switched off' the way phones are when they aren't.",
    color:"#ffb454"
  }
};

DATA.CONTACTS = ["alex","mara","sofia","jonas","elio","nadia","viktor","brandt","devin","UNKNOWN"];
