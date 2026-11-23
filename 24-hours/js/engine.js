/* ============================================================
   24 HOURS — engine: state, discrete time, events, calls, saves
   ============================================================ */
"use strict";

var S = null;

const Engine = {

  DEFAULTS: function(){
    return {
      version: 1, plus:false,
      time: h(8,0), loc:"apartment",
      flags:{}, clues:{}, rel:{ mara:2, sofia:2, jonas:1, elio:1, nadia:1, viktor:0, brandt:0, devin:0 },
      msgs:{}, callLog:[], feed:[], missed:[],
      fired:{}, codeTries:0, metAlex:false, ending:null
    };
  },

  /* ---------------- lifecycle ---------------- */
  newGame(plus){
    S = this.DEFAULTS();
    S.plus = !!plus;
    if(plus){
      const arch = UI.loadArchive();
      if(arch && arch.length){
        const last = arch[arch.length-1];
        S.memories = (last.feed||[]).filter(function(f){ return f.kind!=="note"; }).slice(-14);
      }
    }
    setF("begin_day");
    giveClue("begin_day");
    feedAdd("sys","08:00 — Vespera, Venskaya Hill. The day starts with a phone already ringing.");
    UI.showGame();
    UI.initMap();
    UI.render();
    Engine.intro();
  },

  hasSave(){ try{ return !!localStorage.getItem("24h_save"); }catch(e){ return false; } },

  save(){ try{ localStorage.setItem("24h_save", JSON.stringify(S)); }catch(e){} },
  load(){ try{ const r = localStorage.getItem("24h_save"); if(!r) return false; S = JSON.parse(r); UI.showGame(); UI.initMap(); UI.render(); return true; }catch(e){ return false; } },
  wipe(){ try{ localStorage.removeItem("24h_save"); }catch(e){} S=null; },

  /* ---------------- intro cinematic ---------------- */
  intro(){
    const LINES = [
      ["sys","08:00 — Thursday, 12 October. Vespera."],
      ["","The phone rings exactly once before morning has finished inventing itself."],
      ["speaker","ALEX"],
      ["","\"Hey. Listen — don't talk, I only have a second. We need to talk. Something happened last night.\""],
      ["","\"I can't explain it over the phone. Meet me before midnight. The quiet place. You know which one.\""],
      ["","\"And— don't call me. Don't come to the yard. If I don't call you by noon, it's because I can't.\""],
      ["sys","The line dies. You are 22 years old, it is 08:00, and you have sixteen hours."],
      ["sys","Everything you do today will cost minutes. The city will not wait. Begin."],
      ["ACTION","16 HOURS UNTIL MIDNIGHT"]
    ];
    UI.introOverlay(LINES);
  },

  /* ---------------- time & events ---------------- */
  canAfford(cost){ return S.time + cost <= 1440; },

  advance(cost){
    S.time = Math.min(1440, S.time + cost);
    this.fireEvents();
    if(S.time >= 1440){ this.reachMidnight(); return false; }
    return true;
  },

  fireEvents(){
    const evs = STORY.EVENTS.slice().sort(function(a,b){ return a.t-b.t; });
    for(let i=0;i<evs.length;i++){
      const e = evs[i];
      if(S.fired[e.id]) continue;
      if(e.t > S.time) continue;
      if(e.cond && !e.cond(S)) continue;
      const active = !e.winEnd || S.time <= e.winEnd;
      S.fired[e.id] = true;
      const res = e.run(active);
      if(res) Engine.resolve(res);
      if(S.ending) return;
    }
  },

  /* resolve whatever a story function returned */
  resolve(res){
    if(!res) return;
    if(typeof res === "string"){
      UI.showScene({ title:"", text:res });
      return;
    }
    if(res.node){ UI.showScene(res.node); return; }
    UI.showScene(res);
  },

  /* ---------------- actions ---------------- */
  runAction(act, locId){
    if(!this.canAfford(act.cost)){ UI.toast("Not enough time left — that would run past midnight.", true); return; }
    if(act.cond && !act.cond()) return;
    if(act.once && has(act.once)) return;
    if(act.lockersOnly){
      const L = DATA.LOCATIONS[locId].lockers;
      if(L && (S.time < L[0] || S.time >= L[1])){ UI.toast("The locker hall is closed (06:00–22:00). Elio reads gossip, not exceptions.", true); return; }
    }
    if(act.hours){
      if(S.time < act.hours[0] || S.time > act.hours[1]){ UI.toast("The mail has already been collected for today.", true); return; }
    }
    if(act.cost>0){ if(!Engine.advance(act.cost)) return; }
    if(S.ending) return;
    this.save();
    let res;
    try { res = act.run(); } catch(err){ console.error(err); UI.toast("Something went wrong with that action.", true); return; }
    if(res!=null) this.resolve(res);
    UI.render();
  },

  /* ---------------- travel ---------------- */
  travelTime(from,to){ return DATA.MATRIX[from][to]!=null ? DATA.MATRIX[from][to] : DATA.MATRIX[to][from]; },

  travel(to){
    const cost = this.travelTime(S.loc,to);
    if(!this.canAfford(cost)){ UI.toast("You'd still be walking at midnight. Too late for that distance.", true); return; }
    const fromName = DATA.LOCATIONS[S.loc].name;
    S.loc = to;
    if(!Engine.advance(cost)) return;
    feedAdd("sys", fmt(S.time) + " — you reach " + DATA.LOCATIONS[to].name + ". (" + cost + " min from " + (fromName) + ")");
    this.save();
    UI.render();
  },

  setLocSilent(loc){ S.loc = loc; },

  /* ---------------- wrappers used by story actions ---------------- */
  lockerScene(){ return STORY.lockerScene(); },
  benchVisit(){ return STORY.benchVisit(); },

  /* ---------------- dialogue ---------------- */
  openDialog(id){
    const w = charWhere(id);
    if(!w || !w.talkable){
      const loc = DATA.LOCATIONS[w && w.loc ? w.loc : S.loc];
      return { kicker:"Unavailable", title:DATA.CHARS[id].name, text:"Not here, or not now. ("+(w? w.note:"—")+")", opts:[{label:"OK", cost:0, close:true}] };
    }
    const node = STORY.DIALOG[id]();
    return node;
  },

  talkTo(id, viaPhone){
    const d = STORY.DIALOG[id];
    if(!d){ UI.toast("The number rings into nothing.", true); return; }
    UI.showScene(d());
  },

  /* ---------------- phone ---------------- */
  callChar(id){
    const cost = 5;
    if(!this.canAfford(cost)){ UI.toast("No time left even for hello.", true); return; }
    const name = id==="UNKNOWN" ? "Unknown number" : DATA.CHARS[id].name;
    this.advance(cost);
    let result;
    if(id==="alex"){
      S.callLog.push({t:S.time, who:"out", id:"alex"});
      if(S.time < h(15,50)){
        setF("called_alex");
        feedAdd("sys","05 min — you call Alex. Switched off. You try twice, because that's what the phrase 'switched off' is for.");
        result = "engaged tone, then: 'The customer is unavailable.' You leave no message. The silence refuses to be Printable.";
      } else {
        result = "engaged, then dead. Alex's phone is somewhere it plans to stay.";
      }
    } else {
      const w = charWhere(id);
      S.callLog.push({t:S.time, who:"out", id:id});
      if(w && w.talkable){
        feedAdd("sys","05 min — call to "+name+". They pick up.");
        this.talkTo(id, true);
        UI.render();
        return;
      } else {
        result = name+" doesn't answer. ("+(w? w.note:"beyond reach")+")";
        feedAdd("sys","05 min — call to "+name+": no answer.");
      }
    }
    UI.showScene({ title:"Call — "+name, text:result });
    UI.render();
  },

  sendMessage(id, text){
    if(!this.canAfford(1)){ UI.toast("Not even one minute left.", true); return; }
    S.time += 1;
    (S.msgs[id]=S.msgs[id]||[]).push({t:S.time, who:"me", text:text});
    feedAdd("sys","Sent a message to "+(id==="UNKNOWN"?"an unknown number":DATA.CHARS[id].name)+".");
    const reply = this.autoReply(id);
    if(reply){ msgIn(id, reply); feedAdd("sys","Reply from "+DATA.CHARS[id].name+"."); }
    this.fireEvents();
    this.save();
    UI.render();
  },

  autoReply(id){
    if(id==="sofia" && !has("sofia_reply1") && (S.time<h(14)||S.time>=h(19))){
      setF("sofia_reply1");
      return "on shift. if this is about alex: clinic. please not over text.";
    }
    if(id==="mara" && S.time>=h(20,45)) return "home. tomorrow, ok? whatever today was."
    if(id==="jonas" && S.time<h(19)) return "in meetings. call the office if it's actually important.";
    if(id==="nadia") return "typing. send anything solid and it rides tonight's front.";
    if(id==="elio") return "at the counter, as usual. come by.";
    if(id==="alex") return null;
    return null;
  },

  /* ---------------- waiting ---------------- */
  wait(mins){
    feedAdd("sys","You let "+mins+" minutes go where minutes go.");
    this.advance(mins);
    this.save();
    UI.render();
  },

  /* ---------------- locker code ---------------- */
  tryCode(code){
    if(code === "2311"){
      setF("opened_locker"); setF("has_document"); giveClue("manifest_seen"); giveClue("locker_full");
      const txt="2311. The pad's light turns the green of permission.\n\nInside box 14: a folder labelled in Alex's square capitals — 'IN CASE I'M WRONG'. Duplicate customs manifests, re-stamped numbers, crossed-out consignees. Two photographs: Brandt and Sera in the yard at night. A clinic receipt — Sofia Lark, 03:12 last night.\n\nThe night acquires shape, and the shape has your friend's handwriting on it.";
      UI.showScene({ title:"Box 14", text:txt });
    } else {
      S.flags.codeTries = (S.flags.codeTries||0)+1;
      this.advance(5);
      if(S.ending) return;
      const tries = S.flags.codeTries;
      let txt;
      if(tries>=3 && !has("elio_favor")){
        txt="Third wrong code. The box locks down for the day with bureaucratic finality, and Elio has to walk over with his master key and a face you will be footing the bill for. \"Try remembering better,\" he suggests, not unkindly, and logs it.\n\nBox 14 is closed to you until tomorrow. Tomorrow, of course, is a long way from tonight.";
        setF("locker_blocked");
      } else if(tries>=3 && has("elio_favor")){
        setF("opened_locker"); setF("has_document"); giveClue("manifest_seen"); giveClue("locker_full");
        txt="Third wrong code. Elio arrives with the master key and a very dry expression. \"Remember when I said today there's a word between us?\" The key turns. \"Now there's also a favor squared.\"\n\nInside box 14: the folder — 'IN CASE I'M WRONG' — the manifests, two photographs, and a clinic receipt with Sofia's name and 03:12 on it.";
      } else {
        txt = "The light shrugs red. " + (tries===1 ? "One wrong code, five minutes, and a machine that will remember both." : "Second mistake. The clerk's eyebrow is now involved.");
      }
      UI.showScene({ title:"Box 14", text:txt });
    }
    this.save();
    UI.render();
  },

  /* ---------------- meeting windows ---------------- */
  meetingAvailable(){
    if(S.time < h(22,45) || S.time > h(23,59)) return false;
    if(S.flags.met_alex) return false;
    if(has("brandt_told") && has("knows_station_meet")) return S.loc==="station";
    if(has("brandt_told") && !has("knows_station_meet")) return S.loc==="riverside";
    if(has("knows_quiet_place")) return S.loc==="riverside";
    return false;
  },

  runMeeting(kind){
    if(!this.canAfford(8)){ UI.toast("Even waiting has a price, and you can't pay it.", true); return; }
    const node = kind==="hall" ? STORY.meetingHall() : STORY.meetingBench();
    if(node && node.ending){ Engine.finishEnding(node.ending); return; }
    UI.showScene(node);
  },

  /* ---------------- endings ---------------- */
  finishEnding(forced){
    const id = forced || STORY.evaluateEnding();
    S.ending = id;
    UI.endingScreen(id);
    this.archive();
    try{ localStorage.removeItem("24h_save"); }catch(e){}
  },

  reachMidnight(){
    S.time = 1440;
    feedAdd("sys","24:00 — Midnight. The day ends the way it always does: completely.");
    this.finishEnding(null);
  },

  archive(){
    try{
      const arch = JSON.parse(localStorage.getItem("24h_archive")||"[]");
      const found = Object.keys(S.clues).length;
      const total = Object.keys(DATA.CLUES).length;
      arch.push({
        when: new Date().toISOString(),
        ending: S.ending,
        endingTitle: STORY.ENDINGS[S.ending].title,
        endingNum: STORY.ENDINGS[S.ending].num,
        cluesFound: found, clueTotal: total,
        clues: Object.keys(S.clues),
        missed: S.missed.slice(),
        feed: S.feed.filter(f=>f.kind==="important"||f.kind==="sys").slice(-16),
        metAlex: !!S.flags.met_alex,
        met: Object.keys(DATA.CHARS).filter(function(c){ return S.rel[c]!==undefined && c!=="alex"; })
      });
      while(arch.length>12) arch.shift();
      localStorage.setItem("24h_archive", JSON.stringify(arch));
    }catch(e){}
  }
};
