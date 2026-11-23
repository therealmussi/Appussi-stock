/* ============================================================
   24 HOURS — story layer part 2: location actions + city events
   ============================================================ */
"use strict";

/* action fields: id,label,sub,cost, cond(S)?, once(flag)?, hours:[a,b]? (uses DATA.LOCATIONS[loc].lockers if hoursData)
   run(): returns string | node-object | null (handled elsewhere) */
STORY.ACTIONS = {

  apartment: [
    { id:"mail", label:"Check the mailbox", sub:"Something came with the morning post.", cost:5,
      hours:[h(8,30),h(12,30)], once:"mail_note",
      run:function(){
        setF("mail_note");
        return "Among the utilities and a pharmacy flyer: a strip torn from a timetable. Your name. Alex's handwriting, pressed hard:\n\n\"N–23.\nTrust the quiet place.\n— A.\"\n\nNo greeting. No explanation. The paper is creased like it rode in a pocket for a while before you existed to receive it.";
      }},
    { id:"computer", label:"Use the computer", sub:"Alex was here last night. Someone left the chat open.", cost:10,
      run:function(){
        if(has("alex_chat")) return "The chat log is the same silence as before. 23:58. No new messages. The cursor blinks like a pulse.";
        setF("alex_chat"); giveClue("alex_chat");
        return "Your chat app still has last night open on Alex's account — he borrows your desk when he's here too late to walk home:\n\nA (23:58): it wasn't supposed to happen. not like this.\nA (23:58): tomorrow. before midnight. if i don't call you it's because i can't.\nA (23:59): don't come to the yard.\n\nYou didn't see it until now. The timestamp repaints the entire morning.";
      }},
    { id:"calendar", label:"Check the calendar on the wall", sub:"Birthdays, chores, everyone's small obligations.", cost:5,
      once:"calendar_seen",
      run:function(){
        giveClue("bday");
        return "October is mostly empty, the way months are before they aren't:\n\n· 12 OCT (today): rent day; 'THROW OUT THE MATTRESS — M.'\n· Sofia's clinic shifts, pinned in green.\n· Jonas: 'client dinner — wear the grey'.\n· 23 NOV: ALEX — BIRTHDAY. 'sing the RIGHT year this time.'\n\n23 November. N–23. The note downstairs had exactly those two numbers.";
      }},
    { id:"docs", label:"Go through personal documents", sub:"The drawer where keys and debts go to retire.", cost:10,
      once:"jonas_drawer",
      run:function(){
        giveClue("jonas_borrowed");
        return "Rent contracts. A charging cable knotted past salvation. And in the key drawer, a folded note in Jonas's tidy capitals:\n\n'2,000. I'll fix it, I promise. Do NOT tell Alex.'\n\nTwo years old. You had both agreed, without ever saying so, to let it become furniture.";
      }},
    { id:"news", label:"Coffee and the morning paper", sub:"Vespera Herald, today's edition.", cost:15,
      once:"customs_check",
      run:function(){
        giveClue("customs_check");
        return "You drink coffee you forgot to want and read the Herald so you don't have to think.\n\nPage 7, bottom: 'Unannounced customs spot-checks at the freight terminal. Several firms in administrative review; spokespeople cite procedural modernization.'\n\nAmong them, listed only by section number so its lawyers stay asleep: Kessler Logistics.\n\nThe coffee goes cold. The day feels official now.";
      }}
  ],

  station: [
    { id:"board", label:"Read the departures board", sub:"Arrivals, departures, the daily poetry of delays.", cost:5,
      run:function(){
        let txt="THE BOARD:\n· 10:30 — from the CAPITAL — on time (a woman, one heavy coat, a heavier notebook)\n· 13:55 — to Lučenec — platform 2\n· 17:30 — from Vodna Sever — regional, delayed 10 min\n· 19:20 — to KYRDAL — long-distance, tickets sold: 31\n";
        if(!has("board_note")){ setF("board_note"); txt+="\nYou copy the arrivals onto the back of your hand like a man planning to be somebody's schedule instead of his own."; }
        return txt;
      }},
    { id:"watch", label:"Watch the hall", sub:"People miss trains. You might see someone arrive.", cost:15,
      run:function(){
        return "You get a coffee you don't drink and watch the hall run its permanently-travelling show.\n\nA man in a grey coat reads a newspaper upside-down near the payphones, and has been here longer than his coffee. A student's backpack holds more oranges than books. A bride, a soldier, a man with a vacuum cleaner. The 19:20 to Kyrdal will leave with 31 tickets' worth of escape.";
      }},
    { id:"locker", label:"Locker hall — box 14", sub:"06:00–22:00. Code, brass key, or Elio's mercy.", cost:10,
      lockersOnly:true,
      cond:function(){ return (has("knows_locker")||has("scrap_won")||has("devin_key")) && !has("opened_locker") && !has("doc_sold"); },
      run:function(){ return Engine.lockerScene(); }},
    { id:"listen", label:"Eavesdrop near the information desk", sub:"Elio's counter: the city's lost and found of conversation.", cost:10,
      run:function(){
        return "Near the desk: two students divide a chocolate bar by era of purchase. A porter explains to a tourist that the 19:20 is 'the last train that believes in itself.' An old woman has lost a hat and found, in exchange, three helpers.\n\nLives, arriving and departing, largely unexamined. You get the strange civic peace of watching people whose worst problem today is currently a hat.";
      }},
    { id:"delivertin", label:"Deliver Mara's package to Elio", sub:"A ceremonial tin, a promise, and a deadline of noon.", cost:5,
      cond:function(){ return has("tin_task") && !has("tin_done") && !has("mara_favor") && charAt("elio","station"); },
      run:function(){
        setF("tin_done"); setF("mara_favor"); relAdj("mara",2); relAdj("elio",2); giveClue("mara_favor");
        return "Elio weighs the tin and finds it correct. \"From Voss. She's one of the good ones. And you carried it before noon, which makes you a rarer species.\n\nSo — if you ever need a 'technical visit' to the locker hall after hours, between us there is now a word for that. Small kindness, long memory. That's the job.\"";
      }}
  ],

  oldtown: [
    { id:"notice", label:"Read the community board", sub:"Everything lost, found, or for sale in one square meter.", cost:15,
      once:"notice_board",
      run:function(){
        setF("notice_board");
        return "The notice board is the real government of Vespera:\n\n· LOST: grey wallet, sentimental value, reward.\n· FOR SALE: 1980s exercise bike, motivational cloth included.\n· BUS LINE 7 → Industrial zone: every half hour, at :10 and :40.\n· 'Nurse needed, Vespera Clinic — ask for Sofia L.'\n· A card in clean block letters: 'SERA — CURIOSITIES. LOANS ADVANCED AGAINST QUIET.'\n\nViktor Sera advertises in plain sight. That kind of advertisement is its own kind of warning.";
      }},
    { id:"square", label:"Sit at the fountain", sub:"Old Town conducts its business in the open.", cost:10,
      run:function(){
        return "You sit where the pigeons hold their parliament. A courier and a lawyer argue happily about a three-legged dog. Old Town trust falls into your lap unsolicited; here even privacy is a communal activity.";
      }}
  ],

  business: [
    { id:"lobby", label:"Hover in the Meridian lobby", sub:"Badges, rumors, Jonas's building.", cost:10,
      once:"lobby_gossip",
      run:function(){
        giveClue("lobby_gossip");
        return "You water a ficus with your presence until a colleague of Jonas's waits for the same elevator.\n\n\"Renaud? Solid analyst. Since spring he's—\" the elevator arrives— \"—different. Eats at his desk. Covering something with overtime. The classic. Anyway.\"\n\nThe doors close on the rest of your answer.";
      }},
    { id:"towerbar", label:"Tower Bar — bad coffee, good gossip", sub:"Where the Business District goes to be seen not eating.", cost:15,
      run:function(){
        return "The Tower Bar serves coffee at the temperature of diplomacy. Two stools down, a bond trader does a loud post-mortem on this morning's dip.\n\nYou learn two tickers and one affair. Vespera's economy, in one cup.";
      }}
  ],

  riverside: [
    { id:"bench", label:"The swans' bench", sub:"Where you two feed them. 'The quiet place.'", cost:15,
      run:function(){ return Engine.benchVisit(); }},
    { id:"bridge", label:"Walk the old bridge", sub:"The river does the talking.", cost:15,
      run:function(){
        if(S.time>=h(17)&&S.time<h(21)) return "Sunset performs the same miracle it performs every evening, which is making the whole city briefly forgivable. The water is poured copper. Boats come home.\n\nSomewhere behind you, the day is making decisions that cannot be undone, and you are watching the light instead.";
        return "The bridge moves under the wind in the old, legal way. Rowers upstream, a heron with opinions, the whole city reflected slightly better than it is. As water does.";
      }},
    { id:"quaywalk", label:"Walk the quay past the hospital", sub:"Ambulance lane, staunch brick, simple geometry.", cost:10,
      run:function(){
        if(S.time<h(18)) return "The hospital presents its least romantic face to the river and its most necessary one to the city. Nurses smoke at the ambulance door with the commitment of people on a scheduled break from gravity.";
        return "The hospital's night windows come on floor by floor, patient by patient. From here the institution looks almost gentle — a lit ship that has decided, for tonight, to keep everyone aboard.";
      }}
  ],

  industrial: [
    { id:"yard", label:"Kessler Logistics — the office", sub:"Director Brandt receives, apparently, anyone.", cost:10,
      cond:function(){ return charAt("brandt","industrial"); },
      run:function(){ return Engine.openDialog("brandt"); }},
    { id:"fence", label:"Watch the loading yard through the fence", sub:"The gap between fence and generator housing.", cost:15,
      cond:function(){ return !has("fraud_link"); },
      run:function(){
        setF("fence_watched"); S.flags.susp=(S.flags.susp||0)+1;
        if(S.time>=h(14,45) && S.time<=h(15,30)){
          giveClue("fraud_link");
          return "You find the gap between the fence and the generator housing that every city keeps for sixteen-year-olds and journalists.\n\n14:58. Brandt walks out to the yard. Sera's green car idles like a patient predator. An envelope crosses space without changing owners so much as changing species.\n\nThen — a clipboard, a manifest stamped and re-stamped inside the same minute, customs names crossed out and re-entered. Two men under one streetlamp, lit exactly like evidence.\n\nThis is what Alex saw. This is what Alex IS.";
        }
        if(S.time>=h(15,30)){
          return {text:"The yard is scoured and quiet. Chains, steam, one guard checking nothing with exemplary diligence.\n\nWhatever crossed this yard today, it arrived, it was seen by fate and no one else, and it's gone."};
        }
        return "Forklifts. Stamped manifests. A guard with the vigilant eyes of a man paid to remain unaware of specifics. Nothing — except trucks that queue at an hour when trucks queueing makes no sense, and a yard ledger that personally signs off an arrival logged 'overviewed, no exceptions.'\n\nSomething here is organized. You'll know more when the wrong people are in it.";
      }},
    { id:"scrap", label:"The scrapyard — Devin's office", sub:"Evenings, between stacked cars. Bring nerve.", cost:10,
      cond:function(){ return charAt("devin","industrial") && S.time>=h(18); },
      run:function(){ return Engine.openDialog("devin"); }},
    { id:"busboard", label:"Bus stop, line 7 — timetable", sub:"Trams of the working world.", cost:5,
      once:"bus_note",
      run:function(){
        return "LINE 7 — INDUSTRIAL ZONE: departs :10 and :40, every half hour. Last return, 22:40.\n\nYou note it the way people note things they hope to never need: precisely.";
      }}
  ]
};

