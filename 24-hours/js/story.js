/* ============================================================
   24 HOURS — story layer part 1: helpers + dialogues
   ============================================================ */
"use strict";

const STORY = {};

/* ---------- state helpers (S provided by engine) ---------- */
function has(f){ return !!S.flags[f] || !!S.clues[f]; }
function setF(f){ S.flags[f] = true; }
function giveClue(id){ if(!S.clues[id]){ S.clues[id]=true; feedAdd("important","Journal updated: "+DATA.CLUES[id].title); } }
function relAdj(id,d){ S.rel[id]=(S.rel[id]||0)+d; }
function feedAdd(kind,text){ if(S.feed) S.feed.push({t:S.time,kind:kind,text:text}); }
function msgIn(from,text){ (S.msgs[from]=S.msgs[from]||[]).push({t:S.time,who:"them",text:text}); }
function miss(what){ if(S.missed.indexOf(what)<0) S.missed.push(what); }

function phaseName(t){
  if(t < h(12)) return "morning";
  if(t < h(17)) return "afternoon";
  if(t < h(21)) return "evening";
  return "night";
}

function charWhere(id){
  if(id==="alex") return {loc:"?",talkable:false,note:"location unknown"};
  const blocks = DATA.SCHED[id];
  for(let i=0;i<blocks.length;i++){
    const b=blocks[i];
    if(S.time>=b[0] && S.time<b[1]) return {loc:b[2],talkable:b[3],note:b[4]};
  }
  return {loc:"?",talkable:false,note:"out of reach"};
}
function charAt(id,loc){ const w=charWhere(id); return !!(w && w.loc===loc); }

/* ============================================================
   DIALOGUES — each returns {kicker,title,text,opts:[...],farewell}
   opt: {label, sub, cost, if(S)->bool, pick()->({text...}|{node...}|null)}
   ============================================================ */
