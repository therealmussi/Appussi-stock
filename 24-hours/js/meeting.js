/* ============================================================
   24 HOURS — story layer part 3: meeting scenes + endings
   ============================================================ */
"use strict";

/* ---------- objectives ---------- */
STORY.OBJECTIVES = function(){
  const o=[];
  function push(txt,done){ o.push({t:txt,done:!!done}); }
  if(!has("fraud_link") && !has("alex_witness") && !has("manifest_seen"))
    push("Find out what happened to Alex", has("alex_chat")||has("sofia_night"));
  if(has("alex_witness")||has("fraud_link")) push("Understand what Alex witnessed", true);
  if(has("mail_note") && !has("knows_quiet_place")) push("Find the 'quiet place' the note means", false);
  if(has("knows_quiet_place")){
    push(has("brandt_told") && has("knows_station_meet")
      ? "Meet Alex — 23:00, station hall (the bench is burned)"
      : "Meet Alex — 23:00, the swans' bench", false);
  }
  if(has("knows_locker") && !has("opened_locker") && !has("doc_sold") && S.time<h(22))
    push("Locker 14, Central Station hall (code 2311 if you know it)", false);
  if(has("has_document") && !has("nadia_shown") && !has("doc_sold") && S.time<h(21) && (has("nadia_met")||has("fraud_link")||has("customs_check")))
    push("The manifests are evidence — Nadia would know what this is", false);
  if(has("brandt_told")) push("Brandt knows the duplicate exists", false);
  if(!o.length) push("Get through the day in one piece", false);
  return o;
};

/* ---------- swans' bench visit (daytime) ---------- */
STORY.benchVisit = function(){
  if(has("knows_quiet_place")){
    setF("bench_revisited");
    return "The swans' bench. Initials scratched by a fifteen-year-old with a fork: A + YOU. Badly executed. Permanently true.\n\nYou know what this place is now. The only question left is whether, at 23:00, someone arrives to occupy it with you — or whether at 23:00 it is just you and the water again.";
  }
  if(has("mail_note")){
    return {kicker:"Vodna quay", title:"The swans' bench",
      text:"You know this bench. Two kids, a bag of old bread, swans with the manners of customs officials. 'A + YOU', scratched with a fork, badly, permanently.\n\n'N–23. Trust the quiet place.'\n\nQuiet. Water. Swans. You.",
      opts:[
        {label:"\"…This is it. This is the quiet place.\"", cost:5,
          pick:function(){ setF("knows_quiet_place"); giveClue("quiet_place");
            return {text:"It's the swans. It was always the swans.\n\nSomewhere in your chest a slot clicks into a machine — 23:00, this bench. Now you only need the rest of what he wanted to tell you, and the nerve to be here at midnight minus one hour."};}},
        {label:"\"I can't go inventing meetings out of bread crumbs.\"", cost:5,
          pick:function(){
            return {text:"You get up. The swans watch you leave with the personal offense of animals who have misplaced their faith in a system that works.\n\nThe note stays a riddle, and the afternoon stays short."};}}
      ]};
  }
  return "The bench is empty. You sit anyway; morning joggers' crumbs say other people have habits here too. It's nice. It's also somewhere you can't afford to sit for long.";
};

/* ---------- locker hall ---------- */
STORY.lockerScene = function(){
  if(has("opened_locker")) return "Box 14 stands open and empty, doing its best impression of an alibi.";
  if(has("scrap_won") || has("devin_key")){
    setF("opened_locker"); setF("has_document"); giveClue("manifest_seen"); giveClue("locker_full");
    return "The brass key turns like it rehearsed.\n\nInside box 14: a folder labelled in Alex's square capitals — 'IN CASE I'M WRONG'. The duplicate customs manifests. Two photographs of Brandt and Sera in the yard at night. And a clinic receipt: Sofia Lark, 03:12, last night.\n\nThe whole night suddenly has a shape. And the shape has your friend's handwriting on it.";
  }
  const tries = S.flags.codeTries||0;
  if(tries>=2 && !has("elio_favor")){
    return "The pad on box 14 is red-faced with rejection. The clerk's eyes flick over with one raised eyebrow: three strikes and Elio opens this box in front of witnesses with the master key. Today is not the day you become the story he tells at dinner.";
  }
  return {codePad:true, kicker:"Locker hall", title:"Box 14 — code pad",
    text:"Four steel digits between you and whatever Alex hid from the entire world.\n\n"+(tries===1 ? "The pad remembered one wrong code with digital patience." : "You breathe on the steel and it fogs, which feels appropriate."),
    options_note:"Enter a four-digit code. Wrong entries are remembered by the machine, and eventually by the clerk."};
};

