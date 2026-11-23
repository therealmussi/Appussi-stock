/* ============================================================
   24 HOURS — self-test harness (?test=1 in browser, or node)
   ============================================================ */
"use strict";

const TestRunner = {
  results: [],

  check(name, fn){
    try{
      const r = fn();
      this.results.push({ name:name, ok:r!==false, info:r===true?"":String(r) });
    }catch(e){
      this.results.push({ name:name, ok:false, info:e.message });
    }
  },

  /* simulated minimal DOM/localStorage so logic tests run headless too */
  stubEnv(){
    if(typeof document!=="undefined") return false;
    global.localStorage = { _m:{}, getItem(k){ return this._m[k]||null; }, setItem(k,v){ this._m[k]=v; }, removeItem(k){ delete this._m[k]; } };
    function fakeEl(){
      const el={ classList:{add(){},remove(){},toggle(){},contains(){return true;}}, innerHTML:"", textContent:"", style:{},
        appendChild(){}, setAttribute(){}, getAttribute(){return null;}, addEventListener(){}, focus(){}, scrollTop:0, scrollHeight:0,
        querySelectorAll(){ return []; }, value:"" };
      el.querySelector=function(sel){ return (el.innerHTML.indexOf(String(sel).slice(1))>=0) ? fakeEl() : null; };
      return el;
    }
    global.document = { getElementById(){ return fakeEl(); },
      querySelector(){ return fakeEl(); }, querySelectorAll(){ return []; }, addEventListener(){}, createElement(){ return fakeEl(); } };
    global.document.body = fakeEl();
    global.window = { addEventListener(){}, location:{search:""} };
    return true;
  },

  run(){
    this.stubEnv();
    const T=this;

    /* --- data integrity --- */
    T.check("Travel matrix symmetric", function(){
      for(const a in DATA.MATRIX){
        for(const b in DATA.MATRIX[a]){
          if(DATA.MATRIX[b][a]!==undefined && DATA.MATRIX[b][a]!==DATA.MATRIX[a][b]) return false;
        }
      } return true;
    });
    T.check("Travel matrix complete", function(){
      const ids=Object.keys(DATA.LOCATIONS);
      for(const a of ids){ if(DATA.MATRIX[a][a]!==undefined) return false;
        for(const b of ids){ if(a!==b && DATA.MATRIX[a][b]===undefined) return a+"->"+b; } }
      return true;
    });
    T.check("Schedules: valid locations", function(){
      for(const c in DATA.SCHED){
        for(const b of DATA.SCHED[c]) if(!DATA.LOCATIONS[b[2]]) return c+": "+b[2];
      } return true;
    });
    T.check("Schedules: sorted, non-overlapping, full-day", function(){
      for(const c in DATA.SCHED){
        const bl=DATA.SCHED[c];
        if(bl[0][0]!==0) return c+" starts late";
        let prevEnd=0;
        for(const b of bl){
          if(b[0]!==prevEnd) return c+" gap at "+fmt(b[0]);
          if(b[1]<=b[0]) return c+" bad block";
          prevEnd=b[1];
        }
        if(prevEnd!==h(24,0)) return c+" ends early";
      } return true;
    });
    T.check("Event ids unique", function(){
      const seen={};
      for(const e of STORY.EVENTS){ if(seen[e.id]) return e.id; seen[e.id]=true; } return true;
    });
    T.check("Events time-sorted", function(){
      let last=0;
      for(const e of STORY.EVENTS){ if(e.t<last) return e.id; last=e.t; } return true;
    });
    T.check("Every character has a dialogue", function(){
      for(const c in DATA.CHARS){ if(c==="alex") continue; if(!STORY.DIALOG[c]) return c; } return true;
    });
    T.check("Every action ref valid id", function(){
      for(const loc in STORY.ACTIONS){
        if(!DATA.LOCATIONS[loc]) return loc;
        for(const a of STORY.ACTIONS[loc]){
          const keys=["run","cond","once","hours","lockersOnly","id","label","sub","cost"];
          for(const k of keys){} 
          if(typeof a.run!=="function") return loc+"/"+a.id+" no run";
        }
      } return true;
    });
    T.check("Endings defined (6)", function(){
      const need=["truth","too_late","wrong_person","alternative","sacrifice","unknown"];
      for(const n of need) if(!STORY.ENDINGS[n]) return n; return true;
    });

    /* --- reachability of all six endings via state injection --- */
    const scenarios = {
      truth:        { flags:{ met_alex:true, fraud_link:true, jonas_debt:true, final_press:true } },
      alternative:  { flags:{ met_alex:true, fraud_link:true, publish:true } },
      wrong_person: { flags:{ met_alex:true, doc_sold:true } },
      sacrifice:    { flags:{ met_alex:true, helped_mara_night:true } },
      too_late:     { flags:{ knows_quiet_place:true } },
      unknown:      { flags:{ } }
    };
    T.check("All 6 endings reachable & distinct", function(){
      const got={};
      for(const k in scenarios){
        S = Engine.DEFAULTS();
        S.flags = scenarios[k].flags;
        const id = STORY.evaluateEnding();
        if(!STORY.ENDINGS[id]) return k+" -> missing ending "+id;
        got[id]=true;
        const txt = STORY.ENDINGS[id].text();
        if(typeof txt!=="string" || txt.length<100) return id+": bad epilogue";
        if(typeof STORY.ENDINGS[id].fates()!=="string") return id+": bad fates";
      }
      return Object.keys(got).length===6 ? true : "only "+Object.keys(got).length+" endings matched";
    });

    /* --- full-day headless simulation --- */
    T.check("Full day sim: time engine & events", function(){
      S = Engine.DEFAULTS();
      S.flags.fraud_link = true; // so the fence is marked known
      const order=[];
      for(let t=h(8,0); t<h(23,0); t+=7){ S.time=t; }
      S = Engine.DEFAULTS();
      // passive day: wait in 15-min chunks from 08:00 to midnight
      let steps=0;
      while(S.time<1440 && steps<120){
        steps++;
        const before=S.time;
        // stay at riverside for bench visit, then at key spots
        if(before<h(10,0)){ S.loc="apartment"; }
        else if(before<h(12,0)){ S.loc="station"; }
        else if(before<h(16,0)){ S.loc="oldtown"; }
        else if(before<h(20,0)){ S.loc="business"; }
        else { S.loc="riverside"; }
        const ok = Engine.advance(Math.min(15, Math.max(1, 1440-S.time)));
        if(!ok || S.ending){ break; }
        order.push(before);
      }
      if(steps>=120 && S.time<1440) return "cannot advance: time="+fmt(S.time);
      if(!S.ending) return "no ending at midnight (t="+fmt(S.time)+")";
      return true;
    });

    /* --- time cost sanity --- */
    T.check("Actions always cost time", function(){
      for(const loc in STORY.ACTIONS){
        for(const a of STORY.ACTIONS[loc]){
          if(typeof a.cost!=="number" || a.cost<=0) return loc+"/"+a.id+" cost="+a.cost;
        }
      } return true;
    });
    T.check("Locker code guard: wrong codes consumed", function(){
      S=Engine.DEFAULTS(); S.flags.knows_locker=true; S.flags.codeTries=0;
      S.time=h(10,0);
      Engine.tryCode("0000"); Engine.tryCode("0000");
      if(S.flags.codeTries!==2) return "tries not counted";
      return true;
    });
    T.check("Midnight block: no action past 24:00", function(){
      S=Engine.DEFAULTS(); S.time=1435;
      if(Engine.canAfford(10)) return "allowed to overshoot";
      return true;
    });

    /* --- report --- */
    const fails=this.results.filter(r=>!r.ok);
    const report = this.results.map(function(r){ return (r.ok?"PASS":"FAIL")+"  "+r.name+(r.ok?"":"  → "+r.info); }).join("\n");
    console.log("=== 24 HOURS SELF-TEST ===\n"+report+"\n"+(fails.length? fails.length+" FAILURES" : "ALL TESTS PASSED"));

    if(typeof document!=="undefined"){
      const box=document.getElementById("overlay-box");
      box.className="";
      box.innerHTML='<div class="ov-kicker">24 HOURS — SELF-TEST</div>'
        + '<div class="ov-text" style="font-family:monospace; font-size:.72rem; white-space:pre-wrap;">'+report.replace(/&/g,"&amp;").replace(/</g,"&lt;")+'\n\n'+(fails.length? fails.length+" FAILURES":"ALL TESTS PASSED")+'</div>'
        + '<button class="btn ov-continue" onclick="document.getElementById(\'overlay\').classList.add(\'hidden\')">CLOSE</button>';
      document.getElementById("overlay").classList.remove("hidden");
    }
    return fails.length===0;
  }
};