STORY.DIALOG = {

  mara: function(){
    let greet;
    if(S.time < h(12)) greet="Mara sets down a cup you didn't order. \"You look terrible. Sit. That's not a suggestion, that's hospitality.\"";
    else if(S.time < h(17)) greet="Mara's shift is over but she pours two glasses of water anyway. \"So. The call?\"";
    else greet="The cafe drops to its last warm light. Mara drops into the chair opposite. \"Tell me you know what's going on. Because nobody else will tell me.\"";
    const opts=[];
    if(has("begin_day")){
      opts.push({label:"\"Alex called at eight. Said to meet him before midnight.\"", cost:0,
        pick:function(){
          let txt="Mara exhales. \"He came in last night around nine. Sat in that corner and watched the door. Wouldn't say what was wrong — only 'if it goes wrong, the plan is the plan.' And he kept his bag with him the whole time. He never keeps his bag on.\"";
          if(!has("debt_note")){
            txt+="\n\n\"…You know about him and Jonas, right? The two thousand marks? Alex called it 'the last thing I can do for him' — then a month ago they screamed at each other about it, at this exact table. Spring thing. Jonas's 'bank matters.'\"";
            giveClue("debt_note");
          }
          txt+="\n\n\"Whatever it is, he trusts you with the sad part, not the scary part. Find the scary part yourself. That's his rule.\"";
          return {text:txt};
        }});
    }
    if(has("devin_mara")||has("morning_intervened")||has("morning_watched")){
      opts.push({label:"\"Grey coat, broken nose — the man from this morning. Who is he?\"", cost:5,
        pick:function(){
          return {text:"Mara's jaw sets. \"Devin. He collects for Viktor Sera — the pawnshop man. He asked where Alex was last night. Twice. In that pleasant, unhurried way. I said I didn't know, which is true. The scary part is he didn't believe me — and he'll be checking elsewhere.\""};
        }});
    }
    if(!has("tin_task") && !has("tin_done") && S.time<h(11) && !has("mara_favor")){
      opts.push({label:"\"Anything I can carry? Errand? Water?\"", cost:5,
        pick:function(){
          setF("tin_task"); relAdj("mara",1);
          return {text:"Mara brightens for half a second. \"Actually — yes. This tin. Wedding-cake sample for Elio at the station; he saved my deposit once by knowing the lost-property rules better than the form did. If it reaches him before noon, I owe you more than coffee.\""};
        }});
    }
    if(has("mail_note") && !has("knows_locker") && (S.rel.mara>=4 || has("mara_favor"))){
      opts.push({label:"\"Alex left a note: 'N–23.' Mean anything?\"", cost:5,
        pick:function(){
          setF("knows_locker"); giveClue("locker_code");
          return {text:"Mara stares at you. \"N–23. November 23 — his birthday. He hides things behind his own birthday, always has. His station locker — number fourteen — is the only place he'd trust with anything real. Code 2311. I've watched him type it twice, and both times I pretended not to.\""};
        }});
    }
    if(S.time>=h(19) && S.rel.mara>=3 && !has("knows_station_meet")){
      opts.push({label:"\"If tonight goes wrong for Alex — where would he go?\"", cost:5,
        pick:function(){
          setF("knows_station_meet"); giveClue("station_plan_b");
          return {text:"Mara is quiet, then: \"Months ago, when that grey-coat type followed him home the first time, he told me his plan B. 'If the bench is watched, I wait inside — station hall, under the departures board, same time.' If tonight looks wrong to him, that's where he'll be. He'll look for you at 23:00 either way.\""};
        }});
    }
    opts.push({label:"\"That's all for now.\"", cost:0, close:true});
    return {kicker: charWhere("mara").loc==="riverside" ? "Vodna quay" : "Café Halcyon", title:"Mara Voss", text:greet, opts:opts, farewell:"She refills your cup without asking. The evening absorbs her again."};
  },

  sofia: function(){
    const night = S.time>=h(19);
    const greet = night
      ? "Sofia flags you through the evening corridor. \"If you're here to worry out loud, the chair's free. I have four minutes.\""
      : "Sofia checks a chart, then your face. \"You have the 08:12 face of someone dragged somewhere unusual. What's wrong?\"";
    const opts=[];
    if(has("begin_day") && !has("alex_er")){
      opts.push({label:"\"Alex is in trouble. Have you seen him since yesterday?\"", cost:5,
        pick:function(){
          setF("alex_er"); giveClue("sofia_night");
          return {text:"Sofia's voice drops into her professional register. \"03:12 last night. Split lip, bruised ribs. Refused stitches, refused the police. He only asked me one thing: 'If I don't show up tomorrow, tell them about the quiet place.' Then he asked what it costs to become untraceable for a week.\n\nI hate that question. I hate it most when the patient asks it quietly.\""};
        }});
    }
    if(has("alex_er") && !has("knows_quiet_place")){
      opts.push({label:"\"The quiet place — where did he mean?\"", cost:5,
        pick:function(){
          setF("knows_quiet_place"); giveClue("quiet_place");
          return {text:"Sofia almost smiles. \"The bench with the swans, on the Vodna quay. You two feed them like clockwork. He knows I know — that's why he said it in a hospital full of strangers. He'll be there, saying whatever this is, at whatever hour he meant.\""};
        }});
    }
    if(!has("knows_locker")){
      opts.push({label:"\"Has Alex been acting like a man with somewhere to hide something?\"", cost:5,
        pick:function(){
          setF("knows_locker"); giveClue("locker_code");
          return {text:"\"Alex and lost property are old friends. Everything unfortunate in his life lives in locker fourteen at Central Station — his birthday opens it, 23/11. Code 2311. He raced me once with his whole week packed in that box and his entire self in his jacket pocket.\""};
        }});
    }
    if(has("brandt_alerted") && night){
      opts.push({label:"\"Has anyone come asking for Alex tonight?\"", cost:5,
        pick:function(){
          S.flags.susp=(S.flags.susp||0)+1;
          return {text:"Sofia nods once. \"Grey coat. Broken nose. Asked reception whether a 'young man with a swollen mouth' had been back in. I said our records are confidential. He wrote my opening hours down anyway. Whatever Alex is doing tonight — do it faster.\""};
        }});
    }
    opts.push({label:"\"Take care of yourself.\"", cost:0, close:true});
    return {kicker:"Vespera Clinic / Vodna quay", title:"Sofia Lark", text:greet, opts:opts, farewell:"She pages herself back to the floor."};
  },

  jonas: function(){
    let greet;
    if(S.time<h(12,30)) greet="Jonas's monitor is full of numbers that don't applaud. He waves at the chair and keeps typing. \"You have office minutes. Speak.\"";
    else if(S.time<h(13,30)) greet="Trattoria Cervo. Jonas eats alone, phone face-down like it's in witness protection. \"You found me. Congratulations. What?\"";
    else if(S.time<h(18)) greet="Jonas shuts the office door behind you. \"If this is about Alex again—\" The sentence has no ending. It never does.";
    else greet="Meridian's lobby. Jonas is on hold, phone wedged at his shoulder. He raises one finger: wait. He looks older than he did at lunch.";
    const opts=[];
    if(has("customs_check")||has("fraud_link")){
      opts.push({label:"\"How well do you know Kessler Logistics?\"", cost:5,
        pick:function(){
          setF("jonas_partial"); relAdj("jonas",1);
          return {text:"The typing stops. \"The terminal is a sieve. Officially.\n\nUnofficially—\" he closes the laptop \"—some of the sieve is man-made. Why are you asking me that?\" His face does the thing it does when a name he fears is about to leave your mouth. \"Be careful with that question in this city. There are answers that follow you home.\""};
        }});
    }
    opts.push({label:"\"The two thousand marks. Say it out loud, Jonas.\"", cost:10,
      if:function(){ return !has("jonas_debt") && (has("jonas_debt_hint")||has("jonas_borrowed")||has("debt_note")||has("scrap_won")||has("fraud_link")); },
      pick:function(){
        setF("jonas_debt"); relAdj("jonas",1);
        return {text:"A long silence. \"Spring. I covered a leveraged position with my own savings, then couldn't cover it again. So a colleague introduced me to debt that doesn't live in banks. Interest, two thousand a month, or my knees book an appointment.\"\n\n\"Alex found out in April. He gave me his savings — all of it — and called it 'the last thing I can do for you.' I yelled at him for it. At the only person who—\"\n\nHe recomposes himself like a spreadsheet. \"And last month he discovered that Sera makes loans, and loans need collectors, and collectors need supervision. He called it 'discovering'. He has been WATCHING them, and now I can't reach him, and you are here instead of him, which means something has already gone wrong.\""};
      }});
    if(has("fraud_link") && !has("brandt_told") && !has("mentioned_brandt")){
      opts.push({label:"\"Brandt and Sera met at the yard today. Envelope, no receipt.\"", cost:5,
        pick:function(){
          setF("mentioned_brandt"); relAdj("jonas",2);
          return {text:"Jonas goes pale in a controlled, financial way. \"Then it isn't spot-check bad luck. It's structure.\"\n\nHe grips the table edge. \"Alex photographed them, didn't he. God. Listen to me: do not walk that evidence to Brandt. Men like him don't get exposed. They get expensed.\""};
        }});
    }
    opts.push({label:"\"Alex needs his people tonight. That's you and me.\"", cost:5,
      pick:function(){ relAdj("jonas",1);
        return {text:"\"He's not missing. He's hiding. There's a difference, and it doesn't help you.\" Jonas rubs his eyes. \"Whatever he has, trade it carefully. And if my name gets him hurt—\"\n\nHe stops, and reorganizes his face into a suit. \"Go. My meeting is in eleven minutes.\""};
      }});
    opts.push({label:"\"Good luck with the numbers.\"", cost:0, close:true});
    return {kicker:"Jonas Renaud", title:"Conversation with Jonas", text:greet, opts:opts, farewell:"He's already back inside the glass and the numbers."};
  },

  elio: function(){
    const greet="Elio slides a timetable across the counter before you speak. \"Whatever you lost today, somebody lost it bigger. Ask.\"";
    const opts=[];
    if(has("tin_task") && !has("tin_done") && !has("mara_favor")){
      opts.push({label:"\"Delivery from Café Halcyon — Mara's wedding-cake sample.\"", cost:5,
        pick:function(){
          setF("tin_done"); setF("mara_favor"); relAdj("mara",2); relAdj("elio",2); giveClue("mara_favor");
          return {text:"Elio weighs the tin in one hand and finds it correct. \"From Voss. She's one of the good ones. And you carried it before noon, which makes you a rarer species.\n\nSo: if you ever need a 'technical visit' to the locker hall after hours — a small clock problem, no witnesses, no paperwork — today, that word exists between us.\""};
        }});
    }
    opts.push({label:"\"How do the station lockers work?\"", cost:5,
      pick:function(){
        return {text:"Elio recites it like weather. \"Locker hall: six to twenty-two. Key boxes or code boxes. Code boxes: three wrong entries and the box locks down for the day, and I have to open it with my master key in front of witnesses — embarrassing for everyone, particularly you.\n\nSpare keys for code boxes live in the floor office, and the logbook sees everything. The logbook is the only colleague I've never had to forgive.\""};
      }});
    if(has("devin_key") && !has("key_confirmed")){
      opts.push({label:"\"Anything small and brass pass through here around 17:30?\"", cost:5,
        pick:function(){
          setF("key_confirmed");
          return {text:"Elio flips his ledger with a librarian's contempt. \"Spare key, box fourteen. Signed out 17:29 by a gentleman matching the description of a broken nose. He didn't sign it in. The logbook frowns upon this. As do I.\""};
        }});
    }
    opts.push({label:"\"Another time, Elio.\"", cost:0, close:true});
    return {kicker:"Station information", title:"Elio Marchetti", text:greet, opts:opts, farewell:"He returns to his announcements, each one perfectly deadpan."};
  },

  viktor: function(){
    const greet="The bell over the door announces you to a room of gilded debts. Viktor Sera looks up from a ledger the size of a brick. \"Mm. Look who the city blew in.\"";
    const opts=[];
    if(has("customs_check")||has("fraud_link")||has("manifest_seen")){
      opts.push({label:"\"What do you know about Kessler Logistics?\"", cost:5,
        pick:function(){
          S.flags.susp=(S.flags.susp||0)+1;
          if(has("fraud_link")||has("manifest_seen")){
            setF("susp_viktor");
            return {text:"Viktor smiles with the whole cabinet closed. \"I know a number of things that are worth money, and a number of things that are worth more. That question sits in the second category, which is not the one you can afford.\" He turns a page. \"Careful. Merchants notice when someone shops without a wallet.\""};
          }
          return {text:"\"Logistics. Freight. Nummars,\" Viktor says, bored, cataloguing you instead of the question. \"You're young. Young people ask expensive questions in cheap shoes.\""};
        }});
    }
    if(has("jonas_debt_hint")||has("jonas_borrowed")||has("debt_note")){
      opts.push({label:"\"Does the name Jonas Renaud have an account with you?\"", cost:5,
        pick:function(){
          setF("jonas_debt");
          return {text:"Viktor taps one fingernail on the ledger, delighted by nothing. \"Meridian Quays makes good collateral. Handsome brother, slower to pay than the sea. Loans are not gossip — but let's say the account has family management attached. Their little brother arranged the introduction.\""};
        }});
    }
    if(has("has_document") && !has("doc_sold") && !has("nadia_shown")){
      opts.push({label:"\"I have merchandise. Two years of it.\"", cost:10,
        pick:function(){
          S.flags.viktor_offer=true;
          return {node:{kicker:"Pawnshop of curiosities", title:"Viktor leans back", text:"Viktor reads the folder the way other men read love letters. \"Duplicate customs manifests. Filed twice. Stamped once in the stamp of the honest man and once in the stamp of the men who exist. This is worth a great deal of quiet.\"\n\nHe looks up. \"My offer, which you are free to hate: the folder stays here. Your involvement stays clean. A certain young clerk's problems become… municipal. You sleep. He sleeps. The city sleeps. Beautiful system.\"", opts:[
            {label:"\"Sold. Take it.\"", cost:10,
              pick:function(){ setF("doc_sold"); giveClue("doc_gone");
                return {text:"Viktor files your afternoon in a drawer. \"Pleasure doing ethics with you.\" The bell rings you out into a city that feels one kilo lighter and much worse."};}},
            {label:"\"Not for sale. Forget I came in.\"", cost:5,
              pick:function(){ S.flags.susp=(S.flags.susp||0)+1;
                return {text:"\"Of course.\" Viktor's smile files you under a tab. \"People who show me things and don't sell them tend to come back. They almost always come back.\""};}}
          ], farewell:"The drawer closes on two years of somebody's honesty."}};
        }});
    }
    opts.push({label:"\"Just browsing.\"", cost:5,
      pick:function(){
        return {text:"Clocks with no noon. Locks without doors. A taxidermied fox wearing reading glasses. Everything in this room was somebody's emergency first."};
      }});
    opts.push({label:"\"Goodbye.\"", cost:0, close:true});
    return {kicker:"Old Town", title:"Viktor Sera", text:greet, opts:opts, farewell:"The bell rings. The ledger swallows its boredom again."};
  },

  brandt: function(){
    const greet="Kessler Logistics. Tomas Brandt stands to greet you with a handshake calibrated for photographs. \"A friend of Alex? He's told me nothing but good things. Elastic hours, that boy. Ask.\"";
    const opts=[];
    if(has("customs_check")||has("fraud_link")){
      opts.push({label:"\"What exactly does Kessler ship after 22:00?\"", cost:5,
        pick:function(){
          return {text:"Brandt laughs like a press release. \"After 22:00 our trucks sleep better than our accountants. Consolidated freight, bonded warehousing, customs cooperation. We are, in fact, currently cooperating with a spot-check. You may have read about our transparency.\"\n\nHis eyes file your question under a tab the color of guards at gates."};
        }});
    }
    if(has("fraud_link") && !has("brandt_told") && !has("brandt_decided")){
      opts.push({label:"\"Mention the manifests. Show him it exists.\"", sub:"Dangerous. He will not like knowing it's out there.", cost:10,
        pick:function(){
          setF("brandt_decided");
          return {node:{kicker:"Kessler Logistics", title:"The temperature of the room changes", text:"Brandt examines the material for exactly as long as it takes to memorize it, then slides it back like a menu he won't order from.\n\n\"Revised logistics,\" he says warmly. \"Internal reclassification. Happens at this scale every decade.\"\n\nHe picks up the phone. \"Excuse me one moment — a long, calm phone call.\"", opts:[
            {label:"Leave while he's talking.", cost:5,
              pick:function(){ setF("brandt_told"); giveClue("brandt_alerted"); S.flags.susp=(S.flags.susp||0)+2;
                return {text:"You leave. Behind you the call continues: low, patient, full of the future. Alex's plan just became a wartime one."};}}
          ]}};
        }});
    }
    opts.push({label:"\"Thanks. That's all.\"", cost:0, close:true});
    return {kicker:"Kessler Logistics", title:"Tomas Brandt", text:greet, opts:opts, farewell:"He shakes your hand again. The hand now remembers yours. That is the entire point of the handshake."};
  },

  devin: function(){
    const atScrap = charWhere("devin").loc==="industrial";
    const greet = atScrap
      ? "Devin sits on a dead car between two stacks of dead cars, eating an apple. He finishes the apple before acknowledging you."
      : "Devin checks your reflection in a window before checking you. \"You walk a lot. Today of all days.\"";
    const opts=[];
    opts.push({label:"\"Why are you looking for Alex?\"", cost:5,
      pick:function(){
        return {text:"Devin looks at the middle distance where people borrow money. \"People who borrow get found. I find. I don't ask why. You want philosophy, the library opens at nine tomorrow.\""};
      }});
    if(atScrap && has("devin_key") && !has("scrap_won") && !has("scrap_tried")){
      opts.push({label:"\"The key, 17:30, box 14. I'll trade you my silence.\"", cost:20,
        pick:function(){
          setF("scrap_tried");
          if(has("devin_key_seen") || has("mara_favor") || (S.rel.mara||0)>=3){
            setF("scrap_won"); giveClue("scrap_won"); relAdj("devin",-1); setF("knows_locker");
            return {text:"The apple core lands in a drum. Devin weighs you, the trade, and his employer's interest in paperwork.\n\n\"Friday,\" he says, pressing a small warm key into your palm. \"I don't remember you, you don't remember me. Box 14 was a malfunction.\"\n\nThe key opens a locker. It also closes a debt, though whose is unclear."};
          }
          S.flags.susp=(S.flags.susp||0)+1;
          return {text:"Devin laughs once, without sound. \"You, I don't buy.\"\n\nThe shove into the scrap metal costs you ten minutes and some shoulder skin, and he keeps the key. But now you know what he has — and he suspects that you know."};
        }});
    }
    opts.push({label:"\"Nothing. Just walking.\"", cost:0, close:true});
    return {kicker: atScrap?"The scrapyard":"The quay", title:"Devin Kray", text:greet, opts:opts, farewell:"He doesn't watch you leave. He already knows where you're going."};
  },

  nadia: function(){
    const greet="Nadia's desk looks like a detective's wall compressed into a hastily cleaned surface. \"You owe me a story. Pay up — or at least gossip.\"";
    const opts=[];
    if(has("customs_check")||has("fraud_link")||has("manifest_seen")){
      opts.push({label:"\"Kessler. Customs adjustments. What's in your half-file?\"", cost:10,
        pick:function(){
          setF("nadia_met");
          return {text:"Nadia pulls a folder two years deep. \"Re-stamped manifests. Phantom consignees. A 'spot-check' from customs that ends in a shrug. The pattern is beautiful and unfalsifiable — fraud this size isn't a man, it's a schedule.\"\n\n\"I have structures. I don't have faces. Bring me one page with a real signature and a real man attached, and this stops being a story and becomes a scandal.\""};
        }});
    }
    if(has("has_document") && !has("doc_sold") && !has("nadia_shown") && ((has("nadia_met"))||has("fraud_link"))){
      opts.push({label:"\"Would this page attach a face to it?\"", sub:"Show her the duplicate manifests.", cost:20,
        pick:function(){
          setF("nadia_shown");
          return {node:{kicker:"Vespera Herald", title:"Nadia reads it twice", text:"She reads the manifest like scripture, then like a bill. \"'T. Brandt.' Timestamps. Payment emblems from Sera's side. This is the spine of the whole skeleton — and it's a duplicate, which means the original walked somewhere on a young man's back.\"\n\nShe looks up. \"I can send this to print tonight. Or you walk out and do whatever the human part of you is planning. Choose now: the print deadline is not a suggestion.\"", opts:[
            {label:"\"Send it. Tonight.\"", sub:"The Herald prints at dawn.", cost:10,
              pick:function(){ setF("publish");
                return {text:"'Tonight,' Nadia repeats, and her entire office rearranges itself around the word. Phones. Photographs. A legal email drafted at unusual speed.\n\nSomewhere in this city, a story stops being a danger and becomes a fact about to happen."};}},
            {label:"\"Wait. I have to talk to Alex first.\"", cost:5,
              pick:function(){
                return {text:"Nadia holds out her hand. \"Then the document stays with me as collateral and prints the moment either of you confirms. Fair — because it's the only way that paper leaves my sight.\"\n\nShe locks it in her desk. It will still be there at dawn."};}}
          ]}};
        }});
    }
    opts.push({label:"\"Later, Nadia.\"", cost:0, close:true});
    return {kicker:"Vespera Herald office", title:"Nadia Petrov", text:greet, opts:opts, farewell:"She's already typing about something else. That's how stories survive her."};
  }
};