/* ---------- meeting: the bench ---------- */
STORY.meetingBench = function(){
  Engine.advance(8);
  if(has("brandt_told") && !has("knows_station_meet")){
    setF("ambushed");
    return {kicker:"23:0X — Vodna quay, swans' bench", title:"Not him", close:true,
      text:"You wait with the river. 23:07.\n\nThe footsteps that arrive are wrong: too even, no bag, no jacket rustle. Devin steps out of a shadow as if the shadow had been holding his place in line.\n\nDEVIN: 'He sent word. Last minute. Business re-scheduled.' He holds up Alex's lighter — the one with the dent from when you dropped it off the bridge in school. 'Sent it via me. People trust mail that means something.'\n\nHe is not even slightly out of breath. The meeting was never cancelled. It was re-scheduled into an ambush, and you are holding it.",
      after:"Whatever plan B Alex had, you failed to be part of it.",
      ending:"wrong_person"};
  }
  return {kicker:"23:0X — Vodna quay, swans' bench", title:"The quiet place",
    text:"You wait with the river. 23:07. Swans moored below like small white arguments against the dark.\n\nThen: footsteps with a bag's rustle and a run left in them. Alex, out of breath, the whole day's weight on his face. He sees you — and something in his shoulders lets go of a load it has carried since 08:00.",
    opts:[
      {label:"\"Alex. Last night. All of it.\"", cost:15,
        pick:function(){ return STORY.meetingTruthStep(); }},
      {label:"Show him what you found today.", cost:5,
        if:function(){ return has("has_document")||has("fraud_link")||has("manifest_seen"); },
        pick:function(){ return STORY.meetingTruthStep(); }}
    ]};
};

STORY.meetingTruthStep = function(){
  let txt="Alex sits like his legs have been handed notice of dismissal.\n\n\"23:40 last night. I'm closing the yard office. Brandt and Sera come in for a drop that touches nothing official — no camera, no log. One grey envelope. I photographed a page of the manifest from the shadows. Then my phone died. Then Devin's silhouette was in the yard, and I couldn't tell if he'd seen the screen's glow.\"\n\nHe looks at what you're holding. \"I hid my copies at the station, box fourteen. If everything went badly, that was plan C. Plans C are for when B fails, and B was 'nothing goes wrong.'\"";
  if(has("debt_note")||has("jonas_debt")){
    txt+="\n\n\"And Jonas. You know about Jonas's debt — don't you. That's how deep this goes. The firm ruins customs. Sera ruins families. And my brother is the town where the two roads meet. He thought he was borrowing money. He was being filed.\"";
  } else {
    txt+="\n\n\"And there's the part I can't say here. My brother. Jonas owes Sera in a way that isn't money-shaped anymore. That's why they knew our names. That's why it's me standing in a yard office until midnight every day.\"";
  }
  giveClue("alex_witness"); giveClue("manifest_seen");
  setF("met_alex");
  return {text:txt, opts:STORY.finalChoices()};
};

STORY.finalChoices = function(){
  const opts=[];
  opts.push({label:"\"Tomorrow: everything goes to Nadia Petrov. Together.\"", sub:"Press, testimony, dawn edition. The long road, the right one.", cost:10,
    pick:function(){ setF("final_press");
      return {text:"Alex studies you for a long moment — the same look he had at fifteen, deciding whether to trust you with the other half of a sandwich and, as it turned out, every subsequent decision.\n\n\"Together,\" he says. \"And first thing tomorrow, before they're awake enough to be lucky.\"", endingSignal:true};}});
  if(has("jonas_debt") && !has("fraud_link") && !has("manifest_seen")){
    opts.push({label:"\"Give me the folder. I trade it back to Brandt — Jonas's debt dies.\"", sub:"Solve it. Quietly. Protect your family. Trust a smiling man.", cost:10,
      pick:function(){ setF("final_bill_brandt");
        return {text:"Alex's face cycles through three kinds of disbelief and lands on grief. \"That's the deal you'd make?\"\n\nBut you both know the sick mathematics of it: one folder, one debt, one brother who sleeps tonight. It is the quiet, wrong answer that fits the lock of your own family.", endingSignal:true};}});
  }
  opts.push({label:"\"You should leave Vespera tonight. Take the 19:20— the last thing tonight. Go.\"", sub:"Send Alex away. Stay and hold the bag yourself.", cost:10,
    pick:function(){ setF("final_alex_flees");
      return {text:"Alex shakes his head slowly. \"That's not a plan. That's applause.\"\n\nBut you mean it, and he sees that you mean it, and for one second the two of you stand in the dark calculating exactly how much of your lives this folder is worth.", endingSignal:true};}});
  return opts;
};

/* ---------- meeting: the station hall (plan B, after Brandt alert) ---------- */
STORY.meetingHall = function(){
  Engine.advance(8);
  return {kicker:"23:0X — Central Station, under the departures board", title:"Plan B",
    text:"Under the board, the hall's marble carries every footstep like gossip. 23:07.\n\nAlex comes down the steps slowly, scanning the hall the way credit checks scan. He sees you. Relief, then verification, then relief allowed to stay.",
    opts:[
      {label:"\"Alex. Last night. All of it.\"", cost:15,
        pick:function(){ return STORY.meetingTruthStep(); }}
    ]};
};