/* ============================================================
   CITY EVENTS
   {id, t, winEnd?, cond(S)?, run()->node|{feedText}|null}
   ============================================================ */
STORY.EVENTS = [
  { id:"ev_mara_voicemail", t:h(8,20),
    run:function(){
      msgIn("mara","alex came by last night. sat in the corner 'watching the door'. wouldn't say what. i'm at halcyon till 15:00 if you want the human version. — M");
      feedAdd("sys","New message from Mara Voss.");
      return null;
    }},
  { id:"ev_devin_mara", t:h(9,30), winEnd:h(9,55),
    run:function(active){
      if(active && S.loc==="oldtown"){
        return {node:{kicker:"Café Halcyon", title:"9:31 — through the glass",
          text:"You're still holding your cup when the grey coat comes in. Broken nose, weather-patient stillness. He leans on the counter; Mara's smile switches to its professional setting.\n\nDEVIN: 'The boy. Last night. Where.'\nMARA: 'Alex? I don't keep his calendar. I keep the cakes fresh.'\nDEVIN: 'He was here. At nine.'\nMARA: 'He was here yesterday. Today is today.'\n\nHe places a pawnshop card on the counter like a tip, then studies you for exactly one second too long.", opts:[
            {label:"Intervene — walk over, be visible, order more of anything.", sub:"Remind him other people exist.", cost:10,
              pick:function(){ setF("morning_intervened"); relAdj("mara",2); S.flags.susp=(S.flags.susp||0)+1;
                return {text:"You are suddenly very thirsty and very social. Devin assesses you like weather about to rearrange someone's plans, gives Mara a nod that will require unpacking, and leaves.\n\nMARA (quiet): 'Stupid. Brave. Both. Thank you. He works for Sera. He collects. He doesn't forget. But he also doesn't move unless he's paid — so let's all stay unbought.'"};}},
            {label:"Stay still. Memorize the face.", cost:5,
              pick:function(){ setF("morning_watched");
                return {text:"You study your cup, his face, the card, his shoes: good, worn, working. He never looks at you again, which is worse than looking.\n\nMara slides you a refill without a word. Solidarity, espresso-strength, from one observer to another."};}}
          ]}};
      }
      if(active){
        msgIn("mara","that grey-coat man came in AGAIN. asking about alex and 'last night'. told him to buy a cake and stop forecasting. but… he LEFT A CARD. SERA — curiosities. loans. — M");
        feedAdd("sys","Mara messaged you about an unpleasant customer.");
      }
      miss("9:30 \u2014 Devin came to Café Halcyon asking about Alex's last night. You were at "+(DATA.LOCATIONS[S.loc]?DATA.LOCATIONS[S.loc].name:"?")+".");
      return null;
    }},
  { id:"ev_jonas_lobby", t:h(11,0), winEnd:h(11,30),
    run:function(active){
      if(active && S.loc==="business"){
        giveClue("jonas_debt_hint");
        return {node:{kicker:"Meridian Partners", title:"11:04 — a voice around the column", text:"Jonas is at the lobby's glass, phone wedged to his ear, ironed into a corner that security cameras don't love.\n\n'…I said by the 20th… no — not at home. Are you listening? Not at HOME. Do not call this number again. Tell him the account knows what it owes.'\n\nHe hangs up, closes his eyes for one full breath, opens them onto you and toggles the analyst smile like a desk lamp. 'Small world. Problems?'", opts:[
          {label:"\"That sounded less like a bank and more like a bailiff.\"", cost:10,
            pick:function(){ relAdj("jonas",-1);
              return {text:"'It sounded like a colleague with a scheduling concern.' The smile stays. The eyes file you under 'risk'. He walks to the elevator with the posture of a man leaving the scene of his own finances."};}},
          {label:"Say nothing. Let him have the breath.", cost:5,
            pick:function(){ relAdj("jonas",1);
              return {text:"You water the same ficus with your presence. Jonas's shoulders come down a centimeter.\n\n'Coffee sometime,' he says, which in his dialect means: I owe you one breath, spent kindly. The elevator takes him up to the numbers."};}}
        ]}};
      }
      miss("11:00 — Jonas made a strange call in the Meridian lobby. You weren't there.");
      return null;
    }},
  { id:"ev_viktor_walkout", t:h(14,15), winEnd:h(14,45),
    run:function(active){
      if(active && S.loc==="oldtown"){
        setF("viktor_walked"); giveClue("trucks_note");
        return {feedText:"14:15 — Viktor Sera's old green car pulls out of Old Town toward the industrial zone."};
      }
      return null;
    }},
  { id:"ev_scaresms", t:h(17,45),
    run:function(){
      msgIn("UNKNOWN","WRONG NUMBER. forget the list. it's handled. — T.");
      feedAdd("important","Message from UNKNOWN: someone's thumb made someone's evening easier.");
      return null;
    }},
  { id:"ev_devin_key", t:h(17,30), winEnd:h(17,45),
    run:function(active){
      if(!active) return null;
      if(S.loc==="station"){
        setF("devin_key_seen"); giveClue("devin_key");
        return {node:{kicker:"Locker hall", title:"17:31 — small, brass, fast", text:"You are reading the timetable again when the locker hall office door opens. Devin. He holds up one finger to the clerk, who suddenly has urgent paperwork.\n\nFrom the back counter, without signing anything, Devin collects something small. Brass. The kind of object that opens one specific box and cannot be argued with.\n\nHe pockets it like change — then looks, not at you, at the rows of boxes, letting a number speak.", opts:[
          {label:"Follow him — see which way the day is leaning. (10)", cost:10,
            pick:function(){ setF("followed_devin");
              return {text:"You trail him at the distance of a decision not yet made. He checks the street the way snakes check grass and turns toward the Industrial District.\n\nSo: Devin is now carrying a key to something in this hall. And in roughly half an hour he will be in his own kingdom, where a conversation with him becomes a different genre entirely."};}},
          {label:"Stay put. Don't exist for five more minutes. (5)", cost:5,
            pick:function(){ return {text:"You become extremely fascinated by a vending machine. Devin leaves. Your pulse takes its coat and follows him out."};}}
        ]}};
      }
      return null;
    }},
  { id:"ev_sofia_crisis", t:h(19,30),
    run:function(){
      setF("ev_sofia_done");
      msgIn("sofia","accident on the bridge — night shift just lost two people to it. if you're near the clinic we need HANDS, not opinions. please. — S");
      feedAdd("important","19:30 — Sofia: emergency at the clinic.");
      return {node:{kicker:"Message — Sofia Lark", title:"19:30", text:"Your phone buzzes hard:\n\n'Accident on the bridge — night shift just lost two people to it. If you're near the clinic we need HANDS, not opinions. please. — S'\n\nAcross the city, a hospital is reorganizing itself around a lack of you.", opts:[
        {label:"Go now. She asked, and she never asks.", sub:"Travel to Riverside, then stay as long as the ward needs you. (~2 h total)", cost:105,
          pick:function(){ S.flags.helped_sofia=true; S.loc="riverside"; relAdj("sofia",3);
            feedAdd("important","You spent two hours doing the unglamorous part of a catastrophe.");
            return {text:"You get there in time for the worst hour of it. You carry what is handed to you. You are lied to, kindly, by nurses who have done this too long. You hold a stranger's phone while he cries into his coat.\n\nAt 21:15 a doctor with Sofia's tired eyes finds you a chair.\n\n'You did the thing nobody ever thanks anyone for,' she says. Then, because she is Sofia, she says it again properly."};}},
        {label:"Reply honestly — but the night belongs to Alex.", cost:1,
          pick:function(){ relAdj("sofia",-2); S.flags.sofia_ignored=true; miss("19:30 — the clinic needed hands. You chose yours for other work.");
            return {text:"You type 'hospital needs me? impossible. city. anyway. sorry.' and feel each word take a small coin out of an account with Sofia Lark's name on it."};}}
      ]}};
    }},
  { id:"ev_alex_callback", t:h(16,0), winEnd:h(16,10),
    cond:function(){ return has("called_alex"); },
    run:function(active){
      if(!active){ miss("16:00 — Alex called you back from a payphone. It was over before you could pick up."); return null; }
      setF("ev_callback_done");
      return {node:{kicker:"Incoming call — number withheld", title:"16:00 — a payphone's ghost", text:"The phone rings. The number has no name.\n\nALEX (whisper; paper-mill hiss; a tannoy very far away): 'Don't talk. Listen. I'm okay-ish. My phone is swimming somewhere it can't be traced — long story, involves a bench and a refusal to be patient.\n\nI saw something last night I was never paid enough to see. I have proof. It's somewhere nothing will find it. Not even me, in a hurry.\n\nThe quiet place. Where we feed them. 23:00. If I'm not there by 23:15, don't be there either — go to the papers with whatever YOU have. And don't show anyone anything. Not the yard. Not the shop. Not one man with an office and a smile.'\n\nThe line dies mid-warning.", opts:[
        {label:"Answer. Stay quiet. Memorize.", cost:10,
          pick:function(){ giveClue("alex_witness"); setF("knows_quiet_place"); giveClue("quiet_place");
            return {text:"Ten seconds of a train yard's silence make it through.\n\n'…they're patient. and when they move, they move like a schedule. don't be early and don't be clever.\n\n23:00. swans. bring yourself. nothing else.'\n\nClick."};}},
        {label:"Let it ring — public square, too many ears.", cost:1,
          pick:function(){ setF("ignored_callback"); miss("16:00 — Alex called you back from a payphone. You let it ring out.");
            return {text:"It plays out to the last ring. Then the day does what days do: the moment closes over it like water."};}}
      ]}};
    }},
  { id:"ev_mara_crisis", t:h(20,0), winEnd:h(20,45),
    run:function(active){
      if(!active){ miss("20:00 — Devin confronted Mara at closing time."); return null; }
      if(S.loc==="oldtown"){
        return {node:{kicker:"Café Halcyon", title:"20:03 — last lamp on", text:"The café is nearly dark. Mara is counting the register into the pool of the one working lamp. The door isn't locked.\n\nA shadow resolves into Devin.\n\nDEVIN: 'The boy wasn't at the yard. Wasn't at his place. Wasn't at the bench — I checked it twice.'\nMARA: 'Maybe he wanted privacy from men who check benches twice.'\nDEVIN (calm, to the register): 'People who hide things pay for the hiding. It can be money. It can be the thing. Choose what it is, Voss.'", opts:[
          {label:"Step out of the dark: \"Take it up with me instead.\"", sub:"Put yourself between Mara and the night. (~45 min)", cost:45,
            pick:function(){ setF("helped_mara_night"); setF("ev_mara_resolved"); relAdj("mara",3); S.flags.susp=(S.flags.susp||0)+1;
              giveClue("station_plan_b"); setF("knows_station_meet");
              return {text:"You come out of the dark with your voice level and your pulse in your ears, and for a moment, three people in one café all choose different futures.\n\nDevin blinks once — recalculation, filing, a decision you will never fully learn. 'People who watch,' he says, and leaves the card on the table like a calling card he intends to collect on.\n\nMara sits down hard. 'You absolute idiot. Thank you. You absolute idiot.'\n\nFor the next forty minutes she tells you everything she knows. Including the thing she swore she wouldn't: months ago, when Alex was first followed home, he told her his plan B. 'If the bench is watched — station hall, under the departures board, same time.'\n\nWHAT YOU SPENT: the entire evening. WHAT YOU GAINED: proof that decency compounds, an alternate meeting point, and still not one scrap of paper."};}},
          {label:"Call the police from across the street.", sub:"Paperwork as a weapon. Devin will be gone in minutes.", cost:10,
            pick:function(){ setF("helped_mara_night"); setF("ev_mara_resolved"); relAdj("mara",1); setF("called_police_mara");
              return {text:"Two uniforms arrive at 20:19 with the urgency of a form being filed. Devin is gone before the car slows — but so is the pressure, and Mara gets to close her register in peace.\n\n'You called the actual police on Devin Kray,' she says on the phone later. 'Either that was brilliant, or it just put you on a list. Possibly both.'"};}},
          {label:"Leave through the square. You can't fight everyone's nights.", cost:5,
            pick:function(){ relAdj("mara",-2); miss("20:00 — Mara faced Devin alone at closing. You were twelve meters and one decision away.");
              return {text:"You are in the square's shadow when the café's inside light reallocates, and something that might be a raised voice crosses the glass.\n\nYou keep walking. The quay is beautiful at night. It has no opinions about you, which is the kindest thing anyone has said all day."};}}
        ]}};
      }
      setF("ev_mara_resolved");
      msgIn("mara","closing up had… a visitor. handled. i think. going home before i think about it. don't ask. — M");
      miss("20:00 — Devin confronted Mara at closing time. You were at "+(DATA.LOCATIONS[S.loc]?DATA.LOCATIONS[S.loc].name:"?")+".");
      return null;
    }},
  { id:"ev_meeting_open", t:h(22,15),
    run:function(){
      feedAdd("important","Night. The city now keeps only the appointments you keep.");
      if(has("knows_quiet_place") && !has("brandt_told")) feedAdd("sys","23:00 — the swans' bench. You know where you are supposed to be.");
      if(has("knows_quiet_place") && has("brandt_told") && has("knows_station_meet")) feedAdd("sys","23:00 — station hall, under the board. The bench is burned.");
      return null;
    }},
  { id:"ev_final_warning", t:h(23,20),
    run:function(){
      if(!S.metAlex && has("knows_quiet_place")) feedAdd("bad","23:20. Whatever you are doing right now, the appointment is either kept almost, or kept by someone else.");
      return null;
    }}
];
